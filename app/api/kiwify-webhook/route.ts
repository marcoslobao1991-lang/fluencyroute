import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ── Meta CAPI ──
const PIXEL_ID = '938768337634102'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!
const META_API = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`

// ── Supabase ──
const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const RESEND_API_KEY = process.env.RESEND_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencyroute.com.br'

// ── Z-API WhatsApp ──
const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN!
const MARCOS_PHONE = '5511971167821'

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)]
  return pass
}

async function createUser(email: string, name: string, phone: string) {
  const password = generatePassword()
  const res = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_SERVICE_KEY,
      'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone },
    }),
  })
  const data = await res.json()
  return { user: data, password }
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/rpc/get_user_id_by_email`, {
      method: 'POST',
      headers: {
        'apikey': SUPA_SERVICE_KEY,
        'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_email: email }),
    })
    const uid = await res.json()
    if (!uid || uid === 'null' || typeof uid !== 'string') return null
    return uid.replace(/"/g, '')
  } catch (e: any) {
    console.error('[Kiwify] findUserIdByEmail failed:', e?.message)
    return null
  }
}

async function lookupStitchedBySessionId(sessionId: string) {
  if (!sessionId) return {}
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/checkout_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`,
      { headers: { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}` } }
    )
    const rows = await r.json()
    return Array.isArray(rows) && rows[0] ? rows[0] : {}
  } catch (e: any) {
    console.warn('[Kiwify] stitch by session_id failed:', e?.message)
    return {}
  }
}

// PRIMARY fallback: sck (Vturb session). Kiwify reliably forwards sck in
// TrackingParameters because it's in the UTM whitelist it accepts. Landing
// must persist sck into the stitch row at CTA click time (after Vturb player
// has injected sck into the CTA href).
async function lookupStitchedBySck(sck: string) {
  if (!sck) return {}
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/checkout_sessions?sck=eq.${encodeURIComponent(sck)}&select=*&order=created_at.desc&limit=1`,
      { headers: { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}` } }
    )
    const rows = await r.json()
    return Array.isArray(rows) && rows[0] ? rows[0] : {}
  } catch (e: any) {
    console.warn('[Kiwify] stitch by sck failed:', e?.message)
    return {}
  }
}

// SECONDARY fallback: fbclid. Kiwify usually DROPS fbclid from webhook
// TrackingParameters even when it's in the CTA URL. Kept as last resort
// only — in practice rarely fires. sck is the primary mechanism.
async function lookupStitchedByFbclid(fbclid: string) {
  if (!fbclid) return {}
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/checkout_sessions?fbclid=eq.${encodeURIComponent(fbclid)}&select=*&order=created_at.desc&limit=1`,
      { headers: { apikey: SUPA_SERVICE_KEY, Authorization: `Bearer ${SUPA_SERVICE_KEY}` } }
    )
    const rows = await r.json()
    return Array.isArray(rows) && rows[0] ? rows[0] : {}
  } catch (e: any) {
    console.warn('[Kiwify] stitch by fbclid failed:', e?.message)
    return {}
  }
}

// Meta-accepted reconstructed fbc: fb.<subdomainIndex>.<timestamp>.<fbclid>
// subdomainIndex=1 covers .com.br / .com per Meta docs.
function fbcFromFbclid(fbclid: string | null, createdAtMs?: number) {
  if (!fbclid) return null
  const ts = Number.isFinite(createdAtMs) ? createdAtMs : Date.now()
  return `fb.1.${ts}.${fbclid}`
}

async function createSubscription(userId: string, orderId: string) {
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  await fetch(`${SUPA_URL}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_SERVICE_KEY,
      'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      user_id: userId,
      status: 'active',
      plan: 'annual',
      pagarme_order_id: orderId,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }),
  })
}

