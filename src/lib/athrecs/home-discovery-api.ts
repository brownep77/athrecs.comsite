import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { getAthleteDirectory } from "./athlete-directory-api";
import { getAthleteBySlug, listEvents } from "./api";
import { homeProfileSlugs } from "./home-discovery.server";
import { findPersonalBests, timingBasis } from "./profile-records";
import { buildProfileAchievements, isCompletedResult } from "./profile-achievements";
import { formatDuration, formatStartTime, todayIso } from "./format";
import type { Sport } from "./types";

const input = z.object({ sport: z.string().trim().max(80).optional() });
const EVENT_SPORTS: Sport[] = ["Running", "Athletics", "Cycling", "Swimming", "Triathlon"];

function publicEventUrl(event: { sport: string; slug: string; website: string }) {
  if (event.sport === "Athletics") return `/races/${encodeURIComponent(event.slug)}`;
  if (["Running", "Parkrun"].includes(event.sport))
    return `https://www.runrecs.com/races/${encodeURIComponent(event.slug)}`;
  try {
    const url = new URL(event.website);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export const getHomeDiscovery = createServerFn({ method: "GET" })
  .validator((data: z.input<typeof input> | undefined) => input.parse(data ?? {}))
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const sports = data.sport ? EVENT_SPORTS.filter((sport) => sport === data.sport) : EVENT_SPORTS;
    const [directory, slugs, eventGroups] = await Promise.all([
      getAthleteDirectory({ data: { sport: data.sport, pageSize: 3 } }),
      homeProfileSlugs(sql, data.sport || null),
      Promise.all(
        sports.map((sport) =>
          listEvents({
            data: { sport, upcomingOnly: true, limit: 3 },
          }),
        ),
      ),
    ]);
    const profiles = await Promise.all(slugs.map(({ slug }) => getAthleteBySlug({ data: slug })));
    const today = todayIso();
    const people = profiles.flatMap((profile) => {
      if (!profile) return [];
      // Reuse profile eligibility, conflict and disqualification rules. Do not
      // turn incomplete fields or unsupported sports into synthetic results.
      const results = profile.profileResults.filter(
        (result) =>
          (!data.sport || result.sport === data.sport) &&
          result.eventDate <= today &&
          isCompletedResult(result),
      );
      if (!results.length) return [];
      const bests = findPersonalBests(results)
        .slice(0, 4)
        .map((result) => ({
          id: result.resultId,
          sport: result.sport,
          distance: result.distanceCode,
          distanceKm: result.distanceKm,
          surface: result.surface,
          value: formatDuration(result.finishTimeSeconds),
          basis: timingBasis(result),
        }));
      return [
        {
          id: profile.athlete.id,
          slug: profile.athlete.slug,
          name: profile.athlete.display_name,
          country: profile.athlete.country,
          club: profile.athlete.club === "Unattached" ? null : profile.athlete.club,
          sports: [...new Set(results.map((r) => r.sport))],
          bests,
          resultCount: results.length,
          achievements: buildProfileAchievements(results)
            .milestones.slice(0, 2)
            .map(({ id, title, rule }) => ({ id, title, rule })),
          results: results.slice(0, 6).map((result) => ({
            id: result.resultId,
            date: result.eventDate,
            event: result.eventName,
            sport: result.sport,
            distance: result.distanceCode,
            time: formatDuration(result.finishTimeSeconds),
            basis: timingBasis(result),
          })),
        },
      ];
    });
    // Interleave sports before filling remaining spaces; use only genuine
    // catalogue dates, venue-local start times and existing destination URLs.
    const events = [0, 1, 2].flatMap((i) =>
      eventGroups.flatMap((group) => {
        const event = group[i];
        if (!event?.next_date || event.next_date < today) return [];
        const href = publicEventUrl(event);
        if (!href) return [];
        return [
          {
            id: event.id,
            name: event.name,
            sport: event.sport,
            date: event.next_date,
            location: [event.city, event.country].filter(Boolean).join(", "),
            country: event.country,
            distance: event.next_distance,
            time: formatStartTime(event.next_start_time, {
              country: event.country,
              county: event.county,
              date: event.next_date,
            }),
            href,
            destination:
              event.sport === "Athletics"
                ? "AthRecs"
                : ["Running", "Parkrun"].includes(event.sport)
                  ? "RunRecs"
                  : "Event website",
          },
        ];
      }),
    );
    return { directory, people, events };
  });
export type HomeDiscovery = Awaited<ReturnType<typeof getHomeDiscovery>>;
export type HomePerson = HomeDiscovery["people"][number];

const searchInput = z.object({
  kind: z.enum(["Athletes", "Results", "Events", "Clubs"]),
  q: z.string().trim().max(120),
  sport: z.string().trim().max(80).optional(),
});
export const searchHomeDiscovery = createServerFn({ method: "GET" })
  .validator((data: z.input<typeof searchInput>) => searchInput.parse(data))
  .handler(async ({ data }) => {
    if (data.kind === "Events") {
      const sport = EVENT_SPORTS.find((sport) => sport === data.sport);
      if (data.sport && !sport) return [];
      const events = await listEvents({
        data: { q: data.q, sport, upcomingOnly: true, limit: 12 },
      });
      return events.flatMap((event) => {
        const href = publicEventUrl(event);
        return href
          ? [
              {
                href,
                label: event.name,
                detail: [event.sport, event.next_date, event.city, event.country]
                  .filter(Boolean)
                  .join(" · "),
              },
            ]
          : [];
      });
    }
    if (data.kind === "Clubs") {
      // Existing club pages have an Athletics catalogue boundary. Preserve it.
      const { listClubs } = await import("../../athletics/api");
      const clubs = await listClubs({ data: { q: data.q } });
      return clubs
        .slice(0, 8)
        .map((club) => ({
          href: `/clubs/${encodeURIComponent(club.slug)}`,
          label: club.name,
          detail: [club.city, club.country].filter(Boolean).join(" · "),
        }));
    }
    const directory = await getAthleteDirectory({
      data: { q: data.q, sport: data.sport, pageSize: 8 },
    });
    return directory.athletes
      .filter((athlete) => data.kind !== "Results" || athlete.result_count > 0)
      .map((athlete) => ({
        href: `/athletes/${encodeURIComponent(athlete.slug)}`,
        label: athlete.display_name,
        detail: [athlete.club, athlete.country, `${athlete.result_count} recorded results`]
          .filter(Boolean)
          .join(" · "),
      }));
  });
