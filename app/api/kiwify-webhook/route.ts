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

async function findUserByEmail(email: string) {
  const res = await fetch(`${SUPA_URL}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: {
      'apikey': SUPA_SERVICE_KEY,
      'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
    },
  })
  const data = await res.json()
  return (data.users || []).find((u: any) => u.email === email)
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Kiwify sends order_status: 'paid' for approved purchases
    const status = body.order_status
    if (status !== 'paid') {
      return NextResponse.json({ ok: true, skipped: status })
    }

    const customer = body.Customer || {}
    const email = (customer.email || '').toLowerCase().trim()
    const name = customer.full_name || ''
    const firstName = name.split(' ')[0] || 'aluno'
    const phone = (customer.mobile || '').replace(/\D/g, '')
    const orderId = body.order_id || body.subscription_id || String(Date.now())

    // ═══ DEDUP: skip if already processed ═══
    const dedupCheck = await fetch(`${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}&select=id`, {
      headers: { 'apikey': SUPA_SERVICE_KEY, 'Authorization': `Bearer ${SUPA_SERVICE_KEY}` },
    }).then(r => r.json()).catch(() => [])
    if (dedupCheck.length > 0) {
      console.log(`[Kiwify] Duplicate webhook for order ${orderId}, skipping`)
      return NextResponse.json({ ok: true, duplicate: true })
    }
    const value = body.Commissions?.charge_amount || body.Product?.price || 0
    const productName = body.Product?.product_name || 'Fluency Route'
    const eventId = `kiwify-${orderId}`

    // ═══ 0. SAVE ORDER (dedup anchor) ═══
    await fetch(`${SUPA_URL}/rest/v1/orders`, {
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
        amount_cents: Math.round(parseFloat(value) * 100) || 0,
        payment_method: 'kiwify',
        status: 'paid',
      }),
    }).catch(e => console.error('[Kiwify] Failed to save order:', e.message))

    // ═══ 1. META CAPI — Purchase ═══
    const userData: Record<string, any> = { country: [hash('br')] }
    if (email) userData.em = [hash(email)]
    if (phone) userData.ph = [hash(phone)]
    if (name) {
      const parts = name.split(' ')
      userData.fn = [hash(parts[0] || '')]
      if (parts.length > 1) userData.ln = [hash(parts.slice(1).join(' '))]
    }

    const metaRes = await fetch(`${META_API}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url: 'https://fluencyroute.com.br/vsl',
          user_data: userData,
          custom_data: {
            currency: 'BRL',
            value: parseFloat(value) || 0,
            content_name: productName,
            order_id: orderId,
          },
        }],
      }),
    }).then(r => r.json()).catch(() => ({ error: 'meta failed' }))

    console.log(`[CAPI] Purchase ${orderId}: ${JSON.stringify(metaRes)}`)

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
      // User already exists — just activate subscription
      const existing = await findUserByEmail(email)
      if (existing) {
        await createSubscription(existing.id, orderId)
        console.log(`[Kiwify] Existing user ${email}, subscription activated`)
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
💵 R$${parseFloat(value).toFixed(2)}
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
