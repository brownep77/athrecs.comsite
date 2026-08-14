/** Marathon Runners Diary — UK, Europe and international full marathons. */
import type { Edition, Series } from "./types";
import { mrdUkMarathonEditions, mrdUkMarathonSeries } from "./mrd-marathons-uk";
import { mrdEuMarathonEditions, mrdEuMarathonSeries } from "./mrd-marathons-eu";
import { mrdIntlMarathonEditions, mrdIntlMarathonSeries } from "./mrd-marathons-intl";

export const mrdMarathonSeries: Series[] = [
  ...mrdUkMarathonSeries,
  ...mrdEuMarathonSeries,
  ...mrdIntlMarathonSeries,
];

export const mrdMarathonEditions: Edition[] = [
  ...mrdUkMarathonEditions,
  ...mrdEuMarathonEditions,
  ...mrdIntlMarathonEditions,
];
