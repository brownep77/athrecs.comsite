import type { MerseaEdition, MerseaResult } from "./mersea-results";
import { publicResultLabel } from "./result-credit.ts";

export type ArchivedMerseaEdition = Omit<MerseaEdition, "providers"> & {
  sources: { name: string; url: string }[];
};

export function publicMerseaEdition(edition: ArchivedMerseaEdition, rows: MerseaResult[]) {
  return {
    year: edition.year,
    date: edition.date,
    coverage: edition.coverage,
    note: edition.note.replace(/\b(?:https?:\/\/|www\.)\S+/gi, "").trim(),
    count: edition.rows.length,
    providers: [
      ...new Set(
        edition.sources
          .map((source) => publicResultLabel(source.name))
          .filter((name): name is string => Boolean(name)),
      ),
    ],
    rows: rows.map(
      ({
        name,
        finishTime,
        position,
        sourcePosition,
        bib,
        club,
        sex,
        category,
        sourceAward,
        genderPosition,
        categoryPosition,
        age,
      }) => ({
        name,
        finishTime,
        position,
        sourcePosition,
        bib,
        club,
        sex,
        category,
        sourceAward,
        genderPosition,
        categoryPosition,
        age,
      }),
    ),
  };
}
