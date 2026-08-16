import fs from "node:fs/promises";

const CHECKED_AT = "2026-08-16";
const EA_API =
  "https://www.englandathletics.org/wp-admin/admin-ajax.php?action=data_api_search&types[]=club&order=asc&order_by=name";
const EA_FINDER = "https://www.englandathletics.org/find-a-club/";
const WELSH_LIST = "https://www.welshathletics.org/en/club/list";
const TI_LIST = "https://app.triathlonireland.com/clubs/";
const TI_API =
  "https://app.triathlonireland.com/api/UserClub/getClubsList?isJunior=&selectedCounty=";
const BELFAST_LIST = "https://www.belfastrunning.com/clubs";
const ANI_LIST = "https://athleticsni.org/Clubs/Find-A-Club";
const SPECIAL_OLYMPICS_LIST = "https://www.specialolympics.ie/find-a-club";

const [
  { clubs: base },
  { athleticsIrelandClubs },
  { belfastClubs },
  { triathlonIrelandClubs },
  { welshAthleticsClubs },
] = await Promise.all([
  import("../src/data/clubs.ts"),
  import("../src/data/clubs-athletics-ireland.ts"),
  import("../src/data/clubs-belfast.ts"),
  import("../src/data/clubs-triathlon-ireland.ts"),
  import("../src/data/clubs-welsh-athletics.ts"),
]);

const allClubs = [
  ...base,
  ...athleticsIrelandClubs,
  ...belfastClubs,
  ...triathlonIrelandClubs,
  ...welshAthleticsClubs,
];

const enrichment = new Map();
const merge = (slug, values) => {
  const clean = Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) => value !== undefined && value !== null && (value !== "" || key === "city"),
    ),
  );
  enrichment.set(slug, { ...(enrichment.get(slug) ?? {}), ...clean });
};
const norm = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, "and")
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
const decode = (value) =>
  value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const validHttp = (value) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};
const ukPostcode = (value) =>
  value?.match(/\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i)?.[0].toUpperCase();
const eircode = (value) =>
  value?.match(/\b[AC-FHKNPRTV-Y]\d{2}\s?[0-9AC-FHKNPRTV-Y]{4}\b/i)?.[0].toUpperCase();
const titleCase = (value) => value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const byName = new Map();
for (const club of allClubs) {
  for (const name of [club.name, ...(club.source_names ?? [])]) {
    const key = norm(name);
    const matches = byName.get(key) ?? [];
    if (!matches.some((item) => item.slug === club.slug)) matches.push(club);
    byName.set(key, matches);
  }
}

const preferredEaSlug = {
  "Ashford AC": "ashford-ac",
  "Bungay Black Dog RC": "bungay-black-dog-rc",
  "Cambridge & Coleridge AC": "cambridge-and-coleridge-ac",
  "Coltishall Jaguars RC": "coltishall-jaguars",
  "Dereham Runners AC": "dereham-runners",
  "Great Yarmouth & District AC": "great-yarmouth-district-ac",
  "Harlow Running & Tri Club": "harlow-running-and-tri-club",
  "Norfolk Gazelles AC": "norfolk-gazelles",
  "Tri-Anglia Triathlon Club": "tri-anglia",
  "Winchester & District AC": "winchester-district-ac",
};

async function fetchEaClubs() {
  const first = await (await fetch(`${EA_API}&page=1&limit=50&radius=25`)).json();
  const records = [...first.data];
  for (let page = 2; page <= first.meta.last_page; page += 6) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(6, first.meta.last_page - page + 1) }, (_, index) =>
        fetch(`${EA_API}&page=${page + index}&limit=50&radius=25`).then((response) =>
          response.json(),
        ),
      ),
    );
    for (const result of batch) records.push(...result.data);
  }
  return records;
}

async function lookupPostcodes(postcodes) {
  const unique = [...new Set(postcodes.filter(Boolean))];
  const output = new Map();
  for (let index = 0; index < unique.length; index += 100) {
    const response = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postcodes: unique.slice(index, index + 100) }),
    });
    const json = await response.json();
    for (const item of json.result ?? []) output.set(item.query.toUpperCase(), item.result);
  }
  return output;
}

