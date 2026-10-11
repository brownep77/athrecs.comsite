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
  const visit = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(visit);
    if (!input || typeof input !== "object") return input;
    const row = input as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    // Distinct decisions must remain distinct during exact duplicate matching.
    if ("reason" in row && "decisionDate" in row && "sourceUrl" in row)
      output.decisionKey = row.decisionKey ?? sourceKey(`decision:${JSON.stringify(row)}`);
    for (const [key, item] of Object.entries(row)) {
      if (key === "sourceUrls") {
        output.sourceUrls = [];
        output.sourceKeys =
          Array.isArray(item) && item.length
            ? item.map((url) => sourceKey(String(url)))
            : (row.sourceKeys ?? []);
      } else if (["sources", "biographySources", "sourceLabels"].includes(key)) {
        output[key] = [];
        if (key === "sources" && "finishTimeSeconds" in row && "distanceKm" in row)
          output.hasSourceEvidence =
            row.hasSourceEvidence ?? (Array.isArray(item) && item.length > 0);
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
          .map(visit);
      else output[key] = visit(item);
    }
    return output;
  };
  return visit(value) as T;
}
