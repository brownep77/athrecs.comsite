import { z } from "zod";

export const sourceCoverageInputSchema = z.object({
  q: z.string().trim().max(160).default(""),
  offset: z.number().int().min(0).max(1_000_000).default(0),
  limit: z.number().int().min(1).max(100).default(40),
});

export type SourceCoverageInput = z.infer<typeof sourceCoverageInputSchema>;

/** Null means the store is unavailable, rather than an observed count of zero. */
export type StoredSourceCounts = {
  canonicalResults: number | null;
  archiveDatasets: number | null;
  archiveRows: number | null;
  capturePages: number | null;
  captureRows: number | null;
  historyProfiles: number | null;
  historyRows: number | null;
};

export type SourceInventoryCounts = {
  sources: number | null;
  records: number | null;
  pendingLinks: number | null;
  savedResultLinks: number | null;
  knownResultItems: number | null;
  extractedResultItems: number | null;
  partialResultItems: number | null;
  pendingResultItems: number | null;
  heldResultItems: number | null;
  failedResultItems: number | null;
  /** Latest approved stored pages whose rows are currently held from search. */
  heldCapturePages: number | null;
};

export type SourceCoverageRow = {
  sourceId: string;
  registrySourceId: string | null;
  name: string;
  url: string;
  domain: string;
  origin: "registry" | "inventory";
  metadataRunnable: boolean | null;
  registryState: string;
  participantCheck: "trt" | "manual";
  coverageState:
    "stored_rows" | "incomplete" | "needs_extraction" | "links_only" | "no_linked_rows";
  stored: StoredSourceCounts;
  inventory: SourceInventoryCounts;
  /** These domain-level counts can also appear on another registered source. */
  sharedDomain: boolean;
};

export type SourceCoverageStores = {
  canonical: boolean;
  archive: boolean;
  captures: boolean;
  histories: boolean;
  resultLinks: boolean;
  inventorySources: boolean;
  inventoryRecords: boolean;
  extraction: boolean;
};

export type SourceCoverageResponse = {
  rows: SourceCoverageRow[];
  total: number;
  nextOffset: number | null;
  summary: {
    registrySources: number;
    registryDomains: number;
    metadataRunnableSources: number;
    inventorySources: number | null;
    inventoryDomains: number | null;
    listedSources: number;
    domainsWithStoredRows: number;
    stored: StoredSourceCounts;
    inventory: SourceInventoryCounts;
  };
  stores: SourceCoverageStores;
  notes: string[];
};
