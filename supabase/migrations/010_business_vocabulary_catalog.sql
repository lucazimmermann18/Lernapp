-- Global Business-English vocabulary catalog for the protected parent learning area.
create table if not exists public.business_vocabulary_units (
  id text primary key,
  number integer not null unique check (number between 1 and 1000),
  level integer not null check (level between 1 and 1000),
  topic text not null,
  title text not null,
  description text not null,
  source text not null default 'supabase-seed',
  terms jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_vocabulary_units_terms_array check (jsonb_typeof(terms) = 'array'),
  constraint business_vocabulary_units_terms_count check (jsonb_array_length(terms) = 20)
);

create index if not exists business_vocabulary_units_number_idx on public.business_vocabulary_units(number);
create index if not exists business_vocabulary_units_level_idx on public.business_vocabulary_units(level);
create index if not exists business_vocabulary_units_topic_idx on public.business_vocabulary_units(topic);
create index if not exists business_vocabulary_units_terms_gin_idx on public.business_vocabulary_units using gin(terms jsonb_path_ops);

alter table public.business_vocabulary_units enable row level security;

create policy "Business vocabulary catalog is readable" on public.business_vocabulary_units
  for select using (true);

grant select on public.business_vocabulary_units to anon, authenticated;
