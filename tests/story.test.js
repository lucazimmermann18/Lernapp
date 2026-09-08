import test from 'node:test';
import assert from 'node:assert/strict';
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const {createFallbackStory,normalizeInterest,splitStoryText,STORY_VERSION,validateStory,validateStoryQuality}=await import('../src/story.js');

test('validates a story that uses every unit word exactly once',()=>{
 const value={title:'Mission',text:'Wir brauchen {{w1}} und danach {{w2}}.',blanks:[{id:'w1',word:'dog'},{id:'w2',word:'cat'}]};
 assert.deepEqual(validateStory(value,['dog','cat']),value);
 assert.deepEqual(splitStoryText(value.text).filter(part=>part.type==='blank').map(part=>part.id),['w1','w2']);
 assert.throws(()=>validateStory({...value,text:'Nur {{w1}}.'},['dog','cat']),/genau eine Lücke/);
});

test('fallback story is always playable and interest text is sanitized',()=>{
 assert.equal(normalizeInterest('  <Fortnite>   Abenteuer  '),'Fortnite Abenteuer');
 const story=createFallbackStory(['dog','cat','horse'],'Pferde');
 assert.equal(validateStory(story,['dog','cat','horse']).blanks.length,3);
});

test('quality gate rejects list-like drafts and accepts a connected story',()=>{
 const words=['dog','cat','horse'];
 const weak={title:'Words',text:'The {{w1}}. The {{w2}}. The {{w3}}.',blanks:words.map((word,index)=>({id:`w${index+1}`,word}))};
 assert.throws(()=>validateStoryQuality(weak,words),/zu kurz|Handlung/);
 const text=`Mia enters the island before sunrise because she must find a lost map. A friendly {{w1}} follows her footprints and points towards an old tower. Inside, a clever {{w2}} knocks a silver key from a shelf, making Mia laugh. The door opens onto a green valley, but a broken bridge blocks the way. Then a strong {{w3}} arrives and carries Mia safely across the river. At the final gate, Mia fits the silver key into the lock. Golden lights dance above the path, and the missing map floats gently into her hands. She thanks all three helpers and returns home proudly. Her brave mission is complete, but a new glowing trail promises another adventure tomorrow.`;
 assert.equal(validateStoryQuality({title:'The Lost Island Map',text,blanks:words.map((word,index)=>({id:`w${index+1}`,word}))},words).title,'The Lost Island Map');
 assert.equal(STORY_VERSION,2);
});

test('story challenge supports drag and touch-friendly tap placement',async()=>{
 const source=await (await import('node:fs/promises')).readFile(new URL('../src/StoryChallenge.jsx',import.meta.url),'utf8');
 assert.match(source,/draggable=/);assert.match(source,/onDrop=/);assert.match(source,/onClick=\{\(\)=>selected&&place/);
 assert.match(source,/Geschichte prüfen/);assert.match(source,/Noch einmal versuchen/);
});

test('AI story generation keeps the OpenAI key server-side and applies safety rules',async()=>{
 const fs=await import('node:fs/promises');
 const client=await fs.readFile(new URL('../src/story.js',import.meta.url),'utf8');
 const edge=await fs.readFile(new URL('../supabase/functions/generate-story/index.ts',import.meta.url),'utf8');
 assert.doesNotMatch(client,/OPENAI_API_KEY|sk-/);assert.match(edge,/OPENAI_API_KEY/);
 assert.match(edge,/grades 3–7/);assert.match(edge,/real connected adventure/);assert.match(edge,/surprising obstacle/);assert.match(edge,/small exciting climax/);assert.match(edge,/140–260 words/);assert.match(edge,/No graphic violence/);assert.match(edge,/json_schema/);assert.match(edge,/previous draft failed validation/);
});
