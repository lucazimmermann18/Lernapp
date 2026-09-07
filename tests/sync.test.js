import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const cloudSource=await readFile(new URL('../src/cloud.js',import.meta.url),'utf8');
const migration=await readFile(new URL('../supabase/migrations/003_live_sync.sql',import.meta.url),'utf8');

test('cloud synchronization never deletes an entire user table',()=>{
  assert.doesNotMatch(cloudSource,/method:\s*['"]DELETE['"]/);
  assert.match(cloudSource,/rpc\/sync_app_data/);
});

test('live sync migration merges records atomically and removes legacy snapshots',()=>{
  assert.match(migration,/drop table if exists public\.cloud_snapshots cascade/i);
  assert.match(migration,/create or replace function public\.sync_app_data/i);
  assert.match(migration,/on conflict \(user_id,id\) do update/i);
  assert.match(migration,/updated_at <= excluded\.updated_at/i);
  assert.match(migration,/grant execute .* to authenticated/i);
});
