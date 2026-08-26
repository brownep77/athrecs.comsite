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

api = replaceOnce(
  api,
  '  evidenceText: string;\n  evidenceUrl: string | null;\n  conflictReason: string | null;',
  '  evidenceText: string;\n  evidenceUrl: string | null;\n  evidenceUrl2: string | null;\n  evidenceUrl3: string | null;\n  conflictReason: string | null;',
  "public claim evidence fields",
);
api = replaceOnce(
  api,
  '  evidence_text: string;\n  evidence_url: string | null;\n  conflict_reason: string | null;',
  '  evidence_text: string;\n  evidence_url: string | null;\n  evidence_url_2: string | null;\n  evidence_url_3: string | null;\n  conflict_reason: string | null;',
  "claim row evidence fields",
);
api = replaceOnce(
  api,
  `function verificationMethod(value: unknown): ResultClaimVerificationMethod {
  if (
    value === "bib" ||
    value === "official_email" ||
    value === "club_confirmation" ||
    value === "other"
  ) {
    return value;
  }
  throw new Error("Choose how ATHRECS can verify this claim");
}

`,
  "",
  "verification method validator",
);
api = replaceOnce(
  api,
  '    evidenceText: row.evidence_text,\n    evidenceUrl: row.evidence_url,\n    conflictReason: row.conflict_reason,',
  '    evidenceText: row.evidence_text,\n    evidenceUrl: row.evidence_url,\n    evidenceUrl2: row.evidence_url_2,\n    evidenceUrl3: row.evidence_url_3,\n    conflictReason: row.conflict_reason,',
  "claim evidence mapping",
);
api = replaceOnce(
  api,
  '    claim.evidence_text,\n    claim.evidence_url,\n    claim.conflict_reason,',
  '    claim.evidence_text,\n    claim.evidence_url,\n    claim.evidence_url_2,\n    claim.evidence_url_3,\n    claim.conflict_reason,',
  "claim evidence select",
);
api = replaceOnce(
  api,
  `  .validator(
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
  )`,
  `  .validator(
    (input: {
      resultId: number;
      evidenceUrl?: string;
      evidenceUrl2?: string;
      evidenceUrl3?: string;
      declarationAccepted: boolean;
    }) => ({
      resultId: positiveInteger(input?.resultId, "Result"),
      verificationMethod: "other" as ResultClaimVerificationMethod,
      evidenceText: "",
      evidenceUrl: optionalHttpsUrl(input?.evidenceUrl),
      evidenceUrl2: optionalHttpsUrl(input?.evidenceUrl2),
      evidenceUrl3: optionalHttpsUrl(input?.evidenceUrl3),
      declarationAccepted: input?.declarationAccepted === true,
    }),
  )`,
  "claim submission validator",
);
api = replaceOnce(
  api,
  '            verification_method = ${data.verificationMethod},\n            evidence_text = ${data.evidenceText},\n            evidence_url = ${data.evidenceUrl},',
  '            verification_method = ${data.verificationMethod},\n            evidence_text = ${data.evidenceText},\n            evidence_url = ${data.evidenceUrl},\n            evidence_url_2 = ${data.evidenceUrl2},\n            evidence_url_3 = ${data.evidenceUrl3},',
  "claim update evidence values",
);
api = replaceOnce(
  api,
  `            verification_method, evidence_text, evidence_url,
            declaration_accepted, conflict_reason, staff_note, reviewed_at
          ) values (
            ${"${result.result_id}"}, ${"${result.athlete_id}"}, ${"${context.userId}"}, ${"${claimantEmail}"},
            ${"${nextStatus}"}, ${"${data.verificationMethod}"}, ${"${data.evidenceText}"}, ${"${data.evidenceUrl}"},
            true, ${"${conflictReason}"}, ${"${automaticNote}"},`,
  `            verification_method, evidence_text, evidence_url, evidence_url_2, evidence_url_3,
            declaration_accepted, conflict_reason, staff_note, reviewed_at
          ) values (
            ${"${result.result_id}"}, ${"${result.athlete_id}"}, ${"${context.userId}"}, ${"${claimantEmail}"},
            ${"${nextStatus}"}, ${"${data.verificationMethod}"}, ${"${data.evidenceText}"},
            ${"${data.evidenceUrl}"}, ${"${data.evidenceUrl2}"}, ${"${data.evidenceUrl3}"},
            true, ${"${conflictReason}"}, ${"${automaticNote}"},`,
  "claim insert evidence values",
);
await writeFile(apiPath, api);

