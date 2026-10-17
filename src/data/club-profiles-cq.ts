import type { ClubProfile } from "./club-profiles";

// Batch 95: recovered official pages and explicitly dated community histories.
export const recoveredRegionalAndTriathlonProfiles: Record<string, ClubProfile> = {
  "billericay-striders": {
    summary: "Billericay Striders has brought Essex runners together since 1986, with coached training, social runs, junior participation and its own 10K race.",
    biography: [
      "Billericay Striders is a running club in Billericay, Essex, England, established in 1986. It welcomes runners from beginners to those pursuing county-level competition, with road racing and cross-country alongside local fun runs. The club includes juniors aged eleven and over as well as adults, and organises the Billericay Striders 10K.",
      "Tuesday evenings concentrate on coached training, normally using the 400-metre grass track at Billericay School. Some summer sessions move to the hills at Gloucester Park, so the weekly club message matters. Thursday runs are more social, usually leaving the clubroom at Hannakins Farm in pace groups with a leader and a runner at the back. Local footpaths and seasonal routes give members variety beyond the track.",
      "The welcome page offers an enquiry form and a general club email. Prospective runners should use those routes to ask about the right group and arrangements for a first visit. The directory address on Fieldfare is not either of the advertised session venues."
    ],
    founded_year: 1986,
    sources: [{ title: "Official welcome, history and enquiries", url: "https://www.billericaystriders.co.uk/welcome" }, { title: "Official club runs and seasonal venue guidance", url: "https://www.billericaystriders.co.uk/club-runs" }],
    reviewed_at: "2026-10-17",
    corrections: { city: "Billericay" },
    location_note: "Fieldfare remains a directory address. Tuesday school-track and Thursday Hannakins Farm sessions have separate meeting points; summer hill sessions can move.",
    contact_note: "Rendered official pages read. Coach-profile page supplied no usable names; no notable-member association inferred. Confirm junior arrangements and the weekly meeting point before attending."
  },
  "southampton-triathlon-club": {
    summary: "Southampton Triathlon Club combines pool swimming, cycling and coached running, with optional racing, social activities and several membership routes.",
    biography: [
      "Southampton Triathlon Club was formed in 1987 in Southampton, Hampshire, England. Its programme brings swimming, cycling and running together for people with different goals, from trying multisport to preparing for competition. Racing is optional: group training and social activities are part of club life in their own right.",
      "Pool sessions use Oaklands and The Quays, while Thursday running alternates track work and hills around Southampton's sports-centre facilities. Cycling changes with the season, including social rides and winter virtual sessions. Members can also take part in cross-country, New Forest time trials and an autumn hill climb. Tim Wilks Day remembers a former member through a shared day of swimming, cycling and running.",
      "The joining page distinguishes social, non-swim, morning-swim and fuller swim memberships, rather than promising every session with every option. On 17 October 2026 it advertised waiting lists for adult and concession full-swim memberships, but availability for morning-only swimming. A free taster can be arranged through the membership enquiry form. Check the booking calendar, pool capacity and any junior-specific arrangements before attending."
    ],
    founded_year: 1987,
    notable_members: [{ name: "Tim Wilks", connection: "Former member commemorated by the club", detail: "The official events page describes Tim Wilks Day as a memorial club activity; not a current-membership claim." }],
    sources: [{ title: "Official club introduction and origins", url: "https://www.southamptontriclub.co.uk/" }, { title: "Training venues and booking calendar", url: "https://www.southamptontriclub.co.uk/training" }, { title: "Club racing, social events and Tim Wilks Day", url: "https://www.southamptontriclub.co.uk/racing-events" }, { title: "Joining options, taster and swimming capacity", url: "https://www.southamptontriclub.co.uk/join-in" }],
    reviewed_at: "2026-10-17",
    corrections: { address_kind: "training" },
    location_note: "Sports-centre address is the running base, not the swimming venue or every cycling start.",
    contact_note: "Full-swim waiting lists and morning-only availability were published on 17 October 2026. Pages disagree on the number of weekly swims, so no fixed total is asserted. Junior eligibility requires confirmation; no adult-only override."
  },
  "coalville-triathlon-club": {
    summary: "Coalville Triathlon Club offers swimming, cycling and running around north-west Leicestershire, with a run-only option and a club-managed booking platform.",
    biography: [
      "Coalville Triathlon Club is a non-profit community club in Coalville, Leicestershire, England. Its programme covers swimming, cycling, running and strength training, with a run-only option and England Athletics registration for league competition.",
      "Coached swimming uses Ibstock Community College and Ashby Grammar School. Saturday rides leave Coalville Clock Tower; riders need membership, a roadworthy bicycle and a helmet. Thursday hill, speed and endurance runs usually meet at Coalville and Whitwick Leisure Centre. These are leader-led rather than coached sessions, complemented by monthly social runs.",
      "The former Membermojo portal now directs members to SportMember for membership, activities and bookings. Use that route or the club's published phone to confirm arrangements and eligibility. The platform's Highfield Street contact address is not identified as a training venue."
    ],
    sources: [{ title: "Club-managed SportMember programme and public telephone", url: "https://www.holdsport.net/klub/coalville-triathlon-club" }, { title: "Former membership portal: move to SportMember", url: "https://membermojo.co.uk/ctc" }, { title: "Provider-supplied public enquiry email and social links", url: "https://www.active-together.org/directory/coalville-triathlon-club" }],
    reviewed_at: "2026-10-17",
    location_note: "Sparkenhoe Estate remains directory context, not training. SportMember's Highfield Street contact address is distinct from the pools, Clock Tower and leisure-centre meeting points.",
    contact_note: "Current platform phone preferred over the different undated Active Together number. Platform email masked; not guessed. Older Membermojo membership prices/options superseded by its migration notice. Founding year and notable members unconfirmed; broad all-ages wording does not settle junior entry rules."
  },
  "brighton-and-hove-womens-running-club": {
    summary: "Brighton & Hove Women's Running Club has a documented tradition of beginner support, Sussex competition and volunteering at the Brighton Marathon.",
    biography: [
      "Brighton & Hove Women's Running Club is a women's running community in Hove, East Sussex, England. The Brighton Marathon organiser included it in its February 2026 guide to local running groups, describing an inclusive club for varied abilities and backgrounds. Earlier first-person accounts show how beginner runners helped shape its development.",
      "In a September 2014 interview, Carol Kennedy recalled joining a beginners' group in 2011 and becoming chair in 2013. England Athletics' June 2018 feature described beginner and return-to-running programmes under then-chair Naomi Sharp. Its April 2019 visit recorded members' interests from parkrun to ultramarathons, participation in Sussex road and cross-country leagues, and a base at Hove Rugby Club.",
      "Volunteering also features in that history: the 2019 account describes forty members helping at mile 24 of the Brighton Marathon. These dated accounts explain the club's community character, rather than confirming today's committee or timetable. Prospective members should use the club website to check current joining arrangements, beginner-course availability and meeting points before visiting."
    ],
    notable_members: [{ name: "Carol Kennedy", connection: "Historical club chair", detail: "In a September 2014 first-person interview, described joining in 2011 and becoming chair in 2013." }, { name: "Naomi Sharp", connection: "Chair in dated England Athletics accounts", detail: "Named as chair in June 2018 and April 2019; not a current-role claim." }],
    sources: [{ title: "Brighton Marathon organiser's local running guide, February 2026", url: "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/article/where-find-your-people-running-communities-brighton-hove" }, { title: "Carol Kennedy interview, September 2014", url: "https://runbrighton.com/stories-and-interviews/carol-kennedy/" }, { title: "England Athletics feature, 21 June 2018", url: "https://www.englandathletics.org/news/womens-sport-week-brighton-and-hove-womens-running-club-2/" }, { title: "England Athletics club visit, 24 April 2019", url: "https://www.englandathletics.org/news/club-visit-to-brighton-hove-womens-running-club/" }],
    reviewed_at: "2026-10-17",
    location_note: "Hove Rugby Club is documented in 2019 and retained as directory context, not a newly verified current session start.",
    contact_note: "Club website unavailable during review. Exact founding year, current timetable, beginner intake and direct enquiry contacts remain unconfirmed. Visiting England Athletics staff are not treated as members."
  },
  "crystal-peaks-runners": {
    summary: "Crystal Peaks Runners is a Sheffield running club with a history of Moss Valley events and practical support for local charities and foodbank projects.",
    biography: [
      "Crystal Peaks Runners is a running club in Sheffield, South Yorkshire, England. Its official website describes a small, friendly England Athletics-affiliated club supporting local and national charities. Crystal Peaks shopping centre has also highlighted members' participation in the Foodbank Run, carrying food and supplies to S12 Community Pantry. That report describes a 26 February outing but does not give a year.",
      "The club's Moss Valley Madness page records its local 10K event history, with editions listed from 2012 to 2019. It explains that the planned September 2021 race could not go ahead after a landowner withheld permission because of tree disease along the route. The page's later reference to 2022 is historical, not a current race announcement.",
      "The official homepage publishes a club enquiry email and links to its Facebook page and group. Use those routes to ask about membership and current runs: several deeper website pages were unavailable when reviewed. Neither the shopping centre's customer-service details nor the directory address in Beighton establishes a club training venue."
    ],
    sources: [{ title: "Official club introduction, enquiry email and social links", url: "https://www.crystalpeaks-runners.com/" }, { title: "Club's Moss Valley Madness history and cancellation notice", url: "https://www.crystalpeaks-runners.com/moss-valley-madness" }, { title: "Crystal Peaks centre account of the club's Foodbank Run", url: "https://crystalpeakscentre.com/news/article/crystal-peaks-runners-take-part-in-foodbank-run" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.crystalpeaks-runners.com/", socials: [{ platform: "Facebook", url: "https://www.facebook.com/pages/category/Sports/Crystal-Peaks-Running-Club-104669618875571/", source_url: "https://www.crystalpeaks-runners.com/", checked_at: "2026-10-17" }, { platform: "Facebook", url: "https://www.facebook.com/groups/385389454905339/", source_url: "https://www.crystalpeaks-runners.com/", checked_at: "2026-10-17" }] },
    location_note: "Beighton address remains directory context; no current shared training venue established.",
    contact_note: "Homepage initially readable but later returned 404; detail pages also unavailable. Published email retained with source date, not deliverability verification. Corrected directory website mislabelled as Facebook; original directory record preserved. Founding year, current sessions and notable members unconfirmed."
  }
};
