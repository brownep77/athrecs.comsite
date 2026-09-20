// Source rows must be captured independently from the proposed/imported records.
// This comparison detects contradictions; a passing comparison is not identity proof.
export const normalizeName = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export function seconds(value) {
  if (!/^\d+:\d{2}(?::\d{2})?(?:\.\d+)?$/.test(value ?? "")) return null;
  return value.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

export function readTimingTable(table) {
  const headings = table.headers.map((h) => h.replace(/\s+/g, " ").trim());
  const column = (label) => headings.findIndex((h) => h === label);
  const required = ["Position", "Forename", "Surname", "Gender Pos", "Cat Pos"];
  if (required.some((label) => column(label) < 0)) return null;
  const value = (row, label) => (column(label) < 0 ? null : row[column(label)]);
  const rank = (v) => (/^\d+$/.test(v ?? "") ? Number(v) : null);
  return table.rows.map((row) => ({
    name: `${value(row, "Forename")} ${value(row, "Surname")}`,
    overall: rank(value(row, "Position")),
    gender: rank(value(row, "Gender Pos")),
    categoryPlace: rank(value(row, "Cat Pos")),
    bib: value(row, "Tag"),
    chipText: value(row, "Chip Time"),
    gunText: value(row, "Gun Time"),
    timeText: value(row, "Time") ?? value(row, "Total Time"),
    chip: seconds(value(row, "Chip Time")),
    gun: seconds(value(row, "Gun Time")),
    time: seconds(value(row, "Time") ?? value(row, "Total Time")),
  }));
}

export function compareResult(result, source) {
  const flags = [];
  const officialDates = source.startTimes.map((s) => s.slice(0, 10).split("/").reverse().join("-"));
  const tables = source.tables.map(readTimingTable);
  const matches = tables
    .filter(Boolean)
    .flat()
    .filter((row) => normalizeName(row.name) === normalizeName(result.display_name));
  if (!officialDates.length) flags.push("source_date_not_captured");
  else if (!officialDates.includes(result.event_date.slice(0, 10)))
    flags.push("cited_race_date_mismatch");
  if (tables.some((t) => t === null)) flags.push("unrecognised_table_headers");
  if (!source.rowCount) flags.push("cited_race_has_no_results");
  else if (!matches.length) flags.push("name_not_found_in_cited_race");
  if (matches.length > 1) flags.push("multiple_matching_names_or_distances");
  const match = matches.length === 1 ? matches[0] : null;
  if (match && !flags.includes("cited_race_date_mismatch")) {
    // Existing database times have integer precision. Accept rounding or truncation.
    if (
      result.chip_time_seconds != null &&
      match.chip != null &&
      Math.abs(result.chip_time_seconds - match.chip) > 1
    )
      flags.push("chip_time_mismatch");
    if (
      result.gun_time_seconds != null &&
      match.gun != null &&
      Math.abs(result.gun_time_seconds - match.gun) > 1
    )
      flags.push("gun_time_mismatch");
    if (
      match.chip == null &&
      match.gun == null &&
      match.time != null &&
      result.finish_time_seconds != null &&
      Math.abs(result.finish_time_seconds - match.time) > 1
    )
      flags.push("finish_time_mismatch");
    for (const [stored, official, label] of [
      [result.overall_place, match.overall, "overall_place"],
      [result.gender_place, match.gender, "gender_place"],
      [result.category_place, match.categoryPlace, "category_place"],
    ])
      if (stored != null && official != null && stored !== official)
        flags.push(`${label}_mismatch`);
    if (flags.includes("gender_place_mismatch") && result.gender_place === match.categoryPlace)
      flags.push("gender_place_equals_official_category_place");
  }
  return {
    result_id: result.id,
    source_id: result.source_id,
    athlete_id: result.athlete_id,
    athlete_number: result.athlete_number,
    name: result.display_name,
    event: result.event_name,
    date: result.event_date.slice(0, 10),
    distance: result.distance_code,
    visibility: result.result_visibility,
    status: result.status,
    stored: {
      chip: result.chip_time_seconds,
      gun: result.gun_time_seconds,
      finish: result.finish_time_seconds,
      overall: result.overall_place,
      gender: result.gender_place,
      categoryPlace: result.category_place,
    },
    source_url: source.url,
    official_event: source.headings[0],
    official_dates: officialDates,
    official_matches: matches,
    flags,
  };
}

export function auditResults(results, sources, asOf = new Date().toISOString().slice(0, 10)) {
  const sourceByUrl = new Map(sources.map((s) => [s.url, s]));
  const comparisons = results.flatMap((result) =>
    [...new Set([result.source_url, result.edition_source_url])]
      .filter((url) => sourceByUrl.has(url))
      .map((url) => compareResult(result, sourceByUrl.get(url))),
  );
  const covered = new Set(comparisons.map((c) => c.result_id));
  const issues = results.flatMap((r) => {
    const flags = [];
    if (!r.source_url?.trim()) flags.push("missing_result_source_url");
    if (/^https?:\/\/(www\.)?totalracetiming\.co\.uk\/result\/?$/.test(r.source_url ?? ""))
      flags.push("generic_trt_result_url");
    if (/^https?:\/\/(www\.)?runnorwich\.co\.uk\/event-info\/results\/?$/.test(r.source_url ?? ""))
      flags.push("generic_run_norwich_result_url");
    if (/^(finished|fin)$/i.test(r.status) && r.event_date.slice(0, 10) > asOf)
      flags.push("future_finished_result");
    if (r.gender_place != null && r.overall_place != null && r.gender_place > r.overall_place)
      flags.push("gender_place_exceeds_overall");
    if (r.category_place != null && r.gender_place != null && r.category_place > r.gender_place)
      flags.push("category_place_exceeds_gender");
    return flags.length
      ? [{ result_id: r.id, athlete_id: r.athlete_id, name: r.display_name, flags }]
      : [];
  });
  const count = (rows) => ({
    results: new Set(rows.map((r) => r.result_id)).size,
    athletes: new Set(rows.map((r) => r.athlete_id)).size,
    public: new Set(
      rows.filter((r) => r.visibility && r.visibility !== "private").map((r) => r.result_id),
    ).size,
  });
  const flagCounts = Object.fromEntries(
    [...new Set(comparisons.flatMap((c) => c.flags))].map((flag) => [
      flag,
      count(comparisons.filter((c) => c.flags.includes(flag))),
    ]),
  );
  return {
    checkedAt: asOf,
    scope: {
      results: results.length,
      athletes: new Set(results.map((r) => r.athlete_id)).size,
      officialPages: sources.length,
      compared: count(comparisons),
      untestedResults: results.length - covered.size,
    },
    flagCounts,
    issues,
    comparisons,
  };
}
