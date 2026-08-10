from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/"
    "Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf"
)

# Official Run Norwich 10K 2025 chip-time PDF, overall places 201-300.
# Tuple: place, bib, given name, family name, gender, category, listed club, chip time.
ROWS = [
    (201, "486", "Phoenix", "Tashlin Clifford", "M", "MO", "Unattached", "40:47"),
    (202, "537", "Rhys", "Hartle", "M", "MO", "Unattached", "40:30"),
    (203, "165", "Juliette", "Watkinson", "F", "F40", "Wymondham AC", "41:04"),
    (204, "1416", "Ben", "Hewitt", "M", "M45", "Unattached", "40:40"),
    (205, "91", "Gareth", "Seville", "M", "MO", "Wymondham AC", "40:58"),
    (206, "522", "Luke", "Ashford", "M", "MO", "Unattached", "41:06"),
    (207, "383", "Alex", "Walpole", "M", "MO", "Runners-Next-the-Sea", "40:54"),
    (208, "428", "Joe", "Wicks", "M", "MO", "Unattached", "40:28"),
    (209, "232", "Jamie", "Hepher", "M", "MO", "Unattached", "40:20"),
    (210, "290", "Cameron", "Barnes", "M", "MO", "Unattached", "40:46"),
    (211, "363", "Lewis", "Davies", "M", "MO", "Unattached", "41:05"),
    (212, "1239", "Jack", "Haward", "M", "MO", "Saint Edmund Pacers", "41:07"),
    (213, "200", "Charlie", "Clarke", "M", "MO", "Unattached", "40:11"),
    (214, "711", "Kelvin", "Willimott", "M", "M40", "Unattached", "40:55"),
    (215, "301", "Will", "Barker", "M", "MO", "Unattached", "41:05"),
    (216, "268", "Harry", "Armes", "M", "MO", "Reepham Runners", "41:06"),
    (217, "814", "William", "Riches", "M", "MO", "Unattached", "41:15"),
    (218, "240", "Andrew", "Reed", "M", "MO", "Erme Valley Harriers", "41:21"),
    (219, "311", "Harvey", "Wade", "M", "MO", "Unattached", "41:17"),
    (220, "175", "Kelvin", "Haywood", "M", "MO", "Unattached", "41:23"),
    (221, "999", "Marcus", "Jolly", "M", "MO", "Unattached", "40:46"),
    (222, "793", "Hans", "Verschueren", "M", "MO", "Unattached", "40:49"),
    (223, "321", "Marcus", "Pearson", "M", "MO", "Unattached", "41:18"),
    (224, "378", "Lee", "Oakley", "M", "M40", "Unattached", "41:22"),
    (225, "276", "Barley", "Woodcock", "M", "M45", "Newmarket Joggers", "40:52"),
    (226, "524", "Lee", "Knights", "M", "M45", "Unattached", "41:13"),
    (227, "203", "Oliver", "Shephard", "M", "MO", "Lonely Goat RC", "41:19"),
    (228, "665", "Liam", "Howes", "M", "MO", "Unattached", "40:59"),
    (229, "1086", "Joe", "Whitton", "M", "MO", "Unattached", "41:18"),
    (230, "352", "Felicity", "Quinn", "F", "FO", "Unattached", "41:29"),
    (231, "116", "Liam", "Footitt", "M", "MO", "Unattached", "41:36"),
    (232, "379", "Gav", "Dent", "M", "M45", "North Norfolk Beach Runners", "40:59"),
    (233, "111", "Matt", "Collier", "M", "M50", "Norfolk Gazelles AC", "41:19"),
    (234, "1832", "Rikki", "James", "M", "MO", "Unattached", "41:31"),
    (235, "448", "Chris", "Davies", "M", "M50", "Unattached", "41:31"),
    (236, "517", "Lauren", "Stroud", "M", "M45", "Unattached", "41:27"),
    (237, "403", "Adam", "Glover", "M", "MO", "Unattached", "41:19"),
    (238, "533", "Christopher", "Fuller", "M", "MO", "Unattached", "41:30"),
    (239, "782", "Thomas", "Barker", "M", "MO", "City Of Norwich AC", "41:39"),
    (240, "415", "Adrian", "Slattery", "M", "M45", "Great Yarmouth Road Runners", "41:24"),
    (241, "449", "Paul", "Bliss", "M", "MO", "Unattached", "41:28"),
    (242, "63", "Mark", "Goddard", "M", "MO", "Norfolk Gazelles AC", "41:32"),
    (243, "938", "Dan", "Edison", "M", "MO", "Unattached", "41:35"),
    (244, "529", "Aaron", "O’driscoll", "M", "MO", "Unattached", "41:51"),
    (245, "207", "Paul", "Bulling", "M", "M40", "Norwich Road Runners", "41:35"),
    (246, "889", "Jacob", "Griffin", "M", "MO", "Unattached", "41:45"),
    (247, "581", "Adam", "Gusterson", "M", "MO", "Unattached", "41:17"),
    (248, "1088", "Ben", "Aldrich", "M", "MO", "Unattached", "41:38"),
    (249, "1002", "Lauren", "Malcharek", "F", "FO", "Unattached", "41:52"),
    (250, "554", "Mark", "Griffin", "M", "M60", "Unattached", "41:42"),
    (251, "775", "David", "Granger", "M", "MO", "Unattached", "41:33"),
    (252, "614", "Harvey", "Pyer", "M", "MO", "Unattached", "41:44"),
    (253, "410", "George", "Medhurst", "M", "MO", "Unattached", "41:32"),
    (254, "1188", "Kane", "St Quintin", "M", "MO", "Unattached", "41:50"),
    (255, "1058", "Owen", "Hudson", "M", "M50", "Unattached", "41:24"),
    (256, "535", "Oscar", "Gent", "M", "MO", "Unattached", "41:40"),
    (257, "266", "Will", "Longworth", "M", "MO", "Unattached", "41:47"),
    (258, "103", "Will", "Byrne", "M", "MO", "Unattached", "41:44"),
    (259, "139", "Oliver", "Marriott", "M", "MO", "Unattached", "40:24"),
    (260, "400", "Franklyn", "Plume", "M", "MO", "Coltishall Jaguars RC", "41:43"),
    (261, "491", "Paul", "Oakley", "M", "M50", "Unattached", "41:44"),
    (262, "146", "Nick", "Gurney", "M", "MO", "Norwich Road Runners", "41:51"),
    (263, "800", "Charlie", "Dack", "M", "MO", "Unattached", "41:23"),
    (264, "431", "Jamie", "Harris", "M", "MO", "Wymondham AC", "41:44"),
    (265, "374", "Steve", "Metcalfe", "M", "MO", "Unattached", "41:26"),
    (266, "566", "Carl", "Weathers", "M", "MO", "Unattached", "41:43"),
    (267, "538", "Will", "Bamber", "M", "M40", "Unattached", "41:44"),
    (268, "154", "Marc", "Evans", "M", "M45", "Unattached", "41:50"),
    (269, "637", "Mark", "Robinson", "M", "MO", "Unattached", "41:43"),
    (270, "149", "Mark", "Mantle", "M", "M40", "Unattached", "41:58"),
    (271, "123", "Dean", "Terry", "M", "MO", "Unattached", "41:59"),
    (272, "187", "Jonah", "Life", "M", "MO", "Unattached", "41:55"),
    (273, "144", "Benjamin", "Smith", "M", "M40", "Wymondham AC", "41:40"),
    (274, "214", "Ethan", "Hall", "M", "MO", "Unattached", "41:29"),
    (275, "189", "Andy", "Duckham", "M", "MO", "Unattached", "41:28"),
    (276, "168", "Shaun", "Rose", "M", "M40", "Unattached", "42:07"),
    (277, "197", "Mark", "Hurren", "M", "M40", "Unattached", "41:54"),
    (278, "3148", "Jordan", "Wardrope", "M", "MO", "Unattached", "38:55"),
    (279, "329", "Claire", "Kent", "F", "FO", "Wymondham AC", "41:56"),
    (280, "489", "Jonathan", "Walley", "M", "MO", "GoodGym Race Team", "42:11"),
    (281, "732", "Kelvin", "Tan", "M", "M40", "Unattached", "42:09"),
    (282, "560", "Brett", "Patterson", "M", "M45", "Unattached", "41:54"),
    (283, "476", "Mathew", "Gilbert", "M", "MO", "Unattached", "41:52"),
    (284, "745", "Matt", "Tomlinson", "M", "M50", "City Of Norwich AC", "41:52"),
    (285, "389", "Alex", "Chapman", "M", "MO", "Unattached", "41:52"),
    (286, "530", "Paul", "Rose", "M", "M45", "Unattached", "42:09"),
    (287, "807", "Charles", "Ohsten", "M", "MO", "Unattached", "41:52"),
    (288, "1018", "Alex", "Mccloskey", "M", "MO", "Bungay Black Dog RC", "41:50"),
    (289, "516", "Charlie", "Emery", "M", "MO", "Unattached", "42:10"),
    (290, "397", "Shaun", "Braybrook", "M", "M40", "Wymondham AC", "42:10"),
    (291, "456", "Adam", "Pearce", "M", "MO", "Unattached", "42:07"),
    (292, "342", "Mark", "Matless", "M", "M40", "Unattached", "42:13"),
    (293, "434", "Luis", "Lozano", "M", "MO", "Unattached", "41:55"),
    (294, "1804", "Simon", "Oleary", "M", "M50", "City of Norwich AC", "42:16"),
    (295, "284", "James", "Slater", "M", "MO", "Unattached", "41:54"),
    (296, "773", "Lewis", "Dunthorne", "M", "MO", "Unattached", "41:54"),
    (297, "221", "Edd", "Forster", "M", "M40", "Aycliffe Running Club", "42:15"),
    (298, "171", "Ellen", "Jack", "F", "FO", "City Of Norwich AC", "41:50"),
    (299, "274", "Paul", "Scott", "M", "M45", "Unattached", "42:09"),
    (300, "339", "Will", "Mcdaniel", "M", "MO", "Unattached", "42:13"),
]

