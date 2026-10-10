import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import type { FixtureUploadInput } from "./fixture-upload";

export const previewFixtureFile = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: FixtureUploadInput) => input)
  .handler(async ({ data }) =>
    (await import("./fixture-upload.server")).previewFixtureUpload(data),
  );

export const saveFixtureFile = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: FixtureUploadInput & { previewHash: string }) => input)
  .handler(async ({ data, context }) =>
    (await import("./fixture-upload.server")).importFixtureUpload(data, context.staffEmail),
  );
