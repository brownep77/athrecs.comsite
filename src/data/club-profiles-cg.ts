import type { ClubProfile } from "./club-profiles";

// Batch 85: recovered club pages, community organising and qualified historical sources.
export const recoveredParticipationAndCommunityProfiles: Record<string, ClubProfile> = {
  "ventura-runners": {
    summary: "Ventura Runners brings structured training and a welcoming running community to Tidworth, Wiltshire, with track sessions and a strong connection to military life.",
    biography: [
      "Ventura Runners is a running club in Tidworth, Wiltshire, England, welcoming people working towards a first parkrun as well as runners pursuing performance goals. Its programme includes Tuesday track work at Tidworth Oval and Thursday training at Tedworth Park. Check with the club before attending to confirm the session and the right group for your experience.",
      "Founder, president and coach Joe Foreshew brings an Army endurance-coaching background to the club. The club's team page also credits him as a co-founder of Tidworth parkrun. That local connection sits alongside an understanding of military life: the club describes how its online community helps serving personnel, families and veterans stay connected through postings and the transition to civilian life.",
      "Membership options include senior, junior, second-claim and training-only arrangements, with the membership year running from April to March. Prospective members can use the published club email or telephone to discuss joining. The club's founding year has not been confirmed, and its support for members overseas does not make it a geographically global club."
    ],
    notable_members: [{ name: "Joe Foreshew", connection: "Founder, president and coach", detail: "The club identifies Foreshew as its founder and describes his former Army endurance-coaching role and co-founding of Tidworth parkrun." }],
    sources: [{ title: "Club welcome, military community and membership options", url: "https://www.vrrunners.co.uk/" }, { title: "Club coaching team and founder", url: "https://www.vrrunners.co.uk/meet-the-team" }, { title: "Group training locations", url: "https://www.vrrunners.co.uk/items" }, { title: "Public club email and telephone", url: "https://www.vrrunners.co.uk/contact-us" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "Tidworth Oval is a training venue, not the start of every session; Thursday training is listed at Tedworth Park.",
    contact_note: "Contact and training pages were readable on the first retrieval but unavailable on a later retry; confirm arrangements before attending."
  },
  "grimsby-harriers-and-ac": {
    summary: "Grimsby Harriers Athletic Club develops running, jumping and throwing skills at King George V Stadium in Grimsby, North East Lincolnshire.",
    biography: [
      "Grimsby Harriers Athletic Club traces its organised athletics provision to 1906. Based in Grimsby, North East Lincolnshire, England, the volunteer-run club serves the surrounding area through track-and-field training. Young beginners learn through games in the Fundamentals group, then move towards more technical running, jumping and throwing work in Foundations.",
      "More experienced athletes can develop specific events, including sprints and hurdles, middle-distance running, jumps and throws. The club also highlights the officials who make competition possible, encouraging involvement in judging, timekeeping and other event roles alongside taking part as an athlete.",
      "Monday and Wednesday sessions use King George V Athletic Stadium on Weelsby Road. The homepage advertises 6–8pm, while the contact page also gives a 5.30pm arrival time: ask the club which time applies to your group. The stadium is explicitly not a postal address. Use the administration email for enquiries; no founding members or notable alumni are inferred from the website's unfinished template sections."
    ],
    founded_year: 1906,
    sources: [{ title: "Club introduction and training groups", url: "https://grimsbyharriers-athletics.org.uk/" }, { title: "Club contact, venue and no-post instruction", url: "https://grimsbyharriers-athletics.org.uk/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://grimsbyharriers-athletics.org.uk/", address_kind: "training" },
    location_note: "King George V Stadium is a training base. The club specifically asks that mail is not sent there.",
    contact_note: "The published administration email is retained; generic legal-theme placeholder content is excluded. Confirm group start times."
  },
  "white-cliffs-athletics-and-running-club": {
    summary: "White Cliffs Athletics & Running Club grew from a community effort to restore junior athletics in Dover, Kent, in March 2023.",
    biography: [
      "White Cliffs Athletics & Running Club was established in Dover, Kent, England, in March 2023. England Athletics describes coaches, parents and supporters coming together after local junior athletics provision was lost. Their aim was affordable access to running, jumping and throwing, supported by Dover District Council's community development officer.",
      "The project was runner-up in the community category at the South East Volunteer Awards in November 2023. At that time, its weekly track programme combined two athletics activities with endurance work, and an adult running group met alongside the children's session. A Kent Community Foundation grant helped provide club kit.",
      "The club's own community-fundraising description emphasises continuing and expanding opportunities for children. The 2023 award report establishes its beginnings, not today's prices, attendance numbers or timetable. Prospective families should confirm current groups and joining arrangements; the Duke of York's school address remains directory-listed rather than a newly verified session start."
    ],
    founded_year: 2023,
    sources: [{ title: "England Athletics award report, 16 November 2023", url: "https://www.englandathletics.org/news/south-east-volunteer-awards-evening/" }, { title: "Club's first-person community-fundraising description", url: "https://www.doverlotto.com/support/dover-athletics-and-running-club" }],
    reviewed_at: "2026-10-16",
    location_note: "The school address retains directory provenance; current group times and venue access need confirmation.",
    contact_note: "No general enquiry email or telephone was confirmed. Lottery operator contacts are not club contacts."
  },
  "shildon-running-and-ac": {
    summary: "Shildon Running & Athletic Club is a County Durham athletics club with a 1986 foundation and a training base at Stadium 2000.",
    biography: [
      "Shildon Running & Athletic Club was formed in 1986 in Shildon, County Durham, England. Its first-person entry in the independent british-athletics.co.uk directory describes a move to Stadium 2000 on Middridge Lane around the start of the new millennium. The account covers middle-distance running, sprints, jumps and throws, together with track-and-field and cross-country league competition.",
      "That undated club entry also records the Anne Marie Redshaw Open meeting and a junior pathway beginning at age eight. These are historical programme details, not a guarantee of a current event, age threshold or free taster. The separate Club Durham listing identifies Wednesday club nights at Shildon Athletic Track and includes adult, junior and disability session categories.",
      "Prospective athletes should establish current group availability and meeting arrangements before attending. The former Thickley Terrace directory contact address is not substituted for the stadium training venue. The club website could not be read during this review, and no current email, telephone or notable-member history has been guessed."
    ],
    founded_year: 1986,
    sources: [{ title: "First-person club entry in independent directory, undated", url: "https://www.british-athletics.co.uk/clubs/club0343.htm" }, { title: "Club Durham session and track listing", url: "https://www.clubdurham.co.uk/clubs/shildon-running-and-athletics-club/" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "Stadium 2000 is the documented athletics base; group access and times require confirmation.",
    contact_note: "The Club Durham link labelled as a website points to Twitter instead; it is not adopted as an official club URL."
  },
  "the-outrunners": {
    summary: "The Outrunners combines adult running in Hackney, East London, with a youth charity supporting access to movement and opportunities across neighbouring communities.",
    biography: [
      "The Outrunners connects running with community work in Hackney, East London, England. Alongside its adult club, Outrunners Youth works with schools and communities in Hackney, Newham and Tower Hamlets. The organisation says it became a charity in 2020; that milestone is not used as the founding year of the running club.",
      "The Tuesday mixed group trains on local streets, in parks and beside canals, starting from Hackney Bridge. These are coached speed and endurance sessions for runners with some experience: the published guide asks participants to be able to run roughly 10K in an hour. Booking is through the club's Heylo community, with membership and occasional-session options. Confirm the meeting point before travelling, as the session page names Unit DG04 while the contact page gives Unit D.1.04 in the Echo Building.",
      "The separate youth programme includes school activity and community sessions for ages eight to eighteen, organised into age groups. Qualified youth practitioners and volunteers lead these activities, with families directed to the charity's enquiry route. In 2026 it introduced a free five-week summer programme with sport, creative activities and trips. This youth provision is distinct from joining the adult running session; the club's adult membership classification is retained."
    ],
    sources: [{ title: "Youth charity origins, schools and 2026 summer programme", url: "https://www.theoutrunners.co.uk/charity-1" }, { title: "Tuesday mixed sessions and booking guidance", url: "https://www.theoutrunners.co.uk/tuesday-session" }, { title: "Contact address", url: "https://www.theoutrunners.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.theoutrunners.co.uk/", address_kind: "training" },
    location_note: "Hackney Bridge is the session base. Unit DG04 on the training page differs from Unit D.1.04 on the contact page; confirm the entrance.",
    contact_note: "The session page publishes the general enquiries email. The youth charity and adult club have different participation routes."
  },
  "athletics-ni-west-belfast-coolers": {
    summary: "West Belfast Coolers is an Athletics Northern Ireland-affiliated running club with a documented role in Féile road running and Belfast's wider running community.",
    biography: [
      "West Belfast Coolers is a running and athletics club based in west Belfast, Northern Ireland. Its community connections include Féile an Phobail: in a first-person account published on 13 August 2019, festival attendee Brendan Mulgrew described a five-mile run along the Falls and Andersonstown Roads delivered with the club.",
      "More recently, Athletics Northern Ireland listed the Féile 5K and 10K for 2 August 2026, starting at Malone Integrated College on Finaghy Road and using a West Belfast Coolers event-team email. That dated race listing is not a current booking offer or evidence that the college is the club's regular training base. Belfast City Marathon's half-marathon pacing page also identifies Mark Carey with the club; the page does not specify the year of that association.",
      "For membership and training enquiries, use the club contact in Athletics Northern Ireland's affiliated-club directory. It differs from the race-team address. A current weekly timetable, junior entry arrangements, founding date and permanent venue remain unconfirmed, so prospective runners should ask before travelling."
    ],
    notable_members: [{ name: "Mark Carey", connection: "Organiser-listed half-marathon pacer", detail: "Belfast City Marathon's undated pacing-team page identifies Carey with West Belfast Coolers. The listing does not establish a membership period or an individual race result." }],
    sources: [{ title: "Athletics Northern Ireland affiliated-club contact", url: "https://athleticsni.org/About/Find-A-Club" }, { title: "Governing-body listing for Féile, 2 August 2026", url: "https://athleticsni.org/Fixtures/Feile-10k--5k" }, { title: "Brendan Mulgrew's first-person festival account, 13 August 2019", url: "https://www.irishnews.com/business/2019/08/13/news/fe-ile-offers-a-better-way-forward-for-our-young-people-on-hot-august-nights-1682951/" }, { title: "Belfast half-marathon organiser's undated pacing-team page", url: "https://belfastcitymarathon.com/training-and-support/charles-hurst-pacing-team/half-marathon-pacing-team" }],
    reviewed_at: "2026-10-16",
    location_note: "West Belfast area only; the dated Féile race start is not treated as a training venue.",
    contact_note: "The directory-listed Hotmail club address is retained. The separate Gmail race-team address and an older 2018 directory address are not substituted."
  }
};
