export function parseGameLevel(page,totalLevels=7){
 const match=/^game(\d+)$/.exec(String(page||''));
 if(!match)return 0;
 return Math.max(0,Math.min(totalLevels-1,Number(match[1])));
}

export function getPlayablePairs(unit){
 const source=Array.isArray(unit?.pairs)&&unit.pairs.length?unit.pairs:Array.isArray(unit?.entries)?unit.entries.map(entry=>[entry.de,entry.en]):[];
 return source.map(pair=>Array.isArray(pair)?pair:[pair?.de,pair?.en]).map(([de,en])=>[String(de||'').trim(),String(en||'').trim()]).filter(([de,en])=>de&&en);
}
