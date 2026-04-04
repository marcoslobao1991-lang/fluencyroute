'use client'

import { C, FONT, CTA_URL } from '../design'
import { Fade, S, Label, Glass, Btn, Grad } from '../primitives'

// ═══════════════════════════════════════════════════════════
// DATA — edit FAQ & includes here
// ═══════════════════════════════════════════════════════════
const ANCHORS = [
  { label: 'Escola presencial', detail: '2 anos de contrato', price: 'R$500/mês', total: 'R$12.000 total' },
  { label: 'Curso online famoso', detail: '500 aulas', price: '+R$2.000', total: '' },
]

const INCLUDES = [
  'Módulos essenciais completos',
  'Trilhas de correção (5 módulos)',
  'Séries cantadas (3 séries)',
  'Lab Premium (pronúncia + IA)',
  'Skill Scan personalizado',
  'Manoella IA 24h',
  'Scene Challenge',
  'Rota da Fluência',
  'Library + livros clássicos',
  'Player exclusivo A-B Loop',
]

const FAQ = [
  ['Não sei cantar. Preciso cantar?', 'Não. Você vai ouvir. Só isso. Coloca o fone, dá play e o seu ouvido faz o trabalho pesado. Se quiser cantar no chuveiro depois, aí já é problema seu.'],
  ['Funciona mesmo cansado?', 'Esse é o ponto inteiro. 22h, destruído, sem energia. Play. O inglês entra mesmo assim — porque música não pede esforço consciente.'],
  ['Sou iniciante total.', 'O conteúdo começa do zero absoluto. O Skill Scan adapta tudo pro seu nível antes de você começar.'],
  ['Já tentei aprender com música antes.', 'Ninguém conversa como Coldplay canta. Aqui são composições profissionais feitas com diálogos reais de séries — o inglês que as pessoas realmente falam.'],
  ['Quanto tempo por dia?', '3 músicas, ~15 minutos. Trânsito, academia, antes de dormir. Nos momentos que antes eram desperdiçados.'],
  ['O conteúdo atualiza?', 'Todo mês entram episódios e músicas novas. A plataforma cresce com você.'],
  ['E a garantia?', '30 dias. 100% de volta. 1 clique dentro da plataforma. Sem perguntas, sem email, sem nada.'],
  ['Formas de pagamento?', 'Cartão, PIX, boleto. Checkout seguro e acesso imediato.'],
  ['Funciona no celular?', 'Foi feito pro celular. Funciona em qualquer tela com navegador.'],
  ['Por que tão barato?', 'Sem sala, sem professor, sem estrutura física. Todo o investimento vai pra tecnologia e conteúdo. E sim — esse preço é de lançamento.'],
]

// ═══════════════════════════════════════════════════════════
// OFFER DIRECT — pricing limpo pós-VSL, sem ancoragem
// ═══════════════════════════════════════════════════════════
export function OfferDirect() {
  return (
    <div className="glow-teal" style={{ overflow: 'hidden' }}>
      <S narrow>
        <Fade from="scale">
          <div className="glass-glow">
            <Glass accent={C.teal} glow style={{
              textAlign: 'center',
              border: `2px solid ${C.teal}18`,
              boxShadow: `0 0 60px ${C.teal}12, 0 0 120px ${C.teal}06, 0 40px 80px -20px rgba(0,0,0,.6)`,
              background: `linear-gradient(160deg, ${C.teal}08, ${C.bg3})`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <img src="/logo.png" alt="IC" style={{ width: 22, height: 22, borderRadius: 5 }} />
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  <span style={{ color: C.white }}>inglês</span><span style={{ color: C.teal }}>cantado</span>
                </span>
              </div>
              <p style={{ fontSize: 12, color: C.teal, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 800, fontFamily: FONT.mono }}>Plano Anual</p>
              <p style={{ fontSize: 13, color: C.t3, letterSpacing: 1.5, marginTop: 10 }}>Inglês Cantado + Rota da Fluência</p>
              <p style={{ fontSize: 'clamp(52px, 14vw, 72px)', fontWeight: 800, lineHeight: 1, marginTop: 12, letterSpacing: '-0.04em' }}>
                <Grad size="inherit">R$99</Grad>
                <span style={{ fontSize: 18, color: C.t3, fontWeight: 400, marginLeft: 4 }}> /mês</span>
              </p>
              <p style={{ fontSize: 15, color: C.t2, marginTop: 8, fontWeight: 600 }}>acesso completo</p>
              <div style={{ height: 24 }} />
              <Btn text="COMEÇAR AGORA" />
            </Glass>
          </div>
        </Fade>

        <Fade delay={0.1}>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 600, color: C.t4, letterSpacing: 2 }}>PAGAMENTO 100% SEGURO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/pagarme.svg" alt="Pagar.me" style={{ height: 14, filter: 'brightness(0) invert(1)', opacity: 0.35 }} />
              <span style={{ color: C.t4, fontSize: 8, opacity: 0.3 }}>+</span>
              <img src="/stone.png" alt="Grupo Stone" style={{ height: 13, filter: 'brightness(0) invert(1)', opacity: 0.35 }} />
              <span style={{ color: C.t4, fontSize: 8, opacity: 0.3 }}>·</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 8, color: C.t4, opacity: 0.35, letterSpacing: 1 }}>SSL 256-BIT</span>
            </div>
          </div>
        </Fade>
      </S>
    </div>
  )
}

