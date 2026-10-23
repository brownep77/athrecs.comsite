import type { Sql } from "../db";
import type { FixtureSource } from "../athrecs/source-registry";
import {
  FINDER_PAGE_SIZE,
  FINDER_STORE_KINDS,
  finderNames,
  finderNameQuery,
  finderNameTerms,
  finderSearchSchema,
  registrySourceHosts,
  type FinderRow,
  type FinderSearchInput,
  type FinderSearchResponse,
  type FinderStoreKind,
  type FinderStoreStatus,
  type FinderNameTerms,
} from "./core";

// SQL fragments below only receive developer-authored expressions, never input.
const host = (url: string) =>
  `regexp_replace(regexp_replace(substring(lower(btrim(coalesce(${url},''))) from '^https?://([^/?#:@]+)(?::[0-9]+)?(?:[/?#]|$)'), '^www\\.', ''), '\\.$', '')`;
const sourceMatches = (url: string) =>
  `(coalesce(array_length($5::text[],1),0)=0 or exists(select 1 from unnest($5::text[]) wanted(host)
    where ${host(url)}=wanted.host or right(${host(url)},length(wanted.host)+1)='.'||wanted.host))`;
const nameMatches = (name: string) =>
  `to_tsvector('simple',regexp_replace(normalize(left(coalesce(${name},''),2000),NFKC),'[^[:alnum:]]+',' ','g')) @@ to_tsquery('simple',$1)`;
const clubText = (value: string) => `replace(lower(normalize(coalesce(${value},''),NFKC)),'ς','σ')`;
const clubMatches = (club: string) =>
  `($2='' or strpos(${clubText(club)},${clubText("$2::text")})>0)`;
const yearMatches = (date: string) =>
  `(($3::integer is null and $4::integer is null) or
    (left(coalesce(${date},''),4) ~ '^[0-9]{4}$'
      and ($3::integer is null or left(${date},4)>=$3::text)
      and ($4::integer is null or left(${date},4)<=$4::text)))`;
const take = `limit ${FINDER_PAGE_SIZE + 1} offset $6`;
const safeSourceUrl = (url: string) => `case when length(${url})<=2048 then ${url} else null end`;
const supportingJoin = `left join lateral(select ref.source_name,ref.source_url from result_source_references ref
  where ref.result_id=r.id and coalesce(array_length($5::text[],1),0)>0
    and ${sourceMatches("ref.source_url")} order by ref.source_url limit 1) supporting on true`;
const absentSupportingJoin = `left join lateral(select null::text source_name,null::text source_url) supporting on true`;

const canonicalClub =
  "coalesce(nullif(r.result_details->>'clubAtRace',''),cl.name,a.source_club_name)";
const historyDate =
  "coalesce(nullif(p.value->>'date',''),nullif(p.value->>'year',''),p.value->>'dateLabel')";
const historyClub = `coalesce(nullif(p.value->>'club',''),p.value#>>'{archiveReference,original,Club}',
  (select regexp_replace(label,'^Club( at race)?: *','','i') from jsonb_array_elements_text(
    case when jsonb_typeof(p.value->'labels')='array' then p.value->'labels' else '[]'::jsonb end
  ) label where label ~* '^Club( at race)?:' limit 1))`;
const captureDate = "coalesce(nullif(p.value->>'date',''),c.payload->'index'->>'date')";

