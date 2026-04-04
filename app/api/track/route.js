// ═══════════════════════════════════════════════════════════════
// /api/track — Lightweight server-side Meta CAPI relay
// Receives events from browser, forwards to Meta with IP + UA
// ═══════════════════════════════════════════════════════════════

import { sendServerEvent } from '../../lib/meta-capi.js'

export async function POST(request) {
  try {
    const { event, eventId, fbc, fbp, userData } = await request.json()

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
    const userAgent = request.headers.get('user-agent') || ''

    await sendServerEvent(
      event,
      { ...userData, ip, userAgent, fbc, fbp },
      {},
      '',
      eventId
    )

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200 })
  }
}
