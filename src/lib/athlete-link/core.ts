import { z } from "zod";

export const checkLinkSchema = z
  .object({
    url: z.string().trim().min(1).max(2048),
    name: z.string().trim().max(200).default(""),
    searchName: z.string().trim().max(200).default(""),
  })
  .strict();
export const saveLinkSchema = checkLinkSchema
  .extend({
    name: z.string().trim().min(2).max(200),
    version: z.string().regex(/^[a-f0-9]{64}$/),
    requestId: z.string().uuid(),
    action: z.enum(["create", "link"]),
    athleteId: z.number().int().positive().optional(),
    reason: z.string().trim().min(12).max(2000),
    sourceChecked: z.literal(true),
    identityChecked: z.literal(true),
    rightsConfirmed: z.literal(true),
    differentPerson: z.boolean().default(false),
  })
  .strict();
export type CheckLinkInput = z.infer<typeof checkLinkSchema>;
export type SaveLinkInput = z.infer<typeof saveLinkSchema>;
export type AthleteSource = {
  provider: "worldathletics" | "powerof10" | "parkrun";
  label: string;
  externalId: string;
  url: string;
};

/** Recognise a profile ID only. Never fetch arbitrary URLs or infer a name from a URL slug. */
export function athleteSource(value: string): AthleteSource {
  let u: URL;
  try {
    u = new URL(value.trim());
  } catch {
    throw new Error("Paste the full HTTPS athlete profile link.");
  }
  if (u.protocol !== "https:" || u.username || u.password || u.port || /[%\\]/.test(u.pathname))
    throw new Error(
      "Use an HTTPS profile link without credentials, encoded paths or a custom port.",
    );
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  let id: string | undefined;
  if (host === "worldathletics.org") {
    id = u.pathname.match(/^\/athletes\/(?:[a-z0-9-]+\/[a-z0-9-]+-|-\/)([1-9]\d{0,17})\/?$/i)?.[1];
    if (id)
      return {
        provider: "worldathletics",
        label: "World Athletics",
        externalId: id,
        url: `https://worldathletics.org${u.pathname.replace(/\/$/, "")}`,
      };
  }
  if (host === "thepowerof10.info" && /^\/athletes\/profile\.aspx$/i.test(u.pathname)) {
    const ids = [...u.searchParams]
      .filter(([key]) => key.toLowerCase() === "athleteid")
      .map(([, value]) => value);
    if (ids.length === 1 && /^[1-9]\d{0,17}$/.test(ids[0]))
      return {
        provider: "powerof10",
        label: "Power of 10",
        externalId: ids[0],
        url: `https://www.thepowerof10.info/athletes/profile.aspx?athleteid=${ids[0]}`,
      };
  }
  if (host === "parkrun.org.uk") {
    id = u.pathname.match(/^\/parkrunner\/([1-9]\d{0,17})\/?$/)?.[1];
    if (id)
      return {
        provider: "parkrun",
        label: "Parkrun UK",
        externalId: id,
        url: `https://www.parkrun.org.uk/parkrunner/${id}/`,
      };
  }
  throw new Error(
    "Use an individual World Athletics, Power of 10 or UK Parkrun profile link. For a race results page, choose Results file or Review results.",
  );
}
export function sourceMatches(value: string | null, source: AthleteSource): boolean {
  if (!value) return false;
  try {
    const candidate = athleteSource(value.replace(/^http:/i, "https:"));
    return candidate.provider === source.provider && candidate.externalId === source.externalId;
  } catch {
    return false;
  }
}
export type LinkCandidate = {
  key: string;
  id: number | null;
  number: string;
  name: string;
  club: string;
  country: string;
  visibility: string;
  managed: boolean;
  exact: boolean;
  conflictingSource: boolean;
};
export type LinkReview = {
  source: AthleteSource;
  name: string;
  searchName: string;
  version: string;
  state: "existing" | "conflict" | "needs_name" | "review";
  candidates: LinkCandidate[];
  totalCandidates: number;
};
export type LinkReceipt = {
  athleteId: number;
  athleteNumber: string;
  name: string;
  created: boolean;
  replay: boolean;
};
