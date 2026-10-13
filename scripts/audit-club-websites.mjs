// Read public club websites into a review queue. Never writes catalogue data.
// Usage: node --experimental-strip-types scripts/audit-club-websites.mjs /absolute/output.json
import fs from "node:fs/promises";
import { load } from "cheerio";
import { clubs as base } from "../src/data/clubs.ts";
import { athleticsIrelandClubs } from "../src/data/clubs-athletics-ireland.ts";
import { belfastClubs } from "../src/data/clubs-belfast.ts";
import { triathlonIrelandClubs } from "../src/data/clubs-triathlon-ireland.ts";
import { welshAthleticsClubs } from "../src/data/clubs-welsh-athletics.ts";
import {
  auditedClubAdditions,
  clubEnrichment,
  clubSlugAliases,
} from "../src/data/club-enrichment.ts";

const output = process.argv[2];
if (!output?.startsWith("/")) throw new Error("Provide an absolute scratch output path");
const clubs = new Map();
for (const source of [
  ...base,
  ...athleticsIrelandClubs,
  ...belfastClubs,
  ...triathlonIrelandClubs,
  ...welshAthleticsClubs,
  ...auditedClubAdditions,
]) {
  const slug = clubSlugAliases[source.slug] ?? source.slug;
  clubs.set(slug, { ...clubs.get(slug), ...source, ...clubEnrichment[source.slug], slug });
}
const checkedAt = new Date().toISOString().slice(0, 10);
const clean = (s) => s.replace(/\s+/g, " ").trim();
const host = (url) => new URL(url).hostname.replace(/^www\./, "");
const sharedHosts =
  /(^|\.)(facebook\.com|instagram\.com|x\.com|twitter\.com|athleticsireland\.ie|welshathletics\.org|englandathletics\.org|triathlonireland\.com|athleticsni\.org|belfastrunning\.com|specialolympics\.ie)$/;
const socialHosts = {
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "x.com": "X",
  "twitter.com": "X",
  "youtube.com": "YouTube",
  "linkedin.com": "LinkedIn",
  "strava.com": "Strava",
  "tiktok.com": "TikTok",
};
const rolePattern =
  /^(info|hello|contact|enquir(?:y|ies)|secretary|membership|join|admin|office|clubmanager|chair|president|welfare|safeguarding|communications|captain)([._-]|@|[a-z])/i;
const outputRows = await fs
  .readFile(output, "utf8")
  .then(JSON.parse)
  .catch(() => []);
