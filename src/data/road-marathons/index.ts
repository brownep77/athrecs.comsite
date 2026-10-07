import { AUSTRALIA_ROAD_MARATHONS } from "./australia";
import { CANADA_ROAD_MARATHONS } from "./canada";
import { IRELAND_ROAD_MARATHONS } from "./ireland";
import { NEW_ZEALAND_ROAD_MARATHONS } from "./new-zealand";
import { SOUTH_AFRICA_EASTERN_MARATHONS } from "./south-africa-eastern";
import { SOUTH_AFRICA_GAUTENG_MARATHONS } from "./south-africa-gauteng";
import { SOUTH_AFRICA_INLAND_MARATHONS } from "./south-africa-inland";
import { SOUTH_AFRICA_KZN_MARATHONS } from "./south-africa-kwazulu-natal";
import { SOUTH_AFRICA_MB_MARATHONS } from "./south-africa-mpumalanga-buffs";
import { SOUTH_AFRICA_WESTERN_MARATHONS } from "./south-africa-western";
import { UK_ROAD_MARATHONS } from "./uk";
import { USA_ROAD_MARATHONS } from "./usa";
import { USA_CENTRAL_ADDITIONS } from "./usa-central-additions";
import { USA_EAST_ADDITIONS } from "./usa-east-additions";
import { USA_SOUTH_ADDITIONS } from "./usa-south-additions";
import { USA_WEST_ADDITIONS } from "./usa-west-additions";
import type { MarathonCountry, RoadMarathon } from "./types";

export const ROAD_MARATHONS: readonly RoadMarathon[] = [
  ...UK_ROAD_MARATHONS,
  ...AUSTRALIA_ROAD_MARATHONS,
  ...NEW_ZEALAND_ROAD_MARATHONS,
  ...USA_ROAD_MARATHONS,
  ...USA_CENTRAL_ADDITIONS,
  ...USA_EAST_ADDITIONS,
  ...USA_SOUTH_ADDITIONS,
  ...USA_WEST_ADDITIONS,
  ...CANADA_ROAD_MARATHONS,
  ...IRELAND_ROAD_MARATHONS,
  ...SOUTH_AFRICA_EASTERN_MARATHONS,
  ...SOUTH_AFRICA_GAUTENG_MARATHONS,
  ...SOUTH_AFRICA_INLAND_MARATHONS,
  ...SOUTH_AFRICA_KZN_MARATHONS,
  ...SOUTH_AFRICA_MB_MARATHONS,
  ...SOUTH_AFRICA_WESTERN_MARATHONS,
];

export const roadMarathonsForCountry = (country: MarathonCountry) =>
  ROAD_MARATHONS.filter((race) => race.country === country);
export const roadMarathonBySlug = (slug: string) =>
  ROAD_MARATHONS.find((race) => race.slug === slug);
