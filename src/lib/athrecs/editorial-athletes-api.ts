import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";

const slugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/),
});
async function articleFor(slug: string) {
  const { EDITORIAL_ARTICLES } = await import("../../data/athrecs-editorial");
  const article = EDITORIAL_ARTICLES.find((item) => item.slug === slug);
  if (!article) throw new Error("Article not found.");
  return article;
}
async function liveDatabase(write = false) {
  const { getSql, dbSource } = await import("../db");
  if (dbSource !== "neon")
    throw new Error(
      "The live athlete directory is unavailable. No athletes have been marked missing.",
    );
  if (write && process.env.VERCEL_ENV === "preview")
    throw new Error("Article link changes are disabled on preview deployments.");
  return getSql();
}

export const getEditorialAthleteQueue = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { slug?: string } | undefined) =>
    z.object({ slug: slugSchema.shape.slug.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { EDITORIAL_ARTICLES } = await import("../../data/athrecs-editorial");
    const { editorialAthleteNames } = await import("./editorial-athletes");
    const articles = EDITORIAL_ARTICLES.map((article) => ({
      slug: article.slug,
      title: article.title,
      kind: article.kind,
      namedAthletes: editorialAthleteNames(article).length,
      sourceUrl:
        [
          ...(article.sections?.flatMap((section) => section.sources ?? []) ?? []),
          ...(article.links ?? []),
        ].find((source) => /^https?:\/\//.test(source.url))?.url ?? "",
    }));
    if (!data.slug) return { articles, review: null };
    const article = await articleFor(data.slug);
    const { readEditorialAthleteReview } = await import("./editorial-athletes.server");
    return { articles, review: await readEditorialAthleteReview(await liveDatabase(), article) };
  });

export const approveEditorialAthleteLink = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    slugSchema
      .extend({
        name: z.string().trim().min(2).max(160),
        athleteId: z.number().int().positive().optional(),
        athleteSlug: z
          .string()
          .trim()
          .min(1)
          .max(180)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        sourceUrl: z
          .string()
          .url()
          .max(2000)
          .refine((url) => /^https?:\/\//.test(url), "Use an official web source."),
        note: z.string().trim().min(15).max(2000),
        identityChecked: z.literal(true),
        remove: z.boolean().optional(),
      })
      .refine(
        (input) => input.remove || Boolean(input.athleteId || input.athleteSlug),
        "Choose an existing profile.",
      )
      .refine((input) => !(input.athleteId && input.athleteSlug), "Choose one existing profile.")
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const article = await articleFor(data.slug);
    const { saveEditorialAthleteLink } = await import("./editorial-athletes.server");
    return saveEditorialAthleteLink(await liveDatabase(true), article, data, context);
  });

/** Public endpoint accepts a registered article, never a free-form person search. */
export const getPublicEditorialAthleteLinks = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => slugSchema.parse(input))
  .handler(async ({ data }) => {
    const article = await articleFor(data.slug);
    try {
      const { readPublicEditorialAthleteLinks } = await import("./editorial-athletes.server");
      return await readPublicEditorialAthleteLinks(await liveDatabase(), article);
    } catch {
      // Keep the article available, without guessing identity links when the
      // live catalogue cannot be checked. Staff review errors stay explicit.
      return {} as Record<string, string>;
    }
  });
