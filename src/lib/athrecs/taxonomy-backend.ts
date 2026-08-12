import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requirePlatformRole } from "./access.server";
import { slugify } from "./multisport.types";
import { withSqlTransaction } from "./transaction.server";
import { writeAudit } from "./workflow.server";

const taxonomyRoles = ["super_admin", "admin", "data_steward"] as const;

const sportSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().trim().min(2).max(150),
  category: z
    .enum(["sport", "multi_sport", "para_sport", "mind_sport", "esport", "other"])
    .default("sport"),
  aliases: z.array(z.string().trim().min(1).max(150)).max(100).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const disciplineSchema = z.object({
  sportId: z.number().int().positive(),
  code: z.string().trim().optional(),
  name: z.string().trim().min(1).max(160),
  participantKind: z
    .enum(["individual", "team", "pair", "relay", "crew", "mixed"])
    .default("individual"),
  resultModel: z
    .enum(["time", "score", "distance", "height", "points", "placement", "win_loss", "multi_metric"])
    .default("multi_metric"),
  defaultUnit: z.string().trim().max(40).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const surfaceSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80).default("other"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const dataSchemaSchema = z.object({
  sportId: z.number().int().positive(),
  disciplineId: z.number().int().positive().optional(),
  scope: z.enum(["event", "occurrence", "competition", "entry", "result", "athlete"]),
  schema: z.record(z.string(), z.unknown()),
  publish: z.boolean().default(false),
});

export const createSportTaxonomy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => sportSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, taxonomyRoles);
    return withSqlTransaction(async (sql) => {
      const code = slugify(data.code || data.name);
      if (!code) throw new Error("Sport needs a usable code");
      const rows = await sql<{ id: number }>`
        insert into sports (code, name, category, active, metadata, updated_at)
        values (
          ${code}, ${data.name}, ${data.category}, ${true},
          ${JSON.stringify(data.metadata)}::jsonb, now()
        )
        on conflict (code) do update set
          name = excluded.name,
          category = excluded.category,
          active = true,
          metadata = sports.metadata || excluded.metadata,
          updated_at = now()
        returning id
      `;
      if (!rows[0]) throw new Error("Could not save the sport");
      for (const rawAlias of [code, ...data.aliases]) {
        const alias = rawAlias.trim().toLowerCase();
        if (!alias) continue;
        await sql`
          insert into sport_aliases (alias, sport_id, source)
          values (${alias}, ${rows[0].id}, ${"athrecs_admin"})
          on conflict (alias) do update set
            sport_id = excluded.sport_id,
            source = excluded.source
        `;
      }
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "taxonomy.sport_saved",
        entityType: "sport",
        entityId: rows[0].id,
        afterData: { ...data, code },
      });
      return { sportId: rows[0].id, code, saved: true };
    });
  });

export const createDisciplineTaxonomy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => disciplineSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, taxonomyRoles);
    return withSqlTransaction(async (sql) => {
      const sport = await sql<{ id: number }>`
        select id from sports where id = ${data.sportId} and active = true limit 1
      `;
      if (!sport[0]) throw new Error("Sport not found");
      const code = slugify(data.code || data.name);
      const rows = await sql<{ id: number }>`
        insert into disciplines (
          sport_id, code, name, participant_kind, result_model,
          default_unit, active, metadata, updated_at
        ) values (
          ${data.sportId}, ${code}, ${data.name}, ${data.participantKind},
          ${data.resultModel}, ${data.defaultUnit || null}, ${true},
          ${JSON.stringify(data.metadata)}::jsonb, now()
        )
        on conflict (sport_id, code) do update set
          name = excluded.name,
          participant_kind = excluded.participant_kind,
          result_model = excluded.result_model,
          default_unit = excluded.default_unit,
          active = true,
          metadata = disciplines.metadata || excluded.metadata,
          updated_at = now()
        returning id
      `;
      if (!rows[0]) throw new Error("Could not save the discipline");
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "taxonomy.discipline_saved",
        entityType: "discipline",
        entityId: rows[0].id,
        afterData: { ...data, code },
      });
      return { disciplineId: rows[0].id, code, saved: true };
    });
  });

export const createSurfaceTaxonomy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => surfaceSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, taxonomyRoles);
    return withSqlTransaction(async (sql) => {
      const code = slugify(data.code || data.name);
      const rows = await sql<{ id: number }>`
        insert into surfaces (code, name, category, active, metadata)
        values (
          ${code}, ${data.name}, ${data.category}, ${true},
          ${JSON.stringify(data.metadata)}::jsonb
        )
        on conflict (code) do update set
          name = excluded.name,
          category = excluded.category,
          active = true,
          metadata = surfaces.metadata || excluded.metadata
        returning id
      `;
      if (!rows[0]) throw new Error("Could not save the surface");
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "taxonomy.surface_saved",
        entityType: "surface",
        entityId: rows[0].id,
        afterData: { ...data, code },
      });
      return { surfaceId: rows[0].id, code, saved: true };
    });
  });

export const publishSportDataSchema = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => dataSchemaSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, taxonomyRoles);
    return withSqlTransaction(async (sql) => {
      const versions = await sql<{ version: number }>`
        select coalesce(max(version), 0)::int + 1 as version
        from sport_data_schemas
        where sport_id = ${data.sportId}
          and discipline_id is not distinct from ${data.disciplineId ?? null}
          and scope = ${data.scope}
      `;
      const version = versions[0]?.version ?? 1;
      if (data.publish) {
        await sql`
          update sport_data_schemas set status = 'retired'
          where sport_id = ${data.sportId}
            and discipline_id is not distinct from ${data.disciplineId ?? null}
            and scope = ${data.scope}
            and status = 'active'
        `;
      }
      const rows = await sql<{ id: number }>`
        insert into sport_data_schemas (
          sport_id, discipline_id, scope, version, schema_json, status,
          created_by_user_id, published_at
        ) values (
          ${data.sportId}, ${data.disciplineId ?? null}, ${data.scope},
          ${version}, ${JSON.stringify(data.schema)}::jsonb,
          ${data.publish ? "active" : "draft"}, ${context.userId},
          ${data.publish ? new Date().toISOString() : null}::timestamptz
        ) returning id
      `;
      if (!rows[0]) throw new Error("Could not save the sport data schema");
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: data.publish ? "taxonomy.schema_published" : "taxonomy.schema_drafted",
        entityType: "sport_data_schema",
        entityId: rows[0].id,
        afterData: { ...data, version },
      });
      return { schemaId: rows[0].id, version, status: data.publish ? "active" : "draft" };
    });
  });
