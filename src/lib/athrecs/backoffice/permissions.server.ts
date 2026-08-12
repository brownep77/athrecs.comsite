import { dbSource, type Sql } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth/verify.server";

export type OrganisationRole =
  | "owner"
  | "admin"
  | "editor"
  | "results_manager"
  | "viewer";

export type OrganisationCapability =
  | "view"
  | "edit_event"
  | "manage_entries"
  | "upload_results"
  | "manage_members";

export type PlatformRole =
  | "superadmin"
  | "data_reviewer"
  | "support"
  | "analyst";

const ROLE_CAPABILITIES: Record<OrganisationRole, ReadonlySet<OrganisationCapability>> = {
  owner: new Set(["view", "edit_event", "manage_entries", "upload_results", "manage_members"]),
  admin: new Set(["view", "edit_event", "manage_entries", "upload_results", "manage_members"]),
  editor: new Set(["view", "edit_event"]),
  results_manager: new Set(["view", "upload_results"]),
  viewer: new Set(["view"]),
};

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

function isPreviewSuperuser(userId: string): boolean {
  return dbSource === "pglite" && userId === DEV_USER_ID;
}

function isOrganisationRole(value: string): value is OrganisationRole {
  return Object.prototype.hasOwnProperty.call(ROLE_CAPABILITIES, value);
}

export async function getOrganisationRole(
  sql: Sql,
  userId: string,
  organisationId: number,
): Promise<OrganisationRole | null> {
  if (isPreviewSuperuser(userId)) return "owner";
  const rows = await sql<{ role: string }>`
    select om.role
    from organisation_members om
    join organisations o on o.id = om.organisation_id
    where om.organisation_id = ${organisationId}
      and om.user_id = ${userId}
      and om.status = 'active'
      and o.active = true
      and o.verification_status in ('verified', 'athrecs_verified')
    limit 1
  `;
  const role = rows[0]?.role;
  return role && isOrganisationRole(role) ? role : null;
}

export async function requireOrganisationCapability(
  sql: Sql,
  userId: string,
  organisationId: number,
  capability: OrganisationCapability,
): Promise<OrganisationRole> {
  const role = await getOrganisationRole(sql, userId, organisationId);
  if (!role || !ROLE_CAPABILITIES[role].has(capability)) {
    throw new ForbiddenError(
      `Your organisation role does not permit ${capability.replaceAll("_", " ")}`,
    );
  }
  return role;
}

export async function requireEventCapability(
  sql: Sql,
  userId: string,
  organisationId: number,
  eventId: number,
  capability: Exclude<OrganisationCapability, "manage_members">,
): Promise<OrganisationRole> {
  const role = await requireOrganisationCapability(
    sql,
    userId,
    organisationId,
    capability,
  );
  if (isPreviewSuperuser(userId)) return role;

  const rows = await sql<{
    can_edit_event: boolean;
    can_manage_entries: boolean;
    can_upload_results: boolean;
  }>`
    select can_edit_event, can_manage_entries, can_upload_results
    from event_organisations
    where event_id = ${eventId}
      and organisation_id = ${organisationId}
      and status = 'active'
    limit 1
  `;
  const permission = rows[0];
  const allowed =
    capability === "view"
      ? Boolean(permission)
      : capability === "edit_event"
        ? permission?.can_edit_event
        : capability === "manage_entries"
          ? permission?.can_manage_entries
          : permission?.can_upload_results;

  if (!allowed) {
    throw new ForbiddenError("This organisation is not authorised for that event action");
  }
  return role;
}

export async function hasPlatformRole(
  sql: Sql,
  userId: string,
  allowedRoles: readonly PlatformRole[],
): Promise<boolean> {
  if (isPreviewSuperuser(userId)) return true;
  const rows = await sql<{ role: string }>`
    select role
    from platform_user_roles
    where user_id = ${userId}
      and active = true
  `;
  return rows.some((row) => allowedRoles.includes(row.role as PlatformRole));
}

export async function requirePlatformRole(
  sql: Sql,
  userId: string,
  allowedRoles: readonly PlatformRole[],
): Promise<void> {
  if (!(await hasPlatformRole(sql, userId, allowedRoles))) {
    throw new ForbiddenError("Athrecs reviewer permission is required");
  }
}

export async function canManageAthlete(
  sql: Sql,
  userId: string,
  athleteId: number,
): Promise<boolean> {
  if (isPreviewSuperuser(userId)) return true;
  if (await hasPlatformRole(sql, userId, ["superadmin", "data_reviewer"])) {
    return true;
  }
  const rows = await sql<{ ok: boolean }>`
    select true as ok
    from athlete_claims
    where athlete_id = ${athleteId}
      and user_id = ${userId}
      and status in ('approved', 'verified')
      and (
        relationship in ('self', 'parent', 'guardian')
        or (
          relationship in ('agent', 'manager')
          and coalesce(permissions ->> 'edit_profile', 'false') = 'true'
        )
      )
    limit 1
  `;
  return Boolean(rows[0]?.ok);
}

export async function requireAthleteManager(
  sql: Sql,
  userId: string,
  athleteId: number,
): Promise<void> {
  if (!(await canManageAthlete(sql, userId, athleteId))) {
    throw new ForbiddenError("You do not manage this athlete profile");
  }
}

export async function canViewAthletePrivate(
  sql: Sql,
  userId: string,
  athleteId: number,
): Promise<boolean> {
  if (isPreviewSuperuser(userId)) return true;
  if (await hasPlatformRole(sql, userId, ["superadmin", "data_reviewer"])) {
    return true;
  }
  const rows = await sql<{ ok: boolean }>`
    select true as ok
    from athlete_claims
    where athlete_id = ${athleteId}
      and user_id = ${userId}
      and status in ('approved', 'verified')
      and (
        relationship in ('self', 'parent', 'guardian')
        or (
          relationship in ('agent', 'manager')
          and coalesce(permissions ->> 'private_data', 'false') = 'true'
        )
      )
    limit 1
  `;
  return Boolean(rows[0]?.ok);
}

export async function requireAthletePrivateAccess(
  sql: Sql,
  userId: string,
  athleteId: number,
): Promise<void> {
  if (!(await canViewAthletePrivate(sql, userId, athleteId))) {
    throw new ForbiddenError("Private Athlete Passport permission is required");
  }
}
