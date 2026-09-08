import React from 'react';
import {Flame,ShieldCheck} from 'lucide-react';

export function LearningStreak({data,childName}){
 return <section className="day-streak"><div className="day-streak-title"><span><Flame fill="#ff922f"/> <b>{data.streak} Lerntag{data.streak===1?'':'e'} in Folge</b></span>{data.protectionAvailable&&<small><ShieldCheck/> Ein Pausentag ist geschützt</small>}</div><p>{data.streak?`Stark, ${childName}! Jeder kleine Lerntag zählt.`:`Heute kannst du eine neue Lernserie starten, ${childName}.`}</p><div className="streak-week">{data.week.map(day=><div className={day.status} key={day.date}><i>{day.status==='learned'?'✓':day.status==='protected'?'🛡':day.status==='today'?'★':'○'}</i><span>{day.label}</span></div>)}</div>
 </section>;
}
