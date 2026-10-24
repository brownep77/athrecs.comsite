import { createServer } from "vite";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
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
} finally {
  await vite.close();
}