const queries: Record<FinderStoreKind, string> = {
  canonical: `select r.id::text as "localKey",left(a.display_name,200) as name,
    left(${canonicalClub},200) as club,left(e.name,300) as event,ed.event_date::text as date,
    left(ed.distance_code,100) as distance,
    left(coalesce(r.result_details#>>'{timing,finishText}',r.result_details->>'performance'),160) as performance,
    r.finish_time_seconds::double precision as "finishSeconds",left(r.status,60) as status,
    left(coalesce(supporting.source_name,r.result_source),150) as "sourceName",
    ${safeSourceUrl("coalesce(supporting.source_url,r.source_url)")} as "sourceUrl",
    left(concat('Result ',r.id,case when r.bib is not null then ' · bib '||r.bib else '' end,
      case when r.result_details#>>'{archive,sourceKey}' is not null
        then ' · source row '||(r.result_details#>>'{archive,sourceKey}') else '' end),500) as "rowLocator",
    left(concat('canonical · ',r.result_visibility,
      case when r.result_details->>'profileExcluded'='true' then ' · excluded from profile' else '' end),120) as "reviewState",
    a.id as "athleteId",left(a.slug,200) as "athleteSlug",r.id as "resultId"
    from athletes a join results r on r.athlete_id=a.id
    join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
    left join clubs cl on cl.id=a.club_id
    /* supporting_source_join */
    where ${nameMatches("a.display_name")} and ${clubMatches(canonicalClub)}
      and ${yearMatches("ed.event_date::text")}
      and (${sourceMatches("r.source_url")} or supporting.source_url is not null)
    order by r.id desc ${take}`,

  archive: `select a.id::text as "localKey",left(a.payload->>'name',200) as name,
    left(a.payload->>'club',200) as club,left(e.name,300) as event,ed.event_date::text as date,
    left(ed.distance_code,100) as distance,left(a.payload->>'finishText',160) as performance,
    case when a.payload->>'finishSeconds' ~ '^[0-9]{1,12}(\\.[0-9]{1,12})?$'
      then (a.payload->>'finishSeconds')::double precision else null end as "finishSeconds",
    left(a.payload->>'status',60) as status,left(d.provider,150) as "sourceName",
    ${safeSourceUrl("d.source_url")} as "sourceUrl",
    left(concat('Source row ',a.source_key,' · revision ',a.revision),500) as "rowLocator",
    left(a.review_state,120) as "reviewState",a.canonical_result_id as "resultId",
    a.id as "archiveEntryId",d.id::text as "datasetId"
    from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id
    join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id
    where ${nameMatches("a.payload->>'name'")} and ${clubMatches("a.payload->>'club'")}
      and ${yearMatches("ed.event_date::text")} and ${sourceMatches("d.source_url")}
    order by a.id desc ${take}`,

  capture: `with candidates as materialized (
    select c.id
    from result_archive_source_captures c
    join result_archive_capture_approvals approval on approval.id=c.approval_id
    where c.payload->>'publication'='staff_only' and c.source_check in ('compared','empty')
      and approval.scope='staff_only' and approval.revoked_at is null
      and (/* capture_name_candidates */)
      and ${sourceMatches("c.source_url")}
      -- Select latest version before checking approval or names. A superseded
      -- result must not reappear when the latest capture is held or revoked.
      and not exists(select 1 from result_archive_source_captures newer
        where newer.provider=c.provider and newer.source_key=c.source_key
          and (newer.captured_at,newer.id)>(c.captured_at,c.id))
    order by c.id desc
  ) select c.id::text||':'||p.ordinality::text as "localKey",left(p.value->>'name',200) as name,
    left(p.value->>'club',200) as club,left(c.payload->'index'->>'name',300) as event,
    left(${captureDate},80) as date,left(coalesce(p.value->>'distanceLabel',p.value->>'tableKey'),100) as distance,
    left(case when p.value#>>'{original,Chip Time}' is not null or p.value#>>'{original,Gun Time}' is not null
      then concat_ws(' · ',case when p.value#>>'{original,Chip Time}' is not null
        then 'Chip '||left(p.value#>>'{original,Chip Time}',60) end,
        case when p.value#>>'{original,Gun Time}' is not null then 'Gun '||left(p.value#>>'{original,Gun Time}',60) end)
      else coalesce(p.value#>>'{original,Time}',p.value#>>'{original,Total Time}',p.value#>>'{original,Finals}',
        p.value#>>'{original,TIME}',p.value->>'performance') end,160) as performance,
    left(p.value->>'status',60) as status,left(c.provider,150) as "sourceName",
    ${safeSourceUrl("c.source_url")} as "sourceUrl",
    left(concat('Capture ',c.id,' · ',coalesce(p.value->>'tableKey','table'),
      ' · source row ',coalesce(p.value->>'sourceRow',p.ordinality::text)),500) as "rowLocator",
    'private capture · identity unreviewed'::text as "reviewState",
    c.id::text as "captureId",p.ordinality::integer as "captureOrdinal"
    from candidates selected
    cross join lateral(select c.id,c.payload,c.provider,c.source_url
      from result_archive_source_captures c where c.id=selected.id offset 0) c
    cross join lateral(
      select p.value,p.ordinality from jsonb_array_elements(
        case when jsonb_typeof(c.payload->'rows')='array' then c.payload->'rows' else '[]'::jsonb end
      ) with ordinality p(value,ordinality)
      where /* capture_row_name_matches */ and ${clubMatches("p.value->>'club'")}
        and ${yearMatches(captureDate)}
      order by p.ordinality limit ($6::integer+${FINDER_PAGE_SIZE + 1})
    ) p
    order by selected.id desc,p.ordinality ${take}`,

  history: `select h.athlete_id::text||':'||md5(h.provider||':'||h.external_id)||':'||p.ordinality::text as "localKey",
    left(a.display_name,200) as name,left(${historyClub},200) as club,
    left(coalesce(p.value->>'meeting',p.value->>'event'),300) as event,left(${historyDate},80) as date,
    left(p.value->>'discipline',100) as distance,left(p.value->>'performance',160) as performance,
    left(coalesce(p.value->>'status',p.value#>>'{archiveReference,status}'),60) as status,
    left(h.provider,150) as "sourceName",${safeSourceUrl("coalesce(supporting_history.url,h.source_url)")} as "sourceUrl",
    left(concat('History ',h.provider,':',h.external_id,' · performance ',p.ordinality,
      case when p.value#>>'{archiveReference,sourceRow}' is not null
        then ' · source row '||(p.value#>>'{archiveReference,sourceRow}') else '' end),500) as "rowLocator",
    concat(case when h.published_at is null then 'unpublished history' else 'published history' end,
      case when p.value->>'profileExcluded'='true' then ' · excluded from profile' else '' end) as "reviewState",
    a.id as "athleteId",left(a.slug,200) as "athleteSlug",
    left(h.provider||':'||h.external_id,400) as "sourceHistoryId"
    from athletes a join athlete_source_histories h on h.athlete_id=a.id
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(h.performances)='array' then h.performances else '[]'::jsonb end
    ) with ordinality p(value,ordinality)
    left join lateral(select source.url from jsonb_array_elements_text(
      case when jsonb_typeof(p.value->'sourceUrls')='array' then p.value->'sourceUrls' else '[]'::jsonb end
    ) with ordinality source(url,ordinality) where ${sourceMatches("source.url")}
      and source.url ~ '^https?://' order by source.ordinality limit 1) supporting_history on true
    where ${nameMatches("a.display_name")} and ${clubMatches(historyClub)}
      and ${yearMatches(historyDate)}
      and (${sourceMatches("h.source_url")} or supporting_history.url is not null)
    order by h.athlete_id desc,h.provider,h.external_id,p.ordinality ${take}`,
};

