// app/api/spanish-status/route.ts — status do acesso ao app de espanhol (Essential Spanish Fluency)
//
// 28/11/2026 (Marcos: trick no modelo LATAM): o principal passou a ser 1 ANO de acesso e o vitalício virou o
// upsell 1 (Hotmart 4em11ywm, US$47). Regra:
//   - comprou ANTES de ANUAL_DESDE → vitalício (a página vendia "lifetime")
//   - app_metadata.spanish_lifetime = true (pegou o upgrade; quem marca é o hotmart-webhook) → vitalício
//   - senão → vale 365 dias a partir de spanish_access.created_at
// POST { k } (token do link pessoal) ou { email }. Responde { ok, active, lifetime, expires_at }.
// ⚠️ Ainda NÃO trava o app: a trava entra antes de 28/11/2027, depois de importar os compradores
// de jul–ago/2026 que não têm linha em spanish_access (o registro só existe desde 08/08/2026).
import { NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const ANUAL_DESDE = '2026-11-28T17:00:00Z'
const UM_ANO = 365 * 24 * 3600 * 1000

export async function POST(req: Request) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ error: 'no service key' }, { status: 500 })
  const H = { apikey: key, Authorization: `Bearer ${key}` }
  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }
  const k = String(body.k || ''), email = String(body.email || '').trim().toLowerCase()
  let filtro = ''
  if (/^[a-f0-9]{32,64}$/.test(k)) filtro = `token=eq.${encodeURIComponent(k)}`
  else if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) filtro = `email=eq.${encodeURIComponent(email)}`
  else return NextResponse.json({ error: 'k_ou_email' }, { status: 400 })

  const rows = await fetch(`${SUPA_URL}/rest/v1/spanish_access?select=user_id,email,created_at&${filtro}&order=created_at.asc&limit=1`, { headers: H }).then((r) => r.json()).catch(() => [])
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return NextResponse.json({ ok: false, motivo: 'sem_compra' }, { status: 404 })

  let lifetime = row.created_at < ANUAL_DESDE
  if (!lifetime && row.user_id) {
    const u = await fetch(`${SUPA_URL}/auth/v1/admin/users/${row.user_id}`, { headers: H }).then((r) => r.json()).catch(() => ({}))
    lifetime = !!u?.app_metadata?.spanish_lifetime
  }
  const expires_at = lifetime ? null : new Date(new Date(row.created_at).getTime() + UM_ANO).toISOString()
  const active = lifetime || Date.now() < new Date(expires_at as string).getTime()
  return NextResponse.json({ ok: true, active, lifetime, expires_at, desde: row.created_at })
}
