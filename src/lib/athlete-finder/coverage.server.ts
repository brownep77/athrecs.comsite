import type { FixtureSource } from "../athrecs/source-registry";
import { RUNNABLE_SOURCE_RIGHTS_STATUSES } from "../athrecs/source-registry";
import type { Sql } from "../db";
import { registrySourceHosts, sourceUrlHost } from "./core";
import type {
  SourceCoverageInput,
  SourceCoverageResponse,
  SourceCoverageRow,
  SourceCoverageStores,
  SourceInventoryCounts,
  StoredSourceCounts,
} from "./coverage";

type Counts = StoredSourceCounts & SourceInventoryCounts;
type CountKey = keyof Counts;
type Group = { domain: string | null } & Partial<Record<CountKey, number | string>>;
type InventoryGroup = Group & {
  source_key: string;
  name: string;
  url: string;
  search_text: string;
};

const storedKeys: (keyof StoredSourceCounts)[] = [
  "canonicalResults",
  "archiveDatasets",
  "archiveRows",
  "capturePages",
  "captureRows",
  "historyProfiles",
  "historyRows",
];
const inventoryKeys: (keyof SourceInventoryCounts)[] = [
  "sources",
  "records",
  "pendingLinks",
  "savedResultLinks",
  "knownResultItems",
  "extractedResultItems",
  "partialResultItems",
  "pendingResultItems",
  "heldResultItems",
  "failedResultItems",
  "heldCapturePages",
];

// These expressions only contain fixed column names from this module. Source
// names, filters, and registry data never become SQL fragments.
const urlDomain = (column: string) =>
  `regexp_replace(regexp_replace(lower(substring(trim(${column}) from '(?i)^https?://([^/?#:@]+)(?::[0-9]+)?(?:[/?#]|$)')), '[.]$', ''), '^www[.]', '')`;
const inventoryDomain = (host: string, url: string) =>
  `coalesce(nullif(regexp_replace(regexp_replace(lower(trim(${host})), '[.]$', ''), '^www[.]', ''), ''), ${urlDomain(url)})`;

function emptyCounts(stores: SourceCoverageStores): Counts {
  return {
    canonicalResults: stores.canonical ? 0 : null,
    archiveDatasets: stores.archive ? 0 : null,
    archiveRows: stores.archive ? 0 : null,
    capturePages: stores.captures ? 0 : null,
    captureRows: stores.captures ? 0 : null,
    historyProfiles: stores.histories ? 0 : null,
    historyRows: stores.histories ? 0 : null,
    sources: stores.inventorySources ? 0 : null,
    records: stores.inventoryRecords ? 0 : null,
    pendingLinks: stores.inventorySources ? 0 : null,
    savedResultLinks: stores.resultLinks ? 0 : null,
    knownResultItems: stores.extraction ? 0 : null,
    extractedResultItems: stores.extraction ? 0 : null,
    partialResultItems: stores.extraction ? 0 : null,
    pendingResultItems: stores.extraction ? 0 : null,
    heldResultItems: stores.extraction ? 0 : null,
    failedResultItems: stores.extraction ? 0 : null,
    heldCapturePages: stores.captures ? 0 : null,
  };
}

function selectCounts<K extends CountKey>(counts: Counts, keys: K[]): Pick<Counts, K> {
  return Object.fromEntries(keys.map((key) => [key, counts[key]])) as Pick<Counts, K>;
}

function hasRows(counts: StoredSourceCounts): boolean {
  return [counts.canonicalResults, counts.archiveRows, counts.captureRows, counts.historyRows].some(
    (count) => count !== null && count > 0,
  );
}

function isWithinDomain(domain: string, permitted: string): boolean {
  return domain === permitted || domain.endsWith(`.${permitted}`);
}

function coverageState(counts: Counts): SourceCoverageRow["coverageState"] {
  if (hasRows(counts)) return "stored_rows";
  if (
    [counts.canonicalResults, counts.archiveRows, counts.captureRows, counts.historyRows].some(
      (count) => count === null,
    )
  )
    return "incomplete";
  if (
    [
      counts.partialResultItems,
      counts.pendingResultItems,
      counts.heldResultItems,
      counts.failedResultItems,
      counts.heldCapturePages,
    ].some((count) => count !== null && count > 0)
  )
    return "needs_extraction";
  if (
    [counts.records, counts.pendingLinks, counts.savedResultLinks, counts.knownResultItems].some(
      (count) => count !== null && count > 0,
    )
  )
    return "links_only";
  return "no_linked_rows";
}

