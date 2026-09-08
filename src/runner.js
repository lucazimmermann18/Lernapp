const shuffle=(values,random=Math.random)=>[...values].sort(()=>random()-.5);

export function runnerVocabulary(units){
 return (units||[]).filter(unit=>!unit.archived&&!unit.deletedAt).flatMap(unit=>(unit.pairs||[]).map((pair,index)=>({id:`${unit.id}:${index}`,unitId:unit.id,unitName:unit.name,de:String(pair[0]||'').trim(),en:String(pair[1]||'').trim()}))).filter(item=>item.de&&item.en);
}

export function buildRunnerCourse(units,count=10,random=Math.random){
 const vocabulary=runnerVocabulary(units);if(!vocabulary.length)return [];
 const course=shuffle(vocabulary,random),allDe=[...new Set(vocabulary.map(item=>item.de))],allEn=[...new Set(vocabulary.map(item=>item.en))];
 return Array.from({length:Math.min(count,Math.max(vocabulary.length,count))},(_,index)=>{const item=course[index%course.length],reverse=index%3===2,answer=reverse?item.de:item.en,pool=reverse?allDe:allEn,distractors=shuffle(pool.filter(value=>value!==answer),random).slice(0,2);return {...item,direction:reverse?'en-de':'de-en',prompt:reverse?item.en:item.de,answer,choices:shuffle([answer,...distractors],random)};});
}

export function runnerStars(correct,total){const percent=total?correct/total*100:0;return percent===100?3:percent>=80?2:percent>=60?1:0}
