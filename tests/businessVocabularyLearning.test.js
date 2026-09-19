import test from 'node:test';
import assert from 'node:assert/strict';
import {businessVocabularyUnits} from '../src/businessVocabulary.js';
import {
  BUSINESS_VOCABULARY_PROGRESS_ID,
  businessVocabularyProgressId,
  businessVocabularyUserKey,
  businessVocabularyLearningStats,
  emptyBusinessVocabularyProgress,
  getBusinessTermProgress,
  resetBusinessTermProgress,
  saveBusinessVocabularyStep
} from '../src/businessVocabularyLearning.js';

test('business vocabulary learning flow advances through all four adult learning steps', () => {
  const unit = businessVocabularyUnits[0];
  const term = unit.terms[0];
  const now = new Date('2026-09-19T10:00:00.000Z');
  let progress = emptyBusinessVocabularyProgress(now);

  progress = saveBusinessVocabularyStep(progress, unit.id, term.id, 'learn', {}, now);
  assert.equal(getBusinessTermProgress(progress, unit.id, term.id).status, 'learning');
  assert.equal(getBusinessTermProgress(progress, unit.id, term.id).step, 'context');

  progress = saveBusinessVocabularyStep(progress, unit.id, term.id, 'context', {}, now);
  assert.equal(getBusinessTermProgress(progress, unit.id, term.id).status, 'understood');
  assert.equal(getBusinessTermProgress(progress, unit.id, term.id).step, 'apply');

  progress = saveBusinessVocabularyStep(progress, unit.id, term.id, 'apply', { success: true }, now);
  const applied = getBusinessTermProgress(progress, unit.id, term.id);
  assert.equal(applied.status, 'review-due');
  assert.equal(applied.step, 'review');
  assert.equal(applied.attempts, 1);
  assert.equal(applied.correctApplications, 1);
  assert.match(applied.nextReviewAt, /^2026-09-20/);

  progress = saveBusinessVocabularyStep(progress, unit.id, term.id, 'review', { success: true }, now);
  const mastered = getBusinessTermProgress(progress, unit.id, term.id);
  assert.equal(mastered.status, 'mastered');
  assert.equal(mastered.reviewCount, 1);
  assert.match(mastered.nextReviewAt, /^2026-09-26/);
  assert.equal(businessVocabularyLearningStats(businessVocabularyUnits, progress).mastered, 1);
});

test('wrong active application keeps a term due for review and reset restores new status', () => {
  const unit = businessVocabularyUnits[1];
  const term = unit.terms[3];
  const userKey = businessVocabularyUserKey({ id: 'parent-42', email: 'parent@example.de' });
  let progress = emptyBusinessVocabularyProgress(new Date('2026-09-19T10:00:00.000Z'), userKey);
  progress = saveBusinessVocabularyStep(progress, unit.id, term.id, 'apply', { success: false }, new Date('2026-09-19T11:00:00.000Z'));
  const failed = getBusinessTermProgress(progress, unit.id, term.id);
  assert.equal(BUSINESS_VOCABULARY_PROGRESS_ID, 'business-vocabulary-progress');
  assert.equal(progress.id, businessVocabularyProgressId(userKey));
  assert.equal(progress.userKey, 'parent-42');
  assert.equal(failed.status, 'review-due');
  assert.equal(failed.step, 'apply');
  assert.equal(failed.attempts, 1);

  progress = resetBusinessTermProgress(progress, unit.id, term.id, new Date('2026-09-19T12:00:00.000Z'));
  const reset = getBusinessTermProgress(progress, unit.id, term.id);
  assert.equal(reset.status, 'new');
  assert.equal(reset.attempts, 0);
});
