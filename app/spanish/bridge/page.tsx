'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { genEventId, getFbCookies, getClientIp, getUserAgent } from '../../lib/pixel'

// ═══════════════════════════════════════════════════════════════
// /spanish/bridge — Advertorial editorial (clone do /bridge BR) em INGLÊS,
// avatar = quem fala inglês e quer espanhol. CTA → /spanish (a VSL).
// Pixel próprio do Spanish (690…) via trackSingle + CAPI /api/track-es.
// ═══════════════════════════════════════════════════════════════

const L = {
  bg: '#fafaf7',
  bg2: '#ffffff',
  bg3: '#f3f1ec',
  text: '#1c1b1a',
  textDim: 'rgba(28,27,26,.72)',
  textMuted: 'rgba(28,27,26,.58)',
  textFaint: 'rgba(28,27,26,.42)',
  border: 'rgba(0,0,0,.10)',
  borderLight: 'rgba(0,0,0,.05)',
  borderStrong: 'rgba(0,0,0,.18)',
  glass: 'rgba(0,0,0,.025)',
  accent: '#0F766E',
  accentDeep: '#134E4A',
  accentSoft: 'rgba(15,118,110,.08)',
  red: '#9F1239',
}

const FONT = {
  body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  mono: "ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace",
  serif: "'Georgia', 'Times New Roman', serif",
}

const PIXEL_ID = '690970750622464'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'fbclid'] as const

function buildVslUrl(): string {
  if (typeof window === 'undefined') return '/spanish'
  const params = new URLSearchParams(window.location.search)
  const url = new URL('/spanish', window.location.origin)
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) url.searchParams.set(k, v)
  })
  if (!url.searchParams.get('utm_content')) url.searchParams.set('utm_content', 'bridge')
  return url.pathname + url.search
}

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

/** Evento no pixel do Spanish: browser (trackSingle) + CAPI (mesmo eventID). */
async function trackEsB(event: string, extra?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const eid = genEventId()
  const custom = { content_name: 'Essential Spanish Fluency', content_type: 'product', currency: 'USD', ...(extra || {}) }
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') fbq('trackSingle', PIXEL_ID, event, custom, { eventID: eid })
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

// ─── COMPONENTES VISUAIS ───────────────────────────────────────

function SectionRule({ num, title }: { num: string; title?: string }) {
  return (
    <div style={{ margin: '64px 0 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{
        fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, letterSpacing: 4,
        color: L.accent, padding: '4px 12px', border: `1px solid ${L.accent}`, borderRadius: 2,
      }}>
        {num}
      </span>
      <div style={{ height: 1, flex: 1, background: L.border }} />
      {title && (
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, letterSpacing: 3, color: L.textDim, textTransform: 'uppercase' }}>
          {title}
        </span>
      )}
    </div>
  )
}

function PullQuote({ children, large }: { children: React.ReactNode; large?: boolean }) {
  return (
    <blockquote style={{
      margin: '40px 0',
      padding: large ? '36px 32px 36px 40px' : '28px 28px 28px 32px',
      borderLeft: `4px solid ${L.accent}`,
      background: L.accentSoft,
      borderRadius: '0 8px 8px 0',
      fontSize: large ? 'clamp(22px, 5vw, 30px)' : 'clamp(19px, 4.2vw, 24px)',
      fontWeight: large ? 700 : 600,
      lineHeight: 1.32,
      letterSpacing: '-0.022em',
      color: L.text,
      fontFamily: FONT.body,
    }}>
      {children}
    </blockquote>
  )
}

function EarIcon({ color = '#000', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
      <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1-2 2" />
    </svg>
  )
}

