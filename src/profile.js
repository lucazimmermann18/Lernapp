export const DEFAULT_CHILD_NAME='Emma';

export function normalizeChildName(value){
 const cleaned=String(value??'').normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu,'').replace(/\s+/g,' ').trim().slice(0,30);
 return cleaned||DEFAULT_CHILD_NAME;
}

export function childNameFromSettings(settings){
 return normalizeChildName(settings.find(item=>item.id==='child-profile')?.name||DEFAULT_CHILD_NAME);
}

export function greetingForChild(name,date=new Date()){
 const hour=date.getHours();const greeting=hour<11?'Guten Morgen':hour<18?'Guten Tag':'Guten Abend';
 return `${greeting}, ${normalizeChildName(name)}!`;
}
