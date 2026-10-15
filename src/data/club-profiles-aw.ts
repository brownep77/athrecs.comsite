import type { ClubProfile } from "./club-profiles";

// Primary club pages opened 15 October 2026; unknown history remains unasserted.
export const regionalParticipationPathwaysProfiles: Record<string, ClubProfile> = {
  "meltham-ac": {
    summary: "Meltham AC explores the roads, moors and trails around Meltham, with sociable group training and local road and fell races.",
    biography: [
      "Meltham Athletic Club is based at Meltham Sports and Community Centre in Meltham, West Yorkshire, England. Its routes reach neighbouring villages such as Holmfirth, Marsden, Slaithwaite and Netherthong, making the local hills and countryside an everyday part of club running.",
      "Tuesday groups leave at staggered times to suit different paces and aim to finish together. Thursday outings are generally shorter and more relaxed. Light evenings allow more off-road running; winter routes use roads, including stretches without pavements, so the club asks runners to bring reflective clothing and a headtorch.",
      "Newcomers are asked to attend a Tuesday session first and introduce themselves. The community centre provides showers and space to socialise afterwards. Members can race, improve fitness or contribute as volunteers; the club also organises the Meltham Tough 10K and off-road events. Its low-cost social membership is for involvement off the running course and does not cover participation in club runs."
    ],
    sources: [{ title: "Club programme and base", url: "https://melthamac.com/" }, { title: "First visits", url: "https://melthamac.com/new-members/" }, { title: "Membership distinctions", url: "https://melthamac.com/membership/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Meltham", address_kind: "training" }
  },
  "mendip-athletic-club": {
    summary: "Mendip AC was founded in Street in 2003 to meet demand for junior athletics, with an emphasis on trying events and developing at an individual pace.",
    biography: [
      "Mendip Athletic Club began in July 2003 in Street, Somerset, England, after local organisers identified demand for more junior athletics opportunities. Its first session at Elmhurst School attracted 52 young athletes, and 27 became the club's first members.",
      "The club encourages children to try athletics without expecting everyone to progress at the same speed. Recreational participation and competitive development sit alongside one another. Its published programme places training at Millfield School, with three free taster sessions advertised for prospective members; families should contact the coaching or membership team before attending.",
      "In March 2007, sprinter Jason Gardener agreed to become honorary president. That is a documented honorary association, not a claim that he trained or competed for Mendip. Parent and carer consent and welfare arrangements form part of the junior joining process, and the club publishes separate coaching and membership enquiry addresses."
    ],
    founded_year: 2003,
    notable_members: [{ name: "Jason Gardener", connection: "Honorary president appointed in 2007", detail: "The club's history records Gardener accepting the honorary presidency in March 2007; it does not establish competitive membership." }],
    sources: [{ title: "Foundation and honorary presidency", url: "https://mendipac.org.uk/about/club-history/" }, { title: "Participation and tasters", url: "https://mendipac.org.uk/" }, { title: "Coaching and membership contacts", url: "https://mendipac.org.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Millfield School is the published training venue; confirm the current session and age group before attending.",
    corrections: { city: "Street", address_kind: "training" }
  },
  "mendip-triathlon-and-running-club": {
    summary: "Mendip Triathlon and Running Club brings swim, bike and run training together around Street and Glastonbury, from first-event preparation to longer-distance racing.",
    biography: [
      "Mendip Triathlon and Running Club serves the Street and Glastonbury area of Somerset, England. It welcomes beginners alongside experienced triathletes, with running-only participation also part of its identity. Members train for their first events as well as longer endurance challenges.",
      "The weekly programme includes coached swimming in Millfield's 50-metre pool. Wednesday running alternates between track work at Millfield and sessions around Tor Leisure in Glastonbury. Weekends provide opportunities for social rides and runs, while club gatherings extend the community beyond training and racing.",
      "The coaching team includes head coach Claire Gray, whose club biography records representation of Wales and Great Britain and participation in the 1990 Commonwealth Games triathlon demonstration event. Her international experience is presented as coaching background, not as results earned for Mendip. Use the club's joining link or general enquiry email to confirm a suitable starting session and venue."
    ],
    notable_members: [{ name: "Claire Gray", connection: "Head coach and club secretary", detail: "The club's coaching page identifies Gray in these roles and describes her earlier international triathlon career, including the 1990 Commonwealth Games demonstration event." }],
    sources: [{ title: "Club introduction and enquiries", url: "https://mendiptrc.co.uk/" }, { title: "Weekly training", url: "https://mendiptrc.co.uk/training-calendar/" }, { title: "Coaching backgrounds", url: "https://mendiptrc.co.uk/coaching-team/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training is split between Millfield in Street, Tor Leisure in Glastonbury and outdoor routes; there is no single start for every session.",
    corrections: { city: "Street and Glastonbury", website: "https://mendiptrc.co.uk/", address: "", postcode: "" }
  },
  "mersey-tri": {
    summary: "Mersey Tri has brought swimmers, cyclists and runners together since 1985, with training across Liverpool, Wirral and Sefton and a separate junior programme.",
    biography: [
      "Mersey Tri was formed in 1985 by swimmers, cyclists and runners in Merseyside, England. Its community spans Liverpool, Wirral and Sefton, including first-time triathletes, recreational members and experienced age-group competitors. Triathlon, duathlon and aquathlon sit alongside standalone running, cycling and swimming.",
      "Coached pool sessions, local run groups and seasonal open-water swimming form the training programme. Members also enter cross-country, multi-terrain and cycling time-trial leagues. Club championships, member events and an awards evening provide shared goals without requiring everyone to race at the same level.",
      "The junior section launched in March 2022. Its seven-to-fourteen programme combines bike and run practice at Litherland Sports Park with swimming at Bootle Leisure Centre; children should be able to swim 50 metres front crawl before the swim session. Parents must contact the junior coordinator to arrange a first visit. Older juniors can discuss appropriate adult sessions, while England Athletics registration is an optional addition to club membership."
    ],
    founded_year: 1985,
    sources: [{ title: "Origins and regional activities", url: "https://merseytri.org.uk/" }, { title: "Membership and affiliations", url: "https://merseytri.org.uk/join-the-club" }, { title: "Junior entry and training", url: "https://merseytri.org.uk/tri-stars-youth-training" }, { title: "Enquiry form", url: "https://merseytri.org.uk/contact" }],
    reviewed_at: "2026-10-15",
    location_note: "Sessions take place across Merseyside. The former Harington Green listing is not confirmed as a training venue.",
    corrections: { address: "", postcode: "" }
  },
  "methley-striders": {
    summary: "Methley Striders grew from three founders in 2017 into a community running club, combining Thursday pace groups with trail racing and local volunteering.",
    biography: [
      "Methley Striders was established on 6 April 2017 in Methley, near Leeds in West Yorkshire, England. Around fifteen local runners attended the first session. The club has developed around a commitment to supporting different abilities, including runners interested mainly in friendship rather than competition.",
      "Thursday runs begin at Methley Working Men's Club on Pinfold Lane, with several distance and pace groups published in the members' app. Trail outings, headtorch runs and Couch to 5K courses add variety. Members can also take part in the West Yorkshire Winter League, a club grand prix and veterans' events.",
      "Community work includes litter-picking with Methley Wombles and planting with Methley in Bloom. The club records recognition for its community project at the 2023/24 regional England Athletics volunteer awards. Prospective members should email to register for a trial; first-claim, second-claim and social memberships have different competition and affiliation benefits."
    ],
    founded_year: 2017,
    sources: [{ title: "Origins and community projects", url: "https://methleystriders.co.uk/" }, { title: "Training and leagues", url: "https://methleystriders.co.uk/what-we-offer/" }, { title: "Registered trials and membership", url: "https://methleystriders.co.uk/come-join-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Methley", website: "https://methleystriders.co.uk/", sports: ["Running"], address_kind: "training" }
  },
  "metros-rc": {
    summary: "Metros Running Club serves Harrow and its neighbouring districts with road runs, run-walk groups, track sessions and sociable weekend training.",
    biography: [
      "Metros Running Club is rooted in the Harrow area of north-west London, England, serving places including Pinner, Eastcote, Rayners Lane, Stanmore and Northwood Hills. Its programme caters for different ambitions, from regular exercise and conversation to structured work towards a running goal.",
      "Sessions range from easy outings and run-walk groups to hill repetitions, core work and track training. Eastcote runs offer a chance to stay for a drink at the tennis club afterwards, while Roxbourne Park sessions combine exercise with refreshments. A monthly distance series and 5K challenges provide further opportunities to measure progress.",
      "Exact meeting points, leaders and arrangements are shared through Spond. New members can enquire by email or use the public contact form to find an appropriate group and pace. Training is spread across several venues, so the old Edgware correspondence listing should not be used as a universal meeting point. The club also organises the Harrow Hill 10K."
    ],
    sources: [{ title: "Local coverage and club event", url: "https://metros.org.uk/" }, { title: "Training options and Spond", url: "https://metros.org.uk/training/" }, { title: "Membership", url: "https://metros.org.uk/memberships/" }, { title: "Enquiries", url: "https://metros.org.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Metros uses venues around Harrow and neighbouring districts; confirm the meeting point in Spond or through the club.",
    corrections: { city: "Harrow", address: "", postcode: "" }
  },
  "mickey-bushell-gold-standard-academy": {
    summary: "Mickey Bushell Gold Standard Academy offers wheelchair racing coaching alongside a separate everyday wheelchair-skills programme serving Telford and Shropshire.",
    biography: [
      "Mickey Bushell Gold Standard Academy developed in Telford and Shropshire, England, around practical support for wheelchair users. Its skills programme was conceived in summer 2021, with the first course opening in early 2022. The athletics division followed in summer 2023 and registered with England Athletics in January 2024.",
      "The academy is led by Mickey Bushell, the London 2012 Paralympic T53 100-metre champion. Athletics coaching covers wheelchair racing technique, track work and strength training, tailored to both new and established racers. His medal-winning career predates the academy and is coaching background rather than an academy result.",
      "Everyday wheelchair-skills courses are a separate pathway, covering practical indoor and outdoor tasks as well as fitness and confidence. Prospective participants should use the enquiry form or academy email to discuss the right course, coaching arrangements and venue. A dated skills-day notice should not be assumed to advertise the next available course."
    ],
    founded_year: 2023,
    notable_members: [{ name: "Mickey Bushell", connection: "Academy leader and coach", detail: "The academy identifies Bushell as its coach and records his London 2012 Paralympic T53 100-metre gold; this achievement predates the athletics club." }],
    sources: [{ title: "Athletics division and registration", url: "https://mickeybushell.com/athletics-coaching" }, { title: "Earlier skills programme", url: "https://mickeybushell.com/wheelchair-skill-training" }, { title: "Coaching team", url: "https://mickeybushell.com/about-your-coaches" }, { title: "Bushell's sporting background", url: "https://mickeybushell.com/" }, { title: "Public enquiries", url: "https://mickeybushell.com/contact" }],
    reviewed_at: "2026-10-15",
    location_note: "The academy describes its service area as Telford and Shropshire. The governing-body listing gives Rowley Park in Stafford; confirm the venue for the particular course or athletics session."
  },
  "mickleover-running-club": {
    summary: "Mickleover Running Club offers adult social and competitive running in Derby, with regular pub-based group runs, trail nights and beginner courses.",
    biography: [
      "Mickleover Running Club brings adults together in Mickleover, Derby, England, for running that can be social, fitness-focused or competitive. Members take part in everything from local parkruns to ultramarathons, while the club also offers free Couch to 5K courses for beginners and people returning after a break.",
      "Ordinary Tuesday and Thursday runs start outside The Masons. The first Tuesday of the month is a trail-running night, so its meeting arrangements should be checked separately. Weekly pace groups are published on social media; the regular club-run page lists a range of approximately 7:30 to 10:30 minutes per mile, distinct from the beginner course.",
      "Before a first run, complete the pre-registration form and contact the run coordinator. First-claim membership includes England Athletics registration, while second-claim and social options serve different needs. The website explains the competition restrictions for each option so newcomers can choose according to how they intend to train and race."
    ],
    sources: [{ title: "Club and beginner programme", url: "https://www.mickleoverrunningclub.co.uk/" }, { title: "First-visit registration", url: "https://www.mickleoverrunningclub.co.uk/mickleover-running-club-new-to-the-club.html" }, { title: "Pace groups and trail exception", url: "https://www.mickleoverrunningclub.co.uk/mickleover-running-club-club-runs.html" }],
    reviewed_at: "2026-10-15",
    corrections: { address_kind: "training" }
  },
  "mid-essex-casuals": {
    summary: "Mid Essex Casuals combines road, cross-country, fell and trail running with event organising, relay teams and practical countryside volunteering.",
    biography: [
      "Mid Essex Casuals is an Essex running club in England whose programme brings people together at events rather than revolving around one fixed training base. It welcomes runners with different levels of experience, including second-claim members who also belong to another club.",
      "Road, cross-country, fell, track and trail events all feature. The club enters winter cross-country leagues and relays and organises its own trail and cross-country races. Members share travel to events and help one another participate, with the events diary setting out where to meet.",
      "The social programme includes novelty orienteering and gatherings, while footpath-maintenance parties contribute to the routes runners use. The club reports substantial charitable fundraising over the years. Contact the membership secretary about joining, or the events secretary about races; club membership and individual England Athletics registration are separate charges. The Braintree-area directory address is not established as a training venue."
    ],
    sources: [{ title: "Club activities and membership", url: "https://www.midessexcasuals.org.uk/club_info.html" }, { title: "Public contacts and community activity", url: "https://www.midessexcasuals.org.uk/main.html" }],
    reviewed_at: "2026-10-15",
    location_note: "Members meet at the locations in the events diary; no fixed training start is asserted from the Black Notley directory address.",
    corrections: { city: "Braintree", website: "https://www.midessexcasuals.org.uk/", address: "", postcode: "" }
  },
  "mid-sussex-triathlon-club": {
    summary: "Mid Sussex Triathlon Club offers year-round swim, bike and run coaching around Haywards Heath and Burgess Hill, with seasonal swimming at Ardingly Reservoir.",
    biography: [
      "Mid Sussex Triathlon Club serves Haywards Heath, Burgess Hill and the surrounding West Sussex area of England. Its members range from people preparing for a first triathlon to experienced age-group competitors. The published programme includes participants from sixteen upwards and welcomes para-triathletes.",
      "Qualified coaches lead indoor swimming, cycling and running through the year. Summer open-water sessions use Ardingly Reservoir, providing a separate setting for developing swim confidence and endurance. The club organises the public Mid Sussex Triathlon and Aquabike event as well as multisport events for members and invited guests.",
      "Prospective members are invited to enquire about a Thursday training session and complete the relevant registration. The website provides session booking and a contact form with topics for membership, coaching and open-water swimming. Training takes place at several venues, so the Scaynes Hill street address previously listed should not be treated as a place to arrive for every activity."
    ],
    sources: [{ title: "Club and training area", url: "https://www.midsussextriclub.com/" }, { title: "Membership", url: "https://www.midsussextriclub.com/the-club/membership/" }, { title: "Enquiry routes", url: "https://www.midsussextriclub.com/the-club/contact-us/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training is mainly in Haywards Heath and Burgess Hill, with seasonal open-water sessions at Ardingly Reservoir. Confirm the venue when booking.",
    corrections: { city: "Haywards Heath and Burgess Hill", county: "West Sussex", address: "", postcode: "" }
  },
  "middlesbrough-and-cleveland-harriers": {
    summary: "Middlesbrough and Cleveland Harriers offers road, grass, cross-country and track training, with seasonal venues and a social run paced to the slowest participant.",
    biography: [
      "Middlesbrough and Cleveland Harriers is a long-established running club serving Middlesbrough and the wider Teesside area of England. It welcomes runners of different abilities and combines sociable outings with structured training for distances from 5K to the marathon.",
      "Monday social runs keep the group together at the slowest runner's pace. Tuesday sessions use parks and quieter roads, while Thursday speedwork changes with the season: Acklam Rugby Club fields in winter and Foxes Wood at Mandale Meadow in summer. Cross-country and grass sessions may also take place on Sundays when there is no club race.",
      "The club advertises a monthly session at Middlesbrough Sports Village track, where admission is charged separately from membership. Use the public contact form to confirm the appropriate group and meeting point. Its current site gives conflicting historical dates in the header and introduction, so a precise founding year remains unresolved rather than being presented as settled history."
    ],
    sources: [{ title: "Club introduction", url: "https://mcharriers.connectmyclub.co.uk/" }, { title: "Seasonal training", url: "https://mcharriers.connectmyclub.co.uk/training" }, { title: "Club contact form", url: "https://mcharriers.connectmyclub.co.uk/contact" }],
    reviewed_at: "2026-10-15",
    location_note: "Training uses several Middlesbrough-area venues. The former Thornaby street listing is not confirmed as a training start.",
    corrections: { city: "Middlesbrough", website: "https://mcharriers.connectmyclub.co.uk/", address: "", postcode: "" }
  },
  "middlesbrough-athletic-club-mandale": {
    summary: "Middlesbrough Mandale AC was founded in 1975 and develops track-and-field athletes from age eight at Middlesbrough Sports Village.",
    biography: [
      "Middlesbrough Mandale Athletics Club was founded in 1975 and is based at Middlesbrough Sports Village in Teesside, England. Track-and-field development is central to its programme, with sprinting, endurance running, jumps and throws offered in a supportive club setting.",
      "Younger athletes follow a multi-event pathway so they can discover their strengths before specialising. More experienced members develop their chosen events with the coaching team and take part in local and regional competition. The club welcomes athletes from eight years old and asks prospective members to make contact before a taster session is arranged.",
      "Its history includes former athletes Richard Kilty and Chris Tomlinson, who went on to Olympic competition. The club also records Charlie Myers becoming British pole-vault champion in 2018 while representing Mandale, and Charlotte Kelsey's selection for the 2023 European Under-23 Championships. These dated associations do not establish anyone's present membership."
    ],
    founded_year: 1975,
    notable_members: [{ name: "Richard Kilty", connection: "Former athlete", detail: "The club identifies Kilty as a former athlete who went on to Olympic relay competition." }, { name: "Chris Tomlinson", connection: "Former athlete", detail: "The club identifies Tomlinson as a former athlete who went on to compete in the Olympic long jump." }, { name: "Charlie Myers", connection: "Club representative in 2018", detail: "The club records Myers winning the 2018 British pole-vault title while representing it." }, { name: "Charlotte Kelsey", connection: "Club representative in 2023", detail: "The club records Kelsey representing Great Britain at the 2023 European Under-23 Championships while a Mandale athlete." }],
    sources: [{ title: "Foundation, development and past athletes", url: "https://middlesbroughmandaleac.co.uk/" }, { title: "Membership enquiries and venue", url: "https://middlesbroughmandaleac.co.uk/contact/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://middlesbroughmandaleac.co.uk/", address_kind: "training" }
  },
  "middleton-harriers-ac": {
    summary: "Middleton Harriers offers road, fell and cross-country running from Middleton Arena, with beginner courses and a history rooted in the marathon boom.",
    biography: [
      "The present Middleton Harriers grew from Middleton Fitness Club during the 1980s marathon boom in Greater Manchester, England. Its own history distinguishes this club from earlier groups bearing the Harriers name. Pack runs and a lively social programme helped the new organisation develop, and it created the Moonraker Half Marathon.",
      "After moving to Hopwood Hall in 1996, the club eventually returned to Middleton when the Arena became available. Today its programme includes road running, cross-country and fell racing, with Couch to 5K for beginners and people returning to running.",
      "Training is spread between Middleton Arena, Heaton Park, Boggart Hole Clough track and changing fell venues. Newcomers are encouraged to try a few sessions before joining and should check the current weekly arrangements. Eddie's Revenge, the Hopwood Trot and the club handicap are among its own events, alongside opportunities to race as a team."
    ],
    sources: [{ title: "History and successive clubs", url: "https://middletonharriers.uk/our-history/" }, { title: "Current sessions and participation", url: "https://middletonharriers.uk/" }, { title: "Enquiries", url: "https://middletonharriers.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Middleton Arena is the principal base; hill, track and fell sessions use other venues. Club pages differ on the Arena postcode, so confirm travel details directly.",
    corrections: { address_kind: "training" }
  },
  "midland-masters-ac": {
    summary: "Midland Masters AC is a regional athletics club for people aged 35 and over, linking members with road, track, field, cross-country and race-walking competition.",
    biography: [
      "Midland Masters Athletic Club was founded as Midland Veterans AC in October 1971 and adopted its current name in 2006. It is an area club within the British Masters Athletic Federation, serving a broad part of England from around Derby to Bristol while accepting members from elsewhere.",
      "The club organises championships, handicaps, relays and social events and helps members access masters competition nationally and internationally. Its programme spans road running, track and field, cross-country and race walking. A regular newsletter shares club activity and forthcoming opportunities.",
      "Membership is open from age thirty-five, including people who already belong to another athletics club and those making Midland Masters their first-claim club. Online applications use the masters OpenTrack system, with eligibility checks completed by the club. The membership secretary can explain the options; the published Burton-on-Trent officer address is correspondence information, not a regional training headquarters."
    ],
    founded_year: 1971,
    sources: [{ title: "Origins and regional role", url: "https://midlandmasters.com/" }, { title: "Joining and eligibility", url: "https://midlandmasters.com/about-us/how-to-join/" }, { title: "Officer contacts", url: "https://midlandmasters.com/about-us/officers-contacts-2/" }],
    reviewed_at: "2026-10-15",
    location_note: "An English regional masters club, not a single-venue training group. The Burton-on-Trent address is an officer's correspondence address.",
    corrections: { address_kind: "correspondence" }
  },
  "mikkeller-running-club-liverpool": {
    summary: "Mikkeller Running Club Liverpool combines sociable 5K outings with optional affiliated competition and fundraising for local charity Love, Jasmine.",
    biography: [
      "Mikkeller Running Club Liverpool began in 2015 in Liverpool, England, and celebrated its tenth anniversary in 2025. It is a local chapter of the wider Mikkeller running community, linked by a shared enthusiasm for running and social time afterwards. The Liverpool chapter remains a locally based club, not a worldwide training venue.",
      "Social runs cover about 5K with leaders supporting different paces. Midweek outings use Sefton Park or city-centre starts during the published February-to-November programme, and the first Saturday of each month brings a larger social gathering. Participants can choose a soft drink as well as beer afterwards, and friends and family are welcome at the social part.",
      "Casual participation is free after registration. An optional England Athletics-affiliated membership opens further competition opportunities and structured training. The club introduced the Liverpool Mile in 2026 and supports Love, Jasmine through fundraising events. Check current announcements for the meeting point rather than assuming every run starts at Black Lodge."
    ],
    founded_year: 2015,
    sources: [{ title: "Origins, membership, runs and charity partnership", url: "https://mrcliverpool.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "Liverpool is the club's home. Run starts vary between park and city-centre venues; Black Lodge is not the meeting point for every outing."
  },
  "mile-shy-club": {
    summary: "MileShyClub is a Greater Manchester charity offering beginner running, walking and wellbeing groups, with local sessions across several boroughs.",
    biography: [
      "MileShyClub was established in 2017 by Jane Dennison and has grown into a charity working across Trafford, Salford, Stockport and Manchester, England. It focuses on people who are new to exercise or unsure about joining a running group, helping them build confidence through shared activity.",
      "Couch to 5K courses lead into sociable 5K groups, with further distance development available at selected locations. Walking groups, including accessible indoor activity at the Trafford Centre, provide other ways to take part. Wellbeing support groups and the Sale Santa Dash extend its work beyond ordinary weekly runs.",
      "New runners complete the sign-up form before their first session and pay as they attend. Once registered, they can move between local groups to suit their schedule. Beginner intakes outside the main courses depend on coaching capacity. The website allows under-sixteens with an accompanying adult and a separate form; confirm the relevant group's arrangements rather than relying on the older adult-only directory label."
    ],
    founded_year: 2017,
    notable_members: [{ name: "Jane Dennison", connection: "Founder and chief executive", detail: "MileShyClub's own account identifies Dennison as founder and CEO and dates the organisation's beginnings to 2017." }],
    sources: [{ title: "Origins and community provision", url: "https://www.mileshyclub.com/about-us" }, { title: "Joining, children and local groups", url: "https://www.mileshyclub.com/faq" }, { title: "Public contact", url: "https://www.mileshyclub.com/" }],
    reviewed_at: "2026-10-15",
    location_note: "The Swinton listing represents one local group within a wider Greater Manchester programme; choose a location on the club website before travelling.",
    corrections: { adult_only: false }
  },
  "mk-lakeside-runners": {
    summary: "MK Lakeside Runners offers friendly running around Milton Keynes, with beginner support, technical sessions and seasonal meeting points near Willen.",
    biography: [
      "MK Lakeside Runners is a sociable running club in Milton Keynes, Buckinghamshire, England. Members train for distances from 5K to marathons and ultras, supported by volunteer coaches and run leaders. Beginners and runners seeking regular company are part of the same community.",
      "The published autumn and winter programme, starting in September 2026, uses Japonica Lane in Willen for Tuesday and Thursday evenings. Tuesdays concentrate on runs and Thursdays on technique, with a Wednesday morning social outing and additional weekend routes. Summer and occasional away-run meeting points differ, so members should check announcements before travelling.",
      "Joining options separate social running from membership with England Athletics registration. Use the membership email or online enquiry form to arrange a start. The club's Hall of Fame recognises long-standing member David 'Foxy' Bayley, founder of Enigma Running, and records his 2026 Team Edwards Lifetime Achiever award. That dated recognition is not a live tally of his races."
    ],
    notable_members: [{ name: "David Bayley", connection: "Long-standing member recognised by the club", detail: "The club's Hall of Fame describes 'Foxy' Bayley's association, Enigma Running work and May 2026 Team Edwards Lifetime Achiever award; changing marathon totals are not reproduced." }],
    sources: [{ title: "Current club", url: "https://mklr.club/" }, { title: "Seasonal starts and membership", url: "https://mklr.club/about-us/" }, { title: "Joining form", url: "https://mklr.club/join-us-membership-enquiry/" }, { title: "David Bayley association", url: "https://mklr.club/hall-of-fame-foxy-david-bayley/" }],
    reviewed_at: "2026-10-15",
    location_note: "Japonica Lane in Willen is the published autumn/winter 2026 start. Summer and away sessions differ; the former Northampton address is not a training venue.",
    corrections: { city: "Milton Keynes", county: "Buckinghamshire", website: "https://mklr.club/", address: "Japonica Lane car park, Willen, Milton Keynes", postcode: "", address_kind: "training" }
  }
};
