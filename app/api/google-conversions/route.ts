import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
//  GOOGLE ADS — importação offline de conversões (CSV agendado)
//  O Google Ads puxa esta URL diariamente (Metas → Conversões → Uploads →
//  agendamento HTTPS): https://fluencyroute.com.br/api/google-conversions?key=CRON_SECRET
//
//  Exporta compras pagas dos últimos 90 dias que têm gclid costurado
//  (checkout_sessions → orders via kiwify-webhook), com valor REAL em BRL.
//  "Conversion Name" tem que bater EXATAMENTE com o nome da ação de conversão
//  do tipo "Importar" criada no painel: "Compra Offline".
//  Order ID = pagarme_order_id, mesmo transaction_id da tag browser → dedup.
//
//  gbraid/wbraid (iOS) ficam gravados nas tabelas mas NÃO saem neste CSV —
//  o template de upload por clique só aceita gclid; incluir depois via API.
//  Auth: ?key=CRON_SECRET ou Authorization: Bearer (mesmo padrão do funil-emails).
// ═══════════════════════════════════════════════════════════════

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const CONVERSION_NAME = 'Compra Offline'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || (auth !== `Bearer ${secret}` && req.nextUrl.searchParams.get('key') !== secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supaKey = process.env.SUPABASE_SERVICE_KEY!
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const q =
    `${SUPA_URL}/rest/v1/orders` +
    `?select=pagarme_order_id,amount_cents,created_at,gclid` +
    `&gclid=not.is.null&status=eq.paid&created_at=gte.${since}` +
    `&order=created_at.asc&limit=10000`

  let rows: Array<{ pagarme_order_id: string; amount_cents: number; created_at: string; gclid: string }> = []
  try {
    const r = await fetch(q, {
      headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` },
      cache: 'no-store',
    })
    if (!r.ok) {
      const t = await r.text().catch(() => '')
      return NextResponse.json({ error: 'query_failed', status: r.status, detail: t.slice(0, 200) }, { status: 500 })
    }
    rows = await r.json()
  } catch (e: any) {
    return NextResponse.json({ error: 'query_failed', detail: e?.message }, { status: 500 })
  }

  // Horário em America/Sao_Paulo com offset explícito (Brasil sem DST desde 2019 → -03:00 fixo)
  const toSaoPaulo = (iso: string) => {
    const d = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000)
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
      `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}-03:00`
  }

  const header = 'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID'
  const lines = rows.map((o) =>
    [o.gclid, CONVERSION_NAME, toSaoPaulo(o.created_at), (o.amount_cents / 100).toFixed(2), 'BRL', o.pagarme_order_id].join(',')
  )
  return new NextResponse([header, ...lines].join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
