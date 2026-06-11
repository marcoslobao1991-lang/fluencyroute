'use client'

import { useState, useEffect, useRef } from 'react'

type Bucket = 'A' | 'B' | 'C' | 'D'

const BUCKET_BY_Q1: Record<string, Bucket> = {
  desliga: 'A',
  solta: 'A',
  responder: 'B',
  pega_bem: 'D',
}

const TIME_LABEL: Record<string, string> = {
  menos_1: '1 ano',
  '2_5': 'entre 2 e 5 anos',
  '6_12': 'entre 6 e 12 anos',
  '12_mais': 'mais de 12 anos',
}

const ARCHETYPE: Record<Bucket, {
  name: string
  pegada: string
  beats: { t: string; punch: string }[]
}> = {
  A: {
    name: 'O Quase Pronto, travado na escuta',
    pegada: 'Teu travamento é escuta rápida. Não é vocab. Não é falta de esforço.',
    beats: [
      { t: 'Minuto 2', punch: 'explico por que "I want to" soa "aiwana" — e tu vai pensar "caralho, é isso"' },
      { t: 'Minuto 5', punch: 'mostro o erro que TODO cursinho te ensinou (e que ainda te trava hoje)' },
      { t: 'Minuto 9', punch: 'mostro o método de 15min/dia que funciona exatamente pro Quase Pronto' },
    ],
  },
  B: {
    name: 'O Falante Engasgado',
    pegada: 'Tua base existe. Lê, entende áudio, sabe a regra. Mas na hora H, a frase trava na garganta.',
    beats: [
      { t: 'Minuto 2', punch: 'explico por que tua base não vira fala — e não é falta de "praticar mais"' },
      { t: 'Minuto 5', punch: 'mostro o caminho específico da memória pra boca que escola NÃO ensina' },
      { t: 'Minuto 9', punch: 'te entrego o sistema que destrava a fala em 30 dias' },
    ],
  },
  C: {
    name: 'O Eterno Recomeço',
    pegada: 'Você já começou inglês N vezes. Lembra pra prova, esquece em 90 dias. Sempre achou que era preguiça tua. Não é.',
    beats: [
      { t: 'Minuto 2', punch: 'revelo por que teu cérebro descarta TUDO que você estudou em cursinho' },
      { t: 'Minuto 5', punch: 'mostro a OUTRA memória que você usa sem saber (a que nunca esquece letra de música)' },
      { t: 'Minuto 9', punch: 'te entrego o método que ativa essa memória e quebra o ciclo pra sempre' },
    ],
  },
  D: {
    name: 'O Travado Invisível',
    pegada: 'Você acompanha 90%. Em conversa fácil, defende. Mas sabe que não é fluente de verdade — e ninguém entende por quê.',
    beats: [
      { t: 'Minuto 2', punch: 'explico por que você parou de evoluir faz tempo (não é plateau, é input repetido)' },
      { t: 'Minuto 5', punch: 'mostro o salto específico de "entende bem" pra "fluente de verdade"' },
      { t: 'Minuto 9', punch: 'te entrego o nível de input denso que escola nunca chegou' },
    ],
  },
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck'] as const

function getUtms(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utms: Record<string, string> = {}
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) utms[k] = v
  })
  return utms
}

function fbqTrack(event: string, params?: any) {
  if (typeof window === 'undefined') return
  const fbq = (window as any).fbq
  if (typeof fbq !== 'function') return
  fbq('track', event, params || {})
}

