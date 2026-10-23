import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  historySourceUrlSchema,
  sourceHistorySchema,
} from "../src/lib/athrecs/source-performance-history.ts";
import { adminHistoryInput } from "../src/lib/athlete-workspace/admin-history.ts";

const accepted = [
  "https://example.test/results.pdf",
  "http://enigmarunning.co.uk/results/synthetic.pdf",
  "http://www.enigmarunning.co.uk/results/synthetic.pdf",
];
const rejected = [
  "http://example.test/results.pdf",
  "http://enigmarunning.co.uk.evil.test/results.pdf",
  "http://enigmarunning.co.uk@evil.test/results.pdf",
  "http://evil.test@enigmarunning.co.uk/results.pdf",
  "http://enigmarunning.co.uk:8080/results.pdf",
  "http://enigmarunning.co.uk:80/results.pdf",
  "http://enigmarunning.co.uk./results.pdf",
  "http://127.0.0.1/results.pdf",
  "javascript:alert(1)",
  "file:///results.pdf",
  "data:text/plain,results",
  "ftp://enigmarunning.co.uk/results.pdf",
];
const performance = {
  year: 2020, date: "2020-02-01", sourceDate: "1 February 2020",
  ageGroup: "", discipline: "Marathon", performance: "4:01:02", wind: "",
  place: "", venue: "", meeting: "Synthetic legacy source race",
  sourceUrls: [accepted[1]], labels: [],
};
for (const url of accepted) assert.equal(historySourceUrlSchema.safeParse(url).success, true, url);
for (const url of rejected) assert.equal(historySourceUrlSchema.safeParse(url).success, false, url);
sourceHistorySchema.parse({
  provider: "Synthetic organiser", externalId: "synthetic-legacy-history",
  sourceUrl: accepted[1], capturedAt: "2026-10-23T00:00:00Z", complete: false,
  yearsExpected: [], yearsCaptured: [2020], performances: [performance],
});
adminHistoryInput.parse({
  athleteId: 1, requestId: "99999999-9999-4999-8999-999999999999",
  sourceUrl: accepted[1], performances: [performance],
  reason: "Synthetic review of an original legacy organiser result.",
  administratorApproval: true,
});

const db = new PGlite();
try {
  await db.exec("create table athletes(id integer primary key); insert into athletes values(1)");
  await db.exec(await readFile(new URL("../migrations/0035_athlete_source_histories.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(new URL("../migrations/0036_source_history_publication.sql", import.meta.url), "utf8"));
  const insert = (key, url) => db.query(`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,years_expected,years_captured,performances,published_at)
    values(1,'Synthetic organiser',$1,$2,now(),'{}','{2020}',$3::jsonb,now())`,
    [key, url, JSON.stringify([performance])]);
  await insert("existing", accepted[0]);
  const before = (await db.query("select * from athlete_source_histories where external_id='existing'")).rows;
  const migration = await readFile(new URL("../migrations/20261023_legacy_enigma_history_sources.sql", import.meta.url), "utf8");
  await db.exec(migration);
  await db.exec(migration);
  for (const [i, url] of accepted.entries()) await insert(`accepted-${i}`, url);
  for (const [i, url] of rejected.entries()) await assert.rejects(insert(`rejected-${i}`, url), undefined, url);
  assert.deepEqual((await db.query("select * from athlete_source_histories where external_id='existing'")).rows, before);
  const rows = (await db.query(`select provider,external_id as "externalId",source_url as "sourceUrl",
    captured_at::text as "capturedAt",complete,years_expected as "yearsExpected",
    years_captured as "yearsCaptured",performances from athlete_source_histories`)).rows;
  assert.equal(rows.length, accepted.length + 1);
  for (const row of rows) sourceHistorySchema.parse(row);
  console.log("Legacy history sources: accepted original Enigma evidence; rejected other HTTP hosts and unsafe schemes; migration replay and existing-history preservation passed.");
} finally {
  await db.close();
}
