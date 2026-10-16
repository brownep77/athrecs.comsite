import type { ClubProfile } from "./club-profiles";

// Official club pages, governing-body listings and first-person accounts opened 15 October 2026.
export const regionalCommunityAndTrainingProfiles: Record<string, ClubProfile> = {
  "liverpool-running-club": {
    summary: "Liverpool Running Club developed from a local meeting in 1984 and offers paced group training from the Jeffrey Humble Ground, with additional Kirkby track sessions.",
    biography: [
      "Liverpool Running Club grew from a 1984 newspaper invitation by Charlie McKenna, which brought prospective runners together at Albion House Sports Centre in Everton. The first recorded committee minutes date from 1985, when the club formally adopted its name and affiliated. Its familiar blue-and-white hoops followed later in the decade.",
      "The club now trains from the Jeffrey Humble Ground in Liverpool, England, with Tuesday and Thursday groups and an additional Thursday track option at Kirkby High School. Different squads cater for different paces and distances, from newcomers to runners preparing for marathons. The old Walton Hall Park base belongs to its history rather than the current joining instructions.",
      "The minimum joining age is sixteen. First-time visitors are asked to arrive early, introduce themselves at registration and discuss their running experience so they can be placed in a suitable group. The contact form and official Facebook page provide ways to confirm arrangements before a first session; check any current session charge with the club."
    ],
    founded_year: 1985,
    notable_members: [{ name: "Charlie McKenna", connection: "Founding organiser", detail: "The club history credits McKenna's 1984 newspaper advertisement with bringing together the group from which Liverpool Running Club developed." }],
    sources: [{ title: "Club origins and formal establishment", url: "https://www.liverpoolrunningclub.com/about/history/" }, { title: "Current training locations", url: "https://www.liverpoolrunningclub.com/" }, { title: "New-member age and first visit", url: "https://www.liverpoolrunningclub.com/training/new-members/" }],
    reviewed_at: "2026-10-15",
    location_note: "Jeffrey Humble is the current group-run base; the Thursday track option uses Kirkby High School.",
    corrections: { address_kind: "training" }
  },
  "leeds-university-ac-and-cc-club": {
    summary: "Leeds University athletics combines track and field, distance running and cross-country partnerships with student training and an active social programme.",
    biography: [
      "Leeds University AC and CC Club serves student athletes in Leeds, West Yorkshire, England. The athletics club traces its origins to 1904 and welcomes both experienced competitors and students trying the sport. Its programme includes track work, strength and conditioning, longer runs and hills, with links to the university's cross-country club.",
      "Track sessions use the John Charles Centre for Sport, with students meeting on campus before travelling together. Other sessions use Cromer Terrace and locations around the city. The students' union address is an administrative base, not an athletics track or the start of every run.",
      "The club's union page and social channels explain membership, sign-ups and the changing weekly timetable. Some sessions require advance registration or are limited to members already signed up. Give It a Go events offer an introduction, while weekly socials help newcomers find friends alongside training partners."
    ],
    founded_year: 1904,
    sources: [{ title: "Official club introduction and origins", url: "https://linktr.ee/uol_athletics" }, { title: "Students' union club page and training", url: "https://engage.luu.org.uk/groups/WRV/athletics" }],
    reviewed_at: "2026-10-15",
    location_note: "Lifton Place is the students' union address; training takes place at the track and several other venues.",
    corrections: { address_kind: "correspondence" }
  },
  "leicester-triathlon-club": {
    summary: "Leicester Triathlon Club, known as the Zebras, has brought swimmers, cyclists and runners together since 1983, with pool coaching and seasonal outdoor sessions.",
    biography: [
      "Leicester Triathlon Club was formed in 1983 in Leicester, England. Known as the Zebras, it welcomes novices alongside experienced long-distance and age-group competitors. Members can develop across swimming, cycling and running, with club links to local road-running and cross-country leagues as well as multisport competition.",
      "The year-round programme includes coached swimming at Braunstone Leisure Centre. Summer activity adds open-water sessions at King Lear Lake in Watermead Country Park; winter options include indoor cycling at Enderby and social running at Victoria Park. The club's 2026 membership account identifies former professional triathlete Craig Twigg as its swim coach.",
      "A free Thursday pool taster gives prospective members a way to meet the club. Joining and renewal are handled through EntryCentral, with Teamo used for session bookings and payments. Full and lake-only memberships serve different needs, so check the relevant option and seasonal availability before attending."
    ],
    founded_year: 1983,
    notable_members: [{ name: "Craig Twigg", connection: "Swim coach in the 2026 club programme", detail: "The club's own 2026 membership description identifies Twigg as a former professional triathlete and its pool-session coach." }],
    sources: [{ title: "Club origins and introduction", url: "https://leicestertriathlonclubtest.weebly.com/" }, { title: "Seasonal training", url: "https://leicestertriathlonclubtest.weebly.com/training.html" }, { title: "Club-authored 2026 membership information", url: "https://www.entrycentral.com/leicestertriathlonclub" }],
    reviewed_at: "2026-10-15",
    location_note: "Swimming, cycling and running use different venues; Braunstone is the regular pool venue.",
    corrections: { website: "https://leicestertriathlonclubtest.weebly.com/", address: "Braunstone Leisure Centre, Leicester", postcode: "", address_kind: "training" }
  },
  "leigh-on-sea-striders": {
    summary: "Leigh-on-Sea Striders offers road, cross-country and track running around Leigh, Chalkwell and Southend, with coached groups and a lively social calendar.",
    biography: [
      "Leigh-on-Sea Striders was founded in 2002 in Essex, England. The club brings together runners around Leigh-on-Sea and Chalkwell, from people returning to exercise to experienced racers. Members compete over distances from short local events to ultramarathons, with road, cross-country and track activity all represented.",
      "The programme published from September 2026 uses Ridgeway Gardens for Monday social groups, Garon Park for Wednesday track training and Marine Parade for Friday morning runs. Sessions are adapted for different pace groups. Club championships, the Leigh 10K and social events provide further ways to get involved.",
      "Standard joining options are for adults aged eighteen and over, including first-claim, second-claim and non-running social membership. Applications from sixteen- and seventeen-year-olds are considered individually. Email the membership secretary before a trial session or to discuss the appropriate membership; the general welcome to younger runners is not automatic admission."
    ],
    founded_year: 2002,
    sources: [{ title: "Club introduction and foundation", url: "https://leighonseastriders.co.uk/" }, { title: "Training from September 2026", url: "https://leighonseastriders.co.uk/training/" }, { title: "Membership ages and trials", url: "https://leighonseastriders.co.uk/join-the-club/" }],
    reviewed_at: "2026-10-15",
    location_note: "Meeting points vary by session; the published September 2026 schedule replaces the old Chalkwell Station start.",
    corrections: { city: "Leigh-on-Sea", address: "", postcode: "", sports: ["Running", "Athletics"] }
  },
  "leighton-buzzard-athletic-club": {
    summary: "Leighton Buzzard Athletic Club has supported road running, cross-country and track and field in Bedfordshire since 1976, with club races and social training.",
    biography: [
      "Leighton Buzzard Athletic Club was established in 1976 in Leighton Buzzard, Bedfordshire, England. It caters for established athletes and people trying athletics, combining road racing and cross-country with track-and-field opportunities. Club competitions include the Stag Trophy and Langmay Trophy, alongside relays and the Leighton 10.",
      "The senior programme centres on Wednesday and Thursday sessions, generally using Leighton Linslade Leisure Centre and Astral Park respectively. Social meetings after Wednesday training and events through the year are part of club life. New adult runners can try a session before deciding whether to join.",
      "Junior availability needs direct confirmation. The joining page advertises new-starter trials, but the dedicated junior page still states that training was suspended from September 2023 because of a shortage of qualified coaches. Families should email the club rather than assume trials have resumed. The club also invites volunteers to help rebuild its junior offering."
    ],
    founded_year: 1976,
    sources: [{ title: "Club introduction", url: "http://www.leightonbuzzardac.co.uk/" }, { title: "Joining and senior venues", url: "https://www.leightonbuzzardac.co.uk/how-to-join/" }, { title: "Junior suspension notice", url: "https://www.leightonbuzzardac.co.uk/juniors/" }],
    reviewed_at: "2026-10-15",
    contact_note: "Junior joining and training pages conflict; confirm the current provision with the club before attending.",
    location_note: "Senior starts vary between the leisure centre and Astral Park; check the current training notice.",
    corrections: { city: "Leighton Buzzard", address: "", postcode: "" }
  },
  "leighton-buzzard-triathlon-club": {
    summary: "Leighton Buzzard Triathlon Club offers adult swimming, cycling and running, with volunteer coaching, club challenges and a history beginning in 2011.",
    biography: [
      "Leighton Buzzard Triathlon Club began in 2011 in Leighton Buzzard, Bedfordshire, England. Its coaching biographies identify Diane Sandover and Paul Williamson as founder members. The club welcomes adults who enjoy any one of swimming, cycling and running, as well as those combining all three in triathlon.",
      "A programme spread across six days includes pool coaching, road and off-road cycling, indoor turbo work, group runs and track sessions. Volunteer coaches help members build technique and confidence alongside fitness. Coaching itself carries no extra charge, although venue and session costs can apply.",
      "Training camps, club championships, cycle time trials and social events complement the weekly sessions. The current website specifies membership from eighteen years old. Prospective members can use its contact form to arrange an introduction and check the right session, rather than treating the club's leisure-centre address as the location of every activity."
    ],
    founded_year: 2011,
    notable_members: [{ name: "Diane Sandover", connection: "Founder member", detail: "The club's coaching account identifies Sandover as a founder member from 2011 and a qualified coach from 2015." }, { name: "Paul Williamson", connection: "Founder member", detail: "Williamson's first-person club biography describes responding to the 2011 invitation to establish the club and becoming one of four founders." }],
    sources: [{ title: "Current adult club programme", url: "https://lbtri.org.uk/" }, { title: "Training and coaching", url: "https://lbtri.org.uk/training" }, { title: "First-person founder accounts", url: "https://clubspark.net/LBTriClub/Coaching/Ourcoaches" }, { title: "Club contact and base", url: "https://lbtri.org.uk/contact" }],
    reviewed_at: "2026-10-15",
    location_note: "The leisure centre is the published club base; individual sessions use other pools, tracks and outdoor locations.",
    corrections: { website: "https://lbtri.org.uk/", address: "Leighton Leisure and Community Centre, Briggington Way, Leighton Buzzard", postcode: "LU7 3SS", address_kind: "training", adult_only: true }
  },
  "leighton-fun-runners": {
    summary: "Leighton Fun Runners has combined social running, beginner support and club racing in Leighton Buzzard since 1983, including its charity-supporting Leighton 10K.",
    biography: [
      "Leighton Fun Runners began in 1983 as a group of friends in Leighton Buzzard, Bedfordshire, England. Road, trail and cross-country running sit alongside a strong social programme, with members pursuing everything from a first 5K to longer-distance challenges. England Athletics named it East Region Club of the Year in 2022, recognising its welcome, volunteering and community work.",
      "Tuesday club runs offer different paces and distances, with a monthly timed 5K followed by tea and cake. Thursday sessions focus on improvement. Couch to 5K courses provide a separate starting point for complete beginners, who are encouraged to build up before joining regular runs.",
      "Membership is for people aged eighteen and over, despite broader all-ages wording elsewhere on the site. Trial runs can be arranged through the club, and individual England Athletics registration is optional. The public Leighton 10K raises money for a chosen local charity, while club trips, themed runs and social gatherings keep participation varied."
    ],
    founded_year: 1983,
    sources: [{ title: "Club introduction and origins", url: "https://leightonfunrunners.org.uk/" }, { title: "Joining, adult membership and club activity", url: "https://leightonfunrunners.org.uk/how-to-join/" }, { title: "2022 regional award account", url: "https://www.englandathletics.org/news/east-region-volunteer-award-winners-announced/" }],
    reviewed_at: "2026-10-15",
    corrections: { adult_only: true }
  },
  "levenshulme-runners": {
    summary: "Levenshulme Runners is a free, social running community in Manchester, offering a weekly group 5K, optional affiliated membership and access support on request.",
    biography: [
      "Levenshulme Runners brings people together in Levenshulme, Manchester, England. The club describes itself as social, inclusive and adventurous, with members ranging from Couch to 5K participants to ultramarathon runners. Its regular runs are free; optional affiliated membership offers a separate way to support the club and access racing benefits.",
      "The weekly Wednesday social 5K meets at the Quadrants on the Fallowfield Loop. Different pace groups let runners choose a suitable outing, and beginners are welcome without advance sign-up for that session. Many runs finish with an opportunity to socialise locally.",
      "Guide running and British Sign Language support can be requested through the club, rather than assumed to be available at every run. The committee publishes a general enquiry email, and its Facebook group carries activity details and questions from newcomers. Check the advertised arrangements for other sessions and adventures, which can differ from the regular Wednesday run."
    ],
    sources: [{ title: "Weekly running and optional membership", url: "https://levenshulme-runners.nicepage.io/" }, { title: "Club purpose, access and enquiries", url: "https://levenshulme-runners.nicepage.io/About.html" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://levenshulme-runners.nicepage.io/", address_kind: "training" }
  },
  "lewes-ac": {
    summary: "Lewes Athletic Club was founded in 1984 as a community athletics club and offers junior development, track and field, race walking and varied distance running.",
    biography: [
      "Lewes Athletic Club was formed in 1984 when parents and other volunteers met at Lewes Town Hall in East Sussex, England. Peter Masters chaired the first five-person committee. From the outset they wanted an athletics club for different ages and abilities, rather than a running-only organisation; the club colours drew on the town's coat of arms.",
      "Early fundraising established the Lewes Downland 10 and Easter Monday Fun Run. Training progressed from a car park and uneven school grass track to an all-weather track and clubroom. Today's programme includes track and field, race walking, road running, cross-country and outings on the South Downs, alongside beginner courses and social activity.",
      "Adults can try a session or two before joining. The junior academy and specialist event groups have separate admission arrangements, with waiting lists for some academy sections. Families should register their interest and contact the academy team to confirm the appropriate age group and available place. Track bookings and current session instructions should be checked before attending."
    ],
    founded_year: 1984,
    notable_members: [{ name: "Peter Masters", connection: "First committee chair", detail: "The official history identifies Masters as chair of the five-person committee formed at the 1984 Town Hall meeting." }],
    sources: [{ title: "Club history", url: "https://www.lewesac.co.uk/about-us/club-history" }, { title: "Current disciplines and club activity", url: "http://www.lewesac.co.uk/" }, { title: "Adult and junior joining", url: "https://www.lewesac.co.uk/membership/join-us" }],
    reviewed_at: "2026-10-15",
    contact_note: "Some academy age bands and email labels differ between pages; the membership team can confirm the correct junior route.",
    corrections: { address_kind: "training" }
  },
  "lichfield-running-club": {
    summary: "Lichfield Running Club has supported adult running in Staffordshire since 1983, with beginner courses, club competitions and the volunteer-supported Lichfield 10K.",
    biography: [
      "Lichfield Running Club was founded in 1983 by Dave Lawton, Dave Nason, Mike Green and Dave Lewis. Based in Lichfield, Staffordshire, England, it combines regular training with road racing, cross-country and a social programme. The club's yellow vest is worn at local and national events.",
      "Its internal programme includes a Grand Prix ranging from 5K to half-marathon distance, time trials and team events. The club also organises the Lichfield 10K, with members expected to help through marshalling or preparation. Awards evenings and post-training gatherings provide opportunities to meet beyond a run.",
      "Membership is for adults aged eighteen and over. Regular groups expect runners to be able to cover five miles, while separate beginner courses help people build towards that level. Prospective members should email the membership secretary, who can answer questions and book a trial session; course dates and current subscriptions should be confirmed directly."
    ],
    founded_year: 1983,
    notable_members: [{ name: "Dave Lawton", connection: "Co-founder", detail: "Named by the club as one of its four founders in 1983." }, { name: "Dave Nason", connection: "Co-founder", detail: "Named by the club as one of its four founders in 1983." }, { name: "Mike Green", connection: "Co-founder", detail: "Named by the club as one of its four founders in 1983." }, { name: "Dave Lewis", connection: "Co-founder", detail: "Named by the club as one of its four founders in 1983." }],
    sources: [{ title: "Club founders and running programme", url: "http://www.lichfield-running-club.co.uk/" }, { title: "Membership and event volunteering", url: "http://lichfield-running-club.co.uk/membership/" }, { title: "Trial and general enquiries", url: "http://lichfield-running-club.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { adult_only: true }
  },
  "lincoln-and-district-runners": {
    summary: "Lincoln and District Runners offers road and trail group runs around Lincoln and its villages, with paced social groups, structured training and monthly track sessions.",
    biography: [
      "Lincoln and District Runners is a running club in Lincoln, England, with Tuesday and Thursday sessions throughout the year. Its programme mixes structured training with social runs on local roads and trails. Groups regroup along the way, with a stated entry guide of being able to run five miles within an hour.",
      "Most Tuesdays start at North Kesteven Leisure Centre in North Hykeham, but the last Tuesday of the month moves to the LSST athletics track. Thursday starts change with the seasons: winter runs stay around the city, while lighter evenings take members into surrounding villages. The published schedule is therefore more useful than a single fixed meeting address.",
      "Prospective members can try one Tuesday and one Thursday free before joining. The club asks newcomers to send a Facebook message first so someone can welcome them and suggest a group. Membership also includes opportunities in local cross-country leagues, and post-run pub visits form part of the social side."
    ],
    sources: [{ title: "Club programme and meeting locations", url: "https://www.lincolndistrictrunners.co.uk/" }, { title: "Trial sessions", url: "https://www.lincolndistrictrunners.co.uk/Join" }, { title: "Public enquiries", url: "https://www.lincolndistrictrunners.co.uk/Contact" }],
    reviewed_at: "2026-10-15",
    location_note: "North Kesteven is the usual Tuesday start; monthly track nights and Thursday runs use other venues.",
    corrections: { sports: ["Running", "Athletics"], address_kind: "training" }
  },
  "lindley-running-club": {
    summary: "Lindley Running Club meets at Lindley Clock Tower in Huddersfield for social group runs, hill work and intervals, with a published guide to its different pace groups.",
    biography: [
      "Lindley Running Club is based in Lindley, Huddersfield, West Yorkshire, England. Its Tuesday and Thursday programme combines company on local routes with structured opportunities to improve. The club welcomes prospective members for a few sessions before they decide whether its groups suit them.",
      "Lindley Clock Tower is the regular meeting point. Tuesdays include steady outings and a monthly structured session using hills, intervals or tempo work. Thursday Bronze, Silver and Gold groups cover different distances and cater for different abilities, with regroups along the route rather than continuous running at race pace.",
      "The entry guide for the most sociable Bronze group is a 5K in roughly thirty minutes, with typical outings longer than that distance. Newcomers should use the contact form or published club email to discuss their experience and arrival. High-visibility clothing and lights are requested on dark evenings; the current schedule gives the latest session details."
    ],
    sources: [{ title: "Groups, meeting point, trial sessions and contact", url: "https://lindleyrunclub.com/" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "Lindley Clock Tower, Lindley, Huddersfield", postcode: "", address_kind: "training" }
  },
  "lingfield-rc": {
    summary: "Lingfield Running Club combines social road and countryside running, cross-country competition and community fundraising from its Surrey village base.",
    biography: [
      "Lingfield Running Club grew from friends running together in 1983 in Lingfield, Surrey, England. England Athletics' 2024 account distinguishes those beginnings from a formal club launch in 1985. Earlier attempts to establish local athletics in the nineteenth century belong to the village's sporting history, not to an uninterrupted history of today's club.",
      "The Victoria Sports and Social Club on the High Street is its home base. Members run on local roads and countryside routes, with improvement sessions, handicap events and cross-country teams adding competitive options. The Lingfield 10s also supports charitable fundraising, while regular newsletters keep members informed.",
      "The club welcomes adults over eighteen and encourages prospective members to try regular runs before joining. Its membership secretary can explain suitable sessions and current meeting arrangements. Community support is a recurring theme: a 2024 first-person account from then-chair Scott McDonald described mental-wellbeing work and fundraising for Papyrus alongside the running programme."
    ],
    notable_members: [{ name: "Scott McDonald", connection: "Chair interviewed in 2024 and mental-health champion", detail: "England Athletics' March 2024 interview documents McDonald's contribution to the club's wellbeing and community programme; it is not a claim that he remains chair." }],
    sources: [{ title: "Club history, base and running", url: "https://lingfieldrunningclub.co.uk/about-the-club/" }, { title: "Governing-body interview, 12 March 2024", url: "https://www.englandathletics.org/news/lingfield-running-club-putting-community-and-mental-health-at-the-heart/" }, { title: "Current membership and committee contacts", url: "https://lingfieldrunningclub.co.uk/contact-the-club/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://lingfieldrunningclub.co.uk/", adult_only: true, address_kind: "training" }
  },
  "lions-running-community": {
    summary: "Lions Running Community offers free group running around Wheelton, Chorley and Bamber Bridge, with beginner courses and optional athletics affiliation.",
    biography: [
      "Lions Running Community began at Sweatshop in Chorley in 2011 and moved to the Lions in 2017. Based around Wheelton and the wider Chorley area of Lancashire, England, it offers free running sessions through RunTogether. Qualified coaches and run leaders support a programme designed to include different abilities.",
      "Runs use the Golden Lion and Red Lion in Wheelton, Bamber Bridge and other local starts. The programme includes beginner courses, progression runs, longer outings and visits to parkrun. Trained guide runners and mental-health champions are part of the club's support network; contact the organisers to discuss individual arrangements.",
      "The minimum age is twelve, and under-sixteens must be accompanied by an adult throughout. RunTogether bookings help leaders plan sessions and communicate changes, while optional England Athletics affiliation offers a separate membership route. Check the current listing for the meeting point and availability rather than relying on an older beginner-course date."
    ],
    founded_year: 2011,
    sources: [{ title: "Club origins, sessions and participation conditions", url: "https://groups.runtogether.co.uk/Lionsrunningcommunity" }, { title: "Club contact form and Wheelton base", url: "https://clubspark.englandathletics.org/Lionsrunningcommunity/Contact" }],
    reviewed_at: "2026-10-15",
    location_note: "The Golden Lion is a club base, but runs also start in Bamber Bridge and elsewhere; check the session listing.",
    corrections: { address_kind: "training" }
  },
  "liss-runners": {
    summary: "Liss Runners has offered road and trail running around the South Downs since 1986, with social outings, interval sessions and the Harting 10 trail race.",
    biography: [
      "Liss Runners was founded in 1986 in Liss, Hampshire, England, close to the West Sussex border. Members come from Liss, Petersfield, Bordon and nearby villages, sharing access to the South Downs. The club combines social running with road and cross-country leagues, an internal handicap series and its Harting 10 trail race.",
      "Activities include Wednesday intervals, Thursday social runs, longer Sunday outings and torch-lit trails. Summer pub runs and occasional track sessions add variety. Starts range from Newman Collard to Petersfield and Queen Elizabeth Country Park, so members check the calendar and group notices. Sunday long runs and pub runs are explicitly uncoached activities.",
      "Newcomers can try a couple of sessions before joining through Teamo. Under-eighteen membership requires a parent or guardian to belong to the club; twelve- to fifteen-year-olds must also attend with a nominated responsible adult. Sixteen- and seventeen-year-olds have different accompaniment rules. Families should check these arrangements before booking a session."
    ],
    founded_year: 1986,
    sources: [{ title: "Club origins and activities", url: "https://www.liss-runners.org.uk/aboutUs" }, { title: "Training and uncoached sessions", url: "https://www.liss-runners.org.uk/activities" }, { title: "Membership and younger runners", url: "https://www.liss-runners.org.uk/membership" }],
    reviewed_at: "2026-10-15",
    location_note: "Newman Collard is one regular meeting point; trail, social and track sessions may start elsewhere.",
    corrections: { address_kind: "training" }
  },
  "little-baddow-ridge-runners": {
    summary: "Little Baddow Ridge Runners explores the trails and wooded hills near Chelmsford, with adult group running, winter road options and three introductory trial runs.",
    biography: [
      "Little Baddow Ridge Runners is a mixed-ability running club in Little Baddow near Chelmsford, Essex, England. The woods, trails and hills around Little Baddow and Danbury shape its predominantly off-road running. Road outings are also offered during autumn and winter for runners who prefer them in darker conditions.",
      "Tuesday evenings usually provide several leader-led groups, with runs lasting around an hour. Sunday mornings tend towards a longer, sociable off-road outing. Members regroup rather than leave runners behind, and occasional interval sessions add a structured training option. Lights and high-visibility clothing are required for the darker road sessions.",
      "Prospective members can try three runs without an obligation to join. The 2026–27 membership page offers adult and non-running social options and says that under-eighteen membership is not currently available. The membership email and general contact form provide ways to check suitability and meeting arrangements; any future junior provision should be confirmed rather than assumed."
    ],
    sources: [{ title: "Club setting and running", url: "https://littlebaddowridgerunners.org.uk" }, { title: "Weekly training", url: "https://littlebaddowridgerunners.org.uk/training" }, { title: "2026–27 membership and trials", url: "https://littlebaddowridgerunners.org.uk/info/membershipinfo" }, { title: "Club enquiries", url: "https://littlebaddowridgerunners.org.uk/contact" }],
    reviewed_at: "2026-10-15",
    corrections: { adult_only: true }
  },
  "athletics-ireland-artane-beaumont-running-club-a-c": {
    summary: "Artane/Beaumont Running Club is an adult running community in Dublin, combining local training, beginner support and shared trips to longer-distance events.",
    biography: [
      "Artane/Beaumont Running Club serves runners in north Dublin, Ireland. In a March 2026 interview, co-founder David Gilloughley described a club approaching its second birthday, built around company and participation rather than a particular finishing time. Athletics Ireland lists it as a senior-only club with Rockfield Park Tennis Club as a training location.",
      "Gilloughley's account described coached preparation, sessions at ALSAA and local runs, alongside a new Couch to 5K programme. He also recalled trips to Gent and the Antrim Coast Half Marathon and explained plans for a large group to travel to Brescia. Those accounts illustrate the club's social approach without treating a planned trip as proof of every runner's participation.",
      "Prospective members can use the public club email, official Instagram or Athletics Ireland membership page to enquire and join. The March interview is historical context, not a guaranteed current timetable: confirm the appropriate group, meeting point and beginner-course availability before attending."
    ],
    notable_members: [{ name: "David Gilloughley", connection: "Co-founder and chair interviewed in March 2026", detail: "His first-person interview explains the club's community aims, training approach and group travel; the dated role does not establish current office-holding." }],
    sources: [{ title: "First-person co-founder interview, 7 March 2026", url: "https://runrepublic.com/marathons/artane-beaumont-bring-the-craic-to-italy-with-100-runners-taking-on-brescia-marathon" }, { title: "Athletics Ireland club listing", url: "https://membership.athleticsireland.ie/clubpage/Artane/Beaumont_Running_Club_A.C." }, { title: "Official club links", url: "https://linktr.ee/artanebeaumontrc" }],
    reviewed_at: "2026-10-15",
    location_note: "Rockfield Park is the governing-body-listed training location; the club has also described sessions at ALSAA and other local starts.",
    corrections: { city: "Dublin", adult_only: true }
  },
  "athletics-ireland-ballybunnion-running-club-a-c": {
    summary: "Ballybunion Running Club is a senior running club in County Kerry, with community activity including a charity colour-run programme on Ladies Beach.",
    biography: [
      "Ballybunion Running Club, listed by Athletics Ireland as Ballybunnion Running Club A.C., is based in Ballybunion, County Kerry, Ireland. Its governing-body listing provides a local training map reference and an online membership route, and classifies the club as senior-only.",
      "Community fundraising appears in the club's announcement for its August 2026 colour run. The planned programme combined a 5K run, jog or walk with a shorter children's event, starting by the Sea Rescue on Ladies Beach and supporting Scoil Iosagain and Ballybunion Sea and Cliff Rescue. A family-friendly public event is distinct from the age policy for regular club membership.",
      "The Athletics Ireland page provides joining and renewal links. Prospective members should confirm regular training times and the appropriate meeting point with the club; the beach event venue is not assumed to be its everyday base. A founding date and named historical members remain unconfirmed."
    ],
    sources: [{ title: "Athletics Ireland club listing", url: "https://membership.athleticsireland.ie/clubpage/Ballybunnion_Running_Club_A.C." }, { title: "Club-authored 2026 colour-run announcement", url: "https://runrepublic.com/races/5k-colour-fun-run" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Ballybunion", adult_only: true }
  },
  "littledown-harriers": {
    summary: "Littledown Harriers is a Bournemouth running club founded in 1990, combining social running, beginner courses and competition in its distinctive orange colours.",
    biography: [
      "Littledown Harriers was established in 1990 at the newly opened Littledown Sports Centre in Bournemouth, Dorset, England. The club grew from a small group of runners and continues to bring together people running for fitness, company and competition. Its orange kit gives group appearances at races a recognisable identity.",
      "A club championship and the Dorset Road Race League offer competitive targets, while Couch to 5K courses provide an introduction for newer runners. Awards evenings, post-race gatherings and other social events are part of the club's calendar. Its website also records the inaugural SOBO 5 race in July 2026.",
      "All club participation, including beginner courses and Sunday runs, has a minimum age of sixteen. Membership options distinguish affiliated racing, social running and second-claim participation. The contact form and online application provide starting points for enquiries; check the current session and course arrangements before visiting the Littledown base."
    ],
    founded_year: 1990,
    sources: [{ title: "Club origins and minimum age", url: "https://www.littledownharriers.co.uk/about-us/" }, { title: "Membership options", url: "https://www.littledownharriers.co.uk/membership/" }, { title: "Club news", url: "http://www.littledownharriers.co.uk/" }, { title: "Meeting location and contact form", url: "https://www.littledownharriers.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "BH Live Active Littledown, Chaseside, Bournemouth", address_kind: "training" }
  },
  "liverpool-running-bugs": {
    summary: "Liverpool Running Bugs offers social group running in Huyton and structured track sessions in Kirkby, with groups covering different distances and abilities.",
    biography: [
      "Liverpool Running Bugs is a community running club based in Huyton, Knowsley, England. It welcomes people working towards a first race as well as experienced runners, combining coached training with a sociable approach. Members also meet through local parkruns, races and informal outings.",
      "Tuesday groups start at Knowsley Leisure and Culture Park in Huyton. The published programme offers several groups, covering roughly two to eight miles according to pace and distance. Thursday training moves to the floodlit track at Kirkby High School for a structured hour of running.",
      "Prospective members are asked to contact the club before attending a session. Joining is available through the website, with athletics registration described separately from the basic club subscription. Its public contact form and linked social accounts are useful for confirming the right group and start; the two training venues should not be treated as interchangeable."
    ],
    sources: [{ title: "Club introduction and enquiries", url: "https://liverpoolrunningbugs.wixsite.com/bugs" }, { title: "Training groups and locations", url: "https://liverpoolrunningbugs.wixsite.com/bugs/training-days-1" }, { title: "Membership options", url: "https://liverpoolrunningbugs.wixsite.com/bugs/join-the-bugs" }],
    reviewed_at: "2026-10-15",
    location_note: "Huyton is the Tuesday group-run base; Thursday track training takes place at Kirkby High School.",
    corrections: { city: "Huyton", address: "Knowsley Leisure and Culture Park, Longview Drive, Huyton", address_kind: "training" }
  }
};
