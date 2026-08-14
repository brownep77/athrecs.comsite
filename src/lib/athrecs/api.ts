import { createServerFn } from "@tanstack/react-start";
import { getSql, dbSource } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { todayIso } from "./format";
import type {
  AthleteListItem,
  ClubListItem,
  EntryStatus,
  EventListItem,
  Sport,
} from "./types";
import {
  applyImportBundle,
  applyResultsImport,
  parseEventsCsv,
  type ImportBundle,
  type ResultsImportBundle,
} from "./import.server";

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

// NOTE: full file restored via follow-up if truncated
export const getEventBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    return null;
  });