EXISTING_ATHLETE_PLACES = {205, 216, 221, 242, 260, 268, 272}
EXISTING_RESULT_PLACES = {205, 216, 221, 242, 260, 272}

CLUBS = {
    "Wymondham AC": ("wymondham-ac", "Wymondham", "Norfolk", "England"),
    "Runners-Next-the-Sea": ("runners-next-the-sea", "Wells-next-the-Sea", "Norfolk", "England"),
    "Reepham Runners": ("reepham-runners", "Reepham", "Norfolk", "England"),
    "North Norfolk Beach Runners": ("north-norfolk-beach-runners", "Holt", "Norfolk", "England"),
    "Norfolk Gazelles AC": ("norfolk-gazelles", "Wymondham", "Norfolk", "England"),
    "City Of Norwich AC": ("city-of-norwich-ac", "Norwich", "Norfolk", "England"),
    "City of Norwich AC": ("city-of-norwich-ac", "Norwich", "Norfolk", "England"),
    "Great Yarmouth Road Runners": ("great-yarmouth-road-runners", "Great Yarmouth", "Norfolk", "England"),
    "Coltishall Jaguars RC": ("coltishall-jaguars", "Coltishall", "Norfolk", "England"),
    "Bungay Black Dog RC": ("bungay-black-dog-rc", "Bungay", "Suffolk", "England"),
}