const eaClubs = await fetchEaClubs();
const postcodeData = await lookupPostcodes(eaClubs.map((club) => club.address?.postcode));
const additions = [];
let eaMatched = 0;

for (const record of eaClubs) {
  const candidates = byName.get(norm(record.name)) ?? [];
  let club = candidates.find((candidate) => candidate.slug === preferredEaSlug[record.name]);
  if (!club && candidates.length === 1) [club] = candidates;
  if (!club && record.name === "Ventura Runners") {
    club = {
      slug: "ventura-runners",
      name: record.name,
      city: record.address?.city ?? "",
      county: "",
      country: record.address?.country ?? "England",
      sports: ["Running", "Athletics"],
      website: validHttp(record.website_url),
      summary: "England Athletics affiliated running club.",
      source_names: [record.name],
    };
    additions.push(club);
  }
  if (!club) continue;
  eaMatched += 1;
  const postcode = record.address?.postcode?.toUpperCase();
  const geo = postcodeData.get(postcode);
  const eaCity =
    record.address?.city &&
    (record.address.city !== record.address.region || record.address.city === "London")
      ? record.address.city
      : "";
  const country = geo?.country ?? record.address?.country ?? club.country;
  const county =
    geo?.region === "London"
      ? "Greater London"
      : (geo?.admin_county ?? geo?.admin_district ?? club.county);
  const address = [
    record.address?.number,
    record.address?.building,
    record.address?.line1,
    record.address?.line2,
    record.address?.line3,
    eaCity,
    postcode,
  ]
    .filter(Boolean)
    .join(", ");
  const socials = [
    ["Facebook", record.facebook_url],
    ["Instagram", record.instagram_url],
    ["X", record.twitter_url],
  ]
    .map(([platform, url]) => ({ platform, url: validHttp(url) }))
    .filter((item) => item.url);
  const finderUrl = `${EA_FINDER}?keyword=${encodeURIComponent(record.name)}&page=1`;
  merge(club.slug, {
    name: record.name,
    city: eaCity,
    county,
    country,
    address,
    postcode,
    region: record.address?.region,
    website: validHttp(record.website_url) ?? club.website,
    official_source: "England Athletics",
    source_url: finderUrl,
    checked_at: CHECKED_AT,
    location_precision: geo ? "postcode" : eaCity ? "official-directory" : "area-only",
    contact_url: record.can_contact ? finderUrl : validHttp(record.website_url),
    socials: socials.length ? socials : undefined,
    summary: `England Athletics affiliated club based in ${eaCity || county || country}.`,
  });
}

const welshListHtml = await (await fetch(WELSH_LIST)).text();
const welshLinks = [...welshListHtml.matchAll(/href=["'](\/en\/club\/view\/[^"']+)["']/g)].map(
  (match) => new URL(match[1], WELSH_LIST).toString(),
);
const uniqueWelshLinks = [...new Set(welshLinks)];

async function fetchTexts(urls, size = 8) {
  const output = [];
  for (let index = 0; index < urls.length; index += size) {
    const batch = await Promise.all(
      urls
        .slice(index, index + size)
        .map(async (url) => ({ url, text: await (await fetch(url)).text() })),
    );
    output.push(...batch);
  }
  return output;
}

const welshPages = await fetchTexts(uniqueWelshLinks);
const welshPostcodes = await lookupPostcodes(
  welshPages.map(({ text }) =>
    ukPostcode(text.match(/<div class="club-venue">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1]),
  ),
);
let welshMatched = 0;

