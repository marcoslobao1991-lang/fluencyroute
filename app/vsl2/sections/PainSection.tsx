'use client'

import { C, FONT } from '../design'
import { Fade, S, Glass, Grad } from '../primitives'

export function PainSection() {
  return (
    <div className="glow-red" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{
              fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-0.035em',
            }}>
              <span style={{ color: C.red, opacity: 0.8 }}>95%</span>{' '}
              <span style={{ color: C.t1 }}>desistem.</span>
            </p>
            <p style={{
              fontSize: 15, color: C.t2, marginTop: 16, lineHeight: 1.7,
              maxWidth: 440, margin: '16px auto 0',
            }}>
              Não por falta de vontade. Porque todo curso pede a única coisa que
              você não tem às 22h:{' '}
              <strong style={{ color: C.t1 }}>esforço mental.</strong>
            </p>
          </div>
        </Fade>

        <Fade delay={0.1}>
          <Glass accent={C.red} hud style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 2, color: C.red, opacity: 0.6, marginBottom: 12 }}>JOHNS HOPKINS — 2024</p>
            <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7 }}>
              Pesquisadores colocaram voluntários para fazer tarefas mentais até esgotarem.
              Depois ofereceram <strong style={{ color: C.t1 }}>dinheiro</strong> para continuar.
            </p>
            <p style={{
              fontFamily: FONT.mono, fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800,
              color: C.red, marginTop: 14, opacity: 0.8,
            }}>
              90% recusaram.
            </p>
            <p style={{ fontSize: 14, color: C.t3, marginTop: 8 }}>
              A região do cérebro que avalia recompensa estava desligada.{' '}
              <strong style={{ color: C.red, opacity: 0.7 }}>Fadiga cognitiva.</strong>
            </p>
          </Glass>
        </Fade>

        <Fade delay={0.15}>
          <p style={{
            textAlign: 'center', fontSize: 15, color: C.t2, lineHeight: 1.7,
            marginTop: 24, maxWidth: 460, margin: '24px auto 0',
          }}>
            Por isso o melhor curso do mundo e o pior dão o mesmo resultado.
            Porque os dois são <strong style={{ color: C.t1 }}>aula</strong> — e aula exige
            o que o adulto não tem pra dar.
          </p>
        </Fade>
      </S>
    </div>
  )
}
