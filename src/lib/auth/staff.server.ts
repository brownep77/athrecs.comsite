import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { UnauthorizedError, getSessionUser, type VerifiedUser } from "./verify.server";
import {
  DEFAULT_STAFF_HOST,
  isPermittedStaffHostname,
  normalizeHostname,
  parseStaffEmails,
} from "./staff-config";

const GOOGLE_PROVIDER_IDS = ["google", "grok-google"] as const;

export type StaffAccessStatus = {
  allowedHost: boolean;
  configured: boolean;
  signedIn: boolean;
  googleIdentity: boolean;
  authorized: boolean;
  email: string | null;
};

export type StaffUser = { id: string; email: string };

export class StaffAccessConfigurationError extends Error {
  readonly status = 503;
  constructor() {
    super("Staff access is not configured");
    this.name = "StaffAccessConfigurationError";
  }
}

export class StaffForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "StaffForbiddenError";
  }
}

function configuredStaffHost(): string {
  return normalizeHostname(process.env.ATHRECS_STAFF_HOST) || DEFAULT_STAFF_HOST;
}

function staffEmails(): Set<string> {
  return new Set(parseStaffEmails(process.env.ATHRECS_STAFF_EMAILS));
}

function requestHostname(): string {
  const request = getRequest();
  if (!request) return "";
  return normalizeHostname(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.url,
  );
}

function requestUsesStaffHost(): boolean {
  return isPermittedStaffHostname(requestHostname(), configuredStaffHost());
}

async function hasGoogleIdentity(user: VerifiedUser): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ provider_id: string }>`
    select "providerId" as provider_id
    from "account"
    where "userId" = ${user.id}
      and (
        "providerId" = ${GOOGLE_PROVIDER_IDS[0]}
        or "providerId" = ${GOOGLE_PROVIDER_IDS[1]}
      )
    limit 1
  `;
  return GOOGLE_PROVIDER_IDS.some((providerId) => providerId === rows[0]?.provider_id);
}

/** Safe, non-throwing access state for the staff login screen. */
export async function getStaffAccessStatus(bearerToken?: string): Promise<StaffAccessStatus> {
  const allowedHost = requestUsesStaffHost();
  const allowlist = staffEmails();
  const configured = allowlist.size > 0;

  if (!allowedHost) {
    return {
      allowedHost,
      configured,
      signedIn: false,
      googleIdentity: false,
      authorized: false,
      email: null,
    };
  }

  const user = await getSessionUser(bearerToken);
  if (!user) {
    return {
      allowedHost,
      configured,
      signedIn: false,
      googleIdentity: false,
      authorized: false,
      email: null,
    };
  }

  const googleIdentity = await hasGoogleIdentity(user);
  const email = user.email?.trim().toLowerCase() ?? null;
  return {
    allowedHost,
    configured,
    signedIn: true,
    googleIdentity,
    authorized: configured && googleIdentity && Boolean(email && allowlist.has(email)),
    email,
  };
}

/** Require the dedicated host, a Google session and an allowlisted email. */
export async function requireStaffUser(bearerToken?: string): Promise<StaffUser> {
  if (!requestUsesStaffHost()) {
    throw new StaffForbiddenError("Forbidden: staff host required");
  }

  const allowlist = staffEmails();
  if (allowlist.size === 0) throw new StaffAccessConfigurationError();

  const user = await getSessionUser(bearerToken);
  if (!user) throw new UnauthorizedError();

  const email = user.email?.trim().toLowerCase();
  if (!email || !allowlist.has(email) || !(await hasGoogleIdentity(user))) {
    throw new StaffForbiddenError();
  }

  return { id: user.id, email };
}
