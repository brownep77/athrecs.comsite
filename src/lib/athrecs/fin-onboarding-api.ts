import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseFinContinuation, type FinResumeResult } from "./fin-onboarding";

const finResponsePrivacy = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("Cache-Control", "private, no-store");
  setResponseHeader("Vary", "Cookie, Authorization");
  setResponseHeader("Referrer-Policy", "no-referrer");
  setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  return next();
});

export const resumeFinOnboarding = createServerFn({ method: "POST" })
  .middleware([finResponsePrivacy, authMiddleware])
  .validator((input: { continuation: string }) =>
    z
      .object({
        continuation: z.string().refine((value) => Boolean(parseFinContinuation(value))),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<FinResumeResult> => {
    const { authConfigured, DEV_USER_ID } = await import("@/lib/auth/verify.server");
    const { finConnectorConfigured } = await import("./fin-actions.server");
    if (!authConfigured || context.userId === DEV_USER_ID || !finConnectorConfigured())
      return { status: "unavailable" };
    const { getSql } = await import("@/lib/db");
    const { resumeFinSignup } = await import("./fin-onboarding.server");
    return resumeFinSignup(await getSql(), data.continuation, context.userId);
  });
