import type { ClubProfile } from "./club-profiles";

// Batch 94: recovered community, virtual and track-club primary sources.
export const recoveredCommunityAndVirtualProfiles: Record<string, ClubProfile> = {
  "arete-run-club": {
    summary: "Arete Run Club brings Norwich runners together for timed intervals and longer social runs, with trial sessions before joining.",
    biography: [
      "Arete Run Club is a community-focused running club in Norwich, Norfolk, England. Its members train for distances from 5K to ultramarathons, combining individual goals with regular group sessions. Thursday intervals start at 6.30pm at the football-ground end of Morrisons car park on Carrow Road. Timed efforts let different paces start and finish together.",
      "Sunday social runs cover 10K or 20K from Nothing Fancy in Chapelfield Gardens, usually at around 5:30 per kilometre. Check the club's weekly updates for routes and start times. Prospective members can try a session before joining; first-claim and second-claim options include monthly track sessions. The homepage provides membership and enquiry forms."
    ],
    sources: [{ title: "Official story, sessions, membership and enquiry form", url: "https://areterunclub.com/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://areterunclub.com/", address_kind: "training" },
    location_note: "Chapelfield Gardens is the Sunday meeting point, not the Thursday interval venue.",
    contact_note: "No founding year or full founder name established. No direct email or phone published; form placeholder excluded."
  },
  "tetbury-dolphins-running-club": {
    summary: "Tetbury Dolphins Running Club grew from a local initiative in Gloucestershire, with a documented history of beginner running and parkrun volunteering.",
    biography: [
      "Tetbury Dolphins Running Club serves Tetbury, Gloucestershire, England. In a September 2018 interview, co-founder Eileen Hodgson explained that she and Susan Rawle had started the club because nearby affiliated options meant travelling to Cirencester or Stroud. England Athletics helped train run leaders, and the first wet evening at the recreation centre still attracted around twenty runners.",
      "That account describes Couch to 5K, families running together and members tackling distances from parkrun to ultras. It also records a volunteer takeover at Cirencester parkrun. These are examples from the club's early development, not confirmation of today's programme.",
      "Tetbury Town Council publishes a chair's email for enquiries. Use it to confirm current training, membership and beginner opportunities before attending. The rugby-club address remains directory context: the 2018 interview described that base as potentially temporary."
    ],
    notable_members: [
      { name: "Eileen Hodgson", connection: "Co-founder", detail: "Interviewed as chair in September 2018; not a current-role claim." },
      { name: "Susan Rawle", connection: "Co-founder", detail: "Named in Hodgson's September 2018 account of the club's origins." }
    ],
    sources: [{ title: "Co-founder interview, The Local Answer, 26 September 2018", url: "https://www.thelocalanswer.co.uk/news/sport/running/1810-cots-general-dolphins-running.aspx?area=cotswold&y=2018" }, { title: "Town council directory: club chair contact", url: "https://tetbury.gov.uk/directory/" }],
    reviewed_at: "2026-10-17",
    location_note: "Rugby-club directory address retained; present training base needs confirmation.",
    contact_note: "Club-managed pages unavailable. Exact founding year, current timetable and membership eligibility remain unconfirmed."
  },
  "pudsey-runners": {
    summary: "Pudsey Runners is part of Pudsey's bowling, running and table-tennis club community in West Yorkshire, with a dedicated running-group Facebook link.",
    biography: [
      "Pudsey Runners belongs to the sporting community at Pudsey Bowling, Running and Table Tennis Club in Pudsey, West Yorkshire, England. The parent club includes running among its membership options and advertises running coaching alongside its other sports. Its shared lounge and social facilities give the running section a place within a wider local club.",
      "The parent club directs runners to a dedicated Pudsey Runners Facebook group. That is the published route for finding out more about the section; current run times, distances and beginner arrangements were not available in the readable pages. Confirm those details before a first visit rather than using the bar's opening hours as a running timetable.",
      "The shared club premises are on Windmill Hill, with car-park entrances from Smalewell Road. This is a clubhouse location, not evidence that every run starts there. The bowling club's 1910 foundation should not be mistaken for the founding year of Pudsey Runners."
    ],
    sources: [{ title: "Parent club: running section, membership and coaching", url: "https://www.pudseybc.co.uk/" }, { title: "Shared club premises and access", url: "https://www.pudseybc.co.uk/how-to-find-us/" }],
    reviewed_at: "2026-10-17",
    corrections: { address: "Pudsey Bowling, Running and Table Tennis Club, Windmill Hill, Pudsey", postcode: "LS28 8JQ", address_kind: "clubhouse" },
    location_note: "Shared clubhouse, not a universal run start; replaces the unconfirmed Swinnow Green directory address.",
    contact_note: "Dedicated running-group link recovered. Parent-club general email/phone not presented as running-section contacts. Founding year and notable members unconfirmed."
  },
  "st-marys-richmond-ac": {
    summary: "St Mary's Richmond AC is a Twickenham athletics club based at the Sir Mo Farah Athletics Track, with track-and-field and cross-country competition.",
    biography: [
      "St Mary's Richmond AC is based at the Sir Mo Farah Athletics Track in Twickenham, Greater London, England. Its club-supplied OpenTrack introduction identifies Southern Athletics League and Metropolitan Cross Country League competition, linking summer athletics with winter cross-country. Middlesex County AA also lists the club and its blue-and-white quartered colours.",
      "The club's OpenTrack record includes open meetings at the track in September 2018 and September 2019, and a Robin Chandler Memorial Match dated 14 June 2026. These provide examples of its meeting programme, rather than a promise of future fixtures or proof of any individual's participation.",
      "Prospective athletes should use the public club and secretary emails published by Middlesex County AA to ask about training groups, age requirements and joining. The club's own pages were unavailable during this review, so no current timetable, fee or availability of places is assumed. The university address identifies the athletics base rather than a separate correspondence office."
    ],
    sources: [{ title: "Club-supplied OpenTrack introduction and meeting list", url: "https://data.opentrack.run/en-gb/o/gbr/smrac/" }, { title: "Middlesex County AA affiliated clubs and role contacts", url: "https://middlesexaa.org.uk/clubs/" }],
    reviewed_at: "2026-10-17",
    corrections: { address_kind: "training" },
    location_note: "Sir Mo Farah Athletics Track at St Mary's University is the documented athletics base.",
    contact_note: "County role emails recovered; committee names not assumed current. Founding history, notable members and current joining capacity remain unresolved."
  },
  "the-running-hub": {
    summary: "The Running Hub combines an England Athletics-affiliated running club with online coaching and a separate community programme of training resources and group support.",
    biography: [
      "The Running Hub is an England Athletics-affiliated running club with a virtual format, listed in England's South East. It offers a club identity for runners who also use its online community or individual coaching. The 2026 club page distinguishes first-claim and second-claim membership; joining the community or buying coaching should not be confused with completing the club application.",
      "The wider online programme includes downloadable 5K-to-half-marathon plans, strength and core workouts, live and recorded yoga, and regular opportunities to ask coaches questions. Members can share their training experiences without needing a single local meeting point. The published team includes head coaches James Down and Katie Down, alongside running, triathlon, nutrition and strength specialists.",
      "The club application is linked from the TRH Running Club page. James Down is the published contact for membership and England Athletics queries, while Katie Down is listed as chair. Ask which club, community or coaching option fits your plans and confirm the applicable costs. No town-based training venue or worldwide club scope is inferred from the online format."
    ],
    notable_members: [{ name: "Katie Down", connection: "Club chair and head coach", detail: "Named on the club's 2026 membership page and team page, read 17 October 2026." }, { name: "James Down", connection: "Membership secretary and head coach", detail: "Published club joining contact on the 2026 membership page; also named on the coaching team page." }],
    sources: [{ title: "TRH club membership and committee, 2026", url: "https://therunninghub.co.uk/trh-running-club/" }, { title: "Online community programme", url: "https://therunninghub.co.uk/the-running-hub-community/" }, { title: "Coaching team", url: "https://therunninghub.co.uk/meet-the-team/" }],
    reviewed_at: "2026-10-17",
    location_note: "Virtual club with no shared town-based training address established; South East is directory context.",
    contact_note: "Membership and chair emails recovered. Community and team pages name different yoga instructors, so no current yoga-leader claim is made. Founding year unconfirmed."
  }
};
