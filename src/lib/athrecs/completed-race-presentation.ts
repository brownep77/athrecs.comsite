type RaceEdition = {
  event_date: string;
  status: string;
  result_count: number;
};

/** Rows come from one row per edition, ordered newest first. Keep each in exactly one list. */
export function partitionRaceEditions<T extends RaceEdition>(editions: T[], today: string) {
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const edition of editions) {
    if (
      edition.event_date < today ||
      (edition.event_date === today && edition.status === "Finished" && edition.result_count > 0)
    ) {
      past.push(edition);
    } else {
      upcoming.push(edition);
    }
  }
  upcoming.sort((left, right) => left.event_date.localeCompare(right.event_date));
  return { upcoming, past };
}
