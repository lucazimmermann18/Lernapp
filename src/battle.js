const MODES=['translation','hearing','picture','scramble','sentence'];
const CHILD_WIN_ROUNDS=new Set([0,1,3,4,5,7,8]);

const shuffle=(values,random=Math.random)=>[...values].sort(()=>random()-.5);

export function recentBattlePairs(units,limit=5){
 return [...(units||[])].filter(unit=>!unit.archived&&!unit.deletedAt&&Array.isArray(unit.pairs)).sort((a,b)=>new Date(b.createdAt||b.updatedAt||0)-new Date(a.createdAt||a.updatedAt||0)).slice(0,limit).flatMap(unit=>unit.pairs.map((pair,index)=>({id:`${unit.id}-${index}`,unitId:unit.id,unitName:unit.name,de:String(pair[0]||'').trim(),en:String(pair[1]||'').trim(),icon:unit.icon||'🎯'}))).filter(pair=>pair.de&&pair.en);
}

export function buildBattleRounds(units,count=10,random=Math.random){
 const pairs=recentBattlePairs(units);if(!pairs.length)return [];
 const pool=shuffle(pairs,random),allEnglish=[...new Set(pairs.map(pair=>pair.en))],allGerman=[...new Set(pairs.map(pair=>pair.de))];
 return Array.from({length:count},(_,index)=>{const pair=pool[index%pool.length],mode=MODES[index%MODES.length],answer=mode==='hearing'?pair.de:pair.en,candidates=mode==='hearing'?allGerman:allEnglish;return {...pair,mode,answer,choices:shuffle([answer,...shuffle(candidates.filter(value=>value!==answer),random).slice(0,2)],random),plannedChildWin:CHILD_WIN_ROUNDS.has(index)};});
}

export function settleBattleRound(round,correct){
 if(!correct)return {winner:'opponent',childPoints:0,opponentPoints:1,message:'Knapp! Der Vokabel-Bot war diesmal schneller.'};
 return round.plannedChildWin?{winner:'child',childPoints:1,opponentPoints:0,message:'Schneller als der Vokabel-Bot! ⚡'}:{winner:'opponent',childPoints:0,opponentPoints:1,message:'Richtig – aber der Vokabel-Bot war einen Wimpernschlag schneller.'};
}

export const battleModeLabel=mode=>({translation:'Übersetzungsduell',hearing:'Hörduell',picture:'Bildduell',scramble:'Buchstabensalat',sentence:'Satzbau-Rennen'}[mode]||'Vokabel-Duell');
export const scrambleWord=(word,random=Math.random)=>shuffle(String(word).split(''),random).join(' ');
export function battlePicture(word,fallback='🎯'){
 const pictures={dog:'🐶',cat:'🐱',bird:'🐦',horse:'🐴',mouse:'🐭',book:'📖',pencil:'✏️',desk:'🪑',school:'🏫',teacher:'🧑‍🏫',apple:'🍎',bread:'🍞',water:'💧',milk:'🥛',cheese:'🧀',sun:'☀️',moon:'🌙',car:'🚗',house:'🏠',tree:'🌳',fish:'🐟',friend:'🧑‍🤝‍🧑',football:'⚽'};
 return pictures[String(word||'').trim().toLocaleLowerCase()]||fallback;
}