function GraphVariety() {
  const inputs = [
    { x: 70, y: 80, label: 'lesson' },
    { x: 175, y: 65, label: 'video' },
    { x: 280, y: 85, label: 'phrase' },
    { x: 385, y: 70, label: 'podcast' },
    { x: 490, y: 82, label: 'article' },
    { x: 120, y: 130, label: 'course' },
    { x: 230, y: 135, label: 'reel' },
    { x: 340, y: 125, label: 'short' },
    { x: 445, y: 130, label: 'app' },
  ]
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Varied content
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        They consume a lot of different stuff
      </h3>
      <p style={{ fontSize: 15, color: L.textDim, marginBottom: 28, fontWeight: 500 }}>
        And never train any of it to automatic.
      </p>

      <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.textMuted, textTransform: 'uppercase', marginBottom: 16 }}>
        What they consume
      </p>

      <svg viewBox="0 0 600 220" style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 24 }} aria-hidden>
        {inputs.map((d, i) => (
          <g key={i}>
            <rect x={d.x - 55} y={d.y - 25} width="110" height="46" rx="6" fill={L.bg3} stroke={L.textFaint} strokeWidth="1.3" />
            <text x={d.x} y={d.y + 6} fontFamily={FONT.mono} fontSize="18" fontWeight="700" fill={L.textDim} textAnchor="middle">
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ textAlign: 'center', margin: '20px 0', fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.textMuted, textTransform: 'uppercase' }}>
        → what reaches the ear ↓
      </div>
      <div style={{ height: 1, background: L.border, marginBottom: 28 }} />

      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <p style={{
          fontFamily: FONT.mono,
          fontSize: 'clamp(26px, 7vw, 42px)',
          fontWeight: 700,
          color: L.textDim,
          letterSpacing: '-0.04em',
          filter: 'blur(2.8px)',
          marginBottom: 12,
        }}>
          dequeestashablando
        </p>
        <p style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: L.textMuted, fontStyle: 'italic', marginBottom: 36 }}>
          (the real line: “¿De qué estás hablando?”)
        </p>

        <p style={{
          fontSize: 'clamp(56px, 14vw, 88px)',
          fontWeight: 900,
          color: L.text,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: 12,
        }}>
          ~12%
        </p>
        <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 3, color: L.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>
          of real dialogue
        </p>
        <p style={{ fontSize: 'clamp(14px, 2.9vw, 16px)', color: L.textDim, fontStyle: 'italic' }}>
          is what reaches the ear
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: '18px 22px', background: L.bg3, borderRadius: 4 }}>
        <EarIcon color={L.text} size={26} />
        <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: L.text, textTransform: 'uppercase' }}>Ear:</span>
        <span style={{ fontFamily: FONT.body, fontSize: 16, color: L.textDim, fontWeight: 500 }}>
          <strong style={{ color: L.text, fontWeight: 800 }}>mush</strong> · you don’t catch even the essential words
        </span>
      </div>
    </figure>
  )
}

