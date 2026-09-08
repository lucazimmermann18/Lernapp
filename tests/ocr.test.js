import test from 'node:test';
import assert from 'node:assert/strict';
import {parseVocabularyLayout, parseVocabularyPairs, splitVocabularyEntry} from '../src/ocr.js';

const word = (text, x0, y0, x1, y1) => ({text, bbox:{x0,y0,x1,y1}});

test('parses two-column plain text in either direction', () => {
  const text='Hund  dog\nKatze\tcat\nAdresse | address';
  assert.deepEqual(parseVocabularyPairs(text), [['Hund','dog'],['Katze','cat'],['Adresse','address']]);
  assert.deepEqual(parseVocabularyPairs('dog  Hund','en-de'), [['Hund','dog']]);
});

test('uses word coordinates to preserve textbook columns', () => {
  const words=[
    word('Hello.',20,10,90,30), word('interj',96,10,140,30), word('Hallo.',470,10,530,30), word('/',535,10,540,30), word('Guten',545,10,600,30), word('Tag.',605,10,650,30),
    word('call',20,45,60,65), word('v',68,45,78,65), word('nennen;',470,45,545,65), word('rufen',552,45,600,65),
    word('name',20,80,75,100), word('n',82,80,92,100), word('Name',470,80,525,100)
  ];
  assert.deepEqual(parseVocabularyLayout({words},'en-de'), [
    ['Hallo. / Guten Tag.','Hello. interj'], ['nennen; rufen','call v'], ['Name','name n']
  ]);
});

test('joins wrapped continuations to the preceding vocabulary row', () => {
  const words=[
    word('write',20,10,70,30), word('down',75,10,120,30), word('seine',470,10,520,30), word('Adresse',525,10,600,30),
    word('aufschreiben',470,42,580,62),
    word('spell,',20,80,75,100), word('spelt',80,80,125,100), word('buchstabieren',470,80,590,100),
    word('spelled',45,112,110,132), word('v',115,112,125,132)
  ];
  assert.deepEqual(parseVocabularyLayout({words},'en-de'), [
    ['seine Adresse aufschreiben','write down'], ['buchstabieren','spell, spelt spelled v']
  ]);
});

test('ignores noise and limits imports to thirty pairs', () => {
  const rows=Array.from({length:35},(_,i)=>`Deutsch ${i}  english-${i}`).join('\n');
  assert.equal(parseVocabularyPairs(`\n---\n${rows}`).length,30);
});

test('extracts every visible entry from the supplied textbook layout', () => {
  const left=['Hello. interj','call v','name n','first/last name','my name is ...','write, wrote, written v',"write down one's address",'','spell, spelt, spelt/spelled,','spelled USA v','live (in/with) v','number n','(tele)phone number','address n'];
  const right=['Hallo. / Guten Tag.','nennen; rufen','Name','Vor-/Nachname','ich heiße ...','schreiben','seine Adresse','aufschreiben','buchstabieren','','leben, wohnen (in/mit)','Zahl, Nummer','Telefonnummer','Adresse, Anschrift'];
  const ys=[10,45,80,115,150,185,220,265,297,335,370,405,440,475];
  const words=[];
  left.forEach((line,i)=>line.split(' ').forEach((text,j)=>words.push(word(text,20+j*72,ys[i],80+j*72,ys[i]+20))));
  right.forEach((line,i)=>line&&line.split(' ').forEach((text,j)=>words.push(word(text,470+j*72,ys[i],530+j*72,ys[i]+20))));
  const pairs=parseVocabularyLayout({words},'en-de');
  assert.equal(pairs.length,12);
  assert.deepEqual(pairs[0],['Hallo. / Guten Tag.','Hello. interj']);
  assert.deepEqual(pairs[6],['seine Adresse aufschreiben',"write down one's address"]);
  assert.deepEqual(pairs.at(-1),['Adresse, Anschrift','address n']);
});

test('supports German-left worksheets', () => {
  const words=[word('Hund',20,10,80,30),word('dog',470,10,510,30),word('Katze',20,45,80,65),word('cat',470,45,510,65)];
  assert.deepEqual(parseVocabularyLayout({words},'de-en'),[['Hund','dog'],['Katze','cat']]);
});

test('falls back to plain text when position data is unavailable', () => {
  assert.deepEqual(parseVocabularyLayout({text:'book  Buch\npen  Stift'},'en-de'),[['Buch','book'],['Stift','pen']]);
});

test('separates parts of speech, irregular forms and notes from learning words',async()=>{
 const {normalizeVocabularyPair,splitVocabularyEntry}=await import('../src/ocr.js');
 assert.deepEqual(splitVocabularyEntry('write, wrote, written v'),{word:'write',partOfSpeech:'v',forms:['wrote','written'],notes:'',original:'write, wrote, written v'});
 assert.deepEqual(normalizeVocabularyPair(['leben, wohnen','live (in/with) v']),{de:'leben, wohnen',en:'live',partOfSpeech:'v',forms:[],notes:'in/with',originalEn:'live (in/with) v'});
 assert.equal(normalizeVocabularyPair(['Hallo','Hello. interj'],false).en,'Hello. interj');
 assert.equal(normalizeVocabularyPair(['Hallo','Hello. interj'],true).en,'Hello');
 assert.deepEqual(splitVocabularyEntry('spell, spelt, spelt/spelled, spelled @sd v'),{word:'spell',partOfSpeech:'v',forms:['spelt','spelt/spelled','spelled'],notes:'',original:'spell, spelt, spelt/spelled, spelled @sd v'});
});

test('removes pronunciation from local OCR vocabulary before learning',async()=>{
 const {normalizeVocabularyPair,stripPronunciation}=await import('../src/ocr.js');
 assert.equal(stripPronunciation("sister ['sɪstə]"),'sister');
 assert.equal(stripPronunciation('an [ən]'),'an');
 assert.equal(stripPronunciation('word /wɜːd/'),'word');
 assert.equal(stripPronunciation('first/last name'),'first/last name');
 assert.equal(normalizeVocabularyPair(['Schwester',"sister ['sɪstə]"],false).en,'sister');
});