const claimRoutePath = "src/routes/claim-results.tsx";
let claimRoute = await readFile(claimRoutePath, "utf8");
claimRoute = replaceOnce(
  claimRoute,
  '  type ResultClaimStatus,\n  type ResultClaimVerificationMethod,',
  '  type ResultClaimStatus,',
  "claim route verification method import",
);
claimRoute = replaceOnce(
  claimRoute,
  `const METHOD_LABELS: Record<ResultClaimVerificationMethod, string> = {
  bib: "Bib number or race details",
  official_email: "Race-entry email",
  club_confirmation: "Running club confirmation",
  other: "Other evidence",
};

`,
  "",
  "claim route verification method labels",
);
claimRoute = replaceOnce(
  claimRoute,
  '  const [method, setMethod] = useState<ResultClaimVerificationMethod>("bib");\n  const [evidenceText, setEvidenceText] = useState("");\n  const [evidenceUrl, setEvidenceUrl] = useState("");',
  '  const [evidenceUrl, setEvidenceUrl] = useState("");\n  const [evidenceUrl2, setEvidenceUrl2] = useState("");\n  const [evidenceUrl3, setEvidenceUrl3] = useState("");',
  "claim evidence state",
);
claimRoute = replaceOnce(
  claimRoute,
  `  useEffect(() => {
    if (currentClaim?.status !== "needs_info") return;
    setMethod(currentClaim.verificationMethod);
    setEvidenceText(currentClaim.evidenceText);
    setEvidenceUrl(currentClaim.evidenceUrl ?? "");
  }, [currentClaim]);`,
  `  useEffect(() => {
    if (currentClaim?.status !== "needs_info") return;
    setEvidenceUrl(currentClaim.evidenceUrl ?? "");
    setEvidenceUrl2(currentClaim.evidenceUrl2 ?? "");
    setEvidenceUrl3(currentClaim.evidenceUrl3 ?? "");
  }, [currentClaim]);`,
  "claim evidence restoration",
);
claimRoute = replaceOnce(
  claimRoute,
  `          resultId: resultId as number,
          verificationMethod: method,
          evidenceText,
          evidenceUrl,
          declarationAccepted: declaration,`,
  `          resultId: resultId as number,
          evidenceUrl,
          evidenceUrl2,
          evidenceUrl3,
          declarationAccepted: declaration,`,
  "claim submission payload",
);
claimRoute = replaceOnce(
  claimRoute,
  "Confirm that the selected result is yours. Supporting details are optional.",
  "Confirm that the selected result is yours. Evidence links are optional and never required.",
  "claim step evidence copy",
);
claimRoute = replaceOnce(
  claimRoute,
  "Use email and password, Google, or another available provider. Your evidence\n                  remains private to you and ATHRECS staff.",
  "Use email and password, Google, or another available provider. Any optional evidence\n                  links remain private to you and ATHRECS staff.",
  "signed-out evidence copy",
);
const evidenceStart = `              <label className="block space-y-1.5 text-sm font-medium text-fg">
                Supporting information type (optional)`;
const declarationStart = `              <label className="flex items-start gap-3 rounded-lg border border-border bg-elevated p-3 text-sm text-muted">`;
claimRoute = replaceBetween(
  claimRoute,
  evidenceStart,
  declarationStart,
  `              <div className="space-y-3 rounded-lg border border-border bg-elevated p-4">
                <div>
                  <h3 className="text-sm font-semibold text-fg">Optional evidence links</h3>
                  <p className="mt-1 text-xs text-muted">
                    Evidence is not required to claim a result. You may add up to three HTTPS links
                    for the private audit trail.
                  </p>
                </div>
                <label className="block space-y-1.5 text-sm font-medium text-fg">
                  Evidence link 1 <span className="font-normal text-subtle">(optional)</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={evidenceUrl}
                    onChange={(event) => setEvidenceUrl(event.target.value)}
                    placeholder="https://official-results.example/…"
                    className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-fg">
                  Evidence link 2 <span className="font-normal text-subtle">(optional)</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={evidenceUrl2}
                    onChange={(event) => setEvidenceUrl2(event.target.value)}
                    placeholder="https://official-results.example/…"
                    className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-fg">
                  Evidence link 3 <span className="font-normal text-subtle">(optional)</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={evidenceUrl3}
                    onChange={(event) => setEvidenceUrl3(event.target.value)}
                    placeholder="https://official-results.example/…"
                    className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </label>
              </div>

`,
  "claim evidence controls",
);
await writeFile(claimRoutePath, claimRoute);

