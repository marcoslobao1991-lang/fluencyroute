import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Webhook do UPSELL "Fluency Route: Acesso Vitalício" (produto Kiwify d7acaf90, checkout kSlC9xJ, R$96).
// Rota própria (token próprio) pra não tocar no webhook principal:
//  - NÃO dispara Purchase no Meta (o comprador já gerou o Purchase da compra principal;
//    um 2º Purchase por pessoa inflaria a conversão que as campanhas otimizam).
//  - Grava o pedido em orders (receita real no painel).
//  - Dá o acesso vitalício: o app lê a subscription MAIS RECENTE do usuário (created_at desc),
//    então basta inserir uma linha plan='lifetime' com expires_at 2099.
//  - Reembolso/chargeback do vitalício: a linha lifetime volta pra validade da anual
//    (o aluno não perde o ano que pagou na compra principal).

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const RESEND_API_KEY = process.env.RESEND_API_KEY
const TOKEN = process.env.KIWIFY_VITALICIO_TOKEN || ''
const LIFETIME_EXPIRES = '2099-12-31T23:59:59.000Z'

const H = () => ({
  apikey: SUPA_SERVICE_KEY,
  Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
})

function verify(rawBody: string, sig: string | null): boolean {
  if (!TOKEN) return false // sem token configurado = não aceita nada
  if (!sig) return false
  const expected = crypto.createHmac('sha1', TOKEN).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(sig, 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/get_user_id_by_email`, {
      method: 'POST', headers: H(), body: JSON.stringify({ p_email: email }),
    })
    const uid = await r.json()
    if (!uid || typeof uid !== 'string') return null
    return uid.replace(/"/g, '')
  } catch { return null }
}

async function createUser(email: string, name: string, phone: string): Promise<string | null> {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) password += chars[Math.floor(Math.random() * chars.length)]
  const r = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    method: 'POST', headers: H(),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: name, phone } }),
  })
  const d = await r.json().catch(() => ({}))
  return d?.id || null
}

async function avisaMarcos(subject: string, html: string) {
  if (!RESEND_API_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Rota da Fluência <contato@acesso.fluencyroute.com.br>',
      to: 'marcoslobao1991@gmail.com',
      subject, html,
    }),
  }).catch(() => {})
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const url = new URL(req.url)
    if (!verify(rawBody, url.searchParams.get('signature'))) {
      console.warn('[Vitalício] assinatura inválida')
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
    }
    const body = JSON.parse(rawBody)
    const status = String(body.order_status || '')
    const eventType = String(body.webhook_event_type || '')
    const customer = body.Customer || body.customer || {}
    const email = String(customer.email || '').toLowerCase().trim()
    const name = String(customer.full_name || '')
    const phone = String(customer.mobile || customer.phone || '').replace(/\D/g, '')
    const orderId = String(body.order_id || '')
    const isTest = /@example\.com$/i.test(email)

    // ═══ REEMBOLSO / CHARGEBACK do vitalício ═══
    if (status === 'refunded' || status === 'chargedback' || /refund|chargeback/i.test(eventType)) {
      if (isTest) return NextResponse.json({ ok: true, mode: 'test_skipped' })
      const nowIso = new Date().toISOString()
      if (orderId) {
        await fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH', headers: H(), body: JSON.stringify({ status: 'refunded', refunded_at: nowIso }),
        }).catch(() => {})
      }
      // volta a linha lifetime pra validade da assinatura anual anterior
      let novaValidade = nowIso
      const uid = email ? await findUserIdByEmail(email) : null
      if (uid) {
        const r = await fetch(
          `${SUPA_URL}/rest/v1/subscriptions?user_id=eq.${uid}&plan=eq.annual&status=eq.active&select=expires_at&order=expires_at.desc&limit=1`,
          { headers: H() })
        const rows = await r.json().catch(() => [])
        if (Array.isArray(rows) && rows[0]?.expires_at) novaValidade = rows[0].expires_at
      }
      if (orderId) {
        await fetch(`${SUPA_URL}/rest/v1/subscriptions?pagarme_order_id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH', headers: H(),
          body: JSON.stringify({ plan: 'lifetime_refunded', expires_at: novaValidade }),
        }).catch(() => {})
      }
      await avisaMarcos(`🔴 Reembolso do VITALÍCIO: ${email}`,
        `<p>Evento: <b>${eventType || status}</b></p><p>Cliente: <b>${email}</b> · pedido ${orderId}</p><p>O vitalício foi desfeito; o acesso volta a vencer em ${novaValidade.slice(0, 10)}.</p>`)
      return NextResponse.json({ ok: true, refund: true })
    }

    if (status !== 'paid') return NextResponse.json({ ok: true, skipped: status })
    if (!email) return NextResponse.json({ error: 'sem_email' }, { status: 400 })
    if (isTest) return NextResponse.json({ ok: true, mode: 'test_skipped' })

    const rawValue = body.Commissions?.charge_amount ?? body.Product?.price ?? 0
    const valueCents = typeof rawValue === 'string' ? parseInt(rawValue, 10) || 0 : Math.round(Number(rawValue) || 0)
    const productName = body.Product?.product_name || 'Fluency Route: Acesso Vitalício'

    // dedup atômico pelo UNIQUE de orders.pagarme_order_id
    const ins = await fetch(`${SUPA_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...H(), Prefer: 'return=minimal' },
      body: JSON.stringify({
        pagarme_order_id: orderId, customer_name: name, customer_email: email,
        product: productName, amount_cents: valueCents, payment_method: 'kiwify', status: 'paid',
      }),
    })
    if (ins.status === 409) return NextResponse.json({ ok: true, duplicate: true })
    if (!ins.ok) {
      const t = await ins.text().catch(() => '')
      console.error(`[Vitalício] orders insert HTTP ${ins.status}: ${t.slice(0, 200)}`)
      return NextResponse.json({ error: 'order_insert_failed' }, { status: 500 })
    }

    let uid = await findUserIdByEmail(email)
    let criado = false
    if (!uid) { uid = await createUser(email, name, phone); criado = !!uid }
    if (!uid) {
      await avisaMarcos(`⚠️ Vitalício SEM usuário: ${email}`,
        `<p>Venda do vitalício (${orderId}) de <b>${email}</b>, mas não achei nem consegui criar o usuário no app. Liberar na mão.</p>`)
      return NextResponse.json({ ok: false, error: 'user_not_found' })
    }

    const sub = await fetch(`${SUPA_URL}/rest/v1/subscriptions`, {
      method: 'POST', headers: H(),
      body: JSON.stringify({
        user_id: uid, status: 'active', plan: 'lifetime', pagarme_order_id: orderId,
        started_at: new Date().toISOString(), expires_at: LIFETIME_EXPIRES,
      }),
    })
    if (!sub.ok) {
      const t = await sub.text().catch(() => '')
      console.error(`[Vitalício] subscription insert HTTP ${sub.status}: ${t.slice(0, 200)}`)
      await avisaMarcos(`⚠️ Vitalício não liberado: ${email}`, `<p>Falha ao gravar a assinatura vitalícia (${sub.status}). Pedido ${orderId}. Liberar na mão.</p>`)
      return NextResponse.json({ error: 'sub_insert_failed' }, { status: 500 })
    }

    await avisaMarcos(`💰 Upsell VITALÍCIO R$${(valueCents / 100).toFixed(2)}: ${name || email}`,
      `<p>👤 <b>${name}</b><br>📧 ${email}<br>💵 R$${(valueCents / 100).toFixed(2)} · ${productName}<br>🆔 ${orderId}</p><p>✅ Acesso vitalício liberado no app (até 2099)${criado ? ' · conta criada agora' : ''}.</p>`)
    console.log(`[Vitalício] liberado ${email} uid=${uid} order=${orderId}`)
    return NextResponse.json({ ok: true, lifetime: true })
  } catch (e: any) {
    console.error('[Vitalício] erro:', e?.message)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
