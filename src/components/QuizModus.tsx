import { useMemo, useState } from 'react'
import type { Token } from '../types'
import { WORTART_MAP, istWortart, type WortartKey } from '../lib/wortarten'

const KEIN_LEERZEICHEN_DAVOR = new Set([
  '.', ',', ';', ':', '!', '?', ')', ']', '}', '»', '…', "'", '"', '–', '—',
])
const OEFFNENDE = new Set(['(', '[', '{', '„', '«'])

type Answer = { choice: WortartKey; correct: boolean }

type Props = {
  tokens: Token[]
  auswahl: WortartKey[]
  onNew: () => void
}

export function QuizModus({ tokens, auswahl, onNew }: Props) {
  const availSet = useMemo(() => new Set(auswahl), [auswahl])

  const quizIndices = useMemo(
    () =>
      tokens
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => istWortart(t.wortart) && availSet.has(t.wortart))
        .map(({ i }) => i),
    [tokens, availSet],
  )

  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const total = quizIndices.length
  const answered = Object.keys(answers).length
  const richtig = Object.values(answers).filter((a) => a.correct).length
  const falsch = answered - richtig
  const allDone = total > 0 && answered >= total

  function klickeWort(i: number) {
    if (answers[i]) {
      setRevealedIdx((r) => (r === i ? null : i))
      return
    }
    setSelectedIdx((s) => (s === i ? null : i))
    setRevealedIdx(null)
  }

  function waehleWortart(k: WortartKey) {
    if (selectedIdx === null) return
    const i = selectedIdx
    const istRichtig = tokens[i].wortart === k
    setAnswers((a) => ({ ...a, [i]: { choice: k, correct: istRichtig } }))
    setSelectedIdx(null)
  }

  function neustart() {
    setAnswers({})
    setSelectedIdx(null)
    setRevealedIdx(null)
    setResetKey((k) => k + 1)
  }

  if (total === 0) {
    return (
      <div className="bg-amber-100 border-2 border-amber-200 rounded-2xl p-5 text-center space-y-3">
        <p className="font-bold text-amber-900">
          Dieser Text enthält keine Wörter zu den gewählten Wortarten. Wähle andere aus oder nimm einen neuen Text.
        </p>
        <button
          type="button"
          onClick={onNew}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
        >
          Zurück zur Auswahl
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4" key={resetKey}>
      <FortschrittsBalken richtig={richtig} falsch={falsch} total={total} />

      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-1 text-slate-700">
          <span aria-hidden>🎯 </span>Klicke auf ein Wort und wähle dann die passende Wortart.
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Grün = richtig. Rot = leider falsch. Klicke nach der Antwort nochmal aufs Wort für die Begründung.
        </p>
        <p className="text-xl md:text-2xl leading-[2.6] break-words">
          {tokens.map((t, i) => {
            const vor = i > 0 ? tokens[i - 1] : undefined
            const leer =
              i === 0
                ? ''
                : KEIN_LEERZEICHEN_DAVOR.has(t.wort) || (vor && OEFFNENDE.has(vor.wort))
                ? ''
                : ' '
            return (
              <span key={i}>
                {leer}
                <WortChip
                  token={t}
                  answer={answers[i]}
                  isSelected={selectedIdx === i}
                  isRevealed={revealedIdx === i}
                  available={availSet}
                  onClick={() => klickeWort(i)}
                />
              </span>
            )
          })}
        </p>
      </div>

      {!allDone && (
        <WortartLeiste
          auswahl={auswahl}
          wort={selectedIdx !== null ? tokens[selectedIdx].wort : null}
          onChoose={waehleWortart}
          onCancel={() => setSelectedIdx(null)}
        />
      )}

      {allDone && (
        <FertigKarte richtig={richtig} total={total} onRestart={neustart} onNew={onNew} />
      )}
    </div>
  )
}