const adminRoutePath = "src/routes/admin/result-claims.tsx";
let adminRoute = await readFile(adminRoutePath, "utf8");
adminRoute = replaceOnce(
  adminRoute,
  `          <p className="max-w-3xl text-sm text-muted">
            Verify ownership evidence before linking a Google account to an athlete profile.
            Approving one claimant automatically closes unresolved competing claims for that
            athlete.
          </p>`,
  `          <p className="max-w-3xl text-sm text-muted">
            Uncontested claims are approved automatically. This queue is only for genuine ownership
            conflicts, where optional evidence links may help staff decide between claimants.
          </p>`,
  "staff claim page introduction",
);
adminRoute = replaceOnce(
  adminRoute,
  `  const conflict =
    claim.conflictReason || claim.existingOwnerEmail || (claim.competingClaimCount ?? 0) > 0;

  return (`,
  `  const conflict =
    claim.conflictReason || claim.existingOwnerEmail || (claim.competingClaimCount ?? 0) > 0;
  const evidenceLinks = [claim.evidenceUrl, claim.evidenceUrl2, claim.evidenceUrl3].filter(
    (url): url is string => Boolean(url),
  );

  return (`,
  "staff evidence link collection",
);
adminRoute = replaceOnce(
  adminRoute,
  `            <Info
              label="Verification method"
              value={claim.verificationMethod.replaceAll("_", " ")}
            />`,
  `            <Info label="Claim basis" value="Athlete self-confirmation" />`,
  "staff claim basis",
);
adminRoute = replaceOnce(
  adminRoute,
  `          <div className="rounded-lg border border-border bg-elevated p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Evidence detail
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-fg">
              {claim.evidenceText || "No written detail supplied."}
            </p>
            {claim.evidenceUrl ? (
              <a
                href={claim.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-medium text-accent no-underline hover:underline"
              >
                Open evidence link <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>`,
  `          <div className="rounded-lg border border-border bg-elevated p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Optional evidence links
            </p>
            {evidenceLinks.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {evidenceLinks.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border bg-bg px-3 text-xs font-medium text-accent no-underline hover:underline"
                  >
                    Open evidence link {index + 1}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No evidence was supplied. Evidence is not required for an uncontested claim.
              </p>
            )}
            {claim.evidenceText ? (
              <details className="mt-3 text-sm text-muted">
                <summary className="cursor-pointer font-medium text-fg">
                  Legacy written detail
                </summary>
                <p className="mt-2 whitespace-pre-wrap">{claim.evidenceText}</p>
              </details>
            ) : null}
          </div>`,
  "staff evidence display",
);
await writeFile(adminRoutePath, adminRoute);

