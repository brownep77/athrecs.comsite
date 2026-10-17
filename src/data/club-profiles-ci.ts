import type { ClubProfile } from "./club-profiles";

// Batch 87: recovered club pages and dated governing-body accounts.
export const recoveredTrainingAndCommunityProfiles: Record<string, ClubProfile> = {
  "sheffield-rc": {
    summary: "Sheffield Running Club brings social runners and competitors together for road, trail and cross-country running, with coached groups based at the English Institute of Sport.",
    biography: [
      "Sheffield Running Club began in November 2006 in Sheffield, South Yorkshire, England. It welcomes runners from 16, bringing together people who enjoy company on a run and those pursuing competitive goals. Road, trail and cross-country running sit alongside club championships and a social programme that includes running trips. The club also organises local events such as the Damflask Relays and Loxley Lash.",
      "Tuesday evenings are built around group runs at different paces, with regrouping along the way; Thursdays focus on intervals and drills. The English Institute of Sport on Coleridge Road is the main meeting point, with Saturday hill sessions and Sunday social runs providing other options. Published guidance generally gives a 6.15pm weekday start, but older FAQ passages say 6pm, so check the latest session notice and arrive early.",
      "Prospective members can try sessions before joining and are asked to provide emergency-contact details through the club's introductory form. The pages give slightly different 5K pace guidelines, around 40–45 minutes, so discuss the right group rather than treating either figure as a fixed entry standard. The enquiry form and public club emails provide a route to ask about suitability.",
      "Sheffield's competitive history includes Phillipa Williams, listed with Sheffield RC in England Athletics' September 2019 selection for the Senior Home Countries International Mountain Race. That dated association is not a statement about her current club membership."
    ],
    founded_year: 2006,
    notable_members: [{ name: "Phillipa Williams", connection: "England mountain-running selection, 2019", detail: "England Athletics listed Williams with Sheffield RC in its September 2019 team announcement; current membership is not inferred." }],
    sources: [{ title: "Club origins and membership age", url: "https://www.sheffieldrunningclub.org.uk/the-club/" }, { title: "Training groups", url: "https://www.sheffieldrunningclub.org.uk/the-club/club-nights/" }, { title: "Joining, trial sessions and meeting point", url: "https://www.sheffieldrunningclub.org.uk/join/" }, { title: "Enquiry form and published club email", url: "https://www.sheffieldrunningclub.org.uk/contact-us/" }, { title: "Club events and current notices", url: "https://www.sheffieldrunningclub.org.uk/" }, { title: "England Athletics team announcement, 12 September 2019", url: "https://www.englandathletics.org/news/mountain-running-team-announced-for-senior-home-countries-international/" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "English Institute of Sport is the weekday meeting base, not the start of every hill or social run.",
    contact_note: "Older FAQ times and pace guidance differ from the main training information; confirm the current group and start time."
  },
  "uttoxeter-road-runners": {
    summary: "Uttoxeter Road Runners combines Staffordshire road and summer trail running with beginner courses, club competition and a local Festival of Running.",
    biography: [
      "Uttoxeter Road Runners is a running club in Uttoxeter, Staffordshire, England, welcoming people aged 16 and over. Road running is central to its winter programme, while lighter evenings open up local off-road routes. Beginners can progress through Couch to 5K and onward towards 10K; ask the membership team about the next intake rather than assuming a course is currently open.",
      "The website lists Tuesday groups meeting at Lidl's Brookside Road car park, with Thursday social runs using different starting points during spring and summer. It also introduces a monthly members' track session at Denstone College in 2026. Runs are booked through the club's team app, which is the place to confirm the meeting point and cancel a booking if plans change. These are session venues, not a permanent clubhouse or postal address.",
      "Members take part in club championships, a parkrun-based series and the Burton and District Summer League. The club's Festival of Running on 19 April 2026 offered a half marathon, 10K and junior 2K. Its organiser page named YESS, 1st Uttoxeter Scouts and Girlguiding Uttoxeter as intended beneficiaries; it does not establish how much was ultimately donated.",
      "New runners can use the membership form or contact the membership secretary. The club constitution sets out its recreational and competitive purpose and inclusive approach to membership. Its founding year and notable alumni were not confirmed by the sources reviewed."
    ],
    sources: [{ title: "Training, beginner pathway, public contacts and club social link", url: "https://www.uttoxeterroadrunners.club/" }, { title: "Festival of Running, 19 April 2026", url: "https://www.uttoxeterroadrunners.club/festival-of-running-2026/" }, { title: "Club constitution and membership purpose", url: "https://www.uttoxeterroadrunners.club/uttoxeter-road-runners-constitution/" }, { title: "Membership page", url: "https://www.uttoxeterroadrunners.club/membership/" }],
    reviewed_at: "2026-10-16",
    corrections: { adult_only: false, website: "https://www.uttoxeterroadrunners.club/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Uttoxeter area only. Current Tuesday guidance names Lidl, Brookside Road; other sessions vary. The older Leisure Centre directory address is not retained as a universal training start.",
    contact_note: "Club welcomes runners from 16. Confirm course intake and session arrangements with the membership secretary."
  },
  "kingswood-triathlon-club": {
    summary: "Kingswood Triathlon Club grew from local Ironman training in 1986 into a Bristol-area community for swimming, cycling and running across a range of abilities.",
    biography: [
      "Kingswood Triathlon Club, often shortened to KiT, is based around Kingswood in the Bristol area of England. Its club history dates formation to 1986, when local triathletes organised training for early Ironman events. The club describes a mix of newcomers and experienced age-group athletes sharing practical knowledge across swimming, cycling and running.",
      "The readable training calendar shows a June 2026 programme using Page Park for group runs and rides, Mangotsfield Track for coached running, and Kingswood Leisure Centre for swimming. Pool sessions include both structured sets and technique work. These entries illustrate the club's training pattern, not a verified October timetable: confirm the current session, capacity and meeting point before travelling.",
      "The joining page directs new members to a Spond application, followed by a payment request, and describes calendar-year membership. Its training page invites prospective members to try sessions before committing. Family membership is marked as paused on the joining page, so availability should be checked instead of assuming that every membership category is open.",
      "First-person accounts in the club's committee history include Jeremy Tiley, who says he joined in 2018 and competed at the 2022 Ironman World Championships in Kona, and Eric Downey, who describes joining in 2001 and later representing Great Britain in his age group. These published accounts establish historical associations, not independently verified results or current office-holding."
    ],
    founded_year: 1986,
    notable_members: [{ name: "Jeremy Tiley", connection: "Member's published account", detail: "His club biography dates joining to 2018 and describes competing at Kona in 2022; no current role is asserted." }, { name: "Eric Downey", connection: "Long-serving member's published account", detail: "The club account dates his joining to 2001 and describes age-group representation for Great Britain; current office-holding is not inferred." }],
    sources: [{ title: "Club origins and first-person member histories", url: "https://kingswoodtri.com/who-is-kit/" }, { title: "Training calendar showing June 2026 sessions", url: "https://kingswoodtri.com/train-with-us/" }, { title: "Membership application and official social links", url: "https://kingswoodtri.com/join-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Kingswood", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Kingswood, Bristol area; the club uses several venues. The old directory postcode is not presented as a clubhouse.",
    contact_note: "The readable joining page links to Spond. Contact-page retrieval was rate-limited; no new general email or telephone is asserted. Confirm current session and membership options."
  },
  "thanet-ac": {
    summary: "Thanet Athletics Club offers running, jumping and throwing from its Ramsgate training base, with junior development and competition pathways dating from 2010.",
    biography: [
      "Thanet Athletics Club launched in 2010 in Kent, England, and trains at the Royal Harbour Academy in Ramsgate. The club offers athletics from age seven, with sportshall, track-and-field and cross-country opportunities. Its programme includes the Kent Young Athletes League, Southern Athletics League and county championships, giving athletes routes into team competition as well as individual events.",
      "Training is organised around event groups covering sprinting, middle-distance running, hurdles, jumps and throws. The published timetable places the main groups on Tuesday and Friday evenings and gives under-12s an earlier Friday session. Some specialist jump coaching is available by arrangement. The club welcomes enquiries from disabled individuals and groups; discuss the appropriate session and any support needed before booking.",
      "The 2026 joining page offers a two-week trial with up to four sessions, but booking is still required because event groups have limited places. Under-12s have a separate membership route. After choosing the appropriate membership or trial, athletes use their account to select and book sessions. The public club email is available for joining questions; check the live timetable before attending."
    ],
    founded_year: 2010,
    sources: [{ title: "Club history, age range and competitions", url: "https://www.thanetac.co.uk/about" }, { title: "Event groups and separate under-12 timetable", url: "https://www.thanetac.co.uk/training" }, { title: "2026 joining and trial booking instructions", url: "https://www.thanetac.co.uk/join" }, { title: "Club base, accessibility enquiries and public email", url: "https://www.thanetac.co.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.thanetac.co.uk/", address: "Royal Harbour Academy, Ramsgate, Kent", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Royal Harbour Academy is the confirmed training venue. The old Cliffsend street address is not treated as the training base; exact campus access and postcode need confirmation.",
    contact_note: "Book trials as well as regular sessions; under-12s have separate arrangements. No telephone or named alumni were confirmed."
  },
  "west-4-harriers": {
    summary: "West 4 Harriers is a Chiswick running club with a community focus, documented in England Athletics' account of its recruitment and club-development work.",
    biography: [
      "West 4 Harriers is based in Chiswick, west London, England. England Athletics' June 2024 club feature describes its connection with Polytechnic Harriers and a community spanning adult runners of different abilities. The report's age-of-club wording is inconsistent, so an exact founding year is left open rather than calculated from it.",
      "In that report, secretary Jason Drake explained how a Club Improvement Fund grant helped pay for a recruitment video. The aim was to show prospective runners the club and ease worries about joining. Developing run leaders and adapting sessions were part of managing growth without losing the quality of members' experience.",
      "The club also has a competitive road-running history. England Athletics identified Paul Piper with West 4 Harriers in its September 2019 report on the England Masters team at Maidenhead. This is a dated association, not confirmation of present membership.",
      "The official website could not be read sufficiently to confirm a current training timetable, joining procedure or general enquiry contact. Check arrangements with the club before attending; the historical feature is not a current session invitation."
    ],
    notable_members: [{ name: "Jason Drake", connection: "Secretary interviewed in June 2024", detail: "Discussed recruitment and sustainable club development in England Athletics' 2024 feature; current office is unconfirmed." }, { name: "Paul Piper", connection: "England Masters association, 2019", detail: "England Athletics identified Piper with West 4 Harriers in its September 2019 Maidenhead report; current membership is not asserted." }],
    sources: [{ title: "England Athletics club-development feature, 24 June 2024", url: "https://www.englandathletics.org/news/keeping-community-at-the-core-west-4-harriers/" }, { title: "England Masters report, 2 September 2019", url: "https://www.englandathletics.org/news/england-masters-conquer-maidenhead-half-marathon/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Chiswick", county: "Greater London", region: "London" },
    location_note: "Chiswick area identified by England Athletics; no current meeting point confirmed.",
    contact_note: "Club website retrieval failed. No unverified current contact or timetable has been added."
  }
};
