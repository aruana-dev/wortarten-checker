import type { WortartKey } from './lib/wortarten'

export type TokenWortart = WortartKey | 'Satzzeichen' | 'Unbekannt'

export type Token = {
  wort: string
  wortart: TokenWortart
  begruendung?: string
  grundform?: string
}

export type AnalyseResponse = { tokens: Token[] }
export type AnalyseRequest = { text: string; ausgewaehlt: WortartKey[] }

export type GenerierenRequest = {
  stufe: 'leicht' | 'mittel' | 'schwer'
  fokus?: WortartKey[]
}
export type GenerierenResponse = { text: string; thema: string }
