# Global fixture import programme

This programme converts the 266-source registry into verified Athrecs events and editions.
Every registry region and country-focus label remains in scope.

## Controls

1. Use a registry source only when its `enabled` flag and rights status permit it.
2. Keep disabled international sources in the review queue; do not silently exclude them.
3. Work in three-race checkpoints so a failed source or deployment cannot lose a large batch.
4. Confirm public event facts against an organiser, governing body or organiser-linked entry page.
5. Deduplicate on canonical name, sport, country, city and date before import.
6. Store country, county/region, city, source URL, checked date and official entry route.
7. Do not collect participant-level results through the fixture workflow.
8. Run the global-progress, source, duplicate, catalogue, TypeScript and production-build checks.

## Checkpoint global-001

Three Ireland events were discovered through the approved JustRuns source and corroborated against organiser and entry pages:

- Hardman Killarney — Triathlon — 29 August 2026
- Run Brave for Yourself — Running — 17 October 2026
- Run Ballinskelligs — Running — 25 October 2026

The source remains `in_progress`; its other listed events are still pending, so the programme cannot accidentally mark it complete after one checkpoint.

## Checkpoint global-002

Three further Ireland road-running events were discovered through the approved JustRuns source and corroborated against organiser, governing-body or organiser-linked entry pages:

- BK5K — Running — 22 August 2026
- Kildare AC 70th Anniversary Road Races — Running — 23 August 2026
- South Kilkenny Run — Running — 23 August 2026

The source remains `in_progress`. BK5K and South Kilkenny retain their official registration routes; Kildare AC is still listed as a fixture but its online sales deadline has passed, so ATHRECS marks entry as closed.

## Checkpoint global-003

Three future running events extend the verified fixture programme into three new country labels:

- Camperdown Park 5K/10K/Half Marathon — Scotland — 6 September 2026
- Manchester Running Festival — England — 20 September 2026
- RunThrough Trails Engelberg — Switzerland — 22 August 2026

The two UK fixtures were discovered through the approved Up and Running organiser sitemap and checked against its current booking partner. Engelberg was discovered through RunThrough's organiser calendar, checked against the live RunThrough Trails page and corroborated by Switzerland Tourism. Manchester remains a valid fixture but is marked closed because all listed distances are sold out.

The RunThrough source scope is now recorded as `UK & Europe`, with the RunThrough Trails domain and Switzerland explicitly included. Up and Running's discovered country focus is recorded as England, Scotland and Wales. Both discovery sources remain `in_progress` so subsequent checkpoints can keep adding verified countries without implying complete calendar coverage.

## Checkpoint global-004

Three more future running fixtures add Wales to the countries represented by the verified programme and extend Scotland's coverage:

- Run4All Neath 5K Summer Series — Wales — 2 September 2026
- Cuningar Loop 5K/10K — Scotland — 25 October 2026
- Morgan's Army BRISCO Gorseinon 10K — Wales — 4 April 2027

The Welsh fixtures were discovered through the enabled TE Sports Timing calendar and checked against the organiser and live event pages. Cuningar Loop was discovered through the approved Up and Running organiser source and checked against its active booking partner. All three were checked against the existing ATHRECS catalogue before import; similar club and parkrun records were not treated as duplicate fixtures. Both sources remain `in_progress` for later checkpoints.

## Checkpoint global-005

Three verified RunThrough Trails fixtures introduce three more European countries to the programme:

- 5Laghi Ivrea — Italy — 6 September 2026
- RunThrough Trails Berchtesgaden — Germany — 17 October 2026
- RunThrough Trails Girona — Spain — 3 April 2027

Each event was discovered through the enabled RunThrough UK & Europe source and checked against a current organiser page and live entry route. The 5Laghi race date is also corroborated by the local organiser and Turismo Torino because one RunThrough Trails calendar card shows the preceding event-weekend date. The RunThrough country focus now records Germany, Italy, Spain, Switzerland and the United Kingdom, and the source remains `in_progress` for further European checkpoints.

## Checkpoint global-006

Three further organiser-verified fixtures extend the programme into France and the United States while adding another triathlon fixture in England:

