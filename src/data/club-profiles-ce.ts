import type { ClubProfile } from "./club-profiles";

// Batch 83: recovered programmes, first-person histories and schools pathways.
export const recoveredRegionalAndSchoolsProfiles: Record<string, ClubProfile> = {
  "elvet-striders": {
    summary: "Elvet Striders is a Durham running club founded in 1985, bringing adult recreational runners and competitors together for road, trail, fell and cross-country running.",
    biography: [
      "Elvet Striders began in 1985 in Durham, County Durham, England. Its first-person Club Durham listing describes an adult club whose interests stretch from track athletics to ultras, with road, trail, fell and cross-country running along the way. Recreational runners are welcome alongside those entering races and the North East Harrier League.",
      "The listing describes Monday and Wednesday sessions throughout the year, using Durham University's Maiden Castle sports centre, Chester-le-Street's track and other local venues. These are different meeting places, not a single permanent start for every run. Check the club's latest programme before attending; the Palatine Centre address on the community directory is not presented here as a training venue.",
      "England Athletics named Elvet runner-up for North East Club of the Year in October 2025, highlighting inclusive sessions, outreach, charity work and sustainability. The same awards recognised volunteers Wendy Littlewood and Michael Littlewood, and newcomer Emma Thompson, whose contribution included helping the women's team make its first National Road Relays appearance. Those roles and recognitions refer to 2025, rather than confirming today's committee."
    ],
    founded_year: 1985,
    notable_members: [
      { name: "Wendy Littlewood", connection: "Chair recognised in 2025", detail: "England Athletics named her a North East Club Volunteer runner-up in its October 2025 awards." },
      { name: "Michael Littlewood", connection: "Men's captain recognised in 2025", detail: "Named a North East Club Volunteer runner-up by England Athletics in October 2025." },
      { name: "Emma Thompson", connection: "Women's co-captain recognised in 2025", detail: "England Athletics recognised her as a Newcomer to Volunteering runner-up in October 2025." }
    ],
    sources: [{ title: "First-person club programme and origins", url: "https://www.clubdurham.co.uk/clubs/elvet-striders-2/" }, { title: "England Athletics North East volunteer awards, 5 October 2025", url: "https://www.englandathletics.org/news/regional-volunteer-awards-2025-north-east/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Durham" },
    location_note: "The existing Graham Sports Centre address remains directory-listed. The club description also names Maiden Castle, Chester-le-Street's track and other session venues; confirm the start for your group.",
    contact_note: "The club's own joining page was unavailable. Existing directory social links retain their original check dates; no direct email or telephone is inferred."
  },
  "uckfield-runners": {
    summary: "Uckfield Runners offers beginner, social and structured running in Uckfield, East Sussex, with road and cross-country competition and occasional weekend trail outings.",
    biography: [
      "Uckfield Runners serves Uckfield in East Sussex, England. Known as Utopia Runners until September 2011, it welcomes beginners, recreational runners and competitors. Members take part in the Sussex Grand Prix and East Sussex Sunday Cross Country League, while others come for regular exercise and company rather than racing.",
      "The weekly programme offers a choice of shorter social runs, beginner walk-jog sessions and more demanding structured training. Published bases include Freedom Leisure, Victoria Park and Uckfield Rugby Club, with some locations changing by season. Occasional weekend trail outings add a different setting. Check which group and meeting point suit you before arriving, particularly for the faster hill and repetition sessions.",
      "New runners can try a session before joining. The membership page distinguishes affiliated membership and second-claim options, and explains that membership is optional for the 5K group. Christmas gatherings and a summer barbecue are part of the club's social calendar. Use the current website's joining and contact pages for details; the September 2011 change of name is not treated as a founding date."
    ],
    sources: [{ title: "Club background and name change", url: "https://uckfieldrunners.co.uk/about" }, { title: "Training groups and social activities", url: "https://uckfieldrunners.co.uk/training" }, { title: "Trial sessions and membership", url: "https://uckfieldrunners.co.uk/join" }, { title: "Contact page and official Facebook link", url: "https://uckfieldrunners.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://uckfieldrunners.co.uk/", address_kind: "training" },
    location_note: "Freedom Leisure is one training base; Victoria Park and the rugby club are also used. Confirm the seasonal meeting point.",
    contact_note: "The current .co.uk website replaces the old .org.uk route. Its email is obscured in the accessible page, so no address is guessed."
  },
  "quays-running-club": {
    summary: "Quays Running Club is a Salford running community whose founding members described mixed-ability training, friendship and shared social activities in a 2021 interview.",
    biography: [
      "Quays Running Club was described as a Salford-based, mixed-ability club in a first-person interview published by Salford Now on 11 October 2021. Founding member Claire Farmer explained that she, her husband Stuart and a friend had started the group a little over three years earlier. That recollection does not establish an exact foundation date.",
      "The account places friendship at the centre of the club's running in Greater Manchester, England: members trained together and met for coffee or meals as well as supporting one another's race ambitions. It offers a picture of the club's early community, not a confirmed current timetable. A present-day joining route and meeting point remain unresolved, so the former Bolton directory street address is not shown as a training destination."
    ],
    notable_members: [{ name: "Claire Farmer", connection: "Founding member", detail: "Described helping to establish Quays Running Club in a first-person interview published on 11 October 2021." }],
    sources: [{ title: "Founding member's first-person account, 11 October 2021", url: "https://www.salfordnow.co.uk/2021/10/11/it-was-one-of-them-moments-of-sheer-madness-quays-running-club-member-takes-part-in-london-marathon/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Salford", county: "Greater Manchester", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Salford is the club base described in the 2021 account, not a newly confirmed meeting point.",
    contact_note: "No readable current club contact or exact official social destination was established."
  },
  "welsh-athletics-welsh-schools-and-universities": {
    summary: "Welsh Schools & Universities is a national Welsh Athletics directory entry; its schools strand provides cross-country and track-and-field pathways across Wales.",
    biography: [
      "Welsh Schools & Universities is listed nationally by Welsh Athletics, rather than as a town-based weekly training club. The schools strand is described through the Welsh Schools Athletic Association, a registered charity supporting secondary-school cross-country and track and field across Wales.",
      "Eight school districts provide a route from school and district competition to Welsh championships and international schools opportunities, including SIAB events. The published 2026 programme reflects a transition to under-14, under-16 and under-18 age groups. Participation therefore follows school and district arrangements, rather than ordinary local-club membership.",
      "Schools and families should use the relevant school or district route and the published schools enquiry contact to establish eligibility and the current programme. The combined directory name does not by itself explain university entry arrangements, which remain unconfirmed here. No national-office address is presented as a shared training venue."
    ],
    scope: "national",
    sources: [{ title: "Welsh Athletics national directory entry", url: "https://www.welshathletics.org/en/club/view/welsh-schools" }, { title: "Welsh schools structure, programme and enquiries", url: "https://www.welshathletics.org/en/page/welsh-schools" }],
    reviewed_at: "2026-10-16",
    location_note: "National coverage within Wales, not a local clubhouse or a global club.",
    contact_note: "The directory's association contact is preserved alongside the schools programme enquiry address. University participation arrangements need separate confirmation."
  },
  "romsey-road-runners": {
    summary: "Romsey Road Runners is a Hampshire running club with a documented social and relay tradition, and community-listed training around Romsey.",
    biography: [
      "Romsey Road Runners brings runners together in Romsey, Hampshire, England. Its autumn 2015 Relay newsletter looked ahead to a thirtieth-anniversary walk and run, and described club relay teams, new members' experiences and shared social occasions. It also identified Keith Stone as a senior founding member, providing a direct link to the club's early years without establishing an exact founding date here.",
      "A first-person community listing published in July 2022 described Monday training from Woodley Village Hall and Thursday sessions at Mountbatten School, including summer track running. These are dated arrangements, not a confirmed current weekly timetable. They demonstrate why one directory address should not be assumed to cover every session.",
      "The same community entry supplies the club secretary's public enquiry email. Prospective runners should ask about today's groups, meeting points and age eligibility before attending: the older listing mentions ages fifteen and over, while the governing-body record categorises adult membership. Current club pages were unavailable, so that difference is left unresolved rather than silently changing the entry."
    ],
    notable_members: [{ name: "Keith Stone", connection: "Founding member", detail: "The club's autumn 2015 Relay newsletter identifies him as a senior founding member; this is a historical association." }],
    sources: [{ title: "Relay newsletter, autumn 2015, opening pages", url: "https://www.romseyroadrunners.co.uk/wp-content/uploads/2015/08/Relay_Autumn2015.pdf" }, { title: "First-person community listing published 1 July 2022", url: "https://romseyareainfo.net/organisation/?sf_paged=26" }],
    reviewed_at: "2026-10-16",
    location_note: "Romsey Sports Centre remains a directory-listed address, not a newly confirmed weekly start. The July 2022 description names other venues.",
    contact_note: "The secretary email comes from the dated community listing. Current timetable and age eligibility still need confirmation."
  },
  "tiverton-harriers": {
    summary: "Tiverton Harriers serves adult and junior runners in Tiverton, Devon, with community-listed coached running and junior athletics across seasonal venues.",
    biography: [
      "Tiverton Harriers is a running club in Tiverton, Devon, England, with separate adult and junior descriptions in the town's community clubs directory. The first-person senior listing welcomes runners able to run for about thirty minutes at any pace and describes coached Tuesday and Thursday sessions. It names Heathcoat's Westexe site and summer school tracks, but the undated information should not be used as a guaranteed meeting instruction.",
      "The junior entry describes running and some field-event activity from age eight, with seasonal use of Knightshayes, Exe Valley Leisure Centre's astroturf and Tiverton High School's grass track. Families have a separate coaching contact, while adults can approach the published membership secretary. Different age groups and seasons have different arrangements.",
      "The club's own pages could not be read during this review. Confirm present venues, available places and entry requirements before travelling or paying; the community directory's fees and schedules are not treated as current confirmations. Tiverton is shown as an area indicator because the incomplete street address previously in the catalogue did not establish a usable training destination."
    ],
    sources: [{ title: "First-person senior club community listing", url: "https://tivertonclubs.co.uk/club/62FP/tiverton-harriers-athletic-club-seniors" }, { title: "First-person junior club community listing", url: "https://tivertonclubs.co.uk/club/6BPW/tiverton-harriers-athletic-club-juniors" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Tiverton", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Town-level indicator only. The undated community listings describe several venues; current starts need confirmation.",
    contact_note: "Published membership and junior-coaching contacts come from the community listings, not a freshly readable club website."
  },
  "athletics-ireland-ballyduff-a-c": {
    summary: "Ballyduff AC is a County Waterford athletics club whose early team cross-country participation was documented by host club West Waterford in October 2026.",
    biography: [
      "Ballyduff Athletic Club is listed by Athletics Ireland in County Waterford, Ireland, with Ballyduff Upper Community Field as its club venue. A West Waterford AC report dated 4 October 2026 described Ballyduff as a newly formed club making its first cross-country outing. Both its men's and women's novice teams earned silver medals at the county fixture hosted at St Augustine's College in Abbeyside.",
      "That host-club account records an early team milestone, not an exact foundation date or a claim about individual athletes. The existing Athletics Ireland enquiry details provide a route to ask about joining, age groups and training. Their original 13 October check date is retained because the directory could not be reopened on 16 October. The competition venue in Abbeyside should not be confused with Ballyduff's directory-listed base."
    ],
    sources: [{ title: "Host club's report dated 4 October 2026", url: "https://www.westwaterfordathletics.org/senior-news-october-04-2026/" }, { title: "Existing Athletics Ireland club record, checked 13 October 2026", url: "https://membership.athleticsireland.ie/clubpage/Ballyduff_A.C." }],
    reviewed_at: "2026-10-16",
    location_note: "Ballyduff Upper Community Field is the retained directory venue; St Augustine's College was the reported competition venue.",
    contact_note: "Existing club email, phone and Instagram provenance are preserved. Current age groups and training times remain unconfirmed."
  },
  "harleston-running-club": {
    summary: "Harleston Running Club combines coached sessions, social runs and optional racing around Harleston, Norfolk, with a free first session and several membership routes.",
    biography: [
      "Harleston Running Club serves Harleston in Norfolk, England. Its published programme combines Tuesday coaching at Harleston Magpies Hockey Club with Thursday social runs from the town's Market Place. The hockey-club session uses a flat grass circuit, while occasional hill work takes runners elsewhere. Qualified leaders support the groups.",
      "Members can take part in road, trail and cross-country events, but racing is not compulsory. Sunday breakfast runs and visits to parkrun add a social element. The club's 2026–27 joining page offers a free first session after registration and distinguishes affiliated, social or second-claim, and adult student membership options.",
      "The club website introduced Tom Pullinger as chair and head coach in May 2022, a dated account of his involvement rather than proof of today's committee role. New runners can use the contact form or published club phone contacts to discuss a suitable session. Confirm the meeting point before attending: the town-centre social run and the hockey-club training base are separate places."
    ],
    notable_members: [{ name: "Tom Pullinger", connection: "Chair and head coach in a 2022 profile", detail: "The club's autobiographical introduction dated 21 May 2022 records these roles; current office-holding is not inferred." }],
    sources: [{ title: "Club homepage and Norfolk town identity", url: "https://harlestonrunningclub.co.uk/" }, { title: "Coaching, social runs and activities", url: "https://harlestonrunningclub.co.uk/club-info/" }, { title: "2026–27 membership and free first session", url: "https://harlestonrunningclub.co.uk/join-us/" }, { title: "Public enquiry form and phone contacts", url: "https://harlestonrunningclub.co.uk/contact/" }, { title: "Tom Pullinger's club introduction, 21 May 2022", url: "https://harlestonrunningclub.co.uk/tom-pullinger/" }],
    reviewed_at: "2026-10-16",
    corrections: { county: "Norfolk", website: "https://harlestonrunningclub.co.uk/", address_kind: "training" },
    location_note: "Harleston is the Norfolk town served by the club. The hockey ground is the Tuesday training venue; Thursday social runs start in Market Place."
  },
  "westbourne-r-c": {
    summary: "Westbourne Running Club is a Bournemouth community club with roots at LV=, offering road and off-road racing, social running and several membership options.",
    biography: [
      "Westbourne Running Club grew from a group at LV= and now describes itself as an independent community club in Bournemouth, Dorset, England. Running, racing and time together over coffee all feature in its account of club life. The published history does not give an exact founding year.",
      "Competition includes a club championship drawn from a selection of local races, with runners counting their best performances rather than needing to enter every event. The club also highlights the Dorset Road Race League and off-road opportunities such as the Purbeck Trail and Upton Summer Series. These are participation opportunities, not a claim that Westbourne organises each event.",
      "First-claim membership includes England Athletics registration and club championship eligibility. Second-claim and social membership provide other ways to train and belong, with different competition entitlements. Prospective members can use the published club email and membership form to ask about a suitable group. Confirm the current training venue: Bournemouth is shown as the club's area, without treating the previous Poole street address as a verified meeting point."
    ],
    sources: [{ title: "Club roots and community identity", url: "https://www.westbournerc.co.uk/about" }, { title: "Membership categories and enquiry email", url: "https://www.westbournerc.co.uk/membership" }, { title: "Championship and local race participation", url: "https://www.westbournerc.co.uk/races" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Bournemouth", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Bournemouth is an area indicator, not a clubhouse or a confirmed start for every session.",
    contact_note: "The published club email supplements the existing directory-sourced Facebook link, whose original check date is retained."
  },
  "trafford-athletic-club": {
    summary: "Trafford Athletic Club offers track and field and distance running at Longford Park, Greater Manchester, with roots in Stretford AC and a staged junior coaching pathway.",
    biography: [
      "Trafford Athletic Club began as Stretford AC, formed in 1965 around the new Longford Park stadium in Greater Manchester, England. A merger with Cheadle and Gatley AC followed in 1966. Rick Gwilt's club history describes how school recruitment, volunteer coaches and midweek track meetings helped build its teams. Former members documented in that account include Yvonne Saunders, Christine Perera, Nnenna Njoku and Sharon Colyear.",
      "Today the club manages Trafford Athletic Stadium on behalf of the borough council. Its training information covers track and field from age nine, with Monday and Thursday club nights. Younger athletes develop running, jumping, throwing and hurdling skills before moving towards more specialised groups in consultation with coaches.",
      "The under-eleven group normally has a waiting list, so families should email the club before visiting. Published pages disagree about the youngest group's precise session time; confirm it rather than relying on either timetable. The stadium's public opening hours are also distinct from club training and may change for bookings. General club enquiries and open-meeting enquiries have separate role addresses."
    ],
    founded_year: 1965,
    notable_members: [
      { name: "Yvonne Saunders", connection: "Former Stretford athlete", detail: "The club history records her early high-jumping involvement before her family emigrated to Canada." },
      { name: "Christine Perera", connection: "Former Stretford hurdler", detail: "Also known as Christine Bell, she is described in the club history as an early senior international athlete." },
      { name: "Nnenna Njoku", connection: "Former Stretford athlete", detail: "The club history describes her youth development and continued club involvement into the 1970s." },
      { name: "Sharon Colyear", connection: "Former Stretford athlete", detail: "The club history identifies her with its women's team before her move to the United States in the 1970s." }
    ],
    sources: [{ title: "Rick Gwilt's primary club history, 2022", url: "https://www.traffordac.co.uk/php/index.php?menu_id=130&script=clubHistory" }, { title: "Training and public stadium access", url: "https://www.traffordac.co.uk/php/index.php?script=openingTimes" }, { title: "Under-eleven development and waiting list", url: "https://www.traffordac.co.uk/php/index?script=u11Training" }, { title: "Stadium address and role contacts", url: "https://www.traffordac.co.uk/php/index.php?menu_id=12&script=contactUs" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.traffordac.co.uk/", address_kind: "training" },
    location_note: "Longford Park's stadium is in Trafford but has a Manchester postal address, as the club history explains. It is a training facility, not a correspondence-only address.",
    contact_note: "The general training and under-eleven pages give different youngest-group times. Confirm availability and timing by email; website and advertising contacts are excluded."
  },
  "torbay-aac": {
    summary: "Torbay AAC is a Torquay-based athletics and running club formed in 1970, with adult and junior groups, seasonal training bases and a three-session adult trial.",
    biography: [
      "Torbay Athletic Club was formed in 1970 when Paignton AC's road and cross-country runners joined with the track-focused Torquay AAC. The club's own history places that merger within a much older local running tradition, rather than treating nineteenth-century predecessor activity as the present club's founding date. It serves Torquay and the wider Torbay area of Devon, England.",
      "The adult training page distinguishes winter runs from the Riviera Centre and summer sessions from the Torre Valley North playing-fields clubhouse. Tuesday and Thursday evenings are the published club nights, but newcomers should confirm the seasonal start. The 2026–27 joining page offers three free sessions, a new-members contact and a separate enquiry route for senior beginners.",
      "The young-athletes section welcomes enquiries for ages eight to eighteen and works with local secondary schools. Primary- and secondary-school groups have different seasonal schedules, so parents should contact the junior coaches about admissions and availability. The club's Grand Prix also emphasises taking part, supporting teammates and sharing the social side of local racing."
    ],
    founded_year: 1970,
    sources: [{ title: "Club merger and predecessor history", url: "https://torbayaac.co.uk/club-history" }, { title: "2026–27 adult membership and trial sessions", url: "https://torbayaac.co.uk/join" }, { title: "Seasonal adult training venues", url: "https://torbayaac.co.uk/club-info/where-we-train" }, { title: "Junior ages, admissions and coaching contact", url: "https://torbayaac.co.uk/sample-page" }, { title: "Club role contacts", url: "https://torbayaac.co.uk/contact" }, { title: "Grand Prix participation ethos", url: "https://torbayaac.co.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://torbayaac.co.uk/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Torquay is an area indicator. Winter and summer adult sessions use different venues; the former Branscombe Close address is not presented as a training base.",
    contact_note: "Use the new-members or junior-coaching contacts as appropriate. Ambiguous president and membership-secretary text on the contact page is not used to add extra addresses."
  }
};
