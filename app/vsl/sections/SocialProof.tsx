'use client'

import { C, FONT } from '../design'
import { Fade, S, Label, Glass, Grad, Stat } from '../primitives'
import { UsageComparison } from '../graphs/UsageComparison'

// ═══════════════════════════════════════════════════════════
// DATA — edit testimonials here
// ═══════════════════════════════════════════════════════════
const TESTIMONIALS = [
  { name: 'Juliana R.', text: 'Comprei 3 cursos e não terminei nenhum. To no 4o mês e treino todo dia no trânsito. Semana passada entendi uma cena inteira de Friends sem legenda.', role: 'Advogada · SP', color: C.teal, img: '/avatars/juliana.jpg' },
  { name: 'Rafael M.', text: 'Coloco no carro e quando percebo já to cantando em inglês. Em 2 meses meu Skill Scan foi de 28 pra 61. Minha esposa não acredita.', role: 'Engenheiro · MG', color: C.purple, img: '/avatars/rafael.jpg' },
  { name: 'Patricia S.', text: 'Usei o Lab de pronúncia por 3 semanas e meu score subiu de 32 pra 67. A Manu corrige cada palavra. Nunca tive isso em curso nenhum.', role: 'Professora · RJ', color: C.yellow, img: '/avatars/patricia.jpg' },
  { name: 'Carlos D.', text: 'Meus filhos começaram a usar por causa do Scene Challenge. Agora a família inteira treina junto. Friends ficou fácil demais.', role: 'Empresário · PR', color: C.blue, img: '/avatars/carlos.jpg' },
]

export function SocialProof() {
  return (
    <div className="glow-purple" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <Label center color={C.purple}>O que acontece quando a aula vira música</Label>
        </Fade>

        {/* Hero stat */}
        <Fade delay={0.05}>
          <div style={{ textAlign: 'center', margin: '0 0 32px' }}>
            <p style={{
              fontSize: 'clamp(52px, 14vw, 80px)', fontWeight: 900, lineHeight: 1,
            }}>
              <Grad size="inherit">1-2h</Grad>
            </p>
            <p style={{ fontSize: 15, color: C.t2, marginTop: 4 }}>
              por dia. Sem esforço. Porque virou música.
            </p>
          </div>
        </Fade>

        {/* Usage comparison graph */}
        <Fade delay={0.1} from="left">
          <Glass accent={C.purple} hud>
            <p style={{
              textAlign: 'center', fontFamily: FONT.mono,
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              textTransform: 'uppercase', color: C.t3, marginBottom: 8,
            }}>Engajamento ao longo do tempo</p>
            <UsageComparison />
          </Glass>
        </Fade>

        {/* Stats bar */}
        <Fade delay={0.15} from="right">
          <div style={{
            borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
            padding: '24px 0', marginTop: 32,
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
          }} className="rg">
            <Stat value="10.000+" label="Alunos" />
            <Stat value="1M+" label="Horas ouvidas" />
            <Stat value="30+" label="Países" />
            <Stat value="1-2h" label="Treino médio/dia" />
          </div>
        </Fade>

      </S>
    </div>
  )
}