- RunThrough Trails Morzine-Avoriaz — Running — France — 19 June 2027
- Long Beach 5K, 10K & Half Marathon — Running — United States — 3 April 2027
- Royal Windsor Triathlon — Triathlon — England — 13 June 2027

All three use current RunThrough organiser entry pages with open registration, published prices, dates and locations. The RunThrough registry record is now global rather than UK-and-Europe-only and records France and the United States in its verified country focus. The source remains `in_progress`; additional global fixtures and disciplines are still queued for later checkpoints.

## Checkpoint global-007

Three organiser-verified fixtures broaden the discipline mix while keeping the checkpoint deliberately small for fast publication:

- Ride Reigate — Cycling — England — 11 July 2027
- Goodwood Motor Circuit Running GP & Duathlons — Duathlon — England — 25 July 2027
- Lake District Running Festival — Running — England — 10 April 2027

All three are listed on current RunThrough organiser pages with open registration, published dates, locations and prices. Ride Reigate introduces a dedicated cycling sportive to the global programme, Goodwood adds a mixed running-and-duathlon race day under the Duathlon taxonomy, and the Lake District fixture adds two long-distance mountain-trail options. Each was checked against the full ATHRECS catalogue before import, and the source remains `in_progress`.

## Checkpoint global-008

Three organiser-verified road and park fixtures extend United States coverage and introduce Northern Ireland to the verified checkpoint programme:

- Philadelphia Labor Day 5K, 10K & 10 Mile — Running — United States — 7 September 2026
- Washington DC 5K & 10K at Anacostia Park — Running — United States — 13 September 2026
- Hillsborough Castle & Gardens Running Festival — Running — Northern Ireland — 25 July 2027

All three have current RunThrough organiser pages with open registration, published prices, dates, start times and locations. The two US fixtures add distinct city races in Philadelphia and Washington DC; Hillsborough adds a new country label and two distances in the castle grounds. Each canonical name, location and date was checked against the full ATHRECS catalogue before import. The source remains `in_progress` so further countries can be added in later three-event checkpoints.

## Checkpoint global-009

Three further organiser-verified United States fixtures expand New York and New Jersey coverage:

- Staten Island 5K, 10K & Half Marathon at Freshkills Park — Running — United States — 27 September 2026
- Hoboken 5K & 10K — Running — United States — 17 October 2026
- New York 5K, 10K & Half Marathon at Flushing Meadows — Running — United States — 15 November 2026

All three have current RunThrough organiser pages with open registration, published prices and start times. The Flushing Meadows page's route-information section confirms the Queens address; an erroneous Michigan postcode in its top summary is documented but not imported. Australia remains queued because its organiser currently offers only 2027 interest registration without confirmed dates. Each fixture was checked against the full ATHRECS catalogue before import, and the source remains `in_progress`.

## Checkpoint global-010

Three organiser-verified trail fixtures add two Swiss cantons and a distinct Surrey point-to-point event:

- RunThrough Trails Ascona-Locarno — Running — Switzerland — 24 October 2026
- RunThrough Ultra Orsières — Running — Switzerland — 3 October 2026
- The Fox Trail — Running — England — 22 May 2027

The Swiss fixtures extend regional coverage into Ticino and Valais, while The Fox adds a multi-distance trail ultra across Surrey. Each official RunThrough page has open registration, published prices, dates, locations and start times. The three canonical names, locations and dates were checked against the full ATHRECS catalogue; similarly located parkruns and unrelated Interlaken or Ladybower records were not treated as matches. No participant result rows were collected, and the source remains `in_progress`.
## Checkpoint global-011

Three future Atlanta road-race weekends start the official-organiser-only United States
expansion:

- PNC Atlanta 10 Miler & 5K — 25 October 2026
- Invesco QQQ Thanksgiving Day Half Marathon, 5K, Mile & Dash — 26 November 2026
- Atlanta Marathon Weekend — 6–7 March 2027

All three were verified on current Atlanta Track Club event pages. Their primary entry
routes are the registration pages linked directly by Atlanta Track Club, not a race
directory. The 10 Miler, Thanksgiving half marathon and Atlanta marathon were each
checked against the full ATHRECS catalogue before import; no matching series or edition
was found. Only fixture-level facts are retained and participant result rows remain
excluded. The official organiser source remains `in_progress` for later US checkpoints.
