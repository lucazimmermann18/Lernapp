import React,{useMemo,useState} from 'react';
import {ArrowLeft,Check,RefreshCw,Sparkles} from 'lucide-react';
import {splitStoryText} from './story.js';

const shuffled=value=>[...value].sort(()=>Math.random()-.5);

export function StoryChallenge({unit,story,onBack,onComplete,onRegenerate}){
 const [answers,setAnswers]=useState({}),[selected,setSelected]=useState(null),[checked,setChecked]=useState(false);
 const blanks=new Map(story.blanks.map(blank=>[blank.id,blank.word])),parts=splitStoryText(story.text);
 const words=useMemo(()=>shuffled(story.blanks.map((blank,index)=>({tokenId:`${blank.id}-${index}`,word:blank.word}))),[story]);
 const tokens=new Map(words.map(token=>[token.tokenId,token])),used=new Set(Object.values(answers));
 const place=(id,tokenId)=>{if(!tokenId||checked)return;setAnswers(current=>{const next={...current};for(const key of Object.keys(next))if(next[key]===tokenId)delete next[key];next[id]=tokenId;return next});setSelected(null)};
 const correct=story.blanks.filter(blank=>tokens.get(answers[blank.id])?.word===blank.word).length;
 const complete=Object.keys(answers).length===story.blanks.length,passed=checked&&correct===story.blanks.length;
 const verify=()=>{if(!complete)return;setChecked(true);if(correct===story.blanks.length)onComplete?.({correct,total:story.blanks.length})};
 const reset=()=>{setAnswers({});setChecked(false);setSelected(null)};
 return <main className="story-page">
  <header className="story-header"><button onClick={onBack}><ArrowLeft/> Zur Unit</button><div><Sparkles/><b>KI-Lückengeschichte</b></div><button onClick={onRegenerate}><RefreshCw/> Neue Geschichte</button></header>
  <section className="story-card"><div className="story-kicker">DEIN ENGLISCH-ABENTEUER · {unit.name.toLocaleUpperCase()}</div><h1>{story.title}</h1><p className="story-help">Lies die Geschichte aufmerksam: Der Zusammenhang verrät dir, welches englische Wort passt. Ziehe es in die Lücke – auf dem Handy kannst du Wort und Lücke nacheinander antippen.</p>
   <article className="story-text">{parts.map((part,index)=>part.type==='text'?<React.Fragment key={index}>{part.value}</React.Fragment>:<button key={`${part.id}-${index}`} className={'story-blank '+(checked?(tokens.get(answers[part.id])?.word===blanks.get(part.id)?'right':'wrong'):'')} onClick={()=>selected&&place(part.id,selected)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();place(part.id,event.dataTransfer.getData('text/plain'))}}>{tokens.get(answers[part.id])?.word||'________'}</button>)}</article>
   <div className="story-bank"><h2>Deine Wörter</h2><div>{words.map(token=><button draggable={!used.has(token.tokenId)} disabled={used.has(token.tokenId)||checked} className={selected===token.tokenId?'selected':''} onClick={()=>setSelected(current=>current===token.tokenId?null:token.tokenId)} onDragStart={event=>event.dataTransfer.setData('text/plain',token.tokenId)} key={token.tokenId}>{token.word}</button>)}</div></div>
   {checked&&<div className={'story-result '+(passed?'passed':'retry')}>{passed?<>🎉 <b>Perfekt!</b> Alle Wörter sind an der richtigen Stelle.</>:<>💡 <b>{correct} von {story.blanks.length} richtig.</b> Die roten Lücken darfst du noch einmal versuchen.</>}</div>}
   <div className="story-actions">{checked&&!passed&&<button onClick={reset}><RefreshCw/> Noch einmal versuchen</button>}<button className="story-check" disabled={!complete||passed} onClick={verify}><Check/> Geschichte prüfen</button></div>
  </section>
 </main>;
}
