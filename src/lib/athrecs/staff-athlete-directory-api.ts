import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { formatAthleteId, parseAthleteId } from "./athlete-id";
import { readProfileDetails, type AthleteProfileDetails } from "./profile-details";
import { loadStaffResultGroups } from "./staff-profile-results.server";
import {
  loadStaffDirectoryPage,
  selectStaffDirectoryNumbers,
} from "./staff-athlete-directory-page.server";

const filterSchema = z.object({
  q: z.string().trim().max(120).default(""),
  sport: z.string().max(100).default(""),
  visibility: z.enum(["", "Public", "Private"]).default(""),
  page: z.number().int().min(1).max(100000).default(1),
});
export type DirectoryFilters = z.input<typeof filterSchema>;
type RawProfile = {
  number: string;
  source_id: number | null;
  slug: string | null;
  name: string;
  country: string;
  city: string;
  nationality: string;
  club: string;
  details: AthleteProfileDetails;
  is_account: boolean;
  account_managed: boolean;
  public: boolean;
  sports: string[];
  coaches: { sport: string; name: string }[];
  results: number;
  birthday: string;
  email: string;
};
export type StaffAthlete = {
  athleteNumber: string;
  athrecsId: string;
  name: string;
  country: string;
  city: string;
  nationality: string;
  club: string;
  details: AthleteProfileDetails;
  visibility: "Public" | "Private";
  registered: boolean;
  canPublish: boolean;
  sports: string[];
  coaches: { sport: string; name: string }[];
  resultCount: number;
  birthday: string;
  email: string;
  sources: { id: number; slug: string }[];
  profilePath: string | null;
};
async function loadDirectory(filters: z.infer<typeof filterSchema>, athleteNumbers?: string[]) {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const rows = await sql<RawProfile>`
    with selected_sources as materialized (
      select i.athlete_id, i.number as athlete_number from athlete_identifiers i
      where ${athleteNumbers ?? null}::bigint[] is not null
        and i.number=any(${athleteNumbers ?? null}::bigint[]) and i.athlete_id is not null
        and not exists(select 1 from athlete_account_links l where l.athlete_id=i.athlete_id and l.status='active')
      union all
      select l.athlete_id,i.number from athlete_identifiers i
      join athlete_account_links l on l.user_id=i.user_id and l.status='active'
      where ${athleteNumbers ?? null}::bigint[] is not null and i.number=any(${athleteNumbers ?? null}::bigint[])
      union all
      select athlete_id,athlete_number from athlete_resolved_ids
      where ${athleteNumbers ?? null}::bigint[] is null
    )
    select i.athlete_number::text as number, a.id as source_id, a.slug, a.display_name as name,
      coalesce(a.country,'') as country, coalesce(a.city,'') as city, coalesce(a.profile_details->>'nationality','') as nationality,
      coalesce(c.name,'') as club, a.profile_details as details, false as is_account,
      exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as account_managed,
      (a.profile_visibility='public' or a.profile_type='Public figure') as public,
      (coalesce(records.sports,array[]::text[]) || athlete_profile_sports_v3(a.profile_details) || array(select distinct sport from athlete_upcoming_events where athlete_id=a.id)
        || array(select distinct sport from athlete_source_histories h
          cross join lateral unnest(athlete_history_sports_v5(h.provider,h.performances)) sport where h.athlete_id=a.id)) as sports,
      '[]'::jsonb as coaches, records.count as results,
      coalesce(a.date_of_birth::text,'') as birthday, '' as email
    from selected_sources i join athletes a on a.id=i.athlete_id left join clubs c on c.id=a.club_id
    cross join lateral (select array_agg(distinct e.sport) as sports,count(*)::int as count from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id where r.athlete_id=a.id) records
    union all
    select i.number::text, null::integer, s.slug, coalesce(nullif(p.display_name,''),p.full_name,u."name",'Athlete'),
      coalesce(p.country,''), coalesce(p.city,''), coalesce(p.nationality,''), coalesce(p.club_or_team,''),
      coalesce(p.profile_details,'{}'::jsonb), true, true, coalesce(s.enabled,false),
      (coalesce(sports.names,array[]::text[]) || array(select distinct sport from athlete_upcoming_events where user_id=p.user_id)), coalesce(sports.coaches,'[]'::jsonb), 0,
      coalesce(p.date_of_birth::text,''), coalesce(p.verified_email,'')
    from athlete_private_profiles p join "user" u on u."id"=p.user_id join athlete_identifiers i on i.user_id=p.user_id
    left join athlete_public_shares s on s.user_id=p.user_id
    cross join lateral (select array_agg(sport_code order by is_primary desc,sport_code) as names,
      jsonb_agg(jsonb_build_object('sport',sport_code,'name',coalesce(coach_name,''))) as coaches from athlete_sport_profiles where user_id=p.user_id) sports
    where (${athleteNumbers ?? null}::bigint[] is null or i.number=any(${athleteNumbers ?? null}::bigint[]))
    order by is_account desc, name, source_id
  `;
  const profiles = new Map<string, StaffAthlete>();
  for (const row of rows) {
    let profile = profiles.get(row.number);
    if (!profile) {
      profile = {
        athleteNumber: row.number,
        athrecsId: formatAthleteId(row.number),
        name: row.name,
        country: row.country,
        city: row.city,
        nationality: row.nationality,
        club: row.club,
        details: readProfileDetails(row.details),
        visibility: row.public ? "Public" : "Private",
        registered: row.is_account,
        canPublish: !row.is_account && !row.account_managed && !row.public,
        sports: [],
        coaches: row.coaches,
        resultCount: 0,
        birthday: row.birthday,
        email: row.email,
        sources: [],
        profilePath: row.public && row.slug ? `/athletes/${row.slug}` : null,
      };
      profiles.set(row.number, profile);
    }
    profile.sports = [...new Set([...profile.sports, ...row.sports.filter(Boolean)])];
    profile.resultCount += row.results;
    if (row.source_id && row.slug) profile.sources.push({ id: row.source_id, slug: row.slug });
  }
  const all = [...profiles.values()].sort((a, b) => a.name.localeCompare(b.name));
  const sports = [...new Set(all.flatMap((profile) => profile.sports))].sort();
  const q = filters.q.toLowerCase();
  const filtered = all.filter(
    (p) =>
      (!q ||
        [p.athrecsId, p.name, p.country, p.city, p.club].join(" ").toLowerCase().includes(q)) &&
      (!filters.sport || p.sports.includes(filters.sport)) &&
      (!filters.visibility || p.visibility === filters.visibility),
  );
  return { all, filtered, sports };
}
async function updateStoredResultCounts(profiles: StaffAthlete[]) {
  const records = await loadStaffResultGroups(
    await getSql(),
    profiles.map((profile) => ({
      key: profile.athleteNumber,
      sourceIds: profile.sources.map((source) => source.id),
    })),
  );
  for (const profile of profiles) {
    profile.resultCount = records.get(profile.athleteNumber)?.resultCount ?? 0;
  }
}

