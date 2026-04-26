// ═══════════════════════════════════════════════════════════════
// app/api/track/route.js — Server-side Meta CAPI relay
// Aceita eventos de qualquer domínio Fluency (landing VSL, checkout, app)
// Converte dados de usuário em SHA256 normalizado antes de enviar ao Meta
//
// Arquitetura segue `reference_tracking_playbook.md` validado em Maestro
// 21/04/2026 com EMQ 9.3.
// ═══════════════════════════════════════════════════════════════

import { sendServerEvent } from '../../lib/meta-capi.js'

const ALLOWED_ORIGINS = new Set([
  'https://fluencyroute.com.br',
  'https://www.fluencyroute.com.br',
  'https://go.fluencyroute.com.br',
  'https://app.fluencyroute.com.br',
  'https://ingles-cantado.vercel.app',
  'http://localhost:3000',
])

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://fluencyroute.com.br'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

// Parse cookie header and return value for a given name (fallback when browser
// didn't explicitly send fbc/fbp in the body).
function readCookie(request, name) {
  const raw = request.headers.get('cookie') || ''
  const match = raw.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) })
}

export async function POST(request) {
  const origin = request.headers.get('origin') || ''
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' }

  try {
    const body = await request.json()
    const {
      event,
      eventId,
      // Meta cookies (browser sends; fallback to server cookie)
      fbc: fbcBody,
      fbp: fbpBody,
      // User PII — all optional, any combo supported
      email,
      phone,
      cpf,
      name,
      city,
      state,
      zip,
      external_id,
      sessionId,
      // Custom data
      value,
      currency,
      content_name,
      content_ids,
      content_type,
      order_id,
      num_items,
      // Misc
      referer: refOverride,
      test_event_code,
      client_ip_address,
      client_user_agent,
    } = body

    if (!event || !eventId) {
      return new Response(JSON.stringify({ error: 'event + eventId obrigatórios' }), { status: 400, headers })
    }

    const ip = client_ip_address || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
    const userAgent = client_user_agent || request.headers.get('user-agent') || ''
    const referer = refOverride || request.headers.get('referer') || ''

    // fbc/fbp: prefer body value (explicit from browser), fallback to server-side cookie jar.
    const fbc = fbcBody || readCookie(request, '_fbc')
    const fbp = fbpBody || readCookie(request, '_fbp')

    const result = await sendServerEvent(
      event,
      {
        ip,
        userAgent,
        fbc,
        fbp,
        email,
        phone,
        cpf,
        name,
        city,
        state,
        zip,
        externalId: external_id,
        sessionId,
      },
      {
        value,
        currency,
        content_name,
        content_ids,
        content_type,
        order_id,
        num_items,
      },
      referer,
      eventId,
      test_event_code || ''
    )

    // Debug: surface Meta response so we can verify from the client
    const debug = request.headers.get('x-debug') === '1'
    return new Response(
      JSON.stringify(debug ? { ok: true, meta: result || null } : { ok: true }),
      { status: 200, headers }
    )
  } catch (err) {
    console.error('[TRACK]', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}
