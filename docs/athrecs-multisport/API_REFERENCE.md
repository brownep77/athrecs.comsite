# Server Function Reference

These are TanStack Start server functions. Authenticated functions use the existing `authMiddleware`; callers never supply a trusted user ID.

## Public catalogue

Module: `multisport-public-api.ts`

| Function | Purpose |
|---|---|
| `searchAllSportEvents` | Search verified public competitions by sport, discipline, surface, geography, participant type, date and either raw distance/unit or normalized metres |
| `getAllSportEvent` | Return a verified event and all public competitions |
| `getAllSportCompetitionResults` | Return published verified results, metrics and segments |
| `getAllSportAthleteProfile` | Return a public athlete profile, all-sport result feed, breakdown and permitted equipment |

## Organiser portal

Module: `organiser-backend.ts`

| Function | Required access | Purpose |
|---|---|---|
| `listSportTaxonomy` | Public | Sports, disciplines and surfaces for forms |
| `createOrganiserOrganisation` | Signed in | Create an unverified organisation and owner membership |
| `getOrganiserDashboard` | Organisation member | Events, uploads and submissions |
| `submitEventClaim` | Organisation admin/owner | Ask Athrecs to link an existing event |
| `submitNewEvent` | Organisation editor+ | Stage a new event, occurrence and competitions |
| `submitEventEdit` | Verified event edit permission | Stage changes to the event series |
| `submitNewOccurrence` | Verified event edit permission | Stage a new dated edition/fixture |
| `submitOccurrenceEdit` | Verified event edit permission | Stage occurrence changes |
| `submitCompetitionEdit` | Verified event edit permission | Stage competition/category changes |
| `uploadResultsCsv` | Verified upload permission | Parse and stage the standard CSV format |
| `uploadResultsJson` | Verified upload permission | Stage generic all-sport JSON rows |
| `getResultUploadBatch` | Organisation member | View rows, warnings, errors and automated checks |

## Athlete backend

Module: `athlete-backend.ts`

| Function | Purpose |
|---|---|
| `listMyAthleteProfiles` | Profiles linked to the signed-in account |
| `submitAthleteProfileClaim` | Self, parent/guardian or representative claim for review |
| `getAthleteBackend` | Restricted Athlete 360/private dashboard, including entries/results grouped by sport, distance, surface, country, region, county, district and city |
| `saveAthletePrivateProfile` | Save private Athlete Passport fields |
| `saveAthletePublicSettings` | Set profile/location/equipment visibility |
| `saveAthleteSport` | Add/update an athlete’s sport and discipline |
| `submitAthletePublicEdit` | Stage a public-profile correction |
| `submitResultClaim` | Claim, reject, correct or report a duplicate result |
| `submitMissingResult` | Submit a missing result and evidence |
| `addAthleteEquipment` | Add kit/equipment to the private locker |
| `saveAthletePreference` | Store declared or calculated preferences with source/confidence |
| `saveAthleteConsent` | Store purpose/channel-specific permission |

Athlete access is capability-scoped. A verified coach, agent or club delegate does not automatically receive addresses, emergency contacts, governing-body identifiers, consent history or buying data. Private identity, public-profile settings, equipment, commercial preferences and consent management are checked separately through `requireAthleteCapability`.

When a reviewer requests more information, athlete-profile and result-claim submissions can be resubmitted into the existing review case. Earlier evidence and audit history are retained rather than creating duplicate open cases.

## Athrecs reviewer console

Module: `verification-backend.ts`

| Function | Purpose |
|---|---|
| `listVerificationQueue` | Prioritised queue of open cases |
| `getVerificationCase` | Case, evidence, checks, upload rows or claim details |
| `reviewDataSubmission` | Approve, reject or request changes for event/athlete submissions |
| `reviewResultUpload` | Publish an approved batch atomically or return it for correction |
| `reviewResultClaim` | Apply result ownership, unlink, correction or duplicate decision |
| `reviewOrganisationVerification` | Set verified organisation level after review |

## Taxonomy administration

Module: `taxonomy-backend.ts`

| Function | Purpose |
|---|---|
| `createSportTaxonomy` | Add or update a sport |
| `createDisciplineTaxonomy` | Add or update a sport discipline and result model |
| `createSurfaceTaxonomy` | Add or update a surface/venue type |
| `publishSportDataSchema` | Publish additional JSON schema for sport-specific data |

## Standard result upload rule

One upload batch belongs to one `competitionId`. A durable `externalEntryKey` should be present for every row and reused in corrected files. The same generic row can describe an individual, team, pair, relay or crew.

## Legacy maintenance imports

The installer patches the existing `api.ts` functions `importFromCsv`, `importFromJson` and `importResults` so they require an authenticated `super_admin`, `admin` or `data_steward`. These remain internal catalogue-maintenance tools; organiser uploads must use the staged verification functions above.

For consistent cross-sport distance search, prefer `distanceMinMetres` and `distanceMaxMetres`. The older `distanceMin`/`distanceMax` filters compare the stored value and should be paired with `distanceUnit`.
