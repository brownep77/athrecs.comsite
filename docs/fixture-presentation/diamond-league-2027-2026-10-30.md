# Diamond League 2027 fixtures and TV guide

Reviewed 30 October 2026. This release makes the existing circuit discoverable on
Track and Field, links it from the athletics calendar, and adds viewing-country
controls to each of the 15 meeting pages. Stable live slugs are retained, including
the existing Monaco and Zurich redirects. No new series or duplicate meetings.

## Calendar evidence

- [Diamond League announcement, 12 October 2026](https://www.diamondleague.com/wanda-diamond-league-publishes-2027-calendar/)
  confirms the 15 meetings from Doha on 7 May to Zurich on 25–26 August.
- [Paris organiser, 19 October 2026](https://paris.diamondleague.com/le-menu-sera-copieux/)
  confirms 25 June 2027. The seed previously said 18 June; that date is corrected
  in the seed and withheld publicly, preserving the old database record for audit.
- [Silesia organiser](https://memorialkamili.pl/en/) confirms 14–15 August.
  [Polish federation, 19 October 2026](https://www.pzla.pl/aktualnosci/15326-wszystko-czego-oczekujecie-oto-konkurencje-diamentowej-ligi-2027-na-lasku)
  distinguishes the women's jumps city event on 14 August from the main meeting on
  15 August. The central series calendar lists 15 August. Both days are retained.
- The production publisher uses the existing staged catalogue ledger and inserts
  only missing confirmed days. It does not replace entry options, results or
  existing start times. Any date without an edition remains TBC for its start.

## Broadcast evidence and limits

- [BBC](https://www.bbc.co.uk/sport/athletics/articles/c62dnrjpg5yo): UK rights extend across 2027.
  Specific channels and programme times are not inferred. England, Scotland,
  Wales and Northern Ireland are individually selectable under the UK agreement.
- [FloTrack announcement](https://www.flotrack.org/articles/12428819-the-diamond-league-is-streaming-on-flotrack-starting-in-2025):
  multi-year US deal beginning in 2025, excluding domestic US meetings. Its end
  year is unspecified here, so 2027 listings remain unconfirmed. Selecting Eugene
  explicitly removes FloTrack as the proposed broadcaster. No NBC carry-forward.
- [Infront, 4 June 2026](https://www.infront.sport/news/sports-media-rights/infront-strengthens-wanda-diamond-league-global-broadcast-network-through-spate-of-new-agreement):
  2026 broadcasters in Brazil, Canada, China, Denmark, France, Indonesia, Macau,
  Norway, Philippines, Singapore and Sweden. These are labelled previous-season
  broadcasters; this announcement does not confirm 2027 rights.
- [Infront, 23 July 2024](https://www.infront.sport/news/sports-media-rights/infront-strike-key-broadcast-agreements-for-wanda-diamond-league-from-2025):
  agreements beginning in 2025 for Germany, Hungary, Latvia, Netherlands, Poland,
  Portugal, Russia and Switzerland. The end dates/2027 meetings are unconfirmed.
  Germany's limited live coverage and highlights qualification is retained.
- [Official country/meeting guide](https://www.diamondleague.com/where-to-watch/):
  checked, but its introduction still describes 2026. It is linked for current
  local listings, not treated as evidence of universal 2027 availability. No
  unrestricted YouTube availability is asserted. Other countries remain unknown.

There are 24 selectable country/territory records (UK home nations separately).
The guide is deliberately season-specific. Future seasons require a new review.
The initial review did not establish meeting-specific 2027 broadcast clocks.

## Validation

`npm run verify:diamond-league` checks all 15 seed identities/dates, retained
Silesia/Zurich days, superseded Paris withholding, unknown-country behavior,
Eugene's US exception and idempotent publication using synthetic database rows.
Type checking and the Vite production artifact build are also run before release.
