import type { ClubProfile } from "./club-profiles.ts";

// Official club pages opened and read on 16 October 2026 UTC.
export const recoveredTrainingAndHeritageProfiles: Record<string, ClubProfile> = {
  "dewsbury-road-runners": {
    summary: "Dewsbury Road Runners brings together social and competitive runners in West Yorkshire, with road, trail and fell running and two regular meeting venues.",
    biography: [
      "Dewsbury Road Runners was formed in the early 1980s in Dewsbury, West Yorkshire, England. The club welcomes different abilities and ambitions, from sociable weekly outings to racing on roads, trails and fells. Its members also take part in cross-country and team relays, with some pursuing longer-distance challenges.",
      "Following the closure of Dewsbury Sports Centre, the club's December 2025 update identifies Dewsbury Moor Sports Club on Heckmondwike Road as its principal home. Tuesday groups assemble there, while Thursday runs start from the Leggers Inn on Mill Street East. Different routes and distances help runners find suitable company.",
      "The seasons shape the programme: summer brings more off-road running, while winter combines lit streets with headtorch trail outings. Newcomers are welcome at training, and the club also holds social gatherings. Check the current calendar before attending, as occasional competition nights and social runs use different venues; the Tuesday and Thursday meeting points are not interchangeable."
    ],
    sources: [{ title: "Club origins and updated meeting venues", url: "https://www.dewsburyroadrunners.co.uk/cgi/aboutus.php" }, { title: "Public club contact", url: "https://www.dewsburyroadrunners.co.uk/cgi/contactus.php" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "The listed Dewsbury Moor Sports Club address is the Tuesday base; Thursday runs meet at the Leggers Inn, 66 Mill Street East, Dewsbury WF12 9BD. Check the calendar for exceptions.",
    contact_note: "The club gives an early-1980s origin, not an exact foundation year. Its website-enquiries telephone is excluded from club joining contacts; the secretary's masked email was not guessed."
  },
  "eynsford-running-club": {
    summary: "Eynsford Running Club combines sociable running in Kent with the Lullingstone 10K, beginner support and local racing.",
    biography: [
      "Eynsford Running Club began in 2011 when Giles Wolfe and fellow amateur actors started running to get fit for a show in Eynsford, Kent, England. The small group became a formal club in 2016, retaining the habit of ending its runs with conversation at the Five Bells pub.",
      "The club welcomes runners with different goals, from run-walk outings and a first 5K to marathons and improving race times. Its published programme centres on Wednesday evenings and Sunday mornings from the Five Bells, supported by qualified run leaders and coaches. Prospective members can try the club for two weeks before deciding whether to join.",
      "Members contribute to local running through racing and volunteering. The club launched the Lullingstone 10K in 2019 and introduced an internal Grand Prix in 2022 to encourage participation at local events. Use the membership enquiry form to arrange a first visit and check the current run details; the village meeting point is separate from the former Sevenoaks-area directory address."
    ],
    founded_year: 2011,
    notable_members: [{ name: "Giles Wolfe", connection: "Founder", detail: "The club's history identifies Wolfe as the initiator of the 2011 running group, which became a formal club in 2016." }],
    sources: [{ title: "Club history", url: "https://eynsfordrunningclub.com/history-page/" }, { title: "Runs and trial membership", url: "https://eynsfordrunningclub.com/" }, { title: "Role contacts and enquiry form", url: "https://eynsfordrunningclub.com/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Eynsford", address: "Five Bells pub, Eynsford", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Runs meet at the Five Bells in Eynsford; the old Otford/Sevenoaks directory address is not presented as a training venue."
  },
  "lymm-runners": {
    summary: "Lymm Runners offers adult road, trail and cross-country running, seasonal track training and community events in and around Lymm.",
    biography: [
      "Lymm Runners was founded in February 2010 to bring people together for running, fitness and competition around Lymm, Cheshire, England. Run by volunteers and affiliated with England Athletics, it welcomes adults aged eighteen and over, including beginners and experienced racers, with no upper age limit.",
      "The weekly programme spans several days and includes group runs, coached track work and power walking. The membership guide identifies Lymm High School for summer track sessions and Victoria Park in Warrington for winter training. Members can also take part in cross-country leagues, strength and conditioning, and the club championship.",
      "Its events range from the High Legh 10K and Lymm Festival Trail Races to the Warrington Way forty-mile trail ultra and Dickensian Santa Dash. Volunteering at the Manchester Marathon and pacing at Warrington parkrun are further parts of club life. Newcomers may try a couple of sessions before joining; contact the membership secretary about the right group, current venues or difficulty meeting membership costs."
    ],
    founded_year: 2010,
    sources: [{ title: "Origins, activities and community involvement", url: "https://lymmrunners.org.uk/about-us/" }, { title: "Membership and seasonal training bases", url: "https://lymmrunners.org.uk/membership-2026-2027/" }, { title: "General enquiry form", url: "https://lymmrunners.org.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://lymmrunners.org.uk/", address_kind: "training" },
    location_note: "Lymm High School is a summer track and conditioning venue; winter track training is at Victoria Park, Warrington. Other sessions have separate meeting points.",
    contact_note: "The 2026–27 membership page gives conflicting combined subscription totals. Confirm the payable amount with membership enquiries; no fee is reproduced here."
  },
  "dengie-100-runners": {
    summary: "Dengie 100 Runners is a mixed-ability running group in Burnham-on-Crouch, formed in 2009 around fitness, event preparation and running together.",
    biography: [
      "Dengie 100 Runners was established in 2009 by people who wanted company while improving their fitness or preparing for an event. Based in Burnham-on-Crouch, Essex, England, the group describes a mixed-ability membership with a shared interest in improvement and enjoying running together.",
      "Its public club page identifies Dengie 100 Sports Centre as a meeting point and advertises Wednesday evening and Sunday morning running. Sunday locations can vary, so prospective runners should contact the club before setting out rather than treating the sports centre as the start of every outing.",
      "The club's Strava page provides a public telephone enquiry route and an online point of contact with the group. Confirm the current session arrangements and joining process there. The available account establishes its origins and social running purpose, but does not establish a coaching qualification, a detailed race programme or named notable members."
    ],
    founded_year: 2009,
    sources: [{ title: "Club-run public description and enquiries", url: "https://www.strava.com/clubs/dengie-100-runners-149067" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.strava.com/clubs/dengie-100-runners-149067", city: "Burnham-on-Crouch", address: "Dengie 100 Sports Centre, Burnham-on-Crouch", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The club's public page identifies the sports centre in Burnham-on-Crouch, with variable Sunday starts; the old Southminster label and unconfirmed postcode are not used.",
    contact_note: "The malformed directory website has been replaced by the club's readable public Strava page. Confirm the timetable with the published club contact."
  },
  "lytham-st-annes-rr-club": {
    summary: "Lytham St Annes Road Runners combines road racing with cross-country, fell running and athletics, with senior and junior training on the Fylde coast.",
    biography: [
      "Lytham St Annes Road Runners Club was established in 1998 in Lytham St Annes, Lancashire, England. Although road running is part of its name, members also take part in cross-country, fell running and athletics. The club offers both competitive and social activities and has a separate junior section.",
      "Its published welcome points prospective runners towards Tuesday evening sessions at Lytham YMCA on Mythop Road and an early Thursday gathering at Granny's Bay, Fairhaven. Juniors train on Tuesdays and Thursdays. Check the current arrangements with the club before attending, particularly when choosing between senior and junior activities.",
      "The club organises the Green Drive Five road race and the St Annes Carnival races. In 2024 it received a Highly Commended recognition in the Fylde Active Community Awards, while long-serving junior coach Terry Hellings received a Lifetime Achievement Award. Those community connections sit alongside a programme that includes local competition and opportunities to develop as a runner."
    ],
    founded_year: 1998,
    notable_members: [{ name: "Terry Hellings", connection: "Long-serving junior coach", detail: "The club records his Lifetime Achievement Award at the 2024 Fylde Active Community Awards for his contribution to junior coaching." }],
    sources: [{ title: "Club origins, training, races and community recognition", url: "https://www.lythamrunners.org.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.lythamrunners.org.uk/", address_kind: "training" },
    location_note: "The YMCA is a training venue; the club also advertises a Thursday morning meeting at Granny's Bay, Fairhaven.",
    contact_note: "History, joining and committee pages returned verification screens. No public email or telephone was inferred. Social destinations were verified as links published by the club, not as independently accessible account content."
  },
  "sandhurst-joggers": {
    summary: "Sandhurst Joggers supports runners around Sandhurst, Crowthorne and Yateley, with multi-pace groups, run-walk sessions and a Pure Beginners course.",
    biography: [
      "Sandhurst Joggers is a community running club serving Sandhurst, Crowthorne and Yateley in England. Its programme welcomes people seeking fitness and company as well as regular racers. Returning runners can try a club outing before committing to membership, while complete beginners have a separate route into the club.",
      "The Tuesday multi-pace session meets at Sandhurst Memorial Park and includes a run-walk option alongside groups for different running speeds. The published arrangements move the first Tuesday run of the summer months to Morgan Recreation Ground in Crowthorne, so checking the latest notice matters. Other club activities include road intervals, track running and off-road outings.",
      "Pure Beginners works towards completing a 5K and then moving into regular Tuesday groups. Places are limited and prospective participants should register their interest rather than assume a course is currently starting. General enquiries and the beginners team have separate public email addresses. Membership is managed online, with England Athletics registration available as an additional option."
    ],
    sources: [{ title: "Club and local community", url: "https://www.sandhurstjoggers.org.uk/" }, { title: "Joining routes", url: "https://www.sandhurstjoggers.org.uk/join-us/" }, { title: "Tuesday meeting points", url: "https://www.sandhurstjoggers.org.uk/tuesday-multi-pace/" }, { title: "Pure Beginners", url: "https://www.sandhurstjoggers.org.uk/pure-beginners/" }, { title: "Public enquiries and socials", url: "https://www.sandhurstjoggers.org.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.sandhurstjoggers.org.uk/", address: "Sandhurst Memorial Park, Sandhurst", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The Tuesday training venue replaces an unconfirmed directory address. Sessions also use other locations, including Morgan Recreation Ground for the first Tuesday of summer months.",
    contact_note: "The beginners page describes both nine and ten weeks, without a confirmed next intake; no course duration or start is promised. Tuesday contact aliases differ between pages, so general and beginners role inboxes are preferred."
  },
  "victoria-park-harriers-and-tower-hamlets-ac": {
    summary: "Victoria Park Harriers and Tower Hamlets AC offers road, cross-country and track athletics in east London, with a clubhouse and separate specialist training groups.",
    biography: [
      "Victoria Park Harriers and Tower Hamlets Athletic Club is based in east London, England, with opportunities for road runners, cross-country competitors and track-and-field athletes. Its membership ranges from beginners to high-level competitors, alongside volunteers involved in coaching, officiating and timekeeping.",
      "St Augustine's Hall on Cadogan Terrace is the clubhouse, used for group runs, conditioning and social activity. General interval sessions take place at the London Marathon Community Track, while specialist track-and-field groups use Mile End Stadium. The performance endurance group at Mile End has its own entry expectations and should not be confused with the all-ability community-track sessions.",
      "Prospective members can try the club for two weeks. The joining page explicitly requires an application before attending a trial, and specialist athletes and families should contact the coaches to arrange a suitable group. Check the calendar for race-night changes to ordinary training. The current senior programme states that throws coaching is unavailable, despite the club's broader athletics remit."
    ],
    sources: [{ title: "Club and volunteering", url: "https://vphthac.org.uk/about/" }, { title: "Trial registration and specialist enquiries", url: "https://vphthac.org.uk/join-us/" }, { title: "Training venues, groups and current limitations", url: "https://vphthac.org.uk/seniors/training/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "London", address: "St Augustine's Hall, Cadogan Terrace, London", postcode: "E9 5EG", address_kind: "clubhouse" },
    location_note: "The clubhouse is distinct from the London Marathon Community Track and Mile End Stadium training venues.",
    contact_note: "Follow the joining page's explicit pre-trial application requirement, despite older turn-up wording elsewhere. Specialist session times and coach email domains differ across pages; current joining-page role contacts are used. No foundation date was inferred from a centenary headline."
  },
  "totley-ac": {
    summary: "Totley AC brings together fell, trail and road runners in Sheffield, with Peak District outings, training groups and a pavilion base in Totley.",
    biography: [
      "Totley Athletic Club is a running club in Sheffield, South Yorkshire, England, with strong connections to the nearby Peak District. Its activities span fell and road running, welcoming social runners as well as competitors. Different groups make room for a range of experience and pace rather than a single performance standard.",
      "The Totley pavilion on Lane Head Road is one base for club activity, including conditioning sessions. Runs also leave from other Sheffield and Peak District locations, with track intervals at Woodbourn Road and off-road outings that change meeting point. In darker months, the programme includes headtorch runs; members should check the calendar and the relevant kit guidance.",
      "Newcomers may try a session free before joining through the online membership system. The club also describes a free Millhouses beginners group that does not require club membership. This is separate from the beginner off-road group marked as not currently running. Contact training enquiries to choose an appropriate session, and membership enquiries for current joining costs."
    ],
    sources: [{ title: "Club identity and current calendar", url: "https://www.totleyac.org.uk/" }, { title: "Training groups and equipment", url: "https://www.totleyac.org.uk/training/" }, { title: "Trial and membership enquiries", url: "https://www.totleyac.org.uk/join-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "clubhouse" },
    location_note: "The pavilion is one club base, not the start of every session; consult the current calendar for road, track and Peak District runs.",
    contact_note: "The joining page still labels its fee table 2025–26. Calendar and generic training text differ on some times and pavilion postcodes; confirm the specific session. The beginner off-road group is marked inactive, unlike the separate Millhouses group."
  },
  "thames-hare-and-hounds": {
    summary: "Thames Hare and Hounds has run on Wimbledon Common since 1868, combining cross-country and road competition with club traditions and social running.",
    biography: [
      "Thames Hare and Hounds was formed in 1868 by members of Thames Rowing Club seeking winter exercise around Putney and Wimbledon Common in London, England. Its history records Walter Rye as the first president and Percy Stenning among its early champions. Women were admitted as members in 1981, an important change from the club's originally male membership.",
      "Today the club combines cross-country and road racing with training around Wimbledon Common and Battersea Park. The Wimbledon clubhouse provides changing facilities and a place to gather after runs. The monthly Second Sunday 5, handicaps and traditional matches sit alongside league and championship competition, with social events forming another part of the programme.",
      "Runners can try a weekly outing or the monthly race before applying through the club's new-joiner form. Contact a captain to discuss a suitable group and confirm meeting arrangements. The club explicitly distinguishes its road and cross-country affiliation from track-and-field and fell racing, so those disciplines should not be inferred simply from members' wider interests."
    ],
    founded_year: 1868,
    notable_members: [{ name: "Walter Rye", connection: "First president", detail: "The club's historical account identifies Rye as its first president; this is a nineteenth-century association." }, { name: "Percy Stenning", connection: "Early club champion", detail: "The club history records his individual victory in the 1877 championship at Roehampton and four consecutive wins; this is a historical association." }],
    sources: [{ title: "Origins and historical development", url: "https://www.thameshareandhounds.org.uk/history/" }, { title: "Joining, activities and affiliation", url: "https://www.thameshareandhounds.org.uk/joining-thames/" }, { title: "Wimbledon Common clubhouse programme", url: "https://www.thameshareandhounds.org.uk/where-and-when/wimbledon-common-clubhouse/" }, { title: "Public club roles", url: "https://www.thameshareandhounds.org.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.thameshareandhounds.org.uk/", address_kind: "clubhouse" },
    contact_note: "The joining FAQ retains an older England Athletics fee and differs from the venue page on Wednesday start details; current fees and times should be confirmed. Website-administration contacts are not joining contacts."
  },
  "highworth-rc": {
    summary: "Highworth Running Club offers social running, cross-country and track sessions around Highworth and Swindon, and organises the Highworth 5 Mile race.",
    biography: [
      "Highworth Running Club is based in Highworth near Swindon, England. It brings together runners who enjoy a conversational outing and those preparing for races from 5K to the marathon. Social groups are divided by speed and distance, allowing members to choose company that suits their running.",
      "The published programme changes with the seasons. Winter Wednesday runs meet at the old library car park at the top of Eastrop, while summer evenings take the club into the countryside from local pubs. Saturday trail runs use different nearby locations, and Monday track sessions take place behind the County Ground in Swindon.",
      "Members also enter local cross-country competition, and the club organises the Highworth 5 Mile from Warneford School around the Fresden loop. Prospective members can sample a run before applying. Use the club calendar and enquiry email to confirm a meeting point and current fees: some joining and track information retains older prices and date ranges, so it should not be treated as a current booking notice."
    ],
    sources: [{ title: "Club introduction and enquiries", url: "https://highworthrunningclub.co.uk/" }, { title: "Sessions and club race", url: "https://highworthrunningclub.co.uk/information/" }, { title: "Joining process", url: "https://highworthrunningclub.co.uk/how-to-join/" }, { title: "Track session guidance", url: "https://highworthrunningclub.co.uk/monday-night-is-track-night/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://highworthrunningclub.co.uk/", city: "Highworth", county: "", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Highworth and nearby Swindon are the documented activity area. Seasonal and session-specific meeting points replace the unconfirmed directory street address and Oxfordshire label.",
    contact_note: "The joining page has older affiliation fees and the track page has undated seasonal ranges. Confirm current fees, dates and junior arrangements with the club; no founding year was established."
  }
};
