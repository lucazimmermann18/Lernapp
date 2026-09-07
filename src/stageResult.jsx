import React from 'react';
import {ArrowLeft,ChevronRight,Flame,RefreshCw,Star,Trophy} from 'lucide-react';
import {scoreStage} from './learning.js';

function ResultStars({count}){
 return <div className="result-stars" aria-label={`${count} von 3 Sternen`}>{[0,1,2].map(index=><Star key={index} className={index<count?'earned':''} fill={index<count?'#ffc43d':'transparent'}/>)}</div>;
}

export function StageResult({unit,level,levelInfo,results,maxStreak=0,onUnit,onRepeat,onNext}){
 const assessment=scoreStage(results);
 const hits=results.filter(result=>result.firstTry).length;
 const difficult=results.filter(result=>!result.firstTry);
 const germanByEnglish=new Map((unit.pairs||[]).map(([de,en])=>[en.trim().toLowerCase(),de]));
 return <main className={`stage-result ${assessment.passed?'passed':'retry'}`} style={{'--result-color':levelInfo[3]}}>
  {assessment.passed&&<div className="confetti" aria-hidden="true">{Array.from({length:24},(_,index)=><i key={index} style={{'--i':index}}/>)}</div>}
  <button className="result-back" onClick={onUnit}><ArrowLeft/> Zur Unit</button>
  <section className="result-card">
   <div className="result-trophy">{assessment.passed?<Trophy/>:'💪'}</div>
   <div className="result-kicker">STUFE {level+1} · {levelInfo[1].toUpperCase()}</div>
   <h1>{assessment.passed?'Großartig gemacht!':'Das wird schon!'}</h1>
   <p>{assessment.passed?'Du hast die Stufe geschafft und kannst weitermachen.':'Übe die schwierigen Wörter noch einmal – du schaffst das!'}</p>
   <ResultStars count={assessment.stars}/>
   <strong className="result-score">{assessment.score}<small>%</small></strong>
   <span className="pass-note">{assessment.passed?'Bestanden – mindestens 70 % erreicht':'Noch nicht bestanden – 70 % werden benötigt'}</span>
   <div className="result-facts"><div><b>{hits} / {results.length}</b><span>beim ersten Versuch</span></div><div><b><Flame/> {maxStreak}</b><span>beste Serie</span></div><div><b>{difficult.length}</b><span>Wörter zum Üben</span></div></div>
   <section className="difficult-result"><h2>{difficult.length?'Diese Wörter festigen':'Alles auf Anhieb gewusst! 🎉'}</h2>{difficult.length>0&&<div>{difficult.map(result=><span key={result.word}><b>{result.word}</b><small>{germanByEnglish.get(result.word)||''}</small></span>)}</div>}</section>
   <div className="result-actions"><button className="repeat-stage" onClick={onRepeat}><RefreshCw/> Stufe wiederholen</button>{assessment.passed&&onNext?<button className="next-stage" onClick={onNext}>Nächste Stufe <ChevronRight/></button>:<button className="next-stage" onClick={onUnit}>Zur Stufenübersicht <ChevronRight/></button>}</div>
  </section>
 </main>;
}
