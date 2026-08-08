// Cria a conta do aluno do Spanish App já CONFIRMADA, pra ele poder logar na hora.
//
// Por que existe: o signup normal do Supabase manda e-mail de confirmação, e o aluno
// (que já pagou na Hotmart) ficaria travado esperando um e-mail pra sincronizar o
// próprio progresso. Aqui o servidor cria com email_confirm:true usando a service key
// e o app faz o login normal em seguida.
//
// A conta serve SÓ pra guardar progresso do app de espanhol (tabela spanish_progress,
// protegida por RLS: cada um só lê/escreve a própria linha). Não dá acesso a
// mais nada — o app de espanhol é aberto de qualquer jeito.

import { NextRequest, NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ error: 'no service key' }, { status: 500 })

  let body: { email?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'weak_password' }, { status: 400 })
  }

  const res = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { app: 'spanish' } }),
  })

  if (res.ok) return NextResponse.json({ ok: true, created: true })

  const detail = await res.text().catch(() => '')
  // já existe = o app manda o aluno fazer login em vez de criar de novo
  if (res.status === 422 || /already been registered|already exists/i.test(detail)) {
    return NextResponse.json({ ok: true, created: false, exists: true })
  }
  console.error('[spanish-account]', res.status, detail.slice(0, 200))
  return NextResponse.json({ error: 'signup_failed' }, { status: 502 })
}
