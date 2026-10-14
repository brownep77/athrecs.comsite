import { z } from "zod";
import { scopeSchema } from "./core.ts";

const sourceLink = z
  .string()
  .url()
  .max(1500)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  }, "Use a public HTTPS source link.");
export const collectionConfigSchema = z
  .object({
    aliases: z.array(z.string().trim().min(3).max(120)).max(20),
    sports: z
      .array(z.enum(["Running", "Athletics", "Triathlon", "Cycling", "Swimming"]))
      .min(1)
      .max(5),
    discover: z.boolean().default(true),
    urls: z.array(sourceLink).max(100).default([]),
    researchSources: z.array(sourceLink).max(50).default([]),
    researchBrief: z.string().trim().max(3000).default(""),
    historyFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    intervalHours: z.number().int().min(1).max(168).default(24),
    recentDays: z.number().int().min(7).max(180).default(45),
    publishApproved: z.boolean().default(true),
  })
  .superRefine((config, ctx) => {
    const result = scopeSchema.safeParse({
      clubId: 1,
      aliases: config.aliases,
      dateFrom: config.historyFrom,
      dateTo: new Date().toISOString().slice(0, 10),
      discover: config.discover,
      urls: config.urls.length ? config.urls : config.researchSources,
    });
    if (!result.success)
      ctx.addIssue({
        code: "custom",
        message:
          "Choose a valid historical start within eleven calendar years and at least one collection source.",
      });
  });
export type CollectionConfig = z.infer<typeof collectionConfigSchema>;
export const saveCollectionSchema = z.object({
  clubId: z.number().int().positive(),
  revision: z.number().int().min(0),
  enabled: z.boolean(),
  config: collectionConfigSchema,
});
export type SaveCollection = z.infer<typeof saveCollectionSchema>;
export function collectionScope(
  clubId: number,
  config: CollectionConfig,
  first: boolean,
  now = new Date(),
) {
  const recent = new Date(now.getTime() - config.recentDays * 86400000).toISOString().slice(0, 10);
  return scopeSchema.parse({
    clubId,
    aliases: config.aliases,
    dateFrom: first ? config.historyFrom : [config.historyFrom, recent].sort().at(-1),
    dateTo: now.toISOString().slice(0, 10),
    discover: config.discover,
    urls: [
      ...new Set([
        ...config.urls,
        ...(!config.discover && !config.urls.length ? config.researchSources : []),
      ]),
    ],
  });
}

// Club IDs are resolved from real slugs at setup; these are collection preferences,
// never evidence that an athlete belongs to a club or completed a race.
export const pilotClubs = [
  {
    slug: "10ironwomen",
    aliases: ["10Ironwomen", "10 Iron Women"],
    sports: ["Triathlon", "Running", "Swimming"],
    researchSources: [
      "https://www.10ironwomen.com/",
      "https://www.ironman.com/",
      "https://utmb.world/",
    ],
    researchBrief:
      "Prioritise IRONMAN and 70.3 editions, UTMB trail results and organiser timing sheets. Use stable runner IDs and dated club evidence. Keep full-distance triathlon, 70.3 and running legs separate. Do not treat original founders as the entire membership.",
  },
  {
    slug: "wymondham-ac",
    aliases: ["Wymondham AC", "Wymondham Athletics Club"],
    sports: ["Running", "Athletics", "Triathlon"],
    researchSources: [],
    researchBrief:
      "Prioritise Norfolk road and cross-country results, then triathlon results including Norwich Triathlon. Review initials and name changes; retain historical club associations.",
  },
  {
    slug: "norwich-road-runners",
    aliases: ["Norwich Road Runners"],
    sports: ["Running"],
    researchSources: [],
    researchBrief:
      "Prioritise Norfolk road races and Run Norwich, then marathons and trail races. Confirm exact club labels and distinguish same-name athletes.",
  },
  {
    slug: "norfolk-gazelles",
    aliases: ["Norfolk Gazelles", "Norfolk Gazelles AC"],
    sports: ["Running", "Athletics"],
    researchSources: [],
    researchBrief:
      "Prioritise Norfolk road and cross-country results. Preserve source precision, category and nationality where supplied.",
  },
  {
    slug: "city-of-norwich-ac",
    aliases: ["City of Norwich AC", "City of Norwich Athletics Club", "CONAC"],
    sports: ["Athletics", "Running"],
    researchSources: [],
    researchBrief:
      "Cover road, cross-country and track and field. Preserve event, round, wind and legal/assisted distinctions. Avoid merging different disciplines or athletes with similar names.",
  },
  {
    slug: "bure-valley-harriers",
    aliases: ["Bure Valley Harriers"],
    sports: ["Running"],
    researchSources: [],
    researchBrief:
      "Prioritise Norfolk road races and local timing archives, then trail and marathon results. Check dated club evidence and previously reviewed matches before creating profiles.",
  },
] as const;
