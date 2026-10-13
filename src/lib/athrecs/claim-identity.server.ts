import type { Sql } from "../db";
import { missingClaimIdentity } from "./result-matching-settings";

export async function requireClaimIdentity(sql: Sql, userId: string) {
  const [identity] = await sql<{
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    verifiedEmail: string;
    emailVerified: boolean;
  }>`
    select p.full_name as "fullName",p.date_of_birth::text as "dateOfBirth",p.nationality,
      u.email as "verifiedEmail",u."emailVerified" as "emailVerified"
    from "user" u left join athlete_private_profiles p on p.user_id=u.id where u.id=${userId}`;
  const missing = missingClaimIdentity(identity);
  if (missing.length)
    throw new Error(
      `Before claiming a profile, add your ${missing.join(", ")} in Personal details. Your selected results have been kept.`,
    );
}
