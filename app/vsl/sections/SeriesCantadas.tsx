'use client'

import { useState } from 'react'
import { C, FONT } from '../design'
import { Fade, S, Label, Glass, Grad } from '../primitives'
import { EffortDecay } from '../graphs/EffortDecay'

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════
const SERIES = [
  { img: '/thumb-rota-friends-game.jpg', name: 'Friends', detail: 'Season 1 · Episode 1', color: C.purple },
  { img: '/thumb-rota-himym-game.jpg', name: 'How I Met Your Mother', detail: 'Season 1 · Episode 1', color: C.blue },
  { img: '/thumb-rota-tahm-game.jpg', name: 'Two and a Half Men', detail: 'Season 1 · Episode 1', color: C.yellow },
]
const SERIES_LOOP = [...SERIES, ...SERIES, ...SERIES]

function SeriesCarousel() {
  const [paused, setPaused] = useState(false)
  const cardW = 240
  const gap = 14
  const totalW = SERIES.length * (cardW + gap)

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 20, zIndex: 2,
        background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: 20, zIndex: 2,
        background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex', gap, width: 'max-content',
        animation: `seriesScroll ${SERIES.length * 5}s linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {SERIES_LOOP.map((s, i) => (
          <div key={i} style={{
            width: cardW, flexShrink: 0,
            borderRadius: 4, overflow: 'hidden',
            border: `1px solid ${s.color}20`, background: C.bg3,
            position: 'relative',
          }} className="hud">
            {/* Image with overlays */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img src={s.img} alt={s.name} style={{
                width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block',
                filter: 'saturate(0.85) brightness(0.9)',
              }} loading="lazy" />
              {/* Color tint overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(160deg, ${s.color}40, transparent 70%)`,
                mixBlendMode: 'screen',
              }} />
              {/* Bottom gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to top, ${C.bg3} 0%, transparent 50%)`,
              }} />
              {/* Scan line */}
              <div style={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, transparent, ${s.color}30, transparent)`,
                  animation: 'scanMove 4s linear infinite',
                }} />
              </div>
              {/* Grid overlay */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
                backgroundImage: `repeating-linear-gradient(0deg, ${s.color} 0, ${s.color} 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, ${s.color} 0, ${s.color} 1px, transparent 1px, transparent 30px)`,
              }} />
            </div>
            {/* Text */}
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.name}</p>
              <p style={{ fontSize: 12, color: C.t3, fontFamily: FONT.mono }}>{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes seriesScroll {
          0% { transform: translateX(0) }
          100% { transform: translateX(-${totalW}px) }
        }
      `}</style>
    </div>
  )
}

export function SeriesCantadas() {
  return (
    <div className="glow-purple" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <Label center color={C.purple}>Séries Cantadas</Label>
          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 600,
            color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            As séries que você ama.
          </p>
          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(32px, 7vw, 50px)', fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-0.035em',
            marginBottom: 8,
          }}>
            <Grad size="inherit">Em música.</Grad>
          </p>
          <p style={{
            textAlign: 'center', fontSize: 15, color: C.t2,
            lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px',
          }}>
            Friends, HIMYM, Two and a Half Men — cada cena virou uma música que você não consegue parar de ouvir.
          </p>
        </Fade>

        {/* Series carousel — infinite auto-scroll */}
        <Fade delay={0.1}>
          <SeriesCarousel />
        </Fade>

        {/* Effort decay graph */}
        <Fade delay={0.15}>
          <div style={{ marginTop: 32 }}>
            <Glass accent={C.purple} hud>
              <EffortDecay />
            </Glass>
          </div>
        </Fade>

        {/* Punch line */}
        <Fade delay={0.2}>
          <p style={{
            textAlign: 'center', fontSize: 'clamp(16px, 3.5vw, 20px)',
            fontWeight: 700, color: C.t1, marginTop: 28,
            lineHeight: 1.5, maxWidth: 480, margin: '28px auto 0',
          }}>
            Comece pelo primeiro episódio.{' '}
            <span style={{ color: C.teal }}>Seu cérebro faz o resto.</span>
          </p>
        </Fade>
      </S>
    </div>
  )
}
