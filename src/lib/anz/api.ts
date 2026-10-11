import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { anzRequestSchema, anzSaveSchema } from "./core";
export const previewAnzImport = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => anzRequestSchema.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).previewAnz(data, context),
  );
export const saveAnzImport = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => anzSaveSchema.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).importAnz(data, context),
  );