function GraphRepetition() {
  const reps = [0, 1, 2, 3, 4]
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Concentrated content
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Concentrated repetition on the same clip
      </h3>
      <p style={{ fontSize: 15, color: L.accent, marginBottom: 28, fontWeight: 600 }}>
        And they train it until it’s automatic.
      </p>

      <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase', marginBottom: 16 }}>
        Concentrated training
      </p>

      <svg viewBox="0 0 600 130" style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 12 }} aria-hidden>
        {reps.map((_, i) => (
          <g key={i} transform={`translate(${110 + i * 95}, 65)`}>
            <rect x="-52" y="-28" width="104" height="56" rx="6" fill={L.accent} opacity={0.18 + i * 0.10} stroke={L.accent} strokeWidth="1.5" />
            <text x="0" y="6" fontFamily={FONT.body} fontSize="17" fontWeight="700" fill={i >= 3 ? L.bg2 : L.text} textAnchor="middle">
              same clip
            </text>
          </g>
        ))}
      </svg>

      <p style={{ textAlign: 'center', fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 15px)', fontWeight: 700, letterSpacing: 2, color: L.accent, textTransform: 'uppercase', marginBottom: 20 }}>
        repeated until it feels familiar
      </p>

      <div style={{ textAlign: 'center', margin: '12px 0', fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase' }}>
        → what reaches the ear ↓
      </div>
      <div style={{ height: 1, background: L.accent, opacity: 0.3, marginBottom: 28 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
        {[
          { label: '1ST TIME', text: 'dequeestashablando', blur: 5, color: L.textFaint, weight: 700, mono: true },
          { label: '+ A FEW', text: 'deque estashablando', blur: 3, color: L.textDim, weight: 700, mono: true },
          { label: '+ SEVERAL', text: 'de que estas hablando', blur: 1.4, color: L.text, weight: 700, mono: true },
          { label: '? TIMES', text: '¿De qué estás hablando?', blur: 0, color: L.accent, weight: 800, mono: false, highlight: true },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px',
            background: s.highlight ? L.accentSoft : 'transparent',
            border: s.highlight ? `1px solid ${L.accent}` : `1px solid ${L.borderLight}`,
            borderRadius: 6,
          }}>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: 'clamp(12px, 2.6vw, 14px)',
              fontWeight: 800,
              letterSpacing: 2,
              color: s.highlight ? L.accent : L.textMuted,
              minWidth: 92,
            }}>
              {s.label}
            </span>
            <span style={{
              fontFamily: s.mono ? FONT.mono : FONT.body,
              fontSize: 'clamp(15px, 3.6vw, 20px)',
              fontWeight: s.weight,
              color: s.color,
              filter: s.blur ? `blur(${s.blur}px)` : 'none',
              letterSpacing: s.mono ? '-1px' : 'normal',
              flex: 1,
            }}>
              {s.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <p style={{
          fontSize: 'clamp(56px, 14vw, 88px)',
          fontWeight: 900,
          color: L.accent,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: 12,
        }}>
          ~94%
        </p>
        <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 3, color: L.accent, textTransform: 'uppercase', marginBottom: 12 }}>
          of real dialogue
        </p>
        <p style={{ fontSize: 'clamp(14px, 2.9vw, 16px)', color: L.textDim, fontStyle: 'italic' }}>
          is what reaches the ear
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: '18px 22px', background: L.accentSoft, borderRadius: 4 }}>
        <EarIcon color={L.accent} size={26} />
        <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase' }}>Ear:</span>
        <span style={{ fontFamily: FONT.body, fontSize: 16, color: L.text, fontWeight: 500 }}>
          <strong style={{ color: L.accent, fontWeight: 800 }}>clear</strong> · even when natives run words together
        </span>
      </div>
    </figure>
  )
}

