import { getSql, dbSource } from "../db";
import { IS_RUNRECS_SITE } from "../site-scope";
import { anzRequestSchema, anzSaveSchema } from "./core";
import { fetchAnzCapture } from "./fetch.server";
import { anzTarget, saveAnzCapture } from "./store.server";
type Actor = { userId: string; staffEmail: string };
async function ready(actor: Actor, write = false) {
  if (!actor.userId || !actor.staffEmail || IS_RUNRECS_SITE || dbSource !== "neon")
    throw new Error("Use the live AthRecs staff tools.");
  if (write && process.env.VERCEL_ENV === "preview")
    throw new Error("ANZ imports cannot be saved from preview deployments.");
  const sql = await getSql();
  const [user] = await sql<{
    verified: boolean;
    email: string;
  }>`select "emailVerified" as verified,email from "user" where id=${actor.userId}`;
  if (!user?.verified || user.email.toLowerCase() !== actor.staffEmail.toLowerCase())
    throw new Error("Verified staff access required.");
  return sql;
}
export async function previewAnz(value: unknown, actor: Actor) {
  const input = anzRequestSchema.parse(value),
    sql = await ready(actor);
  const capture = await fetchAnzCapture(input.url),
    target = await anzTarget(sql, input.athleteId, capture);
  return {
    version: target.version,
    capture,
    athleteName: target.athlete.display_name,
    previousCount: target.previous?.performances.length ?? 0,
  };
}
export async function importAnz(value: unknown, actor: Actor) {
  const input = anzSaveSchema.parse(value),
    sql = await ready(actor, true);
  const capture = await fetchAnzCapture(input.url);
  return saveAnzCapture(sql, input.athleteId, capture, input.version, {
    userId: actor.userId,
    email: actor.staffEmail,
    note: "Staff reviewed the ANZ identity and named result columns against the public source before import.",
  });
}
