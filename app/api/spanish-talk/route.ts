// Real Time Talk (upsell 2 do Netflix Trick, 26/11/2026): aula FALADA em tempo real com a Manuela (OpenAI Realtime, voz).
// GET  ?k=<token>                → estado: ativo até quando, aulas usadas na semana, cenas, últimos relatórios
// POST {k, cena}                 → abre uma aula: devolve a chave temporária (ek_) pra o navegador falar direto com a OpenAI (WebRTC)
// POST {k, fim: true, transcript} → fecha a aula: gera o relatório (nota 0-10, o que mandou bem, o que corrigir) e guarda
// Limite: 3 aulas por semana (o que a página de venda promete) e 15 minutos por aula.
import { NextRequest, NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const H = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' })
const POR_SEMANA = 3

const CENAS: Record<string, { t: string; papel: string }> = {
  tacos: { t: 'Ordering tacos', papel: 'a friendly taquero at a street taco stand in Mexico City' },
  hotel: { t: 'Hotel check-in', papel: 'a hotel receptionist in Cancún checking the student in' },
  direcoes: { t: 'Asking for directions', papel: 'a local in Guadalajara the student stops on the street to ask for directions' },
  medico: { t: 'At the doctor', papel: 'a doctor in a clinic asking the student about their symptoms' },
  encontro: { t: 'A first date', papel: 'a charming person on a first date with the student at a café' },
  entrevista: { t: 'Job interview', papel: 'a hiring manager interviewing the student for a job' },
  sogros: { t: 'Meeting the in-laws', papel: "the student's future mother-in-law meeting them for the first time at a family dinner" },
  trabalho: { t: 'Small talk at work', papel: 'a coworker chatting with the student by the coffee machine on a Monday' },
  reclamar: { t: 'Calling to complain', papel: 'a customer service agent on the phone; the student is calling about a wrong delivery' },
  serie: { t: 'Your favorite series', papel: "a friend who loves TV series and wants to hear about the student's favorite show" },
}

async function aluno(key: string, k: string) {
  if (!/^[a-f0-9]{32,64}$/i.test(k)) return null
  const a = await (await fetch(`${SUPA_URL}/rest/v1/spanish_access?select=email&token=eq.${encodeURIComponent(k)}&limit=1`, { headers: H(key), cache: 'no-store' })).json().catch(() => [])
  if (!Array.isArray(a) || !a[0]) return null
  const email = String(a[0].email).toLowerCase()
  const c = await (await fetch(`${SUPA_URL}/rest/v1/spanish_coach?select=data,talk_ate&email=eq.${encodeURIComponent(email)}&limit=1`, { headers: H(key), cache: 'no-store' })).json().catch(() => [])
  if (!Array.isArray(c) || !c[0]) return { email, ativo: false, data: {} as any, ate: null as string | null }
  const ate = c[0].talk_ate as string | null
  return { email, ativo: !!ate && new Date(ate).getTime() > Date.now(), data: (c[0].data || {}) as any, ate }
}
const naSemana = (log: any[]) => (log || []).filter((x) => Date.now() - new Date(x.ini).getTime() < 7 * 864e5).length
async function salva(key: string, email: string, data: any) {
  await fetch(`${SUPA_URL}/rest/v1/spanish_coach?email=eq.${encodeURIComponent(email)}`, { method: 'PATCH', headers: H(key), body: JSON.stringify({ data, updated_at: new Date().toISOString() }) })
}

export async function GET(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ ok: false }, { status: 500 })
  const a = await aluno(key, req.nextUrl.searchParams.get('k') || '')
  if (!a) return NextResponse.json({ ok: false, error: 'link' }, { status: 401 })
  if (!a.ativo) return NextResponse.json({ ok: false, error: 'not_talk' }, { status: 403 })
  const log = a.data.talk_log || []
  return NextResponse.json({ ok: true, ate: a.ate, usadas: naSemana(log), porSemana: POR_SEMANA, cenas: Object.entries(CENAS).map(([id, c]) => ({ id, t: c.t })), relatorios: (a.data.talk_reports || []).slice(-5).reverse() }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY, OK = process.env.OPENAI_API_KEY
  if (!key || !OK) return NextResponse.json({ ok: false }, { status: 500 })
  let b: any
  try { b = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const a = await aluno(key, String(b.k || ''))
  if (!a) return NextResponse.json({ ok: false, error: 'link' }, { status: 401 })
  if (!a.ativo) return NextResponse.json({ ok: false, error: 'not_talk' }, { status: 403 })
  const d = a.data

  // ── fecha a aula: relatório ──
  if (b.fim) {
    const tr = String(b.transcript || '').slice(0, 12000)
    let rel: any = { nota: null, bom: '', corrigir: '' }
    if (tr.length > 40) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { Authorization: `Bearer ${OK}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4.1-mini', temperature: 0.3, response_format: { type: 'json_object' }, messages: [
          { role: 'system', content: 'You evaluate a Spanish speaking lesson between a tutor (Manuela) and an English-speaking student. Judge ONLY the student lines. Be encouraging and specific. Answer JSON: {"nota": 0-10 speaking score, "bom": "1 sentence in English: what they did well, quoting their words", "corrigir": "1-2 sentences in English: the most useful thing to fix, with the correct Spanish"}' },
          { role: 'user', content: tr },
        ] }),
      })
      try { rel = JSON.parse((await r.json())?.choices?.[0]?.message?.content || '{}') } catch {}
    }
    const item = { data: new Date().toISOString().slice(0, 10), cena: CENAS[b.cena]?.t || 'Lesson', nota: typeof rel.nota === 'number' ? Math.max(0, Math.min(10, Math.round(rel.nota))) : null, bom: String(rel.bom || '').slice(0, 300), corrigir: String(rel.corrigir || '').slice(0, 400) }
    d.talk_reports = [...(d.talk_reports || []), item].slice(-60)
    await salva(key, a.email, d)
    return NextResponse.json({ ok: true, relatorio: item })
  }

  // ── abre a aula ──
  const cena = CENAS[String(b.cena || '')] || CENAS.tacos
  const log = d.talk_log || []
  if (naSemana(log) >= POR_SEMANA) return NextResponse.json({ ok: false, error: 'limite', porSemana: POR_SEMANA }, { status: 429 })
  const o = d.onb || {}
  const nivel = o.nivel === 'zero' ? 'a beginner (almost zero Spanish): speak slowly, short simple sentences, and give the English translation of key phrases' : o.nivel === 'medio' ? 'intermediate (understands a lot, freezes when speaking): mostly Spanish, natural pace' : 'a basic learner (knows some words): simple Spanish, slow, English only to unblock'
  const instrucoes = `You are MANUELA, a warm, upbeat Spanish tutor from Mexico at Fluency Route, giving a LIVE spoken lesson by voice. Role-play scene: you are ${cena.papel}. The student is an English speaker learning Mexican Spanish; level: ${nivel}.
Rules:
- Start by greeting the student warmly in Spanish, say in one short line what the scene is (in English too if beginner), then start the role-play.
- Keep YOUR turns short (1-2 sentences) so the student talks most of the time. Always end your turn with a question or a prompt for them.
- When the student makes a mistake, correct it gently and immediately ("Casi, se dice: ..."), ask them to repeat it, then continue the scene.
- Praise specific things they say well. Never judge, never lecture.
- If they switch to English, help them say it in Spanish.
- Around 12-15 minutes, wrap up the scene and tell them one thing they did great and one thing to practice.
- If asked whether you are a real person: you are Fluency Route's A.I. tutor.`
  const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST', headers: { Authorization: `Bearer ${OK}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expires_after: { anchor: 'created_at', seconds: 600 }, session: { type: 'realtime', model: 'gpt-realtime-mini', instructions: instrucoes,
      audio: { output: { voice: 'marin' }, input: { transcription: { model: 'gpt-4o-mini-transcribe' }, turn_detection: { type: 'semantic_vad' } } } } }),
  })
  const j = await r.json().catch(() => ({}))
  if (!j?.value) return NextResponse.json({ ok: false, error: 'voz', det: String(j?.error?.message || '').slice(0, 160) }, { status: 502 })
  d.talk_log = [...log, { ini: new Date().toISOString(), cena: String(b.cena || 'tacos') }].slice(-200)
  await salva(key, a.email, d)
  return NextResponse.json({ ok: true, ek: j.value, model: 'gpt-realtime-mini', restam: POR_SEMANA - naSemana(d.talk_log) })
}
