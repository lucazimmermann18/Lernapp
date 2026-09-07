const DATABASE_NAME = 'vokabelhero';
const DATABASE_VERSION = 1;
const STORES = ['units', 'attempts', 'rewards', 'settings'];

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
  const result = await action(transaction.objectStore(name));
  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
  return result;
}

export const getAll = (name) => useStore(name, 'readonly', store => requestAsPromise(store.getAll()));
export const put = (name, value) => useStore(name, 'readwrite', store => requestAsPromise(store.put(value)));

export async function seedDatabase(units, rewards) {
  if ((await getAll('units')).length) return;
  await Promise.all(units.map(unit => put('units', unit)));
  await Promise.all(rewards.map(([emoji, title, milestone, unlocked], index) =>
    put('rewards', { id: `reward-${index}`, emoji, title, milestone, unlocked, redeemed: false })
  ));
}

export async function saveAttempt({ unitId, level, word, correct, firstTry }) {
  return put('attempts', {
    id: crypto.randomUUID(), unitId, level, word, correct, firstTry,
    createdAt: new Date().toISOString()
  });
}

export async function exportBackup() {
  const data = { version: 1, exportedAt: new Date().toISOString() };
  for (const store of STORES) data[store] = await getAll(store);
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export async function importBackup(file) {
  const data = JSON.parse(await file.text());
  if (data.version !== 1 || !Array.isArray(data.units)) throw new Error('Ungültige VokabelHero-Datei');
  const db = await openDatabase();
  for (const name of STORES) {
    const transaction = db.transaction(name, 'readwrite');
    const store = transaction.objectStore(name);
    store.clear();
    for (const item of data[name] || []) store.put(item);
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }
  db.close();
  return data;
}
