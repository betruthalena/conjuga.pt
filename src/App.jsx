import { useState, useRef } from 'react'
import verbsData from './verbs.json'
import './App.css'

const TENSES = ['Presente', 'Pretérito Perfeito', 'Imperativo Afirmativo']
const MODES = ['All', 'Regular', 'Irregular']

const TENSE_CONFIG = [
  { label: 'Presente',  short: 'Presente',  icon: '☀️' },
  { label: 'Pretérito Perfeito', short: 'Perfeito', icon: '📖' },
  { label: 'Imperativo Afirmativo', short: 'Imperativo', icon: '⚡️' },
]

const MODE_CONFIG = [
  { label: 'All',       icon: '∞' },
  { label: 'Regular',   icon: '◆' },
  { label: 'Irregular', icon: '★' },
]

function removeDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
}

function filterVerbs(tense, mode) {
  const groupMap = {
    Regular: ['ar', 'er', 'ir', 'orthographic'],
    Irregular: ['irregular'],
    All: ['ar', 'er', 'ir', 'orthographic', 'irregular'],
  }
  const allowed = groupMap[mode]
  return verbsData.filter(v => v.tense === tense && allowed.includes(v.group))
}

function pickRandom(arr, exclude) {
  const pool = exclude
    ? arr.filter(v => !(v.infinitive === exclude.infinitive && v.person === exclude.person))
    : arr
  const source = pool.length ? pool : arr
  return source[Math.floor(Math.random() * source.length)]
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [tense, setTense] = useState('Presente')
  const [mode, setMode] = useState('All')
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 })
  const inputRef = useRef(null)

  const pool = filterVerbs(tense, mode)

  function nextQuestion(prev) {
    const q = pickRandom(pool, prev)
    setQuestion(q)
    setAnswer('')
    setChecked(false)
    setResult(null)
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  function startDrill() {
    setStats({ correct: 0, total: 0, streak: 0 })
    nextQuestion(null)
    setScreen('drill')
  }

  function checkAnswer() {
    if (!answer.trim()) return
    const userNorm = answer.trim().toLowerCase()
    const correctNorm = question.form.toLowerCase()

    if (userNorm === correctNorm) {
      setResult('correct')
      setStats(s => ({ correct: s.correct + 1, total: s.total + 1, streak: s.streak + 1 }))
    } else {
      const userStripped = removeDiacritics(userNorm)
      const correctStripped = removeDiacritics(correctNorm)
      setResult(userStripped === correctStripped ? 'diacritic' : 'wrong')
      setStats(s => ({ ...s, total: s.total + 1, streak: 0 }))
    }
    setChecked(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (!checked) checkAnswer()
      else nextQuestion(question)
    }
  }

  const tenseIdx = TENSES.indexOf(tense)

  if (screen === 'home') {
    return (
      <div className="app">
        <header className="logo">
          <div className="logo-mark">conjuga<span>.pt</span></div>
          <div className="logo-sub">European Portuguese · active recall drills</div>
        </header>

        <div className="section-label">Tempo verbal</div>
        <div className="tense-grid">
          {TENSE_CONFIG.map((t, i) => (
            <button
              key={t.label}
              className={`tense-card${tense === t.label ? ` active t${i}` : ''}`}
              onClick={() => setTense(t.label)}
            >
              <span className="card-icon">{t.icon}</span>
              {t.short}
            </button>
          ))}
        </div>

        <div className="section-label">Verbos</div>
        <div className="mode-grid">
          {MODE_CONFIG.map(m => (
            <button
              key={m.label}
              className={`mode-card${mode === m.label ? ' active' : ''}`}
              onClick={() => setMode(m.label)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button className="start-btn" onClick={startDrill} disabled={!pool.length}>
          Começar →
        </button>
        {pool.length > 0 && (
          <div className="count-badge">
            <strong>{pool.length}</strong> formas disponíveis
          </div>
        )}
      </div>
    )
  }

  const feedbackClass = result === 'correct' ? 'correct' : result === 'diacritic' ? 'diacritic' : 'wrong'

  return (
    <div className="app">
      <div className="progress-row">
        <button className="back-btn" onClick={() => setScreen('home')}>
          ← voltar
        </button>
        <div className="stats-right">
          {stats.streak >= 2 && (
            <div className="streak">🔥 {stats.streak}</div>
          )}
          <div className="progress-stat">
            <strong>{stats.correct}</strong>/{stats.total}
          </div>
        </div>
      </div>

      <div className="card">
        <div className={`drill-tense t${tenseIdx}`}>
          <span className="drill-dot" />
          {tense}
        </div>

        <div className="verb-display">{question?.infinitive}</div>
        <div className="person-display">
          pessoa: <strong>{question?.person}</strong>
        </div>

        <input
          ref={inputRef}
          className={`input-field${checked ? ' ' + feedbackClass : ''}`}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="escreve a forma..."
          disabled={checked}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {!checked && (
          <button className="check-btn" onClick={checkAnswer} disabled={!answer.trim()}>
            Verificar
          </button>
        )}

        {checked && (
          <>
            <div className={`feedback-box ${feedbackClass}`}>
              <div className="feedback-icon">
                {result === 'correct' ? '✅' : result === 'diacritic' ? '⚠️' : '❌'}
              </div>
              <div className="feedback-label">
                {result === 'correct'
                  ? 'Correto!'
                  : result === 'diacritic'
                  ? 'Só faltam os acentos'
                  : 'Incorreto'}
              </div>
              <div className="feedback-answer">{question?.form}</div>
              {result === 'diacritic' && (
                <div className="feedback-note">
                  Atenção aos acentos! Em português europeu, os acentos (á, ã, ç, ó, etc.)
                  são obrigatórios e mudam o significado das palavras.
                </div>
              )}
              {result === 'wrong' && (
                <div className="feedback-note">
                  A tua resposta:{' '}
                  <span className="user-answer">{answer.trim()}</span>
                </div>
              )}
            </div>
            <button className="next-btn" onClick={() => nextQuestion(question)}>
              Próximo →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
