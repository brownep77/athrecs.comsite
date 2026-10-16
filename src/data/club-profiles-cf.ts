import type { ClubProfile } from "./club-profiles";

// Batch 84: recovered club sites and source-qualified community programmes.
export const recoveredClubCommunitiesProfiles: Record<string, ClubProfile> = {
  "tavistock-ac": {
    summary: "Tavistock Athletic Club brings junior and senior athletics to Tavistock, Devon, combining track facilities, Dartmoor surroundings and the Tavy 7 road race.",
    biography: [
      "Tavistock Athletic Club was formed in 1985 in Tavistock, Devon, England. Its description on the Devon County Athletics Association website welcomes beginners and experienced athletes, with junior groups from age eight and a range of senior training groups. A 400-metre track supports training and track-and-field events, while nearby Dartmoor provides a very different running landscape.",
      "The county listing describes sessions across several weekday evenings and Saturday mornings, recommending Tuesday as a useful introduction. Contact the club before attending to confirm the right group and current meeting arrangements; the listing is not a booking confirmation.",
      "The club also organises the Tavy 7. Its own 2026 event listing advertises a seven-mile road route from Plaster Down through Dartmoor lanes near Pew Tor and Sampford Spiney on 25 October. That is a scheduled event, not a completed edition or a regular training start. The club website was unavailable during this review, so current joining procedures and direct enquiry details remain unconfirmed."
    ],
    founded_year: 1985,
    sources: [{ title: "Devon County Athletics Association club description", url: "https://www.devonathletics.org/affiliated-clubs.html" }, { title: "Club organiser's Tavy 7 listing for 25 October 2026", url: "https://www.entrycentral.com/tavy7" }],
    reviewed_at: "2026-10-16",
    location_note: "The college track remains directory-listed; Plaster Down is the advertised Tavy 7 race start, not a clubhouse.",
    contact_note: "Direct club pages were unavailable. No email, telephone or postcode correction is inferred from search snippets."
  },
  "stone-master-marathoners": {
    summary: "Stone Master Marathoners is a Staffordshire running club founded in 1978, welcoming social runners and competitors across distances rather than only veteran marathon runners.",
    biography: [
      "Stone Master Marathoners began in Stone, Staffordshire, England, on 26 November 1978. Terry Darlington, Bill Couldrey and Tom Chitty formed the club after running with Stone Joggers. Its original veteran-marathon focus explains the name, but today's welcome extends to runners of different abilities and ambitions: neither a marathon nor residence in Stone is a requirement.",
      "The club organised its first Flying Fox Marathon in 1979. Its bat emblem and strong social tradition remain part of its character, alongside training for distances ranging from short races to ultras. New or returning runners can ask about introductory courses, while experienced members can join structured sessions and longer runs.",
      "The current homepage lists Little Stoke Cricket Club as the start for several weekly runs, with interval locations varying. Sessions are arranged through Spond, and runners should check the app before travelling. The club's mustering approach brings the group back together rather than leaving slower runners behind. Contact the membership secretary or chair for access and advice; the older About page still names Stone Tennis Club."
    ],
    founded_year: 1978,
    notable_members: [
      { name: "Terry Darlington", connection: "Founder and former president", detail: "The club history identifies him as a founder in November 1978 and president from 1978 to 2018." },
      { name: "Bill Couldrey", connection: "Founding member", detail: "Helped establish Stone Master Marathoners at its inaugural meeting on 26 November 1978." },
      { name: "Tom Chitty", connection: "Founding member", detail: "Named alongside Terry Darlington and Bill Couldrey in the club's account of its 1978 foundation." }
    ],
    sources: [{ title: "Club foundation and first-person history", url: "https://www.stonemm.co.uk/history/" }, { title: "Current session bases and membership contacts", url: "https://www.stonemm.co.uk/" }, { title: "Club welcome and older venue wording", url: "https://www.stonemm.co.uk/about/" }, { title: "Membership and introductory running", url: "https://www.stonemm.co.uk/members/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.stonemm.co.uk/", address_kind: "training" },
    location_note: "Little Stoke Cricket Club is a published training start. Other sessions vary; check Spond rather than the older Tennis Club wording.",
    contact_note: "Membership and chair role addresses are published on the current club homepage."
  },
  "higham-harriers": {
    summary: "Higham Harriers is an East Northamptonshire running club established in 2014, combining structured training, road racing and local parkrun volunteering.",
    biography: [
      "Higham Harriers Athletics Club serves East Northamptonshire, England, with a competitive running programme around the Rushden area. Established in 2014, it brings together runners pursuing distances from 5K to marathons and ultras. Its small-club approach includes social gatherings and support for members who are injured or unable to train.",
      "Formal Tuesday and Thursday sessions develop strength, speed and endurance, with different local starting points announced to members. The club asks members to attend at least two sessions each month and race at least twice a year in club colours. Prospective runners should discuss those expectations and the right session with the club before coming along.",
      "Members support the Northants Road Running League and East Midlands Grand Prix Series as well as local and national races. The club reports a men's small-team win at Endure24 in 2024. Away from racing, volunteers periodically take over roles at Irchester Country Park parkrun, including pacing, while informal weekend runs offer more time together. The current website supplies a general enquiry email and telephone contact."
    ],
    founded_year: 2014,
    sources: [{ title: "Club foundation, ethos and public enquiries", url: "https://www.highamharriers.com/" }, { title: "Training expectations, racing and community volunteering", url: "https://www.highamharriers.com/training-racing" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.highamharriers.com/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Area indicator only. The club uses varying local starts; the former Wharf Road directory address is not established as a training venue."
  },
  "wallsend-harriers-and-ac": {
    summary: "Wallsend Harriers is a North Tyneside running and athletics club with roots in 1920 and a revival in 1975, offering senior and junior training.",
    biography: [
      "Wallsend Harriers has two important beginnings in Wallsend, North Tyneside, England. The original club was established on 22 September 1920 at the Tyneside Stadium and later ceased operating. In 1975 Bill McGuirk began coaching young athletes under the Wallsend name, laying the foundations of the revived club. The club's history distinguishes these periods rather than implying uninterrupted activity.",
      "Road running, cross-country and track athletics sit alongside a long social and volunteering tradition. The published training programme uses Hadrian Leisure Centre for regular club nights, Rising Sun Country Park for some summer Tuesdays and Churchill Playing Fields in Monkseaton for Friday track sessions. Monthly club events can have other starts, so check the current programme first. New runners are accompanied on club nights.",
      "The club celebrated fifty years since its revival in 2025 and reported its team's participation in the opening 2026–27 North East Harrier League fixture. Community activity includes the Toby cycling challenge supporting St Oswald's Hospice. Its 2023 tribute to long-serving coach and official Tommy Morgan reflects the importance of volunteers as well as competitors in the club's story."
    ],
    founded_year: 1920,
    notable_members: [
      { name: "Bill McGuirk", connection: "Coach who revived the club in 1975", detail: "The club history credits his work with young athletes as central to the modern Wallsend Harriers." },
      { name: "Tommy Morgan", connection: "Late life member, coach and official", detail: "A club tribute published in August 2023 recalled more than thirty years of membership and his work with young athletes and grassroots athletics." }
    ],
    sources: [{ title: "Club history: 1920 origins and 1975 revival", url: "https://www.wallsendharriers.org/?page_id=628" }, { title: "Training groups and seasonal venues", url: "https://www.wallsendharriers.org/?page_id=26" }, { title: "Club news and historical volunteer tribute", url: "https://www.wallsendharriers.org/" }, { title: "Correspondence address, email and official social links", url: "https://www.wallsendharriers.org/?page_id=22" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Wallsend", website: "https://www.wallsendharriers.org/", address: "Hadrian Leisure Centre, St Peter's Road, Wallsend, NE28 7LQ", postcode: "NE28 7LQ", address_kind: "training" },
    location_note: "Hadrian Leisure Centre is both a published correspondence address and a training base, not the start for every session."
  },
  "watford-joggers": {
    summary: "Watford Joggers is an all-ability Hertfordshire running club whose history began in Cassiobury Park in 1976, with coached sessions and sociable group runs.",
    biography: [
      "Watford Joggers began with a group outing from Gade Avenue car park in Cassiobury Park in November 1976. Founder and former chair Harvey Jaquest's history recalls developing the idea with Alan Flint and introducing weekday runs as the group grew. The club moved to West Herts Sports Club in 2012, keeping its roots in Watford, Hertfordshire, England.",
      "The club welcomes a broad range of runners, from people working towards a first 5K to experienced marathon runners. Wednesday social runs start from West Herts Sports Club and include jog-walk options. Tuesday coached intervals alternate between Merchant Taylors' School's track and other local venues, while Sunday social runs meet in Cassiobury Park. Check the current session details before attending.",
      "Volunteering is part of its history: members staffed the London Marathon's 24-mile feeding station at the inaugural event in 1981. New runners can contact the membership secretary through the club's enquiry form to arrange a trial session. Those who decide to join register on the club website and purchase membership through its shop."
    ],
    founded_year: 1976,
    notable_members: [
      { name: "Harvey Jaquest", connection: "Late founder and former chairman", detail: "Authored the club's first-person history, including its inaugural November 1976 outing." },
      { name: "Alan Flint", connection: "Early organiser", detail: "Harvey Jaquest's history credits their discussions with conceiving Watford Joggers and describes Flint leading the inaugural jog." }
    ],
    sources: [{ title: "Founder Harvey Jaquest's club history", url: "https://www.watfordjoggers.org.uk/history" }, { title: "Current programme and joining process", url: "https://www.watfordjoggers.org.uk/" }, { title: "Club enquiry form", url: "https://www.watfordjoggers.org.uk/contact-us" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.watfordjoggers.org.uk/", address_kind: "training" },
    location_note: "West Herts Sports Club is the Wednesday base; interval and Sunday sessions use other venues."
  },
  "compton-harriers-rc": {
    summary: "Compton Harriers is a Berkshire Downs running club whose first-person directory description emphasises countryside running, varied distances and a small social group.",
    biography: [
      "Compton Harriers Running Club is based in Compton in the Berkshire Downs, England. Its first-person entry in the independent british-athletics.co.uk directory describes a small club taking part in road, cross-country, trail and fell races, together with off-road relays. The emphasis is on enjoyment and personal progress rather than one particular racing standard.",
      "The undated account describes weekday hill or speed work, Thursday off-road running and longer Sunday outings in the Downs. It also records a monthly handicap and the club's association with the Compton Downland Challenge. These are descriptions of the club's programme, not confirmation of today's timetable or a forthcoming race. The current club website could not be read, so prospective members should establish present sessions and contact arrangements before travelling."
    ],
    sources: [{ title: "First-person club entry in independent directory, undated", url: "https://www.british-athletics.co.uk/clubs/club0264.htm" }],
    reviewed_at: "2026-10-16",
    location_note: "The sports-centre address remains directory-listed; current session starts are unconfirmed.",
    contact_note: "The independent directory is not the governing body. It reveals no usable email address; none is guessed."
  },
  "northwich-running-club": {
    summary: "Northwich Running Club serves runners in Northwich, Cheshire, with club membership, affiliated competition options and a documented family fun-run programme at Marbury Country Park.",
    biography: [
      "Northwich Running Club is based in Northwich, Cheshire, England. The town's visitor website describes an encouraging club for runners and joggers of differing abilities. Its organiser-managed membership page offers membership for 2026–27 and explains the separate England Athletics registration needed when competing for the club.",
      "The club's community activity includes the Marbury Festive Fun Run. The accessible organiser listing describes its 7 December 2025 edition as a short run-or-walk event on the park's shared paths, welcoming families and pushchairs. That dated listing illustrates the club's organising role; it is not confirmation of a 2026 event or an open booking today.",
      "The club website was unavailable during this review, so a current weekly timetable and general enquiry contact remain unresolved. Use the club-managed membership route for the published membership information and confirm training separately. The former Runcorn street address is not presented as a Northwich training base, and the event venue at Marbury is not assumed to be the start for regular sessions."
    ],
    sources: [{ title: "Town visitor organisation's club introduction", url: "https://visitnorthwich.co.uk/running-in-northwich/" }, { title: "Club-managed 2026–27 membership page", url: "https://www.entrycentral.com/northwichrunningclubmembership" }, { title: "Organiser description of the 7 December 2025 fun run", url: "https://www.entrycentral.com/FestiveFunRun" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Northwich", county: "Cheshire", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Northwich town indicator only; no current regular training venue was confirmed.",
    contact_note: "The dated event organiser's phone, EntryCentral support contacts and England Athletics data-protection email are not general club enquiry contacts."
  },
  "lymington-triathlon-club": {
    summary: "Lymington Triathlon Club welcomes adults interested in swimming, cycling and running in Lymington, Hampshire, including those who enjoy just one of the disciplines.",
    biography: [
      "Lymington Triathlon Club is an adult club in Lymington, Hampshire, England. Its own introduction welcomes people aged eighteen and over, from experienced triathletes to those who prefer swimming, cycling or running individually. Members need not take part in all three sports to share the club's activities.",
      "The club also contributes to local cross-country running. CC6 league instructions named it alongside New Forest Runners and Lymington Athletics as a host for the Holmsley fixture on 14 December 2025. This is a dated organising partnership, not a statement that the campsite is the club's training base.",
      "Prospective members should follow the club's membership route and confirm current arrangements before attending. The accessible membership page refers to a year ending in March 2022, while the training page presented a verification screen. Fees, weekly sessions and coaching availability are therefore not repeated here as current facts. The club's founding date and notable-member history remain unconfirmed."
    ],
    sources: [{ title: "Club introduction and adult participation", url: "https://www.lymingtontriathlonclub.com/" }, { title: "Membership page with dated year wording", url: "https://www.lymingtontriathlonclub.com/membership/" }, { title: "CC6 co-host instructions for 14 December 2025", url: "https://cc6.co.uk/2025/12/07/race-4-instructions-holmsley/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.lymingtontriathlonclub.com/" },
    location_note: "The leisure-centre address remains directory-listed. Current session venues require confirmation.",
    contact_note: "The membership email is masked and the Instagram destination is an unconfirmed numeric identifier; neither is guessed."
  },
  "wilmslow-running-club": {
    summary: "Wilmslow Running Club is a Cheshire club founded in 1989, with ability-group interval training and competition on roads, trails, fells and cross-country courses.",
    biography: [
      "Wilmslow Running Club was formed in 1989 and is based beside Wilmslow Rugby Club on King's Road in Wilmslow, Cheshire, England. Its current club-managed website describes a friendly but race-focused community, supporting runners who want to improve at local, regional or national level.",
      "Tuesday training usually uses the club's track, with occasional alternative local venues announced to members. Interval work is organised in ability groups and includes a warm-up and cool-down. Members are asked to wear high-visibility clothing in the darker months. Periodic meals after training provide an opportunity to meet others away from the session itself.",
      "A Club Series gives members shared race targets, while road, trail, fell and cross-country competition offer different challenges. The club describes regular participation in the Manchester Area Cross Country League and national cross-country championships. Use the current website's contact facilities to enquire: its Join Us link returned a malformed destination during this review, so that link is not presented as a working registration route."
    ],
    founded_year: 1989,
    sources: [{ title: "Current club programme and contact form", url: "https://wilmslowrunningclub.info/aboutUs" }, { title: "Club-managed welcome dated 7 September 2022", url: "https://www.pitchero.com/clubs/wilmslowrunningclub2/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Wilmslow", website: "https://wilmslowrunningclub.info/aboutUs", address: "Wilmslow Rugby Club, King's Road, Wilmslow, SK9 5PZ", address_kind: "training" },
    location_note: "The track is adjacent to the rugby club; some sessions start elsewhere.",
    contact_note: "A contact form is visible on the current site. The malformed Join Us destination and supplier contacts are excluded."
  },
  "stowmarket-striders-rc": {
    summary: "Stowmarket Striders offers adult and junior running in Stowmarket, Suffolk, with coached sessions, trail outings, cross-country and local race organisation.",
    biography: [
      "Stowmarket Striders is a running club in Stowmarket, Suffolk, England, welcoming beginners and experienced runners. Its programme combines coached weekday training at Chilton Fields with seasonal trail outings and winter cross-country sessions at Haughley Park. Members also represent the club in local races, relays and county championships.",
      "The dedicated junior page describes sessions for ages seven to seventeen, with trial enquiries and a booking system. It warns that a waiting list sometimes operates, so families should enquire before attending. Adults can contact the membership secretary about trying a session. The club's race programme includes the Stowmarket Half Marathon and 10K, Friday 5, Scenic 7 and Golden Mile.",
      "In June 2026 England Athletics marked the club's fortieth-anniversary celebrations and described practical support for equipment storage and training additional coaches. Chair Rachel Oakley and coaching coordinator Chris Gladwell explained that development work. The article also discussed a planned New:Gen track, but it does not establish that the facility has since opened. An exact founding date is not inferred solely from the anniversary."
    ],
    notable_members: [
      { name: "Rachel Oakley", connection: "Chair interviewed in June 2026", detail: "Spoke to England Athletics about club support and facilities development in its 10 June 2026 feature." },
      { name: "Chris Gladwell", connection: "Coaching coordinator interviewed in June 2026", detail: "Described equipment storage and expanding the coaching team in England Athletics' club feature." }
    ],
    sources: [{ title: "Club programme, venues and membership email", url: "https://stowmarketstriders.org.uk/about-us/about-the-club/" }, { title: "Dedicated junior programme and enquiries", url: "https://stowmarketstriders.org.uk/about-us/junior-striders/" }, { title: "England Athletics club-development feature, 10 June 2026", url: "https://www.englandathletics.org/news/stowmarket-striders-showcase-the-benefits-of-club-affiliation/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://stowmarketstriders.org.uk/", address_kind: "training" },
    location_note: "Chilton Fields is a confirmed training base; seasonal sessions use other locations. The planned track is not described as open.",
    contact_note: "The junior-specific page gives ages 7–17, while the general page also contains older 7–14 wording. Confirm the appropriate group and available places."
  },
  "rodillian-runners": {
    summary: "Rodillian Runners is an adult running club in Stanley, Wakefield, training as one supportive group and organising a monthly social Distance League.",
    biography: [
      "Rodillian Runners is based in Stanley, Wakefield, England. The club trains as one group rather than dividing members into separate pace groups, with an emphasis on keeping runners together. Adults aged eighteen and over are welcome whether they are starting out, aiming for a race or looking for regular running company.",
      "Most Tuesday sessions meet at Stanley Rodillians Rugby Union Club on Lee Moor Road. Once a month the Distance League moves the meeting to another local location, combining a run with time to socialise afterwards. It is described as an internal training event with guests, not an open licensed road race; interested runners should use the club's contact form to ask about participation.",
      "Potential members can try three or four weeks of training without an obligation to join. The membership page explains the club subscription and optional competition licensing. Check the calendar before setting off, particularly on Distance League evenings. The rugby club is a published training base; the residential-style address previously supplied by the directory is not used as a meeting point."
    ],
    sources: [{ title: "Club approach, training base and trial sessions", url: "https://rodillianrunners.co.uk/" }, { title: "Membership and official social destinations", url: "https://rodillianrunners.co.uk/membership/" }, { title: "Distance League format", url: "https://rodillianrunners.co.uk/club-activities/distance-league/" }, { title: "Club enquiry form", url: "https://rodillianrunners.co.uk/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://rodillianrunners.co.uk/", county: "Wakefield", address: "Stanley Rodillians RUFC, Lee Moor Road, Stanley, Wakefield, WF3 4EF", postcode: "WF3 4EF", address_kind: "training" },
    location_note: "Stanley Rodillians RUFC is the usual training base; Distance League starts vary."
  },
  "athletics-ireland-barrow-harriers-a-c": {
    summary: "Barrow Harriers AC is a Graiguenamanagh athletics club in County Kilkenny, serving children from the town and surrounding Kilkenny and Carlow communities.",
    biography: [
      "Barrow Harriers AC is based in Graiguenamanagh, County Kilkenny, Ireland. The county athletics board lists it among the area's clubs. A KCLR report introducing an interview with club representative Ciara O'Farrell in April 2026 described a junior community drawn from the town and surrounding parts of Kilkenny and Carlow.",
      "The report described children aged six to fifteen preparing for county championships, following annual fundraising activity and support from Kilkenny Lions Club. These details describe the club at that time, rather than guaranteeing today's age groups or available places. A current timetable, precise training venue and usable direct joining contact were not established. The Athletics Ireland membership route is retained, while the unverified coordinate string is replaced by a town-level location."
    ],
    sources: [{ title: "Kilkenny Athletics County Board club directory", url: "https://kilkennyathletics.net/join-a-club/" }, { title: "KCLR introduction to club representative interview, 3 April 2026", url: "https://kclr96fm.com/athletics-club-with-90-members-from-kilkenny-and-carlow-focusing-on-next-championships/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Graiguenamanagh", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Graiguenamanagh town indicator only; no exact training venue confirmed.",
    contact_note: "Athletics Ireland's page was unavailable. The county board links the club's Facebook page; radio-station contacts are excluded. Only the interview's written introduction was reviewed."
  }
};
