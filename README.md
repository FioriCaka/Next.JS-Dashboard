# Dashboard App

A modern dashboard web app built with Next.js 14, TypeScript, Tailwind CSS, and Prisma (SQLite).

## Features

- App Router with a dashboard layout (sidebar + topbar)
- KPI cards, charts (Recharts), and data table
- API routes backed by a SQLite database via Prisma (`/api/stats`, `/api/table`)
- Strict TypeScript, ESLint, and Prettier

## Prerequisites

- Node.js 18+ and npm

## Install & Run (Windows PowerShell)

```powershell
# 1) Install dependencies
npm install

# 2) Setup database (generate client, run migration, seed demo data)
npx prisma generate
npm run db:migrate
npm run db:seed

# 3) Start the dev server
npm run dev
```

Then open http://localhost:3000 in your browser.

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Create production build
- `npm start` - Start production server (after build)
- `npm run lint` - Lint
- `npm run format` - Prettier format
- `npm run typecheck` - TypeScript check

## Environment

Create a `.env` file in the project root (already added by setup):

```
DATABASE_URL="file:./dev.db"
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Create production build
- `npm start` - Start production server (after build)
- `npm run lint` - Lint
- `npm run format` - Prettier format
- `npm run typecheck` - TypeScript check
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed demo data
- `npm run prisma:studio` - Open Prisma Studio UI

## Notes

- Data is now stored in a local SQLite database (`dev.db`).
- To inspect/edit data visually, run `npm run prisma:studio`.
