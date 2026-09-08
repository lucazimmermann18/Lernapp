import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/UnitWords.jsx',import.meta.url),'utf8');
const main=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');

test('unit vocabulary button opens the complete word list',()=>{
 assert.match(main,/onClick={onWords}/);
 assert.match(main,/page==='words'/);
 assert.match(main,/onWords={\(\)=>setPage\('words'\)}/);
});

test('word list supports search, cover mode, pronunciation and practice',()=>{
 assert.match(source,/Deutsch oder Englisch suchen/);
 assert.match(source,/Englisch abdecken/);
 assert.match(source,/speechSynthesis\.speak/);
 assert.match(source,/Stufe 1 starten/);
});
