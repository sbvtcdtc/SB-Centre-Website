-- SB Vocational Training Centre — Supabase schema
-- Run this whole file in Supabase Dashboard > SQL Editor > New query.
-- Then run seed.sql. Then create an admin user in Authentication > Users.
-- Storage buckets (create in Dashboard > Storage, public buckets):
--   media  — student photos, teacher photo, gallery photos, slideshow pictures
--   (videos are stored as URLs: YouTube link or direct mp4 link, not uploads,
--    to stay inside the free tier. A small mp4 upload via the media bucket is
--    also possible if you keep files small.)

create extension if not exists pgcrypto;

-- ---------- site_settings: one row, id = 1 ----------
create table if not exists public.site_settings (
  id int primary key default 1,
  centre_name text not null default 'SB Vocational Training Centre',
  tagline_bn text default 'জাপানি ভাষা শিক্ষা কেন্দ্র',
  tagline_en text default 'Japanese Language Training Centre',
  tagline_ja text default '日本語教育センター',
  about_bn text default '',
  about_en text default '',
  about_ja text default '',
  facebook_url text default 'https://www.facebook.com/share/1DsnbitRCE/',
  whatsapp_number text default '',   -- digits only; empty = button hidden
  address text default '',
  phone text default '',
  email text default '',
  hours text default '',
  hero_title_bn text default 'জাপানি ভাষা শিখুন, জাপানে কাজের পথ খুলুন',
  hero_title_en text default 'Learn Japanese, open the path to work in Japan',
  hero_title_ja text default '日本語を学び、日本で働く道を開こう',
  hero_sub_bn text default 'SB Vocational Training Centre-এ JLPT / JFT ধাঁচের N5, N4 ও N3 কোর্স — শূন্য থেকে ধাপে ধাপে, অভিজ্ঞ শিক্ষকের তত্ত্বাবধানে।',
  hero_sub_en text default 'JLPT / JFT-style N5, N4 and N3 courses at SB Vocational Training Centre — step by step from zero, under experienced teachers.',
  hero_sub_ja text default 'SB職業訓練センターでJLPT・JFT形式のN5・N4・N3コースを、ゼロから段階的に、経験豊富な講師のもとで学べます。',
  updated_at timestamptz default now()
);

-- ---------- courses ----------
create table if not exists public.courses (
  id text primary key, -- 'N5', 'N4', 'N3'
  level text not null,
  title_bn text not null, title_en text not null, title_ja text not null,
  audience_bn text default '', audience_en text default '', audience_ja text default '',
  duration_months int not null default 3,
  hours int not null default 180,
  description_bn text default '', description_en text default '', description_ja text default '',
  sort_order int default 0
);

-- ---------- students (photo is OPTIONAL) ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  roll text not null unique,
  name text not null,
  course text default '',
  batch text default '',
  session text default '',
  status text default '',
  photo_url text default '',  -- Supabase Storage public URL, empty = no photo
  created_at timestamptz default now()
);

-- ---------- certificates ----------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  license_no text not null unique,
  level text default 'N5',
  course_name text default 'Basic Japanese Language Course',
  start_date date,
  end_date date,
  duration_months int default 3,
  hours int default 180,
  issue_date date not null default CURRENT_DATE, -- download date, date only, no time
  created_at timestamptz default now()
);

-- ---------- notices ----------
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text default '',
  notice_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- gallery_items ----------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  caption text default '',
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- teachers (exactly one row is expected in the UI, but table allows more) ----------
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  title text default '',
  photo_url text default '',
  about text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- achievements (centre achievements, NOT student stories) ----------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text default '',
  photo_url text default '',
  achieved_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- success_stories (individual student stories, separate from achievements) ----------
create table if not exists public.success_stories (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  photo_url text default '',
  story text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- slideshow_items ----------
create table if not exists public.slideshow_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'image', -- 'image' or 'video'
  title text default '',
  image_url text default '',
  video_url text default '', -- YouTube embed URL or direct mp4 URL
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Row Level Security: public can READ, only logged-in admin can WRITE ----------
alter table public.site_settings enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.certificates enable row level security;
alter table public.notices enable row level security;
alter table public.gallery_items enable row level security;
alter table public.teachers enable row level security;
alter table public.achievements enable row level security;
alter table public.success_stories enable row level security;
alter table public.slideshow_items enable row level security;

-- Drop old policies if re-running, then recreate (Postgres has no CREATE OR REPLACE POLICY).
do $$ declare t text; begin
  foreach t in array array['site_settings','courses','students','certificates','notices','gallery_items','teachers','achievements','success_stories','slideshow_items'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "admin write" on public.%I for all using (auth.role() = %L) with check (auth.role() = %L)', t, 'authenticated', 'authenticated');
  end loop;
end $$;

-- Storage: create a PUBLIC bucket named "media" in Dashboard > Storage.
-- Then add these storage policies in SQL (bucket must exist first):
--   (these statements fail harmlessly if the bucket/policies already exist;
--    if they error, add the same rules in Dashboard > Storage > media > Policies)
-- insert into storage.buckets (id, name, public) values ('media','media', true)
--   on conflict (id) do nothing;
-- create policy "public read media" on storage.objects for select using (bucket_id = 'media');
-- create policy "admin write media" on storage.objects for all
--   using (bucket_id = 'media' and auth.role() = 'authenticated')
--   with check (bucket_id = 'media' and auth.role() = 'authenticated');
