import type { ClubProfile } from "./club-profiles";

// Batch 106: club-written introductions and dated community accounts.
export const sheppeyWiganAndWintertonProfiles: Record<string, ClubProfile> = {
  "allstride-collective-running-club": {
    summary: "Allstride Collective Running Club brings runners together around Sheerness and the Isle of Sheppey in Kent, with social running and a Stride to 5 introduction for beginners and returners.",
    biography: [
      "Allstride Collective Running Club is a road-running community around Sheerness and the Isle of Sheppey in Kent, England. Its own introduction places shared goals and friendships alongside individual improvement: runners can work towards a personal best or simply enjoy being out on the road together. The club's Strava community gives another way to connect with that local group, rather than representing a separate club.",
      "For people starting out or returning to running, Allstride has advertised Stride to 5, a free ten-week course building towards a continuous 5 km run. Its club-written Everyday Active Kent listing describes Tuesday and Thursday evening sessions and alternate Sunday mornings, with meeting locations announced on social media the week before. The course announcement is undated, so prospective runners should ask about the next intake and confirm the current session before travelling. The listing links to the club's social channels; the directory's Lower Road business address should not be assumed to be a training meeting point."
    ],
    sources: [
      { title: "Allstride Collective: club-written introduction on Strava", url: "https://www.strava.com/clubs/allstridecollective" },
      { title: "Everyday Active Kent: Allstride's provider-written activity and joining information", url: "https://www.everydayactivekent.org.uk/activities/allstride-collective/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { sports: ["Running"] },
    location_note: "Meeting locations vary and are announced through the club's social channels. Lower Road remains a directory address, not a confirmed training venue.",
    contact_note: "The activity listing and Strava introduction were read on 17 October 2026. Existing directory Facebook and Instagram links retain their original provenance; the Instagram link is not duplicated. No club email, telephone, founding year or notable-member association was established. Active Kent footer contacts and tracking-bearing social redirects are excluded. Only running is supported, so inherited triathlon, duathlon, aquathlon and swimming tags are removed."
  },
  "robin-park-runners": {
    summary: "Robin Park Runners is a social road-running club in Wigan, England, with led group runs, beginner support and a record of volunteering in the local running community.",
    biography: [
      "Robin Park Runners brings people together for social road running in Wigan, England. In a 2024 interview, organiser Mark Harrison explained that members could attend around work and family commitments, with no pressure to come every week. Led runs used a mustering system so people moving at different speeds could stay together. The emphasis was on company and a welcome for newcomers, rather than requiring everyone to become a competitive racer.",
      "A first-person account published by RunThrough on 30 June 2021 described the club as newly affiliated. Its community role later included plans to provide the volunteers for Haigh Woodland parkrun on 27 April 2024, with another takeover advertised for 9 May 2026. Local reporting also describes a Beginners to Winners programme and support for charities including Joining Jack, The Brick and Wigan and Leigh Hospice. These are dated accounts of the club's development, not verification of individual race results.",
      "The 2026 report lists Tuesday and Thursday evening runs and a Sunday morning session from Trencherfield Mill car park, consistent with the meeting point described in the 2024 interview. New runners should use the linked club Facebook page to confirm the current timetable, suitable groups and joining arrangements. The mill address is retained as directory information; no new postcode check or permanent clubhouse is implied."
    ],
    notable_members: [
      { name: "Mark Harrison", connection: "Founding organiser", detail: "Identified as founder in the 2026 local report and interviewed about the club's social approach in April 2024. Sources disagree on a 2019 or 2020 founding year, which remains unset. This is an organisational association, not a verified athlete identity or current office claim." }
    ],
    sources: [
      { title: "RunThrough: David Lawless's firsthand account, 30 June 2021", url: "https://club.runthrough.co.uk/runner-feature-david-lawless/" },
      { title: "Wigan Today: Mark Harrison interview and planned parkrun volunteering, 26 April 2024", url: "https://www.wigantoday.net/health/wigan-running-group-takeover-event-with-passion-and-pace-4605219" },
      { title: "What's Happening in Wigan: 2026 club report and official Facebook link", url: "https://www.whatshappeninginwigan.co.uk/wigans-robin-park-runners-set-for-haigh-hall-parkrun-takeover-this-may/" }
    ],
    reviewed_at: "2026-10-17",
    location_note: "Trencherfield Mill car park is described as a meeting point in dated 2024 and 2026 reports. Confirm the next session with the club; the inherited address and postcode retain their directory classification.",
    contact_note: "The linked rprwigan Facebook page is attributed to the opened local report; Facebook returned a temporary block, so current account ownership was not verified. Publisher and RunThrough contacts are excluded. Founding-year reports conflict: 2020 in Wigan Today versus 2019 in the 2026 report. No year is selected, and no direct club email or phone was established. David Lawless's historical account is not a claim of current membership; no results or personal health details are imported."
  },
  "winterton-running-club": {
    summary: "Winterton Running Club serves the Winterton and Scunthorpe area of North Lincolnshire, with road running, cross-country and a documented history of supporting local causes through its ten-mile race.",
    biography: [
      "Winterton Running Club is an adult running club in the Winterton and Scunthorpe area of North Lincolnshire, England, with road running and cross-country listed by England Athletics. Its ten-mile race has also supported community fundraising. In an autumn 2014 account, the Winterton and District branch of Leukaemia and Lymphoma Research thanked the club for donating £1 for each entrant in the road race at Winterton Show. The charity's wider fundraising total was not solely the club's contribution.",
      "The Poirier Foundation's own April 2020 parish-magazine column records its selection as the club's race charity. During the pandemic, a later column carried the club's plan for a free virtual version of the Winterton Show ten-mile race, inviting voluntary donations to the foundation. That historical proposal shows how organisers sought to keep the event connected to its local cause; it is not a current race invitation or evidence of the eventual fundraising total.",
      "The directory links to the club's Facebook and Instagram accounts. Prospective members should confirm current training groups, meeting points and membership arrangements through those channels, as a current joining timetable could not be established from the accessible primary sources. The West Street directory address and the agricultural showground should not be treated as confirmed weekly training bases."
    ],
    sources: [
      { title: "Out 'n About in Winterton, autumn 2014: charity branch's firsthand report, page 25", url: "https://winoaaiw.weebly.com/uploads/1/9/0/7/19070701/oaaiw_autumn14web.pdf" },
      { title: "Winterton parish magazine, April 2020: Poirier Foundation column, page 13", url: "https://lincoln.ourchurchweb.org.uk/winterton/docstore/437.pdf" },
      { title: "Winterton parish magazine, cover dated July 2020: Poirier Foundation and club race proposal, page 12", url: "https://lincoln.ourchurchweb.org.uk/winterton/docstore/503.pdf" }
    ],
    reviewed_at: "2026-10-17",
    location_note: "West Street remains directory context. No training venue is inferred from the agricultural show's event address or historical fundraising reports.",
    contact_note: "Existing England Athletics contact route and source-attributed social links retain their 13 October 2026 check dates. Facebook was unavailable. No direct club email, phone, founding year or notable-member association was established. Parish, charity and show-organiser contacts are excluded. The 2020 PDF metadata says June but its cover says July; the citation follows the cover. Its inconsistent weekday/date wording is not reproduced."
  }
};
