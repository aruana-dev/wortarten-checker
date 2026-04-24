import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Anthropic from '@anthropic-ai/sdk'
import { ANALYSE_SYSTEM, GEN_SYSTEM, ANALYSE_TOOL, GEN_TOOL } from './prompts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY fehlt. Bitte in .env eintragen.')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey })
const MODEL = 'claude-sonnet-4-6'
const MAX_TEXT = 2000

const WORTARTEN_ERLAUBT = new Set([
  'Nomen', 'Verb', 'Adjektiv', 'Artikel', 'Pronomen',
  'Adverb', 'Präposition', 'Konjunktion', 'Numerale', 'Interjektion',
])

const app = express()
app.use(express.json({ limit: '200kb' }))

app.post('/api/analyse', async (req, res) => {
  const { text, ausgewaehlt } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Kein Text gesendet.' })
  }
  if (text.length > MAX_TEXT) {
    return res.status(400).json({ error: `Text zu lang (max. ${MAX_TEXT} Zeichen).` })
  }
  const fokus = Array.isArray(ausgewaehlt)
    ? ausgewaehlt.filter((x: unknown) => typeof x === 'string' && WORTARTEN_ERLAUBT.has(x))
    : []

  try {
    const userNachricht = fokus.length > 0
      ? `Fokus auf folgende Wortarten: ${fokus.join(', ')}.\n\nText:\n${text}`
      : `Analysiere alle Wortarten.\n\nText:\n${text}`

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: [{ type: 'text', text: ANALYSE_SYSTEM, cache_control: { type: 'ephemeral' } }],
      tools: [ANALYSE_TOOL as any],
      tool_choice: { type: 'tool', name: 'markiere_wortarten' },
      messages: [{ role: 'user', content: userNachricht }],
    })

    const toolBlock = msg.content.find((c) => c.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      console.error('Kein tool_use in Antwort:', JSON.stringify(msg.content).slice(0, 500))
      return res.status(502).json({ error: 'Die KI hat keine gültige Antwort gegeben.' })
    }
    const input = toolBlock.input as { tokens?: unknown }
    if (!input || !Array.isArray(input.tokens)) {
      return res.status(502).json({ error: 'Die KI-Antwort hatte nicht das erwartete Format.' })
    }
    res.json({ tokens: input.tokens })
  } catch (e: any) {
    console.error('Analyse-Fehler:', e?.message ?? e)
    const status = e?.status ?? 500
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'Die Analyse hat gerade nicht geklappt. Versuche es in einem Moment nochmal.',
    })
  }
})

app.post('/api/generiere', async (req, res) => {
  const { stufe, fokus } = req.body ?? {}
  const stufeOk = stufe === 'leicht' || stufe === 'mittel' || stufe === 'schwer'
  if (!stufeOk) {
    return res.status(400).json({ error: 'Ungültige Stufe.' })
  }
  const fokusListe = Array.isArray(fokus)
    ? fokus.filter((x: unknown) => typeof x === 'string' && WORTARTEN_ERLAUBT.has(x))
    : []

  try {
    const userNachricht = [
      `Schreibe einen Übungstext auf Stufe "${stufe}".`,
      fokusListe.length > 0
        ? `Baue natürlich (ohne Übertreibung) ein paar Beispiele dieser Wortarten ein: ${fokusListe.join(', ')}.`
        : 'Verwende eine Mischung aus verschiedenen Wortarten.',
      'Wähle ein zufälliges kindgerechtes Thema.',
    ].join(' ')

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: 'text', text: GEN_SYSTEM, cache_control: { type: 'ephemeral' } }],
      tools: [GEN_TOOL as any],
      tool_choice: { type: 'tool', name: 'schreibe_uebungstext' },
      messages: [{ role: 'user', content: userNachricht }],
    })

    const toolBlock = msg.content.find((c) => c.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return res.status(502).json({ error: 'Die KI hat keinen Text gesendet.' })
    }
    const input = toolBlock.input as { text?: unknown; thema?: unknown }
    if (typeof input?.text !== 'string' || typeof input?.thema !== 'string') {
      return res.status(502).json({ error: 'KI-Antwort hatte das falsche Format.' })
    }
    res.json({ text: input.text, thema: input.thema })
  } catch (e: any) {
    console.error('Generiere-Fehler:', e?.message ?? e)
    res.status(500).json({ error: 'Der Text konnte gerade nicht erzeugt werden. Probiere es nochmal.' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).end()
  })
})

const port = Number(process.env.PORT) || 3001
app.listen(port, () => {
  console.log(`✅ API läuft auf http://localhost:${port}`)
})
