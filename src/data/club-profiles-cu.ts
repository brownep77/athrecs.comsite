import type { ClubProfile } from "./club-profiles";

// Batch 99: recover inclusive coaching, virtual-club continuity and Donegal context.
export const recoveredInclusiveAndCoachingProfiles: Record<string, ClubProfile> = {
  "bradford-keighley-and-skipton-disability-athletics-bks": {
    summary: "Bradford Keighley & Skipton Disability Athletics offers inclusive athletics and swimming, with a Keighley track base and opportunities to progress into competition.",
    biography: [
      "Bradford Keighley & Skipton Disability Athletics, usually shortened to BKS, offers athletics and swimming for disabled people across this part of Yorkshire, England. British Blind Sport lists a club welcoming all ages and a broad range of disabilities, with Carlton Keighley as its athletics base. The emphasis includes enjoying sport recreationally as well as preparing for competition.",
      "The club's growth is visible in Activity Alliance's account of the July 2025 National Junior Para Athletics Championships. BKS had 28 representatives on the starting list, compared with four in 2019, making this its largest team at the championships. Bradford Council's October 2024 newsletter also celebrated club athlete Guillaume Junior Atangana and his guide Donard, naming Janet-Alison Arkwright as their coach. These are dated associations, not a statement of current membership.",
      "The council described athletics at Carlton Keighley and swimming at Shipley Pool, two different venues. Before travelling, ask the club about the current session, accessibility arrangements and appropriate group rather than relying on the newsletter's older timetable. The public club email and telephone are also listed by British Blind Sport, providing a direct starting point for participants and families."
    ],
    notable_members: [
      { name: "Guillaume Junior Atangana", connection: "Club athlete named by Bradford Council in October 2024", detail: "The council celebrated him alongside his guide Donard and identified their BKS coach. This records a dated club association, not present membership or a verified athlete identity." },
      { name: "Janet-Alison Arkwright", connection: "BKS coach and published club contact", detail: "Bradford Council's October 2024 account names her as coach; British Blind Sport and Special Olympics GB also list her as a club contact." }
    ],
    sources: [
      { title: "British Blind Sport club directory: activities, venue and public contacts", url: "https://britishblindsport.org.uk/directory/bradford-keighley-skipton-disability-athletes" },
      { title: "Bradford Council SEND newsletter, October 2024: BKS athlete and sessions", url: "https://content.govdelivery.com/accounts/UKBMD/bulletins/3b80b03" },
      { title: "Activity Alliance National Junior Para Athletics Championships report, 8 July 2025", url: "https://www.activityalliance.org.uk/news/9994-a-great-celebration-of-sport-at-national-championships" },
      { title: "Special Olympics GB Yorkshire and Humberside club directory", url: "https://www.specialolympicsgb.org.uk/clubs/find-a-club/yorkshire-and-humberside" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { city: "Keighley", address: "Carlton Keighley, Greenhead Lane, Keighley, BD20 6EB", postcode: "BD20 6EB", address_kind: "training", location_precision: "official-directory", sports: ["Athletics", "Swimming"] },
    location_note: "Carlton Keighley is the athletics training base. Shipley Pool is a separate swimming venue; no swimming session is implied at the track address.",
    contact_note: "Founding year and current session timetable remain unconfirmed. Club-role email preferred over the individual email in the Special Olympics listing. Social destinations are attributed to British Blind Sport; their contents were blocked or throttled."
  },
  "aspire-athletics": {
    summary: "Aspire Athletics in Carshalton introduces children to running, jumping and throwing at David Weir Leisure Centre, with a pathway to Sutton & District Athletics Club.",
    biography: [
      "Aspire Athletics runs junior athletics coaching at David Weir Leisure Centre in Carshalton, England, as part of Aspire to Greatness and the Daley Thompson Athletics Academy. Its introduction names Olympic champion Daley Thompson and former Great Britain pole vaulter Kate Staples as founders. The programme is built around helping children gain confidence and enjoy athletics, whether or not competition becomes their goal.",
      "Running, jumping and throwing sit alongside balance, coordination and speed development. The Sutton programme describes a partnership with Sutton & District Athletics Club, with a route towards club athletics from around age twelve. Its coaching team includes former international sprinter Aidan Syers. The two programmes remain distinct: a pathway or shared training opportunity does not make every academy participant a member of Sutton & District.",
      "The official Sutton page publishes Autumn 2026 junior, speed and strength-and-conditioning sessions at David Weir Leisure Centre. Age ranges differ by session, so families should select that venue in the booking system and check the specific group rather than assuming a single age limit. Beginners are welcome, and the enquiries team can discuss introductory options. The wider organisation also works with schools and runs holiday activities; its Esher postal address is not the Carshalton training venue."
    ],
    notable_members: [
      { name: "Daley Thompson", connection: "Academy co-founder and ambassador", detail: "Aspire's own introduction identifies the Olympic champion as a founder; the Sutton programme describes his ambassador role, not a current competing membership." },
      { name: "Kate Staples", connection: "Academy co-founder and coach", detail: "The official introduction names the former Great Britain pole vaulter as a founder. This is a coaching and organisational association." },
      { name: "Aidan Syers", connection: "Sutton programme lead sprint coach", detail: "The official Sutton page names the former Great Britain international sprinter in its coaching team, checked 17 October 2026." }
    ],
    sources: [
      { title: "Official Aspire Athletics introduction and founders", url: "https://www.atgathletics.co.uk/home" },
      { title: "Official Sutton programme, coaching team and Autumn 2026 sessions", url: "https://aspiretogreatness.co.uk/Our%20Clubs/sutton-atg-athletics-club/" },
      { title: "Official academy and school-programme questions", url: "https://aspiretogreatness.co.uk/faq/" },
      { title: "Official enquiry form and public contact details", url: "https://aspiretogreatness.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://aspiretogreatness.co.uk/Our%20Clubs/sutton-atg-athletics-club/", address: "David Weir Leisure Centre, Middleton Road, Carshalton, SM5 1SL", postcode: "SM5 1SL", address_kind: "training", virtual: false },
    location_note: "The official 2026 programme confirms in-person coaching at David Weir Leisure Centre, correcting the directory's virtual label and transposed postcode. Esher PO Box is correspondence only.",
    contact_note: "Founding year and official social-account URLs remain unresolved. Use the academy enquiries team or official booking route; programme-specific ages take precedence over generic age descriptions."
  },
  "new-levels-run-club": {
    summary: "New Levels Run Club is a virtual running club listed in Spalding, connected to the coaching community now operating as RunThrough Coach.",
    biography: [
      "New Levels Run Club is a virtual running club listed in Spalding, Lincolnshire, England. The English Cross Country Association's 2024–25 handbook places it among virtual clubs and names Gemma Hillier-Moses as secretary. That dated listing establishes part of its organisational history without implying that the role or membership arrangements have stayed unchanged.",
      "The connected coaching business, New Levels Coaching, now operates as RunThrough Coach. Its own history explicitly describes that rebrand, while a coach-hosted Final Surge package still names eligibility to join New Levels Run Club as a benefit. This provides a link between the club and the coaching community; it does not establish that the affiliated club itself has changed name.",
      "The advertised coaching package combines individual plans and feedback with online strength, mobility and community support. Club eligibility is a separate benefit, not proof that buying coaching automatically registers someone with England Athletics. Prospective members should ask the coaching team about the current club joining process, any separate fees and the appropriate registration. The Spalding directory address is not a confirmed group-training meeting point."
    ],
    notable_members: [
      { name: "Gemma Hillier-Moses", connection: "Club secretary listed for 2024–25", detail: "The English Cross Country Association handbook, page 39, lists her against New Levels Run Club under virtual clubs. Historical office, not a claim about the current secretary." }
    ],
    sources: [
      { title: "English Cross Country Association handbook 2024–25, page 39: virtual clubs and secretaries", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2024/09/ECCA-Handbook-2024-2025-website-edtion.pdf" },
      { title: "RunThrough Coach history: formerly New Levels Coaching", url: "https://www.runthroughcoach.com/about" },
      { title: "Coach-hosted Final Surge package explicitly naming New Levels Run Club eligibility", url: "https://www.finalsurge.com/coach/runthroughcoach/services/triathloncoaching/1to1onlinetriathloncoachingmonthly" },
      { title: "RunThrough Coach enquiry form", url: "https://www.runthroughcoach.com/contact" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.runthroughcoach.com/about" },
    location_note: "Virtual-club status retained. The Spalding address remains directory context, not a confirmed training venue. No global-club scope inferred from the coaching business's reach.",
    contact_note: "The coaching-team form is a route to ask about club eligibility, not a dedicated club-secretary contact. Founding year, current club officers and separate membership terms remain unresolved; no company founding date or renaming assigned to the club."
  },
  "hell-yeah-triathlon-club": {
    summary: "Hell Yeah Triathlon Club is listed in Carrickfinn, County Donegal, Ireland, and appears in Triathlon Ireland's 2026 Club Community League.",
    biography: [
      "Hell Yeah Triathlon Club is a Carrickfinn-based club in County Donegal, Ireland, listed by Triathlon Ireland. It offers a local point of contact for people interested in combining swimming, cycling and running. The governing body's directory supplies a club email and records no junior section; prospective members should ask the club about eligibility and the support available before joining.",
      "The club appears in Division Four of the inaugural Triathlon Club Community League in 2026. Triathlon Ireland's October report describes a season centred on participation and repeat racing, with club scores built from eligible members' performances. Those tables remain subject to a final affiliation review until 23 October, so the listing is recorded as participation rather than a final placing or award.",
      "Start with the published club email to confirm current training and membership arrangements. Carrickfinn identifies the club's locality, not a particular pool, open-water meeting point or clubhouse. Its website could not be read during this review, so a weekly timetable, founding date and named coaches have not been inferred from the directory entry."
    ],
    sources: [
      { title: "Triathlon Ireland directory: Carrickfinn, club email and junior-section indicator", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "Triathlon Ireland Club Community League report, 15–16 October 2026: tables pending final review", url: "https://www.triathlonireland.com/news/triathlon-club-community-league-divisions-results/" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { city: "Carrickfinn", location_precision: "official-directory" },
    location_note: "Carrickfinn is the nearest town/locality in the governing-body directory. No street address or training venue established.",
    contact_note: "Current directory confirms hellyeahtriclub@gmail.com, without the extra dot in an older PDF. Telephone, social links, founding year, current training and notable-member history remain unresolved. Recheck any league placing after 23 October 2026."
  }
};
