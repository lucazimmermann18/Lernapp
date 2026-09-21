import {buildBusinessVocabularySeed} from './generateBusinessVocabularySeed.mjs';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://lmcaduueyjpgjipoodju.supabase.co').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Run the migration first, then start this script with the service-role key in the environment.');
  process.exit(1);
}

const payload = buildBusinessVocabularySeed();
const rows = payload.units.map(unit => ({
  id: unit.id,
  number: unit.number,
  level: unit.level,
  topic: unit.topic,
  title: unit.title,
  description: unit.description,
  source: unit.source,
  terms: unit.terms,
  version: 1,
  created_at: payload.generatedAt,
  updated_at: payload.generatedAt
}));

async function upsertChunk(chunk, index) {
  const response = await fetch(`${supabaseUrl}/rest/v1/business_vocabulary_units?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(chunk)
  });
  if (!response.ok) throw new Error(`Chunk ${index} failed (${response.status}): ${await response.text()}`);
}

const chunkSize = 50;
for (let index = 0; index < rows.length; index += chunkSize) {
  await upsertChunk(rows.slice(index, index + chunkSize), index / chunkSize + 1);
}

console.log(`Seeded ${rows.length} business vocabulary units and ${rows.reduce((sum, row) => sum + row.terms.length, 0)} terms into ${supabaseUrl}.`);
