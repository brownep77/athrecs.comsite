#!/usr/bin/env node
import { readFile } from "node:fs/promises";

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

if (failures.length) {
  console.error("Slug stability verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Slug stability verification passed.");
