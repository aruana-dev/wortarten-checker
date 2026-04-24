import { WORTARTEN, type WortartKey } from '../lib/wortarten'

type Props = {
  selected: Set<WortartKey>
  onToggle: (k: WortartKey) => void
  onAll: () => void
  onNone: () => void
  disabled?: boolean
}

export function WortartenMenu({ selected, onToggle, onAll, onNone, disabled }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-700">
          <span aria-hidden>🎯 </span>Welche Wortarten?
        </h2>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={onAll}
            disabled={disabled}
            className="text-blue-600 hover:underline font-bold disabled:opacity-50"
          >
            Alle
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onNone}
            disabled={disabled}
            className="text-slate-500 hover:underline font-bold disabled:opacity-50"
          >
            Keine
          </button>
        </div>
      </div>
      <ul className="space-y-2" role="group" aria-label="Wortarten auswählen">
        {WORTARTEN.map((w) => {
          const isOn = selected.has(w.key)
          return (
            <li key={w.key}>
              <button
                type="button"
                onClick={() => onToggle(w.key)}
                disabled={disabled}
                aria-pressed={isOn}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition
                  ${isOn
                    ? `${w.bg} ${w.text} border-transparent shadow-sm`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-2xl leading-none" aria-hidden>{w.emoji}</span>
                <span className="flex-1 min-w-0">
                  <div className="font-bold leading-tight">{w.label}</div>
                  <div className={`text-sm leading-tight ${isOn ? 'opacity-80' : 'text-slate-500'}`}>
                    {w.kurz}
                  </div>
                </span>
                <span
                  aria-hidden
                  className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center font-bold
                    ${isOn ? 'bg-white/70 border-current' : 'border-slate-300'}`}
                >
                  {isOn ? '✓' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-slate-500 mt-3">
        Nur ausgewählte Wortarten werden im Ergebnis farbig markiert.
      </p>
    </div>
  )
}
