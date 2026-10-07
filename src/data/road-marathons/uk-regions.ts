// English ceremonial counties, Scottish council areas, Welsh county boroughs and
// traditional Northern Irish counties. Checked against the linked sources on 26 September 2026.
export const UK_MARATHON_REGIONS: Record<
  string,
  { region: string; nation: string; sourceUrl: string; note: string }
> = {
  "london-marathon": {
    region: "Greater London & City of London",
    nation: "England",
    sourceUrl:
      "https://www.cityoflondon.gov.uk/services/community-and-safety/london-marathon-public-spaces-protection-order",
    note: "The route passes through the City of London as well as Greater London. These are separate ceremonial counties.",
  },
  "manchester-marathon": {
    region: "Greater Manchester",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Ceremonial county covering Manchester and the Trafford sections of the route.",
  },
  "brighton-marathon": {
    region: "East Sussex",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Brighton and Hove is part of ceremonial East Sussex. The current official course stays in Brighton and Hove, with its western section returning along Hove Promenade.",
  },
  "edinburgh-marathon": {
    region: "City of Edinburgh & East Lothian",
    nation: "Scotland",
    sourceUrl: "https://www.edinburghmarathon.com/marathon/route-map",
    note: "Council areas: the route begins in Edinburgh and follows the coast through Musselburgh into East Lothian, turning at Gosford House.",
  },
  "belfast-city-marathon": {
    region: "Antrim & Down",
    nation: "Northern Ireland",
    sourceUrl: "https://realcounties.com/county/down/",
    note: "Traditional county coverage: Belfast spans Antrim and Down, with the River Lagan forming the traditional boundary through much of the city. These are not current local-government areas.",
  },
  "chester-marathon": {
    region: "Cheshire & Wrexham",
    nation: "England & Wales",
    sourceUrl:
      "https://www.cheshirewestandchester.gov.uk/asset-library/ttro-chester-marathon-2025-v8.1-final.pdf",
    note: "The route starts and finishes in Cheshire, England, and also passes Rossett and Holt in Wrexham county borough, Wales.",
  },
  "yorkshire-marathon": {
    region: "North Yorkshire",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "York belongs to ceremonial North Yorkshire. The current official route map turns west on the York side of the Derwent at Stamford Bridge; do not infer an East Riding course section solely from the wider event road-closure document.",
  },
  "milton-keynes-marathon": {
    region: "Buckinghamshire",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Milton Keynes is a separate unitary authority within ceremonial Buckinghamshire.",
  },
  "southampton-marathon": {
    region: "Hampshire",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Southampton is a separate unitary authority within ceremonial Hampshire.",
  },
  "loch-ness-marathon": {
    region: "Highland",
    nation: "Scotland",
    sourceUrl:
      "https://www.highland.gov.uk/news/article/16235/roads_and_infirmary_bridge_closed_for_loch_ness_marathon_and_festival_of_running",
    note: "Highland council area, covering the Loch Ness route through Dores to Inverness.",
  },
  "abingdon-marathon": {
    region: "Oxfordshire",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Contemporary ceremonial county. Abingdon is in Oxfordshire, despite its historic Berkshire association.",
  },
  "windermere-marathon": {
    region: "Cumbria",
    nation: "England",
    sourceUrl: "https://www.legislation.gov.uk/uksi/2022/331/pdfs/uksiem_20220331_en.pdf",
    note: "Cumbria remains the ceremonial county after the 2023 creation of Cumberland and Westmorland and Furness councils.",
  },
  "boston-marathon-uk": {
    region: "Lincolnshire",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Ceremonial county of the Boston race and its surrounding fenland route.",
  },
  "rob-burrow-leeds-marathon": {
    region: "West Yorkshire",
    nation: "England",
    sourceUrl:
      "https://docs.os.uk/os-downloads/products/areas-and-zones-portfolio/boundary-line/guide-to-ceremonial-county-boundaries",
    note: "Ceremonial county covering Leeds and the route through Otley.",
  },
  "newport-marathon": {
    region: "Newport",
    nation: "Wales",
    sourceUrl: "https://newportwalesmarathon.co.uk/course/",
    note: "Current county borough. The organiser states that the route has not extended into Monmouthshire since the 2024 course change; it turns at Redwick and loops through Newport Wetlands and Goldcliff.",
  },
};
