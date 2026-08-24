#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const { seriesList } = await import("../src/data/series.ts");

const checks = [
  {
    path: "migrations/0015_slug_redirects.sql",
    patterns: [
      "create table if not exists slug_redirects",
      "athrecs_preserve_entity_slug",
      "events_preserve_slug",
      "athletes_preserve_slug",
      "clubs_preserve_slug",
    ],
  },
  {
    path: "migrations/0017_slug_insert_guards.sql",
    patterns: [
      "before insert or update of slug on events",
      "before insert or update of slug on athletes",
      "before insert or update of slug on clubs",
      "redirect.old_slug = new.slug",
      "redirect.current_slug = new.slug",
    ],
  },
  {
    path: "migrations/0018_legacy_slug_compatibility.sql",
    patterns: [
      "Preserve valid legacy public URLs",
      "repeated internal hyphens or a trailing hyphen",
      "create or replace function athrecs_preserve_entity_slug()",
      "^[a-z0-9][a-z0-9-]*$",
      "redirect.old_slug = new.slug",
      "redirect.current_slug = new.slug",
    ],
  },
  {
    path: "src/lib/athrecs/slug-redirects.ts",
    patterns: [
      "PUBLIC_SLUG_PATTERN",
      "/^[a-z0-9][a-z0-9-]*$/",
      "repeated internal hyphens",
      "trailing hyphen",
    ],
  },
  {
    path: "src/lib/athrecs/import.server.ts",
    patterns: ['.slice(0, 80)\n    .replace(/-+$/g, "");'],
  },
  {
    path: "src/routes/races/index.tsx",
    patterns: [
      "county?: string",
      "postcode?: string",
      "dateFrom?: string",
      "page?: number",
      "searchFromFilters",
      'to: "/races"',
      'rel: "canonical"',
    ],
  },
  {
    path: "src/routes/races/$slug.tsx",
    patterns: ["resolveSlugRedirect", "statusCode: 301", "siteGraphMeta", 'rel: "canonical"'],
  },
  {
    path: "src/routes/athletes/$slug.tsx",
    patterns: ["resolveSlugRedirect", "statusCode: 301", 'rel: "canonical"'],
  },
  {
    path: "src/routes/clubs/$slug.tsx",
    patterns: ["resolveSlugRedirect", "statusCode: 301", "SportsOrganization"],
  },
];

const failures = [];
for (const check of checks) {
  let content = "";
  try {
    content = await readFile(check.path, "utf8");
  } catch {
    failures.push(`${check.path}: missing`);
    continue;
  }
  for (const pattern of check.patterns) {
    if (!content.includes(pattern)) failures.push(`${check.path}: missing ${pattern}`);
  }
}

const publicSlugPattern = /^[a-z0-9][a-z0-9-]*$/;
const knownLegacySlugs = [
  "wa-xlv-giro-podistico-citta-di-pordenone-campionato-reg-fvg-5-km-8-prova--7237453",
  "wt-2026-africa-duathlon-achampionships-hurghada-g-",
];

for (const legacySlug of knownLegacySlugs) {
  if (!publicSlugPattern.test(legacySlug)) {
    failures.push(`legacy public slug is rejected: ${legacySlug}`);
  }
}
for (const invalidSlug of ["", "-leading", "Uppercase", "has space", "slash/path"]) {
  if (publicSlugPattern.test(invalidSlug)) {
    failures.push(`invalid public slug is accepted: ${invalidSlug || "<empty>"}`);
  }
}

const invalidCatalogueSlugs = [
  ...new Set(
    seriesList
      .map((series) => series.slug)
      .filter((slug) => typeof slug !== "string" || !publicSlugPattern.test(slug)),
  ),
];
if (invalidCatalogueSlugs.length) {
  failures.push(
    `race-series catalogue has ${invalidCatalogueSlugs.length} unsupported public slug(s): ${invalidCatalogueSlugs
      .slice(0, 25)
      .join(", ")}`,
  );
}

if (failures.length) {
  console.error("Slug stability verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Slug stability verification passed for ${seriesList.length.toLocaleString("en-GB")} race-series URLs, including legacy compatibility.`,
);
