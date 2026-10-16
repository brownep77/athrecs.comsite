import type { ClubProfile } from "./club-profiles.ts";

// Official club and primary historical pages opened on 16 October 2026 UTC.
export const regionalParticipationAndVenueProfiles: Record<string, ClubProfile> = {
  "upper-wharfedale-runners": {
    summary: "Upper Wharfedale Runners brings runners together around Grassington for coached sessions and social outings on the Yorkshire Dales trails.",
    biography: [
      "Upper Wharfedale Runners is a running group based around Grassington in North Yorkshire, England. The surrounding Dales provide the setting for social trail runs, while coached sessions give members opportunities to work on their technique and fitness.",
      "Training includes intervals and tempo running, with regrouping used to help people of different abilities take part together. The club's England Athletics ClubSpark page welcomes newcomers and publishes a club enquiry email, while its coach's website explains the mix of structured training and sociable running.",
      "The published meeting point is the Yorkshire Dales National Park car park in Grassington. Runners should check the arrangements for their first session, particularly when a trail route uses a different start. The available pages do not establish a founding year."
    ],
    sources: [{ title: "Club introduction and meeting point", url: "https://clubspark.englandathletics.org/UpperWharfedaleRunners" }, { title: "Coach's club and training information", url: "https://hrrunningcoach.co.uk/upper-wharfedale-runners/" }],
    corrections: { website: "https://clubspark.englandathletics.org/UpperWharfedaleRunners", city: "Grassington", address: "Yorkshire Dales National Park car park, Grassington", postcode: "", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "velorunner": {
    summary: "VeloRunner connects running and cycling enthusiasts in Stone, Staffordshire, through its specialist shop and organised outdoor activities.",
    biography: [
      "VeloRunner is based in Stone, Staffordshire, England, with a specialist running and cycling shop on Emerald Way. Its community activities extend beyond retail, bringing people together for runs and rides in Staffordshire and further afield.",
      "The published event list includes trail running, gravel cycling and support for cross-country outings. Examples range from a Dragon's Back trail run near Hollinsclough to a Stockport-to-Stone gravel ride. These are examples of previous activities, not a promise that the same events are currently open for booking.",
      "The website offers a separate annual cycling-club membership for group rides. People interested in running should ask which sessions and membership arrangements apply to them rather than assuming that cycling membership covers every activity. The shop provides a public telephone contact, but individual outings may start away from Stone."
    ],
    sources: [{ title: "VeloRunner shop and public contact", url: "https://www.velorunner.co.uk/" }, { title: "Published club activities", url: "https://www.velorunner.co.uk/event-list" }, { title: "Cycling club membership", url: "https://www.velorunner.co.uk/cycling/cycle-club" }],
    corrections: { address_kind: "correspondence" },
    location_note: "Emerald Way is the shop contact base, not a confirmed start for every activity; check the meeting point for each run or ride.",
    reviewed_at: "2026-10-16"
  },
  "wallasey-athletic-club": {
    summary: "Wallasey Athletic Club combines a history reaching back to the early twentieth century with road, cross-country and multi-terrain running on the Wirral.",
    biography: [
      "Wallasey Athletic Club's history records a Wallasey Harriers annual meeting in 1906 and a merger with Homecroft Athletic Club in 1908, when the present club name was adopted. F. C. O'Connell was president of the earlier Harriers and continued in that role after the merger.",
      "Today the club meets at St Nicholas Hall, formerly Harrison Hall, in Wallasey Village, England. Tuesday sessions include intervals, hills and other efforts; Thursday running provides a steadier or tempo outing. Its competition programme includes the Borders League, Liverpool and District cross-country and Wirral multi-terrain races.",
      "Newcomers can try sessions without an immediate membership commitment. Adult, junior, family and social options provide different ways to participate, alongside regional and national relay opportunities. Contact the club before a first visit to confirm a suitable group and the current meeting arrangements."
    ],
    notable_members: [{ name: "F. C. O'Connell", connection: "Historical club president", detail: "President of Wallasey Harriers in 1906 and of the merged Wallasey Athletic Club in 1908, according to the club history." }],
    sources: [{ title: "Training, competition and joining", url: "https://www.wallaseyathleticclub.co.uk/" }, { title: "Club history", url: "https://www.wallaseyathleticclub.co.uk/WAC_files/misc/history.htm" }],
    corrections: { address: "St Nicholas Hall, Wallasey Village", postcode: "", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "ware-joggers": {
    summary: "Ware Joggers has supported social and competitive running in Ware, Hertfordshire, since Terry and Hazel Nichols established the club in 1987.",
    founded_year: 1987,
    biography: [
      "Ware Joggers was founded in 1987 by Terry Nichols with his wife Hazel. Based in Ware, Hertfordshire, England, it brings together runners interested in fitness, company and racing, with training groups arranged to accommodate different paces.",
      "Wodson Park Sports Centre on Wadesmill Road is the main meeting point. Tuesday and Thursday evening outings include longer runs and shorter regrouped options, with coached sessions forming part of the programme. A Tuesday morning track opportunity is also advertised, although the club explicitly describes that session as uncoached.",
      "Prospective members can try three sessions before joining. Sunday runs are arranged separately and may use different starting places. The club also organises the Ware 10s races. New runners should consult the current diary and trial-session instructions, because the joining page retains older start-time text alongside a newer Thursday arrangement."
    ],
    notable_members: [{ name: "Terry Nichols", connection: "Club founder", detail: "Founded Ware Joggers in 1987 with his wife Hazel, according to the club's account of its origins." }, { name: "Hazel Nichols", connection: "Club founder", detail: "Named with Terry Nichols in the club's account of its establishment in 1987." }],
    sources: [{ title: "Club origins", url: "https://www.ware-joggers.co.uk/about/about.php" }, { title: "Joining, sessions and venue", url: "https://www.ware-joggers.co.uk/about/newmembers.php" }, { title: "Club and Ware 10s", url: "https://www.ware-joggers.co.uk/" }],
    corrections: { address: "Wodson Park Sports Centre, Wadesmill Road, Ware, SG12 0UQ", postcode: "SG12 0UQ", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "wargrave-and-twyford-runners": {
    summary: "Wargrave and Twyford Runners combines Berkshire road, track and cross-country running with local trail outings and the Wargrave 10K.",
    founded_year: 1984,
    biography: [
      "Wargrave and Twyford Runners was established in 1984 and serves the neighbouring Berkshire communities of Wargrave and Twyford, England. Road running, track sessions and winter cross-country sit alongside outings on local trails such as those around Bowsey Woods.",
      "The club describes a varied programme with weekly intervals, a monthly track session and a local Tuesday 5K. Members can also take part in the Thames Valley clubs' summer 5K and winter cross-country series, making team competition part of the running year.",
      "The Wargrave 10K is organised with Barnes Fitness and supports local charitable and school causes. Prospective runners can use the club's enquiry form to find a suitable session. Training takes place across the area, so the club's name describes its community rather than a single permanent starting point."
    ],
    sources: [{ title: "Club history and activities", url: "https://www.wargraveandtwyfordrunners.co.uk/about-us" }, { title: "Joining enquiries", url: "https://www.wargraveandtwyfordrunners.co.uk/contact-us" }],
    corrections: { city: "Wargrave and Twyford", address: "", postcode: "", location_precision: "area-only" },
    reviewed_at: "2026-10-16"
  },
  "warley-woods-pacers": {
    summary: "Warley Woods Pacers grew from a group founded by Nigel Lloyd in 2007 into an affiliated running club based around Warley Woods in Smethwick.",
    founded_year: 2007,
    biography: [
      "Warley Woods Pacers began in 2007 when Nigel Lloyd established the group around Warley Woods in Smethwick, England. England Athletics affiliation followed in 2011, a separate milestone from the group's original formation.",
      "The club offers running for enjoyment and competition, with qualified coaches and run leaders supporting a range of abilities. Its published programme includes Tuesday and Saturday sessions, giving members opportunities to build fitness and run with others in the local park setting.",
      "Newcomers are invited to try the club before committing to membership. The contact page identifies Warley Woods Park as the base and provides a direct enquiry form. Ask about the most suitable session and meeting point before arriving, particularly if you are new to group training."
    ],
    notable_members: [{ name: "Nigel Lloyd", connection: "Club founder", detail: "Named by the club as the founder of Warley Woods Pacers in 2007; this is a historical association." }],
    sources: [{ title: "Origins, affiliation and training", url: "https://www.warleywoodspacers.com/" }, { title: "Club contact and location", url: "https://www.warleywoodspacers.com/contact" }],
    corrections: { city: "Smethwick", address: "Warley Woods Park, Smethwick, B67 5ED", postcode: "B67 5ED", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "warriors-pentathlon-and-athletic-club": {
    summary: "Warriors Pentathlon and Athletic Club offers Wirral families a broad route into running, athletics and modern-pentathlon-related activities.",
    biography: [
      "Warriors Pentathlon and Athletic Club is a family-oriented club on the Wirral, England, welcoming participants from age seven. Its programme reaches beyond running to activities including swimming, laser shooting, fencing and multisport combinations such as biathle and triathle.",
      "The club lists affiliations with Pentathlon GB, Northern Athletics and England Athletics. Road, track, cross-country, fell running and race walking provide further ways to participate. Newcomer sessions are advertised at Deeside and at the Oval in Bebington, with other coaching and conditioning opportunities using additional venues.",
      "Members use Spond for session arrangements, while prospective families can contact the club through its website. The public timetable is a starting point rather than a guarantee that every discipline is offered at every session. Confirm the appropriate age group, equipment and venue before a first visit."
    ],
    sources: [{ title: "Club introduction", url: "https://www.warriors.run/" }, { title: "Disciplines and affiliations", url: "https://www.warriors.run/about-us" }, { title: "Training sessions", url: "https://www.warriors.run/sessions" }],
    corrections: { city: "Wirral", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Sessions use multiple venues, including Deeside and the Oval in Bebington; confirm the venue in the session booking information.",
    reviewed_at: "2026-10-16"
  },
  "washington-running-club": {
    summary: "Washington Running Club combines North East group running with effort sessions, track work and strength training from its Washington base.",
    biography: [
      "Washington Running Club is based in Washington, Tyne and Wear, England. Its published welcome information identifies Columbia Grange School on Oxclose Road as a meeting point, with other sessions taking members beyond the town.",
      "The programme includes Thursday efforts and Sunday social runs arranged in groups. A monthly Monday track session uses Monkton Stadium in Jarrow, while other Mondays include strength and conditioning. Sessions are booked through ConnectMyClub, and junior availability is handled through a separate club email.",
      "The club's Grand Prix began in 2018. Its Bottoms Up Cup is a five-kilometre trail event remembering Stephen Bottoms, a member of the original 1970s club. That historical connection is not used to assign an unconfirmed founding year to the present organisation. New runners should follow the welcome and booking instructions before attending."
    ],
    notable_members: [{ name: "Stephen Bottoms", connection: "Historical club member", detail: "The club's welcome page remembers him as a member of the original 1970s club through its Bottoms Up Cup trail event." }],
    sources: [{ title: "Welcome, training and club events", url: "https://washingtonrunningclub.co.uk/calendar/welcometowrc" }],
    corrections: { website: "https://washingtonrunningclub.co.uk/", city: "Washington", address: "Columbia Grange School, Oxclose Road, Washington, NE38 7NY", postcode: "NE38 7NY", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "washlands-women-runners": {
    summary: "Washlands Women Runners supports women in Burton upon Trent through sociable group running, beginner courses and local team competition.",
    biography: [
      "Washlands Women Runners is based in Burton upon Trent, Staffordshire, England. Its Wednesday club evening meets at Meadowside Leisure Centre, with routes of roughly two, four and six miles allowing members to choose an appropriate outing.",
      "The club welcomes women who are already running as well as those taking their first steps. Its beginner programme builds from run-walk sessions towards two miles. Members can also enter the Burton and District Summer League and winter cross-country, while social running remains an important part of the club.",
      "England Athletics recognised Washlands with the West Midlands Contribution to Running award in 2023. The current website provides a public enquiry email and beginner-course information; the next April course was not yet assigned a confirmed date when checked. Contact the club for current availability rather than relying on an older course announcement."
    ],
    sources: [{ title: "Club, meeting point and beginner route", url: "https://www.washlandswomenrunners.org/" }, { title: "2023 regional Contribution to Running award", url: "https://www.englandathletics.org/news/west-midlands-volunteer-awards-evening/" }],
    corrections: { website: "https://www.washlandswomenrunners.org/", city: "Burton upon Trent", address: "Meadowside Leisure Centre, High Street, Burton upon Trent, DE14 1TL", postcode: "DE14 1TL", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "waverley-athletics-club": {
    summary: "Waverley Athletics Club provides year-round athletics in Surrey, with training across Haslemere, Godalming and nearby school venues.",
    biography: [
      "Waverley Athletics Club offers athletics across the Haslemere and Godalming area of Surrey, England. Volunteer coaches support general participation and event-group development, with track and field in summer and cross-country, Sportshall and indoor athletics in winter.",
      "Its seasonal timetable uses Woolmer Hill, Charterhouse, Rodborough and Broadwater school facilities. General sessions sit alongside coach-invited groups for disciplines such as throws, sprints, jumps and middle distance. The club also describes after-school activities arranged through local junior schools.",
      "Competition pathways include the Wessex Young Athletes League, Youth Development League and Surrey cross-country. Parents and prospective athletes can enquire through the club's public email and membership form. Check the current seasonal timetable carefully: the same weekday can use a different venue in summer and winter, and specialist groups require the relevant coach's invitation."
    ],
    sources: [{ title: "Club activities", url: "https://wavac.org.uk/about/" }, { title: "Coaching and schools", url: "https://wavac.org.uk/about/history/" }, { title: "Seasonal training venues", url: "https://wavac.org.uk/info/training/" }, { title: "Membership enquiries", url: "https://wavac.org.uk/about/contact/" }],
    location_note: "Training is spread across Woolmer Hill, Charterhouse, Rodborough and Broadwater facilities; consult the seasonal timetable rather than treating one address as the venue for every session.",
    reviewed_at: "2026-10-16"
  },
  "waverley-harriers": {
    summary: "Waverley Harriers brings Godalming and Farncombe runners together for coached track work, local road and trail runs and cross-country.",
    biography: [
      "Waverley Harriers is a running club serving Godalming and Farncombe in Surrey, England. Members take part in road, trail and cross-country running, with interests ranging from everyday fitness to marathon and ultra-distance challenges.",
      "Tuesday coaching begins with a meeting on Mark Way, off Charterhouse Road, before the group is led to the track. The club asks runners not to park at Charterhouse. Thursday runs meet at the Wilfrid Noyce Centre and generally last about an hour, using trails in summer and streets in winter. Sunday arrangements vary.",
      "Prospective members can try a small number of sessions before joining and ask the membership contact about a suitable group. A separate Couch to 5K contact is published, but old beginner-course announcements should not be read as confirmation that a course is currently accepting runners. Check the latest arrangements before attending."
    ],
    sources: [{ title: "Club introduction and joining", url: "https://waverleyharriers.co.uk/" }, { title: "Training venues and enquiry contacts", url: "https://waverleyharriers.co.uk/training/" }],
    corrections: { city: "Godalming", address: "Wilfrid Noyce Centre, Godalming, GU7 1HR", postcode: "GU7 1HR", address_kind: "training" },
    location_note: "The Wilfrid Noyce Centre is the Thursday meeting point; Tuesday track and Sunday runs use separate arrangements.",
    reviewed_at: "2026-10-16"
  },
  "weald-tri-club": {
    summary: "Weald Tri Club brings adults and juniors into triathlon around Cranbrook, with swimming and running sessions across the Kent Weald.",
    biography: [
      "Weald Tri Club describes a training community active since 2014 in the Cranbrook area of Kent, England. It welcomes adults and juniors, with opportunities spanning recreational participation and junior competition at national level.",
      "The published programme includes Monday swimming at Weald Sports Centre and Wednesday running, using Cranbrook School in summer and Bedgebury Pinetum in winter. These different settings reflect a club whose training is spread across the Weald rather than confined to one clubhouse.",
      "The membership page provides adult, junior, concession and adult social options and directs applicants to an online joining service. Prospective members should confirm which sessions suit their age and experience, along with the seasonal meeting point and any separate session arrangements. The reference to training since 2014 is not treated as documentary proof of a formal incorporation date."
    ],
    sources: [{ title: "Club introduction", url: "https://www.wealdtriclub.design/" }, { title: "Training venues", url: "https://www.wealdtriclub.design/services-5" }, { title: "Membership options", url: "https://www.wealdtriclub.design/memberships" }],
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note: "Swimming and running use different venues around Cranbrook and the Weald; the older directory contact address is not established as a training venue. Confirm the current seasonal arrangements before travelling.",
    reviewed_at: "2026-10-16"
  },
  "wearside-triathlon-club": {
    summary: "Wearside Triathlon Club offers a North East community for triathletes progressing from a first sprint event to longer-distance racing.",
    founded_year: 2017,
    biography: [
      "Wearside Triathlon Club presents itself as a North East England club established in 2017. Its introduction welcomes people of different ages and abilities, whether preparing for a first sprint triathlon or working towards an Ironman-distance challenge.",
      "The club describes structured training alongside social rides, group runs and open-water swimming. Its website was being rebuilt when checked and did not provide a complete current timetable or a confirmed public training address. Prospective members should obtain the latest session and joining arrangements from the club before travelling; the brief introduction alone does not establish current availability for every age group or discipline."
    ],
    sources: [{ title: "Club introduction and website redevelopment notice", url: "https://wearsidetriathlon.co.uk/" }],
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note: "The rebuilt website does not establish a public training venue; the older directory address is not presented as a session location.",
    contact_note: "The club website is being rebuilt; confirm current joining arrangements and session venues directly.",
    reviewed_at: "2026-10-16"
  },
  "weir-archer-academy": {
    summary: "Weir Archer Academy supports disability athletics in Kingston upon Thames, linking developing athletes with an experienced wheelchair-racing coaching team.",
    biography: [
      "Weir Archer Academy is based in Kingston upon Thames, England, and supports disability and para-athletics from participation towards elite competition. Its public headquarters is the Weir Archer Athletics and Fitness Centre on Kingston Road.",
      "The academy is closely associated with David Weir CBE and Jenny Archer MBE. Archer leads its coaching team, bringing experience developed through Weir's Paralympic career. The coaching page also describes specialist athletics and strength-and-conditioning support, with coaches helping athletes develop technique and performance.",
      "The academy's outlook extends beyond established champions to people exploring what they can achieve in sport. Its contact page publishes a direct email and telephone number for enquiries. Prospective athletes and families should discuss suitable coaching, equipment and session arrangements with the academy rather than assuming that every activity operates as an open drop-in session."
    ],
    notable_members: [{ name: "David Weir CBE", connection: "Academy athlete and namesake", detail: "The academy presents the six-time Paralympic gold medallist as central to its sporting and coaching partnership; no new athlete identity is created." }, { name: "Jenny Archer MBE", connection: "Head coach", detail: "Named on the academy's coaching page as head coach to Paralympians and developing athletes when checked in October 2026." }],
    sources: [{ title: "Academy purpose and athletes", url: "https://weirarcher.academy/" }, { title: "Coaching team", url: "https://weirarcher.academy/coaching" }, { title: "Headquarters and enquiries", url: "https://weirarcher.academy/contact" }],
    corrections: { website: "https://weirarcher.academy/", city: "Kingston upon Thames", address: "Weir Archer Athletics and Fitness Centre, Kingston Road, Kingston upon Thames, KT1 3PB", postcode: "KT1 3PB", address_kind: "clubhouse" },
    location_note: "The published address is the academy headquarters; confirm the venue and access arrangements for the relevant coaching session.",
    reviewed_at: "2026-10-16"
  },
  "wellingborough-and-district-ac": {
    summary: "Wellingborough and District AC grew from a London Marathon training group in 1992 and now supports varied running and endurance interests.",
    founded_year: 1992,
    biography: [
      "Wellingborough and District AC began in 1992 as a group training for the London Marathon. Based in Wellingborough, Northamptonshire, England, it has developed a programme for different abilities, including junior participation and interests in cross-country, triathlon, adventure racing and ultras.",
      "The club has taken part in the Three Counties cross-country league since 1996 and has a twinning connection with Kröv in Germany and its midnight run. Locally, the Old Grammarians ground on Sywell Road is an important training base.",
      "A September 2026 notice moves Tuesday sessions to Wrenn School on Doddington Road for the winter, while Thursdays remain at the Old Grammarians. Prospective runners can enquire about trial sessions and periodic beginner courses. The regular-group guidance expects some continuous-running experience, so complete beginners should ask which programme is appropriate rather than simply arriving at a standard session."
    ],
    sources: [{ title: "Club history and participation", url: "https://wdac.org.uk/about/" }, { title: "Current winter venue change", url: "https://wdac.org.uk/2026/09/14/tuesday-location-change-from-22nd-september/" }, { title: "Club and membership contacts", url: "https://wdac.org.uk/contact/" }],
    corrections: { address: "Old Grammarians, Sywell Road, Wellingborough, NN8 6BS", postcode: "NN8 6BS", address_kind: "training" },
    location_note: "Thursday sessions use the Old Grammarians. From 22 September 2026, Tuesday winter sessions use Wrenn School, Doddington Road; check the latest club notice before travelling.",
    reviewed_at: "2026-10-16"
  },
  "wells-city-harriers": {
    summary: "Wells City Harriers links Wells and Street runners through road, trail, cross-country and track athletics, with a history beginning in 1981.",
    founded_year: 1981,
    biography: [
      "Wells City Harriers began in 1981 as Cathedral City Striders and adopted its present name in 1982. Bernie Mundy and Kevin Sheppard are named in the club's account of its origins. Olympic long-jump champion Mary Rand became honorary president in December 1984.",
      "The Somerset club serves Wells, Street and the surrounding area of England. Road, trail, fell, cross-country and track running all feature in its activities. Published training venues include Wells Rugby Club and Millfield School in Street, with participation from age eight upwards.",
      "A partnership with Yeovil Olympiads developed in 2000, supporting athletics opportunities without making the two clubs the same organisation. The Harriers also contribute to the local racing community through the Street 5K and junior races and links with community events. New members should use the membership contact to identify a suitable session and venue."
    ],
    notable_members: [{ name: "Bernie Mundy", connection: "Club founder", detail: "Named with Kevin Sheppard in the club history's account of the 1981 origins as Cathedral City Striders." }, { name: "Kevin Sheppard", connection: "Club founder", detail: "Named with Bernie Mundy in the club's account of its 1981 establishment." }, { name: "Mary Rand", connection: "Historical honorary president appointment", detail: "The club records the Olympic long-jump champion's appointment on 10 December 1984; this does not assert current racing membership." }],
    sources: [{ title: "Club history and honorary presidency", url: "https://www.wellscityharriers.org.uk/index.php/categoryblog/122-new-membership-form-14-months-for-the-price-of-12" }, { title: "Disciplines, venues and partnership", url: "https://www.wellscityharriers.org.uk/index.php/about/who-we-are" }, { title: "Membership enquiries", url: "https://www.wellscityharriers.org.uk/index.php/contact" }],
    location_note: "Training uses both Wells Rugby Club and Millfield School in Street; confirm the correct venue for the age group and session.",
    reviewed_at: "2026-10-16"
  },
  "wenlock-olympians": {
    summary: "Wenlock Olympians introduces young people to athletics in Much Wenlock, within the wider tradition of the Wenlock Olympian Society.",
    biography: [
      "Wenlock Olympians is an athletics club in Much Wenlock, Shropshire, England. The club dates its own beginnings to the early 1950s and forms part of the Wenlock Olympian Society; the much older history of the Olympian Games is not the club's foundation date.",
      "Coaching focuses on young athletes aged eight to sixteen, with year-round Saturday sessions using indoor and outdoor facilities at Much Wenlock Leisure Centre and Linden Fields, shared with William Brookes School. Volunteers introduce a range of athletics skills and support young people working towards Duke of Edinburgh activities.",
      "The club also describes affiliated membership for seniors and lists England Athletics and regional athletics connections. Families can use its enquiry form to discuss joining and current places. No precise founding year is assigned where the club's own account gives only a decade."
    ],
    sources: [{ title: "Club origins and training", url: "https://www.wenlockolympians.org/" }, { title: "Age groups, venues and affiliation", url: "https://www.wenlockolympians.org/about-us" }, { title: "Club enquiry form", url: "https://www.wenlockolympians.org/contact-us" }],
    corrections: { city: "Much Wenlock", address: "Much Wenlock Leisure Centre, Linden Fields, Much Wenlock", postcode: "", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "werrington-joggers": {
    summary: "Werrington Joggers has grown from seven local runners in 1984 into a Peterborough club offering senior and junior running and volunteer-led activities.",
    founded_year: 1984,
    biography: [
      "Werrington Joggers was founded in September 1984 by seven local runners. Based in the Werrington area of Peterborough, England, it became a charity in 2010 and received a regional England Athletics club award in 2024.",
      "Werrington Sports Centre on Staniland Way is the club's published base. Tuesday evenings include junior and senior activity, while Sunday runs use varying locations and offer regrouping and different distance options. The junior section, for ages nine to sixteen, takes part in track, road and cross-country running.",
      "Volunteers support both established members and people new to running. Prospective juniors can use the published junior contacts, and adults should check the latest session arrangements before attending. The homepage and older about page give different senior arrival times, so the current club instructions should be confirmed rather than treating either time as permanent."
    ],
    sources: [{ title: "Current training and junior contacts", url: "https://www.werringtonjoggers.co.uk/" }, { title: "Origins, charity and venue", url: "https://www.werringtonjoggers.co.uk/Website/Page/ABOUTUS" }],
    corrections: { city: "Peterborough", address: "Werrington Sports Centre, Staniland Way, Werrington, Peterborough, PE4 6NA", postcode: "PE4 6NA", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "west-bromwich-harriers": {
    summary: "West Bromwich Harriers combines a running tradition dating to 1921 with road racing, cross-country teams and midweek training in the Black Country.",
    founded_year: 1921,
    biography: [
      "West Bromwich Harriers was founded in 1921 and is based in West Bromwich, England. The club's maroon and white colours are part of a long road-running and cross-country tradition, including involvement in the Birmingham and Midland women's cross-country leagues.",
      "Wednesday training includes efforts such as speed work and hills. The published meeting place is Dartmouth Central Club on Devonshire Drive, where runners gather before the session. The club provides a public enquiry email for people interested in joining or finding out about its activities.",
      "Its own introduction identifies endurance runner Dave Heeley as a member associated with major charity challenges, including seven marathons on seven continents in seven days. That published sporting connection is presented as an editorial association, not an independently verified current membership record. Newcomers should contact the club to confirm a suitable first session."
    ],
    notable_members: [{ name: "Dave Heeley", connection: "Club-associated endurance runner", detail: "The club's introduction names him as a member known for charity endurance challenges; the page does not establish the dates of that membership." }],
    sources: [{ title: "Club origins and sporting activities", url: "https://westbromwichharriers.wordpress.com/about-our-club/" }, { title: "Training meeting point and enquiries", url: "https://westbromwichharriers.wordpress.com/contact/" }],
    corrections: { address: "Dartmouth Central Club, Devonshire Drive, West Bromwich, B71 4AA", postcode: "B71 4AA", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "west-cheshire-athletic-club": {
    summary: "West Cheshire Athletic Club was formed in 1998 and offers track and field, road and cross-country athletics across Chester and Ellesmere Port.",
    founded_year: 1998,
    biography: [
      "West Cheshire Athletic Club formed in April 1998 through the merger of Chester and Ellesmere Port Athletic Club and Whitby Heath Athletic Club. It serves Chester, Ellesmere Port and the surrounding Cheshire area of England, with participation across age groups and ability levels.",
      "Track and field, road running, off-road running and cross-country are all part of the club's activities. Published training venues include Ellesmere Port Sports Village, Cheshire County Sports Club in Upton-by-Chester and Northgate Arena in Chester. The club's history also records national recognition for its junior section in 2005.",
      "New athletes are encouraged to find the appropriate coaching group and discuss trying sessions before joining. The website's contact form routes enquiries to the relevant club function. Because training is distributed across several facilities, confirm the group and venue in advance rather than assuming every session takes place at the main track."
    ],
    sources: [{ title: "History, activities and training venues", url: "https://www.westcheshireac.co.uk/about/" }, { title: "Club enquiry form", url: "https://www.westcheshireac.co.uk/contact/" }],
    corrections: { city: "Ellesmere Port", address: "Ellesmere Port Sports Village, Ellesmere Port, CH65 9LB", postcode: "CH65 9LB", address_kind: "training" },
    location_note: "Ellesmere Port Sports Village is one training venue; additional sessions use Cheshire County Sports Club and Northgate Arena in Chester.",
    reviewed_at: "2026-10-16"
  }
};
