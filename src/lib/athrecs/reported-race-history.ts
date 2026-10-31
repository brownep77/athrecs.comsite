export type ReportedRaceRecord = {
  id: string;
  event: string;
  distance: string;
  location: string;
  reportedDate: string;
  reportedTime: string;
  reportedPlace: string;
  entryKind?:
    | "race"
    | "stage"
    | "grouped"
    | "challenge"
    | "expedition"
    | "relay"
    | "support"
    | "attempt"
    | "effort";
  sport?: string;
  /** Public result qualifications; never put private source or review notes here. */
  summary?: string;
  evidenceLabel?: string;
  uncertainty: string;
  sources: readonly { label: string; url: string }[];
};

export type ReportedRaceHistory = {
  title: string;
  countLabel: string;
  description: string;
  records: readonly ReportedRaceRecord[];
  includeInResults?: boolean;
  personalBests?: readonly ReportedPersonalBest[];
};

export function getReportedRaceHistory(slug: string): ReportedRaceHistory | null {
  if (slug === "russ-cook") {
    return {
      title: "Results and challenges",
      countLabel: "reported entries",
      includeInResults: true,
      description:
        "Reported races, expeditions, challenges and support efforts appear alongside race results. Each row preserves partial dates, timing qualifications and finish status. These entries are not verified race results and do not contribute to race PBs or rankings.",
      records: russCookReportedRecords,
    };
  }
  if (slug === "haruki-murakami") {
    return {
      title: "Unverified results",
      countLabel: "unverified entries",
      description:
        "* Unverified: source-reported entries with unresolved details, explained alongside each account. Participation may be documented even when the official race name or result is unknown. These entries do not count towards verified finishes, PBs or achievements.",
      records: harukiMurakamiUnverifiedRecords.map((record) => ({
        ...record,
        evidenceLabel: "* Unverified",
      })),
    };
  }
  if (slug === "david-goggins") {
    return {
      title: "Unverified results",
      countLabel: "unverified entries",
      description:
        "Source-reported entries with unresolved details. Times and places below are as reported by UltraSignup; known differences are shown alongside them. These entries do not count towards verified finishes, PBs or achievements.",
      records: davidGogginsUnverifiedRecords as readonly ReportedRaceRecord[],
    };
  }
  if (slug === "neil-featherby") {
    return {
      title: "Race results",
      countLabel: "race and stage entries",
      includeInResults: true,
      personalBests: neilFeatherbyReportedPersonalBests,
      description:
        "Neil’s races and stages are included in his results, and sourced standard-distance times contribute to his PBs. Not verified by chip time. Source links and other unresolved details are shown for each entry. The four Norfolk wins remain grouped until their editions are identified; Great Race stages are not separate full-race finishes.",
      records: neilFeatherbyReportedRecords,
    };
  }
  return null;
}
import { davidGogginsUnverifiedRecords } from "@/data/david-goggins-unverified";
import {
  neilFeatherbyReportedRecords,
  neilFeatherbyReportedPersonalBests,
} from "@/data/neil-featherby-reported";
import { harukiMurakamiUnverifiedRecords } from "@/data/haruki-murakami-unverified";
import { russCookReportedRecords } from "@/data/russ-cook-reported";
import type { ReportedPersonalBest } from "./reported-personal-bests";
