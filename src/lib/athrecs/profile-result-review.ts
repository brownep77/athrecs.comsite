import { z } from "zod";
import { draftSchema, httpsUrl } from "../athlete-workspace/core";

export const profileResultReviewInput = z
  .object({
    requestId: z.string().uuid(),
    snapshot: z.string().regex(/^[a-f0-9]{64}$/),
    includedKeys: z.array(z.string().min(1).max(100)).max(20000),
    additions: z
      .array(
        draftSchema.extend({
          race: z.string().trim().min(3).max(200),
          sourceUrl: httpsUrl,
        }),
      )
      .max(250),
  })
  .strict()
  .refine(
    (value) => new Set(value.includedKeys).size === value.includedKeys.length,
    "Each result may be selected only once.",
  );
export type ProfileResultReviewInput = z.infer<typeof profileResultReviewInput>;
export type ProfileReviewRow = {
  key: string;
  race: string;
  date: string;
  distance: string;
  performance: string;
  alternatePerformances?: string[];
  chip: number | null;
  gun: number | null;
  status: string;
  bib: string | null;
  club: string | null;
  category: string | null;
  age: string | null;
  place: number | null;
  excluded: boolean;
};
export type ProfileResultReview = {
  snapshot: string;
  rows: ProfileReviewRow[];
  lastConfirmedAt: string | null;
};
