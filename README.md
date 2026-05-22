# conjuga.pt

Active recall drills for European Portuguese verb conjugations.

## Adding more verbs

Open `src/verbs.json` and add entries in this format:

```json
{
  "infinitive": "andar",
  "group": "ar",
  "tense": "Presente",
  "person": "eu",
  "form": "ando"
}
```

**Groups:** `ar` · `er` · `ir` · `orthographic` · `irregular`

**Tenses:** `Presente` · `Pretérito Perfeito` · `Imperativo Afirmativo`

**Persons:** `eu` · `tu` · `ele/ela` · `nós` · `vocês` · `você` (imperative only)
