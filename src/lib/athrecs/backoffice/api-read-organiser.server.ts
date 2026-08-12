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

export const listOrganisationEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ organisationId: z.number().int().positive() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await ready();
    await requireOrganisationCapability(
      sql,
      context.userId,
      data.organisationId,
      "view",
    );
    return sql<{
      id: number;
      slug: string;
      name: string;
      sport: string;
      city: string;
      country: string;
      lifecycle_status: string;
      verification_status: string;
      can_edit_event: boolean;
      can_manage_entries: boolean;
      can_upload_results: boolean;
      edition_count: number;
      competition_count: number;
      pending_submission_count: number;
    }>`
      select e.id, e.slug, e.name, e.sport, e.city, e.country,
             e.lifecycle_status, e.verification_status,
             eo.can_edit_event, eo.can_manage_entries, eo.can_upload_results,
             (select count(*)::int from editions ed where ed.event_id = e.id) as edition_count,
             (select count(*)::int
              from event_competitions ec
              join editions ed on ed.id = ec.edition_id
              where ed.event_id = e.id) as competition_count,
             (select count(*)::int from data_submissions ds
              where ds.event_id = e.id
                and ds.status in ('submitted', 'under_review', 'needs_information'))
                as pending_submission_count
      from event_organisations eo
      join events e on e.id = eo.event_id
      where eo.organisation_id = ${data.organisationId}
        and eo.status = 'active'
      order by e.name
    `;
  });

export const getOrganiserEventBackoffice = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        organisationId: z.number().int().positive(),
        eventId: z.number().int().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await ready();
    await requireEventCapability(
      sql,
      context.userId,
      data.organisationId,
      data.eventId,
      "view",
    );
    const eventRows = await sql<Record<string, unknown>>`
      select e.*, s.slug as primary_sport_slug, s.name as primary_sport_name,
             o.name as primary_organisation_name
      from events e
      left join sports s on s.id = e.primary_sport_id
      left join organisations o on o.id = e.primary_organisation_id
      where e.id = ${data.eventId}
      limit 1
    `;
    const event = eventRows[0];
    if (!event) throw new Error("Event not found");

    const [eventSports, editions, competitions, rounds, venues, organisations,
      submissions] = await Promise.all([
      sql<Record<string, unknown>>`
        select es.relationship, s.id as sport_id, s.slug as sport_slug,
               s.name as sport_name, d.id as discipline_id,
               d.slug as discipline_slug, d.name as discipline_name
        from event_sports es
        join sports s on s.id = es.sport_id
        left join disciplines d on d.id = es.discipline_id
        where es.event_id = ${data.eventId}
        order by case es.relationship when 'primary' then 0 else 1 end, s.name
      `,
      sql<Record<string, unknown>>`
        select ed.*
        from editions ed
        where ed.event_id = ${data.eventId}
        order by ed.event_date desc, ed.distance_code
      `,
      sql<Record<string, unknown>>`
        select ec.*, ed.event_date::text as event_date,
               s.slug as sport_slug, s.name as sport_name,
               d.slug as discipline_slug, d.name as discipline_name,
               (select count(*)::int from competition_results cr
                where cr.competition_id = ec.id) as result_count,
               (select count(*)::int from event_entries ee
                where ee.competition_id = ec.id) as entry_count
        from event_competitions ec
        join editions ed on ed.id = ec.edition_id
        join sports s on s.id = ec.sport_id
        left join disciplines d on d.id = ec.discipline_id
        where ed.event_id = ${data.eventId}
        order by ed.event_date desc, ec.start_at, ec.name
      `,
      sql<Record<string, unknown>>`
        select cr.*
        from competition_rounds cr
        join event_competitions ec on ec.id = cr.competition_id
        join editions ed on ed.id = ec.edition_id
        where ed.event_id = ${data.eventId}
        order by cr.competition_id, cr.sequence_no, cr.name
      `,
      sql<Record<string, unknown>>`
        select distinct v.*
        from venues v
        where v.id = ${typeof event.venue_id === "number" ? event.venue_id : null}
           or v.id in (
             select ed.venue_id from editions ed
             where ed.event_id = ${data.eventId} and ed.venue_id is not null
           )
        order by v.name
      `,
      sql<Record<string, unknown>>`
        select eo.*, o.slug as organisation_slug, o.name as organisation_name,
               o.verification_status as organisation_verification_status
        from event_organisations eo
        join organisations o on o.id = eo.organisation_id
        where eo.event_id = ${data.eventId}
        order by eo.relationship, o.name
      `,
      sql<Record<string, unknown>>`
        select id, submission_type, status, verification_status, risk_level,
               row_count, accepted_count, warning_count, rejected_count,
               automated_score, submitted_at, reviewed_at, applied_at, created_at
        from data_submissions
        where event_id = ${data.eventId}
          and organisation_id = ${data.organisationId}
          and risk_level <> 'restricted'
        order by created_at desc
        limit 250
      `,
    ]);

    return {
      event,
      eventSports,
      editions,
      competitions,
      rounds,
      venues,
      organisations,
      submissions,
    };
  });

export const getCompetitionUploadContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        organisationId: z.number().int().positive(),
        competitionId: z.number().int().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      name: string;
      result_type: string;
      participant_type: string;
      event_id: number;
      event_name: string;
      edition_id: number;
      event_date: string;
      sport: string;
      discipline: string | null;
      result_count: number;
    }>`
      select ec.id, ec.name, ec.result_type, ec.participant_type,
             e.id as event_id, e.name as event_name,
             ed.id as edition_id, ed.event_date::text as event_date,
             s.name as sport, d.name as discipline,
             (select count(*)::int from competition_results cr
              where cr.competition_id = ec.id) as result_count
      from event_competitions ec
      join editions ed on ed.id = ec.edition_id
      join events e on e.id = ed.event_id
      join sports s on s.id = ec.sport_id
      left join disciplines d on d.id = ec.discipline_id
      where ec.id = ${data.competitionId}
      limit 1
    `;
    const competition = rows[0];
    if (!competition) throw new Error("Competition not found");
    await requireEventCapability(
      sql,
      context.userId,
      data.organisationId,
      competition.event_id,
      "upload_results",
    );
    const rounds = await sql<{
      id: number;
      source_key: string;
      parent_round_id: number | null;
      name: string;
      round_type: string;
      sequence_no: number;
      status: string;
    }>`
      select id, source_key, parent_round_id, name, round_type, sequence_no, status
      from competition_rounds
      where competition_id = ${competition.id}
      order by sequence_no, name
    `;
    return { competition, rounds };
  });
