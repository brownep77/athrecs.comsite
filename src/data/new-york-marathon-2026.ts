import type { EditorialArticle } from "../lib/athrecs/editorial";

export const NEW_YORK_MARATHON_2026: EditorialArticle = {
  slug: "new-york-city-marathon-2026-preview",
  kind: "news",
  date: "2026-10-30",
  displayDate: "30 October 2026",
  publishedAt: "2026-10-30T22:15:00Z",
  modifiedAt: "2026-10-30T22:15:00Z",
  author: "AthRecs Editorial",
  title: "New York City Marathon 2026 preview: five boroughs, countless stories",
  seoTitle: "New York City Marathon 2026: route, runners & start times",
  description:
    "Preview the 2026 New York City Marathon: Sunday start times, elite runners, past winners, inspiring stories, landmarks and the updated five-borough route.",
  standfirst:
    "The TCS New York City Marathon returns on Sunday 1 November 2026: 26.2 miles, five boroughs and thousands of personal journeys. Fifty years after the race first embraced the whole city, here is what makes this weekend worth watching.",
  body: [
    "Some runners will arrive looking for a title. Others will be chasing a first marathon, a personal best, or a finish that once seemed out of reach. What brings those ambitions together is New York: the bridges, the neighbourhoods, the noise, and the moment a stranger calls your name just when you need it.",
  ],
  sports: ["road-running"],
  locations: [
    {
      country: "United States",
      area: "New York",
    },
  ],
  image: {
    src: "/images/editorial/new-york-city-marathon-2026.png",
    alt: "Original AthRecs illustration of runners and a wheelchair racer with a New York suspension bridge and skyline, promoting the marathon on 1 November 2026.",
    caption:
      "Original AI-generated illustration created for AthRecs. An artistic montage, not a photograph or course map. AthRecs is independent of the race organiser.",
    width: 1122,
    height: 1402,
  },
  sections: [
    {
      id: "date-start-times",
      heading: "When is the 2026 New York City Marathon?",
      paragraphs: [
        "Race day is Sunday 1 November 2026. The marathon distance is 26.2 miles (42.195 km), from Staten Island to the Central Park finish. New York is on Eastern Standard Time on race day, five hours behind the UK. The table shows the organiser’s scheduled starts, checked on 30 October; times remain subject to change. Your assigned wave, colour and corral are shown on your race bib.",
      ],
      table: {
        caption: "Sunday 1 November 2026: scheduled race starts",
        headings: ["Division or wave", "New York (EST)", "United Kingdom (GMT)"],
        rows: [
          ["Men’s professional wheelchair", "08:00", "13:00"],
          ["Women’s professional wheelchair", "08:02", "13:02"],
          ["Handcycles and selected athletes with disabilities", "08:22", "13:22"],
          ["Mastercard Priceless Start", "08:25", "13:25"],
          ["Professional women’s open race", "08:35", "13:35"],
          ["Professional men’s open race", "09:05", "14:05"],
          ["Mass-participation wave 1", "09:10", "14:10"],
          ["Wave 2", "09:45", "14:45"],
          ["Wave 3", "10:20", "15:20"],
          ["Wave 4", "10:55", "15:55"],
          ["Wave 5", "11:30", "16:30"],
        ],
      },
      sources: [
        {
          label: "NYRR: edition-specific race-day schedule",
          url: "https://prod.nyrr.org/media-center/events/2026/2026-tcs-new-york-city-marathon/media-events-and-schedule",
        },
        {
          label: "NYRR: runner start instructions",
          url: "https://prod.nyrr.org/tcsnycmarathon/the-start",
        },
      ],
    },
    {
      id: "elite-field",
      heading: "Who is running this weekend? The contenders to watch",
      paragraphs: [
        "Benson Kipruto returns as defending men’s champion after winning his 2025 New York debut by just three hundredths of a second. Hellen Obiri heads the women’s race after winning last year in a course-record 2:19:51. New York rewards the ability to race its bridges and late climbs as well as raw speed: a fast personal best does not decide what happens on Fifth Avenue.",
        "Former winners Geoffrey Kamworor and Abdi Nageeye are among Kipruto’s opponents. The current list also includes Deresa Geleta, CyBrian Kotut, Conner Mantz and Zouhair Talbi. In the women’s field, 2024 champion Sheila Chepkirui joins Obiri, with Edna Kiplagat, Jessica McClain and Annie Frisbie also entered. Weini Kelati and Andreas Almgren are listed for marathon debuts, adding the intrigue of outstanding shorter-distance athletes tackling 26.2 miles.",
        "The wheelchair races deserve the same attention. Marcel Hug returns after his seventh New York title in 2025; Daniel Romanchuk and David Weir are among the men listed. The women’s field includes Susannah Scaroni, Catherine Debrunner, Tatyana McFadden, Madison de Rozario and Britain’s Eden Rainbow-Cooper.",
        "Names above follow NYRR’s current published field, checked on 30 October 2026. Entry lists can change before the start; they are not a guarantee that every athlete will race.",
      ],
      sources: [
        {
          label: "NYRR: current professional field",
          url: "https://prod.nyrr.org/media-center/events/2026/2026-tcs-new-york-city-marathon/professional-athlete-fields",
        },
        {
          label: "NYRR: defending champions and race background",
          url: "https://prod.nyrr.org/media-center/news/2026/08/19/new-york-road-runners-announces-2026-tcs-new-york-city-marathon-professional-athlete",
        },
      ],
    },
    {
      id: "worldwide-welcome",
      heading: "A city race with a worldwide welcome",
      paragraphs: [
        "New York received more than 240,000 applications for the 2026 drawing from over 160 countries. Those figures describe applicants, rather than confirmed starters, but they show the pull of this race far beyond the United States. The organiser expects a gathering of nearly 60,000 participants, supported by more than two million spectators.",
        "The global celebration starts before race morning. Friday’s opening ceremony at the Central Park finish features the Parade of Nations, bringing runners from around the world into the same procession. It offers a glimpse of what Sunday will feel like: different languages, flags and running backgrounds, all heading towards one finish line.",
        "New York’s international story also runs through its champions. Meb Keflezighi, born in Eritrea and a US citizen from 1998, won here in 2009, ending the American men’s wait for a winner that had lasted since 1982. His career connects an Olympic medal with victories in New York and Boston; his story gives the list of national flags a human face.",
        "Among the published professional entrants are Japan’s Kengo Suzuki, Italy’s Yemaneberhan Crippa, Sweden’s Andreas Almgren, Ireland’s Peter Lynch, Australia’s Haftu Strintzos, Uruguay’s Julia Paternain, Germany’s Fabienne Königstein and Peru’s Mica Rivera Wood. Britain’s Patrick Dever, Jack Rowe and Phily Bowden add further interest for UK followers. These are some of the names on a start list that stretches well beyond one nation or running tradition.",
      ],
      sources: [
        {
          label: "NYRR: worldwide demand for 2026",
          url: "https://prod.nyrr.org/media-center/news/2026/03/04/new-york-road-runners-sets-record-with-240-000-applications-for-2026-tcs-new-york-city",
        },
        {
          label: "Official opening ceremony",
          url: "https://prod.nyrr.org/tcsnycmarathon/opening-ceremony",
        },
        {
          label: "NYRR’s Meb Keflezighi profile",
          url: "https://prod.nyrr.org/hall-of-fame/meb-keflezighi",
        },
        {
          label: "NYRR: current professional field",
          url: "https://prod.nyrr.org/media-center/events/2026/2026-tcs-new-york-city-marathon/professional-athlete-fields",
        },
      ],
    },
    {
      id: "route",
      heading: "The route: from Staten Island to Central Park",
      paragraphs: [
        "The start village is at Fort Wadsworth on Staten Island. From there, the Verrazzano-Narrows Bridge opens the journey towards Brooklyn. It is an imposing beginning: an expanse of harbour, a long bridge and the knowledge that an entire city lies ahead. NYRR’s course series traces how the race links major roads, residential streets, parks and five bridges.",
        "Brooklyn supplies much of the first half: Fourth Avenue, the turn through the downtown area, then neighbourhood streets towards Williamsburg and Greenpoint. The Pulaski Bridge carries runners into Queens at halfway. Long Island City comes next, followed by the Queensboro Bridge and the arrival on First Avenue in Manhattan. Farther north, the route reaches the Bronx before returning to Manhattan and the approach to Central Park.",
        "There is a change worth knowing in 2026. After the Willis Avenue Bridge, the Bronx route takes East 135th Street and Alexander Avenue, continues to East 141st Street, then turns onto Third Avenue and East 138th Street towards the Madison Avenue Bridge. NYRR says this is the first course alteration in 15 years. Returning runners should use the current map.",
        "First Avenue’s crowds, East Harlem and the late Fifth Avenue stretch give spectators distinct places to contribute. The final journey passes Central Park South and Columbus Circle before the finish on West Drive near 67th Street. Cheer for the runners still arriving long after the leaders: they have earned that welcome too.",
        "For runners, the bridges and the late approach along Fifth Avenue make this more than a sightseeing tour. The change from the relative quiet of a bridge to a wall of cheering is part of the appeal. Save something for the closing miles, and let each neighbourhood give you a new reason to keep moving.",
      ],
      sources: [
        {
          label: "Official course experience",
          url: "https://prod.nyrr.org/news/2026/09/16/tcs-new-york-city-marathon-course-experience-video-series",
        },
        {
          label: "Official 2026 course map",
          url: "https://cms.prod.nyrr.org/api/document-files/file/TCSNYCM26_Map_Course_090226_RD3.pdf",
        },
        {
          label: "NYRR’s course update",
          url: "https://prod.nyrr.org/tcsnycmarathon/the-course",
        },
        {
          label: "NYRR spectator guide",
          url: "https://prod.nyrr.org/tcsnycmarathon/watch-the-race",
        },
      ],
    },
    {
      id: "landmarks",
      heading: "The landmarks are more than a skyline",
      paragraphs: [
        "The course reveals the city at street level. Historic forts frame the Staten Island setting; Brooklyn’s brownstones and the Williamsburg Savings Bank add architectural character. Hunters Point, Mott Haven and Harlem bring their own histories. The Queensboro Bridge is both a landmark and a demanding part of the race, while Central Park provides the final green setting.",
        "The Empire State Building and Statue of Liberty belong to the wider views and imagery of New York. They are not stops on the marathon course. The city’s Landmarks Preservation Commission identifies landmarks on, near and visible from the route—a useful distinction when imagining this remarkable running tour.",
      ],
      sources: [
        {
          label: "NYC landmark guide",
          url: "https://www.nyc.gov/site/lpc/about/pr2022/lpc-celebrates-nyc-marathon-with-landmark-story-map-along-route.page",
        },
      ],
    },
    {
      id: "past-winners",
      heading: "Past winners who helped make New York great",
      paragraphs: [
        "The race began in 1970 with 127 entrants and 55 finishers in Central Park. Bill Rodgers and Miki Gorman won the first five-borough edition in 1976; Rodgers went on to win four consecutive New York titles. Tegla Loroupe’s 1994 and 1995 victories helped establish a new chapter in women’s distance running. British fans remember Paula Radcliffe’s wins in 2004, 2007 and 2008, while Mary Keitany collected four titles between 2014 and 2018. In 2017, Shalane Flanagan became the first American women’s open winner for 40 years.",
        "Above them all in New York victories stands Grete Waitz. The Norwegian won nine times, beginning with her marathon debut in 1978 and ending with her 1988 triumph. Her importance extended beyond winning: she coached, supported children’s running and helped others discover what the sport could give them.",
      ],
      sources: [
        {
          label: "NYRR marathon history",
          url: "https://prod.nyrr.org/tcsnycmarathon/marathon-history",
        },
        {
          label: "NYRR’s Grete Waitz profile",
          url: "https://prod.nyrr.org/hall-of-fame/grete-waitz",
        },
      ],
    },
    {
      id: "inspirational-history",
      heading: "Finishes that changed the meaning of the race",
      paragraphs: [
        "In 1992, Waitz accompanied race co-founder Fred Lebow through the marathon while he was in remission from brain cancer. They finished together in 5:32:34. For a runner so closely associated with victory, sharing someone else’s difficult miles became one of her defining New York moments.",
        "Dick Traum’s 1976 finish carried another kind of significance: he became the first amputee to complete the New York City Marathon. The organisation he founded, Achilles International, continues that connection through athletes with disabilities, guides and charity runners. Its 2026 programme includes support along the course in Brooklyn, Queens and Manhattan.",
      ],
      sources: [
        {
          label: "NYRR’s Fred Lebow profile",
          url: "https://prod.nyrr.org/hall-of-fame/fred-lebow",
        },
        {
          label: "Achilles International",
          url: "https://www.achillesinternational.org/nyc-marathon",
        },
      ],
    },
    {
      id: "runners-stories",
      heading: "Inspirational runners to follow in 2026",
      paragraphs: [
        "NYRR’s Team Inspire selection makes the individual ambitions behind this year’s race visible:",
        "Mildred Baker, Bronx: preparing for her first marathon at 80, after finding a running community through NYRR Striders.",
        "Giles Ashton-Roberts, Leicester: marking his 50th birthday with seven TCS-sponsored marathons across four continents, raising money for the Motor Neurone Disease Association in memory of his mother.",
        "Danish Hussain Yar: having left Afghanistan and later moved to the US to attend Cornell, she is running with Free to Run, which advances gender equity through running.",
        "Caleb Prewitt, Florida: the 19-year-old is aiming to become the youngest-known person with Down syndrome to finish this marathon. That remains a goal until he crosses the line.",
        "Dave Obelkevich, New York: NYRR identifies him as the only person to have completed every edition since the five-borough course began in 1976.",
        "This year also carries a $100 million fundraising goal for NYRR’s Official Charity Partner Program.",
      ],
      sources: [
        {
          label: "Meet the 2026 Team Inspire runners",
          url: "https://prod.nyrr.org/media-center/news/2026/10/06/new-york-road-runners-announces-team-inspire26-most-compelling-runner-stories-from-2026-tcs-new-york-city-marathon-field",
        },
      ],
    },
    {
      id: "watch-and-celebrate",
      heading: "How to follow the race and celebrate every finish",
      paragraphs: [
        "Use NYRR’s official watch guide for television and streaming information in your country, spectator locations and race-day updates. For supporters on the streets, pick a meeting place in advance and follow official access advice. The runners you know may need encouragement hours after the champions have finished.",
        "The schedule includes a Final Finishers Celebration from 8pm to 10pm in New York. That feels central to what makes this marathon special: the city keeps making space for people whose race takes much longer. A first finish, a comeback and a charity challenge can each carry a lifetime of meaning.",
        "To everyone running on Sunday: good luck. Your time will tell part of the story. The training, the people who helped you and the reason you started belong in it too.",
      ],
      sources: [
        {
          label: "NYRR: watch and spectator guide",
          url: "https://prod.nyrr.org/tcsnycmarathon/watch-the-race",
        },
        {
          label: "NYRR: final finishers celebration",
          url: "https://prod.nyrr.org/media-center/events/2026/2026-tcs-new-york-city-marathon/media-events-and-schedule",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What date is the New York City Marathon in 2026?",
      answer: "The 2026 TCS New York City Marathon takes place on Sunday 1 November.",
    },
    {
      question: "What time does the New York City Marathon start in the UK?",
      answer:
        "The professional wheelchair races begin at 13:00 and 13:02 GMT. The women’s open race starts at 13:35 GMT, the men’s at 14:05 GMT and mass-participation wave 1 at 14:10 GMT. Later waves follow; check your assigned start.",
    },
    {
      question: "Which boroughs does the New York City Marathon run through?",
      answer:
        "The route visits Staten Island, Brooklyn, Queens, Manhattan and the Bronx, returning to Manhattan to finish in Central Park.",
    },
    {
      question: "Has the marathon route changed for 2026?",
      answer:
        "Yes. The Bronx section now continues along Alexander Avenue to East 141st Street, then uses Third Avenue and East 138th Street towards the Madison Avenue Bridge. Use NYRR’s 2026 map.",
    },
    {
      question: "Who won the 2025 New York City Marathon open races?",
      answer:
        "Benson Kipruto won the men’s open race and Hellen Obiri won the women’s open race. Both appear on the published 2026 field.",
    },
    {
      question: "Does the marathon run over Brooklyn Bridge or through Times Square?",
      answer:
        "No. Its five bridges are the Verrazzano-Narrows, Pulaski, Queensboro, Willis Avenue and Madison Avenue bridges. Times Square is not on the marathon route.",
    },
  ],
  callToAction: {
    heading: "Your achievements deserve to be remembered",
    text: "Running New York, following a friend, or building towards your own first marathon? Create your free AthRecs account, find your athlete profile and bring your race results together. If something is missing, tell us about it so we can help you build your sporting history.",
    label: "Create your free AthRecs account",
    url: "/join",
  },
  links: [
    {
      label: "Find athlete profiles on AthRecs",
      url: "/athletes",
    },
    {
      label: "Explore running fixtures",
      url: "/running/events",
    },
    {
      label: "More AthRecs news",
      url: "/news",
    },
  ],
};
