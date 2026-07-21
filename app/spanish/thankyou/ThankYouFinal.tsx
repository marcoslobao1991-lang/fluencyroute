'use client'

import { useEffect } from 'react'
import { genEventId, getFbCookies, getClientIp, getUserAgent } from '../../lib/pixel'
import { C, FONT } from '../../vsl2/design'

// ═══════════════════════════════════════════════════════════════
// /spanish/thankyou — página FINAL (após o upsell). Dispara o Purchase do
// UPSELL ($497) SE a URL indicar que o upsell foi aprovado. Pra isso, no
// Hotmart configure a URL de "após aprovação do upsell" apontando pra:
//   fluencyroute.com.br/spanish/thankyou?upsell=1
// (o caminho de RECUSA aponta pra /spanish/thankyou sem o param → sem Purchase).
// O jeito à prova de erro é webhook Hotmart server-to-server (pendente).
// ═══════════════════════════════════════════════════════════════
const PIXEL_ID = '690970750622464'
const UPSELL_VALUE = 497

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

async function trackEs(event: string, extra: Record<string, unknown>, deterministicId: string) {
  if (typeof window === 'undefined') return
  const custom = { content_name: 'Premium Coaching (upsell)', content_type: 'product', currency: 'USD', ...extra }
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') { fbq('init', PIXEL_ID); fbq('trackSingle', PIXEL_ID, event, custom, { eventID: deterministicId }) }
  try {
    const { fbc, fbp } = getFbCookies()
    const ip = await getClientIp()
    fetch('/api/track-es', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event, eventId: deterministicId, fbc, fbp,
        external_id: getExternalId(),
        client_ip_address: ip,
        client_user_agent: getUserAgent(),
        ...custom,
      }),
    }).catch(() => {})
  } catch {}
}

export default function ThankYouFinal() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const boughtUpsell = ['1', 'true', 'approved', 'yes'].includes((p.get('upsell') || '').toLowerCase())
    if (!boughtUpsell) return

    const orderId = p.get('order_id') || p.get('transaction_id') || p.get('id') || ''
    const valueParam = parseFloat(p.get('value') || '')
    const value = Number.isFinite(valueParam) && valueParam > 0 ? valueParam : UPSELL_VALUE
    const eid = orderId ? `es-upsell-${orderId}` : `es-upsell-${genEventId()}`

    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      if (typeof (window as any).fbq !== 'function') return false
      trackEs('Purchase', { value, ...(orderId ? { order_id: orderId } : {}) }, eid)
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)
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
        You’re all set
      </p>
      <h1 style={{ fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.t1, margin: 0, maxWidth: 540 }}>
        Welcome to <span style={{ color: C.teal }}>Essential Spanish Fluency</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: C.t2, maxWidth: 460, margin: 0 }}>
        Everything is confirmed. Check your email — your access and first training steps are on the way. If it’s not there in a few minutes, check your spam folder.
      </p>
      <p style={{ fontSize: 13, color: C.t3, marginTop: 12 }}>
        <span style={{ color: C.t3, fontWeight: 800, letterSpacing: '-0.02em' }}>fluency</span>
        <span style={{ color: C.teal, fontWeight: 800 }}>route</span>
      </p>
    </main>
  )
}
