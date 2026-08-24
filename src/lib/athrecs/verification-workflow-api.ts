import { createServerFn } from "@tanstack/react-start";
import { dbSource } from "@/lib/db";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import type {
  CandidateReviewInput,
  VerificationCandidateInput,
  VerificationEntryInput,
  VerificationResultInput,
} from "./verification-workflow.server";

function requirePersistentDatabase(): void {
  if (dbSource !== "neon") {
    throw new Error("Persistent Neon Postgres is required for fixture verification changes");
  }
}

export const getVerificationWorkbench = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator(
    (
      input:
        | {
            candidateId?: string;
            status?: "pending" | "approved" | "published" | "rejected" | "all";
          }
        | undefined,
    ) => input ?? {},
  )
  .handler(async ({ data }) => {
    const { getVerificationDashboard } = await import("./verification-workflow.server");
    return JSON.parse(JSON.stringify(await getVerificationDashboard(data)));
  });

export const stageFixtureVerificationCandidate = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: VerificationCandidateInput) => input)
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { stageVerificationCandidate } = await import("./verification-workflow.server");
    return stageVerificationCandidate(data, context.staffEmail);
  });

export const saveFixtureCandidateReview = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: CandidateReviewInput) => input)
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { updateCandidateReview } = await import("./verification-workflow.server");
    return updateCandidateReview(data, context.staffEmail);
  });

export const saveFixtureCandidateEntry = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { candidateId: string; option: VerificationEntryInput }) => input)
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { saveCandidateEntryOption } = await import("./verification-workflow.server");
    return saveCandidateEntryOption(data, context.staffEmail);
  });

export const saveFixtureCandidateResult = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { candidateId: string; result: VerificationResultInput }) => input)
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { saveCandidateResultLink } = await import("./verification-workflow.server");
    return saveCandidateResultLink(data, context.staffEmail);
  });

export const publishFixtureVerificationCandidate = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { candidateId: string }) => {
    const candidateId = input?.candidateId?.trim();
    if (!candidateId) throw new Error("candidateId is required");
    return { candidateId };
  })
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { publishVerificationCandidate } = await import("./verification-workflow.server");
    return publishVerificationCandidate(data.candidateId, context.staffEmail);
  });
