import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

// Synthetic records only: no database access, captured athletes or source-result identifiers.
const server = await createServer({
  configFile: false,
  plugins: [react()],
  resolve: { alias: { "@": resolve("src") } },
  server: { middlewareMode: true, ws: false },
});
try {
  const { sourceHistorySchema } = await server.ssrLoadModule(
    "/src/lib/athrecs/source-performance-history.ts",
  );
  const { withoutProfileEvidence } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-evidence.ts",
  );
  const { buildPublicAthletePreview } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-athlete-preview.ts",
  );
  const { profileResultLicenceCredits } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-result-licence.ts",
  );
  const { PublicResultLicenceCredits } = await server.ssrLoadModule(
    "/src/components/athletes/PublicResultLicenceCredits.tsx",
  );
  const privateUrl = "https://example.test/private-result/synthetic-private-id";
  const history = sourceHistorySchema.parse({
    provider: "Pace Notes",
    externalId: "synthetic-private-id",
    sourceUrl: privateUrl,
    capturedAt: "2026-10-01T00:00:00Z",
    complete: false,
    yearsExpected: [2025],
    yearsCaptured: [2025],
    performances: [
      {
        year: 2025,
        date: "2025-04-27",
        sourceDate: "private-capture-date",
        ageGroup: "",
        discipline: "Marathon",
        performance: "03:45:12",
        timing: { basis: "unknown" },
        wind: "",
        place: "",
        venue: "Synthetic venue",
        meeting: "Synthetic Marathon",
        sourceUrls: [privateUrl],
        sourceKeys: ["private-source-key"],
        labels: ["Road"],
        providerName: "Pace Notes",
        verificationStatus: "unverified",
        notes: "private-identity-review and private-research-note",
      },
    ],
  });
  const input = {
    slug: "synthetic-runner",
    displayName: "Synthetic Runner",
    athleteNumber: "1000000000",
    results: [],
    histories: [history],
    searchIndexable: false,
  };
  const original = JSON.stringify(input);
  const expectedCredits = ["pace-notes-marathon-corpus-v3"];
  const preview = buildPublicAthletePreview(input);
  assert.deepEqual(preview.publicLicenceCredits, expectedCredits);
  assert.equal(preview.entries.length, 1);
  assert.equal(preview.entries[0].result.performance.performance, "03:45:12");
  assert.equal(preview.entries[0].result.performance.verificationStatus, "unverified");
  assert.deepEqual(preview.entries[0].result.performance.timing, { basis: "unknown" });
  assert.deepEqual(preview.entries[0].result.performance.sourceUrls, []);
  assert.doesNotMatch(
    JSON.stringify(preview),
    /example\.test|synthetic-private-id|private-source-key|private-identity-review|private-research-note|private-capture-date/,
  );
  assert.equal(JSON.stringify(input), original, "Projection never modifies retained evidence");

  const projected = withoutProfileEvidence([history]);
  assert.equal(projected[0].provider, "Recorded results");
  assert.equal(projected[0].sourceUrl, "");
  assert.deepEqual(profileResultLicenceCredits(projected), expectedCredits);
  assert.deepEqual(profileResultLicenceCredits(withoutProfileEvidence(projected)), expectedCredits);
  assert.deepEqual(
    withoutProfileEvidence({
      publicLicenceCredits: [
        ...expectedCredits,
        privateUrl,
        { url: privateUrl },
        "unknown-provider",
      ],
    }).publicLicenceCredits,
    expectedCredits,
    "Arbitrary credit metadata cannot bypass privacy",
  );
  assert.throws(() =>
    sourceHistorySchema.parse({ ...history, publicLicenceCredits: [privateUrl] }),
  );
  assert.deepEqual(
    profileResultLicenceCredits([{ ...history, provider: "Unlisted provider" }]),
    [],
  );
  assert.deepEqual(profileResultLicenceCredits([{ ...history, performances: [] }]), []);
  const excluded = {
    ...history,
    performances: history.performances.map((row) => ({ ...row, profileExcluded: true })),
  };
  assert.deepEqual(
    buildPublicAthletePreview({ ...input, histories: [excluded] }).publicLicenceCredits,
    [],
  );

  const matchingResult = {
    resultId: 1,
    editionId: 1,
    eventName: "Synthetic Marathon",
    eventSlug: "synthetic-marathon",
    sport: "Running",
    surface: "Road",
    country: "",
    eventDate: "2025-04-27",
    distanceCode: "Marathon",
    distanceKm: 42.195,
    status: "finished",
    finishTimeSeconds: 13512,
    chipTimeSeconds: null,
    gunTimeSeconds: null,
    overallPlace: null,
    category: null,
    sourceUrls: [],
    resultSource: "unverified",
    details: { verificationStatus: "unverified" },
  };
  const merged = buildPublicAthletePreview({ ...input, results: [matchingResult] });
  assert.equal(merged.totalResults, 1, "Same dated event and mark display once");
  assert.equal(merged.entries[0].kind, "recorded");
  assert.deepEqual(
    merged.publicLicenceCredits,
    expectedCredits,
    "Credit survives timeline deduplication",
  );

  const html = renderToStaticMarkup(
    createElement(PublicResultLicenceCredits, {
      credits: preview.publicLicenceCredits,
    }),
  );
  assert.match(html, /Andrew Kam \/ Pace Notes/);
  assert.match(html, /Pace Notes: marathon race results corpus \(5 km splits\)/);
  assert.match(html, /href="https:\/\/doi\.org\/10\.6084\/m9\.figshare\.33965155\.v3"/);
  assert.match(html, /href="https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/);
  assert.match(html, /CC BY 4\.0/);
  assert.match(html, /Selected London Marathon editions; names reordered for display\./);
  assert.doesNotMatch(html, /example\.test|private-identity-review|synthetic-private-id/);
  assert.equal(
    renderToStaticMarkup(createElement(PublicResultLicenceCredits, { credits: [] })),
    "",
  );
  console.log(
    "Public result licence: fixed CC BY credit survives anonymous/member projection and display deduplication; private evidence and unverified timing remain unchanged.",
  );
} finally {
  await server.close();
}