type RawRow = Partial<FinderRow> & { localKey: string };
const limited = (value: unknown, maximum: number): string | null =>
  typeof value === "string" && value.trim() ? value.slice(0, maximum) : null;
const id = (value: unknown): number | null =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null;
function sourceUrl(value: unknown): string | null {
  const text = limited(value, 2048);
  if (!text || String(value).length > 2048) return null;
  try {
    const url = new URL(text);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      ? text
      : null;
  } catch {
    return null;
  }
}

function compactRow(kind: FinderStoreKind, row: RawRow): FinderRow {
  return {
    key: `${kind}:${String(row.localKey).slice(0, 500)}`,
    kind,
    name: limited(row.name, 200) ?? "Name not supplied",
    club: limited(row.club, 200),
    event: limited(row.event, 300),
    date: limited(row.date, 80),
    distance: limited(row.distance, 100),
    performance: limited(row.performance, 160),
    finishSeconds:
      typeof row.finishSeconds === "number" && Number.isFinite(row.finishSeconds)
        ? row.finishSeconds
        : null,
    status: limited(row.status, 60),
    sourceName: limited(row.sourceName, 150),
    sourceUrl: sourceUrl(row.sourceUrl),
    rowLocator: limited(row.rowLocator, 500) ?? "Stored observation",
    reviewState: limited(row.reviewState, 120) ?? "Needs review",
    athleteId: id(row.athleteId),
    athleteSlug: limited(row.athleteSlug, 200),
    resultId: id(row.resultId),
    archiveEntryId: id(row.archiveEntryId),
    datasetId: limited(row.datasetId, 50),
    captureId: limited(row.captureId, 30),
    captureOrdinal: id(row.captureOrdinal),
    sourceHistoryId: limited(row.sourceHistoryId, 400),
  };
}

