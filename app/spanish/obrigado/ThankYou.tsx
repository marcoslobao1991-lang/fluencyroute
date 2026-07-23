'use client'

import { useEffect } from 'react'
import { getFbCookies, getClientIp, getUserAgent, genEventId } from '../../lib/pixel'
import { C, FONT } from '../../vsl2/design'

// ═══════════════════════════════════════════════════════════════
// /spanish/obrigado — PÁGINA DE UPSELL (OTO) pós-compra do front.
// FULL COPY, sem vídeo. Estrutura validada de one-time offer:
// dor → virada → stack de valor c/ âncora → prova → oferta+garantia →
// aceitar (widget Hotmart salesFunnel) c/ recusa em loss-framing → objeções.
// O Purchase do FRONT é 100% server-side (webhook). Aqui só ViewContent (retarget).
// O PREÇO exibido tem que BATER com a oferta de upsell configurada no Hotmart.
// ═══════════════════════════════════════════════════════════════
const PIXEL_ID = '690970750622464'
const OFFER = 'Personal Fluency Coaching'
const UPSELL_PRICE = '$497'          // = preço da oferta de upsell no Hotmart
const UPSELL_FROM = '$997'           // âncora (preço cheio)
const TOTAL_VALUE = '$2,940'         // soma do stack

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

const STACK = [
  { t: 'Weekly feedback on your speaking', v: '$1,200/yr', d: 'You record yourself, a coach listens and fixes the exact sounds and rhythm you can’t hear on your own. This one thing moves results more than anything else.' },
  { t: 'Your coach on WhatsApp', v: '$720/yr', d: 'A direct line for when you’re stuck, confused, or losing steam. Real answers from a real person — a Spanish coach in your pocket, not a chatbot.' },
  { t: 'A plan built for your level', v: '$400', d: 'We look at where you actually are and build the sequence that attacks your specific weak spot — instead of a generic “do everything” pile.' },
  { t: 'Private accountability group', v: '$300/yr', d: 'A small, closed room of people who are serious. Weekly challenges. When someone’s watching, you show up — and showing up is 90% of fluency.' },
  { t: 'Monthly progress review', v: '$240/yr', d: 'Every 30 days: what advanced, what to fix, and the single next move. You always know it’s working — no more guessing in the dark.' },
  { t: 'Lifetime updates', v: 'priceless', d: 'Every new episode, series and material we build lands in your account — free, forever.' },
]

const FAQ = [
  { q: 'I already got the app — why add coaching?', a: 'The app is the method. Coaching is the reason you finish it. Most people who learn alone quit within weeks — not because the method fails, but because no one’s watching. A coach removes that failure point.' },
  { q: 'What if I’m a total beginner?', a: 'Perfect timing. Beginners get the most out of feedback, because bad pronunciation habits are cheap to fix now and expensive later. Your plan starts exactly where you are.' },
  { q: 'What if it’s not for me?', a: 'You’re covered by a 7-day guarantee. Try the coaching. If it’s not moving you, email us within 7 days and we refund every cent — no questions.' },
]

