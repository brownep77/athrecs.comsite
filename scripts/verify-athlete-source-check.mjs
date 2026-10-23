import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

// Only synthetic responses and an isolated in-memory database are used here.
registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL && /^\.\.?\//.test(specifier)) {
      const base = new URL(specifier, context.parentURL);
      for (const suffix of ["", ".ts", "/index.ts"]) {
        const url = new URL(base.href + suffix);
        if (existsSync(fileURLToPath(url)) && statSync(fileURLToPath(url)).isFile())
          return { url: url.href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
});
globalThis.fetch = async () => {
  throw new Error("Live network is forbidden in this verifier");
};
const { checkSourcePage, readTrtNameMatches, sourceRobotsPolicy } =
  await import("../src/lib/athlete-finder/source-check.server.ts");
const { sourceCheckSchema, sourceNameKey, trtResultUrl } =
  await import("../src/lib/athlete-finder/source-check.ts");
const { parseBrowserCapture } = await import("../src/lib/results-archive/browser-capture.ts");
const { mapArchiveRows } = await import("../src/lib/results-archive/core.ts");
const RESULT_URL = "https://totalracetiming.co.uk/raceresults/123";
const ROBOTS = "https://totalracetiming.co.uk/robots.txt";
const capturedAt = "2026-10-23T10:00:00.000Z";
const input = { url: RESULT_URL, name: "Zoe O'Neil", aliases: ["Z O'Neil"], club: "Fixture Club" };
const actor = { userId: "source-check-staff", staffEmail: "fixture@example.test" };
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const headers = [
  "Position",
  "Tag",
  "Forename",
  "Surname",
  "Club",
  "Chip Time",
  "Gun Time",
  "Gender Pos",
  "Cat Pos",
];
const row = (first = "Zoë", bib = "17", club = "") => [
  "11",
  bib,
  first,
  "O’Neil",
  club,
  "00:40:12.34",
  "00:40:18.91",
  "4",
  "2",
];
function table(rows, columns = headers, id = "sr1", heading = "10K", date = "01/01/2025") {
  return `<h2>Fixture Race</h2><h3 id="${id}">${heading}</h3><p>Start: ${date}</p><table><thead><tr>${columns.map((v) => `<th>${escape(v)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${escape(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
const html = `<title>Fixture results</title><h2>Fixture Race</h2>${table([row(), row("Z", "18", "Old Club"), ["12", "19", "Different", "Person", "Fixture Club", "00:41:00", "00:41:02", "5", "3"]])}${table([["Zoe O'Neil", "99", "1:02:03.40"]], ["Name", "Bib", "Time"], "sr2", "10 miles", "02/01/2025")}`;

// Strict routes never turn free-form text or arbitrary URLs into network targets.
assert.equal(trtResultUrl(`${RESULT_URL}/#sr1`), RESULT_URL);
for (const invalid of [
  "not a RESULT_URL",
  "https://example.test/raceresults/123",
  "http://totalracetiming.co.uk/raceresults/123",
  "https://user@totalracetiming.co.uk/raceresults/123",
  `${RESULT_URL}?name=Zoe`,
  `${RESULT_URL}#anything`,
  `${RESULT_URL}/extra`,
  "https://totalracetiming.co.uk/result",
  "https://totalracetiming.co.uk/raceresults/0",
  "https://totalracetiming.co.uk:8080/raceresults/123",
])
  assert.equal(trtResultUrl(invalid), null, invalid);
assert.throws(() => sourceCheckSchema.parse({ ...input, aliases: Array(9).fill("Zoe Oneil") }));
assert.throws(() => sourceCheckSchema.parse({ ...input, url: "not a RESULT_URL" }));
for (const invalid of [
  { ...input, name: "- -" },
  { ...input, name: "Z" },
  { ...input, name: "Z".repeat(161) },
  { ...input, aliases: [" "] },
  { ...input, club: "x".repeat(161) },
  { ...input, providerOverride: "example.test" },
])
  assert.equal(sourceCheckSchema.safeParse(invalid).success, false);
assert.equal(
  sourceCheckSchema.parse({ ...input, aliases: Array(8).fill("李 明") }).aliases.length,
  8,
);
assert.equal(sourceNameKey("Zoë O’Neil"), sourceNameKey("ZOE O'NEIL"));
assert.notEqual(sourceNameKey("李 明"), sourceNameKey("王 明"));

// Names, aliases and original precision survive missing or differing club values.
const parsed = readTrtNameMatches(html, RESULT_URL, input, capturedAt);
assert.equal(parsed.sourceRows, 4);
assert.equal(parsed.matchedRows, 3);
assert.equal(parsed.returnedRows, 3);
assert.equal(parsed.rows[0].date, "2025-01-01");
assert.equal(parsed.rows[0].sourceUrl, `${RESULT_URL}#sr1`);
assert.equal(parsed.rows[0].row, 1);
assert.equal(parsed.rows[0].original["Chip Time"], "00:40:12.34");
assert.equal(parsed.rows[0].original["Gun Time"], "00:40:18.91");
assert.equal(parsed.rows[0].original["Gender Pos"], "4");
assert.equal(parsed.rows[0].original["Cat Pos"], "2");
assert.match(parsed.rows[0].issues.join(" "), /No club/);
assert.match(parsed.rows[1].issues.join(" "), /differs/);
assert.match(parsed.rows[1].matchReason, /variation/);
assert.equal(parsed.rows[2].club, "");
assert.equal(parsed.rows[2].distance, "10 miles");
assert.equal(parsed.rows[2].date, "2025-01-02");
assert.ok(parsed.rows.every((r) => r.issues.some((i) => /identity has not been checked/.test(i))));
assert.ok(
  !JSON.stringify(parsed).includes("Different"),
  "Unmatched participant rows must stay off the response",
);
assert.equal(
  parsed.reviewCaptures.length,
  1,
  "Generic Name-only tables are preview-only until an independent adapter supports them",
);
assert.match(parsed.rows[2].issues.join(" "), /unrecognised_table_headers/);
for (const capture of parsed.reviewCaptures) {
  const result = parseBrowserCapture(capture.json);
  const mapped = mapArchiveRows(result.table, result.mapping);
  assert.equal(result.capturedAt, capturedAt);
  assert.ok(result.warnings.some((w) => /Selected matching rows only/.test(w)));
  assert.ok(result.warnings.some((w) => /Server-fetched/.test(w)));
  assert.ok(
    result.warnings.some((w) => /independent TRT source-row comparison found no flags/.test(w)),
  );
  assert.ok(mapped.every((r) => r.name && r.sourceKey.startsWith("trt:123:")));
  assert.ok(!capture.json.includes("Different"));
}
assert.equal(
  mapArchiveRows(
    parseBrowserCapture(parsed.reviewCaptures[0].json).table,
    parseBrowserCapture(parsed.reviewCaptures[0].json).mapping,
  )[0].chipSeconds,
  2412.34,
);
const repeated = readTrtNameMatches(table([row(), row()]), RESULT_URL, input, capturedAt);
assert.notEqual(repeated.rows[0].key, repeated.rows[1].key);
assert.match(repeated.rows[0].key, /row:1$/);
assert.match(repeated.rows[1].issues.join(" "), /bib is repeated/);
assert.equal(repeated.reviewCaptures.length, 0);
assert.match(repeated.rows[0].issues.join(" "), /multiple_matching_names_or_distances/);
const sameNameDifferentBibs = readTrtNameMatches(
  table([row("Zoe", "17"), row("Zoe", "18")]),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(
  sameNameDifferentBibs.reviewCaptures.length,
  1,
  "source_bib disambiguates two source entries without establishing identity",
);
const missingBib = readTrtNameMatches(table([row("Zoe", "")]), RESULT_URL, input, capturedAt);
assert.match(missingBib.rows[0].key, /row:1$/);
assert.match(missingBib.rows[0].issues.join(" "), /No bib/);
const noDate = readTrtNameMatches(
  table([row()], headers, "sr1", "10K", "31/02/2025"),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(noDate.rows[0].date, null);
assert.equal(noDate.reviewCaptures.length, 0);
for (const [column, value] of [
  ["Gender Pos", "12"],
  ["Cat Pos", "5"],
  ["Chip Time", "00:42:00.99"],
]) {
  const bad = row();
  bad[headers.indexOf(column)] = value;
  const held = readTrtNameMatches(table([bad]), RESULT_URL, input, capturedAt);
  assert.equal(held.rows.length, 1, "Keep the source preview and original contradictory values");
  assert.equal(held.rows[0].original[column], value);
  assert.equal(
    held.reviewCaptures.length,
    0,
    `${column} requires manual resolution before import handoff`,
  );
  assert.match(held.rows[0].issues.join(" "), /handoff withheld/);
}
const future = readTrtNameMatches(
  table([row()], headers, "sr1", "10K", "01/01/2027"),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(future.reviewCaptures.length, 0);
assert.match(future.issues.join(" "), /future_finished_result/);
const noMatch = readTrtNameMatches(
  html,
  RESULT_URL,
  { ...input, name: "Never Entered", aliases: [] },
  capturedAt,
);
assert.equal(noMatch.matchedRows, 0);
assert.match(noMatch.issues.join(" "), /does not establish/);
assert.throws(
  () => readTrtNameMatches(table([]), RESULT_URL, input, capturedAt),
  /No visible, supported athlete rows/,
);
assert.throws(
  () =>
    readTrtNameMatches(
      table([["", "", "", "", "", "", "", "", ""]]),
      RESULT_URL,
      input,
      capturedAt,
    ),
  /No visible, supported athlete rows/,
);
const capped = readTrtNameMatches(
  table(Array.from({ length: 55 }, (_, i) => row("Zoe", String(i + 1)))),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(capped.matchedRows, 55);
assert.equal(capped.returnedRows, 50);
assert.equal(capped.truncated, true);
assert.equal(parseBrowserCapture(capped.reviewCaptures[0].json).table.rows.length, 50);
const malformed = readTrtNameMatches(
  table([row(), [...row(), "extra cell"]]),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(malformed.matchedRows, 1);
assert.match(malformed.issues.join(" "), /were not searched/);
assert.equal(
  malformed.reviewCaptures.length,
  0,
  "Malformed original tables cannot pass the source-comparison gate",
);
assert.throws(
  () =>
    readTrtNameMatches(
      table([["Zoe O'Neil", "x"]], ["Name", "Name"]),
      RESULT_URL,
      input,
      capturedAt,
    ),
  /No supported/,
);
assert.throws(
  () =>
    readTrtNameMatches(
      "<title>Just a moment</title><h1>Verify you are human</h1>",
      RESULT_URL,
      input,
      capturedAt,
    ),
  /access challenge/,
);
const reserved = readTrtNameMatches(
  table([["Zoe O'Neil", "x"]], ["Name", "_capture_notes"]),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(reserved.rows.length, 1);
assert.equal(reserved.reviewCaptures.length, 0);
assert.match(reserved.issues.join(" "), /cannot be passed/);
const colliding = readTrtNameMatches(
  table([[...row(), "source", "t", "r"]], [...headers, "Source key", "Source table", "Source row"]),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(parseBrowserCapture(colliding.reviewCaptures[0].json).table.rows.length, 1);

// Metadata belongs to its own race section, never the preceding table.
const withoutDate = table([row()], headers, "sr2", "5K").replace(/<p>.*?<\/p>/, "");
const separateDates = readTrtNameMatches(
  table([row()]) + withoutDate,
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(
  separateDates.rows[1].date,
  null,
  "A missing race date must not inherit another race's date",
);
assert.deepEqual(
  separateDates.reviewCaptures.map((capture) => capture.table),
  [1],
);
const withoutHeading = table([row()]).replace(/<h[23][^>]*>.*?<\/h[23]>|<p>.*?<\/p>/g, "");
const separateHeadings = readTrtNameMatches(
  table([row()]) + withoutHeading,
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(separateHeadings.rows[1].distance, "");
assert.equal(separateHeadings.rows[1].date, null);
assert.equal(new Set(separateHeadings.rows.map((row) => row.key)).size, 2);
assert.deepEqual(
  separateHeadings.reviewCaptures.map((capture) => capture.table),
  [1],
);
const duplicateAnchors = readTrtNameMatches(
  table([row()]) + table([row()], headers, "sr1", "5K", "02/01/2025"),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(new Set(duplicateAnchors.rows.map((row) => row.key)).size, 2);
assert.equal(
  duplicateAnchors.reviewCaptures.length,
  0,
  "Ambiguous table IDs cannot support an import handoff",
);
assert.ok(
  duplicateAnchors.rows.every((row) => row.issues.some((issue) => /table locator/.test(issue))),
);
assert.throws(
  () =>
    readTrtNameMatches(
      `<title>Just a moment</title><h1>Verify you are human</h1>${html}`,
      RESULT_URL,
      input,
      capturedAt,
    ),
  /access challenge/,
  "An access challenge must stop the check even if stale result tables remain in the HTML",
);
const unknownDistance = readTrtNameMatches(
  table([row()], headers, "sr1", "Results"),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(unknownDistance.rows.length, 1);
assert.equal(
  unknownDistance.reviewCaptures.length,
  0,
  "An unrecognised distance needs manual review",
);
const zeroTime = row();
zeroTime[headers.indexOf("Chip Time")] = "00:00:00";
zeroTime[headers.indexOf("Gun Time")] = "00:00:00";
for (const [label, fixture] of [
  ["zero finish", table([zeroTime])],
  ["contradictory generic finish", table([[...row(), "00:10:00"]], [...headers, "Time"])],
  ["multiple possible distances", table([row()], headers, "sr1", "5K and 10K")],
]) {
  const held = readTrtNameMatches(fixture, RESULT_URL, input, capturedAt);
  assert.equal(held.rows.length, 1);
  assert.equal(
    held.reviewCaptures.length,
    0,
    `${label} needs source interpretation before an import handoff`,
  );
}
const consistentGenericTime = readTrtNameMatches(
  table([[...row(), "00:40:18.91"]], [...headers, "Time"]),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(consistentGenericTime.reviewCaptures.length, 1);
for (const [column, invalid] of [
  ["Position", "0"],
  ["Position", "-1"],
  ["Gender Pos", "one"],
  ["Chip Time", "00:60:00"],
  ["Chip Time", "00:40:99"],
  ["Chip Time", "NaN"],
  ["Tag", "x".repeat(101)],
]) {
  const cells = row();
  cells[headers.indexOf(column)] = invalid;
  const held = readTrtNameMatches(table([cells]), RESULT_URL, input, capturedAt);
  assert.equal(held.rows[0].original[column], invalid);
  assert.equal(
    held.reviewCaptures.length,
    0,
    `Malformed ${column} remains available for manual review only`,
  );
}
const unreasonablyLong = readTrtNameMatches(
  table([[...row(), "x".repeat(4001)]], [...headers, "Comment"]),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(unreasonablyLong.matchedRows, 1);
assert.equal(unreasonablyLong.returnedRows, 0);
assert.equal(unreasonablyLong.truncated, true);
assert.equal(unreasonablyLong.reviewCaptures.length, 0);
const manyTables = readTrtNameMatches(
  Array.from({ length: 11 }, (_, i) =>
    table([row("Zoe", String(i + 1))], headers, `sr${i + 1}`),
  ).join(""),
  RESULT_URL,
  input,
  capturedAt,
);
assert.equal(manyTables.rows.length, 11);
assert.equal(manyTables.reviewCaptures.length, 10);
assert.match(manyTables.issues.join(" "), /first ten matching tables/);
const nonLatin = readTrtNameMatches(
  table([["1", "25", "李", "明", "", "00:40:12.34", "00:40:18.91", "1", "1"]]),
  RESULT_URL,
  { url: RESULT_URL, name: "李 明" },
  capturedAt,
);
assert.equal(nonLatin.matchedRows, 1);
assert.equal(nonLatin.rows[0].name, "李 明");

// Crawl rules are interpreted before fetching any athlete results page.
assert.equal(sourceRobotsPolicy("User-agent: *\nDisallow: /", "/raceresults/123").allowed, false);
assert.equal(
  sourceRobotsPolicy(
    "User-agent: *\nDisallow: /raceresults/*\nAllow: /raceresults/123$",
    "/raceresults/123",
  ).allowed,
  true,
);
assert.equal(
  sourceRobotsPolicy(
    "User-agent: *\nAllow: /\nUser-agent: AthRecsResultsArchive\nDisallow: /raceresults/",
    "/raceresults/123",
  ).allowed,
  false,
);
assert.equal(
  sourceRobotsPolicy(
    "User-agent: *\nDisallow: /\nUser-agent: AthRecsResultsArchive\nAllow: /",
    "/raceresults/123",
  ).allowed,
  true,
);
assert.equal(
  sourceRobotsPolicy("User-agent: *\nCrawl-delay: 3\nRequest-rate: 1/5", "/raceresults/123")
    .crawlDelaySeconds,
  5,
);
assert.equal(
  sourceRobotsPolicy("User-agent: *\nDisallow: /race%72esults", "/raceresults/123").allowed,
  false,
);
assert.throws(
  () => sourceRobotsPolicy("<html>Access denied</html>", "/raceresults/123"),
  /crawl rules/,
);
assert.throws(
  () => sourceRobotsPolicy("User-agent: *\nCrawl-delay: nope", "/raceresults/123"),
  /crawl delay/,
);
assert.equal(
  sourceRobotsPolicy("User-agent: *\rDisallow: /", "/raceresults/123").allowed,
  false,
  "CR-only robots records are valid line endings and must retain the denial",
);
assert.equal(
  sourceRobotsPolicy("User-agent: *\nDisallow: /\nUser-agent: https\nAllow: /", "/raceresults/123")
    .allowed,
  false,
  "A token in the crawler's documentation URL is not its robots product token",
);
assert.equal(
  sourceRobotsPolicy(
    "User-agent: AthRecsResultsArchive\nDisallow: /\nUser-agent: ATHRECSRESULTSARCHIVE\nAllow: /raceresults/123$",
    "/raceresults/123",
  ).allowed,
  true,
  "Matching product groups combine case-insensitively and the longest path applies",
);
assert.throws(() => sourceRobotsPolicy("Access denied", "/raceresults/123"), /access challenge/);

const pg = new PGlite({ parsers: { 20: Number } });
await pg.exec(`create table network_audit_log (
  id bigserial primary key, actor_user_id text, action text not null,
  entity_type text not null, entity_id text not null, after_value jsonb,
  note text, created_at timestamptz not null default now()
);`);
function adapter(db, nested = false) {
  const sql = async (strings, ...values) => {
    let query = strings[0];
    values.forEach((_, i) => {
      query += `$${i + 1}${strings[i + 1]}`;
    });
    return (await db.query(query, values)).rows;
  };
  sql.query = async (query, values = []) => (await db.query(query, values)).rows;
  sql.transaction = (fn) => (nested ? fn(sql) : db.transaction((tx) => fn(adapter(tx, true))));
  return sql;
}
const sql = adapter(pg);
const calls = [],
  waits = [];
function fetcher({
  robots = "User-agent: *\nAllow: /",
  robotsStatus = 200,
  robotsHeaders = {},
  result = html,
  resultStatus = 200,
  resultHeaders = {},
} = {}) {
  return async (url, options) => {
    assert.ok(
      [ROBOTS, RESULT_URL].includes(url),
      "Only the rules and exact supplied result link are requested",
    );
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    assert.match(options.headers["User-Agent"], /AthRecsResultsArchive/);
    assert.ok(!String(url).includes("Zoe"), "Names are never sent to another website");
    calls.push(url);
    return url === ROBOTS
      ? new Response(robots, {
          status: robotsStatus,
          headers: { "content-type": "text/plain", ...robotsHeaders },
        })
      : new Response(result, {
          status: resultStatus,
          headers: { "content-type": "text/html", ...resultHeaders },
        });
  };
}
const dependencies = (options = {}) => ({
  sql,
  fetcher: fetcher(options),
  wait: async (ms) => {
    waits.push(ms);
  },
});
const reset = async () => {
  await sql`delete from network_audit_log`;
  calls.length = 0;
  waits.length = 0;
};
try {
  await assert.rejects(
    checkSourcePage(input, { userId: "", staffEmail: "" }, dependencies()),
    /Verified staff/,
  );
  let result = await checkSourcePage(
    { ...input, url: "https://unsupported.example.test/results" },
    actor,
    dependencies(),
  );
  assert.equal(result.status, "unavailable");
  assert.equal(calls.length, 0);
  assert.equal(result.sourceRows, null);

  result = await checkSourcePage(input, actor, dependencies());
  assert.equal(result.status, "checked", JSON.stringify(result));
  assert.deepEqual(calls, [ROBOTS, RESULT_URL]);
  assert.equal(result.cacheStatus, "live");
  assert.ok(result.fetchedAt && result.robotsCheckedAt && result.checkedAt);
  assert.ok(Date.parse(result.fetchedAt) >= Date.parse(result.robotsCheckedAt));
  assert.equal(result.coverage.pagesChecked, 1);
  assert.equal(result.matchedRows, 3);
  assert.ok(
    waits.some((ms) => ms > 1500 && ms <= 6000),
    "Requests must be spaced at the provider",
  );
  const logs = await sql`select action,after_value,note from network_audit_log`;
  assert.ok(logs.some((r) => r.action === "athlete.source_check_completed"));
  assert.ok(!JSON.stringify(logs).includes("O'Neil"), "Participant query names are not logged");
  assert.ok(
    logs.every((r) => !JSON.stringify(r).includes("Chip Time")),
    "Source rows are not persisted by preview",
  );

  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({ robots: "User-agent: *\nDisallow: /raceresults/" }),
  );
  assert.equal(result.status, "blocked");
  assert.deepEqual(calls, [ROBOTS]);
  assert.equal(result.fetchedAt, null);
  assert.equal(result.cacheStatus, "not_fetched");
  assert.equal(result.coverage.pagesChecked, 0);

  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({ robots: "User-agent: *\nCrawl-delay: 30" }),
  );
  assert.equal(result.status, "blocked");
  assert.deepEqual(calls, [ROBOTS]);
  assert.equal(result.retryAfterSeconds, 30);

  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({ robots: "User-agent: *\nCrawl-delay: 4" }),
  );
  assert.equal(result.status, "checked");
  assert.ok(
    waits.some((ms) => ms > 3500 && ms <= 6000),
    "The declared crawl delay increases provider spacing",
  );

  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({ robotsStatus: 403, robots: "Denied" }),
  );
  assert.equal(result.status, "blocked");
  assert.deepEqual(calls, [ROBOTS]);
  assert.equal(result.robotsCheckedAt, null);

  await reset();
  result = await checkSourcePage(input, actor, dependencies({ result: table([]) }));
  assert.equal(result.status, "unavailable");
  assert.equal(result.matchedRows, null);
  assert.equal(result.cacheStatus, "live");
  assert.ok(result.fetchedAt);

  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({ robots: "Missing", robotsStatus: 404 }),
  );
  assert.equal(result.status, "checked");
  assert.deepEqual(calls, [ROBOTS, RESULT_URL]);

  for (const status of [401, 403, 429]) {
    await reset();
    result = await checkSourcePage(
      input,
      actor,
      dependencies({
        resultStatus: status,
        result: "Limited",
        resultHeaders: { "retry-after": "1200" },
      }),
    );
    assert.equal(result.status, "blocked");
    assert.equal(result.retryAfterSeconds, 1200);
    assert.equal(result.fetchedAt, null);
    assert.equal(result.matchedRows, null);
    const count = calls.length;
    result = await checkSourcePage(input, actor, dependencies());
    assert.equal(result.status, "rate_limited");
    assert.equal(
      calls.length,
      count,
      "A provider denial stops subsequent calls before network access",
    );
  }

  // HTTP denials remain authoritative when their response stream has failed.
  for (const status of [401, 403, 429]) {
    await reset();
    const brokenBody = new ReadableStream({
      start(controller) {
        controller.error(new Error("Synthetic disconnected denial body"));
      },
    });
    result = await checkSourcePage(
      input,
      actor,
      dependencies({ resultStatus: status, result: brokenBody }),
    );
    assert.equal(
      result.status,
      "blocked",
      `HTTP ${status} must survive a body cancellation failure`,
    );
    assert.ok(result.retryAfterSeconds >= (status === 429 ? 60 : 900));
    assert.equal(
      (
        await sql`select count(*)::int as count from network_audit_log where action='athlete.source_provider_cooldown'`
      )[0].count,
      1,
    );
    const made = calls.length;
    result = await checkSourcePage(input, actor, dependencies());
    assert.equal(result.status, "rate_limited");
    assert.equal(calls.length, made, "A failed denial body cannot enable another provider request");
  }

  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({ result: "<title>Just a moment</title>" }),
  );
  assert.equal(result.status, "blocked");
  assert.equal(result.cacheStatus, "live");
  assert.ok(result.fetchedAt);
  const count = calls.length;
  result = await checkSourcePage(input, actor, dependencies());
  assert.equal(result.status, "rate_limited");
  assert.equal(calls.length, count);

  for (const [resultHeaders, body] of [
    [{ "content-type": "application/pdf" }, "PDF"],
    [{ "content-type": "text/html-unrecognised" }, html],
    [{ "content-type": "application/unknown; note=text/html" }, html],
    [{ "content-length": "6000001" }, html],
    [{}, "x".repeat(6_000_001)],
  ]) {
    await reset();
    result = await checkSourcePage(input, actor, dependencies({ result: body, resultHeaders }));
    assert.equal(result.status, "unavailable");
    assert.equal(result.fetchedAt, null);
    assert.equal(result.rows.length, 0);
  }

  // Response boundaries are measured in bytes and enforced while streaming too.
  for (const body of [
    new Uint8Array([0xc3, 0x28]), // invalid UTF-8
    new ReadableStream({
      start(controller) {
        controller.error(new Error("Synthetic broken stream"));
      },
    }),
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(3_000_000));
        controller.enqueue(new Uint8Array(3_000_001));
        controller.close();
      },
    }),
    "é".repeat(3_000_001),
  ]) {
    await reset();
    result = await checkSourcePage(input, actor, dependencies({ result: body }));
    assert.equal(result.status, "unavailable");
    assert.equal(result.fetchedAt, null);
    assert.equal(result.rows.length, 0);
    assert.equal(result.reviewCaptures.length, 0);
    assert.equal(
      (
        await sql`select count(*)::int as count from network_audit_log where action='athlete.source_check_completed'`
      )[0].count,
      0,
    );
  }
  for (const options of [
    { robots: "x".repeat(256_001) },
    { robots: "{}", robotsHeaders: { "content-type": "application/json" } },
    { robots: "%PDF-1.4", robotsHeaders: { "content-type": "application/pdf" } },
    { robots: "Access denied" },
    { robots: "<html>Denied</html>" },
    { robots: "Unavailable", robotsStatus: 503 },
    {
      robots: "Moved",
      robotsStatus: 302,
      robotsHeaders: { location: "https://example.test/robots.txt" },
    },
  ]) {
    await reset();
    result = await checkSourcePage(input, actor, dependencies(options));
    assert.notEqual(result.status, "checked");
    assert.deepEqual(
      calls,
      [ROBOTS],
      "An unreadable or redirected robots response never authorizes a results request",
    );
    assert.equal(result.reviewCaptures.length, 0);
  }
  await reset();
  result = await checkSourcePage(
    input,
    actor,
    dependencies({
      resultStatus: 302,
      resultHeaders: { location: "https://example.test/results" },
    }),
  );
  assert.equal(result.status, "unavailable");
  assert.deepEqual(calls, [ROBOTS, RESULT_URL]);
  assert.equal(result.fetchedAt, null);

  // The timeout signal applies to the response body, not just initial headers.
  await reset();
  const originalTimeout = AbortSignal.timeout;
  const deadlines = [];
  const controllers = [];
  AbortSignal.timeout = (ms) => {
    deadlines.push(ms);
    const controller = new AbortController();
    controllers.push(controller);
    return controller.signal;
  };
  try {
    const defaults = dependencies();
    result = await checkSourcePage(input, actor, {
      ...defaults,
      fetcher: async (url, options) => {
        if (url === ROBOTS) return defaults.fetcher(url, options);
        calls.push(url);
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("<html>"));
              options.signal.addEventListener(
                "abort",
                () => controller.error(options.signal.reason),
                { once: true },
              );
              queueMicrotask(() =>
                controllers.at(-1).abort(new DOMException("Synthetic timeout", "TimeoutError")),
              );
            },
          }),
          { headers: { "content-type": "text/html" } },
        );
      },
    });
    assert.deepEqual(deadlines, [10_000, 18_000]);
    assert.equal(result.status, "unavailable");
    assert.equal(result.fetchedAt, null);
    assert.equal(result.rows.length, 0);
  } finally {
    AbortSignal.timeout = originalTimeout;
  }

  await reset();
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id)
    select ${actor.userId},'athlete.source_check_requested','athlete_source_check',n::text from generate_series(1,10) n`;
  result = await checkSourcePage(input, actor, dependencies());
  assert.equal(result.status, "rate_limited");
  assert.equal(result.retryAfterSeconds, 300);
  assert.equal(calls.length, 0);

  await reset();
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,created_at)
    select ${actor.userId},'athlete.source_check_requested','athlete_source_check',n::text,now()-interval '10 minutes' from generate_series(1,60) n`;
  result = await checkSourcePage(input, actor, dependencies());
  assert.equal(result.status, "rate_limited");
  assert.equal(result.retryAfterSeconds, 3600);
  assert.equal(calls.length, 0);

  const api = await readFile(
    new globalThis.URL("../src/lib/athlete-finder/source-check-api.ts", import.meta.url),
    "utf8",
  );
  assert.match(api, /middleware\(\[staffMiddleware\]\)/);
  assert.match(api, /private, no-store/);
  console.log(
    "Athlete source-check verifier passed: exact URLs, missing clubs, aliases, original marks, bounded review handoff, robots, denial cooldowns, and durable request limits. Synthetic responses only; no result imports or live calls.",
  );
} finally {
  await pg.close();
}
