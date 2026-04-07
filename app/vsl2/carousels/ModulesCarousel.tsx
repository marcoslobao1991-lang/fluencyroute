'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { C, FONT } from '../design'
import { useInView } from '../primitives'

// ═══════════════════════════════════════════════════════════
// DATA — edit modules here
// ═══════════════════════════════════════════════════════════
const MODULES = [
  { title: 'Essential Base', subtitle: 'O inglês que realmente se repete no dia a dia', color: C.teal, img: '/modules/base.jpg' },
  { title: 'Connected Speech', subtitle: 'Inglês emendado como nativos falam', color: C.purple, img: '/modules/connected.jpg' },
  { title: 'Expressions', subtitle: 'Frases prontas que você ouve em toda conversa', color: C.purple, img: '/modules/expressions.jpg' },
  { title: 'Collocations', subtitle: 'Combinações naturais que soam como nativo', color: C.blue, img: '/modules/collocations.jpg' },
  { title: 'Storytelling', subtitle: 'Narrativas que fixam estruturas complexas', color: C.yellow, img: '/modules/storytelling.jpg' },
  { title: 'Tongue Twisters', subtitle: 'Pronúncia afiada com ritmo e velocidade', color: C.red, img: '/modules/tongues.jpg' },
]

// ═══════════════════════════════════════════════════════════
// COMPONENT — AUTO-ROTATING HIGH-TECH CAROUSEL
// ═══════════════════════════════════════════════════════════
export function ModulesCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const { ref: viewRef, v: inView } = useInView(0.1)

  const total = MODULES.length

  // Auto-rotate
  useEffect(() => {
    if (paused || !inView) return
    const t = setInterval(() => {
      setActive(prev => (prev + 1) % total)
    }, 3500)
    return () => clearInterval(t)
  }, [paused, inView, total])

  // Scroll to active card
  useEffect(() => {
    const el = trackRef.current
    if (!el || dragging) return
    const child = el.children[active] as HTMLElement
    if (child) {
      el.scrollTo({
        left: child.offsetLeft - (el.clientWidth - child.clientWidth) / 2,
        behavior: 'smooth',
      })
    }
  }, [active, dragging])

  // Touch/pointer handlers
  const onPointerDown = (e: React.PointerEvent) => {
    setPaused(true)
    setDragging(true)
    startX.current = e.clientX
    startScrollLeft.current = trackRef.current?.scrollLeft || 0
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return
    const dx = e.clientX - startX.current
    trackRef.current.scrollLeft = startScrollLeft.current - dx
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 50) {
      setActive(prev => dx > 0 ? Math.max(0, prev - 1) : Math.min(total - 1, prev + 1))
    }
    setTimeout(() => setPaused(false), 4000)
  }

  const goTo = useCallback((i: number) => {
    setActive(i)
    setPaused(true)
    setTimeout(() => setPaused(false), 4000)
  }, [])

  const m = MODULES[active]

  return (
    <div ref={viewRef}>
      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { if (dragging) { setDragging(false); setTimeout(() => setPaused(false), 3000) } }}
        style={{
          display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
          padding: '8px 20px', cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {MODULES.map((mod, i) => {
          const isActive = i === active
          return (
            <div key={i} onClick={() => goTo(i)} style={{
              width: 'clamp(260px, 70vw, 300px)', flexShrink: 0,
              scrollSnapAlign: 'center',
              borderRadius: 4, overflow: 'hidden',
              background: C.bg3,
              border: `1px solid ${isActive ? mod.color + '30' : 'rgba(255,255,255,0.03)'}`,
              backdropFilter: 'blur(12px)',
              transition: 'all .5s cubic-bezier(.16,1,.3,1)',
              transform: isActive ? 'scale(1)' : 'scale(0.93)',
              opacity: isActive ? 1 : 0.5,
              boxShadow: isActive ? `0 0 50px ${mod.color}15, 0 20px 40px -10px rgba(0,0,0,.5)` : 'none',
              position: 'relative',
            }}>
              {/* HUD corners */}
              {isActive && <div className="hud" style={{
                position: 'absolute', inset: 0, borderRadius: 4, pointerEvents: 'none', zIndex: 3,
                '--hud-c': `${mod.color}50`,
              } as React.CSSProperties} />}

              {/* Image */}
              <div style={{
                height: 160, overflow: 'hidden', position: 'relative',
                borderBottom: `1px solid ${mod.color}10`,
              }}>
                <img
                  src={mod.img} alt={mod.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    transition: 'transform .8s cubic-bezier(.16,1,.3,1)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                  loading="lazy"
                />
                {/* Gradient overlay on image */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(to top, ${C.bg3} 0%, transparent 50%)`,
                }} />
                {/* Scan line effect on active card */}
                {isActive && (
                  <div style={{
                    position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: 1,
                      background: `linear-gradient(90deg, transparent, ${mod.color}30, transparent)`,
                      animation: 'scanMove 3s linear infinite',
                    }} />
                  </div>
                )}
              </div>

              {/* Text */}
              <div style={{ padding: '14px 18px 18px', position: 'relative', zIndex: 1 }}>
                <p style={{
                  fontFamily: FONT.mono, fontSize: 15, fontWeight: 800,
                  color: isActive ? mod.color : C.t2,
                  letterSpacing: '-0.02em',
                  transition: 'color .4s',
                }}>{mod.title}</p>
                <p style={{
                  fontSize: 14, color: C.t2, marginTop: 4, lineHeight: 1.5,
                  opacity: isActive ? 1 : 0.6, transition: 'opacity .4s',
                }}>{mod.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar + dots */}
      <div style={{ marginTop: 20, padding: '0 20px' }}>
        {/* Progress bar */}
        <div style={{
          height: 2, background: 'rgba(255,255,255,0.04)',
          borderRadius: 2, overflow: 'hidden', marginBottom: 14,
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: m.color,
            width: `${((active + 1) / total) * 100}%`,
            transition: 'width .5s cubic-bezier(.16,1,.3,1), background .5s',
            boxShadow: `0 0 8px ${m.color}40`,
          }} />
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {MODULES.map((mod, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: active === i ? 28 : 8, height: 7, borderRadius: 4,
              border: 'none', cursor: 'pointer',
              background: active === i ? mod.color : 'rgba(255,255,255,0.04)',
              transition: 'all .4s cubic-bezier(.16,1,.3,1)',
              boxShadow: active === i ? `0 0 10px ${mod.color}40` : 'none',
            }} />
          ))}
        </div>

        {/* Counter */}
        <p style={{
          textAlign: 'center', fontFamily: FONT.mono,
          fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: C.t4, marginTop: 10,
        }}>
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        div[style*="scrollbar"]::-webkit-scrollbar { display: none }
      `}</style>
    </div>
  )
}
