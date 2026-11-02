import assert from "node:assert/strict";
import { createServer } from "vite";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
])
  process.env[key] = "";
process.env.VITE_SITE_BRAND = "athrecs";
const server = await createServer({ server: { middlewareMode: true } });
let database;
try {
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const { athleteBiographyReviews } = await server.ssrLoadModule(
    "/src/data/athlete-biography-reviews.ts",
  );
  const { readAthleteDirectoryPage } = await server.ssrLoadModule(
    "/src/lib/athrecs/athlete-directory-page.server.ts",
  );
  const biography = "A synthetic public biography for a runner.";
  athleteBiographyReviews.push({
    slug: "alias-review-example",
    paragraphs: [biography],
    alternateName: ["The Test Adventurer", "A. Example"],
  });
  const [{ id }] =
    await sql`insert into athletes(slug,display_name,profile_visibility,bio,profile_details)
    values('alias-review-example','Alex Example','public',${biography},'{"aliases":["Private Source Nickname"]}') returning id`;
  const find = (q, extra = {}) => readAthleteDirectoryPage(sql, { q, ...extra });
  assert.equal(
    (await find("Test Adventurer")).athletes.length,
    0,
    "An unaudited biography does not expose an alias",
  );
  await sql`insert into network_audit_log(action,entity_type,entity_id,after_value)
    values('athlete.biography_admin_published','athlete',${String(id)},${JSON.stringify({ athleteId: id, biography })}::jsonb)`;
  assert.deepEqual(
    (await find("test adventurer")).athletes.map((a) => a.id),
    [id],
  );
  assert.deepEqual(
    (await find("A. Example")).athletes.map((a) => a.id),
    [id],
  );
  assert.deepEqual(
    (await find("Alex Example")).athletes.map((a) => a.id),
    [id],
    "Existing name search remains available",
  );
  assert.equal(
    (await find("Private Source Nickname")).athletes.length,
    0,
    "Staff-only source aliases stay private",
  );
  assert.equal(
    (await find("Test Adventurer", { letter: "Z" })).athletes.length,
    0,
    "Normal filters still apply",
  );
  assert.equal(
    (await find("Test Adventurer", { page: 999 })).page,
    1,
    "Alias pagination redirects to the real last page",
  );
  await sql`update athletes set bio='Changed biography' where id=${id}`;
  assert.equal(
    (await find("Test Adventurer")).athletes.length,
    0,
    "Changed text immediately withdraws old aliases",
  );
  await sql`update athletes set bio=${biography},profile_visibility='private' where id=${id}`;
  assert.equal((await find("Test Adventurer")).athletes.length, 0, "Private profiles are excluded");
  await sql`update athletes set profile_visibility='public' where id=${id}`;
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('alias-owner','Synthetic owner','alias-owner@example.test',true,now(),now())`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(${id},'alias-owner','alias-owner@example.test','active')`;
  assert.equal(
    (await find("Test Adventurer")).athletes.length,
    0,
    "Claiming a profile removes the staff biography alias path",
  );
  console.log(
    "PASS: approved public aliases are searchable; exact-text withdrawal, private profiles, owner claims, source alias privacy, filters and pagination are preserved.",
  );
} finally {
  await database?.close();
  await server.close();
}
