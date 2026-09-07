import {getAccessToken} from './cloud.js';

const env=import.meta.env||{};
const supabaseUrl=(env.VITE_SUPABASE_URL||'https://lmcaduueyjpgjipoodju.supabase.co').replace(/\/$/,'');

export function parseAIResponse(value){
 const data=typeof value==='string'?JSON.parse(value.replace(/^```json\s*|\s*```$/g,'')):value;
 if(!Array.isArray(data?.pairs))throw new Error('Die KI-Antwort enthält keine Vokabelpaare.');
 return data.pairs.map(pair=>[String(pair.de||'').trim(),String(pair.en||'').trim()]).filter(pair=>pair[0]&&pair[1]).slice(0,30);
}

const toBase64=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)});

export async function recognizeVocabularyWithAI(file,columnOrder='en-de',provider='auto'){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('KI-OCR unterstützt JPG, PNG und WebP.');
 if(file.size>6*1024*1024)throw new Error('Das Bild ist größer als 6 MB. Bitte kleiner fotografieren oder zuschneiden.');
 const token=await getAccessToken();
 const response=await fetch(`${supabaseUrl}/functions/v1/extract-vocabulary`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({image:await toBase64(file),mediaType:file.type,columnOrder,provider})});
 if(!response.ok){const detail=await response.json().catch(()=>({}));throw new Error(detail.error||`KI-Erkennung fehlgeschlagen (${response.status}).`)}
 return parseAIResponse(await response.json());
}
