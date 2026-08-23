## What changed

- [ ] Application/layout change
- [ ] Catalogue/data change
- [ ] Database migration
- [ ] Authentication or permissions

## Required checks

- [ ] `npm run ci:verify` passes
- [ ] Vercel preview is Ready
- [ ] Homepage smoke-tested
- [ ] Filtered event URL retains its filters after refresh
- [ ] At least one race, athlete and club slug URL opens directly
- [ ] Database changes are additive or have a verified rollback

## Release safety

Describe the smallest rollback for this pull request and confirm that no unrelated files are included.
