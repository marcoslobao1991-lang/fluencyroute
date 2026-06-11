import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!
const PIXEL_ID = '938768337634102'
const META_TOKEN = process.env.META_CAPI_TOKEN!
const META_API = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, bucket, answers, utms, fbc, fbp, ip, ua, eventId } = body

    if (!email || !phone) {
      return NextResponse.json({ error: 'Email e WhatsApp obrigatórios' }, { status: 400 })
    }

    const cleanPhone = String(phone).replace(/\D/g, '')
    const cleanEmail = String(email).toLowerCase().trim()

    await fetch(`${SUPA_URL}/rest/v1/quiz_leads`, {
      method: 'POST',
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: name || null,
        email: cleanEmail,
        phone: cleanPhone,
        bucket: bucket || null,
        answers: answers || {},
        utms: utms || {},
        source: 'quiz',
      }),
    }).catch(e => console.error('[quiz-lead] supabase insert failed:', e?.message))

    const userData: Record<string, any> = {
      em: [hash(cleanEmail)],
      ph: [hash(cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`)],
      country: [hash('br')],
    }
    if (name) userData.fn = [hash(String(name).split(' ')[0])]
    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp
    if (ip) userData.client_ip_address = ip
    if (ua) userData.client_user_agent = ua

    const eid = eventId || `quizlead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    fetch(`${META_API}?access_token=${META_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eid,
          action_source: 'website',
          event_source_url: 'https://fluencyroute.com.br/quiz',
          user_data: userData,
          custom_data: {
            content_name: 'Quiz Rota da Fluência',
            content_category: bucket || 'unknown',
          },
        }],
      }),
    }).catch(e => console.error('[quiz-lead] CAPI failed:', e?.message))

    return NextResponse.json({ ok: true, bucket, eventId: eid })
  } catch (err: any) {
    console.error('[quiz-lead] Error:', err?.message)
    return NextResponse.json({ error: err?.message || 'unknown' }, { status: 500 })
  }
}
