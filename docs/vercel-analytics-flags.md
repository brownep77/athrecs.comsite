# Feature flags in Vercel Web Analytics

AthRecs reports the feature decisions used by its public shell through the official
`FlagValues` component from `flags/react`. Vercel Web Analytics reads those values
from the DOM and attaches them to consented page views.

| Flag                     | Applies to                                       | Build environment variable         | Default |
| ------------------------ | ------------------------------------------------ | ---------------------------------- | ------- |
| `homepage-colour-picker` | AthRecs homepage                                 | `VITE_FLAG_HOMEPAGE_COLOUR_PICKER` | `true`  |
| `language-picker`        | AthRecs pages eligible for the language selector | `VITE_FLAG_LANGUAGE_PICKER`        | `true`  |

`false` hides the corresponding control. Missing or unrecognised values preserve
the existing enabled behaviour. The shell uses the same evaluated values for
rendering and reporting; unavailable features are omitted, not reported as an
experiment's disabled variant. Route changes replace the values so the homepage
flag does not leak into subsequent pages.

Reporting starts only after the existing analytics consent, on production
`athrecs.com`/`www.athrecs.com`. Private routes remain excluded. No profile data,
chosen language, colour preference, query values, targeting IDs or new cookies are
included. Withdrawal removes the flag script and the existing send-time consent
check blocks further events. Custom events remain disabled by the existing policy.

In the project's **Web Analytics → Flags** panel, filter page views by one of the
keys above after real, opted-in traffic arrives. Historical visits cannot be
backfilled. This reports feature exposure, not clicks or a conversion experiment.

## Management boundary

These switches are configured in the application's build environment and require
a redeploy to change. They do not use Vercel's remotely managed flag provider,
randomise visitors, or implement Toolbar overrides. The reporting integration
works independently of that provider.

During setup the Vercel project Flags API returned `403` (no permission to list
flags); the CLI had no credentials. Remote management therefore remains
unconfigured. After project flag-management access is available, a server-side
provider can replace the build-time evaluator while preserving this reporting
contract. Do not expose provider credentials as `VITE_*` variables.

Reference: https://vercel.com/docs/flags/observability/web-analytics

Validation: `npm run verify:analytics-flags` covers page scoping, defaults and
disabled variants, consent, navigation, private pages and withdrawal using the
actual React analytics integration with an intercepted SDK transport. It does not
claim ingestion into the live Vercel dashboard.
