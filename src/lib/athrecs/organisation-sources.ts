import type { SportsOrganisation } from "../../data/sports-organisations";
import type { FixtureSource } from "./source-registry";

/** Match an actual page, not every organisation hosted on the same domain. */
export function organisationSourceKey(value: string): string {
  const url = new URL(value);
  return `${url.hostname.toLowerCase().replace(/^www\./, "")}${url.port ? `:${url.port}` : ""}${url.pathname.replace(/\/$/, "")}${url.search}`;
}

function groupOrganisations(organisations: SportsOrganisation[]) {
  const groups = new Map<string, SportsOrganisation[]>();
  for (const body of organisations) {
    const key = organisationSourceKey(body.website);
    groups.set(key, [...(groups.get(key) ?? []), body]);
  }
  return groups;
}

export function attachSourceOrganisations(
  sources: FixtureSource[],
  organisations: SportsOrganisation[],
): FixtureSource[] {
  const groups = groupOrganisations(organisations);
  const reviewedLinks: Record<string, string[]> = {
    australian_open_water_swimming_championships_2027: ["swimming-australia"],
    australian_swimming_open_2027: ["swimming-australia"],
    australian_age_swimming_championships_2027: ["swimming-australia"],
    australian_swimming_trials_2027: ["swimming-australia"],
    swimming_australia_results_central: ["swimming-australia"],
    swimming_australia_athlete_profiles: ["swimming-australia"],

    swimming_canada_national_calendar: ["swimming-canada"],
    swimming_canada_upcoming_meets: ["swimming-canada"],
    swimming_canada_results: ["swimming-canada"],
    swimming_canada_athlete_profiles: ["swimming-canada"],
  };
  return sources.map((source) => ({
    ...source,
    organisations: [
      ...new Map(
        [
          ...(groups.get(organisationSourceKey(source.start_url)) ?? []),
          ...organisations.filter((body) => reviewedLinks[source.source_id]?.includes(body.slug)),
        ].map((body) => [body.slug, body]),
      ).values(),
    ].map((body) => ({
      slug: body.slug,
      name: body.name,
      aliases: body.aliases ?? [],
      country: body.country,
      sports: body.sports,
      membershipReference: body.websiteKind === "member-directory",
      directoryCheckedAt: body.checkedAt,
    })),
  }));
}

/** Registration creates research leads only; it never enables a collector. */
export function missingOrganisationSources(
  sources: FixtureSource[],
  organisations: SportsOrganisation[],
): FixtureSource[] {
  const existing = new Set(sources.map((source) => organisationSourceKey(source.start_url)));
  const ids = new Set(sources.map((source) => source.source_id));
  const groups = groupOrganisations(organisations);
  const added: FixtureSource[] = [];
  for (const [key, bodies] of groups) {
    if (existing.has(key)) continue;
    const first = bodies[0];
    const id = `organisation_${first.slug.replaceAll("-", "_")}`;
    if (ids.has(id)) throw new Error(`Organisation source ID collision: ${id}`);
    ids.add(id);
    const membershipOnly = bodies.every((body) => body.websiteKind === "member-directory");
    const dates = [...new Set(bodies.map((body) => body.checkedAt))].sort().join(", ");
    added.push({
      source_id: id,
      source_name:
        bodies.length === 1
          ? first.name
          : `Federation membership directory — ${new URL(first.website).hostname}`,
      start_url: first.website,
      source_type: "directory",
      enabled: false,
      source_section: "Federations and organisations — source discovery",
      region_scope:
        first.country === "International" || bodies.length > 1 ? "International" : first.country,
      country_focus: [...new Set(bodies.map((body) => body.country))].sort().join(" | "),
      coverage_scope: membershipOnly
        ? "Membership reference only"
        : "Fixtures / results / athlete profiles: awaiting assessment",
      coverage_start_year: "",
      coverage_end_year: "",
      surface_scope:
        [...new Set(bodies.flatMap((body) => body.sports))].sort().join(" | ") || "Cross-sport",
      timing_scope: "Not established",
      chip_timed_status: "Not established",
      permission_url: "",
      allowed_domains: new URL(first.website).hostname,
      race_link_include_regex: "",
      race_link_exclude_regex: "",
      profile: "generic",
      follow_history_links: false,
      max_pages: 1,
      rate_limit_seconds: 2,
      rights_status: "Manual research; capabilities and collection rights need review",
      notes: `Backfilled from the sports organisation directory. Original directory check date(s): ${dates}. This is a registry reconciliation, not a fresh website or capability check. ${membershipOnly ? "This page establishes membership only; direct fixture, result and athlete-profile sources still need discovery." : "Open and assess the actual fixture, result and athlete-profile pages before collection."} Registration does not verify participant results or enable automated collection.`,
    });
  }
  return added;
}
