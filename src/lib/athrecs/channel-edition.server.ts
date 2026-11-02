import { createHash } from "node:crypto";
import type { ChannelCard, ChannelLine, ChannelProfile } from "./english-channel";

export type SwimEntry = {
  id: string;
  kind: string;
  date: string;
  endDate?: string;
  duration: string;
  route: string;
  nationality: string;
  departure?: string;
  landing?: string;
  startTime?: string;
  finishTime?: string;
  pilot?: string;
  boat?: string;
  observer?: string;
  ratifier?: string;
  place?: number;
  note?: string;
  refs: { text: string; url: string }[];
};
export type SwimEdition = { baseRevision: string; paragraph: string; events: SwimEntry[] };
export const editionDate = "2026-11-02";

function dateText(date: string) {
  if (date.length === 4) return date + " (year only)";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

function facts(e: SwimEntry): ChannelLine[] {
  const lines = [
    { label: "Elapsed time", text: e.duration + " (h:mm:ss)" },
    { label: "Course", text: e.route },
    { label: "Sporting nationality in this result", text: e.nationality },
  ];
  const fields = [
    ["Departure point", e.departure],
    ["Landing", e.landing],
    ["Pilot", e.pilot],
    ["Escort vessel", e.boat],
    ["Observer", e.observer],
    ["Ratification", e.ratifier],
    ["Published place", e.place?.toString()],
    ["Record note", e.note],
  ];
  if (e.startTime || e.finishTime) {
    if (e.startTime) lines.push({ label: "Departure clock", text: e.startTime });
    if (e.finishTime)
      lines.push({
        label: "Arrival clock",
        text: [e.finishTime, e.endDate && dateText(e.endDate)].filter(Boolean).join(" on "),
      });
    lines.push({
      label: "Clock basis",
      text: "The historical register does not identify the time zone.",
    });
  }
  for (const [label, text] of fields) if (label && text) lines.push({ label, text });
  return lines;
}

function card(e: SwimEntry, evidence: boolean): ChannelCard {
  const lines: ChannelLine[] = facts(e);
  if (evidence) lines.push({ heading: true, text: "How the record was checked" }, ...e.refs);
  return { id: e.id, title: e.kind + ", " + dateText(e.date), lines };
}

export function expandedChannelProfile(base: ChannelProfile, edition: SwimEdition): ChannelProfile {
  if (edition.baseRevision !== base.revision) throw new Error("Channel edition base changed");
  const crossings = edition.events.filter((e) => e.kind === "English Channel solo");
  const other = edition.events.filter((e) => e.kind !== "English Channel solo");
  const next = {
    ...base,
    biography: [...base.biography, edition.paragraph],
    crossings: [...base.crossings, ...crossings.map((e) => card(e, true))],
    nativeCrossings: [...base.nativeCrossings, ...crossings.map((e) => card(e, false))],
    otherEvents: [...base.otherEvents, ...other.map((e) => card(e, true))],
    nativeOtherEvents: [...base.nativeOtherEvents, ...other.map((e) => card(e, false))],
    checkedAt: editionDate,
  };
  const digest = createHash("sha256").update(JSON.stringify(next)).digest("hex");
  return { ...next, revision: "channel-" + digest.slice(0, 20) };
}

export function editionPerformance(e: SwimEntry) {
  const date = e.date.length === 4 ? "" : e.date;
  return {
    year: Number(e.date.slice(0, 4)),
    date,
    endDate: e.endDate,
    sourceDate: e.date,
    ageGroup: "",
    discipline: "Open-water swimming — " + e.kind,
    performance: e.duration,
    wind: "",
    place: e.place?.toString() ?? "",
    venue: e.route,
    meeting: e.kind,
    notes: facts(e)
      .map((line) => line.label + " · " + line.text)
      .join(". "),
    sourceUrls: e.refs.map((r) => r.url),
    sourceKeys: [e.refs[0].url + "#" + e.id],
    places: { overall: e.place ?? null, gender: null, category: null },
    labels: [],
    verificationStatus: "source_verified",
    evidence: { checkedAt: editionDate, locator: e.refs[0].text },
  };
}
