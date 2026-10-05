import { createHash } from "node:crypto";
import { getSql, dbSource, type Sql } from "../db";
import { IS_RUNRECS_SITE } from "../site-scope";
import { possibleIdentity } from "../staff-results-upload/core";
import {
  athleteSource,
  sourceMatches,
  checkLinkSchema,
  saveLinkSchema,
  type CheckLinkInput,
  type SaveLinkInput,
  type LinkCandidate,
  type LinkReview,
  type LinkReceipt,
} from "./core";

type Actor = { userId: string; staffEmail: string };
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function ready(actor: Actor, write = false) {
  if (!actor.userId || !actor.staffEmail) throw new Error("Staff access required.");
  if (IS_RUNRECS_SITE) throw new Error("Use AthRecs for athlete profile changes.");
  if (dbSource !== "neon")
    throw new Error("The live athlete directory is unavailable. Nothing has been saved.");
  if (write && process.env.VERCEL_ENV === "preview")
    throw new Error("Saving athlete links is disabled on preview deployments.");
  const sql = await getSql();
  const [user] = await sql<{
    verified: boolean;
    email: string;
  }>`select "emailVerified" as verified,email from "user" where id=${actor.userId}`;
  if (!user?.verified || user.email.toLowerCase() !== actor.staffEmail.toLowerCase())
    throw new Error("Sign in with your verified staff account.");
  return sql;
}

