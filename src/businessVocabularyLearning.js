export const BUSINESS_VOCABULARY_PROGRESS_PREFIX = 'business-vocabulary-progress';
export const BUSINESS_VOCABULARY_IMPORT_PREFIX = 'business-vocabulary-import';
export const LOCAL_BUSINESS_USER_KEY = 'local-parent';
export const BUSINESS_VOCABULARY_PROGRESS_ID = BUSINESS_VOCABULARY_PROGRESS_PREFIX;
export const BUSINESS_VOCABULARY_STEPS = [
  { id: 'learn', label: 'Wort lernen', status: 'learning' },
  { id: 'context', label: 'Kontext verstehen', status: 'understood' },
  { id: 'apply', label: 'Aktiv anwenden', status: 'applied' },
  { id: 'review', label: 'Wiederholen', status: 'mastered' }
];

const DAY = 24 * 60 * 60 * 1000;
const VALID_STATUSES = new Set(['new', 'learning', 'understood', 'applied', 'review-due', 'mastered']);

export function businessVocabularyUserKey(user) {
  return String(user?.id || user?.email || LOCAL_BUSINESS_USER_KEY).trim() || LOCAL_BUSINESS_USER_KEY;
}

export function businessVocabularyProgressId(userKey = LOCAL_BUSINESS_USER_KEY) {
  return userKey === LOCAL_BUSINESS_USER_KEY ? BUSINESS_VOCABULARY_PROGRESS_ID : `${BUSINESS_VOCABULARY_PROGRESS_PREFIX}:${userKey}`;
}

export function businessVocabularyImportId(userKey = LOCAL_BUSINESS_USER_KEY) {
  return userKey === LOCAL_BUSINESS_USER_KEY ? BUSINESS_VOCABULARY_IMPORT_PREFIX : `${BUSINESS_VOCABULARY_IMPORT_PREFIX}:${userKey}`;
}

export function businessTermKey(unitId, termId) {
  return `${unitId}:${termId}`;
}

