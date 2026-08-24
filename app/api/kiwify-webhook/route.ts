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
const KIWIFY_COURSE_URL = 'https://dashboard.kiwify.com.br/course/a9510c15-b1f7-49a5-9004-ecfbe5561311'

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
  const firstName = (name || '').split(' ')[0] || 'aluno'
  // 24/08/2026: INVERSÃO. O curso volta a ser entregue na área de membros da
  // Kiwify (7% de reembolso histórico vs 11-20% com o app na frente). O app
  // (Manu: Listening + Shadowing) vira BÔNUS de nível intermediário.
  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;background:#0A0A0A;border-radius:16px;overflow:hidden">
      <div style="padding:36px 32px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
        <h1 style="color:#fff;font-size:23px;margin:0">Bem-vindo ao <span style="color:#4ECDC4">Fluency Route</span></h1>
        <p style="color:rgba(255,255,255,0.55);font-size:14px;margin-top:8px">${firstName}, seu acesso está liberado. Comece pela aula inaugural 👇</p>
      </div>
      <div style="padding:28px 32px 32px">
        <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.7;margin:0 0 18px">
          O caminho é simples e tem <strong style="color:#fff">ordem</strong>. Faça assim:
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 22px">
          <tr><td style="vertical-align:top;padding:0 12px 14px 0;color:#4ECDC4;font-weight:800;font-size:16px">1.</td>
            <td style="padding-bottom:14px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.6">Entre na <b>área do curso</b> (botão verde). É onde estão as aulas do Marcos, na ordem certa: comece pelo módulo <b>COMECE AQUI</b> e assista a aula inaugural.</td></tr>
          <tr><td style="vertical-align:top;padding:0 12px 14px 0;color:#4ECDC4;font-weight:800;font-size:16px">2.</td>
            <td style="padding-bottom:14px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.6">Siga a sequência: Fase Zero, Fase 1 e os Treinos Concentrados. Uma aula por dia já resolve.</td></tr>
          <tr><td style="vertical-align:top;padding:0 12px 0 0;color:#A78BFA;font-weight:800;font-size:16px">+</td>
            <td style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.6"><b style="color:#A78BFA">Bônus: o app de treino com a MANU</b> (Listening e Shadowing com cenas de série). É nível intermediário: use quando bater a primeira meta do curso. Os dados estão abaixo, guarde.</td></tr>
        </table>
        <a href="${KIWIFY_COURSE_URL}" style="display:block;text-align:center;padding:17px;background:#4ECDC4;color:#000;font-weight:800;font-size:15px;border-radius:10px;text-decoration:none;margin-bottom:12px">ENTRAR NA ÁREA DO CURSO →</a>
        <p style="color:rgba(255,255,255,0.45);font-size:12px;line-height:1.6;text-align:center;margin:0 0 22px">Lá o login é com este mesmo e-mail (a Kiwify também te mandou um e-mail de acesso).</p>
        ${isNew && password ? `
        <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.25);border-radius:12px;padding:18px 20px;margin-bottom:18px">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px">Bônus · app de treino (app.fluencyroute.com.br)</p>
          <p style="color:#fff;font-size:14px;margin:0 0 6px"><strong>E-mail:</strong> ${email}</p>
          <p style="color:#fff;font-size:14px;margin:0"><strong>Senha:</strong> <code style="background:rgba(167,139,250,0.12);color:#A78BFA;padding:2px 8px;border-radius:4px;font-size:16px;letter-spacing:1px">${password}</code></p>
        </div>
        ` : `
        <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.25);border-radius:12px;padding:14px 20px;margin-bottom:18px">
          <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0">Bônus · app de treino: <b>app.fluencyroute.com.br</b>, com o mesmo login de sempre.</p>
        </div>
        `}
        <p style="color:rgba(255,255,255,0.45);font-size:12.5px;line-height:1.6;text-align:center;margin:0">Perdeu a senha do app? Entre <b>sem senha</b> em <a href="https://fluencyroute.com.br/acesso" style="color:#4ECDC4">fluencyroute.com.br/acesso</a><br>Qualquer dúvida, responda este e-mail.</p>
      </div>
    </div>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Rota da Fluência <contato@acesso.fluencyroute.com.br>',
      to: email,
      subject: isNew ? 'Seu acesso chegou: comece pela aula inaugural' : 'Pagamento confirmado: Fluency Route',
      html,
    }),
  }).catch(e => console.error('[Kiwify] Email failed:', e.message))
}

/* ── WhatsApp: Cloud API OFICIAL (Meta) ──────────────────────────────
   Z-API desativada de vez (baniu o número pessoal em 28/07).
   Liga sozinho quando WA_CLOUD_TOKEN + WA_CLOUD_PHONE_ID existirem na
   Vercel (número novo dedicado, portfólio empresarial próprio).
   Regra da Meta: mensagem iniciada pela empresa exige TEMPLATE aprovado;
   texto livre só dentro da janela de 24h após o cliente mandar msg. */
