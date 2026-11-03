import type { Sql } from "../db";
import { buildPublicAthletePreview, type PublicAthletePreview } from "./public-athlete-preview";
import { publicCatalogueContent } from "./public-catalogue-content";
import { publicResultVisibilitySql } from "./public-result-visibility.server";
import { resultEditionLabel, resultSlug } from "./result-slug";

/** Resolve only the native results on the displayed page, under current archive permissions. */
export async function buildLinkedPublicAthletePreview(
  sql: Sql,
  input: Parameters<typeof buildPublicAthletePreview>[0],
): Promise<PublicAthletePreview> {
  const preview = buildPublicAthletePreview(input);
  const recorded = preview.entries.flatMap((entry) =>
    entry.kind === "recorded" && entry.result.resultId > 0 && entry.result.editionId > 0
      ? [entry.result]
      : [],
  );
  if (!recorded.length) return preview;
  const rows = await sql.query<{
    result_id: number;
    edition_id: number;
    event_name: string;
    event_date: string;
    distance_code: string;
  }>(
    `select r.id as result_id, ed.id as edition_id, e.name as event_name,
            ed.event_date::text as event_date, ed.distance_code
     from results r join athletes a on a.id = r.athlete_id
     join editions ed on ed.id = r.edition_id join events e on e.id = ed.event_id
     where r.id = any($1::int[])
       and ed.event_date <= (now() at time zone 'Europe/London')::date
       and ${publicResultVisibilitySql}`,
    [recorded.map((result) => result.resultId)],
  );
  const editionLinks: NonNullable<PublicAthletePreview["editionLinks"]> = {};
  for (const row of rows) {
    if (
      recorded.some(
        (result) => result.resultId === row.result_id && result.editionId === row.edition_id,
      )
    ) {
      const edition = publicCatalogueContent(row);
      editionLinks[row.result_id] = {
        slug: resultSlug(edition),
        label: resultEditionLabel(edition),
      };
    }
  }
  return { ...preview, editionLinks };
}
