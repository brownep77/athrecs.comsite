# Fuller production catalogue backup

`athrecs-live-export-2026-08-10.json.gz` is the read-only API export taken from
`https://www.athrecs.com` before the catalogue merge.

- Exported: `2026-08-10T06:48:20.507Z`
- Method: public TanStack server-function API (not rendered-page scraping)
- SHA-256 of the uncompressed JSON:
  `b182a63ec45365fd2eba89c76f05c1afd4e3884641a840a7eaa9a83e8feee893`
- Source counts: 254 athletes, 129 race series, 531 editions, 1,469 results,
  and 42 raw club-name values

The generated TypeScript catalogue is a deduplicated union of this backup and
the newer GitHub catalogue. It also restores four edition records implied by
newer result rows so every result retains referential integrity.
