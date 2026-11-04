import { z } from "zod";

const time = z.string().regex(/^\d{1,2}:[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/);
const position = z.number().int().positive().nullable();
const publicRow = z.object({
  id: z.string().min(1),
  bib: z.string().min(1),
  name: z.string().min(1).max(150),
  gender: z.enum(["men", "women", "other"]),
  country: z.string().max(80).nullable(),
  club: z.string().max(160).nullable(),
  category: z.string().min(1).max(50).nullable(),
  overallPlace: position,
  genderPlace: position,
  categoryPlace: position,
  gunTime: time.nullable(),
  chipTime: time.nullable(),
  status: z.literal("finished"),
});
const berlinResultSchema = publicRow
  .extend({
    verified: z.literal(true),
    publicationApproved: z.literal(true),
    sourceUrl: z.url(),
    sourceLocator: z.string().min(1),
    checkedAt: z.iso.datetime({ offset: true }),
  })
  .refine((row) => row.gunTime || row.chipTime, "A finish time is required")
  .refine((row) => row.category || row.categoryPlace === null, "Category rank needs a category");
export type BerlinResult = z.infer<typeof publicRow>;
export const berlinSnapshotSchema = z
  .object({
    event: z.literal("Berlin Marathon"),
    eventDate: z.literal("2026-09-27"),
    distanceKm: z.literal(42.195),
    status: z.enum(["awaiting", "provisional", "official"]),
    coverage: z.enum(["none", "highlights", "partial", "complete"]),
    updatedAt: z.iso.datetime({ offset: true }).nullable(),
    results: z.array(berlinResultSchema),
  })
  .superRefine((data, ctx) => {
    const bibs = new Set<string>();
    const ids = new Set<string>();
    for (const row of data.results) {
      if (bibs.has(row.bib) || ids.has(row.id))
        ctx.addIssue({ code: "custom", message: "Duplicate result identity" });
      bibs.add(row.bib);
      ids.add(row.id);
    }
    if ((data.status === "awaiting" || data.coverage === "none") && data.results.length)
      ctx.addIssue({ code: "custom", message: "Awaiting/none must not contain results" });
    if (data.results.length && !data.updatedAt)
      ctx.addIssue({ code: "custom", message: "Published results need an update timestamp" });
  });
export function publicBerlinSnapshot(raw: unknown) {
  const snapshot = berlinSnapshotSchema.parse(raw);
  return { ...snapshot, results: snapshot.results.map((row) => publicRow.parse(row)) };
}
export type BerlinSnapshot = ReturnType<typeof publicBerlinSnapshot>;
