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
const RESEND_KEY = process.env.RESEND_API_KEY || ''
const APP_URL = 'https://fluencyroute.com.br/spanish-app.html'

// Entrega do produto: e-mail em inglês com o link do app pro comprador.
// Público fala inglês. Remetente precisa ser @acesso.fluencyroute.com.br (verificado no Resend).
function deliveryHtml(name) {
  const hi = name ? `Hey ${String(name).split(' ')[0]},` : 'Hey there,'
  return `<!doctype html><html><body style="margin:0;background:#0C1219;font-family:-apple-system,'Segoe UI',sans-serif;color:#E9EEF6">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px;color:#8A98AD">FLUENCY <span style="color:#F4B740">ROUTE</span></p>
    <h1 style="font-size:26px;font-weight:900;line-height:1.25;margin:20px 0 8px">🎉 ${hi} your access to Essential Spanish Fluency is ready.</h1>
    <p style="font-size:16px;color:#BCC7D8;line-height:1.6">Your training app is live. It walks you through the 4 phases — Auditory Perception, Conversational, Shadowing, and Simulated Immersion — with spaced repetition that wires Spanish into your subconscious. Best on your phone with headphones.</p>
    <a href="${APP_URL}" style="display:inline-block;margin:24px 0;background:#F4B740;color:#2A1C00;font-weight:900;font-size:16px;padding:16px 30px;border-radius:12px;text-decoration:none">OPEN MY SPANISH APP ▶</a>
    <p style="font-size:14px;color:#8A98AD;line-height:1.6">Do a session every day — even 10 minutes keeps your streak alive and your progress compounding. Any questions, just reply to this email.</p>
    <p style="font-size:14px;color:#BCC7D8;margin-top:24px">— Fluency Route</p>
    <p style="font-size:11px;color:#5A6572;margin-top:28px">You received this because you purchased Essential Spanish Fluency. Lifetime access — bookmark the link above.</p>
  </div></body></html>`
}

async function sendDelivery(email, name) {
  if (!RESEND_KEY || !email) return
  // pula e-mails de teste do Hotmart/sandbox pra não spammar
  if (/@(example\.com|hotmart\.com(\.br)?)$/i.test(email)) return
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Fluency Route <access@acesso.fluencyroute.com.br>',
        to: [email],
        subject: '🎉 Your Essential Spanish Fluency app is ready',
        html: deliveryHtml(name),
      }),
    })
    if (!r.ok) console.error('[HOTMART-WEBHOOK] resend:', r.status, await r.text())
  } catch (e) { console.error('[HOTMART-WEBHOOK] resend err:', e) }
}

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

    // Entrega do app por e-mail — só no primeiro approved (não repete no COMPLETE)
    if (String(event).toUpperCase() === 'PURCHASE_APPROVED') {
      await sendDelivery(email, name)
    }

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
