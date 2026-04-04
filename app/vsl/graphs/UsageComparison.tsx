'use client'

import { C, FONT } from '../design'
import { useInView } from '../primitives'

/**
 * BLOCO 7 — Traditional courses (spike + cliff) vs IC (steady daily habit)
 */
export function UsageComparison() {
  const { ref, v } = useInView(0.15)

  const W = 480, H = 320
  const padL = 16, padR = 16, padT = 50, padB = 80

  // Traditional: spike to peak then drops to zero (quit)
  const tradPeak = padT + 80
  const tradPath = `M ${padL + 30} ${H - padB}
    C ${padL + 60} ${H - padB} ${padL + 80} ${tradPeak} ${padL + 140} ${tradPeak}
    C ${padL + 180} ${tradPeak} ${padL + 195} ${tradPeak + 10} ${padL + 210} ${H - padB}`
  const tradArea = tradPath + ` L ${padL + 30} ${H - padB} Z`

  // IC: steady flat line extending far right
  const icY = H - padB - 80
  const icPath = `M ${padL + 30} ${H - padB}
    C ${padL + 50} ${H - padB} ${padL + 70} ${icY} ${padL + 100} ${icY}
    L ${W - padR - 30} ${icY}`
  const icArea = icPath + ` L ${W - padR - 30} ${H - padB} L ${padL + 30} ${H - padB} Z`

  return (
    <div ref={ref} className="graph-container" style={{ padding: '8px 0' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="uc-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="uc-teal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base line */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {/* ── Traditional: spike + cliff ── */}
        <path d={tradArea} fill="url(#uc-red)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.3s' }} />
        <path d={tradPath} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.7 : 0} strokeDasharray="500" strokeDashoffset={v ? 0 : 500}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.16,1,.3,1) 0.3s, opacity 0.8s ease 0.3s' }} />

        {/* DESISTIU marker */}
        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 1.5s' }}>
          <line x1={padL + 210} y1={padT} x2={padL + 210} y2={H - padB} stroke={C.red} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <text x={padL + 210} y={padT - 8} textAnchor="middle" fill={C.red}
            style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 800, letterSpacing: '2px' }}>DESISTIU</text>
        </g>

        {/* ── IC: steady habit ── */}
        <path d={icArea} fill="url(#uc-teal)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.8s' }} />
        <path d={icPath} fill="none" stroke={C.teal} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.9 : 0} strokeDasharray="600" strokeDashoffset={v ? 0 : 600}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.8s, opacity 0.8s ease 0.8s' }} />

        {/* HÁBITO DIÁRIO marker */}
        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 2s' }}>
          <text x={W - padR - 30} y={icY - 14} textAnchor="end" fill={C.teal}
            style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, letterSpacing: '2px' }}>HÁBITO DIÁRIO</text>
        </g>

        {/* Legend at bottom */}
        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.8s ease 2.5s' }}>
          <circle cx={W * 0.2} cy={H - 30} r="5" fill={C.red} opacity="0.6" />
          <text x={W * 0.2 + 14} y={H - 25} fill={C.t2}
            style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '1px' }}>CURSO TRADICIONAL</text>

          <circle cx={W * 0.65} cy={H - 30} r="5" fill={C.teal} opacity="0.9" />
          <text x={W * 0.65 + 14} y={H - 25} fill={C.t1}
            style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '1px' }}>INGLÊS CANTADO</text>
        </g>

        {/* X-axis */}
        <text x={W / 2} y={H - 50} textAnchor="middle" fill={C.t3}
          style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '3px' }}>TEMPO →</text>
      </svg>
    </div>
  )
}
