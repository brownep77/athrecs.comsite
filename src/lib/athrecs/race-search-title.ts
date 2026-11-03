/** Keep the race identity intact while shortening repeated search-title wording. */
export function raceSearchTitle(name: string, year?: string, archive = false) {
  const titleName = raceNameWithYear(name, year);
  const suffix = year ? "Date & Entry" : archive ? "Results & History" : "Race Details";
  const title = `${titleName} | ${suffix} | AthRecs`;
  return title.length <= 80
    ? title
    : `${titleName}${!year && archive ? " | Results" : ""} | AthRecs`;
}

function raceNameWithYear(name: string, year?: string) {
  return year && !name.split(/\D+/).includes(year) ? name + " " + year : name;
}

export function roadGuideTitle(name: string, year?: string) {
  return raceNameWithYear(name, year) + " course and entry guide | AthRecs";
}
