import { getSql, type Sql } from "@/lib/db";
import { sendSignupEmail, signupAlertsReady } from "@/lib/auth/signup-alerts.server";
import type { ProfileSetup } from "./profile-setup";

type Email = Parameters<typeof sendSignupEmail>[0];
const url = "https://update.athrecs.com/admin/athlete-accounts";
const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
export async function deliverProfileSetupAlerts(sql: Sql, userId?: string, send = sendSignupEmail) {
  const jobs = await sql.transaction(async (tx) => {
    const rows = await tx<{
      id: number;
      recipient: string;
      email: string;
      details: ProfileSetup;
      request_id: number;
      submitted_at: string;
      synthetic_test: boolean;
      email_payload: Email | null;
      expired: boolean;
    }>`
      select a.id,a.recipient,u.email,r.details,r.id as request_id,r.created_at::text as submitted_at,
      athrecs_is_test_user(r.user_id) as synthetic_test,a.email_payload,a.first_attempt_at<now()-interval '23 hours' as expired
      from athlete_profile_setup_alerts a join athlete_profile_setup_requests r on r.id=a.request_id join "user" u on u.id=r.user_id
      where a.sent_at is null and not a.needs_review and a.next_attempt_at<=now()
      and (${userId ?? null}::text is null or r.user_id=${userId ?? null}) order by a.next_attempt_at,a.id limit 10 for update of a skip locked`;
    const ready: Array<{ id: number; email: Email }> = [];
    for (const row of rows) {
      if (row.expired) {
        await tx`update athlete_profile_setup_alerts set needs_review=true,last_error='Check delivery with email provider before retrying.' where id=${row.id}`;
        continue;
      }
      const d = row.details;
      const hasMatchingDetails = Boolean(
        d.currentClub || d.previousClubs.length || d.previousNames.length || d.sourceUrls.length,
      );
      const submitted = new Date(row.submitted_at).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        timeZoneName: "short",
      });
      const summary = hasMatchingDetails
        ? "Profile matching information was supplied. Review the details below and look for missing results."
        : "Only name and email supplied; no club, previous names or profile links supplied.";
      const text = `An athlete saved their profile form and requested result matching.\n\n${summary}\n\nRequest: #${row.request_id}\nSubmitted: ${submitted}\nName: ${d.fullName}\nEmail: ${row.email}\nCurrent club: ${d.currentClub || "Not supplied"}\nPrevious clubs: ${d.previousClubs.join(", ") || "Not supplied"}\nPrevious names: ${d.previousNames.join(", ") || "Not supplied"}\nProfile links:\n${d.sourceUrls.join("\n") || "None supplied"}\n\nStaff queue: ${url}\n\nThe athlete can claim available results immediately. Links are research leads, not verified ownership or an automatic feed.`;
      const email: Email = row.email_payload ?? {
        from: "paul@athrecs.com",
        to: [row.recipient],
        reply_to: row.email,
        subject: `${row.synthetic_test ? "[FICTIONAL TEST] " : ""}AthRecs profile details saved — ${d.fullName.replace(/\s+/g, " ").trim().slice(0, 120)}`,
        text,
        html: `<p style="white-space:pre-line">${escapeHtml(text)}</p><p><a href="${url}">Open the private staff queue</a></p>`,
      };
      await tx`update athlete_profile_setup_alerts set email_payload=${JSON.stringify(email)}::jsonb,first_attempt_at=coalesce(first_attempt_at,now()),next_attempt_at=now()+interval '1 minute' where id=${row.id}`;
      ready.push({ id: row.id, email });
    }
    return ready;
  });
  const outcomes = await Promise.all(
    jobs.map(async (job) => {
      try {
        await send(job.email, `athrecs-profile-setup-${job.id}`);
        await sql`update athlete_profile_setup_alerts set sent_at=coalesce(sent_at,now()),last_error=null where id=${job.id}`;
        return true;
      } catch {
        await sql`update athlete_profile_setup_alerts set last_error='Email delivery unconfirmed; retry queued.' where id=${job.id} and sent_at is null`;
        return false;
      }
    }),
  );
  const sent = outcomes.filter(Boolean).length;
  return { sent, failed: jobs.length - sent };
}
export async function notifyProfileSetup(userId: string) {
  if (!signupAlertsReady()) return;
  try {
    await deliverProfileSetupAlerts(await getSql(), userId);
  } catch {
    console.error("[profile-setup] Staff notification remains queued.");
  }
}
