import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "node:crypto";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";

// This standalone form has no tracking, third-party scripts, session or mutations on GET.
// The secret arrives in the URL fragment so it never enters HTTP access logs or referrers.
function page(body: string, status = 200, nonce = "") {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Club representative verification | AthRecs</title><style>body{font:18px/1.55 system-ui;color:#172530;background:#f3f7f6;margin:0}main{max-width:34rem;margin:8vh auto;background:white;padding:2rem;border-top:4px solid #007f70}small{font-weight:bold;color:#007367}button{font:inherit;margin:0 .5rem .5rem 0;padding:.6rem .9rem;cursor:pointer}button:first-of-type{background:#00685e;color:white;border:2px solid #00685e}</style></head><body><main><small>AthRecs · Club verification</small>${body}</main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; script-src ${nonce ? "'nonce-" + nonce + "'" : "'none'"}; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`,
      },
    },
  );
}
export const Route = createFileRoute("/api/club-confirmation")({
  server: {
    handlers: {
      GET: () => {
        const nonce = randomBytes(18).toString("base64");
        return page(
          `<h1>Confirm a club representative</h1><p>Check the club, applicant’s name, account email and role in your AthRecs email. Confirm only if the club authorised that person to manage its public profile.</p><form method="post"><input type="hidden" name="token"><button disabled name="answer" value="confirmed">Confirm appointment</button><button disabled name="answer" value="disputed">Report this request</button></form><p id="help">Open the full link in the email to respond.</p><script nonce="${nonce}">const token=location.hash.slice(1);history.replaceState(null,"",location.pathname);if(/^[A-Za-z0-9_-]{43}$/.test(token)){document.querySelector("input").value=token;document.querySelectorAll("button").forEach(b=>b.disabled=false);document.getElementById("help").hidden=true}</script>`,
          200,
          nonce,
        );
      },
      POST: async ({ request }) => {
        const url = new URL(request.url);
        if (
          !IS_ATHRECS_SITE ||
          request.headers.get("origin") !== url.origin ||
          !request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded") ||
          (process.env.VERCEL_ENV === "preview" && process.env.DATABASE_URL?.trim()) ||
          (process.env.VERCEL_ENV === "production" &&
            (!process.env.DATABASE_URL?.trim() ||
              !["www.athrecs.com", "athrecs.com"].includes(url.hostname)))
        )
          return page("<h1>This request is unavailable.</h1>", 403);
        const form = await request.formData();
        const token = form.get("token"),
          answer = form.get("answer");
        if (typeof token !== "string" || (answer !== "confirmed" && answer !== "disputed"))
          return page("<h1>Invalid request</h1>", 400);
        const { getSql } = await import("@/lib/db");
        const { answerClubConfirmation } = await import("@/lib/clubs/confirmation.server");
        if (!(await answerClubConfirmation(await getSql(), token, answer)))
          return page(
            "<h1>This link is no longer valid</h1><p>It may have expired, been replaced or already been answered. Contact AthRecs for a fresh request.</p>",
            410,
          );
        return page(
          answer === "confirmed"
            ? "<h1>Confirmation received</h1><p>AthRecs staff will complete their review before granting access.</p>"
            : "<h1>Request reported</h1><p>This application is blocked from approval while AthRecs reviews your report.</p>",
        );
      },
    },
  },
});
