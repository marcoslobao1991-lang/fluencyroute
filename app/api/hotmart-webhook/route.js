// ═══════════════════════════════════════════════════════════════
// app/api/hotmart-webhook/route.js — Postback Hotmart → Purchase CAPI (ES) + entrega
//
// FONTE ÚNICA do Purchase do funil de espanhol (browser NÃO dispara Purchase —
// princípio do playbook: server-side only). Faz:
//   1. Valida hottok (se HOTMART_HOTTOK setada).
//   2. Cart stitching: recupera fbc/fbp/ip/ua da sessão original (checkout_sessions,
//      chave = sck que a landing injeta no checkout Hotmart) → EMQ alto.
//   3. user_data completo (em, ph, fn, ln, ct, st, zp, country, external_id) do payload.
//   4. Purchase CAPI (meta-capi-es hasheia) com eventId es-purchase-<transaction>. Upsell/coaching vai como
//      UpsellPurchase (es-upsell-<transaction>), pra não contar como venda nova no Meta.
//   5. Entrega: e-mail com o link do app pro comprador (só front, não upsell).
//
// Dedup: eventId determinístico por transação → retries do mesmo pedido
// deduplicam no Meta. Só PURCHASE_APPROVED dispara Purchase: a janela de dedup
// do Meta é 48h e o PURCHASE_COMPLETE da Hotmart chega quando a GARANTIA expira
// (~7+ dias depois) — mesmo com event_id igual ele contava como venda nova.
// ═══════════════════════════════════════════════════════════════

import crypto from 'crypto'
import { sendServerEvent, fbcFromFbclid } from '../../lib/meta-capi-es.js'

const HOTTOK = process.env.HOTMART_HOTTOK || ''
const RESEND_KEY = process.env.RESEND_API_KEY || ''
const APP_URL = 'https://fluencyroute.com.br/spanish-app.html'
const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

const PURCHASE_EVENTS = new Set(['PURCHASE_APPROVED'])

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
// Com token, o botão entra JÁ LOGADO e o progresso passa a ser salvo na conta do
// aluno desde a primeira sessão. Sem token (falha na criação da conta), o link
// normal continua valendo — o app funciona offline, só sem sincronizar.
function deliveryHtml(name, token) {
  const hi = name ? `Hey ${String(name).split(' ')[0]},` : 'Hey there,'
  const link = token ? `${APP_URL}?k=${token}` : APP_URL
  return `<!doctype html><html><body style="margin:0;background:#0C1219;font-family:-apple-system,'Segoe UI',sans-serif;color:#E9EEF6">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px;color:#8A98AD">FLUENCY <span style="color:#F4B740">ROUTE</span></p>
    <h1 style="font-size:26px;font-weight:900;line-height:1.25;margin:20px 0 8px">🎉 ${hi} your access to Essential Spanish Fluency is ready.</h1>
    <p style="font-size:16px;color:#BCC7D8;line-height:1.6">Your training app is live. It walks you through the 4 phases — Auditory Perception, Conversational, Shadowing, and Simulated Immersion — with spaced repetition that wires Spanish into your subconscious. Best on your phone with headphones.</p>
    <a href="${link}" style="display:inline-block;margin:24px 0;background:#F4B740;color:#2A1C00;font-weight:900;font-size:16px;padding:16px 30px;border-radius:12px;text-decoration:none">OPEN MY SPANISH APP ▶</a>
    ${token ? `<p style="font-size:15px;color:#BCC7D8;line-height:1.6;margin:0 0 10px">Want a hand getting started? Manuela, your Spanish guide, is one message away:</p><a href="https://wa.me/5511956091942?text=${encodeURIComponent('¡Hola Manuela! I just got my Essential Spanish app. Code: FT-' + token.slice(0, 8))}" style="display:inline-block;margin:0 0 22px;background:#25D366;color:#06281F;font-weight:800;font-size:15px;padding:14px 24px;border-radius:12px;text-decoration:none">Say hi to Manuela on WhatsApp</a>` : ''}
    <p style="font-size:14px;color:#8A98AD;line-height:1.6">Do a session every day — even 10 minutes keeps your streak alive and your progress compounding. Any questions, just reply to this email.</p>
    ${token ? `<p style="font-size:13px;color:#8A98AD;line-height:1.6;background:#141C26;border-radius:10px;padding:14px 16px;margin-top:20px"><b style="color:#E9EEF6">Keep this email.</b> The button above is your personal link — open it on your phone, your laptop, wherever. Your streak, your words and your talks follow you to every device automatically.</p>` : ''}
    <p style="font-size:14px;color:#BCC7D8;margin-top:24px">— Fluency Route</p>
    <p style="font-size:11px;color:#5A6572;margin-top:28px">You received this because you purchased Essential Spanish Fluency. Lifetime access — bookmark the link above.</p>
  </div></body></html>`
}

