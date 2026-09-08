import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRunnerCourse,runnerStars,runnerVocabulary} from '../src/runner.js';

const units=[{id:'a',name:'Animals',pairs:[['Hund','dog'],['Katze','cat'],['Pferd','horse']]},{id:'old',archived:true,pairs:[['Alt','old']]}];
test('runner uses active unit vocabulary and creates both directions',()=>{const words=runnerVocabulary(units);assert.equal(words.length,3);const course=buildRunnerCourse(units,10,()=>.4);assert.equal(course.length,10);assert.ok(course.some(item=>item.direction==='en-de'));assert.ok(course.every(item=>item.choices.includes(item.answer)));});
test('runner awards stars at child-friendly thresholds',()=>{assert.equal(runnerStars(10,10),3);assert.equal(runnerStars(8,10),2);assert.equal(runnerStars(6,10),1);assert.equal(runnerStars(5,10),0);});
test('runner UI has timed crossroads and gentle feedback',async()=>{const source=await (await import('node:fs/promises')).readFile(new URL('../src/WordRunner.jsx',import.meta.url),'utf8');assert.match(source,/ROUND_SECONDS=8/);assert.match(source,/runner-paths/);assert.match(source,/Die Zeit war knapp/);assert.match(source,/Weiterlaufen/);});
test('runner results are included in local backup and owner-scoped cloud sync',async()=>{const {readFile}=await import('node:fs/promises'),storage=await readFile(new URL('../src/storage.js',import.meta.url),'utf8'),cloud=await readFile(new URL('../src/cloud.js',import.meta.url),'utf8'),migration=await readFile(new URL('../supabase/migrations/009_runner_results.sql',import.meta.url),'utf8');assert.match(storage,/runnerResults/);assert.match(cloud,/runnerResults/);assert.match(migration,/enable row level security/i);assert.match(migration,/auth\.uid\(\)/);assert.match(migration,/sync_app_data/);});
