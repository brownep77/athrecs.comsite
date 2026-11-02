import assert from "node:assert/strict";
import { athleteBiographyReviews } from "../src/data/athlete-biography-reviews.ts";
import { reviewedBiographyPresentation } from "../src/lib/athrecs/reviewed-biography.server.ts";
import { biographyParagraphs } from "../src/lib/athrecs/biography-presentation.ts";
import { createServer } from "vite";
import { publicAthleteSearchContent } from "../src/lib/athrecs/public-athlete-search-content.ts";
const server = await createServer({ server: { middlewareMode: true } });
let buildPublicAthletePreview;
try {
  ({ buildPublicAthletePreview } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-athlete-preview.ts",
  ));
} finally {
  await server.close();
}

const review = athleteBiographyReviews.find((item) => item.slug === "rich-roll");
const text = review.paragraphs.join("\n\n");
const presentation = reviewedBiographyPresentation(review.slug, text);
assert(presentation);
assert.equal(reviewedBiographyPresentation(review.slug, ""), undefined);
assert.equal(reviewedBiographyPresentation(review.slug, text + " Changed."), undefined);
assert.equal(reviewedBiographyPresentation("someone-else", text), undefined);
assert.deepEqual(biographyParagraphs(text), review.paragraphs);
const input = {
  slug: review.slug,
  displayName: "Rich Roll",
  athleteNumber: "example",
  results: [],
  histories: [],
  searchIndexable: true,
  biography: review.paragraphs,
  biographyPresentation: presentation,
};
const preview = buildPublicAthletePreview(input);
const metadata = publicAthleteSearchContent(preview);
assert.match(metadata.title, /Rich Roll biography, podcast/);
assert.equal(metadata.jsonLd.mainEntity.subjectOf["@type"], "PodcastSeries");
assert.equal(metadata.jsonLd.mainEntity.subjectOf.datePublished, "2012-11-27");
assert(!JSON.stringify(metadata).includes("aggregateRating"));
const hidden = buildPublicAthletePreview({ ...input, biography: [] });
assert.equal(hidden.biographyPresentation, undefined);
const hiddenMetadata = publicAthleteSearchContent({
  ...hidden,
  biographyPresentation: presentation,
});
assert(!hiddenMetadata.jsonLd.mainEntity.subjectOf);
assert(!hiddenMetadata.jsonLd.mainEntity.sameAs);
assert(!hiddenMetadata.title.includes("podcast"));
for (const item of athleteBiographyReviews) {
  assert.equal(item.paragraphs.length, item.headings.length);
  assert(item.description.length <= 180);
  for (const link of item.links ?? []) assert.equal(new URL(link.url).protocol, "https:");
}
assert.match(text, /three-month family stay/);
assert.match(text, /returning to Los Angeles/);
assert.match(text, /co-authored The Plantpower Way, published in 2015/);
console.log(
  "PASS: exact-text biography presentation, paragraph preservation, hidden-biography privacy, official HTTPS links and faithful podcast metadata.",
);
