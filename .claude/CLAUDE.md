# DTG Calculate — Anajak

## Project
ระบบคำนวณต้นทุน DTG printing (Brother GTX Pro) — dynamic pricing พร้อม admin settings, discount tiers

## Business
**Anajak** — ใช้ภายในโรงงาน

## Stack
- Framework: Next.js 15 (App Router), TypeScript
- Database: PostgreSQL (Supabase) + Prisma
- AI: Google Gemini API
- Styling: Tailwind v4 + shadcn/ui
- Export: xlsx

## How to Run
```bash
npm install
# set .env.local (Supabase + Gemini creds)
npm run db:migrate && npm run db:seed
npm run dev    # localhost:3000
```

## Key Files
- `prisma/schema.prisma` — Price configs, paper sizes, discount tiers
- `src/app/admin/settings` — Admin panel ตั้งราคา
- `src/app/page.tsx` — Public calculator

## Current Status
- ✅ MVP working, admin settings complete
- 🚧 In-progress improvements
