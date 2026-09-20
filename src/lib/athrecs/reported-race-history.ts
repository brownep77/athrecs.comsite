export type ReportedRaceRecord = {
  id: string;
  event: string;
  distance: string;
  location: string;
  reportedDate: string;
  reportedTime: string;
  reportedPlace: string;
  evidenceLabel?: string;
  uncertainty: string;
  sources: readonly { label: string; url: string }[];
};

export function getReportedRaceHistory(slug: string) {
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
      title: "Unverified races",
      countLabel: "unverified entries",
      description:
        "These races and stages are listed as part of Neil’s race history with Unverified status. Sources include organiser archives, contemporary club records and Neil’s published accounts; each entry explains its evidence and any unresolved details. All entries here are excluded from verified finish totals, personal bests and achievements. The four Norfolk wins are grouped in one entry until their editions are identified.",
      records: neilFeatherbyReportedRecords,
    };
  }
  return null;
}
import { davidGogginsUnverifiedRecords } from "@/data/david-goggins-unverified";
import { neilFeatherbyReportedRecords } from "@/data/neil-featherby-reported";
import { harukiMurakamiUnverifiedRecords } from "@/data/haruki-murakami-unverified";
