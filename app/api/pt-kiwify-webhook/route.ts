// Webhook Kiwify do PORTUGUÊS CANTADO (produto GCjyu8t) — registra a venda
// no funnel_events (funnel=portugues, page=obrigado, event=purchase) pra
// seção de vendas do stats.html voltar a contar. Server-side: pega 100% das
// vendas, incluindo Pix/boleto confirmado depois (o redirect pós-compra do
// /obrigado só pegava cartão aprovado na hora — e parou de contar em 22/05).
//
// Configurar na Kiwify: Apps > Webhooks > criar webhook do produto
// "Português Cantado", evento de compra aprovada, apontando pra:
//   https://fluencyroute.com.br/api/pt-kiwify-webhook?token=cab8260dc2bee168a38b6129a30ead4e
//
// Dedup por order_id no campo detail ("kiwify:<order_id>").

import { NextRequest, NextResponse } from 'next/server'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const TOKEN = 'cab8260dc2bee168a38b6129a30ead4e'

export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ error: 'no service key' }, { status: 500 })
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, any>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const status = String(body.order_status || body.Order?.order_status || '').toLowerCase()
  if (status !== 'paid' && status !== 'approved') {
    return NextResponse.json({ ok: true, skipped: status || 'no-status' })
  }

  const orderId = String(body.order_id || body.Order?.order_id || '')
  if (!orderId) return NextResponse.json({ error: 'no order_id' }, { status: 400 })
  const dedupKey = `kiwify:${orderId}`
  const valueCents = Number(
    body.Commissions?.charge_amount ?? body.charge_amount ?? body.Order?.charge_amount ?? 0
  )

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }

  // dedup: webhook da Kiwify faz retry — não duplicar a venda no stats
  const dupRes = await fetch(
    `${SUPA_URL}/rest/v1/funnel_events?select=id&event=eq.purchase&detail=eq.${encodeURIComponent(dedupKey)}&limit=1`,
    { headers }
  )
  const dup = await dupRes.json().catch(() => [])
  if (Array.isArray(dup) && dup.length > 0) {
    return NextResponse.json({ ok: true, deduped: true })
  }

  const ins = await fetch(`${SUPA_URL}/rest/v1/funnel_events`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({
      funnel: 'portugues',
      page: 'obrigado',
      event: 'purchase',
      detail: dedupKey,
      value: valueCents ? valueCents / 100 : null,
      session_id: crypto.randomUUID(),
    }),
  })
  if (!ins.ok) {
    const t = await ins.text().catch(() => '')
    return NextResponse.json({ error: 'insert failed', detail: t.slice(0, 200) }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
