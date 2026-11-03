import type { Sql } from "../db";

/** Account access and recorded result ownership are not independent identity checks. */
export async function hasReviewedAthleteManagement(sql: Sql, userId: string, athleteId: number) {
  const [row] = await sql<{ reviewed: boolean }>`
    select athlete_management_reviewed(${athleteId}, ${userId}) as reviewed`;
  return row?.reviewed === true;
}

export async function hasUnreviewedAthleteLinks(sql: Sql, userId: string) {
  const [row] = await sql<{ required: boolean }>`
    select exists (select 1 from athlete_account_links link
      where link.user_id=${userId} and link.status='active'
        and not athlete_management_reviewed(link.athlete_id, link.user_id)) as required`;
  return row?.required === true;
}

export async function requireReviewedAthleteManagement(
  sql: Sql,
  userId: string,
  athleteId: number,
) {
  if (!(await hasReviewedAthleteManagement(sql, userId, athleteId))) {
    throw new Error(
      "Staff must review your ownership before you can manage or represent this athlete profile. Your account and saved results are retained.",
    );
  }
}
