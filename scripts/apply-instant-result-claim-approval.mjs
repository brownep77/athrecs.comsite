import { readFile, writeFile } from "node:fs/promises";

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first === -1) throw new Error(`Could not find ${label}`);
  if (source.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Found more than one ${label}`);
  }
  return `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
}

function replaceBetween(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Could not find start of ${label}`);
  const end = source.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Could not find end of ${label}`);
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

const apiPath = "src/lib/athrecs/result-claims-api.ts";
let api = await readFile(apiPath, "utf8");

const submitClaimBlock = `export const submitResultClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      resultId: number;
      verificationMethod: ResultClaimVerificationMethod;
      evidenceText?: string;
      evidenceUrl?: string;
      declarationAccepted: boolean;
    }) => ({
      resultId: positiveInteger(input?.resultId, "Result"),
      verificationMethod: verificationMethod(input?.verificationMethod),
      evidenceText: shortText(input?.evidenceText, 1000, "Verification detail"),
      evidenceUrl: optionalHttpsUrl(input?.evidenceUrl),
      declarationAccepted: input?.declarationAccepted === true,
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.declarationAccepted) throw new Error("Confirm that this is your result");

    const sql = await ready();
    const outcome = await sql.transaction(async (tx) => {
      const users = await tx<{ email: string }>
        \`select "email" as email from "user" where "id" = \${context.userId} limit 1\`;
      const claimantEmail = users[0]?.email?.trim().toLowerCase();
      if (!claimantEmail) throw new Error("Your signed-in account has no email address");

      const results = await tx<{
        result_id: number;
        athlete_id: number;
        athlete_name: string;
        event_name: string;
        event_date: string;
        distance_code: string;
        athlete_city: string | null;
        athlete_region: string | null;
        athlete_country: string | null;
        club_name: string | null;
      }>\`
        select
          result.id as result_id,
          result.athlete_id,
          athlete.display_name as athlete_name,
          event.name as event_name,
          edition.event_date::text as event_date,
          edition.distance_code,
          athlete.city as athlete_city,
          athlete.county as athlete_region,
          athlete.country as athlete_country,
          club.name as club_name
        from results result
        join athletes athlete on athlete.id = result.athlete_id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        left join clubs club on club.id = athlete.club_id
        where result.id = \${data.resultId}
        limit 1
      \`;
      const result = results[0];
      if (!result) throw new Error("Result not found");
      const allowed = await canAccessClaimCandidate(tx, context.userId, {
        resultId: result.result_id,
        athleteId: result.athlete_id,
        athleteName: result.athlete_name,
        city: result.athlete_city,
        region: result.athlete_region,
        country: result.athlete_country,
        clubName: result.club_name,
      });
      if (!allowed) throw new Error("Result not available to this account");

      // Serialise every ownership decision for this athlete so two simultaneous
      // first claims cannot both be approved.
      await tx\`
        select id from athletes
        where id = \${result.athlete_id}
        for update
      \`;

      const owners = await tx<{ user_id: string; user_email: string }>\`
        select user_id, user_email
        from athlete_account_links
        where athlete_id = \${result.athlete_id} and status = 'active'
        limit 1
      \`;
      const owner = owners[0];
      if (owner?.user_id === context.userId) {
        return {
          status: "approved" as const,
          alreadyOwned: true,
          claimId: null,
          claimantUserId: context.userId,
          email: null,
        };
      }

      const competing = await tx<{ other_claim_count: number }>\`
        select count(*)::int as other_claim_count
        from result_claims
        where athlete_id = \${result.athlete_id}
          and claimant_user_id <> \${context.userId}
          and status in ('pending', 'needs_info', 'approved')
      \`;
      const otherClaimCount = competing[0]?.other_claim_count ?? 0;
      const requiresReview = Boolean(owner) || otherClaimCount > 0;
      const conflictReason = owner
        ? "This athlete profile is already linked to another account. Staff identity checks are required."
        : requiresReview
          ? "Another account has claimed this athlete profile. Staff identity checks are required."
          : null;
      const nextStatus: ResultClaimStatus = requiresReview ? "pending" : "approved";
      const automaticNote =
        nextStatus === "approved" ? "Automatically approved as the first uncontested claim." : null;

      const existing = await tx<{ id: number; status: ResultClaimStatus }>\`
        select id, status
        from result_claims
        where result_id = \${result.result_id} and claimant_user_id = \${context.userId}
        limit 1
        for update
      \`;

      let claimId: number;
      if (existing[0]) {
        const updated = await tx<{ id: number }>\`
          update result_claims
          set
            athlete_id = \${result.athlete_id},
            claimant_email = \${claimantEmail},
            status = \${nextStatus},
            verification_method = \${data.verificationMethod},
            evidence_text = \${data.evidenceText},
            evidence_url = \${data.evidenceUrl},
            declaration_accepted = true,
            conflict_reason = \${conflictReason},
            staff_note = \${automaticNote},
            reviewed_by_user_id = null,
            reviewed_by_email = null,
            reviewed_at = case when \${nextStatus} = 'approved' then now() else null end,
            submitted_at = now(),
            updated_at = now()
          where id = \${existing[0].id}
          returning id
        \`;
        claimId = updated[0].id;
      } else {
        const inserted = await tx<{ id: number }>\`
          insert into result_claims (
            result_id, athlete_id, claimant_user_id, claimant_email, status,
            verification_method, evidence_text, evidence_url,
            declaration_accepted, conflict_reason, staff_note, reviewed_at
          ) values (
            \${result.result_id}, \${result.athlete_id}, \${context.userId}, \${claimantEmail},
            \${nextStatus}, \${data.verificationMethod}, \${data.evidenceText}, \${data.evidenceUrl},
            true, \${conflictReason}, \${automaticNote},
            case when \${nextStatus} = 'approved' then now() else null end
          )
          returning id
        \`;
        claimId = inserted[0].id;
      }

      if (nextStatus === "approved") {
        const linked = await tx<{ athlete_id: number }>\`
          insert into athlete_account_links (
            athlete_id, user_id, user_email, source_claim_id, status, linked_at, updated_at
          ) values (
            \${result.athlete_id}, \${context.userId}, \${claimantEmail},
            \${claimId}, 'active', now(), now()
          )
          on conflict (athlete_id) do update set
            user_id = excluded.user_id,
            user_email = excluded.user_email,
            source_claim_id = excluded.source_claim_id,
            status = 'active',
            linked_at = now(),
            updated_at = now()
          where athlete_account_links.status = 'revoked'
             or athlete_account_links.user_id = excluded.user_id
          returning athlete_id
        \`;

        // This is a last-resort concurrency guard. The athlete row lock above
        // normally makes it unreachable, but an existing active owner must
        // never be overwritten if another code path creates one concurrently.
        if (!linked[0]) {
          const concurrentConflict =
            "This athlete profile was linked to another account while your claim was being processed. Staff identity checks are required.";
          await tx\`
            update result_claims
            set
              status = 'pending',
              conflict_reason = \${concurrentConflict},
              staff_note = null,
              reviewed_at = null,
              updated_at = now()
            where id = \${claimId}
          \`;
          return {
            status: "pending" as const,
            alreadyOwned: false,
            claimId,
            claimantUserId: context.userId,
            email: {
              claimId,
              resultId: result.result_id,
              claimantEmail,
              athleteName: result.athlete_name,
              eventName: result.event_name,
              eventDate: result.event_date,
              distanceCode: result.distance_code,
            },
          };
        }
      }

      return {
        status: nextStatus,
        alreadyOwned: false,
        claimId,
        claimantUserId: context.userId,
        email: {
          claimId,
          resultId: result.result_id,
          claimantEmail,
          athleteName: result.athlete_name,
          eventName: result.event_name,
          eventDate: result.event_date,
          distanceCode: result.distance_code,
        },
      };
    });

    if (outcome.status === "approved" && !outcome.alreadyOwned) {
      await syncAthleteAccountAfterClaim(outcome.claimantUserId);
      if (outcome.email) {
        await notifyResultClaimReviewed({
          ...outcome.email,
          status: "approved",
          staffNote: null,
        });
      }
    } else if (outcome.status === "pending" && outcome.email) {
      await notifyResultClaimSubmitted(outcome.email);
    }

    return {
      status: outcome.status,
      alreadyOwned: outcome.alreadyOwned,
      claimId: outcome.claimId,
    };
  });
`;

