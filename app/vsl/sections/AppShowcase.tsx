'use client'

import { C } from '../design'
import { Fade, S, Label, Grad } from '../primitives'
import { AppCarousel } from '../carousels/AppCarousel'

export function AppShowcase() {
  return (
    <div className="glow-teal" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{
              fontSize: 'clamp(36px, 9vw, 64px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: '-0.04em',
            }}>
              <Grad size="inherit">O App</Grad>
            </p>
          </div>
        </Fade>

        {/* App icon animation */}
        <Fade delay={0.05}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: `linear-gradient(135deg, ${C.teal}20, ${C.purple}15)`,
              border: `1px solid ${C.teal}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${C.teal}15, 0 0 80px ${C.teal}08`,
            }}>
              <img src="/logo.png" alt="Inglês Cantado" style={{ width: 40, height: 40, borderRadius: 8 }} />
            </div>
          </div>
        </Fade>

        <Fade delay={0.1}>
          <AppCarousel />
        </Fade>
      </S>
    </div>
  )
}
