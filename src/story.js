import {getAccessToken,getCloudRequestHeaders} from './cloud.js';
import {createId} from './id.js';

const env=import.meta.env||{};
const supabaseUrl=(env.VITE_SUPABASE_URL||'https://lmcaduueyjpgjipoodju.supabase.co').replace(/\/$/,'');
const marker=/\{\{([a-z0-9-]+)\}\}/gi;

export function normalizeInterest(value){return String(value||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,60)}

export function validateStory(value,words){
 if(!value||typeof value.text!=='string'||typeof value.title!=='string'||!Array.isArray(value.blanks))throw new Error('Die Geschichte ist nicht vollständig.');
 const expected=words.map(word=>String(word).trim().toLocaleLowerCase()),ids=[...value.text.matchAll(marker)].map(match=>match[1]);
 const blankIds=value.blanks.map(blank=>String(blank.id));
 if(ids.length!==expected.length||new Set(ids).size!==ids.length||ids.some(id=>!blankIds.includes(id)))throw new Error('Die Geschichte enthält nicht für jede Vokabel genau eine Lücke.');
 const answers=value.blanks.map(blank=>String(blank.word||'').trim().toLocaleLowerCase());
 if([...expected].sort().join('\u0000')!==[...answers].sort().join('\u0000'))throw new Error('Die Geschichte verwendet nicht alle Wörter der Unit.');
 return {title:value.title.trim().slice(0,80),text:value.text.trim(),blanks:value.blanks.map(blank=>({id:String(blank.id),word:String(blank.word).trim()}))};
}

export function createFallbackStory(words,interest='Abenteuer'){
 const safeInterest=normalizeInterest(interest)||'Abenteuer';
 const blanks=words.map((word,index)=>({id:`w${index+1}`,word:String(word).trim()}));
 const sentences=blanks.map((blank,index)=>`${index===0?`In einer Geschichte über ${safeInterest}`:'Danach'} braucht unser Held das englische Wort {{${blank.id}}}.`);
 return {title:`Das große ${safeInterest}-Abenteuer`,text:sentences.join(' '),blanks};
}

export async function generateStory(unit,interest){
 const words=(unit.pairs||[]).map(pair=>pair[1]).filter(Boolean).slice(0,30);
 if(words.length<3)throw new Error('Für eine Geschichte werden mindestens drei Vokabeln benötigt.');
 let response;
 try{const token=await getAccessToken();response=await fetch(`${supabaseUrl}/functions/v1/generate-story`,{method:'POST',headers:getCloudRequestHeaders(token),body:JSON.stringify({unitName:unit.name,interest:normalizeInterest(interest),words})})}catch(error){return {...createFallbackStory(words,interest),fallback:true,error:error.message}}
 if(!response.ok){const detail=await response.json().catch(()=>({}));return {...createFallbackStory(words,interest),fallback:true,error:detail.error||`KI nicht erreichbar (${response.status})`}}
 try{return validateStory(await response.json(),words)}catch(error){return {...createFallbackStory(words,interest),fallback:true,error:error.message}}
}

export function storyRecord(unit,interest,story){const now=new Date().toISOString();return {id:createId(),unitId:unit.id,unitUpdatedAt:unit.updatedAt||unit.createdAt||null,interest:normalizeInterest(interest),story,createdAt:now,updatedAt:now}}

export function splitStoryText(text){const parts=[];let start=0;for(const match of text.matchAll(marker)){if(match.index>start)parts.push({type:'text',value:text.slice(start,match.index)});parts.push({type:'blank',id:match[1]});start=match.index+match[0].length}if(start<text.length)parts.push({type:'text',value:text.slice(start)});return parts}
