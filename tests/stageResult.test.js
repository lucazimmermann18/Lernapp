import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {scoreStage} from '../src/learning.js';

const source=await readFile(new URL('../src/stageResult.jsx',import.meta.url),'utf8');

test('stage result exposes all required actions and metrics',()=>{
 assert.match(source,/assessment\.score/);
 assert.match(source,/beim ersten Versuch/);
 assert.match(source,/beste Serie/);
 assert.match(source,/Stufe wiederholen/);
 assert.match(source,/Nächste Stufe/);
 assert.match(source,/confetti/);
});

test('next stage remains locked when the 70 percent threshold is missed',()=>{
 const failed=scoreStage(Array.from({length:10},(_,index)=>({firstTry:index<6})));
 const passed=scoreStage(Array.from({length:10},(_,index)=>({firstTry:index<7})));
 assert.equal(failed.passed,false);assert.equal(failed.stars,0);
 assert.equal(passed.passed,true);assert.equal(passed.stars,1);
});