export function OfferPrice() {
  return (
    <>
      {/* ═══ OFFER ═══ */}
      <div className="glow-teal" style={{ overflow: 'hidden' }}>
        <S narrow>
          <Fade>
            <Label center color={C.teal}>Quanto custa</Label>
          </Fade>

          {/* Market comparison */}
          <Fade delay={0.05}>
            <Glass style={{ padding: '18px 20px', marginBottom: 12 }}>
              <p style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.t3, marginBottom: 14, textAlign: 'center' }}>O mercado cobra</p>
              {ANCHORS.map((x, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < ANCHORS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.t2 }}>{x.label}</p>
                    <p style={{ fontSize: 12, color: C.t3 }}>{x.detail}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, color: C.t2 }}>{x.price}</p>
                    <p style={{ fontFamily: FONT.mono, fontSize: 12, color: C.t4 }}>{x.total}</p>
                  </div>
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="IC" style={{ width: 22, height: 22, borderRadius: 5 }} />
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  <span style={{ color: C.white }}>inglês</span><span style={{ color: C.teal }}>cantado</span>
                </span>
              </div>
            </Glass>
          </Fade>

          {/* PRICING CARD — Anual */}
          <Fade delay={0.25}>
            <div className="glass-glow">
              <Glass accent={C.teal} glow style={{
                textAlign: 'center',
                border: `2px solid ${C.teal}18`,
                boxShadow: `0 0 60px ${C.teal}12, 0 0 120px ${C.teal}06, 0 40px 80px -20px rgba(0,0,0,.6)`,
                background: `linear-gradient(160deg, ${C.teal}08, ${C.bg3})`,
              }}>
                <p style={{ fontSize: 12, color: C.teal, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 800, fontFamily: FONT.mono }}>Plano Anual</p>
                <p style={{ fontSize: 13, color: C.t3, letterSpacing: 1.5, marginTop: 10 }}>Inglês Cantado + Rota da Fluência</p>
                <p style={{ fontSize: 'clamp(52px, 14vw, 72px)', fontWeight: 800, lineHeight: 1, marginTop: 12, letterSpacing: '-0.04em' }}>
                  <Grad size="inherit">R$99</Grad>
                  <span style={{ fontSize: 18, color: C.t3, fontWeight: 400 }}>/mês</span>
                </p>
                <p style={{ fontSize: 15, color: C.t2, marginTop: 8, fontWeight: 600 }}>acesso completo a tudo</p>
                <div style={{ height: 24 }} />
                <Btn text="COMEÇAR AGORA" />
              </Glass>
            </div>
          </Fade>

          {/* Includes */}
          <Fade delay={0.2}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 16 }} className="rg">
              {INCLUDES.map((x, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: 8,
                  background: C.glass, border: `1px solid ${C.border}`,
                  fontSize: 13, color: C.t2, display: 'flex', gap: 6, alignItems: 'center',
                }}>
                  <span style={{ color: C.teal, fontSize: 13 }}>&#10003;</span>{x}
                </div>
              ))}
            </div>
          </Fade>

          {/* Pagar.me / Stone — Premium trust block */}
          <Fade delay={0.15}>
            <Glass hud style={{ padding: '24px 22px', marginTop: 16, textAlign: 'center' }}>
              {/* Lock icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: 3 }}>PAGAMENTO 100% SEGURO</span>
              </div>

              {/* Logos */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
                <div style={{
                  padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                }}>
                  <img src="/pagarme.svg" alt="Pagar.me" style={{ height: 22, filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
                </div>
                <div style={{ color: C.t4, fontSize: 10 }}>+</div>
                <div style={{
                  padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                }}>
                  <img src="/stone.png" alt="Grupo Stone" style={{ height: 20, filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
                Processado pela <strong style={{ color: C.t1 }}>Pagar.me</strong>, empresa do <strong style={{ color: C.t1 }}>Grupo Stone</strong> — a mesma infraestrutura que processa milhões de transações por dia no Brasil.
              </p>

              {/* Payment methods */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16,
                flexWrap: 'wrap',
              }}>
                {['PIX', 'Crédito'].map((m, i) => (
                  <span key={i} style={{
                    fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: C.t3,
                    letterSpacing: 1, padding: '5px 12px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                  }}>{m}</span>
                ))}
              </div>

              {/* SSL line */}
              <p style={{ fontFamily: FONT.mono, fontSize: 13, color: C.t4, marginTop: 14, letterSpacing: 1 }}>
                SSL 256-BIT · DADOS CRIPTOGRAFADOS · ACESSO IMEDIATO
              </p>
            </Glass>
          </Fade>


        </S>
      </div>
    </>
  )
}

export function GuaranteeClose() {
  return (
    <>
      {/* ═══ GUARANTEE ═══ */}
      <S narrow>
        <Fade>
          <div className="glass-glow">
            <Glass accent={C.teal} glow style={{ textAlign: 'center' }}>
              <div style={{ margin: '0 auto 20px', width: 72, height: 72 }}>
                <img src="/shield-guarantee.png" alt="Garantia" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(0 0 24px ${C.teal}50)` }} />
              </div>

              <p style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 900, lineHeight: 1 }}>
                <Grad size="inherit">30 dias</Grad>
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginTop: 8 }}>de garantia incondicional</p>

              <p style={{ fontSize: 15, color: C.t2, marginTop: 16, lineHeight: 1.7 }}>
                Não gostou, devolvemos tudo. <strong style={{ color: C.white }}>1 clique. Sem perguntas.</strong>
              </p>

              <p style={{ fontSize: 'clamp(36px, 9vw, 52px)', fontWeight: 900, color: C.teal, marginTop: 20, fontFamily: FONT.mono }}>100%</p>
              <p style={{ fontSize: 15, color: C.t2 }}>do seu dinheiro de volta</p>

              <div style={{ height: 24 }} />
              <Btn text="TESTAR POR 30 DIAS" />
            </Glass>
          </div>
        </Fade>
      </S>

      {/* ═══ FAQ ═══ */}
      <S narrow>
        <Fade><Label center>Perguntas frequentes</Label></Fade>
        {FAQ.map(([q, a], i) => (
          <Fade key={i} delay={Math.min(i * 0.03, 0.15)}>
            <details style={{
              marginBottom: 2, borderRadius: 0,
              background: 'transparent', borderBottom: `1px solid ${C.border}`,
            }}>
              <summary style={{
                padding: '20px 0', cursor: 'pointer',
                fontSize: 15, fontWeight: 700, color: C.t1,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 14, transition: 'color .2s',
              }}>
                {q}
                <span style={{
                  width: 26, height: 26, minWidth: 26, borderRadius: '50%',
                  border: `1px solid ${C.borderLight}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: C.t3, transition: 'all .3s',
                }}>+</span>
              </summary>
              <div style={{ padding: '0 0 20px', fontSize: 15, color: C.t2, lineHeight: 1.85 }}>{a}</div>
            </details>
          </Fade>
        ))}
      </S>

      {/* ═══ CREDENCIAL ═══ */}
      <S narrow>
        <Fade>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <img src="/logo.png" alt="IC" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
                <span style={{ color: C.t1 }}>inglês</span><span style={{ color: C.teal }}>cantado</span>
              </span>
            </div>
            <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.8 }}>
              Plataforma da <strong style={{ color: C.t1 }}>Fluency Route</strong> — a empresa por trás do método de repetição musical.
            </p>
            <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.8, marginTop: 12 }}>
              Composições originais com diálogos reais de séries. Tecnologia própria. 10.000+ alunos em 30+ países.
            </p>
          </div>
        </Fade>
      </S>

    </>
  )
}
