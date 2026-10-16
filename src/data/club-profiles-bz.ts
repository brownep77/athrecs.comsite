import type { ClubProfile } from "./club-profiles";

// Batch 78: recovered local club sources; historical associations are editorial only.
export const localRunningAndWalkingProfiles: Record<string, ClubProfile> = {
  "lutterworth-harriers-running-club": {
    summary: "Lutterworth Harriers offers adult running groups, interval work and circuit training from the Recreation Ground in Lutterworth, Leicestershire.",
    biography: [
      "Lutterworth Harriers Running Club welcomes adults aged 18 and over in Lutterworth, Leicestershire, England. The England Athletics-affiliated club separates runners into ability groups led by qualified run leaders, so newcomers and more experienced runners can find suitable company.",
      "The Recreation Ground on Coventry Road is the published meeting place. Monday sessions develop fitness through work such as hills, intervals and pacing; Wednesday brings circuit training in the pavilion. Thursday is a steadier outing, with shorter options around 3–5K and longer routes extending beyond 8–10K. Members can choose sessions rather than commit to every evening.",
      "Prospective members can ask questions through the club's contact form before completing its registration questionnaire. Approved members receive an invitation to Spond, used for club communications and session attendance. The club also describes Couch to 5K courses, but newcomers should check the next intake and current charges. Its FAQ and sessions page give different Thursday start times, so confirm the booking details before travelling."
    ],
    sources: [{ title: "Club and adult membership", url: "https://www.lutterworthharriers.co.uk/" }, { title: "Weekly sessions", url: "https://www.lutterworthharriers.co.uk/sessions/" }, { title: "Venue and beginner information", url: "https://www.lutterworthharriers.co.uk/faq/" }, { title: "Registration and Spond", url: "https://www.lutterworthharriers.co.uk/registration/" }, { title: "Enquiry form", url: "https://www.lutterworthharriers.co.uk/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { address: "The Pavilion, Recreation Ground, Coventry Road, Lutterworth", address_kind: "training" },
    contact_note: "No founding year or notable-member claim was established. FAQ fees and its Thursday 6pm start differ from the sessions page's 6.30pm; confirm current arrangements."
  },
  "eliot-ladies-at-ambleside": {
    summary: "Eliot Ladies at Ambleside is a women's running group meeting at Ambleside Sports Club in Nuneaton, with a relaxed social approach and local fundraising links.",
    biography: [
      "Eliot Ladies at Ambleside is a women's running group in Nuneaton, Warwickshire, England. Ambleside Sports Club lists it among its athletics groups under the name Eliot Ladies Running Club and describes a relaxed Monday-evening gathering at the sports club.",
      "The group's community links include fundraising for Mary Ann Evans Hospice. Ambleside links to an Eliot Ladies team appeal associated with the 2026 London Marathon, supporting the hospice's work with people and families in Nuneaton, Bedworth and North Warwickshire. The appeal is evidence of fundraising, not a record of individual race finishes.",
      "Women interested in running with the group can use the published Eliot Ladies telephone contact or its linked Facebook page to ask about joining and the current meeting time. Ambleside Way is the supported meeting venue; the older Glebe Lane directory address should not be used as a training location."
    ],
    sources: [{ title: "Host club: Eliot Ladies group, contact and venue", url: "https://www.amblesideclub.co.uk/club-sections" }, { title: "Club-linked hospice fundraising appeal", url: "https://www.justgiving.com/team/eliotladies?utm_medium=TE&utm_source=CL" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Nuneaton", website: "https://www.amblesideclub.co.uk/club-sections", address: "Ambleside Sports Club, Ambleside Way, Nuneaton", postcode: "CV11 6AT", address_kind: "training" },
    contact_note: "The host's general bar, cricket, choir and other sports contacts are excluded. No foundation date, pace requirements or exact Monday start time was established."
  },
  "allerton-junior-athletics-club": {
    summary: "Allerton Junior Athletics Club serves Northallerton with junior track-and-field and endurance opportunities, training locally, near Knayton and at Darlington's track.",
    biography: [
      "Allerton Junior Athletics Club serves young athletes in Northallerton and the surrounding North Yorkshire area of England. Glen Hilton founded the club in 2014, initially using Scruton Cricket Club's grounds after seeking a local base for junior athletics. As the group grew, its outdoor training moved to Hillside Rural Activities Park near Knayton.",
      "The club combines sprint and endurance activity with opportunities in track and field, cross-country, road races and relays. Its published training pattern includes Wednesday evenings on Northallerton roads, paths or playing fields, Sunday afternoons near Knayton, and some track sessions at Darlington. Its history records a track partnership with Darlington Harriers in the 2022 North East Youth Development League.",
      "Families should use the club's enquiry form to discuss age groups, available places and the next suitable session. Older news describes waiting lists and particular meeting points, but those reports should not be treated as a current booking confirmation. The club operates across several venues; its Northallerton identity is distinct from the Yarm address previously carried in the directory."
    ],
    founded_year: 2014,
    notable_members: [{ name: "Glen Hilton", connection: "Founder and coach", detail: "The club's October 2022 history credits him with founding Allerton Juniors in 2014 and developing its coaching programme." }],
    sources: [{ title: "Club identity and disciplines", url: "https://www.ajac.club/" }, { title: "October 2022 founding history", url: "https://www.ajac.club/news-archive-" }, { title: "Published training pattern", url: "https://www.ajac.club/training" }, { title: "Club enquiry form", url: "https://www.ajac.club/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Northallerton", county: "North Yorkshire", website: "https://www.ajac.club/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Training is spread across Northallerton, the Knayton area and Darlington. The Yarm directory street address is not a confirmed training base.",
    contact_note: "The 2022 waiting-list report is historical. No current age cut-off, fee or public club-role email was established."
  },
  "avon-tempo": {
    summary: "Avon Tempo is a Bristol running club founded in 2025, using Bitton AFC and the Bristol & Bath Railway Path for structured, sociable training.",
    biography: [
      "Avon Tempo was established in 2025 in the Bristol area of England. Co-founder Chris Palmer and the committee set out to combine the welcome of a social running group with more structured training. England Athletics documented the club's first anniversary in June 2026.",
      "Based at Bitton AFC, the club uses the Bristol & Bath Railway Path for sessions away from repeated road crossings. Its published pattern pairs Tuesday threshold and race-preparation work with Thursday technique, speed, drills and hills. Sessions are intended to accommodate differing levels of experience.",
      "Runners can use the club's enquiry email to discuss joining a session. Bitton AFC is a meeting base, not evidence of a separately owned clubhouse."
    ],
    founded_year: 2025,
    notable_members: [{ name: "Chris Palmer", connection: "Co-founder", detail: "England Athletics interviewed him as co-founder and chair for its June 2026 anniversary feature." }],
    sources: [{ title: "England Athletics anniversary interview, 2 June 2026", url: "https://www.englandathletics.org/news/avon-tempo-celebrating-their-first-anniversary/" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    contact_note: "No separate club website, telephone or unambiguous social destination was established."
  },
  "mow-cop-runners": {
    summary: "Mow Cop Runners combines road, fell, trail and cross-country running with Tuesday groups from Mow Cop Community Hall and locally hosted hill races.",
    biography: [
      "Mow Cop Runners was founded in May 2009, serving Mow Cop and neighbouring communities including Scholar Green, Kidsgrove, Biddulph and Congleton in England. Its members run on roads, trails, fells and cross-country courses, from short local outings to marathons and ultras. Track running is not normally part of the club programme.",
      "Tuesday evening groups start from Mow Cop Community Hall beside St Thomas's Church. Different distances and paces allow newer runners and experienced members to train together at a suitable level. Routes usually shift from roads in winter to off-road running in summer, and the club asks relative beginners to make contact before their first visit.",
      "The club's race-organising activity includes the Mow Cop Hill Race, the Killer Mile and the Roaches fell race. Members also take part in the North Staffs Cross Country League and fell relays. A membership form is available on the club-information page, alongside a public telephone contact for enquiries. Check current race information separately from the regular Tuesday meeting arrangements."
    ],
    founded_year: 2009,
    sources: [{ title: "Origins, disciplines and Tuesday groups", url: "https://www.mowcoprunner.com/" }, { title: "Membership and telephone enquiries", url: "https://www.mowcoprunner.com/Pages/ClubInfo" }, { title: "Club-hosted races", url: "https://www.mowcoprunner.com/Pages/OurRaces" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Mow Cop", website: "https://www.mowcoprunner.com/", address: "Mow Cop Community Hall, beside St Thomas's Church, Mow Cop", address_kind: "training" },
    contact_note: "Email headings and social icons did not expose usable destinations; none are invented. The race page mixes 2025 and 2026 editions, so no future date is inferred."
  },
  "rimrose-runners": {
    summary: "Rimrose Runners brings social running and Couch to 5K activity to Rimrose Valley, meeting at Chaffers Track in Waterloo, Merseyside.",
    biography: [
      "Rimrose Runners began in April 2018 around Rimrose Valley Country Park in Waterloo, Merseyside, England. The club grew from an idea put forward by Rimrose Valley Friends trustee Sarah Edey: the park could provide a home for a welcoming local running community.",
      "The club-managed page lists Thursday evening runs from Chaffers Track, with 5K and longer routes through the valley. It also describes Couch to 5K groups during the year, offering a route into running for people who are not yet ready for a continuous club run. Ask about the next course rather than assuming an intake is always open.",
      "In 2022, England Athletics recognised Rimrose Runners as a regional Community Project of the Year runner-up for bringing people into the park and raising awareness of its green space. Volunteer Jimi Bond also received runner-up recognition for his support of fellow runners. These are dated community achievements, not current membership or qualification claims. The club's contact form is available for joining and session enquiries."
    ],
    founded_year: 2018,
    notable_members: [{ name: "Jimi Bond", connection: "Volunteer recognised in 2022", detail: "England Athletics named the Rimrose assistant run leader as North West Newcomer to Volunteering runner-up in 2022; no later qualification is inferred." }],
    sources: [{ title: "Club-managed running and beginner programme", url: "https://clubspark.englandathletics.org/RimroseRunners" }, { title: "England Athletics regional awards, 25 November 2022", url: "https://www.englandathletics.org/news/north-west-region-volunteer-awards-announced/" }, { title: "Group contact form", url: "https://clubspark.englandathletics.org/RimroseRunners/Contact" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Waterloo", county: "Merseyside", website: "https://clubspark.englandathletics.org/RimroseRunners", address: "Chaffers Track, Rimrose Valley, Waterloo", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The home page identifies Chaffers Track as the run meeting point. The Sandheys Avenue address on the contact page is not presented as the training venue.",
    contact_note: "The standalone website returned no readable text. The club-managed programme is undated; confirm current meeting arrangements through its form."
  },
  "tweed-striders": {
    summary: "Tweed Striders offers coached running in Berwick-upon-Tweed, club socials across the border area and the town-wall Curfew Run.",
    biography: [
      "Tweed Striders is a running club for Berwick-upon-Tweed and the surrounding border area of England. It welcomes adults running for enjoyment, fitness or a race goal, while asking prospective members to be over 18 and able to cover 5K without undue difficulty.",
      "Coaches and run leaders provide structured, progressive sessions on Tuesday and Thursday evenings. Berwick Sports Centre is the usual meeting point, but some sessions start elsewhere; the club confirms locations through its Facebook page and messages to members. Informal outings and joint social runs with neighbouring clubs add to the weekly programme.",
      "Tweed Striders organises the Curfew Run around Berwick's town walls, with a separate family fun run as well as the traditional race. Interested runners can ask for a trial or membership information by email. The joining page also offers attendance on an ad-hoc basis, but its downloadable form is labelled 2025–26, so confirm the current membership year and fee before applying."
    ],
    sources: [{ title: "Club, entry level and meeting arrangements", url: "https://tweedstriders.co.uk/" }, { title: "Joining and trial options", url: "https://tweedstriders.co.uk/join/" }, { title: "Curfew Run and interclub socials", url: "https://tweedstriders.co.uk/events/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Berwick-upon-Tweed", county: "Northumberland", website: "https://tweedstriders.co.uk/", address: "Berwick Sports Centre, Berwick-upon-Tweed", postcode: "TD15 2AS", address_kind: "training", location_precision: "postcode" },
    location_note: "Berwick Sports Centre is the usual meeting point, not a guaranteed start for every session. Check weekly club notices.",
    contact_note: "The downloadable membership form still says 2025–26. No founding year or notable-member association was established."
  },
  "south-woodham-runners": {
    summary: "South Woodham Runners grew from social runs in 2014 into an affiliated Essex club, offering adaptable intervals and longer outings around South Woodham Ferrers.",
    biography: [
      "South Woodham Runners began in 2014 when a small group met socially to run together in South Woodham Ferrers, Essex, England. It developed into an England Athletics-affiliated club with trained coaches and run leaders supporting a range of abilities.",
      "Tuesday sessions focus on intervals at locations announced in advance. Runners work for the same period at their own pace, allowing different abilities to share a session without someone finishing last. The programme moves mainly onto grass in the lighter months and well-lit road locations in winter. Thursday outings offer variable distances, generally between three and nine miles, with routes adapted for shorter or longer efforts.",
      "New runners may try three sessions free before choosing a membership option. The club lists annual membership with affiliation, a category for runners affiliated elsewhere, and pay-as-you-go attendance. Use the club contact form to find a suitable session and confirm the meeting point; there is no single street address that serves every run."
    ],
    founded_year: 2014,
    sources: [{ title: "Club origins", url: "https://clubspark.englandathletics.org/SouthWoodhamRunners" }, { title: "Training approach and variable venues", url: "https://clubspark.englandathletics.org/SouthWoodhamRunners/Coaching" }, { title: "Trial and membership categories", url: "https://clubspark.englandathletics.org/SouthWoodhamRunners/ClubMembership" }, { title: "Club enquiry form", url: "https://clubspark.englandathletics.org/SouthWoodhamRunners/Contact" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "South Woodham Ferrers", county: "Essex", website: "https://clubspark.englandathletics.org/SouthWoodhamRunners", location_precision: "area-only" },
    location_note: "Coaches announce session-specific meeting points. The general site postcode is not used to invent a permanent training address.",
    contact_note: "Platform footer social accounts are not club accounts and are excluded. No public role email or telephone was established."
  },
  "netley-abbey-runners": {
    summary: "Netley Abbey Runners combines social runs, coached sessions and road and cross-country leagues around Netley Abbey and Royal Victoria Country Park in Hampshire.",
    biography: [
      "Netley Abbey Runners was founded in 2015 in Hampshire, England. Based around Netley Abbey and Royal Victoria Country Park, the club brings together runners progressing from their first 5K through to longer races, with social outings and support at local events alongside structured training.",
      "Tuesday and Wednesday evening groups meet at Abbey Hall, while a Wednesday morning social run starts from Netley Abbey station. Thursday speedwork uses changing locations. Members also gather at the independently organised Netley Abbey parkrun; that is not a club-owned session. Racing opportunities include the Hampshire Road Race League, CC6 and RR10 cross-country series, and the club's Netley 10K.",
      "Ordinary club runs ask participants to be able to cover 5K at any pace. Periodic Couch to 5K courses offer a separate starting point for beginners. Email the run coordinator to arrange a free first session, then use the membership team to join and obtain Coacha booking access. Club-only and England Athletics-affiliated options are available. Check session notices and bring the required visibility equipment for darker evenings."
    ],
    founded_year: 2015,
    sources: [{ title: "Origins and club activities", url: "https://netleyabbeyrunners.com/About/" }, { title: "Training venues and trial arrangements", url: "https://netleyabbeyrunners.com/runs-and-training/" }, { title: "Membership and entry level", url: "https://netleyabbeyrunners.com/membership" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Netley Abbey", county: "Hampshire", website: "https://netleyabbeyrunners.com/", address: "Abbey Hall, Netley Abbey", postcode: "SO31 5FA", address_kind: "training" },
    location_note: "Abbey Hall is the published evening-run meeting point, replacing an unconfirmed Spitfire Way directory address. Other sessions start at the station or changing locations."
  },
  "boro-runners": {
    summary: "Boro Runners is a Middlesbrough running community founded by Ben Palmer in 2022, combining coached pace groups, social runs and support at races.",
    biography: [
      "Boro Runners, styled Bororunners on its website, was founded by Ben Palmer in 2022 in Middlesbrough, Teesside, England. Beginning with eight runners, it developed a community-focused programme in which introductions, pace groups and encouragement matter alongside training goals.",
      "The club offers coached sessions and social running across several Teesside locations. Its October 2026 programme includes hill and fartlek work as well as a Friday run followed by coffee. England Athletics' 2025 visit described leaders supporting different groups, mental-health champions and members staying to cheer fellow runners home. The governing body's report names its 2024 regional recognition as Community Project of the Year.",
      "Prospective members must be aged 12 or over. The joining page advertises waiting lists for the weekly runs, so submit an enquiry and wait for confirmation rather than arriving unannounced. Once a place is available, the club explains registration and adds members to its session communications. The joining timetable and current weekly calendar differ, making confirmation of day and venue particularly important."
    ],
    founded_year: 2022,
    notable_members: [{ name: "Ben Palmer", connection: "Founder and coach", detail: "The club's founding account and England Athletics' May 2025 interview identify him as the founder and head coach." }],
    sources: [{ title: "Club founding account", url: "https://bororunners.co.uk/about" }, { title: "October 2026 session calendar", url: "https://bororunners.co.uk/" }, { title: "Joining, age requirement and waiting lists", url: "https://bororunners.co.uk/join" }, { title: "Enquiries", url: "https://bororunners.co.uk/contact" }, { title: "England Athletics visit and award name, 13 May 2025", url: "https://www.englandathletics.org/news/from-8-to-over-100-members-how-boro-runners-have-put-social-connection-at-the-heart-of-their-club/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://bororunners.co.uk/", adult_only: false, address: "", postcode: "", location_precision: "area-only" },
    location_note: "The current calendar uses multiple Teesside venues; Stewart Park is not asserted as the permanent training base.",
    contact_note: "Club pages variously call the award Community or Committee of the Year; the profile uses England Athletics' Community Project of the Year wording. Wednesday on the joining page differs from Tuesday in the dated calendar."
  },
  "peacehaven-run-club": {
    summary: "Peacehaven Run Club offers road, trail and clifftop running in East Sussex, with social groups, structured sessions and a separate Couch to 5K programme.",
    biography: [
      "Peacehaven Run Club was founded in 2024 in Peacehaven, East Sussex, England. Its community extends towards Saltdean, Brighton and the South Downs, combining social running with training for road races, trails and cross-country competition.",
      "Monday social groups meet at the Big Park, while other outings use the Bastion Steps or changing local routes. Thursday runs mix roads, trails and clifftops. The programme also includes more demanding interval and tempo work, alongside club events and Sussex Grand Prix participation. Runners should choose a group that matches their experience rather than assume every session has the same pace or distance.",
      "The club's ordinary membership guidance asks runners to complete 5K in under 38 minutes, with annual Couch to 5K courses providing a separate beginner route. Prospective members can try three sessions free and apply through Membermojo. Use the membership email or contact form to discuss the right group and current junior arrangements. Friday speedwork is described inconsistently as weekly and first-Friday-only, so confirm its next date."
    ],
    founded_year: 2024,
    sources: [{ title: "Origins and participation threshold", url: "https://www.peacehavenrunclub.com/copy-of-about" }, { title: "Training locations and membership email", url: "https://www.peacehavenrunclub.com/training" }, { title: "Trials and membership application", url: "https://www.peacehavenrunclub.com/joinus" }, { title: "General enquiry form", url: "https://www.peacehavenrunclub.com/contact-us" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Peacehaven", county: "East Sussex", website: "https://www.peacehavenrunclub.com/", address_kind: "training" },
    contact_note: "The club's 5K threshold is retained despite broad welcoming language. Junior age limits and the conflicting Friday frequency need confirmation. The founder is named only as Tommy on the about page; no full identity is inferred."
  },
  "lancashire-walking-club": {
    summary: "Lancashire Walking Club sustains a North West race-walking tradition through road and track events, training days and a detailed archive of the sport's history.",
    biography: [
      "Lancashire Walking Club is a race-walking club in North West England with Manchester roots. Its own historical account traces a predecessor, Lancashire Amateur Walking Club, to 1904, then records reconstitution under the present name at Fallowfield on 7 November 1907. The distinction matters: the club uses 1907 as its founding year.",
      "The Manchester-to-Blackpool Walk became a major part of its early organising history. Later generations included Ron Wallwork and Julian Hopkins. Tony Taylor's first-person account describes Wallwork's influence on club training and the newsletter, while the club remembers Hopkins as both a race walker and a national coach. These are historical associations, not claims of current membership.",
      "The club's 2026 reports describe a continuing calendar at venues including Bury, Simister, Chorley and Macclesfield. An October notice also invites newcomers to training days at Woodbank Park track in Stockport. Check the latest notice for dates and arrangements before travelling: the club serves a regional community rather than operating from the Formby street address in its directory entry."
    ],
    founded_year: 1907,
    notable_members: [{ name: "Ron Wallwork", connection: "Historical member and training organiser", detail: "Tony Taylor's 2021 personal history records Wallwork's contribution to club training, competition and its CONTACT newsletter." }, { name: "Julian Hopkins", connection: "Historical race walker and coach", detail: "The club's August 2026 tribute identifies Hopkins as one of its own race walkers and as a national coach; no current membership is claimed." }],
    sources: [{ title: "Club yearbook history: 1904 predecessor and 1907 reconstitution", url: "https://lancswalkingclub.com/2014/05/19/the-first-thirty-years-of-the-lancashire-walking-club-part-one/" }, { title: "First-person club history: Ron Wallwork", url: "https://lancswalkingclub.com/2021/07/15/on-ron-wallworks-80th-a-personal-reminiscence/" }, { title: "2026 club reports and Julian Hopkins tribute", url: "https://lancswalkingclub.com/" }, { title: "October 2026 training notice", url: "https://lancswalkingclub.com/2026/10/07/racing-in-the-sutton-macclesfield-sun-at-the-albert-rigby-event/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://lancswalkingclub.com/", city: "North West England", address: "", postcode: "", location_precision: "area-only" },
    location_note: "A regional race and training programme is documented. The Formby directory address is omitted because it is not established as a training venue.",
    contact_note: "Event-specific catering emails are not promoted as general membership contacts. No current general club-role email, telephone or membership fee was established."
  },
  "hornsea-harriers": {
    summary: "Hornsea Harriers began with a local group run in April 1986 and retains community links through its work with Hornsea Carnival in East Yorkshire.",
    biography: [
      "Hornsea Harriers grew out of a group of local runners in Hornsea, East Yorkshire, England. A first-person club retrospective hosted by its carnival partner dates the first meeting and group run to 27 April 1986, with athletics affiliation following later that spring.",
      "The founders included club runners and people who had trained alone. The Harriers name reflected ambitions beyond road running, including cross-country and other off-road events. The club chose blue and white colours.",
      "The club's community role includes organising the Hornsea Carnival fun run in the park, which the carnival describes as an event for all ages. This is separate from ordinary club membership and training. A current weekly timetable and joining contact were not established from the available primary material, so prospective members should confirm those arrangements through the existing governing-body club listing."
    ],
    founded_year: 1986,
    sources: [{ title: "Carnival partner: club retrospective and fun run", url: "https://www.hornseacarnival.org.uk/fun-run/" }],
    reviewed_at: "2026-10-16",
    contact_note: "The retrospective's age-of-club wording is historical. Carnival organisers' email, telephone and address are not club contacts; current training and joining details remain unresolved."
  }
};
