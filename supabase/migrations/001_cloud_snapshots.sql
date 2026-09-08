create table if not exists public.cloud_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cloud_snapshots enable row level security;

drop policy if exists "Families can read their own snapshot" on public.cloud_snapshots;
create policy "Families can read their own snapshot"
  on public.cloud_snapshots for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Families can create their own snapshot" on public.cloud_snapshots;
create policy "Families can create their own snapshot"
  on public.cloud_snapshots for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Families can update their own snapshot" on public.cloud_snapshots;
create policy "Families can update their own snapshot"
  on public.cloud_snapshots for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
