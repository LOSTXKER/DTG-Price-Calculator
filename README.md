# DTG Calculator

แอปคำนวณราคา DTG (Brother GTX Pro Bulk) — Next.js 15 + Tailwind v4 + **Supabase Postgres + Prisma**

## Setup

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) สร้าง Supabase project & เก็บ credentials

1. สร้าง project ใหม่ที่ <https://supabase.com/dashboard>
2. คัดลอกค่าจาก **Project Settings → Database → Connection string** → URI (ใช้ทั้ง pooled `6543` และ direct `5432`)
3. คัดลอก `Project URL` และ `anon key` จาก **Project Settings → API**
4. ใน Supabase dashboard ไปที่ **Authentication → Providers → Email** และ
   - เปิด `Enable Email provider`
   - ปิด `Confirm email` (สำหรับ admin internal) หรือเปิดไว้ก็ได้
   - **ปิด** `Enable signups` (สำคัญ! เพื่อไม่ให้ใครสมัครได้เอง)
5. สร้าง admin user ที่ **Authentication → Users → Add user**

### 3) สร้าง `.env.local`

คัดลอกจาก `.env.example` แล้วเติมค่า

```env
DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
ADMIN_EMAILS="you@example.com"
```

> `ADMIN_EMAILS` คั่นด้วย comma (`,`) — เฉพาะอีเมลในรายการนี้เท่านั้นที่เข้าหน้า `/admin` ได้ (แม้จะ login สำเร็จแล้วก็ตาม)

### 4) Migrate schema และ seed ค่าเริ่มต้น

```bash
npm run db:migrate         # สร้าง tables ใน Supabase
npm run db:seed            # ใส่ค่าเริ่มต้น (เท่ากับ logic เดิมก่อน refactor)
```

### 5) รัน dev

```bash
npm run dev
```

- ผู้ใช้ทั่วไป: <http://localhost:3000>
- Admin login: <http://localhost:3000/admin/login>
- Admin settings: <http://localhost:3000/admin/settings>

## โครงสร้างค่าที่ปรับได้

ผ่านหน้า `/admin/settings`:

- **ค่าราคาหลัก** — ต้นทุน CC, flat ลายเล็ก, pre-treatment, ส่วนลดเสื้อขาว, markup, ราคาขั้นต่ำ ฯลฯ
- **ขนาดกระดาษ** — A2-A7 (เพิ่ม/ลบ/แก้ได้)
- **ส่วนลดตามจำนวน** — tier ส่วนลด (เพิ่ม/ลบ/แก้ได้)
- **Add-ons** — โลโก้คอ และ add-on อื่นๆ ที่จะเพิ่มในอนาคต

ค่าทุกตัวเก็บใน Supabase Postgres ผ่าน Prisma — บันทึกแล้ว invalidate cache ทันที

## สคริปต์ที่ใช้บ่อย

```bash
npm run dev          # dev server
npm run build        # production build
npm run db:migrate   # prisma migrate dev
npm run db:push      # push schema โดยไม่สร้าง migration (dev เร็วๆ)
npm run db:seed      # seed ค่าเริ่มต้น
npm run db:reset     # reset database + re-seed (ระวัง: ลบข้อมูลทั้งหมด)
npm run db:generate  # regenerate Prisma client
```
