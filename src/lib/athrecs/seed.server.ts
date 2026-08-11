import { getSql } from "@/lib/db";
import {
  athletes as athleteSeeds,
  catalogueMetadata,
  clubs as clubSeeds,
  editions as editionSeeds,
  results as resultSeeds,
  seriesList,
} from "@/data/catalogue";

const SEED_VERSION = "athrecs-rn2025-batch7-v43-restore";
const EXPECTED = catalogueMetadata.merged_counts;

type Sql = Awaited<ReturnType<typeof getSql>>;
type GlobalSeedState = typeof globalThis & {
  __athrecsFullSeedPromise__?: Promise<void>;
};

const globalSeedState = globalThis as GlobalSeedState;

function parseTimeToSeconds(raw: string): number {
  const parts = raw.trim().replace(",", ".").split(":").map(Number);
  if (parts.length === 3) {
    return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  }
  if (parts.length === 2) {
    return Math.round(parts[0] * 60 + parts[1]);
  }
  return Math.round(parts[0]);
}

function chunks<T>(rows: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    output.push(rows.slice(index, index + size));
  }
  return output;
}

async function insertRows(
  sql: Sql,
  table: string,
  columns: string[],
  rows: unknown[][],
  conflictClause: string,
  chunkSize = 100,
): Promise<void> {
  for (const batch of chunks(rows, chunkSize)) {
    const params: unknown[] = [];
    const values = batch
      .map((row) => {
        const placeholders = row.map((value) => {
          params.push(value);
          return `$${params.length}`;
        });
        return `(${placeholders.join(", ")})`;
      })
      .join(", ");
    await sql.query(
      `insert into ${table} (${columns.join(", ")}) values ${values} ${conflictClause}`,
      params,
    );
  }
}

async function deleteRowsOutsideCatalogue(
  sql: Sql,
  table: string,
  slugs: string[],
): Promise<void> {
  const placeholders = slugs.map((_, index) => `$${index + 1}`).join(", ");
  await sql.query(`delete from ${table} where slug not in (${placeholders})`, slugs);
}
