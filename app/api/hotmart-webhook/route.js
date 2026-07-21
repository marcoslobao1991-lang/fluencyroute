// ═══════════════════════════════════════════════════════════════
// app/api/hotmart-webhook/route.js — Postback do Hotmart → Purchase CAPI (ES)
//
// Recebe a notificação de compra do Hotmart (front $342 e upsell $497) e dispara
// o Purchase server-side pro pixel do Spanish (690…) via meta-capi-es. O VALOR
// vem no próprio payload do Hotmart, então não precisa mapear produto.
//
// eventId = es-purchase-<transaction> → deduplica com o Purchase do browser
// (/spanish/obrigado e /spanish/thankyou usam o mesmo padrão).
//
// Segurança: se a env HOTMART_HOTTOK estiver setada, exige que o hottok bata.
// ═══════════════════════════════════════════════════════════════

import { sendServerEvent } from '../../lib/meta-capi-es.js'

const HOTTOK = process.env.HOTMART_HOTTOK || ''

// Só dispara Purchase nesses eventos (ignora refund/chargeback/etc)
const PURCHASE_EVENTS = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'])

function pick(obj, ...paths) {
  for (const path of paths) {
    let cur = obj
    let ok = true
    for (const key of path.split('.')) {
      if (cur && typeof cur === 'object' && key in cur) cur = cur[key]
      else { ok = false; break }
    }
    if (ok && cur !== undefined && cur !== null && cur !== '') return cur
  }
  return undefined
}

export async function POST(request) {
  try {
    const headerHottok = request.headers.get('x-hotmart-hottok') || ''
    let body = {}
    try { body = await request.json() } catch {
      // fallback: form-urlencoded (postback antigo)
      try {
        const txt = await request.text()
        body = Object.fromEntries(new URLSearchParams(txt))
      } catch {}
    }

    // ── valida hottok (se configurado) ──
    const bodyHottok = pick(body, 'hottok', 'data.hottok') || ''
    if (HOTTOK && HOTTOK !== headerHottok && HOTTOK !== bodyHottok) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid hottok' }), { status: 401 })
    }

    // ── evento ──
    const event = pick(body, 'event', 'status') || ''
    if (!PURCHASE_EVENTS.has(String(event).toUpperCase())) {
      return new Response(JSON.stringify({ ok: true, ignored: event || 'no-event' }), { status: 200 })
    }

    // ── dados da compra (parsing defensivo v1/v2) ──
    const transaction = pick(body, 'data.purchase.transaction', 'data.transaction', 'transaction', 'purchase.transaction')
    const value = Number(pick(body, 'data.purchase.price.value', 'data.purchase.full_price.value', 'purchase.price.value', 'price', 'prod_value')) || undefined
    const currency = pick(body, 'data.purchase.price.currency_value', 'data.purchase.price.currency_code', 'currency', 'currency_code') || 'USD'
    const email = pick(body, 'data.buyer.email', 'buyer.email', 'email')
    const name = pick(body, 'data.buyer.name', 'buyer.name', 'name')
    const productName = pick(body, 'data.product.name', 'product.name', 'prod_name') || 'Essential Spanish Fluency'

    if (!transaction) {
      return new Response(JSON.stringify({ ok: true, ignored: 'no-transaction' }), { status: 200 })
    }

    const eventId = `es-purchase-${transaction}`
    const result = await sendServerEvent(
      'Purchase',
      { email, name },
      {
        value,
        currency,
        order_id: transaction,
        content_name: productName,
        content_type: 'product',
      },
      'https://fluencyroute.com.br/spanish',
      eventId,
      ''
    )

    const debug = request.headers.get('x-debug') === '1'
    return new Response(
      JSON.stringify(debug ? { ok: true, transaction, value, meta: result } : { ok: true }),
      { status: 200 }
    )
  } catch (err) {
    console.error('[HOTMART-WEBHOOK]', err)
    // 200 mesmo em erro nosso → Hotmart não re-tenta infinito por bug interno
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 200 })
  }
}

// Alguns setups do Hotmart fazem um GET de verificação
export async function GET() {
  return new Response(JSON.stringify({ ok: true, endpoint: 'hotmart-webhook' }), { status: 200 })
}
