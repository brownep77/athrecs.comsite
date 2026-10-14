import { z } from "zod";

export const operationSections = {
  results: "Results collected",
  coverage: "Athletes with results",
  growth: "Collection growth",
  sources: "Source progress",
  matching: "Matching & claims",
  verification: "Verification",
  gaps: "Missing information",
  duplicates: "Possible duplicates",
  clubs: "Club coverage",
  backlog: "Publication backlog",
  activity: "Visits & athlete activity",
} as const;
export type OperationSection = keyof typeof operationSections;
export const operationInput = z
  .object({
    section: z
      .enum(Object.keys(operationSections) as [OperationSection, ...OperationSection[]])
      .default("results"),
    group: z
      .enum(["sport", "distance", "country", "year", "inventory", "imports", "datasets", "daily"])
      .default("sport"),
    days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
    key: z.string().max(500).default(""),
    mode: z.enum(["summary", "records"]).default("summary"),
    page: z.number().int().min(0).max(100_000).default(0),
    q: z.string().trim().max(120).default(""),
  })
  .strict();
export type OperationInput = z.infer<typeof operationInput>;
export type OperationColumn = { key: string; label: string; numeric?: boolean };
export type OperationRow = { key: string; label: string; href?: string; drill?: string } & Record<
  string,
  string | number | null | undefined
>;
export type OperationReport = {
  title: string;
  description: string;
  notes: string[];
  columns: OperationColumn[];
  rows: OperationRow[];
  total: number;
  page: number;
  generatedAt: string;
  metrics: {
    label: string;
    value: number | null;
    detail?: string;
    href?: string;
    drill?: string;
  }[];
};
export const operationPageSize = 40;
