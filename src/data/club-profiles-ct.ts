import type { ClubProfile } from "./club-profiles";

// Batch 98: distinguish predecessor clubs, online communities and dated affiliations.
export const recoveredThrowsAndCommunityProfiles: Record<string, ClubProfile> = {
  "london-hammer-school": {
    summary: "London Hammer School specialises in hammer throwing, with Lee Valley coaching and a history reaching back through the West London Hammer School.",
    biography: [
      "London Hammer School is a specialist hammer-throwing club in London, England. Its current form launched in 2024, building on West London Hammer School, which Alan Bertram founded in 1977. The club's history names Olympic and Commonwealth hammer thrower Mick Jones as its predecessor's first member; that earlier association is distinct from membership of today's school.",
      "Lee Valley Athletics Centre is the main North London training base. The official site advertises Wednesday evenings and Sunday mornings, with occasional indoor throwing when conditions require it. It welcomes different ages and levels without a qualifying performance, but asks prospective throwers to make contact before arranging a session.",
      "The school also describes a Willesden Track Academy collaboration, separate from Lee Valley, and ambitions for satellite centres. England Athletics' July–August 2026 throws newsletter advertised an open session for hammer throwers and coaches, naming Jamie Bath as the contact. Use the school enquiry form or published throwing-session email to discuss coaching and confirm the right venue before travelling."
    ],
    founded_year: 2024,
    notable_members: [
      { name: "Alan Bertram", connection: "Founder of predecessor West London Hammer School", detail: "The school's history dates his predecessor organisation to 1977; this is not the launch date of the current London Hammer School." },
      { name: "Mick Jones", connection: "First member of predecessor West London Hammer School", detail: "The official history identifies the Olympic and Commonwealth hammer thrower as an early participant, not a confirmed present member." },
      { name: "Jamie Bath", connection: "London Hammer School open-session contact in 2026", detail: "England Athletics' July–August 2026 throws newsletter names him for the school's September open throwing session; no athlete membership inferred from coaching." }
    ],
    sources: [{ title: "Official school history: 1977 predecessor and 2024 launch", url: "https://londonhammerschool.co.uk/history" }, { title: "Official introduction and coaching approach", url: "https://londonhammerschool.co.uk/index" }, { title: "Official venues and advertised sessions", url: "https://londonhammerschool.co.uk/contact" }, { title: "Official enquiry form", url: "https://londonhammerschool.co.uk/contact?bias=1" }, { title: "England Athletics throws newsletter, July–August 2026, reproduced by Shaftesbury Barnet Harriers", url: "https://sbharriers.co.uk/england-athletics-community-throws-newsletter-july-august-2026/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://londonhammerschool.co.uk/index", address: "Lee Valley Athletics Centre, 61 Meridian Way, London, N9 0AR", address_kind: "training" },
    location_note: "Lee Valley and Willesden are different training venues. Satellite ambitions do not establish a weekly timetable at every named location.",
    contact_note: "Email published for the 2026 open throwing session; enquiry form available for current arrangements. No phone or Instagram destination inferred. Undated memorial-event plans are not a confirmed event date."
  },
  "huub-performance-project": {
    summary: "HUUB Performance Project connects recreational runners, cyclists and swimmers through a brand-supported club community, listed in Derby by England Athletics.",
    biography: [
      "HUUB Performance Project is listed in Derby, England, and offers a community for runners, cyclists and swimmers with different goals. HUUB's introduction welcomes people preparing for anything from a short run to a sportive or an open-water swim. It is a participation club, not a claim that every member belongs to a sponsored elite team.",
      "The official page describes free membership without an obligation to buy kit, despite appearing beside a singlet for sale. Members are invited to a Facebook community where they can find nearby training partners and arrange runs, rides, swims and parkrun meet-ups. This member-led model does not establish a fixed coached timetable.",
      "HUUB describes affiliations across athletics, triathlon, cycling and cycle time trials. Check the applicable individual registration or licence requirements separately. Its published Performance Project support email concerns possible additional support and sponsorship; joining details should be confirmed through the project page."
    ],
    sources: [{ title: "Official HUUB Performance Project introduction, membership and support", url: "https://huubdesign.com/products/huub-performance-project" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://huubdesign.com/products/huub-performance-project" },
    location_note: "Moorways Stadium is retained as directory context, not a newly confirmed training start. No global scope inferred.",
    contact_note: "Founding year, current timetable and notable-member history unresolved. Brand ambassadors are not automatically club members; no private Facebook URL inferred."
  },
  "city-of-stoke-ac": {
    summary: "City of Stoke AC is a Northwood Stadium athletics club in Stoke-on-Trent, with junior and senior membership and a documented international-athlete heritage.",
    biography: [
      "City of Stoke AC is based at Northwood Stadium in Hanley, Stoke-on-Trent, England. England Athletics' June 2019 club visit describes a busy track-and-field setting with athletes of different ages and abilities, volunteer coaches and an outdoor throws area. The stadium has hosted county championships, English Schools competition and England Athletics combined events.",
      "That account highlights athletes including Ben Williams and Ashleigh Nelson as part of the club's sporting heritage. More recently, England Athletics named Jazmin Sawyers with a City of Stoke affiliation when announcing her as a Team England captain for the July 2026 Commonwealth Games. These dated associations describe the club's history without assuming anyone's present membership.",
      "The club-hosted Clubforce page currently offers junior and senior membership plans for the 2026 season, valid to the end of December. It provides a practical membership route while the older website is unavailable. Prospective athletes should confirm the appropriate coaching group, session and availability before attending; a membership plan alone is not a training timetable."
    ],
    notable_members: [
      { name: "Jazmin Sawyers", connection: "City of Stoke-affiliated athlete in the July 2026 England announcement", detail: "England Athletics named the long jumper with City of Stoke when announcing her Team England captaincy on 26 July 2026. Dated affiliation, not a present-membership guarantee." },
      { name: "Ben Williams", connection: "Athlete in the club's documented heritage", detail: "England Athletics' 13 June 2019 club-visit account names him among athletes associated with City of Stoke. Historical association only." },
      { name: "Ashleigh Nelson", connection: "Athlete in the club's documented heritage", detail: "England Athletics' 13 June 2019 account names her in the club's athlete heritage. No current membership or coaching role claimed." }
    ],
    sources: [{ title: "England Athletics club visit, 13 June 2019", url: "https://www.englandathletics.org/news/ceo-club-visit-city-of-stoke-ac/" }, { title: "England Athletics Team England captaincy announcement, 26 July 2026", url: "https://www.englandathletics.org/news/jazmin-sawyers-and-scott-lincoln-to-captain-team-england-athletics-and-para-athletics-commonwealth-games-team/" }, { title: "Club-hosted Clubforce membership page, rendered 17 October 2026", url: "https://stokeac.clubforce.com/products/membership" }],
    reviewed_at: "2026-10-17",
    corrections: { address_kind: "training" },
    location_note: "Northwood Stadium is supported as the club's athletics base; the 1986 stand opening is not a club founding date.",
    contact_note: "Founding year, direct enquiry email/phone and current session timetable unresolved. Clubforce Facebook and Instagram links retained; its cityofstokefc Twitter link excluded as an unresolved apparent football mismatch. Supplier contacts excluded."
  },
  "run-mummy-run-crc": {
    summary: "Run Mummy Run CRC is the affiliated running-club branch of a women's online community built around encouragement, shared outings and staying connected.",
    biography: [
      "Run Mummy Run CRC is an England Athletics-listed virtual club in England, linked to the wider Run Mummy Run women's community. Leanne Davies founded that community in 2012 after having her second child, using Facebook to connect with other women who wanted to run. The community's origin should not be mistaken for the affiliated club's founding date.",
      "Run Mummy Run's own launch announcement describes the Community Run Club as a separate development, in association with ASICS, led by Davies and Rebecca Richardson. Its invitation centres on women supporting one another in running rather than meeting a single performance standard. The wider community still publishes routes into its online group and newsletter; these are not automatically the same as affiliated-club registration.",
      "Regional volunteers have helped translate online encouragement into real-world connections. England Athletics' November 2021 awards account recognised Yorkshire administrator and ambassador Kathryn Harrison for keeping runners in touch during lockdown, arranging buddies and supporting meet-ups. For current CRC membership, local outings and eligibility, start with the official community channels and confirm the arrangements rather than assuming a fixed clubhouse or weekly session."
    ],
    notable_members: [
      { name: "Leanne Davies", connection: "Founder of the parent Run Mummy Run community", detail: "The official community introduction dates her founding of the wider network to 2012; its CRC launch announcement also names her as a club lead." },
      { name: "Rebecca Richardson", connection: "CRC launch lead", detail: "Run Mummy Run's own launch announcement names Rebecca, also known as Becs, alongside Leanne Davies. Historical launch role, not a verified current office." },
      { name: "Kathryn Harrison", connection: "Parent community's Yorkshire volunteer recognised in 2021", detail: "England Athletics' 25 November 2021 awards account describes her regional administrator and ambassador work; it does not establish a current CRC officer role." }
    ],
    sources: [{ title: "Official Run Mummy Run community introduction and origins", url: "https://runmummyrun.eo.page/jointhecommunity" }, { title: "Official community links", url: "https://linktr.ee/RunMummyRun" }, { title: "Run Mummy Run's own Community Run Club launch announcement", url: "https://www.linkedin.com/posts/run-mummy-run_we-have-done-it-the-long-awaited-run-activity-6811310925228867584-du8o" }, { title: "England Athletics Yorkshire and Humber volunteer awards, 25 November 2021", url: "https://www.englandathletics.org/news/yorkshire-and-humber-regional-volunteer-awards-meet-the-winners-and-runners-up/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://linktr.ee/RunMummyRun" },
    location_note: "Virtual club: town, address and postcode remain empty. South East directory classification is not a clubhouse or global-scope claim.",
    contact_note: "Exact CRC founding date and current direct membership email/phone unresolved. Historical marketing address not reused as a current joining contact. Community sign-up is not proof of current CRC registration availability."
  }
};
