import type { ClubProfile } from "./club-profiles.ts";

// Primary club pages opened 15 October 2026. Editorial associations are not athlete identities.
export const regionalClubAccessProfiles: Record<string, ClubProfile> = {
  "newcastle-staffs-tri-club": {
    summary: "Newcastle (Staffs) Tri Club offers swim, bike and run coaching across Newcastle-under-Lyme, Stoke-on-Trent and South Cheshire, with adult and junior pathways.",
    biography: [
      "Newcastle (Staffs) Tri Club is based in Newcastle-under-Lyme, Staffordshire, England, and trains across the town, Stoke-on-Trent and South Cheshire. Members can take part in swimming, cycling and running together or choose just one or two disciplines. The programme welcomes beginners alongside experienced competitors.",
      "Coached sessions support adults and juniors, while members compete in triathlons, duathlons, aquathlons and local running races. Club competitions and social events provide shared goals and opportunities to meet people outside training. Junior membership has its own arrangements and support for selected races and kit.",
      "New participants can create an account and book a two-week trial before committing to membership; the published offer excludes people who have previously been members or taken a trial. Contact the membership secretary or head coach to choose suitable sessions. Training uses several venues, so the general club postcode should not be treated as a universal meeting point."
    ],
    sources: [{ title: "Club introduction", url: "https://clubs.britishtriathlon.org/NewcastleStaffsTriClub" }, { title: "Training area and disciplines", url: "https://clubspark.net/NewcastleStaffsTriClub/Aboutus" }, { title: "Trial eligibility and membership", url: "https://clubspark.net/NewcastleStaffsTriClub/Membership/Join" }, { title: "Public role contacts", url: "https://clubspark.net/NewcastleStaffsTriClub/Contact" }],
    reviewed_at: "2026-10-15",
    location_note: "The club trains at multiple venues in Newcastle-under-Lyme, Stoke-on-Trent and South Cheshire. Northwood Stadium is retained from the governing-body directory; confirm the location of the booked session.",
    corrections: { city: "Newcastle-under-Lyme", county: "Staffordshire", website: "https://clubspark.net/NewcastleStaffsTriClub" }
  },
  "newcastle-frontrunners": {
    summary: "Newcastle Frontrunners is an inclusive running club with an LGBTQ+ community focus, offering Rainbow Runs, coached development and social outings around Newcastle upon Tyne.",
    biography: [
      "Newcastle Frontrunners welcomes runners in Newcastle upon Tyne and the wider north-east of England, with a particular focus on LGBTQ+ people and their allies. Its published aims include participants aged sixteen and over. It belongs to the International Frontrunners network while remaining a locally based club.",
      "Wednesday Rainbow Runs start outside Gosforth Leisure Centre and offer groups organised around running ability. New runners should be able to cover a mile without stopping and complete the joining form before receiving attendance details. Monday members-only sessions alternate between strength and conditioning and run development; the latter expects continuous three-mile ability.",
      "The programme also includes cross-country in the North East Harrier League and a club grand prix. Leader-led social outings are arranged when volunteers are available, rather than guaranteed every Sunday. Members use booking and discussion channels for those runs, often finishing with coffee and cake. Contact the club for the right starting group and current arrangements."
    ],
    sources: [{ title: "Community and coaching", url: "https://www.newcastlefrontrunners.co.uk/" }, { title: "Session-specific requirements", url: "https://www.newcastlefrontrunners.co.uk/about-3" }, { title: "Club aims", url: "https://www.newcastlefrontrunners.co.uk/about-nfr" }, { title: "Joining enquiries and base", url: "https://www.newcastlefrontrunners.co.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "Gosforth Leisure Centre is the Wednesday meeting point; Monday training and booked leader-led runs use other venues.",
    corrections: { address: "Gosforth Leisure Centre, Regent Farm Road, Gosforth, Newcastle upon Tyne", postcode: "NE3 3HD", address_kind: "training", adult_only: false }
  },
  "mole-valley-runners": {
    summary: "Mole Valley Runners explores the Surrey Hills through sociable, leader-led groups, with run-walk options, longer outings and a monthly pub run.",
    biography: [
      "Mole Valley Runners was founded by Debbie Watts in 2016 and became affiliated to England Athletics in 2018. Based in Surrey, England, the club brings together people with very different running ambitions, from building confidence on a short outing to preparing for an ultramarathon.",
      "Its Surrey Hills programme includes daytime and evening runs led by qualified volunteers. Run-walk groups cover shorter routes, while steady and continuous-running groups offer longer distances. A monthly Friday pub run uses a loop-back approach to keep the group together before the social gathering afterwards.",
      "Newcomers can book a free trial through RunTogether and use the published group descriptions to choose an appropriate distance. Meeting points vary, so booking details matter more than a single directory address. The club asks runners to bring suitable lighting and visible clothing when conditions require them."
    ],
    founded_year: 2016,
    notable_members: [{ name: "Debbie Watts", connection: "Founder", detail: "The club's mission page credits Watts with establishing Mole Valley Runners in 2016." }],
    sources: [{ title: "Origins and mission", url: "https://www.molevalleyrunners.org/contents/408-our-mission" }, { title: "Groups and trial booking", url: "https://www.molevalleyrunners.org/contents/448-club-runs" }],
    reviewed_at: "2026-10-15",
    location_note: "Runs use different Surrey Hills meeting points. Confirm the start through the session booking rather than assuming every group meets at the directory address.",
    corrections: { website: "https://www.molevalleyrunners.org/" }
  },
  "momentum-track-club": {
    summary: "Momentum Track Club is a Kingston upon Thames athletics club established in 2025, combining track-and-field coaching with a team approach to competition.",
    biography: [
      "Momentum Track Club was established in 2025 in Kingston upon Thames, England. Its main base is the Weir Archer Athletics Stadium, where the programme welcomes children from six upwards alongside older juniors, seniors and masters. Sprinting, distance running, hurdles, jumps and throws all form part of its athletics offering.",
      "The club describes an athlete-first approach: members are encouraged to develop in events that suit them rather than simply fill a team place. Membership combines coaching with support at competitions, while strength work, sports therapy and social activities contribute to the wider training environment.",
      "Prospective athletes should email the coaching team to discuss age, experience and suitable sessions before joining. The club's membership and contact pages distinguish coaching enquiries from administrative roles. Momentum Sports' earlier history is not the founding date of this newer athletics club."
    ],
    founded_year: 2025,
    sources: [{ title: "Club introduction and disciplines", url: "https://www.momentumsports.co.uk/MomentumTrackClub.asp" }, { title: "Membership support", url: "https://www.momentumsports.co.uk/MomentumTrackClubMembership.asp" }, { title: "Club enquiry roles", url: "https://www.momentumsports.co.uk/MomentumTrackClubContacts.asp" }],
    reviewed_at: "2026-10-15", corrections: { address_kind: "training" }
  },
  "morley-running-club": {
    summary: "Morley Running Club offers free Wednesday group running from Morley Cricket Club, with distances chosen to fit roughly an hour of shared activity.",
    biography: [
      "Morley Running Club began on 19 July 2017 in Morley, West Yorkshire, England. It is free to join and run with, providing a local route into regular exercise without an annual club fee. Wednesday evenings bring runners together at Morley Cricket Club on Scatcherd Lane.",
      "The group system is based on the distance covered in about an hour, not on a numbered pace ranking. Options range from approximately five kilometres to eleven or twelve kilometres, allowing runners to select a manageable outing. The published arrangements ask people to gather before the seven o'clock start.",
      "Register through RunTogether and book the appropriate session before attending. The website also links members with the Morley 10K, parkrun activity and a wider events calendar. Anyone unsure which group to choose can use the public enquiry form to ask the club."
    ],
    founded_year: 2017,
    sources: [{ title: "Club origins and activities", url: "https://www.morleyrunningclub.com/" }, { title: "Joining and distance groups", url: "https://www.morleyrunningclub.com/how-to-join-us" }, { title: "Enquiry form", url: "https://www.morleyrunningclub.com/contact" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Morley", county: "West Yorkshire", address: "Morley Cricket Club, Scatcherd Lane, Morley", postcode: "LS27 0JJ", address_kind: "training" }
  },
  "mornington-chasers": {
    summary: "Mornington Chasers combines north London club runs, Parliament Hill track sessions and cross-country racing with a separate route for complete beginners.",
    biography: [
      "Mornington Chasers was formed on 2 December 1986 at the Working Men's College on Crowndale Road in Camden, London, England. The club now brings runners together around Kentish Town, with Tuesday outings from Talacre Community Sports Centre and coached Thursday sessions at Parliament Hill Track.",
      "Members take part in road, trail, track and cross-country events, including the Metropolitan League and the club's Regent's Park 10K. Tuesday tea and biscuits, monthly pub nights and volunteer-led activities give the programme a social side beyond racing.",
      "Regular sessions are intended for people who can already run five kilometres continuously; a separate beginners programme supports those working towards that point. Obtain temporary membership before a first ordinary club visit and use the current joining page for the terms. Sunday runs and other informal outings are arranged through the members' calendar, often only shortly beforehand."
    ],
    founded_year: 1986,
    sources: [{ title: "Founding meeting", url: "https://www.chaser.me.uk/about/history.php" }, { title: "Training, racing and volunteering", url: "https://www.chaser.me.uk/about/about.php" }, { title: "First-visit requirements and venues", url: "https://www.chaser.me.uk/contact/contacts.php" }, { title: "Membership options", url: "https://www.chaser.me.uk/joining/join.php" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.chaser.me.uk/", address_kind: "training" }
  },
  "mossley-hill-ac": {
    summary: "Mossley Hill AC's running section traces its roots to South Liverpool AC in 1977 and trains from the Mossley Hill clubhouse for road, trail and cross-country running.",
    biography: [
      "Mossley Hill AC's running section began as South Liverpool AC, founded by six members in 1977. In 2002 it joined the wider Mossley Hill Athletic Club in Liverpool, Merseyside, England. That running history is distinct from the origins of the host multisport organisation.",
      "Monday and Wednesday evening groups meet at the clubhouse on Mossley Hill Road, opposite Sudley House. Steady running and faster effort sessions cater for different paces and distances, with the clubhouse providing changing facilities and somewhere to socialise afterwards.",
      "Members run road distances from parkrun to the marathon and also take part in trail events and winter cross-country, including the Liverpool and District programme. Competition is not compulsory. New runners are invited to contact the section and arrange a couple of trial sessions before deciding whether to join."
    ],
    founded_year: 1977,
    sources: [{ title: "Running-section history", url: "https://mossleyhillrunning.org.uk/history" }, { title: "Training, clubhouse and enquiries", url: "https://mossleyhillrunning.org.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { county: "Merseyside", website: "https://mossleyhillrunning.org.uk/", address: "Mossley Hill Athletic Club, 9 Mossley Hill Road, Liverpool", postcode: "L18 4PT", address_kind: "training" }
  },
  "mossley-running-club": {
    summary: "Mossley Running Club has offered social road and trail running in Tameside since 2015, with three weekly outings and a trial route for newcomers.",
    biography: [
      "Mossley Running Club was established in 2015 in Mossley, Tameside, England. Its base at Mossley AFC's Seel Park gives local runners a meeting point for road and trail outings, while members' interests extend from shorter races to marathons and ultras. It is separate from Mossley Hill AC in Liverpool.",
      "The regular programme offers Wednesday and Friday evening runs and a Sunday morning outing. Members meet before the advertised start so groups can organise themselves. Away days and social events add opportunities to explore other routes and get to know people beyond the weekly sessions.",
      "The club offers three trial sessions before membership. Email the public club address first to arrange a visit and choose an appropriate group. Members use TeamUp for club arrangements; prospective runners should check the current calendar rather than assume every outing starts at the same place."
    ],
    founded_year: 2015,
    sources: [{ title: "Club introduction", url: "https://www.mossleyrunningclub.com/" }, { title: "Weekly runs", url: "https://www.mossleyrunningclub.com/club-runs" }, { title: "Trials and membership", url: "https://www.mossleyrunningclub.com/membership" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Mossley", address: "Mossley AFC, Seel Park, Market Street, Mossley", address_kind: "training" }
  },
  "mote-runners": {
    summary: "Mote Runners is a Maidstone club founded in 2019, offering Tuesday social groups and a separate Thursday training session from its Mote Park base.",
    biography: [
      "Mote Runners was founded in 2019 in Maidstone, Kent, England, with an emphasis on supportive running and enjoyment. The club is based at the Mote Cricket Club pavilion on Willow Way, close to the paths of Mote Park. Pavilion facilities provide a place to meet and socialise around the run.",
      "Tuesday evenings include a beginner walk-jog group working towards five kilometres, as well as longer group routes. A backmarker supports the beginner session. Summer runs use Mote Park, while winter outings move onto local roads and require suitable visible clothing.",
      "Thursday's members-only session focuses on structured work such as hills and intervals; it is distinct from the Tuesday newcomer route. Contact the club by email or its enquiry form to discuss joining and the appropriate group. Check the session details before arriving, including the meeting time ahead of the run."
    ],
    founded_year: 2019,
    sources: [{ title: "Origins and pavilion facilities", url: "https://www.moterunners.co.uk/about-us/" }, { title: "Training groups", url: "https://www.moterunners.co.uk/training/" }, { title: "Pavilion address and enquiries", url: "https://www.moterunners.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "The Mote Cricket Pavilion, Willow Way, Maidstone", postcode: "ME15 7RN", address_kind: "training" }
  },
  "nantwich-running-club": {
    summary: "Nantwich Running Club grew from its first group runs in March 2021 into a volunteer-led Cheshire club with road, trail and cross-country interests.",
    biography: [
      "Nantwich Running Club was formed in February 2021, with its first group runs taking place on 29 March that year. Based in Nantwich, Cheshire, England, it developed quickly enough to receive regional club recognition in November 2022 and a national award in January 2023.",
      "The club's 2023/24 members' guide describes road, trail and cross-country running, volunteer support for the Nantwich 10K and participation in North Staffordshire leagues. Malbank High School is the main group-run base, with access to the meeting car park from Water Lode rather than simply following the school's postal address.",
      "That guide also describes Spond booking, trial runs and occasional track sessions in Crewe. Because the website is being rebuilt, confirm current sessions, age requirements and joining arrangements with the membership team. Its current holding page provides separate public email addresses for membership and general enquiries."
    ],
    founded_year: 2021,
    sources: [{ title: "Club's 2023/24 members' guide", url: "https://nantwichrunningclub.co.uk/wp-content/uploads/2023/08/NRC-Members-Guide-2023-24.pdf" }, { title: "Current membership and general enquiries", url: "https://nantwichrunningclub.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "The members' guide directs runners to Malbank High School's main car park off Water Lode. Confirm the current meeting arrangements while the website is being rebuilt.",
    corrections: { website: "https://nantwichrunningclub.co.uk/", address_kind: "training" }
  },
  "nej-running-club": {
    summary: "NEJ Running Club has brought runners and joggers together in Eltham since 1987, with evening groups, countryside outings and a social programme.",
    biography: [
      "NEJ Running Club was formed in 1987 and is based in Eltham, south-east London, England. Its home is the Pavilion Sports and Leisure Club, where Wednesday and Friday evening sessions offer a choice of distances and paces, including walking options.",
      "Sunday outings explore the Kent countryside, and a separate social programme runs alongside the training calendar. The club's newcomer guidance recommends Wednesday as a first visit, arriving before the seven o'clock start so someone can help identify a suitable group.",
      "Membership questions go to the membership team, while general enquiries have a separate club address and public form. Pavilion Sports Club membership and its car-park access card are not included automatically in NEJ membership: those arrangements must be made separately with the venue. Confirm the latest session details before attending."
    ],
    founded_year: 1987,
    sources: [{ title: "Origins and running programme", url: "https://www.nejrunningclub.co.uk/" }, { title: "Newcomer guidance and public contacts", url: "https://www.nejrunningclub.co.uk/Home/ContactUs" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Eltham", county: "Greater London", address: "The Pavilion Sports and Leisure Club, Eltham", address_kind: "training" }
  },
  "nepal-run": {
    summary: "Nepal Run UK connects community running with volunteering and charitable activity, promoting regular exercise and supporting running-related projects.",
    biography: [
      "Nepal Run UK is a community running organisation in the United Kingdom that encourages people to become more active through shared running. Its public programme brings health awareness, participation and charitable activity together, rather than presenting competitive results as the only reason to run.",
      "The website promotes the Northolt 10K in west London and links with Reading Nepali Runners' 10K. It also invites donations to the Mira Rai Initiative's proposed trail-running centre. That fundraising support is an organisational association, not evidence that Mira Rai is a Nepal Run club member.",
      "People interested in taking part can use the member-registration page, volunteer links or public enquiry form. The website does not establish one permanent training start or a detailed weekly timetable, so newcomers should ask where and when to meet. The name and international charitable links do not make the club a Nepal-based or explicitly global organisation."
    ],
    sources: [{ title: "Community aims, events and charitable support", url: "https://nepalrun.org/" }, { title: "Member registration", url: "https://nepalrun.org/member-registration/" }, { title: "Public enquiry form", url: "https://nepalrun.org/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "The organisation identifies itself as Nepal Run UK. Confirm individual event or training locations; no permanent meeting address is asserted."
  },
  "netherhall-ac": {
    summary: "Netherhall Athletics Club has offered road, fell and trail running around Maryport and west Cumbria since March 2018, with training adapted to different abilities.",
    biography: [
      "Netherhall Athletics Club was established in March 2018 in Maryport, Cumbria, England. It brings together competitive and social runners for road, trail and fell running across the surrounding countryside. Racing regularly is optional; enjoying running and company is the common thread.",
      "Tuesday sessions usually start at Netherhall Community Sports Centre and concentrate on road-based intervals or speed work. Thursday outings use mixed terrain and changing venues, with groups organised by ability. An occasional Sunday social explores trails or fells, often finishing at a café or pub.",
      "The club asks prospective participants to be able to run around four miles, without a particular pace requirement. Routes and sessions can then be adapted for the group. Training details are shared through Spond; use the public enquiry form to arrange a first visit and confirm the current meeting place."
    ],
    founded_year: 2018,
    sources: [{ title: "Club origins and membership ethos", url: "https://netherhallac.org.uk/wp/about-us/" }, { title: "Training and entry guidance", url: "https://netherhallac.org.uk/wp/training-2/" }, { title: "Public enquiry form", url: "https://netherhallac.org.uk/wp/contact-us/" }],
    reviewed_at: "2026-10-15", corrections: { address_kind: "training" }
  },
  "nettleham-trotters-running-group": {
    summary: "Nettleham Trotters offers sociable, leader-supported running from Mulsanne Park near Lincoln, welcoming improvers as well as more experienced distance runners.",
    biography: [
      "Nettleham Trotters is a running group based at Mulsanne Park in Nettleham, Lincolnshire, England. Its public introduction describes a social group whose members range from beginners and improvers to runners interested in longer distances and ultras.",
      "Monday and Thursday sessions combine group running with structured training led by experienced leaders. The Mulsanne Park location places the group in the village of Nettleham rather than in central Lincoln. Prospective runners can use the published runs list to see the available sessions.",
      "The group's England Athletics-hosted site provides a public contact form for questions about ability, joining and the next suitable run. Check those arrangements before travelling to the park. A founding date and a detailed competition history are not established by the current public pages."
    ],
    sources: [{ title: "Group introduction and sessions", url: "https://clubspark.englandathletics.org/NettlehamTrotters" }, { title: "Enquiries and meeting location", url: "https://clubspark.englandathletics.org/NettlehamTrotters/Contact" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Nettleham", website: "https://clubspark.englandathletics.org/NettlehamTrotters", address_kind: "training" }
  },
  "new-forest-runners": {
    summary: "New Forest Runners has combined forest outings, New Milton training and beginner support since 1981, with daytime Mudlarks groups and volunteer-run events.",
    biography: [
      "New Forest Runners was formed in September 1981 to encourage running for enjoyment and fitness. Based at Fawcetts Field in New Milton, Hampshire, England, the club has access to a grass track and trim trail as well as the open routes of the New Forest.",
      "Wilverley Plain is a principal forest meeting point, while evening training changes with the seasons. The daytime Mudlarks meet for sociable runs and coffee, and Sunday groups tackle longer routes. Coaching, Couch to Club Runner courses and local race leagues provide different ways to participate.",
      "The club organises events including the New Forest 10 and relies on members helping with tasks such as marshalling. Prospective members can enquire about trying a session before joining. Confirm the calendar and meeting location, especially for away days or beginner courses; a future course announcement is not an invitation to arrive at an ordinary session without checking."
    ],
    founded_year: 1981,
    sources: [{ title: "Origins, facilities and activities", url: "https://www.newforestrunners.com/about-us" }, { title: "Current programme", url: "https://www.newforestrunners.com/" }, { title: "Clubhouse and public enquiries", url: "https://www.newforestrunners.com/contact" }],
    reviewed_at: "2026-10-15",
    location_note: "Fawcetts Field is the club base; forest runs commonly meet at Wilverley Plain, with other starts shown in the calendar.",
    corrections: { city: "New Milton", county: "Hampshire", address: "Fawcett Field Social Club, Christchurch Road, New Milton", postcode: "BH25 6QF", address_kind: "training" }
  },
  "new-marske-harriers-club": {
    summary: "New Marske Harriers grew from a village athletics initiative into a road, cross-country and track-and-field club, with its track base at Laurence Jackson School in Guisborough.",
    biography: [
      "New Marske Harriers was formally established in April 1986 after initial sessions in late 1985. Peter Boulton's effort to create local athletics opportunities in New Marske brought together volunteers and coach Tom Farrell. The club now serves the Redcar and Cleveland area of England, with a track base at Laurence Jackson School in Guisborough.",
      "Its programme spans junior and senior track and field, road running and cross-country. The youngest Minnows sessions serve children aged eight to eleven; older juniors and seniors have separate enquiry routes. Newcomers should contact the relevant coordinator to discuss the appropriate session.",
      "Former chairman Harry Gamble-Thompson and long-serving volunteer Yvonne helped the fundraising effort that secured the track. The club's historical account also records Olympic associations with former member Johanna Jackson and pentathlete Katy Livingston. President Tanni Grey-Thompson is an eleven-time Paralympic champion and a supporter of club events; these distinct historical and honorary connections should not be read as a current competition roster."
    ],
    founded_year: 1986,
    notable_members: [
      { name: "Harry Gamble-Thompson", connection: "Former runner and chairman", detail: "The club's tribute records his veteran marathon career and ten years as chairman, including fundraising for the Laurence Jackson track. He died in 2019." },
      { name: "Yvonne Gamble-Thompson", connection: "Long-serving volunteer and membership secretary", detail: "The club records more than thirty years of service and practical fundraising for its track; she was primarily a volunteer, not a competitive runner. She died in 2023." },
      { name: "Tanni Grey-Thompson", connection: "Club president", detail: "The official club page identifies the eleven-time Paralympic gold medallist as president and describes her involvement in club events and volunteering." },
      { name: "Johanna Jackson", connection: "Former member", detail: "The club's history explicitly identifies Jackson as a former member who represented Great Britain in Olympic race walking." },
      { name: "Katy Livingston", connection: "Historical club association", detail: "The club's historical account records Livingston among its athletes who represented Great Britain at the Olympics, in modern pentathlon; no current membership is asserted." }
    ],
    sources: [{ title: "Founding account", url: "https://www.new-marske-harriers.co.uk/club-history/" }, { title: "Harry and Yvonne's club service", url: "https://www.new-marske-harriers.co.uk/harry-yvonne-gamble-thompson/" }, { title: "Club president", url: "https://www.new-marske-harriers.co.uk/baroness-tanni-grey-thompson-dbe/" }, { title: "Age-specific joining contacts", url: "https://www.new-marske-harriers.co.uk/contactus/" }],
    reviewed_at: "2026-10-15", corrections: { address_kind: "training" }
  },
  "newark-ac": {
    summary: "Newark Athletic Club has offered athletics since 1946 and now trains at Newark's YMCA Activity Village for track and field, road running, cross-country and sports hall competition.",
    biography: [
      "Newark Athletic Club was established in 1946 through the enthusiasm of local grammar-school sports master F. N. C. 'Dickie' Dwyer. Its early meetings used Newark Cricket Club's ground, followed by other local venues and a cinder track at the Grove. Joining a cross-country league in 1969 helped turn it into a year-round club.",
      "On 13 November 2018 the club held its first training session at the YMCA Activity Village in Newark-on-Trent, Nottinghamshire, England. The present programme covers track and field, road running, cross-country and indoor sports hall athletics, with junior and senior competition opportunities.",
      "Newcomers can arrange three free taster sessions through the dedicated taster-session email. Membership supports the two weekly training nights and the club's competition programme. The current official website is newarkathletics.co.uk; the similarly named former domain now serves an unrelated business and should not be used for athletics enquiries."
    ],
    founded_year: 1946,
    notable_members: [{ name: "F. N. C. 'Dickie' Dwyer", connection: "Founding organiser", detail: "Newark's official history credits the local grammar-school sports master with the enthusiasm behind the club's establishment in 1946." }],
    sources: [{ title: "Club history and disciplines", url: "https://www.newarkathletics.co.uk/about-us/" }, { title: "Membership and taster sessions", url: "https://www.newarkathletics.co.uk/membership/" }, { title: "Public role contacts", url: "https://www.newarkathletics.co.uk/key-information/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.newarkathletics.co.uk/", address_kind: "training" }
  },
  "newark-striders-running-club": {
    summary: "Newark Striders offers inclusive running around Newark, with varied Monday training, Wednesday track sessions and Thursday social outings.",
    biography: [
      "Newark Striders Running Club serves Newark-on-Trent in Nottinghamshire, England. Its running sessions are designed to let people work at their own level, with someone staying alongside runners at the back rather than leaving them to complete the route alone.",
      "A Monday coached session introduced in 2026 varies between speed, strength and hill work at changing Newark locations. Wednesday track sessions use the YMCA Newark and Sherwood Community and Activity Village. Thursday's approximately five-kilometre social run is a regular opportunity to meet other members.",
      "Prospective members can try the first two weeks free by contacting the club for details. England Athletics registration is included in ordinary membership. Members obtain current starts, leaders and booking links through the private group or newsletter; the public membership email remains the appropriate route for a newcomer without access to those channels."
    ],
    sources: [{ title: "Training and meeting arrangements", url: "https://www.newarkstriders.org/training-sessions" }, { title: "Membership and trial period", url: "https://www.newarkstriders.org/membership" }, { title: "Public enquiries", url: "https://www.newarkstriders.org/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "The YMCA track is the Wednesday venue. Monday and Thursday meeting points should be confirmed with the club.",
    corrections: { city: "Newark-on-Trent", county: "Nottinghamshire", address: "YMCA Community and Activity Village, Lord Hawke Way, Newark", postcode: "NG24 4FH", address_kind: "training" }
  },
  "newburn-running-club": {
    summary: "Newburn Running Club offers adult group running and beginner courses in west Newcastle, with coached evening sessions and a six-week trial.",
    biography: [
      "Newburn Running Club was established in 2020 in Newburn, Newcastle upon Tyne, England. Known as Team Orange, it welcomes adult runners with different goals, including those who run for company and fitness without entering races.",
      "Tuesday and Thursday evening sessions combine paced group outings with coached training. Tyne Amateur Rowing Club on Water Row is a common meeting point, but routes can require a different start. Qualified coaches and run leaders support the groups, with session booking and notices shared through Spond.",
      "A free six-week trial lets newcomers explore the programme before choosing social or England Athletics-affiliated membership. Regular group guidance suggests being able to complete five kilometres in about forty-two minutes; people not yet at that stage can ask about coached support or the twice-yearly Couch to 5K course. Membership is for adults aged eighteen and over, and winter sessions require visible clothing and a head or chest torch."
    ],
    founded_year: 2020,
    sources: [{ title: "Club introduction", url: "https://clubspark.englandathletics.org/NewburnRunningClub" }, { title: "Training, trials and age requirements", url: "https://clubspark.englandathletics.org/NewburnRunningClub/FAQs" }, { title: "Public contacts and location", url: "https://clubspark.englandathletics.org/NewburnRunningClub/Contact" }],
    reviewed_at: "2026-10-15",
    location_note: "Tyne Amateur Rowing Club is a frequent start, not a guarantee for every session. Check the booked event's location.",
    corrections: { website: "https://clubspark.englandathletics.org/NewburnRunningClub", address: "Tyne Amateur Rowing Club, Water Row, Newburn, Newcastle upon Tyne", address_kind: "training" }
  },
  "newbury-ac": {
    summary: "Newbury Athletic Club provides junior and senior track-and-field, cross-country and road-running opportunities, with training split between several West Berkshire venues.",
    biography: [
      "Newbury Athletic Club serves Newbury and the surrounding West Berkshire area of England through track and field, cross-country and road running. Its junior pathway starts at nine, with younger athletes developing across activities before moving towards more specialised coaching as they grow older.",
      "Crookham Common Athletic Track is the year-round track-and-field base. Tuesday middle-distance and road sessions also use the track, while Thursday distance groups meet at Newbury Rugby Club on Monks Lane. Young juniors train at the track in summer and move into St Bartholomew's School sports hall in winter.",
      "Prospective athletes should email the club, describing their age group and interests, to arrange a trial or two with the right section. Membership includes training sessions and club competitions without a separate weekly training charge. The club also welcomes volunteers, offering training for supporting roles. Its Brown's Meadow contact address should not be confused with the current track venue."
    ],
    sources: [{ title: "Club sections and activities", url: "https://www.newburyac.org.uk/" }, { title: "Current training venues", url: "https://www.newburyac.org.uk/about/where-we-train" }, { title: "Age groups and trials", url: "https://www.newburyac.org.uk/membership" }, { title: "Public contact address", url: "https://www.newburyac.org.uk/contact-2" }],
    reviewed_at: "2026-10-15",
    location_note: "Crookham Common Athletic Track (RG19 8ET) is the track base; other sessions use Newbury Rugby Club or St Bartholomew's School. The public contact address is separate.",
    corrections: { city: "Newbury", address: "Crookham Common Athletic Track", postcode: "RG19 8ET", address_kind: "training" }
  }
};
