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
// NÃO cria usuário, NÃO manda CAPI: o Purchase no Meta sai do pixel 1854241865596807
// configurado no próprio checkout da Kiwify (mandar CAPI daqui duplicaria a compra).
//
// Configurar na Kiwify: Apps > Webhooks > produto "Sociedade Antimarketing",
// eventos compra aprovada + reembolso + chargeback, URL:
//   https://fluencyroute.com.br/api/am-kiwify-webhook?token=2fbd378a2e870898627dc6a55321ef58

import { NextRequest, NextResponse } from 'next/server'

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

  return NextResponse.json({ ok: true })
}
