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
  // Batch 113: council-supported venue correction; event venue is not a training base.
  const barlestone = bySlug.get("barlestone-st-giles-rc");
  assert.equal(barlestone.city, "Barlestone");
  assert.equal(barlestone.address_kind, "training");
  assert.equal(barlestone.postcode, "CV13 0EP");
  assert.equal(barlestone.adult_only, true);
  assert.equal(clubProfiles[barlestone.slug].founded_year, 2015);
  assert.equal(clubProfiles[barlestone.slug].notable_members[0].name, "Tony Walker");
  assert.equal(barlestone.contacts[0].email, "barlestonerunningclub@gmail.com");
  assert.ok(barlestone.socials.some(s => s.url === "https://www.facebook.com/barlestoneruns"));
  const berkeley = bySlug.get("new-berkeley-harriers");
  assert.equal(berkeley.address_kind, "directory");
  assert.equal(berkeley.postcode, "GL13 9DF");
  assert.equal(berkeley.contacts[0].email, "enquiries@newberkeleyharriers.com");
  assert.equal(berkeley.contacts[0].phone, "07971 040141");
  assert.match(berkeley.website, /facebook\.com\/share\//);
  assert.equal(clubProfiles[berkeley.slug].founded_year, undefined);
  assert.equal(clubProfiles[berkeley.slug].notable_members, undefined);
  for (const club of [barlestone, berkeley]) {
    assert.equal(club.country, "England");
    assert.equal(club.checked_at, "2026-10-13");
    assert.equal(club.contacts[0].checked_at, "2026-10-18");
    assert.equal(clubProfiles[club.slug].biography.length, 3);
  }
  // Batch 112: recovered primary histories must not restore flagged club domains.
  const batch112Emails = {
    "liverpool-harriers-and-ac": "williamsarwel9@gmail.com",
    "liverpool-pembroke-and-sefton-h-ac": "karenprobert@yahoo.co.uk",
    "pudsey-and-bramley-ac": "oakie47@hotmail.com",
    "shepshed-running-club": "david.hattersley@hotmail.co.uk",
  };
  for (const [slug, email] of Object.entries(batch112Emails)) {
    const club = bySlug.get(slug);
    assert.equal(club.website, "");
    assert.equal(club.country, "England");
    const contact = club.contacts.find(c => c.email === email);
    assert.ok(contact, `${slug}: new handbook contact`);
    assert.equal(contact.checked_at, "2026-10-18");
    assert.match(contact.source_url, /ECCA_Handbook_2026-27\.pdf$/);
    assert.equal(club.checked_at, "2026-10-13");
  }
  assert.equal(bySlug.get("liverpool-harriers-and-ac").address_kind, "training");
  assert.equal(bySlug.get("liverpool-pembroke-and-sefton-h-ac").address_kind, "directory");
  assert.equal(bySlug.get("pudsey-and-bramley-ac").address_kind, "directory");
  assert.equal(clubProfiles["liverpool-harriers-and-ac"].founded_year, 1882);
  assert.equal(clubProfiles["liverpool-pembroke-and-sefton-h-ac"].founded_year, 1995);
  assert.equal(clubProfiles["pudsey-and-bramley-ac"].founded_year, undefined);
  assert.equal(clubProfiles["pudsey-and-bramley-ac"].notable_members.length, 3);
  assert.match(clubProfiles["pudsey-and-bramley-ac"].biography.join(" "), /January 1990/);
  assert.ok(bySlug.get("liverpool-pembroke-and-sefton-h-ac").socials.some(s => s.url === "https://www.facebook.com/LPSATHLETICCLUB/"));
  assert.equal(clubProfiles["shepshed-running-club"], undefined);
  // Batch 111: recovered programme, explicit handbook club contacts and venue spelling.
  const mojo = bySlug.get("mojo-run-fit");
  assert.equal(mojo.city, "Beckenham");
  assert.equal(mojo.address_kind, "training");
  assert.match(mojo.address, /Lennard Road/);
  assert.equal(mojo.postcode, "BR3 1QN");
  assert.equal(mojo.adult_only, true);
  assert.equal(mojo.checked_at, "2026-10-13");
  assert.equal(mojo.country, "England");
  assert.equal(mojo.contacts[0].phone, "07703 101 424");
  assert.ok(!mojo.contacts.some(c => c.email));
  assert.equal(mojo.socials.length, 3);
  assert.equal(clubProfiles[mojo.slug].founded_year, undefined);
  assert.equal(clubProfiles[mojo.slug].notable_members, undefined);
  assert.match(clubProfiles[mojo.slug].biography.join(" "), /5km in 40 minutes or less/);
  const batch111Emails = {
    "ellenborough-ac": "fellwinner@gmail.com",
    "ginpit-flyers": "jamesbentall1@gmail.com",
    "lancashire-constabulary-athletics-section": "steve@fellrunner.com",
    "lancashire-fire-and-rescue-service-and-aa": "thepenworthamwales19@hotmail.co.uk",
    "rolls-royce-harriers": "gillianw67@hotmail.com",
    "run-middlewich": "debbieford70@outlook.com",
    "south-yorkshire-police-ac": "dixonmaria16@gmail.com",
    "daws-heath-harriers": "Arynmsmith@gmail.com",
    "defra-ac": "stroller49@gmail.com",
    "metropolitan-police-ac": "alison.lapper@tiscali.co.uk",
    "michelles-running-group": "Clubsecretary@michellesrunninggroup.co.uk",
    "slgr": "qprchelle@hotmail.com",
    "carlisle-aspatria-ac": "julievi@btinternet.com",
    "maryport-csc": "senhousett@gmail.com",
    "pendle-athletic-club": "christine.chorlton@outlook.com",
    "running-head-first": "Leon-kearney93trfc@hotmail.co.uk",
    "stride-running-club": "davidhowlett1987@icloud.com",
    "tyne-and-wear-fire-running-section": "brendanmcmillan@yahoo.co.uk",
    "uts-running-club": "richard.latten@hotmail.co.uk",
    "vector-racing": "glfrost83@gmail.com",
    "dsfrs-running-club": "jtown@dsfire.gov.uk",
    "ipswich-phoenix-running-club": "Gavin.Horrex1@hotmail.co.uk",
    "mile-high": "beads@hotmail.co.uk",
    "olympia-athletics": "carlamholcombe@hotmail.com",
    "seafront-shufflers": "debbie.summers143@yahoo.co.uk",
    "seven-ten-ac": "colettendunne@yahoo.co.uk"
  };
  for (const [slug, email] of Object.entries(batch111Emails)) {
    const club = bySlug.get(slug);
    const contact = club.contacts.find(c => c.email === email);
    assert.ok(contact, slug);
    assert.equal(contact.checked_at, "2026-10-18");
    assert.match(contact.role, /ECCA 2026–2027 handbook, page/);
    assert.equal(club.contacts.length, slug === "run-middlewich" ? 2 : 1);
    assert.equal(club.checked_at, "2026-10-13");
    assert.equal(clubProfiles[slug], undefined);
  }
  assert.equal(bySlug.get("run-middlewich").contacts[0].email, "runmiddlewich@gmail.com");
  assert.equal(bySlug.get("run-middlewich").contacts[0].checked_at, "2026-10-17");
  // Batch 110: source-specific contacts and seasonal training, not inferred origins.
  const batch110Emails = {
    "michelin-running-club": "kenny.jay@hotmail.co.uk",
    "runwednesdays": "cburbage@btinternet.com",
    "horsham-run-fit": "simonh@tkb.co.uk",
    "ravens-school-runners": "robert_the_bruce77@yahoo.co.uk",
    "rising-brook-runners": "louisehobson755@gmail.com",
    "northants-police-athletic-section": "madeleine.moutrie@btinternet.com",
    "helpston-harriers-ac": "paul@lunnfamily.com",
    "independent-intelligent-fitness": "memmett57@btinternet.com",
    "riverside-harriers": "davee.oughton@gmail.com",
    "qbe-running-club": "julia.semple@uk.qbe.com",
  };
  for (const [slug, email] of Object.entries(batch110Emails)) {
    const club = bySlug.get(slug);
    assert.equal(club.contacts.length, 1);
    assert.equal(club.contacts[0].email, email);
    assert.equal(club.contacts[0].checked_at, "2026-10-18");
    assert.equal(club.checked_at, "2026-10-13");
    assert.equal(club.country, "England");
    assert.ok(!club.contacts.some(c => c.phone));
    if (!["michelin-running-club", "runwednesdays"].includes(slug)) assert.equal(clubProfiles[slug], undefined);
  }
  assert.equal(bySlug.get("michelin-running-club").name, "Michelin Running Club");
  assert.equal(bySlug.get("michelin-running-club").address_kind, "directory");
  assert.equal(bySlug.get("michelin-running-club").socials.length, 2);
  assert.equal(clubProfiles["michelin-running-club"].founded_year, undefined);
  assert.equal(clubProfiles["runwednesdays"].founded_year, undefined);
  assert.equal(bySlug.get("runwednesdays").address_kind, "training");
  assert.equal(bySlug.get("runwednesdays").adult_only, false);
  assert.equal(bySlug.get("helpston-harriers-ac").address, "");
  assert.equal(bySlug.get("rising-brook-runners").socials[0].url, "https://www.facebook.com/groups/rbrunners");
  assert.notEqual(bySlug.get("ravens-school-runners").contacts[0].email, "alexandra.anderson1972@gmail.com");
  // Batch 109: programme origins and source-specific contacts, without venue inference.
  const wellness = bySlug.get("wellness-warriors-on-the-run");
  assert.equal(clubProfiles[wellness.slug].founded_year, 2024);
  assert.equal(clubProfiles[wellness.slug].notable_members.length, 2);
  assert.equal(wellness.adult_only, true);
  assert.equal(wellness.address_kind, "directory");
  assert.equal(wellness.checked_at, "2026-10-13");
  assert.equal(wellness.country, "England");
  assert.equal(wellness.contacts[0].email, "charmain.clayton@bnu.ac.uk");
  assert.equal(wellness.socials[0].url, "https://www.instagram.com/wellnesswarriorsontherun/");
  assert.ok(!wellness.contacts.some(c => c.phone));
  for (const [slug, email] of Object.entries({
    "evesham-vale-running-club": "nawrocka.kk@gmail.com",
    "hatton-darts": "petestevens00@gmail.com",
    "meads-runners": "jweller78@googlemail.com",
    "mels-milers-jogging-club": "williams.ann@btinternet.com",
    "west-yorkshire-police-harriers": "mheathermitchell@btinternet.com",
    "wharfedale-harriers": "sam.green492@gmail.com",
    "winter-hill-runners": "donnakelsall1979@yahoo.co.uk",
  })) {
    const club = bySlug.get(slug);
    assert.equal(club.contacts.length, 1);
    assert.equal(club.contacts[0].email, email);
    assert.equal(club.contacts[0].checked_at, "2026-10-18");
    assert.match(club.contacts[0].role, /ECCA 2026–2027 handbook/);
    assert.equal(club.checked_at, "2026-10-13");
    const addressUnknown = ["west-yorkshire-police-harriers", "winter-hill-runners"].includes(slug);
    assert.equal(club.address_kind, addressUnknown ? undefined : "directory");
    if (addressUnknown) assert.equal(club.address, "");
    assert.equal(clubProfiles[slug], undefined);
  }
  // Batch 108: verified venue classification, dated origins and placeholder exclusion.
  for (const slug of ["the-hawcs", "westside-runnas-uk", "heald-green-runners", "lifts-and-sprints-athletics-academy", "ts-harriers"]) {
    assert.equal(bySlug.get(slug).country, "England");
    assert.equal(bySlug.get(slug).checked_at, "2026-10-13");
    assert.equal(bySlug.get(slug).address_kind, slug === "lifts-and-sprints-athletics-academy" ? "training" : "directory");
    assert.ok(clubProfiles[slug].biography.length >= 3);
  }
  assert.equal(clubProfiles["the-hawcs"].founded_year, 2013);
  assert.equal(clubProfiles["lifts-and-sprints-athletics-academy"].founded_year, 2018);
  assert.equal(clubProfiles["ts-harriers"].founded_year, 2020);
  assert.equal(clubProfiles["westside-runnas-uk"].founded_year, undefined);
  assert.equal(clubProfiles["heald-green-runners"].founded_year, undefined);
  assert.equal(bySlug.get("westside-runnas-uk").adult_only, true);
  assert.equal(bySlug.get("ts-harriers").contacts[0].email, "tsharriers@gmail.com");
  assert.equal(bySlug.get("the-hawcs").contacts.length, 2);
  assert.equal(bySlug.get("lifts-and-sprints-athletics-academy").contacts.filter((c) => c.phone).length, 1);
  assert.ok(!JSON.stringify(bySlug.get("ts-harriers").contacts).includes("example.com"));
  // Batch 107: current eligibility is distinct from historical activity and event origins.
  assert.equal(clubProfiles["clanfield-joggers"].founded_year, undefined);
  assert.equal(bySlug.get("clanfield-joggers").address_kind, "directory");
  assert.equal(bySlug.get("clanfield-joggers").contacts.length, 0);
  const bailieboro = bySlug.get("athletics-ireland-bailieboro-a-c");
  assert.equal(bailieboro.city, "Bailieborough");
  assert.equal(bailieboro.country, "Ireland");
  assert.equal(bailieboro.adult_only, true);
  assert.equal(bailieboro.address_kind, "training");
  assert.equal(bailieboro.checked_at, "2026-10-17");
  assert.equal(bailieboro.contacts.length, 1);
  assert.equal(bailieboro.contacts[0].email, "gmeehan@eircom.net");
  assert.equal(bailieboro.contacts[0].checked_at, "2026-10-17");
  assert.equal(clubProfiles[bailieboro.slug].founded_year, undefined);
  assert.match(clubProfiles[bailieboro.slug].notable_members[0].detail, /2014–2015/);
  const fordy = bySlug.get("fordy-runs-running-club");
  assert.equal(fordy.contacts.length, 2);
  assert.ok(fordy.contacts.some((c) => c.email === "club@fordyruns.com"));
  assert.ok(fordy.contacts.some((c) => c.email === "hello@fordyruns.com"));
  assert.equal(fordy.socials.length, 7);
  assert.equal(clubProfiles[fordy.slug].scope, "national");
  assert.match(clubProfiles[fordy.slug].biography[0], /affiliation is a separate/);
  // Batch 106: supported disciplines, dated history and unresolved founding years.
  assert.deepEqual(bySlug.get("allstride-collective-running-club").sports, ["Running"]);
  assert.equal(bySlug.get("allstride-collective-running-club").socials.length, 3);
  assert.equal(bySlug.get("allstride-collective-running-club").contacts.length, 0);
  assert.equal(clubProfiles["allstride-collective-running-club"].founded_year, undefined);
  assert.equal(bySlug.get("robin-park-runners").socials[0].url, "https://www.facebook.com/rprwigan/");
  assert.equal(bySlug.get("robin-park-runners").contacts.length, 0);
  assert.equal(clubProfiles["robin-park-runners"].founded_year, undefined);
  assert.equal(clubProfiles["robin-park-runners"].notable_members[0].name, "Mark Harrison");
  assert.match(clubProfiles["winterton-running-club"].biography.join(" "), /historical proposal/);
  assert.equal(bySlug.get("winterton-running-club").contacts.length, 0);
  for (const slug of ["allstride-collective-running-club", "robin-park-runners", "winterton-running-club"]) {
    assert.equal(bySlug.get(slug).address_kind, "directory");
    assert.equal(bySlug.get(slug).country, "England");
    assert.equal(bySlug.get(slug).checked_at, "2026-10-13");
  }
  // Batch 103: dated history, current publisher attribution and distinct identities.
  assert.equal(clubProfiles["ravens-city-of-london-running-club"].founded_year, 1997);
  assert.equal(bySlug.get("ravens-city-of-london-running-club").city, "London");
  assert.equal(bySlug.get("ravens-city-of-london-running-club").contacts.length, 0);
  assert.equal(clubProfiles["ravens-city-of-london-running-club"].notable_members[0].name, "Phil Hernon");
  assert.notEqual(bySlug.get("ravens-school-runners").slug, bySlug.get("ravens-city-of-london-running-club").slug);
  assert.equal(clubProfiles["heyford-aardvarks-running-club"].founded_year, undefined);
  assert.equal(bySlug.get("heyford-aardvarks-running-club").address_kind, "directory");
  assert.match(clubProfiles["heyford-aardvarks-running-club"].biography.join(" "), /historical account, not a current timetable/);
  assert.equal(bySlug.get("heyford-aardvarks-running-club").contacts[0].email, "heyfordaardvarks@gmail.com");
  assert.equal(bySlug.get("dunstable-lions-running-club").address_kind, "training");
  assert.equal(bySlug.get("dunstable-lions-running-club").website, "https://www.dunstablelionsrc.co.uk/");
  assert.equal(clubProfiles["dunstable-lions-running-club"].founded_year, undefined);
  assert.equal(bySlug.get("sunlight-runners").contacts[0].phone, "01824 790749");
  assert.match(bySlug.get("sunlight-runners").contacts[0].role, /undated listing/);
  assert.ok(!bySlug.get("sunlight-runners").notable_members?.length);
  // Batch 101: real enquiry routes, dated origins and no invented training base.
  assert.equal(clubProfiles["whitby-running-club"].founded_year, 2019);
  assert.equal(bySlug.get("whitby-running-club").website, "https://www.whitbyrunningclub.co.uk/");
  assert.equal(bySlug.get("whitby-running-club").contacts[0].email, "whitbyrunningclub@gmail.com");
  assert.equal(bySlug.get("whitby-running-club").socials.length, 2);
  assert.ok(!bySlug.get("whitby-running-club").contacts.some(c => /example|merch|northyorks/.test(c.email ?? "")));
  assert.match(clubProfiles["whitby-running-club"].biography.join(" "), /already under way/);
  assert.equal(clubProfiles["st-marys-calne-sports-centre-running-and-triathlon"].founded_year, 2007);
  assert.match(clubProfiles["st-marys-calne-sports-centre-running-and-triathlon"].biography.join(" "), /2015/);
  assert.equal(clubProfiles["just-run-community"].founded_year, undefined);
  assert.equal(clubProfiles["littleborough-runners"].founded_year, undefined);
  assert.equal(bySlug.get("littleborough-runners").address_kind, "training");
  assert.equal(bySlug.get("just-run-community").address_kind, "directory");
  assert.ok(bySlug.get("just-run-community").contacts.some(c => c.email === "membership@justruncommunity.co.uk"));
  assert.equal(bySlug.get("just-run-community").socials.filter(s => s.platform === "Instagram").length, 1);
  assert.equal(bySlug.get("littleborough-runners").socials.filter(s => s.platform === "Facebook").length, 2);
  assert.equal(bySlug.get("runfit-chorley").contact_url, "https://clubspark.englandathletics.org/RunFitChorley/Contact");
  assert.equal(clubProfiles["runfit-chorley"].founded_year, undefined);
  assert.equal(bySlug.get("runfit-chorley").address_kind, "directory");
  assert.equal(bySlug.get("whitby-running-club").address_kind, "directory");
  assert.equal(bySlug.get("collins-cycle-centre-triathlon-club").city, "Thurles");
  assert.equal(bySlug.get("collins-cycle-centre-triathlon-club").country, "Ireland");
  assert.equal(bySlug.get("collins-cycle-centre-triathlon-club").contacts.length, 1);
  assert.equal(bySlug.get("collins-cycle-centre-triathlon-club").contacts[0].checked_at, "2026-10-17");
  assert.equal(clubProfiles["collins-cycle-centre-triathlon-club"].founded_year, undefined);
  assert.match(clubProfiles["collins-cycle-centre-triathlon-club"].biography.join(" "), /not a final placing/);
  // Batch 100: volunteer origins, seasonal venues and distinct club identities.
  assert.equal(clubProfiles["kids-run-redditch"].founded_year, 2023);
  assert.equal(bySlug.get("kids-run-redditch").address_kind, "training");
  assert.equal(bySlug.get("kids-run-redditch").socials.length, 2);
  assert.ok(!bySlug.get("kids-run-redditch").socials.some(s => s.url.includes("/share/")));
  assert.equal(clubProfiles["south-cambridge-striders"].founded_year, 2024);
  assert.equal(bySlug.get("south-cambridge-striders").contacts[0].email, "enquiries@southcambridgestriders.org.uk");
  assert.match(clubProfiles["south-cambridge-striders"].location_note, /autumn\/winter/);
  assert.equal(clubProfiles["freck-and-warton-running-club"].founded_year, 2018);
  assert.equal(bySlug.get("freck-and-warton-running-club").city, "Warton");
  assert.equal(bySlug.get("freck-and-warton-running-club").address_kind, "training");
  assert.equal(bySlug.get("freck-and-warton-running-club").website, "https://fwrc.co.uk/");
  assert.equal(clubProfiles["carlisle-tri-club"].founded_year, 2009);
  assert.equal(bySlug.get("carlisle-tri-club").address_kind, "directory");
  assert.ok(bySlug.get("carlisle-tri-club").sports.includes("Triathlon"));
  assert.ok(!bySlug.get("carlisle-tri-club").contacts.some(c => /wellbeinghub|Hhods/i.test(c.email ?? "")));
  assert.equal(bySlug.get("ventoux-triathlon-club").country, "Northern Ireland");
  assert.equal(bySlug.get("ventoux-triathlon-club").city, "Camlough");
  assert.equal(clubProfiles["ventoux-triathlon-club"].founded_year, undefined);
  assert.match(clubProfiles["ventoux-triathlon-club"].biography.join(" "), /rather than a final position/);
  // Batch 99: physical academy, separate swim venue, coaching versus club identity.
  const bks = bySlug.get("bradford-keighley-and-skipton-disability-athletics-bks");
  assert.equal(bks.city, "Keighley");
  assert.equal(bks.address_kind, "training");
  assert.equal(bks.postcode, "BD20 6EB");
  assert.deepEqual(bks.sports, ["Athletics", "Swimming"]);
  assert.equal(bks.contacts[0].email, "bksda@aol.com");
  assert.equal(bks.socials.length, 2);
  assert.equal(bySlug.get("aspire-athletics").virtual, false);
  assert.equal(bySlug.get("aspire-athletics").postcode, "SM5 1SL");
  assert.equal(bySlug.get("aspire-athletics").address_kind, "training");
  assert.equal(bySlug.get("aspire-athletics").contacts[0].email, "admin@aspiretogreatness.co.uk");
  assert.equal(bySlug.get("new-levels-run-club").virtual, true);
  assert.equal(bySlug.get("new-levels-run-club").address_kind, "directory");
  assert.match(clubProfiles["new-levels-run-club"].biography.join(" "), /does not establish that the affiliated club itself has changed name/);
  assert.equal(bySlug.get("hell-yeah-triathlon-club").city, "Carrickfinn");
  assert.equal(bySlug.get("hell-yeah-triathlon-club").country, "Ireland");
  assert.equal(bySlug.get("hell-yeah-triathlon-club").contacts[0].checked_at, "2026-10-17");
  assert.match(clubProfiles["hell-yeah-triathlon-club"].biography.join(" "), /rather than a final placing/);
  for (const slug of [bks.slug, "aspire-athletics", "new-levels-run-club", "hell-yeah-triathlon-club"]) {
    assert.equal(clubProfiles[slug].founded_year, undefined);
    assert.notEqual(clubProfiles[slug].scope, "global");
  }
  // Batch 98: predecessor origins, community versus club, and role-specific contacts.
  assert.equal(clubProfiles["london-hammer-school"].founded_year, 2024);
  assert.equal(bySlug.get("london-hammer-school").address_kind, "training");
  assert.equal(bySlug.get("london-hammer-school").postcode, "N9 0AR");
  assert.equal(bySlug.get("london-hammer-school").contacts[0].email, "londonhammerschool@gmail.com");
  for (const slug of ["huub-performance-project", "city-of-stoke-ac", "run-mummy-run-crc"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("huub-performance-project").address_kind, "directory");
  assert.match(bySlug.get("huub-performance-project").contacts[0].role, /support and sponsorship/);
  assert.equal(bySlug.get("city-of-stoke-ac").contact_url, "https://stokeac.clubforce.com/products/membership");
  assert.equal(bySlug.get("city-of-stoke-ac").address_kind, "training");
  assert.equal(bySlug.get("city-of-stoke-ac").socials.length, 2);
  assert.ok(!bySlug.get("city-of-stoke-ac").socials.some(s => /cityofstokefc/.test(s.url)));
  assert.equal(bySlug.get("run-mummy-run-crc").virtual, true);
  assert.equal(bySlug.get("run-mummy-run-crc").city, "");
  assert.equal(bySlug.get("run-mummy-run-crc").country, "England");
  assert.notEqual(clubProfiles["run-mummy-run-crc"].scope, "global");
  assert.match(clubProfiles["run-mummy-run-crc"].biography.join(" "), /should not be mistaken/);
  // Batch 96: distinguish race participation, membership and dated facility evidence.
  for (const slug of ["pendle-trail-running-club", "regis-road-runners", "fylde-coast-runners", "tynedale-harriers-and-ac"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("regis-road-runners").city, "Bognor Regis");
  assert.equal(bySlug.get("regis-road-runners").postcode, "");
  assert.equal(bySlug.get("regis-road-runners").address_kind, "training");
  assert.equal(bySlug.get("regis-road-runners").socials.find(s => s.platform === "Facebook").checked_at, "2026-10-13");
  assert.ok(bySlug.get("regis-road-runners").socials.some(s => s.url === "https://www.strava.com/clubs/rotaryroadrunners"));
  assert.equal(bySlug.get("pendle-trail-running-club").contacts[0].email, "pendletr@gmail.com");
  assert.equal(bySlug.get("pendle-trail-running-club").socials[0].checked_at, "2026-10-13");
  assert.equal(bySlug.get("fylde-coast-runners").website, "https://www.fcrentry.com/");
  assert.equal(bySlug.get("fylde-coast-runners").address_kind, "correspondence");
  assert.equal(bySlug.get("fylde-coast-runners").adult_only, true);
  assert.match(clubProfiles["fylde-coast-runners"].biography.join(" "), /not a verified weekly training/);
  assert.equal(bySlug.get("tynedale-harriers-and-ac").contacts.length, 0);
  assert.match(clubProfiles["tynedale-harriers-and-ac"].notable_members[0].detail, /Historical association only/);
  // Batch 95: live capacity, platform migration and dated roles.
  assert.equal(clubProfiles["billericay-striders"].founded_year, 1986);
  assert.equal(bySlug.get("billericay-striders").address_kind, "directory");
  assert.equal(bySlug.get("billericay-striders").socials.find(s => s.platform === "Facebook").checked_at, "2026-10-13");
  assert.equal(clubProfiles["southampton-triathlon-club"].founded_year, 1987);
  assert.equal(bySlug.get("southampton-triathlon-club").address_kind, "training");
  assert.equal(bySlug.get("southampton-triathlon-club").adult_only, false);
  assert.match(clubProfiles["southampton-triathlon-club"].biography.join(" "), /waiting lists/);
  assert.match(bySlug.get("coalville-triathlon-club").contact_url, /holdsport/);
  assert.ok(bySlug.get("coalville-triathlon-club").contacts.some(c => c.phone === "07519 876076"));
  assert.ok(!bySlug.get("coalville-triathlon-club").contacts.some(c => c.phone === "07971600345" || c.email === "theteam@coalvilletriathlon.org"));
  for (const slug of ["coalville-triathlon-club", "brighton-and-hove-womens-running-club", "crystal-peaks-runners"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("brighton-and-hove-womens-running-club").contacts.length, 0);
  assert.match(clubProfiles["brighton-and-hove-womens-running-club"].notable_members[1].detail, /not a current-role claim/);
  assert.equal(bySlug.get("crystal-peaks-runners").website, "https://www.crystalpeaks-runners.com/");
  assert.equal(bySlug.get("crystal-peaks-runners").socials.length, 2);
  assert.ok(bySlug.get("crystal-peaks-runners").socials.every(s => new URL(s.url).hostname === "www.facebook.com"));
  assert.match(clubProfiles["crystal-peaks-runners"].biography.join(" "), /does not give a year/);
  // Batch 94: distinguish shared venues, historical roles and online products.
  for (const slug of ["arete-run-club", "tetbury-dolphins-running-club", "pudsey-runners", "st-marys-richmond-ac", "the-running-hub"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("arete-run-club").website, "https://areterunclub.com/");
  assert.equal(bySlug.get("arete-run-club").address_kind, "training");
  assert.equal(bySlug.get("arete-run-club").contacts.length, 0);
  assert.equal(bySlug.get("pudsey-runners").postcode, "LS28 8JQ");
  assert.equal(bySlug.get("pudsey-runners").address_kind, "clubhouse");
  assert.equal(bySlug.get("pudsey-runners").contacts.length, 0);
  assert.match(clubProfiles["pudsey-runners"].biography.join(" "), /1910 foundation should not/);
  assert.equal(bySlug.get("tetbury-dolphins-running-club").address_kind, "directory");
  assert.match(clubProfiles["tetbury-dolphins-running-club"].notable_members[0].detail, /not a current-role claim/);
  assert.equal(bySlug.get("st-marys-richmond-ac").address_kind, "training");
  assert.ok(bySlug.get("st-marys-richmond-ac").contacts.some(c => c.email === "secretary@smrac.org.uk"));
  assert.equal(bySlug.get("the-running-hub").virtual, true);
  assert.notEqual(clubProfiles["the-running-hub"].scope, "global");
  assert.equal(bySlug.get("the-running-hub").city, "");
  assert.equal(bySlug.get("the-running-hub").socials[0].checked_at, "2026-10-13");
  // Batch 92: preserve source conflicts, venue distinctions and historical identities.
  assert.equal(clubProfiles["beaumont-rc"].founded_year, 1984);
  assert.equal(bySlug.get("beaumont-rc").contact_url, "https://www.beaumontrc.co.uk/membership/");
  assert.equal(bySlug.get("beaumont-rc").address_kind, "directory");
  assert.equal(bySlug.get("walney-wind-cheetahs").address, "Park Vale, Walney Island, Barrow-in-Furness");
  assert.equal(bySlug.get("walney-wind-cheetahs").postcode, "");
  assert.equal(bySlug.get("walney-wind-cheetahs").address_kind, "training");
  assert.equal(bySlug.get("walney-wind-cheetahs").socials[0].checked_at, "2026-10-13");
  assert.match(clubProfiles["walney-wind-cheetahs"].contact_note, /conflict/);
  assert.equal(bySlug.get("warminster-running-club").address_kind, "training");
  for (const slug of ["walney-wind-cheetahs", "warminster-running-club", "boalloy-running-club", "southern-counties-veterans-ac"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  for (const slug of ["beaumont-rc", "boalloy-running-club", "southern-counties-veterans-ac"]) assert.equal(bySlug.get(slug).contacts.length, 0);
  assert.match(clubProfiles["boalloy-running-club"].contact_note, /phone variants conflict/);
  assert.equal(bySlug.get("southern-counties-veterans-ac").city, "");
  assert.equal(bySlug.get("southern-counties-veterans-ac").country, "England");
  assert.notEqual(clubProfiles["southern-counties-veterans-ac"].scope, "global");
  assert.match(clubProfiles["southern-counties-veterans-ac"].notable_members[0].detail, /not his Olympic-medallist father/);
  // Batch 91: primary accounts, dated membership and event-location safeguards.
  assert.equal(clubProfiles["jcb-lakeside-club"].founded_year, undefined);
  assert.equal(bySlug.get("jcb-lakeside-club").contacts.length, 0);
  assert.equal(bySlug.get("worcester-students-union-athletic-club").address_kind, "training");
  assert.equal(bySlug.get("worcester-students-union-athletic-club").contacts[0].email, "olil1_24@uni.worc.ac.uk");
  assert.equal(bySlug.get("worcester-students-union-athletic-club").socials.length, 3);
  for (const slug of ["db-triathlon-club", "milocarian-ac", "os-runners"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("ventoux-triathlon-club").city, "Camlough");
  assert.equal(bySlug.get("ventoux-triathlon-club").country, "Northern Ireland");
  assert.equal(bySlug.get("ventoux-triathlon-club").location_precision, "area-only");
  assert.equal(bySlug.get("ventoux-triathlon-club").contacts[0].checked_at, "2026-10-17");
  assert.equal(bySlug.get("ventoux-triathlon-club").contacts[0].source_url, "https://www.triathlonireland.com/Get-Involved/Find-a-Club/");
  assert.equal(bySlug.get("db-triathlon-club").contacts[0].checked_at, "2026-10-13");
  assert.match(clubProfiles["db-triathlon-club"].location_note, /2023 event venue/);
  assert.match(clubProfiles["milocarian-ac"].biography.join(" "), /military site/);
  assert.match(clubProfiles["os-runners"].notable_members.find(m => m.name === "Gus McKechnie").connection, /guest runner/);
  for (const slug of ["milocarian-ac", "os-runners"]) assert.equal(bySlug.get(slug).contacts.length, 0);
  // Batch 90: dated associations, supplier exclusion and distinct training venues.
  assert.equal(clubProfiles["wimbledon-windmilers"].founded_year, 1980);
  for (const slug of ["victory-ac", "zoom-tri-club-bournemouth", "chesterfield-tri-club"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("victory-ac").address_kind, "training");
  assert.equal(bySlug.get("victory-ac").contact_url, "https://victoryac.org.uk/contact");
  assert.equal(bySlug.get("victory-ac").contacts.length, 0);
  assert.equal(bySlug.get("wimbledon-windmilers").city, "Wimbledon");
  assert.equal(bySlug.get("chesterfield-tri-club").city, "Chesterfield");
  assert.match(clubProfiles["zoom-tri-club-bournemouth"].contact_note, /closure is not inferred/);
  assert.match(clubProfiles["chesterfield-tri-club"].biography.join(" "), /7 September 2026/);
  for (const slug of ["zoom-tri-club-bournemouth", "chesterfield-tri-club"]) assert.equal(bySlug.get(slug).contacts.length, 0);
  // Batch 89: capacity restrictions, dated volunteer associations and supplier exclusion.
  assert.equal(clubProfiles["vale-of-aylesbury-ac"].founded_year, 1893);
  assert.equal(clubProfiles["southport-waterloo-ac"].founded_year, 1978);
  assert.equal(clubProfiles["redditch-stars"].founded_year, 2015);
  for (const slug of ["burton-ac", "hyndburn-ac"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.match(clubProfiles["vale-of-aylesbury-ac"].biography.join(" "), /does not operate a waiting list/);
  assert.match(clubProfiles["vale-of-aylesbury-ac"].biography.join(" "), /full except endurance/);
  assert.equal(bySlug.get("vale-of-aylesbury-ac").postcode, "HP21 9PP");
  assert.equal(bySlug.get("southport-waterloo-ac").city, "Litherland");
  for (const slug of ["vale-of-aylesbury-ac", "burton-ac", "southport-waterloo-ac", "hyndburn-ac"]) assert.equal(bySlug.get(slug).address_kind, "training");
  assert.equal(bySlug.get("redditch-stars").address_kind, "directory");
  assert.equal(bySlug.get("redditch-stars").contacts.length, 0);
  assert.equal(bySlug.get("hyndburn-ac").contacts.length, 0);
  assert.equal(bySlug.get("burton-ac").contacts.length, 0);
  assert.ok(bySlug.get("southport-waterloo-ac").contacts.some(c => c.email === "swacsecretary@hotmail.co.uk" && c.phone === "07940 333 040"));
  assert.match(clubProfiles["hyndburn-ac"].biography.join(" "), /February 2017 publication date/);
  assert.match(clubProfiles["southport-waterloo-ac"].biography.join(" "), /April start without a year/);
  // Batch 88: predecessor dates, separate programmes and non-postal venues.
  assert.equal(clubProfiles["striders-of-croydon"].founded_year, 1982);
  assert.equal(clubProfiles["vale-royal-ac"].founded_year, 1994);
  assert.equal(clubProfiles["widnes-running-club"].founded_year, 2016);
  assert.equal(clubProfiles["windsor-slough-eton-and-hounslow-ac"].founded_year, 1948);
  for (const slug of ["rothwell-harriers-and-ac", "team-kennet-triathlon-and-ac"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("rothwell-harriers-and-ac").city, "Rothwell");
  assert.equal(bySlug.get("rothwell-harriers-and-ac").address, "");
  assert.equal(bySlug.get("vale-royal-ac").postcode, "CW7 2PT");
  assert.equal(bySlug.get("widnes-running-club").postcode, "WA8 7DW");
  assert.equal(bySlug.get("windsor-slough-eton-and-hounslow-ac").city, "Eton");
  assert.equal(bySlug.get("striders-of-croydon").address_kind, "clubhouse");
  assert.deepEqual(bySlug.get("striders-of-croydon").sports, ["Running", "Athletics"]);
  for (const slug of ["vale-royal-ac", "widnes-running-club", "team-kennet-triathlon-and-ac", "windsor-slough-eton-and-hounslow-ac"]) assert.equal(bySlug.get(slug).address_kind, "training");
  assert.match(clubProfiles["vale-royal-ac"].location_note, /not a postal address/);
  assert.match(clubProfiles["team-kennet-triathlon-and-ac"].biography.join(" "), /once a place has been offered/);
  assert.match(clubProfiles["widnes-running-club"].biography.join(" "), /without giving a date/);
  assert.ok(bySlug.get("windsor-slough-eton-and-hounslow-ac").contacts.some(c => c.email === "membership-enquiries@wseh.co.uk"));
  assert.equal(bySlug.get("team-kennet-triathlon-and-ac").contacts.filter(c => c.email).length, 0);
  // Batch 87: recovered training sources, age eligibility and historical associations.
  assert.equal(clubProfiles["sheffield-rc"].founded_year, 2006);
  assert.equal(clubProfiles["kingswood-triathlon-club"].founded_year, 1986);
  assert.equal(clubProfiles["thanet-ac"].founded_year, 2010);
  for (const slug of ["uttoxeter-road-runners", "west-4-harriers"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("uttoxeter-road-runners").adult_only, false);
  assert.equal(bySlug.get("uttoxeter-road-runners").address, "");
  assert.equal(bySlug.get("kingswood-triathlon-club").city, "Kingswood");
  assert.equal(bySlug.get("kingswood-triathlon-club").postcode, "");
  assert.equal(bySlug.get("sheffield-rc").address_kind, "training");
  assert.equal(bySlug.get("thanet-ac").address_kind, "training");
  assert.equal(bySlug.get("thanet-ac").postcode, "");
  assert.equal(bySlug.get("west-4-harriers").city, "Chiswick");
  assert.ok(bySlug.get("thanet-ac").contacts.some(c => c.email === "thanetathleticsclub@gmail.com"));
  assert.ok(bySlug.get("uttoxeter-road-runners").contacts.some(c => c.email === "membership@uttoxeterroadrunners.club"));
  assert.match(clubProfiles["kingswood-triathlon-club"].biography.join(" "), /not a verified October timetable/);
  assert.match(clubProfiles["west-4-harriers"].biography.join(" "), /exact founding year is left open/);
  // Batch 86: distinguish predecessor events, newer intake rules and stale schedules.
  assert.equal(clubProfiles["stock-exchange-ac"].founded_year, 1910);
  assert.equal(clubProfiles["formula-one-circuit-crew"].founded_year, 1998);
  assert.equal(clubProfiles["east-grinstead-and-district-ac"].founded_year, 1978);
  assert.equal(clubProfiles["harling-athletic-club"].founded_year, 2014);
  for (const slug of ["hunwick-harriers", "blythe-bridge-running-club"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.deepEqual(bySlug.get("east-grinstead-and-district-ac").sports, ["Running", "Athletics"]);
  assert.match(clubProfiles["east-grinstead-and-district-ac"].biography.join(" "), /school year 5/);
  assert.match(clubProfiles["harling-athletic-club"].biography.join(" "), /will not take place in 2026/);
  assert.equal(bySlug.get("harling-athletic-club").postcode, "NR16 2NB");
  assert.equal(bySlug.get("harling-athletic-club").address_kind, "training");
  assert.ok(bySlug.get("harling-athletic-club").contacts.some(c => c.email === "harlingathletics@gmail.com"));
  assert.equal(bySlug.get("blythe-bridge-running-club").county, "Staffordshire");
  assert.equal(bySlug.get("stock-exchange-ac").city, "London");
  assert.equal(bySlug.get("hunwick-harriers").city, "Hunwick");
  assert.equal(bySlug.get("hunwick-harriers").address, "");
  assert.equal(bySlug.get("hunwick-harriers").adult_only, true);
  assert.equal(bySlug.get("collins-cycle-centre-triathlon-club").city, "Thurles");
  assert.equal(bySlug.get("db-triathlon-club").city, "Drung");
  assert.equal(bySlug.get("formula-one-circuit-crew").contacts.length, 0);
  assert.equal(bySlug.get("stock-exchange-ac").contacts.length, 0);
  // Batch 85: real venues, qualified historical accounts and unsafe-site exclusion.
  assert.equal(clubProfiles["grimsby-harriers-and-ac"].founded_year, 1906);
  assert.equal(clubProfiles["white-cliffs-athletics-and-running-club"].founded_year, 2023);
  assert.equal(clubProfiles["shildon-running-and-ac"].founded_year, 1986);
  for (const slug of ["ventura-runners", "the-outrunners", "athletics-ni-west-belfast-coolers"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("liverpool-harriers-and-ac").website, "");
  assert.equal(bySlug.get("shepshed-running-club").website, "");
  assert.equal(bySlug.get("ventura-runners").country, "England");
  assert.equal(bySlug.get("the-outrunners").adult_only, true);
  assert.equal(bySlug.get("athletics-ni-west-belfast-coolers").country, "Northern Ireland");
  for (const slug of ["ventura-runners", "grimsby-harriers-and-ac", "shildon-running-and-ac", "the-outrunners"]) assert.equal(bySlug.get(slug).address_kind, "training");
  assert.ok(bySlug.get("ventura-runners").contacts.some(c => c.email === "venturarunnersuk@gmail.com" && c.phone === "07470435355"));
  assert.ok(bySlug.get("grimsby-harriers-and-ac").contacts.some(c => c.email === "administration@grimsbyharriers-athletics.org.uk"));
  assert.ok(bySlug.get("the-outrunners").contacts.some(c => c.email === "info@theoutrunners.co.uk"));
  assert.equal(bySlug.get("athletics-ni-west-belfast-coolers").contacts.length, 1);
  assert.ok(bySlug.get("athletics-ni-west-belfast-coolers").contacts.some(c => c.email === "westbelfastcoolers@hotmail.com" && c.checked_at === "2026-10-13"));
  assert.match(clubProfiles["grimsby-harriers-and-ac"].location_note, /not sent there/);
  assert.match(clubProfiles["the-outrunners"].location_note, /differs/);
  assert.match(clubProfiles["white-cliffs-athletics-and-running-club"].biography.join(" "), /not today's/);
  assert.match(clubProfiles["athletics-ni-west-belfast-coolers"].biography.join(" "), /not a current booking offer/);
  // Batch 84: historical foundations, recovered sites and evidence-backed venues.
  assert.equal(clubProfiles["tavistock-ac"].founded_year, 1985);
  assert.equal(clubProfiles["stone-master-marathoners"].founded_year, 1978);
  assert.equal(clubProfiles["wallsend-harriers-and-ac"].founded_year, 1920);
  assert.match(clubProfiles["wallsend-harriers-and-ac"].biography.join(" "), /revived club/);
  assert.equal(clubProfiles["watford-joggers"].founded_year, 1976);
  assert.equal(clubProfiles["wilmslow-running-club"].founded_year, 1989);
  assert.equal(clubProfiles["higham-harriers"].founded_year, 2014);
  for (const slug of ["compton-harriers-rc", "northwich-running-club", "lymington-triathlon-club", "stowmarket-striders-rc", "rodillian-runners", "athletics-ireland-barrow-harriers-a-c"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("stone-master-marathoners").website, "https://www.stonemm.co.uk/");
  assert.equal(bySlug.get("higham-harriers").website, "https://www.highamharriers.com/");
  assert.equal(bySlug.get("northwich-running-club").city, "Northwich");
  assert.equal(bySlug.get("athletics-ireland-barrow-harriers-a-c").city, "Graiguenamanagh");
  assert.equal(bySlug.get("athletics-ireland-barrow-harriers-a-c").country, "Ireland");
  for (const slug of ["northwich-running-club", "higham-harriers", "athletics-ireland-barrow-harriers-a-c"]) assert.equal(bySlug.get(slug).address, "");
  assert.equal(bySlug.get("wallsend-harriers-and-ac").postcode, "NE28 7LQ");
  assert.equal(bySlug.get("rodillian-runners").postcode, "WF3 4EF");
  assert.match(clubProfiles["lymington-triathlon-club"].biography.join(" "), /March 2022/);
  assert.match(clubProfiles["stowmarket-striders-rc"].biography.join(" "), /waiting list/);
  assert.ok(bySlug.get("stowmarket-striders-rc").contacts.some(c => c.email === "juniors@stowmarketstriders.org.uk"));
  assert.equal(bySlug.get("northwich-running-club").contacts.length, 0);
  assert.equal(bySlug.get("lymington-triathlon-club").contacts.length, 0);
  // Batch 83: recovered domains, national schools scope and qualified old listings.
  assert.equal(clubProfiles["elvet-striders"].founded_year, 1985);
  assert.equal(clubProfiles["trafford-athletic-club"].founded_year, 1965);
  assert.equal(clubProfiles["torbay-aac"].founded_year, 1970);
  for (const slug of ["uckfield-runners", "quays-running-club", "romsey-road-runners", "athletics-ireland-ballyduff-a-c"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("uckfield-runners").website, "https://uckfieldrunners.co.uk/");
  assert.equal(bySlug.get("harleston-running-club").county, "Norfolk");
  assert.equal(bySlug.get("westbourne-r-c").city, "Bournemouth");
  for (const slug of ["quays-running-club", "tiverton-harriers", "westbourne-r-c", "torbay-aac"]) assert.equal(bySlug.get(slug).address, "");
  assert.equal(clubProfiles["welsh-athletics-welsh-schools-and-universities"].scope, "national");
  assert.equal(bySlug.get("welsh-athletics-welsh-schools-and-universities").country, "Wales");
  assert.match(clubProfiles["romsey-road-runners"].biography.join(" "), /dated arrangements, not a confirmed current weekly timetable/);
  assert.match(clubProfiles["trafford-athletic-club"].biography.join(" "), /waiting list/);
  assert.ok(bySlug.get("athletics-ireland-ballyduff-a-c").contacts.every(c => c.checked_at === "2026-10-13"));
  assert.ok(bySlug.get("uckfield-runners").socials.some(c => c.url === "https://www.facebook.com/UckfieldRunners"));
  assert.ok(bySlug.get("trafford-athletic-club").contacts.every(c => c.email !== "ian.salisbury@traffordac.co.uk"));
  // Batch 82: recovered venues, age eligibility and dated/future qualifications.
  assert.equal(clubProfiles["stadium-runners"].founded_year, 2005);
  assert.equal(clubProfiles["lytchett-manor-striders"].founded_year, 1989);
  assert.equal(clubProfiles["millom-striders"].founded_year, 2018);
  for (const slug of ["hillingdon-ac", "tadworth-ac", "greenwich-tritons-triathlon-club", "west-wight-road-runners"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.equal(bySlug.get("tadworth-ac").adult_only, false);
  assert.equal(bySlug.get("tadworth-ac").city, "Tadworth");
  for (const slug of ["tadworth-ac", "greenwich-tritons-triathlon-club"]) assert.equal(bySlug.get(slug).address, "");
  for (const slug of ["hillingdon-ac", "stadium-runners", "millom-striders", "lytchett-manor-striders"]) assert.equal(bySlug.get(slug).address_kind, "training");
  assert.match(clubProfiles["west-wight-road-runners"].biography.join(" "), /future organising partnership/);
  assert.match(clubProfiles["greenwich-tritons-triathlon-club"].biography.join(" "), /waiting list/);
  assert.match(clubProfiles["lytchett-manor-striders"].biography.join(" "), /2024–25/);
  assert.ok(bySlug.get("stadium-runners").contacts.some(c => c.email === "membership@stadiumrunners.co.uk"));
  assert.ok(bySlug.get("tadworth-ac").contacts.some(c => c.email === "hello@tadworthac.org.uk" && c.checked_at === "2026-10-13"));
  // Batch 81: dated source qualifications and non-training addresses remain explicit.
  assert.equal(clubProfiles["boxted-runners"].founded_year, 2017);
  assert.equal(bySlug.get("parbold-pink-panthers").city, "Parbold");
  assert.equal(bySlug.get("parbold-pink-panthers").address, "");
  assert.equal(bySlug.get("parbold-pink-panthers").postcode, "");
  assert.ok(bySlug.get("parbold-pink-panthers").contacts.some(c => c.email === "jane.warner29@gmail.com"));
  assert.equal(bySlug.get("new-forest-junior-ac").address_kind, "directory");
  assert.equal(bySlug.get("new-forest-junior-ac").county, "Hampshire");
  assert.equal(bySlug.get("new-ross-triathlon-club").country, "Ireland");
  assert.equal(bySlug.get("new-ross-triathlon-club").adult_only, true);
  assert.match(clubProfiles["new-ross-triathlon-club"].biography.join(" "), /placing is therefore provisional/);
  assert.ok(bySlug.get("new-ross-triathlon-club").contacts.some(c => c.email === "newrosstriathlonclub@hotmail.com" && c.checked_at === "2026-10-13"));
  assert.match(clubProfiles["bramley-breezers"].biography.join(" "), /not presented as a confirmed current timetable/);
  // Batch 80: recovered sources retain dated programmes and venue qualifications.
  assert.equal(clubProfiles["west-end-runners"].founded_year, 1984);
  assert.equal(clubProfiles["wheathampstead-warriors"].founded_year, 2016);
  assert.equal(clubProfiles["south-birmingham-striders"].founded_year, 2023);
  assert.equal(clubProfiles["south-kent-harriers"].founded_year, 1987);
  assert.equal(clubProfiles["heathfield-runners"].founded_year, 1985);
  for (const slug of ["leicester-walking-club", "seaton-athletic-club", "island-tc"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.match(clubProfiles["island-tc"].biography.join(" "), /not presented here as a final award/);
  assert.match(clubProfiles["south-birmingham-striders"].biography.join(" "), /2024–25/);
  assert.match(clubProfiles["wheathampstead-warriors"].biography.join(" "), /29 April 2025/);
  assert.match(clubProfiles["seaton-athletic-club"].biography.join(" "), /2013/);
  assert.equal(bySlug.get("island-tc").country, "Northern Ireland");
  assert.equal(bySlug.get("island-tc").city, "Coalisland");
  assert.equal(bySlug.get("wheathampstead-warriors").city, "Wheathampstead");
  assert.equal(bySlug.get("wheathampstead-warriors").adult_only, true);
  assert.equal(bySlug.get("south-birmingham-striders").adult_only, true);
  assert.equal(bySlug.get("heathfield-runners").address, "");
  assert.equal(bySlug.get("hermitage-harriers").address_kind, "training");
  assert.ok(!bySlug.get("hermitage-harriers").contacts.some(c => c.email?.endsWith("@connectmy.club")));
  assert.ok(bySlug.get("heathfield-runners").contacts.some(c => c.email === "info@heathfieldrunners.club"));
  // Batch 79: source-qualified student and community programmes.
  assert.equal(clubProfiles["kippax-and-district-harriers"].founded_year, 1983);
  for (const slug of ["amazing-feet-running-club", "kingfisher-harriers", "athletics-ireland-annalee-a-c"]) assert.equal(clubProfiles[slug].founded_year, undefined);
  assert.match(clubProfiles["halton-and-frodsham-harriers"].biography.join(" "), /suspended/);
  assert.match(clubProfiles["kippax-and-district-harriers"].biography.join(" "), /2026 course are closed/);
  assert.match(clubProfiles["university-of-portsmouth-athletics-club"].biography.join(" "), /excludes affiliation/);
  assert.equal(bySlug.get("kingfisher-harriers").city, "Redditch");
  assert.equal(bySlug.get("halton-and-frodsham-harriers").city, "Frodsham");
  assert.equal(bySlug.get("university-of-portsmouth-athletics-club").address_kind, "training");
  assert.equal(bySlug.get("athletics-ireland-annalee-a-c").country, "Ireland");
  for (const slug of ["amazing-feet-running-club", "kingfisher-harriers", "halton-and-frodsham-harriers"]) assert.equal(bySlug.get(slug).address, "");
  assert.ok(bySlug.get("amazing-feet-running-club").contacts.some(c => c.email === "info@amazingfeetrc.co.uk"));
  assert.ok(bySlug.get("university-of-warwick").contacts.some(c => c.email === "info.wuaxc@gmail.com"));
  assert.ok(!bySlug.get("kingfisher-harriers").contacts.some(c => c.email?.endsWith("@connectmy.club")));
  // Batch 78: recovered local sources, distinct venues and qualified joining.
  assert.equal(clubProfiles["avon-tempo"].founded_year, 2025);
  assert.equal(clubProfiles["allerton-junior-athletics-club"].founded_year, 2014);
  assert.equal(clubProfiles["lancashire-walking-club"].founded_year, 1907);
  assert.match(clubProfiles["lancashire-walking-club"].biography.join(" "), /1904/);
  assert.equal(clubProfiles["hornsea-harriers"].founded_year, 1986);
  assert.match(clubProfiles["boro-runners"].biography.join(" "), /waiting list/);
  assert.equal(bySlug.get("boro-runners").adult_only, false);
  assert.match(clubProfiles["peacehaven-run-club"].biography.join(" "), /38 minutes/);
  assert.match(clubProfiles["tweed-striders"].biography.join(" "), /2025–26/);
  assert.equal(bySlug.get("eliot-ladies-at-ambleside").postcode, "CV11 6AT");
  assert.equal(bySlug.get("allerton-junior-athletics-club").city, "Northallerton");
  assert.equal(bySlug.get("netley-abbey-runners").postcode, "SO31 5FA");
  assert.equal(bySlug.get("rimrose-runners").city, "Waterloo");
  for (const slug of ["allerton-junior-athletics-club", "boro-runners", "lancashire-walking-club"]) assert.equal(bySlug.get(slug).address, "");
  assert.ok(bySlug.get("netley-abbey-runners").contacts.some(c => c.email === "runcoordinator@netleyabbeyrunners.com"));
  assert.ok(bySlug.get("peacehaven-run-club").contacts.some(c => c.email === "memberships.prc.24@gmail.com"));
  // Batch 76: recovered sources, qualified joining requirements and unsafe links.
  assert.equal(clubProfiles["eynsford-running-club"].founded_year, 2011);
  assert.match(clubProfiles["eynsford-running-club"].biography.join(" "), /formal club in 2016/);
  assert.equal(clubProfiles["dewsbury-road-runners"].founded_year, undefined);
  assert.equal(clubProfiles["lymm-runners"].founded_year, 2010);
  assert.equal(clubProfiles["dengie-100-runners"].founded_year, 2009);
  assert.equal(clubProfiles["lytham-st-annes-rr-club"].founded_year, 1998);
  assert.equal(clubProfiles["thames-hare-and-hounds"].founded_year, 1868);
  assert.equal(bySlug.get("eynsford-running-club").city, "Eynsford");
  assert.equal(bySlug.get("dengie-100-runners").city, "Burnham-on-Crouch");
  assert.equal(bySlug.get("highworth-rc").city, "Highworth");
  assert.equal(bySlug.get("victoria-park-harriers-and-tower-hamlets-ac").postcode, "E9 5EG");
  assert.match(clubProfiles["victoria-park-harriers-and-tower-hamlets-ac"].biography.join(" "), /application before attending a trial/);
  assert.match(clubProfiles["victoria-park-harriers-and-tower-hamlets-ac"].biography.join(" "), /throws coaching is unavailable/);
  assert.match(clubProfiles["totley-ac"].biography.join(" "), /beginner off-road group marked as not currently running/);
  for (const slug of ["eynsford-running-club", "dengie-100-runners", "sandhurst-joggers", "highworth-rc"]) assert.equal(bySlug.get(slug).postcode, "");
  for (const slug of ["liverpool-pembroke-and-sefton-h-ac", "pudsey-and-bramley-ac", "shepshed-running-club"]) assert.equal(bySlug.get(slug).website, "");
  assert.ok(!bySlug.get("liverpool-pembroke-and-sefton-h-ac").contact_url.includes("lps-athletics"));
  assert.ok(bySlug.get("dewsbury-road-runners").contacts.some(c => c.phone === "07770 903230"));
  assert.ok(!bySlug.get("dewsbury-road-runners").contacts.some(c => c.phone?.replace(/\D/g, "") === "07786925426"));
  assert.ok(bySlug.get("lymm-runners").contacts.some(c => c.email === "membership@lymmrunners.org.uk"));
  // Batch 68: supported venues, national scope and qualified historical dates.
  assert.equal(clubProfiles["thirsk-and-sowerby-harriers"].founded_year, 1977);
  assert.equal(clubProfiles["thurrock-harriers"].founded_year, 1949);
  assert.equal(clubProfiles["trawden-athletic-club"].founded_year, 1993);
  assert.equal(clubProfiles["tri-london"].founded_year, undefined);
  assert.match(clubProfiles["tri-london"].contact_note, /1986.*1985/);
  assert.match(clubProfiles["tooting-run-club"].biography.join(" "), /July 2026/);
  assert.match(clubProfiles["tooting-run-club"].contact_note, /common sessions are paused/);
  assert.equal(bySlug.get("thurrock-harriers").postcode, "RM16 2QT");
  assert.equal(bySlug.get("thornbury-rc").city, "Thornbury");
  assert.equal(bySlug.get("thorney-rc").city, "Whittlesey");
  assert.equal(bySlug.get("thorney-rc").postcode, "");
  assert.equal(bySlug.get("trentham-rc").address, "Trentham Academy, Allerton Road, Stoke-on-Trent");
  for (const slug of ["trail-running-association", "trail-runners-adventure-running-club"]) {
    assert.equal(clubProfiles[slug].scope, "national");
    assert.equal(bySlug.get(slug).country, "England");
  }
  for (const slug of ["trail-running-association", "tri-london", "torbay-tri-club"]) assert.equal(bySlug.get(slug).postcode, "");
  for (const slug of ["tooting-run-club", "tri-london", "torbay-tri-club", "tri-logic-cornwall"]) assert.equal(bySlug.get(slug).adult_only, true);
  assert.ok(bySlug.get("track-academy").contacts.some(c => c.email === "admin@trackacademy.co.uk"));
  assert.ok(bySlug.get("trawden-athletic-club").contacts.some(c => c.email === "juniors@trawdenac.co.uk"));
  assert.ok(!bySlug.get("trentham-rc").contacts.some(c => c.email === "mymail@mailservice.com" || c.phone === "5555555555"));
  // Batch 67: distinct affiliation dates, virtual scope and supported venues.
  assert.equal(clubProfiles["tavistock-run-project"].founded_year, 2013);
  assert.match(clubProfiles["tavistock-run-project"].biography.join(" "), /October 2017/);
  assert.equal(clubProfiles["teambr"].founded_year, undefined);
  assert.equal(bySlug.get("teambr").city, "Broughton");
  assert.equal(bySlug.get("team-bodyworks").postcode, "BN20 7SR");
  assert.equal(bySlug.get("teignbridge-trotters").postcode, "TQ12 2AR");
  assert.equal(bySlug.get("thame-runners").postcode, "OX9 3TH");
  assert.equal(bySlug.get("thanet-roadrunners-ac").postcode, "CT12 6NB");
  assert.equal(bySlug.get("team-manvers").address_kind, "clubhouse");
  assert.equal(bySlug.get("team-coco").address_kind, "correspondence");
  assert.equal(bySlug.get("team-coco").virtual, true);
  assert.equal(clubProfiles["team-coco"].scope, "global");
  assert.notEqual(clubProfiles["the-stragglers-running-club"].scope, "global");
  assert.match(clubProfiles["team-derby-runner"].biography.join(" "), /no fixed club nights/);
  assert.match(clubProfiles["teesdale-ac"].contact_note, /No current Couch to 5K/);
  assert.ok(bySlug.get("telford-ac").contacts.some(c => c.email === "training@telfordac.uk"));
  assert.ok(bySlug.get("team-manvers").contacts.some(c => c.email === "tri@mwbc.org.uk"));
  assert.equal(clubProfiles["tetbury-dolphins-running-club"].notable_members.length, 2);
  assert.equal(clubProfiles["team-devizes-moonrakers-ac"].founded_year, 2007);
  // Batch 66: supported training bases, distinct clubs and qualified capacity.
  assert.equal(clubProfiles["surrey-walking-club"].founded_year, 1899);
  assert.equal(clubProfiles["swaledale-runners"].founded_year, 1986);
  assert.equal(clubProfiles["swindon-harriers"].founded_year, 1996);
  assert.equal(bySlug.get("swaledale-runners").city, "Richmond");
  assert.equal(bySlug.get("swaledale-runners").postcode, "DL10 4QS");
  assert.equal(bySlug.get("surrey-walking-club").address, "");
  assert.equal(bySlug.get("surrey-walking-club").location_precision, "area-only");
  assert.equal(bySlug.get("sutton-in-ashfield-harriers-and-ac").city, "Kirkby-in-Ashfield");
  assert.equal(bySlug.get("swanley-and-district-ac").address_kind, "clubhouse");
  assert.equal(bySlug.get("swindon-harriers").postcode, "SN1 2FD");
  assert.equal(bySlug.get("tadley-runners").postcode, "RG26 5NL");
  assert.equal(bySlug.get("tadcaster-harriers").postcode, "LS24 9HD");
  assert.equal(bySlug.get("tamworth-ac").website, "https://tamworthac.com/");
  assert.equal(bySlug.get("swinton-running-club").website, "https://swintonrc.weebly.com/");
  assert.ok(bySlug.get("sunderland-strollers").contacts.some(c => c.email === "clubsecretary@sunderlandstrollers.co.uk"));
  assert.ok(!bySlug.get("tamar-trotters").contacts.some(c => c.email?.endsWith("@pdsprint.co.uk")));
  assert.match(clubProfiles["tamworth-ac"].contact_note, /waiting list/);
  assert.match(clubProfiles["tattenhall-runners"].biography.join(" "), /cancelled for 2026/);
  assert.match(clubProfiles["tadworth-ac"].biography.join(" "), /early 1980s/);
  for (const slug of ["sutton-striders", "swindon-striders", "swanley-and-district-ac"]) assert.ok(!bySlug.get(slug).sports.includes("Triathlon"));
  // Batch 65: current club sites, supported venues and qualified joining capacity.
  assert.equal(clubProfiles["steel-city-striders-rc"].founded_year, 1982);
  assert.equal(clubProfiles["stockport-tri-club"].founded_year, 2014);
  assert.equal(clubProfiles["stonehenge-striders-running-club"].founded_year, 2020);
  assert.equal(bySlug.get("stockton-striders-ac").website, "https://stocktonstridersac.com/");
  assert.equal(bySlug.get("stevenage-and-north-herts-ac").postcode, "SG2 9QZ");
  assert.equal(bySlug.get("stopsley-striders").postcode, "LU2 8DD");
  assert.equal(bySlug.get("sudbury-court-running-club").city, "Wembley");
  assert.equal(bySlug.get("sudbury-court-running-club").postcode, "");
  assert.equal(bySlug.get("sudbury-court-running-club").location_precision, "area-only");
  assert.equal(bySlug.get("stonehenge-striders-running-club").city, "Amesbury");
  assert.equal(bySlug.get("steyning-ac").address_kind, "clubhouse");
  assert.match(clubProfiles["stevenage-and-north-herts-ac"].contact_note, /waiting lists were closed/);
  assert.ok(bySlug.get("stevenage-phoenix-running-club").contacts.some(c => c.email === "runners@stevenagephoenix.org.uk"));
  assert.ok(!bySlug.get("stroud-and-district-ac").contacts.some(c => c.email?.endsWith("@connectmy.club")));
  // Stock Exchange history was recovered in batch 86; Croydon remains deferred.
  // Striders' primary club pages were recovered in batch 88; see origin checks above.
  // Batch 64: distinct clubs, qualified dates and session-specific venues.
  assert.equal(clubProfiles["spenborough-and-dist-ac"].founded_year, 1965);
  assert.equal(clubProfiles["st-albans-ac"].founded_year, 1989);
  assert.equal(clubProfiles["st-albans-striders"].founded_year, 1984);
  assert.equal(clubProfiles["st-helens-striders"].founded_year, 1984);
  assert.equal(clubProfiles["st-helens-sutton-ac"].founded_year, 1990);
  assert.equal(clubProfiles["st-neots-riverside-runners"].founded_year, undefined);
  assert.equal(clubProfiles["sri-chinmoy-marathon-team"].founded_year, undefined);
  assert.notEqual(clubProfiles["sri-chinmoy-marathon-team"].scope, "global");
  assert.equal(bySlug.get("sri-chinmoy-marathon-team").country, "England");
  assert.equal(bySlug.get("squirrels-running-group").city, "Broughton Astley");
  assert.equal(bySlug.get("springfield-striders-rc").city, "Chelmsford");
  assert.equal(bySlug.get("st-marys-university-athletics-club").city, "Twickenham");
  assert.equal(bySlug.get("st-albans-ac").postcode, "AL1 2DJ");
  assert.equal(bySlug.get("st-austell-running-club").postcode, "PL26 7FH");
  assert.equal(bySlug.get("stainland-lions-running-club").postcode, "HX4 8LS");
  assert.equal(bySlug.get("spa-striders").address_kind, "clubhouse");
  assert.match(clubProfiles["spenborough-and-dist-ac"].contact_note, /waiting list closed/);
  assert.match(clubProfiles["st-neots-triathlon-club"].biography.join(" "), /independent of the private NiceTri Events/);
  assert.equal(clubProfiles["st-marys-richmond-ac"].sources.length, 2);
  assert.equal(clubProfiles["st-austell-athletes-running-club"], undefined);
  assert.equal(clubProfiles["st-marys-university-athletics-club"].notable_members, undefined);
  assert.ok(bySlug.get("spectrum-striders").contacts.some(c => c.email === "membership@spectrumstriders.org.uk"));
  assert.ok(bySlug.get("ss-athletics").contacts.some(c => c.phone === "07713 118226"));
  assert.ok(!bySlug.get("spa-striders").contacts.some(c => c.email?.endsWith("@connectmy.club")));
  assert.ok(!bySlug.get("spenborough-and-dist-ac").contacts.some(c => c.phone?.replace(/\D/g, "") === "01484766131"));
  // Batch 63: merged-club origins, separate venues and public role contacts.
  assert.equal(clubProfiles["southampton-athletic-club"].founded_year, 2010);
  assert.equal(clubProfiles["south-devon-ac"].founded_year, 1997);
  assert.equal(clubProfiles["south-london-harriers"].founded_year, 1871);
  assert.ok(bySlug.get("south-london-harriers").sports.includes("Triathlon"));
  assert.equal(bySlug.get("south-ribble-runners").city, "Leyland");
  assert.equal(bySlug.get("somer-ac").city, "Midsomer Norton");
  assert.equal(bySlug.get("south-cheshire-harriers").city, "Willaston");
  assert.equal(bySlug.get("south-west-road-runners").postcode, "EX4 8NN");
  assert.equal(bySlug.get("southwell-running-club").city, "Southwell");
  assert.equal(bySlug.get("southwell-running-club").postcode, "");
  assert.equal(bySlug.get("sowerby-bridge-snails-running-club").postcode, "");
  assert.equal(bySlug.get("south-west-veterans-ac").address, "");
  assert.equal(bySlug.get("south-west-veterans-ac").location_precision, "area-only");
  assert.equal(bySlug.get("sparkhill-harriers").postcode, "B27 7NS");
  assert.equal(bySlug.get("sparkhill-harriers").address_kind, "training");
  assert.ok(bySlug.get("south-west-athletics-academy").contacts.some(c => c.phone === "07745 616852"));
  assert.ok(bySlug.get("south-shields-harriers-and-ac").contacts.some(c => c.email === "juniors@southshieldsharriers.club"));
  assert.ok(!bySlug.get("south-west-athletics-academy").contacts.some(c => c.email === "info@mysite.com"));
  assert.match(clubProfiles["south-devon-ac"].location_note, /junior training/);
  assert.match(clubProfiles["southwell-running-club"].notable_members.find(m => m.name === "Richard Whitehead").connection, /Honorary/);
  assert.ok(clubProfiles["south-birmingham-striders"].sources.some(s => s.url === "https://sbsclub.co.uk/about-us-1"));
  // Previously blocked; batch95 recovered the rendered official joining page.
  assert.ok(clubProfiles["southampton-triathlon-club"].sources.some(s => s.url === "https://www.southamptontriclub.co.uk/join-in"));
  // Batch 62: distinct entities, supported venues and historical-only associations.
  assert.equal(clubProfiles["skelmersdale-boundary-harriers"].founded_year, 1983);
  assert.equal(clubProfiles["skelmersdale-running-club"].founded_year, 2023);
  assert.equal(clubProfiles["silson-ac"].founded_year, 1976);
  assert.equal(bySlug.get("silson-ac").city, "Silverstone");
  assert.equal(bySlug.get("silson-ac").postcode, "");
  assert.equal(bySlug.get("skipton-ac").postcode, "");
  assert.match(bySlug.get("skipton-ac").address, /Aireville Park/);
  assert.equal(bySlug.get("slough-junior-ac").postcode, "SL4 6HN");
  assert.equal(bySlug.get("slough-junior-ac").city, "Eton");
  assert.equal(bySlug.get("skyrac-athletic-club").address_kind, "clubhouse");
  assert.equal(bySlug.get("snaith-and-cowick-running-club").city, "Snaith");
  assert.equal(bySlug.get("sneyd-striders").postcode, "WV12 5PT");
  assert.equal(bySlug.get("sneyd-striders").city, "Willenhall");
  assert.equal(bySlug.get("sinfin-running-club").postcode, "DE73 6TQ");
  for (const slug of ["slaithwaite-striders-rc", "sleaford-striders-ac", "skegness-and-district-running-club", "sneyd-striders"]) {
    assert.ok(!bySlug.get(slug).sports.includes("Swimming"));
  }
  assert.ok(bySlug.get("sittingbourne-striders").sports.includes("Triathlon"));
  assert.ok(bySlug.get("sittingbourne-striders").contacts.some(c => c.phone === "07496 242166"));
  assert.equal(bySlug.get("sole-sisters-north-bristol").address, "");
  assert.equal(bySlug.get("solent-running-sisters").address, "");
  assert.equal(clubProfiles["smalley-road-runners"].founded_year, undefined);
  assert.equal(clubProfiles["sip-running-club"], undefined);
  assert.equal(clubProfiles["slgr"], undefined);
  assert.match(clubProfiles["slough-junior-ac"].notable_members.find(m => m.name === "Morgan Lake").connection, /Former/);
  // Batch 60: school entities, safe website suppression and sourced training bases.
  for (const district of ["afan-nedd-tawe", "cardiff-and-vale", "dyfed", "eryri", "glamorgan-valleys"]) {
    const slug = `welsh-athletics-${district}-schools-district`;
    assert.equal(bySlug.get(slug).country, "Wales");
    assert.equal(clubProfiles[slug].founded_year, undefined);
    assert.match(clubProfiles[slug].biography.join(" "), /school/i);
    assert.notEqual(clubProfiles[slug].scope, "global");
    assert.ok(bySlug.get(slug).contacts.some(c => c.email?.endsWith("@ws-aa.org")));
    assert.equal(bySlug.get(slug).contacts.find(c => c.email === "andrew.jenkins@welshathletics.org").name, "Andrew Jenkins");
  }
  assert.equal(bySlug.get("saffron-athletics-club").website, "");
  assert.ok(clubProfiles["saffron-athletics-club"].contact_note.includes("gambling"));
  assert.ok(!bySlug.get("saffron-athletics-club").contacts.some((contact) => contact.email?.endsWith("@saffronac.co.uk")));
  assert.equal(bySlug.get("saffron-athletics-club").address_kind, "training");
  assert.equal(clubProfiles["bad-boy-running-club"].scope, "global");
  assert.equal(bySlug.get("bad-boy-running-club").virtual, true);
  assert.equal(bySlug.get("killamarsh-kestrels").postcode, "S21 1EZ");
  assert.equal(clubProfiles["great-milton-athletics-club"].founded_year, 2014);
  assert.ok(clubProfiles["great-milton-athletics-club"].biography.join(" ").includes("2012"));
  assert.ok(clubProfiles["wakefield-triathlon-club"].biography.join(" ").includes("coach approval"));
  assert.ok(clubProfiles["framlingham-flyers"].notable_members.every((member) => member.connection.includes("2015")));
  assert.ok(clubProfiles["saffron-striders-rc"]);
  assert.equal(bySlug.get("runthrough-north").city, "Salford");
  assert.equal(bySlug.get("runthrough-north").postcode, "M50 2QH");
  assert.equal(clubProfiles["runthrough-run-club"].founded_year, undefined);
  assert.equal(bySlug.get("rushcliffe-ac").postcode, "NG13 8BL");
  assert.equal(bySlug.get("rutland-running-and-triathlon-club").county, "Rutland");
  assert.equal(bySlug.get("rutland-running-and-triathlon-club").postcode, "");
  assert.equal(bySlug.get("s-factor-athletics-academy").postcode, "SE6 4QX");
  assert.equal(bySlug.get("s-factor-athletics-academy").city, "London");
  assert.equal(bySlug.get("ryde-harriers").adult_only, false);
  assert.equal(bySlug.get("saltaire-striders").city, "Saltaire");
  assert.equal(bySlug.get("saltaire-striders").adult_only, true);
  assert.equal(bySlug.get("sawtry-running-club").city, "Sawtry");
  assert.equal(bySlug.get("sandbach-striders").postcode, "");
  assert.match(clubProfiles["salford-harriers-and-ac"].notable_members.find(m => m.name === "Ben Jones").connection, /1905–1912/);
  assert.match(clubProfiles["saltwell-harriers"].contact_note, /pandemic/);
  // Batch 59: primary-source locations, historical roles and virtual-club scope.
  assert.equal(clubProfiles["tritanium-tc"].founded_year, 2017);
  assert.equal(clubProfiles["carrick-on-suir-tc"].founded_year, undefined);
  assert.equal(bySlug.get("run-and-ride-athletics-club").postcode, "ST17 0UR");
  assert.equal(bySlug.get("run-and-ride-athletics-club").city, "Milford");
  assert.equal(bySlug.get("run-nation-running-club").address_kind, "correspondence");
  assert.equal(bySlug.get("runners-next-the-sea").city, "Wells-next-the-Sea");
  assert.equal(bySlug.get("running-somewhere-else").postcode, "");
  assert.match(clubProfiles["running-somewhere-else"].location_note, /disagree/);
  assert.equal(clubProfiles.runna.scope, "national");
  assert.equal(bySlug.get("runna").adult_only, true);
  assert.equal(bySlug.get("run-things-run-club").address, "");
  assert.ok(!bySlug.get("run-academy-worthing").socials.some(s => s.url.includes("facebook/com")));
  assert.equal(bySlug.get("runnymede-runners").county, "Surrey");
  assert.match(clubProfiles["running-at-40-plus"].notable_members[0].connection, /ambassador/);
  assert.equal(clubProfiles["kidderminster-and-stourport"].founded_year, 2001);
  assert.equal(clubProfiles["keswick-ac"].founded_year, 1974);
  assert.equal(clubProfiles["kirkby-ac"].founded_year, undefined);
  assert.ok(!bySlug.get("kirkby-ac").website);
  assert.match(clubProfiles["kirkby-ac"].contact_note, /different club/);
  assert.equal(clubProfiles["kirkby-ac"].notable_members.length, 3);
  assert.equal(bySlug.get("goole-youth-ac").address_kind, "training");
  assert.equal(bySlug.get("goole-youth-ac").postcode, "");
  assert.equal(bySlug.get("start2jog").website, "https://www.start2jog.co.uk/");
  assert.ok(bySlug.get("start2jog").contacts.some(c => c.email === "chairman@start2jog.co.uk"));
  assert.equal(clubProfiles["hurricane-striders"].founded_year, undefined);
  assert.equal(bySlug.get("hurricane-striders").adult_only, true);
  assert.match(clubProfiles["gipsy-hill-run-club"].biography.join(" "), /having taken place/);
  assert.ok(bySlug.get("gipsy-hill-run-club").socials.some(s => s.platform === "Facebook"));
  assert.ok(bySlug.get("gipsy-hill-run-club").socials.some(s => s.platform === "Instagram"));
  assert.equal(bySlug.get("hayes-and-harlington-road-runners").postcode, "UB3 4HR");
  assert.equal(clubProfiles["kirkby-milers-ac"].founded_year, 2015);
  assert.equal(bySlug.get("lancaster-and-morecambe-ac").postcode, "LA1 5JS");
  assert.equal(bySlug.get("lancing-eagles-rc").postcode, "BN15 0PH");
  assert.equal(bySlug.get("kidlington-running-club").city, "Kidlington");
  assert.equal(bySlug.get("knowsley-harriers").postcode, "L26 7XB");
  assert.equal(bySlug.get("knutsford-runners").adult_only, true);
  assert.equal(bySlug.get("larkfield-athletics-club").adult_only, true);
  assert.match(clubProfiles["ledbury-and-district-harriers"].biography.join(" "), /no longer England Athletics affiliated/);
  assert.match(clubProfiles["knaresborough-striders"].contact_note, /different address/);
  assert.match(clubProfiles["knutsford-tri-club"].biography.join(" "), /three.*in total/);
  assert.ok(bySlug.get("athletics-ireland-artane-beaumont-running-club-a-c").socials.some(s => s.url === "https://www.instagram.com/artanebeaumontrunclub/"));
  assert.ok(clubProfiles["athletics-ireland-artane-beaumont-running-club-a-c"].notable_members.some(m => m.name === "David Gilloughley"));
  assert.ok(clubProfiles["leicester-walking-club"].sources.some(s => s.url === "https://lancswalkingclub.com/2017/10/18/memories-of-leicester-and-lancashire/"));
  assert.equal(clubProfiles["leighton-buzzard-triathlon-club"].founded_year, 2011);
  assert.equal(clubProfiles["lingfield-rc"].founded_year, undefined);
  assert.equal(clubProfiles["little-baddow-ridge-runners"].founded_year, undefined);
  assert.equal(clubProfiles["liverpool-running-club"].founded_year, 1985);
  assert.equal(bySlug.get("leighton-buzzard-triathlon-club").postcode, "LU7 3SS");
  assert.equal(bySlug.get("liverpool-running-club").postcode, "L9 6AG");
  assert.equal(bySlug.get("leighton-fun-runners").adult_only, true);
  assert.ok(!bySlug.get("leigh-on-sea-striders").sports.includes("Triathlon"));
  assert.ok(!bySlug.get("lincoln-and-district-runners").sports.includes("Triathlon"));
  assert.match(clubProfiles["leighton-buzzard-athletic-club"].biography.join(" "), /suspended/);
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
  assert.equal(bySlug.get("ripley-running-club").website, "https://www.ripleyrunningclub.co.uk/");
  assert.equal(bySlug.get("roberttown-road-runners").website, "https://clubspark.englandathletics.org/RoberttownRoadRunners");
  assert.match(bySlug.get("roberttown-road-runners").address, /Church Lane/);
  assert.equal(bySlug.get("rossendale-harriers-and-ac").postcode, "BB4 7SW");
  assert.equal(bySlug.get("royal-sutton-coldfield-athletics-club").postcode, "B73 6EB");
  assert.equal(clubProfiles["rochdale-tri-club"].founded_year, undefined);
  assert.equal(bySlug.get("rochdale-tri-club").address, "");
  assert.equal(bySlug.get("rother-valley-swallows").city, "Aston");
  assert.equal(bySlug.get("rotherham-running-club").adult_only, true);
  assert.equal(bySlug.get("royton-road-runners").adult_only, true);
  assert.match(clubProfiles["roundhay-runners"].biography.join(" "), /future intention/);
  assert.match(clubProfiles["rochdale-harriers-and-ac"].biography.join(" "), /interest list/);
  assert.ok(bySlug.get("rochford-running-club").contacts.some(c => c.email === "runrrc@gmail.com"));
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
  // Batch 48: preserve age-specific access, real training bases and source identity.
  assert.equal(bySlug.get("march-ac").postcode, "PE15 0BH");
  assert.equal(bySlug.get("marshall-milton-keynes-ac").postcode, "MK14 6DT");
  assert.equal(bySlug.get("massey-ferguson-rc").city, "Coventry");
  assert.equal(bySlug.get("massey-ferguson-rc").address, "");
  assert.equal(bySlug.get("market-drayton-rc").website, "https://marketdraytonrunningclub.co.uk/");
  assert.equal(bySlug.get("athletics-ireland-carraig-mhor-a-c").city, "Carrigtwohill");
  assert.equal(clubProfiles["athletics-ireland-carraig-mhor-a-c"].founded_year, undefined);
  assert.equal(clubProfiles["malvern-buzzards-running-club"].founded_year, 2017);
  assert.match(clubProfiles["manchester-harriers-and-ac"].biography.join(" "), /waiting list was temporarily closed/);
  assert.match(clubProfiles["marlborough-athletics"].biography.join(" "), /confirm places/);
  assert.match(clubProfiles["medway-and-maidstone-ac"].biography.join(" "), /Contact the club before attending/);
  assert.ok(bySlug.get("marsden-racers").sports.includes("Cycling"));
  assert.deepEqual(bySlug.get("marlow-striders").sports, ["Running"]);
  assert.ok(bySlug.get("athletics-ireland-carraig-mhor-a-c").contacts.some(c => c.email === "carraigmhorac@gmail.com"));
  assert.ok(!bySlug.get("massey-ferguson-rc").contacts.some(c => c.phone?.replace(/\D/g, "") === "01214456491"));
  // Batch 49: separate programme origins, correspondence and actual admission rules.
  assert.equal(clubProfiles["mendip-athletic-club"].founded_year, 2003);
  assert.equal(clubProfiles["mickey-bushell-gold-standard-academy"].founded_year, 2023);
  assert.equal(clubProfiles["middlesbrough-and-cleveland-harriers"].founded_year, undefined);
  assert.equal(clubProfiles["midland-masters-ac"].corrections.address_kind, "correspondence");
  assert.equal(bySlug.get("meltham-ac").city, "Meltham");
  assert.equal(bySlug.get("mk-lakeside-runners").city, "Milton Keynes");
  assert.equal(bySlug.get("metros-rc").address, "");
  assert.equal(bySlug.get("mile-shy-club").adult_only, false);
  assert.deepEqual(bySlug.get("methley-striders").sports, ["Running"]);
  assert.ok(!bySlug.get("middlesbrough-and-cleveland-harriers").contacts.some(c => c.email === "hello@connectmy.club"));
  assert.notEqual(clubProfiles["mikkeller-running-club-liverpool"].scope, "global");
  // Batch 50: recover source identity, preserve venue evidence and qualify access.
  assert.equal(bySlug.get("newark-ac").website, "https://www.newarkathletics.co.uk/");
  assert.ok(!bySlug.get("newark-ac").contacts.some(c => c.email?.includes("newarkaircon")));
  assert.equal(clubProfiles["momentum-track-club"].founded_year, 2025);
  assert.equal(clubProfiles["new-marske-harriers-club"].founded_year, 1986);
  assert.equal(bySlug.get("morley-running-club").city, "Morley");
  assert.equal(bySlug.get("mossley-running-club").city, "Mossley");
  assert.equal(bySlug.get("mote-runners").postcode, "ME15 7RN");
  assert.equal(bySlug.get("newbury-ac").postcode, "RG19 8ET");
  assert.equal(bySlug.get("newcastle-frontrunners").postcode, "NE3 3HD");
  assert.equal(bySlug.get("newcastle-frontrunners").adult_only, false);
  assert.match(bySlug.get("newcastle-staffs-tri-club").address, /NORTHWOOD STADIUM/);
  assert.match(clubProfiles["nantwich-running-club"].biography.join(" "), /2023\/24/);
  assert.match(clubProfiles["newcastle-frontrunners"].biography.join(" "), /rather than guaranteed every Sunday/);
  assert.equal(clubProfiles["nepal-run"].notable_members, undefined);
  assert.notEqual(clubProfiles["nepal-run"].scope, "global");
  assert.ok(clubProfiles["new-levels-run-club"].sources.some(source => source.url.includes("finalsurge.com/coach/runthroughcoach/")));
  // New Berkeley's narrative was subsequently recovered from primary event partners in batch 113.
  assert.ok(clubProfiles["new-berkeley-harriers"].sources.some(source => source.url.includes("greatrun.org/news/")));
  // Batch 51: preserve admission rules, organisational identity and real contact evidence.
  assert.equal(bySlug.get("newcastle-staffs-ac").postcode, "ST5 2DJ");
  assert.equal(bySlug.get("newcastle-staffs-ac").city, "Newcastle-under-Lyme");
  assert.equal(bySlug.get("newent-runners").adult_only, false);
  assert.equal(bySlug.get("northampton-ac").postcode, "NN3 7QL");
  assert.match(clubProfiles["north-east-veterans-ac"].biography.join(" "), /not already members/);
  assert.match(clubProfiles["north-shields-polytechnic-club"].contact_note, /waiting list was advertised as closed/);
  assert.match(clubProfiles["north-leeds-fell-runners"].biography.join(" "), /over-eighteens/);
  assert.equal(clubProfiles["north-devon-ac"].founded_year, undefined);
  assert.ok(!clubProfiles["north-devon-ac"].notable_members.some(x => /Linford/.test(x.name)));
  assert.ok(bySlug.get("north-east-project").contacts.some(x => x.phone === "07984227042"));
  assert.ok(!bySlug.get("north-cotswold-tri-and-run").contacts.some(x => /mailservice|555-555/.test((x.email ?? "") + (x.phone ?? ""))));
  assert.ok(!bySlug.get("newmarket-joggers-ac").contacts.some(x => /james.smith|chair@/.test(x.email ?? "")));
  // Batch 52: preserve current venues, source identity and eligibility distinctions.
  assert.equal(bySlug.get("northumbria-university").postcode, "NE26 3NT");
  assert.equal(bySlug.get("northumbria-university").city, "Monkseaton");
  assert.equal(bySlug.get("orchard-eagles-running-club").postcode, "TS16 0EH");
  assert.equal(bySlug.get("orwell-panthers-ac").postcode, "IP4 3DL");
  assert.equal(clubProfiles["orwell-panthers-ac"].founded_year, 2004);
  assert.equal(clubProfiles["orion-harriers"].founded_year, 1911);
  assert.equal(bySlug.get("on-the-run-aylesbury-and-pitstone").postcode, "HP21 9NJ");
  assert.ok(bySlug.get("on-the-run-aylesbury-and-pitstone").contacts.some(c => c.email === "info@ontherun.me.uk"));
  assert.ok(bySlug.get("off-that-couch-fitness").sports.includes("Triathlon"));
  assert.equal(bySlug.get("off-that-couch-fitness").website, "https://www.offthatcouchfitness.com/");
  assert.ok(bySlug.get("nuclear-races-striders").contacts.some(c => c.email === "striders@nuclearessex.com"));
  assert.ok(!bySlug.get("nuclear-races-striders").contacts.some(c => /shop|races@|info@nuclearessex/.test(c.email ?? "")));
  assert.match(clubProfiles["northern-fells-running-club"].contact_note, /Eighteen-plus only/);
  assert.match(clubProfiles["northenden-runners"].biography.join(" "), /rather than publishing those as an established weekly timetable/);
  assert.ok(!clubProfiles["olney-runners-ac"].notable_members?.some(c => /Joe Wicks/.test(c.name)));
  const unsafe = { name: "</script><script>example</script>" };
  // Batch 47: distinguish changing venues, admission rules and historical associations.
  assert.equal(bySlug.get("london-city-runners").address, "Marquis of Wellington, 21 Druid Street, Bermondsey, London");
  assert.equal(bySlug.get("long-eaton-running-club").city, "Long Eaton");
  assert.equal(bySlug.get("long-eaton-running-club").postcode, "NG10 4AA");
  assert.equal(bySlug.get("lowestoft-road-runners").postcode, "NR33 0QN");
  assert.equal(bySlug.get("ludlow-runners").county, "Shropshire");
  assert.equal(bySlug.get("lonely-goat-rc").address, "");
  assert.notEqual(clubProfiles["lonely-goat-rc"].scope, "global");
  assert.match(clubProfiles["loughton-ac"].contact_note, /waiting list closed/);
  assert.match(clubProfiles["longwood-harriers-ac"].biography.join(" "), /must contact the club before attending/);
  assert.match(clubProfiles["manchester-frontrunners"].biography.join(" "), /comfortably run 5K/);
  assert.ok(bySlug.get("london-frontrunners").sports.includes("Triathlon"));
  assert.ok(bySlug.get("macclesfield-harriers-and-ac").contacts.some(c => c.email === "tryarun@macclesfield-harriers.co.uk"));
  assert.ok(!bySlug.get("loughton-ac").contacts.some(c => /welfare/i.test(c.email ?? "")));
  assert.equal(clubProfiles["maidenhead-ac"].founded_year, undefined);
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
