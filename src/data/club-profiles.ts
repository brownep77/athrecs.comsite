import type { ClubSeed } from "./types";
import { additionalClubProfiles } from "./club-profiles-b.ts";
import { furtherClubProfiles } from "./club-profiles-c.ts";
import { regionalClubProfiles } from "./club-profiles-d.ts";
import { communityClubProfiles } from "./club-profiles-e.ts";
import { midlandsAndIrelandClubProfiles } from "./club-profiles-f.ts";
import { coastalAndRegionalClubProfiles } from "./club-profiles-g.ts";
import { southernAndMultisportClubProfiles } from "./club-profiles-h.ts";
import { northernAndCommunityClubProfiles } from "./club-profiles-i.ts";
import { yorkshireWelshAndIrishClubProfiles } from "./club-profiles-j.ts";
import { midlandsWelshAndLaoisClubProfiles } from "./club-profiles-k.ts";
import { southEastAndCommunityClubProfiles } from "./club-profiles-l.ts";
import { southEastAndNorthernClubProfiles } from "./club-profiles-m.ts";
import { yorkshireAndNorthernCommunityProfiles } from "./club-profiles-n.ts";
import { borderAndCommunityClubProfiles } from "./club-profiles-o.ts";
import { northWestAndCommunityProfiles } from "./club-profiles-p.ts";
import { southWestAndCommunityProfiles } from "./club-profiles-q.ts";

import { islandAndRegionalClubProfiles } from "./club-profiles-r.ts";

import { regionalContinuationProfiles } from "./club-profiles-s.ts";

import { communityHeritageProfiles } from "./club-profiles-t.ts";
import { runningAndTriathlonCommunityProfiles } from "./club-profiles-u.ts";
import { valleysAndCommunityProfiles } from "./club-profiles-v.ts";
import { cityAndCommunityProfiles } from "./club-profiles-w.ts";

export type ClubProfile = {
  summary: string;
  biography: string[];
  founded_year?: number;
  scope?: "national" | "global";
  location_note?: string;
  contact_note?: string;
  notable_members?: Array<{ name: string; connection: string; detail: string }>;
  sources: Array<{ title: string; url: string }>;
  reviewed_at: string;
  corrections?: Partial<ClubSeed>;
};

