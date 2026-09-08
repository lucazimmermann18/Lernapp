import test from 'node:test';
import assert from 'node:assert/strict';
import {getPlayablePairs,parseGameLevel} from '../src/gameData.js';

test('parses every game route without relying on String.prototype.at',()=>{
 for(let level=0;level<7;level++)assert.equal(parseGameLevel(`game${level}`),level);
 assert.equal(parseGameLevel('invalid'),0);assert.equal(parseGameLevel('game99'),6);
});

test('normalizes legacy, OCR and malformed vocabulary data safely',()=>{
 assert.deepEqual(getPlayablePairs({pairs:[[' Hund ',' dog '],null,['','empty']]}),[['Hund','dog']]);
 assert.deepEqual(getPlayablePairs({entries:[{de:'Katze',en:'cat'}]}),[['Katze','cat']]);
 assert.deepEqual(getPlayablePairs({}),[]);
});
