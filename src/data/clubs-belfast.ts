import type { ClubSeed } from "./types";

// Belfast Running club directory, accessed 2026-08-16:
// https://www.belfastrunning.com/clubs
//
// Affiliations were checked against the current Athletics Northern Ireland
// Find A Club directory. Newtownabbey Racers was checked against the official
// Special Olympics Ireland club finder. Ormeau Runners is retained as a
// verified active club, but is explicitly not described as Athletics NI
// affiliated. Beechmount Harriers is maintained in clubs-athletics-ireland.ts
// so that the same club is not added twice.
export const belfastClubs: ClubSeed[] = [
  {
    slug: "athletics-ni-albertville-harriers",
    name: "Albertville Harriers",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.albertvilleharriers.org",
    summary:
      "Athletics Northern Ireland affiliated running and athletics club based in north Belfast.",
    source_names: ["Albertville Harriers"],
  },
  {
    slug: "athletics-ni-annadale-striders",
    name: "Annadale Striders",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.annadalestriders.co.uk",
    summary:
      "Athletics Northern Ireland affiliated running and athletics club based in south Belfast.",
    source_names: ["Annadale Striders"],
  },
  {
    slug: "athletics-ni-barf-ni",
    name: "BARF NI",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://barfni.co.uk",
    summary:
      "Athletics Northern Ireland affiliated mountain and fell running club based in Belfast.",
    source_names: ["BARF", "BARF NI", "Belfast Association of Rock Climbers & Fell Runners"],
  },
  {
    slug: "athletics-ni-belfast-running-club",
    name: "Belfast Running Club",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.belfastrunningclub.co.uk",
    summary:
      "Athletics Northern Ireland affiliated running club based around Ormeau Park in south Belfast.",
    source_names: ["Belfast Running Club", "BRC"],
  },
  {
    slug: "athletics-ni-dub-running-club",
    name: "Dub Running Club",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.dubrunners.club",
    summary: "Athletics Northern Ireland affiliated running club based in south Belfast.",
    source_names: ["Dub Running Club", "Dub Runners"],
  },
  {
    slug: "athletics-ni-lagan-valley-ac",
    name: "Lagan Valley AC",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.laganvalleyac.co.uk",
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in greater Belfast.",
    source_names: ["Lagan Valley AC", "Lagan Valley A.C."],
  },
  {
    slug: "athletics-ni-mallusk-harriers",
    name: "Mallusk Harriers",
    city: "Newtownabbey",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.malluskharriers.co.uk",
    summary:
      "Athletics Northern Ireland affiliated running club based in the Mallusk and Newtownabbey area.",
    source_names: ["Mallusk Harriers"],
  },
  {
    slug: "athletics-ni-north-belfast-harriers",
    name: "North Belfast Harriers",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.northbelfastharriers.com",
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in north Belfast.",
    source_names: ["North Belfast Harriers", "NBH"],
  },
  {
    slug: "athletics-ni-orangegrove-ac",
    name: "Orangegrove AC",
    city: "Belfast",
    county: "Down",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.orangegroveac.co.uk",
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in east Belfast.",
    source_names: ["Orangegrove AC", "Orangegrove A.C."],
  },
  {
    slug: "belfast-ormeau-runners",
    name: "Ormeau Runners",
    city: "Belfast",
    county: "Down",
    country: "Northern Ireland",
    sports: ["Running"],
    website: "https://www.ormeaurunners.co.uk",
    summary:
      "Active social running club based around Ormeau Park in Belfast; represented in current Athletics NI results but not listed as a currently affiliated Athletics NI club.",
    source_names: ["Ormeau Runners"],
  },
  {
    slug: "athletics-ni-queens-university-ac",
    name: "Queens University AC",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    summary:
      "Athletics Northern Ireland affiliated university running, cross-country and track and field club based in Belfast.",
    source_names: ["Queens University AC", "Queen's University AC", "Queen's University A.C."],
  },
  {
    slug: "athletics-ni-st-annes-ac",
    name: "St Annes AC",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    summary:
      "Athletics Northern Ireland affiliated running and cross-country club based in west Belfast.",
    source_names: ["St Annes AC", "St. Anne's AC", "St Anne's A.C."],
  },
  {
    slug: "athletics-ni-st-malachys-ac",
    name: "St Malachys AC",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in north Belfast.",
    source_names: ["St Malachys AC", "St. Malachy's", "St. Malachy's AC"],
  },
  {
    slug: "athletics-ni-victoria-park-and-connswater-ac",
    name: "Victoria Park and Connswater AC",
    city: "Belfast",
    county: "Down",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://vpcac.com",
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in east Belfast.",
    source_names: [
      "Victoria Park and Connswater AC",
      "Victoria Park & Connswater AC",
      "VPAC",
      "VPCAC",
    ],
  },
  {
    slug: "athletics-ni-west-belfast-coolers",
    name: "West Belfast Coolers",
    city: "Belfast",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in west Belfast.",
    source_names: ["West Belfast Coolers", "WBC"],
  },
  {
    slug: "athletics-ni-willowfield-harriers",
    name: "Willowfield Harriers",
    city: "Belfast",
    county: "Down",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website: "https://www.willowfieldharriers.co.uk",
    summary:
      "Athletics Northern Ireland affiliated running, cross-country and track and field club based in east Belfast.",
    source_names: ["Willowfield Harriers", "Willowfield Temperance Harriers", "Willowfield"],
  },
  {
    slug: "special-olympics-newtownabbey-racers",
    name: "Newtownabbey Racers Special Olympics Club",
    city: "Newtownabbey",
    county: "Antrim",
    country: "Northern Ireland",
    sports: ["Athletics", "Running"],
    website:
      "https://specialolympicsireland.justgo.com/weblets/CoachAndClubFinder/124c8f3b-1e94-44fc-8217-e70f15956969/Club/details/55B67B69-88B1-4A56-ADDF-E4FFFAE30C61?page=1",
    summary:
      "Official Special Olympics Ireland club offering athletics training and competition in Newtownabbey, County Antrim.",
    source_names: ["Newtownabbey Racers", "Newtownabbey Racers Special Olympics Club"],
  },
];
