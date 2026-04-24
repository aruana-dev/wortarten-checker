export type WortartKey =
  | 'Nomen'
  | 'Verb'
  | 'Adjektiv'
  | 'Artikel'
  | 'Pronomen'
  | 'Adverb'
  | 'Präposition'
  | 'Konjunktion'
  | 'Numerale'
  | 'Interjektion'

export type WortartInfo = {
  key: WortartKey
  label: string
  kurz: string
  emoji: string
  beispiel: string
  bg: string
  text: string
  ring: string
  dot: string
}

export const WORTARTEN: WortartInfo[] = [
  {
    key: 'Nomen',
    label: 'Nomen',
    kurz: 'Dinge, Menschen, Tiere',
    emoji: '🏠',
    beispiel: 'Hund, Schule, Freude',
    bg: 'bg-blue-200',
    text: 'text-blue-900',
    ring: 'ring-blue-500',
    dot: 'bg-blue-500',
  },
  {
    key: 'Verb',
    label: 'Verb',
    kurz: 'Was passiert oder getan wird',
    emoji: '⚡',
    beispiel: 'laufen, denken, sein',
    bg: 'bg-red-200',
    text: 'text-red-900',
    ring: 'ring-red-500',
    dot: 'bg-red-500',
  },
  {
    key: 'Adjektiv',
    label: 'Adjektiv',
    kurz: 'Wie etwas ist',
    emoji: '🎨',
    beispiel: 'schnell, blau, müde',
    bg: 'bg-green-200',
    text: 'text-green-900',
    ring: 'ring-green-600',
    dot: 'bg-green-600',
  },
  {
    key: 'Artikel',
    label: 'Artikel',
    kurz: 'der, die, das, ein …',
    emoji: '🔖',
    beispiel: 'der, eine, kein',
    bg: 'bg-purple-200',
    text: 'text-purple-900',
    ring: 'ring-purple-500',
    dot: 'bg-purple-500',
  },
  {
    key: 'Pronomen',
    label: 'Pronomen',
    kurz: 'ich, du, er, sie …',
    emoji: '👤',
    beispiel: 'ich, mein, dieser',
    bg: 'bg-pink-200',
    text: 'text-pink-900',
    ring: 'ring-pink-500',
    dot: 'bg-pink-500',
  },
  {
    key: 'Adverb',
    label: 'Adverb',
    kurz: 'Wann, wo, wie, warum',
    emoji: '📍',
    beispiel: 'heute, dort, sehr',
    bg: 'bg-teal-200',
    text: 'text-teal-900',
    ring: 'ring-teal-600',
    dot: 'bg-teal-600',
  },
  {
    key: 'Präposition',
    label: 'Präposition',
    kurz: 'in, auf, mit, ohne …',
    emoji: '🔗',
    beispiel: 'in, auf, mit',
    bg: 'bg-amber-200',
    text: 'text-amber-900',
    ring: 'ring-amber-600',
    dot: 'bg-amber-600',
  },
  {
    key: 'Konjunktion',
    label: 'Konjunktion',
    kurz: 'und, oder, aber, weil …',
    emoji: '🪢',
    beispiel: 'und, aber, weil',
    bg: 'bg-indigo-200',
    text: 'text-indigo-900',
    ring: 'ring-indigo-500',
    dot: 'bg-indigo-500',
  },
  {
    key: 'Numerale',
    label: 'Numerale',
    kurz: 'Zahlwörter',
    emoji: '🔢',
    beispiel: 'eins, viele, dritte',
    bg: 'bg-orange-200',
    text: 'text-orange-900',
    ring: 'ring-orange-500',
    dot: 'bg-orange-500',
  },
  {
    key: 'Interjektion',
    label: 'Interjektion',
    kurz: 'Ausrufe',
    emoji: '💥',
    beispiel: 'ach, oh, juhu',
    bg: 'bg-rose-200',
    text: 'text-rose-900',
    ring: 'ring-rose-500',
    dot: 'bg-rose-500',
  },
]

export const WORTART_MAP: Record<WortartKey, WortartInfo> = Object.fromEntries(
  WORTARTEN.map((w) => [w.key, w]),
) as Record<WortartKey, WortartInfo>

export const ALLE_WORTARTEN: WortartKey[] = WORTARTEN.map((w) => w.key)

export function istWortart(x: string): x is WortartKey {
  return x in WORTART_MAP
}
