import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { getSql, type Sql } from "../db";
import { IS_RUNRECS_SITE } from "../site-scope";
import { draftSchema, resultIssues } from "./core";

const candidateSchema = draftSchema.omit({ index: true }).extend({
  key: z.string().regex(/^[a-z0-9-]{1,80}$/),
  hint: z.string().max(200).default(""),
  alternativeGroup: z.string().max(80).optional(),
});
type Candidate = z.infer<typeof candidateSchema>;
type Decision = "yes" | "no";
type Saved = { input_hash: string; response: Decision | null };
type Owner = { id: number; display_name: string; candidates: unknown };

async function ownedQueues(sql: Sql, userId: string, athleteId?: number) {
  if (IS_RUNRECS_SITE) return [];
  return sql.query<Owner>(
    `
    select a.id,a.display_name,a.profile_details#>'{sourceReview,ownerReviewCandidates}' as candidates
    from athlete_account_links l join athletes a on a.id=l.athlete_id
    join "user" u on u.id=l.user_id
    where l.user_id=$1 and l.status='active' and u."emailVerified"
      and jsonb_typeof(a.profile_details#>'{sourceReview,ownerReviewCandidates}')='array'
      and ($2::integer is null or a.id=$2)
    order by a.id ${athleteId === undefined ? "" : "for update of l,a"}`,
    [userId, athleteId ?? null],
  );
}

function candidates(queue: Owner) {
  const parsed = z.array(candidateSchema).max(250).parse(queue.candidates);
  if (new Set(parsed.map((row) => row.key)).size !== parsed.length)
    throw new Error("Duplicate candidate key.");
  return parsed;
}

function fingerprint(athleteId: number, row: Candidate) {
  // A corrected source row needs a fresh decision even when its label stays the same.
  return createHash("sha256")
    .update(JSON.stringify(["owner-race-review-v1", athleteId, row]))
    .digest("hex");
}

async function decisions(sql: Sql, userId: string, athleteId: number, rows: Candidate[]) {
  const saved = await sql<Saved>`
    select input_hash,entries#>>'{0,response}' as response from athlete_result_proposals
    where submitted_by=${userId} and athlete_id=${athleteId}
      and input_hash=any(${rows.map((row) => fingerprint(athleteId, row))}::text[])`;
  return new Map(saved.map((s) => [s.input_hash, s.response]));
}

export async function listOwnerRaceReviews(userId: string) {
  const sql = await getSql();
  const owners = await ownedQueues(sql, userId);
  return Promise.all(
    owners.map(async (owner) => {
      const rows = candidates(owner);
      const saved = await decisions(sql, userId, owner.id, rows);
      return {
        athleteId: owner.id,
        athleteName: owner.display_name,
        rows: rows.map((row) => ({
          key: row.key,
          race: row.race,
          date: row.date,
          time: row.time,
          bib: row.bib,
          hint: row.hint,
          alternativeGroup: row.alternativeGroup,
          version: fingerprint(owner.id, row),
          response: saved.get(fingerprint(owner.id, row)) ?? null,
        })),
      };
    }),
  );
}

export async function recordOwnerRaceAnswer(
  userId: string,
  input: {
    athleteId: number;
    key: string;
    version: string;
    response: Decision;
  },
) {
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const [owner] = await ownedQueues(tx, userId, input.athleteId);
    if (!owner)
      throw new Error("These matches are available after your profile claim is approved.");
    const rows = candidates(owner);
    const row = rows.find((r) => r.key === input.key);
    if (!row || input.version !== fingerprint(owner.id, row))
      throw new Error("This match has changed. Reload before answering.");
    const saved = await decisions(tx, userId, owner.id, rows);
    if (saved.get(input.version) === input.response) return { recorded: true };
    if (saved.has(input.version))
      throw new Error("This answer is already recorded. Contact support to correct it.");
    if (
      input.response === "yes" &&
      row.alternativeGroup &&
      rows.some(
        (r) =>
          r.alternativeGroup === row.alternativeGroup &&
          saved.get(fingerprint(owner.id, r)) === "yes",
      )
    )
      throw new Error("You can confirm only one of the alternative bibs for this race.");
    const { key, hint, alternativeGroup, ...fields } = row;
    const draft = { ...fields, index: 1 };
    if (resultIssues(draft).length) throw new Error("This source row needs staff review.");
    const entry = {
      ...draft,
      state: input.response === "yes" ? "pending" : "rejected",
      response: input.response,
      responseBy: userId,
      responseAt: new Date().toISOString(),
      responseNote: "Identity response recorded by the linked account.",
    };
    const id = randomUUID();
    await tx`insert into athlete_result_proposals(id,athlete_id,submitted_by,source_url,original_text,input_hash,entries)
      values(${id}::uuid,${owner.id},${userId},${row.sourceUrl},${JSON.stringify(row)},${input.version},${JSON.stringify([entry])}::jsonb)`;
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
      values(${userId},'athlete.review_response','athlete_workspace',${id},
      ${JSON.stringify({ athleteId: owner.id, key, response: input.response, hint, alternativeGroup })}::jsonb,
      'Owner responded to a private suggested race. A positive answer awaits staff review.')`;
    return { recorded: true };
  });
}
