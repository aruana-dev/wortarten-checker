import type {
  AnalyseRequest, AnalyseResponse,
  GenerierenRequest, GenerierenResponse,
} from '../types'

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    let msg = 'Etwas ist schiefgelaufen.'
    try { msg = (await r.json())?.error ?? msg } catch {}
    throw new Error(msg)
  }
  return r.json() as Promise<TRes>
}

export const analysiereText = (req: AnalyseRequest) =>
  post<AnalyseRequest, AnalyseResponse>('/api/analyse', req)

export const generiereText = (req: GenerierenRequest) =>
  post<GenerierenRequest, GenerierenResponse>('/api/generiere', req)
