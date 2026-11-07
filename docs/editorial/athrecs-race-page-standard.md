# AthRecs editorial race pages — production standard (v1)
Date: 7 November 2026
Example: Wymondham New Year's Day 10K, 1 January 2027
Status: staged for review; no bulk rollout or unlicensed media publication.

## Editorial promise
AthRecs is both a practical event guide and a lasting archive of sporting achievements. Human, specific writing with a little well-judged humour where appropriate. Never fabricate course experience, runner quotes, PB potential, records or availability. Every event should sound like that event, not a renamed template. One AthRecs brand across all sports.

## Page structure
1. **Hero**: rights-cleared photograph of real competitors at this event (or properly licensed relevant athlete imagery), credit and accessible alt text. If no cleared image, display the page attractively without one. Do not hotlink or self-host unlicensed photography.
2. **Above the fold**: descriptive H1, place/county/nation flag, sport, discipline, distance, surface, date, local start with timezone, current status, organiser, official entry CTA, add-to-calendar, share, results CTA. Show what is confirmed vs TBC; status/remaining places are live or timestamped data, not article prose.
3. **Human opening**: memorable standfirst plus two–three original paragraphs telling readers why this event matters and who comes. No exaggerated promises.
4. **Course and demands**: verified route, surface, terrain, elevation gain where official, gradients, laps, climbs, terrain/weather exposure, water stations, traffic and accessibility; actionable pacing/kit notes. Only include map/GPX with permission and the correct edition.
5. **At a glance / race-day essentials**: HQ and start/finish separately, exact local time, collecting numbers, parking, public transport, toilets, bag drop, changing, cut-offs, age restrictions, regulations, entry fees, limit, withdrawal/deferral/transfers, medals and categories, prizes, contact, spectators, medical provision where verified. Avoid guessed data.
6. **The experience**: local community, organisers, volunteers, scenery, traditions, charity and atmosphere; provide evidence. Never imply anecdotal first-person attendance.
7. **History and stats**: first edition when evidenced, number of editions, previous winners, full course records with timing convention/course-version qualifiers, last edition participants, performances and photos. Never invent a men's record or compare courses when route changes invalidate it.
8. **Past editions and official results**: one row per distinct event/date/distance; winners and age-group results sourced; link into AthRecs athlete profiles where verified, show unclaimed results and claims flow, preserve provider credit. Do not make personal data public merely because it was ingested.
9. **FAQs**: concise natural questions genuinely answered by known facts. Hide/omit fields not confirmed, don't create pages of filler.
10. **Sources/updates**: one unobtrusive disclosure of review date and official sources. The reader's practical information comes first.
11. **Nearby / similar races**: relevant alternatives using the same geography and distance/sport where verified.
12. **AthRecs CTA**: find results, claim an athlete profile, submit missing results, suggest an amendment; don't hard sell.

## Page lifecycle and data model
- Separate permanent **race series** from each **edition** (date/location/course/version/entry policies/official results).
- Keep original race facts in a structured fixture database; store source URL, checked_at and confidence/status for each field, not just the record.
- Store bespoke narrative as reviewed event/edition editorial data. It must not overwrite official fixture, results or source facts.
- Show only the correct edition guide; never silently carry 2027 prices, rules, traffic closures or course maps into 2028.
- Status changes should be reflected from the approved event system. Do not hard-code places remaining or 'entries open' in descriptive article text.
- When finished, the page should emphasize results and history and link to the next confirmed edition.
- Respect ambiguous identities and unresolved athlete matches; require evidence before link/claim/merge. Athlete data and privacy rules stay in force.
- Distinguish chip vs gun times and official records vs unofficial claims. Note different course versions.
- For previous editions, do not assume a missing year means cancellation; distinguish 'not held' from 'no archive located'.
- Build review queues for records, route maps, FAQ refreshes and stale source links.

## Photographs and ingestion
- First preference: photographed competitors at that exact event, from the organising club, event photographer or approved photographer licence.
- Second: licensed athletes photographed in an earlier edition, explicitly captioned with the right year.
- Third: suitably licensed sport-specific athletes; identify that the picture is illustrative, not from the named race.
- If none is cleared, use an accessible non-photographic page design; do not pass off AI-generated runners as the real race.
- Store image ID, original URL, original source page, photographer/rights holder, licence URL/permission evidence, grant date, territory, expiry, crop permission, required credit, alt text, pictured edition, relevant athlete permission/privacy restrictions, and takedown contact. Preserve credit on hero, social crop and cards.
- Explicit editorial permissions must cover commercial website, social, thumbnails and derivative crops if these uses are needed. A 'posted on official website' flag alone is not a licence.
- Image fields from PDFs, posters and uploaded photographs should be extracted into **candidate** event fields. Match organiser + race name + date + location + distance, detect duplicates against fixture IDs, flag contradictory details, verify against official/current sources, then approve for publication. An uploaded flyer is evidence to review, not automatic permission to reproduce its artwork.
- Keep poster/photograph provenance. No invented alt text descriptions, athletes' identities or photographer credits.
- Use responsive sizes, AVIF/WebP if permitted, good crop focal point, lazy loading below the fold and accessible text alternatives. For the top hero, prioritize load performance.

