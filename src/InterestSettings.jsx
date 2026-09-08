import React,{useEffect,useState} from 'react';
import {Check,Gamepad2} from 'lucide-react';
import {normalizeInterest} from './story.js';

export function InterestSettings({interest,onSave}){
 const [draft,setDraft]=useState(interest||''),[message,setMessage]=useState('');
 useEffect(()=>setDraft(interest||''),[interest]);
 const submit=async event=>{event.preventDefault();const value=normalizeInterest(draft);await onSave(value);setDraft(value);setMessage(value?`Gespeichert – neue Geschichten spielen in der Welt von „${value}“.`:'Gespeichert – Geschichten verwenden ein neutrales Abenteuer-Thema.')};
 return <form className="interest-card" onSubmit={submit}><Gamepad2/><div><label htmlFor="child-interest">Lieblingsthema für Geschichten</label><small>Zum Beispiel Fortnite, Pferde, Fußball, Weltraum oder Detektive.</small></div><input id="child-interest" value={draft} onChange={event=>{setDraft(event.target.value);setMessage('')}} maxLength="60" placeholder="z. B. Fortnite"/><button><Check/> Thema speichern</button>{message&&<p role="status">{message}</p>}</form>;
}