// Editorial club facts only. These associations do not create or claim athlete accounts.
// Sources were opened and read; unknown dates, venues and membership periods stay empty.
export const clubProfiles: Record<string, ClubProfile> = {
  ...cityAndCommunityProfiles,
  ...runningAndTriathlonCommunityProfiles,
  ...valleysAndCommunityProfiles,
  ...communityHeritageProfiles,
  ...regionalContinuationProfiles,
  ...islandAndRegionalClubProfiles,
  ...southWestAndCommunityProfiles,
  ...northWestAndCommunityProfiles,
  ...borderAndCommunityClubProfiles,
  ...yorkshireAndNorthernCommunityProfiles,
  ...southEastAndNorthernClubProfiles,
  ...southEastAndCommunityClubProfiles,
  ...midlandsWelshAndLaoisClubProfiles,
  ...yorkshireWelshAndIrishClubProfiles,
  ...northernAndCommunityClubProfiles,
  ...southernAndMultisportClubProfiles,
  ...coastalAndRegionalClubProfiles,
  ...midlandsAndIrelandClubProfiles,
  ...communityClubProfiles,
  ...regionalClubProfiles,
  ...furtherClubProfiles,
  ...additionalClubProfiles,
  "gateshead-harriers-and-ac": {
    summary:
      "Gateshead Harriers & Athletics Club trains at Gateshead International Stadium, with track and field, road running and cross-country for juniors, seniors and veterans.",
    biography: [
      "Gateshead Harriers began in 1904 as Gateshead St Mary’s Church Running Club. Women joined in 1951, and the club developed into a home for track and field athletes as well as road and cross-country runners.",
      "Today its base is Gateshead International Stadium on Neilson Road. It supports athletes from age eight through to veterans, with training groups across the athletics disciplines. Its hall of fame connects that local club programme to some of the best-known names in British athletics.",
    ],
    founded_year: 1904,
    notable_members: [
      {
        name: "Brendan Foster",
        connection: "Club hall of fame",
        detail:
          "Olympic 10,000m bronze medallist at Montreal 1976 and founder of the Great North Run.",
      },
      {
        name: "Angela Gilmour",
        connection: "Club hall of fame",
        detail:
          "The 400m runner, formerly Angela Piggford, won Commonwealth 4 × 400m relay gold in 1990.",
      },
    ],
    sources: [
      { title: "Gateshead club history", url: "https://gatesheadharriers.com/club-history" },
      {
        title: "Club hall of fame and contact details",
        url: "https://gatesheadharriers.com/hall-of-fame",
      },
    ],
    corrections: {
      city: "Gateshead",
      address: "Gateshead International Stadium, Neilson Road, Gateshead, NE10 0EF",
      postcode: "NE10 0EF",
      address_kind: "training",
      website: "https://gatesheadharriers.com/",
      contacts: [{ role: "Club enquiries", email: "info@gatesheadharriers.com" }],
    },
    reviewed_at: "2026-10-13",
  },
  "jarrow-and-hebburn-ac": {
    summary:
      "Jarrow and Hebburn Athletics Club is based at Monkton Stadium in Jarrow, with junior and senior groups for running, sprints, jumps and throws.",
    biography: [
      "The club was formed in June 1937 as Jarrow Cycling and Athletics Club, following the rebuilding of Monkton Stadium. The stadium project gave unemployed men work and brought organised sport back to the town after the Jarrow March.",
      "The name changed to Jarrow and Hebburn Athletics Club in 1969. Its history is closely associated with coach Jimmy Hedley and middle-distance runners Steve Cram and David Sharpe. Monkton Stadium remains the club’s base; prospective members should contact the secretary with their age and the events they would like to try.",
    ],
    founded_year: 1937,
    notable_members: [
      {
        name: "Steve Cram",
        connection: "Historical club athlete",
        detail:
          "One of Jimmy Hedley’s middle-distance athletes, whose achievements are central to the club’s history.",
      },
      {
        name: "David Sharpe",
        connection: "Historical club athlete",
        detail: "European indoor 800m champion and World Cup winner, coached by Jimmy Hedley.",
      },
    ],
    sources: [
      {
        title: "Jarrow and Hebburn club history",
        url: "https://www.jhac.org.uk/the-club/history/",
      },
      { title: "Club enquiries", url: "https://www.jhac.org.uk/contact-us/" },
      { title: "Club news and David Sharpe feature", url: "https://www.jhac.org.uk/" },
    ],
    corrections: {
      city: "Jarrow",
      address: "Monkton Stadium, 54 Dene Terrace, Jarrow, NE32 5NJ",
      postcode: "NE32 5NJ",
      address_kind: "training",
      contact_url: "https://www.jhac.org.uk/contact-us/",
      contacts: [
        { role: "Secretary and new membership", email: "secretary@jhac.org.uk" },
        { role: "Welfare", email: "welfare@jhac.org.uk" },
      ],
    },
    reviewed_at: "2026-10-13",
  },
  "thames-valley-harriers": {
    summary:
      "Thames Valley Harriers is a West London athletics club based at Linford Christie Stadium, offering track and field, cross-country and road running from youth to masters.",
    biography: [
      "Thames Valley Harriers started in 1887 as East Twickenham Harriers, adopting its present name in 1890. It is now based at Linford Christie Stadium in West London and is run by volunteers as a Community Amateur Sports Club.",
      "The club combines track and field with winter cross-country and year-round road running. Its youth programme includes Kids on Track for children aged nine and over, while senior and masters athletes take part in club, regional and national competition. The stadium carries the name of Linford Christie, the club’s first Olympic champion.",
    ],
    founded_year: 1887,
    notable_members: [
      {
        name: "Linford Christie",
        connection: "Club president and former athlete",
        detail: "Olympic 100m champion at Barcelona 1992 and world champion in 1993.",
      },
      {
        name: "Lorraine Ugen",
        connection: "Olympian in the club’s history",
        detail: "Long jumper who represented Great Britain at the Rio and Tokyo Olympic Games.",
      },
      {
        name: "Molly Caudery",
        connection: "Club athlete in its 2024 history",
        detail: "Won the world indoor pole vault title in Glasgow in 2024.",
      },
    ],
    sources: [
      {
        title: "Thames Valley Harriers activities and training base",
        url: "https://www.thamesvalleyharriers.com/about/",
      },
      { title: "Club history", url: "https://www.thamesvalleyharriers.com/history/" },
      {
        title: "Committee and public contacts",
        url: "https://www.thamesvalleyharriers.com/committee/",
      },
    ],
    corrections: {
      city: "London",
      address: "Linford Christie Stadium, West London",
      postcode: "",
      address_kind: "training",
      contact_url: "https://www.thamesvalleyharriers.com/committee/",
      contacts: [
        { role: "Membership", email: "membership@thamesvalleyharriers.com" },
        { role: "Coaching", email: "coaching@thamesvalleyharriers.com" },
        { role: "Communications", email: "communications@thamesvalleyharriers.com" },
        { role: "Chair", email: "chairman@thamesvalleyharriers.com" },
      ],
    },
    reviewed_at: "2026-10-13",
  },
  "tonbridge-ac": {
    summary:
      "Tonbridge Athletic Club trains at Tonbridge School Sports Grounds in Kent, with junior, senior and masters athletics and trial sessions arranged before joining.",
    biography: [
      "Tonbridge Athletic Club was founded in 1947 by two local policemen, Tom Jones and Norman Fowler. Its first training ground was a field belonging to Tonbridge School; the club is still based at the school’s sports grounds today.",
      "Run and coached by volunteers, the club has groups for younger athletes, seniors and masters. Newcomers can arrange a trial before deciding whether to join. Contact the club first and wait for an invitation from its trials coordinator, as unregistered visitors cannot take part in a session.",
    ],
    founded_year: 1947,
    location_note:
      "Training starts from the pavilion beside the track at Tonbridge School Sports Grounds.",
    sources: [
      {
        title: "Tonbridge club history and joining guidance",
        url: "https://tonbridgeac.org.uk/info/about-tonbridge-athletic-club/",
      },
      {
        title: "Training location and contact information",
        url: "https://tonbridgeac.org.uk/info/whos-who-and-contact-details/",
      },
    ],
    corrections: {
      city: "Tonbridge",
      county: "Kent",
      address: "Tonbridge School Sports Grounds, London Road, Tonbridge, TN10 3AD",
      postcode: "TN10 3AD",
      address_kind: "training",
      website: "https://tonbridgeac.org.uk/",
      contact_url: "https://tonbridgeac.org.uk/info/whos-who-and-contact-details/",
    },
    reviewed_at: "2026-10-13",
  },

  "piranha-triathlon-club": {
    summary:
      "Piranha Triathlon Club is based in Dublin, with coached swimming, cycling and running for beginners through to experienced long-distance triathletes.",
    biography: [
      "Piranha Triathlon Club brings Dublin swimmers, cyclists and runners together for training and racing. Affiliated to Triathlon Ireland, it welcomes people preparing for a first triathlon as well as experienced Ironman finishers.",
      "The club coaches all three disciplines, organises social activities and hosts the Dublin City Triathlon. Joining enquiries should go to the membership team; the contact page lists committee members for other areas of club life.",
    ],
    sources: [
      { title: "About Piranha Triathlon Club", url: "https://www.piranhatri.com/about-us/" },
      { title: "Piranha contacts", url: "https://www.piranhatri.com/contact/" },
    ],
    corrections: {
      city: "Dublin",
      county: "Dublin",
      contact_url: "https://www.piranhatri.com/contact/",
    },
    reviewed_at: "2026-10-13",
  },
  "longford-tc": {
    summary:
      "Longford Triathlon Club was established in 2010 and provides swim, bike and run training in Longford town and the surrounding area.",
    biography: [
      "Longford Triathlon Club was founded in 2010 to develop triathlon in County Longford and nearby areas. Its programme includes swimming, cycling and running throughout the year, for people aiming at a first event, returning to fitness or preparing to race.",
      "The club takes part in events in the Midlands and further afield, and has a youth section for ages 15 to 17. Prospective members can enquire about trying a session before joining.",
    ],
    founded_year: 2010,
    sources: [{ title: "Longford club history and training", url: "https://www.longfordtri.ie/" }],
    corrections: {
      city: "Longford",
      county: "Longford",
      contact_url: "https://www.longfordtri.ie/",
      contacts: [{ role: "Club enquiries", email: "info@longfordtri.ie" }],
    },
    reviewed_at: "2026-10-13",
  },
  "pulse-tc": {
    summary:
      "Pulse Triathlon Club began in Tallaght in 2003 and offers swimming, cycling and running for adults and juniors in the Dublin area.",
    biography: [
      "Pulse Triathlon Club started around a kitchen table in Tallaght in 2003. Its adult programme combines coached swimming, group cycling, track running and strength sessions, with opportunities to train and race together.",
      "The club lists pool sessions at Balrothery Sports Complex and running sessions at Tallaght Athletics Track. Its junior section began in 2015 and covers ages eight to 17. Pulse also organises its own sprint triathlon and junior events; check the current timetable before attending a session.",
    ],
    founded_year: 2003,
    location_note:
      "Sessions use several venues in the Tallaght area. Check the club timetable for swimming, running and cycling meeting points.",
    sources: [
      { title: "Pulse club history and training bases", url: "https://www.pulsetri.com/" },
      { title: "Pulse junior club", url: "https://www.pulsetri.com/about/" },
    ],
    corrections: {
      city: "Tallaght",
      county: "Dublin",
      contact_url: "https://www.pulsetri.com/",
      contacts: [{ role: "Club enquiries", email: "info@pulsetri.com" }],
    },
    reviewed_at: "2026-10-13",
  },
  "black-trail-runners": {
    summary:
      "Black Trail Runners is a UK community and charity helping Black people, People of Colour and their allies get involved in trail running.",
    biography: [
      "Black Trail Runners was created in 2020 to increase Black participation and representation in trail running. It organises community runs and gives people a way into outdoor running without needing to arrive with experience or specialist knowledge.",
      "Its programme includes free guided runs, trail tasters covering practical skills such as navigation and using poles, and a Youth Collective. Runs take place around the country and range from social outings to more technical routes for experienced runners.",
    ],
    founded_year: 2020,
    scope: "national",
    location_note:
      "A UK-wide trail-running community. Events take place at different locations; check the venue for each run.",
    sources: [
      {
        title: "Black Trail Runners community and activities",
        url: "https://www.blacktrailrunners.run/",
      },
      { title: "Club contact", url: "https://www.blacktrailrunners.run/contact" },
    ],
    corrections: { contact_url: "https://www.blacktrailrunners.run/contact" },
    reviewed_at: "2026-10-13",
  },
  "emancipated-run-crew": {
    summary:
      "Emancipated Run Crew is a running community supporting Black and Brown runners, with an emphasis on inclusion and individual running goals.",
    biography: [
      "Emancipated Run Crew provides a space for Black and Brown runners who may feel overlooked by the wider running scene. Its members include people at the beginning of their running journey as well as experienced runners.",
      "The community encourages people to set their own goals and support one another. It combines an online community with organised activities; use its current programme and contact page to find out what is running locally.",
    ],
    sources: [
      { title: "About Emancipated Run Crew", url: "https://www.emancipatedruncrew.com/about" },
      { title: "Contact ERC", url: "https://www.emancipatedruncrew.com/contact" },
    ],
    corrections: { contact_url: "https://www.emancipatedruncrew.com/contact" },
    reviewed_at: "2026-10-13",
  },
  "fordy-runs-running-club": {
    summary:
      "FORDY RUNS combines an online running community with local groups across the UK, offering free club membership and group runs for a range of abilities.",
    biography: [
      "FORDY RUNS grew from a community started by Chris Ford into a network of local running groups around the UK. Free club membership and an online community sit alongside in-person runs, race meet-ups and trips.",
      "Local groups differ in what they offer: some meet for a social run, while others have structured club nights and weekend sessions. The club website links to its satellite network so runners can find a nearby group and check the meeting point.",
    ],
    scope: "national",
    location_note:
      "A network of UK groups. Use the satellite-group information for a local meeting point.",
    sources: [
      { title: "FORDY RUNS running club", url: "https://www.fordyruns.com/running-club" },
      { title: "How the club began", url: "https://www.fordyruns.com/aboutus" },
    ],
    corrections: { contact_url: "https://www.fordyruns.com/contact" },
    reviewed_at: "2026-10-13",
  },
  "leeds-city-athletic-club": {
    summary:
      "Leeds City AC trains at the John Charles Centre for Sport, with track and field, endurance and wheelchair-racing groups for competitive athletes.",
    biography: [
      "Leeds City Athletic Club formed in 1967 through the merger of three local clubs, bringing together traditions that reached back into the nineteenth century. Today its base is the John Charles Centre for Sport.",
      "The club offers coached training in track and field, cross-country, road and fell running, as well as wheelchair racing. Junior beginners can enter through the club’s development groups; adult membership is aimed at runners and athletes with experience who want to train and compete. Contact the club to find the appropriate group.",
    ],
    founded_year: 1967,
    sources: [
      {
        title: "About Leeds City AC and its history",
        url: "https://www.leedscityac.org/about-leeds-city-athletic-club/",
      },
      { title: "Leeds City AC", url: "https://www.leedscityac.org/" },
    ],
    corrections: {
      address_kind: "training",
      contact_url: "https://www.leedscityac.org/",
      contacts: [{ role: "Club enquiries", email: "hello@leedscityac.org" }],
    },
    reviewed_at: "2026-10-13",
  },
  "brentwood-beagles-athletics-club": {
    summary:
      "Brentwood Beagles is an Essex track and field club with groups from age seven through to masters, for competition and general fitness.",
    biography: [
      "Brentwood Beagles offers track and field in Essex, with a programme covering children from age seven, senior athletes and masters. The club welcomes people training for competition as well as those taking part for fitness.",
      "The club contact page is the starting point for choosing an age group or event and finding out which sessions have space.",
    ],
    sources: [
      { title: "Brentwood Beagles", url: "https://www.beagles.org.uk/" },
      { title: "Club enquiries", url: "https://www.beagles.org.uk/contact-bbac/" },
    ],
    corrections: { contact_url: "https://www.beagles.org.uk/contact-bbac/" },
    reviewed_at: "2026-10-13",
  },
  "1-running-club": {
    summary:
      "1% Running Club is a London running community co-founded by Marcus Brown, with road running and cross-country listed by England Athletics.",
    biography: [
      "1% Running Club brings together runners who want the company and support of a club. Co-founder Marcus Brown has spoken about creating a place for people who have not come through the traditional club system, drawing on his own experience of taking up marathon running.",
      "England Athletics lists the club in London, with Victoria Park as its published address and road running and cross-country as its disciplines. Its Instagram account is a useful starting point for current club news.",
    ],
    notable_members: [
      {
        name: "Marcus Brown",
        connection: "Co-founder",
        detail:
          "Runner and podcast host interviewed about establishing the club by Abbott World Marathon Majors.",
      },
    ],
    sources: [
      {
        title: "Marcus Brown on founding the club",
        url: "https://www.worldmarathonmajors.com/content-hub/marathon-talk-episode-47-marcus-brown---co-founder-of-one-percent-running-club",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "100-marathon-club": {
    summary:
      "The 100 Marathon Club celebrates runners who complete 100 marathons or more, with membership information and an events calendar for the UK and Ireland.",
    biography: [
      "The 100 Marathon Club is built around a shared ambition: completing a hundred marathons. It recognises runners who reach that milestone and provides a community for those working towards it.",
      "The club website explains qualifying events, the membership process and how to have a marathon record checked. It also maintains an events calendar and celebrates members' achievements. Contact the membership secretary for joining questions and the vetting team for questions about which races count.",
    ],
    scope: "national",
    location_note:
      "A club serving runners across the UK, rather than a weekly training group based in Telford. The governing-body directory gives a correspondence location; contact the club before visiting.",
    sources: [
      { title: "About the 100 Marathon Club", url: "https://www.100marathonclub.org.uk/" },
      {
        title: "Club contacts",
        url: "https://www.100marathonclub.org.uk/contents/864-contact-details",
      },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      website: "https://www.100marathonclub.org.uk/",
      address_kind: "correspondence",
      contact_url: "https://www.100marathonclub.org.uk/contents/864-contact-details",
      contacts: [
        { role: "Club secretary", email: "secretary@100marathonclub.org.uk" },
        { role: "Membership", email: "membership@100marathonclub.org.uk" },
        { role: "Marathon record enquiries", email: "vetting@100marathonclub.org.uk" },
      ],
    },
  },
  "26-2-road-runners-club": {
    summary:
      "26.2 Road Runners is a Surbiton running club for beginners, returning runners and experienced racers, with group runs, track sessions and a club handicap.",
    biography: [
      "Despite the name, you do not have to run a marathon to join 26.2 Road Runners. The Surbiton club welcomes people who run shorter distances, those returning after a break and runners who mainly want company and regular exercise.",
      "Its programme includes group runs, hills, track sessions and a monthly three-mile handicap. Prospective members can try a few sessions before joining. The club meets at Surbiton Racket and Fitness Club; check the weekly club-run notice for the session and meeting arrangements.",
    ],
    sources: [
      { title: "Joining 26.2 Road Runners", url: "https://www.26point2.co.uk/joining-our-club/" },
      { title: "Contact the club", url: "https://www.26point2.co.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address_kind: "training",
      contact_url: "https://www.26point2.co.uk/contact-us/",
      contacts: [{ role: "Club enquiries", email: "enquiries@26point2.co.uk" }],
    },
  },
  "achilles-club": {
    summary:
      "Achilles is the athletics club for past and present Oxford and Cambridge university athletes, linking Varsity competition with lifelong membership.",
    biography: [
      "Founded in 1920, the Achilles Club keeps Oxford and Cambridge athletes connected after university. Membership is by invitation to athletes who compete in matches between the two universities; election is for life.",
      "The club helps stage the annual Varsity Match and supports university athletics through the Achilles Trust. Its programme also includes domestic meetings, overseas tours, schools' relays and the long-running transatlantic series with Harvard and Yale. It is an athletics club with university roots, rather than an open local running group.",
    ],
    founded_year: 1920,
    location_note:
      "Associated with Oxford and Cambridge university athletics. The London affiliation region is not a training address.",
    sources: [
      { title: "About Achilles", url: "https://www.achilles.org/about" },
      { title: "Contact the honorary secretary", url: "https://www.achilles.org/contact" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      city: "Oxford and Cambridge",
      county: "",
      address: "",
      postcode: "",
      contact_url: "https://www.achilles.org/contact",
    },
  },
  "aldershot-farnham-and-district": {
    summary:
      "Aldershot, Farnham & District AC trains at Aldershot Military Stadium and competes in track and field, road running and cross-country.",
    biography: [
      "Aldershot, Farnham & District Athletic Club serves athletes across north-east Hampshire and the surrounding area. Most training groups meet at Aldershot Military Stadium on Queens Avenue, with sessions for beginners, younger athletes, seniors and masters.",
      "The club competes on the track, on the roads and over cross-country, from local leagues to national competition. Its published honours include several generations of international distance runners. New athletes should contact the admissions team before attending, as availability varies between training groups.",
    ],
    notable_members: [
      {
        name: "Steph Twell",
        connection: "Club Olympian",
        detail: "Listed in AFD's honours for the 2008, 2016 and Tokyo Olympic Games.",
      },
      {
        name: "Chris Thompson",
        connection: "Club Olympian",
        detail: "Listed in AFD's honours for London 2012 and the Tokyo Olympic Games.",
      },
      {
        name: "Zola Budd",
        connection: "Historical club athlete",
        detail: "Named in the club's Olympic and World Cross Country honours.",
      },
      {
        name: "Charlotte Purdue",
        connection: "Club international",
        detail: "Listed among AFD's Commonwealth Games and World Cross Country representatives.",
      },
    ],
    sources: [
      { title: "About AFD and training venues", url: "https://www.afd.org.uk/about-us/" },
      {
        title: "Individual honours",
        url: "https://www.afd.org.uk/club-history/individual-honours/",
      },
      { title: "Admissions and club contact", url: "https://www.afd.org.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address_kind: "training",
      website: "https://www.afd.org.uk/",
      contact_url: "https://www.afd.org.uk/contact-us/",
      contacts: [{ role: "New member enquiries", email: "afdadmissions@hotmail.co.uk" }],
    },
  },
  "alnwick-harriers": {
    summary:
      "Alnwick Harriers is a Northumberland running club founded in 1981, with junior and senior groups based at Alnwick Rugby Club.",
    biography: [
      "Alnwick Harriers has been part of the Northumberland running scene since 1981. The club has junior groups from age eight and senior groups covering a range of running speeds.",
      "The published training base is Alnwick Rugby Club at Greensfield, off Willowburn Avenue. Senior sessions combine steady running with intervals, with several groups so runners can train at a suitable pace. Contact the club about joining or finding the right group before a first visit.",
    ],
    founded_year: 1981,
    sources: [
      { title: "About Alnwick Harriers", url: "https://www.alnwickharriers.org.uk/about-us/" },
      { title: "Alnwick club contacts", url: "https://www.alnwickharriers.org.uk/contact-us/" },
      { title: "Club history and base", url: "https://www.alnwickharriers.org.uk/" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address: "Alnwick Rugby Club, Greensfield, Willowburn Avenue, Alnwick, NE66 1BE",
      postcode: "NE66 1BE",
      address_kind: "training",
      contact_url: "https://www.alnwickharriers.org.uk/contact-us/",
      contacts: [{ role: "General club enquiries", email: "ahrcsecretary@gmail.com" }],
    },
  },
  "belgrave-harriers": {
    summary:
      "Belgrave Harriers is a London athletics club founded in 1887, with track and field, road and cross-country groups training mainly in Battersea Park.",
    biography: [
      "Belgrave Harriers began with a meeting in a Pimlico pub in 1887. The club's claret and gold colours now appear at track meetings, road races and cross-country fixtures, with members ranging from recreational runners to internationals.",
      "Most coached sessions take place in Battersea Park. The club has separate routes into junior athletics, track and field, and endurance running, so prospective members can find a group suited to their event. Belgrave Hall in Wimbledon is a separate club facility; the published training address is the Millennium Arena in Battersea Park.",
    ],
    founded_year: 1887,
    notable_members: [
      {
        name: "John Gladwin",
        connection: "Longstanding member and club chair",
        detail:
          "Commonwealth Games silver medallist whose middle-distance career is described on the club's committee page.",
      },
      {
        name: "Phil Wicks",
        connection: "Life member",
        detail:
          "Distance runner and general secretary, described by Belgrave among its most successful distance athletes.",
      },
    ],
    sources: [
      { title: "Belgrave history and training", url: "https://www.belgraveharriers.com/" },
      { title: "Club officers and biographies", url: "https://www.belgraveharriers.com/committee" },
      { title: "Published training address", url: "https://www.belgraveharriers.com/olympians" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address: "Millennium Arena, Carriage Drive East, Battersea Park, London, SW11 4NJ",
      address_kind: "training",
      website: "https://www.belgraveharriers.com/",
      contact_url: "https://www.belgraveharriers.com/committee",
      contacts: [
        { role: "General secretary", email: "secretary.belgraveharriers@gmail.com" },
        { role: "Membership", email: "membership.belgrave@gmail.com" },
      ],
    },
  },
  "birchfield-harriers": {
    summary:
      "Birchfield Harriers is a Birmingham athletics club founded in 1877, training at Alexander Stadium with junior academies and competitive club teams.",
    biography: [
      "Birchfield Harriers has been part of Birmingham athletics since 1877. Its home is Alexander Stadium in Perry Barr, where it offers coaching and competition across athletics disciplines, including opportunities for young athletes through its academies and introductory sessions.",
      "The club's history spans generations of international athletes and Olympic representatives. Regular club sessions run alongside junior development and team competition. For joining questions, use the club email: Birchfield specifically asks for email enquiries because it does not currently have a physical club office.",
    ],
    founded_year: 1877,
    contact_note:
      "The club asks for enquiries by email. The stadium is a training venue, not a staffed club office.",
    notable_members: [
      {
        name: "Matthew Hudson-Smith",
        connection: "Club athlete",
        detail:
          "The club reports that a stand was named for him for the 2026 European Championships.",
      },
    ],
    sources: [
      {
        title: "About Birchfield and contact information",
        url: "https://www.birchfieldharriers.com/about/",
      },
      { title: "Club history", url: "https://www.birchfieldharriers.com/history/" },
      { title: "Club news and stadium details", url: "https://www.birchfieldharriers.com/" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address: "Alexander Stadium, Stadium Way, Birmingham, B42 2LR",
      postcode: "B42 2LR",
      address_kind: "training",
      website: "https://www.birchfieldharriers.com/",
      contact_url: "https://www.birchfieldharriers.com/about/",
      contacts: [
        { role: "Club enquiries — email preferred", email: "contact@birchfieldharriers.com" },
      ],
    },
  },
  "blackheath-and-bromley-harriers-ac": {
    summary:
      "Blackheath & Bromley Harriers AC trains at Norman Park in Bromley, with track and field, road running, race walking and cross-country groups.",
    biography: [
      "Blackheath & Bromley Harriers AC was created in 2003 when Blackheath Harriers and Bromley Athletics Club merged. The Blackheath side of its history reaches back to Peckham Hare and Hounds in 1869.",
      "The club moved into Norman Park Community Sports Centre in 2023. Its facilities include an indoor sprint track, changing rooms and a weights room for qualifying coaching groups. The programme covers track and field, road running, walking and cross-country, with junior teams as well as senior competition.",
    ],
    founded_year: 2003,
    notable_members: [
      {
        name: "Dina Asher-Smith",
        connection: "Club athlete",
        detail:
          "The sprinter describes the Norman Park development on the club's own account of its new home.",
      },
    ],
    sources: [
      {
        title: "Club history and Norman Park facilities",
        url: "https://bbharriersac.org.uk/about/",
      },
      { title: "Club contacts", url: "https://bbharriersac.org.uk/club-contacts/" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address_kind: "training",
      contact_url: "https://bbharriersac.org.uk/club-contacts/",
      contacts: [
        { role: "Membership enquiries", email: "bbharriersac.newmembers@gmail.com" },
        { role: "Club secretary", email: "bbharriersac.secretary@gmail.com" },
      ],
    },
  },
  "hallamshire-harriers-sheffield": {
    summary:
      "Hallamshire Harriers is a Sheffield athletics and running club founded in 1896, with training at Hillsborough Park, Woodbourn Road and the English Institute of Sport.",
    biography: [
      "Hallamshire Harriers was formed in Sheffield in 1896. Cross-country helped establish the club's early reputation, and its red vest with a white H has been worn by national champions and Olympic medallists.",
      "Training is spread across several venues rather than one clubhouse. The club lists road and cross-country sessions at Hillsborough Park, track groups at Woodbourn Road and junior and technical-event sessions at the English Institute of Sport. There are also sessions in the Peak District. Check the location for the particular group before travelling.",
    ],
    founded_year: 1896,
    location_note:
      "Several training bases: use the club's locations page to find the venue for your group.",
    notable_members: [
      {
        name: "Sebastian Coe",
        connection: "Historical club athlete",
        detail:
          "Won Olympic 1500m gold in 1980 and 1984; his career features prominently in the club history.",
      },
      {
        name: "Ernest Harper",
        connection: "Historical club athlete",
        detail: "Olympic marathon silver medallist at Berlin 1936.",
      },
      {
        name: "Yvonne Hanson-Nortey",
        connection: "Historical club athlete",
        detail: "The club records her shot-put appearance at the 1988 Seoul Olympics.",
      },
    ],
    sources: [
      {
        title: "History of Hallamshire Harriers",
        url: "https://www.hallamshireharriers.org/new-page",
      },
      { title: "Training locations", url: "https://www.hallamshireharriers.org/locations" },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      contact_url: "https://www.hallamshireharriers.org/locations",
      contacts: [{ role: "Club secretary", email: "hallamshireharrierssecretary@gmail.com" }],
    },
  },
  "herne-hill-harriers": {
    summary:
      "Herne Hill Harriers is a south London athletics club founded in 1889 and based at Tooting Bec Athletics Track.",
    biography: [
      "Herne Hill Harriers began in Milkwood Road in 1889 and is now based at Tooting Bec Athletics Track. Its programme includes young-athlete coaching, throws and several middle- and long-distance groups, alongside road and cross-country competition.",
      "The club's history includes Olympic medals stretching back to the early twentieth century. Long jumper Jade Johnson is listed as its patron. Prospective members should use the club's joining and training pages to find the appropriate group.",
    ],
    founded_year: 1889,
    notable_members: [
      {
        name: "Jade Johnson",
        connection: "Club athlete and patron",
        detail: "European and Commonwealth long-jump silver medallist in 2002.",
      },
      {
        name: "Joe Deakin",
        connection: "Historical club athlete",
        detail: "Olympic gold medallist in the three-mile team race at London 1908.",
      },
      {
        name: "David Jacobs",
        connection: "Historical club athlete",
        detail: "Olympic 4 × 100m relay gold medallist at Stockholm 1912.",
      },
    ],
    sources: [
      {
        title: "Herne Hill club history",
        url: "https://www.hernehillharriers.org/about/club-history/",
      },
      {
        title: "Notable club athletes",
        url: "https://www.hernehillharriers.org/about/notable-athletes/",
      },
    ],
    reviewed_at: "2026-10-13",
    corrections: { address_kind: "training", website: "https://www.hernehillharriers.org/" },
  },
  "sale-harriers-manchester": {
    summary:
      "Sale Harriers Manchester is an athletics club with bases at Crossford Bridge, Wythenshawe Park and Sportcity, offering junior, senior and masters groups.",
    biography: [
      "Sale Harriers traces its formation to 1910, when local church clubs and gymnasiums came together. Crossford Bridge became its home in the 1950s, and the club now works across that Sale base, Wythenshawe Park and Sportcity in Manchester.",
      "Its programme spans track and field, endurance running, cross-country and junior athletics. The three venues serve different groups, so check the relevant session before travelling. The club's life-members list reflects both international achievement and decades of work by coaches and volunteers.",
    ],
    founded_year: 1910,
    location_note:
      "Training takes place at Crossford Bridge, Wythenshawe Park and Sportcity. The address below is Sportcity, one of the three bases.",
    notable_members: [
      {
        name: "Diane Modahl",
        connection: "Life member",
        detail: "Commonwealth 800m champion in 1990 and a four-time Olympian.",
      },
      {
        name: "Darren Campbell",
        connection: "Life member",
        detail: "Sprinter recognised in the club's life-members history and record lists.",
      },
      {
        name: "Kevin McKay",
        connection: "Life member",
        detail: "1500m runner listed by the club as a British Olympian and national champion.",
      },
    ],
    sources: [
      {
        title: "History and training addresses",
        url: "https://www.saleharriersmanchester.com/a-history-of-sale-harriers/",
      },
      { title: "Life members", url: "https://www.saleharriersmanchester.com/life-members/" },
    ],
    reviewed_at: "2026-10-13",
    corrections: { address_kind: "training", website: "https://www.saleharriersmanchester.com/" },
  },
  "welsh-athletics-cardiff-athletics": {
    summary:
      "Cardiff Athletics is based at Cardiff International Sports Campus in Leckwith, with track and field, road running, cross-country and frame running.",
    biography: [
      "Cardiff Athletics traces its history to 1882 and is based at the city's International Sports Campus in Leckwith. It combines track and field with road and cross-country competition, and also offers frame running.",
      "The club has a junior academy alongside its competition groups. Its website is undergoing a change of provider, so the club manager is a useful contact for current training and joining information when a page is unavailable.",
    ],
    founded_year: 1882,
    contact_note:
      "The club is moving website providers; use the club manager email if a page is unavailable.",
    sources: [
      { title: "Cardiff Athletics club information", url: "https://cardiffathletics.org/" },
      {
        title: "Welsh Athletics club listing",
        url: "https://www.welshathletics.org/en/club/view/cardiff-athletics",
      },
    ],
    reviewed_at: "2026-10-13",
    corrections: {
      address_kind: "training",
      contacts: [
        { role: "Club manager", email: "clubmanager@cardiffathletics.org", phone: "07910 764871" },
      ],
      contact_url: "https://cardiffathletics.org/",
    },
  },
};

export const CLUB_PROFILE_VERSION = "club-address-contact-editorial-2026-10-14-v23";
