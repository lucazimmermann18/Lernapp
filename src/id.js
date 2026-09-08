/**
 * Creates collision-resistant local record IDs on HTTPS and HTTP deployments.
 * randomUUID is restricted to secure contexts in some browsers, while
 * getRandomValues is more widely available. The final fallback is only used
 * by very old browsers and combines time, randomness and a monotonic counter.
 */
let fallbackCounter=0;

export function createId(prefix='vh'){
 const cryptoApi=globalThis.crypto;
 if(typeof cryptoApi?.randomUUID==='function')return cryptoApi.randomUUID();
 if(typeof cryptoApi?.getRandomValues==='function'){
  const bytes=new Uint8Array(16);cryptoApi.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0'));
  return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10).join('')}`;
 }
 fallbackCounter=(fallbackCounter+1)%Number.MAX_SAFE_INTEGER;
 return `${prefix}-${Date.now().toString(36)}-${fallbackCounter.toString(36)}-${Math.random().toString(36).slice(2,12)}`;
}
