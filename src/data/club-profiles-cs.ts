import type { ClubProfile } from "./club-profiles";

// Batch 97: primary club pages and explicitly dated governing-body accounts.
export const recoveredCoachingAndCommunityProfiles: Record<string, ClubProfile> = {
  "goole-youth-ac": {
    summary: "Goole Youth AC is an East Yorkshire athletics club with a Victoria Pleasure Grounds base and a record of families working together to sustain local athletics.",
    biography: [
      "Goole Youth AC serves young athletes in Goole, East Riding of Yorkshire, England. Victoria Pleasure Grounds is its documented athletics setting, and the club's story includes considerable work by families to keep that facility usable. England Athletics named Goole Youth its Yorkshire and Humberside Athletics or Running Club of the Year in 2018.",
      "That award followed a practical community effort: parents and athletes cleaned the track over evenings and weekends during 2017, while fundraising and town council support helped secure its relining. Sponsored cycling and support from local organisations were part of the campaign. The achievement belonged as much to the people maintaining the venue as to those training on it.",
      "A July 2026 England Athletics report describes further challenges during redevelopment, including work to retain athletics provision and agree safe shared use. It also records an interim coaching plan and funding for a newly qualified coach after the loss of a longstanding coach. The Town Deal project page confirms the club's use of the grounds; current session times, age groups and joining availability still need direct confirmation."
    ],
    sources: [{ title: "England Athletics regional volunteer awards, 19 September 2018", url: "https://www.englandathletics.org/news/yorkshire-and-humberside-volunteer-award-winners-2/" }, { title: "England Athletics club support report, 14 July 2026", url: "https://www.englandathletics.org/news/club-support-round-up-our-newly-expanded-team-here-to-help/" }, { title: "Goole Town Deal: Victoria Pleasure Ground project and club use", url: "https://www.gooletowndeal.co.uk/projects/victoria-pleasure-ground/" }],
    reviewed_at: "2026-10-17",
    corrections: { address: "Victoria Pleasure Grounds, Goole", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Documented athletics venue replaces the Riverside directory address. No postcode inferred; the project page's anticipated pavilion completion is not treated as confirmation that all works are finished.",
    contact_note: "Club website unavailable. Current joining contacts, timetable, founding year and notable-member history unresolved. Town Deal, venue and England Athletics staff contacts are not club enquiry contacts; a 2008 flyer phone was not reused."
  },
  "kirkby-ac": {
    summary: "Kirkby AC is a Knowsley athletics club with documented wheelchair-racing and coaching associations, listed separately from Kirkby Milers by the county association.",
    biography: [
      "Kirkby AC is an athletics club in Kirkby, Knowsley, England. Merseyside County Athletic Association lists it among its member clubs, separately from Kirkby Milers. Its documented sporting story includes wheelchair racing and the development of athletes who also want to help others into athletics.",
      "England Athletics' May 2022 Commonwealth Games team announcement named Nathan Maguire and Shelly Oxley-Woods with Kirkby AC affiliations. The selections covered T54 track and marathon events respectively. These are dated club associations from the selection announcement, not a statement about present membership or the eventual results of those races.",
      "In June 2023, England Athletics reported that Anya Waugh had completed a Coaching Assistant course and wanted to help junior athletes at her club, Kirkby AC. That account adds a coaching pathway to the club's wheelchair-racing story. Current sessions, admission ages and an appropriate enquiry contact remain unconfirmed; the county listing marks its contact as to be advised."
    ],
    notable_members: [{ name: "Nathan Maguire", connection: "Kirkby-affiliated athlete in the 2022 England selection announcement", detail: "England Athletics listed Kirkby AC beside his T54 1500m selection on 19 May 2022. Historical association, not current membership or a race-result claim." }, { name: "Shelly Oxley-Woods", connection: "Kirkby-affiliated athlete in the 2022 England selection announcement", detail: "England Athletics listed Kirkby AC beside her T54 marathon selection on 19 May 2022. Historical association only." }, { name: "Anya Waugh", connection: "Club athlete and newly qualified Coaching Assistant in 2023", detail: "England Athletics' 8 June 2023 account describes her wish to help junior athletes at Kirkby AC after completing the course." }],
    sources: [{ title: "Merseyside County AA member clubs and associations", url: "https://merseysidecountyaa.org.uk/member-clubs-associations/" }, { title: "England Athletics para-team selection, 19 May 2022", url: "https://www.englandathletics.org/news/team-england-para-athletes-named-for-birmingham-2022/" }, { title: "England Athletics wheelchair athletes' coaching course, 8 June 2023", url: "https://www.englandathletics.org/news/wheelchair-athletes-complete-their-coaching-assistant-course/" }],
    reviewed_at: "2026-10-17",
    location_note: "Bracknell Avenue remains a directory address, not a newly confirmed session start.",
    contact_note: "County website link resolves to Team Isabella, a different club; its 2014 origin and contacts are not adopted. Kirkby AC website remains unset. Founding year and current joining arrangements unresolved; do not conflate Kirkby Milers. Coaching relationships do not establish another athlete's Kirkby membership."
  },
  "start2jog": {
    summary: "Start2Jog is a Glossop running club combining road, trail, fell and track running with a welcoming coaching culture and community fundraising.",
    biography: [
      "Start2Jog brings runners together in Glossop, England, for road, trail, fell and track running. Its official website welcomes different experience levels and describes coached sessions alongside cross-country, parkrun and social activities. The emphasis is on finding a suitable group and enjoying running with other people, rather than arriving at a particular pace.",
      "England Athletics recognised that approach through a 2018 inclusion award for Barry Sherwood of Start2Jog. Its 2022 regional awards account describes a welcome involving the chair or membership contact and a coach at the first session, plus Couch to 5K, mixed-level groups, walk-and-talk outings and a developing junior section. Those programme details describe the club at that time; current junior places and beginner intakes should be checked before attending.",
      "Community fundraising is another part of the story. Jeanette Mitchell received a 2022 regional community-project award for Start2Jog activity supporting Glossop Mountain Rescue, involving race volunteering, stalls and social fundraising. For today's programme or a first visit, the club publishes a chair's enquiry email and an online contact form. Ask which session and meeting point fit your experience."
    ],
    notable_members: [{ name: "Barry Sherwood", connection: "Start2Jog inclusion award recipient in 2018", detail: "England Athletics' East Midlands volunteer awards account recognised his inclusive work at Start2Jog in October 2018; no current office claimed." }, { name: "Jeanette Mitchell", connection: "Start2Jog community-project award recipient in 2022", detail: "England Athletics' November 2022 regional awards account describes her fundraising work supporting Glossop Mountain Rescue." }],
    sources: [{ title: "Official Start2Jog welcome and running disciplines", url: "https://www.start2jog.co.uk/" }, { title: "Official contact form and chair's email", url: "https://www.start2jog.co.uk/contact-us/" }, { title: "England Athletics East Midlands awards, 10 October 2018", url: "https://www.englandathletics.org/news/east-midlands-volunteer-award-winners-2/" }, { title: "England Athletics East Midlands awards, 21 November 2022", url: "https://www.englandathletics.org/news/east-midlands-region-volunteer-award-winners-announced/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.start2jog.co.uk/" },
    location_note: "Glossop is an area-level listing; no clubhouse, postal address or universal run start established.",
    contact_note: "Founding year, current junior availability and fixed timetable unresolved. Historical award recipients are not presented as current officers; no telephone or social link inferred."
  },
  "hurricane-striders": {
    summary: "Hurricane Striders offers led running in Lincoln, with a documented RunAndTalk approach that values conversation and staying involved as well as training.",
    biography: [
      "Hurricane Striders is a Lincoln running group in Lincolnshire, England. Its club-hosted ClubSpark page advertises Tuesday and Thursday evening runs at 7pm, with the location supplied for each booking. Beginners and more experienced runners are welcomed, and sessions include warm-ups and cool-downs with qualified coaches or run leaders.",
      "England Athletics' July 2018 RunAndTalk feature records affiliation earlier that year, rather than a confirmed founding date. The club paired runners by what brought them to running instead of simply by speed. Secretary and mental-health champion Kate Siviter described ways to keep injured members involved, including meeting for coffee and volunteering at parkrun.",
      "The current ClubSpark introduction also describes guide runners and a mental-health champion. These are participation and support roles, not a clinical service or a guarantee of individual assistance at every session. Prospective runners can use the club contact form to discuss a suitable run, confirm the meeting point and ask about any support needed before booking."
    ],
    notable_members: [{ name: "Kate Siviter", connection: "Secretary and mental-health champion in the 2018 RunAndTalk account", detail: "England Athletics' 25 July 2018 feature records her description of keeping injured Hurricane Striders members involved. Historical role only." }],
    sources: [{ title: "Club-hosted ClubSpark session and coaching introduction", url: "https://clubspark.englandathletics.org/HurricaneStriders" }, { title: "ClubSpark contact form and location", url: "https://clubspark.englandathletics.org/HurricaneStriders/Contact" }, { title: "England Athletics RunAndTalk feature, 25 July 2018", url: "https://www.englandathletics.org/news/clubs-embracing-runandtalk/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://clubspark.englandathletics.org/HurricaneStriders" },
    location_note: "Boultham Park remains directory context. ClubSpark lists Birchwood Leisure Centre, but session locations vary by booking; neither is asserted as every run's start.",
    contact_note: "Older hurricanesports.co.uk site unavailable; working club-hosted running page supplied. Founding year and direct email/telephone unresolved. Existing multisport tags and adult-only classification retained; the running page does not establish a current swim or triathlon timetable."
  },
  "hayes-and-harlington-road-runners": {
    summary: "Hayes & Harlington Road Runners is a sociable Hayes running club, with community-centre outings and a documented Couch to 5K partnership with Hillingdon Council.",
    biography: [
      "Hayes & Harlington Road Runners is based in Hayes, Greater London, England. Its official introduction describes a mixed-ability running club with a social side and invites newcomers to try a run. Hayes & Harlington Community Centre on Albert Road is its advertised meeting point, rather than merely a postal contact address.",
      "A club-support case study from England Athletics explains how funding helped two members qualify as Leaders in Running Fitness for a Couch to 5K programme with Hillingdon Council. The account discusses the 2022 campaign and plans for later courses, showing how the club developed its capacity to welcome beginners. It does not confirm that a new course is currently open for registration.",
      "The club website advertises Wednesday meetings at 6.30pm and publishes a general enquiry email. As the page is undated, confirm the next session before travelling, particularly if trying running for the first time or looking for a beginner course. The public invitation is a useful first step; current subscriptions, course dates and any eligibility requirements should be agreed with the club."
    ],
    sources: [{ title: "Official club introduction, meeting point and enquiry email", url: "https://www.hhroadrunners.run/" }, { title: "England Athletics funding case study: Couch to 5K and leader training", url: "https://www.englandathletics.org/clubs-and-facilities/club-support/funding/hayes-and-harlington-road-runners/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.hhroadrunners.run/", address_kind: "training" },
    location_note: "Official site confirms Hayes & Harlington Community Centre, Albert Road, UB3 4HR as its advertised meeting point; confirm before attending.",
    contact_note: "Founding year and notable-member history unresolved. Historical leader counts and secretary names not treated as current contacts. Existing adult-only classification retained."
  },
  "gipsy-hill-run-club": {
    summary: "Gipsy Hill Run Club is a south London social-running group with a documented taproom-based format and an Instagram channel for checking its latest outings.",
    biography: [
      "Gipsy Hill Run Club is a social-running group in south London, England. A venue-published listing describes outings starting and finishing at Gipsy Hill Taproom on Hamilton Road, with routes of roughly five to ten kilometres. The brewery's own website places the taproom across the yard from its brewery, so the two locations should not be treated as interchangeable meeting instructions.",
      "The advertised format combined a run with time together afterwards, and included a hill-focused outing on the first Thursday of the month. The booking page describes an adult, free-to-attend event, but now marks that event as having taken place. It is evidence of the club's social-running format, not a confirmed future timetable or a standing offer of any refreshments.",
      "The venue listing directs runners to the club's Instagram for updates. Check the latest arrangement there before travelling, including the start, route and whether the outing suits your experience. The directory's existing Facebook group is retained as a separately sourced link; no public club enquiry email or telephone has been established."
    ],
    sources: [{ title: "Venue-published run-club listing, marked event taken place", url: "https://www.designmynight.com/london/pubs/south-london/gipsy-hill-taproom/weekly-run-club" }, { title: "Official brewery site distinguishes brewery and taproom", url: "https://gipsyhillbrew.com/" }],
    reviewed_at: "2026-10-17",
    location_note: "Existing Unit 5 brewery address is directory context. The historical run listing names the taproom at 160 Hamilton Road, SE27 9SF; confirm today's meeting point rather than assuming the brewery unit is the start.",
    contact_note: "Founding year, current timetable and notable members unresolved. Venue-linked Instagram destination could not be retrieved; link provenance is the publisher, not verified account ownership. Brewery commercial contacts excluded; past free attendance and refreshments are not current promises."
  }
};