const WA_TOKEN = process.env.WA_CLOUD_TOKEN || ''
const WA_PHONE_ID = process.env.WA_CLOUD_PHONE_ID || ''
const waPronto = () => !!(WA_TOKEN && WA_PHONE_ID)

async function sendWhatsApp(phone: string, message: string) {
  if (!waPronto()) { console.log('[WA] transporte desligado — aguardando Cloud API'); return }
  const to = phone.startsWith('55') ? phone : `55${phone}`
  await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } }),
  })
}

/* template de utilidade (ex.: acesso_d0 com {{1}}=nome {{2}}=email {{3}}=senha) */
async function sendWhatsAppTemplate(phone: string, template: string, params: string[]) {
  if (!waPronto()) { console.log(`[WA] template ${template} não enviado — Cloud API off`); return }
  const to = phone.startsWith('55') ? phone : `55${phone}`
  await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to, type: 'template',
      template: {
        name: template, language: { code: 'pt_BR' },
        components: [{ type: 'body', parameters: params.map(t => ({ type: 'text', text: t })) }],
      },
    }),
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

    // ═══ REEMBOLSO / CHARGEBACK — corta o acesso e avisa ═══
    const eventType = String(body.webhook_event_type || '')
    const isRefund = status === 'refunded' || status === 'chargedback' || /refund|chargeback/i.test(eventType)
    if (isRefund) {
      const refCustomer = body.Customer || body.customer || {}
      const refEmail = String(refCustomer.email || '').toLowerCase().trim()
      const refOrderId = String(body.order_id || '')
      const nowIso = new Date().toISOString()
      const H = {
        'apikey': SUPA_SERVICE_KEY,
        'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }

      // 1. marca o pedido
      let marcados = 0
      if (refOrderId) {
        const r1 = await fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(refOrderId)}`, {
          method: 'PATCH', headers: H, body: JSON.stringify({ status: 'refunded', refunded_at: nowIso }),
        })
        marcados = ((await r1.json().catch(() => [])) as any[]).length || 0
      }
      if (marcados === 0 && refEmail) {
        await fetch(`${SUPA_URL}/rest/v1/orders?customer_email=ilike.${encodeURIComponent(refEmail)}&status=eq.paid`, {
          method: 'PATCH', headers: H, body: JSON.stringify({ status: 'refunded', refunded_at: nowIso }),
        }).catch(() => {})
      }

      // 2. corta o acesso (subscriptions do pedido; fallback: todas do usuário)
      let subsCortadas = 0
      if (refOrderId) {
        const r2 = await fetch(`${SUPA_URL}/rest/v1/subscriptions?pagarme_order_id=eq.${encodeURIComponent(refOrderId)}`, {
          method: 'PATCH', headers: H, body: JSON.stringify({ status: 'refunded', expires_at: nowIso }),
        })
        subsCortadas = ((await r2.json().catch(() => [])) as any[]).length || 0
      }
      if (subsCortadas === 0 && refEmail) {
        const uid = await findUserIdByEmail(refEmail)
        if (uid) {
          await fetch(`${SUPA_URL}/rest/v1/subscriptions?user_id=eq.${uid}&status=eq.active`, {
            method: 'PATCH', headers: H, body: JSON.stringify({ status: 'refunded', expires_at: nowIso }),
          }).catch(() => {})
        }
      }

      // 3. avisa Marcos por e-mail (WhatsApp está fora do ar)
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Rota da Fluência <contato@acesso.fluencyroute.com.br>',
            to: 'marcoslobao1991@gmail.com',
            subject: `🔴 ${status === 'chargedback' || /chargeback/i.test(eventType) ? 'CHARGEBACK' : 'Reembolso'} Kiwify — ${refEmail}`,
            html: `<p>Evento: <b>${eventType || status}</b></p><p>Cliente: <b>${refEmail}</b></p><p>Pedido: ${refOrderId || '—'}</p><p>Acesso cortado automaticamente (subscription encerrada).</p>`,
          }),
        }).catch(() => {})
      }

      console.log(`[Kiwify] REFUND processado: ${refEmail} order=${refOrderId}`)
      return NextResponse.json({ ok: true, refund: true })
    }

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

    // ═══ 1b. GOOGLE OFFLINE CONVERSIONS — persiste click IDs no pedido ═══
    // A sessão costurada pode carregar gclid/gbraid/wbraid (salvos no clique do
    // CTA). Gravar no pedido é o que permite o /api/google-conversions exportar
    // a compra pro Google Ads com valor real. Fire-and-forget: falha aqui
    // (ex: colunas ainda não migradas) não pode afetar CAPI/email.
    const googleIds: Record<string, string> = {}
    for (const k of ['gclid', 'gbraid', 'wbraid']) {
      if (stitched[k]) googleIds[k] = stitched[k]
    }
    if (Object.keys(googleIds).length > 0) {
      fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPA_SERVICE_KEY,
          Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(googleIds),
      }).then(r => {
        if (!r.ok) console.warn(`[Kiwify] google click id patch failed HTTP ${r.status} — rode a migração das colunas gclid`)
      }).catch(e => console.warn('[Kiwify] google click id patch failed:', e?.message))
    }

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

    // ═══ 4. WHATSAPP — acesso do aluno (template acesso_d0, Cloud API) ═══
    // Mensagem antiga mandava o aluno "esperar o acesso da Kiwify" — era
    // parte da confusão. O template novo aponta SÓ pra plataforma + MANU.
    if (phone) {
      await sendWhatsAppTemplate(phone, 'acesso_d0', [
        firstName,
        email,
        password || 'a que você já usa (ou entre sem senha: fluencyroute.com.br/acesso)',
      ]).catch(e => console.error(`[WhatsApp] Falha aluno ${phone}:`, e.message))
    }

    // ═══ 5. AVISA MARCOS — e-mail com WhatsApp de 1 CLIQUE ═══
    // Ponte até a Cloud API: o e-mail traz um botão wa.me com a mensagem de
    // acesso PRONTA (nome, e-mail, senha). Marcos toca, confere e envia do
    // próprio celular — conversa manual, zero risco de ban.
    if (RESEND_API_KEY) {
      const msgAluno = `Oi ${firstName}! Aqui é o Marcos, do Rota da Fluência 😊\n\nSua compra foi aprovada — obrigado pela confiança!\n\n🎉 E você chegou em boa hora: a Fluency Route está de PLATAFORMA NOVA, e o seu curso completo já te espera nela:\n👉 app.fluencyroute.com.br\n\n(responde aqui com um "oi" que o link fica clicável pra você 😉 e já salva nos favoritos!)\n\nSeus dados de acesso:\nE-mail: ${email}\nSenha: ${password || 'a que você já usa (ou entre sem senha: fluencyroute.com.br/acesso)'}\n\nAh, e o melhor da plataforma nova: a MANU, sua teacher particular de IA, já está lá te esperando — entra e diz oi pra ela! 💜\n\n(O e-mail da Kiwify é só o comprovante do pagamento — o curso mora no link aqui de cima 😉)\n\nQualquer coisa me chama por aqui!`
      const foneAluno = phone ? (phone.startsWith('55') ? phone : `55${phone}`) : ''
      const linkZap = foneAluno ? `https://wa.me/${foneAluno}?text=${encodeURIComponent(msgAluno)}` : ''
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Rota da Fluência <contato@acesso.fluencyroute.com.br>',
          to: 'marcoslobao1991@gmail.com',
          subject: `💰 Venda R$${valueReais.toFixed(2)} — ${name}${foneAluno ? ' · WhatsApp em 1 clique' : ''}`,
          html: `<div style="font-family:sans-serif;max-width:480px">
            <h2 style="margin:0 0 12px">💰 Nova venda Kiwify</h2>
            <p style="margin:0 0 16px;line-height:1.7">👤 <b>${name}</b><br>📧 ${email}<br>📱 ${phone || 'sem telefone'}<br>💵 R$${valueReais.toFixed(2)} · ${productName}<br>${isNew ? '🆕 Conta criada' : '♻️ Conta existente'} · 🆔 ${orderId}</p>
            ${linkZap ? `<a href="${linkZap}" style="display:block;text-align:center;background:#25D366;color:#fff;font-weight:800;font-size:16px;padding:16px;border-radius:12px;text-decoration:none">📱 Mandar o acesso no WhatsApp (mensagem pronta)</a>
            <p style="color:#888;font-size:12px;margin-top:10px">Abre a conversa com a mensagem de boas-vindas preenchida — só conferir e enviar.</p>` : '<p style="color:#888">Comprador sem telefone — o e-mail de acesso já foi enviado.</p>'}
          </div>`,
        }),
      }).catch(e => console.error('[Venda] alerta email falhou:', e.message))
    }
    // (quando a Cloud API ligar, o aviso também vai por template no zap)
    await sendWhatsApp(MARCOS_PHONE, `💰 Venda: ${name} · R$${valueReais.toFixed(2)}`).catch(() => {})

    return NextResponse.json({ ok: true, meta: metaRes, isNew })
  } catch (e: any) {
    console.error('[Kiwify Webhook] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
