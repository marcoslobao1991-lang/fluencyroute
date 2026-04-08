import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ── Meta CAPI ──
const PIXEL_ID = '938768337634102'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!
const META_API = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`

// ── Z-API WhatsApp ──
const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN!
const MARCOS_PHONE = '5511971167821'

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
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
    const value = body.Commissions?.charge_amount || body.Product?.price || 0
    const productName = body.Product?.product_name || 'Fluency Route'
    const eventId = `kiwify-${orderId}`

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

    // ═══ 2. WHATSAPP — Mensagem pro aluno ═══
    if (phone) {
      const welcomeMsg = `Oi, ${firstName}! Tudo bem? Aqui é da Fluency Route! 🎵

Sua compra foi confirmada e seu acesso já tá pronto!

Temos uma novidade: estamos com uma plataforma novinha, muito mais completa, e você já pode acessar por ela:

👉 https://app.fluencyroute.com.br

Seu login é o email que você usou na compra:
📧 ${email}

Na primeira vez, clica em "Esqueci minha senha" pra criar sua senha de acesso.

Qualquer dúvida é só responder essa mensagem!

Bons estudos! 🚀`

      await sendWhatsApp(phone, welcomeMsg).catch(e =>
        console.error(`[WhatsApp] Falha aluno ${phone}:`, e.message)
      )
      console.log(`[WhatsApp] Welcome enviado pra ${phone}`)
    }

    // ═══ 3. WHATSAPP — Avisa Marcos ═══
    const marcosMsg = `💰 Nova venda Kiwify!

👤 ${name}
📧 ${email}
📱 ${phone || 'sem telefone'}
💵 R$${parseFloat(value).toFixed(2)}
📦 ${productName}
🆔 ${orderId}`

    await sendWhatsApp(MARCOS_PHONE, marcosMsg).catch(e =>
      console.error(`[WhatsApp] Falha Marcos:`, e.message)
    )

    return NextResponse.json({ ok: true, meta: metaRes })
  } catch (e: any) {
    console.error('[Kiwify Webhook] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
