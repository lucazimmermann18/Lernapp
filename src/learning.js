export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function unitDayLabel(unit, now = new Date()) {
  if (!unit.createdAt) return 'WIEDERHOLEN';
  const created = new Date(unit.createdAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const unitDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const days = Math.round((today - unitDay) / 86400000);
  if (days <= 0) return 'HEUTE NEU';
  if (days === 1) return 'VON GESTERN';
  return 'WIEDERHOLEN';
}

export function sortUnitsForDailyLearning(units) {
  return [...units].sort((a, b) => {
    if (Number.isFinite(a.sortOrder) || Number.isFinite(b.sortOrder)) return (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export function withMissingDates(units, now = new Date()) {
  return units.map((unit, index) => ({
    ...unit,
    stars: [...(unit.stars || []), 0, 0, 0, 0, 0, 0, 0].slice(0, 7),
    done: Math.min(unit.done || 0, 7),
    words: Array.isArray(unit.pairs) ? unit.pairs.filter(pair => Array.isArray(pair) && String(pair[0] || '').trim() && String(pair[1] || '').trim()).length : (unit.words || 0),
    createdAt: unit.createdAt || new Date(now.getTime() - index * 86400000).toISOString(),
    lastPracticedAt: unit.lastPracticedAt || null
  }));
}

export function calculateAchievementProgress(achievement, { attempts, units, learnedWords }) {
  const correctAttempts = attempts.filter(attempt => attempt.correct);
  const firstTryAttempts = correctAttempts.filter(attempt => attempt.firstTry);
  const practicedDays = new Set(correctAttempts.map(attempt => attempt.createdAt?.slice(0, 10)).filter(Boolean));
  const values = {
    learned: learnedWords,
    firstTry: firstTryAttempts.length,
    attempts: attempts.length,
    units: units.filter(unit => unit.lastPracticedAt || unit.done > 0).length,
    days: practicedDays.size,
    stars: units.reduce((sum, unit) => sum + (unit.stars || []).reduce((a, b) => a + b, 0), 0)
  };
  const current = values[achievement.metric] || 0;
  return {...achievement, current, unlocked: current >= achievement.target};
}

export function summarizeLearning(attempts, units) {
  const correctFirstTry = attempts.filter(attempt => attempt.correct && attempt.firstTry);
  return {
    learnedWords: new Set(correctFirstTry.map(attempt => `${attempt.unitId}:${attempt.word}`)).size,
    attempts: attempts.length,
    practicedUnits: units.filter(unit => !unit.deletedAt && (unit.lastPracticedAt || unit.done > 0)).length,
    stars: units.filter(unit=>!unit.deletedAt).reduce((sum, unit) => sum + (unit.stars || []).reduce((a, b) => a + b, 0), 0)
  };
}

export function syncRewards(rewards, learnedWords, now = new Date()) {
  return rewards.map(reward => {
    const unlocked = learnedWords >= reward.milestone;
    return {
      ...reward,
      unlocked,
      unlockedAt: unlocked ? (reward.unlockedAt || now.toISOString()) : null,
      redeemed: unlocked ? Boolean(reward.redeemed) : false,
      redeemedAt: unlocked && reward.redeemed ? (reward.redeemedAt || now.toISOString()) : null
    };
  });
}

export function nextRewardProgress(rewards, learnedWords) {
  const next = [...rewards].sort((a,b) => a.milestone-b.milestone).find(reward => !reward.unlocked);
  if (!next) return {next: null, remaining: 0, percent: 100};
  const previous = [...rewards].filter(reward => reward.milestone < next.milestone).sort((a,b)=>b.milestone-a.milestone)[0]?.milestone || 0;
  const span = Math.max(1, next.milestone - previous);
  return {next, remaining: Math.max(0, next.milestone-learnedWords), percent: Math.max(0,Math.min(100,Math.round((learnedWords-previous)/span*100)))};
}

export function scoreStage(results) {
  const score = results.length
    ? Math.round(results.filter(result => result.firstTry).length / results.length * 100)
    : 0;
  return {score, stars: score === 100 ? 3 : score >= 85 ? 2 : score >= 70 ? 1 : 0, passed: score >= 70};
}

export function nextStreak(current, correct) {
  return correct ? current + 1 : 0;
}

/** Build parent-facing statistics from the immutable answer log. */
export function buildParentAnalytics(attempts, units, now = new Date()) {
  const activeUnits = units.filter(unit => !unit.deletedAt);
  const answers = attempts.filter(attempt => typeof attempt.correct === 'boolean');
  const wordMap = new Map();
  for (const attempt of answers) {
    const key = `${attempt.unitId}:${attempt.word}`;
    const value = wordMap.get(key) || {unitId:attempt.unitId,word:attempt.word,total:0,wrong:0,correct:0};
    value.total += 1;
    value.correct += attempt.correct ? 1 : 0;
    value.wrong += attempt.correct ? 0 : 1;
    wordMap.set(key,value);
  }
  const words = [...wordMap.values()].map(value=>({...value,errorRate:Math.round(value.wrong/value.total*100)}))
    .sort((a,b)=>b.errorRate-a.errorRate||b.total-a.total);
  const correct = answers.filter(answer=>answer.correct);
  const firstTry = correct.filter(answer=>answer.firstTry);
  const hintsUsed = answers.filter(answer=>Number(answer.hintUsed)>0);
  const dayKeys = [...new Set(answers.map(answer=>answer.createdAt?.slice(0,10)).filter(Boolean))];
  const lastSevenDays = Array.from({length:7},(_,offset)=>{
    const date=new Date(now);date.setDate(date.getDate()-(6-offset));const key=localDateKey(date);
    return {date:key,label:date.toLocaleDateString('de-DE',{weekday:'short'}),answers:answers.filter(a=>a.createdAt?.slice(0,10)===key).length};
  });
  const errorTypes = answers.filter(answer=>!answer.correct).reduce((result,answer)=>{const type=answer.errorType||'unknown';result[type]=(result[type]||0)+1;return result},{});
  const sessionDurations = new Map();
  for(const answer of answers)if(answer.sessionId)sessionDurations.set(answer.sessionId,(sessionDurations.get(answer.sessionId)||0)+(answer.durationMs||0));
  return {
    totalAnswers:answers.length,
    errorRate:answers.length?Math.round((answers.length-correct.length)/answers.length*100):0,
    firstTryRate:correct.length?Math.round(firstTry.length/correct.length*100):0,
    hintsUsed:hintsUsed.length,
    learningDays:dayKeys.length,
    lastLearnedAt:answers.map(a=>a.createdAt).filter(Boolean).sort().at(-1)||null,
    averageRoundMinutes:sessionDurations.size?Math.round([...sessionDurations.values()].reduce((a,b)=>a+b,0)/sessionDurations.size/6000)/10:0,
    hardestWords:words.slice(0,8),
    errorTypes,
    lastSevenDays,
    unitProgress:activeUnits.map(unit=>({id:unit.id,name:unit.name,archived:Boolean(unit.archived),done:unit.done||0,percent:Math.round((unit.done||0)/7*100),lastPracticedAt:unit.lastPracticedAt||null}))
  };
}
