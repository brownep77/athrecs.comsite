import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { ensureAthrecsSeeded } from "./seed.server";

export type {
  ResultReconciliationConflict,
  ResultReconciliationEventGap,
  ResultReconciliationPublishResult,
  ResultReconciliationReport,
} from "./result-reconciliation.server";

export const previewRecoverableResultReconciliation = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ensureAthrecsSeeded();
    const { previewRecoverableResultReconciliation: preview } = await import(
      "./result-reconciliation.server"
    );
    return preview();
  });

export const publishRecoverableResultReconciliation = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { confirmation: string }) => ({
    confirmation: input?.confirmation?.trim() ?? "",
  }))
  .handler(async ({ data, context }) => {
    if (data.confirmation !== "RESTORE CLAIMABLE RESULTS") {
      throw new Error('Type "RESTORE CLAIMABLE RESULTS" to confirm the insert-only reconciliation');
    }
    await ensureAthrecsSeeded();
    const { publishRecoverableResultReconciliation: publish } = await import(
      "./result-reconciliation.server"
    );
    return publish({
      requestedByUserId: context.userId,
      requestedByEmail: context.staffEmail,
    });
  });
