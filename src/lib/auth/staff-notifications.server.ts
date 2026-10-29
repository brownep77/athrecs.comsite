import type { Sql } from "@/lib/db";

export type StaffNotificationCategory = "support" | "fixtures" | "results" | "partnerships";

// Transport boundary, separate from both routing configuration and staff authentication.
// Retain info@ for legacy claim payloads that were frozen before category routing.
const ALLOWED_RECIPIENTS = new Set([
  "paul@athrecs.com",
  "paultwbrowne@gmail.com",
  "support@athrecs.com",
  "fixtures@athrecs.com",
  "results@athrecs.com",
  "partnerships@athrecs.com",
  "info@athrecs.com",
]);

export function isStaffNotificationRecipient(value: string): boolean {
  return ALLOWED_RECIPIENTS.has(value);
}

export async function staffNotificationRecipients(
  sql: Sql,
  category: StaffNotificationCategory,
  synthetic = false,
): Promise<string[]> {
  const rows = await sql<{ recipient: string }>`
    select recipient from athrecs_notification_recipients(${category},${synthetic}) order by recipient
  `;
  return rows.map((row) => row.recipient).filter(isStaffNotificationRecipient);
}
