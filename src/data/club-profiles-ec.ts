import type { ClubProfile } from "./club-profiles";

// Opened venue-publisher and governing-body sources, 19 October 2026 UTC.
export const recoveredPendleAndIpswichProfiles: Record<string, ClubProfile> = {
  "ipswich-phoenix-running-club": {
    summary: "Ipswich Phoenix Running Club is a community running club in Ipswich, Suffolk, England, founded in November 2019 and based for its main training sessions at Copleston Sports Centre.",
    biography: [
      "Ipswich Phoenix Running Club began in November 2019 when a group of runners in Ipswich, Suffolk, wanted a friendly place to train together. The club's own account describes an interruption during the pandemic, followed by renewed activity and England Athletics affiliation. Its coaching page identifies Gavin Horrex as one of the founders and explains his interest in helping runners work towards their own goals. Suffolk County Athletics Association's 2026 affiliated-club listing links directly to the club's website, placing Phoenix within the county's organised running community.",
      "The main club session is advertised for Thursday at 7pm at Copleston Sports Centre, using grass fields and floodlighting in winter. The club describes sessions that can be adapted to different abilities, alongside technique work, training advice and social runs. Its membership page offers both annual and pay-as-you-go arrangements, with affiliated and unaffiliated options, second-claim membership and a non-running social category for people who want to help with club life. Newcomers should use the published membership email to confirm a suitable first visit and the current arrangements.",
      "Racing gives members another way to take part together. The club's calendar highlights the Suffolk Grand Prix road series and the Friday 5 races across Suffolk and Essex; its 2026 update congratulates members who took part in the completed Friday 5 series. Spond is used to coordinate attendance and the club also maintains social channels for its community. These are participation opportunities rather than a requirement to race. The joining page links to an online form, but that form is headed Membership Renewal, so a first-time applicant should check the correct process with the club rather than assume the renewal form is intended for them."
    ],
    founded_year: 2019,
    notable_members: [
      { name: "Gavin Horrex", connection: "Co-founder and coach, identified in the club's own account", detail: "The club's Meet the Coaches page identifies Gavin Horrex as a co-founder and running coach. The association is attributed to that public account, read on 19 October 2026; no athlete identity, performance or current coaching licence is independently verified here." }
    ],
    corrections: { website: "https://ipswichphoenixrunningclub.co.uk/" },
    location_note: "The club's own website confirms Copleston Sports Centre as its main training venue. The existing Ipswich address, postcode and directory classification are preserved; no separate clubhouse or correspondence address is inferred.",
    contact_note: "Reviewed 19 October 2026 UTC. Added the club's published membership email and own-linked Instagram account, retaining the ECCA handbook contact and existing Facebook group without duplication. The homepage's separate photographer-credit Facebook link is excluded. No club telephone or general enquiry form was found. The linked Jotform is a membership-renewal form and was inspected without submitting anything. The homepage and founder account disagree on the number of founders, so no number is repeated.",
    sources: [
      { title: "Ipswich Phoenix Running Club: origins, main session and official social links", url: "https://ipswichphoenixrunningclub.co.uk/" },
      { title: "Ipswich Phoenix Running Club: Meet the Coaches, Gavin Horrex's first-person account", url: "https://ipswichphoenixrunningclub.co.uk/about-us/" },
      { title: "Ipswich Phoenix Running Club: joining options and membership email", url: "https://ipswichphoenixrunningclub.co.uk/membership/" },
      { title: "Ipswich Phoenix Running Club: race calendar and completed 2026 Friday 5 series", url: "https://ipswichphoenixrunningclub.co.uk/running-calendar/" },
      { title: "Suffolk County Athletics Association: 2026 affiliated clubs and website link", url: "https://suffolkathletics.org.uk/clubs/" },
      { title: "Club-linked membership form: explicitly headed Membership Renewal, 2026–27", url: "https://form.jotform.com/220204636252344" }
    ],
    reviewed_at: "2026-10-19"
  },
  "pendle-athletic-club": {
    summary: "Pendle Athletic Club trains at Seedhill in Nelson, Lancashire, England, with a broad introduction to running, jumping and throwing and opportunities in track and field and cross-country.",
    biography: [
      "Pendle Athletic Club gives young athletes in Nelson, Lancashire, an introduction to several disciplines before they specialise. Its entry in Pendle Leisure Plus's local club directory describes a Run, Jump and Throw programme, followed by opportunities to concentrate on sprints, endurance, jumps or throws. The same entry describes track-and-field and cross-country league competition, with routes towards county, regional and national events. Northern Athletics includes Pendle Athletic Club in its 2026–27 affiliation list, updated on 14 October 2026. A founding year has not been established from the sources reviewed.",
      "The club's training base is Seedhill Athletics and Fitness Centre on Surrey Road in Nelson. The venue operator describes a floodlit, six-lane, 400-metre synthetic track and a long-jump facility. Its club listing welcomes athletes of all abilities from age seven and gives Monday and Wednesday, 7–8pm, as the main sessions, with newcomers invited to try training before joining. Confirm those arrangements with the club secretary before attending: the listing does not give a recent session-specific update. The leisure centre's general admission rules and prices are separate from club membership and coached sessions.",
      "Pendle Leisure Plus's Talented Athletes feature offers a glimpse of that development pathway through sprinter Marnie Nelson. Its account links her to Pendle Athletic Club from age eight and records her Lancashire under-15 300-metre title in 2024 and Northern indoor under-15 200-metre silver in February 2025. This is a dated sporting association, not a claim about her current membership or an athlete identity verified by AthRecs. Membership enquiries can use the retained club-secretary email; the venue publisher also prints that address in its Pendle entry. A current club phone, independent contact form and official social account remain unconfirmed."
    ],
    notable_members: [
      { name: "Marnie Nelson", connection: "Club association documented in a venue-publisher feature covering 2024–25", detail: "Pendle Leisure Plus's Talented Athletes feature identifies Marnie Nelson as a Pendle Athletic Club sprinter and describes her 2024 county title and February 2025 Northern indoor silver medal. This historical editorial association does not establish current membership or create a verified athlete identity." }
    ],
    corrections: { address: "Seedhill Athletics and Fitness Centre, Surrey Road, Nelson, BB9 7TY", postcode: "BB9 7TY", address_kind: "training" },
    location_note: "Seedhill is explicitly named as the club's training base by its venue operator. The operator's club listing and centre page both give BB9 7TY, correcting the original directory postcode BB7 9TY. The original directory record and its check date remain in source provenance; this address is a training venue, not an inferred clubhouse or correspondence address.",
    contact_note: "Reviewed 19 October 2026 UTC. The venue publisher's Pendle entry confirms the existing secretary email; the ECCA handbook attribution and 18 October check date are preserved without adding a duplicate contact. The old pendleac.org.uk domain served unrelated gambling material and is not adopted as a club website. No leisure-centre, neighbouring-club or website-supplier phone, form or social account is transferred to Pendle Athletic Club.",
    sources: [
      { title: "Pendle Leisure Plus: local club directory, Pendle Athletic Club programme and secretary", url: "https://pendleleisureplus.co.uk/local-sport-club-directory" },
      { title: "Pendle Leisure Plus: Seedhill Athletics and Fitness Centre, facilities and address", url: "https://pendleleisureplus.co.uk/seedhill-athletics-fitness-centre" },
      { title: "Pendle Leisure Plus: Talented Athletes, Marnie Nelson feature covering 2024–25", url: "https://pendleleisureplus.co.uk/talented-athletes" },
      { title: "Northern Athletics: 2026–27 affiliation list, updated 14 October 2026", url: "https://www.northernathletics.co.uk/affiliation-list-26-27/" }
    ],
    reviewed_at: "2026-10-19"
  }
};
