import test from 'node:test';
import assert from 'node:assert/strict';
import {assertBusinessVocabularyPhaseOne, businessVocabularySummary, businessVocabularyUnits} from '../src/businessVocabulary.js';

test('phase 1 contains exactly 10 parent business vocabulary units with 20 terms each', () => {
  assert.doesNotThrow(() => assertBusinessVocabularyPhaseOne());
  assert.equal(businessVocabularyUnits.length, 10);
  assert.deepEqual(businessVocabularyUnits.map(unit => unit.terms.length), Array(10).fill(20));
  assert.deepEqual(businessVocabularySummary(), {units: 10, terms: 200, direction: 'de-en', levels: 10});
});

test('business vocabulary terms provide German-to-English learning fields', () => {
  const requiredFields = ['english', 'german', 'simple', 'business', 'exampleEn', 'exampleDe', 'tags', 'reviewStatus'];
  for (const unit of businessVocabularyUnits) {
    assert.match(unit.id, /^business-unit-\d{3}$/);
    assert.equal(typeof unit.description, 'string');
    assert.ok(unit.description.length > 10);
    for (const term of unit.terms) {
      for (const field of requiredFields) assert.ok(term[field], `${unit.id}/${term.id} misses ${field}`);
      assert.equal(term.reviewStatus, 'new');
      assert.ok(Array.isArray(term.tags));
      assert.ok(term.tags.length >= 2);
      assert.ok(term.english.length >= 2);
      assert.ok(term.german.length >= 2);
    }
  }
});
