import test from 'node:test';
import assert from 'node:assert/strict';
import {createId} from '../src/id.js';

test('creates IDs when randomUUID is unavailable on an HTTP origin',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:{getRandomValues(bytes){for(let index=0;index<bytes.length;index++)bytes[index]=index+1;return bytes}}});
 try{const id=createId();assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)}finally{if(descriptor)Object.defineProperty(globalThis,'crypto',descriptor);else delete globalThis.crypto}
});

test('has a final legacy-browser fallback without Web Crypto',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:undefined});
 try{assert.match(createId('test'),/^test-/)}finally{if(descriptor)Object.defineProperty(globalThis,'crypto',descriptor);else delete globalThis.crypto}
});
