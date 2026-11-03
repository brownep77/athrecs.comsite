/** Read-only production/preview audit. Pass explicit public page URLs.
 * Reports observations, not Search Console validation or image reuse rights. */
import { load } from "cheerio";
const urls = process.argv.slice(2);
if (!urls.length) throw new Error("Pass one or more public race/guide URLs");
let failures = 0;
for (const url of urls) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const html = await response.text();
    const $ = load(html);
    const events = [];
    const visit = (value) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if ([value["@type"]].flat().some((type) => ["Event", "SportsEvent"].includes(type))) {
        events.push({ name: value.name, startDate: value.startDate, image: value.image ?? null });
      }
      Object.values(value).forEach(visit);
    };
    let malformed = 0;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        visit(JSON.parse($(el).text()));
      } catch {
        malformed++;
      }
    });
    const missing = events.filter(
      (event) => !event.image || (Array.isArray(event.image) && !event.image.length),
    ).length;
    const publisherLogo = events.filter((event) =>
      JSON.stringify(event.image).includes("athrecs-logo"),
    ).length;
    const result = {
      url,
      status: response.status,
      finalUrl: response.url,
      canonical: $('link[rel="canonical"]').attr("href") ?? null,
      robots: $('meta[name="robots"]').attr("content") ?? null,
      xRobotsTag: response.headers.get("x-robots-tag"),
      malformed,
      missing,
      publisherLogo,
      events,
    };
    console.log(JSON.stringify(result));
    if (!response.ok || malformed || missing || publisherLogo) failures++;
  } catch (error) {
    failures++;
    console.log(JSON.stringify({ url, error: error.message }));
  }
}
process.exitCode = failures ? 1 : 0;
