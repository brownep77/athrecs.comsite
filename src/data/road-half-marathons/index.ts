import type { MarathonCountry } from "../road-marathons/types";
import { RACES as UK } from "./uk";
import { RACES as IRELAND } from "./ireland";
import { RACES as USA } from "./usa";
import { RACES as CANADA } from "./canada";
import { RACES as AUSTRALIA } from "./australia";
import { RACES as NEW_ZEALAND } from "./new-zealand";
import { RACES as SOUTH_AFRICA } from "./south-africa";

export const ROAD_HALF_MARATHONS = [
  ...UK,
  ...IRELAND,
  ...USA,
  ...CANADA,
  ...AUSTRALIA,
  ...NEW_ZEALAND,
  ...SOUTH_AFRICA,
];
export const roadHalfMarathonsForCountry = (country: MarathonCountry) =>
  ROAD_HALF_MARATHONS.filter((race) => race.country === country);
export const roadHalfMarathonBySlug = (slug: string) =>
  ROAD_HALF_MARATHONS.find((race) => race.slug === slug);
