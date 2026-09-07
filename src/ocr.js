const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TESSERACT_URL;
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('OCR konnte nicht geladen werden. Bitte Internetverbindung prüfen.'));
    document.head.appendChild(script);
  });
}

export function parseVocabularyPairs(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const columns = line.split(/\s{2,}|\t|[;|–—]/).map(value => value.trim()).filter(Boolean);
    return columns.length >= 2 ? [columns[0], columns.slice(1).join(' ')] : null;
  }).filter(Boolean).slice(0, 30);
}

export async function recognizeVocabulary(file, onProgress) {
  if (!file.type.startsWith('image/')) throw new Error('Bitte zunächst ein JPG- oder PNG-Bild verwenden.');
  const Tesseract = await loadTesseract();
  const result = await Tesseract.recognize(file, 'deu+eng', {
    logger: event => event.status === 'recognizing text' && onProgress(Math.round(event.progress * 100))
  });
  return parseVocabularyPairs(result.data.text);
}
