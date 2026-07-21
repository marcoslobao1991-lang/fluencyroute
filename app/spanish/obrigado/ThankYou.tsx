'use client'

import { useEffect } from 'react'
import { genEventId, getFbCookies, getClientIp, getUserAgent } from '../../lib/pixel'
import { C, FONT } from '../../vsl2/design'

// Purchase do Spanish. MVP: dispara no browser (pixel 690, trackSingle) + CAPI
// (/api/track-es) com o MESMO eventID pra dedup. eventID é determinístico por
// order_id → refresh na página não conta compra dobrada.
// Quando o checkout real (Kiwify/Stripe) tiver webhook, o Purchase deve migrar
// pra 100% server-side (igual o inglês faz via /api/kiwify-webhook).
const PIXEL_ID = '690970750622464'

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

export default function ThankYou() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const orderId = p.get('order_id') || p.get('transaction_id') || p.get('id') || ''
    const email = (p.get('email') || p.get('customer_email') || '').trim().toLowerCase() || undefined
    const valueParam = parseFloat(p.get('value') || '')
    const value = Number.isFinite(valueParam) && valueParam > 0 ? valueParam : 342 // 6 × $57

    // eventID determinístico por order_id (dedup em refresh); sem order_id → aleatório
    const eid = orderId ? `es-purchase-${orderId}` : genEventId()
    const custom: Record<string, unknown> = {
      content_name: 'Essential Spanish Fluency',
      content_type: 'product',
      currency: 'USD',
      value,
      ...(orderId ? { order_id: orderId } : {}),
    }

    // Browser pixel
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      const fbq = (window as any).fbq
      if (typeof fbq !== 'function') return false
      fbq('init', PIXEL_ID)
      fbq('trackSingle', PIXEL_ID, 'Purchase', custom, { eventID: eid })
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)

    // Server CAPI (mesmo eventID)
    ;(async () => {
      try {
        const { fbc, fbp } = getFbCookies()
        const ip = await getClientIp()
        fetch('/api/track-es', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'Purchase',
            eventId: eid,
            fbc, fbp,
            email,
            external_id: getExternalId(),
            client_ip_address: ip,
            client_user_agent: getUserAgent(),
            ...custom,
          }),
        }).catch(() => {})
      } catch {}
    })()

    return () => { if (iv) clearInterval(iv) }
  }, [])

  return (
    <main style={{
      background: C.bg, color: C.white, fontFamily: FONT.body, fontWeight: 300,
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 24px', gap: 18,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 30px ${C.teal}44`,
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#030305" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: C.teal }}>
        You’re in
      </p>
      <h1 style={{ fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.t1, margin: 0, maxWidth: 520 }}>
        Welcome to <span style={{ color: C.teal }}>Essential Spanish Fluency</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: C.t2, maxWidth: 460, margin: 0 }}>
        Your spot is confirmed. Check your email — your access and first training steps are on the way. If it’s not there in a few minutes, look in your spam folder.
      </p>
      <p style={{ fontSize: 13, color: C.t3, marginTop: 12 }}>
        <span style={{ color: C.t3, fontWeight: 800, letterSpacing: '-0.02em' }}>fluency</span>
        <span style={{ color: C.teal, fontWeight: 800 }}>route</span>
      </p>
    </main>
  )
}