const storeTables: Record<FinderStoreKind, string[]> = {
  canonical: ["athletes", "results", "editions", "events", "clubs"],
  archive: ["result_archive_entries", "result_archive_datasets", "editions", "events"],
  capture: ["result_archive_source_captures", "result_archive_capture_approvals"],
  history: ["athlete_source_histories", "athletes"],
};

async function normalizeNames(sql: Sql, names: string[]): Promise<FinderNameTerms> {
  // At most nine 160-character inputs. This never reads participant tables.
  // JavaScript case folding/word classes differ from the PostgreSQL indexes
  // for Turkish I, Greek sigma and scripts containing combining marks.
  const rows = await sql.transaction(async (tx) => {
    await tx.query("set transaction read only");
    await tx.query("set local statement_timeout = '7000ms'");
    await tx.query("set local lock_timeout = '1000ms'");
    return tx.query<{ words: string[] }>(
      `select distinct tsvector_to_array(to_tsvector('simple',
        regexp_replace(normalize(variant,NFKC),'[^[:alnum:]]+',' ','g'))) as words
        from unnest($1::text[]) name
        cross join lateral (values(name),(upper(name)),(translate(name,'Iİ','ıi'))) variants(variant)`,
      [names],
    );
  });
  const terms = finderNameTerms(rows.map((row) => row.words).filter((words) => words.length));
  if (!terms.length) throw new Error("Enter a name containing searchable letters or numbers");
  return terms;
}

function captureCandidates(names: FinderNameTerms) {
  const values: string[][] = [];
  const clauses = names.map((words) => {
    const required: string[] = [];
    const alternatives: string[][] = [];
    for (const variants of words) {
      const keys = [...new Set(variants.map((word) => [...word].slice(0, 3).join("")))];
      if (keys.length === 1) required.push(keys[0]);
      else alternatives.push(keys);
    }
    const parts: string[] = [];
    if (required.length) {
      values.push([...new Set(required)]);
      parts.push(`athlete_finder_capture_name_keys(c.payload) @> $${values.length + 6}::text[]`);
    }
    for (const keys of alternatives) {
      values.push(keys);
      parts.push(`athlete_finder_capture_name_keys(c.payload) && $${values.length + 6}::text[]`);
    }
    return `(${parts.join(" and ")})`;
  });
  const needles = names.map(
    (words) =>
      words
        .filter((variants) => variants.length === 1 && /^[a-z0-9]{2,}$/.test(variants[0]))
        .map((variants) => variants[0])
        .sort((a, b) => b.length - a.length)[0],
  );
  let nameClause = nameMatches("p.value->>'name'");
  if (needles.every(Boolean)) {
    const unique = [...new Set(needles)];
    values.push(unique);
    const raw = "left(coalesce(p.value->>'name',''),2000)";
    const asciiLower = `translate(${raw},'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')`;
    const required = unique
      .map((_, index) => `strpos(${asciiLower},($${values.length + 6}::text[])[${index + 1}])>0`)
      .join(" or ");
    // A matching ASCII lexeme must appear literally in an ASCII source name.
    // Bypass the shortcut for all non-ASCII source names: NFKC and dictionary
    // case mappings can change those characters. CASE ensures a rejected row
    // never constructs a tsvector, regardless of planner predicate ordering.
    nameClause = `case when octet_length(${raw})=length(${raw}) and not (${required})
      then false else ${nameClause} end`;
  }
  return { clause: clauses.join(" or "), nameClause, values };
}

