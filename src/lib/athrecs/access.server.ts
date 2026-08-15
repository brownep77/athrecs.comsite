import { getSql, type SqlJsonValue } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth/verify.server";
import type { OrganisationRole, PlatformRole } from "./multisport.types";

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

const organisationRoleRank: Record<OrganisationRole, number> = {
  owner: 60,
  admin: 50,
  editor: 40,
  results_uploader: 30,
  finance: 20,
  viewer: 10,
};

function adminEmailSet(): Set<string> {
  return new Set(
    (process.env.ATHRECS_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isSafeLocalDevUser(userId: string): boolean {
  return userId === DEV_USER_ID && !process.env.DATABASE_URL?.trim();
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`
    select "email" as email from "user" where "id" = ${userId} limit 1
  `;
  return rows[0]?.email?.toLowerCase() ?? null;
}

export async function getPlatformRoles(userId: string): Promise<PlatformRole[]> {
  if (isSafeLocalDevUser(userId)) return ["super_admin"];

  const email = await getUserEmail(userId);
  if (email && adminEmailSet().has(email)) return ["super_admin"];

  const sql = await getSql();
  const rows = await sql<{ role: PlatformRole }>`
    select role
    from platform_user_roles
    where user_id = ${userId}
      and (expires_at is null or expires_at > now())
  `;
  return rows.map((row) => row.role);
}

export async function requirePlatformRole(
  userId: string,
  allowed: readonly PlatformRole[],
): Promise<PlatformRole[]> {
  const roles = await getPlatformRoles(userId);
  if (!roles.some((role) => allowed.includes(role))) {
    throw new ForbiddenError("An Athrecs reviewer role is required");
  }
  return roles;
}

export async function getOrganisationRole(
  userId: string,
  organisationId: number,
): Promise<OrganisationRole | null> {
  if (isSafeLocalDevUser(userId)) return "owner";

  const sql = await getSql();
  const rows = await sql<{ role: OrganisationRole }>`
    select m.role
    from organisation_members m
    join organisations o on o.id = m.organisation_id
    where m.organisation_id = ${organisationId}
      and m.user_id = ${userId}
      and m.status = 'active'
      and o.status = 'active'
    limit 1
  `;
  return rows[0]?.role ?? null;
}

export async function requireOrganisationRole(
  userId: string,
  organisationId: number,
  allowed: readonly OrganisationRole[],
): Promise<OrganisationRole> {
  const role = await getOrganisationRole(userId, organisationId);
  if (!role || !allowed.includes(role)) {
    throw new ForbiddenError("You do not have permission for this organisation");
  }
  return role;
}

export async function requireMinimumOrganisationRole(
  userId: string,
  organisationId: number,
  minimum: OrganisationRole,
): Promise<OrganisationRole> {
  const role = await getOrganisationRole(userId, organisationId);
  if (!role || organisationRoleRank[role] < organisationRoleRank[minimum]) {
    throw new ForbiddenError("Your organisation role does not allow this action");
  }
  return role;
}

export async function requireOrganisationEventPermission(
  userId: string,
  organisationId: number,
  eventId: number,
  capability: "edit" | "upload_results",
): Promise<void> {
  await requireOrganisationRole(
    userId,
    organisationId,
    capability === "edit"
      ? ["owner", "admin", "editor"]
      : ["owner", "admin", "editor", "results_uploader"],
  );

  const sql = await getSql();
  const rows = await sql<{
    can_edit: boolean;
    can_upload_results: boolean;
  }>`
    select can_edit, can_upload_results
    from organisation_events
    where organisation_id = ${organisationId}
      and event_id = ${eventId}
      and status = 'active'
    order by case relationship when 'owner' then 0 else 1 end
    limit 1
  `;
  const permission = rows[0];
  if (!permission) {
    throw new ForbiddenError("This organisation is not linked to the event");
  }
  if (capability === "edit" && !permission.can_edit) {
    throw new ForbiddenError("This organisation cannot edit the event");
  }
  if (capability === "upload_results" && !permission.can_upload_results) {
    throw new ForbiddenError("This organisation cannot upload results for the event");
  }
}

export async function requireCompetitionUploadPermission(
  userId: string,
  organisationId: number,
  competitionId: number,
): Promise<{
  eventId: number;
  occurrenceId: number;
  organisationStatus: string;
  allowsTies: boolean;
  participantKind: string;
  resultModel: string;
}> {
  await requireOrganisationRole(userId, organisationId, [
    "owner",
    "admin",
    "editor",
    "results_uploader",
  ]);

  const sql = await getSql();
  const rows = await sql<{
    event_id: number;
    occurrence_id: number;
    organisation_status: string;
    can_upload_results: boolean;
    allows_ties: boolean;
    participant_kind: string;
    result_model: string;
  }>`
    select
      e.id as event_id,
      o.id as occurrence_id,
      org.verification_status as organisation_status,
      oe.can_upload_results,
      c.allows_ties,
      c.participant_kind,
      c.result_model
    from event_competitions c
    join event_occurrences o on o.id = c.occurrence_id
    join events e on e.id = o.event_id
    join organisation_events oe
      on oe.event_id = e.id
     and oe.organisation_id = ${organisationId}
     and oe.status = 'active'
    join organisations org on org.id = oe.organisation_id
    where c.id = ${competitionId}
    limit 1
  `;
  const row = rows[0];
  if (!row || !row.can_upload_results) {
    throw new ForbiddenError("This organisation cannot upload results for the competition");
  }
  return {
    eventId: row.event_id,
    occurrenceId: row.occurrence_id,
    organisationStatus: row.organisation_status,
    allowsTies: row.allows_ties,
    participantKind: row.participant_kind,
    resultModel: row.result_model,
  };
}

export type AthleteAccess = {
  relationship: string;
  role: "owner" | "editor" | "contributor" | "viewer";
  permissions: Record<string, SqlJsonValue>;
};

export type AthleteCapability =
  | "view_private_profile"
  | "edit_private_profile"
  | "view_identifiers"
  | "view_consents"
  | "manage_consents"
  | "view_commercial_data"
  | "manage_public_settings"
  | "manage_preferences"
  | "view_equipment"
  | "manage_equipment";

const familyRelationships = new Set(["self", "parent", "guardian"]);

function permissionIsEnabled(
  permissions: Record<string, SqlJsonValue>,
  capability: AthleteCapability,
): boolean {
  return permissions[capability] === true;
}

/**
 * Conservative athlete-data permission defaults. Public-profile and result
 * workflows use role checks separately. Private identity, consent and buying
 * data are restricted to the athlete/parent/guardian unless an explicit,
 * verified delegation grants the exact capability.
 */
export function athleteAccessAllows(
  access: AthleteAccess,
  capability: AthleteCapability,
): boolean {
  if (permissionIsEnabled(access.permissions, capability)) return true;

  const isFamily = familyRelationships.has(access.relationship);
  switch (capability) {
    case "view_private_profile":
    case "edit_private_profile":
    case "view_identifiers":
    case "view_consents":
    case "view_commercial_data":
    case "manage_public_settings":
    case "manage_preferences":
      return isFamily && (access.role === "owner" || access.role === "editor");
    case "manage_consents":
      return isFamily && access.role === "owner";
    case "view_equipment":
    case "manage_equipment":
      return (
        isFamily &&
        (access.role === "owner" ||
          access.role === "editor" ||
          access.role === "contributor")
      );
    default:
      return false;
  }
}

export async function requireAthleteAccess(
  userId: string,
  athleteId: number,
  allowedRoles: readonly ("owner" | "editor" | "contributor" | "viewer")[] = [
    "owner",
    "editor",
  ],
): Promise<AthleteAccess> {
  if (isSafeLocalDevUser(userId)) {
    return { relationship: "self", role: "owner", permissions: {} };
  }

  const sql = await getSql();
  const rows = await sql<{
    relationship: string;
    role: "owner" | "editor" | "contributor" | "viewer";
    permissions: Record<string, SqlJsonValue>;
  }>`
    select relationship, role, permissions
    from athlete_user_links
    where athlete_id = ${athleteId}
      and user_id = ${userId}
      and status = 'verified'
    order by case role when 'owner' then 0 when 'editor' then 1 when 'contributor' then 2 else 3 end
    limit 1
  `;
  const access = rows[0];
  if (!access || !allowedRoles.includes(access.role)) {
    throw new ForbiddenError("You do not have access to this athlete record");
  }
  return {
    ...access,
    permissions:
      access.permissions && typeof access.permissions === "object"
        ? access.permissions
        : {},
  };
}

export async function requireAthleteCapability(
  userId: string,
  athleteId: number,
  capability: AthleteCapability,
  allowedRoles: readonly ("owner" | "editor" | "contributor" | "viewer")[] = [
    "owner",
    "editor",
  ],
): Promise<AthleteAccess> {
  const access = await requireAthleteAccess(userId, athleteId, allowedRoles);
  if (!athleteAccessAllows(access, capability)) {
    throw new ForbiddenError(
      "This delegated role does not include access to the requested private athlete data",
    );
  }
  return access;
}
