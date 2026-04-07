'use client'

import { C } from '../design'
import { Fade, S, Label, Grad } from '../primitives'
import { FeaturesCarousel } from '../carousels/FeaturesCarousel'

export function FeaturesSection() {
  return (
    <S>
      <Fade>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{
            fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 400,
            color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
            marginBottom: 6,
          }}>8 ferramentas que nenhum curso tem</p>
          <p style={{
            fontSize: 'clamp(36px, 9vw, 60px)', fontWeight: 900,
            lineHeight: 1.0, letterSpacing: '-0.04em',
          }}>
            <Grad size="inherit">Tecnologia</Grad>
          </p>
        </div>
      </Fade>

      <Fade delay={0.1} from="left">
        <FeaturesCarousel />
      </Fade>
    </S>
  )
}