async function searchStore(
  sql: Sql,
  kind: FinderStoreKind,
  params: unknown[],
  offset: number,
  candidates: ReturnType<typeof captureCandidates>,
) {
  try {
    return await sql.transaction(async (tx) => {
      await tx.query("set transaction read only");
      await tx.query("set local statement_timeout = '7000ms'");
      await tx.query("set local lock_timeout = '1000ms'");
      const [tables] = await tx.query<{
        available: boolean;
        supporting: boolean;
        captureIndex: boolean;
      }>(
        `select bool_and(to_regclass('public.'||name) is not null) as available,
          to_regclass('public.result_source_references') is not null as supporting,
          to_regprocedure('athlete_finder_capture_name_keys(jsonb)') is not null as "captureIndex"
          from unnest($1::text[]) name`,
        [storeTables[kind]],
      );
      if (!tables?.available || (kind === "capture" && !tables.captureIndex)) {
        return {
          rows: [] as FinderRow[],
          store: {
            kind,
            status: "unavailable",
            returned: 0,
            hasMore: false,
            nextOffset: null,
            message:
              kind === "capture" && tables?.available
                ? "Apply the athlete finder search-index migration to enable private capture search."
                : "This result store is not available in this environment.",
          } satisfies FinderStoreStatus,
        };
      }
      const query = queries[kind]
        .replace("/* supporting_source_join */", () =>
          tables.supporting ? supportingJoin : absentSupportingJoin,
        )
        .replace("/* capture_name_candidates */", () => candidates.clause)
        .replace("/* capture_row_name_matches */", () => candidates.nameClause);
      const found = await tx.query<RawRow>(
        query,
        kind === "capture" ? [...params, ...candidates.values] : params,
      );
      const rows = found.slice(0, FINDER_PAGE_SIZE).map((row) => compactRow(kind, row));
      const hasMore = found.length > FINDER_PAGE_SIZE;
      return {
        rows,
        store: {
          kind,
          status: "searched",
          returned: rows.length,
          hasMore,
          nextOffset:
            hasMore && offset + FINDER_PAGE_SIZE <= 10000 ? offset + FINDER_PAGE_SIZE : null,
          message:
            hasMore && offset + FINDER_PAGE_SIZE > 10000
              ? "Narrow the name, source or year filters to continue."
              : kind === "canonical" && !tables.supporting
                ? "Canonical primary sources were searched; supporting source references are unavailable."
                : null,
        } satisfies FinderStoreStatus,
      };
    });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    const timedOut = code === "57014" || code === "55P03";
    return {
      rows: [] as FinderRow[],
      store: {
        kind,
        status: timedOut ? "timed_out" : "error",
        returned: 0,
        hasMore: false,
        nextOffset: null,
        message: timedOut
          ? "This store reached its time limit. Narrow the name, source or year filters and retry."
          : "This store could not be searched. Other stores are shown; retry this search.",
      } satisfies FinderStoreStatus,
    };
  }
}

/** Read-only search. No source fetch, import, publication, ownership or verification writes. */
export async function searchStoredAthleteResults(
  sql: Sql,
  input: FinderSearchInput,
  registry: readonly FixtureSource[] = [],
): Promise<FinderSearchResponse> {
  const data = finderSearchSchema.parse(input);
  const names = finderNames(data);
  const selected = data.sourceId
    ? registry.find((source) => source.source_id === data.sourceId)
    : undefined;
  if (data.sourceId && !selected)
    throw new Error("Select a source from the current source registry");
  const hosts = selected ? registrySourceHosts(selected) : [];
  if (selected && !hosts.length)
    throw new Error("This source has no usable registered website host");
  const kinds: readonly FinderStoreKind[] = data.kind === "all" ? FINDER_STORE_KINDS : [data.kind];
  const nameTerms = await normalizeNames(sql, names);
  const params = [
    finderNameQuery(nameTerms),
    data.club,
    data.yearFrom ?? null,
    data.yearTo ?? null,
    hosts,
    data.offset,
  ];
  const candidates = captureCandidates(nameTerms);
  const searched = await Promise.all(
    kinds.map((kind) => searchStore(sql, kind, params, data.offset, candidates)),
  );
  const stores = searched.map((result) => result.store);
  const hasMore = stores.some((store) => store.hasMore);
  return {
    rows: searched.flatMap((result) => result.rows),
    stores,
    hasMore,
    nextOffset:
      hasMore && data.offset + FINDER_PAGE_SIZE <= 10000 ? data.offset + FINDER_PAGE_SIZE : null,
    pageSize: FINDER_PAGE_SIZE,
    completeForSelectedStores:
      !hasMore && stores.every((store) => store.status === "searched" && !store.message),
    searchedAt: new Date().toISOString(),
    query: {
      names,
      club: data.club,
      yearFrom: data.yearFrom ?? null,
      yearTo: data.yearTo ?? null,
      sourceId: data.sourceId ?? null,
    },
    notes: [
      "Partial name-word matches and supplied aliases are included. A name match is a research lead, not proof of athlete identity.",
      "Each store has its own 25-row page. Observations can overlap across stores and are not a count of unique performances.",
      "URL-only sources, unextracted files and held or revoked source captures are not searched. No websites or paid search services are contacted.",
      "Private captures need edition and identity review before they can enter the normal result-claim workflow. Existing visibility and verification remain unchanged.",
    ],
  };
}
