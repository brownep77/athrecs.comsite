# Club research imports

Club research can now be imported into the persistent database without replacing
existing public club profiles or creating speculative duplicate clubs.

The additive migration `20261014_club_research_imports.sql` creates:

- `club_research_batches`: source Page, source check date and expected profile count.
- `club_research_profiles`: biography, proposed search title and meta description,
  conversational answer, notable people, dated history, source references,
  competition notes, editorial caveats and original research payload.

The workbook's `club_...` identifiers are retained in `source_local_club_id`.
They are not AthRecs integer club IDs. Confirmed matches use the existing
`clubs.id` foreign key; uncertain or absent matches remain null with
`match_status = 'needs_review'`.

All imported rows have `publication_status = 'draft'`. Public club routes do not
read these tables. Both tables enable row-level security and revoke PUBLIC
access; database-owner/staff backend access remains available. This migration
does not create a staff screen or publish imported biographies. Publication needs
a separate reviewed integration with the existing club-profile code.

## Import contract

1. Read the source Page and preserve the complete original profile payload.
2. Match against names, aliases, official websites and locations in the current
   database. Fuzzy similarity generates candidates only; it is not a match decision.
3. Use a transaction for the batch and all profiles. Guard confirmed club IDs
   against their expected slugs. Validate unique source keys, payload equality,
   linked-club counts and all nested people/history/source counts.
4. Use deterministic profile IDs and the unique batch/source-record key. An
   idempotent repeat must leave counts unchanged and reject changed payloads
   instead of silently overwriting earlier research.
5. Verify committed rows with a separate read before reporting success.

The initial 48-profile batch was rehearsed on an isolated branch, including an
identical second import. Both runs retained 48 profiles, 18 confirmed club links,
30 records requiring club matching, 56 people entries, 106 milestones and
129 source entries. Full original payload equality was checked. No club,
athlete, result or public-profile rows are written by this import.

Payloads and private research notes are stored in the database, not this
repository. The separate workbook/SQLite research exports require their own
update; database import does not alter those files.

## Staff database checks

```sql
SELECT b.id, b.imported_at,
       count(*) AS profiles,
       count(*) FILTER (WHERE p.club_id IS NOT NULL) AS matched_existing,
       count(*) FILTER (WHERE p.club_id IS NULL) AS needs_match,
       sum(jsonb_array_length(p.notable_people)) AS people,
       sum(jsonb_array_length(p.historical_moments)) AS milestones,
       sum(jsonb_array_length(p.sources)) AS source_entries
FROM club_research_batches b
JOIN club_research_profiles p ON p.batch_id = b.id
GROUP BY b.id, b.imported_at;

SELECT p.club_name, p.match_status, c.slug,
       p.search_title, p.meta_description, p.publication_status
FROM club_research_profiles p
LEFT JOIN clubs c ON c.id = p.club_id
ORDER BY p.club_name;
```
