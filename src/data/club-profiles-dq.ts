import type { ClubProfile } from "./club-profiles";

// First-person community accounts and the league directory read 18 October 2026.
export const recoveredMeadsProfile: Record<string, ClubProfile> = {
  "meads-runners": {
    summary: "Meads Runners is an Eastbourne running club with a place in the East Sussex cross-country league and a history of seafront training and community fundraising.",
    biography: [
      "Meads Runners is a running club in Eastbourne, England, listed by the East Sussex Sunday Cross Country League as a team in its own right. The seafront also features in firsthand accounts of its running community. In a fundraising appeal for the 2022 Beachy Head Marathon, runners supporting Rotary Eastbourne's Homes for Homeless project described regular training on the promenade with Mike Ovens from Meads Runners. That account documents preparation for a particular challenge, rather than a timetable for today's club sessions.",
      "The club's own Festive Fun Run appeal offers an earlier glimpse of its community activity. It advertised a second five-kilometre event for 22 November 2014, raising money for the Ben McNicol Trust, following a successful event the previous year. The planned route went from the café at Holywell along the seafront to Fusciardis and back. People could walk, jog or run, and the invitation extended beyond club members. The appeal is now closed; its route and arrangements are part of the club's history, not a current event listing.",
      "Meads also appears in Eastbourne's wider endurance-sport community. In his introduction for the 2019 Eastbourne Triathlon, co-organiser Dale Anderton named it among the local clubs he trained with. This is a historical training association, not evidence that Meads organised the triathlon or offers swimming and cycling sessions. Prospective runners should use the retained public club enquiry contact to check current training, joining requirements and meeting points. A current club timetable and founding date could not be established from the available primary sources."
    ],
    notable_members: [{ name: "Dale Anderton", connection: "Historical training association", detail: "The Eastbourne Triathlon co-organiser named Meads Runners among the local clubs he trained with in the event's introduction for 2019. This does not establish formal or current membership." }],
    location_note: "First-person Eastbourne seafront training and event-organiser accounts establish Eastbourne as the club's town. The inherited Western Lawns directory address is retained without treating it as a confirmed current training venue or adding a street/postcode. The historical Holywell fun-run start is not substituted for a club address.",
    contact_note: "Reviewed 18 October 2026. Existing ECCA handbook enquiry details and their provenance are preserved; this review adds no email, telephone or social account. The league links the club website, but the site did not provide a readable current programme. X returned 403 and Facebook supplied no readable club text; no search-snippet social or timetable claims are adopted. The festive appeal's story explicitly describes November 2014 while the platform event header says November 2013; the biography attributes the planned 2014 event to the story, without claiming a confirmed delivery date. Both fundraising pages are closed. Charity, event-company and platform contacts are excluded.",
    sources: [
      { title: "East Sussex Sunday Cross Country League: participating clubs and official website link", url: "https://www.eastsussexcrosscountry.co.uk/clubs" },
      { title: "Meads Runners: organiser's 2014 Festive Fun Run appeal (closed; story and header dates differ)", url: "https://www.justgiving.com/MeadsRunnersFestiveFunRun" },
      { title: "Beachy Head Marathon 2022: first-person Eastbourne seafront training and fundraising account", url: "https://www.justgiving.com/fundraising/lammyandjonny" },
      { title: "Eastbourne Triathlon: Dale Anderton's historical local-club training account", url: "https://www.eastbournetriathlon.co.uk/about/" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { city: "Eastbourne" }
  }
};
