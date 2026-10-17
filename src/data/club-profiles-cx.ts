import type { ClubProfile } from "./club-profiles";

// Batch 102: recovered official sites for Calne, Lincoln and Littleborough.
export const calneLincolnLittleboroughProfiles: Record<string, ClubProfile> = {
  "st-marys-calne-sports-centre-running-and-triathlon": {
    summary: "St Mary's Calne Running and Triathlon Club brings runners, swimmers and triathletes together in Wiltshire, with a history dating to January 2007.",
    biography: [
      "St Mary's Calne Running and Triathlon Club began in January 2007 in Calne, Wiltshire, England. Its own history distinguishes that beginning from affiliation to England Athletics and the British Triathlon Federation in 2015. The club welcomes different levels of experience, organising sessions to keep people together and making room for social events as well as racing.",
      "Running is one route into the club, with a main Wednesday evening group and beginner or intermediate courses on selected dates. The published membership options also describe weekend social runs and access to supporting fitness sessions. Course lengths differ between pages, so ask about the next intake rather than relying on an older timetable or brochure price.",
      "Swimming adds another strand to the Calne programme. Swim Smart concentrates on drills, stroke development and fitness, with a recommendation that participants can already swim 100 metres unaided. Bookings are handled by the Sports Club. The club identifies Nikki Harris as its head swimming coach; its November 2023 brochure also names Amy Chalk as head running coach and describes her international endurance-running background. These are published coaching associations, not a guarantee of who will lead a particular session.",
      "Contact the club secretary through the dedicated running and triathlon email, or use the website's enquiry form, before attending. Membership requires committee approval, and the published rules restrict affiliation for people already affiliated to another running or triathlon club in Wiltshire. Sports Club membership and running or triathlon affiliation have different arrangements. Indoor Bike Smart is described on the cycling page, but its dates remain to be confirmed and booking is not shown as open."
    ],
    founded_year: 2007,
    notable_members: [
      { name: "Nikki Harris", connection: "Published head swimming coach", detail: "The official swimming page and club biography identify her coaching role. Session allocation is not independently confirmed, and no event result is imported." },
      { name: "Amy Chalk", connection: "Head running coach in the November 2023 brochure", detail: "The Sports Club's dated brochure names her as head running coach and describes representation of Great Britain and England in endurance running. This is a dated coaching association, not a present membership or results-verification claim." }
    ],
    sources: [
      { title: "Official club history: January 2007 origin and 2015 affiliations", url: "https://www.runningandtriathlon.co.uk/about" },
      { title: "Official membership rules and secretary's enquiry email", url: "https://www.runningandtriathlon.co.uk/membership" },
      { title: "Official running groups and course information", url: "https://www.runningandtriathlon.co.uk/running" },
      { title: "Official swimming programme and booking guidance", url: "https://www.runningandtriathlon.co.uk/swimming" },
      { title: "Official Nikki Harris coaching biography", url: "https://www.runningandtriathlon.co.uk/nikki" },
      { title: "Sports Club brochure: prices and coaching information dated November 2023", url: "https://smcsports.co.uk/images/2025/WEB%20Running%20Triathlon%20Club%20Brochure%20NOV%202023.pdf" },
      { title: "Official indoor cycling page: dates to be confirmed", url: "https://www.runningandtriathlon.co.uk/cycling" },
      { title: "Official enquiry form", url: "https://www.runningandtriathlon.co.uk/contact" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.runningandtriathlon.co.uk/" },
    location_note: "The existing Curzon Street Sports Club address remains directory context. Club material establishes use of the Sports Club, but no new street-address or universal meeting-point verification is claimed.",
    contact_note: "Recovered the dedicated secretary email and enquiry form. No telephone or exact primary-linked social destination established; a social handle in the 2023 brochure is not expanded into a guessed URL. Eight-week versus ten-week course descriptions and old fees are not presented as current commitments. The 2023 brochure's junior options require current clarification; inherited directory eligibility is not silently changed."
  },
  "just-run-community": {
    summary: "Just Run Community is an adult running club in Lincoln and nearby Lincolnshire villages, combining sociable runs, structured training and an active member community.",
    biography: [
      "Just Run Community brings adult runners together in Lincoln and the surrounding villages of Lincolnshire, England. The England Athletics-affiliated club places the emphasis on personal progress rather than competition between members. Its website describes two weekly meetings: a sociable run of around seven kilometres and structured training that can be adapted to different levels of fitness.",
      "On social runs, a steady group pace and run-backs help runners stay connected. People wanting more distance can circle back, while someone needing a breather is not expected to disappear off the back of the group. Membership starts at 18, and the club's introduction offers four free sessions to help newcomers decide whether the group suits them.",
      "Members use a WhatsApp community to arrange runs, discuss events and organise visits to different parkruns. The website's Medal Monday posts celebrate what people have been doing, giving the club a social life beyond its training sessions. Contact the membership team by email, Facebook or Instagram to ask about a suitable first run and the current meeting point; the directory address at Bracebridge Heath is not confirmation that every session starts there."
    ],
    sources: [
      { title: "Official club homepage: weekly social and structured running", url: "https://justruncommunity.co.uk/" },
      { title: "Official club introduction: adult eligibility, tasters and member community", url: "https://justruncommunity.co.uk/the-club/" },
      { title: "Official membership email and social links", url: "https://justruncommunity.co.uk/contact-us/" },
      { title: "Official committee introduction", url: "https://justruncommunity.co.uk/committee/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://justruncommunity.co.uk/" },
    location_note: "The Heath, Village Hall & Library in Bracebridge Heath remains the governing-body directory address, not a newly confirmed training start. Ask the club for current meeting arrangements.",
    contact_note: "Official contact page publishes membership@justruncommunity.co.uk and Facebook/Instagram links. Existing Instagram provenance retained without duplication. Social destinations were throttled; publisher attribution does not establish present account ownership. No telephone, founding year or fully identified notable-member association established. Committee members' personal running dates are not club founding dates; undated fees are omitted."
  },
  "littleborough-runners": {
    summary: "Littleborough Runners grew from local Couch to 5K groups in 2016 and welcomes adult runners in the South Pennine foothills, with a strong social and beginner-running tradition.",
    biography: [
      "Littleborough Runners is based in Littleborough, Greater Manchester, England, at the foot of the South Pennines. Its story began with Couch to 5K groups at a local boxing club in June 2016, organised by Barbara Bayliss, Julie Durrant and Julia Moore. A subsequent move to the United Reformed Church brought the Littleborough Runners identity.",
      "The club's October 2019 history records eight beginner groups, eleven qualified run leaders and England Athletics affiliation by that point. These are historical milestones, not present membership or coaching numbers. Club runners joined beginners for their graduation run, making completion a shared celebration.",
      "The club's joining page is aimed at adults aged 18 and over who can run at least five kilometres, with Couch to 5K offered as a separate route for beginners. Its website lists Thursday evenings at the United Reformed Church on Victoria Street, but prospective runners should confirm the next session, course dates and charges by email before arriving. Older prices and a twice-yearly course description are not a current booking promise.",
      "Social occasions are part of the club's character too. The published welcome describes Christmas-lights runs, graduation celebrations, summer parties and trips away together. Its mix of beginners and experienced runners is intended to make joining a club less daunting. Use the club email or its website-linked Facebook group to ask where to start; the site's empty charity page does not establish a particular fundraising programme."
    ],
    notable_members: [
      { name: "Barbara Bayliss", connection: "Early running-group organiser", detail: "Named in the club's October 2019 account of its 2016 beginnings; current office unconfirmed." },
      { name: "Julie Durrant", connection: "Early Couch to 5K organiser", detail: "The club's October 2019 history credits her role in the original boxing-club programme." },
      { name: "Julia Moore", connection: "Early Couch to 5K organiser", detail: "Named in the club's October 2019 history; no present appointment inferred." }
    ],
    sources: [
      { title: "Official club history, written October 2019", url: "https://littleboroughrunners.wordpress.com/a-brief-history/" },
      { title: "Official joining guidance and published meeting address", url: "https://littleboroughrunners.wordpress.com/membership/" },
      { title: "Official welcome, social activities and enquiry email", url: "https://littleboroughrunners.wordpress.com/" },
      { title: "Official committee accounts of the early running groups", url: "https://littleboroughrunners.wordpress.com/meet-the-committee/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://littleboroughrunners.wordpress.com/", address_kind: "training" },
    location_note: "United Reformed Church, Victoria Street, OL15 9DB matches the existing directory and the official site's meeting header. Classified as a published training meeting point, not a clubhouse owned by the club. The historical prose says Victoria Road; the explicit address header and directory agree on Victoria Street. Confirm current arrangements before travelling.",
    contact_note: "Club email and website-linked Facebook group recovered; earlier directory Facebook page preserved. Destination throttled, so no ownership verification claimed. No telephone established. June 2016 is the precursor programme's origin; formal club founding remains unset. No unsupported LABC identity merge, current officer term, fundraising programme or present course availability inferred."
  }
};