function CalloutMinute({ vslUrl }: { vslUrl: string }) {
  return (
    <aside style={{
      margin: '52px 0 0',
      padding: '52px 32px 44px',
      background: L.text,
      borderRadius: 6,
      textAlign: 'center',
      color: L.bg2,
    }}>
      <p style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: 3.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 28 }}>
        The Repetition Experiment
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <p style={{
          fontSize: 'clamp(16px, 3.6vw, 20px)',
          fontWeight: 600,
          color: 'rgba(255,255,255,.35)',
          textDecoration: 'line-through',
          textDecorationColor: 'rgba(255,255,255,.5)',
          textDecorationThickness: 2,
        }}>
          100% of the language
        </p>

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>

        <div style={{
          padding: '18px 32px',
          background: L.accent,
          borderRadius: 6,
          boxShadow: '0 8px 28px rgba(15,118,110,.25)',
        }}>
          <p style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, color: L.bg2, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
            1<span style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: 2 }}>st</span> Episode of a Series
          </p>
          <p style={{
            fontSize: 'clamp(11px, 2.4vw, 13px)',
            fontWeight: 500,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,.78)',
            marginTop: 6,
            letterSpacing: '-0.005em',
          }}>
            (in Spanish, no subtitles)
          </p>
        </div>

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>

        <p style={{
          fontSize: 'clamp(17px, 3.8vw, 22px)',
          fontWeight: 700,
          color: L.bg2,
          letterSpacing: '-0.015em',
        }}>
          1 minute at a time
        </p>
      </div>

      <p style={{
        fontFamily: FONT.mono,
        fontSize: 14, fontWeight: 800, letterSpacing: 3,
        textTransform: 'uppercase', color: L.accent,
        marginBottom: 8,
      }}>
        ↑ You start here
      </p>

      <p style={{
        fontSize: 'clamp(15px, 3.4vw, 17px)',
        fontWeight: 500,
        color: 'rgba(255,255,255,.78)',
        marginTop: 32,
        marginBottom: 4,
        lineHeight: 1.5,
        maxWidth: 400,
        marginLeft: 'auto', marginRight: 'auto',
      }}>
        The class that shows you this in practice is right here:
      </p>

      <a href={vslUrl} style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '22px 36px',
        background: L.accent,
        color: L.bg2,
        fontWeight: 800,
        fontSize: 'clamp(15px, 3.6vw, 17px)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        borderRadius: 6,
        transition: 'transform .15s ease, filter .15s ease',
        width: '100%',
        maxWidth: 440,
        marginTop: 16,
        boxShadow: '0 10px 30px rgba(15,118,110,.32)',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)' }}
        onClick={() => { trackEsB('InitiateCheckout', { source: 'bridge_cta' }) }}>
        Watch the class
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 32, marginTop: 22 }}>
        {[-22, 0, 22].map((rot, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `rotate(${rot}deg)`,
              transformOrigin: 'center',
            }}
          >
            <svg
              width="28" height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,.75)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: 'bridgeArrowUp 1.6s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        ))}
      </div>
    </aside>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────

