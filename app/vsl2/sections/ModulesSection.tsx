'use client'

import { C } from '../design'
import { Fade, S, Label, Grad } from '../primitives'
import { ModulesCarousel } from '../carousels/ModulesCarousel'

export function ModulesSection() {
  return (
    <div className="glow-teal" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 400,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              6 módulos. O inglês que se repete.
            </p>
            <p style={{
              fontSize: 'clamp(40px, 10vw, 68px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: '-0.04em',
            }}>
              <Grad size="inherit">Fluência</Grad>
            </p>
            <p style={{
              fontSize: 15, color: C.t3, marginTop: 12, lineHeight: 1.6,
            }}>
              Diálogos reais. Composições originais. Você ouve, repete, e o inglês{' '}
              <strong style={{ color: C.t2 }}>gruda</strong>.
            </p>
          </div>
        </Fade>

        <Fade delay={0.1}>
          <ModulesCarousel />
        </Fade>
      </S>
    </div>
  )
}
