import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { formatAthleteId } from "./athlete-id";
import { readProfileDetails, type AthleteProfileDetails } from "./profile-details";

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
  sports: string[];
  coaches: { sport: string; name: string }[];
  resultCount: number;
  birthday: string;
  email: string;
  sources: { id: number; slug: string }[];
  profilePath: string | null;
};
async function loadDirectory(filters: z.infer<typeof filterSchema>) {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const rows = await sql<RawProfile>`
    select i.athlete_number::text as number, a.id as source_id, a.slug, a.display_name as name,
      coalesce(a.country,'') as country, coalesce(a.city,'') as city, coalesce(a.profile_details->>'nationality','') as nationality,
      coalesce(c.name,'') as club, a.profile_details as details, false as is_account,
      (a.profile_visibility='public' or a.profile_type='Public figure') as public,
      (coalesce(records.sports,array[]::text[]) || array(select distinct sport from athlete_upcoming_events where athlete_id=a.id)) as sports, '[]'::jsonb as coaches, records.count as results,
      coalesce(a.date_of_birth::text,'') as birthday, '' as email
    from athletes a join athlete_resolved_ids i on i.athlete_id=a.id left join clubs c on c.id=a.club_id
    cross join lateral (select array_agg(distinct e.sport) as sports,count(*)::int as count from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id where r.athlete_id=a.id) records
    union all
    select i.number::text, null::integer, s.slug, coalesce(nullif(p.display_name,''),p.full_name,u."name",'Athlete'),
      coalesce(p.country,''), coalesce(p.city,''), coalesce(p.nationality,''), coalesce(p.club_or_team,''),
      coalesce(p.profile_details,'{}'::jsonb), true, coalesce(s.enabled,false),
      (coalesce(sports.names,array[]::text[]) || array(select distinct sport from athlete_upcoming_events where user_id=p.user_id)), coalesce(sports.coaches,'[]'::jsonb), 0,
      coalesce(p.date_of_birth::text,''), coalesce(p.verified_email,'')
    from athlete_private_profiles p join "user" u on u."id"=p.user_id join athlete_identifiers i on i.user_id=p.user_id
    left join athlete_public_shares s on s.user_id=p.user_id
    cross join lateral (select array_agg(sport_code order by is_primary desc,sport_code) as names,
      jsonb_agg(jsonb_build_object('sport',sport_code,'name',coalesce(coach_name,''))) as coaches from athlete_sport_profiles where user_id=p.user_id) sports
    order by is_account desc, name
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
export const getStaffAthleteDirectory = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: DirectoryFilters) => filterSchema.parse(input))
  .handler(async ({ data }) => {
    const { all, filtered, sports } = await loadDirectory(data);
    const page = Math.min(data.page, Math.max(1, Math.ceil(filtered.length / 50)));
    return {
      athletes: filtered.slice((page - 1) * 50, page * 50),
      total: filtered.length,
      totalStored: all.length,
      page,
      pages: Math.max(1, Math.ceil(filtered.length / 50)),
      sports,
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
    for (const p of filtered) {
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
