// Webhook Kiwify da SOCIEDADE ANTIMARKETING (produto c2037760-e101-11f1-aed5-51a0a97b0f3f,
// checkout pay.kiwify.com.br/3xmhfO3). Criado 15/11/2026.
//
// O que faz:
//  1. compra aprovada  → linha em `orders` (product 'Sociedade Antimarketing', status paid,
//     comprador + UTMs + sck/s1) = base da futura área de membros (quem tem acesso)
//     e linha em `funnel_events` (funnel antimarketing, page obrigado, event purchase)
//     pro painel de stats contar a venda.
//  2. reembolso / chargeback → `orders.status` = refunded | chargedback + refunded_at
//     (a área de membros vai ler isso pra tirar o acesso).
//
// NÃO cria usuário. O Purchase no Meta sai SÓ daqui (CAPI, pixel 1854241865596807):
// o pixel foi tirado do checkout da Kiwify de propósito, senão a compra contava 2x.
//
// Configurar na Kiwify: Apps > Webhooks > produto "Sociedade Antimarketing",
// eventos compra aprovada + reembolso + chargeback, URL:
//   https://fluencyroute.com.br/api/am-kiwify-webhook?token=2fbd378a2e870898627dc6a55321ef58

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const TOKEN = '2fbd378a2e870898627dc6a55321ef58'
const PRODUTO = 'Sociedade Antimarketing'

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ error: 'no service key' }, { status: 500 })
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, any>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  // trava de produto: webhook com escopo errado não pode sujar a Sociedade
  const productName = String(body.Product?.product_name || body.Product?.name || body.product_name || '')
  if (!/antimarketing/i.test(productName)) {
    return NextResponse.json({ ok: true, skipped: 'outro_produto', product: productName.slice(0, 60) })
  }

  const orderId = String(body.order_id || body.Order?.order_id || '')
  if (!orderId) return NextResponse.json({ error: 'no order_id' }, { status: 400 })
  const status = String(body.order_status || body.Order?.order_status || '').toLowerCase()
  const tipo = String(body.webhook_event_type || '').toLowerCase()

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  // ── reembolso / chargeback: marca o pedido (tira o acesso quando a área existir)
  const estorno = /refund|reembols/.test(status + tipo) ? 'refunded'
    : /charge.?back/.test(status + tipo) ? 'chargedback' : ''
  if (estorno) {
    const r = await fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ status: estorno, refunded_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    })
    return NextResponse.json({ ok: r.ok, status: estorno })
  }

  if (status !== 'paid' && status !== 'approved') {
    return NextResponse.json({ ok: true, skipped: status || tipo || 'no-status' })
  }

  const c = body.Customer || {}
  const tp = body.TrackingParameters || {}
  const valueCents = Number(body.Commissions?.charge_amount ?? body.charge_amount ?? body.Product?.price ?? 0)
  const s1 = tp.s1 || null // frSid do site (session_id do funnel_events)

  // pedido (dedup atômico pela unique de pagarme_order_id: 409 = retry da Kiwify)
  const ins = await fetch(`${SUPA_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({
      pagarme_order_id: orderId,
      customer_name: c.full_name || c.first_name || null,
      customer_email: (c.email || '').toLowerCase() || null,
      product: PRODUTO,
      amount_cents: valueCents || 0,
      payment_method: body.payment_method || 'desconhecido',
      installments: body.installments || 1,
      status: 'paid',
      utm_source: tp.utm_source || null,
      utm_medium: tp.utm_medium || null,
      utm_campaign: tp.utm_campaign || null,
      utm_content: tp.utm_content || null,
      utm_term: tp.utm_term || null,
      vturb_sck: tp.sck || s1,
      attribution_source: 'kiwify_antimarketing',
    }),
  })
  if (ins.status === 409) return NextResponse.json({ ok: true, deduped: true })
  if (!ins.ok) {
    const t = await ins.text().catch(() => '')
    return NextResponse.json({ error: 'order insert failed', detail: t.slice(0, 200) }, { status: 500 })
  }

  // venda no painel (funil antimarketing); session_id = a do site quando veio (s1), pra casar com a visita
  await fetch(`${SUPA_URL}/rest/v1/funnel_events`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({
      funnel: 'antimarketing',
      page: 'obrigado',
      event: 'purchase',
      detail: `kiwify:${orderId}`,
      value: valueCents ? valueCents / 100 : null,
      session_id: s1 || crypto.randomUUID(),
      utm_source: tp.utm_source || null,
      utm_medium: tp.utm_medium || null,
      utm_campaign: tp.utm_campaign || null,
      utm_content: tp.utm_content || null,
      utm_term: tp.utm_term || null,
    }),
  }).catch(() => null)

  // ── Meta CAPI Purchase (rastreio avançado): casa com o clique do site pelo sck
  // (checkout_sessions gravado no clique = fbc, fbp, IP, aparelho, UTMs) e manda o
  // comprador com hash. event_id = order_id (retry da Kiwify não duplica no Meta).
  let capi: any = null
  try {
    const sck = String(tp.sck || '')
    let cs: Record<string, any> | null = null
    if (sck) {
      const r = await fetch(
        `${SUPA_URL}/rest/v1/checkout_sessions?or=(sck.eq.${encodeURIComponent(sck)},session_id.eq.${encodeURIComponent(sck)})&select=*&order=created_at.desc&limit=1`,
        { headers }
      )
      const rows = await r.json().catch(() => [])
      cs = Array.isArray(rows) && rows[0] ? rows[0] : null
    }
    const nome = String(c.full_name || '').trim().split(/\s+/)
    const tel = String(c.mobile || c.phone || '').replace(/\D/g, '')
    const ud: Record<string, any> = { country: [hash('br')], external_id: [hash(orderId)] }
    if (c.email) ud.em = [hash(c.email)]
    if (tel) ud.ph = [hash(tel.startsWith('55') ? tel : '55' + tel)]
    if (nome[0]) ud.fn = [hash(nome[0])]
    if (nome.length > 1) ud.ln = [hash(nome[nome.length - 1])]
    if (cs?.fbc) ud.fbc = cs.fbc
    if (cs?.fbp) ud.fbp = cs.fbp
    if (cs?.ip) ud.client_ip_address = cs.ip
    if (cs?.ua) ud.client_user_agent = cs.ua
    const ev = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: `am_${orderId}`,
      action_source: 'website',
      event_source_url: 'https://sociedadeantimarketing.vercel.app/',
      user_data: ud,
      custom_data: { value: valueCents / 100, currency: 'BRL', content_name: PRODUTO, order_id: orderId },
    }
    const r = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [ev] }),
    })
    capi = await r.json().catch(() => null)
    await fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ meta_event_id: ev.event_id, meta_fbc: cs?.fbc || null, meta_fbp: cs?.fbp || null }),
    }).catch(() => null)
  } catch (e: any) {
    capi = { error: e?.message }
  }

  return NextResponse.json({ ok: true, capi })
}

const PIXEL_ID = '1854241865596807' // SOCIEDADE ANTIMARKETING (BM Escola de Piano)
function hash(v: string) {
  return createHash('sha256').update(String(v).toLowerCase().trim()).digest('hex')
}