export function emptyBusinessVocabularyProgress(now = new Date(), userKey = LOCAL_BUSINESS_USER_KEY) {
  return {
    id: businessVocabularyProgressId(userKey),
    userKey,
    value: { terms: {} },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function normalizeBusinessVocabularyProgress(record, now = new Date(), userKey = record?.userKey || LOCAL_BUSINESS_USER_KEY) {
  const resolvedUserKey = userKey || record?.userKey || LOCAL_BUSINESS_USER_KEY;
  const base = record && typeof record === 'object' ? record : emptyBusinessVocabularyProgress(now, resolvedUserKey);
  const value = base.value && typeof base.value === 'object' ? base.value : {};
  const terms = value.terms && typeof value.terms === 'object' ? value.terms : {};
  const normalizedTerms = Object.fromEntries(Object.entries(terms).map(([key, progress]) => [key, normalizeTermProgress(progress, now)]));
  return {
    ...base,
    id: businessVocabularyProgressId(resolvedUserKey),
    userKey: resolvedUserKey,
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
    mistakes: 0,
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
    mistakes: Number.isFinite(Number(safe.mistakes)) ? Number(safe.mistakes) : 0,
    reviewCount: Number.isFinite(Number(safe.reviewCount)) ? Number(safe.reviewCount) : 0,
    lastReviewedAt: safe.lastReviewedAt || null,
    nextReviewAt: safe.nextReviewAt || null,
    masteredAt: safe.masteredAt || null,
    updatedAt: safe.updatedAt || now.toISOString()
  };
}

export function getBusinessTermProgress(progressRecord, unitId, termId, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
  const key = businessTermKey(unitId, termId);
  return normalized.value.terms[key] || defaultTermProgress(unitId, termId, now);
}

export function saveBusinessVocabularyStep(progressRecord, unitId, termId, stepId, options = {}, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
  const key = businessTermKey(unitId, termId);
  const current = { ...defaultTermProgress(unitId, termId, now), ...(normalized.value.terms[key] || {}) };
  const stepIndex = BUSINESS_VOCABULARY_STEPS.findIndex(step => step.id === stepId);
  if (stepIndex < 0) throw new Error(`Unbekannter Lernschritt: ${stepId}`);
  const completedSteps = [...new Set([...current.completedSteps, stepId])];
  const success = options.success !== false;
  const attempts = current.attempts + (stepId === 'apply' || stepId === 'review' ? 1 : 0);
  const correctApplications = current.correctApplications + (success && stepId === 'apply' ? 1 : 0);
  const reviewCount = current.reviewCount + (success && stepId === 'review' ? 1 : 0);
  const mistakes = current.mistakes + (!success && (stepId === 'apply' || stepId === 'review') ? 1 : 0);
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
    mistakes,
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
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
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

export function businessVocabularyDueTerms(units, progressRecord, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
  return units.flatMap(unit => unit.terms.map(term => {
    const progress = getBusinessTermProgress(normalized, unit.id, term.id, now);
    const dueByDate = progress.nextReviewAt && new Date(progress.nextReviewAt) <= now;
    const due = progress.nextReviewAt ? Boolean(dueByDate) : progress.status === 'review-due';
    return { unit, term, progress, due };
  })).filter(item => item.due).sort((a, b) => {
    const aTime = a.progress.nextReviewAt ? new Date(a.progress.nextReviewAt).getTime() : 0;
    const bTime = b.progress.nextReviewAt ? new Date(b.progress.nextReviewAt).getTime() : 0;
    return aTime - bTime || b.progress.mistakes - a.progress.mistakes;
  });
}

export function businessVocabularyDifficultTerms(units, progressRecord, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
  return units.flatMap(unit => unit.terms.map(term => {
    const progress = getBusinessTermProgress(normalized, unit.id, term.id, now);
    const inferredMistakes = Math.max(0, progress.attempts - progress.correctApplications - progress.reviewCount);
    const mistakes = Math.max(progress.mistakes || 0, inferredMistakes);
    return { unit, term, progress, mistakes };
  })).filter(item => item.mistakes > 0).sort((a, b) => b.mistakes - a.mistakes || b.progress.attempts - a.progress.attempts || a.term.german.localeCompare(b.term.german));
}

export function businessVocabularyUnitRecommendations(units, progressRecord, now = new Date(), limit = 3) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
  return units.map(unit => {
    const termStates = unit.terms.map(term => getBusinessTermProgress(normalized, unit.id, term.id, now));
    const due = termStates.filter(item => item.nextReviewAt ? new Date(item.nextReviewAt) <= now : item.status === 'review-due').length;
    const difficult = termStates.filter(item => (item.mistakes || 0) > 0).length;
    const mastered = termStates.filter(item => item.status === 'mastered').length;
    const started = termStates.filter(item => item.status !== 'new').length;
    const open = termStates.length - mastered;
    const score = due * 5 + difficult * 3 + (started ? 2 : 0) + Math.min(open, 6) / 6;
    let reason = 'Neue Unit starten';
    if (due) reason = `${due} Wiederholung${due === 1 ? '' : 'en'} fällig`;
    else if (difficult) reason = `${difficult} schwierige${difficult === 1 ? 's Wort' : ' Wörter'} festigen`;
    else if (started && open) reason = 'Angefangene Unit abschließen';
    return { unit, due, difficult, mastered, started, open, percent: termStates.length ? Math.round(mastered / termStates.length * 100) : 0, score, reason };
  }).filter(item => item.open > 0).sort((a, b) => b.score - a.score || a.unit.level - b.unit.level || a.unit.number - b.unit.number).slice(0, limit);
}

export function businessVocabularyLearningStats(units, progressRecord, now = new Date()) {
  const normalized = normalizeBusinessVocabularyProgress(progressRecord, now, progressRecord?.userKey);
  const allTerms = units.flatMap(unit => unit.terms.map(term => getBusinessTermProgress(normalized, unit.id, term.id, now)));
  const dueItems = businessVocabularyDueTerms(units, normalized, now);
  const difficultItems = businessVocabularyDifficultTerms(units, normalized, now);
  const mastered = allTerms.filter(item => item.status === 'mastered').length;
  const total = allTerms.length;
  return {
    total,
    new: allTerms.filter(item => item.status === 'new').length,
    learning: allTerms.filter(item => ['learning', 'understood', 'applied'].includes(item.status)).length,
    due: dueItems.length,
    mastered,
    difficult: difficultItems.length,
    percent: total ? Math.round(mastered / total * 100) : 0
  };
}