const completed = new Set(outputRows.map((r) => r.slug));
const cache = new Map();
async function page(url) {
  if (cache.has(url)) return cache.get(url);
  const promise = (async () => {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "user-agent": "AthRecs club directory source check (public contact pages)" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (host(response.url) !== host(url)) throw new Error("Cross-domain redirect needs review");
    if (!response.headers.get("content-type")?.includes("text/html")) throw new Error("Not HTML");
    const html = await response.text();
    if (html.length > 4_000_000) throw new Error("Page too large");
    const $ = load(html);
    $("script, style, noscript, template, svg").remove();
    const title = clean($("title").text());
    if (/just a moment|access denied|verify.*human|domain.*sale|website.*suspended/i.test(title))
      throw new Error("Site unavailable or protected");
    return { $, title, url: response.url };
  })();
  cache.set(url, promise);
  return promise;
}
function readPage(p, isContact) {
  const { $, url } = p;
  const contacts = [];
  const socials = [];
  const links = [];
  const text = clean($("body").text());
  const scope = isContact
    ? $("body")
    : $("header, footer, [class*=contact], [class*=social], [class*=footer], [id*=footer]");
  scope.find("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim() ?? "";
    if (/^mailto:/i.test(href)) {
      const email = decodeURIComponent(href.slice(7).split("?")[0]).trim();
      if (/^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(email) && rolePattern.test(email))
        contacts.push({
          email,
          source_url: url,
          context: clean($(element).parent().text()).slice(0, 200),
        });
    }
    if (isContact && /^tel:/i.test(href)) {
      const phone = href.slice(4).trim();
      if (/^\+?[\d ()-]{8,22}$/.test(phone))
        contacts.push({
          phone,
          source_url: url,
          context: clean($(element).parent().text()).slice(0, 200),
        });
    }
    try {
      const u = new URL(href, url);
      const platform = socialHosts[u.hostname.replace(/^www\./, "")];
      if (!platform || !/^https?:$/.test(u.protocol)) return;
      if (
        /\/(?:sharer|share|intent|posts|p|reel|reels|status|watch|embed|login|privacy|policies|help|pages\/category)(?:\/|$|\?)/i.test(
          u.pathname,
        )
      )
        return;
      if (!u.pathname.replace(/\//g, "")) return;
      if (platform === "Strava" && !/^\/clubs\//.test(u.pathname)) return;
      if (platform === "LinkedIn" && !/^\/company\//.test(u.pathname)) return;
      if (platform === "Facebook" && u.pathname === "/profile.php" && !u.searchParams.get("id"))
        return;
      if (u.pathname !== "/profile.php") u.search = "";
      u.hash = "";
      socials.push({ platform, url: u.href, source_url: url });
    } catch {
      /* non-web links */
    }
  });
  $("a[href]").each((_, element) => {
    const label = clean($(element).text());
    if (
      !/^(contact(?: us| details)?|get in touch|about(?: us| the club)?|club history|our history|history|find us|where we (?:train|meet))$/i.test(
        label,
      )
    )
      return;
    try {
      const u = new URL($(element).attr("href"), url);
      if (
        host(u.href) === host(url) &&
        /^https?:$/.test(u.protocol) &&
        !/\.(?:pdf|zip)$/i.test(u.pathname)
      )
        links.push({ url: u.href.split("#")[0], label });
    } catch {
      /* invalid link */
    }
  });
  const paragraphs = $("main p, article p, .entry-content p")
    .map((_, el) => clean($(el).text()))
    .get()
    .filter((t) => t.length > 60 && t.length < 1600 && !/cookie|privacy|copyright/i.test(t))
    .slice(0, 8);
  return {
    url,
    title: p.title,
    contacts,
    socials,
    links,
    description: $("meta[name=description]").attr("content"),
    paragraphs,
    text: text.slice(0, 24000),
  };
}
let index = 0;
const list = [...clubs.values()].filter((c) => !completed.has(c.slug));
async function worker() {
  while (index < list.length) {
    const club = list[index++];
    const row = {
      slug: club.slug,
      name: club.name,
      checked_at: checkedAt,
      website: club.website,
      pages: [],
    };
    try {
      if (!club.website || sharedHosts.test(host(club.website)))
        throw new Error("No standalone club website in catalogue");
      const home = await page(club.website.replace(/^http:/, "https:"));
      const tokens = club.name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(
          (t) =>
            t.length > 3 &&
            ![
              "club",
              "running",
              "runners",
              "athletic",
              "athletics",
              "harriers",
              "triathlon",
              "district",
            ].includes(t),
        );
      const identity = clean(home.$("body").text()).toLowerCase();
      if (tokens.length && !tokens.some((t) => identity.includes(t)))
        throw new Error("Club identity needs review");
      const first = readPage(home, false);
      row.pages.push(first);
      const selected = [...new Map(first.links.map((l) => [l.url, l])).values()]
        .sort(
          (a, b) => Number(/contact|touch/i.test(b.label)) - Number(/contact|touch/i.test(a.label)),
        )
        .filter((l) => l.url !== home.url)
        .slice(0, 2);
      for (const link of selected) {
        try {
          row.pages.push(readPage(await page(link.url), /contact|touch/i.test(link.label)));
        } catch (error) {
          row.pages.push({ url: link.url, error: error.message });
        }
      }
      row.status = "fetched";
    } catch (error) {
      row.status = "needs-review";
      row.reason = error.message;
    }
    outputRows.push(row);
    if (outputRows.length % 50 === 0) {
      await fs.writeFile(output, JSON.stringify(outputRows));
      console.log(
        `${outputRows.length}/${clubs.size}: ${outputRows.filter((r) => r.status === "fetched").length} club websites read`,
      );
    }
  }
}
await Promise.all(Array.from({ length: 16 }, worker));
await fs.writeFile(output, JSON.stringify(outputRows));
console.log(
  JSON.stringify({
    clubs: clubs.size,
    fetched: outputRows.filter((r) => r.status === "fetched").length,
    output,
  }),
);
