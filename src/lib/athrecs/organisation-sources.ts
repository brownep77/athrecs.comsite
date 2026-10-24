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
    world_aquatics_calendar: ["world-aquatics"],
    world_aquatics_results: ["world-aquatics"],
    world_aquatics_athletes: ["world-aquatics"],

    aquatics_gb_about: ["aquatics-gb"],
    aquatics_gb_events: ["aquatics-gb"],
    aquatics_gb_results: ["aquatics-gb"],
    aquatics_gb_swimming_profiles: ["aquatics-gb"],
    aquatics_gb_swimming_results: ["aquatics-gb"],
    aquatics_gb_para_swimming_results: ["aquatics-gb"],
    aquatics_gb_diving_results: ["aquatics-gb"],
    aquatics_gb_para_swimming_profiles: ["aquatics-gb"],
    aquatics_gb_diving_profiles: ["aquatics-gb"],
    aquatics_gb_artistic_swimming_profiles: ["aquatics-gb"],
    swim_england_east_region_home: ["swim-england-east-region"],
    swim_england_south_east_region_home: ["swim-england-south-east-region"],

    sasa_east_district: ["sasa-east-district"],
    sasa_midland_district: ["sasa-midland-district"],
    sasa_north_district: ["sasa-north-district"],
    sasa_west_district: ["sasa-west-district"],
    scottish_schools_swimming: ["scottish-schools-swimming-association"],
    sasa_east_about: ["sasa-east-district"],
    sasa_midland_about: ["sasa-midland-district"],
    sasa_east_lothian_results: ["sasa-east-district"],
    sasa_midland_results: ["sasa-midland-district"],
    sasa_north_2026_meets: ["sasa-north-district"],
    sasa_north_2027_meets: ["sasa-north-district"],
    sasa_west_2027_club_meets: ["sasa-west-district"],
    sasa_west_results: ["sasa-west-district"],
    scottish_schools_2026_results: ["scottish-schools-swimming-association"],
    scottish_schools_2026_team_results: ["scottish-schools-swimming-association"],
    team_scotland_duncan_scott: ["scottish-swimming"],
    aquatics_gb_duncan_scott: ["aquatics-gb"],

    swim_england_regions: ["swim-england"],
    swim_england_north_west_region: ["swim-england-north-west-region"],
    swim_england_north_east_region: ["swim-england-north-east-region"],
    swim_england_east_midlands_region: ["swim-england-east-midlands-region"],
    swim_england_west_midland_region: ["swim-england-west-midland-region"],
    swim_england_london_region: ["swim-england-london-region"],
    swim_england_south_west_region: ["swim-england-south-west-region"],
    north_west_swimming_2027: ["swim-england-north-west-region"],
    east_midlands_swimming_2027: ["swim-england-east-midlands-region"],
    north_west_swimming_results: ["swim-england-north-west-region"],
    south_west_swimming_results: ["swim-england-south-west-region"],
    london_swimming_results: ["swim-england-london-region"],
    north_east_swimming_results: ["swim-england-north-east-region"],
    east_midlands_swimming_competitions: ["swim-england-east-midlands-region"],
    west_midland_age_group_swimming: ["swim-england-west-midland-region"],
    team_england_abbie_wood_profile: ["swim-england"],
    aquatics_gb_abbie_wood_profile: ["aquatics-gb"],

    east_region_swimming_competitions: ["swim-england-east-region"],
    east_region_swimming_results: ["swim-england-east-region"],
    east_region_swimming_2027_dates: ["swim-england-east-region"],
    south_east_swimming_2027: ["swim-england-south-east-region"],
    south_east_swimming_results: ["swim-england-south-east-region"],
    teamsa_pieter_coetze_profile: ["sascoc"],
    east_region_swimming_2027_weekend_1: ["swim-england-east-region"],
    east_region_swimming_2027_weekend_2: ["swim-england-east-region"],
    east_region_swimming_2027_weekend_3: ["swim-england-east-region"],
    east_region_swimming_2027_weekend_4: ["swim-england-east-region"],

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