for (const { url, text } of welshPages) {
  const name = decode(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const candidates = byName.get(norm(name)) ?? [];
  const club = candidates.length === 1 ? candidates[0] : undefined;
  if (!club) continue;
  welshMatched += 1;
  const region = decode(
    text.match(/<div class="club-region">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? "",
  );
  const venue = decode(
    text.match(/<div class="club-venue">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? "",
  );
  const postcode = ukPostcode(venue);
  const geo = postcode ? welshPostcodes.get(postcode) : undefined;
  const contactsBlock = text.match(/<div class="club-contacts">([\s\S]*?)<\/div>/i)?.[1] ?? "";
  const contacts = [...contactsBlock.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<ul[^>]*>([\s\S]*?)<\/ul>/gi)]
    .map((match) => {
      const role = titleCase(decode(match[1]));
      const list = match[2];
      const items = [...list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) =>
        decode(item[1]),
      );
      const email = list.match(/mailto:([^"']+)/i)?.[1]?.trim();
      const phone = list.match(/tel:([^"']+)/i)?.[1]?.trim();
      const nameValue = items.find((item) => item && item !== email && item !== phone);
      return { role, name: nameValue || undefined, email, phone };
    })
    .filter((contact) => contact.name || contact.email || contact.phone);
  const socialStart = text.indexOf('class="club-socials');
  const socialEnd = text.indexOf('class="club-colour', socialStart);
  const socialBlock =
    socialStart >= 0
      ? text.slice(socialStart, socialEnd > socialStart ? socialEnd : socialStart + 4000)
      : "";
  const socials = [
    ...socialBlock.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<i[^>]+class=["'][^"']*fa-(facebook|instagram|twitter|youtube|linkedin)[^"']*["']/gi,
    ),
  ]
    .map((match) => ({
      platform: match[2].toLowerCase() === "twitter" ? "X" : titleCase(match[2]),
      url: validHttp(match[1]),
    }))
    .filter((item) => item.url);
  const website = validHttp(text.match(/href=["']([^"']+)["'][^>]*>\s*Visit Website/i)?.[1]);
  merge(club.slug, {
    county: geo?.admin_county ?? geo?.admin_district ?? club.county,
    country: geo?.country ?? "Wales",
    address: venue,
    postcode,
    region,
    website: website ?? club.website,
    official_source: "Welsh Athletics",
    source_url: url,
    checked_at: CHECKED_AT,
    location_precision: geo ? "postcode" : venue ? "official-directory" : "area-only",
    contact_url: url,
    contacts: contacts.length ? contacts : undefined,
    socials: socials.length ? socials : undefined,
  });
}

const aiPages = await fetchTexts(
  athleticsIrelandClubs.map((club) => club.website),
  7,
);
let aiMatched = 0;
for (const { url, text } of aiPages) {
  const club = athleticsIrelandClubs.find((item) => item.website === url);
  if (!club) continue;
  aiMatched += 1;
  const address = decode(text.match(/Training Location:\s*([\s\S]*?)<\/p>/i)?.[1] ?? "");
  const email = text.match(/<a href="mailto:([^"']*)"[^>]*class="my-10/i)?.[1]?.trim();
  const contactArea =
    text.match(
      /<div class="text-center text-black">([\s\S]*?)<\/div>\s*<div class="flex flex-row/i,
    )?.[1] ?? "";
  const phone = decode(contactArea.match(/<div[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? "");
  const socials = [
    ...text.matchAll(
      /<a href="(https?:\/\/[^"']+)"[^>]*>\s*<img[^>]+social\/colorful\/(Facebook|Instagram|Twitter|YouTube|LinkedIn)\.svg/gi,
    ),
  ]
    .map((match) => ({
      platform: match[2].toLowerCase() === "twitter" ? "X" : titleCase(match[2]),
      url: validHttp(match[1]),
    }))
    .filter((item) => item.url);
  const contacts = [];
  if (email || /\d{6,}/.test(phone))
    contacts.push({
      role: "Club contact",
      email: email || undefined,
      phone: /\d{6,}/.test(phone) ? phone : undefined,
    });
  merge(club.slug, {
    city: club.city === club.county ? "" : club.city,
    address,
    postcode: eircode(address),
    official_source: "Athletics Ireland",
    source_url: url,
    checked_at: CHECKED_AT,
    location_precision: address ? "official-directory" : "area-only",
    contact_url: url,
    contacts: contacts.length ? contacts : undefined,
    socials: socials.length ? socials : undefined,
  });
}

const tiResponse = await (await fetch(TI_API)).json();
const tiClubs = tiResponse.outputData?.clubs ?? [];
const tiByName = new Map(tiClubs.map((club) => [norm(club.name), club]));
let tiMatched = 0;
for (const club of triathlonIrelandClubs) {
  const source = tiByName.get(norm(club.name));
  if (!source) {
    merge(club.slug, {
      city: club.city === club.county ? "" : club.city,
      official_source: "Triathlon Ireland",
      source_url: TI_LIST,
      checked_at: CHECKED_AT,
      location_precision: "area-only",
      contact_url: validHttp(club.website) ?? TI_LIST,
    });
    continue;
  }
  tiMatched += 1;
  const contacts = source.clubEmail
    ? [{ role: "Club contact", email: source.clubEmail }]
    : undefined;
  const socials = [
    ["Facebook", source.facebook],
    ["X", source.twitter],
  ]
    .map(([platform, url]) => ({ platform, url: validHttp(url) }))
    .filter((item) => item.url);
  merge(club.slug, {
    city: club.city === club.county ? "" : club.city,
    county: source.county || club.county,
    website: validHttp(source.site) ?? club.website,
    official_source: "Triathlon Ireland",
    source_url: TI_LIST,
    checked_at: CHECKED_AT,
    location_precision: "area-only",
    contact_url: validHttp(source.site) ?? TI_LIST,
    contacts,
    socials: socials.length ? socials : undefined,
  });
}

const aniHtml = await (await fetch(ANI_LIST)).text();
const aniClubs = aniHtml
  .split(/<tr><td[^>]*>/i)
  .slice(1)
  .map((row) => {
    const name = row.match(/<strong>([\s\S]*?)<\/strong>/i)?.[1];
    if (!name) return undefined;
    return {
      name: decode(name),
      secretary: decode(row.match(/<br \/>\s*Secretary:\s*([\s\S]*?)<\/td>/i)?.[1] ?? ""),
      phone: decode(row.match(/Tel:<\/span>\s*&#0187;\s*([^<]+)<br/i)?.[1] ?? ""),
      email: row.match(/mailto:([^"']+)/i)?.[1]?.trim(),
      website: validHttp(row.match(/Web:<\/span>[\s\S]*?href=['"]([^'"]+)/i)?.[1]),
    };
  })
  .filter(Boolean);
const aniByName = new Map(aniClubs.map((club) => [norm(club.name), club]));

for (const club of belfastClubs) {
  const aniClub = aniByName.get(norm(club.name));
  const isOrmeau = club.slug === "belfast-ormeau-runners";
  const isSpecialOlympics = club.slug === "special-olympics-newtownabbey-racers";
  const officialSource = isOrmeau
    ? "Official club website"
    : isSpecialOlympics
      ? "Special Olympics Ireland"
      : aniClub
        ? "Athletics Northern Ireland"
        : "Belfast Running directory";
  const sourceUrl = isOrmeau
    ? validHttp(club.website)
    : isSpecialOlympics
      ? SPECIAL_OLYMPICS_LIST
      : aniClub
        ? ANI_LIST
        : BELFAST_LIST;
  const contacts = aniClub
    ? [
        {
          role: "Club secretary",
          name: aniClub.secretary || undefined,
          email: aniClub.email || undefined,
          phone: aniClub.phone || undefined,
        },
      ]
    : undefined;
  merge(club.slug, {
    website: aniClub?.website ?? club.website,
    official_source: officialSource,
    source_url: sourceUrl,
    checked_at: CHECKED_AT,
    location_precision: "official-directory",
    contact_url: aniClub ? ANI_LIST : (validHttp(club.website) ?? sourceUrl),
    contacts,
  });
}

const aliases = {
  "bungay-black-dog": "bungay-black-dog-rc",
  "cambridge-coleridge-ac": "cambridge-and-coleridge-ac",
  "coltishall-jaguars-rc": "coltishall-jaguars",
  "dereham-runners-ac": "dereham-runners",
  "great-yarmouth-and-district-ac": "great-yarmouth-district-ac",
  "harlow-running-tri-club": "harlow-running-and-tri-club",
  "hercules-wimbledon-ac": "hercules-wimbledon",
  "norfolk-gazelles-ac": "norfolk-gazelles",
  "north-norfolk-harriers-athletics-club": "north-norfolk-harriers",
  "tri-anglia-triathlon-club": "tri-anglia",
  "winchester-and-district-ac": "winchester-district-ac",
};

for (const club of allClubs) {
  if (enrichment.has(club.slug)) continue;
  merge(club.slug, {
    official_source: club.slug === "unattached" ? undefined : "Prior ATHRECS catalogue",
    source_url: validHttp(club.website),
    checked_at: CHECKED_AT,
    location_precision: "unverified",
    contact_url: validHttp(club.website),
  });
}

merge("hallamshire-harriers-sheffield", {
  city: "Sheffield",
  county: "South Yorkshire",
  country: "England",
  website: "https://www.hallamshireharriers.org/",
  official_source: "Official club website",
  source_url: "https://www.hallamshireharriers.org/",
  checked_at: CHECKED_AT,
  location_precision: "official-directory",
  contact_url: "https://www.hallamshireharriers.org/",
  contacts: [
    {
      role: "Club secretary",
      email: "hallamshireharrierssecretary@gmail.com",
    },
  ],
  socials: [
    {
      platform: "Facebook",
      url: "https://www.facebook.com/hallamshireharriers",
    },
    {
      platform: "Instagram",
      url: "https://www.instagram.com/hallamshireharriers/",
    },
  ],
});

const sortedEntries = [...enrichment].sort(([left], [right]) => left.localeCompare(right));
const midpoint = Math.ceil(sortedEntries.length / 2);
const parts = [sortedEntries.slice(0, midpoint), sortedEntries.slice(midpoint)];
const generatedHeader = `import type { ClubSeed } from "./types";\n\n// Generated from public governing-body directories by scripts/generate-club-enrichment.mjs.\n// Checked ${CHECKED_AT}. Do not add private contact information.\n`;
for (const [index, entries] of parts.entries()) {
  const suffix = index === 0 ? "A" : "B";
  const compact = `{\n${entries
    .map(([slug, value]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(value)},`)
    .join("\n")}\n}`;
  await fs.writeFile(
    new URL(`../src/data/club-enrichment-${suffix.toLowerCase()}.ts`, import.meta.url),
    `${generatedHeader}\nexport const clubEnrichmentPart${suffix}: Record<string, Partial<ClubSeed>> = ${compact};\n`,
  );
}
const indexContent = `import type { ClubSeed } from "./types";\nimport { clubEnrichmentPartA } from "./club-enrichment-a.ts";\nimport { clubEnrichmentPartB } from "./club-enrichment-b.ts";\n\nexport const clubSlugAliases: Record<string, string> = ${JSON.stringify(aliases, null, 2)};\n\nexport const auditedClubAdditions: ClubSeed[] = ${JSON.stringify(additions, null, 2)};\n\nexport const clubEnrichment: Record<string, Partial<ClubSeed>> = {\n  ...clubEnrichmentPartA,\n  ...clubEnrichmentPartB,\n};\n`;
await fs.writeFile(new URL("../src/data/club-enrichment.ts", import.meta.url), indexContent);

console.log(
  JSON.stringify(
    {
      catalogueBeforeDeduplication: allClubs.length,
      ea: { fetched: eaClubs.length, matched: eaMatched, postcodeMatches: postcodeData.size },
      welshAthletics: { pages: uniqueWelshLinks.length, matched: welshMatched },
      athleticsIreland: { pages: aiPages.length, matched: aiMatched },
      triathlonIreland: { currentApiClubs: tiClubs.length, matched: tiMatched },
      additions: additions.map((club) => club.name),
      aliases: Object.keys(aliases).length,
      enriched: enrichment.size,
    },
    null,
    2,
  ),
);
