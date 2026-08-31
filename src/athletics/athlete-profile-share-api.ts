import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import * as base from "../lib/athrecs/athlete-profile-share-api";

export * from "../lib/athrecs/athlete-profile-share-api";

export const getPublishedSharedProfile = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const profile = await base.getPublishedSharedProfile({ data });
    if (!profile) return null;

    await ensureAthrecsSeeded();
    const sql = await getSql();
    const allowedRows = await sql<{ result_id: number }>`
      select result.id as result_id
      from athlete_public_shares share
      join athlete_account_links account_link
        on account_link.user_id = share.user_id
       and account_link.status = 'active'
      join results result on result.athlete_id = account_link.athlete_id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      where share.slug = ${data.slug.trim().toLowerCase()}
        and share.enabled = true
        and event.sport = 'Athletics'
    `;
    const allowedResultIds = new Set(allowedRows.map((row) => row.result_id));
    const results = profile.results.filter((result) => allowedResultIds.has(result.resultId));
    const athleticsPrimary = profile.primarySport === "Athletics";
    if (!athleticsPrimary && !results.length) return null;

    return {
      ...profile,
      primarySport: "Athletics",
      bio: athleticsPrimary ? profile.bio : "",
      results,
    };
  });
