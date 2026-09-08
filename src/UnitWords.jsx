import React,{useMemo,useState} from 'react';
import {ArrowLeft,BookOpen,Eye,EyeOff,Play,Search,Volume2} from 'lucide-react';
import {getPlayablePairs} from './gameData.js';

export function speakEnglish(text){
 if(localStorage.getItem('vokabelhero-sound')==='off')return false;
 if(typeof speechSynthesis==='undefined'||typeof SpeechSynthesisUtterance==='undefined')return false;
 speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=.85;speechSynthesis.speak(utterance);return true;
}

export function UnitWords({unit,onBack,onPractice}){
 const [query,setQuery]=useState(''),[hidden,setHidden]=useState(false);
 const pairs=getPlayablePairs(unit);
 const entries=new Map((unit.entries||[]).map(entry=>[`${entry.de}|${entry.en}`,entry]));
 const filtered=useMemo(()=>{const needle=query.trim().toLocaleLowerCase();return needle?pairs.filter(pair=>pair.some(value=>value.toLocaleLowerCase().includes(needle))):pairs},[pairs,query]);
 return <><header className="word-list-header"><button onClick={onBack}><ArrowLeft/></button><div><small>VOKABELÜBERSICHT</small><b>{unit.name}</b></div><button className="practice-words" onClick={onPractice}><Play/> Stufe 1 starten</button></header><main className="word-list-page"><section className="word-list-hero"><div className="word-list-icon">{unit.icon||'📘'}</div><div><h1>Vokabeln dieser Unit</h1><p>{pairs.length} Wortpaare zum Anschauen, Vorlesen und Abfragen.</p></div></section><div className="word-list-tools"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Deutsch oder Englisch suchen …"/></label><button className={hidden?'active':''} onClick={()=>setHidden(value=>!value)}>{hidden?<Eye/>:<EyeOff/>}{hidden?'Englisch anzeigen':'Englisch abdecken'}</button></div><div className="word-table"><div className="word-table-head"><span>#</span><b>🇩🇪 Deutsch</b><b>🇬🇧 Englisch</b><span/></div>{filtered.map(([de,en],index)=>{const details=entries.get(`${de}|${en}`);return <article key={`${de}-${en}-${index}`}><span className="word-number">{index+1}</span><div><b>{de}</b></div><div className={hidden?'covered':''}><b>{en}</b>{details&&(details.partOfSpeech||details.forms?.length||details.notes)&&<small>{details.partOfSpeech&&`Wortart: ${details.partOfSpeech}`}{details.forms?.length?` · Formen: ${details.forms.join(', ')}`:''}{details.notes?` · ${details.notes}`:''}</small>}</div><button onClick={()=>speakEnglish(en)} aria-label={`${en} vorlesen`}><Volume2/></button></article>})}{!filtered.length&&<div className="no-words"><BookOpen/><b>Keine passende Vokabel gefunden</b><span>Versuche einen anderen Suchbegriff.</span></div>}</div><button className="mobile-practice" onClick={onPractice}><Play/> Mit Stufe 1 üben</button></main></>;
}