async function sendWelcomeEmail(email: string, name: string, password: string | null, isNew: boolean) {
  if (!RESEND_API_KEY) return
  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;background:#0A0A0A;border-radius:16px;overflow:hidden">
      <div style="padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
        <h1 style="color:#fff;font-size:24px;margin:0">Bem-vindo ao <span style="color:#4ECDC4">Rota da Fluência</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:8px">Seu acesso está pronto!</p>
      </div>
      <div style="padding:32px">
        <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 20px">Olá <strong style="color:#fff">${name}</strong>,</p>
        <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 24px">
          ${isNew ? 'Sua conta foi criada com sucesso. Use os dados abaixo para acessar a plataforma:' : 'Seu pagamento foi confirmado e sua assinatura está ativa. Acesse com seu login atual:'}
        </p>
        ${isNew && password ? `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px">Seus dados de acesso</p>
          <p style="color:#fff;font-size:14px;margin:0 0 8px"><strong>E-mail:</strong> ${email}</p>
          <p style="color:#fff;font-size:14px;margin:0"><strong>Senha:</strong> <code style="background:rgba(78,205,196,0.1);color:#4ECDC4;padding:2px 8px;border-radius:4px;font-size:16px;letter-spacing:1px">${password}</code></p>
        </div>
        ` : ''}
        <a href="${APP_URL}" style="display:block;text-align:center;padding:16px;background:#4ECDC4;color:#000;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;margin-bottom:24px">ACESSAR PLATAFORMA</a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin:0">Qualquer dúvida, responda este e-mail.</p>
      </div>
    </div>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Rota da Fluência <contato@acesso.fluencyroute.com.br>',
      to: email,
      subject: isNew ? 'Seu acesso ao Rota da Fluência está pronto!' : 'Pagamento confirmado — Rota da Fluência',
      html,
    }),
  }).catch(e => console.error('[Kiwify] Email failed:', e.message))
}

