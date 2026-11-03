import type { EditorialArticle } from "../lib/athrecs/editorial";

const menSource =
  "https://liveresults.nyrr.org/e/NYRR-NY2026#/leaderboard/top-men-overall-marathon/FINISH";
const womenSource =
  "https://liveresults.nyrr.org/e/NYRR-NY2026#/leaderboard/top-women-overall-marathon/FINISH";

export const NEW_YORK_MARATHON_2026_RESULTS: EditorialArticle = {
  slug: "new-york-city-marathon-2026-results",
  kind: "news",
  date: "2026-11-01",
  displayDate: "1 November 2026",
  publishedAt: "2026-11-01T20:15:00Z",
  modifiedAt: "2026-11-03T01:45:00Z",
  author: "AthRecs Editorial",
  title: "New York City Marathon 2026 results: Almgren and Chepkirui win as McClain shines",
  seoTitle: "New York Marathon 2026 Results: Professional Top 20",
  description:
    "New York City Marathon 2026 results: professional men’s and women’s top 20, winning times, USA and UK performances, and regional athlete highlights. Preliminary.",
  standfirst:
    "Andreas Almgren won his marathon debut in 2:06:01. Sheila Chepkirui reclaimed the women’s title in 2:24:36, just six seconds ahead of Jessica McClain. Here are the professional top 20 men and women from the 2026 TCS New York City Marathon, the performances behind the numbers, and the latest position on country and regional results.",
  body: [
    "New York gave us two different kinds of arrival on Sunday 1 November: a track and half-marathon star becoming a marathon winner, and an established champion finding her way back to the top. Around them came breakthrough podiums, a strong American challenge and results that will matter far beyond the athletes at the front.",
    "Results status: this first edition uses NYRR’s preliminary professional leaderboards, checked on 1 November 2026. The displayed times are gun times and the places are within the men’s or women’s professional division. NYRR says times and places may change. Complete country and regional top 20s require the full field, including mass-start runners; those tables are awaiting verification and are not implied by the professional lists below.",
  ],
  sports: ["road-running"],
  locations: [{ country: "United States", area: "New York" }],
  image: {
    src: "/images/editorial/new-york-city-marathon-2026-results.jpg",
    alt: "2026 New York City Marathon preliminary professional winners: Andreas Almgren of Sweden in 2:06:01 and Sheila Chepkirui of Kenya in 2:24:36.",
    caption:
      "AthRecs results graphic. Source: NYRR / RTRT.ME preliminary professional gun-time leaderboards, 1 November 2026.",
    width: 1200,
    height: 630,
  },
  sections: [
    {
      id: "winners",
      heading: "Who won the New York City Marathon in 2026?",
      paragraphs: [
        "Sweden’s Andreas Almgren won the professional men’s race in 2:06:01. Italy’s Yemaneberhan Crippa finished second in 2:06:14 and Lesotho’s Kamohelo Mofolo third in 2:06:26. Kenya’s Sheila Chepkirui won the professional women’s race in 2:24:36, followed by Jessica McClain of the United States in 2:24:42 and Kenya’s Hellen Obiri in 2:24:43.",
        "The rounded finish times tell you how close it was: 25 seconds covered the men’s podium and only seven seconds separated the first three women. On a course that asks runners to handle bridges, changing rhythms and the late approach to Central Park, those are margins that keep every move significant.",
      ],
      sources: [
        { label: "NYRR: professional men’s live results", url: menSource },
        { label: "NYRR: professional women’s live results", url: womenSource },
      ],
    },
    {
      id: "race-standings",
      heading: "New York City Marathon results",
      paragraphs: [
        "The professional boards show the first 20 men and women in gun-time order. Select Search recorded field to find other runners already listed on AthRecs. Clubs, teams and race-day trainers appear where documented.",
      ],
      standings: {
        race: "New York City",
        distance: "Marathon",
        timing: "Gun time",
        credit:
          "New York Road Runners / RTRT.ME · Professional top 20 in each division · Preliminary gun times, 1 November 2026",
        editionSlug: "new-york-city-marathon-2026-11-01-marathon-71613832",
        artwork: "/images/editorial/nyc-standings-skyline.svg",
        anchors: { Men: "men-top-20", Women: "women-top-20" },
        rows: [
          // Club: https://turebergfriidrott.web.sportadmin.se/nyheter/?ID=273036&NID=1372013 · Raced in: https://marathonhandbook.com/the-shoes-that-won-the-2026-new-york-city-marathon/
          {
            division: "Men",
            place: 1,
            name: "Andreas Almgren",
            country: "SWE",
            time: "2:06:01",
            club: "Turebergs FK",
            clubLabel: "Club",
            shoes: "Nike Apex",
          },
          // Club: https://www.fidal.it/content/FIDAL-Super-Crippa-secondo-a-New-York%21/187420 · Raced in: https://marathonhandbook.com/the-shoes-that-won-the-2026-new-york-city-marathon/
          {
            division: "Men",
            place: 2,
            name: "Yemaneberhan Crippa",
            country: "ITA",
            time: "2:06:14",
            club: "Fiamme Oro",
            clubLabel: "Club",
            shoes: "On LightSpray Cloudboom Strike 2",
          },
          // Team: https://www.letsrun.com/news/2026/11/new-york-city-marathon-mens-results-andreas-almgren-wins-marathon-debut/ · Raced in: https://marathonhandbook.com/the-shoes-that-won-the-2026-new-york-city-marathon/
          {
            division: "Men",
            place: 3,
            name: "Kamohelo Mofolo",
            country: "LES",
            time: "2:06:26",
            club: "McKirdy Trained",
            clubLabel: "Team",
            shoes: "Xtep 160X 8.0 Pro",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 4,
            name: "Benson Kipruto",
            country: "KEN",
            time: "2:06:27",
            shoes: "adidas Adizero Adios Pro Evo 3",
          },
          // Club: https://www.trackathletes.ie/athlete/haftustrintzos_16401/ · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 5,
            name: "Haftu Strintzos",
            country: "AUS",
            time: "2:06:34",
            club: "Glenhuntly Athletic Club",
            clubLabel: "Club",
            shoes: "ASICS Metaspeed Ray",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 6,
            name: "Zouhair Talbi",
            country: "USA",
            time: "2:06:43",
            shoes: "ASICS Metaspeed Ray",
          },
          // Team: https://www.mhi.com/jp/company/sports/marathon/profile/runner/kondo.html · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 7,
            name: "Ryota Kondo",
            country: "JPN",
            time: "2:07:08",
            club: "Mitsubishi Heavy Industries Marathon Team",
            clubLabel: "Team",
            shoes: "ASICS Metaspeed Sky Tokyo",
          },
          // Team: https://www.nazelite.com/ahmed-muhumed · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 8,
            name: "Ahmed Muhumed",
            country: "USA",
            time: "2:07:09",
            club: "HOKA NAZ Elite",
            clubLabel: "Team",
            shoes: "HOKA prototype (DEV-1187090)",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 9,
            name: "Geoffrey Kamworor",
            country: "KEN",
            time: "2:07:09",
            shoes: "Nike Alphafly 3",
          },
          // Club: https://press.on-running.com/obiri-klecker-ford-kiprop-on-athletics-club-goes-the-marathon-distance · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Men",
            place: 10,
            name: "Ryan Ford",
            country: "USA",
            time: "2:07:17",
            club: "On Athletics Club",
            clubLabel: "Club",
            shoes: "On LightSpray Cloudboom Strike 2",
          },
          // Team: https://runeliteprogram.com/team/
          {
            division: "Men",
            place: 11,
            name: "Conner Mantz",
            country: "USA",
            time: "2:07:27",
            club: "Run Elite Program",
            clubLabel: "Team",
          },
          { division: "Men", place: 12, name: "Cybrian Kotut", country: "KEN", time: "2:07:42" },
          { division: "Men", place: 13, name: "Abdi Nageeye", country: "NED", time: "2:07:58" },
          { division: "Men", place: 14, name: "Aidan Troutner", country: "USA", time: "2:08:54" },
          // Club: https://press.on-running.com/obiri-klecker-ford-kiprop-on-athletics-club-goes-the-marathon-distance
          {
            division: "Men",
            place: 15,
            name: "Joe Klecker",
            country: "USA",
            time: "2:09:28",
            club: "On Athletics Club",
            clubLabel: "Club",
          },
          // Team: https://www.minnesotadistanceelite.org/joel-reichow
          {
            division: "Men",
            place: 16,
            name: "Joel Reichow",
            country: "USA",
            time: "2:09:43",
            club: "Minnesota Distance Elite",
            clubLabel: "Team",
          },
          // Club: https://www.britishathletics.org.uk/2026-27-olympic-world-class-programme-athletes-announced/
          {
            division: "Men",
            place: 17,
            name: "Patrick Dever",
            country: "GBR",
            time: "2:09:53",
            club: "Preston Harriers",
            clubLabel: "Club",
          },
          // Club: https://press.on-running.com/obiri-klecker-ford-kiprop-on-athletics-club-goes-the-marathon-distance
          {
            division: "Men",
            place: 18,
            name: "Patrick Kiprop",
            country: "KEN",
            time: "2:10:01",
            club: "On Athletics Club",
            clubLabel: "Club",
          },
          // Club: https://www.trackathletes.ie/athlete/peterlynch_16120/
          {
            division: "Men",
            place: 19,
            name: "Peter Lynch",
            country: "IRL",
            time: "2:10:03",
            club: "Kilkenny City Harriers AC",
            clubLabel: "Club",
          },
          // Team: https://www.minnesotadistanceelite.org/
          {
            division: "Men",
            place: 20,
            name: "Merga Gemeda",
            country: "USA",
            time: "2:10:32",
            club: "Minnesota Distance Elite",
            clubLabel: "Team",
          },
          // Raced in: https://marathonhandbook.com/the-shoes-that-won-the-2026-new-york-city-marathon/
          {
            division: "Women",
            place: 1,
            name: "Sheila Chepkirui",
            country: "KEN",
            time: "2:24:36",
            shoes: "adidas Adizero Adios Pro Evo 3",
          },
          // Raced in: https://marathonhandbook.com/the-shoes-that-won-the-2026-new-york-city-marathon/
          {
            division: "Women",
            place: 2,
            name: "Jessica McClain",
            country: "USA",
            time: "2:24:42",
            shoes: "Brooks prototype",
          },
          // Club: https://press.on-running.com/obiri-klecker-ford-kiprop-on-athletics-club-goes-the-marathon-distance · Raced in: https://marathonhandbook.com/the-shoes-that-won-the-2026-new-york-city-marathon/
          {
            division: "Women",
            place: 3,
            name: "Hellen Obiri",
            country: "KEN",
            time: "2:24:43",
            club: "On Athletics Club",
            clubLabel: "Club",
            shoes: "On LightSpray Cloudboom Strike 2",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 4,
            name: "Edna Kiplagat",
            country: "KEN",
            time: "2:25:42",
            shoes: "PUMA Fast-R Nitro Elite 3",
          },
          // Team: https://www.nazelite.com/mercy-chelangat · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 5,
            name: "Mercy Chelangat",
            country: "KEN",
            time: "2:25:46",
            club: "HOKA NAZ Elite",
            clubLabel: "Team",
            shoes: "HOKA Cielo X1 3.0",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 6,
            name: "Carrie Ellwood",
            country: "USA",
            time: "2:26:28",
            shoes: "ASICS Metaspeed Edge Tokyo",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 7,
            name: "Weini Kelati",
            country: "USA",
            time: "2:26:51",
            shoes: "Nike Apex",
          },
          // Team: https://www.nazelite.com/paige-wood · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 8,
            name: "Paige Wood",
            country: "USA",
            time: "2:27:29",
            club: "HOKA NAZ Elite",
            clubLabel: "Team",
            shoes: "HOKA Rocket X 3",
          },
          // Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 9,
            name: "Viola Cheptoo",
            country: "KEN",
            time: "2:28:34",
            shoes: "adidas Adizero Adios Pro Evo 3",
          },
          // Club: https://www.leichtathletik.de/aktuelles/news/news-detail/82492-fabienne-koenigstein-zehnte-andreas-almgren-brilliert-bei-debuet · Raced in: https://www.runnersworld.com/gear/a74306133/fastest-shoes-of-2026-nyc-marathon/
          {
            division: "Women",
            place: 10,
            name: "Fabienne Königstein",
            country: "GER",
            time: "2:28:49",
            club: "Hannover 96",
            clubLabel: "Club",
            shoes: "PUMA Fast-R Nitro Elite 3",
          },
          // Club: https://www.fidal.it/content/FIDAL-Super-Crippa-secondo-a-New-York%21/187420
          {
            division: "Women",
            place: 11,
            name: "Giovanna Epis",
            country: "ITA",
            time: "2:28:55",
            club: "Carabinieri",
            clubLabel: "Club",
          },
          // Team: https://runwithitpod.podbean.com/e/48-julia-paternain-%E2%80%93-what-do-you-mean-third-in-the-world/
          {
            division: "Women",
            place: 12,
            name: "Julia Paternain",
            country: "URU",
            time: "2:29:09",
            club: "McKirdy Trained",
            clubLabel: "Team",
          },
          { division: "Women", place: 13, name: "Lauren Hagans", country: "USA", time: "2:29:42" },
          {
            division: "Women",
            place: 14,
            name: "Mica Rivera Wood",
            country: "PER",
            time: "2:29:52",
          },
          // Team: https://www.minnesotadistanceelite.org/
          {
            division: "Women",
            place: 15,
            name: "Annie Frisbie",
            country: "USA",
            time: "2:30:04",
            club: "Minnesota Distance Elite",
            clubLabel: "Team",
          },
          { division: "Women", place: 16, name: "Amanda Vestri", country: "USA", time: "2:30:16" },
          { division: "Women", place: 17, name: "Phily Bowden", country: "GBR", time: "2:30:45" },
          // Team: https://www.otsukakj.jp/track/athlete/
          {
            division: "Women",
            place: 18,
            name: "Rie Kawauchi",
            country: "JPN",
            time: "2:31:29",
            club: "Otsuka Pharmaceutical Track & Field",
            clubLabel: "Team",
          },
          // Club: https://www.batcitytc.com/
          {
            division: "Women",
            place: 19,
            name: "Monica Hebner",
            country: "USA",
            time: "2:33:21",
            club: "Bat City Track Club",
            clubLabel: "Club",
          },
          // Club: https://www.letsrun.com/news/2026/11/new-york-city-marathon-womens-results-chepkirui-wins-mcclain-of-usa-2nd/
          {
            division: "Women",
            place: 20,
            name: "Roberta Groner",
            country: "USA",
            time: "2:35:55",
            club: "Central Park Track Club Tracksmith",
            clubLabel: "Club",
          },
        ],
      },
    },
    {
      id: "almgren-crippa",
      heading: "Almgren’s marathon debut, Crippa’s consistency",
      paragraphs: [
        "A debut win can sound like a surprise until you look at the athlete making it. Andreas Almgren arrived with European records and championship success at shorter distances. His 2026 season already included the world half-marathon title in Copenhagen, in a European record 58:06, and the European 10,000m title. New York added the missing distance to that picture.",
        "His range is part of the fascination. Almgren’s background includes 800m racing; by 2025 he was a world 10,000m bronze medallist, and now he has won over 42.195km. The progression makes the result interesting beyond its winning time: speed that once belonged on the track has carried through to the closing stages of a major marathon.",
        "Yemaneberhan Crippa’s second place gives Italy another substantial marathon performance. He won Paris earlier in 2026 in 2:05:18 and owns European titles at 10,000m from 2022 and the half marathon from 2024. His 2:06:14 here shows why a fast result on one course becomes more compelling when an athlete can race well on another.",
      ],
      sources: [
        {
          label: "World Athletics: 2026 race report",
          url: "https://worldathletics.org/competitions/world-athletics-label-road-races/news/new-york-city-marathon-2026-almgren-chepkirui",
        },
        { label: "NYRR: Andreas Almgren", url: "https://prod.nyrr.org/athletes/andreas-almgren" },
        {
          label: "NYRR: Yemaneberhan Crippa",
          url: "https://prod.nyrr.org/athletes/yemaneberhan-crippa",
        },
      ],
    },
    {
      id: "chepkirui-obiri",
      heading: "Chepkirui returns to the top; Obiri keeps the standard high",
      paragraphs: [
        "Sheila Chepkirui’s second New York title follows her 2024 victory. She came into this edition with another major road success already secured: a second consecutive Nagoya Women’s Marathon win, achieved in March in 2:21:54. Her 2:17:29 marathon best dates to her Valencia debut in 2022, but New York rewarded her ability to win a close race as much as her ability to run fast.",
        "Hellen Obiri finished only one second behind McClain in the displayed results. A two-time New York winner before this race, Obiri holds the 2:19:51 course record from 2025 and has won world titles on the indoor track, outdoor track and in cross country. She also took Olympic marathon bronze in Paris in 2024. Beating an athlete with that range gives the performances ahead of her extra weight.",
      ],
      sources: [
        { label: "NYRR: Sheila Chepkirui", url: "https://prod.nyrr.org/athletes/sheila-chepkirui" },
        { label: "NYRR: Hellen Obiri", url: "https://prod.nyrr.org/athletes/hellen-obiri" },
        { label: "NYRR: women’s finish order", url: womenSource },
      ],
    },
    {
      id: "usa-north-america",
      heading: "USA and North America: McClain’s podium and American depth",
      paragraphs: [
        "Jessica McClain’s 2:24:42 brought her second place and the leading American women’s finish in the professional race. The result follows fifth place in Boston earlier this year, where she ran 2:20:49. For an athlete who finished fourth at the 2024 US Olympic Trials in both the marathon and 10,000m, this is a particularly satisfying place to find herself: firmly on a major-marathon podium.",
        "The depth behind her deserves attention. Carrie Ellwood, Weini Kelati and Paige Wood finished sixth, seventh and eighth in 2:26:28, 2:26:51 and 2:27:29. Kelati’s marathon debut adds a new chapter to a career that already includes the 2024 US Olympic Trials 10,000m title and an American half-marathon record of 1:06:04 in Barcelona earlier in 2026.",
        "Zouhair Talbi led the American professional men in sixth place, running 2:06:43. Ahmed Muhumed was eighth in 2:07:09, Ryan Ford tenth in 2:07:17 and Conner Mantz eleventh in 2:07:27. Altogether, eight USA men and nine USA women appear in these professional top 20s. Their depth gives American supporters plenty to celebrate beyond the podium.",
      ],
      sources: [
        { label: "NYRR: Jessica McClain", url: "https://prod.nyrr.org/athletes/jessica-mcclain" },
        { label: "NYRR: Weini Kelati", url: "https://prod.nyrr.org/athletes/weini-kelati" },
        { label: "NYRR: men’s results", url: menSource },
        { label: "NYRR: women’s results", url: womenSource },
      ],
    },
    {
      id: "united-kingdom",
      heading: "United Kingdom results: Patrick Dever and Phily Bowden",
      paragraphs: [
        "Patrick Dever finished seventeenth in the men’s professional race in 2:09:53. He returned to New York after being officially credited with third on his marathon debut here in 2025, and ran 2:06:18 in London in 2026. His record also includes representing Great Britain over 5,000m at the Paris Olympics and winning the NCAA 10,000m title while at Tulsa in 2021.",
        "Phily Bowden also took seventeenth in the women’s professional race, finishing in 2:30:45. Her marathon achievements include third place in Copenhagen in 2023 in 2:29:16. England Athletics highlighted the way she ran a faster second half in the heat to climb into the podium positions. New York adds another demanding international race to that record.",
      ],
      sources: [
        { label: "NYRR: Patrick Dever", url: "https://prod.nyrr.org/athletes/patrick-dever" },
        {
          label: "England Athletics: Bowden’s Copenhagen podium",
          url: "https://www.englandathletics.org/news/philippa-bowden-led-the-england-charge-at-copenhagen-marathon/",
        },
        { label: "NYRR: men’s results", url: menSource },
        { label: "NYRR: women’s results", url: womenSource },
      ],
    },
    {
      id: "africa",
      heading: "Africa: Mofolo’s podium and Kenya’s women",
      paragraphs: [
        "Kamohelo Mofolo’s 2:06:26 earned Lesotho a place on the men’s podium on his 21st birthday, calculated from the birth date listed by World Athletics. He finished ahead of Kenya’s Benson Kipruto by one second in the displayed times. In May, Mofolo had made his marathon debut in Cape Town, finishing eleventh in 2:08:50. His New York time was 2 minutes 24 seconds faster: a considerable step forward in the space of a season.",
        "Kenyan women occupied five of the first nine professional places: Chepkirui, Obiri, Edna Kiplagat, Mercy Chelangat and Viola Cheptoo. Kiplagat’s fourth place in 2:25:42 was especially striking. The 2010 New York champion and two-time world marathon champion remains competitive with runners from a very different generation. Chelangat followed four seconds later in 2:25:46.",
      ],
      sources: [
        { label: "NYRR: men’s results", url: menSource },
        { label: "NYRR: women’s results", url: womenSource },
        {
          label: "World Athletics: race report and Kiplagat’s career context",
          url: "https://worldathletics.org/competitions/world-athletics-label-road-races/news/new-york-city-marathon-2026-almgren-chepkirui",
        },
        {
          label: "World Athletics: Mofolo’s date of birth",
          url: "https://worldathletics.org/athletes/athlete-representatives/directory/kamohelo-mofolo-414066",
        },
        {
          label: "Cape Town Marathon: 2026 results",
          url: "https://capetownmarathon.com/2026-results/",
        },
        {
          label: "Cape Town Marathon: Mofolo’s debut entry",
          url: "https://capetownmarathon.com/2026-elite-field/",
        },
      ],
    },
    {
      id: "europe",
      heading: "Europe: a men’s one-two and a close women’s contest",
      paragraphs: [
        "Almgren and Crippa gave Sweden and Italy the first two men’s professional places. The European performances continued through Abdi Nageeye of the Netherlands, thirteenth in 2:07:58; Dever; and Ireland’s Peter Lynch, nineteenth in 2:10:03.",
        "Germany’s Fabienne Königstein led the European women in the professional top 20, taking tenth in 2:28:49. Italy’s Giovanna Epis was only six seconds behind, eleventh in 2:28:55, with Bowden seventeenth. Königstein had placed sixth in Berlin in 2025 in 2:22:17, a useful reminder of the calibre of athlete needed to reach even the back of New York’s leading ten.",
      ],
      sources: [
        { label: "NYRR: men’s results", url: menSource },
        { label: "NYRR: women’s results", url: womenSource },
        {
          label: "World Athletics: professional field background",
          url: "https://worldathletics.org/competitions/world-athletics-label-road-races/news/new-york-city-marathon-2026-preview-obiri-kipruto",
        },
      ],
    },
    {
      id: "oceania-asia",
      heading: "Oceania and Asia: Strintzos and Kondo reach the men’s top seven",
      paragraphs: [
        "Australia’s Haftu Strintzos finished fifth in 2:06:34, only eight seconds behind third place in the displayed results. In July he had set an Australian marathon record of 2:06:20 at Gold Coast. Running within 14 seconds of that mark in New York is another substantial performance in a breakthrough season.",
        "Japan’s Ryota Kondo finished seventh in 2:07:08. His rise in the marathon began with second place on his Osaka debut in February 2025 in 2:05:39, a Japanese debut best at the time. New York gives him another leading result against international opposition. The official timing order places him ahead of Muhumed and Kamworor, who both display 2:07:09.",
        "Rie Kawauchi represented Japan in the women’s professional top 20, placing eighteenth in 2:31:29. Earlier in 2026, the Otsuka Pharmaceuticals runner finished sixth at the Osaka Women’s Marathon in 2:24:16. Her New York result adds a different course and race experience to the season.",
      ],
      sources: [
        { label: "NYRR: professional men’s finish order", url: menSource },
        { label: "NYRR: professional women’s finish order", url: womenSource },
        {
          label: "Australian Athletics: Strintzos’s Gold Coast record",
          url: "https://www.athletics.com.au/news/izzi-batt-doyle-breaks-australian-womens-marathon-record-in-sizzling-chicago-race/",
        },
        {
          label: "Mitsubishi Heavy Industries: Kondo’s 2025 Osaka debut",
          url: "https://www.mhi.com/jp/company/sports/marathon/result/20250224.html",
        },
        {
          label: "Osaka Women’s Marathon: 2026 results",
          url: "https://www.osaka-marathon.jp/results/results_2026/",
        },
      ],
    },
    {
      id: "south-america",
      heading: "South America: Paternain and Rivera Wood in the leading women",
      paragraphs: [
        "Uruguay’s Julia Paternain finished twelfth in 2:29:09, with Peru’s Mica Rivera Wood fourteenth in 2:29:52. Two South American athletes in the professional women’s top 14 give the region a prominent place in the results.",
        "Paternain arrived with a world marathon bronze medal from Tokyo in 2025 and an eighth-place finish at London in 2026. Those achievements bring context to a name that deserves recognition beyond a single result. Just 43 seconds separated her from Rivera Wood in New York, with both finishing inside two and a half hours.",
      ],
      sources: [
        { label: "NYRR: women’s results", url: womenSource },
        {
          label: "World Athletics: Paternain’s championship and London background",
          url: "https://worldathletics.org/competitions/world-athletics-label-road-races/news/new-york-city-marathon-2026-preview-obiri-kipruto",
        },
      ],
    },
    {
      id: "country-regional-results",
      heading: "Where are the complete country and regional top 20s?",
      paragraphs: [
        "The intended coverage includes the overall field, USA, United Kingdom, Africa, Europe, Middle East, Oceania, North America, Central America, South America and Asia, with separate men’s and women’s rankings. NYRR now lists the 2026 race in its official results directory. On AthRecs, the professional standings and searchable race archive cover a selection of runners. Neither establishes a complete country or regional ranking.",
        "Central America and the Middle East are included in that wider coverage. The professional top 20s do not identify their leading finishers, and full regional rankings remain pending. The country field and timing basis will be stated with those lists so readers can understand exactly who is included.",
        "For this series, North America includes Central America and the Caribbean, so the Central American list will be a separately identified subset. The Middle East is also a regional grouping rather than an additional continent; its country membership and any overlap with Asia, Europe or Africa must be stated alongside the eventual table. Athletes can therefore appear in more than one relevant category while keeping one AthRecs profile.",
      ],
      sources: [
        { label: "NYRR: official results directory", url: "https://results.nyrr.org/races" },
        { label: "NYRR: live 2026 results", url: "https://liveresults.nyrr.org/e/NYRR-NY2026" },
        {
          label: "NYRR: 2026 event information and results guidance",
          url: "https://prod.nyrr.org/races-and-events/2026/2026-tcs-new-york-city-marathon",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Who won the men’s 2026 New York City Marathon?",
      answer:
        "Andreas Almgren of Sweden won the professional men’s race on 1 November 2026 in 2 hours, 6 minutes and 1 second, according to NYRR’s preliminary gun-time results.",
    },
    {
      question: "Who won the women’s 2026 New York City Marathon?",
      answer:
        "Sheila Chepkirui of Kenya won the professional women’s race in 2 hours, 24 minutes and 36 seconds. Jessica McClain was second and Hellen Obiri third in the preliminary results.",
    },
    {
      question: "Who were the leading American runners in the professional races?",
      answer:
        "Zouhair Talbi was the leading USA man, sixth in 2:06:43. Jessica McClain was the leading USA woman, second in 2:24:42. These are professional race places, not separate national ranks across every start.",
    },
    {
      question: "How did Patrick Dever and Phily Bowden finish?",
      answer:
        "Patrick Dever finished seventeenth in the professional men’s race in 2:09:53. Phily Bowden finished seventeenth in the professional women’s race in 2:30:45.",
    },
    {
      question: "Are these final results or chip times?",
      answer:
        "These tables show NYRR’s preliminary professional leaderboards by gun time. The organiser warns that times and places may change and that personal net times may differ. Full-field country and regional tables are awaiting verification.",
    },
    {
      question: "How far is the New York City Marathon?",
      answer:
        "The marathon distance is 42.195 kilometres, usually described as 26.2 miles. The race takes runners through New York City’s five boroughs to the finish in Central Park.",
    },
  ],
  callToAction: {
    heading: "Which performance deserves a closer look?",
    text: "Explore the athletes behind the results, share the performance that caught your attention, and celebrate the runners whose stories continue beyond the finish line.",
    label: "Explore AthRecs athlete profiles",
    url: "/athletes",
  },
  links: [
    {
      label: "Search the New York City Marathon race archive on AthRecs",
      url: "/results/new-york-city-marathon-2026-11-01-marathon-71613832",
    },
    { label: "Official NYRR results archive", url: "https://results.nyrr.org/races" },
    {
      label: "AthRecs: 2026 New York City Marathon route and race background",
      url: "/news/new-york-city-marathon-2026-preview",
    },
  ],
};
