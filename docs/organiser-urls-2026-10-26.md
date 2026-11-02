# Verified organiser URLs — 26 October 2026

## Finding and scope

Google's 07:58 UTC notification reports the non-critical missing `organizer.url`
field. It does not report an indexing exclusion. The current Search Console
example inventory could not be read: Browser Use returned `insufficient_credits`.
No Search Console validation or live Google Rich Results Test was submitted.

The inspected production deployment was `dpl_Ese2sMazRivxJ6GP54RAVj5RFuEq`, READY
at main `65c04981b41de41990e12cd812841ffd2fdf1540`. PRs #931, #752 and #753 were
reviewed; searches of newer PRs found no equivalent fix.

The warning alone did not prove a regression. Code and live comparison do identify
one omission: `racePageMetadata` only forwarded a reviewed programme or guide's
organiser website. Other `event.website` values were deliberately excluded to
avoid promoting directory/timing/entry pages into organiser identities. That
filter also dropped genuine organiser sites. The schema serializer itself already
supports HTTPS organiser URLs. Boston's live SportsEvent names Boston Athletic
Association but has no URL, despite its stored B.A.A. race website. Both ordinary
and language/country catalogue routes share the affected metadata function.

All 119 URLs retained from the **15 October** Search Console investigation were
fetched afresh on 26 October: 119 successful HTTP responses, 97 current Event
objects, 58 named organisers missing a URL. This is **not** the example list or
total for the new warning. The anonymous baseline is in
`organiser-urls-2026-10-26-before.json`.

## Correction

Restore a verified organiser homepage only when **both** the existing organiser
name and the stored website hostname match the reviewed allowlist. No fuzzy name
matching, subdomain suffix matching, arbitrary website fallback, inferred HTTPS
upgrade, or AthRecs organiser URL. Existing programme/guide evidence retains
precedence. Unknown names and placeholders remain omitted; a recognised name with
an unreviewed, missing or mismatched URL remains named without a URL.

Nice Work explicitly manages some other organisations' races: its hostname alone
must never turn those organisations into Nice Work. The same principle applies to
timing providers, federations, charities and entry services.

The allowlist restores URLs for **531 dated seed race pages** as at 26 October.
This is a seed-model impact count, not a production database or Google count.
The remaining seed model includes 1,196 named Events without a reviewed URL;
unknown/placeholder organisers are a separate group. Future coverage can grow by
adding primary-source evidence and exact name/domain pairs.

Four independently checked guides now include both organiser name and URL:
Boston Marathon (USA), Boston Half, Dartmoor Discovery and Goodwood 50K. Their
current six dated Event objects retain all other properties. Other guides remain
unchanged apart from the shared template modification date. No organiser identity
is inferred from an unreviewed guide's entry link.

No database writes, date corrections, new editions, slug changes, redirects,
canonical changes, robots changes or indexing-policy changes are part of this PR.
Archive pages retain their existing non-Event representation.

## Primary evidence inspected 26 October

| Identity / scope | Official source and observation |
| --- | --- |
| Boston Athletic Association | https://www.baa.org/ and https://www.baa.org/races/boston-half/ identify B.A.A. and its races; https://www.baa.org/races/boston-marathon/ confirms Boston Marathon. |
| RunThrough / RunThrough Events | https://www.runthrough.co.uk/ identifies the organiser; https://www.runthrough.co.uk/event/running-gp-at-goodwood-motor-circuit-february-2027 identifies its Goodwood 50K. |
| Nice Work | https://www.nice-work.org.uk/pages/display/about explains its own races and separate management services. Only an existing Nice Work identity matches. |
| Andali Events | https://www.andalievents.com/ explicitly identifies its Beacons, Ludlow and Mortimer races. Retains the identity correction from #753. |
| Florida Running Company | https://www.floridarunningco.com/ explicitly hosts Mother's Day and other holiday races. Retains the identity correction from #753. |
| Cancer Research UK | https://raceforlife.cancerresearchuk.org/ explicitly identifies Cancer Research UK's Race for Life. |
| Teignbridge Trotters | https://www.teignbridgetrotters.co.uk/our-races/dartmoor-discovery identifies the club and its Dartmoor Discovery race. |
| parkrun | https://www.parkrun.com/ identifies the global organiser; https://support.parkrun.com/hc/en-us/articles/200565633-1-10-Additional-parkrun-days explicitly links each allowed national hostname. Main parkrun pages block some direct automated opens; the official support page was readable and the global identity was returned by primary-source search. |
| Google field definition | https://developers.google.com/search/docs/appearance/structured-data/event describes `organizer.url` as the event host's domain URL and the organiser fields as recommended. |

## Verification and remaining work

Passed locally: TypeScript; changed-file ESLint; organiser routing/adversarial
tests; event-schema and offer tests; full race-page rollout audit (9,671 pages,
26,978 editions); all 199 marathon/half/ultra guides; biography and Hamburg
programme regressions; 382 calendar assertions. A direct comparison against the
original implementation preserved every catalogue metadata field except the
organiser URL, and every non-organiser guide field (using the same template
modification date). CI also runs the new organiser regression.

The new Google example inventory, Rich Results Test and Search Console validation
still require working authenticated browser access. Request validation only after
the actual examples have been checked; a partial source-backed correction does
not establish that every reported item is fixed.

The retained live sample has further names requiring source research, including
Golazo Sports, Jog & Joy, Cork BHAA, overseas local organisers and several Dutch
club/entry listings. Some already have plausible URLs in storage, but plausibility
is not verified ownership. Action Challenge/Ultra Challenge needs particular
identity review: the current Ultra Challenge footer identifies Ultra Challenge
Ltd, while these stored records name Action Challenge. Do not silently equate
the companies or replace that name merely to remove a warning.

Release status and live after-comparison are recorded in the pull request.
