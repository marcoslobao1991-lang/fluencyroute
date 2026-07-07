import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'

const allowed = new Set([
  'funnel',
  'page',
  'variant',
  'event',
  'detail',
  'session_id',
  'path',
  'referrer',
  'user_agent',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
])

function clean(value: unknown, max = 500) {
  if (value == null) return null
  return String(value).slice(0, max)
}

export async function POST(req: Request) {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return NextResponse.json({ error: 'missing service key' }, { status: 500 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const row: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (!allowed.has(k)) continue
    row[k] = clean(v, k === 'detail' ? 200 : 500)
  }

  row.funnel ||= 'leadmagnet'
  row.event = clean(row.event, 80)
  row.page = clean(row.page, 80)
  row.variant = clean(row.variant, 80)

  if (!row.event || !row.page) {
    return NextResponse.json({ error: 'event + page required' }, { status: 400 })
  }

  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/funnel_events`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    })

    if (!r.ok) {
      const text = await r.text()
      console.error('[funnel-event]', r.status, text)
      return NextResponse.json({ error: 'supabase insert failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[funnel-event]', err)
    return NextResponse.json({ error: 'insert error' }, { status: 500 })
  }
}
