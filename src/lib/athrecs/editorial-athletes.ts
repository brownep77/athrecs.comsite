import type { EditorialArticle } from "./editorial";

/** Editorial rosters are explicit: prose names are never guessed by a name model. */
export function editorialAthleteNames(article: EditorialArticle): string[] {
  const tableNames =
    article.sections?.flatMap((section) => {
      if (!section.table) return [];
      const columns = section.table.headings.flatMap((heading, index) =>
        /^(athlete|runner|name|men|women)$/i.test(heading.trim()) ? [index] : [],
      );
      return section.table.rows.flatMap((row) => columns.map((index) => row[index]));
    }) ?? [];
  const names = [
    ...(article.athleteNames ?? []),
    ...Object.keys(article.athleteLinks ?? {}),
    ...tableNames,
  ];
  const seen = new Set<string>();
  return names.flatMap((value) => {
    const name = value?.trim();
    if (!name || name.length > 160 || !/[\p{L}]/u.test(name)) return [];
    const key = editorialNameKey(name);
    if (seen.has(key)) return [];
    seen.add(key);
    return [name];
  });
}

export function editorialNameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type EditorialAthleteCandidate = {
  athleteId: number | null;
  athleteNumber: string;
  name: string;
  slug: string | null;
  club: string;
  country: string;
  public: boolean;
};

export type EditorialAthleteReviewRow = {
  name: string;
  status: "linked" | "review" | "not-found" | "link-unavailable";
  linkedSlug: string | null;
  candidates: EditorialAthleteCandidate[];
  totalCandidates: number;
};

export function editorialAthleteReviewRow(
  name: string,
  candidates: EditorialAthleteCandidate[],
  reviewedSlug?: string,
): EditorialAthleteReviewRow {
  // A matching name is only a candidate. Only an explicitly reviewed mapping
  // can become a public link, and private profiles stay in the staff queue.
  const linked =
    reviewedSlug &&
    candidates.find((candidate) => candidate.slug === reviewedSlug && candidate.public);
  return {
    name,
    status: linked
      ? "linked"
      : reviewedSlug
        ? "link-unavailable"
        : candidates.length
          ? "review"
          : "not-found",
    linkedSlug: linked ? reviewedSlug : null,
    candidates: candidates.slice(0, 12),
    totalCandidates: candidates.length,
  };
}

export const EDITORIAL_ATHLETE_STATUS_LABELS = {
  linked: "Profile linked",
  review: "Check existing profiles",
  "not-found": "No name match — profile research needed",
  "link-unavailable": "Review unavailable link",
} as const;
