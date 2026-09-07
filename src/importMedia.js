import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const IMAGE_TYPES=new Set(['image/jpeg','image/png','image/webp']);
const HEIC_TYPES=new Set(['image/heic','image/heif']);

const canvasBlob=(canvas,type='image/jpeg',quality=.94)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Bild konnte nicht verarbeitet werden.')),type,quality));

async function convertHeic(file){
 const module=await import('heic2any');
 const result=await (module.default||module)({blob:file,toType:'image/jpeg',quality:.94});
 return Array.isArray(result)?result[0]:result;
}

async function renderPdf(file){
 const pdfjs=await import('pdfjs-dist');
 pdfjs.GlobalWorkerOptions.workerSrc=pdfWorkerUrl;
 const document=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
 const pages=[];
 for(let pageNumber=1;pageNumber<=document.numPages;pageNumber++){
  const page=await document.getPage(pageNumber);const viewport=page.getViewport({scale:2});
  const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;
  await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
  pages.push({blob:await canvasBlob(canvas),label:`${file.name} · Seite ${pageNumber}`,source:'pdf',page:pageNumber});
 }
 return pages;
}

export async function prepareImportFiles(files){
 if(!files.length)return [];
 if(files.length>12)throw new Error('Bitte höchstens 12 Dateien gleichzeitig auswählen.');
 const assets=[];
 for(const file of files){
  if(file.type==='application/pdf')assets.push(...await renderPdf(file));
  else if(HEIC_TYPES.has(file.type)||/\.hei[cf]$/i.test(file.name))assets.push({blob:await convertHeic(file),label:`${file.name} · konvertiert`,source:'heic'});
  else if(IMAGE_TYPES.has(file.type))assets.push({blob:file,label:file.name,source:'image'});
  else throw new Error(`„${file.name}“ wird nicht unterstützt.`);
 }
 return assets.map(asset=>({...asset,id:crypto.randomUUID(),enabled:true,rotation:0,crop:{top:0,right:0,bottom:0,left:0}}));
}

export async function transformImportAsset(asset){
 const bitmap=await createImageBitmap(asset.blob);const quarterTurns=((asset.rotation%360)+360)%360/90;
 const rotated=document.createElement('canvas');rotated.width=quarterTurns%2?bitmap.height:bitmap.width;rotated.height=quarterTurns%2?bitmap.width:bitmap.height;
 const context=rotated.getContext('2d');context.translate(rotated.width/2,rotated.height/2);context.rotate(asset.rotation*Math.PI/180);context.drawImage(bitmap,-bitmap.width/2,-bitmap.height/2);bitmap.close();
 const {top,right,bottom,left}=asset.crop;const sx=rotated.width*left/100,sy=rotated.height*top/100,sw=rotated.width*(100-left-right)/100,sh=rotated.height*(100-top-bottom)/100;
 if(sw<40||sh<40)throw new Error('Der gewählte Bildausschnitt ist zu klein.');
 const output=document.createElement('canvas');output.width=Math.round(sw);output.height=Math.round(sh);output.getContext('2d').drawImage(rotated,sx,sy,sw,sh,0,0,output.width,output.height);
 return canvasBlob(output);
}
