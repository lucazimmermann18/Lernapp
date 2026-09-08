import {getAccessToken,getCloudRequestHeaders} from './cloud.js';

const env=import.meta.env||{};
const supabaseUrl=(env.VITE_SUPABASE_URL||'https://lmcaduueyjpgjipoodju.supabase.co').replace(/\/$/,'');
export const AVATAR_TYPES=[['animal','Tierfigur'],['football','Fußballstar'],['science','Forscher/in'],['royal','Prinz/Prinzessin'],['space','Weltraumheld/in']];
const allowedTypes=new Set(AVATAR_TYPES.map(([id])=>id)),allowedColors=new Set(['violet','blue','green','orange','pink']);

export function normalizeAvatar(value={}){return {type:allowedTypes.has(value.type)?value.type:'animal',name:String(value.name||'Nova').replace(/[<>]/g,'').trim().slice(0,24)||'Nova',color:allowedColors.has(value.color)?value.color:'violet',outfit:String(value.outfit||'Lerncape').replace(/[<>]/g,'').trim().slice(0,40),ability:String(value.ability||'Mutmacher-Kraft').replace(/[<>]/g,'').trim().slice(0,60),approved:Boolean(value.approved),generatedByAI:Boolean(value.generatedByAI)};}
export const avatarEmoji=type=>({animal:'🦊',football:'⚽',science:'🧑‍🔬',royal:'👑',space:'🧑‍🚀'}[type]||'🦊');
export function fallbackAvatar(interest,type='animal'){return normalizeAvatar({type,name:'Nova',color:'violet',outfit:`${String(interest||'Lernen').slice(0,20)}-Cape`,ability:'Macht Fehler-Monster kleiner',generatedByAI:false});}

export async function generateAvatar(interest,type){
 try{const token=await getAccessToken(),response=await fetch(`${supabaseUrl}/functions/v1/generate-avatar`,{method:'POST',headers:getCloudRequestHeaders(token),body:JSON.stringify({interest:String(interest||'').slice(0,60),type})});if(!response.ok)throw new Error(`Avatar-KI nicht erreichbar (${response.status})`);return normalizeAvatar({...await response.json(),generatedByAI:true})}catch(error){return {...fallbackAvatar(interest,type),notice:'Die KI war nicht erreichbar – ein sicherer Avatar-Vorschlag wurde lokal erstellt.'}}
}
