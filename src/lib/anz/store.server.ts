import { createHash } from "node:crypto";
import type { Sql } from "../db";
import { ANZ_PROVIDER, anzSource, anzPerformanceKey, type AnzCapture } from "./core.ts";
import type { SourcePerformance } from "../athrecs/source-performance-history.ts";
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export async function anzTarget(sql: Sql, athleteId: number, capture: AnzCapture) {
  const [athlete] = await sql<{
    id: number;
    display_name: string;
    slug: string;
    profile_visibility: string;
    source_url: string | null;
    profile_details: Record<string, unknown>;
    managed: boolean;
  }>`
    select a.id,a.display_name,a.slug,a.profile_visibility,a.source_url,a.profile_details,
    exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed
    from athletes a where a.id=${athleteId}`;
  if (!athlete || athlete.managed)
    throw new Error(
      "Choose an existing, unclaimed athlete profile. Account-managed profiles require owner review.",
    );
  if (normalName(athlete.display_name) !== normalName(capture.name))
    throw new Error("ANZ name does not match this athlete. Resolve identity before importing.");
  const identities = await sql<{
    athlete_id: number;
    external_id: string;
  }>`select athlete_id,external_id from athlete_source_identities where provider='anzrankings' and (athlete_id=${athleteId} or external_id=${capture.externalId})`;
  const histories = await sql<{
    athlete_id: number;
    external_id: string;
    source_url: string;
    performances: SourcePerformance[];
    published_at: string | null;
    complete: boolean;
    captured_at: string;
  }>`
    select athlete_id,external_id,source_url,performances,published_at,complete,captured_at from athlete_source_histories where provider=${ANZ_PROVIDER} and (athlete_id=${athleteId} or external_id=${capture.externalId})`;
  if (
    [...identities, ...histories].some(
      (h) => h.athlete_id !== athleteId || h.external_id !== capture.externalId,
    )
  )
    throw new Error("Conflicting ANZ athlete identities require review.");
  let sourceMatch = false;
  try {
    sourceMatch = anzSource(athlete.source_url ?? "").externalId === capture.externalId;
  } catch {
    /* Other providers do not establish an ANZ identity. */
  }
  if (!sourceMatch && !identities.length && !histories.length)
    throw new Error("Link this ANZ profile to the athlete before importing results.");
  const previous = histories[0] ?? null;
  // Automatic refreshes may add rows, but cannot silently remove or correct old evidence.
  for (const old of previous?.performances ?? []) {
    if (
      !capture.history.performances.some(
        (row) =>
          row.date === old.date &&
          row.discipline === old.discipline &&
          row.performance === old.performance &&
          row.wind === old.wind &&
          row.place === old.place,
      )
    )
      throw new Error(
        "An existing ANZ performance is missing or changed at source. Review the original evidence before refreshing.",
      );
  }
  const content = { ...capture, history: { ...capture.history, capturedAt: "" } };
  return { athlete, previous, version: hash({ athlete, previous, content }) };
}
export async function saveAnzCapture(
  sql: Sql,
  athleteId: number,
  capture: AnzCapture,
  version: string,
  actor: { userId?: string; email?: string; note: string },
) {
  return sql.transaction(async (tx) => {
    await tx.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    await tx.query("SET LOCAL lock_timeout = '5s'");
    await tx`select pg_advisory_xact_lock(hashtext(${"athrecs:anz:" + capture.externalId}))`;
    await tx`select id from athletes where id=${athleteId} for update`;
    const target = await anzTarget(tx, athleteId, capture);
    if (target.version !== version)
      throw new Error("ANZ or AthRecs data changed. Preview again before saving.");
    const previousByKey = new Map(
      (target.previous?.performances ?? []).map((row) => [anzPerformanceKey(row), row]),
    );
    const rows = capture.history.performances.map((row) => {
      const old = previousByKey.get(anzPerformanceKey(row));
      // Never clear a staff exclusion or disqualification during a source refresh.
      const exclusions = (target.previous?.performances ?? []).filter(
        (old) => old.date === row.date && old.discipline === row.discipline,
      );
      return {
        ...row,
        ...(old?.eventSlug ? { eventSlug: old.eventSlug } : {}),
        ...(exclusions.some((old) => old.profileExcluded) ? { profileExcluded: true } : {}),
        ...(exclusions.find((old) => old.disqualification)?.disqualification
          ? { disqualification: exclusions.find((old) => old.disqualification)!.disqualification }
          : {}),
      };
    });
    const metadata = {
      provider: ANZ_PROVIDER,
      externalId: capture.externalId,
      sourceUrl: capture.sourceUrl,
      sourceName: capture.name,
      club: capture.club,
      coach: capture.coach,
      verificationStatus: "source_verified",
      capturedAt: capture.history.capturedAt,
      eventCount: capture.eventCount,
      performanceCount: rows.length,
      coverage:
        "All performances returned by ANZ’s listed event searches; ANZ may omit other races.",
      medals: capture.medals,
    };
    await tx`insert into athlete_source_identities(provider,external_id,athlete_id,source_url) values('anzrankings',${capture.externalId},${athleteId},${capture.sourceUrl}) on conflict(provider,external_id) do nothing`;
    await tx`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
      values(${athleteId},${ANZ_PROVIDER},${capture.externalId},${capture.sourceUrl},${capture.history.capturedAt},true,${capture.history.yearsExpected},${capture.history.yearsCaptured},${JSON.stringify(rows)}::jsonb)
      on conflict(athlete_id,provider,external_id) do update set captured_at=excluded.captured_at,complete=excluded.complete,years_expected=excluded.years_expected,years_captured=excluded.years_captured,performances=excluded.performances`;
    await tx`update athletes set profile_details=coalesce(profile_details,'{}'::jsonb) || ${JSON.stringify({ anzImport: metadata, result_import_status: "anz_available_performances_imported" })}::jsonb where id=${athleteId}`;
    const receipt = {
      athleteId,
      slug: target.athlete.slug,
      performances: rows.length,
      previousPerformances: target.previous?.performances.length ?? 0,
      medals: capture.medals.length,
      published: Boolean(
        target.previous?.published_at && target.athlete.profile_visibility === "public",
      ),
    };
    await tx`insert into network_audit_log(actor_user_id,actor_email,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId ?? null},${actor.email ?? null},'athlete.anz_imported','athlete',${String(athleteId)},${JSON.stringify({ profileDetails: target.athlete.profile_details, history: target.previous })}::jsonb,${JSON.stringify({ metadata, history: { ...capture.history, performances: rows }, receipt })}::jsonb,${actor.note})`;
    return receipt;
  });
}