## Sport-specific enrichments
Running (road/trail/ultra): measured distance where evidenced, road closures, surface, hills, laps, cut-offs, checkpoints, pacers, aid, kit, course certification, gun/chip distinction.
Track & field: meeting/round, discipline, race heat, entry standards, age categories, wind, field implement weights, live results, qualification procedures.
Triathlon/duathlon: individual leg distances, transition rules, wetsuit thresholds, drafting, wave times, cut-offs, bike course, water conditions.
Cycling: sportive vs competitive race, elevation, climbs, timing/classification, feed zones, road safety, route GPX rights.
Swimming: pool/open water, water temperature, wetsuit policy, laps, currents, cut-offs, safety.
HYROX/fitness: division, workout standards, weights, heat start, partner/team rules, doubles/relay scoring.
Parkrun: free participation registration, course surface/accessibility, age rules, volunteer community, official parkrun times distinct from chip-timed events. Follow parkrun's data-use/photo rules.
Keep common layout and AthRecs design vocabulary, not identical boilerplate.

## Search, AI and accessibility
- One crawlable canonical URL per edition where edition-specific details/results merit it, plus a stable series page with history; don't break existing slugs or duplicate competing indexable pages. Choose canonical strategy before launch.
- Accurate title and meta description from verified event-specific information, descriptive H1/H2 sections, internal linking through geographic, sport, race and athlete pages.
- Include Event/SportsEvent structured data only for a real dated event. Correct ISO-8601 startDate with local UTC offset, physical Place location/address, organizer and valid offers as known. Omissions are better than invented data.
- Show any schema price/availability as an accurate representation of visible page facts, not stale hard-coded offers; validate with Google's Rich Results Test and Search Console.
- Image metadata including rights holder/credit only when supported, valid image URL/usage. No invented photo licence fields in structured data.
- BreadcrumbList for hierarchy; support FAQ content for conversational discovery, without promising an FAQ rich result.
- Natural answers to when/where/how much/how difficult/parking/transport/results and archive questions; voice search benefits from readable sentences, not keyword stuffing.
- Usable mobile navigation, proper semantic headings, accessible links and contrast. Check Core Web Vitals.
- No misleading 'official' label where AthRecs is a third-party directory. Put organiser/timing provider credit close to results.

## Validation and rollout
1. Validate Wymondham facts against current organiser/official timing details and the correct historical results.
2. Run typecheck, build, fixture duplication tests, SEO checks, schema validation and mobile accessibility review.
3. Confirm source links, future date/local timezone, working CTAs, no regressions in race result/claims flows.
4. Obtain an appropriate athlete-photo licence (or leave hero image absent).
5. Preview, check PR and deploy only after all release gates pass. Verify actual public page, metadata and results afterwards.
6. Roll out in reviewed batches, prioritising upcoming races (next 90 days), heavily visited event pages and rich historical races. Track number of newly reviewed guides, images cleared, pages published and stale guides; never claim to have processed all fixtures without counts.
7. Use the same data model for approved PDF/poster ingestion, with deduplication and provenance.

## Public suggestions and review workflow
- Every individual race page (catalogue events, road marathon/half-marathon guides and road ultras) shows a visible **Suggest an edit** link in the race header as well as an expandable correction form near the bottom.
- The link scrolls to and opens the form, including when arriving via `#suggest-edit` or returning from sign-in.
- The form automatically identifies the race and, when available, preselects the upcoming edition date. Submitters can change the edition/year to correct an earlier event.
- Choose a category (date/time, distance/course, location/logistics, entry, results/records, image credits/rights, other). Include a written correction and optionally an official source/results URL.
- For now only signed-in users can submit. An unfinished note is kept in the current browser tab across authentication when session storage is available. Do not promise guest submissions until an abuse-resistant route is built.
- Submissions use the existing race-edit API, staff queue, rate limit (five per hour per account) and notification process. They are never auto-applied to public facts.
- Avoid creating a second silo, no unreviewed database overwrites, and no leaking the account identity to public race pages. Admins retain final judgement and source verification responsibility.
