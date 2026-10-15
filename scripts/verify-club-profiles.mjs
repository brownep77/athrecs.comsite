import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.equal(clubProfiles["kettering-town-harriers"].founded_year, 1894);
  assert.equal(clubProfiles["kingstone-runners-barnsley"].founded_year, 1996);
  assert.equal(clubProfiles["jog-on-jaguars"].scope, "global");
  assert.equal(bySlug.get("jog-on-jaguars").address, "");
  assert.equal(bySlug.get("isle-of-wight-ac").postcode, "PO36 9JH");
  assert.equal(bySlug.get("kettering-town-harriers").postcode, "NN15 6PB");
  assert.equal(bySlug.get("kimberley-and-district-striders").city, "Kimberley");
  assert.equal(bySlug.get("athletics-ireland-barrow-valley-a-c").city, "Old Leighlin");
  assert.equal(bySlug.get("jelly-legs-running-club").address, "");
  assert.equal(bySlug.get("kings-heath-rc-the-lions").adult_only, true);
  assert.equal(bySlug.get("kimberley-and-district-striders").adult_only, true);
  assert.match(clubProfiles["ivanhoe-robins-junior-athletics-club"].corrections.website, /ivanhoe-robins\.co\.uk/);
  assert.equal(bySlug.get("handsworth-roadhogs").postcode, "S13 9QY");
  assert.match(bySlug.get("handsworth-roadhogs").address, /Beaver Hill Road/);
  assert.equal(bySlug.get("hartshill-runners").postcode, "TF2 6EU");
  assert.equal(bySlug.get("harwich-runners").postcode, "");
  assert.equal(bySlug.get("hadleigh-hares-ac").address, "");
  assert.equal(bySlug.get("helsby-running-club").city, "Helsby");
  assert.equal(bySlug.get("eden-tri-club").city, "Edenderry");
  assert.equal(bySlug.get("hamworthy-harriers").adult_only, true);
  assert.equal(bySlug.get("harvel-hash-house-harriers").country, "England");
  assert.notEqual(clubProfiles["harvel-hash-house-harriers"].scope, "global");
  assert.equal(clubProfiles["harvel-hash-house-harriers"].founded_year, undefined);
  assert.match(clubProfiles["eden-tri-club"].biography.join(" "), /2024/);
  assert.match(clubProfiles["lisburn-triathlon-club"].biography.join(" "), /2015/);
  assert.ok(!bySlug.get("hailsham-harriers").contacts.some(c => /example|mikado-themes/.test(c.email || "")));
  const checkpoint = JSON.parse(readFileSync("docs/club-profile-checkpoint.json", "utf8"));
  for (const slug of checkpoint.nextCandidateSlugs) {
    assert.ok(bySlug.has(slug), `Next candidate must be canonical: ${slug}`);
    assert.equal(clubProfiles[slug], undefined, `Next candidate already has a profile: ${slug}`);
  }
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
  assert.equal(bySlug.get("city-of-sheffield-and-dearne-ac").postcode, "");
  assert.equal(clubProfiles["city-of-sheffield-and-dearne-ac"].founded_year, undefined);
  assert.equal(bySlug.get("clapham-chasers").address_kind, "clubhouse");
  assert.ok(bySlug.get("clapham-chasers").sports.includes("Swimming"));
  assert.equal(bySlug.get("dublin-university-cycling-and-triathlon-club").county, "Dublin");
  assert.equal(bySlug.get("welsh-athletics-parc-bryn-bach-running-club").address, "");
  assert.equal(bySlug.get("welsh-athletics-pegasus-running-club").city, "Cardiff");
  assert.equal(clubProfiles["city-of-preston-triathlon-club-for-juniors"].founded_year, undefined);
  // Batch37: historical associations, age boundaries and real session locations.
  assert.equal(clubProfiles["biggleswade-ac"].founded_year, undefined);
  assert.equal(clubProfiles["basingstoke-and-mid-hants-ac"].founded_year, undefined);
  assert.equal(clubProfiles["barton-and-district-ac"].founded_year, 1952);
  assert.equal(bySlug.get("barton-and-district-ac").city, "Barton-upon-Humber");
  assert.equal(bySlug.get("bentham-beagles-running-club").city, "Bentham");
  assert.equal(bySlug.get("birstall-rc").city, "Birstall");
  assert.equal(bySlug.get("birmingham-swifts").adult_only, true);
  assert.equal(bySlug.get("birmingham-swifts").address, "Pagoda Island, Birmingham");
  assert.equal(bySlug.get("boru-tc").adult_only, true);
  assert.match(clubProfiles["brj-run-and-tri"].location_note, /retained from the governing-body directory/);
  assert.equal(bySlug.get("belper-running-club").website, "https://belperrunningclub.weebly.com/");
  assert.match(clubProfiles["narrows-triathlon-club"].notable_members[0].connection, /2022/);
  assert.match(clubProfiles["bexley-ac"].notable_members[0].detail, /not a claim of competitive membership/);
  assert.ok(bySlug.get("biggleswade-ac").contacts.some(c => c.email === "membership@biggleswadeac.org.uk"));
  // Batch36: distinguish predecessor dates, local scope and session-specific venues.
  assert.equal(clubProfiles["brighton-and-hove-ac"].founded_year, 1966);
  assert.equal(clubProfiles["brighton-phoenix"].founded_year, 1981);
  assert.equal(clubProfiles["bedford-and-county-ac"].founded_year, undefined);
  assert.equal(clubProfiles["welsh-athletics-barry-and-vale-harriers"].founded_year, undefined);
  assert.equal(clubProfiles["brighton-and-hove-frontrunners"].scope, undefined);
  assert.equal(bySlug.get("brighton-and-hove-frontrunners").country, "England");
  assert.equal(bySlug.get("bracknell-road-runners").address, "");
  assert.equal(bySlug.get("bracknell-forest-runners").adult_only, true);
  assert.equal(bySlug.get("tullamore-triathlon-club").adult_only, true);
  assert.equal(bySlug.get("brighton-phoenix").address_kind, "training");
  assert.ok(bySlug.get("brighton-phoenix").sports.includes("Swimming"));
  assert.ok(bySlug.get("bridlington-road-runners").contacts.some(c => c.email === "bridlingtonroadrunners@outlook.com"));
  assert.equal(bySlug.get("bridlington-road-runners").website, "https://www.bridlingtonroadrunners.co.uk/");
  for (const [slug, profile] of Object.entries(clubProfiles)) {
    assert.ok(bySlug.has(slug), `Editorial profile must match a canonical club: ${slug}`);
    assert.equal(bySlug.get(slug).summary, profile.summary);
    assert.ok(profile.sources.length && profile.biography.length >= 2);
    assert.ok(profile.sources.every((s) => /^https?:\/\//.test(s.url)));
    assert.ok(profile.reviewed_at <= new Date().toISOString().slice(0, 10));
  }
  assert.equal(bySlug.get("bushfield-runners").postcode, "");
  assert.equal(bySlug.get("bushfield-runners").location_precision, "unverified");
  assert.equal(clubProfiles["broxbourne-runners"].founded_year, undefined);
  assert.equal(bySlug.get("broxbourne-runners").adult_only, true);
  assert.equal(bySlug.get("crediton-running-network").postcode, "EX17 2BN");
  assert.equal(bySlug.get("city-of-southend-on-sea-ac").city, "Southend-on-Sea");
  assert.equal(bySlug.get("east-essex-triathlon-club").address, "");
  assert.deepEqual(bySlug.get("brackley-and-district-rc").sports, ["Running"]);
  assert.ok(!bySlug.get("crediton-running-network").contacts?.some(c => /connectmy\.club/.test(c.email ?? "")));
  for (const club of clubs) {
    if (club.slug === "british-airways-ac") {
      assert.match(club.name, /Concorde Runners/);
      assert.ok(club.source_names.includes("British Airways AC"));
      assert.equal(club.address, "");
      assert.equal(club.location_precision, "area-only");
    }
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
  // Batch 40: historical associations, geographic scope and eligibility safeguards.
  assert.equal(clubProfiles["herts-phoenix-ac"].founded_year, undefined);
  assert.equal(clubProfiles["hazlemere-runners"].founded_year, 2017);
  assert.equal(clubProfiles["hereford-triathlon-club"].founded_year, 1988);
  assert.equal(clubProfiles["hereford-triathlon-club"].corrections.adult_only, false);
  assert.equal(clubProfiles["hercules-running-and-tri-club"].scope, "global");
  assert.equal(clubProfiles["henfield-joggers"].scope, undefined);
  assert.equal(clubProfiles["hi-runners"].corrections.postcode, "");
  assert.equal(clubProfiles["hedge-end-running-club"].corrections.address, "");
  assert.match(clubProfiles["athletics-ireland-athlone-a-c"].notable_members[0].detail, /subject to ratification/);
  assert.match(clubProfiles["high-peak-athletic-club"].location_note, /suspended/);
  // Batch 41: distinct clubs, historic dates, venue updates and mislabelled links.
  assert.equal(clubProfiles["holland-sports-ac"].founded_year, 1982);
  assert.equal(clubProfiles["holgate-harriers"].founded_year, undefined);
  assert.equal(clubProfiles["horley-harriers-running-club"].founded_year, undefined);
  assert.equal(clubProfiles["horsforth-fellandale-club"].founded_year, 1980);
  assert.equal(clubProfiles["horsforth-harriers"].founded_year, 1985);
  assert.match(clubProfiles["horsforth-fellandale-club"].location_note, /no junior training/);
  assert.match(clubProfiles["welsh-athletics-welshpool-athletics-club"].notable_members[0].detail, /Birchfield Harriers/);
  assert.equal(bySlug.get("hook-runners").postcode, "RG27 9NN");
  assert.equal(bySlug.get("horsforth-harriers").postcode, "LS18 4QD");
  assert.equal(bySlug.get("holcombe-harriers").city, "Holcombe Brook");
  assert.equal(bySlug.get("hitchin-running-club").address, "");
  assert.equal(bySlug.get("athletics-ireland-boyle-a-c").socials.length, 0);
  assert.ok(!bySlug.get("instinctive-sports").socials.some(s => new URL(s.url).hostname === "facebook"));
  assert.equal(bySlug.get("welsh-athletics-trg-runners").contacts.find(c => c.email?.toLowerCase() === "richard@teamreesgym.com").name, "Richard Rees");
  // Batch 42: island geography, merger chronology, eligibility and venue evidence.
  assert.equal(clubProfiles["horwich-r-m-i-harriers"].founded_year, 1924);
  assert.equal(clubProfiles["huncote-harriers"].founded_year, 1982);
  assert.equal(clubProfiles["huntingdonshire-ac"].founded_year, 1967);
  assert.equal(clubProfiles["invicta-east-kent-ac"].founded_year, undefined);
  assert.equal(clubProfiles["ipswich-triathlon-club"].founded_year, undefined);
  assert.equal(bySlug.get("isle-of-man-veterans-ac").country, "Isle of Man");
  assert.equal(bySlug.get("isle-of-man-veterans-ac").region, "Isle of Man");
  assert.equal(bySlug.get("hyde-village-striders").website, "https://hydevillagestriders.co.uk/");
  assert.equal(bySlug.get("hyde-village-striders").adult_only, true);
  assert.equal(bySlug.get("hyde-park-harriers").adult_only, true);
  assert.equal(bySlug.get("hy-athletic-club").postcode, "TN34 2NT");
  assert.equal(bySlug.get("ilford-ac").postcode, "IG1 1FY");
  assert.equal(bySlug.get("ilfracombe-running-club").postcode, "EX34 8AB");
  assert.equal(bySlug.get("human-energy-ac").address, "");
  assert.match(clubProfiles["athletics-ireland-ballon-rathoe-a-c"].location_note, /2019/);
  assert.match(clubProfiles["impact-athletic-club"].location_note, /junior-age/);
  assert.ok(bySlug.get("athletics-ireland-ballon-rathoe-a-c").contacts.some(c => c.email === "olive.obyrne@gmail.com"));
  assert.ok(!bySlug.get("impact-athletic-club").socials.some(s => s.url.includes("facebook.com/create")));
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
