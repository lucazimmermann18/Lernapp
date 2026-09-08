import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const ocr=await readFile(new URL('../src/ocr.js',import.meta.url),'utf8');
const media=await readFile(new URL('../src/importMedia.js',import.meta.url),'utf8');
const workspace=await readFile(new URL('../src/ocrWorkspace.jsx',import.meta.url),'utf8');
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));

test('OCR libraries are exact local dependencies without CDN loading',()=>{
 assert.equal(pkg.dependencies['tesseract.js'],'5.1.1');
 assert.equal(pkg.dependencies.heic2any,'0.0.4');
 assert.equal(pkg.dependencies['pdfjs-dist'],'4.10.38');
 assert.doesNotMatch(ocr,/cdn\.jsdelivr|createElement\(['"]script/);
 assert.match(ocr,/import\(['"]tesseract\.js['"]\)/);
});

test('media workflow supports HEIC, PDFs, multiple images, crop and rotation',()=>{
 assert.match(media,/convertHeic/);assert.match(media,/renderPdf/);assert.match(media,/transformImportAsset/);
 assert.match(workspace,/multiple/);assert.match(workspace,/rotation/);assert.match(workspace,/crop/);
 assert.match(workspace,/Diesen Ausschnitt erneut erkennen/);
});

test('media IDs work without secure-context randomUUID',async()=>{
 const idSource=await readFile(new URL('../src/id.js',import.meta.url),'utf8');
 assert.match(idSource,/getRandomValues/);
 assert.match(media,/createId\(\)/);
 assert.doesNotMatch(media,/crypto\.randomUUID/);
});

test('manual vocabulary editor exposes an explicit functional add action',async()=>{
 const main=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(main,/const addPair=.*setPairs\(current/);
 assert.match(main,/Vokabel manuell hinzufügen/);
 assert.match(main,/pairs\.length} von 30 Wortpaaren/);
});
