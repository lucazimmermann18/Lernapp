import {normalizeBusinessVocabularyImport} from './businessVocabularyImport.js';

const env = import.meta.env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || 'https://lmcaduueyjpgjipoodju.supabase.co').replace(/\/$/, '');
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY2FkdXVleWpwZ2ppcG9vZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTQ0NzgsImV4cCI6MjEwNDM3MDQ3OH0.scspT4gEaRJRBwmIUQXN62j5XsNpL4zLNQsiv-u3Hbs';

const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` };

export function normalizeBusinessVocabularyCatalogRows(rows = []) {
  return normalizeBusinessVocabularyImport({ units: rows.map(row => ({
    id: row.id,
    number: row.number,
    level: row.level,
    topic: row.topic,
    title: row.title,
    description: row.description,
    terms: Array.isArray(row.terms) ? row.terms : []
  })) }).units.map(unit => ({ ...unit, source: 'supabase-catalog' }));
}

export async function loadBusinessVocabularyCatalog() {
  const response = await fetch(`${supabaseUrl}/rest/v1/business_vocabulary_units?select=id,number,level,topic,title,description,terms&order=number.asc`, { headers });
  if (!response.ok) throw new Error(`Business-Vokabel-Katalog nicht erreichbar (${response.status}).`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length < 1000) throw new Error('Business-Vokabel-Katalog ist noch nicht vollständig befüllt.');
  return normalizeBusinessVocabularyCatalogRows(rows);
}
