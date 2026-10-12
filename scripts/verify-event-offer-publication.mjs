import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishEventOfferCorrections } from "./lib/event-offer-corrections.mjs";
import { sportsEventJsonLd } from "../src/lib/athrecs/seo.ts";

const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { pg, sql } = await bulkFixture();
try {
  const notesMigration = await readFile(
    new URL("../migrations/20261012_entry_option_evidence_notes.sql", import.meta.url),
    "utf8",
  );
  await pg.exec(notesMigration);
  await pg.exec(notesMigration); // Existing seeded databases and repeat runs are safe.
  await sql.query("alter table editions add column if not exists start_time text");
  await sql.query(
    `insert into events(id,slug,name,sport) values (901001,'synthetic-offer-race','Synthetic Offer Race','Running')`,
  );
  await sql.query(`insert into editions(id,event_id,event_date,distance_code,distance_km,status,notes)
    values (901001,901001,'2027-04-25','Marathon',42.195,'Open','Preserve edition notes')`);
  for (const [provider, status, verified, checked] of [
    ["synthetic-sold-out", "waitlist", true, "2026-08-01"],
    ["synthetic-opening", "open", true, "2026-08-01"],
    ["synthetic-newer", "open", true, "2026-10-13"],
    ["synthetic-unverified", "open", false, "2026-08-01"],
  ]) {
    await sql.query(
      `insert into edition_entry_options(edition_id,provider_code,provider_name,entry_url,entry_type,status,price_amount,price_currency,checked_at,source_url,is_verified,notes)
      values (901001,$1,$1,'https://example.org/entry','official',$2,25,'GBP',$3,'https://example.org/source',$4,'Original evidence')`,
      [provider, status, checked, verified],
    );
  }
  const correction = (providerCode, previousStatus, patch) => ({
    key: "synthetic-offer-race|2027-04-25|Marathon",
    providerCode,
    previousStatus,
    sourceUrl: "https://example.org/source",
    patch: { checkedAt: "2026-10-12", notes: "New source evidence", ...patch },
  });
  const corrections = [
    correction("synthetic-sold-out", "waitlist", { status: "sold_out" }),
    correction("synthetic-opening", "open", { opensAt: "2026-01-03" }),
  ];
  const originalOptions = await sql.query(
    "select * from edition_entry_options where edition_id=901001 order by provider_code",
  );
  await publishEventOfferCorrections(sql, publishing, corrections);
  const options = await sql.query(
    "select * from edition_entry_options where edition_id=901001 order by provider_code",
  );
  assert.equal(options.length, 4, "Unrelated entry options must survive");
  assert.equal(options.find((o) => o.provider_code === "synthetic-sold-out").status, "sold_out");
  const opened = options.find((o) => o.provider_code === "synthetic-opening");
  assert.equal(opened.opens_at, "2026-01-03");
  assert.equal(opened.notes, "Original evidence", "Existing option evidence is retained");
  assert.equal(Number(opened.price_amount), 25, "Never rewrite the price");
  assert.match(
    (await sql.query("select notes from editions where id=901001"))[0].notes,
    /Preserve edition notes\nNew source evidence/,
  );
  const changes = await sql.query(
    "select before_json,after_json from catalogue_change_log order by id",
  );
  assert.equal(changes.length, 2, "Both corrections have reversible snapshots");
  assert.equal(
    changes[0].before_json.entryOptions.find((o) => o.provider_code === "synthetic-sold-out")
      .status,
    "waitlist",
  );
  assert.equal(
    (
      await sql.query(
        "select count(*)::int as n from catalogue_import_batches where status='published'",
      )
    )[0].n,
    2,
  );
  const item = sportsEventJsonLd(
    {
      name: "Synthetic Offer Race",
      slug: "synthetic-offer-race",
      startDate: "2027-04-25",
      entryOptions: options,
    },
    new Date("2026-10-12T17:00:00Z"),
  );
  assert.equal(
    item.offers.find((o) => o.validFrom).validFrom,
    "2026-01-03",
    "Stored date survives into generated JSON-LD",
  );
  assert(item.offers.some((o) => o.availability === "https://schema.org/SoldOut"));
  await publishEventOfferCorrections(sql, publishing, corrections);
  assert.equal(
    (await sql.query("select count(*)::int as n from catalogue_revisions"))[0].n,
    2,
    "A repeat deployment is a no-op",
  );
  await publishEventOfferCorrections(sql, publishing, [
    correction("synthetic-newer", "open", { status: "sold_out" }),
  ]);
  assert.equal(
    (
      await sql.query(
        "select status from edition_entry_options where provider_code='synthetic-newer'",
      )
    )[0].status,
    "open",
  );
  await assert.rejects(
    publishEventOfferCorrections(sql, publishing, [
      correction("synthetic-unverified", "open", { status: "sold_out" }),
    ]),
    /verification changed/,
  );
  await assert.rejects(
    publishEventOfferCorrections(
      sql,
      { ...publishing, validateCatalogueBatch: async () => ({ status: "invalid" }) },
      [correction("synthetic-newer", "open", { checkedAt: "2026-10-14", status: "sold_out" })],
    ),
    /Correction validation failed/,
  );
  assert.equal(
    (await sql.query("select count(*)::int as n from catalogue_import_batches"))[0].n,
    2,
    "A validation failure rolls back staging together with the correction",
  );
  await assert.rejects(
    publishing.rollbackCatalogueRevision(1, "fixture@example.org", sql),
    /Only the latest/,
  );
  await sql.query(
    "update edition_entry_options set notes='Later evidence' where provider_code='synthetic-opening'",
  );
  await assert.rejects(
    publishing.rollbackCatalogueRevision(2, "fixture@example.org", sql),
    /changed after publication/,
  );
  await sql.query(
    "update edition_entry_options set notes='Original evidence' where provider_code='synthetic-opening'",
  );
  await publishing.rollbackCatalogueRevision(2, "fixture@example.org", sql);
  await publishing.rollbackCatalogueRevision(1, "fixture@example.org", sql);
  assert.deepEqual(
    await sql.query(
      "select * from edition_entry_options where edition_id=901001 order by provider_code",
    ),
    originalOptions,
    "Real rollback restores every original option field, including source notes",
  );
  assert.equal(
    (await sql.query("select notes from editions where id=901001"))[0].notes,
    "Preserve edition notes",
  );
  await publishEventOfferCorrections(sql, publishing, corrections);
  assert.equal(
    (await sql.query("select count(*)::int as n from catalogue_revisions"))[0].n,
    2,
    "A deployment never replays a rolled-back correction",
  );
  console.log(
    "PASS: atomic staged publication, real rollback with full evidence, stored dates, idempotency, and newer/unverified/concurrent-change safeguards.",
  );
} finally {
  await pg.close();
}
