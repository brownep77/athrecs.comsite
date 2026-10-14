import type { MarathonCountry } from "./types";

// Editorial advice, separate from edition-specific facts and organiser announcements.
export const MARATHON_PLANNING: Record<MarathonCountry, { title: string; text: string }[]> = {
  uk: [
    {
      title: "Choose the course before chasing the calendar",
      text: "London’s city streets and the roads beside Loch Ness make very different days out. Start with the course profile, then look at how you reach the start and get home from the finish. A flat-looking map is only half the story: bridges, exposed stretches and a late climb can all change the way a marathon feels. The route links in each guide are the place to settle those details.",
    },
    {
      title: "Have an entry plan as well as a training plan",
      text: "Compare the entry routes before choosing your favourite Sunday. A ballot, a qualifying place and a charity entry come with different conditions; a confirmed race date does not mean general entry is open. If your first choice depends on a ballot, use the county directory to find another race you would actually enjoy running. The consolation prize need not be another spreadsheet.",
    },
  ],
  australia: [
    {
      title: "Think in states, then in start lines",
      text: "Australia is a sizeable place to go for a run. Use the state and territory directory to narrow the journey before comparing coastal roads, parklands and city courses. Check the precise start and finish venues when booking accommodation, particularly for a course that finishes somewhere different from where it starts. A room near the finish is useful only if you can also reach the start.",
    },
    {
      title: "Separate the marathon from the festival",
      text: "Several events offer shorter distances alongside the full marathon. Make sure the date, entry option and course map you choose all refer to the 42.195 km race. The field figures below identify the year and what was counted, so a festival total does not quietly become the number of marathon runners. Check the organiser’s current timetable before arranging travel around a previous edition’s start time.",
    },
  ],
  "new-zealand": [
    {
      title: "Pick the setting and check the surface",
      text: "Waterfront roads, city streets and countryside routes offer different versions of a New Zealand marathon. Read the surface notes alongside the scenery: the wider running calendar includes mixed-terrain events, while this selection concentrates on road marathons. Use the regional directory and course links to compare the actual route, including any paved paths and the approach to the finish.",
    },
    {
      title: "Build the weekend around the race timetable",
      text: "A point-to-point route can turn a simple morning out into a small transport operation. Check whether the organiser provides a bus, where you collect your number and whether collection is available on race morning. Confirm the full-marathon date before making travel arrangements between regions or islands. The scenery can wait; the start usually will not.",
    },
  ],
  usa: [
    {
      title: "Understand which door gets you to the start",
      text: "Boston, New York and smaller city marathons do not all use the same entry system. Compare qualifying, drawing, charity and direct-entry options in the individual guides. Meeting a time standard can be different from securing a place, and an entry route available for one edition may change for the next. Start with the current official rules before committing to a training target or travel booking.",
    },
    {
      title: "Compare terrain as carefully as the state",
      text: "Use the state directory to find manageable journeys, then read the course profiles. A net-downhill marathon and a flat loop are different propositions, even if both attract runners chasing a time. If you need a qualifying performance, check the receiving race’s course and timing requirements as well as the organiser’s certification. A generous elevation graph cannot fill in the application form for you.",
    },
  ],
  canada: [
    {
      title: "Keep the city, province and edition together",
      text: "Canadian marathon weekends often include several distances, and similar event names can make an entry search less straightforward than it looks. Use the province directory to identify the race, then follow its full-marathon entry and route links. Check that the results archive is showing 42.195 km before comparing fields or previous performances. The Toronto Waterfront guide, for example, belongs to a specific event rather than every Toronto race.",
    },
    {
      title: "Give the route a vote in your decision",
      text: "A waterfront setting does not tell you how much climbing lies elsewhere on the course. Compare the profile, surface and start-to-finish arrangements before settling on a race. For a first marathon, the organiser’s time limit and transport instructions may matter more than the fastest winning time. Use the approximate field as a sense of scale, then read its basis and year before comparing it with another event.",
    },
  ],
  ireland: [
    {
      title: "Look beyond the biggest start line",
      text: "Dublin, Cork, Limerick and the smaller road marathons offer different settings and entry arrangements. Browse by county, then compare the course and field notes to decide whether you want a large city occasion or something more compact. This guide covers the Republic of Ireland; Belfast and other Northern Ireland races sit in the UK guide. A county label is a starting point, since some courses cross more than one boundary.",
    },
    {
      title: "Read the full-marathon entry details",
      text: "At events with a half marathon, relay or ultra, check that your entry is for the individual full marathon. Look for collection arrangements, start times and any transport to the start before making the weekend plan. Previous results help show the race’s scale, but finishers are not the same as entries. For a time target, study the route map as well as the headline course description; hills have never been much impressed by ambition.",
    },
  ],
  "south-africa": [
    {
      title: "Choose your province, then read the profile",
      text: "A Cape road race and an inland marathon can offer very different terrain. Compare the province, course profile and start-to-finish arrangements rather than treating every 42.195 km event as interchangeable. A net-downhill description still deserves a look at the full elevation profile. For point-to-point races, read the official transport instructions before deciding where to stay or leave a car.",
    },
    {
      title: "Check licences, cut-offs and qualifying rules",
      text: "The individual entry guides explain the published routes for licensed and unlicensed runners where those details are available. Check the edition’s temporary-licence requirements, age rules and cut-off times directly with the organiser. If the marathon is part of a plan to qualify for an ultra, check that ultra’s current qualifying window and accepted results too. This directory covers full road marathons; a famous longer race is still a different distance.",
    },
  ],
};
