import type { Sql } from "../db.ts";
import {
  PARTNER_POLICY_VERSION,
  preferenceForKind,
  type BrandInput,
  type OpportunityInput,
  type PreferenceInput,
  type ApplicationInput,
  type ReviewInput,
  type Brand,
  type PrivateBrand,
  type Opportunity,
  type PrivateOpportunity,
  type PartnerApplication,
} from "./partnerships.ts";

const brandPublicColumns = "id, name, website, category, description, sports, markets";
const opportunityColumns = `o.id, o.brand_id, b.name as brand_name, b.website, b.category,
  o.title, o.kind, o.audience, o.description, o.benefits, o.requirements, o.sports, o.markets, o.closing_date::text`;
const applicationColumns = `a.id, a.opportunity_id, o.title, b.name as brand_name, a.applicant_kind,
  a.display_name, a.club_website, a.message, a.status, a.brand_response, a.review_note, a.revision`;

async function audit(
  sql: Sql,
  userId: string,
  entity: string,
  id: string | number,
  action: string,
  detail: object = {},
) {
  await sql`insert into partner_audit (actor_user_id, entity_type, entity_id, action, detail)
    values (${userId}, ${entity}, ${String(id)}, ${action}, ${JSON.stringify(detail)}::jsonb)`;
}

async function verifiedAccount(sql: Sql, userId: string) {
  const [user] = await sql<{
    verified: boolean;
  }>`select "emailVerified" as verified from "user" where id = ${userId}`;
  if (!user?.verified)
    throw new Error(
      "Use an account with a verified email before submitting. Google sign-in is available.",
    );
}

async function adultAccount(sql: Sql, userId: string) {
  const [profile] = await sql<{
    under_age: boolean;
  }>`select date_of_birth > (current_date - interval '18 years')::date as under_age
    from athlete_private_profiles where user_id = ${userId}`;
  if (profile?.under_age)
    throw new Error("Partnership applications are currently available to people aged 18 and over.");
}

async function eligibleAthlete(
  sql: Sql,
  userId: string,
  athleteId: number,
  kind: Opportunity["kind"],
) {
  const [link] = await sql<{
    name: string;
  }>`select a.display_name as name from athlete_account_links l join athletes a on a.id = l.athlete_id
    where l.user_id = ${userId} and l.athlete_id = ${athleteId} and l.status = 'active'`;
  if (!link)
    throw new Error(
      "Choose an athlete profile that is linked to your account through an approved claim.",
    );
  const [preferences] = await sql<{
    sponsorship: boolean;
    product_testing: boolean;
    offers: boolean;
    adult_confirmed: boolean;
  }>`
    select sponsorship, product_testing, offers, adult_confirmed from partner_preferences where user_id = ${userId}`;
  if (!preferences?.adult_confirmed || !preferences[preferenceForKind(kind)]) {
    throw new Error("Enable this type of opportunity in your partnership choices before applying.");
  }
  return link.name;
}

export async function publicPartnerships(sql: Sql) {
  const [brands, opportunities] = await Promise.all([
    sql.query<Brand>(
      `select ${brandPublicColumns} from partner_brands where status = 'approved' order by name limit 200`,
    ),
    sql.query<Opportunity>(`select ${opportunityColumns} from partner_opportunities o join partner_brands b on b.id = o.brand_id
      where o.status = 'approved' and b.status = 'approved' and o.closing_date >= current_date
      order by o.created_at desc, o.id desc limit 200`),
  ]);
  return { brands, opportunities };
}

