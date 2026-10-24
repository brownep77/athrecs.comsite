import { sourceHistorySport } from "./source-history-sport.ts";
import {
  profileResultLicenceCredits,
  publicResultLicenceCreditIds,
} from "./public-result-licence.ts";

/** A browser projection only. Stored records and staff reads retain original evidence.
 * Opaque, response-local keys preserve source-based duplicate matching without URLs.
 * Provider classifications and public eligibility flags remain available to calculations.
 */
export function withoutProfileEvidence<T>(value: T): T {
  const keys = new Map<string, string>();
  const sourceKey = (url: string) => {
    const wa = url.match(
      /^https:\/\/worldathletics\.org\/athletes\/(?:.*-|athlete=)(\d+)(?:[/?#]|$)/,
    );
    const normal = wa ? `world-athletics:${wa[1]}` : url;
    if (!keys.has(normal)) keys.set(normal, `record-${keys.size + 1}`);
    return keys.get(normal)!;
  };
  const flags = (value: unknown) => {
    const text = typeof value === "string" ? value : "";
    return [
      /conflicting (?:source|details|result)/i.test(text) ? "Conflicting result." : "",
      /disputed placing/i.test(text) ? "Disputed placing." : "",
      /not legal/i.test(text) ? "Not legal." : "",
    ]
      .filter(Boolean)
      .join(" ");
  };
  const visit = (input: unknown, inheritedProvider = ""): unknown => {
    if (Array.isArray(input)) return input.map((item) => visit(item, inheritedProvider));
    if (!input || typeof input !== "object") return input;
    const row = input as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    const provider = String(row.providerName || row.provider || inheritedProvider || "");
    if (typeof row.discipline === "string" && "performance" in row)
      output.displaySport =
        row.displaySport ??
        sourceHistorySport(row.discipline, provider, String(row.meeting ?? "")) ??
        "Unclassified";
    if (
      Array.isArray(row.performances) &&
      provider === "Athletics New Zealand Rankings and Records"
    )
      output.rankingHistory = true;
    // Distinct decisions must remain distinct during exact duplicate matching.
    if ("reason" in row && "decisionDate" in row && "sourceUrl" in row)
      output.decisionKey = row.decisionKey ?? sourceKey(`decision:${JSON.stringify(row)}`);
    for (const [key, item] of Object.entries(row)) {
      if (["provider", "providerName", "resultSource", "result_source"].includes(key)) {
        output[key] = /^(?:world\s*athletics|Verified record)$/i.test(String(item ?? ""))
          ? "Verified record"
          : /^(?:athlete|Athlete-submitted)$/i.test(String(item ?? ""))
            ? "Athlete-submitted"
            : "Recorded results";
      } else if (key === "publicLicenceCredits") {
        output[key] = publicResultLicenceCreditIds(item);
      } else if (key === "performances" && Array.isArray(item)) {
        output[key] = item.map((performance) => visit(performance, provider));
      } else if (key === "key" && "performance" in row && "sport" in row) {
        output[key] = sourceKey(`history-key:${item}`);
      } else if (
        [
          "staffVerification",
          "staffApproval",
          "sourceIdentities",
          "identityEvidence",
          "reviewedBy",
        ].includes(key)
      ) {
        output[key] = null;
      } else if (key === "sourceUrls" || key === "sourceKeys") {
        if (key === "sourceUrls") output.sourceUrls = [];
        // Match calculation precedence, including explicit empty keys. Handle both
        // fields together so property order cannot restore private source locators.
        const identities = Array.isArray(row.sourceKeys)
          ? row.sourceKeys
          : Array.isArray(row.sourceUrls)
            ? row.sourceUrls
            : [];
        output.sourceKeys = identities.map((identity) => sourceKey(String(identity)));
      } else if (["sources", "biographySources", "sourceLabels"].includes(key)) {
        output[key] = [];
        if (key === "sources" && "finishTimeSeconds" in row && "distanceKm" in row)
          output.hasSourceEvidence =
            row.hasSourceEvidence ?? (Array.isArray(item) && item.length > 0);
      } else if (key === "labels" && Array.isArray(item)) {
        // Import provenance is staff evidence, including in serialized page data.
        // Retain race classifications and qualifications used by achievements.
        output[key] = item.filter(
          (label) =>
            !/^(?:Abbott\s+)?World Marathon Majors source result$/i.test(String(label).trim()),
        );
      } else if (key === "externalId") output[key] = sourceKey(`history:${row.provider}:${item}`);
      else if (
        [
          "sourceUrl",
          "source_url",
          "source",
          "locator",
          "sourceDate",
          "checkedAt",
          "capturedAt",
          "uncertainty",
        ].includes(key)
      )
        output[key] = "";
      else if (["nationalitySource", "nationality_source"].includes(key)) output[key] = null;
      else if (key === "note" || key === "notes") output[key] = flags(item);
      else if (key === "profile_links" && Array.isArray(item))
        output[key] = item
          .filter(
            (link) =>
              !/worldathletics|thepowerof10|powerof10|tilastopaja|all-athletics|athletics\.org\.nz|worldmarathonmajors|statistik\.d-u-v|belgraveharriers/i.test(
                String(link.url),
              ) && !/records|results|statistics|source|evidence/i.test(String(link.label)),
          )
          .map((item) => visit(item));
      else output[key] = visit(item);
    }
    if (Array.isArray(row.performances)) {
      const publicLicenceCredits = profileResultLicenceCredits([
        {
          provider: row.provider,
          publicLicenceCredits: row.publicLicenceCredits,
          performances: row.performances,
        },
      ]);
      if (publicLicenceCredits.length) output.publicLicenceCredits = publicLicenceCredits;
      else delete output.publicLicenceCredits;
    }
    return output;
  };
  return visit(value) as T;
}
