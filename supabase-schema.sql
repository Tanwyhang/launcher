create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  page_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists page_config jsonb not null default '{}'::jsonb;

create table if not exists public.post_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  locale text not null,
  title text not null default '',
  slug text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  quick_answer text not null default '',
  hero_image_url text not null default '',
  key_takeaways jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  faq_items jsonb not null default '[]'::jsonb,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, locale)
);

alter table public.post_translations
  add column if not exists sections jsonb not null default '[]'::jsonb;

alter table public.post_translations
  add column if not exists key_takeaways jsonb not null default '[]'::jsonb;

alter table public.post_translations
  add column if not exists faq_items jsonb not null default '[]'::jsonb;

create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  merchant_name text not null,
  anchor_text text not null default '',
  destination_url text not null,
  tracking_url text,
  rel text not null default 'sponsored nofollow noopener',
  target text not null default '_blank',
  cta_text_en text not null default 'Check current price',
  cta_text_ms text not null default 'Semak harga terkini',
  cta_text_zh_hans text not null default '查看最新价格',
  summary text not null default '',
  best_for text not null default '',
  not_for text not null default '',
  price_band text not null default '',
  pricing_summary text not null default '',
  pros jsonb not null default '[]'::jsonb,
  cons jsonb not null default '[]'::jsonb,
  score numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists post_translations_post_idx on public.post_translations (post_id);
create index if not exists affiliate_links_post_idx on public.affiliate_links (post_id);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

drop policy if exists "Allow waitlist email inserts" on public.waitlist;

create policy "Allow waitlist email inserts"
on public.waitlist
for insert
with check (true);

alter table public.affiliate_links
  add column if not exists not_for text not null default '';

alter table public.affiliate_links
  add column if not exists pricing_summary text not null default '';

alter table public.affiliate_links
  add column if not exists pros jsonb not null default '[]'::jsonb;

alter table public.affiliate_links
  add column if not exists cons jsonb not null default '[]'::jsonb;
