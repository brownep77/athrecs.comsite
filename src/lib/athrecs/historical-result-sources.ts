export type HistoricalResultSourceKey =
  | "total_race_timing_results"
  | "run_norwich_results";

export type HistoricalResultSourcePolicy = {
  key: HistoricalResultSourceKey;
  displayName: string;
  officialArchiveUrl: string;
  coverageYears: readonly number[];
  participantRowsRequireApproval: true;
};

export const HISTORICAL_RESULT_SOURCES: readonly HistoricalResultSourcePolicy[] = [
  {
    key: "total_race_timing_results",
    displayName: "Total Race Timing historical results",
    officialArchiveUrl: "https://totalracetiming.co.uk/result",
    coverageYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    participantRowsRequireApproval: true,
  },
  {
    key: "run_norwich_results",
    displayName: "Run Norwich official historical results",
    officialArchiveUrl: "https://www.runnorwich.co.uk/event-info/results/",
    coverageYears: [2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025],
    participantRowsRequireApproval: true,
  },
] as const;

const SOURCE_BY_KEY = new Map(HISTORICAL_RESULT_SOURCES.map((source) => [source.key, source]));

export function historicalResultSource(
  value: string,
): HistoricalResultSourcePolicy | undefined {
  return SOURCE_BY_KEY.get(value as HistoricalResultSourceKey);
}
