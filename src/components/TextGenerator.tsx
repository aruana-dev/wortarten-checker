import { useState } from 'react'
import { generiereText } from '../lib/api'
import type { WortartKey } from '../lib/wortarten'

type Props = {
  onGenerated: (text: string, thema: string) => void
  fokus: WortartKey[]
  disabled?: boolean
}

type Stufe = 'leicht' | 'mittel' | 'schwer'

const STUFEN: { key: Stufe; label: string; beschr: string }[] = [
  { key: 'leicht', label: 'leicht', beschr: 'Klasse 3–4' },
  { key: 'mittel', label: 'mittel', beschr: 'Klasse 5–6' },
  { key: 'schwer', label: 'schwer', beschr: 'Klasse 7–9' },
]

export function TextGenerator({ onGenerated, fokus, disabled }: Props) {
  const [stufe, setStufe] = useState<Stufe>('mittel')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function klick() {
    setLoading(true)
    setErr(null)
    try {
      const r = await generiereText({ stufe, fokus: fokus.length > 0 ? fokus : undefined })
      onGenerated(r.text, r.thema)
    } catch (e: any) {
      setErr(e?.message ?? 'Fehler beim Erzeugen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-amber-100/60 border-2 border-amber-200 rounded-2xl p-3 md:p-4">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <span className="font-bold text-amber-900">
          <span aria-hidden>🪄 </span>Beispieltext:
        </span>
        <div
          className="flex gap-1 bg-white rounded-xl p-1 border border-amber-300"
          role="radiogroup"
          aria-label="Schwierigkeitsstufe"
        >
          {STUFEN.map((s) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={stufe === s.key}
              onClick={() => setStufe(s.key)}
              disabled={disabled || loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition
                ${stufe === s.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'}`}
              title={s.beschr}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={klick}
          disabled={loading || disabled}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Schreibt…' : 'Text erzeugen'}
        </button>
        {err && (
          <span role="alert" className="text-red-700 text-sm font-bold">{err}</span>
        )}
      </div>
      <p className="text-xs text-amber-900/70 mt-2">
        Der Text wird von einer KI geschrieben und ist für den Unterricht gedacht.
      </p>
    </div>
  )
}