export async function myPartnerships(sql: Sql, userId: string) {
  const [brands, opportunities, applications, incoming, preferences, athletes, users] =
    await Promise.all([
      sql.query<PrivateBrand>(
        `select ${brandPublicColumns}, contact_name, contact_role, status, review_note, revision
      from partner_brands where owner_user_id = $1`,
        [userId],
      ),
      sql.query<PrivateOpportunity>(
        `select ${opportunityColumns}, o.status, o.review_note, o.revision
      from partner_opportunities o join partner_brands b on b.id = o.brand_id where b.owner_user_id = $1 order by o.created_at desc`,
        [userId],
      ),
      sql.query<PartnerApplication>(
        `select ${applicationColumns} from partner_applications a
      join partner_opportunities o on o.id = a.opportunity_id join partner_brands b on b.id = o.brand_id
      where a.user_id = $1 order by a.created_at desc`,
        [userId],
      ),
      // Select only consented application content; never return private athlete records or account email.
      sql.query<PartnerApplication>(
        `select ${applicationColumns.replace("a.review_note", "''::text as review_note")}
      from partner_applications a join partner_opportunities o on o.id = a.opportunity_id join partner_brands b on b.id = o.brand_id
      where b.owner_user_id = $1 and b.status = 'approved' and a.status = 'shared'
      and (a.applicant_kind = 'club' or exists (select 1 from athlete_account_links l
        where l.user_id = a.user_id and l.athlete_id = a.athlete_id and l.status = 'active'))
      order by a.created_at desc`,
        [userId],
      ),
      sql<{
        sponsorship: boolean;
        productTesting: boolean;
        offers: boolean;
        adultConfirmed: boolean;
      }>`
      select sponsorship, product_testing as "productTesting", offers, adult_confirmed as "adultConfirmed"
      from partner_preferences where user_id = ${userId}`,
      sql<{
        id: number;
        name: string;
      }>`select a.id, a.display_name as name from athlete_account_links l join athletes a on a.id = l.athlete_id
      where l.user_id = ${userId} and l.status = 'active' order by a.display_name`,
      sql<{ emailVerified: boolean }>`select "emailVerified" from "user" where id = ${userId}`,
    ]);
  return {
    brand: brands[0] ?? null,
    opportunities,
    applications,
    incoming,
    athletes,
    preferences: preferences[0] ?? {
      sponsorship: false,
      productTesting: false,
      offers: false,
      adultConfirmed: false,
    },
    emailVerified: users[0]?.emailVerified ?? false,
  };
}

export async function registerBrand(sql: Sql, userId: string, input: BrandInput) {
  await verifiedAccount(sql, userId);
  const host = new URL(input.website).hostname.toLowerCase().replace(/^www\./, "");
  return sql.transaction(async (tx) => {
    const [current] = await tx<{
      status: string;
      name: string;
      website_host: string;
      id: number;
    }>`select id, name, website_host, status from partner_brands where owner_user_id = ${userId} for update`;
    if (current?.status === "suspended")
      throw new Error("This registration is suspended. A staff review is required.");
    if (current && (current.name !== input.name || current.website_host !== host)) {
      const [application] = await tx`select a.id from partner_applications a
        join partner_opportunities o on o.id = a.opportunity_id where o.brand_id = ${current.id} limit 1`;
      if (application)
        throw new Error(
          "Company identity cannot change after an application is received. Contact staff about a company name or website change.",
        );
    }
    const [duplicate] =
      await tx`select id from partner_brands where website_host = ${host} and owner_user_id <> ${userId}`;
    if (duplicate)
      throw new Error(
        "This company website already has a registration. Use the original account or request a staff review.",
      );
    const [brand] = await tx<{ id: number }>`insert into partner_brands
      (owner_user_id, name, website, website_host, category, description, sports, markets, contact_name, contact_role)
      values (${userId}, ${input.name}, ${input.website}, ${host}, ${input.category}, ${input.description}, ${input.sports}, ${input.markets}, ${input.contactName}, ${input.contactRole})
      on conflict (owner_user_id) do update set name = excluded.name, website = excluded.website, website_host = excluded.website_host,
        category = excluded.category, description = excluded.description, sports = excluded.sports, markets = excluded.markets,
        contact_name = excluded.contact_name, contact_role = excluded.contact_role, status = 'pending', review_note = '',
        revision = partner_brands.revision + 1, reviewed_at = null, updated_at = now()
      returning id`;
    await audit(tx, userId, "brand", brand.id, "submitted", {
      website: input.website,
      policy: PARTNER_POLICY_VERSION,
    });
    return { id: brand.id };
  });
}

