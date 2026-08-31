#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const explicitBrand = process.env.VITE_SITE_BRAND?.trim().toLowerCase();
const projectHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase() ?? "";
const commitBranch = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
const isRunRecs =
  explicitBrand === "runrecs" ||
  projectHost.includes("runrecs") ||
  commitBranch === "feat/runrecs-running-site" ||
  commitBranch === "runrecs-production";

const siteUrl = isRunRecs ? "https://www.runrecs.com" : "https://www.athrecs.com";
const paths = [
  { path: "/", frequency: "daily", priority: "1.0" },
  { path: "/races", frequency: "hourly", priority: "0.9" },
  { path: "/calendar", frequency: "hourly", priority: "0.9" },
  { path: "/race-series", frequency: "daily", priority: "0.8" },
  { path: "/athletes", frequency: "daily", priority: "0.8" },
  { path: "/clubs", frequency: "weekly", priority: "0.7" },
  { path: "/privacy", frequency: "yearly", priority: "0.3" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.path}</loc>
    <changefreq>${entry.frequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /athlete-account
Disallow: /my-athlete-profile
Disallow: /claim-results
Sitemap: ${siteUrl}/sitemap.xml
`;

const outputDir = path.resolve(process.cwd(), ".vercel/output/static");
await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDir, "sitemap.xml"), sitemap, "utf8"),
  writeFile(path.join(outputDir, "robots.txt"), robots, "utf8"),
]);

console.log(`[brand-static] wrote ${isRunRecs ? "RunRecs" : "ATHRECS Athletics"} sitemap and robots`);
