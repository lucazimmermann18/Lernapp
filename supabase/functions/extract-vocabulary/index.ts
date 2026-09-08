// Browsers preflight requests containing Supabase's required `apikey` header.
// Omitting it makes fetch fail with the unhelpful message "Load failed" before
// the function is ever invoked.
const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'apikey, authorization, content-type, x-client-info',
 'Access-Control-Allow-Methods':'POST, OPTIONS',
};
const jsonHeaders={...cors,'Content-Type':'application/json'};
const allowedMediaTypes=['image/jpeg','image/png','image/webp'];
const schema={type:'object',additionalProperties:false,properties:{pairs:{type:'array',maxItems:30,items:{type:'object',additionalProperties:false,properties:{de:{type:'string'},en:{type:'string'}},required:['de','en']}}},required:['pairs']};
const withoutPronunciation=(value:any)=>String(value||'').replace(/\s*\[[^\]\r\n]{1,120}\]/g,' ').replace(/\s+\/[^/\r\n]{1,120}\/\s*$/g,' ').replace(/\s+/g,' ').trim();
const sanitize=(value:any)=>({pairs:Array.isArray(value?.pairs)?value.pairs.map((pair:any)=>({de:String(pair?.de||'').trim(),en:withoutPronunciation(pair?.en)})).filter((pair:any)=>pair.de&&pair.en).slice(0,30):[]});

const promptFor=(columnOrder:string)=>`Lies aus diesem Bild ALLE sichtbaren Vokabelzeilen aus. Die Spaltenreihenfolge ist ${columnOrder==='en-de'?'Englisch links, Deutsch rechts':'Deutsch links, Englisch rechts'}. Verbinde eingerückte Folgezeilen mit dem vorherigen Eintrag. Entferne aus dem englischen Ergebnis immer Lautschrift und Ausspracheangaben in eckigen Klammern oder Schrägstrichen, zum Beispiel ['sɪstə], [ən] oder /wɜːd/. Gib im Feld en nur die tatsächlich zu lernende Schreibweise aus. Bewahre Wortartmarker (z. B. n, v, adj, interj), Klammerhinweise und unregelmäßige Formen ansonsten exakt; die App trennt diese später. Erfinde, ergänze und übersetze nichts. Gib ausschließlich das verlangte JSON zurück.`;

async function openAI(image:string,mediaType:string,prompt:string){
 const apiKey=Deno.env.get('OPENAI_API_KEY');if(!apiKey)throw new Error('Der OpenAI API-Key ist in Supabase noch nicht hinterlegt.');
 const model=Deno.env.get('OPENAI_MODEL')||'gpt-4.1-mini';
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:`data:${mediaType};base64,${image}`}]}],text:{format:{type:'json_schema',name:'vocabulary_pairs',strict:true,schema}},max_output_tokens:3000})});
 if(!response.ok)throw new Error(`OpenAI antwortet mit ${response.status}.`);
 const result=await response.json();const text=result.output?.flatMap((item:any)=>item.content||[]).find((part:any)=>part.type==='output_text')?.text;
 if(!text)throw new Error('OpenAI hat keine auswertbare Antwort geliefert.');return JSON.parse(text);
}

async function anthropic(image:string,mediaType:string,prompt:string){
 const apiKey=Deno.env.get('ANTHROPIC_API_KEY'),model=Deno.env.get('ANTHROPIC_MODEL');if(!apiKey||!model)throw new Error('Anthropic ist in Supabase noch nicht konfiguriert.');
 const response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model,max_tokens:3000,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mediaType,data:image}},{type:'text',text:`${prompt} Antworte als {"pairs":[{"de":"...","en":"..."}]}.`}]}]})});
 if(!response.ok)throw new Error(`Anthropic antwortet mit ${response.status}.`);
 const result=await response.json();const text=result.content?.find((part:any)=>part.type==='text')?.text;if(!text)throw new Error('Anthropic hat keine auswertbare Antwort geliefert.');return JSON.parse(text.replace(/^```json\s*|\s*```$/g,''));
}

Deno.serve(async request=>{
 if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const {image,mediaType,columnOrder,provider='auto'}=await request.json();
  if(!image||!allowedMediaTypes.includes(mediaType))throw new Error('Ungültiges Bildformat.');
  if(!['auto','openai','anthropic'].includes(provider))throw new Error('Unbekannter KI-Anbieter.');
  const selected=provider==='auto'?(Deno.env.get('OPENAI_API_KEY')?'openai':'anthropic'):provider;
  const result=selected==='openai'?await openAI(image,mediaType,promptFor(columnOrder)):await anthropic(image,mediaType,promptFor(columnOrder));
  return new Response(JSON.stringify({...sanitize(result),provider:selected}),{headers:jsonHeaders});
 }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:'Unbekannter Fehler'}),{status:400,headers:jsonHeaders})}
});