export default function QuizClient() {
  // step 0 = landing, 1-2 = Q1-Q2, 3 = profecia-1, 4 = Q3, 5 = Q4-preço, 6 = Q5-commitment, 7 = profecia-completa, 8 = pacto
  const [step, setStep] = useState(0)
  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [a3, setA3] = useState('')
  const [a4, setA4] = useState('')
  const [a5, setA5] = useState('')
  const [bucket, setBucket] = useState<Bucket>('A')
  const utmsRef = useRef<Record<string, string>>({})
  const startedRef = useRef(false)

  useEffect(() => {
    utmsRef.current = getUtms()
    if (!startedRef.current) {
      startedRef.current = true
      fbqTrack('ViewContent', { content_name: 'Quiz Profecia', content_category: 'quiz_landing' })
    }
  }, [])

  const total = 9
  const progressPct = step === 0 ? 0 : Math.round((step / (total - 1)) * 100)

  const goStart = () => {
    fbqTrack('ViewContent', { content_name: 'Quiz Start', content_category: 'quiz_q1' })
    setStep(1)
  }
  const goNext = () => {
    setStep(s => {
      const next = Math.min(s + 1, total - 1)
      if (next === 3) fbqTrack('ViewContent', { content_name: 'Quiz Profecia 1', content_category: 'quiz_interstitial' })
      if (next === 7) fbqTrack('ViewContent', { content_name: 'Quiz Profecia Final', content_category: 'quiz_interstitial' })
      if (next === 8) fbqTrack('ViewContent', { content_name: 'Quiz Pacto', content_category: 'quiz_commit' })
      return next
    })
  }

  const handleQ1 = (key: string) => {
    setA1(key)
    setBucket(BUCKET_BY_Q1[key] || 'A')
    goNext()
  }
  const handleQ2 = (k: string) => { setA2(k); goNext() }
  const handleQ3 = (k: string) => { setA3(k); goNext() }
  const handleQ4 = (k: string) => { setA4(k); goNext() }
  const handleQ5 = (k: string) => { setA5(k); goNext() }

  const goToVsl = () => {
    fbqTrack('Lead', { content_name: 'Quiz Pacto Assinado', content_category: bucket })
    const vslUrl = new URL('/vsl', window.location.origin)
    vslUrl.searchParams.set('bucket', bucket)
    vslUrl.searchParams.set('pacto', '1')
    Object.entries(utmsRef.current).forEach(([k, v]) => vslUrl.searchParams.set(k, v))
    window.location.href = vslUrl.toString()
  }

  const archetype = ARCHETYPE[bucket]
  const timeLabel = TIME_LABEL[a2] || 'anos'

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#fff',
      fontFamily: 'var(--font-dm-sans), sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes qFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes qPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(78,205,196,0.25); }
          50% { box-shadow: 0 0 50px rgba(78,205,196,0.45); }
        }
        .q-fade { animation: qFadeIn 0.45s ease; }
        .q-pulse { animation: qPulse 2.2s ease-in-out infinite; }
        .q-option {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        @media (hover: hover) {
          .q-option:hover { background: rgba(78,205,196,0.08) !important; border-color: rgba(78,205,196,0.3) !important; }
        }
        .q-option:active { background: rgba(78,205,196,0.2) !important; border-color: rgba(78,205,196,0.55) !important; transform: scale(0.985); }
        .q-cta:active { transform: scale(0.985); }
      ` }} />

      <div style={{
        position: 'fixed',
        top: '-200px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '900px',
        background: 'radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 60%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '580px',
        margin: '0 auto',
        padding: '28px 20px 80px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>

        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#4ECDC4',
            marginBottom: '12px',
          }}>
            Rota da Fluência
          </div>
          {step > 0 && (
            <>
              <div style={{
                height: '4px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '100px',
                overflow: 'hidden',
                marginBottom: '6px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #4ECDC4, #A78BFA)',
                  borderRadius: '100px',
                  transition: 'width 0.6s ease',
                  boxShadow: '0 0 12px rgba(78,205,196,0.4)',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px' }}>
                {step >= 8 ? 'PACTO' : step === 7 ? 'PROFECIA PRONTA' : step === 3 ? 'PROFECIA INICIADA' : `${step} DE 5`}
              </div>
            </>
          )}
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {step === 0 && <LandingScreen onStart={goStart} />}

          {step === 1 && <QScreen
            key="q1"
            pre="Pergunta 1 · a cena"
            title="Te coloco numa cena: gringo aparece e fala rápido com você. O que acontece aí dentro?"
            sub="Sem filtro. Só a verdade."
            options={[
              { key: 'desliga', emoji: '🎧', text: 'Eu travo. Vira ruído na minha cabeça.' },
              { key: 'solta', emoji: '📝', text: 'Pego palavra solta, mas perco o sentido.' },
              { key: 'responder', emoji: '💬', text: 'Entendo bem. Travo é na hora de responder.' },
              { key: 'pega_bem', emoji: '✅', text: 'Acompanho 90%. Só me ferro com gíria.' },
            ]}
            onPick={handleQ1}
          />}

          {step === 2 && <QScreen
            key="q2"
            pre="Pergunta 2 · o tempo"
            title="Há quanto tempo você tenta destravar — e chega no mesmo lugar?"
            sub="Conta tudo: escola, cursinho, app, professor particular, YouTube."
            options={[
              { key: 'menos_1', emoji: '🌱', text: 'Menos de 1 ano (tô começando)' },
              { key: '2_5', emoji: '🙃', text: 'Entre 2 e 5 anos' },
              { key: '6_12', emoji: '😤', text: 'Entre 6 e 12 anos' },
              { key: '12_mais', emoji: '🤯', text: 'Mais de 12 anos (e ainda travo)' },
            ]}
            onPick={handleQ2}
          />}

          {step === 3 && <ProphecyStartScreen timeLabel={timeLabel} onNext={goNext} />}

          {step === 4 && <QScreen
            key="q3"
            pre="Pergunta 3 · o destino"
            title="Imagina 45 dias a partir de hoje. Você destravou. O que mudou?"
            sub="Qual cena te bate mais?"
            options={[
              { key: 'serie', emoji: '🎬', text: 'Tô vendo série sem legenda enquanto janto' },
              { key: 'trabalho', emoji: '💼', text: 'Entrei numa call em inglês sem suar frio' },
              { key: 'viagem', emoji: '✈️', text: 'Pedi café em NY e o cara entendeu' },
              { key: 'filhos', emoji: '👨‍👧', text: 'Meu filho pediu ajuda no inglês — e eu respondi' },
            ]}
            onPick={handleQ3}
          />}

          {step === 5 && <QScreen
            key="q4"
            pre="Pergunta 4 · o preço"
            title="Pra chegar lá tem um preço: 15min por dia, todo dia, 45 dias. Pra você, isso é…"
            sub="A resposta certa não existe. Só a verdadeira."
            options={[
              { key: 'pouco', emoji: '🔥', text: 'Pouco. Bora agora.' },
              { key: 'justo', emoji: '💪', text: 'Justo. Dá pra fazer.' },
              { key: 'pesado', emoji: '😬', text: 'Pesado. Mas eu encaro.' },
              { key: 'nope', emoji: '🚫', text: 'Muito. Eu desisto.' },
            ]}
            onPick={handleQ4}
          />}

          {step === 6 && a4 === 'nope' && <GoodbyeScreen />}

          {step === 6 && a4 !== 'nope' && <QScreen
            key="q5"
            pre="Pergunta 5 · a última"
            title="Se eu te mostrasse agora o motivo exato do teu travamento… você ia parar no meio, ou ia ver até o fim?"
            sub="(não tem resposta certa. só honesta.)"
            options={[
              { key: 'inteiro', emoji: '👀', text: 'Ver inteiro. Preciso saber.' },
              { key: 'depende', emoji: '🤨', text: 'Depende. Se for enrolação, fecho.' },
              { key: 'so_comeco', emoji: '🤷', text: 'Só o começo. Veja se me prende.' },
            ]}
            onPick={handleQ5}
          />}

          {step === 7 && <ProphecyFullScreen
            archetype={archetype}
            bucket={bucket}
            timeLabel={timeLabel}
            onNext={goNext}
          />}

          {step === 8 && <PactScreen timeLabel={timeLabel} onSign={goToVsl} />}

        </div>
      </div>
    </main>
  )
}

// ═══ TELA 0 — LANDING ═══
function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="q-fade">
      <div style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: '#A78BFA',
        background: 'rgba(167,139,250,0.08)',
        border: '1px solid rgba(167,139,250,0.2)',
        padding: '5px 12px',
        borderRadius: '100px',
        marginBottom: '18px',
      }}>
        Diagnóstico · 60 segundos
      </div>

      <h1 style={{
        fontSize: 'clamp(28px, 7vw, 42px)',
        fontWeight: 900,
        lineHeight: 1.05,
        letterSpacing: '-0.025em',
        marginBottom: '18px',
        color: '#fff',
      }}>
        Em 60 segundos eu descubro exatamente <span style={{ background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>o que vai passar na tua cabeça</span> nos 12 minutos do meu vídeo.
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.55,
        marginBottom: '22px',
      }}>
        5 perguntas. Eu escrevo uma <strong style={{ color: '#fff' }}>profecia</strong> do teu perfil — o que vai bater em você no minuto 2, no 5, no 9. Se eu errar qualquer coisa, tu fecha e some. Se eu acertar, tu vai <em style={{ fontStyle: 'normal', color: '#4ECDC4' }}>querer</em> ver até o fim.
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '26px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
          <span style={{ color: '#4ECDC4' }}>✓</span> Sem cadastro
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
          <span style={{ color: '#4ECDC4' }}>✓</span> Sem email nem WhatsApp
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
          <span style={{ color: '#4ECDC4' }}>✓</span> Sem vendinha chata
        </div>
      </div>

      <button
        onClick={onStart}
        type="button"
        className="q-cta"
        style={{
          width: '100%',
          padding: '22px',
          background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
          border: 'none',
          borderRadius: '14px',
          color: '#000',
          fontSize: '16px',
          fontWeight: 900,
          fontFamily: 'inherit',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          minHeight: '64px',
          boxShadow: '0 0 30px rgba(78,205,196,0.3)',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        Começar · 60s
      </button>

      <p style={{
        marginTop: '16px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        não é pra todo mundo.<br/>só pra quem tá cansado de travar.
      </p>
    </div>
  )
}

// ═══ TELA GENÉRICA DE PERGUNTA ═══
function QScreen({ pre, title, sub, options, onPick }: {
  pre: string
  title: string
  sub: string
  options: ReadonlyArray<{ key: string; emoji: string; text: string }>
  onPick: (key: string) => void
}) {
  return (
    <div className="q-fade">
      <div style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(167,139,250,0.85)',
        marginBottom: '12px',
      }}>
        {pre}
      </div>
      <h1 style={{
        fontSize: 'clamp(22px, 5.5vw, 30px)',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.015em',
        marginBottom: '10px',
        color: '#fff',
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '22px',
        lineHeight: 1.55,
        fontStyle: 'italic',
      }}>
        {sub}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {options.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onPick(opt.key)}
            className="q-option"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '18px 18px',
              fontSize: '15px',
              color: 'rgba(255,255,255,0.92)',
              fontFamily: 'inherit',
              fontWeight: 500,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background 0.18s ease, border-color 0.18s ease, transform 0.1s ease',
              minHeight: '62px',
              width: '100%',
              outline: 'none',
            }}
          >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>{opt.emoji}</span>
            <span style={{ lineHeight: 1.35 }}>{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══ TELA 3 — PROFECIA PARTE 1 (aparece depois de Q2) ═══
function ProphecyStartScreen({ timeLabel, onNext }: { timeLabel: string; onNext: () => void }) {
  return (
    <div className="q-fade">
      <div style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: '#A78BFA',
        marginBottom: '14px',
      }}>
        A profecia · parte 1
      </div>

      <h1 style={{
        fontSize: 'clamp(24px, 6vw, 32px)',
        fontWeight: 900,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        marginBottom: '18px',
        color: '#fff',
      }}>
        Seu cérebro tá rodando um <span style={{ color: '#4ECDC4' }}>programa errado</span> há {timeLabel}.
      </h1>

      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '20px' }}>
        Não é preguiça. Não é falta de inteligência. É só um software errado que nunca ninguém te disse pra trocar.
      </p>

      <p style={{ fontSize: '16px', color: '#fff', lineHeight: 1.6, marginBottom: '18px', fontWeight: 600 }}>
        Nos próximos 12 minutos do meu vídeo, você vai passar por 4 estados. Eu vou te dizer AGORA qual é cada um:
      </p>

      <div style={{
        background: 'linear-gradient(135deg, rgba(78,205,196,0.06), rgba(167,139,250,0.04))',
        border: '1px solid rgba(78,205,196,0.2)',
        borderRadius: '16px',
        padding: '22px 22px',
        marginBottom: '24px',
      }}>
        <Beat t="Minuto 0–2" punch="&quot;mais um coach de inglês da internet, já vi isso antes&quot;" />
        <Beat t="Minuto 3–5" punch="&quot;espera… caralho, isso faz muito sentido&quot;" />
        <Beat t="Minuto 6–9" punch="&quot;por que ninguém me contou isso nos últimos anos?&quot;" />
        <Beat t="Minuto 10–12" punch="&quot;ok. eu vou fazer isso.&quot;" last />
      </div>

      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '22px' }}>
        Faltam 3 perguntas pra eu completar tua profecia — com o <strong style={{ color: '#fff' }}>nome do teu perfil exato</strong> e os momentos específicos do vídeo que vão bater em você.
      </p>

      <button
        onClick={onNext}
        type="button"
        className="q-cta"
        style={{
          width: '100%',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(167,139,250,0.15))',
          border: '1px solid rgba(78,205,196,0.45)',
          borderRadius: '12px',
          color: '#4ECDC4',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'inherit',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          minHeight: '62px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          transition: 'transform 0.1s ease',
        }}
      >
        Continuar a profecia →
      </button>
    </div>
  )
}

function Beat({ t, punch, last }: { t: string; punch: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        flexShrink: 0,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#4ECDC4',
        width: '88px',
        paddingTop: '4px',
      }}>{t}</div>
      <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, fontStyle: 'italic' }}>
        {punch}
      </div>
    </div>
  )
}

// ═══ DESPEDIDA DIGNA (se marcou "desisto") ═══
function GoodbyeScreen() {
  return (
    <div className="q-fade" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>👋</div>
      <h1 style={{
        fontSize: 'clamp(24px, 6vw, 32px)',
        fontWeight: 800,
        lineHeight: 1.2,
        marginBottom: '16px',
        color: '#fff',
      }}>
        Resposta honesta. Respeitado.
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '24px' }}>
        15 minutos por dia pra destravar inglês não é pra todo mundo agora — e tudo bem.
      </p>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
        Quando for o momento certo, volta aqui.<br/>A porta fica aberta.
      </p>
    </div>
  )
}

// ═══ TELA 7 — PROFECIA COMPLETA ═══
function ProphecyFullScreen({ archetype, bucket, timeLabel, onNext }: {
  archetype: typeof ARCHETYPE[Bucket]
  bucket: Bucket
  timeLabel: string
  onNext: () => void
}) {
  return (
    <div className="q-fade">
      <div style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: '#A78BFA',
        marginBottom: '14px',
      }}>
        A profecia · completa
      </div>

      <h1 style={{
        fontSize: 'clamp(22px, 5.5vw, 28px)',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.015em',
        marginBottom: '8px',
        color: 'rgba(255,255,255,0.75)',
      }}>
        Teu perfil exato:
      </h1>

      <h2 style={{
        fontSize: 'clamp(26px, 6.5vw, 34px)',
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        marginBottom: '20px',
        color: '#fff',
      }}>
        Você é <span style={{ background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{archetype.name}</span>
      </h2>

      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: '26px' }}>
        {archetype.pegada} E você carrega isso há <strong style={{ color: '#fff' }}>{timeLabel}</strong>.
      </p>

      <div style={{
        fontSize: '15px',
        color: '#fff',
        fontWeight: 600,
        lineHeight: 1.5,
        marginBottom: '14px',
      }}>
        No meu vídeo de 12 minutos, 3 momentos específicos vão bater em você:
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(78,205,196,0.08), rgba(167,139,250,0.06))',
        border: '1px solid rgba(78,205,196,0.25)',
        borderRadius: '16px',
        padding: '22px 22px',
        marginBottom: '22px',
        boxShadow: '0 0 40px rgba(78,205,196,0.08)',
      }}>
        {archetype.beats.map((b, i) => (
          <div key={i} style={{
            padding: '12px 0',
            borderBottom: i === archetype.beats.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#4ECDC4',
              marginBottom: '4px',
            }}>
              🎯 {b.t}
            </div>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
              {b.punch}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: '22px' }}>
        Mas eu tenho <strong style={{ color: '#fff' }}>uma regra</strong> antes de liberar o vídeo.
      </p>

      <button
        onClick={onNext}
        type="button"
        className="q-cta"
        style={{
          width: '100%',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'inherit',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          minHeight: '60px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          transition: 'transform 0.1s ease',
        }}
      >
        Qual a regra? →
      </button>
    </div>
  )
}

// ═══ TELA 8 — O PACTO ═══
function PactScreen({ timeLabel, onSign }: { timeLabel: string; onSign: () => void }) {
  return (
    <div className="q-fade">
      <div style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: '#A78BFA',
        marginBottom: '14px',
      }}>
        Regra única
      </div>

      <h1 style={{
        fontSize: 'clamp(26px, 6.5vw, 36px)',
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: '-0.025em',
        marginBottom: '20px',
        color: '#fff',
      }}>
        O vídeo só se revela <span style={{ background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pra quem assiste inteiro.</span>
      </h1>

      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '14px' }}>
        <strong style={{ color: '#fff' }}>97% das pessoas</strong> fecham VSL antes do minuto 6 — exatamente antes da parte que transforma.
      </p>

      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '14px' }}>
        Não é culpa delas. É hábito.
      </p>

      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '26px' }}>
        Mas você já passou <strong style={{ color: '#fff' }}>{timeLabel}</strong> travando no mesmo lugar. Se fechar de novo no minuto 5, a história se repete.
      </p>

      <div style={{
        background: 'linear-gradient(135deg, rgba(78,205,196,0.1), rgba(167,139,250,0.08))',
        border: '2px solid rgba(78,205,196,0.35)',
        borderRadius: '18px',
        padding: '28px 26px',
        marginBottom: '22px',
        boxShadow: '0 0 60px rgba(78,205,196,0.12)',
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#4ECDC4',
          marginBottom: '14px',
          textAlign: 'center',
        }}>
          ✍️ O Pacto dos 12 Minutos
        </div>

        <p style={{ fontSize: '16px', color: '#fff', lineHeight: 1.65, marginBottom: '12px', fontWeight: 600 }}>
          Eu, que chego até aqui,
        </p>
        <p style={{ fontSize: '16px', color: '#fff', lineHeight: 1.65, marginBottom: '12px' }}>
          me comprometo com <em style={{ color: '#4ECDC4', fontStyle: 'normal', fontWeight: 700 }}>uma coisa</em>:
        </p>
        <p style={{ fontSize: '19px', color: '#fff', lineHeight: 1.45, marginBottom: '16px', fontWeight: 800 }}>
          Vou assistir os 12 minutos inteiros.
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontStyle: 'italic' }}>
          Porque se minha fluência fosse chegar sozinha,<br/>já teria chegado nos últimos {timeLabel}.
        </p>
      </div>

      <button
        onClick={onSign}
        type="button"
        className="q-cta q-pulse"
        style={{
          width: '100%',
          padding: '24px',
          background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
          border: 'none',
          borderRadius: '14px',
          color: '#000',
          fontSize: '17px',
          fontWeight: 900,
          fontFamily: 'inherit',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          minHeight: '70px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          transition: 'transform 0.1s ease',
        }}
      >
        ✓ Eu prometo · Ver o vídeo
      </button>

      <p style={{
        marginTop: '14px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        se você não se compromete, fecha essa aba.<br/>a gente não força ninguém.
      </p>
    </div>
  )
}
