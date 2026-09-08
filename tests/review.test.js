import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDailyMix,createReviewProgress,dailyUnit,difficultVocabulary,scheduleReview} from '../src/review.js';

const now=new Date('2026-09-08T12:00:00Z');
const units=[{id:'new',name:'Heute',createdAt:'2026-09-08T08:00:00Z',pairs:[['Hund','dog'],['Katze','cat']]},{id:'old',name:'Gestern',createdAt:'2026-09-01T08:00:00Z',pairs:[['Pferd','horse'],['Vogel','bird']]}];

test('spaced repetition schedules failures, first successes and long mastery',()=>{
 let item=createReviewProgress('new','dog',now);
 item=scheduleReview(item,{correct:false,firstTry:false},now);assert.equal(item.intervalDays,0);assert.equal(item.totalWrong,1);
 item=scheduleReview(item,{correct:true,firstTry:false},now);assert.equal(item.intervalDays,1);
 item=scheduleReview(item,{correct:true,firstTry:true},now);assert.equal(item.intervalDays,7);
 item=scheduleReview(item,{correct:true,firstTry:true},now);assert.equal(item.intervalDays,14);
 item=scheduleReview(item,{correct:true,firstTry:true},now);assert.equal(item.intervalDays,30);assert.equal(item.masteryLevel,4);
});

test('daily mix combines due, difficult and new vocabulary without duplicates',()=>{
 const dog={...createReviewProgress('new','dog',now),nextReviewAt:'2026-09-07T00:00:00Z',totalWrong:3,totalCorrect:1};
 const mix=buildDailyMix(units,[dog],{dailyGoal:4},now);
 assert.equal(mix.length,4);assert.equal(new Set(mix.map(item=>`${item.unitId}:${item.en}`)).size,4);
 assert.equal(mix[0].en,'dog');
 const hard=difficultVocabulary(units,[dog]);assert.equal(hard[0].en,'dog');
 const virtual=dailyUnit(mix);assert.equal(virtual.pairs.length,4);assert.equal(virtual.sourceByWord.dog,'new');
});
