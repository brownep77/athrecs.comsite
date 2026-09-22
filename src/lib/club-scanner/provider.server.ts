import { createHash } from "node:crypto";
import { load } from "cheerio";
import { auditResults, seconds } from "../../../scripts/lib/result-evidence-audit.mjs";
import { normal, providerUrl, type Row, type Scope } from "./core.ts";
export const INDEX_URL = "https://totalracetiming.co.uk/result";
const text = (s: string) => s.replace(/\s+/g, " ").trim();
const rank = (s: string) => (/^\d+$/.test(s) ? Number(s) : null);
export async function fetchSource(url: string) {
  if (url !== INDEX_URL && !providerUrl(url))
    throw new Error("This provider needs manual source review.");
  const response = await fetch(url.split("#")[0], {
    redirect: "error",
    signal: AbortSignal.timeout(18000),
    headers: { "User-Agent": "AthRecs club results review (+https://www.athrecs.com)" },
  });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  if (!response.headers.get("content-type")?.includes("text/html"))
    throw new Error("Unsupported source format");
  if (Number(response.headers.get("content-length")) > 6_000_000)
    throw new Error("Source exceeds the scan limit");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty source");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 6_000_000) {
      await reader.cancel();
      throw new Error("Source exceeds the scan limit");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export function discover(html: string, scope: Scope) {
  const $ = load(html);
  const found = new Map<string, { url: string; date: string }>();
  $("table").each((_, table) => {
    const headers = $(table)
      .find("thead th")
      .map((_, h) => text($(h).text()))
      .get();
    const dateIndex = headers.indexOf("Date");
    if (dateIndex < 0 || !headers.includes("Name")) return;
    $(table)
      .find("tbody tr")
      .each((_, tr) => {
        const dateText = text($(tr).find("td").eq(dateIndex).text()).replace(
          /(\d+)(st|nd|rd|th)/,
          "$1",
        );
        const m = dateText.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{2}|\d{4})$/);
        if (!m) return;
        const month =
          [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].indexOf(m[2]) + 1;
        if (!month) return;
        const date = `${m[3].length === 2 ? "20" + m[3] : m[3]}-${String(month).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
        if (date < scope.dateFrom || date > scope.dateTo) return;
        $(tr)
          .find("a[href]")
          .each((_, a) => {
            const url = new URL($(a).attr("href")!, INDEX_URL).href;
            if (providerUrl(url)) found.set(url, { url, date });
          });
      });
  });
  if (!$("table").length) throw new Error("Results index format changed");
  return [...found.values()];
}
export function extract(html: string, url: string, scope: Scope) {
  const $ = load(html);
  $("br").replaceWith(" ");
  const name = text($("h2").first().text()),
    sourceHash = createHash("sha256").update(html).digest("hex"),
    checkedAt = new Date().toISOString();
  const aliases = new Set(scope.aliases.map(normal));
  const rows: Row[] = [];
  const captures: Record<string, unknown>[] = [];
  const errors: string[] = [];
  const raceId = url.match(/raceresults\/(\d+)/)?.[1];
  if (!raceId) throw new Error("Invalid provider result URL");
  $("table").each((ti, table) => {
    const t = $(table),
      heading = t.prevAll("h3").first(),
      discipline = text(heading.text()),
      anchor = heading.attr("id") ?? "";
    const headers = t
      .find("thead th")
      .map((_, h) => text($(h).text()))
      .get();
    const values = t
      .find("tbody tr")
      .map((_, tr) => [
        $(tr)
          .find("td")
          .map((_, td) => text($(td).text()))
          .get(),
      ])
      .get() as unknown as string[][];
    const dates = text(t.prevAll("p").first().text()).match(/\d{2}\/\d{2}\/\d{4}/g) ?? [];
    const date = dates[0]?.split("/").reverse().join("-") ?? "";
    const sourceUrl = url.split("#")[0] + (anchor ? "#" + anchor : "");
    const capture = {
      url: sourceUrl,
      headings: [name, discipline],
      startTimes: dates,
      rowCount: values.length,
      tables: [{ headers, rows: values }],
    };
    captures.push(capture);
    if (!headers.includes("Club")) {
      errors.push(`Table ${ti + 1} has no club column`);
      return;
    }
    values.forEach((v, ri) => {
      const raw = Object.fromEntries(headers.map((h, i) => [h, v[i] ?? ""]));
      if (!aliases.has(normal(raw.Club ?? ""))) return;
      if (date && (date < scope.dateFrom || date > scope.dateTo)) return;
      const sourceIssues: string[] = [];
      if (
        !date ||
        dates.length !== 1 ||
        Number.isNaN(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
      )
        sourceIssues.push("Source date is missing or ambiguous");
      if (
        headers.length !== v.length ||
        new Set(headers.filter(Boolean)).size !== headers.filter(Boolean).length
      )
        sourceIssues.push("Source table structure needs review");
      if (!name || !anchor || !discipline)
        sourceIssues.push("Race, distance or source table locator is missing");
      if (!/\d\s*(?:k(?:m)?|mile|miles)\b|half marathon|marathon/i.test(discipline))
        sourceIssues.push("Distance label needs manual interpretation");
      const fullName = text(`${raw.Forename ?? ""} ${raw.Surname ?? ""}`),
        bib = raw.Tag ?? "";
      if (!raw.Forename || !raw.Surname || !bib) sourceIssues.push("Source name or bib is missing");
      const timing = raw["Chip Time"] || raw.Time || raw["Total Time"] || raw["Gun Time"] || "";
      if (seconds(timing) === null || !/^[1-9]\d*$/.test(raw.Position ?? ""))
        sourceIssues.push("Finish status or time is not established");
      if (
        seconds(raw["Chip Time"]) !== null &&
        seconds(raw["Gun Time"]) !== null &&
        seconds(raw["Chip Time"])! > seconds(raw["Gun Time"])!
      )
        sourceIssues.push("Chip time exceeds gun time in the source");
      const record = `TRT:${raceId}:${ti}:${ri + 1}`;
      const labels = [
        "Club: " + raw.Club,
        "Bib: " + bib,
        "Name at source: " + fullName,
        "Source record: " + record,
      ];
      for (const key of ["Chip Time", "Gun Time", "Time", "Total Time", "Gender Pos", "Cat Pos"])
        if (raw[key]) labels.push(`${key}: ${raw[key]}`);
      const performance = {
        year: Number(date.slice(0, 4)) || 0,
        date,
        sourceDate: dates[0] ?? "",
        ageGroup: raw.Category ?? "",
        discipline,
        performance: timing,
        wind: "",
        place: raw.Position ?? "",
        venue: "",
        meeting: name,
        sourceUrls: [sourceUrl],
        labels,
      };
      const audit = auditResults(
        [
          {
            id: record,
            athlete_id: fullName,
            display_name: fullName,
            event_name: name,
            event_date: performance.date,
            distance_code: discipline,
            status: "finished",
            source_url: sourceUrl,
            finish_time_seconds: seconds(timing),
            chip_time_seconds: seconds(raw["Chip Time"]),
            gun_time_seconds: seconds(raw["Gun Time"]),
            overall_place: rank(raw.Position),
            gender_place: rank(raw["Gender Pos"]),
            category_place: rank(raw["Cat Pos"]),
          },
        ],
        [capture],
      );
      if (audit.scope.untestedResults)
        sourceIssues.push("Independent source comparison is incomplete");
      sourceIssues.push(
        ...audit.issues.flatMap((i) => i.flags),
        ...audit.comparisons.flatMap((i) => i.flags),
      );
      rows.push({
        key: `trt:${raceId}:${anchor || ti}:${bib || "row" + ri}`,
        name: fullName,
        gender: raw.Gender ?? "",
        club: raw.Club,
        bib,
        url: sourceUrl,
        sourceHash,
        checkedAt,
        raw,
        performance,
        sourceIssues: [...new Set(sourceIssues)],
      });
    });
  });
  if (!captures.length) throw new Error("No readable result tables; source requires review");
  const keys = new Set<string>();
  for (const row of rows) {
    if (keys.has(row.key)) throw new Error("Duplicate bib in the same source table");
    keys.add(row.key);
  }
  return { rows, captures, sourceHash, errors };
}
