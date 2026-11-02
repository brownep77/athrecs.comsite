import type { Sql } from "../db";
import type { EditorialArticle } from "./editorial";
import {
  editorialAthleteNames,
  editorialAthleteReviewRow,
  editorialNameKey,
  type EditorialAthleteCandidate,
} from "./editorial-athletes.ts";

type ReviewedLink = { name: string; athleteId: number | null; removed: boolean };

const publicEligibility = `(a.profile_visibility='public' or a.profile_type='Public figure')
  and exists(select 1 from athlete_resolved_ids public_id where public_id.athlete_id=a.id)
  and not exists(select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
    where l.athlete_id=a.id and l.status='active' and (s.enabled=false or s.share_results=false))`;

async function reviewedLinks(sql: Sql, article: EditorialArticle): Promise<ReviewedLink[]> {
  const rows = await sql.query<{ value: Record<string, unknown> }>(
    `
    select distinct on (after_value->>'name') after_value as value
    from network_audit_log where entity_type='editorial_article' and entity_id=$1
      and action='editorial.athlete_link_reviewed'
    order by after_value->>'name',created_at desc,id desc`,
    [article.slug],
  );
  const names = new Set(editorialAthleteNames(article));
  return rows.flatMap(({ value }) => {
    const name = String(value.name ?? "");
    if (!names.has(name)) return [];
    const id = Number(value.athleteId);
    return [
      {
        name,
        athleteId: Number.isSafeInteger(id) && id > 0 ? id : null,
        removed: value.removed === true,
      },
    ];
  });
}

/** Returns only public slugs; staff candidates, source evidence and notes never cross this boundary. */
export async function readPublicEditorialAthleteLinks(
  sql: Sql,
  article: EditorialArticle,
): Promise<Record<string, string>> {
  const reviews = await reviewedLinks(sql, article);
  const targets = new Map<string, { name: string; slug: string | null; id: number | null }>();
  for (const [name, slug] of Object.entries(article.athleteLinks ?? {}))
    targets.set(name, { name, slug, id: null });
  for (const review of reviews) {
    targets.delete(review.name);
    if (!review.removed && review.athleteId)
      targets.set(review.name, { name: review.name, slug: null, id: review.athleteId });
  }
  if (!targets.size) return {};
  const rows = await sql.query<{ name: string; slug: string }>(
    `
    select wanted.name,a.slug from jsonb_to_recordset($1::jsonb) wanted(name text,slug text,id int)
    join athletes a on (wanted.id is not null and a.id=wanted.id) or (wanted.id is null and a.slug=wanted.slug)
    where ${publicEligibility}`,
    [JSON.stringify([...targets.values()])],
  );
  return Object.fromEntries(rows.map((row) => [row.name, row.slug]));
}

/** Read-only check of every named person in one article; includes private/claimed profiles to avoid duplicates. */
export async function readEditorialAthleteReview(sql: Sql, article: EditorialArticle) {
  const names = editorialAthleteNames(article);
  if (names.length > 250)
    throw new Error(
      "This article has more than 250 athletes. Split its editorial roster before reviewing.",
    );
  if (!names.length) return { rows: [], checkedAt: new Date().toISOString() };
  const reviews = await reviewedLinks(sql, article);
  const reviewedIds = reviews.flatMap((review) =>
    review.athleteId && !review.removed ? [review.athleteId] : [],
  );
  const existingSlugs = Object.values(article.athleteLinks ?? {});
  const keys = names.map(editorialNameKey);
  const rows = await sql.query<
    EditorialAthleteCandidate & { searchName: string; searchKey: string }
  >(
    `
    select a.id as "athleteId", coalesce(i.athlete_number::text,'') as "athleteNumber",a.display_name as name,
      a.display_name as "searchName",a.slug,coalesce(c.name,a.source_club_name,'') as club,
      coalesce(a.country,'') as country,(${publicEligibility}) as public,'athlete:'||a.id as "searchKey"
    from athletes a left join athlete_resolved_ids i on i.athlete_id=a.id left join clubs c on c.id=a.club_id
    where trim(regexp_replace(athlete_directory_search_fold(a.display_name),'\\s+',' ','g'))=any($1::text[])
      or a.id=any($2::int[]) or a.slug=any($3::text[])
    union all
    select null::int,coalesce(i.number::text,''),coalesce(nullif(p.display_name,''),p.full_name),p.full_name,
      null::text,coalesce(p.club_or_team,''),coalesce(p.country,''),false,'account:'||p.user_id
    from athlete_private_profiles p left join athlete_identifiers i on i.user_id=p.user_id
    where trim(regexp_replace(athlete_directory_search_fold(p.full_name),'\\s+',' ','g'))=any($1::text[])
      or trim(regexp_replace(athlete_directory_search_fold(coalesce(p.display_name,'')),'\\s+',' ','g'))=any($1::text[])
    order by name,"athleteNumber","athleteId"`,
    [keys, reviewedIds, existingSlugs],
  );
  const configured = new Map(Object.entries(article.athleteLinks ?? {}));
  for (const review of reviews) {
    configured.delete(review.name);
    const candidate = review.removed
      ? undefined
      : rows.find((row) => row.athleteId === review.athleteId);
    if (candidate?.slug) configured.set(review.name, candidate.slug);
  }
  return {
    checkedAt: new Date().toISOString(),
    rows: names.map((name) => {
      const slug = configured.get(name);
      const key = editorialNameKey(name);
      const candidates = rows.filter(
        (row) =>
          editorialNameKey(row.name) === key ||
          editorialNameKey(row.searchName) === key ||
          Boolean(slug && row.slug === slug),
      );
      const unique = [
        ...new Map(candidates.map((candidate) => [candidate.searchKey, candidate])).values(),
      ].map(({ searchKey: _searchKey, searchName: _searchName, ...candidate }) => candidate);
      return editorialAthleteReviewRow(name, unique, slug);
    }),
  };
}

export async function saveEditorialAthleteLink(
  sql: Sql,
  article: EditorialArticle,
  input: {
    name: string;
    athleteId?: number;
    athleteSlug?: string;
    sourceUrl: string;
    note: string;
    remove?: boolean;
  },
  actor: { userId: string; staffEmail: string },
) {
  if (!actor.userId || !actor.staffEmail) throw new Error("Staff access required.");
  if (!editorialAthleteNames(article).includes(input.name))
    throw new Error("Choose a named athlete from this article.");
  let athleteId: number | null = null;
  if (!input.remove) {
    const [candidate] = await sql.query<{ id: number }>(
      `select a.id from athletes a
      where (($1::int is not null and a.id=$1) or ($1::int is null and a.slug=$2))
        and ${publicEligibility}`,
      [input.athleteId ?? null, input.athleteSlug ?? null],
    );
    if (!candidate)
      throw new Error(
        "This profile is unavailable for a public article link. Keep its privacy settings unchanged.",
      );
    athleteId = candidate.id;
  }
  await sql.query(
    `insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
    values($1,'editorial.athlete_link_reviewed','editorial_article',$2,$3::jsonb,$4)`,
    [
      actor.userId,
      article.slug,
      JSON.stringify({
        name: input.name,
        athleteId,
        removed: Boolean(input.remove),
        sourceUrl: input.sourceUrl,
        checkedAt: new Date().toISOString(),
      }),
      input.note,
    ],
  );
  return { saved: true };
}
