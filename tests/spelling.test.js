import test from 'node:test';
import assert from 'node:assert/strict';
import {alignSpelling,classifySpellingError} from '../src/spelling.js';

test('classifies child-friendly spelling mistakes',()=>{
 assert.equal(classifySpellingError('beautiful','beutiful').type,'missing');
 assert.equal(classifySpellingError('beautiful','beautifull').type,'extra');
 assert.equal(classifySpellingError('friend','freind').type,'transposed');
 assert.equal(classifySpellingError("don't",'dont').type,'punctuation');
 assert.equal(classifySpellingError('name','naym').type,'phonetic');
 assert.equal(classifySpellingError('Monday','monday').type,'capitalization');
});

test('aligns entered and expected letters for exact visual feedback',()=>{
 const aligned=alignSpelling('cat','caat');
 assert.equal(aligned.filter(item=>item.type==='extra').length,1);
 assert.equal(aligned.map(item=>item.actual).join(''),'caat');
});
