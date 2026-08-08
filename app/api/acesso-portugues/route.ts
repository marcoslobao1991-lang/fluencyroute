// Entrada instantânea do aluno do Português Cantado.
//
// POST {email}: se o e-mail tem acesso ativo ao módulo portugues_cantado, devolve
// um magic link pro app do Maestro — o aluno entra na hora, sem senha e sem
// depender de e-mail.
//
// Por que existe: em 08/08/2026 medimos que **63% dos compradores nunca tinham
// entrado** no produto. O e-mail de acesso cai no spam (o subdomínio de envio é o
// mesmo das campanhas em massa), então quem perde esse e-mail some. Esta página é
// o caminho alternativo — vai na área de membros da Kiwify e na resposta de
// suporte. Mesma receita já usada no inglês (/api/acesso-magico).
//
// Trade-off aceito (igual ao do inglês): quem souber o e-mail de um comprador
// entra na conta dele. O produto é um curso de R$97 e o custo do atrito é alto
// demais (63% sem entrar). Se um dia virar problema, o passo é pedir um segundo
// dado (CPF do pedido) antes de liberar o link.

import { NextRequest, NextResponse } from 'next/server'

const SUPA = 'https://petrtewismhpzidcmmwb.supabase.co'
const APP_URL = 'https://maestro-concursos-app.vercel.app'
const MODULE_ID = 'portugues_cantado'

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ ok: false, motivo: 'config' }, { status: 500 })
  const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  let body: { email?: string }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, motivo: 'bad_json' }, { status: 400 }) }

  const email = String(body.email || '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, motivo: 'email_invalido' })
  }

  // 1. tem acesso ativo ao Português Cantado?
  const mod = await fetch(
    `${SUPA}/rest/v1/maestro_user_modules?select=id&module_id=eq.${MODULE_ID}&status=eq.active&email=ilike.${encodeURIComponent(email)}&limit=1`,
    { headers: H, cache: 'no-store' }
  )
  const linhas = await mod.json().catch(() => [])
  if (!Array.isArray(linhas) || linhas.length === 0) {
    return NextResponse.json({ ok: false, motivo: 'compra_nao_encontrada' })
  }

  // 2. magic link pro app (o AuthGate lê a sessão do hash da URL)
  const gl = await fetch(`${SUPA}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ type: 'magiclink', email, options: { redirect_to: APP_URL } }),
  })
  const glJson: { action_link?: string; properties?: { action_link?: string } } = await gl.json().catch(() => ({}))
  const link = glJson?.action_link || glJson?.properties?.action_link
  if (!gl.ok || !link) {
    console.error('[acesso-portugues] generate_link', gl.status, JSON.stringify(glJson).slice(0, 200))
    return NextResponse.json({ ok: false, motivo: 'erro_link' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, link })
}
