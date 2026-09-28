# Bills

A personal expense tracker: sign in with Google, organize your categories, log income and expenses, and see where your money goes each month.

**Live:** https://web-app-bills.vercel.app

![Home dashboard](docs/screenshots/home.png)

| Movements | Reports |
|---|---|
| ![Movements by month](docs/screenshots/movements.png) | ![Reports: 6-month trend and breakdown by category](docs/screenshots/reports.png) |
| **Categories** | **Settings** |
| ![Categories grid with this month's totals](docs/screenshots/categories.png) | ![Settings: name, currency, appearance, delete account](docs/screenshots/settings.png) |

<details>
<summary>Dark theme</summary>

![Home dashboard in dark theme](docs/screenshots/home-dark.png)

</details>

<details>
<summary>Sign in</summary>

![Sign-in page with feature carousel](docs/screenshots/login.png)

</details>

<sub>Screenshots use demo data.</sub>

## Features

- **Google sign-in** via Supabase Auth. Each account only sees its own data (Postgres row-level security).
- **Home**: what's left of this month's income, this month's spending vs. last month day by day, recent movements, what's still **to pay** (settle it in one click) and top categories.
- **Categories** for income and expenses, with emoji, color and this month's total.
- **Movements** by month: amount, category, date, description, paid/pending. Monthly income, expense and net totals.
- **Reports**: 6-month income vs. expense trend and a ranked breakdown by category, each with an accessible table view.
- **Settings**: display name, currency (formats every amount), and self-service account deletion.
- **Appearance**: Light, Dark or System (follows the OS live); light/dark choices sync across devices.
- **Motion** that respects the OS "reduce motion" setting: figures count, charts draw, lists and pages transition.
- Responsive: sidebar on desktop, bottom bar on mobile.

## Stack

| Layer | Tech |
|---|---|
| UI | React 19, Vite, react-router 7, styled-components 6, motion, react-icons, Geist |
| State | TanStack Query (server data), Zustand (session, theme, selected month) |
| Backend | Supabase: Auth (Google OAuth) + PostgreSQL with RLS |
| Hosting | Vercel (static SPA) + Supabase free tier |

Charts are plain SVG/CSS and the login carousel uses CSS scroll-snap — no chart or carousel libraries. Animations use `motion`.

## Run locally

Requirements: Node 20+ and a Supabase project.

```bash
git clone https://github.com/RicketyMajor/web-app-bills.git
cd web-app-bills
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:5173
```

### Environment variables

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Project URL, e.g. `https://<ref>.supabase.co` (the origin — not the `/rest/v1/` URL) |
| `VITE_SUPABASE_ANON_KEY` | Project anon (public) key |

Only the anon key belongs in the client; the data is protected by RLS. Never use the `service_role` key here.

### Database

Run the files in `supabase/migrations/` in order in the Supabase SQL Editor. `20260925000000_init_schema.sql` creates:

- `profiles` — one row per user, created by a trigger on sign-up (which also seeds 6 default categories).
- `categories` — `name`, `type` (`income` | `expense`), `icon` (emoji), `color`.
- `movements` — `amount`, `date`, `description`, `paid`, linked to a category. The type comes from the category.

Every table has a `user_id` and RLS policies limiting access to `auth.uid()`.

`20260927000000_settings.sql` makes `profiles.theme` nullable (null = follow the OS) and adds `delete_account()`, a `security definer` function that deletes the caller's auth user (cascading to their data).

`20260928000000_category_constraints.sql` makes category names unique per user and type regardless of case, and bounds the icon length.

### Google sign-in

1. Google Cloud → Credentials → OAuth client (Web): add `http://localhost:5173` to *Authorized JavaScript origins* and `https://<ref>.supabase.co/auth/v1/callback` to *Authorized redirect URIs*.
2. Supabase → Authentication → Providers → Google: paste the client ID and secret.
3. Supabase → Authentication → URL Configuration: add `http://localhost:5173/**` to *Redirect URLs*.

The dev server must run on port 5173 to match these settings.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 5173 |
| `npm test` | Unit tests (`node:test`, `src/**/*.test.js`) |
| `npm run lint` | ESLint |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |

## Deploy (Vercel)

1. Import the repo in Vercel with the **Vite** preset.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
3. Add the production URL to Supabase *Site URL* / *Redirect URLs* (`https://<app>.vercel.app/**`) and to Google *Authorized JavaScript origins*.

`vercel.json` rewrites every path to `index.html` so deep links like `/reports` work on reload. Pushes to `main` deploy automatically.

## Project structure

```
src/
  components/
    atoms/ molecules/ organisms/ templates/   # atomic design
  pages/        # one thin wrapper per route (lazy-loaded)
  routers/      # routes + auth guards
  hooks/        # TanStack Query hooks (categories, movements, totals, reports, profile)
  store/        # Zustand stores (auth, theme, month)
  supabase/     # Supabase client
  styles/       # themes, design tokens, global styles
  utils/        # money/date helpers and aggregations (+ tests)
supabase/migrations/   # database schema
```

## Legal

[Privacy Policy](https://web-app-bills.vercel.app/privacy) · [Terms of Service](https://web-app-bills.vercel.app/terms)

## Author

Alonso Vera ([Rickety Major](https://github.com/RicketyMajor))
