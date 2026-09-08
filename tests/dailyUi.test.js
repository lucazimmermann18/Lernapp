import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');

test('home exposes daily mix and difficult-word training',()=>{
 assert.match(source,/Heute lernen/);assert.match(source,/Meine kniffligen Wörter/);
 assert.match(source,/startSmartSession/);assert.match(source,/buildDailyMix/);
});

test('failed words return through a review queue without changing stage score',()=>{
 assert.match(source,/isReview:true/);assert.match(source,/position\+3/);
 assert.match(source,/item\.isReview\?results/);
 assert.match(source,/SCHWIERIGES WORT/);
});

test('writing exercises show aligned error feedback and persist error types',()=>{
 assert.match(source,/alignSpelling/);assert.match(source,/classifySpellingError/);
 assert.match(source,/errorType:issue\.type/);assert.match(source,/spelling-feedback/);
});
