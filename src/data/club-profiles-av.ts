import type { ClubProfile } from "./club-profiles";

// Primary club, county-board and programme-organiser pages read 15 October 2026.
export const regionalClubRootsProfiles: Record<string, ClubProfile> = {
  "madrunners": {
    summary: "MadRunners combines local running and fitness sessions around St Helens with a virtual community, offering separate adult, junior and family activities.",
    biography: [
      "MadRunners began in 2016 in St Helens, Merseyside, England, founded by the husband-and-wife team Mark and Debbie. Its local programme brings together beginners and experienced runners for coached running, group outings and fitness work. Members also take part in events ranging from fun runs to ultramarathons.",
      "Sessions operate around St Helens and Burtonwood rather than at one permanent clubhouse. Adult running starts at seventeen, with separate Mini, Junior and Teen groups and family activities. Under-eighteens should contact the club before attending. All sessions are pay as you go, and newcomers are directed to the registration and readiness questionnaire on the website.",
      "The virtual arm grew during the pandemic, offering remote support, training and challenges to runners elsewhere in the country. England Athletics affiliation is optional; local participants who do not affiliate can use RunTogether membership. The general club and virtual-events email addresses serve different enquiries."
    ],
    founded_year: 2016,
    sources: [{ title: "Club origins and age groups", url: "https://www.madrunners.co.uk/" }, { title: "Local participation", url: "https://www.madrunners.co.uk/local-madrunners" }, { title: "Training locations", url: "https://www.madrunners.co.uk/training-sessions" }, { title: "Public enquiries", url: "https://www.madrunners.co.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "Local sessions use several St Helens and Burtonwood locations; the former directory street address is not a confirmed training venue.",
    corrections: { address: "", postcode: "" }
  },
  "maltby-running-club": {
    summary: "Maltby Running Club has roots dating to 1983 and combines community running around Rotherham with KMR trail races and support for local charity.",
    biography: [
      "Maltby Running Club is a community running club in the Rotherham area of South Yorkshire, England. Its own account traces its running history to 1983. The emphasis is on enjoyable, accessible participation and the friendships formed through training and racing, rather than requiring every member to compete.",
      "The club contributes four trail races to the KMR series and provides prizes and refreshments for participants. Charity activity is part of its identity: its website describes fundraising over the years and names Amy's House as a local cause it supports.",
      "There are separate social, non-competing and full membership options, with England Athletics registration included in the latter. An online application is available. Contact the club's enquiry email or form to confirm suitable sessions and meeting places; the opened pages do not establish the directory's Wickersley street address as a training base."
    ],
    founded_year: 1983,
    sources: [{ title: "About the club", url: "https://maltbyrunningclub.wpcomstaging.com/about/" }, { title: "Membership options", url: "https://maltbyrunningclub.wpcomstaging.com/membership-2/" }, { title: "Enquiries", url: "https://maltbyrunningclub.wpcomstaging.com/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Ask the club for current training starts; the previous Wickersley address is not confirmed as a meeting venue.",
    corrections: { website: "https://maltbyrunningclub.wpcomstaging.com/", address: "", postcode: "" }
  },
  "malvern-buzzards-running-club": {
    summary: "Malvern Buzzards grew from a 2016 Strava group into an adult trail-running club, with volunteer-led routes in the Malvern Hills and cross-country teams.",
    biography: [
      "Malvern Buzzards Running Club brings adults together around the Malvern Hills in Worcestershire, England. It began as an informal Strava group in summer 2016, became a club at a meeting in October 2017 and affiliated to England Athletics in January 2018. Those are distinct stages in its development.",
      "Trail running is central to the programme, alongside some road sessions. Volunteer leaders post each outing's distance, pace, route and meeting point on Strava, and members register their intention to attend. The club also takes part in the Herefordshire and Borders cross-country league and maintains a race league to encourage members to try different events.",
      "Membership is for adults, with first-claim and second-claim options. Email the membership team before requesting access to the Strava club. Locations change with the run, so the former directory address should not be treated as a clubhouse or a place to turn up without checking."
    ],
    founded_year: 2017,
    sources: [{ title: "Origins", url: "https://www.malvernbuzzards.uk/" }, { title: "Joining and run organisation", url: "https://www.malvernbuzzards.uk/copy-of-information" }, { title: "Club contacts", url: "https://www.malvernbuzzards.uk/new-page" }],
    reviewed_at: "2026-10-15",
    location_note: "Meeting places are specified for individual Strava events; no single training address is asserted.",
    corrections: { address: "", postcode: "", adult_only: true }
  },
  "manchester-harriers-and-ac": {
    summary: "Manchester Harriers and AC traces its roots to Fallowfield in 1886 and now offers track, field and endurance athletics at Wythenshawe Park and Sportcity.",
    biography: [
      "Manchester Harriers and AC dates its origins to 1886 in Fallowfield, Manchester, England. Its history includes Ricky Wilde, who won the European indoor 3,000 metres title in the 1970s. Today the club covers track and field, road running and cross-country, with opportunities for recreational as well as competitive athletes.",
      "Wythenshawe Park Athletics Track is the main training venue. A smaller Sportcity group serves more experienced track-and-field athletes. The club also organises a primary-schools cross-country league involving schools from Manchester, Stockport and the surrounding area.",
      "Joining arrangements depend on age. The seven-to-twelve waiting list was temporarily closed when checked in October 2026, with an update requested at the end of that month. Thirteen-to-seventeen-year-olds should complete the enquiry form, while adults can register for a Thursday introduction at Wythenshawe. Trial sessions are available before membership, but visitors should follow the relevant joining route first."
    ],
    founded_year: 1886,
    notable_members: [{ name: "Ricky Wilde", connection: "Historical athlete", detail: "The club's history identifies Wilde among its past athletes and records his European indoor 3,000 metres title in the 1970s; this is not a claim of current membership." }],
    sources: [{ title: "Club history", url: "https://manchesterharriers.co.uk/home/history/" }, { title: "Activities and schools league", url: "https://manchesterharriers.co.uk/home/about/" }, { title: "Age-specific joining arrangements", url: "https://manchesterharriers.co.uk/home/about-us/" }],
    reviewed_at: "2026-10-15",
    location_note: "Wythenshawe Park is the main venue; the Sportcity group trains separately.",
    corrections: { website: "https://manchesterharriers.co.uk/", address_kind: "training" }
  },
  "manchester-road-runners": {
    summary: "Manchester Road Runners is a social running community founded in 2013, with city runs, track sessions, trail outings and charity events.",
    biography: [
      "Manchester Road Runners was founded in 2013 by Chris Rider and fellow runners in Manchester, England. Its social approach gives people a way to exercise and meet friends without making paid club membership a condition of joining ordinary runs. Optional paid and England Athletics-affiliated tiers provide additional benefits.",
      "Wednesday outings offer several distances and an intervals option, supported by volunteer ambassadors. Other activities include longer Sunday runs, Longford track sessions, parkrun meet-ups and the Trail Division's hikes and runs. The Run The Streets events combine a city-centre 5K with fundraising for local charities.",
      "Complete the club's current annual registration even if choosing free membership. Check the live calendar and community announcements for the start: October listings distinguish Wednesday runs from The Wharf and Sunday runs from House of Social, while an older panel still refers to January. Track entry is charged separately, and longer runs have their own pace and endurance expectations."
    ],
    founded_year: 2013,
    notable_members: [{ name: "Chris Rider", connection: "Founding organiser", detail: "The club identifies Rider as its founding chair and names him in its account of the 2013 beginnings." }],
    sources: [{ title: "Origins, membership and current calendar", url: "https://manchesterroadrunners.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "Meeting places vary by session. The Wharf is a Wednesday start, not the base for every club activity.",
    corrections: { website: "https://manchesterroadrunners.co.uk/", address_kind: "training" }
  },
  "manchester-ymca-harriers": {
    summary: "Manchester YMCA Harriers has a history dating to 1882 and combines Castlefield social runs with track training, cross-country and club trips.",
    biography: [
      "Manchester YMCA Harriers was established in 1882 and has maintained its connection with YMCA Manchester throughout its history. Based at the Y Club in Castlefield, Manchester, England, it is run by an elected volunteer committee and offers both recreational running and team competition.",
      "Thursday group runs start at the Y Club, while Tuesday speedwork uses Manchester Regional Arena. The wider programme includes parkrun meet-ups, cross-country racing, club championships and trips to events. Monthly socials give members time together away from the training session.",
      "Newcomers are encouraged to try a Thursday run before joining. First-claim, second-claim and social memberships serve different needs; first-claim membership includes England Athletics registration. Arrange any first-visit use of Y Club facilities with the venue separately, and use the Harriers' contact form for club enquiries."
    ],
    founded_year: 1882,
    sources: [{ title: "Programme", url: "https://www.manyharrier.co.uk/" }, { title: "Origins and YMCA connection", url: "https://www.manyharrier.co.uk/about" }, { title: "First visits and membership", url: "https://www.manyharrier.co.uk/join-us" }, { title: "Enquiries", url: "https://www.manyharrier.co.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "The Y Club in Castlefield is the social-run base; track sessions use Manchester Regional Arena.",
    corrections: { address_kind: "training" }
  },
  "mansfield-harriers": {
    summary: "Mansfield Harriers combines a 1920 athletics heritage with the 1995 merger of Berry Hill AC and Mansfield Running Club, training from Berry Hill Track.",
    biography: [
      "Mansfield Harriers traces its roots to 1920 in Mansfield, Nottinghamshire, England. The Berry Hill track became its headquarters in 1958. The present Mansfield Harriers and Athletic Club was formed in September 1995 by merging Berry Hill AC with Mansfield Running Club, the latter established during the 1983 road-running boom.",
      "The programme spans track and field, road, cross-country, fell and multi-terrain running. Its history names former international David Cropper and describes Ricky Soos among the club's international representatives. These are historical associations, not statements about their current membership. Disability athletics and a substantial young-athlete section also feature in the club's provision.",
      "Senior endurance groups meet at Berry Hill, with experienced runners, Mansfield Runners and Fit To Run offering different entry points. Contact the club to choose a suitable group and confirm junior availability. Its pages disagree on the youngest starting age and number of free trial sessions, so neither should be assumed from a headline alone."
    ],
    founded_year: 1920,
    notable_members: [{ name: "David Cropper", connection: "Former international associated with the club", detail: "The club's history lists Cropper among former international athletes who represented it." }, { name: "Ricky Soos", connection: "Historical international representative", detail: "The club's historical account names Soos among members who represented their country; its undated current/recent wording is not treated as current membership evidence." }],
    sources: [{ title: "Club history and merger", url: "https://www.mansfieldharriers.co.uk/the-club/our-history/" }, { title: "Training groups", url: "https://www.mansfieldharriers.co.uk/training-schedule/" }, { title: "Age guidance", url: "https://www.mansfieldharriers.co.uk/" }, { title: "Enquiry and postal distinction", url: "https://www.mansfieldharriers.co.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training is at Berry Hill Track. The Santon Road address on the contact page is explicitly postal, not a training venue.",
    corrections: { address_kind: "training" }
  },
  "march-ac": {
    summary: "March AC began as a largely junior club in 1976 and now offers adult and junior running from Elm Road Sports Field in the Cambridgeshire Fens.",
    biography: [
      "March Athletic Club was formed on 24 May 1976 in March, Cambridgeshire, England. Its early membership was predominantly children, with adult distance running growing after the first London Marathon. Several moves followed, including a period as March Braza AC, before the club settled at Elm Road Sports Field in October 2009.",
      "Tuesday training concentrates on faster efforts, while Thursday group runs use different distances and staggered starts so runners can finish and socialise together. Junior activity also takes place on Thursdays. Road racing, cross-country, the Summer Run and Hereward Relay sit alongside running simply for fitness.",
      "The club welcomes prospective members to enquire through its membership secretary and provides an application form. Changing, showering and refreshments are available at the sports field. The membership notice retrieved still refers to 2025/26, so confirm the current fee and junior arrangements rather than relying on an older form."
    ],
    founded_year: 1976,
    sources: [{ title: "Current base and programme", url: "https://marchac.co.uk/" }, { title: "History of the club and its venues", url: "https://marchac.co.uk/history/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://marchac.co.uk/", address: "Elm Road Sports Field, Elm Road, March, Cambridgeshire", postcode: "PE15 0BH", address_kind: "training" }
  },
  "market-drayton-rc": {
    summary: "Market Drayton Running Club was registered in 2009 and offers group running, beginner programmes and three trial runs from its Betton Road sports-club base.",
    biography: [
      "Market Drayton Running Club was officially registered in 2009 by Jason and Lorraine Rollinson in Market Drayton, Shropshire, England. Its focus is a friendly setting for people developing their running, whether they want company on regular outings or opportunities to enter races.",
      "Monday and Thursday runs start from Market Drayton Community Amateur Sports Club on Betton Road. People already running about three miles can enquire about an existing group; those not yet at that distance are directed to the club's beginner programmes. Three trial runs are offered before membership is required.",
      "Use the general club email for joining and the separate Market Drayton 10K mailbox for race enquiries. Cancellation notices are published through the club's Facebook page. The recovered .co.uk website contains the club's history, joining information and contact details; the old .com listing redirected away from club content when checked."
    ],
    founded_year: 2009,
    sources: [{ title: "Founders and base", url: "https://marketdraytonrunningclub.co.uk/about/" }, { title: "Joining and beginner routes", url: "https://marketdraytonrunningclub.co.uk/join-us/" }, { title: "Club contacts", url: "https://marketdraytonrunningclub.co.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://marketdraytonrunningclub.co.uk/", address_kind: "training" }
  },
  "marlborough-athletics": {
    summary: "Marlborough Athletics develops running, jumping and throwing at Marlborough College Track, with broad junior coaching and opportunities for older athletes.",
    biography: [
      "Marlborough Athletics serves Marlborough and east Wiltshire, England, from the Marlborough College athletics track. Its programme introduces younger children to running, jumping and throwing, develops all-round fitness and gradually prepares them for competition. Older athletes can work towards particular events while retaining a broad range of skills.",
      "Summer track-and-field coaching is complemented by winter endurance, hill and cross-country activity. The club competes in the South West Wessex League and Oxford Mail cross-country league. Coaches encourage young athletes to try more than one activity rather than specialise too early, and the club welcomes volunteer help with coaching, administration and events.",
      "The junior membership page offers two taster sessions but also carries a restriction on U9 and U11 enquiries, alongside newer age-group labels. Families should confirm places and the appropriate group before attending. Parents of children in school years two and three must remain trackside. Use the college's water-meadow car park: parking and drop-offs at the track are prohibited."
    ],
    sources: [{ title: "Club approach and track access", url: "https://marlboroughathletics.co.uk/about/about-marlborough-athletics" }, { title: "Coaching and seasons", url: "https://marlboroughathletics.co.uk/training-with-marlborough-athletics" }, { title: "Junior membership restrictions", url: "https://marlboroughathletics.co.uk/membership-selection/membership-junior" }],
    reviewed_at: "2026-10-15",
    contact_note: "The contact page is under maintenance and its email was not readable in the retrieved text; use the official site to confirm the current enquiry route.",
    corrections: { address_kind: "training" }
  },
  "marlborough-running-club": {
    summary: "Marlborough Running Club has explored Wiltshire's downs and forest trails since 1988, combining road and cross-country running with locally organised races.",
    biography: [
      "Marlborough Running Club was founded in 1988 in Marlborough, Wiltshire, England. Road, trail and cross-country running all feature, but the surrounding downland and woods give the club much of its character. Routes reach Savernake Forest, the Marlborough Downs, Kennet Valley and Ridgeway.",
      "Monday sessions focus on improvement, while Wednesday runs are longer and split by pace with opportunities to regroup. Marlborough Leisure Centre is the usual meeting point, although some outings start elsewhere. Winter routes require particular attention to visibility. Members also run and volunteer at Marlborough Common parkrun, including club takeovers.",
      "Guests can try training before becoming members. The club organises the Marlborough Downs Challenge, Ridgeway Relay and Avebury 8 Nine, and asks members to help with its events; race income supports the club's low-cost participation. Contact the membership secretary about joining or the information mailbox for general questions."
    ],
    founded_year: 1988,
    sources: [{ title: "Club origins and races", url: "https://www.marlboroughrunningclub.org.uk/" }, { title: "Training and volunteering", url: "https://www.marlboroughrunningclub.org.uk/club-information/training" }, { title: "Membership", url: "https://www.marlboroughrunningclub.org.uk/club-information/membership" }, { title: "Contacts", url: "https://www.marlboroughrunningclub.org.uk/contact" }],
    reviewed_at: "2026-10-15",
    location_note: "Marlborough Leisure Centre is the usual start; check each run for away locations.",
    corrections: { address_kind: "training" }
  },
  "marlow-striders": {
    summary: "Marlow Striders has supported adult running since 1989, with pace-based groups, Couch to 5K, track intervals and a walking group known as the Penguins.",
    biography: [
      "Marlow Striders was founded in 1989 in Marlow, Buckinghamshire, England. Its running programme ranges from beginner support to marathons and ultras, with a strong social element. The Penguins walking group provides another way to remain involved, including for retired runners and people returning from injury.",
      "Tuesday evenings begin at Marlow Sports Club, with groups covering different distances and paces. Thursday starts can vary, particularly for summer outings, while Friday intervals use Little Marlow track at an additional charge. The club also offers Couch to 5K courses and a calendar of races and social activities.",
      "Prospective adult members should arrange a guest visit before applying. Acceptance requires a trial run and confirmation by the membership secretary; club membership and individual athletics registration are separate. Use the published enquiry email to check the right group and current arrangements. The opened programme supports running and walking, rather than the broad multisport labels previously attached to this listing."
    ],
    founded_year: 1989,
    sources: [{ title: "Club identity", url: "https://www.marlowstriders.co.uk/contents/260-who-we-are" }, { title: "Meeting places", url: "https://www.marlowstriders.co.uk/contents/979-where-and-when-we-meet" }, { title: "Trial and membership requirements", url: "https://www.marlowstriders.co.uk/contents/1011-membership-fees" }],
    reviewed_at: "2026-10-15",
    corrections: { sports: ["Running"], address_kind: "training" }
  },
  "marple-runners": {
    summary: "Marple Runners began in 2016 and offers sociable road and trail runs, run-walk groups, coached sessions and a local trail race from its Railway pub meeting base.",
    biography: [
      "Marple Runners was founded in 2016 by local people who enjoyed running together in Marple, Greater Manchester, England. Its routes make use of the town's roads, hills and trails, with shorter and longer options and volunteer tail runners to keep people supported.",
      "Club nights meet at the Railway pub near Rose Hill station on Mondays and Wednesdays, excluding bank holidays. Newcomers should email ahead so someone can welcome them. Run-walk sessions offer an alternative to continuous running, while members-only coached sessions require advance booking through RunTogether.",
      "The club participates in cross-country, organises a 10K trail race and family fun run, and encourages members to volunteer. Its Equaliser, introduced in 2025, uses staggered starts for a 5K on the Middlewood Way. Competitive, non-competitive and second-claim memberships differ in their racing benefits; ask about the appropriate option and trial arrangements before joining."
    ],
    founded_year: 2016,
    sources: [{ title: "Origins", url: "https://www.marplerunners.com/" }, { title: "Club nights", url: "https://www.marplerunners.com/run-with-us" }, { title: "New-runner guide", url: "https://www.marplerunners.com/run-with-us/new-runners-info" }, { title: "Membership choices", url: "https://www.marplerunners.com/run-with-us/join-us" }],
    reviewed_at: "2026-10-15",
    location_note: "Club runs meet at the Railway pub near Rose Hill station, not the Oldknow Road contact address.",
    corrections: { city: "Marple", website: "https://www.marplerunners.com/", address_kind: "training" }
  },
  "marsden-racers": {
    summary: "Marsden Racers combines trail running and cycling in the Colne Valley, with social participation and progression from beginner outings to endurance challenges.",
    biography: [
      "Marsden Racers started in 2014 in Marsden, near Huddersfield in West Yorkshire, England. Running and cycling are its two central activities, with sociability as important as training. The club describes support for beginners as well as people working towards ultras and long-distance triathlon.",
      "Trail runs explore the Colne Valley landscape, while cycling includes road and mountain-bike activity. The club states affiliations to England Athletics and British Cycling. Its published winter programme includes beginner running and longer trail groups with different pace options, alongside social cycling.",
      "Prospective members can ask about a free trial through the club email or contact form. The timetable panel is labelled winter 2025, so confirm current meeting places and equipment before attending. Hemplow Grounds is the published club base, but the listed running sessions start at Marsden Mechanics and cycling arrangements are shared separately."
    ],
    founded_year: 2014,
    sources: [{ title: "Origins, disciplines and session guidance", url: "https://www.marsdenracers.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "Hemplow Grounds is the published base, not a universal session start. Confirm current arrangements because the displayed winter timetable is dated 2025.",
    corrections: { city: "Marsden", sports: ["Running", "Cycling"] }
  },
  "marshall-milton-keynes-ac": {
    summary: "Marshall Milton Keynes AC traces its roots to Wolverton in 1885, with broad athletics provision at Stantonbury and a history of developing international athletes.",
    biography: [
      "Marshall Milton Keynes AC grew from Wolverton Amateur Athletic Club, founded in 1885 after the railway company opened Wolverton Park. It became Milton Keynes AC in 1976 and adopted the Marshall name in January 2006 following sponsorship. Its history highlights the development of long jumper Greg Rutherford and sprinter Craig Pickering.",
      "Based at Stantonbury Stadium in Milton Keynes, Buckinghamshire, England, the club covers track and field, road, cross-country, race walking, fell running and Sportshall. Its programme includes youth development, adult and masters groups, plus a Buckingham satellite using Stowe School's track in summer.",
      "The ordinary athletics programme welcomes athletes from eight upwards, with separate Funetics sessions for ages four to seven. Contact the membership secretary to arrange a trial before submitting forms or payment. The stadium's Soskin Drive address is a training location, not a postal address; the club asks people to contact an officer before sending anything by post."
    ],
    founded_year: 1885,
    notable_members: [{ name: "Greg Rutherford", connection: "Athlete developed through the club", detail: "The club's history identifies Rutherford among athletes developed through its coaching programme and records his 2012 Olympic long-jump gold." }, { name: "Craig Pickering", connection: "Historical sprint association", detail: "The club's history names Pickering among its internationally successful athletes; no current membership is asserted." }],
    sources: [{ title: "Club history", url: "https://mkac.org.uk/club-history/" }, { title: "Athletics and youth provision", url: "https://mkac.org.uk/membership/information-for-new-members/" }, { title: "Membership enquiries", url: "https://mkac.org.uk/membership/membership-enquiries/" }, { title: "Track versus postal address", url: "https://mkac.org.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Stantonbury Stadium is a training venue, explicitly not a postal address. The Buckingham satellite has separate arrangements.",
    corrections: { website: "https://mkac.org.uk/", address: "Stantonbury Stadium, Soskin Drive, Stantonbury, Milton Keynes", postcode: "MK14 6DT", address_kind: "training" }
  },
  "massey-ferguson-rc": {
    summary: "Massey Ferguson RC grew from a Coventry workplace team in 1977 and now offers adult running, strength work and racing in its distinctive red-and-white quarters.",
    biography: [
      "Massey Ferguson RC was formed in Coventry, England, on 21 November 1977 after Terry Lawson assembled company runners for inter-firm competition. The club adopted the Massey Ferguson Runners Club name in 1981. A women's section began in 1984, and the two sections merged in 1995; the club continued beyond the closure of the Coventry plant.",
      "Its history includes Olympic marathon runner Dave Long. Today's adult programme combines grouped runs, intervals and Racefit strength-and-conditioning work, with seasonal track sessions and regional competition. The red-and-white quartered vest remains a distinctive part of its identity, and the club organises its own races.",
      "A four-week trial lets newcomers experience training before joining. Membership includes England Athletics registration and associate membership of the sports and social club. Training uses several Coventry-area venues, so consult the session schedule. Use the club enquiry form; the telephone and Bromsgrove address in the website footer belong to its web designer, not the running club."
    ],
    founded_year: 1977,
    notable_members: [{ name: "Terry Lawson", connection: "Founder", detail: "The club's history credits Lawson with forming the original Massey Ferguson workplace running team and club in 1977." }, { name: "Dave Long", connection: "Historical international marathon runner", detail: "The club names Long among its past leading athletes and preserves an interview about his international marathon career." }],
    sources: [{ title: "Club history", url: "https://masseyrunners.org.uk/club-history/" }, { title: "Current activities", url: "https://masseyrunners.org.uk/about/" }, { title: "Training venues", url: "https://masseyrunners.org.uk/training/" }, { title: "Membership and trial", url: "https://masseyrunners.org.uk/membership/" }, { title: "Enquiry form", url: "https://masseyrunners.org.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "A Coventry-based club with several training venues; the old Solihull postcode is not retained as a meeting point.",
    corrections: { city: "Coventry", county: "West Midlands", address: "", postcode: "" }
  },
  "matlock-athletic-club": {
    summary: "Matlock Athletic Club was formed in 1976 and combines Derbyshire road and fell running, junior coaching and community races from the Arc Leisure Centre.",
    biography: [
      "Matlock Athletic Club began at a meeting at Matlock College in June 1976 in Derbyshire, England. The first White Peak marathon followed in 1977. After years at Sherwood Hall and a period without a permanent home, the club moved to the Arc Leisure Centre when it opened in 2011.",
      "Road, fell and cross-country running sit alongside a junior programme. Senior sessions include faster work, steadier training and longer group outings; some use away venues or Tupton track. The club's history records Billy Cartwright becoming its first senior English fell champion in 2021, with clubmate Dan Haworth second.",
      "Newcomers should use the contact form before trying a few sessions. The White Peak Festival of Running, Black Rocks Fell Race, Peak Rail 7 and Whitworth Thread reflect the club's wider role in local running. The Arc is the usual start, but participants should check the published schedule for their chosen session."
    ],
    founded_year: 1976,
    notable_members: [{ name: "Billy Cartwright", connection: "Historical championship association", detail: "The club's historical timeline records Cartwright as its first senior English fell champion in 2021; current membership is not inferred." }],
    sources: [{ title: "Current programme and races", url: "https://www.matlockac.org.uk/" }, { title: "Club history", url: "https://www.matlockac.org.uk/club-history/" }, { title: "Joining and trials", url: "https://www.matlockac.org.uk/join/" }, { title: "Enquiries", url: "https://www.matlockac.org.uk/contact/" }],
    reviewed_at: "2026-10-15",
    corrections: { address_kind: "training" }
  },
  "medway-and-maidstone-ac": {
    summary: "Medway and Maidstone AC formed in a 2001 merger and offers track, field, cross-country and road running from Gillingham and Sutton Valence.",
    biography: [
      "Medway and Maidstone AC took its present name in 2001 after Medway AC and GEC Avionics AC merged. The predecessors had themselves been known as Rochester City AC and Maidstone and Rochester AC. The Kent, England club now trains at Medway Park in Gillingham and Sutton Valence School near Maidstone.",
      "Track-and-field teams compete through summer, with junior league opportunities alongside senior competition. Winter activity includes Kent cross-country leagues and championship events, and the club also has an active road-running group. Coaches, officials, team managers and committee volunteers sustain the programme.",
      "Contact the club before attending, giving age, school year where relevant, preferred discipline and venue. Demand is high and some junior groups have waiting lists. Younger children's Saturday sessions at Medway Park are booked through the separate West Kent Athletics partnership. Venue entry charges are additional to club fees, and families should confirm the appropriate group and costs directly."
    ],
    founded_year: 2001,
    sources: [{ title: "Merger and activities", url: "https://www.mandmac.org/who-we-are/" }, { title: "Joining and junior partnership", url: "https://www.mandmac.org/info/looking-to-join/" }, { title: "Training venues", url: "https://www.mandmac.org/info/training-venues/" }, { title: "Club enquiries", url: "https://www.mandmac.org/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Medway Park and Sutton Valence are separate training venues; confirm the venue and group before travelling.",
    corrections: { website: "https://www.mandmac.org/", address_kind: "training" }
  },
  "medway-tri": {
    summary: "MedwayTri developed from local training partners and launched in 2013, offering coached swim, bike and run activity for adults and juniors across Medway.",
    biography: [
      "MedwayTri grew from athletes training together around the Medway towns in Kent, England. After the 2012 world championships, Dean Ratcliffe created the Training Buddies email group to coordinate sessions. A committee formed in May 2013, and the club officially launched at Medway Park on 29 September with junior and senior aquathlons.",
      "The club supports recreational and competitive triathlon through swimming, cycling and running. Track sessions use Medway Park, while winter cross-country training uses Capstone Park. Junior activity also includes swimming at local leisure centres and cycling at Gravesend Cyclopark, with sessions organised around development needs.",
      "Junior enrolment begins in the year a child turns eight. Families should contact the membership officer to discuss a suitable first session rather than simply arrive. The website provides guest registration, membership choices and session booking; facility access and parking charges can be separate. Check the current booking information because different pages display different session prices."
    ],
    founded_year: 2013,
    notable_members: [{ name: "Dean Ratcliffe", connection: "Founding organiser", detail: "The club's history credits Ratcliffe with starting Training Buddies after the 2012 world championships and helping establish MedwayTri before its 2013 launch." }],
    sources: [{ title: "Club formation", url: "https://www.medwaytri.com/about-us/our-club-history" }, { title: "Junior provision", url: "https://www.medwaytri.com/training/junior-training" }, { title: "Run training", url: "https://www.medwaytri.com/training/run-training" }, { title: "Club contacts", url: "https://www.medwaytri.com/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "Medway Park is one training venue; pool, cycling and cross-country sessions use other locations.",
    corrections: { address_kind: "training" }
  },
  "athletics-ireland-carraig-mhor-a-c": {
    summary: "Carraig Mhór AC is an athletics club in Carrigtwohill, County Cork, with a community-centre training base and documented introductory activity for teenage girls.",
    biography: [
      "Carraig Mhór AC is based in Carrigtwohill, County Cork, Ireland. Athletics Ireland lists it as a mixed club, and Cork Athletics identifies Carrigtwohill Community Centre as its training location. It is a separate club from Carraig na bhFear AC and should not be confused with similarly named Cork organisations.",
      "Cork Sports Partnership's 2026 introductory athletics programme included Carraig Mhór, with a six-week teenage-girls course scheduled to start at the community centre on 24 April. The programme emphasised running fundamentals, confidence and supportive coached participation. That dated course illustrates local activity; it is not a promise of an ongoing Friday class.",
      "For current ages, sessions and places, contact the club through the email and Facebook page published by Cork Athletics. Athletics Ireland also provides its membership route. A founding year and notable former members remain unconfirmed in the opened sources, so no history or athlete associations are inferred from the directory listing alone."
    ],
    sources: [{ title: "County-board club and training listing", url: "https://www.corkathletics.org/clubs/172-carraig-mhor-a-c.html" }, { title: "Athletics Ireland club record", url: "https://membership.athleticsireland.ie/clubpage/Carraig_Mhór_A.C." }, { title: "Dated introductory programme", url: "https://corksports.ie/latest-news/teenage-girls-intro-to-athletics-programmes-2026/" }],
    reviewed_at: "2026-10-15",
    location_note: "Carrigtwohill Community Centre is the county board's published training venue. Ask the club for the current timetable.",
    corrections: { city: "Carrigtwohill", address: "Carrigtwohill Community Centre, Carrigtwohill, County Cork", postcode: "T45 X3N1", address_kind: "training" }
  }
};
