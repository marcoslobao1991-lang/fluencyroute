'use client'

import { useEffect } from 'react'
import { getFbCookies, getClientIp, getUserAgent } from '../../lib/pixel'
import { C, FONT } from '../../vsl2/design'

// ═══════════════════════════════════════════════════════════════
// /spanish/obrigado — PÁGINA DE UPSELL (OTO) pós-compra do front.
// Copy escrita adaptada do PITCH da VSL de upsell BR (premium coaching), $497.
// Os BOTÕES de aceitar/recusar vêm do WIDGET Hotmart (salesFunnel) — os textos
// deles são configurados no painel do Hotmart (na oferta de upsell).
// Também dispara o Purchase do FRONT (pixel 690 + CAPI, dedup por order_id).
// ═══════════════════════════════════════════════════════════════
const PIXEL_ID = '690970750622464'
const UPSELL_PRICE = '$497'
const UPSELL_FROM = '$997'

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

/** Evento no pixel do Spanish: browser (trackSingle) + CAPI (mesmo eventID). */
async function trackEs(event: string, extra?: Record<string, unknown>, deterministicId?: string) {
  if (typeof window === 'undefined') return
  const eid = deterministicId || genEventId()
  const custom = { content_name: 'Essential Spanish Fluency', content_type: 'product', currency: 'USD', ...(extra || {}) }
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') { fbq('init', PIXEL_ID); fbq('trackSingle', PIXEL_ID, event, custom, { eventID: eid }) }
  try {
    const { fbc, fbp } = getFbCookies()
    const ip = await getClientIp()
    fetch('/api/track-es', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event, eventId: eid, fbc, fbp,
        external_id: getExternalId(),
        client_ip_address: ip,
        client_user_agent: getUserAgent(),
        ...custom,
      }),
    }).catch(() => {})
  } catch {}
}

const INCLUDED = [
  { n: '01', t: 'Private VIP WhatsApp group', d: 'Direct line to our specialist team, weekly challenges, and a small, closed community of people who are actually committed. Being surrounded by serious learners is what keeps your consistency high.' },
  { n: '02', t: 'Personalized feedback via WhatsApp', d: 'The single thing that moves results the most. Send audio of your training, get specific corrections, share where you’re stuck and get guidance built for your case. A Spanish coach in your pocket.' },
  { n: '03', t: 'Supervision & personalization of your training', d: 'We don’t just support you — we watch your training and tailor it to your exact level. We pinpoint where you’re stuck and build a plan that attacks that weakness directly.' },
  { n: '04', t: 'Monthly progress reviews', d: 'Every 30 days, a full review of how far you’ve come: what advanced, what to adjust, and the exact next step to move faster.' },
  { n: '05', t: 'Lifetime access to everything', d: 'Every update and every new material we build lands in your account automatically — free, forever.' },
]

