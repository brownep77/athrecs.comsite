import type { ClubProfile } from "./club-profiles";

// Club-owned pages recovered and read through ordinary public HTTP on 18 October 2026.
export const recoveredDerbyAndMiddlewichProfiles: Record<string, ClubProfile> = {
  "rolls-royce-harriers": {
    summary: "Rolls-Royce Harriers is a Derby running club for employees, friends and family of Rolls-Royce, combining road, cross-country, track and fell running with a long tradition of club challenges.",
    biography: [
      "Rolls-Royce Harriers brings together employees, friends and family of Rolls-Royce in Derby, England. Its history reaches back well before the modern running boom: the club identifies a 1912 photograph as its earliest evidence, rather than giving a confirmed founding date. The Broome Cup cross-country race appears in its records from 1939, and an annual club championship began in the 1984–85 season. These long-running competitions connect the Harriers' industrial roots with the varied running programme described on its website today.",
      "Road racing, cross-country, track, fell and ultra-distance running all feature in the club championship. Members can also contribute by marshalling at Harriers events. The training page describes sociable runs, often after work on Wednesdays, with a typical distance of around five miles and pace and distance adjusted to the people taking part. Lunchtime challenges near the main Rolls-Royce site and local relays offer other ways to get involved. Details are circulated by email and through the club WhatsApp group, so the club captain is the appropriate contact for the next meeting point rather than assuming that every run starts at the directory address.",
      "Long-distance team adventures are another distinctive part of the club's story. Former captain John Thornhill inspired its Pennine Way relay, completed in June 2007, and helped organise it. Further non-stop relays covered Cornwall, Scotland, England and Wales; the club's retrospective records charity fundraising, mainly for Cancer Research UK, alongside those journeys. People interested in joining can download the form from the membership page and contact the membership secretary. That page distinguishes full, second-claim and non-competing membership; check the current arrangements with the club rather than relying on older fee figures."
    ],
    notable_members: [{ name: "John Thornhill", connection: "Former club captain and relay organiser", detail: "The club credits Thornhill with inspiring its long-distance relays and helping organise the Pennine Way relay completed in June 2007. This is a historical association, not a current office-holder claim." }],
    location_note: "Derby is confirmed by the club's own introduction. The existing Moor Lane pavilion address remains a governing-body directory address, not a newly verified training venue. The training page gives variable club runs and lunchtime challenges but no universal start point; no venue or postcode correction is inferred.",
    contact_note: "Reviewed 18 October 2026. The 2026 committee page identifies Bill Southgate for membership, James Ward for club runs and Gillian Whiteside for general enquiries. Two role contacts are added; the existing ECCA-sourced Gillian Whiteside email is preserved rather than duplicated. The joining page independently repeats the membership email. An obsolete Treasurer mailto target differs from the displayed address and is excluded; the website-maintainer email and retailer link are not club enquiry contacts. No new telephone or public social link was established. A photograph dated 1912 is earliest evidence, not a founding-year assertion; the company's 1904 foundation is not the club's date.",
    sources: [
      { title: "Rolls-Royce Harriers: history and earliest surviving evidence", url: "http://www.rollsroyceharriers.com/history.html" },
      { title: "Rolls-Royce Harriers: Derby community and club championship", url: "http://www.rollsroyceharriers.com/about-us.html" },
      { title: "Rolls-Royce Harriers: club runs and training communications", url: "http://www.rollsroyceharriers.com/training.html" },
      { title: "Rolls-Royce Harriers: long-distance relays and John Thornhill", url: "http://www.rollsroyceharriers.com/harriers-epics.html" },
      { title: "Rolls-Royce Harriers: joining procedure", url: "http://www.rollsroyceharriers.com/join-the-harriers.html" },
      { title: "Rolls-Royce Harriers: 2026 committee and public enquiry roles", url: "http://www.rollsroyceharriers.com/contact-us.html" }
    ],
    reviewed_at: "2026-10-18"
  },
  "run-middlewich": {
    summary: "Run Middlewich is a social running club in Middlewich, Cheshire, with mixed-ability runs from Kings Lock, beginner support and a locally organised 5k and family fun run.",
    biography: [
      "Run Middlewich brings runners together in Middlewich, Cheshire, England, with an emphasis on company and enjoyment. Its club introduction describes leaders trained through Leadership in Running Fitness and groups covering different distances and paces. The published meeting point is Kings Lock, with Tuesday evening and Saturday morning runs. Prospective runners should confirm arrangements before attending; the homepage also describes a no-subscription approach to its social running.",
      "The club organises the Middlewich 5k and describes a yearly Couch to 5k programme linked to that event. Its listing for 10 May 2026 planned a largely off-road route beside the town's canals and trails, starting at the Big Lock Pub and finishing at Middlewich Cricket Club. A three-lap family fun run was advertised at the cricket ground. These are details of the dated 2026 listing, not an announcement of the next race or confirmation that entries remain open. Neither event location should be confused with Kings Lock, the regular club meeting point.",
      "The community side extends beyond running. Members describe helping at Fiesta in the Field and the Middlewich Beer Festival, selling programmes at the Northwest Stages Rally, and getting together for walks, games and a summer barbecue. Newcomers can use the club's public enquiry routes to ask about a suitable group or the next beginner intake. No current course place or future event date is assumed."
    ],
    location_note: "The club homepage explicitly identifies Kings Lock, CW10 0JJ as its meeting point. The existing Kings Lock Inn address and postcode are retained and classified as training. The Big Lock Pub and cricket ground belong to the dated 2026 race route, not the regular training address.",
    contact_note: "Reviewed 18 October 2026. Ordinary public HTTP recovered the club homepage and its 2026 event page after HTTPS failures. Existing race-enquiry and ECCA handbook emails, their source URLs/check dates and the directory-attributed Facebook link are preserved. No new phone, email or social account was established. The website designer and race sponsors are excluded. Copyright 2019 is not treated as a founding year; the event page's unnamed charities and unconfirmed future beginner intake remain unresolved.",
    sources: [
      { title: "Run Middlewich: club introduction, meeting point and community activities", url: "http://runmiddlewich.club/" },
      { title: "Run Middlewich: dated 10 May 2026 5k and family fun-run listing", url: "http://runmiddlewich.club/middlewich-5k" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { website: "http://runmiddlewich.club/", address_kind: "training" }
  },
  "redcar-running-club": {
    summary: "Redcar Running Club is an adult running community on England's North East coast, established in 1986, with a history of road racing, off-road running and mutual support across a wide range of distances.",
    biography: [
      "Redcar Running Club was established in 1986 in Redcar, England. Its own introduction describes a community ranging from occasional parkrun participants to marathon and ultramarathon runners, with encouragement valued as much as race times. The club's older website places its social base at Redcar Cricket Club on the Yorkshire coast. That is useful historical context, but the homepage now warns that it is no longer regularly monitored and directs visitors to the club's Facebook page for the latest information.",
      "The archive shows how training and local events have brought members together. In August 2018 the club reported the first of three England Athletics ClubRun coaching sessions, while its 2018 and 2019 Redcar Running Festival accounts describe the annual club photograph and members running, marshalling or supporting others. The training pages introduce run-walk progression, endurance, speed work and off-road running. These records describe the club's activities at the time; they are not a current coaching timetable or a claim that the visiting coach is a member.",
      "The older joining page invited people to try a run before committing and explained that a little existing running experience would make it easier to find company. It also described separate track-facility charges and a club championship. Fees, trial terms, session times and venues on that unmaintained page should be checked with the club before attending. The current catalogue's dated handbook enquiry contact is retained, alongside the social route explicitly recommended by the club, without assuming that former committee members still hold office."
    ],
    founded_year: 1986,
    location_note: "Redcar is confirmed by the club's own pages. The existing Greenlands Road directory address and postcode are retained as directory details. The unmaintained website's cricket-club base and older track venues do not establish a current training address, so no street or venue correction is made.",
    contact_note: "Reviewed 18 October 2026. The homepage explicitly says it is no longer regularly monitored and recommends its linked Facebook page. That Facebook route and the site's Twitter link are source-attributed, not independently verified as currently active. The ECCA 2026–2027 email remains unchanged. The legacy info mailbox and enquiry form are not promoted as newly verified contact methods; no phone is added. Old membership fees, approximate member counts and named committee roles are not treated as current. No athlete identity, race result or notable-member claim is created.",
    sources: [
      { title: "Redcar Running Club: maintenance warning, official social links and dated club news", url: "http://www.redcarrunningclub.co.uk/" },
      { title: "Redcar Running Club: 1986 origins and club introduction", url: "http://www.redcarrunningclub.co.uk/about-us/" },
      { title: "Redcar Running Club: historical joining and trial-run information", url: "http://www.redcarrunningclub.co.uk/join/" },
      { title: "Redcar Running Club: training guidance and off-road introduction", url: "http://www.redcarrunningclub.co.uk/train/" }
    ],
    reviewed_at: "2026-10-18"
  }
};
