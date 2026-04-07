'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { C } from '../design'

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════
const SLIDES = [
  { title: 'Dashboard', sub: 'Meta diaria, streak, fluency score, progresso', img: '/screenshots/d-01-dashboard.png' },
  { title: 'Modulos e Fases', sub: 'Todo conteudo organizado por nivel', img: '/screenshots/d-03-module.png' },
  { title: 'Player + Letras', sub: 'A-B Loop, velocidade, letra completa', img: '/screenshots/d-04-player.png' },
  { title: 'Dashboard Completo', sub: 'Visao geral de todo o progresso', img: '/screenshots/05-full-dashboard.png' },
  { title: 'App Mobile', sub: 'Tudo no seu bolso — funciona em qualquer lugar', img: '/screenshots/m-01-dashboard.png', mobile: true },
  { title: 'Stats e Badges', sub: 'XP, nivel, streak, conquistas desbloqueadas', img: '/screenshots/m-02-stats.png', mobile: true },
  { title: 'Fases no Mobile', sub: 'Navegacao completa pelo celular', img: '/screenshots/m-03-phases.png', mobile: true },
]

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
export function AppCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef(0)

  const goTo = useCallback((i: number) => {
    setCurrent(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => goTo(current + 1), 4500)
    return () => clearInterval(t)
  }, [current, paused, goTo])

  const hold = () => setPaused(true)
  const release = () => setTimeout(() => setPaused(false), 4000)

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; hold() }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 40) goTo(dx > 0 ? current - 1 : current + 1)
    release()
  }

  const slide = SLIDES[current]

  return (
    <div>
      <div
        onPointerDown={hold} onPointerUp={release}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        style={{ position: 'relative' }}
      >
        {/* Screenshot frame */}
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${C.borderLight}`,
          background: C.bg3,
          backdropFilter: 'blur(12px)',
          boxShadow: `0 8px 48px rgba(0,0,0,0.5), 0 0 60px ${C.teal}06, inset 0 1px 0 ${C.borderLight}`,
          transition: 'box-shadow .8s ease',
          aspectRatio: '16/10',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {slide.mobile ? (
            <div style={{
              width: '45%', maxWidth: 180, borderRadius: 20, overflow: 'hidden',
              border: `2px solid ${C.borderLight}`,
              boxShadow: `0 0 40px rgba(0,0,0,0.4), 0 0 60px ${C.teal}08`,
            }}>
              <img src={slide.img} alt={slide.title} style={{ width: '100%', display: 'block' }} loading="lazy" />
            </div>
          ) : (
            <img src={slide.img} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
          )}
        </div>

        {/* Nav arrows */}
        {[
          { dir: -1, pos: 'left' as const, icon: '\u2039' },
          { dir: 1, pos: 'right' as const, icon: '\u203A' },
        ].map(({ dir, pos, icon }) => (
          <button key={pos}
            onClick={(e) => { e.stopPropagation(); goTo(current + dir); hold(); release() }}
            style={{
              position: 'absolute', [pos]: 8, top: '50%', transform: 'translateY(-50%)',
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
              border: `1px solid ${C.border}`,
              color: C.t1, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .3s',
            }}
          >{icon}</button>
        ))}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{slide.title}</p>
        <p style={{ fontSize: 14, color: C.t2, marginTop: 2 }}>{slide.sub}</p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { goTo(i); hold(); release() }} style={{
            width: current === i ? 28 : 8, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer',
            background: current === i ? C.teal : 'rgba(255,255,255,0.04)',
            transition: 'all .4s cubic-bezier(.16,1,.3,1)',
            boxShadow: current === i ? `0 0 10px ${C.teal}40` : 'none',
          }} />
        ))}
      </div>
    </div>
  )
}
