import { useState } from 'react'
import { Header } from './components/Header'
import { TextInput } from './components/TextInput'
import { WortartenMenu } from './components/WortartenMenu'
import { TextGenerator } from './components/TextGenerator'
import { QuizModus } from './components/QuizModus'
import { analysiereText } from './lib/api'
import { ALLE_WORTARTEN, type WortartKey } from './lib/wortarten'
import type { Token } from './types'

const MAX_TEXT = 2000
const MIN_WORTARTEN = 2

type Phase = 'edit' | 'loading' | 'quiz'

export default function App() {
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<Set<WortartKey>>(
    () => new Set(['Nomen', 'Verb', 'Adjektiv', 'Artikel', 'Pronomen'] as WortartKey[]),
  )
  const [phase, setPhase] = useState<Phase>('edit')
  const [tokens, setTokens] = useState<Token[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [thema, setThema] = useState<string | null>(null)

  function toggle(k: WortartKey) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  async function starteQuiz() {
    const t = text.trim()
    setError(null)
    if (!t) {
      setError('Schreibe zuerst einen Text oder erzeuge einen Beispieltext.')
      return
    }
    if (selected.size < MIN_WORTARTEN) {
      setError(`Wähle mindestens ${MIN_WORTARTEN} Wortarten aus – sonst ist das Raten zu leicht.`)
      return
    }
    setPhase('loading')
    try {
      const r = await analysiereText({ text: t, ausgewaehlt: [...selected] })
      setTokens(r.tokens)
      setPhase('quiz')
    } catch (e: any) {
      setError(e?.message ?? 'Da ist etwas schiefgelaufen.')
      setPhase('edit')
    }
  }

  function zurueckZumText() {
    setPhase('edit')
    setTokens(null)
  }

  const istQuiz = phase === 'quiz' && tokens !== null
  const istLaden = phase === 'loading'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        {istQuiz ? (
          <QuizAnsicht
            tokens={tokens!}
            auswahl={[...selected]}
            onExit={zurueckZumText}
          />
        ) : (
          <EditAnsicht
            text={text}
            setText={(t) => {
              setText(t)
              setError(null)
            }}
            selected={selected}
            toggle={toggle}
            setAll={() => setSelected(new Set(ALLE_WORTARTEN))}
            setNone={() => setSelected(new Set())}
            thema={thema}
            setThema={setThema}
            onStart={starteQuiz}
            loading={istLaden}
            error={error}
          />
        )}

        <footer className="mt-12 pb-4 text-center text-sm text-slate-500">
          <p>
            KI-gestützt (Claude von Anthropic). Bei Mehrdeutigkeit können Fehler passieren —
            frag im Zweifel deine Lehrperson.
          </p>
        </footer>
      </main>
    </div>
  )
}

function EditAnsicht({
  text, setText, selected, toggle, setAll, setNone, thema, setThema,
  onStart, loading, error,
}: {
  text: string
  setText: (t: string) => void
  selected: Set<WortartKey>
  toggle: (k: WortartKey) => void
  setAll: () => void
  setNone: () => void
  thema: string | null
  setThema: (t: string | null) => void
  onStart: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <section className="md:col-span-2 space-y-4">
        <TextInput
          text={text}
          onChange={setText}
          maxLength={MAX_TEXT}
          disabled={loading}
        />
        <TextGenerator
          fokus={[...selected]}
          disabled={loading}
          onGenerated={(t, th) => {
            setText(t)
            setThema(th)
          }}
        />
        {thema && (
          <p className="text-sm text-slate-500">
            <span aria-hidden>✨ </span>Thema: <span className="font-bold">{thema}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2" aria-hidden>⏳</span>
                Die KI analysiert…
              </>
            ) : (
              <>🎯 Üben starten</>
            )}
          </button>
          {error && (
            <div
              role="alert"
              className="px-4 py-2 rounded-xl bg-red-100 text-red-800 font-bold border-2 border-red-200"
            >
              <span aria-hidden>⚠️ </span>{error}
            </div>
          )}
        </div>
      </section>

      <aside className="md:col-span-1">
        <div className="md:sticky md:top-4">
          <WortartenMenu
            selected={selected}
            onToggle={toggle}
            onAll={setAll}
            onNone={setNone}
            disabled={loading}
          />
        </div>
      </aside>
    </div>
  )
}

function QuizAnsicht({
  tokens, auswahl, onExit,
}: {
  tokens: Token[]
  auswahl: WortartKey[]
  onExit: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <span aria-hidden>←</span> Zurück zum Text
        </button>
      </div>
      <QuizModus tokens={tokens} auswahl={auswahl} onNew={onExit} />
    </div>
  )
}
