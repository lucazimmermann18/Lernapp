import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateAchievementProgress, nextRewardProgress, scoreStage, summarizeLearning, syncRewards} from '../src/learning.js';

const units=[{id:'a',done:1,stars:[3,2],lastPracticedAt:'2026-01-01'},{id:'b',done:0,stars:[0,0]}];
const attempts=[
 {unitId:'a',word:'dog',correct:true,firstTry:true,createdAt:'2026-01-01'},
 {unitId:'a',word:'dog',correct:true,firstTry:true,createdAt:'2026-01-01'},
 {unitId:'a',word:'cat',correct:true,firstTry:false,createdAt:'2026-01-02'}
];

test('summarizes unique learned words without double counting repetitions',()=>{
 assert.deepEqual(summarizeLearning(attempts,units),{learnedWords:1,attempts:3,practicedUnits:1,stars:5});
});

test('unlocks rewards and keeps redemption state',()=>{
 const now=new Date('2026-01-03T00:00:00Z');
 const result=syncRewards([{id:'1',milestone:1,redeemed:true},{id:'2',milestone:5}],1,now);
 assert.equal(result[0].unlocked,true); assert.equal(result[0].redeemed,true);
 assert.equal(result[1].unlocked,false); assert.equal(result[1].redeemed,false);
});

test('calculates progress inside the current reward interval',()=>{
 const rewards=syncRewards([{id:'1',milestone:10},{id:'2',milestone:20}],15,new Date());
 assert.deepEqual(nextRewardProgress(rewards,15),{next:rewards[1],remaining:5,percent:50});
});

test('reports a complete reward collection',()=>{
 const rewards=syncRewards([{id:'1',milestone:1}],2,new Date());
 assert.deepEqual(nextRewardProgress(rewards,2),{next:null,remaining:0,percent:100});
});

test('achievement metrics consume the same summarized state',()=>{
 const result=calculateAchievementProgress({metric:'stars',target:5},{attempts,units,learnedWords:1});
 assert.equal(result.current,5); assert.equal(result.unlocked,true);
});

test('scores stages at the 70, 85 and 100 percent boundaries',()=>{
 const results=count=>Array.from({length:20},(_,i)=>({firstTry:i<count}));
 assert.deepEqual(scoreStage(results(14)),{score:70,stars:1,passed:true});
 assert.deepEqual(scoreStage(results(17)),{score:85,stars:2,passed:true});
 assert.deepEqual(scoreStage(results(20)),{score:100,stars:3,passed:true});
 assert.deepEqual(scoreStage(results(13)),{score:65,stars:0,passed:false});
});

test('builds detailed parent analytics from every answer',async()=>{
 const {buildParentAnalytics}=await import('../src/learning.js');
 const attempts=[
  {unitId:'u1',word:'dog',correct:false,firstTry:false,sessionId:'s1',durationMs:10000,createdAt:'2026-09-06T10:00:00Z'},
  {unitId:'u1',word:'dog',correct:false,firstTry:false,sessionId:'s1',durationMs:5000,createdAt:'2026-09-06T10:01:00Z'},
  {unitId:'u1',word:'dog',correct:true,firstTry:false,sessionId:'s1',durationMs:5000,createdAt:'2026-09-06T10:02:00Z'},
  {unitId:'u1',word:'cat',correct:true,firstTry:true,sessionId:'s2',durationMs:60000,createdAt:'2026-09-07T10:00:00Z'}
 ];
 const result=buildParentAnalytics(attempts,[{id:'u1',name:'Animals',done:3}],new Date('2026-09-07T12:00:00Z'));
 assert.equal(result.totalAnswers,4);assert.equal(result.errorRate,50);assert.equal(result.firstTryRate,50);
 assert.equal(result.learningDays,2);assert.equal(result.hardestWords[0].word,'dog');assert.equal(result.hardestWords[0].errorRate,67);
 assert.equal(result.averageRoundMinutes,0.7);assert.equal(result.unitProgress[0].percent,43);
 assert.equal(result.lastSevenDays.at(-1).answers,1);
});

test('ignores deleted units in summaries and parent progress',async()=>{
 const {buildParentAnalytics,summarizeLearning}=await import('../src/learning.js');
 const units=[{id:'active',name:'Active',done:2,stars:[1]},{id:'gone',name:'Gone',done:7,stars:[3,3],deletedAt:'2026-09-07T00:00:00Z'}];
 assert.equal(summarizeLearning([],units).practicedUnits,1);
 assert.equal(summarizeLearning([],units).stars,1);
 assert.deepEqual(buildParentAnalytics([],units).unitProgress.map(unit=>unit.id),['active']);
});

test('uses parent-defined unit order when available',async()=>{
 const {sortUnitsForDailyLearning}=await import('../src/learning.js');
 const units=[{id:'later',sortOrder:1,createdAt:'2026-09-07'},{id:'first',sortOrder:0,createdAt:'2026-09-01'}];
 assert.deepEqual(sortUnitsForDailyLearning(units).map(unit=>unit.id),['first','later']);
});

test('streak grows only for consecutive correct answers and resets on an error',async()=>{
 const {nextStreak}=await import('../src/learning.js');
 let streak=nextStreak(0,true);
 streak=nextStreak(streak,true);
 streak=nextStreak(streak,true);
 assert.equal(streak,3);
 assert.equal(nextStreak(streak,false),0);
 assert.equal(nextStreak(0,true),1);
});

test('normalizes and loads the personalized child profile safely',async()=>{
 const {DEFAULT_CHILD_NAME,childNameFromSettings,greetingForChild,normalizeChildName}=await import('../src/profile.js');
 assert.equal(normalizeChildName('  Mia   Sophie  '),'Mia Sophie');
 assert.equal(normalizeChildName(''),DEFAULT_CHILD_NAME);
 assert.equal(childNameFromSettings([{id:'child-profile',name:'Lina'}]),'Lina');
 assert.equal(greetingForChild('Noah',new Date('2026-09-07T08:00:00')),'Guten Morgen, Noah!');
});
