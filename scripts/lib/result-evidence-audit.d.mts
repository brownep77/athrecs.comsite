export function seconds(value: string | null | undefined): number | null;
export function auditResults(
  results: Record<string, unknown>[],
  sources: Record<string, unknown>[],
  asOf?: string,
): {
  scope: { untestedResults: number };
  issues: { flags: string[] }[];
  comparisons: { flags: string[] }[];
};