SPECIAL_SLUGS = {"Aaron O’driscoll": "aaron-odriscoll"}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = "".join(
        character for character in normalized if not unicodedata.combining(character)
    )
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def athlete_slug(given_name: str, family_name: str) -> str:
    display_name = f"{given_name} {family_name}"
    return SPECIAL_SLUGS.get(display_name, slugify(display_name))


def compact_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def club_profile(source_club_name: str) -> tuple[str, str, str | None, str | None]:
    if source_club_name in CLUBS:
        return CLUBS[source_club_name]
    return "unattached", "Not supplied", None, None


def write_athletes_module() -> None:
    rows = []
    for place, bib, given, family, gender, category, club, chip_time in ROWS:
        if place in EXISTING_ATHLETE_PLACES:
            continue
        club_slug, city, county, country = club_profile(club)
        values: list[object] = [
            place,
            bib,
            given,
            family,
            gender,
            category,
            chip_time,
            club_slug,
            club,
            city,
        ]
        if county and country:
            values.extend([county, country])
        rows.append(f"  {compact_json(values)},")

    content = f'''import type {{ AthleteSeed }} from "./types";

const SOURCE =
  "{SOURCE}";

type AthleteRow = readonly [
  place: number,
  bib: string,
  givenName: string,
  familyName: string,
  gender: "M" | "F",
  category: string,
  chipTime: string,
  clubSlug: string,
  sourceClubName: string,
  city: string,
  county?: string,
  country?: string,
];

/** Run Norwich 2025 batch 3 — 93 new profiles from official places 201–300. */
const rows: AthleteRow[] = [
{chr(10).join(rows)}
];

const specialSlugs: Record<string, string> = {{
  "Aaron O’driscoll": "aaron-odriscoll",
}};

export const athletesRn2025B3: AthleteSeed[] = rows.map(
  ([
    place,
    bib,
    givenName,
    familyName,
    gender,
    category,
    chipTime,
    clubSlug,
    sourceClubName,
    city,
    county,
    country,
  ]) => {{
    const displayName = `${{givenName}} ${{familyName}}`;
    const clubText =
      sourceClubName === "Unattached" ? "" : `, representing ${{sourceClubName}}`;

    return {{
      slug:
        specialSlugs[displayName] ??
        displayName
          .normalize("NFKD")
          .replace(/[\\u0300-\\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      display_name: displayName,
      given_name: givenName,
      family_name: familyName,
      gender,
      club_slug: clubSlug,
      source_club_name: sourceClubName,
      city,
      ...(county ? {{ county }} : {{}}),
      ...(country ? {{ country }} : {{}}),
      bio: `${{displayName}} finished in place ${{place}} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${{chipTime}}${{clubText}}.`,
      race_entry_name: displayName,
      default_category: category,
      default_bib: bib,
      preferred_distance: "10K",
      athrecs_id: `RN25-${{bib}}`,
      notes: `Run Norwich 2025: place ${{place}}; category ${{category}}; bib ${{bib}}; official chip time ${{chipTime}}.`,
      source_url: SOURCE,
    }};
  }},
);
'''
    (ROOT / "src/data/athletes-rn2025-b3.ts").write_text(content, encoding="utf-8")


