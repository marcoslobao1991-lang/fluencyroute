'use client'

import { C, FONT } from '../design'
import { useInView } from '../primitives'

/**
 * BLOCO 1 — Hero graph: AULA 1x vs MÚSICA 30-40x
 * Two animated bars with dopamine particles floating from the music bar
 */
export function RepetitionGraph() {
  const { ref, v } = useInView(0.15)

  return (
    <div ref={ref} style={{ position: 'relative', padding: '24px 0' }}>
      <svg viewBox="0 0 500 360" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="rg-teal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-purple" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.purple} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-red" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.6" />
          </linearGradient>
          <filter id="rg-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="50" y1={50 + i * 55} x2="450" y2={50 + i * 55}
            stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        ))}

        {/* ── AULA BAR (tiny, red) ── */}
        <rect
          x="90" y={v ? 205 : 215} width="110" height={v ? 10 : 0}
          rx="5" fill="url(#rg-red)"
          style={{ transition: 'all 1.2s cubic-bezier(.16,1,.3,1) 0.3s' }}
        />
        <text x="145" y="250" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 32, fontWeight: 800, opacity: v ? 0.7 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
          1x
        </text>
        <text x="145" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 700, letterSpacing: '3px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1s' }}>
          AULA
        </text>

        {/* ── MÚSICA BAR (massive, teal gradient, glowing) ── */}
        <rect
          x="290" y={v ? 50 : 215} width="110" height={v ? 165 : 0}
          rx="5" fill="url(#rg-purple)" filter="url(#rg-glow)"
          style={{ transition: 'all 1.8s cubic-bezier(.16,1,.3,1) 0.6s' }}
        />
        <text x="345" y="250" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 38, fontWeight: 800, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s' }}>
          30-40x
        </text>
        <text x="345" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 700, letterSpacing: '3px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.7s' }}>
          MÚSICA
        </text>

        {/* ── Dopamine particles ── */}
        {v && [
          { cx: 310, delay: '0.8s', dur: '3.5s' },
          { cx: 330, delay: '1.2s', dur: '4s' },
          { cx: 345, delay: '1.5s', dur: '3.8s' },
          { cx: 360, delay: '1.8s', dur: '4.2s' },
          { cx: 320, delay: '2.2s', dur: '3.6s' },
          { cx: 370, delay: '2.5s', dur: '4.5s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy="50" r="3"
            fill={i % 2 === 0 ? C.teal : C.purple}
            opacity="0"
            style={{ animation: `dopFloat ${p.dur} ease-in-out ${p.delay} infinite` }}
          />
        ))}

        {/* Brain emoji */}
        <text x="345" y="35" textAnchor="middle" style={{ fontSize: 30 }}>🧠</text>

        {/* Bottom labels */}
        <text x="145" y="320" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.6 : 0, transition: 'opacity 0.8s ease 2s' }}>
          INSUFICIENTE
        </text>
        <text x="345" y="320" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.9 : 0, transition: 'opacity 0.8s ease 2s' }}>
          AUTOMÁTICA
        </text>
      </svg>

      <style>{`
        @keyframes dopFloat {
          0% { opacity: 0; transform: translateY(0) }
          15% { opacity: .7 }
          50% { opacity: .4; transform: translateY(-40px) }
          85% { opacity: .6; transform: translateY(-60px) }
          100% { opacity: 0; transform: translateY(-80px) }
        }
      `}</style>
    </div>
  )
}