async function sendWhatsApp(phone: string, message: string) {
  const formatted = phone.startsWith('55') ? phone : `55${phone}`
  await fetch(`${ZAPI_BASE}/send-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Client-Token': ZAPI_CLIENT_TOKEN },
    body: JSON.stringify({ phone: formatted, message }),
  })
}

// ── HMAC signature verification (Kiwify signs with SHA1) ──
const KIWIFY_WEBHOOK_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN || ''

function verifyKiwifySignature(rawBody: string, signatureFromUrl: string | null): boolean {
  if (!KIWIFY_WEBHOOK_TOKEN) return true // no token → trust mode (dev only)
  if (!signatureFromUrl) return false
  const expected = crypto
    .createHmac('sha1', KIWIFY_WEBHOOK_TOKEN)
    .update(rawBody)
    .digest('hex')
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signatureFromUrl, 'utf8')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return expected === signatureFromUrl
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const url = new URL(req.url)
    const signature = url.searchParams.get('signature') || url.searchParams.get('token')

    if (!verifyKiwifySignature(rawBody, signature)) {
      console.warn('[Kiwify] Invalid signature — rejected')
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // Kiwify sends order_status: 'paid' for approved purchases
    const status = body.order_status
    if (status !== 'paid') {
      return NextResponse.json({ ok: true, skipped: status })
    }

    const customer = body.Customer || body.customer || {}
    const email = (customer.email || '').toLowerCase().trim()
    const name = customer.full_name || ''
    const firstName = name.split(' ')[0] || 'aluno'
    const phone = (customer.mobile || customer.phone || '').replace(/\D/g, '')
    const orderId = body.order_id || body.subscription_id || String(Date.now())

    // Kiwify sends monetary values in CENTS (integer). Normalize both units.
    const rawValue = body.Commissions?.charge_amount ?? body.Product?.price ?? 0
    const valueCents = typeof rawValue === 'string' ? parseInt(rawValue, 10) || 0 : Math.round(Number(rawValue) || 0)
    const valueReais = valueCents / 100
    const productName = body.Product?.product_name || 'Fluency Route'
    const eventId = `kiwify-${orderId}`

    // ═══ ATOMIC DEDUP VIA INSERT ═══
    // Use the UNIQUE constraint on orders.pagarme_order_id as the dedup anchor.
    // If the INSERT returns 409 Conflict we know another invocation already
    // processed this order — we must skip CAPI/email/WhatsApp to avoid doubling
    // Purchase events in Meta Events Manager. This replaces the SELECT-then-INSERT
    // pattern which had a race condition under concurrent webhook retries.
    const insertRes = await fetch(`${SUPA_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPA_SERVICE_KEY,
        'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        pagarme_order_id: orderId,
        customer_name: name,
        customer_email: email,
        product: productName,
        amount_cents: valueCents,
        payment_method: 'kiwify',
        status: 'paid',
      }),
    })
    if (insertRes.status === 409) {
      console.log(`[Kiwify] Duplicate webhook for order ${orderId} — race blocked by unique constraint, skipping CAPI`)
      return NextResponse.json({ ok: true, duplicate: true })
    }
    if (!insertRes.ok) {
      const errTxt = await insertRes.text().catch(() => '')
      console.error(`[Kiwify] orders insert failed HTTP ${insertRes.status}: ${errTxt.slice(0, 200)} — aborting to avoid orphaned CAPI`)
      return NextResponse.json({ error: 'order_insert_failed', status: insertRes.status }, { status: 500 })
    }

    // ═══ 1a. CART STITCHING — 4-strategy resolver ═══
    // Empirical truth (confirmed 2026-04-15 with real Fluency + Maestro orders):
    //   • Kiwify DOES forward: utm_*, sck (Vturb session ID)
    //   • Kiwify DOES NOT forward: custom params (s_id), fbclid
    //
    // Primary stitch key is `sck` (Vturb) because it's reliably forwarded.
    // The landing persists sck into a fresh stitch row at CTA mousedown,
    // capturing the sck that Vturb injected into the CTA href after load.
    const trackingParams: Record<string, any> =
      body.TrackingParameters || body.tracking_parameters || body.trackingParameters || {}
    const fbclidFromWebhook: string | null = trackingParams.fbclid || body.fbclid || null
    const sckFromWebhook: string | null = trackingParams.sck || body.sck || null

    let sessionId: string | null =
      trackingParams.s1 || trackingParams.s_id || trackingParams.session_id || body.s_id || null

    if (!sessionId) {
      const smuggleSrc = String(trackingParams.utm_content || trackingParams.utm_term || '')
      const m = smuggleSrc.match(/(?:^|[|&,\s])sid=([a-z0-9]+)/i)
      if (m) sessionId = m[1]
    }

    let stitched: Record<string, any> = await lookupStitchedBySessionId(sessionId || '')
    let stitchMode: 'sid' | 'sck' | 'fbclid' | 'miss' = stitched.session_id ? 'sid' : 'miss'

    // PRIMARY fallback: sck (Vturb) — works because Kiwify forwards it
    if (!stitched.session_id && sckFromWebhook) {
      stitched = await lookupStitchedBySck(sckFromWebhook)
      if (stitched.sck) stitchMode = 'sck'
    }

    // SECONDARY fallback: fbclid (rare, Kiwify usually drops it)
    if (!stitched.session_id && !stitched.sck && fbclidFromWebhook) {
      stitched = await lookupStitchedByFbclid(fbclidFromWebhook)
      if (stitched.fbclid) stitchMode = 'fbclid'
    }
    console.log(`[Kiwify trace] stitch=${stitchMode} sid=${sessionId} sck=${sckFromWebhook ? 'present' : 'none'} fbclid=${fbclidFromWebhook ? 'present' : 'none'} | order=${orderId} email=${email}`)
    console.log(`[Kiwify trace] stitch_row=${JSON.stringify({ fbc: !!stitched.fbc, fbp: !!stitched.fbp, ip: !!stitched.ip, ua: !!stitched.ua, fbclid: !!stitched.fbclid, sck: !!stitched.sck })}`)
    console.log(`[Kiwify trace] kiwify_params=${JSON.stringify(trackingParams).slice(0,500)}`)

    // ═══ 1b. META CAPI — Purchase (fully enriched) ═══
    const address = customer.address || customer.Address || {}
    const cpfRaw = String(customer.CPF || customer.cpf || customer.document || '').replace(/\D/g, '')

    const userData: Record<string, any> = {
      country: [hash('br')],
    }
    if (email) userData.em = [hash(email)]
    // Phone E.164: prefix 55 + strip leading zeros (Meta rejeita se tiver 0 à esquerda)
    if (phone) {
      const phoneE164 = phone.startsWith('55') ? phone : '55' + phone.replace(/^0+/, '')
      userData.ph = [hash(phoneE164)]
    }
    if (name) {
      const parts = name.split(' ').filter(Boolean)
      if (parts[0]) userData.fn = [hash(parts[0])]
      if (parts.length > 1) userData.ln = [hash(parts.slice(1).join(' '))]
    }
    if (cpfRaw) userData.external_id = [hash(cpfRaw)]
    // City normalizada: lowercase + strip accent + strip spaces (formato Meta)
    if (address.city) {
      const normCity = String(address.city)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s/g, '')
      userData.ct = [hash(normCity)]
    }
    if (address.state) userData.st = [hash(String(address.state).toLowerCase().trim())]
    const zipRaw = String(address.zipcode || address.zip_code || address.zip || '').replace(/\D/g, '')
    if (zipRaw) userData.zp = [hash(zipRaw)]

    // fbc: prefer the persisted _fbc cookie from stitch, else reconstruct
    // from fbclid (Kiwify forwards fbclid even when it drops our s_id).
    const effectiveFbclid: string | null = stitched.fbclid || fbclidFromWebhook
    if (stitched.fbc) {
      userData.fbc = stitched.fbc
    } else if (effectiveFbclid) {
      const clickTs = stitched.created_at ? Date.parse(stitched.created_at) : Date.now()
      const fbcReconstructed = fbcFromFbclid(effectiveFbclid, clickTs)
      if (fbcReconstructed) userData.fbc = fbcReconstructed
    }
    if (stitched.fbp) userData.fbp = stitched.fbp
    if (stitched.ip) userData.client_ip_address = stitched.ip
    if (stitched.ua) userData.client_user_agent = stitched.ua

    const capiBody: Record<string, any> = {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: 'https://fluencyroute.com.br/obrigado',
        user_data: userData,
        custom_data: {
          currency: 'BRL',
          value: valueReais,
          content_name: productName,
          content_type: 'product',
          content_ids: ['fluency-annual'],
          num_items: 1,
          order_id: orderId,
        },
      }],
    }
    // Switch global test mode via env var (set → aparece em Events Manager Test
    // Events, NÃO conta nas campanhas; unset → prod normal).
    if (process.env.META_TEST_EVENT_CODE) {
      capiBody.test_event_code = process.env.META_TEST_EVENT_CODE
    }
    const metaRes = await fetch(`${META_API}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capiBody),
    }).then(r => r.json()).catch((e) => ({ error: { message: `fetch threw: ${e?.message || 'unknown'}` } }))

    console.log(`[CAPI] Purchase ${orderId}: ${JSON.stringify(metaRes)}`)

    // ═══ PATCH orders row with tracking diagnostics ═══
    // The orders row was inserted at the top of the handler as dedup anchor,
    // before the stitch lookup. Now that we have user_data enriched, update
    // the row so monitoring and audits can see exactly what was sent to Meta.
    // These columns already exist in the orders schema (meta_fbc/meta_fbp/
    // meta_event_id) — we just weren't populating them before.
    try {
      const patchBody: Record<string, any> = {
        meta_event_id: eventId,
        updated_at: new Date().toISOString(),
      }
      if (userData.fbc) patchBody.meta_fbc = String(userData.fbc).slice(0, 500)
      if (userData.fbp) patchBody.meta_fbp = String(userData.fbp).slice(0, 500)
      await fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPA_SERVICE_KEY,
          Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(patchBody),
      }).catch(e => console.warn('[Kiwify] orders PATCH meta_* failed:', e?.message))
    } catch (e: any) {
      console.warn('[Kiwify] orders PATCH block threw:', e?.message)
    }

    // ═══ CAPI FAILURE ALERT — warn Marcos on WhatsApp if Meta didn't accept the event ═══
    const capiOk = metaRes && !metaRes.error && metaRes.events_received === 1
    if (!capiOk) {
      const reason = metaRes?.error?.message || metaRes?.error || 'events_received != 1'
      const alertMsg = `🚨 *CAPI Purchase FAIL — Fluency Route*

order: ${orderId}
email: ${email}
valor: R$${valueReais.toFixed(2)}
motivo: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}
trace: ${metaRes?.fbtrace_id || 'none'}

