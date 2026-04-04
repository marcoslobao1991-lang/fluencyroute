'use client'

import { C } from '../design'
import { Fade, S, Label, Grad } from '../primitives'
import { RepetitionGraph } from '../graphs/RepetitionGraph'

export function HeroAnchor() {
  return (
    <div className="glow-teal" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <div style={{ textAlign: 'center' }}>
            {/* Label */}
            <p style={{
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 400,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              O método por trás de tudo
            </p>

            {/* Headline */}
            <p style={{
              fontSize: 'clamp(36px, 9vw, 64px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: '-0.04em',
            }}>
              <Grad size="inherit">Repetição Musical</Grad>
            </p>
          </div>
        </Fade>

        <Fade delay={0.1} from="scale">
          <RepetitionGraph />
        </Fade>

        <Fade delay={0.2}>
          <p style={{
            textAlign: 'center', fontSize: 15, color: C.t2,
            lineHeight: 1.7, maxWidth: 520, margin: '0 auto',
          }}>
            O que você repete 40x por prazer não precisa de disciplina.{' '}
            <strong style={{ color: C.t1 }}>Vira rotina.</strong>
          </p>
        </Fade>
      </S>
    </div>
  )
}
