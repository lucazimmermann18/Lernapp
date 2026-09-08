import test from 'node:test';
import assert from 'node:assert/strict';
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const {createFallbackStory,normalizeInterest,splitStoryText,validateStory}=await import('../src/story.js');

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
 assert.match(edge,/Klassenstufe 3–7/);assert.match(edge,/Keine Gewalt/);assert.match(edge,/json_schema/);
});
