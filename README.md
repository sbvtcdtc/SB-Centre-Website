# SB Vocational Training Centre — Real Website (Free)

This is the REAL version: admin changes show to every visitor in realtime,
because all data lives in Supabase — not in one browser's localStorage.

## What is in this folder
- `index.html` + `app.js` + `style.css` — public site (Bengali by default,
  visitor language switcher: বাংলা / English / 日本語. Admin panel stays normal.)
- `admin.html` + `admin.js` — admin panel, separate page, Supabase Auth login.
- `config.js` — put your Supabase URL + anon key here (placeholders now).
- `schema.sql` — all database tables + public-read / admin-write rules.
- `seed.sql` — only approved demo data: student SB-001, certificate
  SBVTC/N5/2026/00427, N5/N4/N3 courses, two October 2026 notices.
- `assets/logo.jpg` — the colour SB logo the owner provided.
- `.env.example` — example only. Never put a secret key in git or in config.js.

## Step 1 — Create Supabase (free, 10 minutes)
1. Go to https://supabase.com, sign up, create a new project (free tier).
2. Dashboard > SQL Editor > New query: paste `schema.sql`, Run. Then paste
   `seed.sql`, Run.
3. Dashboard > Storage: create a PUBLIC bucket named `media` (for photos).
   Storage rules are listed at the bottom of `schema.sql`.
4. Dashboard > Project Settings > API: copy Project URL + anon public key
   into `config.js`. Do NOT use the service_role secret key anywhere here.

## Step 2 — Create the admin user
1. Dashboard > Authentication > Users > Add user.
2. Enter the admin email + a strong password. Save it safely.
3. Open `admin.html` and log in with that email + password.
4. Change the password later from the same Users page. Never share it.
5. No password is written in this code. If anyone asks for a password
   in code, that is a mistake — do not add one.

## Step 3 — Deploy free (no domain needed yet)
Option A — GitHub Pages (simplest, free):
1. Create a public GitHub repo, upload ALL files in this folder.
2. Repo > Settings > Pages > Deploy from a branch > main, root > Save.
3. Your free address will be like `https://YOURNAME.github.io/REPO-NAME/`.
   Note: `admin.html` is then at `.../admin.html`, not `/admin`.
Option B — Netlify / Vercel (free): drag this folder in, or connect the
GitHub repo. You get a free address like `sb-centre.netlify.app`.

## Step 4 — Add a custom domain later (no rebuild needed)
1. Buy a domain later, e.g. sbvtc.com, from any registrar.
2. In GitHub Pages / Netlify / Vercel, add the custom domain and follow
   the DNS instructions shown there (usually one CNAME record).
3. The same site + admin will then open at sbvtc.com.
   For a clean `/admin` address (sbvtc.com/admin), Netlify/Vercel
   redirects can map `/admin` to `admin.html` — see their redirect docs;
   with GitHub Pages, `admin.html` stays at `/admin.html`.

## Step 5 — Fill the real content in admin (nothing is invented here)
In `admin.html`, fill in: address, phone, email, WhatsApp number,
teacher (name/photo/about), achievements, success stories, real gallery
photos, notices, students and certificates. Demo student SB-001 and demo
certificate SBVTC/N5/2026/00427 are only examples — replace or delete
them in admin once real students are added.

## How realtime works
Public site reads Supabase on every view and subscribes to Supabase
realtime changes. When admin saves something, every open visitor page
reloads its data — no refresh button, no per-browser copy.

## When gifting to the centre
1. Transfer the domain registrar account to the centre (or let the
   centre buy the domain and connect it as in Step 4).
2. Transfer the Supabase project / GitHub / hosting account to the
   centre's email, OR invite the centre's email as owner/admin.
3. Give the centre the admin login, then change the admin password
   together in Supabase Auth, so only the centre can log in afterwards.
4. Hand over this README + the repo. Keep a backup: in Supabase,
   export the tables (or keep the SQL seed + admin exports) before transfer.

## Still needed before this can go live (owner steps)
- [ ] Supabase project created (URL + anon key in config.js)
- [ ] schema.sql + seed.sql run
- [ ] Storage bucket `media` created (public)
- [ ] Admin user created in Supabase Auth
- [ ] Deployed to GitHub Pages / Netlify / Vercel and link tested
- [ ] Real contact, teacher, gallery and student data filled in admin
- [ ] Admin password changed from the first temporary password

## Limits of the free tier (check Supabase/Netlify terms at signup)
Free tiers have usage limits, not a fixed expiry date. If traffic,
storage or database size grows a lot, a paid plan may be needed later.
A free Supabase project can pause after a week of no activity — just
log in / resume it in the dashboard. Keep backups.
