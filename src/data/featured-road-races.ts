export interface FeaturedAthlete {
  name: string;
  announcementUrl: string;
  profileUrl?: string;
  instagram?: string;
  instagramEvidenceUrl?: string;
}

export interface FeaturedRoadRace {
  slug: string;
  name: string;
  country: string;
  city: string;
  timezone: string;
  date: string;
  endDate?: string;
  distance: string;
  summary: string;
  course: string;
  entry: string;
  officialUrl: string;
  entryUrl: string;
  courseUrl?: string;
  resultsUrl: string;
  sources: { label: string; url: string }[];
  athletes: FeaturedAthlete[];
  caption: string;
  checkedAt: string;
}

export const FEATURED_ROAD_RACES: readonly FeaturedRoadRace[] = [
  {
    slug: "cardiff-half-marathon-2026",
    name: "Cardiff Half Marathon",
    country: "United Kingdom",
    city: "Cardiff",
    timezone: "Europe/London",
    date: "2026-10-04",
    distance: "Half marathon · 21.0975 km",
    summary:
      "Cardiff's next half marathon takes place on 4 October 2026. Joyciline Jepkosgei and Gideon Kiprotich headline the confirmed field, while Natasha Wilson returns to defend her Welsh title.",
    course:
      "The route starts outside Cardiff Castle and passes the Principality and Cardiff City Stadiums. Runners continue through Penarth Marina and Cardiff Bay, then loop Roath Park lake before finishing in the civic centre.",
    entry:
      "The 2026 edition is sold out and has no race-day entries. The linked registration page now covers the 2027 race: its ballot opens on 1 October 2026 and closes on 18 October.",
    officialUrl: "https://www.cardiffhalfmarathon.co.uk/",
    entryUrl: "https://www.cardiffhalfmarathon.co.uk/take-part/register/",
    courseUrl:
      "https://www.cardiffhalfmarathon.co.uk/everything-you-need-to-know-about-the-2026-cardiff-half-marathon/",
    resultsUrl: "https://www.cardiffhalfmarathon.co.uk/event-info/results/",
    sources: [
      {
        label: "Official 2026 race guide, course and sold-out status",
        url: "https://www.cardiffhalfmarathon.co.uk/everything-you-need-to-know-about-the-2026-cardiff-half-marathon/",
      },
      {
        label: "Official 2026 athlete announcement",
        url: "https://www.cardiffhalfmarathon.co.uk/2026-cardiff-half-marathon-athlete-preview/",
      },
      {
        label: "Official entry page — now for 2027",
        url: "https://www.cardiffhalfmarathon.co.uk/take-part/register/",
      },
      {
        label: "Official results archive",
        url: "https://www.cardiffhalfmarathon.co.uk/event-info/results/",
      },
    ],
    athletes: [
      {
        name: "Joyciline Jepkosgei",
        announcementUrl:
          "https://www.cardiffhalfmarathon.co.uk/2026-cardiff-half-marathon-athlete-preview/",
        instagram: "jepkosgei36",
        instagramEvidenceUrl: "https://www.instagram.com/jepkosgei36/reels/",
      },
      {
        name: "Gideon Kiprotich",
        announcementUrl:
          "https://www.cardiffhalfmarathon.co.uk/2026-cardiff-half-marathon-athlete-preview/",
      },
      {
        name: "Natasha Wilson",
        announcementUrl:
          "https://www.cardiffhalfmarathon.co.uk/2026-cardiff-half-marathon-athlete-preview/",
        instagram: "natasha.cockram",
        instagramEvidenceUrl: "https://www.instagram.com/natasha.cockram/?hl=en",
      },
    ],
    caption:
      "Cardiff, 4 October 2026. @jepkosgei36 headlines the women's field, Gideon Kiprotich leads the men's entries on paper, and @natasha.cockram returns to defend her Welsh title. Read the preview on AthRecs. #CardiffHalf #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "chicago-marathon-2026",
    name: "Bank of America Chicago Marathon",
    country: "USA",
    city: "Chicago, Illinois",
    timezone: "America/Chicago",
    date: "2026-10-11",
    distance: "42.195 km",
    summary:
      "Chicago's flat city course makes this a race to follow for fast marathon running. Jacob Kiplimo and Brigid Kosgei are among the athletes on the organiser's announced 2026 professional field.",
    course:
      "The road course starts and finishes in Grant Park and loops through 29 Chicago neighbourhoods. Its largely flat layout has produced world records and many personal bests.",
    entry:
      "The official application page has moved on to the 2027 race; 2026 general entry is closed. The 2027 drawing and guaranteed-entry applications run from 8 to 29 October 2026, with qualifying, charity and official tour routes also described by the organiser.",
    officialUrl: "https://www.chicagomarathon.com/",
    entryUrl: "https://www.chicagomarathon.com/apply/",
    courseUrl: "https://www.chicagomarathon.com/event-info/participant-information/course/",
    resultsUrl: "https://www.chicagomarathon.com/results/",
    sources: [
      {
        label: "2026 date and professional field",
        url: "https://www.chicagomarathon.com/about/press/",
      },
      {
        label: "2026 professional field, updated 23 July",
        url: "https://cdn.chicagomarathon.com/app/uploads/2026/07/24120150/072326_2026-Bank-of-America-Chicago-Marathon-Professional-Field.pdf",
      },
      {
        label: "Official course",
        url: "https://www.chicagomarathon.com/event-info/participant-information/course/",
      },
      {
        label: "Official entry information now covering 2027",
        url: "https://www.chicagomarathon.com/apply/",
      },
      {
        label: "Official results archive",
        url: "https://www.chicagomarathon.com/results/",
      },
    ],
    athletes: [
      {
        name: "Jacob Kiplimo",
        announcementUrl:
          "https://cdn.chicagomarathon.com/app/uploads/2026/07/24120150/072326_2026-Bank-of-America-Chicago-Marathon-Professional-Field.pdf",
        profileUrl: "https://worldathletics.org/athletes/uganda/jacob-kiplimo-14735365",
        instagram: "jacob_kiplimo",
        instagramEvidenceUrl: "https://www.instagram.com/jacob_kiplimo/?hl=en",
      },
      {
        name: "Brigid Kosgei",
        announcementUrl:
          "https://cdn.chicagomarathon.com/app/uploads/2026/07/24120150/072326_2026-Bank-of-America-Chicago-Marathon-Professional-Field.pdf",
        profileUrl: "https://worldathletics.org/athletes/-/14730790",
      },
    ],
    caption:
      "Chicago, 11 October. A fast course, a big crowd and Jacob Kiplimo @jacob_kiplimo and Brigid Kosgei on the announced field. See the race preview on AthRecs. #ChicagoMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "melbourne-marathon-2026",
    name: "Nike Melbourne Marathon",
    country: "Australia",
    city: "Melbourne, Victoria",
    timezone: "Australia/Melbourne",
    date: "2026-10-11",
    distance: "42.195 km",
    summary:
      "Eliud Kipchoge is confirmed for Melbourne on 11 October. The festival moves to two days in 2026, with a redesigned marathon course and a finish inside the MCG.",
    course:
      "The race starts on Batman Avenue and finishes inside the Melbourne Cricket Ground. The 2026 redesign removes the late Birdwood Avenue to Domain Road climb, reduces turns and changes the direction towards Beach Road.",
    entry:
      "General marathon allocation exhausted. The organiser provides an alternative-entry page; check current availability with the organiser.",
    officialUrl: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
    entryUrl: "https://melbournemarathon.com.au/register/",
    courseUrl: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
    resultsUrl: "https://melbournemarathon.com.au/past-results/",
    sources: [
      {
        label: "Official race date and 2026 course",
        url: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
      {
        label: "Official registration status",
        url: "https://melbournemarathon.com.au/register/",
      },
      {
        label: "Official Kipchoge announcement, 13 March 2026",
        url: "https://melbournemarathon.com.au/eliud-kipchoge-is-coming-to-melbourne/",
      },
      {
        label: "Kipchoge's official tour and Instagram link",
        url: "https://www.eliudsrunningworld.com/",
      },
    ],
    athletes: [
      {
        name: "Eliud Kipchoge",
        announcementUrl: "https://melbournemarathon.com.au/eliud-kipchoge-is-coming-to-melbourne/",
        profileUrl: "https://www.eliudsrunningworld.com/",
        instagram: "kipchogeeliud",
        instagramEvidenceUrl: "https://www.eliudsrunningworld.com/",
      },
    ],
    caption:
      "Kipchoge is coming to Melbourne. @kipchogeeliud is confirmed for 11 October, with 42.195km through the city and a finish inside the MCG. Read our Melbourne Marathon preview on AthRecs.com. #MelbourneMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "toronto-waterfront-marathon-2026",
    name: "TCS Toronto Waterfront Marathon",
    country: "Canada",
    city: "Toronto, Ontario",
    timezone: "America/Toronto",
    date: "2026-10-18",
    distance: "42.195 km",
    summary:
      "Toronto hosts the Canadian Marathon Championships on 18 October. Rachel Hannah and Dayna Pidhoresky are officially confirmed, setting up a contest for the national title.",
    course:
      "The route passes through downtown Toronto and along the waterfront, visiting more than a dozen neighbourhoods. The published start is Yonge Street north of Gerrard, with the finish on Bay Street north of Queen Street.",
    entry:
      "Marathon sold out. Check the official registration page for the organiser's current options.",
    officialUrl: "https://www.torontowaterfrontmarathon.com/",
    entryUrl: "https://raceroster.com/events/2026/111134/2026-tcs-toronto-waterfront-marathon",
    courseUrl: "https://www.torontowaterfrontmarathon.com/event-info/",
    resultsUrl: "https://www.torontowaterfrontmarathon.com/event-info/",
    sources: [
      {
        label: "Official date and sold-out status",
        url: "https://www.torontowaterfrontmarathon.com/",
      },
      {
        label: "Official course, entry and historical results links",
        url: "https://www.torontowaterfrontmarathon.com/event-info/",
      },
      {
        label: "Official 2026 Hannah and Pidhoresky announcement",
        url: "https://www.torontowaterfrontmarathon.com/canadian-women-to-face-off-at-2026-tcs-toronto-waterfront-marathon/",
      },
      {
        label: "Pidhoresky's official website links Instagram",
        url: "https://www.daynapidhoresky.com/contact.php",
      },
      {
        label: "Athletics Ontario interview supplies Hannah's Instagram",
        url: "https://podcasts.apple.com/ca/podcast/ep-144-rachel-hannah-how-an-elite-fuels-a/id1607376732?i=1000675178374",
      },
    ],
    athletes: [
      {
        name: "Rachel Hannah",
        announcementUrl:
          "https://www.torontowaterfrontmarathon.com/canadian-women-to-face-off-at-2026-tcs-toronto-waterfront-marathon/",
        profileUrl: "https://rachelhannahrd.com/",
        instagram: "rachelhannahrd",
        instagramEvidenceUrl:
          "https://podcasts.apple.com/ca/podcast/ep-144-rachel-hannah-how-an-elite-fuels-a/id1607376732?i=1000675178374",
      },
      {
        name: "Dayna Pidhoresky",
        announcementUrl:
          "https://www.torontowaterfrontmarathon.com/canadian-women-to-face-off-at-2026-tcs-toronto-waterfront-marathon/",
        profileUrl: "https://www.daynapidhoresky.com/",
        instagram: "daynapid",
        instagramEvidenceUrl: "https://www.daynapidhoresky.com/contact.php",
      },
    ],
    caption:
      "Toronto's Canadian title race is taking shape. @rachelhannahrd and @daynapid are confirmed for the Waterfront Marathon on 18 October. Meet the runners and explore the course in our preview on AthRecs.com. #TorontoWaterfrontMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "dublin-marathon-2026",
    name: "Irish Life Dublin Marathon",
    country: "Ireland",
    city: "Dublin",
    timezone: "Europe/Dublin",
    date: "2026-10-25",
    distance: "Marathon · 42.195 km",
    summary:
      "Dublin's 2026 marathon takes place on 25 October. TG4's live coverage begins at 08:00, with worldwide streaming through TG4 Player.",
    course:
      "The 2026 course starts on Leeson Street, passes through Phoenix Park and finishes at Pepper Canister Church. It combines flat stretches with climbs, including the late rise along Clonskeagh and Roebuck Roads.",
    entry:
      "The organiser describes the 2026 race as sold out and the public ballot is closed. Its official entry page still links charity enquiries, so availability should be checked directly with a participating charity.",
    officialUrl: "https://irishlifedublinmarathon.ie/",
    entryUrl: "https://irishlifedublinmarathon.ie/register-for-the-race/",
    courseUrl: "https://irishlifedublinmarathon.ie/course-and-start-finish/",
    resultsUrl: "https://raceresults.dublinmarathon.ie/",
    sources: [
      {
        label: "Official 2026 date, sold-out status and broadcast announcement",
        url: "https://irishlifedublinmarathon.ie/",
      },
      {
        label: "Official 2026 course",
        url: "https://irishlifedublinmarathon.ie/course-and-start-finish/",
      },
      {
        label: "Official entry information",
        url: "https://irishlifedublinmarathon.ie/register-for-the-race/",
      },
      {
        label: "Official results",
        url: "https://raceresults.dublinmarathon.ie/",
      },
    ],
    athletes: [],
    caption:
      "Dublin on 25 October. From Leeson Street through Phoenix Park to Pepper Canister Church, the 2026 marathon brings another big day of Irish road running. Read the preview on AthRecs. #DublinMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "auckland-marathon-2026",
    name: "Barfoot & Thompson Runaway Auckland Marathon",
    country: "New Zealand",
    city: "Auckland",
    timezone: "Pacific/Auckland",
    date: "2026-11-01",
    distance: "Marathon · 42.2 km",
    summary:
      "Auckland's marathon returns on 1 November with its Harbour Bridge crossing and waterfront finish. A 2026 elite field has not been confirmed in the official news pages checked.",
    course:
      "The race starts in Devonport, passes through Takapuna and crosses the Auckland Harbour Bridge. After a rolling first half, it follows the waterfront towards St Heliers and returns to Victoria Park, with a flatter second half.",
    entry:
      "Online entry advertised as open on the official website. Entry prices and transfer rules are available on the organiser's entry-information page.",
    officialUrl: "https://aucklandmarathon.co.nz/",
    entryUrl: "https://aucklandmarathon.co.nz/entry-info/entry-info/",
    courseUrl: "https://aucklandmarathon.co.nz/race-info/full-marathon/",
    resultsUrl: "https://aucklandmarathon.co.nz/athlete-info/results-records/",
    sources: [
      {
        label: "Official event and entry button",
        url: "https://aucklandmarathon.co.nz/",
      },
      {
        label: "Official 2026 date, distance label and course",
        url: "https://aucklandmarathon.co.nz/race-info/full-marathon/",
      },
      {
        label: "Official news checked for 2026 field",
        url: "https://aucklandmarathon.co.nz/athlete-info/latest-news/",
      },
      {
        label: "Official past results",
        url: "https://aucklandmarathon.co.nz/athlete-info/results-records/",
      },
    ],
    athletes: [],
    caption:
      "Devonport, the Harbour Bridge and Auckland's waterfront. The Auckland Marathon returns on 1 November. Explore the course and entry options in our AthRecs.com preview. #AucklandMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "new-york-city-marathon-2026",
    name: "TCS New York City Marathon",
    country: "USA",
    city: "New York City, New York",
    timezone: "America/New_York",
    date: "2026-11-01",
    distance: "42.195 km",
    summary:
      "The 2026 race marks 50 years of New York's five-borough marathon course. Hellen Obiri, Benson Kipruto and Sifan Hassan feature in the professional field announced by New York Road Runners.",
    course:
      "The road marathon crosses all five New York City boroughs. The route starts on Staten Island and finishes in Central Park, with bridges and neighbourhood crowds shaping the race.",
    entry:
      "The 2026 general drawing closed on 25 February and took place on 4 March. Official routes include charity fundraising and international tour operators, subject to their remaining availability; the organiser also lists earned guaranteed-entry schemes.",
    officialUrl: "https://www.nyrr.org/tcsnycmarathon",
    entryUrl: "https://www.nyrr.org/tcsnycmarathon/runners/entry/2026",
    courseUrl: "https://www.nyrr.org/tcsnycmarathon/race-day/the-course",
    resultsUrl: "https://results.nyrr.org/",
    sources: [
      {
        label: "Official 2026 professional field and date",
        url: "https://www.nyrr.org/media-center/press-release/2026_0819_tcsnycmprofield",
      },
      {
        label: "NYRR's accessible copy of the 2026 announcement",
        url: "https://testcache.nyrr.org/media-center/press-release/2026_0819_tcsnycmprofield",
      },
      {
        label: "Official entry methods",
        url: "https://testcache.nyrr.org/tcsnycmarathon/runners/entry/2026",
      },
      {
        label: "Official course overview",
        url: "https://testcache.nyrr.org/tcsnycmarathon/race-day/the-course",
      },
      {
        label: "Official results",
        url: "https://results.nyrr.org/",
      },
    ],
    athletes: [
      {
        name: "Hellen Obiri",
        announcementUrl:
          "https://www.nyrr.org/media-center/press-release/2026_0819_tcsnycmprofield",
        profileUrl: "https://worldathletics.org/athletes/kenya/hellen-obiri-14424921",
        instagram: "hellenobiri",
        instagramEvidenceUrl: "https://www.instagram.com/hellenobiri/?hl=en",
      },
      {
        name: "Benson Kipruto",
        announcementUrl:
          "https://www.nyrr.org/media-center/press-release/2026_0819_tcsnycmprofield",
        profileUrl: "https://worldathletics.org/athletes/kenya/benson-kipruto-14758213",
      },
      {
        name: "Sifan Hassan",
        announcementUrl:
          "https://www.nyrr.org/media-center/press-release/2026_0819_tcsnycmprofield",
        profileUrl: "https://worldathletics.org/athletes/-/14489606",
      },
    ],
    caption:
      "New York, 1 November. Hellen Obiri @hellenobiri, Benson Kipruto and Sifan Hassan are on the announced field for the 50th anniversary of the five-borough course. Read the preview on AthRecs. #NYCMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "valencia-marathon-2026",
    name: "Valencia Marathon Trinidad Alfonso Zurich",
    country: "Spain",
    city: "Valencia",
    timezone: "Europe/Madrid",
    date: "2026-12-06",
    distance: "42.195 km",
    summary:
      "Valencia brings a flat course and a strong announced field to the final weeks of the marathon year. Yomif Kejelcha, Fotyen Tesfay and Emily Sisson are among the athletes confirmed by the organiser for 6 December.",
    course:
      "The road course runs through Valencia on a flat layout built for fast marathon times. The finish at the City of Arts and Sciences is one of the race's distinctive features.",
    entry:
      "The organiser marks standard 2026 registration as sold out. The race used a loyalty window followed by a ballot; check official waiting-list rules and authorised tour operators for any remaining routes without assuming availability.",
    officialUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/maraton/",
    entryUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/info-registration-2026/",
    courseUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/official-route-marathon/",
    resultsUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/previous-editions-marathon/",
    sources: [
      {
        label: "Official 2026 regulations and date",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/regulations-valencia-marathon/",
      },
      {
        label: "2026 international elite announcement, 2 July",
        url: "https://www.valenciaciudaddelrunning.com/en/kejelcha-tesfay-lead-elite-lineup-big-ambitions-valencia-marathon-2026/",
      },
      {
        label: "Official course",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/official-route-marathon/",
      },
      {
        label: "2026 entry status",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/info-registration-2026/",
      },
      {
        label: "Official past editions and results",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/previous-editions-marathon/",
      },
    ],
    athletes: [
      {
        name: "Yomif Kejelcha",
        announcementUrl:
          "https://www.valenciaciudaddelrunning.com/en/kejelcha-tesfay-lead-elite-lineup-big-ambitions-valencia-marathon-2026/",
        profileUrl: "https://worldathletics.org/athletes/ethiopia/yomif-kejelcha-14594967",
      },
      {
        name: "Fotyen Tesfay",
        announcementUrl:
          "https://www.valenciaciudaddelrunning.com/en/kejelcha-tesfay-lead-elite-lineup-big-ambitions-valencia-marathon-2026/",
        profileUrl: "https://worldathletics.org/athletes/ethiopia/fotyen-tesfay-14679812",
      },
      {
        name: "Emily Sisson",
        announcementUrl:
          "https://www.valenciaciudaddelrunning.com/en/kejelcha-tesfay-lead-elite-lineup-big-ambitions-valencia-marathon-2026/",
        profileUrl: "https://worldathletics.org/athletes/united-states/emily-sisson-14321386",
        instagram: "em_sisson_",
        instagramEvidenceUrl: "https://www.garmin.com/en-NZ/pros/runners/",
      },
    ],
    caption:
      "Valencia, 6 December. Yomif Kejelcha, Fotyen Tesfay and Emily Sisson @em_sisson_ are on the announced field for this fast city marathon. Read the AthRecs preview. #ValenciaMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "los-angeles-marathon-2027",
    name: "ASICS Los Angeles Marathon",
    country: "USA",
    city: "Los Angeles, California",
    timezone: "America/Los_Angeles",
    date: "2027-03-07",
    distance: "42.195 km",
    summary:
      "Los Angeles returns on 7 March 2027 with a route through the city’s best-known neighbourhoods and landmarks. The race starts at Dodger Stadium and finishes in Century City.",
    course:
      "The Stadium to the Stars road course starts at Dodger Stadium. It finishes in Century City at Santa Monica Boulevard and Avenue of the Stars.",
    entry:
      "The official site advertises 2027 general registration. Charity entry is also offered through Team TMF and official charity partners, with fundraising requirements.",
    officialUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
    entryUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/register/",
    courseUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/distances-courses/",
    resultsUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/results/",
    sources: [
      {
        label: "Official 2027 event date",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
      },
      {
        label: "Official registration methods",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/register/",
      },
      {
        label: "Official course and distance",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/distances-courses/",
      },
      {
        label: "Official results archive",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/results/",
      },
    ],
    athletes: [],
    caption:
      "Los Angeles, 7 March 2027. Start at Dodger Stadium and finish among the towers of Century City. See the route and entry options in our AthRecs preview. #LAMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "tokyo-marathon-2027",
    name: "Tokyo Marathon",
    country: "Japan",
    city: "Tokyo",
    timezone: "Asia/Tokyo",
    date: "2027-03-07",
    distance: "42.195 km",
    summary:
      "Tokyo’s 2027 edition takes runners from Shinjuku through the capital’s historic and modern districts. The marathon finishes at Tokyo Station after passing Asakusa and Ginza.",
    course:
      "The certified road course starts at the Tokyo Metropolitan Government Building. It passes districts including Asakusa and Ginza before finishing at Tokyo Station on Gyoko-dori Avenue.",
    entry:
      "General entry applications closed on 28 August 2026, with selection results announced on 18 September. Charity, ONE TOKYO GLOBAL and RUN as ONE semi-elite applications had separate earlier windows, now closed on the published schedule.",
    officialUrl: "https://www.marathon.tokyo/en/",
    entryUrl: "https://www.marathon.tokyo/en/participants/",
    courseUrl: "https://www.marathon.tokyo/en/about/course/",
    resultsUrl: "https://www.marathon.tokyo/en/about/past/",
    sources: [
      {
        label: "Official 2027 date and race information",
        url: "https://www.marathon.tokyo/en/about/outline/",
      },
      {
        label: "Official 2027 entry schedule",
        url: "https://www.marathon.tokyo/en/participants/",
      },
      {
        label: "Official 2027 course",
        url: "https://www.marathon.tokyo/en/about/course/",
      },
      {
        label: "Official past races and results",
        url: "https://www.marathon.tokyo/en/about/past/",
      },
    ],
    athletes: [],
    caption:
      "Tokyo, 7 March 2027. From Shinjuku to Asakusa and Ginza, a marathon through the changing face of the city. Our AthRecs preview covers the route and entry schedule. #TokyoMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "manchester-marathon-2027",
    name: "adidas Manchester Marathon",
    country: "United Kingdom",
    city: "Greater Manchester",
    timezone: "Europe/London",
    date: "2027-04-18",
    distance: "Marathon · 42.195 km",
    summary:
      "Manchester's next marathon takes place on 18 April 2027. General entries have reached capacity, with limited charity places listed by the organiser.",
    course:
      "A flat road marathon through Greater Manchester with strong local support. The organiser highlights its potential for runners chasing a personal best.",
    entry:
      "General entries are at capacity. The official entry information page directs runners to limited charity places and an updates list.",
    officialUrl: "https://www.manchestermarathon.co.uk/home/",
    entryUrl:
      "https://www.manchestermarathon.co.uk/news/how-to-get-a-place-in-the-2027-adidas-manchester-marathon/",
    courseUrl: "https://www.manchestermarathon.co.uk/home/",
    resultsUrl: "https://www.manchestermarathon.co.uk/event-info/results/",
    sources: [
      {
        label: "Official date and course overview",
        url: "https://www.manchestermarathon.co.uk/home/",
      },
      {
        label: "Official 2027 entry status",
        url: "https://www.manchestermarathon.co.uk/news/how-to-get-a-place-in-the-2027-adidas-manchester-marathon/",
      },
      {
        label: "Official results",
        url: "https://www.manchestermarathon.co.uk/event-info/results/",
      },
    ],
    athletes: [],
    caption:
      "Manchester, 18 April 2027. A flat marathon course and a city that gets behind its runners. General entries have sold out, with limited charity places listed. Full preview on AthRecs. #ManchesterMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "boston-marathon-2027",
    name: "Boston Marathon presented by Bank of America",
    country: "USA",
    city: "Hopkinton to Boston, Massachusetts",
    timezone: "America/New_York",
    date: "2027-04-19",
    distance: "42.195 km",
    summary:
      "Boston returns on Patriots’ Day for its 131st edition. The route from Hopkinton, the Newton hills and the finish on Boylston Street make it one of road running’s most recognisable races.",
    course:
      "The road race travels from Hopkinton through the towns west of Boston to the city finish. Newton's hills, including Heartbreak Hill, are a defining part of the route.",
    entry:
      "Qualifier registration closed on 18 September 2026; acceptance required a time 5 minutes 17 seconds faster than the relevant standard. Official charity and international tour routes are separate options, with availability and requirements set by their providers.",
    officialUrl: "https://www.baa.org/races/boston-marathon/",
    entryUrl: "https://www.baa.org/races/boston-marathon/qualify/",
    courseUrl: "https://www.baa.org/races/boston-marathon/the-course/",
    resultsUrl: "https://www.baa.org/races/boston-marathon/results/",
    sources: [
      {
        label: "Official 2027 event date",
        url: "https://www.baa.org/races/boston-marathon/",
      },
      {
        label: "2027 qualification status",
        url: "https://www.baa.org/races/boston-marathon/qualify/",
      },
      {
        label: "Official course map",
        url: "https://www.baa.org/races/boston-marathon/the-course/",
      },
      {
        label: "Course history and Heartbreak Hill",
        url: "https://www.baa.org/races/boston-marathon/history/",
      },
      {
        label: "Official results archive",
        url: "https://www.baa.org/races/boston-marathon/results/",
      },
      {
        label: "Professional field page currently retaining previous edition names",
        url: "https://www.baa.org/races/boston-marathon/pro-field/",
      },
    ],
    athletes: [],
    caption:
      "Boston, 19 April 2027. From Hopkinton to the Newton hills, this is a race with a story at every mile. Our AthRecs preview covers the route and entry options. #BostonMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "london-marathon-2027",
    name: "TCS London Marathon",
    country: "United Kingdom",
    city: "London",
    timezone: "Europe/London",
    date: "2027-04-24",
    endDate: "2027-04-25",
    distance: "Marathon · 42.195 km",
    summary:
      "London's 2027 marathon takes place across two days in a one-off format. Both days include mass participation races on the same course.",
    course:
      "The road route runs from Greenwich to Westminster, finishing on The Mall. It passes Cutty Sark and crosses Tower Bridge on its way through the capital.",
    entry:
      "The public ballot has concluded. Apply directly to an official charity for a charity place, or check an authorised international tour operator; qualifying runners should check the organiser's Good for Age and Championship entry pages.",
    officialUrl: "https://www.londonmarathonevents.co.uk/london-marathon",
    entryUrl: "https://www.londonmarathonevents.co.uk/london-marathon/run-charity",
    courseUrl: "https://www.londonmarathonevents.co.uk/london-marathon/course",
    resultsUrl: "https://www.londonmarathonevents.co.uk/london-marathon/results",
    sources: [
      {
        label: "Official 2027 dates and entry routes",
        url: "https://www.londonmarathonevents.co.uk/london-marathon",
      },
      {
        label: "Official course guide",
        url: "https://www.londonmarathonevents.co.uk/london-marathon/course",
      },
      {
        label: "Official charity entry directory",
        url: "https://www.londonmarathonevents.co.uk/london-marathon/run-charity",
      },
      {
        label: "Official results archive",
        url: "https://www.londonmarathonevents.co.uk/london-marathon/results",
      },
    ],
    athletes: [],
    caption:
      "Two days of London running. The 2027 TCS London Marathon takes place on 24–25 April, with the route from Greenwich to The Mall. See the preview and entry routes on AthRecs. #LondonMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "rotorua-marathon-2027",
    name: "Red Stag Rotorua Marathon",
    country: "New Zealand",
    city: "Rotorua",
    timezone: "Pacific/Auckland",
    date: "2027-05-01",
    distance: "42.195 km",
    summary:
      "Rotorua returns on 1 May 2027 with a new direction around the lake. Entries are open, while the 2027 elite field has not been announced in the official pages checked.",
    course:
      "The marathon makes one anti-clockwise lap of Lake Rotorua, returning to its original direction from 1965. The 2027 event hub and finish are outside Novotel Rotorua Lakeside, and the organiser says the new course is measured and certified by World Athletics.",
    entry:
      "2027 entries open through the organiser's linked Race Roster page. Start time and several race-day details remain to be confirmed.",
    officialUrl: "https://www.rotoruamarathon.co.nz/",
    entryUrl: "https://raceroster.com/events/2027/139959/2027-red-stag-rotorua-marathon",
    courseUrl: "https://www.rotoruamarathon.co.nz/race-options/marathon",
    resultsUrl: "https://www.sportsplits.com/races/red-stag-rotorua-marathon-2026",
    sources: [
      {
        label: "Official 2027 date and entries",
        url: "https://www.rotoruamarathon.co.nz/",
      },
      {
        label: "Official new course and exact distance",
        url: "https://www.rotoruamarathon.co.nz/race-options/marathon",
      },
      {
        label: "Official registration partner",
        url: "https://raceroster.com/events/2027/139959/2027-red-stag-rotorua-marathon",
      },
      {
        label: "Organiser-linked 2026 results",
        url: "https://www.sportsplits.com/races/red-stag-rotorua-marathon-2026",
      },
    ],
    athletes: [],
    caption:
      "Rotorua is turning the course around. On 1 May 2027, runners will take an anti-clockwise lap of the lake and finish at the new lakefront hub. Entries are open. Read the preview on AthRecs.com. #RotoruaMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "great-manchester-run-2027",
    name: "AJ Bell Great Manchester Run",
    country: "United Kingdom",
    city: "Manchester",
    timezone: "Europe/London",
    date: "2027-05-23",
    distance: "10 km and half marathon · 21.0975 km",
    summary:
      "The Great Manchester Run returns on 23 May 2027 with 10K and half marathon options. Entries are open through the organiser's official booking link.",
    course:
      "Both distances use city-centre road routes, starting on Portland Street. The organiser lists on-course entertainment and live tracking for runners and spectators.",
    entry:
      "Entries are open. Select the 10K or half marathon on the official event page and follow its booking link.",
    officialUrl: "https://www.greatrun.org/events/great-manchester-run/",
    entryUrl: "https://www.greatrun.org/events/great-manchester-run/",
    courseUrl: "https://www.greatrun.org/events/great-manchester-run/",
    resultsUrl: "https://results.greatrun.org/results",
    sources: [
      {
        label: "Official 2027 date, distances, course overview and entry link",
        url: "https://www.greatrun.org/events/great-manchester-run/",
      },
      {
        label: "Official Great Run results",
        url: "https://results.greatrun.org/results",
      },
    ],
    athletes: [],
    caption:
      "Manchester on 23 May 2027: 10K or half marathon, city-centre streets and plenty of support along the way. Entries are open. Find the preview and official entry link on AthRecs. #GreatManchesterRun #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "ottawa-marathon-2027",
    name: "Tamarack Ottawa International Marathon",
    country: "Canada",
    city: "Ottawa, Ontario",
    timezone: "America/Toronto",
    date: "2027-05-30",
    distance: "Marathon (42.195 km)",
    summary:
      "Ottawa’s international marathon takes place on 30 May 2027 as part of Tamarack Ottawa Race Weekend. Runners follow a certified course through Canada’s capital.",
    course:
      "The marathon starts at Ottawa City Hall and takes runners through Canada's capital. The official interactive map provides the routes, elevation profiles and road closures; the organiser gives a seven-hour completion limit.",
    entry:
      "2027 registration open via the organiser's Let's Do This link. Entrants must be 18 or older on race day.",
    officialUrl: "https://www.runottawa.ca/races-and-events/ottawa-marathon/",
    entryUrl: "https://www.runottawa.ca/races-and-events/ottawa-marathon/",
    courseUrl: "https://www.runottawa.ca/races-and-events/ottawa-marathon/",
    resultsUrl: "https://www.runottawa.ca/torw/runners/race-results-1/",
    sources: [
      {
        label: "Official 2027 race details and registration",
        url: "https://www.runottawa.ca/races-and-events/ottawa-marathon/",
      },
      {
        label: "Official historical results links",
        url: "https://www.runottawa.ca/torw/runners/race-results-1/",
      },
      {
        label: "Official 2027 elite programme",
        url: "https://www.runottawa.ca/elite-athlete-information-tartan-ottawa-marathon/",
      },
    ],
    athletes: [],
    caption:
      "Ottawa, 30 May 2027. A certified marathon through Canada's capital and a busy weekend of road racing. Entries are open; our course and entry preview is on AthRecs.com. #OttawaMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "cork-city-marathon-2027",
    name: "Analog Devices Cork City Marathon",
    country: "Ireland",
    city: "Cork",
    timezone: "Europe/Dublin",
    date: "2027-06-06",
    distance: "Marathon · 42.195 km, half marathon · 21.0975 km, and 10 km",
    summary:
      "Cork's next event takes place on 6 June 2027 with marathon, half marathon and 10K options. The organiser's ticket page lists waiting lists and alternative entry categories.",
    course:
      "The marathon and half marathon take runners through Cork city and its suburbs. The event also includes a separate 10K race; detailed 2027 race information should be checked as the organiser updates its course guidance.",
    entry:
      "General tickets currently show sold out, with official waiting lists available. The ticket page also lists access-code charity and Good for Age entry categories; the event listing currently says its permit is pending approval.",
    officialUrl: "https://www.corkcity.ie/en/cork-city-marathon/",
    entryUrl: "https://eventmaster.ie/custom/event/Cork-City-Marathon-2027",
    courseUrl: "https://www.corkcity.ie/en/cork-city-marathon/race-information-and-prizes/",
    resultsUrl: "https://www.corkcity.ie/en/cork-city-marathon/live-results-2026/",
    sources: [
      {
        label: "Official 2027 event date",
        url: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
      {
        label: "Official ticket page, distances and current entry status",
        url: "https://eventmaster.ie/custom/event/Cork-City-Marathon-2027",
      },
      {
        label: "Official race information and 2027 entry guidance",
        url: "https://www.corkcity.ie/en/cork-city-marathon/race-information-and-prizes/",
      },
      {
        label: "Official latest completed edition results landing page",
        url: "https://www.corkcity.ie/en/cork-city-marathon/live-results-2026/",
      },
    ],
    athletes: [],
    caption:
      "Cork, 6 June 2027. Marathon, half marathon or 10K through the city and its suburbs. Check the official waiting list and other entry routes through our AthRecs preview. #CorkCityMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "gold-coast-marathon-2027",
    name: "ASICS Gold Coast Marathon",
    country: "Australia",
    city: "Gold Coast, Queensland",
    timezone: "Australia/Brisbane",
    date: "2027-07-04",
    distance: "Marathon (42.195 km)",
    summary:
      "The Gold Coast Marathon returns on 4 July 2027, with the weekend’s races on 3 and 4 July. Its flat coastal route follows Queensland’s beaches and Broadwater.",
    course:
      "The established course follows the Gold Coast's beaches and Broadwater, with a reputation for flat, fast running. Use the organiser's final 2027 course map when it is available; the official travel partner still includes some 2026 logistics on its page.",
    entry:
      "Official travel partner packages are in pre-registration for 2027. Check the organiser's entry page for the current direct-entry opening and terms.",
    officialUrl: "https://goldcoastmarathon.com.au/races/marathon/",
    entryUrl: "https://goldcoastmarathon.com.au/enter/",
    courseUrl: "https://goldcoastmarathon.com.au/races/marathon/",
    resultsUrl: "https://www.sportsplits.com/races/gold-coast-marathon-2026",
    sources: [
      {
        label: "Official travel partner: confirmed 2027 date and package status",
        url: "https://marathontours.com/en-au/events/gold-coast-marathon/",
      },
      {
        label: "2026 results from timing provider",
        url: "https://www.sportsplits.com/races/gold-coast-marathon-2026",
      },
    ],
    athletes: [],
    caption:
      "A winter marathon beside Queensland's beaches. Gold Coast returns on 4 July 2027, and travel packages are taking pre-registrations. Explore the race in our preview on AthRecs.com. #GoldCoastMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "sydney-marathon-2027",
    name: "TCS Sydney Marathon presented by ASICS",
    country: "Australia",
    city: "Sydney, New South Wales",
    timezone: "Australia/Sydney",
    date: "2027-08-29",
    distance: "42.195 km",
    summary:
      "Sydney’s Abbott World Marathon Major returns on 29 August 2027. The Harbour Bridge crossing and finish at the Opera House are signature features of the established route.",
    course:
      "The organiser lists a North Sydney start and a finish at Sydney Opera House, with the Harbour Bridge crossing among its signature landmarks. The currently published detailed map and course video are labelled 2026, so they should be presented as a previous-edition guide until the 2027 route is final.",
    entry:
      "Public ballot open from 29 September 2026 at 10:00am AEST to 19 October 2026 at 10:00am AEDT. Charity and official travel programmes provide additional routes, subject to the organiser's availability and conditions.",
    officialUrl: "https://www.tcssydneymarathon.com/marathon",
    entryUrl:
      "https://raceroster.com/events/2027/139230/2027-tcs-sydney-marathon-presented-by-asics",
    courseUrl: "https://www.tcssydneymarathon.com/marathon",
    resultsUrl: "https://www.multisportaustralia.com.au/races/sydney-marathon-2026",
    sources: [
      {
        label: "Official 2027 race date, distance and entry methods",
        url: "https://www.tcssydneymarathon.com/marathon",
      },
      {
        label: "Official ballot dates and registration",
        url: "https://raceroster.com/events/2027/139230/2027-tcs-sydney-marathon-presented-by-asics?locale=en_US",
      },
      {
        label: "Organiser-linked 2026 results",
        url: "https://www.multisportaustralia.com.au/races/sydney-marathon-2026",
      },
    ],
    athletes: [],
    caption:
      "Sydney's 2027 ballot is open. Race day is 29 August, with the Harbour Bridge and Opera House among the sights that make this Major stand out. Read the entry guide on AthRecs.com before the ballot closes on 19 October. #SydneyMarathon #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
  {
    slug: "great-north-run-2027",
    name: "AJ Bell Great North Run",
    country: "United Kingdom",
    city: "Newcastle upon Tyne to South Shields",
    timezone: "Europe/London",
    date: "2027-09-12",
    distance: "Half marathon · 21.0975 km",
    summary:
      "The Great North Run returns on 12 September 2027. Its September ballot has been drawn, with another ballot opportunity in January.",
    course:
      "A point-to-point road half marathon from Newcastle upon Tyne to South Shields. The start is on Newcastle's Central Motorway, with the finish at the coast.",
    entry:
      "The September ballot has concluded. Unsuccessful runners can register for a January ballot reminder or explore official charity places; new memberships are sold out.",
    officialUrl: "https://www.greatrun.org/events/great-north-run/",
    entryUrl: "https://www.greatrun.org/events/great-north-run/",
    courseUrl: "https://www.greatrun.org/events/great-north-run/",
    resultsUrl: "https://results.greatrun.org/results",
    sources: [
      {
        label: "Official date, distance, route and entry status",
        url: "https://www.greatrun.org/events/great-north-run/",
      },
      {
        label: "Official Great Run results",
        url: "https://results.greatrun.org/results",
      },
    ],
    athletes: [],
    caption:
      "Newcastle to South Shields on 12 September 2027. The Great North Run is back, with another ballot opportunity in January and charity places to explore. Race details on AthRecs. #GreatNorthRun #AthRecs\n\nRace information checked 30 September 2026.",
    checkedAt: "2026-09-30",
  },
];