export const getStaffAthleteDirectory = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: DirectoryFilters) => filterSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    const { numbers, ...page } = await loadStaffDirectoryPage(await getSql(), data);
    const { all } = await loadDirectory(filterSchema.parse({}), numbers);
    await updateStoredResultCounts(all);
    const profiles = new Map(all.map((profile) => [profile.athleteNumber, profile]));
    return { ...page, athletes: numbers.flatMap((number) => profiles.get(number) ?? []) };
  });

export const selectAllStaffAthleteProfiles = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: DirectoryFilters) => filterSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    return selectStaffDirectoryNumbers(await getSql(), data);
  });

export const publishStaffAthleteProfiles = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { athleteNumbers: string[] }) =>
    z
      .object({
        athleteNumbers: z
          .array(z.string().regex(/^[1-9]\d{0,17}$/))
          .min(1)
          .max(100000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await ensureAthrecsSeeded();
    const { publishAthleteProfiles } = await import("./athlete-publication.server");
    return publishAthleteProfiles(await getSql(), data.athleteNumbers, context);
  });

/** A private, read-only profile. Public profile visibility is never changed. */
export const getStaffAthleteProfile = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { athleteId: string }) =>
    z.object({ athleteId: z.string().regex(/^ATH-\d{6,18}$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    const number = parseAthleteId(data.athleteId);
    if (!number) return null;
    const { all } = await loadDirectory(filterSchema.parse({}), [number]);
    const athlete = all.find((profile) => profile.athleteNumber === number);
    if (!athlete) return null;
    const sql = await getSql();
    const sourceIds = athlete.sources.map((source) => source.id);
    const records = (await loadStaffResultGroups(sql, [{ key: number, sourceIds }])).get(number)!;
    athlete.resultCount = records.resultCount;
    const bioNotes = await sql<{ label: string; bio: string }>`
      select a.display_name as label, a.bio from athletes a
      where a.id=any(${sourceIds}::int[]) and a.bio <> ''
      union all
      select 'Account biography' as label, b.custom_bio as bio
      from athlete_profile_bios b join athlete_identifiers i on i.user_id=b.user_id
      where i.number=${number}::bigint and b.custom_bio <> ''`;
    const { profileEditorial } = await import("./profile-editorial.server");
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    return {
      editorial: athlete.sources.map((source) => ({
        slug: source.slug,
        ...profileEditorial(source.slug),
      })),
      athlete,
      bioNotes,
      results: records.results,
      sourceHistories: records.sourceHistories,
    };
  });

export const exportStaffAthleteDirectory = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: DirectoryFilters) => filterSchema.parse(input))
  .handler(async ({ data }) => {
    const { filtered } = await loadDirectory(data);
    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "AthRecs";
    workbook.created = new Date();
    const athletes = workbook.addWorksheet("Athletes");
    const sports = workbook.addWorksheet("Sports");
    athletes.addRow([
      "AthRecs ID",
      "Name",
      "Sports",
      "Profile visibility",
      "Registered account",
      "Nationality",
      "Country of birth",
      "Date of birth (staff only)",
      "Birthday display",
      "Running age category",
      "Club / team",
      "Previous club",
      "Coach",
      "Manager",
      "Open to contact",
      "City",
      "Country",
      "Email (staff only)",
      "Stored results",
      "Profile URL",
    ]);
    sports.addRow(["AthRecs ID", "Name", "Sport", "Coach"]);
    for (let offset = 0; offset < filtered.length; offset += 50) {
      const batch = filtered.slice(offset, offset + 50);
      await updateStoredResultCounts(batch);
      for (const p of batch) {
        athletes.addRow([
          p.athrecsId,
          p.name,
          p.sports.join("; "),
          p.visibility,
          p.registered ? "Yes" : "No",
          p.nationality || p.details.nationality,
          p.details.birthCountry,
          p.birthday,
          p.details.birthdayVisibility,
          p.details.runningAgeCategory,
          p.club,
          p.details.previousClub,
          p.details.coach,
          p.details.manager,
          p.details.acceptContact ? "Yes" : "No",
          p.city,
          p.country,
          p.email,
          p.resultCount,
          p.profilePath ? `https://www.athrecs.com${p.profilePath}` : "",
        ]);
        for (const sport of p.sports)
          sports.addRow([
            p.athrecsId,
            p.name,
            sport,
            p.coaches.find((c) => c.sport === sport)?.name || p.details.coach,
          ]);
      }
    }
    for (const sheet of [athletes, sports]) {
      sheet.views = [{ state: "frozen", ySplit: 1 }];
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D5951" } };
      sheet.columns.forEach((column, index) => {
        column.width = index === 1 ? 28 : 22;
      });
    }
    return {
      filename: `athrecs-athletes-${new Date().toISOString().slice(0, 10)}.xlsx`,
      base64: Buffer.from(await workbook.xlsx.writeBuffer()).toString("base64"),
      count: filtered.length,
    };
  });
