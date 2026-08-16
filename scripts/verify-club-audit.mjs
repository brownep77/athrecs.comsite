import assert from "node:assert/strict";

const [
  { clubs: baseClubs },
  { athleticsIrelandClubs },
  { belfastClubs },
  { triathlonIrelandClubs },
  { welshAthleticsClubs },
  { auditedClubAdditions, clubEnrichment, clubSlugAliases },
] = await Promise.all([
  import("../src/data/clubs.ts"),
  import("../src/data/clubs-athletics-ireland.ts"),
  import("../src/data/clubs-belfast.ts"),
  import("../src/data/clubs-triathlon-ireland.ts"),
  import("../src/data/clubs-welsh-athletics.ts"),
  import("../src/data/club-enrichment.ts"),
]);

const rawClubs = [
  ...baseClubs,
  ...athleticsIrelandClubs,
  ...belfastClubs,
  ...triathlonIrelandClubs,
  ...welshAthleticsClubs,
  ...auditedClubAdditions,
];
const canonicalSlugs = rawClubs.map((club) => clubSlugAliases[club.slug] ?? club.slug);
const uniqueCanonicalSlugs = new Set(canonicalSlugs);
const enriched = Object.entries(clubEnrichment);
const official = enriched.filter(
  ([, club]) => club.official_source && club.official_source !== "Prior ATHRECS catalogue",
);
const contacts = enriched.flatMap(([, club]) => club.contacts ?? []);
const socials = enriched.flatMap(([, club]) => club.socials ?? []);

assert.equal(rawClubs.length, 1748, "Audited raw club rows changed unexpectedly");
assert.equal(uniqueCanonicalSlugs.size, 1737, "Canonical club count changed unexpectedly");
assert.equal(Object.keys(clubSlugAliases).length, 11, "Duplicate alias count changed");
assert.equal(enriched.length, 1748, "Every audited club row must retain audit metadata");
assert(official.length >= 1730, "Official-source coverage fell below the audited baseline");
assert(
  enriched.every(([, club]) => club.checked_at === "2026-08-16"),
  "Every audit record must include the checked date",
);
assert(
  enriched.every(([, club]) =>
    ["postcode", "official-directory", "area-only", "unverified"].includes(club.location_precision),
  ),
  "Every audit record must identify its location precision",
);
assert(
  contacts.every((contact) => contact.name || contact.email || contact.phone),
  "Empty public contact record found",
);
assert(
  socials.every((social) => /^https?:\/\//.test(social.url)),
  "Social links must be absolute HTTP(S) URLs",
);

const marathonClub = clubEnrichment["100-marathon-club"];
assert.equal(marathonClub.city, "Telford");
assert.equal(marathonClub.county, "Telford and Wrekin");
assert.equal(marathonClub.region, "London");
assert.equal(marathonClub.location_precision, "postcode");

const cardiff = clubEnrichment["welsh-athletics-cardiff-athletics"];
assert.equal(cardiff.county, "Cardiff");
assert(
  cardiff.contacts?.some((contact) => contact.email),
  "Cardiff contact email missing",
);
assert(cardiff.socials?.some((social) => social.platform === "Instagram"));

const abbeyStriders = clubEnrichment["athletics-ireland-abbey-striders-a-c"];
assert.equal(abbeyStriders.city, "");
assert.equal(abbeyStriders.postcode, "P51 H589");
assert(abbeyStriders.contacts?.some((contact) => contact.phone === "0874175374"));
assert.equal(abbeyStriders.socials, undefined, "Malformed Athletics Ireland social link retained");

const albertville = clubEnrichment["athletics-ni-albertville-harriers"];
assert.equal(albertville.official_source, "Athletics Northern Ireland");
assert(albertville.contacts?.some((contact) => contact.role === "Club secretary"));

const ormeau = clubEnrichment["belfast-ormeau-runners"];
assert.equal(ormeau.official_source, "Official club website");
assert.equal(ormeau.source_url, "https://www.ormeaurunners.co.uk/");

const hallamshire = clubEnrichment["hallamshire-harriers-sheffield"];
assert.equal(hallamshire.city, "Sheffield");
assert.equal(hallamshire.county, "South Yorkshire");
assert.equal(hallamshire.official_source, "Official club website");

process.stdout.write(
  `${JSON.stringify(
    {
      raw_club_rows: rawClubs.length,
      canonical_clubs: uniqueCanonicalSlugs.size,
      duplicate_aliases_merged: Object.keys(clubSlugAliases).length,
      official_source_records: official.length,
      postcode_checked: enriched.filter(([, club]) => club.location_precision === "postcode")
        .length,
      clubs_with_contacts: enriched.filter(([, club]) => club.contacts?.length).length,
      public_contact_entries: contacts.length,
      clubs_with_socials: enriched.filter(([, club]) => club.socials?.length).length,
    },
    null,
    2,
  )}\n`,
);
