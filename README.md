# Prospout — Next.js version (scaffold)

This folder contains a Next.js 14 (App Router) scaffold tailored for the Prospout internal platform. It is intentionally placed inside the existing repository at `prospout-next/` so the current Vite app is not modified.

Goal
- Full-stack architecture ready for Supabase + Prisma + Next.js.

Quick start (local)

1. Copy environment variables:

```bash
cd prospout-next
cp .env.example .env
# fill DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and migrate (local Postgres / Supabase):

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

4. Run dev server:

```bash
npm run dev
```

Notes on Supabase
- Use Supabase for Auth, Storage and (optionally) Database. If you use Supabase Postgres, set `DATABASE_URL` to the Supabase database connection string and set the public keys.

Planned features still to wire up
- Calendar UI component with heatmap
- Audio upload UI + Supabase Storage integration
- Gemini integration endpoint skeleton
- More complete analytics and graphs (use Recharts or similar)
