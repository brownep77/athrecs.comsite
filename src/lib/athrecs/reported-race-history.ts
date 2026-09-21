export type ReportedRaceRecord = {
  id: string;
  event: string;
  distance: string;
  location: string;
  reportedDate: string;
  reportedTime: string;
  reportedPlace: string;
  entryKind?: "race" | "stage" | "grouped";
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
  if (slug === "haruki-murakami") {
    return {
      title: "Unverified results",
      countLabel: "unverified entries",
      description:
        "* Unverified: source-reported entries with unresolved details, explained alongside each account. Participation may be documented even when the official race name or result is unknown. These entries do not count towards verified finishes, personal bests or achievements.",
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
        "Source-reported entries with unresolved details. Times and places below are as reported by UltraSignup; known differences are shown alongside them. These entries do not count towards verified finishes, personal bests or achievements.",
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
import type { ReportedPersonalBest } from "./reported-personal-bests";