def write_results_module() -> None:
    rows = []
    for place, bib, given, family, _gender, category, _club, chip_time in ROWS:
        if place in EXISTING_RESULT_PLACES:
            continue
        rows.append(
            f"  {compact_json([place, bib, athlete_slug(given, family), chip_time, category])},"
        )

    content = f'''import type {{ ResultSeed }} from "./types";

const SOURCE =
  "{SOURCE}";

type ResultRow = readonly [
  place: number,
  bib: string,
  athleteSlug: string,
  chipTime: string,
  category: string,
];

/** Run Norwich 2025-09-07 places 201–300 missing from the existing catalogue. */
const rows: ResultRow[] = [
{chr(10).join(rows)}
];

function toSeconds(time: string) {{
  const [minutes, seconds] = time.split(":").map(Number);
  return minutes * 60 + seconds;
}}

export const resultsRn2025B3: ResultSeed[] = rows.map(
  ([place, bib, athleteSlug, chipTime, category]) => ({{
    eventSlug: "run-norwich",
    date: "2025-09-07",
    distance: "10K",
    athleteSlug,
    place,
    time: chipTime,
    finishTimeSeconds: toSeconds(chipTime),
    chipTimeSeconds: toSeconds(chipTime),
    bib,
    status: "finished",
    category,
    resultSource: "official",
    source: SOURCE,
  }}),
);
'''
    (ROOT / "src/data/results-rn2025-b3.ts").write_text(content, encoding="utf-8")


def update_catalogue() -> None:
    path = ROOT / "src/data/catalogue.ts"
    text = path.read_text(encoding="utf-8")
    if "athletes-rn2025-b3" not in text:
        text = text.replace(
            'import { athletesRn2025B2 } from "./athletes-rn2025-b2";\n',
            'import { athletesRn2025B2 } from "./athletes-rn2025-b2";\n'
            'import { athletesRn2025B3 } from "./athletes-rn2025-b3";\n',
        )
        text = text.replace(
            "export const athletes = [...athletesBase, ...athletesRn2025B1, ...athletesRn2025B2];",
            "export const athletes = [\n"
            "  ...athletesBase,\n"
            "  ...athletesRn2025B1,\n"
            "  ...athletesRn2025B2,\n"
            "  ...athletesRn2025B3,\n"
            "];",
        )
    path.write_text(text, encoding="utf-8")