export default function SpanishBridgePage() {
  const router = useRouter()
  const [vslUrl, setVslUrl] = useState('/spanish')

  useEffect(() => {
    setVslUrl(buildVslUrl())

    // Pixel do Spanish: PageView + ViewContent (dual). fbq vem do layout global
    // (lazyOnload) → poll até existir.
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const initPixel = () => {
      const fbq = (window as any).fbq
      if (typeof fbq !== 'function') return false
      fbq('init', PIXEL_ID)
      trackEsB('PageView')
      trackEsB('ViewContent', { source: 'bridge' })
      return true
    }
    if (!initPixel()) iv = setInterval(() => { if (initPixel() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)

    // Prefetch da VSL depois do LCP
    let link: HTMLLinkElement | null = null
    const prefetchTimer = setTimeout(() => {
      try { router.prefetch('/spanish') } catch {}
      try {
        link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = '/spanish'
        link.as = 'document'
        ;(link as any).fetchPriority = 'low'
        document.head.appendChild(link)
      } catch {}
    }, 1800)

    return () => {
      clearTimeout(prefetchTimer)
      if (iv) clearInterval(iv)
      if (link) { try { document.head.removeChild(link) } catch {} }
    }
  }, [router])

  return (
    <div style={{
      background: L.bg,
      color: L.text,
      minHeight: '100vh',
      fontFamily: FONT.body,
      fontWeight: 400,
      letterSpacing: '-0.005em',
      lineHeight: 1.55,
    }}>
      <header style={{
        borderBottom: `1px solid ${L.border}`,
        padding: '18px 24px',
        background: L.bg,
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 800, letterSpacing: 3, color: L.text, textTransform: 'uppercase' }}>
            Fluency Route
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: L.textMuted, textTransform: 'uppercase' }}>
            Read · 2 min
          </span>
        </div>
      </header>

      <main style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '64px 24px 96px',
      }}>
        <p style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 3.5,
          textTransform: 'uppercase',
          color: L.accent,
          marginBottom: 24,
        }}>
          Boring — but it works
        </p>

        <h1 style={{
          fontSize: 'clamp(34px, 7.5vw, 60px)',
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: '-0.04em',
          marginBottom: 28,
          color: L.text,
        }}>
          This is boring —<br />but it’s what got me speaking Spanish.
        </h1>

        <p style={{
          fontSize: 'clamp(17px, 3.8vw, 22px)',
          color: L.textDim,
          fontWeight: 400,
          marginBottom: 28,
          lineHeight: 1.5,
          letterSpacing: '-0.01em',
        }}>
          If you’re done with easy promises and want to hear what actually works — even if it’s dull.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 32, color: L.textMuted,
        }}>
          <span style={{
            fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: 2.5,
            textTransform: 'uppercase',
          }}>
            Keep reading
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'bridgeArrowBounce 1.8s ease-in-out infinite' }}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>

        <style>{`
          @keyframes bridgeArrowBounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(6px); opacity: 1; }
          }
          @keyframes bridgeArrowUp {
            0%, 100% { transform: translateY(0); opacity: 0.55; }
            50% { transform: translateY(-7px); opacity: 1; }
          }
        `}</style>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          paddingTop: 24, borderTop: `1px solid ${L.border}`,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: L.text, color: L.bg2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', flexShrink: 0,
          }}>
            ML
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 2 }}>
              By Marcos Lobão
            </p>
            <p style={{ fontSize: 12, color: L.textMuted, lineHeight: 1.4 }}>
              Got conversational in Spanish from home — without ever living in a Spanish-speaking country
            </p>
          </div>
        </div>

        <SectionRule num="I" />

        <PullQuote large>
          There’s a <span style={{ color: L.accent }}>specific number</span> of repetitions that turns Spanish into an automatic skill.
        </PullQuote>

        <div style={{
          fontSize: 'clamp(17px, 3.6vw, 19px)',
          color: L.text,
          lineHeight: 1.72,
          fontWeight: 400,
        }}>
          <p style={{ marginBottom: 24, color: L.textDim, fontSize: 'clamp(18px, 3.8vw, 21px)', fontWeight: 600 }}>
            Most people never get there.
          </p>

          <p style={{ marginBottom: 24, color: L.textDim }}>
            They watch lessons, scroll short videos, learn new phrases… but never repeat any of them enough for the brain to take over.
          </p>

          <GraphVariety />

          <SectionRule num="II" title="The Repetition" />

          <PullQuote>
            But the brain <strong style={{ fontWeight: 800 }}>doesn’t run on variety</strong>.<br />
            It runs on <span style={{ color: L.accent, fontWeight: 800 }}>repetition</span>.
          </PullQuote>

          <p style={{ marginBottom: 24 }}>
            And when you repeat the same clip, the same pattern, the same minute… something inevitable happens.
          </p>

          <p style={{ marginBottom: 24, color: L.textDim }}>
            The sounds start to feel familiar.<br />
            The links between words stop being scary.<br />
            And Spanish goes from <em>thought-out</em> to <strong style={{ fontWeight: 700, color: L.text }}>automatic</strong>.
          </p>

          <GraphRepetition />

          <SectionRule num="III" />

          <PullQuote large>
            It’s the exact moment fluency stops being a goal… and becomes a <span style={{ color: L.accent }}>reflex</span>.
          </PullQuote>

          <p style={{ marginBottom: 0, color: L.text, fontSize: 'clamp(18px, 3.8vw, 21px)', fontWeight: 500, lineHeight: 1.55 }}>
            And Marcos recorded the class that shows the <strong style={{ color: L.accent, fontWeight: 800 }}>perfect repetition loop</strong> to reach essential fluency in record time.
          </p>

          <CalloutMinute vslUrl={vslUrl} />
        </div>

        <div style={{ marginTop: 80, paddingTop: 28, borderTop: `1px solid ${L.border}`, textAlign: 'center' }}>
          <p style={{ fontFamily: FONT.mono, fontSize: 10, color: L.textMuted, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600 }}>
            Marcos Lobão · Fluency Route
          </p>
        </div>
      </main>
    </div>
  )
}
