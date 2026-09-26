# AthRecs scraping protection — first stage

## Findings and scope (26 September 2026)

The deployed AthRecs project is `athrecs-comsite`
(`prj_lbw3shClq8n6SThzl8i825UPBp6I`) in team
`athrecs-holding-page-set-up` (`team_9LaPtmxxgJlZ80PpdxggOibC`).
The application reviewed was main commit `91e7e474d4bc2fb978178b560fb38db24fd6df73`.

- The current `/athletes` directory has a server-enforced maximum of 48 records.
  Its default is 24. Public results pages return 100 results per page.
- Legacy `listAthletes` and `getEditionResults` server functions had no response
  limit. The latter is still called by the results panel on race pages.
- Those legacy reads did not consistently apply account sharing opt-outs and
  hidden-result settings. The patch adds those filters for AthRecs.
- The patch caps the legacy athlete list at 48 (with bounded offset pagination)
  and the race preview at 100. Search can still find athletes beyond page one.
  Race panels link to the complete paginated results page when the cap is reached.
- Staff catalogue/import functions inspected use `staffMiddleware`; account
  operations inspected use authenticated middleware. This is not a full access
  control audit of every server function.
- Individual public athlete profiles, search metadata, robots.txt and sitemaps
  are unchanged. No CAPTCHA or login wall has been added.
- RunRecs retains its existing query behaviour and has no new enforcement.

These response caps reduce extraction per request. They are NOT request rate
limits and do not prevent a scraper from walking through public pages. Club
member lists, other public catalogue lists and per-profile histories remain
follow-up surfaces; this patch does not claim complete scraping protection.

## Live firewall status

The Vercel connector confirmed the project and production deployment but does
not expose firewall configuration or traffic metrics. The browser connection
failed before opening the dashboard. No firewall setting was read, changed or
staged on Vercel, and no traffic baseline has been collected. Existing live
protections must not be assumed to be on or off.

## Prepared firewall rollout

Use the existing Vercel project in a linked checkout. Inspect current state and
any existing draft first; do not overwrite another draft or publish unrelated
changes. CLI syntax is based on Vercel's Firewall documentation and must be
checked against the installed CLI with `vercel firewall --help`.

```sh
vercel firewall overview --json
vercel firewall rules list --json
vercel firewall diff --json
```

Start with LOG-ONLY rate rules, scoped to production, the two public AthRecs
hosts, and GET. Do not match `update.athrecs.com`, RunRecs, authentication POSTs,
workers, static assets, robots.txt or sitemap files. The thresholds below are
provisional observation thresholds, not justified production blocking limits.
No live traffic measurements were available to tune them.

```sh
vercel firewall rules add "AthRecs public catalogue volume (observe)" \
  --condition '{"type":"host","op":"inc","value":["athrecs.com","www.athrecs.com"]}' \
  --condition '{"type":"environment","op":"eq","value":"production"}' \
  --condition '{"type":"method","op":"eq","value":"GET"}' \
  --condition '{"type":"path","op":"re","value":"^/(athletes|results)(/|$)"}' \
  --action rate_limit --rate-limit-window 60 --rate-limit-requests 300 \
  --rate-limit-keys ip --rate-limit-action log --yes

vercel firewall rules add "AthRecs public RPC volume (observe)" \
  --condition '{"type":"host","op":"inc","value":["athrecs.com","www.athrecs.com"]}' \
  --condition '{"type":"environment","op":"eq","value":"production"}' \
  --condition '{"type":"method","op":"eq","value":"GET"}' \
  --condition '{"type":"path","op":"pre","value":"/_serverFn/"}' \
  --action rate_limit --rate-limit-window 60 --rate-limit-requests 600 \
  --rate-limit-keys ip --rate-limit-action log --yes

vercel firewall rules inspect "AthRecs public catalogue volume (observe)" --json
vercel firewall rules inspect "AthRecs public RPC volume (observe)" --json
vercel firewall diff --json
```

Review the exact draft before publishing. The Vercel Firewall skill requires
user publication of the staged rules with `vercel firewall publish --yes`.
After publication, review matching traffic before considering enforcement.

The RPC path includes legitimate account reads on the public domain; it is an
observation rule only. Never switch it wholesale to blocking without examining
actual callers. Do not trust a request solely because its User-Agent says
Googlebot. Use verified crawler identities for future search-crawler exceptions.

Inspect Bot Protection's current mode; if new monitoring is needed, use Log
before Challenge. Do not turn on a blanket AI Bots Deny rule: that can also deny
AI search and user-requested retrieval. Review training/search bots separately.
Do not add an external reverse proxy in front of Vercel as part of this rollout.

After sufficient representative traffic has been inspected, test targeted
blocking in preview, then tune and publish the production rules. Check public
profiles, directory search, paginated results, account sign-in, staff tools and
Google/Bing/selected AI crawlers. Revert a new rule to Log or disable it if it
blocks intended traffic. No enforcement or later review runs automatically from
this document.

## Verification

```sh
node scripts/verify-public-read-limits.mjs
node scripts/verify-public-results-section.mjs
npm run typecheck
```

The first test executes the actual legacy handlers and SQL against an isolated
PGlite database containing synthetic athletes. It covers oversized requests,
fixed response caps, pagination, searches beyond page one, private profiles,
sharing opt-outs, hidden results, invalid input before SQL, no data writes and
RunRecs compatibility. It does not load or export production athlete data.
