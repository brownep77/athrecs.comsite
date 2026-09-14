import { createHash } from "node:crypto";
import { getSql, type Sql } from "../db";
import { stageReviewed, type CandidateRow } from "./service.server";
import { validateBulkFindingAction, type BulkFindingActionInput } from "./review";
import {
  validateCatalogueBatch,
  publishCatalogueBatch,
} from "../athrecs/catalogue-publishing.server";

export type BulkFindingResult = {
  action: BulkFindingActionInput["action"];
  changed: number;
  published: number;
  reused: boolean;
  batchId?: string;
  revisionId?: number;
};

/** The entire selection succeeds or rolls back, including staging and source approval. */
export async function actOnFindings(
  input: BulkFindingActionInput,
  email: string,
  sqlOverride?: Sql,
): Promise<BulkFindingResult> {
  const { runId, ids, action } = validateBulkFindingAction(input);
  const sql = sqlOverride ?? (await getSql());
  return sql.transaction(async (tx) => {
    // Match the publisher's lock order before taking collector locks.
    if (action === "publish") {
      await tx`select id from catalogue_publish_state where id=1 for update`;
      await tx`select id from race_collector_runs order by id for update`;
    }
    const runs = await tx`select id from race_collector_runs where id=${runId}::uuid for update`;
    if (!runs.length) throw new Error("Run not found.");
    const rows =
      await tx<CandidateRow>`select * from race_collector_candidates where run_id=${runId}::uuid and id=any(${ids}::uuid[]) order by id for update`;
    if (rows.length !== ids.length)
      throw new Error("Every selected candidate must belong to this scan. Nothing was changed.");

    if (action !== "publish") {
      const changed =
        action === "keep"
          ? await tx`update race_collector_candidates set kept_at=now(),kept_by=${email},dismissed_at=null,dismissed_by=null where run_id=${runId}::uuid and id=any(${ids}::uuid[]) and (dismissed_at is not null or (kept_at is null and status<>'staged')) returning id`
          : await tx`update race_collector_candidates set dismissed_at=now(),dismissed_by=${email} where run_id=${runId}::uuid and id=any(${ids}::uuid[]) and dismissed_at is null returning id`;
      return { action, changed: changed.length, published: 0, reused: changed.length === 0 };
    }

    // A lost response can be retried without creating a second batch or revision.
    const batchId = rows[0].batch_id;
    if (
      batchId &&
      rows.every((r) => r.status === "staged" && r.batch_id === batchId && !r.dismissed_at)
    ) {
      const batch = (
        await tx<{
          status: string;
          source_key: string;
          publish_summary: { revisionId: number };
        }>`select status,source_key,publish_summary from catalogue_import_batches where id=${batchId} for update`
      )[0];
      const members = await tx<{
        id: string;
      }>`select id from race_collector_candidates where batch_id=${batchId}::uuid`;
      const digest = createHash("sha256")
        .update(ids.slice().sort().join("|"))
        .digest("hex")
        .slice(0, 20);
      if (
        batch?.status === "published" &&
        batch.source_key === `runrecs:collector:${runId}:${digest}` &&
        members.length === ids.length &&
        members.every((r) => ids.includes(r.id))
      )
        return {
          action,
          changed: 0,
          published: ids.length,
          reused: true,
          batchId,
          revisionId: batch.publish_summary.revisionId,
        };
    }
    if (rows.some((r) => r.status !== "review" || r.dismissed_at || r.batch_id))
      throw new Error(
        "Only ready, undismissed candidates can be published together. Nothing was published.",
      );

    const staged = await stageReviewed(ids, email, tx);
    const validation = await validateCatalogueBatch(staged.batchId, tx);
    if (validation.status !== "ready")
      throw new Error(`Nothing was published: ${validation.errors.join("; ")}`);
    const published = await publishCatalogueBatch(staged.batchId, email, tx);
    await tx`update race_collector_candidates set kept_at=coalesce(kept_at,now()),kept_by=coalesce(kept_by,${email}) where id=any(${ids}::uuid[])`;
    return {
      action,
      changed: ids.length,
      published: ids.length,
      reused: false,
      batchId: published.batchId,
      revisionId: published.revisionId,
    };
  });
}
