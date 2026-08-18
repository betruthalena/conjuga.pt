import { supabase } from './supabaseClient'

// UI tense label -> (mood, tense) pair as stored in the `conjugations` table.
export const TENSE_CONFIG = [
  { label: 'Presente',              short: 'Presente',  icon: '☀️', mood: 'indicative', tense: 'presente' },
  { label: 'Pretérito Perfeito',    short: 'Perfeito',  icon: '📖', mood: 'indicative', tense: 'preterito_perfeito' },
  { label: 'Imperativo Afirmativo', short: 'Imperativo', icon: '⚡️', mood: 'imperative', tense: 'afirmativo' },
]

export const TENSES = TENSE_CONFIG.map(t => t.label)

export const MODE_CONFIG = [
  { label: 'All',       icon: '∞' },
  { label: 'Regular',   icon: '◆' },
  { label: 'Irregular', icon: '★' },
]

// DB `person` values -> human-readable label shown in the drill.
const PERSON_LABELS = {
  eu: 'eu',
  tu: 'tu',
  ele_ela_voce: 'ele / ela',
  eles_elas_voces: 'eles / elas',
  nos: 'nós',
  voce: 'você',
  voces: 'vocês',
}

function tenseConfigFor(mood, tense) {
  return TENSE_CONFIG.find(t => t.mood === mood && t.tense === tense)
}

/**
 * Fetches every conjugation row needed for the drill (Presente,
 * Pretérito Perfeito, Imperativo Afirmativo) in a single request,
 * joined with `verbs` for group/irregularity info.
 *
 * Returns a flat array shaped like the old verbs.json entries:
 *   { infinitive, group, tense, person, form }
 * where `group` is one of 'ar' | 'er' | 'ir' | 'other' | 'irregular'
 * and `tense` is the UI label (e.g. 'Presente').
 */
export async function fetchDrillData() {
  const orFilter = TENSE_CONFIG
    .map(t => `and(mood.eq.${t.mood},tense.eq.${t.tense})`)
    .join(',')

  const { data, error } = await supabase
    .from('conjugations')
    .select('infinitive, mood, tense, person, form, verbs(verb_group, is_irregular)')
    .or(orFilter)
    .neq('person', 'none')

  if (error) throw error

  return data
    .map(row => {
      const cfg = tenseConfigFor(row.mood, row.tense)
      if (!cfg) return null
      const isIrregular = !!row.verbs?.is_irregular
      return {
        infinitive: row.infinitive,
        group: isIrregular ? 'irregular' : (row.verbs?.verb_group ?? 'other'),
        tense: cfg.label,
        person: PERSON_LABELS[row.person] ?? row.person,
        form: row.form,
      }
    })
    .filter(Boolean)
}

export function filterVerbs(verbsData, tense, mode) {
  const groupMap = {
    Regular: ['ar', 'er', 'ir', 'other'],
    Irregular: ['irregular'],
    All: ['ar', 'er', 'ir', 'other', 'irregular'],
  }
  const allowed = groupMap[mode]
  return verbsData.filter(v => v.tense === tense && allowed.includes(v.group))
}
