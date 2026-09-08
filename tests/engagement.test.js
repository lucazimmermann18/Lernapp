import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLearningStreak,buildMasteryUnit,masteryTestState} from '../src/engagement.js';

const attempt=date=>({correct:true,createdAt:`${date}T12:00:00Z`});
test('day streak shows the current week and protects one missed day',()=>{
 const result=buildLearningStreak([attempt('2026-09-04'),attempt('2026-09-06'),attempt('2026-09-07'),attempt('2026-09-08')],new Date('2026-09-08T16:00:00Z'),true);
 assert.equal(result.streak,4);assert.equal(result.protectedDate,'2026-09-05');assert.equal(result.week.length,7);
 assert.equal(result.week.find(day=>day.date==='2026-09-08').status,'learned');
});

test('streak protection is optional and a quiet day does not pressure the child',()=>{
 const result=buildLearningStreak([attempt('2026-09-06'),attempt('2026-09-08')],new Date('2026-09-08T16:00:00Z'),false);
 assert.equal(result.streak,1);assert.equal(result.protectedDate,null);
});

test('mastery test unlocks after the configured delay and mixes directions',()=>{
 const unit={id:'u1',name:'Animals',done:7,completedAt:'2026-09-01T10:00:00Z',pairs:[['Hund','dog'],['Katze','cat'],['Pferd','horse']]};
 assert.equal(masteryTestState(unit,new Date('2026-09-03T09:00:00Z'),3).status,'waiting');
 assert.equal(masteryTestState(unit,new Date('2026-09-05T10:00:00Z'),3).status,'due');
 const testUnit=buildMasteryUnit(unit,[{unitId:'u1',word:'horse',totalWrong:4}]);
 assert.equal(testUnit.questions[0].sourceWord,'horse');
 assert.deepEqual(new Set(testUnit.questions.map(item=>item.direction)),new Set(['Deutsch → Englisch','Englisch → Deutsch']));
 assert.equal(testUnit.isMasteryTest,true);
});
