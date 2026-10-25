import thirdDetails from "./urgent-starts-third-2026-10-25.json" with { type: "json" };
import nextDetails from "./urgent-starts-next-2026-10-25.json" with { type: "json" };

const details = { ...nextDetails, ...thirdDetails };

type Page = {
  event: { slug: string };
  distances?: string[];
  upcoming: Array<{
    event_date: string;
    distance_code: string;
    status: string;
    entry_options?: Array<{ entry_type: string; status: string }>;
  }>;
  past?: Array<{ event_date: string }>;
};

/** Edition-scoped public copy; original imported descriptions remain in storage. */
export function reviewedUrgentRacePage<T extends Page>(data: T): T {
  const next = data.upcoming.find((edition) => edition.status !== "Cancelled");
  const candidates = next ? [next] : (data.past ?? []).slice(0, 1);
  for (const edition of candidates) {
    const key = `${data.event.slug}|${edition.event_date}`;
    const detail = (
      details as Record<
        string,
        {
          place: { city: string; county: string };
          summary: string;
          sourceUrl: string;
          starts: Record<string, unknown>;
        }
      >
    )[key];
    if (detail && (!next || Object.hasOwn(detail.starts, next.distance_code))) {
      // The youth-only Mamers review must not replace its adult programme.
      if (data.event.slug === "les-foulees-mamertines") return data;
      return {
        ...data,
        ...(Object.hasOwn(thirdDetails, key) ? { distances: Object.keys(detail.starts) } : {}),
        ...(key === "maule-corre|2026-10-25"
          ? {
              upcoming: data.upcoming.map((row) =>
                row.event_date === edition.event_date &&
                Object.hasOwn(detail.starts, row.distance_code)
                  ? {
                      ...row,
                      entry_options: row.entry_options?.map((option) =>
                        option.entry_type === "official" ? { ...option, status: "closed" } : option,
                      ),
                    }
                  : row,
              ),
            }
          : {}),
        event: {
          ...data.event,
          ...detail.place,
          ...(data.event.slug === "wa-privatbank-kyiv-unbroken-marathon-7237779"
            ? { area: "5 Heroiv Maidanu Street, Khmelnytskyi" }
            : {}),
          summary: detail.summary,
          description: detail.summary,
          website: detail.sourceUrl,
        },
      };
    }
    if (key === "wa-serbian-cross-country-championships-7240001|2026-10-24") {
      return {
        ...data,
        event: {
          ...data.event,
          summary:
            "The Serbian cross-country championships took place on 24 October 2026. The federation's competition service publishes the results.",
          description:
            "The Serbian cross-country championships took place on 24 October 2026. The federation's competition service publishes the results.",
          website: "https://serbia.opentrack.run/en-gb/x/2026/SRB/kros26/",
        },
      };
    }
  }
  return data;
}

/** Keep a cancellation visible even when it is excluded from upcoming races. */
export const URGENT_RACE_PAGE_NOTICES = {
  "wa-5th-shuhei-nishida-memorial-track-and-field-tournament-7244642|2026-10-25": {
    sourceUrl: "https://games.athleteranking.com/gamedata.php?gid=zha12026029",
    checkedAt: "2026-10-25",
    note: "Sunday 25 October 2026: the remaining programme was cancelled due to heavy rain. The notice was issued at 10:30 JST. Saturday's competition is unaffected.",
  },
};
