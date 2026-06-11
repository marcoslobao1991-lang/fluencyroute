import { NextRequest, NextResponse } from 'next/server'

// Server endpoint pro PurchaseTrigger puxar email do comprador (Enhanced Conversions Google Ads).
// Returns 404 se webhook ainda não criou a row — cliente faz polling até 10s.

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id')
  if (!orderId) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  // Anti-enumeration: aceita só order_ids no padrão Kiwify (uuids ou alfanum > 8 chars)
  if (orderId.length < 6 || !/^[A-Za-z0-9_-]+$/.test(orderId)) {
    return NextResponse.json({ error: 'invalid_order_id' }, { status: 400 })
  }

  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/orders?pagarme_order_id=eq.${encodeURIComponent(orderId)}&select=customer_email,amount_cents`,
      {
        headers: {
          apikey: SUPA_SERVICE_KEY,
          Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
        },
        cache: 'no-store',
      },
    )
    const rows = (await r.json()) as Array<{ customer_email?: string; amount_cents?: number }>
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ found: false }, { status: 404 })
    }
    const row = rows[0]
    return NextResponse.json({
      found: true,
      email: row.customer_email || null,
      value: row.amount_cents ? row.amount_cents / 100 : null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
}
