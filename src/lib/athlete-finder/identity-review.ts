import { z } from "zod";

export const identityReviewSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    aliases: z.array(z.string().trim().min(1).max(160)).max(8).default([]),
    club: z.string().trim().max(200).default(""),
  })
  .strict();
export type IdentityReviewInput = z.input<typeof identityReviewSchema>;

// Suggestions only. A nickname, initial or club match never proves identity.
const groups = [
  ["chris", "christopher"],
  ["andy", "andrew"],
  ["rob", "robert", "bob"],
  ["steve", "steven", "stephen"],
  ["mick", "mike", "michael"],
  ["dan", "danny", "daniel"],
  ["dani", "danielle"],
  ["ben", "benjamin"],
  ["tom", "thomas"],
  ["jim", "james"],
  ["ed", "eddie", "edward"],
  ["dave", "david"],
  ["dom", "dominic"],
  ["liz", "elizabeth", "beth"],
  ["becky", "beccy", "rebecca"],
  ["sue", "susan", "suzanne"],
  ["jo", "joanne", "joanna"],
  ["kate", "katie", "katherine", "catherine"],
  ["ray", "raymond"],
  ["phil", "philip", "phillip"],
  ["tim", "timothy"],
  ["tony", "anthony"],
  ["rick", "richard", "ricky"],
];
export const identityWords = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
export const identityNormal = (value: string) => identityWords(value).join(" ");
const variants = (first: string) => groups.find((group) => group.includes(first)) ?? [first];

export type IdentityNameReason =
  | "Exact recorded name"
  | "Common given-name variant"
  | "Initial-only name"
  | "Same first initial only"
  | "Middle-name variant"
  | "Recorded racing-name alias";
export function identityNameReason(left: string, right: string): IdentityNameReason | null {
  const a = identityWords(left),
    b = identityWords(right);
  if (!a.length || !b.length) return null;
  if (a.join(" ") === b.join(" ")) return "Exact recorded name";
  if (a.length < 2 || b.length < 2 || a.at(-1) !== b.at(-1)) return null;
  const am = a.slice(1, -1),
    bm = b.slice(1, -1);
  // Explicitly incompatible middle names are not silently treated as aliases.
  if (
    am.length &&
    bm.length &&
    (am.length !== bm.length ||
      am.some(
        (v, i) => v !== bm[i] && !(v[0] === bm[i][0] && (v.length === 1 || bm[i].length === 1)),
      ))
  )
    return null;
  if (a[0] === b[0]) return "Middle-name variant";
  if (variants(a[0]).includes(b[0])) return "Common given-name variant";
  if (a[0][0] !== b[0][0]) return null;
  return a[0].length === 1 || b[0].length === 1 ? "Initial-only name" : "Same first initial only";
}

/** Safe index query over complete names; only normalized letters/numbers are interpolated. */
export function identityCandidateQuery(names: string[]): string | null {
  const queries = names.flatMap((name) => {
    const words = identityWords(name);
    if (words.length < 2) return [];
    // The existing index preserves accents and tokenizes apostrophes. Include
    // both those lexemes and the normalized spelling used for final comparison.
    const original =
      name
        .normalize("NFKC")
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? [];
    const initials = [
      ...new Set([
        ...variants(words[0]).map((v) => [...v][0]),
        ...(original[0] ? [[...original[0]][0]] : []),
      ]),
    ];
    const surnames = [...new Set([words.at(-1), original.at(-1)].filter(Boolean))];
    return [
      `((${surnames.map((v) => `'${v}'`).join(" | ")}) & (${initials.map((v) => `'${v}':*`).join(" | ")}))`,
    ];
  });
  return queries.length ? [...new Set(queries)].join(" | ") : null;
}

export type IdentityClub = { name: string; relationship: "profile" | "historical" | "recorded" };
export type IdentityCandidate = {
  id: number;
  name: string;
  slug: string;
  visibility: string;
  managed: boolean;
  aliases: string[];
  clubs: IdentityClub[];
  reasons: IdentityNameReason[];
  clubMatch: string | null;
  weak: boolean;
};
export type IdentityReview = {
  candidates: IdentityCandidate[];
  truncated: boolean;
  message: string | null;
};
export function stringNames(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (v): v is string => typeof v === "string" && v.trim().length > 1 && v.length <= 200,
          ),
        ),
      ].slice(0, 30)
    : [];
}
export function identityCandidateReasons(
  names: string[],
  candidate: { name: string; aliases: string[] },
) {
  const reasons = new Set<IdentityNameReason>();
  for (const name of names) {
    const reason = identityNameReason(name, candidate.name);
    if (reason) reasons.add(reason);
    for (const alias of candidate.aliases) {
      const aliasReason = identityNameReason(name, alias);
      if (aliasReason)
        reasons.add(
          aliasReason === "Exact recorded name" ? "Recorded racing-name alias" : aliasReason,
        );
    }
  }
  return [...reasons];
}
