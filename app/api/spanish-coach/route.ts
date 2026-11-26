// Fluency Fast-Track (upsell do espanhol, 26/11/2026): estado do aluno na página /spanish-coach.html.
// O link do e-mail traz ?k=<token> (o mesmo token de spanish_access que abre o app). Só quem comprou o upsell
// tem linha em spanish_coach. GET devolve o estado; POST salva (onboarding, dias feitos, Accent Check semanal).
import { NextRequest, NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const H = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' })

async function emailDoToken(key: string, k: string): Promise<string | null> {
  if (!/^[a-f0-9]{32,64}$/i.test(k)) return null
  const r = await fetch(`${SUPA_URL}/rest/v1/spanish_access?select=email&token=eq.${encodeURIComponent(k)}&limit=1`, { headers: H(key), cache: 'no-store' })
  const j = await r.json().catch(() => [])
  return Array.isArray(j) && j[0]?.email ? String(j[0].email).toLowerCase() : null
}

export async function GET(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ ok: false, error: 'config' }, { status: 500 })
  const email = await emailDoToken(key, req.nextUrl.searchParams.get('k') || '')
  if (!email) return NextResponse.json({ ok: false, error: 'link' }, { status: 401 })
  const r = await fetch(`${SUPA_URL}/rest/v1/spanish_coach?select=created_at,data&email=eq.${encodeURIComponent(email)}&limit=1`, { headers: H(key), cache: 'no-store' })
  const j = await r.json().catch(() => [])
  if (!Array.isArray(j) || !j[0]) return NextResponse.json({ ok: false, error: 'not_coach' }, { status: 403 })
  return NextResponse.json({ ok: true, since: j[0].created_at, data: j[0].data || {}, first: email.split('@')[0] }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ ok: false }, { status: 500 })
  let body: { k?: string; data?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const email = await emailDoToken(key, String(body.k || ''))
  if (!email) return NextResponse.json({ ok: false, error: 'link' }, { status: 401 })
  const data = body.data && typeof body.data === 'object' ? body.data : {}
  if (JSON.stringify(data).length > 60000) return NextResponse.json({ ok: false, error: 'big' }, { status: 413 })
  const r = await fetch(`${SUPA_URL}/rest/v1/spanish_coach?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH', headers: { ...H(key), Prefer: 'return=minimal' },
    body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
  })
  return NextResponse.json({ ok: r.ok })
}
