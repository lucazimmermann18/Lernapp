import test from 'node:test';
import assert from 'node:assert/strict';

global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const {parseAIResponse}=await import('../src/aiOcr.js');

test('parses structured AI vocabulary output',()=>{
 assert.deepEqual(parseAIResponse({pairs:[{de:'Hallo',en:'hello'},{de:'rufen',en:'call'}]}),[['Hallo','hello'],['rufen','call']]);
});

test('accepts JSON code fences and rejects malformed output',()=>{
 assert.deepEqual(parseAIResponse('```json\n{"pairs":[{"de":"Name","en":"name"}]}\n```'),[['Name','name']]);
 assert.throws(()=>parseAIResponse('{"wrong":[]}'),/keine Vokabelpaare/);
});

test('drops empty rows and enforces the unit limit',()=>{
 const pairs=Array.from({length:35},(_,i)=>({de:`Wort ${i}`,en:`word ${i}`}));pairs.unshift({de:'',en:'empty'});
 assert.equal(parseAIResponse({pairs}).length,30);
});

test('AI OCR forwards the selected provider without exposing a key',async()=>{
 const source=await (await import('node:fs/promises')).readFile(new URL('../src/aiOcr.js',import.meta.url),'utf8');
 assert.match(source,/provider='auto'/);assert.match(source,/columnOrder,provider/);
 assert.match(source,/getCloudRequestHeaders\(token\)/);
 assert.doesNotMatch(source,/OPENAI_API_KEY|sk-/);
});

test('AI failure uses a readable error and the workspace falls back to local OCR',async()=>{
 const fs=await import('node:fs/promises');
 const client=await fs.readFile(new URL('../src/aiOcr.js',import.meta.url),'utf8');
 const workspace=await fs.readFile(new URL('../src/ocrWorkspace.jsx',import.meta.url),'utf8');
 assert.match(client,/gerade nicht erreichbar/);
 assert.match(workspace,/usedFallback/);
 assert.match(workspace,/lokaler Ersatz/);
});

test('edge function supports OpenAI structured vision output and Anthropic fallback',async()=>{
 const source=await (await import('node:fs/promises')).readFile(new URL('../supabase/functions/extract-vocabulary/index.ts',import.meta.url),'utf8');
 assert.match(source,/Access-Control-Allow-Headers[^\n]+apikey/);
 assert.match(source,/Access-Control-Allow-Methods[^\n]+POST, OPTIONS/);
 assert.match(source,/api\.openai\.com\/v1\/responses/);
 assert.match(source,/type:'input_image'/);assert.match(source,/type:'json_schema'/);
 assert.match(source,/OPENAI_API_KEY/);assert.match(source,/ANTHROPIC_API_KEY/);
 assert.match(source,/\['auto','openai','anthropic'\]/);
});
