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
