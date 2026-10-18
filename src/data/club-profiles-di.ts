import type { ClubProfile } from "./club-profiles";

// Founder, local-authority and firsthand community-event accounts, read 18 October 2026.
export const barlestoneAndBerkeleyProfiles: Record<string, ClubProfile> = {
  "barlestone-st-giles-rc": {
    summary: "Barlestone St Giles RC is a Leicestershire running club founded in 2015, with village training, beginner sessions and road-league competition.",
    biography: [
      "Barlestone St Giles Running Club brings runners together in Barlestone, Leicestershire, England. Tony Walker founded the club in 2015 and describes developing his coaching through his work with its members. His account records a Coach in Running Fitness qualification in 2018, followed by endurance and athletics coaching qualifications. The club is part of the Leicestershire Road Running League, whose directory identifies its silver vest with orange trim.",
      "The club meets at Barlestone St Giles Football Club on Barton Road. Its parish-council listing advertises Monday evenings from 6.45pm; newcomers should confirm the arrangements before attending. Hinckley and Bosworth Borough Council describes sessions for beginners and more advanced runners, alongside a junior section called Junior Saints. Families should ask specifically about that section's ages and current intake rather than assume every club session is suitable for children.",
      "The borough's running guide also lists Walk2Run21 Barlestone, a nine-week route towards 5K using the same football-club meeting point and club enquiry email. This provides a useful starting enquiry for someone building up from walking to running, but the listing does not guarantee that a course is currently accepting runners. Contact the club for its next beginner opportunity, regular training groups or advice on joining road-league activities."
    ],
    founded_year: 2015,
    notable_members: [
      { name: "Tony Walker", connection: "Founder and coach", detail: "Walker states in his own coaching biography that he founded Barlestone St Giles Running Club in 2015 and developed his coaching through working with its members." }
    ],
    corrections: { city: "Barlestone", address: "Barlestone St Giles Football Club, Barton Road, Barlestone, CV13 0EP", address_kind: "training" },
    location_note: "Barton Road is a training meeting point supported by the borough council and road-league directory, not an inferred correspondence address. Barlestone replaces the broader Nuneaton postal-town label; the existing postcode is retained.",
    contact_note: "Sources read on 18 October 2026. The club-role email and Facebook route are published by the borough council; the social destination was not readable. The parish listing was updated on 19 August 2026. England Athletics' existing adult-only field is retained pending reconciliation with the borough's separately named Junior Saints section. No current intake, club telephone or commercial coaching contact is inferred.",
    sources: [
      { title: "Tony Walker Coaching: founder's own account", url: "https://www.tonywalkercoaching.co.uk/about-4" },
      { title: "Barlestone Parish Council: club-supplied meeting and contact listing", url: "https://www.barlestoneparishcouncil.gov.uk/findmynearest/858225" },
      { title: "Hinckley and Bosworth Borough Council: running groups and beginner pathways", url: "https://www.hinckley-bosworth.gov.uk/info/200313/running/786/more_about_running/2" },
      { title: "Leicestershire Road Running League: member clubs and addresses", url: "https://www.lrrl1984.co.uk/member-clubs" }
    ],
    reviewed_at: "2026-10-18"
  },
  "new-berkeley-harriers": {
    summary: "New Berkeley Harriers is a Gloucestershire running club with a community road-running outlook and a Jenner Jog partnership in Berkeley.",
    biography: [
      "New Berkeley Harriers is a running club in Berkeley, Gloucestershire, England, whose community life extends beyond its home town. A March 2025 Great Run feature describes members arranging shared transport to the Great Bristol Run, taking part in both the 10K and half marathon and meeting afterwards. The firsthand account identifies the club's green-and-gold kit and gives a picture of runners supporting one another through different distances, rather than a club defined by one race or pace.",
      "In Berkeley itself, the Harriers worked with the Jenner Trust at Dr Jenner's House to stage the inaugural Jenner Jog. Museum director James Rodliff's account describes a 10K route passing landmarks associated with Edward Jenner, with museum volunteers and trustees providing refreshments. The partnership brought runners into the museum and garden as well as onto the town's roads. A visiting-team report from Bourton Roadrunners confirms that New Berkeley Harriers hosted the Jenner Jog on 1 March 2026 as the second event in that year's Gloucestershire AAA Road Race series.",
      "For enquiries, Full On Sport's organiser directory publishes a New Berkeley Harriers club mailbox and telephone contact. These are organiser-supplied details, not the platform's support service. Prospective members should ask the club about current group runs, membership and appropriate starting sessions: the readable sources do not establish a weekly timetable or an open beginner course. The Jenner museum is documented here as an event partner and venue, not as the club's regular training base."
    ],
    location_note: "The existing Canon Park address remains an England Athletics directory address. Neither the organiser's different postal code nor the Jenner Jog venue is substituted as a confirmed training base.",
    contact_note: "Sources read on 18 October 2026. The email and telephone are matched to the New Berkeley Harriers organiser row on Full On Sport; the listing has no visible update date. The existing governing-body-supplied Facebook website is preserved, but Facebook returned a temporary block and no new social account is asserted. No founding year, current timetable or notable-member entry is inferred from an ordinary participant's story. RaceNation returned no readable event text, so future race details are not adopted.",
    sources: [
      { title: "Great Run, 20 March 2025: firsthand account of running with New Berkeley Harriers", url: "https://www.greatrun.org/news/catching-the-running-bug-at-70/" },
      { title: "James Rodliff, Jenner Trust museum director: inaugural Jenner Jog partnership", url: "https://www.linkedin.com/posts/james-rodliff-89224055_my-first-big-event-as-museum-director-at-activity-7302056722112684033-EaV1" },
      { title: "Bourton Roadrunners: firsthand Jenner Jog report, 1 March 2026", url: "https://bourtonroadrunners.co.uk/race_reports/2026_reports/race_reports_1-03-2026_jenner_10k_newport_half_%26_parkrun.htm" },
      { title: "Full On Sport: New Berkeley Harriers organiser contact row", url: "https://www.fullonsport.com/organiser/search/request/" }
    ],
    reviewed_at: "2026-10-18"
  }
};
