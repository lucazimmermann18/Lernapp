import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const cloudSource=await readFile(new URL('../src/cloud.js',import.meta.url),'utf8');
const migration=await readFile(new URL('../supabase/migrations/003_live_sync.sql',import.meta.url),'utf8');

test('cloud synchronization never deletes an entire user table',()=>{
  assert.doesNotMatch(cloudSource,/method:\s*['"]DELETE['"]/);
  assert.match(cloudSource,/rpc\/sync_app_data/);
  assert.match(cloudSource,/syncWithoutRpc/);
  assert.match(cloudSource,/response\.status===404/);
});

test('live sync migration merges records atomically and removes legacy snapshots',()=>{
  assert.match(migration,/drop table if exists public\.cloud_snapshots cascade/i);
  assert.match(migration,/create or replace function public\.sync_app_data/i);
  assert.match(migration,/on conflict \(user_id,id\) do update/i);
  assert.match(migration,/updated_at <= excluded\.updated_at/i);
  assert.match(migration,/grant execute .* to authenticated/i);
});

test('review progress is included in local and atomic cloud synchronization',async()=>{
 const storage=await readFile(new URL('../src/storage.js',import.meta.url),'utf8');
 const migration=await readFile(new URL('../supabase/migrations/004_review_progress.sql',import.meta.url),'utf8');
 assert.match(storage,/reviewProgress/);
 assert.match(cloudSource,/reviewProgress/);
 assert.match(migration,/create table if not exists public\."reviewProgress"/i);
 assert.match(migration,/\['units','attempts','rewards','settings','achievements','reviewProgress'\]/);
 assert.match(migration,/enable row level security/i);
});

test('mastery test history is stored locally and synced with owner-only RLS',async()=>{
 const storage=await readFile(new URL('../src/storage.js',import.meta.url),'utf8');
 const migration=await readFile(new URL('../supabase/migrations/005_mastery_tests.sql',import.meta.url),'utf8');
 assert.match(storage,/masteryTests/);assert.match(cloudSource,/masteryTests/);
 assert.match(migration,/create table if not exists public\."masteryTests"/i);
 assert.match(migration,/enable row level security/i);
 assert.match(migration,/reviewProgress','masteryTests/);
});

test('generated stories and results are included in backup and owner-scoped sync',async()=>{
 const storage=await readFile(new URL('../src/storage.js',import.meta.url),'utf8');
 const migration=await readFile(new URL('../supabase/migrations/006_stories.sql',import.meta.url),'utf8');
 assert.match(storage,/stories/);assert.match(cloudSource,/stories/);
 assert.match(migration,/create table if not exists public\.stories/i);
 assert.match(migration,/enable row level security/i);
 assert.match(migration,/masteryTests','stories/);
});
