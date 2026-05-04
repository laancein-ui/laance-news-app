-- Run this SQL in your Supabase project:
-- Dashboard → SQL Editor → New Query → Paste & Run

-- ── ARTICLES TABLE ────────────────────────────────────────
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  cat text not null,
  title text not null,
  snippet text,
  content text,
  image text,
  source text default 'AI Reporter',
  time_label text default 'Just Now',
  youtube_id text,
  is_new boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable realtime so new AI articles push instantly to all users
alter publication supabase_realtime add table articles;

-- ── AI SEARCH LOGS TABLE ──────────────────────────────────
create table if not exists ai_news_reports (
  id bigint primary key generated always as identity,
  search_query text not null,
  language text default 'English',
  country text default 'Global',
  created_at timestamp with time zone default now()
);

-- ── VIDEOS TABLE ──────────────────────────────────────────
create table if not exists videos (
  id bigint primary key generated always as identity,
  article_id uuid references articles(id) on delete cascade,
  video_url text,
  duration text default '1:30',
  status text default 'Published',
  created_at timestamp with time zone default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table articles enable row level security;
alter table ai_news_reports enable row level security;
alter table videos enable row level security;

-- Allow anyone to read articles (public news site)
create policy "Public read articles"
  on articles for select using (true);

-- Allow anyone to insert (AI reporter)
create policy "AI can insert articles"
  on articles for insert with check (true);

-- Allow anyone to read videos
create policy "Public read videos"
  on videos for select using (true);

create policy "AI can insert videos"
  on videos for insert with check (true);

-- Allow anonymous search log inserts
create policy "Allow search logs"
  on ai_news_reports for insert with check (true);