/**
 * Prepara o login de um toque do aluno: cria a conta (já confirmada) e devolve um
 * token durável pro link do e-mail. Sem isso o aluno teria que inventar uma senha
 * pra salvar o progresso — e quem não salva perde tudo ao trocar de aparelho.
 * Falhar aqui NÃO pode travar a entrega: o app funciona sem conta.
 */
async function prepararAcesso(email) {
  if (!SUPA_SERVICE_KEY || !email) return null
  const admin = {
    apikey: SUPA_SERVICE_KEY,
    Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
  try {
    // token já emitido pra esse e-mail? reusa (recompra não gera link novo)
    const jaTem = await fetch(
      `${SUPA_URL}/rest/v1/spanish_access?select=token&email=eq.${encodeURIComponent(email)}&limit=1`,
      { headers: admin }
    ).then((r) => r.json()).catch(() => [])
    if (Array.isArray(jaTem) && jaTem[0]?.token) return jaTem[0].token

    let userId = null
    const cr = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: admin,
      body: JSON.stringify({ email, email_confirm: true, user_metadata: { app: 'spanish' } }),
    })
    if (cr.ok) userId = (await cr.json().catch(() => ({})))?.id
    if (!userId) {
      const busca = await fetch(
        `${SUPA_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
        { headers: admin }
      ).then((r) => r.json()).catch(() => ({}))
      userId = busca?.users?.find((u) => (u.email || '').toLowerCase() === email)?.id || null
    }
    if (!userId) return null

    const token = crypto.randomBytes(24).toString('hex')
    const ins = await fetch(`${SUPA_URL}/rest/v1/spanish_access`, {
      method: 'POST',
      headers: { ...admin, Prefer: 'return=minimal' },
      body: JSON.stringify({ token, user_id: userId, email }),
    })
    return ins.ok ? token : null
  } catch (e) {
    console.error('[HOTMART-WEBHOOK] prepararAcesso:', e?.message)
    return null
  }
}

// ── Manuela no WhatsApp (26/11, Marcos: "dar aquele punch no cara… fazer todo mundo se sentir um rei e uma rainha") ──
// Na compra: guarda o telefone na conta do app (é por ele que a Manuela reconhece o aluno) e manda o modelo
// aprovado spanish_access_welcome (nome + botão com o link pessoal do app). Responder abre a conversa com ela.
function telWhats(phone, country, ddi) {
  let d = String(phone || '').replace(/\D/g, '')
  if (!d) return null
  // 28/11: a Hotmart pode mandar o DDI separado (checkout_phone_code); junta se o número ainda não começa com ele
  const cc = String(ddi || '').replace(/\D/g, '')
  if (cc && cc.length <= 3 && !d.startsWith(cc) && d.length <= 11) d = cc + d
  const c = String(country || '').toLowerCase()
  if (d.length === 10 && (c === 'us' || c === 'ca' || !c)) d = '1' + d
  if (c === 'br' && !d.startsWith('55') && d.length <= 11) d = '55' + d
  return d.length >= 11 && d.length <= 15 ? d : null
}
async function manuelaBoasVindas(email, name, phone, country, token, ddi) {
  const tel = telWhats(phone, country, ddi)
  if (!tel) console.log('[HOTMART-WEBHOOK] espanhol sem telefone válido na compra:', phone ? String(phone).replace(/\d(?=\d{3})/g, '•') : 'vazio')
  if (!tel || !SUPA_SERVICE_KEY) return
  try {
    await fetch(`${SUPA_URL}/rest/v1/spanish_access?email=eq.${encodeURIComponent(String(email).trim().toLowerCase())}`, {
      method: 'PATCH', headers: { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: tel }),
    })
  } catch {}
  const PH = process.env.WA_CLOUD_PHONE_ID, WT = process.env.WA_CLOUD_TOKEN
  if (!PH || !WT || !token) return
  const first = name ? String(name).trim().split(/\s+/)[0] : 'there'
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${PH}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${WT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: tel, type: 'template', template: { name: 'spanish_access_welcome', language: { code: 'en_US' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: first }] }, { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: token }] }] } }),
    })
    const j = await r.json().catch(() => ({}))
    await fetch(`${SUPA_URL}/rest/v1/wa_mensagens`, {
      method: 'POST', headers: { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tel, direcao: 'out', texto: `[modelo spanish_access_welcome] Hi ${first}, your access to Essential Spanish Fluency is ready! I am Manuela…`, status: r.ok ? 'enviado' : 'falhou' }),
    }).catch(() => {})
    if (!r.ok) console.error('[HOTMART-WEBHOOK] whats boas-vindas:', r.status, JSON.stringify(j).slice(0, 300))
  } catch (e) { console.error('[HOTMART-WEBHOOK] whats err:', e?.message) }
}

// 28/11 LATAM: boas-vindas da Manuela em espanhol (modelo ruta_bienvenida). Dedup pela transação (a Hotmart reenvia o webhook).
async function rutaBoasVindas(name, phone, country, ddi, transaction) {
  const tel = telWhats(phone, country, ddi)
  if (!tel) { console.log('[HOTMART-WEBHOOK] latam sem telefone na compra', transaction); return }
  const PH = process.env.WA_CLOUD_PHONE_ID, WT = process.env.WA_CLOUD_TOKEN
  if (!PH || !WT || !SUPA_SERVICE_KEY) return
  const H = { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}`, 'Content-Type': 'application/json' }
  const marca = `[modelo ruta_bienvenida ${transaction}]`
  const ja = await fetch(`${SUPA_URL}/rest/v1/wa_mensagens?texto=like.${encodeURIComponent(marca + '*')}&select=id&limit=1`, { headers: H }).then((r) => r.json()).catch(() => [])
  if (Array.isArray(ja) && ja.length) return
  const first = name ? String(name).trim().split(/\s+/)[0] : 'hola'
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${PH}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${WT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: tel, type: 'template', template: { name: 'ruta_bienvenida', language: { code: 'es' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: first }] }] } }),
    })
    const j = await r.json().catch(() => ({}))
    await fetch(`${SUPA_URL}/rest/v1/wa_mensagens`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ tel, direcao: 'out', texto: `${marca} ¡Hola ${first}! Tu acceso a Ruta de la Fluidez ya está listo… Soy Manuela`, status: r.ok ? 'enviado' : 'falhou' }),
    }).catch(() => {})
    if (!r.ok) console.error('[HOTMART-WEBHOOK] latam whats:', r.status, JSON.stringify(j).slice(0, 300))
  } catch (e) { console.error('[HOTMART-WEBHOOK] latam whats err:', e?.message) }
}

