# ATHRECS.com

Norfolk endurance & athletics directory — events, athletes, clubs, and calendar.

Built with TanStack Start, React, Tailwind, and Postgres (Neon in production / PGLite in preview).

## Local development

```bash
npm install
npm run dev
```

App: `http://localhost:8080`

## Production build

```bash
npm run build
npm run typecheck
```

## Deploy on Vercel (your account)

1. Import this repo in [Vercel](https://vercel.com/new).
2. **Build command:** `npm run build`
3. **Install command:** `npm install`
4. **Node.js:** 22.x
5. Add env var (recommended for a real site):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Postgres URL from [Neon](https://neon.tech) |

6. Deploy → open the production URL.

## Updating fixtures

- On the live site: **/admin** (Update) — CSV bulk import or Grok JSON paste.
- Or edit `src/data/catalogue.ts` and redeploy.

## Stack

- TanStack Start / Router / Query
- Vite 8 + Nitro (Vercel preset)
- Tailwind v4
- Better Auth (optional)
- PGLite (dev) / Postgres (prod)
