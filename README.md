# LashedByShan

Solo lash technician booking app for **Shan** — one Next.js site with adaptive mobile and desktop layouts, Supabase backend, and Vercel deployment.

Customers book without an account. Shan manages appointments, services, and availability from a protected admin area.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Postgres, Auth, Row Level Security
- **Timezone** — America/Jamaica (UTC-5, no DST)
- **Deploy** — [Vercel](https://vercel.com)

## Features

### Customer booking (`/` and `/book`)

- Browse services and book in a guided flow: service → date → time → details → confirm → success
- Only **available** time slots (weekly hours + special availability − blocks − existing bookings)
- WhatsApp CTA after booking
- No login required

### Admin (`/admin`)

- Dashboard, appointments (confirm / cancel / complete / no-show / reschedule)
- Service management (price, duration, buffer, active/inactive)
- Weekly availability, one-time blocks, recurring blocks, special hours, full-day blocks
- Protected by Supabase Auth + `profiles.role = 'admin'`

### Adaptive UI

- **≤768px** — mobile components
- **>768px** — desktop components
- Same URLs for everyone; no `/m` routes or manual layout toggle
- Brief branded loading screen avoids layout flicker on first paint

## Local development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd lashedbyshan
npm install
```

### 2. Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `NEXT_PUBLIC_APP_TIMEZONE` | `America/Jamaica` |

### 3. Supabase setup

#### Option A — Supabase CLI (recommended)

```bash
# Install CLI: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Migrations live in `supabase/migrations/` and run in order:

1. `20250626120000_initial_schema.sql` — tables, enums, overlap constraint
2. `20250626120001_row_level_security.sql` — RLS policies
3. `20250626120002_seed_services.sql` — default lash services
4. `20250626120003_seed_availability.sql` — default Saturday lash hours (10 AM – 6 PM)

#### Option B — Supabase Dashboard

1. Open **SQL Editor** in your Supabase project
2. Run each migration file above in order

#### Default services (seeded)

| Service | Price (JMD) | Duration | Buffer |
|---------|-------------|----------|--------|
| Classic Set | 5,000 | 90 min | 15 min |
| Hybrid Set | 7,000 | 120 min | 15 min |
| Volume Set | 8,500 | 150 min | 15 min |
| Mega Volume Set | 9,500 | 180 min | 15 min |

Inactive services are hidden from customers.

#### Default availability (seeded)

| Day | Hours |
|-----|-------|
| Saturday | 10:00 AM – 6:00 PM |

Customers can only book on days with active weekly hours (or special availability overrides). Add more days from **Admin → Availability → Weekly lash hours**.

### 4. Create the admin user

1. In Supabase Dashboard → **Authentication** → **Users**, click **Add user** and create Shan’s email + password
2. **Disable public sign-up** under Authentication → Providers → Email (only invited admins should have accounts)
3. After the user is created, ensure a row exists in `public.profiles` with `role = 'admin'`:

```sql
insert into public.profiles (id, role)
values ('<auth-user-uuid>', 'admin')
on conflict (id) do update set role = 'admin';
```

The `profiles` row is usually created automatically on first sign-in if you have a trigger; if not, run the insert above with the user’s UUID from the Auth users table.

### 5. Run the app

```bash
npm run dev
```

- Customer site: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (booking engine + validation) |

## Deploy to Vercel

1. Push the repo to GitHub (or connect directly in Vercel)
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the same environment variables as `.env.example` (including `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy

No extra `vercel.json` is required — Next.js App Router works out of the box.

After deploy:

- Set Supabase **Site URL** and **Redirect URLs** to your Vercel domain (e.g. `https://lashedbyshan.vercel.app`)
- Confirm public sign-up remains **disabled** in Supabase Auth

## Security model

- **Customers (anon)** — read active services; insert `pending` appointments only; no read access to appointments, availability tables, or block reasons
- **Admin (authenticated + `profiles.role = admin`)** — full CRUD via RLS and `/api/admin/*`
- Slot APIs use the **service role** server-side because availability data is admin-only in RLS; customers only receive computed slot times, never block reasons
- Middleware blocks unauthenticated access to `/admin/*` and `/api/admin/*`
- If Supabase env vars are missing, admin routes return **503** (fail closed)

## Booking engine

Available slots = regular weekly rules + available overrides − unavailable overrides − unavailable blocks (including recurring) − pending/confirmed appointments.

- Service **duration + buffer** must fit inside an available window
- **Double booking** prevented by overlap constraint + engine validation
- **Cancelled** appointments do not block slots
- **Past dates and past same-day times** are not bookable
- All times interpreted in **America/Jamaica**

## Project structure

```
app/                    # Routes and API handlers
components/
  mobile/               # Mobile-only layouts
  desktop/              # Desktop-only layouts
  shared/               # Shared booking + admin UI
hooks/                  # Client data hooks
lib/
  booking/              # Slot engine, queries, tests
  admin/                # Admin server helpers
  supabase/             # Clients, middleware, types
supabase/migrations/    # SQL schema + seed
```

## License

Private — LashedByShan.