async function sendDelivery(email, name, phone, country, ddi) {
  if (!RESEND_KEY || !email) return
  if (/@(example\.com|hotmart\.com(\.br)?)$/i.test(email)) return
  const token = await prepararAcesso(String(email).trim().toLowerCase())
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Fluency Route <access@acesso.fluencyroute.com.br>',
        to: [email],
        subject: '🎉 Your Essential Spanish Fluency app is ready',
        html: deliveryHtml(name, token),
      }),
    })
    if (!r.ok) console.error('[HOTMART-WEBHOOK] resend:', r.status, await r.text())
  } catch (e) { console.error('[HOTMART-WEBHOOK] resend err:', e) }
  await manuelaBoasVindas(email, name, phone, country, token, ddi)
}

// ── Fluency Fast-Track (upsell): libera o acompanhamento e manda o link da página do coach ──
const COACH_URL = 'https://fluencyroute.com.br/spanish-coach.html'
function coachHtml(name, token) {
  const hi = name ? `Hey ${String(name).split(' ')[0]},` : 'Hey there,'
  const link = token ? `${COACH_URL}?k=${token}` : COACH_URL
  return `<!doctype html><html><body style="margin:0;background:#0C1219;font-family:-apple-system,'Segoe UI',sans-serif;color:#E9EEF6">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px;color:#8A98AD">FLUENCY <span style="color:#F4B740">ROUTE</span> · FAST-TRACK</p>
    <h1 style="font-size:26px;font-weight:900;line-height:1.25;margin:20px 0 8px">${hi} your Fast-Track is unlocked.</h1>
    <p style="font-size:16px;color:#BCC7D8;line-height:1.6">Here is what you get, starting today:</p>
    <ul style="font-size:15px;color:#BCC7D8;line-height:1.7;padding-left:18px">
      <li><b style="color:#E9EEF6">Your 90-Day Speaking Plan</b>, one mission a day, built around your level and your time.</li>
      <li><b style="color:#E9EEF6">Weekly Accent Check</b>: you record a few lines and our A.I. pronunciation coach scores every word and shows you what to fix.</li>
      <li><b style="color:#E9EEF6">A new challenge every week</b> to keep you speaking.</li>
      <li><b style="color:#E9EEF6">Everything unlocked</b> in your app, plus every update we ever ship.</li>
    </ul>
    <a href="${link}" style="display:inline-block;margin:22px 0;background:#F4B740;color:#2A1C00;font-weight:900;font-size:16px;padding:16px 30px;border-radius:12px;text-decoration:none">START MY 90-DAY PLAN ▶</a>
    <p style="font-size:14px;color:#8A98AD;line-height:1.6">It takes 1 minute to set up. Keep this email: the button always brings you back to your plan.</p>
    <p style="font-size:14px;color:#BCC7D8;margin-top:24px">— Fluency Route</p>
  </div></body></html>`
}
// Real Time Talk (upsell 2): e-mail com o link das aulas faladas
const TALK_URL = 'https://fluencyroute.com.br/spanish-talk.html'
function talkHtml(name, token) {
  const hi = name ? `Hey ${String(name).split(' ')[0]},` : 'Hey there,'
  const link = token ? `${TALK_URL}?k=${token}` : TALK_URL
  return `<!doctype html><html><body style="margin:0;background:#0C1219;font-family:-apple-system,'Segoe UI',sans-serif;color:#E9EEF6">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px;color:#8A98AD">FLUENCY <span style="color:#F4B740">ROUTE</span> · REAL TIME TALK</p>
    <h1 style="font-size:26px;font-weight:900;line-height:1.25;margin:20px 0 8px">${hi} your private tutor is ready.</h1>
    <p style="font-size:16px;color:#BCC7D8;line-height:1.6">For the next 12 months you have 3 live spoken lessons a week with Manuela. Pick a scene (tacos, a hotel, a first date, a job interview), put your headphones on and talk out loud. She corrects you on the spot and sends you a report after every lesson.</p>
    <a href="${link}" style="display:inline-block;margin:24px 0;background:#F4B740;color:#2A1C00;font-weight:900;font-size:16px;padding:16px 30px;border-radius:12px;text-decoration:none">START MY FIRST LESSON ▶</a>
    <p style="font-size:14px;color:#8A98AD;line-height:1.6">Best on your phone, with headphones, in a quiet place. Keep this email: the button always brings you back to your lessons.</p>
    <p style="font-size:14px;color:#BCC7D8;margin-top:24px">— Fluency Route</p>
  </div></body></html>`
}

