import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  makeQueue,
  findTimeClues,
  followupLinks,
  runStartTimeBatch,
  reviewHtml,
  prepareReviewedStarts,
} from "./lib/start-time-batch.mjs";
import {
  publicUrl,
  publicAddress,
  robotsPolicy,
  parseHtml,
  createSourceReader,
  digest,
  writeJson,
  importSourceCaptures,
} from "./lib/start-time-fetch.mjs";
import { runCli } from "./collect-start-times.mjs";

const directory = await mkdtemp(join(tmpdir(), "athrecs-start-test-"));
const root = "https://races.example.org/event",
  pdf = "https://races.example.org/programme-2026.pdf";
const base = {
  id: 1,
  event_id: 10,
  name: "Synthetic autumn event",
  slug: "synthetic",
  sport: "Athletics",
  country: "GB",
  event_date: "2026-10-25T00:00:00.000Z",
  distance_code: "5K",
  start_time: "",
  notes: "Preserve this",
  website: root,
};
const rows = [
  base,
  { ...base, id: 2, distance_code: "10K" },
  { ...base, id: 3, event_id: 11, event_date: "2026-12-31T00:00:00.000Z" },
  { ...base, id: 4, start_time: "10:30" },
  { ...base, id: 5, status: "Cancelled" },
  { ...base, id: 6, event_date: "2027-01-01" },
];
const scope = { from: "2026-10-25", to: "2026-12-31" };
try {
  const queue = makeQueue(rows, scope);
  assert.equal(queue.totalEditions, 3);
  assert.equal(queue.all.length, 2);
  assert.equal(queue.all[0].priority, "within-48-hours");
  assert.equal(queue.all[1].date, "2026-12-31");
  assert.throws(() => makeQueue([base, base], scope), /Duplicate/);
  assert.equal(makeQueue([{ ...base, start_time: " TBC " }], scope).totalEditions, 1);
  for (const bad of [
    "https://127.0.0.1/a",
    "https://[::1]/",
    "https://localhost/",
    "https://x.local/a",
    "file:///etc/passwd",
    "https://user:pass@example.org",
    "https://races.example.org:8443",
  ])
    assert.throws(() => publicUrl(bad));
  assert.equal(publicUrl("http://races.example.org/event#top"), root);
  for (const bad of [
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "192.168.1.2",
    "172.16.0.1",
    "100.64.1.2",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "2001:db8::1",
    "2002:7f00:1::",
  ])
    assert.equal(publicAddress(bad), false, bad);
  assert.equal(publicAddress("8.8.8.8"), true);
  assert.equal(publicAddress("2606:4700:4700::1111"), true);
  assert.equal(
    robotsPolicy("User-agent: *\nDisallow: /private\nAllow: /private/open", "/private/open")
      .allowed,
    true,
  );
  assert.equal(robotsPolicy("User-agent: *\nDisallow: /*secret$", "/xsecret").allowed, false);
  assert.equal(
    robotsPolicy("User-agent: *\nDisallow: /\nUser-agent: AthRecsStartTimes\nAllow: /", "/event")
      .allowed,
    true,
  );
  assert.throws(() => robotsPolicy("<html>blocked</html>", "/"), /inaccessible/);
  const parsed = parseHtml(
    '<title>Programme</title><script>Race start 02:00</script><table><tr><th>Distance</th><th>Start</th></tr><tr><td>5K</td><td>09:30</td></tr></table><a href="programme-2026.pdf">Schedule</a>',
    root,
  );
  assert(!parsed.text.includes("02:00"));
  assert(parsed.text.includes("5K | 09:30"));
  assert.equal(parsed.links[0].url, pdf);
  const clocks = findTimeClues(
    "Race starts: 8am, 12pm, 12am, 9.30am, 14h15. Wave starts 16:00–17:00. Registration 06:00, shuttle 07:00.",
  );
  for (const value of ["08:00", "12:00", "00:00", "09:30", "14:15", "16:00", "17:00"])
    assert(
      clocks.some((c) => c.time === value),
      value,
    );
  assert(clocks.find((c) => c.time === "06:00").cautions.length);
  assert.equal(findTimeClues("Entry costs £10.00 and £20.00").length, 0);
  assert.equal(
    findTimeClues("Race start information: 3.28 miles, £23.00, 22.10.26 and 2026.04.16.").length,
    0,
  );
  assert.equal(publicAddress("2001:0db8::1"), false);
  const links = followupLinks(
    {
      url: root,
      links: [
        { text: "2025 programme", url: "https://races.example.org/2025.pdf" },
        { text: "2026 timetable", url: pdf },
        { text: "Privacy", url: root + "/privacy" },
        { text: "2026 FAQ", url: root + "/faq" },
      ],
    },
    "2026",
  );
  assert.equal(links.length, 2);
  assert.equal(links[0].url, pdf);
  const sourceText =
    "Synthetic autumn event 25 October 2026\n5K race start 09:30. 10K race start 10:30. First wave only.";
  const pages = new Map([
    [
      root,
      {
        url: root,
        status: 200,
        text: "2026 event. Read the timetable.",
        links: [{ text: "2026 programme", url: pdf }],
      },
    ],
    [
      pdf,
      { url: pdf, status: 200, text: sourceText, links: [{ text: "FAQ", url: root + "/faq" }] },
    ],
  ]);
  const cacheDirectory = join(directory, "sources");
  await mkdir(cacheDirectory);
  const transportReader = createSourceReader({
    directory: join(directory, "network-test"),
    resolve: async () => {
      throw Error("getaddrinfo EAI_AGAIN example.org");
    },
  });
  const transportFailure = await transportReader.read(root);
  assert.equal(transportFailure.unchecked, true);
  assert.equal(transportReader.stats.networkRequests, 0);
  const privateReader = createSourceReader({
    directory: join(directory, "private-test"),
    resolve: async () => [{ address: "127.0.0.1", family: 4 }],
  });
  assert.match((await privateReader.read(root)).error, /non-public/);
  assert.equal(privateReader.stats.networkRequests, 0);
  const external = {
    url: root,
    status: 200,
    text: "Race 2026 start 10:00",
    links: [],
    checkedAt: new Date(Date.now() - 1000).toISOString(),
    captureOrigin: "Synthetic approved external transport",
  };
  assert.equal(await importSourceCaptures([external], join(directory, "imports")), 1);
  await assert.rejects(
    () => importSourceCaptures([{ ...external, captureOrigin: "" }], join(directory, "imports")),
    /Incomplete/,
  );
  await assert.rejects(
    () =>
      importSourceCaptures(
        [{ ...external, checkedAt: new Date(Date.now() + 60000).toISOString() }],
        join(directory, "imports"),
      ),
    /Incomplete/,
  );
  for (const [url, page] of pages)
    await writeJson(join(cacheDirectory, `${digest(url)}.json`), {
      ...page,
      checkedAt: "2026-10-25T10:00:00Z",
      textHash: digest(page.text),
    });
  const reader = createSourceReader({
    directory: cacheDirectory,
    offline: true,
    now: () => new Date("2026-10-25T11:00:00Z"),
  });
  const report = await runStartTimeBatch(rows, {
    ...scope,
    directory,
    reader,
    concurrency: 3,
    maxPages: 2,
    depth: 2,
  });
  assert.equal(report.summary.editions, 3);
  assert.equal(report.summary.networkRequests, 0);
  assert.equal(report.summary.cacheHits, 2);
  assert.equal(report.summary.remainingUnverifiedEditions, 3);
  assert.equal(report.summary.published, 0);
  assert.equal(report.groups[0].state, "needs-review");
  assert(report.groups[0].deferred.some((d) => d.url === root + "/faq"));
  assert(report.groups[0].clues.some((c) => c.time === "09:30"));
  assert.equal(report.groups[0].editions[0].start_time, "");
  assert.equal(JSON.parse(await readFile(join(directory, "report.json"), "utf8")).groups.length, 2);
  const clipped = await runStartTimeBatch(rows, {
    ...scope,
    directory,
    reader,
    limit: 1,
    concurrency: 1,
    maxPages: 1,
    depth: 0,
  });
  assert.equal(clipped.summary.uncheckedEditions, 3);
  assert.equal(clipped.groups[1].reason, "Outside this invocation’s event limit");
  const broken = await runStartTimeBatch([base], {
    ...scope,
    directory,
    reader: { stats: {}, read: async (url) => ({ url, status: 0, error: "HTTP 403" }) },
    concurrency: 1,
    maxPages: 2,
    depth: 1,
  });
  assert.equal(broken.groups[0].state, "inaccessible");
  const budget = await runStartTimeBatch([base], {
    ...scope,
    directory,
    reader: {
      stats: {},
      read: async (url) => ({ url, status: 0, error: "Budget exhausted", unchecked: true }),
    },
    concurrency: 1,
    maxPages: 2,
    depth: 1,
  });
  assert.equal(budget.groups[0].state, "unchecked");
  const decision = {
    id: 1,
    time: "09:30",
    reviewer: "synthetic-staff",
    explanation: "Reviewed 5K timetable on 25 October 2026.",
    scope: "First wave, adult 5K",
    authority: "organiser",
    editionMatched: true,
    conflictsResolved: true,
    timezone: "Europe/London",
    sourceUrl: pdf,
    textHash: digest(sourceText),
    evidenceExcerpt: "5K race start 09:30.",
  };
  const handoff = await prepareReviewedStarts(report, [decision], {
    cacheDirectory,
    currentRows: rows,
  });
  assert.equal(handoff.published, false);
  assert.equal(handoff.updates[0].patch.start_time, "09:30");
  assert(handoff.updates[0].patch.notes.startsWith("Preserve this"));
  assert.deepEqual(Object.keys(handoff.updates[0].patch), ["start_time", "notes"]);
  for (const change of [
    { time: "11:00" },
    { editionMatched: false },
    { conflictsResolved: false },
    { timezone: "Made/Up" },
    { reviewer: "" },
    { evidenceExcerpt: "invented text" },
    { authority: "timing-provider" },
    { authority: "authorised-entry" },
  ])
    await assert.rejects(() =>
      prepareReviewedStarts(report, [{ ...decision, ...change }], {
        cacheDirectory,
        currentRows: rows,
      }),
    );
  for (const change of [
    { start_time: "08:30" },
    { notes: "Concurrent update" },
    { event_date: "2026-10-26" },
    { distance_code: "Junior" },
  ])
    await assert.rejects(() =>
      prepareReviewedStarts(report, [decision], {
        cacheDirectory,
        currentRows: rows.map((r) => (r.id === 1 ? { ...r, ...change } : r)),
      }),
    );
  await assert.rejects(
    () =>
      prepareReviewedStarts(report, [decision, decision], { cacheDirectory, currentRows: rows }),
    /Duplicate/,
  );
  const malicious = structuredClone(report);
  malicious.groups[0].name = "<script>alert(1)</script>";
  assert(reviewHtml(malicious).includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert(!reviewHtml(malicious).includes("<script>alert(1)"));
  await assert.rejects(
    () => runCli(["--out", directory, "--input", "unused", "--from", "2026-02-30"]),
    /Dates/,
  );
  await assert.rejects(
    () => runCli(["--out", directory, "--input", "unused", "--concurrency", "0"]),
    /concurrency/,
  );
  console.log(
    "Start-time batch checks passed: priority/scope, shared-source reuse, bounded follow-up, incomplete states, source parsing, URL/DNS/robots guards, escaped report, reviewed evidence and stale-baseline protection.",
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
