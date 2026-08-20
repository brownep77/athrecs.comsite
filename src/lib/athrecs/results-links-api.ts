import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { ensureAthrecsSeeded } from "./seed.server";
import {
  previewResultLinksCsv as previewResultLinksCsvServer,
  publishResultLinksCsv as publishResultLinksCsvServer,
} from "./results-links-import.server";

export const previewResultLinksCsv = createServerFn({ method: "POST" })
  .validator((input: { csv: string }) => input)
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    return previewResultLinksCsvServer(data.csv);
  });

export const publishResultLinksCsv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { csv: string }) => input)
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    return publishResultLinksCsvServer(data.csv);
  });
