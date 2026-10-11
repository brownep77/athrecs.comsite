import { load } from "cheerio";
import {
  ANZ_PROVIDER,
  anzSource,
  anzPerformanceKey,
  type AnzCapture,
  type AnzMedal,
} from "./core.ts";
import type { SourcePerformance } from "../athrecs/source-performance-history.ts";
const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function sourceDate(s: string) {
  const match = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/.exec(s);
  if (!match || !months.includes(match[2])) throw new Error(`Unrecognised ANZ date: ${s}`);
  const day = `${match[3]}-${String(months.indexOf(match[2]) + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  if (!Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day)
    throw new Error("Invalid ANZ date.");
  return day;
}
export function parseAnzProfile(html: string, sourceUrl: string) {
  const source = anzSource(sourceUrl),
    $ = load(html);
  const name = clean($("h2.h2-four").first().text());
  const form = $("form")
    .filter((_, el) => $(el).find('input[name="athleteID"]').length > 0)
    .first();
  if (
    !name ||
    form.find('input[name="athleteID"]').val() !== source.externalId ||
    form.attr("action") !==
      `https://www.anzrankings.org.nz/site/profiles_con/athlete_data/${source.externalId}`
  )
    throw new Error("ANZ profile identity or search form changed. Nothing imported.");
  function detail(label: string) {
    const node = $(".record strong")
      .filter((_, el) => clean($(el).text()) === `${label}:`)
      .first()[0];
    let value = "";
    for (
      let next = node?.nextSibling;
      next && !(next.type === "tag" && next.name === "br");
      next = next.nextSibling
    )
      value += $(next).text();
    return clean(value);
  }
  const token = String(form.find('input[name="csrf_token"]').val() ?? "");
  const events = form
    .find('select[name="eventID"] option')
    .toArray()
    .map((el) => ({ id: $(el).attr("value") ?? "", name: clean($(el).text()) }))
    .filter((e) => /^\d+$/.test(e.id));
  if (
    !token ||
    !events.length ||
    events.length > 40 ||
    new Set(events.map((e) => e.id)).size !== events.length
  )
    throw new Error("ANZ event search is unavailable.");
  const medals: AnzMedal[] = [];
  const table = $("#NZCM").next("table");
  const headers = table
    .find("thead th")
    .map((_, el) => clean($(el).text()))
    .get();
  if (table.length && headers.join("|") !== "Year|Event|Age Group|Performance|Position")
    throw new Error("ANZ medal columns changed.");
  table.find("tbody tr").each((_, el) => {
    const cells = $(el).find("td"),
      icon = cells.eq(headers.indexOf("Position")).find("img").attr("src") ?? "";
    const medal = icon.match(/\/icon_(gold|silver|bronze)\.png$/)?.[1] as
      AnzMedal["medal"] | undefined;
    if (cells.length !== headers.length || !medal) throw new Error("Unknown ANZ medal row.");
    const value = (key: string) => clean(cells.eq(headers.indexOf(key)).text());
    const year = Number(value("Year"));
    if (!Number.isInteger(year) || year < 1900 || year > 2200)
      throw new Error("Unknown medal year.");
    medals.push({
      year,
      event: value("Event"),
      ageGroup: value("Age Group"),
      performance: value("Performance"),
      medal,
      sourceUrl: source.url,
    });
  });
  return { ...source, name, club: detail("CLUB"), coach: detail("COACH"), token, events, medals };
}
export function parseAnzEvent(
  html: string,
  profile: ReturnType<typeof parseAnzProfile>,
  event: { id: string; name: string },
): SourcePerformance[] {
  const identity = parseAnzProfile(html, profile.url);
  if (identity.name !== profile.name || identity.club !== profile.club)
    throw new Error("ANZ result identity changed.");
  const $ = load(html);
  const heading = $("h2,h3,h4").filter(
    (_, el) => clean($(el).text()) === `${event.name} - All Years`,
  );
  if (heading.length !== 1) throw new Error(`ANZ did not return all years for ${event.name}.`);
  const table = heading.nextAll("table").first();
  const headers = table
    .find("thead th")
    .map((_, el) => clean($(el).text()))
    .get();
  const required = ["Rank", "Perf", "Wind", "Note", "Place", "Competition", "Venue", "Date"];
  if (
    required.some((h) => headers.filter((v) => v === h).length !== 1) ||
    headers.some((h) => !required.includes(h))
  )
    throw new Error("ANZ result columns changed.");
  const rows: SourcePerformance[] = [];
  table.find("tbody tr").each((index, el) => {
    const cells = $(el).find("td");
    if (cells.length !== headers.length) throw new Error("Incomplete ANZ result row.");
    const value = (key: string) => clean(cells.eq(headers.indexOf(key)).text());
    const date = sourceDate(value("Date"));
    if (!value("Perf") || !value("Competition") || !/^\d+$/.test(value("Rank")))
      throw new Error("Missing ANZ performance evidence.");
    const discipline = event.name.replace(/^1 Mile \(Road\)$/i, "Mile Road");
    rows.push({
      year: Number(date.slice(0, 4)),
      date,
      sourceDate: value("Date"),
      ageGroup: "",
      discipline,
      performance: value("Perf"),
      wind: value("Wind"),
      place: value("Place"),
      meeting: value("Competition"),
      venue: value("Venue"),
      sourceUrls: [profile.url],
      providerName: ANZ_PROVIDER,
      verificationStatus: "source_verified",
      labels: ["ANZ performance", ...(value("Note") ? [`ANZ note: ${value("Note")}`] : [])],
      notes: `ANZ athlete ${profile.externalId}, ${profile.name}, ${profile.club}. Row locator: eventID=${event.id}; year=0; order_by=1; row ${index + 1}; source rank ${value("Rank")}. Identity and named result columns compared. Place is the original source annotation; gender/category and chip/gun basis are not supplied.${value("Note") ? ` Source note: ${value("Note")}.` : ""}`,
    });
  });
  if (!rows.length || rows.length > 10000 || $(".pagination a").length)
    throw new Error("ANZ event results are empty, too large or paginated; review needed.");
  return rows;
}
export function assembleAnzCapture(
  profile: ReturnType<typeof parseAnzProfile>,
  batches: SourcePerformance[][],
  capturedAt = new Date().toISOString(),
): AnzCapture {
  if (batches.length !== profile.events.length || batches.some((b) => !b.length))
    throw new Error("ANZ capture is incomplete.");
  const rows = [
    ...new Map(batches.flat().map((row) => [anzPerformanceKey(row), row])).values(),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.discipline.localeCompare(b.discipline));
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  return {
    externalId: profile.externalId,
    sourceUrl: profile.url,
    name: profile.name,
    club: profile.club,
    coach: profile.coach,
    medals: profile.medals,
    eventCount: batches.length,
    history: {
      provider: ANZ_PROVIDER,
      externalId: profile.externalId,
      sourceUrl: profile.url,
      capturedAt,
      complete: true,
      yearsExpected: years,
      yearsCaptured: years,
      performances: rows,
    },
  };
}
