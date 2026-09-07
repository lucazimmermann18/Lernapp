-- Replace the legacy whole-app snapshot with an atomic, record-wise merge.
drop table if exists public.cloud_snapshots cascade;

create or replace function public.sync_app_data(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  table_name text;
  entry jsonb;
  result jsonb := '{}'::jsonb;
  table_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  foreach table_name in array array['units','attempts','rewards','settings','achievements'] loop
    for entry in select value from jsonb_array_elements(coalesce(p_payload -> table_name, '[]'::jsonb)) loop
      execute format(
        'insert into public.%I (user_id,id,data,updated_at) values ($1,$2,$3,$4) '
        || 'on conflict (user_id,id) do update set data=excluded.data, updated_at=excluded.updated_at '
        || 'where %I.updated_at <= excluded.updated_at',
        table_name, table_name
      ) using auth.uid(), entry ->> 'id', entry -> 'data',
        coalesce((entry ->> 'updated_at')::timestamptz, '1970-01-01'::timestamptz);
    end loop;

    execute format(
      'select coalesce(jsonb_agg(jsonb_build_object(''id'',id,''data'',data,''updated_at'',updated_at) order by id),''[]''::jsonb) '
      || 'from public.%I where user_id=$1', table_name
    ) into table_result using auth.uid();
    result := result || jsonb_build_object(table_name, table_result);
  end loop;

  return result;
end;
$$;

revoke all on function public.sync_app_data(jsonb) from public;
grant execute on function public.sync_app_data(jsonb) to authenticated;
