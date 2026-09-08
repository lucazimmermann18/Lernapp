import {getBackupData, mergeCloudData} from './storage.js';

const env = import.meta.env || {};
const url = (env.VITE_SUPABASE_URL || 'https://lmcaduueyjpgjipoodju.supabase.co').replace(/\/$/, '');
const anonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY2FkdXVleWpwZ2ppcG9vZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTQ0NzgsImV4cCI6MjEwNDM3MDQ3OH0.scspT4gEaRJRBwmIUQXN62j5XsNpL4zLNQsiv-u3Hbs';
const SESSION_KEY = 'vokabelhero-supabase-session';
const TABLES = ['units','attempts','rewards','settings','achievements'];
const listeners = new Set();
let syncStatus = {state:'idle',message:'Lokal gespeichert',lastSyncedAt:null};

export const cloudConfigured = Boolean(url && anonKey);
const headers = (token, extra={}) => ({apikey:anonKey,Authorization:`Bearer ${token||anonKey}`,'Content-Type':'application/json',...extra});
const readSession = () => { try{return JSON.parse(localStorage.getItem(SESSION_KEY))}catch{return null} };
const saveSession = value => { if(value)localStorage.setItem(SESSION_KEY,JSON.stringify(value));else localStorage.removeItem(SESSION_KEY) };

export function getCloudUser(){ return readSession()?.user || null; }
export function getCloudStatus(){ return syncStatus; }
export function subscribeCloudStatus(listener){ listeners.add(listener);listener(syncStatus);return()=>listeners.delete(listener); }
const publish = status => {syncStatus={...syncStatus,...status};listeners.forEach(listener=>listener(syncStatus));};
export function markCloudPending(){ publish({state:'pending',message:'Lokale Änderungen noch nicht hochgeladen'}); }

export async function signIn(email,password){
 const response=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:headers(),body:JSON.stringify({email,password})});
 if(!response.ok)throw new Error('E-Mail oder Passwort ist nicht richtig.');
 const session=await response.json();saveSession(session);return session.user;
}

export function signOut(){ saveSession(null);publish({state:'idle',message:'Lokal gespeichert',lastSyncedAt:null}); }

async function session(){
 if(!cloudConfigured)throw new Error('Supabase ist nicht konfiguriert.');
 const current=readSession();if(!current)throw new Error('Bitte zuerst im Elternbereich anmelden.');
 if(current.access_token&&current.expires_at*1000>Date.now()+60000)return current;
 const response=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:current.refresh_token})});
 if(!response.ok){saveSession(null);throw new Error('Die Anmeldung ist abgelaufen. Bitte erneut anmelden.');}
 const refreshed=await response.json();saveSession(refreshed);return refreshed;
}

export async function getAccessToken(){ return (await session()).access_token; }

const timestamp = row => new Date(row.updated_at || 0).getTime();
export function chooseNewestRows(localRows,remoteRows){
 const rows=new Map(remoteRows.map(row=>[row.id,row]));
 for(const local of localRows){const remote=rows.get(local.id);if(!remote||timestamp(local)>=timestamp(remote))rows.set(local.id,local)}
 return [...rows.values()];
}

async function syncWithoutRpc(auth,payload){
 const merged={};
 for(const table of TABLES){
  const read=await fetch(`${url}/rest/v1/${table}?user_id=eq.${auth.user.id}&select=id,data,updated_at`,{headers:headers(auth.access_token)});
  if(!read.ok)throw new Error(`Cloud-Tabelle „${table}“ ist nicht verfügbar (${read.status}). Bitte Migration 002 ausführen.`);
  const remote=await read.json(),local=payload[table]||[],remoteById=new Map(remote.map(row=>[row.id,row]));
  const changed=local.filter(row=>!remoteById.has(row.id)||timestamp(row)>=timestamp(remoteById.get(row.id))).map(row=>({...row,user_id:auth.user.id}));
  if(changed.length){const write=await fetch(`${url}/rest/v1/${table}?on_conflict=user_id,id`,{method:'POST',headers:headers(auth.access_token,{Prefer:'resolution=merge-duplicates'}),body:JSON.stringify(changed)});if(!write.ok)throw new Error(`Cloud-Abgleich für „${table}“ ist fehlgeschlagen (${write.status}).`)}
  merged[table]=chooseNewestRows(local,remote).map(({id,data,updated_at})=>({id,data,updated_at}));
 }
 return merged;
}

export async function syncCloudData(){
 publish({state:'syncing',message:'Wird synchronisiert …'});
 try{
  if(typeof navigator!=='undefined'&&!navigator.onLine)throw new Error('Offline – lokal gespeichert');
  const auth=await session(),backup=await getBackupData();
  const payload={};
  for(const table of TABLES)payload[table]=(backup[table]||[]).map(item=>({id:item.id,data:item,updated_at:item.updatedAt||item.createdAt||'1970-01-01T00:00:00.000Z'}));
  const response=await fetch(`${url}/rest/v1/rpc/sync_app_data`,{method:'POST',headers:headers(auth.access_token),body:JSON.stringify({p_payload:payload})});
  if(!response.ok&&response.status!==404)throw new Error(`Cloud-Synchronisierung fehlgeschlagen (${response.status}).`);
  const compatibilityMode=response.status===404;
  const cloudData=compatibilityMode?await syncWithoutRpc(auth,payload):await response.json();
  const merged=await mergeCloudData(cloudData);
  const time=new Date().toISOString();publish({state:'synced',message:compatibilityMode?'Alles gespeichert · Kompatibilitätsmodus':'Alles gespeichert',lastSyncedAt:time});return {...merged,exportedAt:time,compatibilityMode};
 }catch(error){publish({state:error.message.startsWith('Offline')?'offline':'error',message:error.message});throw error;}
}

// Kept as compatible UI names: both actions now perform a safe two-way merge.
export async function uploadCloudBackup(){ return (await syncCloudData()).exportedAt; }
export async function downloadCloudBackup(){ return (await syncCloudData()).exportedAt; }
