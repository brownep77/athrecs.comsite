import { athleteBiographyReviews } from "../../data/athlete-biography-reviews.ts";
import type { BiographyPresentation } from "./biography-presentation.ts";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/** The caller must first obtain an exact-text administrator publication receipt. */
export function reviewedBiographyPresentation(
  slug: string,
  publishedBiography: string,
): BiographyPresentation | undefined {
  if (!publishedBiography.trim()) return undefined;
  const review = athleteBiographyReviews.find((item) => item.slug === slug);
  if (!review || normalize(review.paragraphs.join("\n\n")) !== normalize(publishedBiography))
    return undefined;
  const { paragraphs: _paragraphs, slug: _slug, ...presentation } = review;
  return presentation;
}
