// Edition-specific qualifications. Do not infer a future course's eligibility from
// its event name: the Great North Run, for example, changed course in 2021.
// Sources: World Athletics athlete 14189197 (PBs and annual results), checked 2026-09-17.
const assistedGreatNorthDates = new Set([
  "2013-09-15",
  "2014-09-07",
  "2015-09-13",
  "2016-09-11",
  "2017-09-10",
  "2018-09-09",
  "2019-09-08",
  "2023-09-10",
]);

export function roadPerformanceCondition(result: {
  eventSlug: string;
  eventDate: string;
  distanceCode: string;
}): { eligible: boolean; note: string } | null {
  if (result.distanceCode !== "Half") return null;
  if (
    ["aj-bell-great-north-run", "great-north-run"].includes(result.eventSlug) &&
    assistedGreatNorthDates.has(result.eventDate)
  ) {
    return { eligible: false, note: "Assisted course · excluded from PBs" };
  }
  if (
    result.eventSlug === "vitality-big-half" &&
    ["2018-03-04", "2019-03-10"].includes(result.eventDate)
  ) {
    return {
      eligible: false,
      note: "Uncertified course (World Athletics: UNC) · excluded from PBs",
    };
  }
  return null;
}