export async function submitOpportunity(sql: Sql, userId: string, input: OpportunityInput) {
  await verifiedAccount(sql, userId);
  return sql.transaction(async (tx) => {
    const [brand] = await tx<{
      id: number;
      status: string;
    }>`select id, status from partner_brands where owner_user_id = ${userId} for update`;
    if (brand?.status !== "approved")
      throw new Error("Your brand must be approved before submitting an opportunity.");
    const [date] = await tx<{
      valid: boolean;
    }>`select ${input.closingDate}::date >= current_date as valid`;
    if (!date.valid) throw new Error("Choose a closing date today or later.");
    if (input.kind === "club_partnership" && input.audience === "athletes")
      throw new Error("Choose clubs or both for a club partnership.");
    let id: number;
    if (input.id) {
      // Lock before checking applications so a concurrent applicant cannot consent to old terms.
      const [current] = await tx`select id from partner_opportunities
        where id = ${input.id} and brand_id = ${brand.id} and revision = ${input.revision ?? 0} for update`;
      if (!current)
        throw new Error("This opportunity changed or is not yours. Refresh before editing.");
      const [application] =
        await tx`select id from partner_applications where opportunity_id = ${input.id} limit 1`;
      if (application)
        throw new Error(
          "Someone has already applied to this opportunity. Close it and create a new opportunity to change the terms.",
        );
      const rows = await tx<{
        id: number;
      }>`update partner_opportunities set title = ${input.title}, kind = ${input.kind}, audience = ${input.audience},
        description = ${input.description}, benefits = ${input.benefits}, requirements = ${input.requirements}, sports = ${input.sports},
        markets = ${input.markets}, closing_date = ${input.closingDate}::date, status = 'pending', review_note = '',
        revision = revision + 1, reviewed_at = null, updated_at = now()
        where id = ${input.id} and brand_id = ${brand.id} and revision = ${input.revision ?? 0} returning id`;
      if (!rows.length)
        throw new Error("This opportunity changed or is not yours. Refresh before editing.");
      id = rows[0].id;
    } else {
      const [count] = await tx<{
        count: number;
      }>`select count(*)::int as count from partner_opportunities where brand_id = ${brand.id} and status <> 'closed' and closing_date >= current_date`;
      if (count.count >= 10)
        throw new Error(
          "Close an existing opportunity before adding another. The initial limit is ten open opportunities per brand.",
        );
      const [row] = await tx<{ id: number }>`insert into partner_opportunities
        (brand_id, title, kind, audience, description, benefits, requirements, sports, markets, closing_date)
        values (${brand.id}, ${input.title}, ${input.kind}, ${input.audience}, ${input.description}, ${input.benefits}, ${input.requirements}, ${input.sports}, ${input.markets}, ${input.closingDate}::date) returning id`;
      id = row.id;
    }
    await audit(tx, userId, "opportunity", id, "submitted", { policy: PARTNER_POLICY_VERSION });
    return { id };
  });
}

export async function savePreferences(sql: Sql, userId: string, input: PreferenceInput) {
  if (input.sponsorship || input.productTesting || input.offers) {
    await verifiedAccount(sql, userId);
    await adultAccount(sql, userId);
  }
  await sql.transaction(async (tx) => {
    // Serialize preference changes and applications for this account.
    await tx`select id from "user" where id = ${userId} for update`;
    await tx`insert into partner_preferences (user_id, sponsorship, product_testing, offers, adult_confirmed, policy_version)
      values (${userId}, ${input.sponsorship}, ${input.productTesting}, ${input.offers}, ${input.adultConfirmed}, ${PARTNER_POLICY_VERSION})
      on conflict (user_id) do update set sponsorship = excluded.sponsorship, product_testing = excluded.product_testing,
        offers = excluded.offers, adult_confirmed = excluded.adult_confirmed, policy_version = excluded.policy_version, updated_at = now()`;
    const withdrawn = await tx<{
      id: number;
    }>`update partner_applications a set status = 'withdrawn', revision = a.revision + 1, updated_at = now()
      from partner_opportunities o where o.id = a.opportunity_id and a.user_id = ${userId} and a.applicant_kind = 'athlete'
      and a.status in ('pending','shared') and (
        (o.kind = 'product_testing' and not ${input.productTesting}) or
        (o.kind = 'discount' and not ${input.offers}) or
        (o.kind not in ('product_testing','discount') and not ${input.sponsorship})) returning a.id`;
    await audit(tx, userId, "preferences", userId, "updated", {
      ...input,
      withdrawnApplicationIds: withdrawn.map((a) => a.id),
      policy: PARTNER_POLICY_VERSION,
    });
  });
  return { saved: true };
}

