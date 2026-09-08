const DAY = 86400000;

export const DEFAULT_DAILY_SETTINGS = {
  id: 'daily-learning', dailyGoal: 15, maxMinutes: 10,
  newShare: 35, reviewShare: 65, weekends: true, streakProtection: true, masteryDelayDays: 3
};

export const reviewId = (unitId, word) => `${unitId}:${String(word).trim().toLocaleLowerCase()}`;

export function createReviewProgress(unitId, word, now = new Date()) {
  return {id:reviewId(unitId,word),unitId,word,masteryLevel:0,nextReviewAt:now.toISOString(),intervalDays:0,easeFactor:2.3,correctStreak:0,lastReviewedAt:null,totalCorrect:0,totalWrong:0,updatedAt:now.toISOString()};
}

/** A small, child-friendly spaced-repetition schedule inspired by SM-2. */
export function scheduleReview(current, {correct, firstTry}, now = new Date()) {
  const base=current||createReviewProgress('unknown','unknown',now);
  const streak=correct ? (base.correctStreak||0)+1 : 0;
  let interval=0;
  if(correct&&firstTry){
    if(streak===1)interval=2;
    else if(streak===2)interval=7;
    else if(streak===3)interval=14;
    else interval=30;
  } else if(correct) interval=1;
  const easeDelta=correct&&firstTry ? 0.08 : -0.18;
  const ease=Math.max(1.3,Math.min(2.8,(base.easeFactor||2.3)+easeDelta));
  return {...base,masteryLevel:correct?Math.min(5,(base.masteryLevel||0)+1):Math.max(0,(base.masteryLevel||0)-1),intervalDays:interval,easeFactor:Math.round(ease*100)/100,correctStreak:streak,lastReviewedAt:now.toISOString(),nextReviewAt:new Date(now.getTime()+interval*DAY).toISOString(),totalCorrect:(base.totalCorrect||0)+(correct?1:0),totalWrong:(base.totalWrong||0)+(correct?0:1),updatedAt:now.toISOString()};
}

export function allVocabulary(units) {
  return units.filter(unit=>!unit.archived&&!unit.deletedAt).flatMap(unit=>(unit.pairs||[]).filter(pair=>Array.isArray(pair)&&pair[0]&&pair[1]).map(([de,en])=>({unitId:unit.id,unitName:unit.name,de:String(de).trim(),en:String(en).trim(),createdAt:unit.createdAt||''})));
}

export function difficultVocabulary(units,progress,limit=12) {
  const byId=new Map(progress.map(item=>[item.id,item]));
  return allVocabulary(units).map(item=>({...item,progress:byId.get(reviewId(item.unitId,item.en))})).filter(item=>{
    if(!item.progress?.totalWrong)return false;
    const total=item.progress.totalCorrect+item.progress.totalWrong;
    return item.progress.masteryLevel<3||item.progress.totalWrong/Math.max(1,total)>.35;
  }).sort((a,b)=>{
    const ar=a.progress.totalWrong/Math.max(1,a.progress.totalCorrect+a.progress.totalWrong);
    const br=b.progress.totalWrong/Math.max(1,b.progress.totalCorrect+b.progress.totalWrong);
    return br-ar||b.progress.totalWrong-a.progress.totalWrong;
  }).slice(0,limit);
}

export function buildDailyMix(units, progress, settings=DEFAULT_DAILY_SETTINGS, now=new Date()) {
  if(!settings.weekends&&(now.getDay()===0||now.getDay()===6))return [];
  const goal=Math.max(5,Math.min(30,Number(settings.dailyGoal)||15));
  const vocabulary=allVocabulary(units),byId=new Map(progress.map(item=>[item.id,item]));
  const enriched=vocabulary.map(item=>({...item,progress:byId.get(reviewId(item.unitId,item.en))}));
  const due=enriched.filter(item=>item.progress&&new Date(item.progress.nextReviewAt||0)<=now).sort((a,b)=>new Date(a.progress.nextReviewAt)-new Date(b.progress.nextReviewAt));
  const hard=difficultVocabulary(units,progress,goal);
  const fresh=enriched.filter(item=>!item.progress).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const secure=enriched.filter(item=>item.progress&&item.progress.masteryLevel>=3).sort((a,b)=>new Date(a.progress.lastReviewedAt)-new Date(b.progress.lastReviewedAt));
  const selected=[],seen=new Set();
  const take=(list,count)=>{for(const item of list){const key=reviewId(item.unitId,item.en);if(selected.length>=goal||count<=0)break;if(!seen.has(key)){seen.add(key);selected.push(item);count--}}};
  const configuredShare=Number.isFinite(Number(settings.newShare))?Number(settings.newShare):35;
  const newCount=Math.round(goal*Math.max(0,Math.min(100,configuredShare))/100);
  take(due,Math.ceil((goal-newCount)*.6));take(hard,goal-newCount);take(fresh,newCount);take([...due,...hard,...fresh,...secure,...enriched],goal);
  return selected;
}

export function dailyUnit(items, title='Mein täglicher Mix',settings=DEFAULT_DAILY_SETTINGS) {
  return {id:'daily-mix',name:title,icon:'🌟',accent:'#7047dc',soft:'#f1ebff',done:7,stars:[0,0,0,0,0,0,0],words:items.length,pairs:items.map(item=>[item.de,item.en]),sourceByWord:Object.fromEntries(items.map(item=>[item.en.toLocaleLowerCase(),item.unitId])),isDailyMix:true,maxMinutes:Number(settings.maxMinutes)||0};
}
