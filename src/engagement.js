const DAY=86400000;
const dayStart=value=>{const date=new Date(value);return new Date(date.getFullYear(),date.getMonth(),date.getDate())};
const key=value=>{const date=dayStart(value);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};
const diffDays=(later,earlier)=>Math.round((dayStart(later)-dayStart(earlier))/DAY);

/** Builds a motivating day streak with one optional protected gap per streak. */
export function buildLearningStreak(attempts,now=new Date(),protectionEnabled=true){
 const learned=[...new Set(attempts.filter(item=>item.correct).map(item=>item.createdAt&&key(item.createdAt)).filter(Boolean))].sort().reverse();
 let streak=0,protectedDate=null;
 if(learned.length&&diffDays(now,learned[0])<=1){streak=1;for(let index=1;index<learned.length;index++){const gap=diffDays(learned[index-1],learned[index]);if(gap===1)streak++;else if(gap===2&&protectionEnabled&&!protectedDate){protectedDate=key(new Date(dayStart(learned[index-1]).getTime()-DAY));streak++}else break}}
 const today=dayStart(now),monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
 const week=Array.from({length:7},(_,index)=>{const date=new Date(monday.getTime()+index*DAY),dateKey=key(date);return {date:dateKey,label:date.toLocaleDateString('de-DE',{weekday:'short'}).slice(0,2),status:learned.includes(dateKey)?'learned':dateKey===protectedDate?'protected':date>today?'future':dateKey===key(today)?'today':'empty'}});
 return {streak,protectedDate,protectionAvailable:protectionEnabled&&!protectedDate,lastLearnedAt:learned[0]||null,week};
}

export function masteryTestState(unit,now=new Date(),delayDays=3){
 if(unit.masteredAt)return {status:'mastered',due:true,daysRemaining:0};
 if((unit.done||0)<7)return {status:'locked',due:false,daysRemaining:null};
 const completed=new Date(unit.completedAt||unit.lastPracticedAt||now),days=Math.max(0,Math.ceil((completed.getTime()+delayDays*DAY-now.getTime())/DAY));
 return {status:days?'waiting':'due',due:days===0,daysRemaining:days,dueAt:new Date(completed.getTime()+delayDays*DAY).toISOString()};
}

export function buildMasteryUnit(unit,progress=[]){
 const byWord=new Map(progress.filter(item=>item.unitId===unit.id).map(item=>[item.word.toLocaleLowerCase(),item]));
 const ranked=(unit.pairs||[]).map(([de,en])=>({de,en,weight:byWord.get(String(en).toLocaleLowerCase())?.totalWrong||0,randomOrder:Math.random()})).sort((a,b)=>b.weight-a.weight||a.randomOrder-b.randomOrder);
 const questions=ranked.map((item,index)=>index%2?{prompt:item.en,answer:item.de,direction:'Englisch → Deutsch',sourceWord:item.en}:{prompt:item.de,answer:item.en,direction:'Deutsch → Englisch',sourceWord:item.en});
 return {...unit,id:`mastery:${unit.id}`,name:`Meistertest · ${unit.name}`,icon:'🏆',isMasteryTest:true,originalUnitId:unit.id,done:7,questions,pairs:questions.map(item=>[item.prompt,item.answer]),sourceByWord:Object.fromEntries(questions.map(item=>[item.answer.toLocaleLowerCase(),unit.id])),maxMinutes:0};
}
