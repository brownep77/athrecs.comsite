import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
try {
  await db.exec(`create table events(id int,sport text,name text);
 create table editions(id int,event_id int,event_date date,distance_code text,notes text,start_time text,status text);
 create table network_audit_log(action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb);
 insert into events values (1,'Parkrun','Example junior parkrun'),(2,'Running','Example junior run');
 insert into editions select n,case when n=3 then 2 else 1 end,
 case when n=2 then '2026-10-19'::date else '2026-10-18'::date end,'2K',
 'Weekly junior parkrun 2K — '||chr(1)||' 09:30. Source note preserved.','09:30','Open'
 from generate_series(1,3)n;`);
  const before = (await db.query("select * from editions order by id")).rows;
  const migration = await readFile(
    new URL("../migrations/20261013_fixture_note_repair.sql", import.meta.url),
    "utf8",
  );
  await db.exec(migration);
  const after = (await db.query("select * from editions order by id")).rows;
  assert.deepEqual(after, [
    { ...before[0], notes: before[0].notes.replace("\u0001", "Sunday") },
    before[1],
    before[2],
  ]);
  const audit = (await db.query("select * from network_audit_log")).rows;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].before_value.notes, before[0].notes);
  await db.exec(migration);
  assert.equal(
    (await db.query("select count(*)::int n from network_audit_log")).rows[0].n,
    1,
    "Idempotent note repair",
  );
  console.log(
    "PASS: exact note repair, original provenance, unchanged dates/status/times, exclusions and rerun safety.",
  );
} finally {
  await db.close();
}
