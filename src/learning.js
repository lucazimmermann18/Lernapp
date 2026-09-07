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
  return [...units].sort((a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export function withMissingDates(units, now = new Date()) {
  return units.map((unit, index) => ({
    ...unit,
    createdAt: unit.createdAt || new Date(now.getTime() - index * 86400000).toISOString(),
    lastPracticedAt: unit.lastPracticedAt || null
  }));
}
