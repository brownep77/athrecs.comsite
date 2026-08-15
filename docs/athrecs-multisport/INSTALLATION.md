# Installation and Integration

## Preconditions

- Work in a branch, not directly on `main`.
- Use a staging Neon branch/database.
- Confirm the current app can migrate, typecheck and build before adding this bundle.
- Take a database backup or point-in-time restore checkpoint.

## Copy files

From the root of the Athrecs repository:

```bash
cp /path/to/bundle/migrations/0004_*.sql migrations/
cp /path/to/bundle/migrations/0005_*.sql migrations/
cp /path/to/bundle/migrations/0006_*.sql migrations/
cp /path/to/bundle/migrations/0007_*.sql migrations/
cp /path/to/bundle/src/lib/athrecs/*.ts src/lib/athrecs/
mkdir -p docs/athrecs-multisport templates/athrecs-multisport
cp /path/to/bundle/docs/*.md docs/athrecs-multisport/
cp /path/to/bundle/templates/* templates/athrecs-multisport/
cp /path/to/bundle/scripts/verify-multisport-backend.mjs scripts/
cp /path/to/bundle/scripts/harden-legacy-api.mjs scripts/
node scripts/harden-legacy-api.mjs .
```

The recommended command is:

```bash
/path/to/bundle/install-into-repo.sh /absolute/path/to/athrecs.comsite
```

The installer copies the additive files and applies only the legacy import permission patch. It does not migrate a database or deploy. Review the `api.ts` diff before committing.

## Validate source files

```bash
node scripts/verify-multisport-backend.mjs
npm run typecheck
```

## Apply to staging

Set `DATABASE_URL` to the staging database, then:

```bash
npm run db:migrate
npm run build
```

Review the migration log and confirm `_migrations` contains 0004–0007.

## Seed a reviewer role

Use a real authenticated user ID. Grant only the role needed. For an initial controlled setup:

```sql
insert into platform_user_roles (user_id, role, granted_by_user_id)
values ('REAL_USER_ID', 'super_admin', 'REAL_USER_ID')
on conflict (user_id, role) do nothing;
```

Later reviewers can normally receive `reviewer` or `data_steward`, not `super_admin`.

## Wire screens

The server functions can be imported by TanStack routes/components. Recommended route groups:

```text
/account/athlete/*
/organiser/*
/admin/verification/*
/admin/taxonomy/*
```

Keep these boundaries:

- Public pages call only `multisport-public-api.ts`.
- Athlete pages call only authenticated athlete functions.
- Organiser pages call organiser functions and never pass a trusted user ID.
- Reviewer pages call verification functions and rely on platform-role checks.

## Large files

The current CSV function is suitable for development and controlled smaller files. Before public production uploads:

1. Upload the original file directly to private object storage using a signed URL.
2. Store its hash, storage key, MIME type and size in `result_upload_batches`.
3. Scan it for malware.
4. Parse and validate it in a queue worker.
5. Stream/chunk rows rather than holding a 100,000-row payload in one request.
6. Keep publication in the included atomic transaction.

## Rollout order

1. Taxonomy and organiser accounts.
2. New event submission and event claims.
3. Reviewer console.
4. Result uploads for one pilot sport and organiser.
5. Athlete claims and result corrections.
6. Public compatibility views/pages.
7. Additional sports and sport-specific schemas.
8. Equipment/commerce features only after privacy and consent review.
