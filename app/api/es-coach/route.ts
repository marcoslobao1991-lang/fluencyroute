// 28/11/2026 · Fast-Track da LATAM (upsell 2 / downsell do funil TRANSFER LANGUAGE): estado do aluno em /es-coach.html.
// SEPARADO do espanhol (Marcos: "cuidado pra não misturar"): não usa spanish_access nem spanish_coach.
//   - link do e-mail: ?k=<base64url(email)>.<hmac>  (assinado com SUPABASE_SERVICE_KEY; quem gera é o webhook da LATAM,
//     repo fluencyroute-latam, app/lib/coach.ts — a fórmula tem que ser IGUAL nos dois lados)
//   - estado e plano ficam no auth do comprador: app_metadata.latam_coach = { plano: 'fast'|'lite', desde, data }
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const H = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' })

function emailDoToken(key: string, k: string): string | null {
  const [b, sig] = String(k || '').split('.')
  if (!b || !sig) return null
  let email = ''
  try { email = Buffer.from(b, 'base64url').toString('utf8').trim().toLowerCase() } catch { return null }
  const ok = crypto.createHmac('sha256', key).update('latam-coach:' + email).digest('hex').slice(0, 24)
  if (sig.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(ok))) return null
  return /^[^@\s]+@[^@\s]+$/.test(email) ? email : null
}

async function usuario(key: string, email: string) {
  const r = await fetch(`${SUPA_URL}/rest/v1/rpc/get_user_id_by_email`, { method: 'POST', headers: H(key), body: JSON.stringify({ p_email: email }), cache: 'no-store' })
  const uid = String((await r.json().catch(() => '')) || '').replace(/"/g, '')
  if (!uid) return null
  const u = await fetch(`${SUPA_URL}/auth/v1/admin/users/${uid}`, { headers: H(key), cache: 'no-store' }).then((x) => x.json()).catch(() => null)
  return u?.id ? u : null
}

export async function GET(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ ok: false, error: 'config' }, { status: 500 })
  const email = emailDoToken(key, req.nextUrl.searchParams.get('k') || '')
  if (!email) return NextResponse.json({ ok: false, error: 'link' }, { status: 401 })
  const u = await usuario(key, email)
  const c = u?.app_metadata?.latam_coach
  if (!c?.plano) return NextResponse.json({ ok: false, error: 'not_coach' }, { status: 403 })
  return NextResponse.json({ ok: true, since: c.desde || null, data: c.data || {}, plano: c.plano }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ ok: false }, { status: 500 })
  let body: { k?: string; data?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const email = emailDoToken(key, String(body.k || ''))
  if (!email) return NextResponse.json({ ok: false, error: 'link' }, { status: 401 })
  const data = body.data && typeof body.data === 'object' ? body.data : {}
  if (JSON.stringify(data).length > 30000) return NextResponse.json({ ok: false, error: 'big' }, { status: 413 })
  const u = await usuario(key, email)
  const c = u?.app_metadata?.latam_coach
  if (!c?.plano) return NextResponse.json({ ok: false, error: 'not_coach' }, { status: 403 })
  const r = await fetch(`${SUPA_URL}/auth/v1/admin/users/${u.id}`, {
    method: 'PUT', headers: H(key),
    body: JSON.stringify({ app_metadata: { ...u.app_metadata, latam_coach: { ...c, data } } }),
  })
  return NextResponse.json({ ok: r.ok })
}
