import { useId } from 'react'

type Props = {
  text: string
  onChange: (t: string) => void
  maxLength: number
  disabled?: boolean
}

export function TextInput({ text, onChange, maxLength, disabled }: Props) {
  const id = useId()
  const rest = maxLength - text.length
  const warn = rest < 100
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-bold mb-2 text-slate-700">
        <span aria-hidden>📝 </span>Dein Text
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        disabled={disabled}
        rows={7}
        placeholder="Schreibe oder füge hier einen Text ein. Tipp: Ein Beispieltext geht weiter unten per Klick."
        className="w-full rounded-2xl border-2 border-slate-300 bg-white p-4 text-lg leading-relaxed shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-500"
      />
      <div className={`text-sm text-right mt-1 ${warn ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
        {text.length} / {maxLength} Zeichen
      </div>
    </div>
  )
}
