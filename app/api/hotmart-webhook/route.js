// ═══════════════════════════════════════════════════════════════
// app/api/hotmart-webhook/route.js — Postback Hotmart → Purchase CAPI (ES) + entrega
//
// FONTE ÚNICA do Purchase do funil de espanhol (browser NÃO dispara Purchase —
// princípio do playbook: server-side only). Faz:
//   1. Valida hottok (se HOTMART_HOTTOK setada).
//   2. Cart stitching: recupera fbc/fbp/ip/ua da sessão original (checkout_sessions,
//      chave = sck que a landing injeta no checkout Hotmart) → EMQ alto.
//   3. user_data completo (em, ph, fn, ln, ct, st, zp, country, external_id) do payload.
//   4. Purchase CAPI (meta-capi-es hasheia) com eventId es-purchase-<transaction>.
//   5. Entrega: e-mail com o link do app pro comprador (só front, não upsell).
//
// Dedup: eventId determinístico por transação → APPROVED+COMPLETE e retries do
// mesmo pedido deduplicam no Meta (não conta dobrado).
// ═══════════════════════════════════════════════════════════════

import { sendServerEvent, fbcFromFbclid } from '../../lib/meta-capi-es.js'

const HOTTOK = process.env.HOTMART_HOTTOK || ''
const RESEND_KEY = process.env.RESEND_API_KEY || ''
const APP_URL = 'https://fluencyroute.com.br/spanish-app.html'
const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

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

// ── Cart stitching: recupera fbc/fbp/ip/ua salvos pela landing ──
async function lookupStitch(field, val) {
  if (!val || !SUPA_SERVICE_KEY) return {}
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/checkout_sessions?${field}=eq.${encodeURIComponent(val)}&select=*&order=created_at.desc&limit=1`,
      { headers: { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}` } }
    )
    const rows = await r.json()
    return Array.isArray(rows) && rows[0] ? rows[0] : {}
  } catch (e) {
    console.warn('[HOTMART-WEBHOOK] stitch', field, 'falhou:', e?.message)
    return {}
  }
}

// ── Entrega do app por e-mail (público fala inglês) ──
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

export async function POST(request) {
  try {
    const headerHottok = request.headers.get('x-hotmart-hottok') || ''
    let body = {}
    try { body = await request.json() } catch {
      try {
        const txt = await request.text()
        body = Object.fromEntries(new URLSearchParams(txt))
      } catch {}
    }

    // ── hottok ──
    const bodyHottok = pick(body, 'hottok', 'data.hottok') || ''
    if (HOTTOK && HOTTOK !== headerHottok && HOTTOK !== bodyHottok) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid hottok' }), { status: 401 })
    }

    // ── evento ──
    const event = String(pick(body, 'event', 'status') || '').toUpperCase()
    if (!PURCHASE_EVENTS.has(event)) {
      return new Response(JSON.stringify({ ok: true, ignored: event || 'no-event' }), { status: 200 })
    }

    // ── dados da compra (parsing defensivo Hotmart v1/v2) ──
    const transaction = pick(body, 'data.purchase.transaction', 'data.transaction', 'transaction', 'purchase.transaction')
    if (!transaction) {
      return new Response(JSON.stringify({ ok: true, ignored: 'no-transaction' }), { status: 200 })
    }
    const value = Number(pick(body, 'data.purchase.price.value', 'data.purchase.full_price.value', 'purchase.price.value', 'price', 'prod_value')) || undefined
    const currency = pick(body, 'data.purchase.price.currency_value', 'data.purchase.price.currency_code', 'currency', 'currency_code') || 'USD'
    const productName = pick(body, 'data.product.name', 'product.name', 'prod_name') || 'Essential Spanish Fluency'

    // buyer PII → EMQ
    const email = pick(body, 'data.buyer.email', 'buyer.email', 'email')
    const name = pick(body, 'data.buyer.name', 'buyer.name', 'name')
    const phone = pick(body, 'data.buyer.checkout_phone', 'data.buyer.phone', 'buyer.checkout_phone', 'buyer.phone', 'phone_checkout_phone')
    const document = pick(body, 'data.buyer.document', 'buyer.document', 'doc')
    const city = pick(body, 'data.buyer.address.city', 'buyer.address.city', 'address.city')
    const state = pick(body, 'data.buyer.address.state', 'buyer.address.state', 'address.state')
    const zip = pick(body, 'data.buyer.address.zip_code', 'data.buyer.address.zipcode', 'buyer.address.zip_code', 'address.zip')
    const countryRaw = pick(body, 'data.buyer.address.country_iso', 'data.buyer.address.country', 'buyer.address.country_iso', 'buyer.address.country')
    const country = typeof countryRaw === 'string' && /^[a-z]{2}$/i.test(countryRaw.trim()) ? countryRaw.trim().toLowerCase() : undefined

    // tracking (a landing injeta nosso session_id no sck do checkout)
    const sck = pick(body, 'data.purchase.tracking.source_sck', 'purchase.tracking.source_sck', 'tracking.source_sck', 'sck', 'src_sck')
    const src = pick(body, 'data.purchase.tracking.source', 'purchase.tracking.source', 'tracking.source', 'src')
    const fbclid = pick(body, 'data.purchase.tracking.fbclid', 'tracking.fbclid', 'fbclid')

    // ── cart stitch: sck (nosso session_id) → session_id → sck → fbclid ──
    let stitched = await lookupStitch('session_id', sck || src)
    if (!stitched.session_id && (sck || src)) stitched = await lookupStitch('sck', sck || src)
    if (!stitched.session_id && !stitched.sck && fbclid) stitched = await lookupStitch('fbclid', fbclid)

    const effectiveFbclid = stitched.fbclid || fbclid
    let fbc = stitched.fbc
    if (!fbc && effectiveFbclid) {
      const clickTs = stitched.created_at ? Date.parse(stitched.created_at) : Date.now()
      fbc = fbcFromFbclid(effectiveFbclid, clickTs)
    }

    const eventId = `es-purchase-${transaction}`
    const result = await sendServerEvent(
      'Purchase',
      {
        email, name, phone,
        city, state, zip, country,
        externalId: document ? String(document).replace(/\D/g, '') : undefined,
        ip: stitched.ip || undefined,
        userAgent: stitched.ua || undefined,
        fbc: fbc || undefined,
        fbp: stitched.fbp || undefined,
      },
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

    // ── entrega: só no primeiro approved e só do produto principal (não do upsell/coaching) ──
    const isUpsell = /coaching|upsell|mentor/i.test(String(productName))
    if (event === 'PURCHASE_APPROVED' && !isUpsell) {
      await sendDelivery(email, name)
    }

    const debug = request.headers.get('x-debug') === '1'
    return new Response(
      JSON.stringify(debug ? { ok: true, transaction, value, stitch: { fbc: !!fbc, fbp: !!stitched.fbp, ip: !!stitched.ip, ua: !!stitched.ua }, meta: result } : { ok: true }),
      { status: 200 }
    )
  } catch (err) {
    console.error('[HOTMART-WEBHOOK]', err)
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 200 })
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, endpoint: 'hotmart-webhook' }), { status: 200 })
}
