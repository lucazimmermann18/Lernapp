# KI-OCR mit OpenAI oder Anthropic konfigurieren

API-Schlüssel werden ausschließlich als verschlüsselte Supabase Edge Function Secrets gespeichert. Sie gehören niemals in `VITE_*`, den Browser, Git oder eine Datenbanktabelle.

## OpenAI aktivieren

1. Im OpenAI API-Dashboard einen API-Schlüssel erzeugen. Ein ChatGPT-Abonnement allein ist kein API-Schlüssel.
2. Im Supabase-Dashboard **Project Settings → Edge Functions → Secrets** öffnen.
3. `OPENAI_API_KEY` mit dem API-Schlüssel anlegen.
4. Optional `OPENAI_MODEL` anlegen. Ohne Angabe verwendet die Funktion `gpt-4.1-mini`.
5. Die Edge Function `extract-vocabulary` neu deployen.

Mit der Supabase CLI geht das für dieses Projekt so:

```bash
supabase login
supabase link --project-ref lmcaduueyjpgjipoodju
supabase secrets set OPENAI_API_KEY="DEIN_OPENAI_API_KEY" OPENAI_MODEL="gpt-4.1-mini"
supabase functions deploy extract-vocabulary
```

## Anthropic optional weiterverwenden

```bash
supabase secrets set ANTHROPIC_API_KEY="DEIN_ANTHROPIC_API_KEY" ANTHROPIC_MODEL="DEIN_CLAUDE_MODELL"
supabase functions deploy extract-vocabulary
```

In der App kann anschließend **Automatisch**, **OpenAI (ChatGPT)** oder **Anthropic (Claude)** gewählt werden. Automatisch bevorzugt OpenAI, wenn `OPENAI_API_KEY` gesetzt ist, und verwendet andernfalls Anthropic.

Für diese Erweiterung ist keine neue SQL-Migration nötig.
