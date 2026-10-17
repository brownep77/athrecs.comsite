import type { ClubProfile } from "./club-profiles.ts";

// Primary club and governing-body pages opened on 16 October 2026 UTC.
export const recoveredCommunityAndAthleticsProfiles: Record<string, ClubProfile> = {
  "bishops-stortford-rc": {
    summary: "Bishops Stortford RC brings together road and trail runners across East Hertfordshire and West Essex, with a clubhouse base and a triathlon section.",
    biography: [
      "Bishops Stortford Running Club was founded in 1983 in Bishop's Stortford, Hertfordshire, England. It serves runners across East Hertfordshire and West Essex, offering company and coaching for people with different levels of experience, from shorter road races to marathons and ultra-distance challenges.",
      "The clubhouse is at Hockerill Sports and Social Club on Beldams Lane. Nearby countryside, including Hatfield Forest, gives members opportunities to run away from the roads. The club's programme also includes junior running and beginner information, while its Stortford Tri section brings swimming and cycling into the mix alongside triathlon and duathlon.",
      "Club life extends beyond weekly training through cross-country, road events and activities such as the Stortford 10 and 5 and Reg Tansley relay. Prospective runners should use the official website to find the appropriate joining route. Detailed joining and contact pages were unavailable during this review, so current intake arrangements and session times should be confirmed before attending."
    ],
    founded_year: 1983,
    sources: [{ title: "Club history, activities and clubhouse", url: "https://www.bsrc.org.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.bsrc.org.uk/", address_kind: "clubhouse", sports: ["Running", "Triathlon", "Duathlon", "Swimming", "Cycling"] },
    contact_note: "Detailed joining, history and contact pages timed out; existing sourced social links are preserved, not marked freshly checked."
  },
  "braintree-and-district-ac": {
    summary: "Braintree & District AC offers track and field, road, trail and cross-country running, with junior induction and separate adult joining contacts.",
    biography: [
      "Braintree and District Athletic Club is based at Braintree Athletics Track in Essex, England. Its membership includes juniors, senior athletes, masters competitors and people training for fitness. Track and field sits alongside road, trail and cross-country running, giving members several ways to take part through the year.",
      "Tuesday and Thursday are the principal training evenings, with winter conditioning also described in the club programme. The track is at Braintree Leisure Centre on Panfield Lane. Volunteers support the activities, and prospective helpers can find information through the official website rather than assuming that involvement has to mean competing.",
      "Joining arrangements differ by age and discipline. Under-eighteens need a pre-booked induction, and summer demand can produce a waiting list. The membership page describes a free first training session followed by a trial period with session charges. Adults are directed to separate track-and-field and road-running contacts; families should use the junior contact to check availability before travelling."
    ],
    sources: [{ title: "Club programme and track", url: "https://braintreeanddistrictac.co.uk/" }, { title: "Induction and membership contacts", url: "https://braintreeanddistrictac.co.uk/membership/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://braintreeanddistrictac.co.uk/", address: "Braintree Leisure Centre, Panfield Lane, Braintree", address_kind: "training", sports: ["Athletics", "Running"] },
    contact_note: "The about/contact route displayed a verification challenge; no foundation date or alumni were inferred."
  },
  "bubble-works-run-community": {
    summary: "Bubble Works Run Community combines free, sociable running with gatherings at the Beer Shop in Hitchin and Bishop's Stortford.",
    biography: [
      "Bubble Works Run Community is a social running community in Hitchin and Bishop's Stortford, Hertfordshire, England. Its official website puts meeting people alongside the running itself, with the Beer Shop providing a gathering point in both towns. It welcomes different running abilities rather than presenting itself solely as a performance squad.",
      "The community describes its running as free and places a strong emphasis on spending time together afterwards. That makes the social setting an important part of its identity, although it does not establish a fixed training timetable or a particular coaching programme. The Hitchin address in the directory represents one base, not every advertised gathering.",
      "Newcomers are directed to the community's Heylo link from its homepage for the next step. Check the relevant town, meeting point and run details before joining an outing. The sources reviewed did not establish a foundation year, a public enquiry email or named notable members, so those details have not been invented."
    ],
    sources: [{ title: "Community, locations and joining route", url: "https://www.bubbleworksrunco.co.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Hitchin and Bishop's Stortford", address_kind: "training" },
    location_note: "The listed Beer Shop address is the Hitchin base; the community also runs in Bishop's Stortford."
  },
  "be-fit-today-track-academy": {
    summary: "Be Fit Today Track Academy develops young and adult athletes at Jim Peters Stadium in Dagenham, with additional activity at Lee Valley.",
    biography: [
      "Be Fit Today Track Academy is an athletics organisation founded by TJ Ossai, with its main training base at Jim Peters Stadium in Dagenham, Greater London, England. Its approach combines running, jumping and throwing with confidence and personal development, introducing children and adults to structured athletics.",
      "The academy also identifies Lee Valley in Edmonton as a satellite training location. At Jim Peters Stadium, the published programme separates groups across several days of the week. This is a training venue on Lodge Avenue, not the Great Portland Street address previously supplied by the directory.",
      "Prospective athletes should contact the academy to identify the right group and confirm places, fees and booking arrangements. Its site states that club membership is required for the Jim Peters programme, with session charges treated separately. The pages give differing youngest age bands and retain older fee information, so families should confirm eligibility and current costs rather than relying on a single headline age or historic price."
    ],
    notable_members: [{ name: "TJ Ossai", connection: "Founder", detail: "The academy identifies him as its founder; this editorial connection does not assert current competition membership or an athlete identity." }],
    sources: [{ title: "Academy and founder", url: "https://befittodaytrackacademy.co.uk/" }, { title: "Jim Peters training site", url: "https://befittodaytrackacademy.co.uk/club/jim-peters-training-sites/" }, { title: "Public enquiries", url: "https://befittodaytrackacademy.co.uk/about-us/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://befittodaytrackacademy.co.uk/", city: "Dagenham", address: "Jim Peters Stadium, Lodge Avenue, Dagenham", postcode: "RM8 2JR", address_kind: "training" },
    location_note: "Jim Peters Stadium is the main training base; Lee Valley is a separate satellite venue.",
    contact_note: "Youngest age bands differ between pages and older fees remain visible. Confirm the current group and charges; the masked email was not guessed."
  },
  "best-athletics": {
    summary: "Best Athletics links a global running community with group training in London's Battersea Park and optional individual coaching.",
    biography: [
      "Best Athletics began with Nick Bester in March 2020 and became affiliated to England Athletics in April 2021. Based around running in London, England, it explicitly welcomes an international community as well as local members. Its history records adidas support from 2024 as a later milestone, not the date the club began.",
      "Battersea Park is a focal point for London training, including track Tuesdays and tempo Thursdays. Members also connect through races, parkrun outings, social events and training camps. The club distinguishes membership from individual coaching, allowing runners to join the community without purchasing a personal coaching arrangement.",
      "The joining page directs applicants to register for the club app, which provides access to group activity and member communications. Training plans and other coaching options are presented separately. International membership has its own arrangements. Prospective runners should check the current app schedule and applicable fees, as the public pages retain older pricing notes and show differing session times."
    ],
    founded_year: 2020,
    scope: "global",
    notable_members: [{ name: "Nick Bester", connection: "Founder and coach", detail: "The club's own account identifies him as its founder in March 2020; England Athletics affiliation followed in April 2021." }],
    sources: [{ title: "Origins, global community and London training", url: "https://www.bestathletics.co.uk/" }, { title: "Membership, app and coaching options", url: "https://www.bestathletics.co.uk/join-the-club" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "London", address_kind: "training" },
    location_note: "Battersea Park is a London training base within an explicitly international community, not a single base for all members.",
    contact_note: "Public pages mix current offers with dated fee notes and differing session times; confirm details in the club app."
  },
  "blc-on-the-run": {
    summary: "BLC on the Run grew from a July 2021 session at Brantham Leisure Centre into a Suffolk club with coached running and local charity activity.",
    biography: [
      "BLC on the Run held its first session on 1 July 2021 at Brantham Leisure Centre in Cattawade, Suffolk, England. England Athletics affiliation followed on 1 January 2023, with Suffolk county affiliation in January 2024. The club welcomes a range of running abilities and describes participation from age twelve upwards.",
      "Its principal Wednesday session uses the leisure centre's floodlit pitch, with nearby streets available when conditions prevent that. Sunday outings explore north-east Essex and south-east Suffolk, with shorter and longer options and changing starting points. A Monday shake-out adds another opportunity to run together. Sessions are booked through RunTogether.",
      "Members help marshal the Brantham five-mile race and junior fun run, while fundraising has included the 2024 Miles for Marsland challenge and the 2025 Neuro 24 event. New runners can use the public enquiry form to ask about suitable sessions. Confirm the day's meeting point and booking details rather than treating the leisure centre as the start of every outing."
    ],
    founded_year: 2021,
    sources: [{ title: "Origins and affiliation", url: "https://www.blcontherun.org.uk/home/about-us/" }, { title: "Session arrangements", url: "https://www.blcontherun.org.uk/home/sessions/" }, { title: "Community and charity work", url: "https://www.blcontherun.org.uk/community-and-charity-work/" }, { title: "Venue", url: "https://www.blcontherun.org.uk/" }, { title: "Enquiry form", url: "https://www.blcontherun.org.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.blcontherun.org.uk/", city: "Cattawade", address: "Brantham Leisure Centre, New Village, Cattawade", address_kind: "training" },
    location_note: "Brantham Leisure Centre is the main Wednesday base; Sunday starting points vary."
  },
  "centurion-rc": {
    summary: "Centurion RC combines road and cross-country running with track access in North Solihull and a history of accessible community racing.",
    biography: [
      "Centurion Running Club traces its origins to John Walker in the 1970s in the Solihull area of England. Its historical account describes a people's marathon in March 1980, reflecting an interest in making organised running accessible to a wider community. The source does not establish a precise foundation year.",
      "The club meets at North Solihull Sports Centre on Conway Road for Tuesday and Thursday running, with track access alongside road sessions. Its programme includes winter cross-country and summer road competition. Members also support the public Grand Prix series and the club's Yacht Race series, adding regular racing to the social training calendar.",
      "Newcomers are encouraged to make contact and consider a first Tuesday visit. The usual group-running guidance assumes the ability to manage roughly four miles at an easy pace, while other beginner arrangements are described separately. The club also discusses support for blind and disabled runners. Ask which session and assistance are appropriate before attending; the public email and enquiry form provide a route into that conversation."
    ],
    notable_members: [{ name: "John Walker", connection: "Historical founder", detail: "The club history attributes its beginnings in the 1970s to John Walker; neither an exact founding year nor current membership is asserted." }],
    sources: [{ title: "Club history", url: "https://centurionrc.org.uk/about" }, { title: "Training, inclusion and events", url: "https://centurionrc.org.uk/" }, { title: "Club enquiries", url: "https://centurionrc.org.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://centurionrc.org.uk/", address_kind: "training" }
  },
  "army-athletics-association": {
    summary: "Army Athletics Association supports military participation in track and field, road, cross-country and trail running, with administration in Aldershot.",
    biography: [
      "Army Athletics Association supports individual and unit participation in athletics across the British Army. Its administration is based in Aldershot, Hampshire, England, while its remit is wider than a single local club. The published programme covers track and field, road running, cross-country and trail running, with opportunities across age groups and levels of experience.",
      "Competition progresses through unit, corps and inter-service activity, supported by coaching and training opportunities. A dated example is the Inter-Corps and Individual Athletics Championships held at Aldershot's Military Stadium on 17 June 2026, which also provided a route towards the subsequent inter-service meeting. This is an event venue, not evidence of an unrestricted weekly public session.",
      "Prospective participants should use the athletics office's published contacts to confirm eligibility and the relevant military pathway. Some supporting information is restricted to Defence Connect. The association should therefore not be treated as a general public drop-in running club, and its shared Army Sport correspondence address should not be mistaken for a training meeting point."
    ],
    scope: "national",
    sources: [{ title: "Association remit and athletics office", url: "https://athletics.britisharmysport.com/" }, { title: "Inter-Corps championships, 17 June 2026", url: "https://athletics.britisharmysport.com/inter-corps-individual-athletics-champs-17-june-2026/" }],
    reviewed_at: "2026-10-16",
    corrections: { address: "Mackenzie Building, Fox Lines, Aldershot", postcode: "GU11 2LB", address_kind: "correspondence" },
    location_note: "The shared Army Sport address is administrative. The Military Stadium is a competition venue; access and participation require confirmation.",
    contact_note: "Use athletics-specific office contacts. Existing social links belong to the wider Army Sport organisation, not a separate athletics-only account."
  },
  "athletics-ireland-ashford-a-c": {
    summary: "Ashford A.C. is a senior athletics club in County Wicklow, with a local road-racing history and an Athletics Ireland membership route.",
    biography: [
      "Ashford Athletic Club is based in Ashford, County Wicklow, Ireland. Athletics Ireland lists it as a senior-only club and identifies the Church of the Most Holy Rosary in Ballinahinch as its training location. This is the Wicklow club, distinct from similarly named athletics clubs elsewhere.",
      "In his 2025 Athletics Ireland congress nomination biography, Anthony Kelly describes forming Ashford A.C. after moving from Kilcoole. That first-person account supports a founding association but does not give a foundation year. A separate report by neighbouring Bray Runners thanks Ashford for hosting the Wicklow Road Race Championships, documenting a contribution to county competition beyond its own members' participation.",
      "The governing body's club page provides joining and renewal routes. It does not publish a detailed weekly programme or a club-specific enquiry email, so prospective members should confirm current training arrangements through the club's membership route. The historical sources establish local involvement, not a promise that a particular race or session is currently taking place."
    ],
    notable_members: [{ name: "Anthony Kelly", connection: "Founding association", detail: "His 2025 Athletics Ireland congress biography says he formed Ashford A.C. after moving from Kilcoole; no foundation year or present membership is inferred." }],
    sources: [{ title: "Official senior club and membership listing", url: "https://membership.athleticsireland.ie/clubpage/Ashford_A.C." }, { title: "2025 congress nominees, Anthony Kelly biography", url: "https://www.athleticsireland.ie/wp-content/uploads/2025/01/Board-Committee-Nominees-Congress-2025-v2.3.pdf" }, { title: "Neighbouring club's account of Ashford hosting county road championships", url: "https://www.brayrunners.com/336-great-performances-at-wicklow-road-race-c-ships" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Ashford", adult_only: true },
    contact_note: "A current session timetable and club-specific enquiry address remain unconfirmed; Athletics Ireland's platform-support email is not a club contact."
  },
  "bournemouth-joggers": {
    summary: "Bournemouth Joggers is a women's running club with sociable road and trail outings, track sessions and pre-arranged introductory visits.",
    biography: [
      "Bournemouth Joggers is a women's running club in Bournemouth, Dorset, England. It brings together recreational joggers and runners who enjoy racing locally or further afield, with UK Athletics and Dorset Road League affiliations. Social events complement the running, helping members get to know one another away from training.",
      "Monday and Thursday evenings form the main club programme, with Friday morning sessions and informal Sunday outings also described. Runs can include hills, intervals, pacing and relaxed conversation, alongside monthly track sessions. Meeting places vary across Bournemouth, including Boscombe beach, Strouden Park, Southbourne, Iford, Redhill and Kings Park track; summer outings may explore other trails.",
      "The club recommends being comfortable running about three miles, while some track and improver sessions can be adapted. New runners should arrange a free introductory visit through the membership email or contact form so the run leader knows to expect them. Weekly communications carry booking details and meeting points; the directory's former street address is not established as a training base."
    ],
    sources: [{ title: "Club ethos and affiliations", url: "https://www.bournemouthjoggers.co.uk/about" }, { title: "Joining and introductory sessions", url: "https://www.bournemouthjoggers.co.uk/join-us" }, { title: "Training and changing venues", url: "https://www.bournemouthjoggers.co.uk/training" }, { title: "Public enquiries", url: "https://www.bournemouthjoggers.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.bournemouthjoggers.co.uk/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Sessions use several Bournemouth locations. Confirm the booked session's meeting point rather than a correspondence address."
  },
  "borrowdale-fell-runners": {
    summary: "Borrowdale Fell Runners is a Lake District fell-running club associated with the Borrowdale, Glaramara, Langstrath and Steel Fell races.",
    biography: [
      "Borrowdale Fell Runners is rooted in the fell-running community around Borrowdale and Keswick in Cumbria, England. Its website emphasises shared enjoyment of the fells and welcomes enquiries from experienced competitors and newcomers. The club's public pages include the Borrowdale, Glaramara, Langstrath and Steel Fell races.",
      "The Borrowdale Fell Race starts and finishes in Rosthwaite and takes in major Lakeland landmarks including Scafell Pike and Great Gable. Its published route is approximately seventeen miles with substantial climbing, illustrating the demanding mountain environment associated with the club. Rosthwaite is an event location, not a confirmed weekly club training base.",
      "Joining enquiries are directed to Mike Hind through the club website. Membership interest should be distinguished from eligibility for the long Borrowdale race: the race page requires relevant prior fell-racing experience and mandatory equipment. Newcomers should discuss suitable activities before entering. A foundation date, regular training timetable and current notable-member list were not established by the pages reviewed."
    ],
    sources: [{ title: "Club and membership enquiries", url: "https://www.borrowdale-fellrunners.org/" }, { title: "Borrowdale race, location and eligibility", url: "https://www.borrowdale-fellrunners.org/races/borrowdale-fell-race/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.borrowdale-fellrunners.org/", city: "Borrowdale", county: "Cumbria", location_precision: "area-only" },
    location_note: "The profile indicates the Borrowdale area. Race starts in Rosthwaite are not presented as a regular training address."
  }
};
