import type { PublicAthletePreview } from "./public-athlete-preview";
import { countryFlag } from "./country-flags.ts";
import { recordedAwards, historyAwards } from "./competition-awards.ts";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const accepted = new Set(["source_verified", "verified_by_administrator"]);

/** Only an explicitly supplied, recognised country can become a nationality entity. */
export function publicNationality(value: string | null | undefined): string | null {
  const country = countryFlag(value);
  return country.code ? country.name : null;
}

/** Use only the public DTO: never reach back into a member's full result history. */
export function publicAthleteNarrative(profile: PublicAthletePreview): string[] {
  if (!profile.biography.length) return [];
  const paragraphs = profile.biography.map(clean).filter(Boolean);
  const original = paragraphs.join(" ");
  const nationality = publicNationality(profile.nationality);
  if (
    nationality &&
    !original.toLowerCase().includes(nationality.toLowerCase()) &&
    !/\bnationality\b/i.test(original)
  ) {
    paragraphs.push(`The recorded nationality is ${nationality}.`);
  }
  const career = profile.careerSummary;
  if (career?.events.length) {
    const events = career.events
      .slice(0, 3)
      .map((event) => `${event.name} (${event.year}; ${event.verification.toLowerCase()})`);
    paragraphs.push(`${career.text} Selected recorded events include ${events.join("; ")}.`);
  } else {
    // A public record can describe a non-finish or an unclassified distance.
    // Give it event context without claiming a finish, PB or achievement.
    const events = profile.entries.flatMap((entry) => {
      const recorded = entry.kind === "recorded" ? entry.result : null;
      const history = entry.kind === "history" ? entry.result.performance : null;
      const name = clean(recorded?.eventName ?? history?.meeting ?? "");
      if (!name || /^(?:unknown|tbc|n\/?a|[-—])$/i.test(name)) return [];
      const date =
        recorded?.eventDate || history?.date || history?.yearLabel || String(history?.year ?? "");
      const year = /^(\d{4})(?:-\d{2}-\d{2})?$/.exec(date)?.[1];
      const status = recorded?.details?.verificationStatus ?? history?.verificationStatus;
      const verification = recorded?.conflicting
        ? "conflicting record"
        : status === "source_verified"
          ? "source checked"
          : status === "verified_by_administrator"
            ? "administrator confirmed"
            : "unverified record";
      const nonFinish = /^(?:DNF|DNS|DQ|DSQ|NM|NH)$/i
        .exec(recorded?.status ?? history?.performance ?? "")?.[0]
        .toUpperCase();
      return [`${name} (${[year, nonFinish, verification].filter(Boolean).join("; ")})`];
    });
    if (events.length)
      paragraphs.push(
        `Public recorded entries include ${[...new Set(events)].slice(0, 3).join("; ")}.`,
      );
  }
  const highlights = profile.entries.flatMap((entry) => {
    const recorded = entry.kind === "recorded" ? entry.result : null;
    const history = entry.kind === "history" ? entry.result.performance : null;
    const status = recorded?.details?.verificationStatus ?? history?.verificationStatus;
    if (
      !accepted.has(status ?? "") ||
      recorded?.conflicting ||
      /conflict/i.test(history?.notes ?? "")
    )
      return [];
    const event = recorded?.eventName ?? history?.meeting ?? "";
    const discipline = recorded?.distanceCode ?? history?.discipline ?? "";
    // A relay leg, split or qualifying round must not read as a race podium.
    const context = `${event} ${discipline} ${recorded?.displayRound ?? ""} ${history?.labels.join(" ") ?? ""}`;
    if (
      /\b(?:relay|leg|split|intermediate|heat|semi[- ]?final|qualifying|qualification)\b/i.test(
        context,
      )
    )
      return [];
    // Source 'place' may be a heat or category position. Require named classifications.
    const awards = recorded
      ? recordedAwards(recorded)
      : history
        ? historyAwards({
            ...history,
            place: "",
            places: history.places ?? { overall: null, gender: null, category: null },
          })
        : [];
    const award = awards.find((item) => item.podium);
    if (!award || !event.trim()) return [];
    const place = award.kind === "gold" ? "1st" : award.kind === "silver" ? "2nd" : "3rd";
    const scope =
      award.scope === "overall"
        ? "overall"
        : award.scope === "category"
          ? `in the ${award.category} category`
          : "in the gender classification";
    const date =
      recorded?.eventDate ?? history?.date ?? history?.yearLabel ?? String(history?.year ?? "");
    const qualification =
      status === "source_verified" ? "Source-checked" : "Administrator-confirmed";
    return [
      `${qualification} results include ${place} ${scope}${discipline ? ` over ${discipline === "Half" ? "half marathon" : discipline}` : ""} at ${clean(event)} (${date}).`,
    ];
  });
  paragraphs.push(...[...new Set(highlights)].slice(0, 3));
  return paragraphs;
}
