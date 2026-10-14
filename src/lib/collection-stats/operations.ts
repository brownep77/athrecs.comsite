import { z } from "zod";

export const operationSections = {
  results: "How many results have we saved?",
  coverage: "Which athletes have results?",
  growth: "What have we added or changed?",
  sources: "How much have we collected from each website?",
  matching: "Which results still need the right athlete?",
  verification: "Which results have been checked?",
  gaps: "What information is missing?",
  duplicates: "Have we saved the same thing twice?",
  clubs: "What do we have for each club?",
  backlog: "What work is still waiting?",
  activity: "Who is visiting and using AthRecs?",
} as const;
export type OperationSection = keyof typeof operationSections;

export const operationHelp: Record<
  OperationSection,
  { summary: string; action: string; example: string }
> = {
  results: {
    summary: "Count saved results by sport, distance, race country or race year.",
    action:
      "Choose a group below, then select See entries to see the athletes and events behind its total.",
    example:
      "One runner completing one 10K is one result. The same result may also be stored in an imported history and a saved results sheet, so do not add the four boxes together.",
  },
  coverage: {
    summary:
      "Find profiles with no saved results, imported histories only, or one or more main results.",
    action: "Start with No saved results to find profiles that need more research.",
    example:
      "No saved results means we have not recorded any for that profile. It does not mean the athlete has never competed.",
  },
  growth: {
    summary:
      "See how many events, race dates, athlete profiles and results we have added or edited.",
    action: "Choose a time period. Use Day by day to see when the work happened.",
    example:
      "A race date and distance means one occurrence of an event, such as its 2026 10K. Older entries may have no saved date showing when we first added them.",
  },
  sources: {
    summary:
      "See which websites and results sheets we have worked through and what remains to collect.",
    action:
      "Use Pages we have found for website progress, Attempts to collect results for errors, or Saved results sheets for the number of entries collected.",
    example:
      "If we have found 10 pages and processed 6, progress is 60%. There may be other pages we have not found yet. A blank percentage means we do not know the total to compare against.",
  },
  matching: {
    summary:
      "Find results that still need to be connected to the correct athlete, and requests from athletes claiming a result.",
    action:
      "Open a group to check the evidence and resolve requests. Paused items need an issue resolved before they can move forward.",
    example:
      "Two people may share a name. A suggested match needs checking before the result is added to the wrong profile.",
  },
  verification: {
    summary:
      "See the checking status saved for results, plus requests from athletes asking us to check a result.",
    action: "Open a No check recorded group or a waiting request to find work to review.",
    example:
      "Checked against source means the result carries a source-check label. No check recorded does not mean the result is wrong. Confirming who owns a profile is a separate check.",
  },
  gaps: {
    summary:
      "Find missing athlete details, event websites, distances, locations and unconfirmed race dates.",
    action: "Choose a missing detail, then open an entry to research and complete it.",
    example:
      "One athlete missing both nationality and county appears in both groups. Where someone lives does not establish their nationality.",
  },
  duplicates: {
    summary:
      "Find profiles and results that may have been saved more than once, or linked to different athletes.",
    action:
      "Open a group and compare the evidence before deciding whether anything should be merged.",
    example:
      "Two profiles with the same name are two profiles to check, not proof of a duplicate. Some listed duplicates were already prevented from being published.",
  },
  clubs: {
    summary:
      "See each club's linked athletes and their results, missing club details, and requests to manage a club page.",
    action:
      "Open a club to see its athletes. Use Club applications to review requests to manage club pages.",
    example:
      "An athlete's results may include races they completed before joining their current club. A member of two clubs can appear under both.",
  },
  backlog: {
    summary:
      "Find collected events, results and club applications that still need checking, fixing or a decision.",
    action:
      "Start with the oldest waiting work. Open an entry to see what needs resolving before it can move forward.",
    example:
      "Waiting work is not necessarily ready to publish. Paused items need attention; private athlete profiles are not automatically waiting for publication.",
  },
  activity: {
    summary:
      "See recorded website visits, new accounts, profile claims, results added by members and sign-ins.",
    action: "Choose a time period, or open Website traffic & Google for more detail about visits.",
    example:
      "One person can sign up, claim a profile and add a result, so they may appear in several groups. These totals do not tell us what percentage of visitors signed up.",
  },
};
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
