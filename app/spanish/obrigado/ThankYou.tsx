'use client'

import { useEffect, type CSSProperties } from 'react'
import { getFbCookies, getClientIp, getUserAgent, genEventId } from '../../lib/pixel'
import { C, FONT } from '../../vsl2/design'
import { useInView } from '../../vsl2/primitives'

// ═══════════════════════════════════════════════════════════════
// /spanish/obrigado — UPSELL (OTO) pós-compra. Template validado, sem vídeo.
// Oferta: "Fluency Fast-Track" ($127 one-time, ancora $497). Gráfico animado
// "sozinho vs. com o fast-track". Botões aceitar/recusar = widget Hotmart.
// Purchase é server-side (webhook). Aqui só ViewContent (retarget).
// ⚠️ O PREÇO exibido tem que BATER com a oferta de upsell no painel Hotmart.
// ═══════════════════════════════════════════════════════════════
const PIXEL_ID = '690970750622464'
const OFFER = 'Fluency Fast-Track'
const PRICE = '$127'           // = preço da oferta de upsell no Hotmart
const FROM = '$497'            // âncora
const VALUE = '$1,994'         // soma do stack
const FRONT = '$197'           // o que a pessoa acabou de pagar
const PRICE_NUM = 127

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

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
        external_id: getExternalId(), client_ip_address: ip, client_user_agent: getUserAgent(), ...custom,
      }),
    }).catch(() => {})
  } catch {}
}

const STACK = [
  { i: '🔓', t: 'Everything unlocked', v: '$997', d: 'Every series, every real-content episode — now and every one we add. The full native-content library, not the starter set.' },
  { i: '🗺️', t: 'Your 90-Day Speaking Plan', v: '$297', d: 'The exact day-by-day path from “drilling” to actually talking. No guessing what to do next — just open it and train.' },
  { i: '🎧', t: 'Pronunciation feedback', v: '$400', d: 'Send your recordings, get your accent fixed by a specialist. The small corrections you literally cannot hear on your own.' },
  { i: '👥', t: 'Private accountability group', v: '$300', d: 'A small, closed room of serious learners + weekly challenges. When someone’s watching, you show up — and showing up is 90% of it.' },
  { i: '♾️', t: 'Lifetime updates', v: 'priceless', d: 'Everything we ever build lands in your account automatically. You pay once, today, and never again.' },
]

const FAQ = [
  { q: 'Why add this if I have the app?', a: 'The app is the method. The Fast-Track is the reason you finish it — the full content, a clear plan, and someone checking your progress. That’s the gap between “bought a course” and “speaks Spanish.”' },
  { q: 'Total beginner — is it for me?', a: 'Especially. Beginners get the most from a clear plan and early feedback, because bad habits are cheap to fix now and expensive later.' },
  { q: 'What if it’s not for me?', a: '7-day guarantee. Try it. If it’s not moving you, email us within 7 days for a full refund — every cent, no questions.' },
]

// ── Gráfico animado: sozinho (desiste) vs. com o Fast-Track (fluente) ──
function GapChart() {
  const { ref, v } = useInView(0.3)
  const alone = 'M40 250 C120 250 150 150 195 150 C245 150 265 238 320 246'
  const coach = 'M40 250 C170 250 250 120 460 66'
  return (
    <div ref={ref} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 16px 14px', margin: '8px 0 4px' }}>
      <svg viewBox="0 0 500 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="ot-teal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.teal} /><stop offset="1" stopColor={C.purple} /></linearGradient>
        </defs>
        <line x1="40" y1="250" x2="470" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* alone */}
        <path d={alone} fill="none" stroke={C.red} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray="600" strokeDashoffset={v ? 0 : 600}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) .2s', opacity: 0.85 }} />
        <circle cx="320" cy="246" r="5" fill={C.red} opacity={v ? 1 : 0} style={{ transition: 'opacity .4s 1.6s' }} />
        <text x="330" y="242" fill={C.red} style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 800, opacity: v ? 1 : 0, transition: 'opacity .5s 1.7s' }}>you quit</text>
        {/* coach */}
        <path d={coach} fill="none" stroke="url(#ot-teal)" strokeWidth="4.5" strokeLinecap="round"
          strokeDasharray="620" strokeDashoffset={v ? 0 : 620}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.16,1,.3,1) .5s' }} />
        <circle cx="460" cy="66" r="6" fill={C.teal} opacity={v ? 1 : 0} style={{ transition: 'opacity .4s 2.2s' }} />
        <text x="452" y="50" textAnchor="end" fill={C.teal} style={{ fontFamily: FONT.mono, fontSize: 17, fontWeight: 800, opacity: v ? 1 : 0, transition: 'opacity .5s 2.3s' }}>you SPEAK</text>
        {/* labels */}
        <text x="46" y="278" fill={C.t2} style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: '1px' }}>ALONE</text>
        <text x="200" y="278" fill={C.teal} style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: '1px', opacity: v ? 1 : 0, transition: 'opacity .6s 2s' }}>WITH THE FAST-TRACK</text>
        <text x="470" y="278" textAnchor="end" fill={C.t3} style={{ fontFamily: FONT.mono, fontSize: 12 }}>90 days →</text>
      </svg>
    </div>
  )
}

