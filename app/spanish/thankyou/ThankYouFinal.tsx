'use client'

import { C, FONT } from '../../vsl2/design'

// ═══════════════════════════════════════════════════════════════
// /spanish/thankyou — página FINAL (após o upsell).
// O Purchase do upsell é 100% server-side via webhook do Hotmart (com stitch +
// EMQ alto + dedup por eventId es-purchase-<transaction>). O browser NÃO dispara
// Purchase aqui — evita contagem dobrada. Esta página é só a confirmação visual.
// ═══════════════════════════════════════════════════════════════

export default function ThankYouFinal() {
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
