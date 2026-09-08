import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBattleRounds,recentBattlePairs,settleBattleRound} from '../src/battle.js';

const units=Array.from({length:6},(_,index)=>({id:`u${index}`,name:`Unit ${index}`,createdAt:`2026-09-0${index+1}T10:00:00Z`,pairs:[[String(index),`word${index}`]]}));
test('battle draws from exactly the five newest units',()=>{const pairs=recentBattlePairs(units);assert.equal(pairs.length,5);assert.equal(pairs.some(pair=>pair.unitId==='u0'),false);});
test('battle contains ten rounds and all five duel types',()=>{const rounds=buildBattleRounds(units,10,()=>.4);assert.equal(rounds.length,10);assert.deepEqual(new Set(rounds.map(round=>round.mode)),new Set(['translation','hearing','picture','scramble','sentence']));});
test('adaptive opponent lets a correct child win seven of ten close rounds',()=>{const rounds=buildBattleRounds(units,10,()=>.4),wins=rounds.map(round=>settleBattleRound(round,true)).filter(result=>result.winner==='child');assert.equal(wins.length,7);});
test('wrong answers remain opponent points',()=>{assert.equal(settleBattleRound({plannedChildWin:true},false).opponentPoints,1);});
test('battle results are part of local backup and owner-scoped cloud sync',async()=>{const [{readFile},{default:path}]=await Promise.all([import('node:fs/promises'),import('node:path')]);const root=process.cwd(),storage=await readFile(path.join(root,'src/storage.js'),'utf8'),cloud=await readFile(path.join(root,'src/cloud.js'),'utf8'),migration=await readFile(path.join(root,'supabase/migrations/007_battle_results.sql'),'utf8');assert.match(storage,/battleResults/);assert.match(cloud,/battleResults/);assert.match(migration,/enable row level security/i);assert.match(migration,/auth\.uid\(\)/);assert.match(migration,/sync_app_data/);});
