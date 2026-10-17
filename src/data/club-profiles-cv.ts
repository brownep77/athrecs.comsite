import type { ClubProfile } from "./club-profiles";

// Batch 100: recovered volunteer, beginner-running and multisport histories.
export const recoveredVolunteerAndBeginnerProfiles: Record<string, ClubProfile> = {
  "kids-run-redditch": {
    summary: "Kids Run Redditch is a volunteer-led children's running club at Abbey Stadium in Redditch, combining accessible track activity with opportunities for young volunteers.",
    biography: [
      "Kids Run Redditch began in 2023 to make running enjoyable and accessible for children and young people in Redditch, Worcestershire, England. Founder Jason Furness describes its approach in a Buddle community case study: free Saturday gatherings at the Abbey Stadium athletics track, centred on a twenty-minute run rather than a prescribed race distance.",
      "Volunteering is part of the experience, including for the children. Young helpers welcome other participants, distribute lap stickers and help set up the session, while adults organise activities and fundraising. The club has supported its work through quiz nights, a twenty-four-hour relay and appearances at local community events.",
      "England Athletics named Kids Run Redditch runner-up for Community Project of the Year in the West Midlands in September 2024, recognising its family involvement and connections with other clubs and children's races. Families should check the club's latest arrangements before visiting: the published case study describes its format, not guaranteed availability on every Saturday. The Facebook group linked by Buddle provides a route to look for announcements."
    ],
    founded_year: 2023,
    notable_members: [{ name: "Jason Furness", connection: "Club founder", detail: "Named as founder in Buddle's first-person account of the club's volunteering approach. This is an organisational association, not an athlete identity or result." }],
    sources: [
      { title: "Buddle: Kids Run Redditch founder account and volunteer programme", url: "https://buddle.co/community/your-stories/kids-run-redditch" },
      { title: "England Athletics West Midlands Volunteer Awards, 9 September 2024", url: "https://www.englandathletics.org/news/volunteer-awards-evening-2024-west-midlands/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { address_kind: "training", socials: [
      { platform: "Facebook", url: "https://www.facebook.com/groups/167109732764016/", source_url: "https://buddle.co/community/your-stories/kids-run-redditch", checked_at: "2026-10-17" },
      { platform: "YouTube", url: "https://www.youtube.com/@kidsrunredditch", source_url: "https://buddle.co/community/your-stories/kids-run-redditch", checked_at: "2026-10-17" }
    ] },
    location_note: "Abbey Stadium is the activity venue, not a correspondence address.",
    contact_note: "Own website returned 403. Public email, telephone, current session availability and registration requirements remain unresolved. Canonical Facebook group replaces the opaque directory share link; original directory provenance retained. Social destinations blocked or throttled, so links are attributed to Buddle rather than account-ownership verification."
  },
  "south-cambridge-striders": {
    summary: "South Cambridge Striders is a Trumpington running club offering sociable road and trail runs, Couch to 5K and half-marathon preparation in south Cambridge.",
    biography: [
      "South Cambridge Striders started in January 2024 and is based around Trumpington in Cambridge, England. The club's own ClubSpark introduction puts conversation and companionship at the centre of its running, welcoming people from beyond south Cambridge as well as those living nearby. It is affiliated to England Athletics.",
      "The programme includes Sunday and Tuesday runs, a January Couch to 5K course and a beginners' five-kilometre group for graduates. It also organises preparation groups for the Cambridge Half Marathon. A published April 2026 run description explains the local mix of roads and trails and the seasonal switch between Trumpington Meadows Primary School and Trumpington Community College.",
      "New runners can try three sessions before deciding whether to join. The membership page separates ordinary adult club membership from the option including individual England Athletics registration, and applications require approval. Course dates and meeting points should be checked with the club before attending; an old booking marked unavailable is not a current invitation. The public enquiries email is the simplest route for questions about a suitable group."
    ],
    founded_year: 2024,
    sources: [
      { title: "Club-hosted ClubSpark introduction, origin and public email", url: "https://clubspark.englandathletics.org/SouthCambridgeStriders" },
      { title: "Official Membermojo membership options and trial sessions", url: "https://membermojo.co.uk/southcambridgestriders" },
      { title: "Club run description, 14 April 2026: seasonal meeting points", url: "https://clubspark.englandathletics.org/SouthCambridgeStriders/Coaching/Summary/89cf9a4f-ed58-4d72-be2e-8c1ffa122037" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { address_kind: "training" },
    location_note: "Trumpington Meadows Primary School is a documented spring/summer meeting point. The club also describes an autumn/winter start at Trumpington Community College; confirm the specific run's start.",
    contact_note: "Standalone website returned 403; club-hosted ClubSpark and Membermojo pages were readable. No telephone, exact Instagram URL or notable-member history established. Do not reuse the unavailable April booking as a forthcoming session."
  },
  "freck-and-warton-running-club": {
    summary: "Freck & Warton Running Club grew from Couch to 5K into an inclusive Lancashire club for road, trail and track running, usually meeting at Warton's Lightning Club.",
    biography: [
      "Freck & Warton Running Club serves Freckleton, Warton and the surrounding Fylde area of Lancashire, England. Its roots lie in a group that began working towards five kilometres in March 2017. The club dates its foundation and England Athletics affiliation to 2018, when the growing community developed a committee and supported run-leader training.",
      "The club's history credits Chris Adams, appointed chair in 2019, with making trail running a regular part of the programme and bringing more structure to sessions. Its activities range from sociable short runs to preparation for much longer distances. Freck & Warton also records winning Club of the Year at the 2022 Fylde Active Community Awards.",
      "Monday and Wednesday club runs usually start at the Lightning Club in Warton, with other routes and social outings arranged separately. Prospective members are offered a trial week and asked to book through RunTogether so leaders know to expect them. Check the latest listing for changes and ask about age eligibility before bringing a younger runner; the joining page describes an adult-focused club with conditions for under-sixteens. Its old 2024–25 fee table should not be treated as current."
    ],
    founded_year: 2018,
    notable_members: [
      { name: "Chris Adams", connection: "Chair appointed in 2019", detail: "The club's history credits him with developing regular trail running and more structured sessions. This is a dated organisational role, not confirmation of the current chair." },
      { name: "Ruth Gili-Ross", connection: "Founding member and published run-leader profile", detail: "Her club-hosted account describes helping establish the club and serving as secretary, run leader and ladies' captain. The undated account is not a current-office guarantee." }
    ],
    sources: [
      { title: "Official club history and public enquiries email", url: "https://fwrc.co.uk/about-us" },
      { title: "Official club introduction and 2022 community award", url: "https://fwrc.co.uk/" },
      { title: "Official joining guidance, trial week and age conditions", url: "https://fwrc.co.uk/joining-us" },
      { title: "Official contact form and usual meeting arrangements", url: "https://fwrc.co.uk/contact-us" },
      { title: "Club-hosted contact page: Lightning Club address", url: "https://clubspark.englandathletics.org/FreckandWartonRunners/Contact" },
      { title: "Club-hosted Ruth Gili-Ross biography", url: "https://clubspark.englandathletics.org/FreckandWartonRunners/Coaching/Coach/7929aca2-2431-4f1e-8a96-bdd4a48c2437?sessionID=439e7ae4-59ad-4025-875e-03494fe12110" },
      { title: "Official RunTogether group and social destinations", url: "https://groups.runtogether.co.uk/FreckandWartonRunners" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://fwrc.co.uk/", city: "Warton", address_kind: "training" },
    location_note: "Lightning Club, Mill Lane, Warton is the usual meeting base; other runs use different starts. Preston in the directory address is postal context.",
    contact_note: "No telephone confirmed. Existing Facebook page preserved alongside the separately published community group. Social destinations unavailable; attribution is to the official group page. Joining fees and dates on older pages are not presented as current."
  },
  "carlisle-tri-club": {
    summary: "Carlisle Tri Club is a volunteer-led swimming, cycling and running club founded in 2009, with a coaching community and a history of organising local road races.",
    biography: [
      "Carlisle Tri Club was formed in 2009 by a group of friends in Carlisle, Cumbria, England. Its organiser introduction describes a volunteer-led club supporting swimming, cycling and running, with coaches helping participants ranging from newcomers to experienced triathletes. That introduction explains the club's character without establishing a current membership total or weekly timetable.",
      "The club has also created racing opportunities locally. Its June 2024 ten-kilometre road race used country roads and finished by the grandstand at Carlisle Racecourse, according to the club's RaceBest listing. The racecourse was that event's headquarters, not evidence of a permanent club training base or an upcoming race date.",
      "Cumbria Wellbeing Hub's account of its community work describes Josh Waite's long-running volunteer coaching association with Carlisle Tri Club and names him as head coach in that account. Prospective members should confirm the current coaching team, session availability and joining arrangements through the club's official channels. The club website could not be read during this review, so no old race contact has been substituted for a present membership enquiry address."
    ],
    founded_year: 2009,
    notable_members: [{ name: "Josh Waite", connection: "Volunteer triathlon coach", detail: "Cumbria Wellbeing Hub describes his volunteer work for Carlisle Tri Club and identifies him as head coach in its published account, read 17 October 2026. Current office and membership period are not independently confirmed." }],
    sources: [
      { title: "Club organiser introduction on Let's Do This", url: "https://www.letsdothis.com/o/carlisle-tri-club-155106" },
      { title: "Club's RaceBest listing for its 9 June 2024 10K", url: "https://racebest.com/races/rw6rv" },
      { title: "Cumbria Wellbeing Hub's first-party volunteer account", url: "https://cumbriawellbeinghub.co.uk/charitable-work/" },
      { title: "Josh Waite's first-person coaching introduction", url: "https://cumbriawellbeinghub.co.uk/josh-waite/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { sports: ["Running", "Triathlon"] },
    location_note: "Green Lane remains directory context, not confirmed training. Carlisle Racecourse was the 2024 10K headquarters and is not substituted as the club's address.",
    contact_note: "Own website/about page returned 502. No current timetable, fees, role email, phone or official social URL established. Historic race contact and unrelated wellbeing-business contacts excluded; search-only secretary emails not adopted."
  },
  "ventoux-triathlon-club": {
    summary: "Ventoux Triathlon Club is based near Camlough in County Armagh, Northern Ireland, and participates in Triathlon Ireland's club community competition.",
    biography: [
      "Ventoux Triathlon Club is listed by Triathlon Ireland near Camlough in County Armagh, Northern Ireland. It brings together the three triathlon disciplines of swimming, cycling and running. The governing-body directory provides a public club email and indicates no junior section; families should not assume that a junior programme is available.",
      "Ventoux appears in Division Four of the inaugural Triathlon Club Community League in 2026. The October report describes a season-long participation competition, using eligible members' repeated racing to contribute towards club scores. Its tables remain subject to affiliation corrections until 23 October 2026, so this records participation rather than a final position, award or current membership count.",
      "For joining and training enquiries, use the published club email to ask which sessions are operating and where to meet. Camlough is a locality, not a confirmed pool, clubhouse or open-water start. This Northern Irish club must not be confused with Ventoux Triathlon Club Carpentras in France; the latter's history, coaches and race programme have not been assigned to this profile."
    ],
    sources: [
      { title: "Triathlon Ireland directory: Camlough club and public email", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "Triathlon Ireland Club Community League report, 15–16 October 2026", url: "https://www.triathlonireland.com/news/triathlon-club-community-league-divisions-results/" }
    ],
    reviewed_at: "2026-10-17",
    location_note: "Camlough/Armagh location correction from the previous review is retained. No exact training address established; Northern Ireland country indicator preserved.",
    contact_note: "Official website unavailable. Founding year, officers, notable members, telephone, social links and current timetable remain unresolved. Revisit any league placing after 23 October 2026."
  }
};
