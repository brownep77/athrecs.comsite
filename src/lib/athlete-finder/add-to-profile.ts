import { z } from "zod";
import {
  ARCHIVE_FIELDS,
  positiveId,
  type ArchiveRow,
  type ColumnMapping,
} from "../results-archive/core";
import type { FinderRow } from "./core";

export const finderProfileSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("archive"), entryId: positiveId }).strict(),
  z
    .object({
      kind: z.literal("capture"),
      captureId: z.string().regex(/^[1-9][0-9]{0,17}$/),
      ordinal: positiveId,
    })
    .strict(),
]);
export type FinderProfileSource = z.infer<typeof finderProfileSourceSchema>;
export const finderProfilePreviewSchema = z
  .object({
    source: finderProfileSourceSchema,
    athleteId: positiveId.optional(),
    editionId: positiveId.optional(),
    mapping: z.partialRecord(z.enum(ARCHIVE_FIELDS), z.string().min(1).max(160)).optional(),
  })
  .strict();
export const finderProfileSaveSchema = finderProfilePreviewSchema.extend({
  athleteId: positiveId,
  version: z.string().regex(/^[a-f0-9]{64}$/),
  requestId: z.string().uuid(),
  note: z.string().trim().min(12).max(2000),
  sourceAndIdentityChecked: z.literal(true),
  publicationConfirmed: z.literal(true),
});
export const finderProfileLookupSchema = z
  .object({
    kind: z.enum(["athlete", "edition"]),
    q: z.string().trim().min(2).max(160),
  })
  .strict();
export type FinderProfilePreviewInput = z.infer<typeof finderProfilePreviewSchema>;
export type FinderProfileSaveInput = z.infer<typeof finderProfileSaveSchema>;
export type FinderProfileOption = { id: number; name: string; detail: string; slug: string | null };
export type FinderProfilePreview = {
  version: string;
  row: ArchiveRow | null;
  sourceName: string;
  sourceUrl: string;
  original: Record<string, string>;
  headers: string[];
  mapping: ColumnMapping;
  raceName: string;
  raceDate: string;
  distance: string;
  edition: { id: number; name: string; date: string; distance: string } | null;
  athlete: FinderProfileOption | null;
  visibility: "public" | "private";
  issues: string[];
  existing: { resultId: number; athleteId: number; name: string; slug: string } | null;
};
export type FinderProfileReceipt = {
  resultId: number;
  athleteId: number;
  slug: string;
  name: string;
  visibility: string;
  replay: boolean;
};

export function finderProfileSource(row: FinderRow): FinderProfileSource | null {
  if (row.kind === "archive" && row.archiveEntryId)
    return { kind: "archive", entryId: row.archiveEntryId };
  if (row.kind === "capture" && row.captureId && row.captureOrdinal)
    return { kind: "capture", captureId: row.captureId, ordinal: row.captureOrdinal };
  return null;
}

export function finderTime(seconds: number | null): string {
  if (seconds === null) return "Not supplied";
  const hours = Math.floor(seconds / 3600),
    minutes = Math.floor((seconds % 3600) / 60);
  const tail = (Math.round((seconds % 60) * 1000000) / 1000000).toString().padStart(2, "0");
  return `${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${tail.split(".")[0].padStart(2, "0")}${tail.includes(".") ? `.${tail.split(".")[1]}` : ""}`;
}