/**
 * Read-only staff source inventory. Queries aggregate by domain in Postgres;
 * participant names, source bodies and evidence never leave those queries.
 * The registry is injected so this service can be exercised with synthetic data.
 */
export async function athleteFinderSourceCoverage(
  sql: Sql,
  input: SourceCoverageInput,
  registry: FixtureSource[],
): Promise<SourceCoverageResponse> {
  const [availability] = await sql<SourceCoverageStores>`SELECT
    to_regclass('public.results') IS NOT NULL AS canonical,
    (to_regclass('public.result_archive_datasets') IS NOT NULL AND
      to_regclass('public.result_archive_entries') IS NOT NULL) AS archive,
    (to_regclass('public.result_archive_source_captures') IS NOT NULL AND
      to_regclass('public.result_archive_capture_approvals') IS NOT NULL) AS captures,
    to_regclass('public.athlete_source_histories') IS NOT NULL AS histories,
    to_regclass('public.edition_result_links') IS NOT NULL AS "resultLinks",
    to_regclass('public.event_register_sources') IS NOT NULL AS "inventorySources",
    to_regclass('public.event_register_source_records') IS NOT NULL AS "inventoryRecords",
    to_regclass('public.event_register_extraction_items') IS NOT NULL AS extraction`;
  const stores: SourceCoverageStores = availability;
  async function readStore<T>(key: keyof SourceCoverageStores, query: string): Promise<T[]> {
    if (!stores[key]) return [];
    try {
      return await sql.transaction(async (tx) => {
        await tx.query("set local statement_timeout = '7000ms'");
        await tx.query("set local lock_timeout = '1000ms'");
        return tx.query<T>(query);
      });
    } catch {
      // Counts for a missing, busy or failed store are unknown, never zero.
      stores[key] = false;
      return [];
    }
  }
  const [canonical, archive, captures, histories, resultLinks, sources, records, extraction] =
    await Promise.all([
      readStore<Group>(
        "canonical",
        `SELECT ${urlDomain("source_url")} AS domain,
          count(*)::bigint AS "canonicalResults" FROM results GROUP BY 1`,
      ),
      readStore<Group>(
        "archive",
        `SELECT ${urlDomain("d.source_url")} AS domain,
          count(DISTINCT d.id)::bigint AS "archiveDatasets",
          count(e.id)::bigint AS "archiveRows"
        FROM result_archive_datasets d LEFT JOIN result_archive_entries e ON e.dataset_id=d.id
        GROUP BY 1`,
      ),
      readStore<Group>(
        "captures",
        `WITH latest AS (
          SELECT DISTINCT ON (provider,source_key) id,approval_id,source_url,
            payload->>'publication' AS publication,source_check,row_count
          FROM result_archive_source_captures
          ORDER BY provider,source_key,captured_at DESC,id DESC
        ) SELECT ${urlDomain("c.source_url")} AS domain,
          count(*) FILTER (WHERE c.source_check IN ('compared','empty'))::bigint AS "capturePages",
          coalesce(sum(c.row_count) FILTER (WHERE c.source_check IN ('compared','empty')),0)::bigint AS "captureRows",
          count(*) FILTER (WHERE c.source_check NOT IN ('compared','empty'))::bigint AS "heldCapturePages"
        FROM latest c JOIN result_archive_capture_approvals a ON a.id=c.approval_id
        WHERE c.publication='staff_only' AND a.scope='staff_only' AND a.revoked_at IS NULL
        GROUP BY 1`,
      ),
      readStore<Group>(
        "histories",
        `SELECT ${urlDomain("source_url")} AS domain,
          count(*)::bigint AS "historyProfiles",
          coalesce(sum(jsonb_array_length(performances)),0)::bigint AS "historyRows"
        FROM athlete_source_histories GROUP BY 1`,
      ),
      readStore<Group>(
        "resultLinks",
        `SELECT ${urlDomain("results_url")} AS domain,
          count(*)::bigint AS "savedResultLinks" FROM edition_result_links GROUP BY 1`,
      ),
      readStore<InventoryGroup>(
        "inventorySources",
        `SELECT ${inventoryDomain("host", "url")} AS domain,
          min(source_key) AS source_key,
          (array_agg(name ORDER BY source_key))[1] AS name,
          (array_agg(url ORDER BY source_key))[1] AS url,
          count(*)::bigint AS sources,
          coalesce(sum(jsonb_array_length(cursors)),0)::bigint AS "pendingLinks",
          string_agg(name||' '||source_key||' '||url||' '||country,' ') AS search_text
        FROM event_register_sources GROUP BY 1`,
      ),
      readStore<Group>(
        "inventoryRecords",
        `SELECT ${inventoryDomain("source_host", "source_url")} AS domain,
          count(*)::bigint AS records FROM event_register_source_records GROUP BY 1`,
      ),
      readStore<Group>(
        "extraction",
        `SELECT ${inventoryDomain("source_host", "source_url")} AS domain,
          count(*)::bigint AS "knownResultItems",
          count(*) FILTER (WHERE state='extracted')::bigint AS "extractedResultItems",
          count(*) FILTER (WHERE state='partial')::bigint AS "partialResultItems",
          count(*) FILTER (WHERE state='pending')::bigint AS "pendingResultItems",
          count(*) FILTER (WHERE state='held')::bigint AS "heldResultItems",
          count(*) FILTER (WHERE state='failed')::bigint AS "failedResultItems"
        FROM event_register_extraction_items WHERE kind='results' AND state<>'excluded'
        GROUP BY 1`,
      ),
    ]);

  const byDomain = new Map<string, Counts>();
  const totals = emptyCounts(stores);
  for (const group of [
    ...canonical,
    ...archive,
    ...captures,
    ...histories,
    ...resultLinks,
    ...sources,
    ...records,
    ...extraction,
  ]) {
    const domain = group.domain ?? "";
    const counts = byDomain.get(domain) ?? emptyCounts(stores);
    for (const key of [...storedKeys, ...inventoryKeys]) {
      if (group[key] !== undefined) {
        const count = Number(group[key]);
        counts[key] = (counts[key] ?? 0) + count;
        totals[key] = (totals[key] ?? 0) + count;
      }
    }
    byDomain.set(domain, counts);
  }

  const registryHosts = registry.map((source) => ({ source, hosts: registrySourceHosts(source) }));
  const matchedCounts = (hosts: string[]) => {
    const counts = emptyCounts(stores);
    for (const [domain, group] of byDomain) {
      if (!domain || !hosts.some((host) => isWithinDomain(domain, host))) continue;
      for (const key of [...storedKeys, ...inventoryKeys]) {
        if (group[key] !== null) counts[key] = (counts[key] ?? 0) + group[key];
      }
    }
    return counts;
  };
  const inventorySearch = (hosts: string[]) =>
    sources
      .filter(
        (source) => source.domain && hosts.some((host) => isWithinDomain(source.domain!, host)),
      )
      .map((source) => source.search_text)
      .join(" ");
  const candidates: { row: SourceCoverageRow; search: string }[] = registryHosts.map(
    ({ source, hosts }) => {
      const counts = matchedCounts(hosts);
      const runnable = source.enabled && RUNNABLE_SOURCE_RIGHTS_STATUSES.has(source.rights_status);
      const domain = sourceUrlHost(source.start_url) ?? hosts[0] ?? "";
      const row: SourceCoverageRow = {
        sourceId: source.source_id,
        registrySourceId: source.source_id,
        name: source.source_name,
        url: source.start_url,
        domain,
        origin: "registry",
        metadataRunnable: runnable,
        registryState: runnable
          ? "Metadata enabled"
          : source.enabled
            ? "Metadata blocked by rights review"
            : "Metadata disabled",
        participantCheck: domain === "totalracetiming.co.uk" ? "trt" : "manual",
        coverageState: coverageState(counts),
        stored: selectCounts(counts, storedKeys),
        inventory: selectCounts(counts, inventoryKeys),
        sharedDomain: registryHosts.some(
          (other) =>
            other.source.source_id !== source.source_id &&
            hosts.some((host) =>
              other.hosts.some(
                (otherHost) => isWithinDomain(host, otherHost) || isWithinDomain(otherHost, host),
              ),
            ),
        ),
      };
      return {
        row,
        search: [
          source.source_id,
          source.source_name,
          source.start_url,
          ...hosts,
          source.country_focus,
          source.source_type,
          inventorySearch(hosts),
        ]
          .join(" ")
          .toLowerCase(),
      };
    },
  );

  // Wider inventory hosts not represented in the fixture registry remain visible.
  // One representative source per host avoids claiming its URLs are unique races.
  for (const source of sources) {
    if (
      !source.domain ||
      registryHosts.some(({ hosts }) => hosts.some((host) => isWithinDomain(source.domain!, host)))
    )
      continue;
    const counts = matchedCounts([source.domain]);
    candidates.push({
      row: {
        sourceId: `inventory:${source.source_key}`,
        registrySourceId: null,
        name: source.name,
        url: source.url,
        domain: source.domain,
        origin: "inventory",
        metadataRunnable: null,
        registryState: "Wider source inventory",
        participantCheck: source.domain === "totalracetiming.co.uk" ? "trt" : "manual",
        coverageState: coverageState(counts),
        stored: selectCounts(counts, storedKeys),
        inventory: selectCounts(counts, inventoryKeys),
        sharedDomain: Number(source.sources ?? 0) > 1,
      },
      search: [source.source_key, source.name, source.url, source.domain, source.search_text]
        .join(" ")
        .toLowerCase(),
    });
  }
  const needle = input.q.toLowerCase();
  const matching = candidates
    .filter(({ search }) => !needle || search.includes(needle))
    .sort(
      (a, b) =>
        a.row.name.localeCompare(b.row.name) || a.row.sourceId.localeCompare(b.row.sourceId),
    );
  return {
    rows: matching.slice(input.offset, input.offset + input.limit).map(({ row }) => row),
    total: matching.length,
    nextOffset: input.offset + input.limit < matching.length ? input.offset + input.limit : null,
    summary: {
      registrySources: registry.length,
      registryDomains: new Set(
        registry.map((source) => sourceUrlHost(source.start_url)).filter(Boolean),
      ).size,
      metadataRunnableSources: registry.filter(
        (source) => source.enabled && RUNNABLE_SOURCE_RIGHTS_STATUSES.has(source.rights_status),
      ).length,
      inventorySources: totals.sources,
      inventoryDomains: stores.inventorySources
        ? new Set(sources.map((source) => source.domain).filter(Boolean)).size
        : null,
      listedSources: candidates.length,
      domainsWithStoredRows: [...byDomain].filter(([domain, counts]) => domain && hasRows(counts))
        .length,
      stored: selectCounts(totals, storedKeys),
      inventory: selectCounts(totals, inventoryKeys),
    },
    stores,
    notes: [
      "Counts describe stored observations, not unique athlete results. The same performance can appear in more than one store.",
      "Source coverage is matched by domain, including its subdomains. Registry entries sharing a domain can show the same counts; do not add them together.",
      "Metadata enabled describes existing event collection settings. It does not enable participant collection or verify a result.",
      "A saved URL or event inventory record is a location to inspect, not searchable participant data. Extraction items describe known pages or documents, not the full size of a website.",
      "Saved result links count edition-level URL records by their results-page domain, including held or rejected metadata. They do not establish usable participant data or permission to collect it.",
      "Capture counts use the latest approved staff-only observation per provider and source. Held or revoked captures do not count as searchable rows.",
      "Canonical coverage uses the main result source URL; history coverage uses the saved athlete-history source URL. Supporting result references and individual history links can yield additional search matches.",
      "Summary totals include records with unknown or uncatalogued source domains. A source with no linked rows has not been searched live.",
      "Coverage is incomplete when no stored rows are known and at least one result collection could not be inspected. Saved links and extraction counts remain visible without implying that no participant rows exist.",
      ...(Object.values(stores).every(Boolean)
        ? []
        : [
            "Some stores are unavailable or could not be read within the time limit. Their counts are unknown, not zero.",
          ]),
    ],
  };
}
