'use client'

import { useEffect, useState, useRef } from 'react'
import { C, CTA_URL, FONT } from './design'

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════

/** Captures UTM params + VTurb sck from URL and appends to checkout link */
export function useCheckoutUrl() {
  const [url, setUrl] = useState(CTA_URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    const checkout = new URL(CTA_URL, window.location.origin)
    utms.forEach(k => {
      const v = params.get(k)
      if (v) checkout.searchParams.set(k, v)
    })
    // VTurb conversion tracking params
    const sck = params.get('sck')
    if (sck) checkout.searchParams.set('sck', sck)
    setUrl(checkout.toString())
  }, [])
  return url
}

export function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.disconnect() }
    }, { threshold })
    o.observe(el)
    return () => o.disconnect()
  }, [threshold])
  return { ref, v }
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION PRIMITIVES
// ═══════════════════════════════════════════════════════════════

export function Fade({ children, delay = 0, y = 24, from }: {
  children: React.ReactNode; delay?: number; y?: number; from?: 'left' | 'right' | 'scale'
}) {
  const { ref, v } = useInView()
  const hidden = from === 'left' ? 'translateX(-40px)'
    : from === 'right' ? 'translateX(40px)'
    : from === 'scale' ? 'scale(0.92)'
    : `translateY(${y}px)`
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'none' : hidden,
      transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}s, transform .9s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEXT PRIMITIVES
// ═══════════════════════════════════════════════════════════════

/** Section label — uppercase, mono, dim */
export function Label({ children, color, center }: {
  children: React.ReactNode; color?: string; center?: boolean
}) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
      fontFamily: FONT.mono,
      color: color || C.t2, textAlign: center ? 'center' : undefined,
      marginBottom: 16,
    }}>{children}</p>
  )
}

/** Gradient text */
export function Grad({ children, size, weight }: {
  children: React.ReactNode; size?: number | string; weight?: number
}) {
  return (
    <span style={{
      fontSize: size, fontWeight: weight || 800,
      background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{children}</span>
  )
}

/** Stat pill — monospace number + label */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4px 0' }}>
      <p style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.t1, fontFamily: FONT.mono }}>{value}</p>
      <p style={{ fontSize: 12, color: C.t3, marginTop: 4, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, fontFamily: FONT.mono }}>{label}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT PRIMITIVES
// ═══════════════════════════════════════════════════════════════

/** Section wrapper */
export function S({ children, narrow, id }: {
  children: React.ReactNode; narrow?: boolean; id?: string
}) {
  return (
    <section id={id} className="vsl-section" style={{ maxWidth: narrow ? 580 : 820 }}>
      {children}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CARD PRIMITIVES
// ═══════════════════════════════════════════════════════════════

/** Glassmorphism card */
export function Glass({ children, accent, glow, hud, style }: {
  children: React.ReactNode; accent?: string; glow?: boolean; hud?: boolean; style?: React.CSSProperties
}) {
  return (
    <div
      className={hud ? `hud${accent === C.red ? ' hud-red' : accent === C.purple ? ' hud-purple' : ''}` : undefined}
      style={{
        background: accent ? `linear-gradient(160deg, ${accent}06, ${C.glass})` : C.bg3,
        borderRadius: hud ? 6 : 10,
        padding: 'clamp(24px, 5vw, 36px)',
        border: `1px solid ${accent ? accent + '12' : C.border}`,
        backdropFilter: 'blur(16px)',
        boxShadow: glow && accent
          ? `0 0 50px ${accent}10, 0 0 100px ${accent}05, 0 20px 40px -10px rgba(0,0,0,.4), inset 0 1px 0 ${C.borderLight}`
          : `0 8px 32px -8px rgba(0,0,0,.3), inset 0 1px 0 ${C.borderLight}`,
        transition: 'border-color .3s, box-shadow .3s',
        ...style,
      }}
    >{children}</div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CTA
// ═══════════════════════════════════════════════════════════════

/** CTA Button */
export function Btn({ text = 'QUERO MEU ACESSO', compact }: {
  text?: string; compact?: boolean
}) {
  const checkoutUrl = useCheckoutUrl()
  return (
    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="cta-btn"
      style={compact ? { padding: '14px 20px', fontSize: 15 } : undefined}
    >
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {text}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  )
}
