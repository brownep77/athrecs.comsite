import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { DEV_USER_ID } from "@/lib/auth/verify.server";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../seed.server";
import {
  athleteClaimSubmissionSchema,
  athleteEditSubmissionSchema,
  athleteMissingResultSubmissionSchema,
  athleteResultClaimSubmissionSchema,
  eventCreateSubmissionSchema,
  eventEditSubmissionSchema,
  organisationClaimSubmissionSchema,
  resultsUploadSubmissionSchema,
  reviewSubmissionSchema,
  type EventCreateSubmission,
} from "./schemas";
import {
  ForbiddenError,
  canManageAthlete,
  canViewAthletePrivate,
  getOrganisationRole,
  hasPlatformRole,
  requireAthleteManager,
  requireAthletePrivateAccess,
  requireEventCapability,
  requireOrganisationCapability,
  requirePlatformRole,
} from "./permissions.server";
import { applyApprovedSubmission } from "./application.server";
import {
  makeId,
  slugify,
  verifyEventCreate,
  verifyEventEdit,
  verifyResultsRows,
  type AutomatedCheckDraft,
  type SubmissionItemDraft,
} from "./verification";
import {
  ready,
  previewSuperuser
} from "./api-common.server";

export const listAllSports = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const sports = await sql<{
    id: number;
    slug: string;
    name: string;
    category: string;
    governing_body: string | null;
    default_result_type: string;
    metadata: Record<string, unknown>;
  }>`
    select id, slug, name, category, governing_body, default_result_type, metadata
    from sports
    where active = true
    order by category, name
  `;
  const disciplines = await sql<{
    id: number;
    sport_id: number;
    slug: string;
    name: string;
    default_result_type: string;
    default_unit: string | null;
    supports_individuals: boolean;
    supports_teams: boolean;
  }>`
    select id, sport_id, slug, name, default_result_type, default_unit,
           supports_individuals, supports_teams
    from disciplines
    where active = true
    order by name
  `;
  const bySport = new Map<number, typeof disciplines>();
  for (const discipline of disciplines) {
    const existing = bySport.get(discipline.sport_id) ?? [];
    existing.push(discipline);
    bySport.set(discipline.sport_id, existing);
  }
  return sports.map((sport) => ({
    ...sport,
    disciplines: bySport.get(sport.id) ?? [],
  }));
});

export const listMyOrganisations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    if (previewSuperuser(context.userId)) {
      return sql<{
        id: number;
        slug: string;
        name: string;
        organisation_type: string;
        verification_status: string;
        role: string;
        event_count: number;
      }>`
        select o.id, o.slug, o.name, o.organisation_type, o.verification_status,
               'owner'::text as role,
               (select count(*)::int from event_organisations eo
                where eo.organisation_id = o.id and eo.status = 'active') as event_count
        from organisations o
        order by o.name
      `;
    }
    return sql<{
      id: number;
      slug: string;
      name: string;
      organisation_type: string;
      verification_status: string;
      role: string;
      event_count: number;
    }>`
      select o.id, o.slug, o.name, o.organisation_type, o.verification_status,
             om.role,
             (select count(*)::int from event_organisations eo
              where eo.organisation_id = o.id and eo.status = 'active') as event_count
      from organisation_members om
      join organisations o on o.id = om.organisation_id
      where om.user_id = ${context.userId}
        and om.status = 'active'
        and o.active = true
      order by o.name
    `;
  });

export const listMyOrganisationClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    return sql<{
      id: string;
      organisation_id: number | null;
      organisation_name: string | null;
      proposed_name: string | null;
      relationship: string;
      status: string;
      review_note: string | null;
      created_at: string;
      reviewed_at: string | null;
    }>`
      select oc.id, oc.organisation_id, o.name as organisation_name,
             oc.proposed_name, oc.relationship, oc.status, oc.review_note,
             oc.created_at, oc.reviewed_at
      from organisation_claims oc
      left join organisations o on o.id = oc.organisation_id
      where oc.user_id = ${context.userId}
      order by oc.created_at desc
    `;
  });

export const listMyAthleteClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    return sql<{
      id: string;
      athlete_id: number;
      athlete_slug: string;
      athlete_name: string;
      relationship: string;
      status: string;
      verification_level: string;
      permissions: Record<string, unknown>;
      submitted_at: string;
      reviewed_at: string | null;
      review_note: string | null;
    }>`
      select ac.id, ac.athlete_id, a.slug as athlete_slug,
             a.display_name as athlete_name, ac.relationship, ac.status,
             ac.verification_level, ac.permissions, ac.submitted_at,
             ac.reviewed_at, ac.review_note
      from athlete_claims ac
      join athletes a on a.id = ac.athlete_id
      where ac.user_id = ${context.userId}
      order by ac.submitted_at desc
    `;
  });

export const listMyResultClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    return sql<{
      id: string;
      athlete_id: number;
      athlete_name: string;
      result_model: string;
      result_id: string;
      relationship: string;
      status: string;
      verification_level: string;
      created_at: string;
      reviewed_at: string | null;
      review_note: string | null;
    }>`
      select ric.id, ric.athlete_id, a.display_name as athlete_name,
             ric.result_model, ric.result_id, ric.relationship, ric.status,
             ric.verification_level, ric.created_at, ric.reviewed_at,
             ric.review_note
      from result_identity_claims ric
      join athletes a on a.id = ric.athlete_id
      where ric.user_id = ${context.userId}
      order by ric.created_at desc
    `;
  });

