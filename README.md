# conjuga.pt

Active recall drills for European Portuguese verb conjugations, backed by Supabase.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase project's URL and
   anon/public key (Supabase Dashboard → Settings → API Keys / General):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   These values are safe to expose in the frontend — the `anon` key only
   grants access allowed by your Row Level Security policies (read-only,
   per `supabase_schema.sql`).
3. Run the dev server:
   ```
   npm run dev
   ```

## Data model

Data now lives in two Supabase tables (see `supabase_schema.sql`):

- **`verbs`** — one row per infinitive, with `verb_group` (`ar`/`er`/`ir`/`other`)
  and `is_irregular`.
- **`conjugations`** — one row per conjugated form, keyed by
  `infinitive + mood + tense + person`, referencing `verbs.infinitive`.

The app only ever needs three `(mood, tense)` pairs for the three drills it
offers, and fetches them in a single Supabase query on load (`src/verbsRepository.js`):

| Drill (UI label)        | mood         | tense                 |
|--------------------------|--------------|------------------------|
| Presente                 | `indicative` | `presente`             |
| Pretérito Perfeito       | `indicative` | `preterito_perfeito`   |
| Imperativo Afirmativo    | `imperative` | `afirmativo`           |

"Regular" mode includes verbs where `verbs.is_irregular = false`
(`verb_group` in `ar`/`er`/`ir`/`other`); "Irregular" mode includes verbs
where `verbs.is_irregular = true`.

### Adding more drills

To add another tense/mood combination to the app, add an entry to
`TENSE_CONFIG` in `src/verbsRepository.js` with the matching `mood`/`tense`
values from the `conjugations` table, and add it to `TENSES`/the tense grid
in `App.jsx`.

### Adding more verbs

New verbs and conjugations are added directly in Supabase (SQL editor or
table editor) — there are no public write policies, so this can't be done
from the app itself. See `supabase_schema.sql` for the schema and RLS
policies.