export default function ThankYou() {
  useEffect(() => {
    // O Purchase do FRONT é 100% server-side (webhook Hotmart, com stitch + EMQ alto).
    // O browser NÃO dispara Purchase aqui (evita duplicação e value errado). Só o
    // ViewContent do upsell, pra retargeting.
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      if (typeof (window as any).fbq !== 'function') return false
      trackEs('ViewContent', { content_name: 'Premium Coaching (upsell)', value: 497, source: 'upsell' })
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)

    // ── Widget Hotmart (salesFunnel) — renderiza os botões de aceitar/recusar ──
    let script: HTMLScriptElement | null = null
    const mountWidget = () => {
      try { (window as any).checkoutElements?.init('salesFunnel').mount('#hotmart-sales-funnel') } catch {}
    }
    if ((window as any).checkoutElements) {
      mountWidget()
    } else {
      script = document.createElement('script')
      script.src = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js'
      script.async = true
      script.onload = mountWidget
      document.body.appendChild(script)
    }

    return () => { if (iv) clearInterval(iv) }
  }, [])

  return (
    <div style={{ background: C.bg, color: C.white, fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em' }}>
      {/* ── URGENCY BAR ── */}
      <div style={{
        background: 'linear-gradient(135deg,#ff3d6e,#ff8a3d)', color: '#fff',
        textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 800,
        letterSpacing: 0.3, position: 'sticky', top: 0, zIndex: 50,
      }}>
        ⚠️ WAIT — don’t close this page. This one-time offer won’t be shown again.
      </div>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 22px 80px' }}>
        <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.teal, marginBottom: 14 }}>
          ✓ Your enrollment is confirmed · exclusive one-time offer
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: C.t1, marginBottom: 18 }}>
          Turn your training into a <span style={{ color: C.teal }}>premium coaching experience</span>.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: C.t2, marginBottom: 12 }}>
          You just joined the Route — and you already proved you’re serious. This is your <strong style={{ color: C.t1, fontWeight: 700 }}>only chance</strong> to add direct support from our team, personal feedback on your training, and one-on-one supervision. For a fraction of the real price, and only here.
        </p>

        <div style={{ height: 1, background: C.border, margin: '36px 0' }} />
        <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.teal, marginBottom: 12 }}>Why this changes everything</p>
        <h2 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Training alone ≠ training with supervision.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.t2, marginBottom: 16 }}>
          After coaching thousands of students, one thing changes the success rate more than anything else: <strong style={{ color: C.t1, fontWeight: 700 }}>accompaniment and personalized feedback</strong>. The method is flawless on its own — but there’s a giant gap between who trains alone and who has a specialist watching closely.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.t2 }}>
          Think of a gym. I can hand you a perfect workout — but alone, your brain procrastinates, invents excuses, skips a session, and you’re left wondering: <em style={{ color: C.t1 }}>“is this even working for me?”</em> That’s exactly why serious people hire a personal trainer — someone to correct the small details that make all the difference. That’s the difference between the training you just got and the premium coaching below.
        </p>

        <div style={{ height: 1, background: C.border, margin: '36px 0' }} />
        <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.teal, marginBottom: 6 }}>What you get</p>
        <h2 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.02em', marginBottom: 24 }}>
          The complete support system.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {INCLUDED.map((it) => (
            <div key={it.n} style={{ display: 'flex', gap: 16, padding: '20px 22px', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: 10,
                background: `${C.teal}14`, border: `1px solid ${C.teal}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT.mono, fontWeight: 800, fontSize: 14, color: C.teal,
              }}>{it.n}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 4 }}>{it.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.t2 }}>{it.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: C.border, margin: '36px 0' }} />
        <h2 style={{ fontSize: 'clamp(20px, 4.2vw, 26px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.02em', marginBottom: 12 }}>
          From the training phase to the <span style={{ color: C.teal }}>point of no return</span>.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.t2, marginBottom: 8 }}>
          Fluency has two phases. First, concentrated training — you don’t understand much yet, so you drill. Then a second, immersive phase, where you stop <em>training</em> Spanish and start <em>using</em> it: movies with no subtitles, real conversations, everything in Spanish. Once you’re there, it’s <strong style={{ color: C.t1, fontWeight: 700 }}>inevitable</strong> your Spanish keeps getting better.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.t2 }}>
          The whole point of premium coaching is to get you to that second phase — the point of no return — in the shortest time possible, with total certainty you’re doing it right.
        </p>

        {/* offer */}
        <div style={{
          marginTop: 40, padding: 'clamp(28px, 6vw, 40px) clamp(22px, 5vw, 32px)',
          border: `1px solid ${C.teal}33`, borderRadius: 16,
          background: `linear-gradient(180deg, ${C.teal}0c, transparent)`, textAlign: 'center',
        }}>
          <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.teal, marginBottom: 14 }}>
            Your one-time price
          </p>
          <p style={{ fontSize: 15, color: C.t2 }}>
            Full price <span style={{ textDecoration: 'line-through', color: C.red }}>{UPSELL_FROM}/year</span>
          </p>
          <p style={{ fontSize: 13, color: C.t2, marginTop: 6 }}>Because you already showed up committed — today, 50% off:</p>
          <p style={{
            fontSize: 'clamp(46px, 12vw, 66px)', fontWeight: 900, fontFamily: FONT.mono, letterSpacing: '-0.04em',
            background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.05, marginTop: 4,
          }}>{UPSELL_PRICE}</p>
          <p style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>one-time · this page only</p>

          {/* Botões reais do upsell — renderizados pelo widget Hotmart (salesFunnel) */}
          <div id="hotmart-sales-funnel" style={{ marginTop: 24, minHeight: 60 }} />

          <p style={{ fontSize: 13, color: C.t3, marginTop: 18, lineHeight: 1.6 }}>
            🔒 7-day guarantee. Try the coaching — if it’s not for you, email us within 7 days for a full refund. No questions.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: C.t4, marginTop: 40 }}>
          <span style={{ color: C.t3, fontWeight: 800 }}>fluency</span><span style={{ color: C.teal, fontWeight: 800 }}>route</span> · All rights reserved
        </p>
      </main>
    </div>
  )
}
