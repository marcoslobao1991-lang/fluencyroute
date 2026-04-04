'use client'

import { C, FONT } from '../design'
import { Fade, S, Label, Glass } from '../primitives'
import { VocabCoverage } from '../graphs/VocabCoverage'

export function SciencePunch() {
  return (
    <S narrow>
      <Fade>
        <Label center>Paul Nation · Linguista</Label>
      </Fade>

      <Fade delay={0.1} from="scale">
        <Glass accent={C.teal} hud>
          <VocabCoverage />
          <p style={{
            textAlign: 'center', fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: 800, color: C.t1, marginTop: 4, lineHeight: 1.4,
          }}>
            <span style={{ fontFamily: FONT.mono, color: C.teal }}>500</span> palavras cobrem{' '}
            <span style={{ fontFamily: FONT.mono, color: C.teal }}>90%+</span> de todas as conversas reais.
          </p>
          <p style={{
            textAlign: 'center', fontSize: 15, color: C.t2,
            marginTop: 12, lineHeight: 1.7,
          }}>
            Fluência não é saber tudo. É dominar o que se repete.{' '}
            <strong style={{ color: C.teal }}>É exatamente isso que você vai internalizar — sem perceber.</strong>
          </p>
        </Glass>
      </Fade>
    </S>
  )
}
