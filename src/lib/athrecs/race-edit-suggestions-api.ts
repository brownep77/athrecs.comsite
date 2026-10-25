import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { eventByPublicSlug } from "./event-slug.server";

const suggestionSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  suggestion: z.string().trim().min(10).max(2000),
  evidenceUrl: z
    .string()
    .trim()
    .max(2000)
    .default("")
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        return false;
      }
    }, "Use a public http or https supporting link."),
});

export const submitRaceEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: z.input<typeof suggestionSchema>) => suggestionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const [race] = (await eventByPublicSlug(sql, data.slug)) as Array<{
      id: number;
      slug: string;
      name: string;
    }>;
    if (!race) throw new Error("This race page is no longer available.");
    return sql.transaction(async (tx) => {
      await tx`select id from "user" where id=${context.userId} for update`;
      const [count] = await tx<{ count: number }>`select count(*)::int as count
        from race_edit_suggestions where user_id=${context.userId}
        and created_at > now() - interval '1 hour'`;
      if (count.count >= 5)
        throw new Error("You have submitted five race edits this hour. Please try again later.");
      const [row] = await tx<{ id: number }>`insert into race_edit_suggestions
        (user_id, event_id, race_slug, race_name, suggestion, evidence_url)
        values (${context.userId}, ${race.id}, ${race.slug}, ${race.name},
          ${data.suggestion}, ${data.evidenceUrl}) returning id`;
      return { id: row.id };
    });
  });

export const getRaceEdits = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { page?: number } = {}) =>
    z.object({ page: z.number().int().min(0).max(100000).default(0) }).parse(input),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [items, counts] = await Promise.all([
      sql<{
        id: number;
        event_id: number;
        race_slug: string;
        race_name: string;
        suggestion: string;
        evidence_url: string;
        created_at: string;
      }>`
        select id, event_id, race_slug, race_name, suggestion, evidence_url, created_at::text
        from race_edit_suggestions where status='pending'
        order by created_at, id limit 50 offset ${data.page * 50}`,
      sql<{
        total: number;
      }>`select count(*)::int as total from race_edit_suggestions where status='pending'`,
    ]);
    return { items, total: counts[0].total, page: data.page };
  });

export const reviewRaceEdit = createServerFn({ method: "POST" })
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
    const sql = await getSql();
    const rows = await sql`update race_edit_suggestions set status=${data.status},
      reviewed_at=now(), reviewed_by=${context.userId}
      where id=${data.id} and status='pending' returning id`;
    if (!rows.length)
      throw new Error("This suggestion has already been handled. Refresh the queue.");
    return { success: true };
  });
