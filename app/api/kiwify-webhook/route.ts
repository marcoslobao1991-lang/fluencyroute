import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = '938768337634102'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!

const API_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
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
    const phone = (customer.mobile || '').replace(/\D/g, '')
    const orderId = body.order_id || body.subscription_id || String(Date.now())
    const value = body.Commissions?.charge_amount || body.Product?.price || 0
    const eventId = `kiwify-${orderId}`

    const userData: Record<string, any> = {
      country: [hash('br')],
    }
    if (email) userData.em = [hash(email)]
    if (phone) userData.ph = [hash(phone)]
    if (name) {
      const parts = name.split(' ')
      userData.fn = [hash(parts[0] || '')]
      if (parts.length > 1) userData.ln = [hash(parts.slice(1).join(' '))]
    }

    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: 'https://fluencyroute.com.br/vsl',
      user_data: userData,
      custom_data: {
        currency: 'BRL',
        value: parseFloat(value) || 0,
        content_name: body.Product?.product_name || 'Inglês Cantado',
        order_id: orderId,
      },
    }

    const res = await fetch(`${API_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData] }),
    })

    const result = await res.json()
    console.log(`[Kiwify→CAPI] Purchase ${orderId}: ${JSON.stringify(result)}`)

    return NextResponse.json({ ok: true, meta: result })
  } catch (e: any) {
    console.error('[Kiwify→CAPI] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
