import test from 'node:test';
import assert from 'node:assert/strict';
import {fallbackAvatar,normalizeAvatar} from '../src/avatar.js';

global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
test('avatar configuration stays inside the parent-approved palette',()=>{assert.deepEqual(normalizeAvatar({type:'weapon',color:'black',name:'<Hero>',approved:true}),{type:'animal',name:'Hero',color:'violet',outfit:'Lerncape',ability:'Mutmacher-Kraft',approved:true,generatedByAI:false});});
test('offline avatar fallback remains playable and uses the interest',()=>{const avatar=fallbackAvatar('Fußball','football');assert.equal(avatar.type,'football');assert.match(avatar.outfit,/Fußball/);});
test('avatar generation keeps the OpenAI key in the Edge Function',async()=>{const {readFile}=await import('node:fs/promises'),client=await readFile(new URL('../src/avatar.js',import.meta.url),'utf8'),server=await readFile(new URL('../supabase/functions/generate-avatar/index.ts',import.meta.url),'utf8');assert.doesNotMatch(client,/OPENAI_API_KEY|sk-/);assert.match(server,/Deno\.env\.get\('OPENAI_API_KEY'\)/);assert.match(server,/Keine Marken, Waffen, Käufe/);});