Investigar: Meta Events Manager → Diagnóstico`
      sendWhatsApp(MARCOS_PHONE, alertMsg).catch(e =>
        console.error('[Kiwify] Failed to send CAPI alert:', e?.message)
      )
    }

    // ═══ 2. CRIAR CONTA SUPABASE ═══
    let password: string | null = null
    let isNew = false

    const { user, password: newPass } = await createUser(email, name, phone)
    if (user?.id) {
      password = newPass
      isNew = true
      await createSubscription(user.id, orderId)
      console.log(`[Kiwify] User created: ${email}, id: ${user.id}`)
    } else {
      // User already exists — find by RPC and activate subscription
      const existingId = await findUserIdByEmail(email)
      if (existingId) {
        await createSubscription(existingId, orderId)
        console.log(`[Kiwify] Existing user ${email} (${existingId}), subscription activated`)
      } else {
        console.error(`[Kiwify] User ${email} not found even by RPC`)
      }
    }

    // ═══ 3. EMAIL DE BOAS-VINDAS ═══
    await sendWelcomeEmail(email, name, password, isNew)

    // ═══ 4. WHATSAPP — Mensagem pro aluno com senha ═══
    if (phone) {
      const welcomeMsg = isNew
        ? `🎉 *Bem-vindo à Rota da Fluência, ${firstName}!*

