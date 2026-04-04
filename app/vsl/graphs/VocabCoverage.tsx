'use client'

import { C, FONT } from '../design'
import { useInView } from '../primitives'

/**
 * BLOCO 2 — Paul Nation: 500 words = 90%+ of all conversations
 * Animated donut chart (SVG stroke-dashoffset)
 */
export function VocabCoverage() {
  const { ref, v } = useInView(0.2)

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const target = 0.91 // 91%
  const offset = circumference * (1 - (v ? target : 0))

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg viewBox="0 0 200 200" style={{ width: 220, height: 220, transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="vc-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.teal} />
              <stop offset="100%" stopColor={C.purple} />
            </linearGradient>
            <filter id="vc-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle cx="100" cy="100" r={radius}
            fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16"
          />

          {/* Animated fill */}
          <circle cx="100" cy="100" r={radius}
            fill="none" stroke="url(#vc-grad)" strokeWidth="16"
            strokeLinecap="round" filter="url(#vc-glow)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.3s' }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: FONT.mono, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 900,
            background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s',
          }}>90%</span>
          <span style={{
            fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase',
            color: C.t3, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.8s',
          }}>das conversas</span>
        </div>
      </div>

      {/* Legend below */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginTop: 20,
        opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, boxShadow: `0 0 8px ${C.teal}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.t2, letterSpacing: 1 }}>500 PALAVRAS</span>
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.t4, letterSpacing: 1 }}>RESTANTE</span>
        </div>
      </div>
    </div>
  )
}
