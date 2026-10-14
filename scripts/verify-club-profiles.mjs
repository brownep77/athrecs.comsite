import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createServer } from "vite";
import { clubProfiles } from "../src/data/club-profiles.ts";
import { clubEnrichment, clubSocialKey, clubSlugAliases } from "../src/data/club-enrichment.ts";
import { clubWebsiteContacts } from "../src/data/club-website-contacts.ts";
import { clubSearchMetadata, safeClubJsonLd } from "../src/lib/clubs/profile-seo.ts";

const server = await createServer({
  configFile: false,
  resolve: { alias: { "@": resolve("src") } },
  server: { middlewareMode: true },
  logLevel: "error",
});
try {
  const { clubs } = await server.ssrLoadModule("/src/data/catalogue.ts");
  assert.equal(clubs.length, 1737);
  const bySlug = new Map(clubs.map((c) => [c.slug, c]));
  for (const [alias, canonical] of Object.entries(clubSlugAliases)) {
    const newest = [clubEnrichment[alias], clubEnrichment[canonical]].sort((a, b) =>
      b.checked_at.localeCompare(a.checked_at),
    )[0];
    assert.equal(
      bySlug.get(canonical).checked_at,
      newest.checked_at,
      `Alias must not restore old audit date: ${canonical}`,
    );
    assert.equal(
      bySlug.get(canonical).city,
      newest.city,
      `Alias must not restore old location: ${canonical}`,
    );
  }
  const birchfield = bySlug.get("birchfield-harriers");
  assert.match(birchfield.address, /Alexander Stadium/);
  assert.equal(birchfield.address_kind, "training");
  assert.equal(bySlug.get("unattached").country, "");
  assert.equal(bySlug.get("northumberland-fell-runners").country, "England");
  assert.equal(bySlug.get("northumberland-fell-runners").postcode, "");
  assert.equal(bySlug.get("chatteris-running-club").address, "");
  assert.equal(bySlug.get("cheshire-dragons").postcode, "");
  assert.ok(!bySlug.get("cheshire-dragons").contacts.some(c => /example|mikado-themes/.test(c.email || "")));
  assert.equal(clubProfiles["triangle-triathlon-club"].founded_year, undefined);
  assert.equal(clubProfiles["ballybunion-tc"].founded_year, undefined);
  assert.equal(bySlug.get("ams-triathlon").county, "Dublin");
  assert.equal(bySlug.get("chessington-unity-running-club").postcode, "");
  assert.equal(bySlug.get("chiltern-harriers-ac").address, "");
  assert.equal(bySlug.get("chew-valley-snails").adult_only, true);
  assert.equal(bySlug.get("welsh-athletics-micky-morris-racing-team").city, "");
  assert.equal(bySlug.get("welsh-athletics-north-wales-road-runners").city, "Llandudno");
  assert.equal(bySlug.get("cuilcagh-tc").address_kind, "correspondence");
  assert.equal(bySlug.get("crosshaven-triathlon-club").socials.find(s => s.url.includes("instagram.com/crosshaventri"))?.platform, "Instagram");
  assert.match(clubProfiles["chiltern-harriers-ac"].biography.join(" "), /closed indefinitely/);
  assert.match(clubProfiles["welsh-athletics-north-wales-road-runners"].biography.join(" "), /management passed to Always Aim High Events from 2023/);
  assert.equal(bySlug.get("welsh-athletics-mynyddwyr-de-cymru").adult_only, true);
  assert.equal(bySlug.get("oswestry-olympians").country, "England");
  assert.equal(bySlug.get("oswestry-olympians").postcode, "");
  assert.equal(bySlug.get("astley-and-tyldesley-road-runners").postcode, "M29 7DW");
  assert.equal(bySlug.get("welsh-athletics-3m-gorseinon-road-runners").postcode, "SA2 8QG");
  assert.equal(bySlug.get("athletics-ireland-ballintotis-fit4life-a-c").postcode, "");
  assert.equal(bySlug.get("athletics-ireland-ballintotis-fit4life-a-c").adult_only, true);
  assert.equal(bySlug.get("billinge-running-club").address, "");
  assert.equal(bySlug.get("wakefield-district-h-and-ac").postcode, "WF2 8TY");
  assert.deepEqual(bySlug.get("wakefield-district-h-and-ac").sports, ["Running", "Athletics"]);
  assert.equal(bySlug.get("craven-energy-triathlon-and-multisport-club").city, "Skipton");
  assert.equal(bySlug.get("craven-energy-triathlon-and-multisport-club").county, "North Yorkshire");
  assert.equal(bySlug.get("yorkshire-wolds-runners").city, "Driffield");
  assert.equal(bySlug.get("north-york-moors-ac").address_kind, "correspondence");
  assert.equal(bySlug.get("north-york-moors-ac").postcode, "TS7 8ED");
  assert.match(clubProfiles["north-york-moors-ac"].biography.join(" "), /12 October/);
  assert.match(clubProfiles["sheffield-triathlon-club"].biography.join(" "), /junior section is currently inactive/);
  assert.match(clubProfiles["athletics-ireland-aughagower-a-c"].biography.join(" "), /not presented here as an open facility/);
  assert.equal(bySlug.get("athletics-ireland-aughagower-a-c").postcode, "");
  assert.equal(bySlug.get("olympian-triathlon-club").website, "https://olympiantriathlon.com/");
  assert.equal(bySlug.get("olympian-triathlon-club").contact_url, "https://olympiantriathlon.com/#contact");
  assert.equal(clubProfiles["yorkshire-wolds-runners"].founded_year, 2010);
  assert.equal(clubProfiles["omagh-tc"].founded_year, undefined);
  assert.equal(bySlug.get("omagh-tc").adult_only, true);
  for (const slug of ["sheffield-triathlon-club", "york-knavesmire-harriers"]) {
    assert.equal(bySlug.get(slug).address, "");
    assert.equal(bySlug.get(slug).postcode, "");
  }
  assert.equal(bySlug.get("hastings-ac").postcode, "TN34 2PG");
  assert.equal(bySlug.get("hastings-ac").address_kind, "training");
  assert.equal(bySlug.get("horsham-joggers").postcode, "RH12 3YS");
  assert.equal(bySlug.get("horsham-blue-star-harriers").city, "Horsham");
  assert.equal(bySlug.get("athletics-ireland-ardmore-a-c").address_kind, "correspondence");
  assert.equal(bySlug.get("athletics-ireland-ardmore-a-c").city, "Ardmore");
  assert.equal(bySlug.get("armagh-pikekickers-triathlon-club").adult_only, true);
  assert.equal(clubProfiles["athletics-ireland-ace-a-c"].founded_year, undefined);
  assert.equal(clubProfiles["dacorum-athletics-club"].founded_year, 1995);
  assert.equal(clubProfiles["horsham-blue-star-harriers"].founded_year, 1925);
  assert.match(
    clubProfiles["brown-shoes-tc"].biography.join(" "),
    /does not currently organise regular group runs/,
  );
  assert.ok(bySlug.get("farnham-triathlon-club").sports.includes("Cycling"));
  for (const slug of [
    "haywards-heath-harriers",
    "horsham-blue-star-harriers",
    "athletics-ireland-ace-a-c",
  ]) {
    assert.equal(bySlug.get(slug).address, "");
    assert.equal(bySlug.get(slug).postcode, "");
  }
  assert.equal(
    bySlug.get("welsh-athletics-griffithstown-harriers").website,
    "https://www.griffithstownharriers.com/",
  );
  assert.ok(
    !bySlug
      .get("athletics-ireland-bray-runners-a-c")
      .contacts.some((c) => c.phone === "0871234567"),
  );
  assert.equal(bySlug.get("ashford-triathlon-club").city, "Ashford");
  assert.equal(bySlug.get("deal-tri-club").city, "Deal");
  assert.equal(bySlug.get("welsh-athletics-deestriders-b-s-rc").postcode, "");
  assert.equal(clubProfiles["athletics-ireland-borrisokane-a-c"].founded_year, undefined);
  assert.equal(clubProfiles["camberley-and-district-ac"].founded_year, 1953);
  // Later targeted reviews must preserve safe venue and contact distinctions.
  const rotherham = bySlug.get("rotherham-harriers-and-ac");
  assert.equal(rotherham.city, "Rotherham");
  assert.match(rotherham.address, /Herringthorpe Stadium/);
  assert.equal(rotherham.postcode, "S65 2HR");
  assert.equal(clubProfiles[rotherham.slug].founded_year, undefined);
  assert.equal(bySlug.get("holmfirth-harriers-ac").postcode, "HD9 6QE");
  assert.deepEqual(bySlug.get("kimberworth-striders").sports, ["Running"]);
  assert.ok(bySlug.get("doncaster-triathlon-club").sports.includes("Cycling"));
  for (const slug of [
    "doncaster-triathlon-club",
    "welsh-athletics-caldicot-running-club",
    "athletics-ireland-ballincollig-a-c",
  ]) {
    assert.equal(bySlug.get(slug).address, "");
    assert.equal(bySlug.get(slug).postcode, "");
  }
  assert.equal(bySlug.get("athletics-ireland-blackrock-louth-a-c").county, "Louth");
  assert.equal(clubProfiles["athletics-ireland-blayney-rockets-a-c"].founded_year, undefined);
  assert.deepEqual(bySlug.get("allen-valley-striders").sports, ["Running"]);
  assert.equal(bySlug.get("allen-valley-striders").city, "Allendale");
  assert.equal(bySlug.get("allen-valley-striders").adult_only, false);
  assert.equal(clubProfiles["burnley-ac"].founded_year, undefined);
  assert.match(bySlug.get("burnley-ac").address, /Barden Lane/);
  assert.equal(bySlug.get("athletics-ireland-cabinteely-a-c").postcode, "");
  assert.equal(bySlug.get("athletics-ireland-castlebar-a-c").address_kind, "directory");
  const buckley = bySlug.get("welsh-athletics-buckley-rc");
  assert.ok(buckley.checked_at >= "2026-10-14");
  assert.ok(buckley.contacts.some((c) => c.email === "buckley.runners@gmail.com"));
  assert.ok(!buckley.contacts.some((c) => /pauldodd07/i.test(c.email ?? "")));
  for (const [slug, profile] of Object.entries(clubProfiles)) {
    assert.ok(bySlug.has(slug), `Editorial profile must match a canonical club: ${slug}`);
    assert.equal(bySlug.get(slug).summary, profile.summary);
    assert.ok(profile.sources.length && profile.biography.length >= 2);
    assert.ok(profile.sources.every((s) => /^https?:\/\//.test(s.url)));
    assert.ok(profile.reviewed_at <= new Date().toISOString().slice(0, 10));
  }
  for (const club of clubs) {
    const keys = (club.socials ?? []).map((s) => clubSocialKey(s.url));
    assert.equal(keys.length, new Set(keys).size, `Duplicate social profiles: ${club.slug}`);
  }
  for (const row of Object.values(clubWebsiteContacts)) {
    for (const contact of [...(row.contacts ?? []), ...(row.socials ?? [])]) {
      assert.ok(contact.source_url && contact.checked_at, "New contacts retain provenance");
      assert.ok(
        !/demolink|kronosports|example\./i.test(contact.email ?? ""),
        "Supplier and placeholder addresses are excluded",
      );
    }
  }
  assert.equal(
    clubSocialKey("http://www.facebook.com/testclub/?utm_source=site"),
    clubSocialKey("https://en-gb.facebook.com/testclub"),
  );
  assert.equal(
    clubSocialKey("https://twitter.com/testclub/"),
    clubSocialKey("https://x.com/testclub"),
  );
  assert.notEqual(
    clubSocialKey("https://facebook.com/profile.php?id=123"),
    clubSocialKey("https://facebook.com/profile.php?id=456"),
  );
  const fixture = {
    slug: "fictional-club",
    name: "Fictional Club",
    summary: "A fictional club for testing.",
    city: "Cardiff",
    county: "",
    country: "Wales",
    sports: ["Athletics"],
    website: "https://club.example.test",
    address: "1 Example Road",
    postcode: "CF1 1AA",
    address_kind: "correspondence",
    contact_url: "https://club.example.test/contact",
    contacts: [{ role: "Membership", email: "join@club.example.test" }],
    socials: [],
    profile: { founded_year: 1980 },
  };
  const meta = clubSearchMetadata(fixture, "https://www.athrecs.com", "ATHRECS.com");
  assert.equal(meta.canonical, "https://www.athrecs.com/clubs/fictional-club");
  assert.equal(meta.organization.address.addressCountry, "GB");
  assert.equal(meta.organization.address.streetAddress, undefined);
  assert.equal(meta.organization.address.postalCode, undefined);
  assert.equal(meta.organization.contactPoint[0].email, fixture.contacts[0].email);
  assert.equal(
    clubSearchMetadata(
      { ...fixture, address_kind: "training" },
      "https://www.athrecs.com",
      "ATHRECS.com",
    ).organization.address.streetAddress,
    fixture.address,
  );
  assert.equal(
    clubSearchMetadata(
      { ...fixture, profile: { scope: "global" } },
      "https://www.athrecs.com",
      "ATHRECS.com",
    ).organization.address,
    undefined,
  );
  assert.equal(
    clubSearchMetadata({ ...fixture, slug: "unattached" }, "https://www.athrecs.com", "ATHRECS.com")
      .organization,
    null,
  );
  const unsafe = { name: "</script><script>example</script>" };
  assert.ok(!safeClubJsonLd(unsafe).includes("<"));
  assert.deepEqual(JSON.parse(safeClubJsonLd(unsafe)), unsafe);
  assert.ok(
    clubSearchMetadata(
      { ...fixture, summary: "Long description ".repeat(30) },
      "https://www.athrecs.com",
      "ATHRECS.com",
    ).description.length <= 165,
  );
  console.log(
    JSON.stringify(
      {
        clubs: clubs.length,
        extendedProfiles: Object.keys(clubProfiles).length,
        clubsWithContacts: clubs.filter((c) => c.contacts?.length).length,
        contactEntries: clubs.reduce((n, c) => n + (c.contacts?.length ?? 0), 0),
        clubsWithEmail: clubs.filter((c) => c.contacts?.some((x) => x.email)).length,
        clubsWithPhone: clubs.filter((c) => c.contacts?.some((x) => x.phone)).length,
        clubsWithSocials: clubs.filter((c) => c.socials?.length).length,
        socialLinks: clubs.reduce((n, c) => n + (c.socials?.length ?? 0), 0),
        currentDirectoryChecks: clubs.filter((c) => c.checked_at >= "2026-10-13").length,
        notableMembers: Object.values(clubProfiles).reduce(
          (n, c) => n + (c.notable_members?.length ?? 0),
          0,
        ),
      },
      null,
      2,
    ),
  );
  console.log(
    "Club profiles passed: canonical source freshness, address corrections, provenance, social deduplication and safe search metadata.",
  );
} finally {
  await server.close();
}
