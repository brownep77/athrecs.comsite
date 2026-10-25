/** Keep the race identity intact while shortening repeated search-title wording. */
export function raceSearchTitle(name: string, year?: string, archive = false) {
  const titleName = `${name}${year && !new RegExp(`\\b${year}\\b`).test(name) ? ` ${year}` : ""}`;
  const suffix = year ? "Date & Entry" : archive ? "Results & History" : "Race Details";
  const title = `${titleName} | ${suffix} | AthRecs`;
  return title.length <= 80
    ? title
    : `${titleName}${!year && archive ? " | Results" : ""} | AthRecs`;
}