function FortschrittsBalken({
  richtig, falsch, total,
}: { richtig: number; falsch: number; total: number }) {
  const done = richtig + falsch
  const pct = total > 0 ? (done / total) * 100 : 0
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-green-700" aria-label={`${richtig} richtig`}>
            <span aria-hidden>✅</span> {richtig}
          </span>
          <span className="text-red-700" aria-label={`${falsch} falsch`}>
            <span aria-hidden>❌</span> {falsch}
          </span>
          <span className="text-slate-500" aria-label={`${total - done} offen`}>
            <span aria-hidden>📝</span> {total - done}
          </span>
        </div>
        <span className="text-sm font-bold text-slate-700 tabular-nums">
          {done} / {total}
        </span>
      </div>
      <div
        className="h-2.5 rounded-full bg-slate-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function WortChip({
  token, answer, isSelected, isRevealed, available, onClick,
}: {
  token: Token
  answer: Answer | undefined
  isSelected: boolean
  isRevealed: boolean
  available: Set<WortartKey>
  onClick: () => void
}) {
  if (token.wortart === 'Satzzeichen') {
    return <span className="text-slate-500">{token.wort}</span>
  }
  if (!istWortart(token.wortart) || !available.has(token.wortart)) {
    return <span className="text-slate-400">{token.wort}</span>
  }

  const korrekt = token.wortart
  const infoK = WORTART_MAP[korrekt]
  let state: 'offen' | 'richtig' | 'falsch' = 'offen'
  if (answer) state = answer.correct ? 'richtig' : 'falsch'

  let cls = 'px-2 py-0.5 rounded-md font-semibold border-2 transition select-none align-baseline'
  if (state === 'offen') {
    cls += isSelected
      ? ' bg-blue-100 text-blue-900 border-blue-600 ring-4 ring-blue-200 cursor-pointer'
      : ' bg-blue-50 text-blue-800 border-dashed border-blue-400 hover:bg-blue-100 cursor-pointer'
  } else if (state === 'richtig') {
    cls += ` ${infoK.bg} ${infoK.text} border-green-600 cursor-help`
  } else {
    cls += ' bg-red-100 text-red-900 border-red-500 cursor-help'
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={onClick}
        className={cls}
        aria-label={ariaLabel(token, state, answer, korrekt)}
      >
        {state === 'richtig' && <span aria-hidden className="mr-1 text-green-700">✓</span>}
        {state === 'falsch' && <span aria-hidden className="mr-1 text-red-700">✗</span>}
        {token.wort}
      </button>
      {state === 'falsch' && answer && (
        <span className="ml-1 inline-flex items-baseline text-sm">
          <span aria-hidden className="text-slate-400 mr-1">→</span>
          <span className={`${infoK.bg} ${infoK.text} px-1.5 py-0.5 rounded-md font-bold`}>
            <span aria-hidden>{infoK.emoji}</span> {infoK.label}
          </span>
        </span>
      )}
      {isRevealed && answer && token.begruendung && (
        <span
          role="tooltip"
          className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-slate-900 text-white text-sm font-normal rounded-xl p-3 shadow-2xl leading-snug"
        >
          {token.begruendung}
          {token.grundform && token.grundform !== token.wort && (
            <span className="block opacity-70 mt-1 text-xs">Grundform: {token.grundform}</span>
          )}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-slate-900"
          />
        </span>
      )}
    </span>
  )
}

function ariaLabel(
  token: Token,
  state: 'offen' | 'richtig' | 'falsch',
  answer: Answer | undefined,
  korrekt: WortartKey,
) {
  const info = WORTART_MAP[korrekt]
  if (state === 'offen') return `${token.wort}: noch offen. Klicken, um die Wortart auszuwählen.`
  if (state === 'richtig') return `${token.wort}: richtig als ${info.label} bestimmt.`
  return `${token.wort}: falsch. Du hattest ${answer?.choice}, richtig ist ${info.label}.`
}

function WortartLeiste({
  auswahl, wort, onChoose, onCancel,
}: {
  auswahl: WortartKey[]
  wort: string | null
  onChoose: (k: WortartKey) => void
  onCancel: () => void
}) {
  const aktiv = wort !== null
  return (
    <div
      className={`sticky bottom-2 z-10 bg-white rounded-2xl p-4 shadow-lg border-2 transition-colors
        ${aktiv ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-200'}`}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="font-bold text-slate-700 leading-tight">
          {aktiv ? (
            <>
              Welche Wortart ist{' '}
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900">»{wort}«</span>?
            </>
          ) : (
            <span className="text-slate-500 font-normal">
              <span aria-hidden>👆 </span>Klicke zuerst auf ein Wort oben.
            </span>
          )}
        </div>
        {aktiv && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 hover:underline"
          >
            Abbrechen
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {auswahl.map((k) => {
          const info = WORTART_MAP[k]
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChoose(k)}
              disabled={!aktiv}
              className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl ${info.bg} ${info.text}
                font-bold text-sm hover:ring-2 ${info.ring} focus-visible:ring-2 transition
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:ring-0`}
            >
              <span className="text-lg flex-shrink-0" aria-hidden>{info.emoji}</span>
              <span className="truncate">{info.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FertigKarte({
  richtig, total, onRestart, onNew,
}: {
  richtig: number
  total: number
  onRestart: () => void
  onNew: () => void
}) {
  const pct = Math.round((richtig / total) * 100)
  let emoji = '🎉'
  let msg = 'Gut gemacht!'
  if (pct === 100) { emoji = '🌟'; msg = 'Perfekt! Du hast jedes Wort richtig!' }
  else if (pct >= 80) { emoji = '💪'; msg = 'Super! Fast alles richtig.' }
  else if (pct >= 50) { emoji = '🙂'; msg = 'Gut! Übe weiter – du wirst immer besser.' }
  else { emoji = '🌱'; msg = 'Dran bleiben! Jeder Versuch bringt dich weiter.' }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-2xl p-6 text-center shadow-sm">
      <div className="text-6xl mb-2" aria-hidden>{emoji}</div>
      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">{msg}</h3>
      <p className="text-lg text-slate-600 mt-2">
        <span className="font-extrabold text-3xl text-blue-700">{richtig}</span> von{' '}
        <span className="font-bold">{total}</span> richtig — das sind{' '}
        <span className="font-bold">{pct}%</span>.
      </p>
      <div className="mt-5 flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
        >
          ↺ Gleicher Text nochmal
        </button>
        <button
          type="button"
          onClick={onNew}
          className="px-5 py-3 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
        >
          📝 Anderer Text
        </button>
      </div>
    </div>
  )
}