export default function ThankYou() {
  useEffect(() => {
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      if (typeof (window as any).fbq !== 'function') return false
      trackEs('ViewContent', { content_name: 'Fluency Fast-Track (upsell)', value: PRICE_NUM, source: 'upsell' })
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)

    let script: HTMLScriptElement | null = null
    const mountWidget = () => { try { (window as any).checkoutElements?.init('salesFunnel').mount('#hotmart-sales-funnel') } catch {} }
    if ((window as any).checkoutElements) mountWidget()
    else { script = document.createElement('script'); script.src = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js'; script.async = true; script.onload = mountWidget; document.body.appendChild(script) }
    return () => { if (iv) clearInterval(iv) }
  }, [])

  const eyebrow = (txt: string, color = C.teal) => (
    <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 12 }}>{txt}</p>
  )
  const toOffer = () => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })
  const ctaStyle: CSSProperties = {
    appearance: 'none', border: 'none', cursor: 'pointer', width: '100%',
    background: C.gradText, color: '#04120f', fontWeight: 800, fontSize: 17,
    padding: '17px 20px', borderRadius: 14, letterSpacing: '-0.01em',
    boxShadow: `0 10px 30px ${C.teal}33`,
  }

  return (
    <div style={{ background: C.bg, color: C.white, fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em' }}>
      {/* URGENCY */}
      <div style={{
        background: 'linear-gradient(135deg,#ff3d6e,#ff8a3d)', color: '#fff', textAlign: 'center',
        padding: '11px 16px', fontSize: 13, fontWeight: 800, letterSpacing: 0.3, position: 'sticky', top: 0, zIndex: 50,
      }}>
        ⚠️ WAIT — your order isn’t finished. This upgrade is shown once.
      </div>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '34px 20px 90px' }}>
        {eyebrow('✓ Order confirmed · add this before you go')}
        <h1 style={{ fontSize: 'clamp(30px, 7vw, 46px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.035em', color: C.t1, marginBottom: 16 }}>
          Alone, most people <span style={{ color: C.red }}>quit</span>.<br />With this, you <span style={{ color: C.teal }}>speak</span>.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: C.t2, marginBottom: 20 }}>
          You have the method. The one thing that decides whether it works is what happens over the next 90 days — and doing it alone is where almost everyone falls off. So here’s your one-time chance to add the <strong style={{ color: C.t1, fontWeight: 700 }}>Fast-Track</strong>: everything unlocked, a day-by-day plan, and real feedback. It’s already on your order — one tap adds it.
        </p>

        <GapChart />
        <p style={{ fontSize: 13, color: C.t3, textAlign: 'center', margin: '10px 0 4px', lineHeight: 1.5 }}>
          Same method. The difference is the plan, the feedback, and someone keeping you on track.
        </p>

        <div style={{ marginTop: 26, marginBottom: 6 }}>
          <button onClick={toOffer} style={ctaStyle}>Add the Fast-Track — {PRICE} ↓</button>
        </div>

        <div style={{ height: 1, background: C.border, margin: '40px 0 30px' }} />
        {eyebrow('Everything you unlock today')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {STACK.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '17px 18px', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 13 }}>
              <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 11, background: `${C.teal}12`, border: `1px solid ${C.teal}2e`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>{it.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: 16.5, fontWeight: 700, color: C.t1 }}>{it.t}</h3>
                  <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.teal, whiteSpace: 'nowrap' }}>{it.v}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: C.t2, marginTop: 4 }}>{it.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'right', fontSize: 15, color: C.t2, marginTop: 14 }}>
          Total value: <strong style={{ color: C.t1, fontWeight: 800 }}>{VALUE}</strong>
        </p>

        {/* OFFER */}
        <div id="offer" style={{
          marginTop: 26, padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 30px)',
          border: `1.5px solid ${C.teal}55`, borderRadius: 20,
          background: `radial-gradient(120% 130% at 100% 0%, ${C.teal}14, transparent 55%), ${C.bg3}`, textAlign: 'center',
        }}>
          {eyebrow(OFFER + ' · one-time only')}
          <p style={{ fontSize: 15, color: C.t2 }}>
            Worth <span style={{ textDecoration: 'line-through', color: C.red }}>{VALUE}</span> · normally <span style={{ textDecoration: 'line-through', color: C.red }}>{FROM}</span>
          </p>
          <p style={{ fontSize: 13.5, color: C.t2, marginTop: 7, lineHeight: 1.5 }}>
            You just invested {FRONT}. Today — <strong style={{ color: C.t1 }}>for less than that</strong>, only on this page:
          </p>
          <p style={{
            fontSize: 'clamp(52px, 15vw, 76px)', fontWeight: 900, fontFamily: FONT.mono, letterSpacing: '-0.04em',
            background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, margin: '6px 0 2px',
          }}>{PRICE}</p>
          <p style={{ fontSize: 12, color: C.t3 }}>one-time · one tap · never shown again</p>

          {/* Botões reais (aceitar/recusar) — widget Hotmart */}
          <div id="hotmart-sales-funnel" style={{ marginTop: 22, minHeight: 60 }} />

          <p style={{ fontSize: 13, color: C.t3, marginTop: 16, lineHeight: 1.55 }}>
            🔒 <strong style={{ color: C.t2, fontWeight: 700 }}>7-day guarantee.</strong> Try it. If it’s not moving you, email us within 7 days — full refund, no questions.
          </p>
          <p style={{ fontSize: 12.5, color: C.t3, marginTop: 12, fontStyle: 'italic', lineHeight: 1.55 }}>
            Decline and you go it alone — the red line above. This price never comes back.
          </p>
        </div>

        <div style={{ height: 1, background: C.border, margin: '38px 0 26px' }} />
        {eyebrow('Quick questions')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQ.map((f, i) => (
            <div key={i}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 5 }}>{f.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.t2 }}>{f.a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 34 }}>
          <button onClick={toOffer} style={ctaStyle}>Add the Fast-Track for {PRICE} ↑</button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: C.t4, marginTop: 34 }}>
          <span style={{ color: C.t3, fontWeight: 800 }}>fluency</span><span style={{ color: C.teal, fontWeight: 800 }}>route</span> · All rights reserved
        </p>
      </main>
    </div>
  )
}
