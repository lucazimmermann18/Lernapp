export const BUSINESS_VOCABULARY_IMPORT_FORMAT = 'vokabelhero-business-vocabulary-v1';
export const BUSINESS_VOCABULARY_MAX_IMPORT_UNITS = 1000;
export const BUSINESS_VOCABULARY_TERMS_PER_UNIT = 20;

const requiredTermFields = ['english','german','simple','business','exampleEn','exampleDe','tags'];
const slug = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9äöüß]+/gi, '-').replace(/^-|-$/g, '');
const cleanTags = tags => [...new Set((Array.isArray(tags) ? tags : String(tags || '').split(',')).map(tag => String(tag).trim()).filter(Boolean))];

export function businessVocabularyImportTemplate() {
  return {
    format: BUSINESS_VOCABULARY_IMPORT_FORMAT,
    version: 1,
    description: 'Importformat für bis zu 1000 Business-English-Units. Jede Unit braucht genau 20 Begriffe.',
    units: [
      {
        id: 'import-unit-001',
        number: 1,
        level: 1,
        topic: 'Business Basics',
        title: 'Business Basics 1',
        description: 'Kurze Beschreibung der Unit.',
        terms: Array.from({ length: BUSINESS_VOCABULARY_TERMS_PER_UNIT }, (_, index) => ({
          id: `term-${String(index + 1).padStart(2, '0')}`,
          english: index === 0 ? 'company' : `word ${index + 1}`,
          german: index === 0 ? 'Unternehmen' : `Begriff ${index + 1}`,
          simple: 'Einfache Erklärung für erwachsene Lernende.',
          business: 'Business-Erklärung mit konkretem beruflichem Kontext.',
          exampleEn: 'The company is growing.',
          exampleDe: 'Das Unternehmen wächst.',
          tags: ['business', 'basics'],
          reviewStatus: 'new'
        }))
      }
    ]
  };
}

export function normalizeBusinessVocabularyImport(input, options = {}) {
  const payload = Array.isArray(input) ? { units: input } : input;
  if (!payload || typeof payload !== 'object') throw new Error('Die Importdatei muss ein JSON-Objekt oder eine Unit-Liste sein.');
  const units = payload.units;
  if (!Array.isArray(units)) throw new Error('Die Importdatei braucht ein Feld "units" mit einer Liste.');
  if (!units.length) throw new Error('Die Importdatei enthält keine Units.');
  if (units.length > BUSINESS_VOCABULARY_MAX_IMPORT_UNITS) throw new Error(`Maximal ${BUSINESS_VOCABULARY_MAX_IMPORT_UNITS} Units pro Import erlaubt.`);
  const seenUnitIds = new Set();
  const normalizedUnits = units.map((unit, unitIndex) => normalizeUnit(unit, unitIndex, seenUnitIds, options));
  return {
    format: BUSINESS_VOCABULARY_IMPORT_FORMAT,
    version: 1,
    importedAt: options.now?.toISOString?.() || new Date().toISOString(),
    units: normalizedUnits
  };
}

function normalizeUnit(unit, unitIndex, seenUnitIds, options) {
  if (!unit || typeof unit !== 'object') throw new Error(`Unit ${unitIndex + 1} ist ungültig.`);
  if (!Array.isArray(unit.terms)) throw new Error(`Unit ${unitIndex + 1} braucht eine terms-Liste.`);
  if (unit.terms.length !== BUSINESS_VOCABULARY_TERMS_PER_UNIT) throw new Error(`Unit ${unitIndex + 1} braucht genau ${BUSINESS_VOCABULARY_TERMS_PER_UNIT} Begriffe.`);
  const idBase = unit.id || `${options.prefix || 'import'}-${String(unitIndex + 1).padStart(4, '0')}-${unit.title || 'unit'}`;
  let id = slug(idBase) || `import-unit-${unitIndex + 1}`;
  while (seenUnitIds.has(id)) id = `${id}-${seenUnitIds.size + 1}`;
  seenUnitIds.add(id);
  const topic = String(unit.topic || unit.levelName || unit.category || 'Business English').trim();
  return {
    id,
    number: Number(unit.number) || unitIndex + 1,
    level: clampLevel(unit.level),
    topic,
    title: String(unit.title || `Business Unit ${unitIndex + 1}`).trim(),
    description: String(unit.description || `${topic} · 20 Business-Begriffe`).trim(),
    source: 'import',
    terms: unit.terms.map((term, termIndex) => normalizeTerm(term, termIndex, id, topic))
  };
}

function normalizeTerm(term, termIndex, unitId, topic) {
  if (!term || typeof term !== 'object') throw new Error(`${unitId}: Begriff ${termIndex + 1} ist ungültig.`);
  for (const field of requiredTermFields) {
    if (term[field] === undefined || term[field] === '') throw new Error(`${unitId}: Begriff ${termIndex + 1} braucht ${field}.`);
  }
  const english = String(term.english).trim();
  const german = String(term.german).trim();
  if (!english || !german) throw new Error(`${unitId}: Begriff ${termIndex + 1} braucht Deutsch und Englisch.`);
  const tags = cleanTags(term.tags);
  return {
    id: slug(term.id || english) || `term-${termIndex + 1}`,
    english,
    german,
    simple: String(term.simple).trim(),
    business: String(term.business).trim(),
    exampleEn: String(term.exampleEn).trim(),
    exampleDe: String(term.exampleDe).trim(),
    tags: tags.length ? tags : [topic],
    reviewStatus: term.reviewStatus || 'new'
  };
}

function clampLevel(value) {
  const level = Number(value);
  if (!Number.isFinite(level)) return 1;
  return Math.max(1, Math.min(1000, Math.round(level)));
}

export function mergeBusinessVocabularyUnits(seedUnits, importedUnits = []) {
  const byId = new Map();
  for (const unit of [...seedUnits, ...importedUnits]) byId.set(unit.id, unit);
  return [...byId.values()].sort((a, b) => (a.level - b.level) || (a.number - b.number) || a.title.localeCompare(b.title));
}

export function businessVocabularyTopics(units) {
  return [...new Set(units.flatMap(unit => [unit.topic || unit.levelName || unit.title, ...unit.terms.flatMap(term => term.tags || [])]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function filterBusinessVocabularyUnits(units, progressRecord, getProgress, filters = {}) {
  const search = String(filters.search || '').trim().toLowerCase();
  const level = String(filters.level || 'all');
  const topic = String(filters.topic || 'all');
  const status = String(filters.status || 'all');
  return units.map(unit => {
    const matchesLevel = level === 'all' || String(unit.level) === level;
    const matchesTopic = topic === 'all' || unit.topic === topic || unit.terms.some(term => (term.tags || []).includes(topic));
    const unitText = [unit.title, unit.description, unit.topic].join(' ').toLowerCase();
    const unitMatchesSearch = !search || unitText.includes(search);
    const terms = unit.terms.filter(term => {
      const progress = getProgress(progressRecord, unit.id, term.id);
      const termText = [term.english, term.german, term.simple, term.business, term.exampleEn, term.exampleDe, ...(term.tags || [])].join(' ').toLowerCase();
      const matchesSearch = unitMatchesSearch || !search || termText.includes(search);
      const matchesStatus = status === 'all' || progress.status === status;
      return matchesLevel && matchesTopic && matchesSearch && matchesStatus;
    });
    return { ...unit, terms };
  }).filter(unit => unit.terms.length);
}