type Stored = Omit<LinkCandidate, "key" | "exact" | "conflictingSource"> & {
  sourceUrl: string | null;
};
async function review(sql: Sql, input: CheckLinkInput): Promise<LinkReview> {
  const source = athleteSource(input.url);
  // Compact identity columns only: no result aggregation, email, DOB or account credentials.
  // Use the existing accent/alias-aware matcher over every identity so pagination cannot hide a duplicate.
  const [athletes, accounts, mappings, histories] = await Promise.all([
    sql<Stored>`select a.id,i.athlete_number::text as number,a.display_name as name,
      coalesce(c.name,a.source_club_name,'') as club,coalesce(a.country,'') as country,
      a.profile_visibility as visibility,a.source_url as "sourceUrl",
      exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed
      from athletes a join athlete_resolved_ids i on i.athlete_id=a.id left join clubs c on c.id=a.club_id order by a.id`,
    sql<{
      number: string;
      name: string;
      fullName: string;
      club: string;
      wa: string | null;
      po10: string | null;
      parkrun: string | null;
    }>`
      select i.number::text,coalesce(nullif(p.display_name,''),p.full_name) as name,p.full_name as "fullName",
      coalesce(p.club_or_team,'') as club,p.world_athletics_url as wa,p.power_of_10_url as po10,p.parkrun_id as parkrun
      from athlete_private_profiles p join athlete_identifiers i on i.user_id=p.user_id order by i.number`,
    sql<{
      athlete_id: number;
      external_id: string;
    }>`select athlete_id,external_id from athlete_source_identities where provider=${source.provider} order by athlete_id,external_id`,
    sql<{
      athlete_id: number;
      source_url: string;
    }>`select athlete_id,source_url from athlete_source_histories order by athlete_id,provider,external_id`,
  ]);
  const exact = new Set(
    mappings.filter((m) => m.external_id === source.externalId).map((m) => m.athlete_id),
  );
  for (const h of histories) if (sourceMatches(h.source_url, source)) exact.add(h.athlete_id);
  const matchesName = (name: string) =>
    Boolean(
      (input.name && possibleIdentity(input.name, name)) ||
      (input.searchName && possibleIdentity(input.searchName, name)),
    );
  const candidates: LinkCandidate[] = [];
  for (const a of athletes) {
    const isExact = exact.has(a.id!) || sourceMatches(a.sourceUrl, source);
    if (!isExact && !matchesName(a.name)) continue;
    let conflictingSource = mappings.some(
      (m) => m.athlete_id === a.id && m.external_id !== source.externalId,
    );
    for (const history of histories.filter((h) => h.athlete_id === a.id)) {
      try {
        const previous = athleteSource(history.source_url);
        conflictingSource ||=
          previous.provider === source.provider && previous.externalId !== source.externalId;
      } catch {
        /* Unrecognised history providers are not stable mappings. */
      }
    }
    try {
      const previous = athleteSource((a.sourceUrl ?? "").replace(/^http:/i, "https:"));
      conflictingSource ||=
        previous.provider === source.provider && previous.externalId !== source.externalId;
    } catch {
      /* Unknown source has no identity mapping. */
    }
    candidates.push({
      key: `athlete:${a.id}`,
      id: a.id,
      number: a.number,
      name: a.name,
      club: a.club,
      country: a.country,
      visibility: a.visibility,
      managed: a.managed,
      exact: isExact,
      conflictingSource,
    });
  }
  for (const a of accounts) {
    const isExact =
      sourceMatches(a.wa, source) ||
      sourceMatches(a.po10, source) ||
      (source.provider === "parkrun" && (a.parkrun ?? "").replace(/^A/i, "") === source.externalId);
    if (!isExact && !matchesName(a.name) && !matchesName(a.fullName)) continue;
    const linked = candidates.filter((c) => c.number === a.number);
    if (linked.length) {
      if (isExact)
        linked.forEach((c) => {
          c.exact = true;
        });
      continue;
    }
    candidates.push({
      key: `account:${a.number}`,
      id: null,
      number: a.number,
      name: a.name,
      club: a.club,
      country: "",
      visibility: "owner controlled",
      managed: true,
      exact: isExact,
      conflictingSource: false,
    });
  }
  candidates.sort((a, b) => Number(b.exact) - Number(a.exact) || a.key.localeCompare(b.key));
  const exactCount = candidates.filter((c) => c.exact).length;
  const state =
    exactCount > 1
      ? "conflict"
      : exactCount === 1
        ? "existing"
        : input.name.length < 2
          ? "needs_name"
          : "review";
  const version = hash({ source, name: input.name, searchName: input.searchName, candidates });
  return {
    source,
    name: input.name,
    searchName: input.searchName,
    version,
    state,
    candidates: candidates.slice(0, 30),
    totalCandidates: candidates.length,
  };
}
export async function checkLink(raw: CheckLinkInput, actor: Actor) {
  const input = checkLinkSchema.parse(raw);
  athleteSource(input.url); // Reject unsupported links before any database work.
  return review(await ready(actor), input);
}
export async function saveLink(raw: SaveLinkInput, actor: Actor): Promise<LinkReceipt> {
  const input = saveLinkSchema.parse(raw),
    source = athleteSource(input.url);
  const sql = await ready(actor, true);
  const fingerprint = hash({ ...input, url: source.url });
  return sql.transaction(async (tx) => {
    await tx.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    await tx.query("SET LOCAL lock_timeout = '5s'");
    await tx.query("SET LOCAL statement_timeout = '25s'");
    await tx`select pg_advisory_xact_lock(hashtext('athrecs:single-athlete-link'))`;
    const [prior] = await tx<{
      after_value: { fingerprint: string; receipt: LinkReceipt };
    }>`select after_value from network_audit_log where actor_user_id=${actor.userId} and action='athlete.source_link_saved' and entity_id=${input.requestId}`;
    if (prior) {
      if (prior.after_value.fingerprint !== fingerprint)
        throw new Error("This save request has changed. Check the link again.");
      return { ...prior.after_value.receipt, replay: true };
    }
    const checked = await review(tx, input);
    if (checked.version !== input.version)
      throw new Error("The matching profiles changed. Check the link again before saving.");
    if (checked.state !== "review" || checked.totalCandidates > checked.candidates.length)
      throw new Error(
        "Resolve the existing identity or narrow the search before adding a profile.",
      );
    let id: number;
    if (input.action === "link") {
      const target = checked.candidates.find((c) => c.id === input.athleteId);
      if (!target?.id || target.managed || target.conflictingSource)
        throw new Error(
          "Choose an eligible existing profile. Account-managed or conflicting source identities require separate review.",
        );
      const [locked] = await tx<{
        id: number;
        managed: boolean;
      }>`select a.id,exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed from athletes a where a.id=${target.id} for update`;
      if (!locked || locked.managed)
        throw new Error("The profile is now account-managed. Nothing was changed.");
      id = target.id;
    } else {
      if (input.athleteId !== undefined)
        throw new Error("A new profile cannot specify an existing athlete.");
      if (checked.totalCandidates && !input.differentPerson)
        throw new Error(
          "Confirm that the possible matches are different people before creating another profile.",
        );
      const [created] = await tx<{
        id: number;
      }>`insert into athletes(slug,display_name,gender,city,county,country,bio,source_url,profile_visibility)
        values(${"source-" + source.provider + "-" + source.externalId},${input.name},'U','','','','',${source.url},'private') returning id`;
      id = created.id;
    }
    await tx`insert into athlete_source_identities(provider,external_id,athlete_id,source_url) values(${source.provider},${source.externalId},${id},${source.url})`;
    const [saved] = await tx<{
      name: string;
      number: string;
    }>`select a.display_name as name,i.athlete_number::text as number from athletes a join athlete_resolved_ids i on i.athlete_id=a.id where a.id=${id}`;
    const receipt: LinkReceipt = {
      athleteId: id,
      athleteNumber: saved.number,
      name: saved.name,
      created: input.action === "create",
      replay: false,
    };
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},'athlete.source_link_saved','athlete_source_identity',${input.requestId},${JSON.stringify({ candidates: checked.candidates })}::jsonb,
      ${JSON.stringify({ fingerprint, receipt, source, sourceName: input.name, checks: { sourceChecked: true, identityChecked: true, rightsConfirmed: true }, checkedAt: new Date().toISOString() })}::jsonb,${input.reason})`;
    return receipt;
  });
}