// plano: 'fast' (Fast-Track US$127) · 'lite' (Fast-Track Lite US$47, sem a Manuela coach) · 'talk' (Real Time Talk US$297/ano)
async function sendCoachDelivery(email, name, transaction, plano = 'fast') {
  if (!RESEND_KEY || !email) return
  const mail = String(email).trim().toLowerCase()
  if (/@(example\.com|hotmart\.com(\.br)?)$/i.test(mail)) return
  const token = await prepararAcesso(mail)
  const H = { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}`, 'Content-Type': 'application/json' }
  try {
    // cria a linha se não existir (quem compra o Real Time Talk normalmente já tem o Fast-Track)
    await fetch(`${SUPA_URL}/rest/v1/spanish_coach`, {
      method: 'POST', headers: { ...H, Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ email: mail, transaction: transaction || null, plano: plano === 'talk' ? 'fast' : plano }),
    })
    if (plano === 'talk') {
      await fetch(`${SUPA_URL}/rest/v1/spanish_coach?email=eq.${encodeURIComponent(mail)}`, {
        method: 'PATCH', headers: H, body: JSON.stringify({ talk_ate: new Date(Date.now() + 365 * 864e5).toISOString(), updated_at: new Date().toISOString() }),
      })
    } else if (plano === 'fast') {
      // quem tinha o Lite e compra o Fast-Track sobe de plano
      await fetch(`${SUPA_URL}/rest/v1/spanish_coach?email=eq.${encodeURIComponent(mail)}&plano=eq.lite`, { method: 'PATCH', headers: H, body: JSON.stringify({ plano: 'fast' }) })
    }
  } catch (e) { console.error('[HOTMART-WEBHOOK] coach insert', e?.message) }
  const assunto = plano === 'talk' ? '🎙️ Your private tutor is ready: start your first live lesson'
    : plano === 'lite' ? '🚀 Your Fast-Track Lite is unlocked: start your 90-day plan'
    : '🚀 Your Fast-Track is unlocked: start your 90-day plan'
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Fluency Route <access@acesso.fluencyroute.com.br>', to: [mail], subject: assunto, html: plano === 'talk' ? talkHtml(name, token) : coachHtml(name, token) }),
    })
    if (!r.ok) console.error('[HOTMART-WEBHOOK] resend coach:', r.status, await r.text())
  } catch (e) { console.error('[HOTMART-WEBHOOK] resend coach err:', e) }
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

    // 26/11: o produto "Premium Coaching" é COMPARTILHADO com o funil LATAM (Ruta hacia la Fluidez, outra oferta e outro preço).
    // Este webhook é do ESPANHOL: só a oferta do Fast-Track (ewtgb4zl, US$127) entra aqui. O resto do Premium Coaching é ignorado
    // (nada de acesso, e-mail, painel ou pixel do espanhol). Sem código de oferta no payload: só aceita se o valor for de Fast-Track (≥ US$90).
    const offerCode = String(pick(body, 'data.purchase.offer.code', 'purchase.offer.code', 'off') || '').toLowerCase()
    // 26/11 tarde: ofertas do ESPANHOL no Premium Coaching = Fast-Track (ewtgb4zl), Lite/downsell (x6ymozzb), Real Time Talk/upsell 2 (1sq74hea)
    const PLANO_POR_OFERTA = { ewtgb4zl: 'fast', x6ymozzb: 'lite', '1sq74hea': 'talk' }
    let planoUpsell = null
    if (/coaching|upsell|mentor/i.test(String(productName))) {
      planoUpsell = offerCode ? (PLANO_POR_OFERTA[offerCode] || null) : ((Number(value) || 0) >= 90 ? 'fast' : null)
      if (!planoUpsell) return new Response(JSON.stringify({ ok: true, ignored: 'coaching-de-outro-funil', offer: offerCode || null }), { status: 200 })
    }

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

    const ddi = pick(body, 'data.buyer.checkout_phone_code', 'buyer.checkout_phone_code')

    // ── 28/11 LATAM (Ruta de la Fluidez, inglês pra quem fala espanhol): acesso, e-mail "Tu acceso llegó" e pixel são de OUTRO
    // webhook. Aqui só entra a boas-vindas da Manuela no WhatsApp. Nada de acesso do espanhol, CAPI ou painel. Upsell não manda de novo.
    if (/ruta|fluidez|ingl[eé]s/i.test(String(productName))) {
      const ehUpsell = /vital|lifetime|por vida|coaching|upsell|mentor/i.test(String(productName))
      if (!ehUpsell) await rutaBoasVindas(name, phone, country, ddi, transaction)
      return new Response(JSON.stringify({ ok: true, latam: true, upsell: ehUpsell }), { status: 200 })
    }

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

    // 28/11: upsell/coaching NÃO é Purchase. Transação própria na Hotmart virava uma "venda" a mais no Meta
    // (ex.: Joel Laing 28/11 = 1 venda + Lite → a SPANISH TRICK marcou 2 compras dele), inflando CPA/ROAS e a
    // otimização da campanha. Upsell vai como evento próprio (UpsellPurchase), com eventId próprio.
    const isUpsell = /coaching|upsell|mentor/i.test(String(productName))
    const eventId = isUpsell ? `es-upsell-${transaction}` : `es-purchase-${transaction}`
    const result = await sendServerEvent(
      isUpsell ? 'UpsellPurchase' : 'Purchase',
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

    // ── entrega: só no primeiro approved e só do produto principal (não do upsell/coaching; isUpsell definido antes da CAPI) ──

    // ── stats (23/11): a venda entra no funil 'spanish' do painel, ligada à visita pelo stitch (sck → session_id)
    // e com a origem do anúncio. Antes o webhook só mandava pra Meta e o painel nunca via venda de espanhol.
    // value em USD (moeda da oferta). Upsell entra como item ':coaching' (não conta como venda nova). Dedup pelo detail.
    if (event === 'PURCHASE_APPROVED' && transaction) {
      try {
        const detail = `hotmart:${transaction}${isUpsell ? (planoUpsell === 'lite' ? ':lite' : planoUpsell === 'talk' ? ':talk' : ':coaching') : ''}`
        const H = { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}`, 'Content-Type': 'application/json' }
        const ja = await fetch(`${SUPA_URL}/rest/v1/funnel_events?event=eq.purchase&detail=eq.${encodeURIComponent(detail)}&select=id&limit=1`, { headers: H }).then((r) => r.json()).catch(() => [])
        if (!Array.isArray(ja) || ja.length === 0) {
          await fetch(`${SUPA_URL}/rest/v1/funnel_events`, {
            method: 'POST', headers: { ...H, Prefer: 'return=minimal' },
            body: JSON.stringify({
              funnel: 'spanish', page: 'obrigado', event: 'purchase', detail, value: value ?? null,
              session_id: stitched.session_id || null,
              utm_source: stitched.utm_source || null, utm_medium: stitched.utm_medium || null, utm_campaign: stitched.utm_campaign || null,
              utm_content: stitched.utm_content || null, utm_term: stitched.utm_term || null, fbclid: effectiveFbclid || null,
            }),
          })
        }
      } catch (e) { console.error('[HOTMART-WEBHOOK] stats', e?.message) }
    }
    if (event === 'PURCHASE_APPROVED' && !isUpsell) {
      await sendDelivery(email, name, phone, country, ddi)
    }
    // 26/11: upsell (Fluency Fast-Track / Premium Coaching) = acompanhamento entregue por IA em /spanish-coach.html
    if (event === 'PURCHASE_APPROVED' && isUpsell) {
      await sendCoachDelivery(email, name, transaction, planoUpsell || 'fast')
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
