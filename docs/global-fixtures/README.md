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