const verifyPath = "scripts/verify-result-claims.mjs";
let verify = await readFile(verifyPath, "utf8");
verify = replaceOnce(
  verify,
  'const migration = await readFile(resolve(root, "migrations/0013_result_claims.sql"), "utf8");',
  'const migration = await readFile(resolve(root, "migrations/0013_result_claims.sql"), "utf8");\nconst evidenceLinksMigration = await readFile(\n  resolve(root, "migrations/0020_result_claim_evidence_links.sql"),\n  "utf8",\n);',
  "result claim evidence migration read",
);
verify = replaceOnce(
  verify,
  'const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");',
  'const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");\nconst adminClaimRoute = await readFile(\n  resolve(root, "src/routes/admin/result-claims.tsx"),\n  "utf8",\n);',
  "admin claim route read",
);
verify = replaceOnce(
  verify,
  `assert.doesNotMatch(api, /Add a bib number, verification detail or evidence link/);
assert.match(claimRoute, /Matched claims are linked to your Athlete Account immediately/);
assert.match(claimRoute, /Add result to my profile/);
assert.match(claimRoute, /disabled=\\{submitClaim\\.isPending \\|\\| !declaration\\}/);`,
  `assert.doesNotMatch(api, /Add a bib number, verification detail or evidence link/);
assert.match(api, /evidenceUrl2: optionalHttpsUrl/);
assert.match(api, /evidenceUrl3: optionalHttpsUrl/);
assert.match(api, /evidence_url_2/);
assert.match(api, /evidence_url_3/);
assert.match(evidenceLinksMigration, /add column if not exists evidence_url_2/);
assert.match(evidenceLinksMigration, /add column if not exists evidence_url_3/);
assert.match(claimRoute, /Matched claims are linked to your Athlete Account immediately/);
assert.match(claimRoute, /Evidence is not required to claim a result/);
assert.match(claimRoute, /Evidence link 3/);
assert.doesNotMatch(claimRoute, /Supporting detail/);
assert.doesNotMatch(claimRoute, /Supporting information type/);
assert.match(claimRoute, /Add result to my profile/);
assert.match(claimRoute, /disabled=\\{submitClaim\\.isPending \\|\\| !declaration\\}/);
assert.match(adminClaimRoute, /Optional evidence links/);
assert.match(adminClaimRoute, /Evidence is not required for an uncontested claim/);`,
  "optional evidence verification assertions",
);
verify = replaceOnce(
  verify,
  "await db.exec(migration);",
  "await db.exec(migration);\nawait db.exec(evidenceLinksMigration);",
  "evidence migration execution",
);
verify = replaceOnce(
  verify,
  `  insert into result_claims (
    result_id, athlete_id, claimant_user_id, claimant_email,
    verification_method, evidence_text, declaration_accepted
  ) values (
    1, 1, 'user-one', 'runner@example.com', 'bib', 'Bib 42', true
  );`,
  `  insert into result_claims (
    result_id, athlete_id, claimant_user_id, claimant_email,
    verification_method, evidence_text, evidence_url, evidence_url_2, evidence_url_3,
    declaration_accepted
  ) values (
    1, 1, 'user-one', 'runner@example.com', 'other', '',
    'https://example.com/evidence-1', 'https://example.com/evidence-2',
    'https://example.com/evidence-3', true
  );`,
  "three evidence link fixture",
);
verify = replaceOnce(
  verify,
  `const claims = await db.query(\`select status, verification_method from result_claims\`);
assert.equal(claims.rows.length, 1);
assert.equal(claims.rows[0].status, "pending");
assert.equal(claims.rows[0].verification_method, "bib");`,
  `const claims = await db.query(\`
  select status, verification_method, evidence_url, evidence_url_2, evidence_url_3
  from result_claims
\`);
assert.equal(claims.rows.length, 1);
assert.equal(claims.rows[0].status, "pending");
assert.equal(claims.rows[0].verification_method, "other");
assert.deepEqual(
  [claims.rows[0].evidence_url, claims.rows[0].evidence_url_2, claims.rows[0].evidence_url_3],
  [
    "https://example.com/evidence-1",
    "https://example.com/evidence-2",
    "https://example.com/evidence-3",
  ],
);`,
  "three evidence link assertions",
);
verify = replaceOnce(
  verify,
  `      verification_method, evidence_text, evidence_url, declaration_accepted
    ) values (1, 1, 'staff-one', 'staff@example.com', 'other', 'Bad URL', 'http://example.com', true)`,
  `      verification_method, evidence_text, evidence_url_2, declaration_accepted
    ) values (1, 1, 'staff-one', 'staff@example.com', 'other', '', 'http://example.com', true)`,
  "additional evidence HTTPS constraint test",
);
verify = replaceOnce(
  verify,
  'assert.equal(claimList.rows[0].athlete_name, "Verification Runner");',
  'assert.equal(claimList.rows[0].athlete_name, "Verification Runner");\nassert.equal(claimList.rows[0].evidence_url_3, "https://example.com/evidence-3");',
  "claim list third evidence assertion",
);
await writeFile(verifyPath, verify);

await writeFile(
  "migrations/0020_result_claim_evidence_links.sql",
  `-- Up to three optional HTTPS evidence links may accompany a result claim.
-- Evidence is never required for an uncontested athlete self-claim.

alter table result_claims
  add column if not exists evidence_url_2 text
  check (evidence_url_2 is null or evidence_url_2 ~ '^https://');

alter table result_claims
  add column if not exists evidence_url_3 text
  check (evidence_url_3 is null or evidence_url_3 ~ '^https://');

comment on column result_claims.evidence_url_2 is
  'Optional second private evidence link supplied by the claimant.';
comment on column result_claims.evidence_url_3 is
  'Optional third private evidence link supplied by the claimant.';
`,
);

console.log("Applied optional three-link result-claim evidence flow");
