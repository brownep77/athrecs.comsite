import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { dbSource, getSql } from "../db";
import {
  finderProfileLookupSchema,
  finderProfilePreviewSchema,
  finderProfileSaveSchema,
  type FinderProfilePreviewInput,
  type FinderProfileSaveInput,
} from "./add-to-profile";
import {
  findProfileAdditionOptions,
  previewProfileAddition,
  saveProfileAddition,
} from "./add-to-profile.server";

export const findFinderProfileOptions = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { kind: "athlete" | "edition"; q: string }) =>
    finderProfileLookupSchema.parse(input),
  )
  .handler(async ({ data }) => findProfileAdditionOptions(await getSql(), data));
export const previewFinderProfileAddition = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: FinderProfilePreviewInput) => finderProfilePreviewSchema.parse(input))
  .handler(async ({ data, context }) => previewProfileAddition(await getSql(), data, context));
export const addFinderResultToProfile = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: FinderProfileSaveInput) => finderProfileSaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (dbSource !== "neon" || process.env.VERCEL_ENV === "preview")
      throw new Error("Save results from the live staff site. Nothing was added.");
    return saveProfileAddition(await getSql(), data, context);
  });
