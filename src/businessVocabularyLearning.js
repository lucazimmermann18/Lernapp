export const BUSINESS_VOCABULARY_PROGRESS_ID = 'business-vocabulary-progress';
export const BUSINESS_VOCABULARY_STEPS = [
  { id: 'learn', label: 'Wort lernen', status: 'learning' },
  { id: 'context', label: 'Kontext verstehen', status: 'understood' },
  { id: 'apply', label: 'Aktiv anwenden', status: 'applied' },
  { id: 'review', label: 'Wiederholen', status: 'mastered' }
];

const DAY = 24 * 60 * 60 * 1000;
const VALID_STATUSES = new Set(['new', 'learning', 'understood', 'applied', 'review-due', 'mastered']);

export function businessTermKey(unitId, termId) {
  return `${unitId}:${termId}`;
}

export function emptyBusinessVocabularyProgress(now = new Date()) {
  return {
    id: BUSINESS_VOCABULARY_PROGRESS_ID,
    value: { terms: {} },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function normalizeBusinessVocabularyProgress(record, now = new Date()) {
  const base = record && typeof record === 'object' ? record : emptyBusinessVocabularyProgress(now);
  const value = base.value && typeof base.value === 'object' ? base.value : {};
  const terms = value.terms && typeof value.terms === 'object' ? value.terms : {};
  const normalizedTerms = Object.fromEntries(Object.entries(terms).map(([key, progress]) => [key, normalizeTermProgress(progress, now)]));
  return {
    ...base,
    id: BUSINESS_VOCABULARY_PROGRESS_ID,
    value: { ...value, terms: normalizedTerms },
    updatedAt: base.updatedAt || now.toISOString(),
    createdAt: base.createdAt || base.updatedAt || now.toISOString()
  };
}

export function defaultTermProgress(unitId, termId, now = new Date()) {
  return {
    unitId,
    termId,
    status: 'new',
    step: 'learn',
    completedSteps: [],
    attempts: 0,
    correctApplications: 0,
    reviewCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    masteredAt: null,
    updatedAt: now.toISOString()
  };
}

function normalizeTermProgress(progress = {}, now = new Date()) {
  const safe = progress && typeof progress === 'object' ? progress : {};
  const step = BUSINESS_VOCABULARY_STEPS.some(item => item.id === safe.step) ? safe.step : 'learn';
  const status = VALID_STATUSES.has(safe.status) ? safe.status : 'new';
  return {
    unitId: safe.unitId || '',
    termId: safe.termId || '',
    status,
    step,
    completedSteps: Array.isArray(safe.completedSteps) ? [...new Set(safe.completedSteps.filter(id => BUSINESS_VOCABULARY_STEPS.some(stepItem => stepItem.id === id)))] : [],
    attempts: Number.isFinite(Number(safe.attempts)) ? Number(safe.attempts) : 0,
    correctApplications: Number.isFinite(Number(safe.correctApplications)) ? Number(safe.correctApplications) : 0,
    reviewCount: Number.isFinite(Number(safe.reviewCount)) ? Number(safe.reviewCount) : 0,
    lastReviewedAt: safe.lastReviewedAt || null,
    nextReviewAt: safe.nextReviewAt || null,
    masteredAt: safe.masteredAt || null,
    updatedAt: safe.updatedAt || now.toISOString()
  };
}

export function getBusinessTermProgress(progressRecord, unitId, termId, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now);
  const key = businessTermKey(unitId, termId);
  return normalized.value.terms[key] || defaultTermProgress(unitId, termId, now);
}

export function saveBusinessVocabularyStep(progressRecord, unitId, termId, stepId, options = {}, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now);
  const key = businessTermKey(unitId, termId);
  const current = { ...defaultTermProgress(unitId, termId, now), ...(normalized.value.terms[key] || {}) };
  const stepIndex = BUSINESS_VOCABULARY_STEPS.findIndex(step => step.id === stepId);
  if (stepIndex < 0) throw new Error(`Unbekannter Lernschritt: ${stepId}`);
  const completedSteps = [...new Set([...current.completedSteps, stepId])];
  const success = options.success !== false;
  const attempts = current.attempts + (stepId === 'apply' || stepId === 'review' ? 1 : 0);
  const correctApplications = current.correctApplications + (success && stepId === 'apply' ? 1 : 0);
  const reviewCount = current.reviewCount + (success && stepId === 'review' ? 1 : 0);
  const nextStep = success ? BUSINESS_VOCABULARY_STEPS[Math.min(stepIndex + 1, BUSINESS_VOCABULARY_STEPS.length - 1)].id : stepId;
  let status = success ? BUSINESS_VOCABULARY_STEPS[stepIndex].status : 'review-due';
  let nextReviewAt = current.nextReviewAt;
  let masteredAt = current.masteredAt;

  if (stepId === 'apply' && success) {
    status = 'review-due';
    nextReviewAt = new Date(now.getTime() + DAY).toISOString();
  }
  if (stepId === 'review') {
    status = success ? 'mastered' : 'review-due';
    nextReviewAt = new Date(now.getTime() + (success ? 7 : 1) * DAY).toISOString();
    masteredAt = success ? (current.masteredAt || now.toISOString()) : null;
  }

  const nextTerm = {
    ...current,
    unitId,
    termId,
    status,
    step: nextStep,
    completedSteps,
    attempts,
    correctApplications,
    reviewCount,
    lastReviewedAt: stepId === 'review' ? now.toISOString() : current.lastReviewedAt,
    nextReviewAt,
    masteredAt,
    updatedAt: now.toISOString()
  };

  return {
    ...normalized,
    value: {
      ...normalized.value,
      terms: { ...normalized.value.terms, [key]: nextTerm }
    },
    updatedAt: now.toISOString()
  };
}

export function resetBusinessTermProgress(progressRecord, unitId, termId, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now);
  const key = businessTermKey(unitId, termId);
  return {
    ...normalized,
    value: {
      ...normalized.value,
      terms: { ...normalized.value.terms, [key]: defaultTermProgress(unitId, termId, now) }
    },
    updatedAt: now.toISOString()
  };
}

export function businessVocabularyLearningStats(units, progressRecord, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now);
  const allTerms = units.flatMap(unit => unit.terms.map(term => getBusinessTermProgress(normalized, unit.id, term.id, now)));
  return {
    total: allTerms.length,
    new: allTerms.filter(item => item.status === 'new').length,
    learning: allTerms.filter(item => ['learning', 'understood', 'applied'].includes(item.status)).length,
    due: allTerms.filter(item => item.status === 'review-due').length,
    mastered: allTerms.filter(item => item.status === 'mastered').length
  };
}
