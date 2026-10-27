import { SEVENTH_FIXTURE_QUALITY_REVIEW } from "./lib/fixture-quality-seventh-2026-10-26-review.mjs";
import seventhFixtureQuality from "../src/data/fixture-quality-seventh-2026-10-26.json" with { type: "json" };
import { FIFTH_DUPLICATE_PROGRAMMES_REVIEW } from "./lib/duplicate-programmes-fifth-2026-10-26-review.mjs";
import fifthDuplicateProgrammeStarts from "../src/data/duplicate-programme-starts-fifth-2026-10-26.json" with { type: "json" };
import { createServer } from "vite";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { HADLEIGH_PROGRAMME_REVIEW } from "./lib/hadleigh-programme-2026-10-26-review.mjs";
import { NOVEMBER_NIGHTMARE_PROGRAMME_REVIEW } from "./lib/november-nightmare-programme-2026-10-26-review.mjs";
import fourthDuplicateProgrammeStarts from "../src/data/duplicate-programme-starts-fourth-2026-10-26.json" with { type: "json" };
import thirdDuplicateProgrammeStarts from "../src/data/duplicate-programme-starts-third-2026-10-26.json" with { type: "json" };
import { START_TIME_REVIEW } from "./lib/official-start-time-review.mjs";
import { OFFICIAL_START_TIME_DETAILS } from "./lib/official-start-time-details.mjs";
import { NORFOLK_CLARIFICATION_REVIEW } from "./lib/norfolk-start-clarification-review.mjs";
import { NORFOLK_CLARIFICATION_DETAILS } from "./lib/norfolk-start-clarification-details.mjs";
import { REEPHAM_LAP_STARTS_REVIEW } from "./lib/reepham-lap-starts-review.mjs";
import { MARRIOTTS_CONFIRMATION_REVIEW } from "./lib/marriotts-organiser-confirmation-review.mjs";
import marriottsConfirmation from "../src/data/marriotts-organiser-confirmation-2026-10-23.json" with { type: "json" };
import { TIMING_DIRECTORY_STARTS_20261023_REVIEW } from "./lib/timing-directory-starts-2026-10-23-review.mjs";
import timingDirectoryStarts from "../src/data/timing-directory-starts-2026-10-23.json" with { type: "json" };
import { TIMING_DIRECTORY_STARTS_20261024_REVIEW } from "./lib/timing-directory-starts-2026-10-24-review.mjs";
import timingDirectoryStarts20261024 from "../src/data/timing-directory-starts-2026-10-24.json" with { type: "json" };
import { ACCRA_START_REVIEW } from "./lib/accra-start-2026-10-25-review.mjs";
import accraStart from "../src/data/accra-start-2026-10-25.json" with { type: "json" };
import { IMMINENT_STARTS_REVIEW } from "./lib/imminent-starts-2026-10-25-review.mjs";
import imminentStarts from "../src/data/imminent-starts-2026-10-25.json" with { type: "json" };
import urgentStarts from "../src/data/urgent-starts-followup-2026-10-25.json" with { type: "json" };
import { URGENT_STARTS_FOLLOWUP_REVIEW } from "./lib/urgent-starts-followup-2026-10-25-review.mjs";
import thirdUrgentStarts from "../src/data/urgent-starts-third-2026-10-25.json" with { type: "json" };
import { URGENT_STARTS_THIRD_REVIEW } from "./lib/urgent-starts-third-2026-10-25-review.mjs";
import nextUrgentStarts from "../src/data/urgent-starts-next-2026-10-25.json" with { type: "json" };
import { URGENT_STARTS_NEXT_REVIEW } from "./lib/urgent-starts-next-2026-10-25-review.mjs";
if (process.env.VERCEL_ENV !== "production" || process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  console.log("[fixture-checks] skipping outside production/main");
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent database required");
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  const { FIXTURE_DETAILS } = await vite.ssrLoadModule("/src/data/fixture-details.ts");
  console.log(
    "[fixture-checks]",
    await publishCheckedFixtures(await getSql(), publishing, FIXTURE_DETAILS),
  );
  console.log(
    "[official-start-times]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      OFFICIAL_START_TIME_DETAILS,
      START_TIME_REVIEW,
    ),
  );
  console.log(
    "[norfolk-start-clarification]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      NORFOLK_CLARIFICATION_DETAILS,
      NORFOLK_CLARIFICATION_REVIEW,
    ),
  );
  console.log(
    "[reepham-lap-starts]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      { "reepham-cross-country|2027-01-31": FIXTURE_DETAILS["reepham-cross-country|2027-01-31"] },
      REEPHAM_LAP_STARTS_REVIEW,
    ),
  );
  console.log(
    "[marriotts-organiser-confirmation]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      marriottsConfirmation,
      MARRIOTTS_CONFIRMATION_REVIEW,
    ),
  );
  console.log(
    "[timing-directory-starts-2026-10-23]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      timingDirectoryStarts,
      TIMING_DIRECTORY_STARTS_20261023_REVIEW,
    ),
  );
  console.log(
    "[timing-directory-starts-2026-10-24]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      timingDirectoryStarts20261024,
      TIMING_DIRECTORY_STARTS_20261024_REVIEW,
    ),
  );
  console.log(
    "[accra-start-2026-10-25]",
    await publishCheckedFixtures(await getSql(), publishing, accraStart, ACCRA_START_REVIEW),
  );
  console.log(
    "[imminent-starts-2026-10-25]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      imminentStarts,
      IMMINENT_STARTS_REVIEW,
    ),
  );
  console.log(
    "[urgent-starts-followup-2026-10-25]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      urgentStarts,
      URGENT_STARTS_FOLLOWUP_REVIEW,
    ),
  );
  console.log(
    "[urgent-starts-next-2026-10-25]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      nextUrgentStarts,
      URGENT_STARTS_NEXT_REVIEW,
    ),
  );
  console.log(
    "[urgent-starts-third-2026-10-25]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      thirdUrgentStarts,
      URGENT_STARTS_THIRD_REVIEW,
    ),
  );
  console.log(
    "[hadleigh-programme]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      thirdDuplicateProgrammeStarts,
      HADLEIGH_PROGRAMME_REVIEW,
    ),
  );
  console.log(
    "[november-nightmare-programme]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      fourthDuplicateProgrammeStarts,
      NOVEMBER_NIGHTMARE_PROGRAMME_REVIEW,
    ),
  );
  console.log(
    "[duplicate-programmes-fifth]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      fifthDuplicateProgrammeStarts,
      FIFTH_DUPLICATE_PROGRAMMES_REVIEW,
    ),
  );
  console.log(
    "[fixture-quality-seventh]",
    await publishCheckedFixtures(
      await getSql(),
      publishing,
      seventhFixtureQuality,
      SEVENTH_FIXTURE_QUALITY_REVIEW,
    ),
  );
} finally {
  await vite.close();
}
