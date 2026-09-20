import { davidGogginsUnverifiedRecords } from "./david-goggins-unverified";
import { harukiMurakamiUnverifiedRecords } from "./haruki-murakami-unverified";

export type UnverifiedRaceRecord = {
  readonly id: string;
  readonly event: string;
  readonly distance: string;
  readonly location: string;
  readonly reportedDate: string;
  readonly reportedTime: string;
  readonly reportedPlace: string;
  readonly uncertainty: string;
  readonly sources: readonly { readonly label: string; readonly url: string }[];
};

export function getUnverifiedRaceRecords(slug: string): readonly UnverifiedRaceRecord[] {
  switch (slug) {
    case "david-goggins":
      return davidGogginsUnverifiedRecords;
    case "haruki-murakami":
      return harukiMurakamiUnverifiedRecords;
    default:
      return [];
  }
}
