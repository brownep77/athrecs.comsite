import type { ClubProfile } from "./club-profiles";

// Batch 101: recovered running-group histories and an Irish multisport profile.
export const recoveredChorleyWhitbyAndThurlesProfiles: Record<string, ClubProfile> = {
  "runfit-chorley": {
    summary: "RunFit Chorley is a supportive Lancashire running group founded by Neil Simpson, recognised by England Athletics for helping runners build confidence and stay connected.",
    biography: [
      "RunFit Chorley grew around runners who wanted company but worried that they would be too slow for a group. Based in the Chorley area of Lancashire, England, its club-hosted introduction credits founder Neil Simpson with creating that welcoming starting point. Leaders and helpers brought experience of Couch to 5K, and the group developed to accommodate a wider range of abilities.",
      "The practical emphasis is on running together. The group describes regular loopbacks so that runners can move at different speeds without leaving anyone on their own. Its approach earned wider recognition in November 2021, when England Athletics named RunFit Chorley the North West winner of its RunTogether Group of the Year award.",
      "The award account also records a community that stayed in touch when ordinary runs were interrupted by lockdown. Online conversations, quizzes, bingo and challenges helped maintain those connections. That is a dated account of the group's support for its members, rather than a claim about a current events programme.",
      "Prospective runners can use the club's England Athletics ClubSpark contact form to ask about a suitable session and its meeting point. The directory places the group around Buckshaw Village, but the contact-page postal address is not confirmation of where a run starts. Check arrangements before travelling; the session listing did not show a bookable run during this review."
    ],
    notable_members: [{ name: "Neil Simpson", connection: "Group founder", detail: "The club-hosted introduction names him as the founder of RunFit Chorley. No founding year or present office is inferred." }],
    sources: [
      { title: "RunFit Chorley: club-hosted introduction and founder", url: "https://clubspark.englandathletics.org/RunFitChorley/" },
      { title: "England Athletics North West volunteer awards, 16 November 2021", url: "https://www.englandathletics.org/news/regional-volunteer-award-winners-and-runners-up-for-the-north-west/" },
      { title: "Official ClubSpark enquiry form", url: "https://clubspark.englandathletics.org/RunFitChorley/Contact" },
      { title: "Official session listing, checked 17 October 2026", url: "https://clubspark.englandathletics.org/RunFitChorley/Coaching" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://clubspark.englandathletics.org/RunFitChorley/" },
    location_note: "Buckshaw Parkway remains directory context, not a newly confirmed training start. The ClubSpark contact page lists a Saville Street postal address; it is not substituted as a training venue.",
    contact_note: "Contact form recovered from the official ClubSpark site. No public role email, telephone, social URL, founding year or current timetable established. An empty session listing is not evidence that the group has closed."
  },
  "whitby-running-club": {
    summary: "Whitby Running Club was founded in 2019 in North Yorkshire and offers sociable group running, structured sessions and a Couch to 5K pathway for new runners.",
    biography: [
      "Whitby Running Club was founded in 2019 by Matt Hewison in Whitby, North Yorkshire, England. The England Athletics-affiliated club combines running with a strong social emphasis, welcoming people who want to become active and meet others as well as those working towards running goals. Hewison's own account describes his continuing involvement as a run leader and in the town's Cinder Track parkrun community.",
      "The club explains its sessions in terms of what runners need, rather than a single pace standard. Its introductory group suits people new to running, returning after a break or progressing from Couch to 5K. Other sessions include longer runs, intervals and hills. Runners can choose between groups, and loopbacks help keep the company together. Members use Spond for session arrangements, so the latest meeting information matters more than an old timetable.",
      "Whitby's ten-week Couch to 5K course combines walking and running with warm-ups, cool-downs and practice between meetings. The advertised autumn 2026 course began on 1 September, with most Tuesday meetings at Whitby Leisure Centre. That course is already under way; anyone looking for a later intake should enquire rather than assume a place is available. Run leader Ruth Price's published account describes qualifying in 2020 and beginning to lead sessions in 2021.",
      "The club website provides a membership application form and a general enquiries email. Its options include junior and social membership as well as adult running membership. Ask which option and session are suitable before joining, especially for a younger runner, and use the club's current instructions for access to Spond."
    ],
    founded_year: 2019,
    notable_members: [
      { name: "Matt Hewison", connection: "Founder in 2019", detail: "His first-person club biography states that he founded Whitby Running Club in 2019 and describes his run-leading and Cinder Track parkrun involvement. These are organisational associations, not verified athlete identities." },
      { name: "Ruth Price", connection: "Run leader from 2021", detail: "Her club-hosted account describes qualifying in 2020 and starting to lead sessions in 2021. It does not establish an exact current coaching allocation." }
    ],
    sources: [
      { title: "Official club history and first-person volunteer biographies", url: "https://www.whitbyrunningclub.co.uk/about-us/" },
      { title: "Official running groups, loopbacks and Spond guidance", url: "https://www.whitbyrunningclub.co.uk/fa-qs/" },
      { title: "Official autumn 2026 Couch to 5K programme", url: "https://www.whitbyrunningclub.co.uk/couch-2-5k/" },
      { title: "Official membership application and enquiries email", url: "https://www.whitbyrunningclub.co.uk/how-to-join/" },
      { title: "North Yorkshire Council activity directory: published social links", url: "https://www.activeyorkshirecoast.co.uk/organisations/whitby-running-club/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.whitbyrunningclub.co.uk/" },
    location_note: "Meadowfields remains a directory address, not a confirmed training base. Whitby Leisure Centre is the stated start for most meetings of the autumn 2026 Couch to 5K programme, not necessarily other club runs. The council's older White Leys Road listing is not substituted.",
    contact_note: "General enquiries email is corroborated on the club's joining page. Excluded the homepage's email@example.com placeholder, conflicting kit-order addresses and council staff contacts. No club telephone confirmed. Facebook/X links are attributed to the council listing; blocked destinations do not establish present account ownership. Conflicting committee-role wording and session counts are not presented as current facts."
  },
  "collins-cycle-centre-triathlon-club": {
    summary: "Collins Cycle Centre Triathlon Club is based in Thurles, County Tipperary, with a public club enquiry email and participation in Triathlon Ireland's 2026 Club Community League.",
    biography: [
      "Collins Cycle Centre Triathlon Club is based in Thurles, County Tipperary, Ireland. Triathlon Ireland's club directory identifies the Thurles group and publishes its dedicated enquiry email, providing a direct starting point for people interested in swimming, cycling and running with the club. The listing indicates no junior section, so families should check eligibility rather than assume there is a children's programme.",
      "The club appears in Division Four of the inaugural Triathlon Club Community League in 2026. Triathlon Ireland's October report describes a season-long competition in which eligible members' repeated race participation contributes to their club's score. The published tables are still subject to affiliation review until 23 October 2026: inclusion records participation, not a final placing, award or present membership total.",
      "For training and joining questions, contact the club through its published email and ask which sessions are available and where they meet. Thurles is the confirmed locality, not a verified pool, clubhouse or open-water venue. A session timetable, club history and dedicated club website were not established from the sources available during this review."
    ],
    sources: [
      { title: "Triathlon Ireland directory: Thurles club, enquiry email and junior-section status", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "Triathlon Ireland Club Community League report, 15–16 October 2026", url: "https://www.triathlonireland.com/news/triathlon-club-community-league-divisions-results/" }
    ],
    reviewed_at: "2026-10-17",
    location_note: "Thurles, County Tipperary is locality-level evidence only. No training, clubhouse or correspondence street address established.",
    contact_note: "Existing collinscyclecentretc@gmail.com email freshly corroborated by Triathlon Ireland, without duplication. Founding year, notable members, current timetable, telephone and a primary-linked social account remain unresolved. The existing website field points to the governing body, not a dedicated club website. League placing should be revisited after 23 October 2026."
  }
};
