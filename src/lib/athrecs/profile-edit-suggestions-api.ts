import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { getAthleteBySlug } from "./api";
import { getPublishedSharedProfile } from "./athlete-profile-share-api";

const inputSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(160),
  suggestion: z.string().trim().min(10).max(2000),
  evidenceUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .url()
        .max(2000)
        .refine((url) => /^https?:\/\//.test(url)),
    ])
    .default(""),
});

export const submitProfileEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: z.input<typeof inputSchema>) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const shared = await getPublishedSharedProfile({ data: { slug: data.slug } });
    const source = shared ? null : await getAthleteBySlug({ data: data.slug });
    if (!shared && !source) throw new Error("This public profile is no longer available.");
    const slug = shared?.slug ?? source!.athlete.slug;
    const sql = await getSql();
    return sql.transaction(async (tx) => {
      // Lock the submitting account to make the rate limit safe under concurrent requests.
      await tx`select id from "user" where id=${context.userId} for update`;
      const [count] = await tx<{ count: number }>`select count(*)::int as count
        from athlete_profile_edit_suggestions where user_id=${context.userId}
        and created_at > now() - interval '1 hour'`;
      if (count.count >= 5)
        throw new Error("You have submitted five edits this hour. Please try again later.");
      const [row] = await tx<{ id: number }>`insert into athlete_profile_edit_suggestions
        (user_id, profile_slug, suggestion, evidence_url)
        values (${context.userId}, ${slug}, ${data.suggestion}, ${data.evidenceUrl}) returning id`;
      return { id: row.id };
    });
  });

export const getProfileEdits = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    return sql<{
      id: number;
      profile_slug: string;
      suggestion: string;
      evidence_url: string;
      created_at: string;
    }>`
      select id, profile_slug, suggestion, evidence_url, created_at::text
      from athlete_profile_edit_suggestions where status='pending'
      order by created_at, id limit 100`;
  });

export const reviewProfileEdit = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { id: number; status: "reviewed" | "dismissed" }) =>
    z
      .object({
        id: z.number().int().positive(),
        status: z.enum(["reviewed", "dismissed"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    await sql`update athlete_profile_edit_suggestions set status=${data.status},
      reviewed_at=now(), reviewed_by=${context.userId} where id=${data.id} and status='pending'`;
    return { success: true };
  });