api = replaceBetween(
  api,
  'export const submitResultClaim = createServerFn({ method: "POST" })',
  "\nexport const listMyResultClaims",
  submitClaimBlock,
  "submitResultClaim implementation",
);
await writeFile(apiPath, api);

const routePath = "src/routes/claim-results.tsx";
let route = await readFile(routePath, "utf8");
route = replaceOnce(
  route,
  'content: "Sign in to claim an ATHRECS race result and track its verification status.",',
  'content: "Sign in to claim a matched ATHRECS result and add it to your Athlete Account immediately.",',
  "claim page description",
);
route = replaceOnce(
  route,
  'pending: "Pending review",',
  'pending: "Conflict review",',
  "pending status label",
);
route = replaceOnce(
  route,
  `      setMessage(
        response.alreadyOwned
          ? "This athlete profile is already linked to your account."
          : "Claim submitted. ATHRECS staff will check it before anything is linked.",
      );`,
  `      setMessage(
        response.alreadyOwned
          ? "This athlete profile is already linked to your account."
          : response.status === "approved"
            ? "Result added to your Athlete Account immediately."
            : "Another account has claimed this athlete profile, so ATHRECS staff will review the conflict.",
      );`,
  "claim success message",
);
route = replaceOnce(
  route,
  "            Athlete identity review",
  "            Secure result claiming",
  "claim header eyebrow",
);
route = replaceOnce(
  route,
  `            Link a result to your ATHRECS Athlete Account. Every claim is checked by ATHRECS staff
            before your athlete profile is marked as owned.`,
  `            Matched claims are linked to your Athlete Account immediately after you confirm them.
            Only a conflicting claim from another account is held for staff review.`,
  "claim header copy",
);
route = replaceOnce(
  route,
  `            title="Confirm ownership"
            detail="Sign in and provide a bib number or other verification detail."`,
  `            title="Confirm the match"
            detail="Confirm that the selected result is yours. Supporting details are optional."`,
  "claim step two",
);
route = replaceOnce(
  route,
  `            title="Staff verification"
            detail="ATHRECS checks conflicts and approves or requests more information."`,
  `            title="Added immediately"
            detail="The profile is linked straight away unless another account has already claimed it."`,
  "claim step three",
);
route = replaceOnce(
  route,
  ': "Create or sign in to your secure Athlete Account before claiming. Your account and private evidence are attached to the review request."}',
  ': "Create or sign in to your secure Athlete Account before claiming. Optional supporting details remain private to you and ATHRECS staff."}',
  "signed-out account copy",
);
route = replaceOnce(
  route,
  'note="Your claim is in the staff review queue. Published data has not been changed."',
  'note="Another account has claimed this athlete profile. The existing profile link will not change while ATHRECS reviews the conflict."',
  "conflict review note",
);
route = replaceOnce(
  route,
  "                How can we verify this result?",
  "                Supporting information type (optional)",
  "verification method label",
);
route = replaceOnce(
  route,
  "                Verification detail",
  '                Supporting detail <span className="font-normal text-subtle">(optional)</span>',
  "verification detail label",
);
route = replaceOnce(
  route,
  `                <span className="block text-xs font-normal text-subtle">
                  Do not include passwords, payment details or identity-document numbers.
                </span>`,
  `                <span className="block text-xs font-normal text-subtle">
                  You may add a bib number, club or entry name for the private audit trail. Do not
                  include passwords, payment details or identity-document numbers.
                </span>`,
  "verification detail help",
);
route = replaceOnce(
  route,
  `                  I confirm this is my result and the information supplied is accurate. I understand
                  ATHRECS may reject conflicting or unverifiable claims.`,
  `                  I confirm this is my result and the information supplied is accurate. It will be
                  added immediately unless another account has already claimed the athlete profile.`,
  "claim declaration copy",
);
route = replaceOnce(
  route,
  `                disabled={
                  submitClaim.isPending ||
                  !declaration ||
                  (!evidenceText.trim() && !evidenceUrl.trim())
                }`,
  "                disabled={submitClaim.isPending || !declaration}",
  "claim submit disabled state",
);
route = replaceOnce(
  route,
  `                {submitClaim.isPending
                  ? "Submitting…"
                  : currentClaim
                    ? "Resubmit claim"
                    : "Submit for staff review"}`,
  `                {submitClaim.isPending
                  ? "Adding result…"
                  : currentClaim
                    ? "Confirm and add result"
                    : "Add result to my profile"}`,
  "claim submit button copy",
);
await writeFile(routePath, route);

