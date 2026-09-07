import test from 'node:test';
import assert from 'node:assert/strict';

const values=new Map();
global.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
const {cloudConfigured,getCloudUser,signIn,signOut}=await import('../src/cloud.js');

test('Supabase configuration is available',()=>assert.equal(cloudConfigured,true));

test('parent can sign in and session survives locally',async()=>{
 global.fetch=async(url,options)=>{assert.match(url,/grant_type=password/);assert.equal(JSON.parse(options.body).email,'mutter@example.de');return {ok:true,json:async()=>({access_token:'token',refresh_token:'refresh',expires_at:9999999999,user:{id:'family-1',email:'mutter@example.de'}})}};
 const user=await signIn('mutter@example.de','sicheres-passwort');
 assert.equal(user.id,'family-1');assert.equal(getCloudUser().email,'mutter@example.de');
});

test('sign out removes the parent session',()=>{signOut();assert.equal(getCloudUser(),null)});

test('invalid credentials show a safe message',async()=>{
 global.fetch=async()=>({ok:false,status:400});
 await assert.rejects(()=>signIn('wrong@example.de','wrong12'),/E-Mail oder Passwort/);
});
