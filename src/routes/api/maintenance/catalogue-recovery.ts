import { createHash, timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { dbSource } from "@/lib/db";
import { ensureAthrecsSeeded } from "@/lib/athrecs/seed.server";
import {
  getCatalogueRecoveryVerification,
  runCatalogueRecoveryBatch,
} from "@/lib/athrecs/catalogue-recovery.server";

const TOKEN_HASH = "d9688555b979fa9463376a8fe46bcd3ca39e7a2fe825ab9fe37e1ebd35d76ec8";
const STAFF_HOST = "update.athrecs.com";

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

function authorized(request: Request): boolean {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  if (url.hostname !== STAFF_HOST || forwardedHost !== STAFF_HOST) return false;

  const supplied = url.searchParams.get("token");
  if (!supplied) return false;
  const suppliedHash = createHash("sha256").update(supplied).digest();
  const expectedHash = Buffer.from(TOKEN_HASH, "hex");
  return suppliedHash.length === expectedHash.length && timingSafeEqual(suppliedHash, expectedHash);
}

export const Route = createFileRoute("/api/maintenance/catalogue-recovery")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorized(request)) return json({ message: "Not found" }, 404);
        if (dbSource !== "neon") {
          return json({ message: "Persistent Neon database is not connected" }, 503);
        }

        await ensureAthrecsSeeded();
        if (new URL(request.url).searchParams.get("verify") === "1") {
          return json(await getCatalogueRecoveryVerification());
        }
        const status = await runCatalogueRecoveryBatch();
        return json(status);
      },
    },
  },
});
