import type { ClubProfile } from "./club-profiles.ts";

// Official sources opened on 15 October 2026; school districts are representative entities.
export const schoolsAndRegionalRunningProfiles: Record<string, ClubProfile> = {
  "welsh-athletics-north-east-wales-schools-districts": {
    summary: "North East Wales Schools District represents school track and field and cross-country across Denbighshire, Flintshire and Wrexham.",
    biography: [
      "North East Wales Schools District brings together school athletics across Denbighshire, Flintshire and Wrexham, Wales. Welsh Athletics places it in the North Wales region and lists track and field and cross-country. Its blue team vest has green and white hoops, distinguishing the district's representative team from local open-membership clubs.",
      "The district is part of the Welsh schools competition structure, linking school participation with district teams and national school championships. This is a route through school athletics, not evidence of a public weekly coaching group or a subscription-based running club.",
      "Pupils and families should begin with their school's PE or athletics staff and the published schools contact to clarify selection and entry. No permanent district clubhouse was established from the reviewed sources. The schools calendar mixes season references for this district, so the next competition's date and venue need confirmation before travel."
    ],
    sources: [
      { title: "North East Wales district listing", url: "https://www.welshathletics.org/en/club/view/north-east-wales-schools-districts" },
      { title: "Welsh schools structure and district calendar", url: "https://www.welshathletics.org/en/page/welsh-schools" },
      { title: "School district areas", url: "https://www.welshathletics.org/cy/page/welsh-schools" }
    ],
    location_note: "Denbighshire, Flintshire and Wrexham school district; no single training base is confirmed.",
    contact_note: "The calendar includes a 2025 date among 2026 material, and the Welsh-language area row has an inconsistent district label. Use the individual district's named central contact; founding date and notable-member history remain unresolved.",
    reviewed_at: "2026-10-15"
  },
  "welsh-athletics-powys-schools-district": {
    summary: "Powys Schools District connects school track and field and cross-country across Powys in Wales.",
    biography: [
      "Powys Schools District represents school athletics across the county of Powys, Wales. Its Welsh Athletics entry places it in the East Wales region, with track and field and cross-country as its disciplines. The district team wears red with a vertical white front panel; this school entity is separate from the county's public athletics clubs.",
      "Its published 2026 programme included a May qualifying meeting in Brecon and a June school-team Cup and Plate qualifier in Newtown. Those locations illustrate a county-wide competition role rather than a permanent training base. District competition sits within the wider Welsh school-championship pathway.",
      "Families can ask their school and the district schools contact about the relevant age group, entry and selection arrangements. The reviewed sources do not establish an ordinary club membership scheme, regular public training or a district clubhouse. Check each event's arrangements rather than treating a previous championship venue as a drop-in session."
    ],
    sources: [
      { title: "Powys schools district listing", url: "https://www.welshathletics.org/en/club/view/powys-schools-district" },
      { title: "Schools structure and 2026 Powys programme", url: "https://www.welshathletics.org/en/page/welsh-schools" },
      { title: "District areas and role enquiries", url: "https://www.welshathletics.org/cy/page/welsh-schools" }
    ],
    location_note: "County-wide schools district; Brecon and Newtown are published competition locations, not confirmed permanent district bases.",
    contact_note: "School participation and selection enquiries, not open club membership. Founding date and notable-member history are unresolved.",
    reviewed_at: "2026-10-15"
  },
  "welsh-athletics-south-east-wales-schools-district": {
    summary: "South East Wales Schools District supports representative school athletics across Blaenau Gwent, Monmouthshire, Newport and Torfaen.",
    biography: [
      "South East Wales Schools District serves school athletics in Blaenau Gwent, Monmouthshire, Newport and Torfaen, Wales. Welsh Athletics lists track and field and cross-country, and records cherry-red vests with white and green hoops. The listing concerns a representative schools district rather than an open-membership club based in one town.",
      "The district forms part of the Welsh school-to-national championship structure. Newport hosted its published May 2026 qualifying athletics meeting. That dated competition is useful context for the district's work, but it should not be read as a current training timetable or a standing invitation to attend the venue.",
      "A pupil's school is the practical starting point for questions about entry and selection, alongside the district schools enquiry address. No permanent district clubhouse or public weekly coaching offer was confirmed. Families should check the specific school event's eligibility and meeting arrangements before making plans."
    ],
    sources: [
      { title: "South East Wales schools district listing", url: "https://www.welshathletics.org/en/club/view/south-east-wales-schools-district" },
      { title: "Schools pathway and Newport qualifying meeting", url: "https://www.welshathletics.org/en/page/welsh-schools" },
      { title: "District areas and role enquiries", url: "https://www.welshathletics.org/cy/page/welsh-schools" }
    ],
    location_note: "Four-local-authority school district; confirm the venue for each event.",
    contact_note: "No founding date or notable-member history is inferred from school results.",
    reviewed_at: "2026-10-15"
  },
  "savvy-park-runrz": {
    summary: "Savvy Park Runrz is a Castleford running club combining social runs, training and community fundraising in West Yorkshire.",
    biography: [
      "Savvy Park Runrz was established in 2020 in Castleford, West Yorkshire, England. The England Athletics-affiliated club takes its local identity from Savile Park, where runners gather at the Castleford Cricket Club car park. Its offer combines sociable running with opportunities to train and race together.",
      "The published Monday and Wednesday evening runs use routes of roughly five to eight kilometres, with out-and-back formats and different paces helping people share the session. Club activities also include track visits to Thornes in Wakefield, a club grand prix, relay participation and charity fundraising. Beginner courses are offered periodically rather than continuously.",
      "Prospective runners can contact the club to arrange a first visit and discuss a suitable group. Social membership and England Athletics registration provide different participation options. Check the latest meeting arrangements before travelling; the park meeting point is a training base, not evidence of a staffed clubhouse."
    ],
    founded_year: 2020,
    sources: [
      { title: "Club introduction and sessions", url: "https://savvyparkrunrz.co.uk/" },
      { title: "Club activities and community", url: "https://savvyparkrunrz.co.uk/about-us/" },
      { title: "Public club enquiries", url: "https://savvyparkrunrz.co.uk/contact-us/" }
    ],
    corrections: { city: "Castleford", county: "West Yorkshire", address: "Castleford Cricket Club car park, Savile Park, Castleford", postcode: "", address_kind: "training", location_precision: "area-only" },
    contact_note: "Dorothy Hyman's historical coaching at Savile Park does not establish membership of this club founded in 2020; no notable-member entry is inferred.",
    reviewed_at: "2026-10-15"
  },
  "saxmundham-sports-running-and-fitness-club": {
    summary: "Saxmundham Sports Running and Fitness Club, known as the Saxons, offers running and fitness training at Carlton Park in Suffolk.",
    biography: [
      "Saxmundham Sports Running and Fitness Club is better known locally as the Saxons. Based in Saxmundham, Suffolk, England, it was founded in March 2005 by coach Gordon Merfield. The club combines running with general fitness work, welcoming people seeking a regular exercise routine as well as runners preparing for competition.",
      "Training is published for Tuesday and Thursday evenings at Carlton Park Sports Pavilion. Sessions bring together running, strength work and a supportive group setting rather than requiring everyone to pursue the same race goal. The club also stages a five-mile multi-terrain race, giving its local running community an event of its own.",
      "Membership is available from age sixteen, with prospective members invited to try sessions before committing. The membership year runs from April to March, and England Athletics registration is an additional option. Use the club's membership page to confirm the next suitable session and joining arrangements; race-entry age limits should not be confused with club membership eligibility."
    ],
    founded_year: 2005,
    notable_members: [{ name: "Gordon Merfield", connection: "Founder and coach", detail: "The club credits Merfield with founding the Saxons in March 2005 and names him as its lifetime president." }],
    sources: [
      { title: "Saxons history and club activities", url: "https://thesaxons.org.uk/" },
      { title: "Membership, age guidance and training base", url: "https://thesaxons.org.uk/membership/" }
    ],
    corrections: { website: "https://thesaxons.org.uk/", city: "Saxmundham", county: "Suffolk", address: "Carlton Park Sports Pavilion, Carlton Park, Saxmundham", postcode: "IP17 1AT", address_kind: "training", location_precision: "postcode", adult_only: false },
    contact_note: "Use the published membership enquiry route; the masked email address was not guessed.",
    reviewed_at: "2026-10-15"
  },
  "scarborough-athletic-club": {
    summary: "Scarborough Athletic Club brings together road, fell, cross-country and junior athletics in Scarborough, North Yorkshire.",
    biography: [
      "Scarborough Athletic Club serves runners and athletes in Scarborough, North Yorkshire, England. Its activities extend from road running to fell running, cross-country and junior athletics, giving members ways to take part beyond a single surface or race distance.",
      "The club publishes Monday and Thursday sessions led by qualified run leaders, with options ranging from walk-to-run participation to training for races. Additional longer and off-road outings broaden the programme. This mix allows social runners and more competitive members to remain part of the same club community.",
      "Prospective members can ask about a trial and the appropriate group before joining. The membership information distinguishes adult and junior options, club-only participation and athletics registration; track sessions have separate arrangements. Confidential financial support is available to discuss with the club. Published pages disagree about the trial's exact length, so confirm that detail directly rather than relying on an assumed free month."
    ],
    sources: [
      { title: "Club disciplines and training", url: "https://www.scarboroughac.co.uk/" },
      { title: "Membership and participation support", url: "https://www.scarboroughac.co.uk/membership" },
      { title: "Club contact page", url: "https://www.scarboroughac.co.uk/contact" }
    ],
    location_note: "The retained rugby-club address comes from the directory; confirm the meeting point for the chosen session.",
    contact_note: "Homepage and membership page give different trial lengths. The linked history page contains template text, so founding date and alumni remain unresolved.",
    reviewed_at: "2026-10-15"
  },
  "scunthorpe-and-district-running-club": {
    summary: "Scunthorpe and District Running Club offers group running and structured sessions from Brumby Hall in North Lincolnshire.",
    biography: [
      "Scunthorpe and District Running Club is based at Brumby Hall in Scunthorpe, North Lincolnshire, England. It provides a group setting for local runners, combining steady running with sessions designed to develop speed and strength on hills.",
      "The published club evenings are Tuesday and Thursday, meeting at 6.30pm. Qualified leaders support a programme that includes longer steady runs, faster work and hill sessions. Membership also connects runners with the App-Frodingham sports and social facilities, including changing and shower provision and a place to meet after a run.",
      "Guests can try up to four sessions before joining, but should complete the club's guest form before their first visit and arrive early enough to be introduced. The annual membership cycle runs from April to March and includes England Athletics registration. Use the official contact and session pages to check the right group; Brumby Hall is the training base, not a reason to assume every activity starts there."
    ],
    sources: [
      { title: "Club website", url: "https://scunthorperunningclub.wordpress.com/" },
      { title: "Sessions, guest form and membership", url: "https://scunthorperunningclub.wordpress.com/club-sessions-membership/" },
      { title: "Contact route", url: "https://scunthorperunningclub.wordpress.com/get-in-touch/" }
    ],
    corrections: { city: "Scunthorpe", county: "North Lincolnshire", address: "Brumby Hall, Centenary Way, Scunthorpe", postcode: "DN16 1AA", address_kind: "training", location_precision: "postcode", sports: ["Running", "Athletics"] },
    contact_note: "Founding date and notable-member history remain unresolved. Unsupported swimming and multisport tags are removed; guest registration is not an athlete identity claim.",
    reviewed_at: "2026-10-15"
  },
  "seaford-striders-rc": {
    summary: "Seaford Striders is an East Sussex running club with local group runs, junior sessions and access to track training in Lewes.",
    biography: [
      "Seaford Striders was formed at a meeting at Seaford Head School on 15 October 1986, following Peter Forster's idea and Martin Bulger's organisation. The first group run followed a week later. The club belongs to Seaford in East Sussex, England; its use of a track in Lewes does not make Lewes its home town.",
      "Early runs gathered at the Salts before the club used rugby-club facilities, and it moved to the Downs Leisure Centre in 1995. Today its published programme includes Wednesday pace groups, seasonal off-road routes, hills and intervals, alongside Monday track training in Lewes and junior activity at the Salts. The Mince Pie Ten is part of its local race calendar.",
      "New runners and families should contact the club about a suitable group and the current meeting point. Session times differ between published pages, so confirm them before attending. The variety of venues reflects different activities rather than a single clubhouse offering every session."
    ],
    founded_year: 1986,
    notable_members: [
      { name: "Martin Bulger", connection: "Founding organiser", detail: "The club history identifies Bulger as the organiser of the October 1986 founding meeting." },
      { name: "Peter Forster", connection: "Early instigator", detail: "The club history credits Forster with the idea that led to the formation of Seaford Striders." }
    ],
    sources: [
      { title: "Club programme", url: "https://www.seafordstriders.org.uk/" },
      { title: "Club history", url: "https://www.seafordstriders.org.uk/about/our-history/" },
      { title: "Public enquiries", url: "https://www.seafordstriders.org.uk/contact-us/" }
    ],
    corrections: { city: "Seaford", county: "East Sussex", address_kind: "training", sports: ["Running"] },
    location_note: "Seaford is the club's home town. The retained Lewes address identifies its track-training venue, not a Seaford clubhouse.",
    contact_note: "Confirm current track and junior session arrangements; differing published times are not resolved by guesswork.",
    reviewed_at: "2026-10-15"
  },
  "sedgefield-harriers": {
    summary: "Sedgefield Harriers offers junior and senior athletics, road, cross-country and off-road running in County Durham.",
    biography: [
      "Sedgefield Harriers began in September 2005 after Ean Parsons placed a local newspaper advertisement, with the club formally established at a meeting at the Nags Head. England Athletics affiliation followed in April 2006. Based in Sedgefield, County Durham, England, it developed from a small running group into a club with junior and senior participation.",
      "Scott Hydon helped establish the junior section in 2006. The club's subsequent development was recognised with UK Athletics Club of the Year in 2011, and its twentieth anniversary in 2025 included a relay linking the village and Hardwick Park. Its activities span track and field, road, cross-country, fell and trail running.",
      "Training uses Sedgefield Community College alongside local routes. Prospective members should contact the membership team to discuss the appropriate group and trial arrangements. The joining page refers to both four sessions and four weeks, so check the applicable trial limit before assuming either is guaranteed."
    ],
    founded_year: 2005,
    notable_members: [
      { name: "Ean Parsons", connection: "Founder", detail: "The club history credits Parsons' 2005 newspaper advertisement with bringing together its founding group." },
      { name: "Scott Hydon", connection: "Junior-section organiser", detail: "The club history records Hydon's role in establishing the junior section in 2006." }
    ],
    sources: [
      { title: "Club origins and development", url: "https://sedgefieldharriers.co.uk/about/" },
      { title: "Joining and trial guidance", url: "https://sedgefieldharriers.co.uk/join-us/" }
    ],
    corrections: { website: "https://sedgefieldharriers.co.uk/", city: "Sedgefield", county: "County Durham", address_kind: "training" },
    location_note: "Sedgefield Community College is a training venue; the retained postcode is directory-sourced, not a newly checked postal address.",
    contact_note: "Trial wording differs within the joining page; confirm the permitted trial with the membership team.",
    reviewed_at: "2026-10-15"
  },
  "sedgley-striders": {
    summary: "Sedgley Striders is a West Midlands running club with group runs and periodic beginner programmes, meeting in Lanesfield.",
    biography: [
      "Sedgley Striders serves runners around Sedgley and Dudley in the West Midlands, England. The club publishes its current meeting point at the Three Crowns on Dovedale Road in Lanesfield, Wolverhampton, rather than the older address retained in some directory material.",
      "Tuesday and Thursday evening gatherings provide the regular club-running framework. The club also runs beginner programmes: its ten-week early-2026 course culminated in a first five-kilometre run at East Park in March. That completed course is evidence of beginner support, not an invitation to join a course already under way.",
      "The membership information uses an April annual cycle with England Athletics registration included. New runners should email the club about the right starting group and confirm the meeting arrangements before attending. A further beginner course was being planned for January 2027 when checked, but its availability should be confirmed rather than treated as a guaranteed open booking."
    ],
    sources: [
      { title: "Current meeting point and beginner programme", url: "https://sedgleystriders.co.uk/" },
      { title: "Club membership information", url: "https://sedgleystriders.co.uk/about/" }
    ],
    corrections: { website: "https://sedgleystriders.co.uk/", city: "Sedgley", county: "West Midlands", address: "Three Crowns, Dovedale Road, Lanesfield, Wolverhampton", postcode: "WV4 6RB", address_kind: "training", location_precision: "postcode", sports: ["Running"] },
    location_note: "The published training meeting point is in Lanesfield, Wolverhampton; the club retains its Sedgley identity.",
    contact_note: "Founding date and notable-member history are unresolved. The next beginner course is planned, not confirmed as open for bookings.",
    reviewed_at: "2026-10-15"
  },
  "selby-striders": {
    summary: "Selby Striders is an adult running club in Selby, North Yorkshire, offering social runs, structured training and local race involvement.",
    biography: [
      "Selby Striders emerged during the winter of 1985–86 when an adult running group separated from RASDAC, and registered as a club on 1 March 1986. Based in Selby, North Yorkshire, England, it has developed a programme of road and cross-country running alongside a sociable local club life.",
      "The club publishes Tuesday and Thursday evening runs from Selby Rugby Club, with routes and pace groups, plus shorter early runs and a midweek hills or speed session. Its history also traces the Wistow race through half-marathon, ten-mile and ten-kilometre formats, showing a long involvement in organising local events rather than simply attending them.",
      "Membership is for adults aged eighteen and over, with a separate social option for non-running supporters. Prospective members should contact the membership team about a suitable first run or the next beginner programme. Session routes and meeting details should be checked on the current club pages before travelling."
    ],
    founded_year: 1986,
    notable_members: [{ name: "Bob Saddington", connection: "First chairman", detail: "The club's account of its 1985–86 beginnings names Saddington as its first chairman." }],
    sources: [
      { title: "Club programme", url: "https://selbystriders.org.uk/" },
      { title: "Club origins and Wistow race history", url: "https://selbystriders.org.uk/about-the-club/" },
      { title: "Joining and adult membership", url: "https://selbystriders.org.uk/about-the-club/how-to-join-us/" }
    ],
    corrections: { city: "Selby", county: "North Yorkshire", address_kind: "training", adult_only: true, sports: ["Running"] },
    location_note: "Selby Rugby Club is a published meeting base; the retained postal detail remains directory-sourced.",
    reviewed_at: "2026-10-15"
  },
  "settle-harriers": {
    summary: "Settle Harriers is a North Craven running club with a strong fell-running tradition and junior and adult sessions in the Yorkshire Dales.",
    biography: [
      "Settle Harriers was founded in 1987 and serves North Craven, including Settle, Ingleton and Hellifield in North Yorkshire, England. Fell running is central to its identity, alongside road, trail and cross-country running across the western Yorkshire Dales.",
      "The club organises the Pen-y-ghent, Whernside, Settle Hills and Ingleborough fell races, as well as junior racing associated with the Three Peaks. Its weekly programme combines Monday and Wednesday social outings from changing village locations, Thursday structured adult training and Tuesday junior coaching. Routes adapt to the season, with summer fell running and winter options suited to the conditions.",
      "Prospective runners can use the club's contacts page to reach membership or junior organisers and find a suitable session. The varied starts mean there is no single address to treat as a permanent training venue. The joining page required verification during review, so trial limits and current subscription terms are left for the club to confirm."
    ],
    founded_year: 1987,
    sources: [
      { title: "Club background, races and weekly programme", url: "https://settleharriers.org/" },
      { title: "Membership and junior contact roles", url: "https://settleharriers.org/contacts/" }
    ],
    corrections: { website: "https://settleharriers.org/", city: "Settle", county: "North Yorkshire", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Training starts vary across North Craven. The unconfirmed Lincoln House directory address is not presented as a clubhouse.",
    contact_note: "The joining page required browser verification. No trial limit, masked email or notable-member history is inferred.",
    reviewed_at: "2026-10-15"
  },
  "sevenoaks-ac": {
    summary: "Sevenoaks Athletics Club offers road, cross-country and track-and-field participation around Sevenoaks and Knole Park in Kent.",
    biography: [
      "Sevenoaks Athletics Club dates from 1976 and marked its fiftieth anniversary in 2026. Based in Sevenoaks, Kent, England, it combines road and cross-country running with track and field, including jumping and throwing, using local routes and the Sennocke Centre at Sevenoaks School.",
      "The published programme includes Tuesday steady runs, Thursday intervals and Sunday track activity, with Knole Park an important local running setting. The Sevenoaks Seven race and a shorter junior event add an organising role to the club's training and competition programme.",
      "Adults can arrange an initial trial, with the joining page asking prospective runners to be comfortable running five miles continuously. Adult membership begins at seventeen; the junior section covers ages nine to nineteen and has a waiting list. Families should contact the club before attending, since junior taster access is restricted and the adult trial offer is not a promise of an immediate junior place."
    ],
    founded_year: 1976,
    sources: [
      { title: "Anniversary, disciplines and club programme", url: "https://www.7oaks-ac.org.uk/" },
      { title: "Joining thresholds and junior arrangements", url: "https://www.7oaks-ac.org.uk/join.html" }
    ],
    corrections: { city: "Sevenoaks", county: "Kent", address_kind: "training", adult_only: false },
    contact_note: "Contact before attending; juniors have a waiting list and no tasters before school Year 5. No supported notable-member entry is added.",
    reviewed_at: "2026-10-15"
  },
  "severn-ac": {
    summary: "Severn Athletic Club is a Gloucester club focused on road running and cross-country, with interval and hill sessions in the city.",
    biography: [
      "Severn Athletic Club was founded in 1994 in Gloucester, Gloucestershire, England. Its current emphasis is road running and cross-country, although track and field forms part of the club's history. Participation in Birmingham and Gloucestershire cross-country competition gives members a team racing outlet through the winter.",
      "The training page publishes Monday intervals from Barnett Way in Barnwood and Wednesday hill work from Kenilworth Avenue. These are separate meeting points for different sessions, not two descriptions of the same clubhouse. The programme offers structured work alongside members' wider running and racing.",
      "Prospective runners can try a session and are encouraged to let the club know they are coming, allowing time to meet the group before the start. Use the club contact route to confirm the current timetable and membership terms. The available membership form still shows a 2025–26 fee period, so those prices are not presented as current subscriptions."
    ],
    founded_year: 1994,
    sources: [
      { title: "Club origins and disciplines", url: "https://severnac.com/" },
      { title: "Training locations and trial guidance", url: "https://severnac.com/training/" },
      { title: "Membership contact and dated fee period", url: "https://severnac.com/membership-form/" },
      { title: "Public contact page", url: "https://severnac.com/contact/" }
    ],
    corrections: { city: "Gloucester", county: "Gloucestershire", address: "Barnett Way, Barnwood, Gloucester", postcode: "GL4 3RT", address_kind: "training", location_precision: "postcode" },
    location_note: "Barnett Way is the Monday meeting point; Wednesday hill sessions use Kenilworth Avenue. Neither is established as a staffed clubhouse.",
    contact_note: "Published membership prices are labelled 2025–26; confirm current terms. Notable-member history remains unresolved.",
    reviewed_at: "2026-10-15"
  },
  "shadwell-runners": {
    summary: "Shadwell Runners is a north Leeds running community offering group training, social activity and local race involvement in West Yorkshire.",
    biography: [
      "Shadwell Runners brings together runners in north Leeds, West Yorkshire, England. The club describes a community spanning people building their confidence and runners preparing for marathons, with group training and social participation both part of its offer.",
      "The published programme includes weekly group runs, interval work, informal weekend outings and summer track sessions. Yoga, pub runs and a virtual February challenge broaden the club calendar, while organising the Shadwell 10k gives members a practical role in their local race. Beginner courses are described as a recurring activity, not a continuously available intake.",
      "Prospective members can use the official site's joining form to ask about a suitable session. Club membership and optional England Athletics registration are distinguished, so runners can check which route fits their plans. Confirm the meeting point and any course availability directly; the retained Red Lion directory address is not fresh evidence that every group meets there."
    ],
    sources: [
      { title: "Official club programme", url: "https://sites.google.com/view/shadwellrunners/" },
      { title: "Membership options", url: "https://sites.google.com/view/shadwellrunners/club-membership" },
      { title: "Joining enquiry form", url: "https://sites.google.com/view/shadwellrunners/join-us" }
    ],
    corrections: { website: "https://sites.google.com/view/shadwellrunners/", city: "Leeds", county: "West Yorkshire" },
    location_note: "The Red Lion address is retained from the directory; confirm the actual session start with the club.",
    contact_note: "Founding date, notable-member history and exact junior-admission arrangements remain unconfirmed; broad welcoming language does not establish a junior section.",
    reviewed_at: "2026-10-15"
  },
  "shaef-shifters-running-club": {
    summary: "SHAEF Shifters Running Club is a Teddington running group whose social runs and parkrun activity centre on Bushy Park.",
    biography: [
      "SHAEF Shifters Running Club began in early 2017 when groups of friends came together to run. Based around Teddington in south-west London, England, it uses Bushy Park for its running and social life.",
      "The club describes Saturday parkrun participation and volunteering, followed by easy running and coffee, alongside longer Sunday outings. Its account records local Surrey and London races and the Green Belt Relay in 2022; these are historical examples, not confirmed current race entries.",
      "New runners are invited to try a few outings before joining through the linked membership route. Contact the club about the next run and appropriate group. Bushy Park's Teddington gates are the published meeting reference, replacing an unconfirmed street address."
    ],
    founded_year: 2017,
    sources: [{ title: "Club origins, participation and joining", url: "https://www.shaefshifters.co.uk/p/about-us" }],
    corrections: { city: "Teddington", county: "Greater London", address: "Bushy Park, Teddington gates, Teddington", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Bushy Park's Teddington gates are a meeting reference, not a clubhouse. Confirm the next outing before travelling.",
    contact_note: "Confirm current sessions. Masked email and notable-member history are not inferred.",
    reviewed_at: "2026-10-15"
  },
  "shaftesbury-barnet-harriers": {
    summary: "Shaftesbury Barnet Harriers is a north London athletics club offering track and field, road running and cross-country from StoneX Stadium.",
    biography: [
      "Shaftesbury Barnet Harriers traces its roots to Shaftesbury Harriers, founded in Hornsey in 1890. The present club name followed the 1986 merger with Barnet Copthall Ladies, whose own origins dated to 1948. It is based at StoneX Stadium in Hendon, north London, England, with track and field, road running and cross-country among its activities.",
      "The club's history includes the development of its clubhouse in 1983 and athletes such as Dave Bedford and Joyce Smith. Their associations belong to the club and predecessor clubs' history, not a claim that they are current competitive members. The merger brought those traditions into a shared organisation.",
      "Coaching groups operate through the week, with arrangements depending on event and age. Membership is available from age ten, but applicants should contact the club before submitting a membership application and wait for approval. Ask about an appropriate coach, trial and meeting point rather than assuming that a general stadium opening time is a club session."
    ],
    founded_year: 1890,
    notable_members: [
      { name: "Dave Bedford", connection: "Historical Shaftesbury athlete", detail: "The club history records Bedford among Shaftesbury Harriers' prominent historical athletes." },
      { name: "Joyce Smith", connection: "Historical Barnet Copthall Ladies athlete", detail: "The club history places Smith in the Barnet Copthall Ladies tradition that joined Shaftesbury in the 1986 merger." }
    ],
    sources: [
      { title: "Club and predecessor history", url: "https://shaftesburybarnet.co.uk/about/history/" },
      { title: "Club activities and coaching", url: "https://shaftesburybarnet.co.uk/about/" },
      { title: "Club-linked membership conditions and contact", url: "https://membermojo.co.uk/sbh" }
    ],
    corrections: { website: "https://shaftesburybarnet.co.uk/", city: "London", county: "Greater London", address: "StoneX Stadium, Greenlands Lane, Hendon, London", postcode: "NW4 1RL", address_kind: "training", location_precision: "postcode", adult_only: false },
    contact_note: "1890 is the Shaftesbury predecessor's founding year; the present merged identity dates from 1986. Contact before applying; membership is subject to approval.",
    reviewed_at: "2026-10-15"
  },
  "shelton-striders": {
    summary: "Shelton Striders is a Derby running club combining coached sessions, social runs, relays and community race activity.",
    biography: [
      "Shelton Striders was founded in 1984 in Derby, England. The club combines training and competition with a busy social running programme, including relays, handicaps, parkrun visits and its own ten-kilometre race. Its membership arrangements include runners under eighteen as well as adults.",
      "Wednesday coached sessions move between Darley Park in summer and Moorways in winter, with interval work forming part of the programme. Other club outings provide different distances and a more social emphasis. The seasonal venue change matters: Moorways is a training location, not the starting point for every run.",
      "New runners must book an induction before their first coached session and arrive early for the introduction. Guests can attend up to three sessions before joining and need to sign in with the required emergency information. The membership and coaching role contacts can help identify a suitable group and confirm the current seasonal start time."
    ],
    founded_year: 1984,
    sources: [
      { title: "Club background and activities", url: "https://sheltonstriders.org.uk/about-us/" },
      { title: "Coached sessions and induction requirements", url: "https://sheltonstriders.org.uk/club-training/wednesday-night-training/" },
      { title: "Membership details", url: "https://sheltonstriders.org.uk/contact-us/membership-details/" },
      { title: "Published club role contacts", url: "https://sheltonstriders.org.uk/wp-content/uploads/2026/06/contact-us.pdf" }
    ],
    corrections: { city: "Derby", county: "Derbyshire", address_kind: "training", adult_only: false, sports: ["Running"] },
    location_note: "Coached Wednesday training uses Darley Park in summer and Moorways in winter; confirm the seasonal venue and time.",
    contact_note: "Book an induction before the first coached session. No unsupported founding-member or athlete association is added.",
    reviewed_at: "2026-10-15"
  },
  "shenley-striders": {
    summary: "Shenley Striders is a Milton Keynes running club offering structured and social running from Shenley Church End in Buckinghamshire.",
    biography: [
      "Shenley Striders began in 1991 through leisure-centre staff before developing into an independent local running club. Based in Milton Keynes, Buckinghamshire, England, it retains a connection with Shenley Leisure Centre in Shenley Church End and the surrounding paths and countryside.",
      "The published programme includes Monday interval work, a Wednesday run of around ten kilometres and varied Sunday outings. Social activities such as summer pub runs and seasonal gatherings accompany the training. Members' personal participation in duathlon or triathlon should not be read as evidence that the club provides swimming or cycling coaching.",
      "The club offers a two-week trial, but explains that it does not currently have capacity to teach complete beginners. Prospective runners should be ready for its stated ten-kilometre group pace and contact the club before attending. Its enquiry form is the route to check suitability, meeting details and the latest joining arrangements."
    ],
    founded_year: 1991,
    sources: [
      { title: "Training and joining guidance", url: "https://www.shenleystriders.co.uk/" },
      { title: "Club origins and community", url: "https://www.shenleystriders.co.uk/about/" },
      { title: "Club enquiry form", url: "https://www.shenleystriders.co.uk/contact-us/" }
    ],
    corrections: { city: "Milton Keynes", county: "Buckinghamshire", address_kind: "training", sports: ["Running"] },
    contact_note: "The published Wednesday group guidance is around ten-minute miles over ten kilometres; confirm readiness before attending. Founding-person and notable-member history remain unresolved.",
    reviewed_at: "2026-10-15"
  },
  "sherfield-park-runners": {
    summary: "Sherfield Park Runners is an adult running club in Hampshire, with structured training, social runs and cross-country participation.",
    biography: [
      "Sherfield Park Runners formed in 2013 and serves the Sherfield Park community and nearby Hampshire villages in England. Its activities draw runners from places including Chineham, Bramley, Tadley and Old Basing, with Sherfield Park Community Centre providing a regular base.",
      "Tuesday evening training combines speed, hill and strength work, while Thursday outings use local trails in summer and roads in winter. Leaders and sweepers support the organised group runs. Southern Cross Country League participation and periodic Couch to 5k courses provide further ways to take part; informal weekend meet-ups are distinguished from the club's official sessions.",
      "The joining page specifies membership for adults aged eighteen and over. Prospective runners should contact the club to discuss a suitable group or the next beginner intake, then check the current meeting location: Thursday starts can vary. Broad welcoming language on the homepage does not override the specific adult membership condition."
    ],
    founded_year: 2013,
    sources: [
      { title: "Club community and origins", url: "https://www.sherfieldparkrunners.co.uk/about-spr" },
      { title: "Adult membership and joining", url: "https://www.sherfieldparkrunners.co.uk/join-us" },
      { title: "Training and meeting arrangements", url: "https://www.sherfieldparkrunners.co.uk/training" },
      { title: "Club contact and official social links", url: "https://www.sherfieldparkrunners.co.uk/" }
    ],
    corrections: { city: "Sherfield on Loddon", county: "Hampshire", address: "Sherfield Park Community Centre, Sunwood Drive, Sherfield Park, Hook", postcode: "RG27 0FP", address_kind: "training", location_precision: "postcode", adult_only: true },
    location_note: "The community centre is a regular base; Thursday meeting points vary. Hook is part of the postal address, not a claim that all training takes place in Hook village.",
    contact_note: "Confirm beginner-course availability and official-session arrangements directly. No supported notable-member entry is added.",
    reviewed_at: "2026-10-15"
  }
};
