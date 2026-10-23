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
      ? new Response(robots, { status: robotsStatus, headers: { "content-type": "text/plain" } })
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
    [{ "content-length": "6000001" }, html],
    [{}, "x".repeat(6_000_001)],
  ]) {
    await reset();
    result = await checkSourcePage(input, actor, dependencies({ result: body, resultHeaders }));
    assert.equal(result.status, "unavailable");
    assert.equal(result.fetchedAt, null);
    assert.equal(result.rows.length, 0);
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
