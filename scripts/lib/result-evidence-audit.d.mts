export function seconds(value: string | null | undefined): number | null;
export function readTimingTable(table: { headers: string[]; rows: string[][] }):
  | {
      name: string;
      bib: string | null;
      chip: number | null;
      gun: number | null;
      time: number | null;
      overall: number | null;
      gender: number | null;
      categoryPlace: number | null;
    }[]
  | null;
export function auditResults(
  results: Record<string, unknown>[],
  sources: Record<string, unknown>[],
  asOf?: string,
): {
  scope: { untestedResults: number };
  issues: { flags: string[] }[];
  comparisons: { flags: string[] }[];
};
