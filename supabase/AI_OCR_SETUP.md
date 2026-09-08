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

Die OCR-Funktion entfernt Ausspracheangaben wie `['sɪstə]`, `[ən]` oder `/wɜːd/` automatisch. Nach einem Update der Funktion muss `extract-vocabulary` erneut deployed werden, damit diese Bereinigung auch serverseitig aktiv ist.

Für diese Erweiterung ist keine neue SQL-Migration nötig.

## Persönliche Lückengeschichten deployen

Die Lückengeschichten verwenden denselben serverseitigen `OPENAI_API_KEY`. Nach dem Setzen des Secrets muss zusätzlich die zweite Edge Function bereitgestellt werden:

```bash
supabase functions deploy generate-story
```

Optional kann für Geschichten ein eigenes Modell festgelegt werden:

```bash
supabase secrets set OPENAI_STORY_MODEL="gpt-4.1-mini"
supabase functions deploy generate-story
```

Nach Änderungen am Geschichten-Prompt muss `generate-story` erneut deployed werden. Die App verwendet eine Versionsnummer und ignoriert danach automatisch ältere, bereits zwischengespeicherte Geschichten.

Anschließend Migration `006_stories.sql` mit `supabase db push` ausführen, damit generierte Geschichten und Ergebnisse pro Elternkonto synchronisiert werden.

## Persönlichen Lernavatar deployen

Der Avatar-Generator verwendet ebenfalls `OPENAI_API_KEY` und liefert ausschließlich eine sichere, strukturierte Konfiguration aus einer festgelegten Figuren- und Farbpalette:

```bash
supabase functions deploy generate-avatar
supabase db push
```

Der zweite Befehl spielt Migration `008_monster_progress.sql` ein. Darin wird der dreistufige Fortschritt gegen Fehler-Monster pro Elternkonto gespeichert und in die atomare Synchronisierung aufgenommen.

## Word-Runner-Ergebnisse synchronisieren

Für den Word Runner ist keine weitere Edge Function nötig. Damit seine Rundenergebnisse zwischen den Geräten synchronisiert und im JSON-Backup vollständig abgebildet werden, muss Migration `009_runner_results.sql` einmal ausgeführt werden:

```bash
supabase db push
```
