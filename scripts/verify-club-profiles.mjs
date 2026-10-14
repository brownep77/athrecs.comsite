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
