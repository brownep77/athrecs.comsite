import { createServerFn } from "@tanstack/react-start";
import type { SportsOrganisation } from "../../data/sports-organisation-types";
import type { DirectorySearch } from "./directory-search";
import { isResultDocument } from "./result-document";

export const hasDirectoryCountry = createServerFn({ method: "GET" })
  .validator((country: string) => country)
  .handler(async ({ data }) => (await import("./sports-directory")).DIRECTORY_COUNTRIES.includes(data));

export const getDirectoryPage = createServerFn({ method: "GET" })
  .validator((search: DirectorySearch) => search)
  .handler(async ({ data }) => {
    const directory = await import("./sports-directory");
    const { SPORTS_ORGANISATIONS } = await import("../../data/sports-organisations");
    return {
      bodies: directory.filterSportsOrganisations(directory.parseDirectorySearch(data)).map(
        ({ slug, name, aliases, summary, jurisdiction, country, sports, type, website, websiteKind }) =>
          ({ slug, name, aliases, summary, jurisdiction, country, sports, type, website, websiteKind }),
      ),
      countries: directory.DIRECTORY_COUNTRIES, nationalCount: directory.DIRECTORY_NATIONAL_COUNTRIES.length,
      questions: directory.DIRECTORY_QUESTIONS, total: SPORTS_ORGANISATIONS.length,
    };
  });

export function publicOrganisation(body: SportsOrganisation) {
  const { resultReferences = [], ...record } = body;
  return {
    ...record,
    sources: record.sources.filter((url) => !resultReferences.includes(url) && !isResultDocument(url)),
  };
}

export const getDirectoryOrg = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { getSportsOrganisation } = await import("./sports-directory");
    const body = getSportsOrganisation(data);
    if (!body) return null;
    return {
      ...publicOrganisation(body),
      relatedOrganisations: (body.related ?? []).flatMap((slug) => {
        const item = getSportsOrganisation(slug);
        return item ? [{ slug, name: item.name, type: item.type, jurisdiction: item.jurisdiction }] : [];
      }),
    };
  });
