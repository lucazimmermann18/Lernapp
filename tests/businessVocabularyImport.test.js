import test from 'node:test';
import assert from 'node:assert/strict';
import {businessVocabularyUnits} from '../src/businessVocabulary.js';
import {getBusinessTermProgress, saveBusinessVocabularyStep, emptyBusinessVocabularyProgress} from '../src/businessVocabularyLearning.js';
import {
  BUSINESS_VOCABULARY_TERMS_PER_UNIT,
  businessVocabularyImportTemplate,
  filterBusinessVocabularyUnits,
  mergeBusinessVocabularyUnits,
  normalizeBusinessVocabularyImport
} from '../src/businessVocabularyImport.js';

const term = index => ({
  id: `term-${index}`,
  english: `business word ${index}`,
  german: `Geschäftsbegriff ${index}`,
  simple: `Einfache Erklärung ${index}`,
  business: `Business-Kontext ${index}`,
  exampleEn: `We use business word ${index}.`,
  exampleDe: `Wir nutzen Geschäftsbegriff ${index}.`,
  tags: ['import', index % 2 ? 'finance' : 'marketing'],
  reviewStatus: 'new'
});

const unit = index => ({
  id: `import-unit-${index}`,
  number: index,
  level: index,
  topic: index % 2 ? 'Finance' : 'Marketing',
  title: `Import Unit ${index}`,
  description: `Importierte Unit ${index}`,
  terms: Array.from({ length: BUSINESS_VOCABULARY_TERMS_PER_UNIT }, (_, termIndex) => term(termIndex + 1))
});

test('business vocabulary import template follows the scalable JSON contract', () => {
  const normalized = normalizeBusinessVocabularyImport(businessVocabularyImportTemplate(), { now: new Date('2026-09-19T10:00:00.000Z') });
  assert.equal(normalized.units.length, 1);
  assert.equal(normalized.units[0].terms.length, 20);
  assert.equal(normalized.units[0].terms[0].english, 'company');
});

test('business vocabulary import accepts up to 1000 units with 20 terms each', () => {
  const normalized = normalizeBusinessVocabularyImport({ units: Array.from({ length: 1000 }, (_, index) => unit(index + 1)) }, { now: new Date('2026-09-19T10:00:00.000Z') });
  assert.equal(normalized.units.length, 1000);
  assert.equal(normalized.units.reduce((sum, item) => sum + item.terms.length, 0), 20000);
});

test('business vocabulary import rejects oversized files and incomplete units', () => {
  assert.throws(() => normalizeBusinessVocabularyImport({ units: Array.from({ length: 1001 }, (_, index) => unit(index + 1)) }), /Maximal 1000 Units/);
  assert.throws(() => normalizeBusinessVocabularyImport({ units: [{ ...unit(1), terms: [term(1)] }] }), /genau 20 Begriffe/);
});

test('business vocabulary search and filters combine level, topic and learning status', () => {
  const imported = normalizeBusinessVocabularyImport({ units: [unit(11), { ...unit(12), topic: 'Negotiation', level: 12 }] }).units;
  const allUnits = mergeBusinessVocabularyUnits(businessVocabularyUnits, imported);
  let progress = emptyBusinessVocabularyProgress(new Date('2026-09-19T10:00:00.000Z'), 'parent-a');
  progress = saveBusinessVocabularyStep(progress, imported[0].id, imported[0].terms[0].id, 'review', { success: true }, new Date('2026-09-19T10:00:00.000Z'));

  const byLevel = filterBusinessVocabularyUnits(allUnits, progress, getBusinessTermProgress, { level: '12' });
  assert.deepEqual(byLevel.map(item => item.id), [imported[1].id]);

  const byTopic = filterBusinessVocabularyUnits(allUnits, progress, getBusinessTermProgress, { topic: 'Finance' });
  assert.ok(byTopic.every(item => item.topic === 'Finance' || item.terms.some(itemTerm => itemTerm.tags.includes('Finance'))));

  const mastered = filterBusinessVocabularyUnits(allUnits, progress, getBusinessTermProgress, { status: 'mastered' });
  assert.equal(mastered.length, 1);
  assert.equal(mastered[0].terms.length, 1);
  assert.equal(mastered[0].terms[0].id, imported[0].terms[0].id);

  const searched = filterBusinessVocabularyUnits(allUnits, progress, getBusinessTermProgress, { search: 'business word 7', topic: 'Negotiation' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, imported[1].id);
  assert.equal(searched[0].terms[0].english, 'business word 7');
});
