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
    const { event, eventId, fbc, fbp, email, phone, name, value, currency, orderId } = body

    if (!event) return NextResponse.json({ error: 'event required' }, { status: 400 })

    const userData: Record<string, any> = {
      client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '',
      client_user_agent: req.headers.get('user-agent') || '',
    }

    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp
    if (email) userData.em = [hash(email)]
    if (phone) userData.ph = [hash(phone.replace(/\D/g, ''))]
    if (name) {
      const parts = name.split(' ')
      userData.fn = [hash(parts[0] || '')]
      if (parts.length > 1) userData.ln = [hash(parts.slice(1).join(' '))]
    }
    userData.country = [hash('br')]

    const eventData: Record<string, any> = {
      event_name: event,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: req.headers.get('referer') || 'https://fluencyroute.com.br',
      user_data: userData,
    }

    if (eventId) eventData.event_id = eventId
    if (value || currency || orderId) {
      eventData.custom_data = {}
      if (value) eventData.custom_data.value = value
      if (currency) eventData.custom_data.currency = currency
      if (orderId) eventData.custom_data.order_id = orderId
    }

    const res = await fetch(`${API_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData] }),
    })

    const result = await res.json()
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('Meta CAPI error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