def update_results() -> None:
    path = ROOT / "src/data/results.ts"
    text = path.read_text(encoding="utf-8")
    if "results-rn2025-b3" not in text:
        text = text.replace(
            'import { resultsRn2025B2 } from "./results-rn2025-b2";\n',
            'import { resultsRn2025B2 } from "./results-rn2025-b2";\n'
            'import { resultsRn2025B3 } from "./results-rn2025-b3";\n',
        )
        text = text.replace(
            "export const results: ResultSeed[] = [...resultsA, ...resultsB, ...resultsRn2025B1, ...resultsRn2025B2];",
            "export const results: ResultSeed[] = [\n"
            "  ...resultsA,\n"
            "  ...resultsB,\n"
            "  ...resultsRn2025B1,\n"
            "  ...resultsRn2025B2,\n"
            "  ...resultsRn2025B3,\n"
            "];",
        )
    path.write_text(text, encoding="utf-8")


def update_metadata() -> None:
    path = ROOT / "src/data/catalogue-metadata.ts"
    text = path.read_text(encoding="utf-8")
    text = text.replace('"athletes": 372,', '"athletes": 465,')
    text = text.replace('"results": 1641', '"results": 1735')
    if '"athletes": 465,' not in text or '"results": 1735' not in text:
        raise RuntimeError("Failed to update catalogue metadata counts")
    path.write_text(text, encoding="utf-8")


def update_verifier() -> None:
    path = ROOT / "scripts/verify-catalogue.mjs"
    text = path.read_text(encoding="utf-8")
    if "athletesRn2025B3" in text:
        return

    old_imports = '''const [
  { athletes, clubs, editions, results, seriesList, catalogueMetadata },
  { athletesRn2025B2 },
  { resultsRn2025B2 },
] = await Promise.all([
  import("../src/data/catalogue.ts"),
  import("../src/data/athletes-rn2025-b2.ts"),
  import("../src/data/results-rn2025-b2.ts"),
]);
'''
    new_imports = '''const [
  { athletes: athletesBase },
  { athletesRn2025B1 },
  { athletesRn2025B2 },
  { athletesRn2025B3 },
  { clubs },
  { editions },
  { resultsA },
  { resultsB },
  { resultsRn2025B1 },
  { resultsRn2025B2 },
  { resultsRn2025B3 },
  { seriesList },
  { catalogueMetadata },
] = await Promise.all([
  import("../src/data/athletes.ts"),
  import("../src/data/athletes-rn2025-b1.ts"),
  import("../src/data/athletes-rn2025-b2.ts"),
  import("../src/data/athletes-rn2025-b3.ts"),
  import("../src/data/clubs.ts"),
  import("../src/data/editions.ts"),
  import("../src/data/results-a.ts"),
  import("../src/data/results-b.ts"),
  import("../src/data/results-rn2025-b1.ts"),
  import("../src/data/results-rn2025-b2.ts"),
  import("../src/data/results-rn2025-b3.ts"),
  import("../src/data/series.ts"),
  import("../src/data/catalogue-metadata.ts"),
]);

const athletes = [
  ...athletesBase,
  ...athletesRn2025B1,
  ...athletesRn2025B2,
  ...athletesRn2025B3,
];
const results = [
  ...resultsA,
  ...resultsB,
  ...resultsRn2025B1,
  ...resultsRn2025B2,
  ...resultsRn2025B3,
];
'''
    if old_imports not in text:
        raise RuntimeError("Could not find verifier import block")
    text = text.replace(old_imports, new_imports, 1)

    b2_anchor = '''assertUnique(
  athletesRn2025B2.map((athlete) => athlete.slug),
  "Run Norwich batch 2 athlete slugs",
);
'''
    b3_assertions = '''
assert.equal(athletesRn2025B3.length, 93, "Run Norwich batch 3 must add 93 athletes");
assert.equal(resultsRn2025B3.length, 94, "Run Norwich batch 3 must add 94 results");
assert(
  athletesRn2025B3.every((athlete) => !/placeholder/i.test(athlete.bio)),
  "Run Norwich batch 3 contains a placeholder biography",
);
assertUnique(
  athletesRn2025B3.map((athlete) => athlete.slug),
  "Run Norwich batch 3 athlete slugs",
);
const preBatch3AthleteSlugs = new Set(
  [...athletesBase, ...athletesRn2025B1, ...athletesRn2025B2].map(
    (athlete) => athlete.slug,
  ),
);
assert(
  athletesRn2025B3.every((athlete) => !preBatch3AthleteSlugs.has(athlete.slug)),
  "Run Norwich batch 3 includes an athlete already present in the catalogue",
);
'''
    if b2_anchor not in text:
        raise RuntimeError("Could not find batch 2 verifier anchor")
    text = text.replace(b2_anchor, b2_anchor + b3_assertions, 1)

    coverage = '''
const runNorwichBatch3Places = results
  .filter(
    (result) =>
      result.eventSlug === "run-norwich" &&
      result.date === "2025-09-07" &&
      result.distance === "10K" &&
      result.place >= 201 &&
      result.place <= 300,
  )
  .map((result) => result.place)
  .sort((a, b) => a - b);
assert.deepEqual(
  runNorwichBatch3Places,
  Array.from({ length: 100 }, (_, index) => index + 201),
  "Run Norwich 2025 places 201–300 must be present exactly once",
);
'''
    if "\nconst paul =" not in text:
        raise RuntimeError("Could not find verifier coverage insertion point")
    text = text.replace("\nconst paul =", coverage + "\nconst paul =", 1)

    summary = '''      run_norwich_2025_batch_3: {
        athletes: athletesRn2025B3.length,
        results: resultsRn2025B3.length,
        places: "201-300 complete",
      },
'''
    if "      paul_browne: {" not in text:
        raise RuntimeError("Could not find verifier summary insertion point")
    text = text.replace("      paul_browne: {", summary + "      paul_browne: {", 1)
    path.write_text(text, encoding="utf-8")


