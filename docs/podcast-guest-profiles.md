# Podcast guest profiles and duplicates (30 October 2026)

Owner request: create profiles for podcast guests without one, and merge duplicate profiles.

## New public-figure profiles

Seeded from `src/data/public-figures-podcast-guests.ts`: Daryll Neita, Meb Keflezighi, Dathan Ritzenhein, William Goodge, Cole Brauer, Terry Bradshaw and Colin Kaepernick. These are profiles only, with no race results. Each achievement cites the page that states it.

Facts left out because the sources conflicted or could not be confirmed:
- Neita's World Athletics honours counts disagree with Team GB's medal description.
- Ritzenhein's World Athletics profile returned HTTP 500, so Olympics.com is his primary source.
- Goodge's 2025 Australia crossing is reported by SBS as a 35-day record, but its Guinness ratification is unconfirmed and his data has been publicly questioned. Mission America was still in progress on 30 October 2026, so no completion or time is recorded.
- Bradshaw's nationality is not stated on the sources opened; only his birthplace is recorded.

Not created: **Bronson Hearn-Smith**. He is under 18, so his profile is left for staff to decide under the minor-athlete safeguards.

## Existing profiles matched (no new profile)

- **Emily Jane Fairs** → `emily-fairs-fairs-london-2026-mass-12476`. The London 2026 row (bib 12476, 3:04:51) matches her own account on UNTAPPED (25–26 Oct 2026) of running 3:04 at London. Her UTMB profile also lists her as a British runner. The doubled surname comes from the source listing; correct it only through the staff profile-correction process, preserving the original value.
- **Nick Bester** → `nick-bester` (ATH-017382). He founded Best Athletics (his own coaching site), and his World Athletics profile gives a 2:19:45 Berlin marathon in 2024.

## Duplicates: not merged

No profile merge tool exists. `docs/reviewed-source-identity-policy.md` reserves merges for a separate staff process that covers achievements, identities, ownership, visibility and reversal/audit. About 25 foreign keys reference `athletes`. No merge was performed.

- **Nick Bester, recommended merge** of `nick-bester-25609426` (ATH-001812) into `nick-bester` (ATH-017382).
  - Bideford 10K, 10 May 2026: Nick Bester, BEST ATHLETICS, 2nd, chip 31:45.7 (DBMax/RaceTec results; organiser Bideford AAC).
  - Vitality London 10,000 2026: Nick Bester, Best Athletics, 31:29, Men 35–39 (Mika timing).
  - The name, the club he founded and the age group all match.
  - Open conflict: World Athletics lists South Africa, while the London 10,000 lists GBR. Leave nationality empty until this is resolved.
- **Spencer Matthews, do not merge.** `spencer-matthews-0d983312` (ATH-006682) is a Clapham Chasers runner with one 2026 Chase the Sun Battersea Park result. Nothing links him to Spencer Matthews of UNTAPPED (`spencer-matthews-untapped`). Treat him as a different person unless evidence says otherwise.
