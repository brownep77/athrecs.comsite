export type RaceEditPageType = "catalogue" | "road" | "ultra";
export function raceEditPath(slug: string, pageType: RaceEditPageType = "catalogue") {
  const prefix =
    pageType === "road"
      ? "/running/races"
      : pageType === "ultra"
        ? "/running/ultramarathons"
        : "/races";
  return `${prefix}/${encodeURIComponent(slug)}`;
}
