import type { ClubProfile } from "./club-profiles";

// Batch 103: club-written community accounts and recovered joining information.
export const heyfordRavensDunstableProfiles: Record<string, ClubProfile> = {
  "heyford-aardvarks-running-club": {
    summary: "Heyford Aardvarks Running Club brings beginners and experienced runners together around the Heyfords near Bicester, with road and trail running rooted in the local community.",
    biography: [
      "Heyford Aardvarks Running Club, also known as HARC, runs around the Heyfords near Bicester in Oxfordshire, England. Heyford Park's community listing describes a club for people taking their first running steps as well as those tackling ultra distances, with enjoyment and companionship at the centre of its approach.",
      "The club's own August 2022 contribution to Valley News gives a picture of that approach in practice. Leaders adapted their pace to the runner, walking breaks were welcome and newcomers could arrange a taster before a club night. The programme combined a social five-kilometre road route, summer trail loops and progression sessions using hills or faster efforts.",
      "That newsletter described Monday and Thursday evening meetings, but it is a historical account, not a current timetable. Ask the club about today's sessions, suitable routes and first-visit arrangements before travelling. The enquiry email is still published in Heyford Park's community directory. Its inclusive introduction does not specify junior supervision or age limits, so families should check those arrangements directly rather than assuming every run is suitable for children."
    ],
    sources: [
      { title: "Heyford Park community listing and club enquiry email", url: "https://www.heyfordpark.com/community" },
      { title: "Club-written introduction in Valley News, August 2022, page 13", url: "https://www.thevalleynews.co.uk/wp-content/uploads/2022/07/Valley-News-August-2022-colour-web1.pdf" }
    ],
    reviewed_at: "2026-10-17",
    location_note: "Corbett Close remains a directory address, not a confirmed training venue. The 2022 Dacey Drive/Camp Road meeting point is historical and has not replaced it.",
    contact_note: "Club email corroborated by the community publisher. Facebook URL is printed in the 2022 club column; destination retrieval was disabled, so current ownership is unverified. No telephone, founding year or named notable association established. Estate-management and unrelated group contacts excluded."
  },
  "ravens-city-of-london-running-club": {
    summary: "Ravens City of London Running Club grew from London's insurance community in 1997, with a history of group running and team competition in England's capital.",
    biography: [
      "Ravens City of London Running Club has its roots in London's insurance market, bringing colleagues together through running in England's capital. Phil Hernon's first-person account, dated 13 August 2025, recalls helping to form the club in 1997. The same founding year appears in the club-supplied entry in ClubSonar's spring and summer 2017 magazine.",
      "That entry describes members drawn from broking, underwriting, finance, legal work and other parts of the market. It also records a beginners and improvers group, intended to help less experienced runners build towards joining the main group, and an effort to welcome more women. Team competition featured alongside everyday running: the club reported retaining its Mob Match title against the banking community in 2016.",
      "England Athletics' May 2026 list records Ravens City of London Running Club for road running and cross-country. This is distinct from Ravens School Runners in Bromley. The historical accounts explain the club's character, but do not establish today's meeting time, eligibility or fees. Check current arrangements through the governing-body listing before attending; the directory's Marnock Road address is not a confirmed run start, and the old company email addresses have not been republished as current enquiry contacts."
    ],
    founded_year: 1997,
    notable_members: [
      { name: "Phil Hernon", connection: "Founding organiser", detail: "His own 13 August 2025 account recalls forming Ravens in 1997. This is a historical organisational association, not a claim of current office or verified athlete identity." }
    ],
    sources: [
      { title: "Phil Hernon's first-person account, 13 August 2025", url: "https://www.linkedin.com/posts/phil-hernon-3ba39294_i-never-post-but-thought-i-would-just-do-activity-7361369424068517889-EALd" },
      { title: "Club-supplied Ravens account, ClubSonar spring/summer 2017, pages 24–25", url: "https://intechforums.com/Uploads/Files/ClubSonar%20Magazine%202017.pdf" },
      { title: "England Athletics affiliated clubs, 1 May 2026, page 12", url: "https://d1laub10p5ibfa.cloudfront.net/2026/05/Affiliated-Clubs-and-Organisations-at-1-May-2026.pdf" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { city: "London" },
    location_note: "London locality supported by the governing-body list and founder's account. Marnock Road remains directory context, not a training venue; no Tower Bridge meeting schedule adopted from an independent directory.",
    contact_note: "Official website unavailable. No fresh direct contact, form or primary-attributed social link established. Historical workplace emails excluded. Search results on Tom Nichols' profile reproduced Phil Hernon's post; Tom is not credited as founder. Unrelated personal material in the post is not included."
  },
  "dunstable-lions-running-club": {
    summary: "Dunstable Lions Running Club offers sociable group runs, coaching and team competition in Bedfordshire, welcoming runners who can already cover five kilometres.",
    biography: [
      "Dunstable Lions Running Club is based in Dunstable, Bedfordshire, England. Its official introduction combines enthusiasm for racing as a team with the simple pleasure of running alongside other people. Although it welcomes different abilities, the club asks prospective members to be able to run at least five kilometres before joining.",
      "The published programme includes a main Wednesday evening training meeting at Dunstable Leisure Centre and additional Monday and Tuesday meetups. Monday's Back to Running session is described as a relaxed, free social five-kilometre run, with regrouping along the way. Contact the club before attending to confirm the next meeting and whether it suits your experience.",
      "Club activities include road racing, cross-country, speed work and coaching. In March 2026, Dunstable Town Council highlighted the Lions as a beneficiary of its community lottery, with a supporter describing the friendships and welcoming atmosphere created through running.",
      "Use the dedicated club email for joining questions. The website offers club-only and England Athletics-inclusive membership payments; ask about current fees and which option suits your plans before paying."
    ],
    sources: [
      { title: "Official club introduction, joining guidance, sessions and email", url: "https://www.dunstablelionsrc.co.uk/" },
      { title: "Dunstable Town Council community support report, 24 March 2026", url: "https://www.dunstable.gov.uk/news/local-resident-wins-250-on-the-dunstable-community-lottery/" },
      { title: "England Athletics affiliated clubs, 1 May 2026, page 1", url: "https://d1laub10p5ibfa.cloudfront.net/2026/05/Affiliated-Clubs-and-Organisations-at-1-May-2026.pdf" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.dunstablelionsrc.co.uk/", address_kind: "training" },
    location_note: "The official meeting venue matches the existing leisure-centre directory address. Classified as training, not club-owned premises; no new postcode check claimed.",
    contact_note: "Dedicated email recovered. No telephone or exact official social link established. Council and Wix contacts excluded; payment buttons were not submitted. Founding and named associations remain unset."
  }
};
