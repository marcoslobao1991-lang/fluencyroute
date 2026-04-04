'use client'

import { useState } from 'react'
import { C, FONT } from '../design'

// ═══════════════════════════════════════════════════════════
// DATA — edit features here
// ═══════════════════════════════════════════════════════════
const FEATURES = [
  { title: 'Modo Guiado', hook: 'Abriu o app? Ele já sabe o que você precisa.', color: C.teal, img: '/features/guided.jpg' },
  { title: 'Player A-B Loop', hook: 'O trecho que te travou? Repete até sair sozinho.', color: C.purple, img: '/features/player.jpg' },
  { title: 'Scene Challenge', hook: 'Cenas de Friends viram jogo. Você não quer parar.', color: C.yellow, img: '/features/scene.jpg' },
  { title: 'Skill Scan', hook: 'Descubra exatamente onde seu inglês tá fraco.', color: C.teal, img: '/features/scan.jpg' },
  { title: 'Fluency Station', hook: 'Nunca falta o que treinar.', color: C.blue, img: '/features/station.jpg' },
  { title: 'Dicionário Pessoal', hook: 'Salvou a palavra? A IA monta seu treino.', color: C.purple, img: '/features/dictionary.jpg' },
  { title: 'Manoella 24h', hook: 'Sua IA que sabe exatamente onde você tá.', color: C.teal, img: '/features/manoella.jpg' },
  { title: 'Streaks & XP', hook: 'O hábito vira jogo. O jogo vira fluência.', color: C.red, img: '/features/streaks.jpg' },
]

// Double the array for seamless infinite scroll
const ITEMS = [...FEATURES, ...FEATURES]

// ═══════════════════════════════════════════════════════════
// COMPONENT — INFINITE AUTO-SCROLL CAROUSEL
// ═══════════════════════════════════════════════════════════
export function FeaturesCarousel() {
  const [paused, setPaused] = useState(false)
  const cardW = 200 // px per card
  const gap = 14
  const totalW = FEATURES.length * (cardW + gap)

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 20, zIndex: 2,
        background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: 20, zIndex: 2,
        background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none',
      }} />

      {/* Scrolling track */}
      <div style={{
        display: 'flex', gap, width: 'max-content',
        animation: `featureScroll ${FEATURES.length * 4}s linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {ITEMS.map((f, i) => (
          <div key={i} style={{
            width: cardW, flexShrink: 0,
            borderRadius: 12, overflow: 'hidden',
            background: `linear-gradient(160deg, ${f.color}06, ${C.glass})`,
            border: `1px solid ${f.color}12`,
            transition: 'border-color .3s, box-shadow .3s',
          }}>
            {/* Image */}
            <div style={{
              height: 240, overflow: 'hidden', position: 'relative',
              borderBottom: `1px solid ${f.color}08`,
            }}>
              <img src={f.img} alt={f.title} style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              }} loading="lazy" />
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to top, ${C.bg3} 0%, transparent 40%)`,
              }} />
            </div>

            {/* Text */}
            <div style={{ padding: '12px 14px 16px' }}>
              <p style={{
                fontFamily: FONT.mono, fontSize: 14, fontWeight: 800,
                color: f.color, letterSpacing: '-0.01em',
              }}>{f.title}</p>
              <p style={{
                fontSize: 13, color: C.t2, marginTop: 4, lineHeight: 1.5,
              }}>{f.hook}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feature count */}
      <p style={{
        textAlign: 'center', fontFamily: FONT.mono,
        fontSize: 12, fontWeight: 700, letterSpacing: 3,
        color: C.t3, marginTop: 14,
      }}>{FEATURES.length} FERRAMENTAS INTEGRADAS</p>

      {/* Infinite scroll keyframes */}
      <style>{`
        @keyframes featureScroll {
          0% { transform: translateX(0) }
          100% { transform: translateX(-${totalW}px) }
        }
      `}</style>
    </div>
  )
}
