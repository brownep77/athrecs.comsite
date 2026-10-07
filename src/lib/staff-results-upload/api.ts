import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
const uploadSchema = z.object({
  filename: z.string().min(1).max(240), content: z.string().min(1).max(2800000),
  eventName: z.string().trim().min(3).max(200), date: z.string().length(10),
  distance: z.string().trim().min(1).max(40), distanceKm: z.number().positive().max(1000),
  sourceUrl: z.string().url().max(300), timingBasis: z.enum(["chip", "gun", "unspecified"]),
}).strict();
/** Log only a correlation identifier and a bounded failure category, never
 * uploads, participant names, staff identities, SQL, credentials or raw errors. */
function logImportFailure(error: unknown, stage: "check" | "commit", requestId?: string) {
  const rawCode = error && typeof error === "object" && "code" in error ? error.code : null;
  const message = error instanceof Error ? error.message : "";
  const code = typeof rawCode === "string" && /^[0-9A-Z]{5}$/.test(rawCode) ? rawCode
    : /source or athlete matches changed/i.test(message) ? "STALE_REVIEW"
    : /already.*imported|already.*result|already in use/i.test(message) ? "EXISTING_RESULT"
    : /protected|ownership|visibility/i.test(message) ? "PROTECTED_IDENTITY"
    : /source|race|distance/i.test(message) ? "SOURCE_REVIEW"
    : "IMPORT_REJECTED";
  console.error("[staff-results-upload]", JSON.stringify({ stage, requestId, code }));
}
/** Checking transports the file but does not mutate athlete or result records. */
export const checkRaceUpload = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof uploadSchema>) => uploadSchema.parse(input))
  .handler(async ({ data }) => {
    try { return await (await import("./service.server")).previewUpload(data); }
    catch (error) { logImportFailure(error, "check"); throw error; }
  });
const commitSchema = z.object({
  upload: uploadSchema, reviewHash: z.string().regex(/^[a-f0-9]{64}$/), requestId: z.string().uuid(),
  rightsConfirmed: z.literal(true), identitiesConfirmed: z.literal(true),
  confirmation: z.literal("IMPORT SELECTED RESULTS"),
  decisions: z.array(z.object({
    index: z.number().int().positive(), mode: z.enum(["new", "link"]),
    athleteId: z.number().int().positive().optional(), identityNote: z.string().trim().min(12).max(1000),
  }).strict()).min(1).max(5000),
}).strict();
/** Normal staff action, never invoked on page load, in a cron job or during deployment. */
export const importCheckedRaceUpload = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof commitSchema>) => commitSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      return await (await import("./commit.server")).commitUpload(data, {
        userId: context.userId, staffEmail: context.staffEmail,
      });
    } catch (error) { logImportFailure(error, "commit", data.requestId); throw error; }
  });
export const downloadResultsUploadTemplate = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const ExcelJS = await import("exceljs");
    const { Workbook } = ExcelJS.default ?? ExcelJS;
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet("Results", { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = [
      ["Position",12],["Forename",22],["Surname",24],["Gender",12],["Gender Pos",14],
      ["Category",16],["Cat Pos",12],["Club",36],["Tag",14],["Chip Time",20],["Gun Time",20],
    ].map(([header,width]) => ({ header: String(header), width: Number(width) }));
    sheet.getRow(1).height = 28;
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
    });
    sheet.getColumn(9).numFmt = "@";
    sheet.getColumn(10).numFmt = "@";
    sheet.getColumn(11).numFmt = "@";
    sheet.getCell("J1").note = "Enter HH:MM:SS or HH:MM:SS.s as text. Leave unknown times empty. Do not put chip times in the gun-time column.";
    sheet.getCell("I1").note = "Race bib/tag from the timing provider. This is not an athlete's permanent identifier.";
    sheet.autoFilter = "A1:K1";
    return { filename: "AthRecs_Results_Upload_Template.xlsx", base64: Buffer.from(await workbook.xlsx.writeBuffer()).toString("base64") };
  });
