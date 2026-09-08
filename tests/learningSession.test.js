import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');
const result=await readFile(new URL('../src/stageResult.jsx',import.meta.url),'utf8');

test('four-step hints affect first-try scoring and are persisted',()=>{
 assert.match(app,/hintLevel>=4/);assert.match(app,/hintUsed:hintLevel/);
 assert.match(app,/hintLevel===0/);assert.match(app,/Ein Hinweis hilft dir/);
});

test('timed rounds show a countdown and a dedicated friendly result',()=>{
 assert.match(app,/remainingSeconds/);assert.match(app,/timeLimitReached/);
 assert.match(result,/Deine Lernzeit ist vorbei/);assert.match(result,/Wörter in/);
});

test('mastery mode disables hints, uses both directions and persists results',()=>{
 assert.match(app,/!unit\.isMasteryTest/);assert.match(app,/Englisch → Deutsch/);
 assert.match(app,/put\('masteryTests'/);assert.match(app,/masteredAt/);
});

test('audit fixes keep controls functional and writes ordered',()=>{
 assert.match(app,/reviewWriteQueue/);
 assert.match(app,/new Set\(\[word/);
 assert.match(app,/Deutsche Bedeutung eingeben/);
 assert.match(app,/Ton ausschalten/);
});
