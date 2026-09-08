import {createId} from './id.js';

const DATABASE_NAME = 'vokabelhero';
const DATABASE_VERSION = 8;
const STORES = ['units', 'attempts', 'rewards', 'settings', 'achievements', 'reviewProgress', 'masteryTests', 'stories', 'battleResults', 'monsterProgress', 'runnerResults'];

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      for (const store of STORES) {
        if (!request.result.objectStoreNames.contains(store)) {
          request.result.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function useStore(name, mode, action) {
  const db = await openDatabase();
  const transaction = db.transaction(name, mode);
  // Register completion handlers before starting/awaiting a request. IndexedDB
  // transactions may complete immediately after the last request succeeds;
  // registering oncomplete afterwards can therefore leave callers waiting
  // forever (for example after pressing the game's "Weiter" button).
  const completed = new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Datenbankvorgang abgebrochen'));
  });
  const result = await action(transaction.objectStore(name));
  await completed;
  db.close();
  return result;
}

export const getAll = (name) => useStore(name, 'readonly', store => requestAsPromise(store.getAll()));
export const put = (name, value) => useStore(name, 'readwrite', store => requestAsPromise(store.put(value)));

const recordTime = value => value.updatedAt || value.createdAt || '1970-01-01T00:00:00.000Z';

/** Merge a transactional cloud response without discarding newer local records. */
export async function mergeCloudData(cloudData) {
  const merged = { version: 1, exportedAt: new Date().toISOString() };
  for (const name of STORES) {
    const local = await getAll(name);
    const byId = new Map(local.map(item => [item.id, item]));
    for (const row of cloudData[name] || []) {
      const remote = { ...row.data, id: row.id, updatedAt: row.updated_at };
      const current = byId.get(row.id);
      if (!current || recordTime(remote) >= recordTime(current)) byId.set(row.id, remote);
    }
    merged[name] = [...byId.values()];
    await replaceAll(name, merged[name]);
  }
  return merged;
}

export async function replaceAll(name, values) {
  const db = await openDatabase();
  const transaction = db.transaction(name, 'readwrite');
  const completed = new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Speichern abgebrochen'));
  });
  const store = transaction.objectStore(name);
  store.clear();
  values.forEach(value => store.put(value));
  await completed;
  db.close();
}

export async function seedDatabase(units, rewards) {
  const [savedUnits, savedRewards] = await Promise.all([getAll('units'), getAll('rewards')]);
  if (!savedUnits.length) await Promise.all(units.map(unit => put('units', unit)));
  if (!savedRewards.length) await Promise.all(rewards.map(([emoji, title, milestone, unlocked], index) =>
    put('rewards', { id: `reward-${index}`, emoji, title, milestone, unlocked, redeemed: false })
  ));
}

export async function saveAttempt({ unitId, level, word, correct, firstTry, response = '', sessionId = null, durationMs = 0, errorType = null, isReview = false, hintUsed = 0 }) {
  const now = new Date().toISOString();
  return put('attempts', {
    id: createId(), unitId, level, word, correct, firstTry, response, sessionId, durationMs,
    errorType, isReview, hintUsed, createdAt: now, updatedAt: now
  });
}

export async function exportBackup() {
  const data = await getBackupData();
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export async function getBackupData() {
  const data = { version: 1, exportedAt: new Date().toISOString() };
  for (const store of STORES) data[store] = await getAll(store);
  return data;
}

export async function importBackup(file) {
  return restoreBackupData(JSON.parse(await file.text()));
}

export async function restoreBackupData(data) {
  if (data.version !== 1 || !Array.isArray(data.units)) throw new Error('Ungültige VokabelHero-Datei');
  const db = await openDatabase();
  for (const name of STORES) {
    const transaction = db.transaction(name, 'readwrite');
    const completed = new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Import abgebrochen'));
    });
    const store = transaction.objectStore(name);
    store.clear();
    for (const item of data[name] || []) store.put(item);
    await completed;
  }
  db.close();
  return data;
}
