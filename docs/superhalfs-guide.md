# SuperHalfs guide: research and implementation handover

Research checked: **23 October 2026**. This document records the guide’s source
evidence, implementation decisions and verification before publication.

## Scope and routes

Build an evergreen AthRecs guide for amateur, club, elite and professional runners.
The publication route is `/running/superhalfs`; `/superhalfs` and `/super-halfs`
should redirect permanently to that canonical route. Preserve AthRecs branding,
public accessibility and the existing site's navigation and rendering conventions.

## Race dates and primary sources

| Member race                                    | 2027 date    | Evidence and status                                                                                                                       |
| ---------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| EDP Lisbon Half Marathon                       | 7 March      | [Organiser](https://maratonaclubedeportugal.com/en/corrida-marco/edp-lisbon-half-marathon/); confirmed on its race page.                  |
| Generali Prague Half Marathon                  | 3 April      | [RunCzech](https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2); confirmed.                                           |
| Generali Berlin Half Marathon                  | 4 April      | [Organiser race-day information](https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants); confirmed.        |
| Copenhagen Half Marathon                       | 19 September | [Organiser](https://cphhalf.dk/en/); confirmed.                                                                                           |
| Cardiff Half Marathon                          | 3 October    | [Organiser registration page](https://www.cardiffhalfmarathon.co.uk/take-part/register/); confirmed.                                      |
| Valencia Half Marathon Trinidad Alfonso Zurich | 24 October   | [SuperHalfs calendar](https://www.superhalfs.com/en/faqs/); **provisional** pending edition-specific organiser/registration confirmation. |

Do not infer 2028 dates or carry start times, fees, cutoffs, elite standards or entry
status between editions. Prague and Berlin fall on consecutive days in 2027; the
series does not require completing both in the same year.

## Verified series rules and historical exceptions

Primary reference: [official SuperHalfs FAQ](https://www.superhalfs.com/en/faqs/).

- Current SH6 requires the six designated races, in any order, with official chip
  times. The former 60-month completion deadline was removed in 2025.
- Historical eligibility starts with Prague on 2 April 2022. Berlin counts from 2024. Earlier Berlin results must not be credited to SH6.
- Lisbon's qualifying 2022 edition was **8 May**. Identify the named EDP Lisbon
  race and edition; a rule requiring March would incorrectly exclude that result.
  The separate autumn Lisbon half marathon does not qualify.
- Cardiff's March 2022 edition is excluded; its October 2022 edition qualifies.
- The Copenhagen World Road Running Championships half marathon on **20 September
  2026** qualifies despite the different event branding.
- Repeat city finishes and virtual races cannot substitute for another member race.
- SH5 is closed to new registrants. Retained legacy participants follow five races
  within a rolling 36-month window; new registrations from 2024 enter SH6.

The [official series homepage](https://www.superhalfs.com/en/) explains free
SuperPassport registration, separate race entry, recording the passport number,
collecting stamps and receiving the SuperMedal after the final race. A passport
does not itself secure race entry. AthRecs result records must not imply official
passport synchronisation or an officially awarded medal without supporting evidence.

## Content requirements and remaining confirmations

Include a direct opening definition, six-race comparison, entry instructions,
course summaries, official race/entry/results links, historical eligibility,
SuperPassport/medal guidance and natural questions with concise answers.

For amateur runners, explain ballots and other authorised entry routes, bib
collection, edition-specific cutoffs and intermediate checkpoints, practical travel
planning, pacing and accessibility contacts. Distinguish planning advice from
organiser requirements. Avoid suggesting a single universal cutoff.

For club and professional athletes, link the appropriate elite entry/application
pages and explain that qualifying evidence, acceptance, deadlines, seeded starts,
prize eligibility and race-day arrangements are organiser-specific. Do not promise
elite acceptance, prize money, pacing support or appearance arrangements.

Before adding numerical details, confirm the applicable edition and source.
Outstanding or changeable facts include Valencia's final 2027 date; 2027 course
maps, complete timetables, cutoffs, fees, entry availability and elite standards
where not yet published. Label earlier-year guidance explicitly; leave unknown
details pending rather than filling plausible values.

## Search, voice and structured-data decisions

- Use `CollectionPage`, `ItemList` and `BreadcrumbList` only. The six-item list and
  visible breadcrumbs must match real content and destinations. References:
  [CollectionPage](https://schema.org/CollectionPage),
  [ItemList](https://schema.org/ItemList) and
  [Google breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).
- Do not mark this multi-race guide as `Event`. Google's
  [event guidance](https://developers.google.com/search/docs/appearance/structured-data/event)
  places event markup on unique pages focused on individual events.
- Keep natural Q&A visible in server-rendered HTML. **Google retired FAQ rich
  results on 7 May 2026 and removed the documentation on 15 June 2026**:
  [official changelog](https://developers.google.com/search/updates).
  Do not promise FAQ rich results or add `FAQPage` for this implementation.
- Omit `SpeakableSpecification`. Google's
  [Speakable beta](https://developers.google.com/search/docs/appearance/structured-data/speakable)
  concerns topical news and US-English Google Home use, not universal voice ranking.
- Use a descriptive title/meta description, self-referencing canonical,
  meaningful headings, accessible tables, mobile layout and crawlable internal
  links. Return a public HTTP 200 page with substantive SSR content, no accidental
  `noindex`, and inclusion in the existing sitemap. See
  [Google technical requirements](https://developers.google.com/search/docs/essentials/technical).
- Use truthful review/modification dates. Google's
  [AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
  requires no special AI schema or `llms.txt` for visibility. Bing recommends
  [clear structure, evidence and fresh content](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/).
  No search position, indexing, citation or voice placement is guaranteed.

## Development handover

Check canonical redirects, rendered metadata/JSON-LD, sitemap inclusion, source
links, responsive navigation and the visibility of key content without client-side
interaction. Keep the provisional Valencia label consistent across all displays.
The implementation owner should append actual test evidence and publication status
after verification; those steps remain unreported in this research handover.

## Implementation and verification — 23 October 2026

Implemented the canonical static guide, permanent aliases, CollectionPage/ItemList/
BreadcrumbList JSON-LD, visible source-linked questions, sitemap inclusion and
contextual links from running, race-series and half-marathon country pages.

Verification completed before publication:

- `npm run build:dev` and `npm run typecheck` passed. The development build avoids
  the production build’s migration and publication hooks.
- Focused ESLint on the new page, data, SEO and route files passed.
- Independent code/data review confirmed the six race IDs, calendar dates and
  weekdays, time zones, secure official URLs, provisional status and pace arithmetic.
- A local browser harness fetched the raw server responses and passed 25 checks:
  HTTP 200, unique H1/title/description, canonical/robots/Open Graph, all six race
  guides and 11 answers before JavaScript, edition qualifications, valid JSON-LD,
  six list items, anchor integrity, three tables, alias destinations, a single
  sitemap entry with the checked date, alias exclusion and three incoming links.
- Desktop visual inspection passed. A 390px iframe viewport confirmed the mobile
  layout, working date jump link and zero document-level horizontal overflow; the
  wide comparison tables scroll within their labelled containers.
- Button and small-text contrast issues found in review were corrected using the
  existing primary/foreground and muted-text tokens.

The temporary local verification pages and preview-host configuration were removed.
Production deployment and external indexing are separate from these local checks;
the pull request and deployment records provide the publication status.

## Runner preview expansion — 23 October 2026

The follow-up adds a 2027 season preview, two seasonal calendars, a goal-based
race-choice comparison, and a four-stage runner checklist. The visible H1 and
metadata now identify the page as a race preview and runner guide. The existing
race-series page links to it with a descriptive 2027 preview label. The canonical
URL is unchanged.

The ItemList now identifies the six race-card fragments as `WebPageElement`
objects belonging to this CollectionPage, rather than describing them as separate
web pages. See [Schema.org WebPageElement](https://schema.org/WebPageElement).
This change describes the real page structure; it does not claim a special search
feature or guaranteed indexing.

Additional official evidence checked:

- [Berlin event FAQ](https://www.generali-berliner-halbmarathon.de/en/preparation/event-faq):
  runners collect personally at the EXPO with a start card and photo ID; there is
  no collection on Sunday 4 April 2027.
- [Cardiff race information](https://www.cardiffhalfmarathon.co.uk/get-race-ready-fast/race-info/):
  UK packs are posted and overseas entrants collect at the Event Village. The
  linked race brochure still refers to 2026, so the checklist describes the
  current webpage guidance and directs runners to final edition instructions.
- [SuperHalfs result claims](https://www.superhalfs.com/en/faqs/): eligible earlier
  or missing results can be claimed using the race year, event, bib and chip time
  after the organiser’s results have been processed. Link to the
  [official claim form](https://www.superhalfs.com/en/accounts/claims/).

The seasonal scheduling and goal comparison are AthRecs planning guidance. They
do not promise personal bests, name unconfirmed 2027 contenders or prescribe a
training programme. All previously labelled edition uncertainties remain visible.

Google documents [URL Inspection and sitemap discovery](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
as routes for recrawling. No Search Console submission capability is exposed in
this workspace. Crawlability and publication must not be reported as proof of
Google indexing or as a submitted indexing request.

Follow-up verification passed: development build, TypeScript, focused ESLint,
independent content/semantic review and 30 raw-HTML browser checks. Those checks
covered the new preview, five-goal comparison, four-stage checklist, all six race
cards, twelve visible questions, canonical/robots metadata, structured-data
fragments, anchor targets, sitemap inclusion and the incoming preview link.
Desktop visual inspection and a 390px mobile iframe confirmed the layout, working
section navigation, a single-column seasonal layout and no document horizontal
overflow (375px content width and scroll width). The temporary QA page and local
preview-host setting were removed before creating the release commit.
