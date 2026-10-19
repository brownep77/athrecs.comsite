import type { ClubProfile } from "./club-profiles";

// Club-owned history, programme and joining pages read 18 October 2026.
export const recoveredRunningAndTriathlonProfiles: Record<string, ClubProfile> = {
  "thornton-cleveleys-running-club": {
    summary: "Thornton Cleveleys Running Club brings road and off-road runners together on the Fylde coast, with a history dating to 2009 and club nights at Tee Time Golf Centre.",
    biography: [
      "Thornton Cleveleys Running Club is based in Thornton-Cleveleys, England, on the Fylde coast. Malcolm Sherwood, Julie Murphy, Bob Fairclough and Gwen James formed the club in 2009 around fitness, friendship and enjoyment. Its early home was Thornton Cleveleys Football Club on Bourne Road, before later moves to Thornton YMCA and Poolfoot Farm. Those venues belong to the club's history; its published Tuesday meeting point is now Tee Time Golf Centre on Fleetwood Road.",
      "Road and off-road championships, a monthly handicap and team events give members different ways to take part. The club's history records beginner programmes following leader training, entry into the local Interclub Grand Prix in 2015 and a tenth-anniversary celebration in 2019. It also describes members volunteering at Blackpool parkrun and visiting Fell Foot parkrun during a Lake District training weekend. The Fairclough 5 began in 2010 in memory of co-founder Bob Fairclough, with a family fun run accompanying the anniversary edition.",
      "The club information page describes Tuesday runs in groups of similar pace, followed by time together in the golf-centre bar. Thursday sessions focus on speed, technique or hills at varying locations. Newcomers are invited to try a Tuesday session before joining, with a suitable group helping them find their feet. Road, trail, cross-country and hill running are represented, but runners should confirm the current meeting arrangements and membership terms: the website still carries older membership-year labels."
    ],
    founded_year: 2009,
    notable_members: [{ name: "Bob Fairclough", connection: "Co-founder, 2009", detail: "The club's historical account names Fairclough among its four founders and records the first Fairclough 5 memorial road race in 2010. This is a historical association, not current membership." }],
    location_note: "The homepage and club information page identify Tee Time Golf Centre, Fleetwood Road, Thornton-Cleveleys, FY5 1RN as the Tuesday meeting point. The existing address and postcode are retained and labelled training; Thursday locations vary. The 2009–2019 history's Poolfoot Farm reference is not treated as the current base. No county-boundary correction is inferred.",
    contact_note: "Reviewed 18 October 2026. Ordinary public HTTP returned readable homepage, information, history and committee pages after HTTPS reader failures. The information page gives run-tcrc@gmail.com, but the committee page headed July 2025 gives runtcrc@gmail.com. Neither conflicting spelling is added; the existing ECCA 2026–2027 enquiry contact is preserved without recertifying its check. The information page explicitly links the Facebook page; its content and present ownership were not independently checked. No public telephone or enquiry form was established. Older membership labels and historical beginner courses are not current availability promises.",
    sources: [
      { title: "TCRC: homepage, Tee Time base and taster sessions", url: "http://www.run-tcrc.co.uk/" },
      { title: "TCRC: club history, founders and 2009–2019 milestones", url: "http://www.run-tcrc.co.uk/club-history/" },
      { title: "TCRC: club information, training and linked Facebook page", url: "http://www.run-tcrc.co.uk/club-information/" },
      { title: "TCRC: July 2025 committee page and differing contact-email spelling", url: "http://www.run-tcrc.co.uk/about/" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { website: "http://www.run-tcrc.co.uk/", address_kind: "training" }
  },
  "tri-anglia": {
    summary: "Tri-Anglia Triathlon Club is a volunteer-led Norwich multisport community founded in 1992, offering swimming, cycling and running opportunities across Norfolk and Suffolk.",
    biography: [
      "Tri-Anglia Triathlon Club is a Norwich-based community club in Norfolk, England, bringing swimming, cycling and running together for adults and juniors. Founded in 1992 to develop triathlon locally, it became a Charitable Incorporated Organisation in 2018. Its stated purpose extends across Norfolk and Suffolk, with coaching, training and events supporting people from their first steps in multisport through to national-level competition.",
      "Organising races is an important part of that community role. The club lists the Diss Duathlon, Spring and Autumn Waveney triathlons, Norwich Junior Triathlon and Norwich Triathlon among its events. Its Norwich race combines a swim in Whitlingham Broad, cycling through South Norfolk and a run around the lake. Volunteers help with preparation and marshalling as well as the club's wider activities; these are ways to contribute alongside taking part in races.",
      "Tri-Anglia's ClubPal portal provides separate adult, young-adult and junior joining routes and a public session calendar. Listings for 19–22 October 2026 include junior and adult swimming at Norwich High School for Girls, swimming at Sportspark, a social run from Eaton and strength-and-conditioning work. These dated examples illustrate the programme, not a permanent timetable. Check the portal for booking and session requirements, or use the club's membership and general-enquiry mailboxes. Training takes place at several venues; its Norwich PO box is for correspondence, not somewhere to meet for a session."
    ],
    founded_year: 1992,
    location_note: "The club's own ClubPal introduction publishes PO Box 3412, Norwich, NR7 7AP for postal contact, while its October 2026 session calendar identifies several Norwich training locations. The older Wymondham street address is replaced by this explicit correspondence address. No single clubhouse or training map point is inferred from the PO box.",
    contact_note: "Reviewed 18 October 2026. The legacy homepage announces a move to ClubPal from 19 October; the linked portal, introduction and membership pages were opened and read as public HTML. ClubPal repeats membership@tri-anglia.co.uk and committee@tri-anglia.co.uk and attributes Facebook and Twitter links. Existing ECCA contact provenance is preserved. The older enquiry form was readable but remains on the retiring site, so the contact link points to the portal's enquiry information instead. Event-only info@norwichtriathlon.co.uk and website suppliers are excluded. No club telephone or named notable-member association was established. Conflicting membership totals, older fee-year text and differing membership expiry dates are not imported.",
    sources: [
      { title: "Tri-Anglia: legacy homepage announcing the ClubPal move", url: "https://tri-anglia.club/" },
      { title: "Tri-Anglia ClubPal: origins, charity status, enquiry emails and postal address", url: "https://tri-anglia.clubpal.app/about-us" },
      { title: "Tri-Anglia ClubPal: October 2026 sessions and official social links", url: "https://tri-anglia.clubpal.app/" },
      { title: "Tri-Anglia ClubPal: adult, young-adult and junior joining routes", url: "https://tri-anglia.clubpal.app/membership" },
      { title: "Norwich Triathlon: the organising club and Whitlingham course", url: "https://www.norwichtriathlon.co.uk/about/our-story/" },
      { title: "Tri-Anglia: legacy club enquiry form and event-only email distinction", url: "https://tri-anglia.club/contact/" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { city: "Norwich", address: "PO Box 3412, Norwich, NR7 7AP", postcode: "NR7 7AP", address_kind: "correspondence", location_precision: "postcode", website: "https://tri-anglia.clubpal.app/" }
  }
};