Sua compra foi confirmada! Você já vai receber o acesso da plataforma Kiwify no seu e-mail (${email}).

Mas temos uma novidade: estamos com uma *plataforma nova* que além das séries também tem *aulas em música*! 🎵

Você já pode acessar por aqui:

👉 https://app.fluencyroute.com.br

🔑 *Seus dados de acesso:*
📧 E-mail: ${email}
🔒 Senha: ${password}

Qualquer dúvida é só responder essa mensagem! 💬`
        : `Oi, ${firstName}! Seu pagamento foi confirmado! 🎉

Você já vai receber o acesso da Kiwify no seu e-mail.

Mas lembra que temos a *plataforma nova* com séries + *aulas em música*! 🎵

👉 Acesse: https://app.fluencyroute.com.br
Use o mesmo login de antes.

Qualquer dúvida é só responder essa mensagem! 💬`

      await sendWhatsApp(phone, welcomeMsg).catch(e =>
        console.error(`[WhatsApp] Falha aluno ${phone}:`, e.message)
      )
      console.log(`[WhatsApp] Welcome enviado pra ${phone}`)
    }

    // ═══ 5. WHATSAPP — Avisa Marcos ═══
    const marcosMsg = `💰 Nova venda Kiwify!

👤 ${name}
📧 ${email}
📱 ${phone || 'sem telefone'}
💵 R$${valueReais.toFixed(2)}
📦 ${productName}
🆔 ${orderId}
${isNew ? '🆕 Conta criada' : '♻️ Conta existente'}`

    await sendWhatsApp(MARCOS_PHONE, marcosMsg).catch(e =>
      console.error(`[WhatsApp] Falha Marcos:`, e.message)
    )

    return NextResponse.json({ ok: true, meta: metaRes, isNew })
  } catch (e: any) {
    console.error('[Kiwify Webhook] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
