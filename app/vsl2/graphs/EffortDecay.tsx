'use client'

import { C, FONT } from '../design'
import { useInView } from '../primitives'

/**
 * BLOCO 4 — Two crossing curves: ESFORÇO decays, FLUÊNCIA rises
 * Title and bottom text in HTML (always readable), curves in SVG
 */
export function EffortDecay() {
  const { ref, v } = useInView(0.15)

  const episodes = [
    { ep: 1, effort: 100, fluency: 5 },
    { ep: 2, effort: 55, fluency: 25 },
    { ep: 3, effort: 30, fluency: 50 },
    { ep: 4, effort: 12, fluency: 78 },
    { ep: 5, effort: 5, fluency: 95 },
  ]

  // SVG only for the curves — compact
  const W = 400, H = 240
  const pad = 16
  const graphW = W - pad * 2
  const graphH = H - pad * 2

  const effortPts = episodes.map((e, i) => ({
    x: pad + (i / 4) * graphW,
    y: pad + (1 - e.effort / 100) * graphH,
  }))
  const fluencyPts = episodes.map((e, i) => ({
    x: pad + (i / 4) * graphW,
    y: pad + (1 - e.fluency / 100) * graphH,
  }))

  const buildPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = pts[i - 1]
      return `C ${prev.x + (p.x - prev.x) * 0.4} ${prev.y} ${prev.x + (p.x - prev.x) * 0.6} ${p.y} ${p.x} ${p.y}`
    }).join(' ')

  const effortPath = buildPath(effortPts)
  const fluencyPath = buildPath(fluencyPts)
  const effortArea = effortPath + ` L ${effortPts[4].x} ${pad + graphH} L ${effortPts[0].x} ${pad + graphH} Z`
  const fluencyArea = fluencyPath + ` L ${fluencyPts[4].x} ${pad + graphH} L ${fluencyPts[0].x} ${pad + graphH} Z`

  const crossX = pad + (1.8 / 4) * graphW
  const crossY = pad + (1 - 40 / 100) * graphH

  return (
    <div ref={ref} style={{ padding: '0' }}>
      {/* ── TITLE (HTML — always readable) ── */}
      <p style={{
        textAlign: 'center', fontFamily: FONT.mono,
        fontSize: 12, fontWeight: 700, letterSpacing: 3,
        textTransform: 'uppercase', color: C.t3, marginBottom: 4,
      }}>Curva de esforço por episódio</p>

      {/* ── AXIS LABELS (HTML) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '0 4px' }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: C.red, opacity: 0.7 }}>ESFORÇO ↓</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: C.teal, opacity: 0.9 }}>↑ FLUÊNCIA</span>
      </div>

      {/* ── SVG CURVES (full width, no padding eaten by Glass) ── */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="ed-red-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.red} />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="ed-red-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ed-teal-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.teal} />
          </linearGradient>
          <linearGradient id="ed-teal-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
          </linearGradient>
          <filter id="ed-glow-red"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="ed-glow-teal"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* Grid */}
        {[0, 50, 100].map(pct => {
          const y = pad + (1 - pct / 100) * graphH
          return <line key={pct} x1={pad} y1={y} x2={W - pad} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        })}

        {/* Effort area + line */}
        <path d={effortArea} fill="url(#ed-red-fill)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.5s ease 0.3s' }} />
        <path d={effortPath} fill="none" stroke="url(#ed-red-stroke)" strokeWidth="3" strokeLinecap="round"
          filter="url(#ed-glow-red)" strokeDasharray="700" strokeDashoffset={v ? 0 : 700}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.3s' }} />

        {/* Fluency area + line */}
        <path d={fluencyArea} fill="url(#ed-teal-fill)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.5s ease 0.8s' }} />
        <path d={fluencyPath} fill="none" stroke="url(#ed-teal-stroke)" strokeWidth="3" strokeLinecap="round"
          filter="url(#ed-glow-teal)" strokeDasharray="700" strokeDashoffset={v ? 0 : 700}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.8s' }} />

        {/* Crossing dot + pulse */}
        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 2s' }}>
          <circle cx={crossX} cy={crossY} r="14" fill="none" stroke={C.purple} strokeWidth="1.5" opacity="0.3">
            <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={crossX} cy={crossY} r="6" fill={C.purple} stroke={C.bg} strokeWidth="2" />
        </g>

        {/* Dots */}
        {effortPts.map((p, i) => (
          <circle key={`e${i}`} cx={p.x} cy={p.y} r="5" fill={C.red} stroke={C.bg} strokeWidth="2"
            opacity={v ? (i === 0 ? 0.8 : 0.4) : 0} style={{ transition: `opacity 0.4s ease ${0.5 + i * 0.15}s` }} />
        ))}
        {fluencyPts.map((p, i) => (
          <circle key={`f${i}`} cx={p.x} cy={p.y} r="5" fill={C.teal} stroke={C.bg} strokeWidth="2"
            opacity={v ? (i === 4 ? 1 : 0.5) : 0} style={{ transition: `opacity 0.4s ease ${1 + i * 0.15}s` }} />
        ))}

      </svg>

      {/* ── EPISODE LABELS (HTML — always readable) ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '8px 4px 0',
        opacity: v ? 0.7 : 0, transition: 'opacity 0.6s ease 1s',
      }}>
        {episodes.map((e, i) => (
          <span key={i} style={{
            fontFamily: FONT.mono, fontSize: 13, fontWeight: i === 0 ? 800 : 600,
            color: C.white,
          }}>Ep {e.ep}</span>
        ))}
      </div>

    </div>
  )
}
