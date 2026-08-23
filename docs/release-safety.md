# Athrecs release safety

Every change should travel through a feature branch and pull request. Production
must never be used to test an incomplete group of catalogue modules.

## Required order

1. Install the lockfile with Node 24.
2. Run type-checking, linting, catalogue verification, duplicate checks and a
   complete production build.
3. Open the Vercel preview and smoke-test the homepage, a filtered events URL
   and an individual slug page.
4. Merge one complete pull request. Do not push companion catalogue files in
   separate commits directly to `main`.
5. Confirm the production deployment is Ready before starting another release.

Routine race additions should use **Admin → Staged catalogue publishing**. That
flow stores the proposed rows, validates them, and publishes the complete batch
inside one database transaction. Code deployment is reserved for application
or schema changes.