export async function applyToOpportunity(sql: Sql, userId: string, input: ApplicationInput) {
  await verifiedAccount(sql, userId);
  await adultAccount(sql, userId);
  return sql.transaction(async (tx) => {
    await tx`select id from "user" where id = ${userId} for update`;
    const [opportunity] = await tx<
      Opportunity & { owner_user_id: string }
    >`select o.*, b.owner_user_id
      from partner_opportunities o join partner_brands b on b.id = o.brand_id
      where o.id = ${input.opportunityId} and o.status = 'approved' and b.status = 'approved' and o.closing_date >= current_date
      for share of o, b`;
    if (!opportunity) throw new Error("This opportunity is no longer accepting applications.");
    if (opportunity.owner_user_id === userId)
      throw new Error("You cannot apply to your own brand's opportunity.");
    if (
      (input.applicantKind === "athlete" && opportunity.audience === "clubs") ||
      (input.applicantKind === "club" && opportunity.audience === "athletes")
    ) {
      throw new Error("This opportunity is for a different applicant type.");
    }
    const displayName =
      input.applicantKind === "athlete"
        ? await eligibleAthlete(tx, userId, input.athleteId!, opportunity.kind)
        : input.clubName!;
    const [application] = await tx<{ id: number }>`insert into partner_applications
      (opportunity_id, user_id, applicant_kind, athlete_id, display_name, club_website, message, policy_version)
      values (${opportunity.id}, ${userId}, ${input.applicantKind}, ${input.applicantKind === "athlete" ? input.athleteId : null},
        ${displayName}, ${input.applicantKind === "club" ? input.clubWebsite : null}, ${input.message}, ${PARTNER_POLICY_VERSION})
      on conflict (opportunity_id, user_id) do nothing returning id`;
    if (!application)
      throw new Error("You have already applied to this opportunity. See My applications below.");
    await audit(tx, userId, "application", application.id, "submitted", {
      policy: PARTNER_POLICY_VERSION,
    });
    return { id: application.id };
  });
}

export async function reviewQueue(sql: Sql) {
  const [brands, opportunities, applications] = await Promise.all([
    sql.query<
      PrivateBrand & { email: string }
    >(`select b.*, u.email from partner_brands b join "user" u on u.id = b.owner_user_id
      where b.status <> 'rejected' order by (b.status = 'pending') desc, b.updated_at desc limit 200`),
    sql.query<PrivateOpportunity>(`select ${opportunityColumns}, o.status, o.review_note, o.revision from partner_opportunities o
      join partner_brands b on b.id = o.brand_id where o.status in ('pending','approved','needs_changes') order by (o.status = 'pending') desc, o.updated_at desc limit 200`),
    sql.query<
      PartnerApplication & { email: string }
    >(`select ${applicationColumns}, u.email from partner_applications a
      join partner_opportunities o on o.id = a.opportunity_id join partner_brands b on b.id = o.brand_id join "user" u on u.id = a.user_id
      where a.status = 'pending' order by a.created_at limit 200`),
  ]);
  return { brands, opportunities, applications };
}

