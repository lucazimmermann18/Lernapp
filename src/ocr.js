let tesseractPromise;

function loadTesseract() {
  tesseractPromise ||= import('tesseract.js').then(module => module.default || module);
  return tesseractPromise;
}

const clean = value => value
  .replace(/\s+/g, ' ')
  .replace(/^[|:;,.\s]+|[|\s]+$/g, '')
  .trim();

const PARTS_OF_SPEECH = new Set(['v','n','adj','adv','prep','pron','conj','det','interj','pl']);

export function splitVocabularyEntry(value) {
  let source=clean(value);let partOfSpeech='';let notes='';let forms=[];
  const partMatch=source.match(/\b(v|n|adj|adv|prep|pron|conj|det|interj|pl)\.?$/i);
  if(partMatch&&PARTS_OF_SPEECH.has(partMatch[1].toLowerCase())){partOfSpeech=partMatch[1].toLowerCase();source=source.slice(0,partMatch.index).trim()}
  const noteMatches=[...source.matchAll(/\(([^)]+)\)/g)];
  if(noteMatches.length){notes=noteMatches.map(match=>match[1].trim()).join('; ');source=source.replace(/\s*\([^)]+\)/g,'').trim()}
  const pieces=source.split(',').map(item=>item.trim()).filter(Boolean);
  if(pieces.length>1){forms=pieces.slice(1);source=pieces[0]}
  return {word:source.replace(/[.;:]$/,'').trim(),partOfSpeech,forms,notes,original:value};
}

export function normalizeVocabularyPair([de,en],removeAnnotations=true){
  const english=splitVocabularyEntry(en);
  return {de:clean(de),en:removeAnnotations?english.word:clean(en),partOfSpeech:english.partOfSpeech,forms:english.forms,notes:english.notes,originalEn:clean(en)};
}

export function parseVocabularyPairs(text, order = 'de-en') {
  const pairs = text.split(/\r?\n/).map(line => {
    const columns = line.trim().split(/\s{2,}|\t|[|–—]/).map(clean).filter(Boolean);
    return columns.length >= 2 ? [columns[0], columns.slice(1).join(' ')] : null;
  }).filter(Boolean);
  return (order === 'en-de' ? pairs.map(([en, de]) => [de, en]) : pairs).slice(0, 30);
}

function flattenWords(data) {
  if (Array.isArray(data.words) && data.words.length) return data.words;
  const words = [];
  for (const block of data.blocks || [])
    for (const paragraph of block.paragraphs || [])
      for (const line of paragraph.lines || [])
        for (const word of line.words || []) words.push(word);
  return words;
}

// Uses the position of every recognized word instead of relying on spaces in
// Tesseract's plain text. This preserves textbook columns and wrapped entries.
export function parseVocabularyLayout(data, order = 'en-de') {
  const words = flattenWords(data).filter(word => clean(word.text || '') && word.bbox);
  if (!words.length) return parseVocabularyPairs(data.text || '', order);
  const minX = Math.min(...words.map(word => word.bbox.x0));
  const maxX = Math.max(...words.map(word => word.bbox.x1));
  const divider = minX + (maxX - minX) * 0.51;
  const medianHeight = [...words].map(word => word.bbox.y1 - word.bbox.y0).sort((a,b) => a-b)[Math.floor(words.length/2)] || 20;
  const rows = [];
  for (const word of [...words].sort((a,b) => ((a.bbox.y0+a.bbox.y1)-(b.bbox.y0+b.bbox.y1)) || a.bbox.x0-b.bbox.x0)) {
    const y = (word.bbox.y0 + word.bbox.y1) / 2;
    let row = rows.find(item => Math.abs(item.y - y) <= medianHeight * 0.62);
    if (!row) { row = {y, left: [], right: []}; rows.push(row); }
    row[word.bbox.x0 < divider ? 'left' : 'right'].push(word);
  }
  rows.sort((a,b) => a.y-b.y);
  const raw = [];
  for (const row of rows) {
    const left = clean(row.left.sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' '));
    const right = clean(row.right.sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' '));
    if (left && right) raw.push([left, right]);
    else if (raw.length && left) raw.at(-1)[0] = clean(`${raw.at(-1)[0]} ${left}`);
    else if (raw.length && right) raw.at(-1)[1] = clean(`${raw.at(-1)[1]} ${right}`);
  }
  const pairs = raw.filter(([left,right]) => left && right);
  return (order === 'en-de' ? pairs.map(([en,de]) => [de,en]) : pairs).slice(0,30);
}

async function enhanceImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(1.5, Math.min(3, 1800 / bitmap.width));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d', {willReadFrequently: true});
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i=0;i<image.data.length;i+=4) {
    const gray=image.data[i]*.299+image.data[i+1]*.587+image.data[i+2]*.114;
    const contrast=Math.max(0,Math.min(255,(gray-128)*1.45+128));
    image.data[i]=image.data[i+1]=image.data[i+2]=contrast;
  }
  context.putImageData(image,0,0);
  bitmap.close();
  return canvas;
}

export async function recognizeVocabulary(file, onProgress, order = 'en-de') {
  if (!file.type.startsWith('image/')) throw new Error('Bitte ein vorbereitetes Bild verwenden.');
  const [Tesseract, image] = await Promise.all([loadTesseract(), enhanceImage(file)]);
  const result = await Tesseract.recognize(image, 'eng+deu', {
    logger: event => event.status === 'recognizing text' && onProgress(Math.round(event.progress * 100))
  }, {blocks: true, text: true});
  return parseVocabularyLayout(result.data, order);
}