const verifyPath = "scripts/verify-result-claims.mjs";
let verify = await readFile(verifyPath, "utf8");
verify = replaceOnce(
  verify,
  'const homeRoute = await readFile(resolve(root, "src/routes/index.tsx"), "utf8");',
  `const homeRoute = await readFile(resolve(root, "src/routes/index.tsx"), "utf8");
const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");`,
  "claim route verifier input",
);
verify = replaceOnce(
  verify,
  `assert.match(api, /for update/);
assert.match(api, /Another verified account was approved/);`,
  `assert.match(api, /for update/);
assert.match(api, /const requiresReview = Boolean\\(owner\\) \\|\\| otherClaimCount > 0/);
assert.match(api, /const nextStatus: ResultClaimStatus = requiresReview \\? "pending" : "approved"/);
assert.match(api, /Automatically approved as the first uncontested claim/);
assert.match(api, /await syncAthleteAccountAfterClaim\\(outcome\\.claimantUserId\\)/);
assert.match(api, /notifyResultClaimReviewed/);
assert.doesNotMatch(api, /Add a bib number, verification detail or evidence link/);
assert.match(claimRoute, /Matched claims are linked to your Athlete Account immediately/);
assert.match(claimRoute, /Add result to my profile/);
assert.match(claimRoute, /disabled=\\{submitClaim\\.isPending \\|\\| !declaration\\}/);
assert.match(api, /Another verified account was approved/);`,
  "instant-approval verification assertions",
);
await writeFile(verifyPath, verify);

const packagePath = "package.json";
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
if (!packageJson.scripts?.["verify:result-claims"]) {
  throw new Error("verify:result-claims script is missing");
}
const ciVerify = packageJson.scripts["ci:verify"];
if (typeof ciVerify !== "string") throw new Error("ci:verify script is missing");
if (!ciVerify.includes("npm run verify:result-claims")) {
  packageJson.scripts["ci:verify"] = ciVerify.replace(
    "npm run verify:result-matches &&",
    "npm run verify:result-matches && npm run verify:result-claims &&",
  );
}
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log("Instant uncontested result-claim approval patch applied");
