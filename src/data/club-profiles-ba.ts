import type { ClubProfile } from "./club-profiles.ts";

// Primary club sources opened 15 October 2026; historical roles are not athlete identities.
export const readingAndReephamProfiles: Record<string, ClubProfile> = {
  "reading-joggers": {
    summary: "Reading Joggers has brought adult runners together since 1977, combining social outings around Tilehurst with coached training, track sessions and club handicaps.",
    biography: [
      "Reading Joggers was formed in 1977 during the first jogging boom. Based in Reading, Berkshire, England, it welcomes runners aged eighteen and over with different levels of experience. Its published history identifies Stan Eldon as one of the founding members.",
      "Social runs, structured training, summer and winter handicaps and a club championship provide different ways to take part. Tuesday groups run by pace, with routes including local roads and summer trails around the Thames Path and Sulham Woods. Thursday sessions concentrate on speed or endurance, while Palmer Park provides track opportunities.",
      "Prospective members can email to arrange two trial sessions before joining. Tuesday gatherings are in the Tilehurst Triangle area, but occasional outings start elsewhere and Thursday venues vary. The club's pages differ on the precise Tuesday meeting point and track charges, so confirm those details and the current calendar before a first visit."
    ],
    founded_year: 1977,
    notable_members: [{ name: "Stan Eldon", connection: "Founding member", detail: "The club's own history identifies Eldon as one of the founding members of Reading Joggers." }],
    sources: [
      { title: "Club history and founding member", url: "https://www.readingjoggers.org/reading-joggers-history/" },
      { title: "Adult membership and club introduction", url: "https://www.readingjoggers.org/" },
      { title: "Membership and trial enquiries", url: "https://www.readingjoggers.org/about-us/membership/" },
      { title: "Training routes and meeting arrangements", url: "https://www.readingjoggers.org/events/club-runs-training/" },
      { title: "Contact and community-centre location", url: "https://www.readingjoggers.org/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://www.readingjoggers.org/", adult_only: true },
    location_note: "Tuesday pages name both the Co-op at 21 The Triangle and the nearby Tilehurst Youth & Community Centre. Confirm the exact meeting point; some runs start elsewhere and Thursday venues vary.",
    contact_note: "Email to arrange two trial sessions. Official pages conflict about track charges, so check the current arrangements directly."
  },
  "reepham-runners": {
    summary: "Reepham Runners combines Norfolk lanes and farm tracks with structured training, social runs and team events such as the Round Norfolk Relay.",
    biography: [
      "Reepham Runners is based in the market town of Reepham, Norfolk, England, north-west of Norwich. The club describes an inclusive running community using the area's quiet lanes and farm tracks, with opportunities for different paces and abilities to take part in team events such as the Round Norfolk Relay.",
      "Tuesday training at Stimpson's Piece includes structured effort sessions. Thursday and Sunday runs provide a range of distances, with outings around Reepham and Blickling. The club also describes organising a summer 10K and winter cross-country event, with members encouraged to help; check its event information for dates rather than assuming a race is currently open.",
      "Newcomers can try up to three sessions before joining, with prospective members asked to start on Tuesdays so trainers can help them find a suitable level. Visitors are also welcomed and should introduce themselves to a trainer. The club uses online membership and publishes a secretary's email for enquiries."
    ],
    sources: [
      { title: "Club introduction, events and secretary contact", url: "https://www.reephamrunners.co.uk/" },
      { title: "Trial sessions and visitor arrangements", url: "https://www.reephamrunners.co.uk/join-us" },
      { title: "Training and club runs", url: "https://www.reephamrunners.co.uk/members-info" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Reepham", website: "https://www.reephamrunners.co.uk/" },
    location_note: "Tuesday training is at Stimpson's Piece in Reepham. Other runs can start at Blickling or elsewhere; the retained Bartle Court directory address is not a confirmed training start.",
    contact_note: "Prospective members should use Tuesday sessions for their initial visits and introduce themselves to a trainer."
  }
};
