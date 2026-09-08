export const MONSTER_STEPS=[
 {id:'meaning',title:'Bedeutung erkennen',icon:'👀'},
 {id:'spelling',title:'Selbst schreiben',icon:'✏️'},
 {id:'sentence',title:'Im Satz verwenden',icon:'💬'},
];

const key=(unitId,word)=>`${unitId}:${String(word).trim().toLocaleLowerCase()}`;

export function buildErrorMonsters(attempts,units,progress=[]){
 const unitMap=new Map((units||[]).filter(unit=>!unit.deletedAt).map(unit=>[unit.id,unit]));
 const records=new Map();
 for(const attempt of attempts||[]){
  if(attempt.correct)continue;const id=key(attempt.unitId,attempt.word),current=records.get(id)||{id,unitId:attempt.unitId,word:attempt.word,wrong:0,lastWrongAt:null};current.wrong+=1;if(!current.lastWrongAt||new Date(attempt.createdAt)>new Date(current.lastWrongAt))current.lastWrongAt=attempt.createdAt;records.set(id,current);
 }
 const progressMap=new Map((progress||[]).map(item=>[item.id,item]));
 return [...records.values()].filter(item=>item.wrong>=2&&unitMap.has(item.unitId)).map(item=>{const unit=unitMap.get(item.unitId),state=progressMap.get(item.id),defeated=state?.defeatedAt&&new Date(state.defeatedAt)>=new Date(item.lastWrongAt);const pair=(unit.pairs||[]).find(pair=>String(pair[1]).trim().toLocaleLowerCase()===String(item.word).trim().toLocaleLowerCase());return {...item,de:pair?.[0]||'',en:pair?.[1]||item.word,unitName:unit.name,steps:defeated?[]:(state?.steps||[]),defeated};}).filter(item=>!item.defeated).sort((a,b)=>b.wrong-a.wrong||new Date(b.lastWrongAt)-new Date(a.lastWrongAt));
}

export function advanceMonster(monster,step,now=new Date()){
 const steps=[...new Set([...(monster.steps||[]),step])],done=MONSTER_STEPS.every(item=>steps.includes(item.id));
 return {id:monster.id,unitId:monster.unitId,word:monster.en,steps,defeatedAt:done?now.toISOString():null,updatedAt:now.toISOString()};
}

export function monsterMood(completed){return completed>=3?'✨':completed===2?'😊':completed===1?'🙂':'😈'}

export function meaningChoices(monster,units,random=Math.random){
 const alternatives=[...new Set((units||[]).flatMap(unit=>unit.pairs||[]).map(pair=>String(pair[0]||'').trim()).filter(value=>value&&value!==monster.de))];
 return shuffleWith([monster.de,...shuffleWith(alternatives,random).slice(0,2)],random);
}
const shuffleWith=(values,random)=>[...values].sort(()=>random()-.5);
