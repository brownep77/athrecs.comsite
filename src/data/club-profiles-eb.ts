import type { ClubProfile } from "./club-profiles";

// Opened network, organiser, governing-body and community sources, 19 October 2026 UTC.
export const recoveredStaffordCommunityProfiles: Record<string, ClubProfile> = {
  "rising-brook-runners": {
    summary: "Rising Brook Runners is a Stafford running club in Staffordshire, England, with documented community running and participation in the churchrunner network's virtual mob matches.",
    biography: [
      "Rising Brook Runners is based in Stafford, Staffordshire, and appears in both Midland Counties Athletics' club directory and the churchrunner network. The network lists Cannock Chase parkrun as its home event, giving a useful local connection for runners looking beyond the town's roads. That listing is not a promise that the club attends every Saturday: the network explicitly advises checking with each group before visiting. The club's existing directory disciplines cover road, cross-country, trail and hill or fell running; a current session timetable has not been confirmed.",
      "The club has a recorded history of joining wider community running events. Churchrunner's report of its January 2020 National Virtual Mob Match includes Rising Brook Runners among the participating groups. It appears again in the organiser's account of the match on 18 February 2023, with four participants recorded. That event brought together runners, walkers and volunteers across many parkrun venues, with a scoring system designed to reward participation. The February 2026 report's club table records three runners and volunteers for Rising Brook. These dated accounts establish activity by 2020 and participation in 2026, not the club's founding year or the size of its membership today.",
      "There is also a local community connection through coach, trainer and author Grace Marshall, whose published Signposts Services trustee biography describes running with Rising Brook Runners. This is a source-attributed association rather than confirmation of current membership. For joining enquiries, Midland Counties Athletics points to the club's Facebook group, alongside the retained handbook email contact. Ask the club about suitable sessions, meeting points and membership arrangements before turning up. Neither the churchrunner listing nor the church's general activities page establishes a current beginner course, fees or membership eligibility."
    ],
    notable_members: [
      { name: "Grace Marshall", connection: "Running association in an undated public trustee biography", detail: "Signposts Services' published trustee biography describes the coach, trainer and author as running with Rising Brook Runners. Read on 19 October 2026; this is not independent confirmation of current club membership or a verified athlete identity." }
    ],
    corrections: { city: "Stafford" },
    location_note: "The churchrunner network identifies Stafford as the club's town. Its Cannock Chase parkrun connection is not treated as a training address. The original directory address and postcode are retained with their existing classification; no church address or permanent clubhouse is substituted.",
    contact_note: "Reviewed 19 October 2026 UTC. Midland Counties Athletics confirms the existing Facebook group destination; no new social link is added. The previously sourced ECCA handbook email and its check date are preserved. Facebook was throttled, and the church's public pages did not establish a current running programme. No church, charity or website-supplier contact is imported; a direct club phone, contact form and current sessions remain unconfirmed.",
    sources: [
      { title: "Churchrunner: club directory, Stafford and Cannock Chase listing", url: "https://www.churchrunner.co.uk/clubs/" },
      { title: "Churchrunner: January 2020 National Virtual Mob Match report, 11 February 2020", url: "https://www.churchrunner.co.uk/2020/02/3502/" },
      { title: "Churchrunner: 18 February 2023 virtual mob match report, 1 March 2023", url: "https://www.churchrunner.co.uk/2023/03/churchrunner-international-virtual-mob-match-returns/" },
      { title: "Churchrunner: February 2026 virtual mob match report and club table, 14 March 2026", url: "https://www.churchrunner.co.uk/2026/03/international-virtual-churchrunner-mob-match-2026/" },
      { title: "Signposts Services: Grace Marshall's public trustee biography, undated", url: "https://signposts.org.uk/governance" },
      { title: "Midland Counties Athletics: club directory and official group link", url: "https://midland-athletics.co.uk/clubs-in-the-midlands/" }
    ],
    reviewed_at: "2026-10-19"
  }
};