export default function ThankYou() {
  useEffect(() => {
    // ViewContent do upsell (retargeting). Purchase é server-side via webhook.
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      if (typeof (window as any).fbq !== 'function') return false
      trackEs('ViewContent', { content_name: 'Personal Fluency Coaching (upsell)', value: 497, source: 'upsell' })
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)

    // ── Widget Hotmart (salesFunnel) — botões de aceitar/recusar (1-clique) ──
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

  const eyebrow = (txt: string) => (
    <p style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.teal, marginBottom: 12 }}>{txt}</p>
  )
  const rule = <div style={{ height: 1, background: C.border, margin: '38px 0' }} />
  const scrollToOffer = () => { document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <div style={{ background: C.bg, color: C.white, fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em' }}>
      {/* URGENCY BAR */}
      <div style={{
        background: 'linear-gradient(135deg,#ff3d6e,#ff8a3d)', color: '#fff',
        textAlign: 'center', padding: '11px 16px', fontSize: 13, fontWeight: 800,
        letterSpacing: 0.3, position: 'sticky', top: 0, zIndex: 50,
      }}>
        ⚠️ WAIT — don’t close this page. You’ll never see this offer again.
      </div>

      <main style={{ maxWidth: 660, margin: '0 auto', padding: '38px 22px 90px' }}>
        {eyebrow('✓ Order confirmed · one-time-only upgrade')}
        <h1 style={{ fontSize: 'clamp(29px, 6.4vw, 44px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', color: C.t1, marginBottom: 16 }}>
          You’ve got the method. Now get the one thing that decides if you <span style={{ color: C.teal }}>actually speak</span> — or quit like most.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: C.t2, marginBottom: 18 }}>
          For the next few minutes only, you can add a <strong style={{ color: C.t1, fontWeight: 700 }}>real coach</strong> to your training — a person who listens to your Spanish, fixes what you can’t hear yourself, and keeps you showing up until you’re speaking. It’s already on your order. One click adds it. You won’t be charged again for the app.
        </p>
        <button onClick={scrollToOffer} style={{
          appearance: 'none', border: 'none', cursor: 'pointer', width: '100%',
          background: C.gradText, color: '#04120f', fontWeight: 800, fontSize: 16,
          padding: '15px 20px', borderRadius: 12, letterSpacing: '-0.01em',
        }}>
          Yes — add my coach ↓
        </button>

        {rule}
        {eyebrow('The part nobody warns you about')}
        <h2 style={{ fontSize: 'clamp(22px, 4.6vw, 29px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Most people never finish. Not the method’s fault — <span style={{ color: C.teal }}>yours to fix right now</span>.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.t2, marginBottom: 14 }}>
          Here’s what happens when you learn alone: you skip a day. Then a week. Nobody notices. Nobody corrects your accent, so you drill the wrong sounds until they’re permanent. You plateau, you start wondering <em style={{ color: C.t1 }}>“is this even working?”</em> — and one quiet Tuesday, you stop.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.t2 }}>
          That’s the #1 killer of fluency. It has nothing to do with how good the training is — and everything to do with whether someone is <strong style={{ color: C.t1, fontWeight: 700 }}>watching, correcting, and keeping you honest</strong>.
        </p>

        {rule}
        {eyebrow('The one thing that changes it')}
        <h2 style={{ fontSize: 'clamp(22px, 4.6vw, 29px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Training alone vs. training with a coach = quit vs. fluent.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.t2 }}>
          Think of a gym. A perfect workout in a PDF changes nothing — but a trainer who checks your form, adjusts your plan, and texts when you skip? That’s the person who gets you the result. Coaching does exactly that for your Spanish: a specialist reviews your recordings, kills the small mistakes that make you sound foreign, and keeps you moving when your motivation dips. Same method — a completely different outcome.
        </p>

        {rule}
        {eyebrow('Everything you get with coaching')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STACK.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '18px 20px', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: `${C.teal}18`, border: `1px solid ${C.teal}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, fontWeight: 900, fontSize: 15 }}>✓</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>{it.t}</h3>
                  <span style={{ fontFamily: FONT.mono, fontSize: 12, color: C.teal, whiteSpace: 'nowrap' }}>{it.v}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.t2, marginTop: 4 }}>{it.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'right', fontSize: 15, color: C.t2, marginTop: 16 }}>
          Real value: <strong style={{ color: C.t1, fontWeight: 800 }}>{TOTAL_VALUE}</strong>
        </p>

        {/* OFFER */}
        <div id="offer" style={{
          marginTop: 30, padding: 'clamp(28px, 6vw, 40px) clamp(22px, 5vw, 32px)',
          border: `1px solid ${C.teal}44`, borderRadius: 18,
          background: `radial-gradient(120% 130% at 100% 0%, ${C.teal}12, transparent 55%), ${C.bg3}`, textAlign: 'center',
        }}>
          {eyebrow(OFFER + ' · your one-time price')}
          <p style={{ fontSize: 15, color: C.t2 }}>
            Worth <span style={{ textDecoration: 'line-through', color: C.red }}>{TOTAL_VALUE}</span> · normally <span style={{ textDecoration: 'line-through', color: C.red }}>{UPSELL_FROM}</span>
          </p>
          <p style={{ fontSize: 13, color: C.t2, marginTop: 6 }}>Because you already showed up — today, only here:</p>
          <p style={{
            fontSize: 'clamp(48px, 13vw, 70px)', fontWeight: 900, fontFamily: FONT.mono, letterSpacing: '-0.04em',
            background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.05, marginTop: 4,
          }}>{UPSELL_PRICE}</p>
          <p style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>one-time payment · one click · never shown again</p>

          {/* Botões reais (aceitar/recusar) — widget Hotmart */}
          <div id="hotmart-sales-funnel" style={{ marginTop: 22, minHeight: 60 }} />

          <p style={{ fontSize: 13, color: C.t3, marginTop: 16, lineHeight: 1.6 }}>
            🔒 <strong style={{ color: C.t2, fontWeight: 700 }}>7-day guarantee.</strong> Try the coaching. If it’s not moving you, email us within 7 days for a full refund — no questions, no hard feelings.
          </p>
          <p style={{ fontSize: 12.5, color: C.t3, marginTop: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
            If you decline, you’ll go it alone — which works for a few, and quietly beats most. This price never comes back.
          </p>
        </div>

        {rule}
        {eyebrow('Quick questions')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQ.map((f, i) => (
            <div key={i}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 5 }}>{f.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: C.t2 }}>{f.a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 34, textAlign: 'center' }}>
          <button onClick={scrollToOffer} style={{
            appearance: 'none', border: 'none', cursor: 'pointer',
            background: C.gradText, color: '#04120f', fontWeight: 800, fontSize: 16,
            padding: '15px 28px', borderRadius: 12,
          }}>
            Add my coach for {UPSELL_PRICE} ↑
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: C.t4, marginTop: 40 }}>
          <span style={{ color: C.t3, fontWeight: 800 }}>fluency</span><span style={{ color: C.teal, fontWeight: 800 }}>route</span> · All rights reserved
        </p>
      </main>
    </div>
  )
}
