import { NextRequest, NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const session_id = body?.session_id
    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'session_id required' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      ''
    const ua = req.headers.get('user-agent') || ''

    const row = {
      session_id,
      fbc: body.fbc || null,
      fbp: body.fbp || null,
      fbclid: body.fbclid || null,
      ip,
      ua,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      utm_term: body.utm_term || null,
      sck: body.sck || null,
    }

    await fetch(`${SUPA_URL}/rest/v1/checkout_sessions`, {
      method: 'POST',
      headers: {
        apikey: SUPA_SERVICE_KEY,
        Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=merge-duplicates',
      },
      body: JSON.stringify(row),
    }).catch((e) => console.error('[checkout-session] insert failed:', e?.message))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[checkout-session] error:', e?.message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