def update_seed_version() -> None:
    path = ROOT / "src/lib/athrecs/seed.server.ts"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        'const SEED_VERSION = "athrecs-rn2025-batch2-v31";',
        'const SEED_VERSION = "athrecs-rn2025-batch3-v32";',
    )
    if 'const SEED_VERSION = "athrecs-rn2025-batch3-v32";' not in text:
        raise RuntimeError("Failed to update SEED_VERSION")
    if len(text.splitlines()) < 650:
        raise RuntimeError("Refusing to write a truncated seed.server.ts")
    path.write_text(text, encoding="utf-8")


def main() -> None:
    if len(ROWS) != 100:
        raise RuntimeError(f"Expected 100 official rows, found {len(ROWS)}")
    if len({row[0] for row in ROWS}) != 100:
        raise RuntimeError("Official batch contains duplicate places")
    if {row[0] for row in ROWS} != set(range(201, 301)):
        raise RuntimeError("Official batch does not cover places 201-300 exactly")

    profile_rows = [row for row in ROWS if row[0] not in EXISTING_ATHLETE_PLACES]
    result_rows = [row for row in ROWS if row[0] not in EXISTING_RESULT_PLACES]
    if len(profile_rows) != 93 or len(result_rows) != 94:
        raise RuntimeError("Unexpected batch 3 profile/result counts")
    slugs = [athlete_slug(row[2], row[3]) for row in profile_rows]
    if len(slugs) != len(set(slugs)):
        raise RuntimeError("Batch 3 generated duplicate athlete slugs")

    write_athletes_module()
    write_results_module()
    update_catalogue()
    update_results()
    update_metadata()
    update_verifier()
    update_seed_version()

    print(
        json.dumps(
            {
                "official_places": "201-300",
                "new_athletes": len(profile_rows),
                "new_results": len(result_rows),
                "merged_athletes": 465,
                "merged_results": 1735,
                "seed_version": "athrecs-rn2025-batch3-v32",
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
