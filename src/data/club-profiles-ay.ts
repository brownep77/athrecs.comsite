import type { ClubProfile } from "./club-profiles.ts";

// Official club pages opened 15 October 2026; editorial connections do not create athlete identities.
export const regionalClubContinuityProfiles: Record<string, ClubProfile> = {
  "newcastle-staffs-ac": {
    summary: "Newcastle (Staffs) Athletic Club combines a floodlit track and clubhouse in Newcastle-under-Lyme with coached running for juniors, beginners and experienced competitors.",
    biography: [
      "Newcastle (Staffs) Athletic Club was founded in 1964 in Staffordshire, England. It welcomes runners and athletes with different ambitions, from getting started to competing for a team, and offers junior participation from eight years old.",
      "The club is based on Ashfields New Road in Newcastle-under-Lyme, where a floodlit track and athletics equipment support coached sessions. Changing rooms, showers and a clubhouse café make it possible to stay after training and meet people from other groups. Many track and junior groups train on Tuesdays and Thursdays.",
      "Beginners can ask about the Couch to 5K programme, while more experienced runners can discuss a suitable group with the coaches. The club's event programme includes the Newcastle 10K and Dales Dash. Use the committee enquiry address before a first visit; the Newcastle-under-Lyme clubhouse is distinct from the former Stoke-on-Trent directory address."
    ],
    founded_year: 1964,
    sources: [{ title: "Club origins and approach", url: "http://newcastlestaffsac.org.uk/information/who-we-are/" }, { title: "Track and clubhouse", url: "http://newcastlestaffsac.org.uk/information/where-are-we-based/" }, { title: "Junior entry and activities", url: "http://www.newcastlestaffsac.org.uk/" }, { title: "Public enquiries", url: "http://newcastlestaffsac.org.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Newcastle-under-Lyme", county: "Staffordshire", address: "Newcastle (Staffs) Athletic Club, Ashfields New Road, Newcastle-under-Lyme", postcode: "ST5 2DJ", address_kind: "training" }
  },
  "newcastle-university-ac": {
    summary: "Newcastle University Athletics and Cross Country brings student track-and-field and endurance runners together for term-time coaching, BUCS competition and the Cowbell 5K.",
    biography: [
      "Newcastle University Athletics and Cross Country is open to Newcastle University students in Newcastle upon Tyne, England. Its cross-country roots reach back to the 1960s team known as the Waders; the athletics club followed in the 1970s. Those separate beginnings are not reduced to a single precise founding year.",
      "The programme covers athletics disciplines and distances, welcoming social and fitness runners alongside competitors. Teams enter BUCS cross-country, indoor athletics and outdoor track-and-field events. The club also organises the Cowbell 5K on Newcastle's Town Moor.",
      "Term-time training uses Gateshead's outdoor track, the university sports centre and Newcastle parks. The published schedule combines track work, group runs, threshold sessions and a longer Sunday outing; strength and conditioning requires the appropriate pass. Prospective students can email the committee, and members should check captains' updates for current meeting points rather than treating the university address as every session's start."
    ],
    sources: [{ title: "Student club history and eligibility", url: "https://www.societies.ncl.ac.uk/nuaxc/club-history/" }, { title: "Term-time sessions", url: "https://www.societies.ncl.ac.uk/nuaxc/training/" }, { title: "Cowbell 5K and committee contact", url: "https://www.societies.ncl.ac.uk/nuaxc/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training uses Gateshead Outdoor Track, Newcastle University Sports Centre and local parks. The timetable is term-time only; confirm each session with the captains."
  },
  "newent-runners": {
    summary: "Newent Runners offers coached Wednesday sessions, informal social runs and a beginner pathway in Gloucestershire, with membership available from seventeen.",
    biography: [
      "Newent Runners is a community running club in Newent, Gloucestershire, England, affiliated to England Athletics. Its programme combines regular group outings, a zero-to-5K beginner course and the club's Newent 9 road race. Membership is available to people aged seventeen and over.",
      "Wednesday is the coached session, using Newent Community School's astroturf in winter and Newent Cricket Club in summer. Other outings are informal social runs, including routes from the library area, a Dymock pub run and Sunday runs. The club makes that distinction clear rather than describing every outing as coached.",
      "Visitors do not need to join before trying a session. Being able to cover 5K is helpful for ordinary runs, since that is generally the minimum distance; complete beginners should enquire about the separate course. Check the club's Facebook updates for routes and changes, and use the membership form when ready to join."
    ],
    sources: [{ title: "Seasonal coaching and social runs", url: "https://newentrunners.com/training/" }, { title: "Membership eligibility", url: "https://newentrunners.com/membership/" }, { title: "Beginner and race programme", url: "https://newentrunners.com/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://newentrunners.com/", adult_only: false },
    location_note: "Wednesday coaching moves between Newent Community School in winter and Newent Cricket Club in summer. Other runs have separate starts; check the current session details.",
    contact_note: "Membership is seventeen-plus. Ordinary social runs generally cover at least 5K; ask about the separate beginner course if needed."
  },
  "newmarket-joggers-ac": {
    summary: "Newmarket Joggers has supported running in Suffolk since 1984, with junior and adult participation, club races, social training and community volunteering.",
    biography: [
      "Newmarket Joggers was established in 1984 in Newmarket, Suffolk, England. The running club predates the incorporation of Newmarket Joggers Ltd in 2019. Its England Athletics-affiliated programme welcomes runners from seven years old and includes people running for fitness, friendship and competition.",
      "Regular training, social outings and club competitions sit alongside events such as the Newmarket Heath Race and Newmarket 10K. Members take part in road, cross-country and track-and-field activities. A monthly RunAndTalk session gives the programme a social focus, while the club's volunteer pledge invites members, friends and local residents to help at its races.",
      "New runners can use the joining page and ask the membership secretary which arrangements fit their age and experience. Separate public addresses cover membership, training and club administration. Check the current session information before attending; the club offers several activities rather than a single universal training group."
    ],
    founded_year: 1984,
    sources: [{ title: "Origins, age range and club structure", url: "https://newmarketjoggers.co.uk/about-us/" }, { title: "Activities and volunteering", url: "https://www.newmarketjoggers.co.uk/" }, { title: "Role contacts", url: "https://newmarketjoggers.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://newmarketjoggers.co.uk/" }
  },
  "newquay-road-runners": {
    summary: "Newquay Road Runners combines coastal club running, beginner sessions and interval training from Newquay Sports Centre, alongside the Newquay and Trevornick 10Ks.",
    biography: [
      "Newquay Road Runners was formed by Ray Moore in 1983 in Newquay, Cornwall, England. The club first met at Newquay AFC's Mount Wise ground before moving to Newquay Sports Centre in 1985. Its original red-and-white colours gave way to black and white in 1996.",
      "Wednesday club runs bring runners together before a social gathering, with winter routes around the town and summer outings along beaches, cliff paths and the surrounding countryside. The wider programme includes easy runs, intervals and a free Introduction to Running group. The club organises the Newquay 10K and Trevornick 10K and supports members exploring cross-country and multisport events.",
      "The beginner group is for people over sixteen, including those who have never run before. Visitors can try club running before deciding whether to become members. Contact the new-runners or membership team, check the latest session details and bring the lighting and visible clothing requested for winter outings."
    ],
    founded_year: 1983,
    notable_members: [{ name: "Ray Moore", connection: "Founder", detail: "The club history credits local runner Ray Moore with forming Newquay Road Runners in 1983." }],
    sources: [{ title: "Club history", url: "https://www.newquayroadrunners.co.uk/about-us" }, { title: "Training and beginner eligibility", url: "https://www.newquayroadrunners.co.uk/training" }, { title: "Public role contacts", url: "https://www.newquayroadrunners.co.uk/contact-us" }],
    reviewed_at: "2026-10-15", corrections: { address_kind: "training" }
  },
  "newton-abbot-ac": {
    summary: "Newton Abbot Athletic Club offers junior and senior athletics in South Devon, with summer training at Forches Cross and a separate winter programme at Teign School.",
    biography: [
      "Newton Abbot Athletic Club was established in 1893 in Newton Abbot, Devon, England. It offers training and competition for juniors from eight years old and older athletes, covering track and field, cross-country and sportshall athletics.",
      "Summer training takes place at Forches Cross playing fields. Younger juniors begin together, while older athletes can work in event groups such as sprints or jumps. In winter, junior indoor sessions move to Teign School and older athletes combine school-based training with outdoor road sessions.",
      "Prospective members can contact the club to find an appropriate age group and complete the published membership form. The training page still contains an older fee example, so confirm current costs and times directly rather than relying on that figure. Teign School is a seasonal training venue, not the location of every session throughout the year."
    ],
    founded_year: 1893,
    sources: [{ title: "Club history and disciplines", url: "http://www.newtonabbotathleticsclub.co.uk/" }, { title: "Seasonal training", url: "https://www.newtonabbotathleticsclub.co.uk/training/" }, { title: "Membership and ages", url: "https://www.newtonabbotathleticsclub.co.uk/membership/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.newtonabbotathleticsclub.co.uk/", address_kind: "training" },
    location_note: "Forches Cross is the summer training base; Teign School is used in winter, with other outdoor meeting points confirmed separately."
  },
  "nidd-valley-road-runners": {
    summary: "Nidd Valley Road Runners is a Harrogate club with road and fell running, paced social groups and a junior section, based at Harrogate Hockey Club.",
    biography: [
      "Nidd Valley Road Runners was formed in 1984 in Harrogate, North Yorkshire, England, during the growth of recreational running. Its gold-and-black colours came from its early base at Harrogate Town FC. The club moved to Harrogate Railway AFC in 1991 and now uses Harrogate Hockey Club as its headquarters.",
      "Tuesday and Thursday runs offer compatible pace groups, including a relaxed social option, alongside coached intervals. Winter outings use the town's roads and Stray parkland, while summer routes explore the Nidd Gorge and Nidderdale Greenway. Pub runs and a Thursday clubhouse gathering add a social side to training.",
      "A junior section began in September 2013 and has separate term-time arrangements. Adults can try a few runs before committing to membership, and the club welcomes road, fell and parkrun interests. Contact the club before a first visit to discuss the most suitable group and confirm the current junior or adult session details."
    ],
    founded_year: 1984,
    sources: [{ title: "Club origins and changing bases", url: "https://www.niddvalleyroadrunners.co.uk/" }, { title: "Training groups and venue", url: "https://niddvalleyroadrunners.co.uk/location-training/" }, { title: "Enquiries", url: "https://niddvalleyroadrunners.co.uk/contact-details/" }],
    reviewed_at: "2026-10-15", corrections: { address: "Harrogate Hockey Club, Ainsty Road, Harrogate", postcode: "HG1 4AP", address_kind: "training", website: "https://niddvalleyroadrunners.co.uk/" }
  },
  "nidderdale-fell-and-trail": {
    summary: "Nidderdale Fell and Trail explores the hills around Pateley Bridge through structured sessions, graded off-road groups, social outings and a canicross section.",
    biography: [
      "Nidderdale Fell and Trail is an England Athletics-affiliated off-road running club based around Pateley Bridge in North Yorkshire, England. Its focus is on enjoying the valley's hills and trails in company, with a dedicated canicross section for people who run with their dogs.",
      "Tuesday training meets at Pateley showground for intervals, hill work or fartlek. Thursday social runs and member-arranged weekend outings explore a wider area, with meeting points and distances varying. The group descriptions distinguish easier outings with walked hills from longer, more demanding runs, helping newcomers choose an appropriate starting point.",
      "Contact the membership team before trying a run and check its terrain, kit and experience requirements. Social outings are explicitly uncoached, and their organisers ask runners to judge suitability and carry appropriate equipment and emergency information. The club also promotes Run Nidderdale, a local 10K trail race, as part of its wider running community."
    ],
    sources: [{ title: "Purpose and canicross", url: "https://nidderdalefellandtrail.org/about/" }, { title: "Groups and safety distinctions", url: "https://nidderdalefellandtrail.org/club-runs/" }, { title: "Showground and contact form", url: "https://nidderdalefellandtrail.org/contact/" }, { title: "Run Nidderdale", url: "https://www.nidderdalefellandtrail.org/" }],
    reviewed_at: "2026-10-15", corrections: { city: "Pateley Bridge", address_kind: "training", website: "https://nidderdalefellandtrail.org/" },
    location_note: "The showground is the Tuesday training base. Social and weekend runs use changing meeting points, confirmed by the organiser."
  },
  "north-bolton-runners": {
    summary: "North Bolton Runners grew from community trail outings into a club offering free weekly runs, run-walk options and coached improvement around Bromley Cross and Egerton.",
    biography: [
      "North Bolton Runners began with community messages and Tuesday trail runs in June 2017 in Bolton, Greater Manchester, England. Monday outings followed, and an April 2018 meeting in Egerton brought the activities together under the club name. Athletics affiliation followed in January 2019.",
      "The weekly programme includes Monday road runs from Dunscar War Memorial, Tuesday trails from the Railway pub in Bromley Cross, a coached Wednesday session at Bradshaw Meadows and an early Friday run. Shorter social groups include walking breaks, while other groups offer longer outings with support from run leaders.",
      "Organised runs are free, and newcomers can try one without buying membership. Introduce yourself to a leader in an orange top and check the latest route information. Optional club membership supports insurance and leader training and offers access to club competition and other benefits; confirm the current membership year before paying."
    ],
    sources: [{ title: "Origins, weekly groups and membership", url: "https://www.northboltonrunners.co.uk/" }],
    reviewed_at: "2026-10-15", corrections: { county: "Greater Manchester", address_kind: "training" },
    location_note: "Dunscar War Memorial is used for Monday and Friday runs. Tuesday and Wednesday sessions meet elsewhere; consult the current programme."
  },
  "north-cotswold-tri-and-run": {
    summary: "North Cotswold Tri and Run combines running from Upper Rissington with swimming, cycling and junior pathways across the northern Cotswolds.",
    biography: [
      "North Cotswold Tri and Run was established in June 2016 in Gloucestershire, England. Affiliated to England Athletics and British Triathlon, it welcomes people who want to race in triathlon, duathlon, running or cycling, as well as those who simply enjoy training with a club.",
      "Running sessions start from the Runner Bean Gym in Upper Rissington, with Tuesday intervals and a varied Thursday programme. The club identifies international distance runner Dennis Walmsley among its coaches. Swimming uses Bourton-on-the-Water Leisure Centre, with open-water sessions at Cotswold Water Park lakes; cycling includes indoor work and arranged group rides.",
      "Adult, youth, junior and family membership routes are published separately. Contact the committee to choose appropriate sessions and confirm their venue, as activities are spread across several sites. Use the club's actual enquiry email or contact form: the generic telephone and sample email displayed in the website template are not club contact details."
    ],
    founded_year: 2016,
    notable_members: [{ name: "Dennis Walmsley", connection: "Coach", detail: "The club's training page identifies international distance runner Dennis Walmsley as its Tuesday running-session coach." }],
    sources: [{ title: "Foundation and multisport training", url: "https://www.northcotswoldtriandrun.co.uk/team" }, { title: "Training locations and committee form", url: "https://www.northcotswoldtriandrun.co.uk/contact" }],
    reviewed_at: "2026-10-15", corrections: { address_kind: "training" },
    location_note: "Upper Rissington is the running-session start; swimming, junior activities and other training use separate venues."
  },
  "north-derbyshire-rc": {
    summary: "North Derbyshire Running Club offers adult road, trail and fell running around Chesterfield, with weekday training, seasonal fell outings and community race involvement.",
    biography: [
      "North Derbyshire Running Club is an adult running club in Chesterfield, Derbyshire, England. It welcomes different paces and ambitions across road, trail, fell and cross-country running, and describes community participation and the social value of running as central to its purpose.",
      "Weekday sessions combine shorter group runs, town-based efforts and track training. Summer brings more off-road routes and evening fell outings, while winter includes Sunday social fell runs. Meeting points change from week to week, so the calendar matters more than any single directory address.",
      "Membership is for people aged eighteen and over, with social, England Athletics first-claim and second-claim options. The club is the official community running club for the Chesterfield Redbrik 10K and promotes its own race programme, including No Walk in the Park. Use the public enquiry email to discuss joining and check the current calendar before attending."
    ],
    sources: [{ title: "Community and races", url: "https://www.northderbyshirerc.co.uk/" }, { title: "Age and membership categories", url: "https://northderbyshirerc.co.uk/our-club/membership" }, { title: "Seasonal sessions", url: "https://northderbyshirerc.co.uk/our-club/club-nights" }],
    reviewed_at: "2026-10-15",
    location_note: "Queen's Park Sports Centre is one meeting point, not a fixed start for every run. Locations vary with the weekly calendar."
  },
  "north-devon-ac": {
    summary: "North Devon Athletic Club trains at Braunton's athletics track, with introductory primary-school groups and event-specific coaching rooted in the former Barnstaple club.",
    biography: [
      "North Devon Athletic Club serves Braunton, Barnstaple and the wider North Devon area in England. Former president Eric Francis's history recalls David Griffiths reviving Barnstaple Athletic Club in 1979 after a period of inactivity, initially using Park School's facilities.",
      "A campaign for a dedicated local track led to the Braunton facility's inaugural meeting in May 1991. The North Devon name reflected the intention to serve the whole area. The club now provides pathways into track and field and cross-country, with primary-school training groups leading towards more specialised event coaching.",
      "Prospective members are invited to visit reception at the track on a training evening and meet an appropriate coach. Older athletes can try different groups before choosing a regular one. Membership includes the track pass, while non-members wishing to use the facility need a separate pass. Ask the volunteer club team about current joining and training arrangements."
    ],
    notable_members: [{ name: "David Griffiths", connection: "Historical coach and club revival", detail: "Eric Francis's club history credits Griffiths with restarting Barnstaple Athletic Club in 1979, before the North Devon name was adopted." }, { name: "Eric Francis", connection: "Former president and historian", detail: "The club publishes Francis's recollections of its development and the Braunton track project, dated 2017." }],
    sources: [{ title: "History by former president Eric Francis", url: "https://www.northdevonac.org/ndac-club-history.html" }, { title: "Joining groups and track passes", url: "https://www.northdevonac.org/how-to-join--membershiptrack-pass-forms.html" }, { title: "Volunteer contacts", url: "https://www.northdevonac.org/contact.html" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.northdevonac.org/", address_kind: "training" }
  },
  "north-east-project": {
    summary: "North East Project offers personalised running coaching across Durham, Newcastle and Teesside, with junior, adult, trail and masters pathways and remote support.",
    biography: [
      "North East Project brings a coaching-led approach to running in north-east England, with in-person sessions around Durham, Newcastle and Teesside. Founder and head coach Kieran Walker leads a programme built around individual goals, available time and ongoing contact with a coach.",
      "Published pathways cover juniors, adult performance, trail running and masters. Training plans are delivered through an app and combine running with strength and conditioning. Group sessions and one-to-one coaching sit alongside remote community support, making participation possible for runners who do not live near the coaches.",
      "New runners can request a two-week trial and a consultation to discuss their aims and suitable support. The club also describes training weekends and camps as part of its community programme. Confirm the location and format of a booked session directly: the Durham directory address is not advertised as the start of every group run."
    ],
    notable_members: [{ name: "Kieran Walker", connection: "Founder and head coach", detail: "The official club and coaching pages identify Walker as founder and head coach." }],
    sources: [{ title: "Coaching philosophy and enquiries", url: "https://www.northeastprojectrun.com/" }, { title: "Pathways, trial and training areas", url: "https://www.northeastprojectrun.com/joinnep" }, { title: "Personalised and remote participation", url: "https://www.northeastprojectrun.com/faq-s" }],
    reviewed_at: "2026-10-15",
    location_note: "In-person coaching is arranged across Durham, Newcastle and Teesside; remote participation is also offered. Confirm each booked session's location."
  },
  "north-east-veterans-ac": {
    summary: "North East Veterans Athletics Club is a first-claim club for runners over thirty-five, distinct from the North East Masters Athletics Association that organises regional masters competition.",
    biography: [
      "North East Veterans Athletics Club is a first-claim athletics club in north-east England for men and women over thirty-five who are not already members of another UK Athletics club. It provides a route into affiliated road, cross-country, track-and-field and fell competition.",
      "Its origins lie in the early 1970s veteran-running organisation. In 2000, that organisation separated into an association for athletes belonging to local clubs and a distinct first-claim club retaining the NEVAC name. The association is now the North East Masters Athletics Association, or NEMAA; the two should not be treated as interchangeable.",
      "Prospective members should read NEVAC's membership form and contact its secretary about eligibility. NEMAA's events have their own entry and membership conditions, so joining NEVAC is not a promise of automatic entry to every masters competition. The published Wallsend contact address is for correspondence, not evidence of a weekly training venue."
    ],
    sources: [{ title: "First-claim eligibility and organisational history", url: "http://www.northeastveteransathleticsclub.weebly.com/" }, { title: "Secretary and correspondence address", url: "https://northeastveteransathleticsclub.weebly.com/contact.html" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://northeastveteransathleticsclub.weebly.com/" },
    contact_note: "NEVAC is a first-claim club for over-thirty-fives, not NEMAA. Contact the secretary to confirm eligibility; no fixed training venue was established."
  },
  "north-herts-road-runners": {
    summary: "North Herts Road Runners has brought runners together in Letchworth Garden City since 1986, combining coached pace groups, social running and community races.",
    biography: [
      "North Herts Road Runners began in October 1986 when John Atkinson advertised in the Comet for runners interested in forming a club in Letchworth Garden City, Hertfordshire, England. Its first AGM followed in January 1987, and the first Standalone 10K took place in October 1988.",
      "Tuesday and Thursday training starts from Mrs Howard Hall on Norton Way South. Colour-coded groups accommodate different paces, including a group for people able to run continuously for around thirty minutes. The club also offers periodic beginner courses and competes in road and cross-country leagues.",
      "Newcomers should complete the trial form to obtain temporary access to the club app and sessions before joining. Beyond training, members organise events including the Standalone 10K, Greenway Challenge and free monthly 5K. The hall is the training meeting point; the separately published Lindsell Avenue postal address is for correspondence."
    ],
    founded_year: 1986,
    notable_members: [{ name: "John Atkinson", connection: "Founder", detail: "The club history records Atkinson's October 1986 newspaper appeal that brought the founding runners together." }],
    sources: [{ title: "Club origins and first race", url: "https://www.nhrr.org.uk/about.html" }, { title: "Training and trial arrangements", url: "https://www.nhrr.org.uk/training-with-us.html" }, { title: "Events, contact and postal distinction", url: "https://www.nhrr.org.uk/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.nhrr.org.uk/", address_kind: "training" },
    location_note: "Mrs Howard Hall is the Tuesday and Thursday meeting point. The club lists a separate Lindsell Avenue postal address."
  },
  "north-leeds-fell-runners": {
    summary: "North Leeds Fell Runners explores Yorkshire hills and moors through adult off-road groups, fell races, relay teams and longer route recces.",
    biography: [
      "North Leeds Fell Runners was established in 2014 by runners from clubs around Leeds, West Yorkshire, England. Its England Athletics affiliation is for hill and fell running, with members also taking part in orienteering and mountain marathons across Yorkshire, Lancashire and the Lake District.",
      "Tuesday outings are sociable hill runs in pace groups, while Thursday sessions focus on intervals, tempo work or hill repetitions. Locations rotate around Leeds and Wharfedale rather than staying at one pub or car park. The club supports race recces, shared transport and relay teams; founding member Mike Ayres established the Rombald's Romp and Kettlewell Anniversary races.",
      "Training is open to over-eighteens, including visitors who have not joined the club. Complete the emergency-contact form to access current arrangements through SPOND, and check the seasonal equipment requirements before attending. New fell runners can contact the training coordinator for advice on choosing an appropriate outing."
    ],
    founded_year: 2014,
    notable_members: [{ name: "Mike Ayres", connection: "Founding member and race organiser", detail: "Ayres's official committee biography identifies him as a founding member and the creator of Rombald's Romp and Kettlewell Anniversary fell races." }],
    sources: [{ title: "Foundation and disciplines", url: "https://nlfr.co.uk/about-us/" }, { title: "Adult sessions, locations and kit", url: "https://nlfr.co.uk/training/" }, { title: "Founding connection and role contacts", url: "https://nlfr.co.uk/our-committee/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://nlfr.co.uk/", city: "Leeds and Wharfedale", county: "West Yorkshire", address_kind: "training" },
    location_note: "The Hermit at Burley in Wharfedale is one of several meeting points. Locations rotate around Leeds, Ilkley and Wharfedale and are confirmed through SPOND."
  },
  "north-shields-polytechnic-club": {
    summary: "North Shields Polytechnic Club has roots in a 1903 walking club and now supports junior and senior athletics, road, cross-country, fell running and triathlon in North Tyneside.",
    biography: [
      "North Shields Polytechnic Club began as a walking club in 1903 and was reconstructed in 1908. Based in North Tyneside, England, it now spans track and field, road running, cross-country, fell running and triathlon, with junior and senior participation. It became a Charitable Incorporated Organisation in 2018.",
      "A 400-metre all-weather track, field-event equipment and a clubhouse with gym and changing facilities support its programme. Members compete in winter cross-country, summer track-and-field leagues and road races, with multisport activity extending to triathlon and duathlon. Volunteers underpin both training and competition.",
      "Adults interested in joining can contact the membership team to discuss suitable groups. Junior admission is different: the official joining page currently says its waiting list is closed because demand exceeds capacity. Families should ask the club for an update rather than assuming a trial place is available."
    ],
    founded_year: 1903,
    sources: [{ title: "Origins and facilities", url: "https://nspoly.com/about" }, { title: "Adult enquiries and junior waiting list", url: "https://nspoly.com/new-members" }, { title: "General contact", url: "https://nspoly.com/contact" }, { title: "Churchill track headquarters", url: "https://nspoly.com/track-and-field" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://nspoly.com/", sports: ["Running", "Athletics", "Triathlon", "Duathlon"] },
    contact_note: "The junior waiting list was advertised as closed when checked on 15 October 2026. Ask the club about availability; adult enquiries use the membership team.",
    location_note: "The club identifies Churchill Playing Fields Track as its headquarters. The retained Shiremoor directory address is not confirmed as a training start; obtain directions from the club."
  },
  "north-somerset-ac": {
    summary: "North Somerset Athletic Club develops junior and adult athletes through track-and-field and endurance pathways, with facilities at Clevedon and training across North Somerset.",
    biography: [
      "North Somerset Athletic Club was founded in 2004 by head coach Chris Millard in North Somerset, England. It combines a substantial junior programme with adult membership, providing routes into track and field, cross-country, road races and relays.",
      "Its compact athletics facility at Clevedon School developed in phases completed in 2015 and 2017, with solar lighting added in 2022. Training also extends beyond Clevedon, including the Weston-super-Mare area. The club's history records a national development-club award in 2011 and the launch that year of its 24-hour Pier Relay fundraising event.",
      "Junior newcomers begin with a free trial, while adults can enquire through the contact page. Volunteer coaches, officials and helpers support the sessions and competitions. The club has posted a warning about problems with its enquiry form and supplies a direct email alternative, so use that route if a submitted enquiry has gone unanswered."
    ],
    founded_year: 2004,
    notable_members: [{ name: "Chris Millard", connection: "Founder and head coach", detail: "The club history credits Millard with founding NSAC in 2004 and records his 2011 England Athletics Coach of the Year award." }],
    sources: [{ title: "Club history and facilities", url: "https://www.nsac.org.uk/our-club/" }, { title: "Current programme", url: "https://www.nsac.org.uk/" }, { title: "Trial enquiries and form warning", url: "https://www.nsac.org.uk/contact-us/" }],
    reviewed_at: "2026-10-15", corrections: { address_kind: "training" },
    location_note: "Clevedon School is one training base; other sessions use Weston-super-Mare and additional endurance venues. Confirm the selected group's location.",
    contact_note: "The contact page reports enquiry-form problems and offers a direct email alternative for unanswered enquiries."
  },
  "north-staffs-rr-association": {
    summary: "North Staffordshire Road Runners Association organises an ability-group road-racing league across the region, rather than a single weekly training programme.",
    biography: [
      "North Staffordshire Road Runners Association was established in July 1974 to promote road running in North Staffordshire, England. Its principal activity is a league drawing on selected local races, bringing runners from the area's clubs into a shared competition.",
      "Members compete in ability-based groups and age categories. The published format selects twenty races, with a runner's best twelve performances counting towards the league. Participants can run fewer events, although award eligibility has separate minimum-participation rules. Check the current season's regulations rather than assuming every race is compulsory.",
      "New entrants and renewing members use separate application routes. The contact page also distinguishes the association membership secretary from the first-claim membership contact, an important difference for runners who already belong to another club. This is a regional racing network; its directory contact address should not be treated as a regular training meeting point."
    ],
    founded_year: 1974,
    sources: [{ title: "Origins and league format", url: "https://www.nsrra.org.uk/" }, { title: "Association and first-claim contacts", url: "https://www.nsrra.org.uk/contact/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.nsrra.org.uk/" },
    location_note: "A regional road-racing association with separate first-claim enquiries. No recurring training start was established from the official pages."
  },
  "northampton-ac": {
    summary: "Northampton Athletic Club provides a pathway from introductory athletics at age eight to specialist junior, senior and masters groups at Moulton College.",
    biography: [
      "Northampton Athletic Club is based at Moulton College near Northampton, England. It offers track-and-field and endurance athletics through a progression system that begins with an introductory development group from eight years old and extends to senior and masters athletes.",
      "Older juniors can develop across several events or join specialist groups for jumps, throws, sprints, hurdles and endurance. The published structure includes middle-distance and cross-country coaching as well as a longer-running group for older athletes. Volunteer coaches and technical officials are central to the club's development.",
      "Prospective athletes, helpers, coaches and officials can contact the club to discuss joining. The membership form includes six-week taster arrangements, and the website publishes track sessions on Mondays, Wednesdays and Sundays, with extra event-group sessions communicated by coaches. Confirm the appropriate group before attending; the club's published Moulton College postcode is NN3 7QL."
    ],
    sources: [{ title: "Coaching progression and taster sessions", url: "https://northamptonathleticclub.com/about/" }, { title: "Track programme", url: "https://northamptonathleticclub.com/" }, { title: "Enquiries and venue postcode", url: "https://northamptonathleticclub.com/contact-us/" }],
    reviewed_at: "2026-10-15", corrections: { address: "Moulton College, Moulton, Northampton, NN3 7QL", postcode: "NN3 7QL", address_kind: "training" }
  }
};