// This service is called exclusively through staffMiddleware; the actor is never client supplied.
export async function reviewPartnerItem(sql: Sql, staffUserId: string, input: ReviewInput) {
  const actions = {
    brand: ["approved", "needs_changes", "rejected", "suspended"],
    opportunity: ["approved", "needs_changes", "rejected"],
    application: ["shared", "declined"],
  };
  if (!actions[input.entity].includes(input.action))
    throw new Error("This review action does not apply to this item.");
  return sql.transaction(async (tx) => {
    if (input.entity === "application" && input.action === "shared") {
      const [app] = await tx<{
        user_id: string;
        athlete_id: number;
        applicant_kind: string;
        kind: Opportunity["kind"];
      }>`
        select a.user_id, a.athlete_id, a.applicant_kind, o.kind from partner_applications a
        join partner_opportunities o on o.id = a.opportunity_id join partner_brands b on b.id = o.brand_id
        where a.id = ${input.id} and a.status = 'pending' and o.status = 'approved' and b.status = 'approved' and o.closing_date >= current_date`;
      if (!app) throw new Error("The application or opportunity is no longer open.");
      await tx`select id from "user" where id = ${app.user_id} for update`;
      await verifiedAccount(tx, app.user_id);
      await adultAccount(tx, app.user_id);
      if (app.applicant_kind === "athlete")
        await eligibleAthlete(tx, app.user_id, app.athlete_id, app.kind);
    }
    if (input.entity === "opportunity" && input.action === "approved") {
      const [valid] =
        await tx`select o.id from partner_opportunities o join partner_brands b on b.id = o.brand_id
        where o.id = ${input.id} and b.status = 'approved' and o.closing_date >= current_date for share of b`;
      if (!valid)
        throw new Error(
          "Approve the brand and check the closing date before publishing this opportunity.",
        );
    }
    const table = {
      brand: "partner_brands",
      opportunity: "partner_opportunities",
      application: "partner_applications",
    }[input.entity];
    const rows = await tx.query(
      `update ${table} set status = $1, review_note = $2, revision = revision + 1, updated_at = now()
      ${input.entity === "application" ? "" : ", reviewed_at = now()"}
      where id = $3 and revision = $4 ${input.entity === "application" ? "and status = 'pending'" : ""} returning id`,
      [input.action, input.note, input.id, input.revision],
    );
    if (!rows.length)
      throw new Error(
        "This item changed since you opened it. Refresh and review the latest version.",
      );
    await audit(tx, staffUserId, input.entity, input.id, input.action, {
      note: input.note,
      reviewedRevision: input.revision,
    });
    return { reviewed: true };
  });
}

export async function closeOpportunity(sql: Sql, userId: string, id: number) {
  return sql.transaction(async (tx) => {
    const rows =
      await tx`update partner_opportunities o set status = 'closed', revision = o.revision + 1, updated_at = now()
      from partner_brands b where b.id = o.brand_id and b.owner_user_id = ${userId} and o.id = ${id} returning o.id`;
    if (!rows.length) throw new Error("Opportunity not found.");
    await audit(tx, userId, "opportunity", id, "closed");
    return { closed: true };
  });
}

export async function withdrawApplication(sql: Sql, userId: string, id: number) {
  return sql.transaction(async (tx) => {
    const rows =
      await tx`update partner_applications set status = 'withdrawn', revision = revision + 1, updated_at = now()
      where id = ${id} and user_id = ${userId} and status in ('pending','shared') returning id`;
    if (!rows.length) throw new Error("Application not found or already closed.");
    await audit(tx, userId, "application", id, "withdrawn");
    return { withdrawn: true };
  });
}

export async function respondToApplication(sql: Sql, userId: string, id: number, response: string) {
  return sql.transaction(async (tx) => {
    const rows =
      await tx`update partner_applications a set brand_response = ${response}, revision = a.revision + 1, updated_at = now()
      from partner_opportunities o, partner_brands b where o.id = a.opportunity_id and b.id = o.brand_id
      and b.owner_user_id = ${userId} and b.status = 'approved' and a.id = ${id} and a.status = 'shared'
      and (a.applicant_kind = 'club' or exists (select 1 from athlete_account_links l where l.user_id = a.user_id and l.athlete_id = a.athlete_id and l.status = 'active')) returning a.id`;
    if (!rows.length) throw new Error("This application is not available to your brand.");
    await audit(tx, userId, "application", id, "brand_response_updated");
    return { saved: true };
  });
}
