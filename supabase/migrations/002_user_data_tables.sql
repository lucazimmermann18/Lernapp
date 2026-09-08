do $$ declare table_name text; begin
  foreach table_name in array array['units','attempts','rewards','settings','achievements'] loop
    execute format('create table if not exists public.%I (user_id uuid not null references auth.users(id) on delete cascade, id text not null, data jsonb not null, updated_at timestamptz not null default now(), primary key (user_id,id))', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "own_%s_select" on public.%I',table_name,table_name);
    execute format('drop policy if exists "own_%s_insert" on public.%I',table_name,table_name);
    execute format('drop policy if exists "own_%s_update" on public.%I',table_name,table_name);
    execute format('drop policy if exists "own_%s_delete" on public.%I',table_name,table_name);
    execute format('create policy "own_%s_select" on public.%I for select to authenticated using ((select auth.uid())=user_id)',table_name,table_name);
    execute format('create policy "own_%s_insert" on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',table_name,table_name);
    execute format('create policy "own_%s_update" on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',table_name,table_name);
    execute format('create policy "own_%s_delete" on public.%I for delete to authenticated using ((select auth.uid())=user_id)',table_name,table_name);
  end loop;
end $$;
