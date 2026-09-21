import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBusinessVocabularyCatalogRows} from '../src/businessVocabularyCatalog.js';
import {buildBusinessVocabularySeed} from '../scripts/generateBusinessVocabularySeed.mjs';

test('generated business vocabulary seed contains 1000 units with 20 adult learning terms each', async () => {
  const payload = buildBusinessVocabularySeed();
  assert.equal(payload.format, 'vokabelhero-business-vocabulary-v1');
  assert.equal(payload.units.length, 1000);
  assert.equal(payload.units.reduce((sum, unit) => sum + unit.terms.length, 0), 20000);
  assert.equal(new Set(payload.units.map(unit => unit.id)).size, 1000);
  for (const unit of payload.units) {
    assert.equal(unit.terms.length, 20);
    for (const term of unit.terms) {
      for (const field of ['english','german','simple','business','exampleEn','exampleDe','tags','reviewStatus']) {
        assert.ok(term[field]?.length || Array.isArray(term[field]), `${unit.id}/${term.id} misses ${field}`);
      }
    }
  }
});

test('supabase business vocabulary rows normalize to the app unit contract', async () => {
  const payload = buildBusinessVocabularySeed();
  const rows = payload.units.slice(0, 2).map(unit => ({
    id: unit.id,
    number: unit.number,
    level: unit.level,
    topic: unit.topic,
    title: unit.title,
    description: unit.description,
    terms: unit.terms
  }));
  const normalized = normalizeBusinessVocabularyCatalogRows(rows);
  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].source, 'supabase-catalog');
  assert.equal(normalized[0].terms.length, 20);
  assert.equal(normalized[0].terms[0].reviewStatus, 'new');
});
