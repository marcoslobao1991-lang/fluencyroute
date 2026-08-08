// Login de UM TOQUE do aluno de espanhol.
//
// O aluno recebe no e-mail de entrega um link .../spanish-app.html?k=<token>.
// O app troca esse token por uma sessão aqui e passa a salvar o progresso na
// nuvem sem o aluno digitar nada. O token é durável de propósito: e-mail de
// compra é aberto dias depois, e um magic link do Supabase (1h) já teria vencido.
//
// O token só dá acesso ao progresso do próprio aluno (tabela spanish_progress,
// protegida por RLS). O app de espanhol em si é público.

import { NextRequest, NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldHJ0ZXdpc21ocHppZGNtbXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDg3NDYsImV4cCI6MjA4OTM4NDc0Nn0.CTGC11dPKawf3tFWrEu9jXgxn2oPmPMXQS9bFcN4o10'

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ error: 'no service key' }, { status: 500 })

  let body: { k?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const token = String(body.k || '')
  if (!/^[a-f0-9]{32,64}$/.test(token)) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  }

  const admin = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  const look = await fetch(
    `${SUPA_URL}/rest/v1/spanish_access?select=email,user_id&token=eq.${encodeURIComponent(token)}&limit=1`,
    { headers: admin }
  )
  const rows = await look.json().catch(() => [])
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return NextResponse.json({ error: 'unknown_token' }, { status: 404 })

  // gera um magic link e resgata na hora — o resultado é uma sessão de verdade
  const gen = await fetch(`${SUPA_URL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: admin,
    body: JSON.stringify({ type: 'magiclink', email: row.email }),
  })
  const genJson = await gen.json().catch(() => ({}))
  const hashed = genJson?.hashed_token
  if (!hashed) {
    console.error('[spanish-signin] generate_link', gen.status, JSON.stringify(genJson).slice(0, 200))
    return NextResponse.json({ error: 'link_failed' }, { status: 502 })
  }

  const ver = await fetch(`${SUPA_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', token_hash: hashed }),
  })
  const sess = await ver.json().catch(() => ({}))
  if (!sess?.access_token) {
    console.error('[spanish-signin] verify', ver.status, JSON.stringify(sess).slice(0, 200))
    return NextResponse.json({ error: 'session_failed' }, { status: 502 })
  }

  fetch(`${SUPA_URL}/rest/v1/spanish_access?token=eq.${encodeURIComponent(token)}`, {
    method: 'PATCH',
    headers: { ...admin, Prefer: 'return=minimal' },
    body: JSON.stringify({ last_used_at: new Date().toISOString() }),
  }).catch(() => {})

  return NextResponse.json({
    ok: true,
    access_token: sess.access_token,
    refresh_token: sess.refresh_token,
    email: row.email,
    user_id: row.user_id,
  })
}
