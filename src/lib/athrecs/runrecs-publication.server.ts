import type { Sql } from "@/lib/db";

/**
 * Editions explicitly published for RunRecs must not enter AthRecs' temporary
 * running collection. The immutable insertion audit provides the edition IDs;
 * shared catalogues and previously published AthRecs fixtures remain intact.
 */
export async function getRunrecsOnlyEditionIds(sql: Sql): Promise<number[]> {
  const rows = await sql<{ id: number }>`
    select distinct (change.after_json->'record'->>'id')::int as id
    from catalogue_change_log change
    join catalogue_revisions revision on revision.id = change.revision_id
    join catalogue_import_batches batch on batch.id = revision.batch_id
    where change.entity_type = 'edition'
      and change.operation = 'insert'
      and batch.source_key like 'runrecs:uk:0-100km:%'
      and change.after_json->'record'->>'id' is not null
  `;
  return rows.map((row) => row.id);
}
