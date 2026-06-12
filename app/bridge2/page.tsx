'use client'

// ═══════════════════════════════════════════════════════════════════
//  /bridge2 — QUIZ DIAGNÓSTICO pré-VSL (o formato mais validado do
//  nicho: getfluently/Noom/BetterMe) + a alma da Manu por áudio.
//  Padrões de mercado aplicados: pergunta na PRIMEIRA tela (zero
//  landing), 1 tap + auto-avanço, barra de progresso, interstitial de
//  prova após a pergunta-chave, tela "calculando" (labor illusion),
//  email+WhatsApp gate ANTES do resultado (Lead CAPI), diagnóstico
//  NOMEADO que valida a crença do usuário A FAVOR (regra da alma da
//  Manu) e aponta o mecanismo → VSL.
//  Consciência por AUTODIAGNÓSTICO, nunca por aula (insight Marcos).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react'
import { trackViewContent, getFbCookies, genEventId } from '../lib/pixel'
import { createTracker } from '../lib/funnel-track'
import ManuOrb from '../bridge/ManuOrb'
import LINES from './manu-quiz-lines.json'

const frTrack = createTracker({ funnel: 'ingles', page: 'bridge2', variant: 'C' })

type LineId = keyof typeof LINES

const C = {
  bg: '#ffffff',
  bgSoft: '#f6f5fb',
  ink: '#191427',
  dim: '#8b8499',
  violet: '#7c5cff',
  violetD: '#6438f5',
  violetSoft: '#efeaff',
  green: '#16b364',
  border: 'rgba(25,20,39,.08)',
  shadow: '0 18px 50px -16px rgba(40,22,98,.20)',
  shadowSm: '0 6px 22px -8px rgba(40,22,98,.14)',
}
const FONT = "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif"

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'fbclid'] as const

function buildVslUrl(archetype: string): string {
  if (typeof window === 'undefined') return '/vsl'
  const params = new URLSearchParams(window.location.search)
  const url = new URL('/vsl', window.location.origin)
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) url.searchParams.set(k, v)
  })
  if (!url.searchParams.get('utm_content')) url.searchParams.set('utm_content', 'quiz')
  url.searchParams.set('qd', archetype)
  return url.pathname + url.search
}

// ─── PERGUNTAS (molde Poli: DESEJO → interesses → dores → diagnóstico;
//     cada pergunta tem uma tela que a justifica e conecta a uma feature) ──
const Q_GOAL = {
  title: 'Qual é o seu principal objetivo com o inglês?',
  options: [
    { k: 'viajar', label: '🌎 Viajar e me virar com segurança', audio: 'r_goal' as LineId },
    { k: 'carreira', label: '💼 Crescer na carreira ou emprego melhor', audio: 'r_goal' as LineId },
    { k: 'conversar', label: '🗣️ Conversar com confiança no dia a dia', audio: 'r_goal' as LineId },
    { k: 'consumir', label: '📺 Entender séries, filmes e conteúdos', audio: 'r_goal' as LineId },
  ],
}
const TOPICS = [
  '📈 Negócios e dinheiro', '🧠 Psicologia e autoconhecimento', '🌎 Viagens e culturas',
  '💪 Saúde e bem-estar', '💻 Tecnologia', '⚽ Esportes', '🎵 Música e entretenimento',
  '👥 Família e educação', '🎮 Games', '🔍 Curiosidades no geral',
]
const BLOCKS = {
  title: 'O que mais te impede de falar inglês hoje?',
  sub: '(pode marcar mais de uma)',
  options: [
    { k: 'travo', label: '😶 Entendo bem, mas travo na hora de falar' },
    { k: 'vergonha', label: '😰 Vergonha ou medo de errar' },
    { k: 'traduzir', label: '🤯 Penso em português e me enrolo traduzindo' },
    { k: 'esqueco', label: '🧠 Já estudei, mas esqueço tudo' },
    { k: 'praticar', label: '🙅 Nunca tenho com quem praticar' },
    { k: 'rotina', label: '🕐 Rotina corrida, não mantenho o ritmo' },
    { k: 'desisto', label: '😔 Já tentei vários métodos e desisti' },
  ],
}
const Q_NATIVE = {
  title: 'E quando um nativo fala com você, o que acontece?',
  options: [
    { k: 'embolou', label: 'Embola tudo — não pego quase nada', audio: 'q2_embolou' as LineId },
    { k: 'soltas', label: 'Pego palavras soltas e perco o fio', audio: 'q2_soltas' as LineId },
    { k: 'travo', label: 'Entendo… mas TRAVO na hora de responder', audio: 'q2_travo' as LineId },
  ],
}
const GOAL_LABEL: Record<string, string> = {
  viajar: 'viajar com segurança',
  carreira: 'destravar sua carreira',
  conversar: 'conversar com confiança',
  consumir: 'entender tudo sem legenda',
}

// ─── DIAGNÓSTICO (por Q2) — valida a crença (Q4) SEMPRE a favor ──────
const ARCHETYPES: Record<string, { name: string; emoji: string; desc: string; audio: LineId }> = {
  embolou: {
    name: 'Ouvido Embolado',
    emoji: '🌀',
    desc: 'O nativo emenda as palavras numa coisa só — e ninguém nunca treinou seu cérebro pra separar esses sons. Você conhece as palavras. Seu ouvido é que nunca foi treinado pra reconhecê-las na velocidade real.',
    audio: 'res_embolou',
  },
  soltas: {
    name: 'Ouvido Picado',
    emoji: '🧩',
    desc: 'Você reconhece palavras — mas o seu ouvido nunca foi treinado pra pegar a EMENDA entre elas. E é na emenda que o inglês falado de verdade acontece. Por isso você pega o começo e perde o fio.',
    audio: 'res_soltas',
  },
  travo: {
    name: 'Boca Travada',
    emoji: '🔒',
    desc: 'Seu caso é mais avançado do que você imagina: o cérebro entende, mas nunca AUTOMATIZOU a resposta. Você monta a frase na cabeça enquanto a conversa já foi embora. Falta automação, não conhecimento.',
    audio: 'res_travo',
  },
}

// crença SEMPRE a favor — escolhida pela 1ª dor marcada
const BELIEF_LINE: Record<string, string> = {
  travo: 'E você marcou que trava na hora de falar — faz todo sentido: travar não é falta de inglês, é falta de PRÁTICA de resposta. Reflexo só vem conversando.',
  vergonha: 'E você marcou a vergonha de errar — faz todo sentido. Por isso o seu treino começa num lugar onde NINGUÉM te julga: você erra à vontade até a confiança chegar.',
  traduzir: 'E você marcou que traduz na cabeça — faz todo sentido: isso some quando a frase vira SOM familiar, e som familiar vem de repetição e prática real.',
  esqueco: 'E você marcou que esquece o que estuda — faz todo sentido: o que você USA numa conversa, o cérebro guarda. O que só lê, ele descarta.',
  praticar: 'E você marcou que nunca tem com quem praticar — e é EXATAMENTE essa a raiz de tudo. Resolvendo isso, o resto destrava em cadeia.',
  rotina: 'E você marcou a rotina corrida — faz todo sentido. Por isso o seu treino cabe em 15 minutos, na fila, no trânsito, na louça.',
  desisto: 'E você marcou que já desistiu antes — faz todo sentido: desistir de método chato é instinto de sobrevivência, não fraqueza.',
}

type Step = 'intro' | 'social' | 'q_goal' | 'pact' | 'topics' | 'sci' | 'blocks' | 'q_native' | 'calc' | 'gate' | 'result'
const PROGRESS: Record<Step, number> = { intro: 6, social: 14, q_goal: 26, pact: 38, topics: 50, sci: 60, blocks: 72, q_native: 82, calc: 90, gate: 95, result: 100 }

export default function QuizBridge() {
  const [step, setStep] = useState<Step>('intro')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [topics, setTopics] = useState<string[]>([])
  const [blocks, setBlocks] = useState<string[]>([])
  const [captionId, setCaptionId] = useState<LineId | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [calcN, setCalcN] = useState(0)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [leadErr, setLeadErr] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stepRef = useRef<Step>('intro')
  stepRef.current = step

  const archetype = ARCHETYPES[answers.q_native] || ARCHETYPES.embolou

  useEffect(() => {
    try { trackViewContent('quiz-bridge') } catch {}
    try { frTrack('pageview') } catch {}
    // humano real: 3s+ com aba visível (régua padrão das bridges)
    let t: number | null = null
    let fired = false
    const arm = () => {
      if (fired) return
      if (document.visibilityState === 'visible' && t === null) {
        t = window.setTimeout(() => { fired = true; try { frTrack('gate_seen') } catch {} }, 3000)
      } else if (document.visibilityState !== 'visible' && t !== null) {
        clearTimeout(t)
        t = null
      }
    }
    arm()
    document.addEventListener('visibilitychange', arm)
    return () => {
      document.removeEventListener('visibilitychange', arm)
      if (t) clearTimeout(t)
    }
  }, [])

  // reação da Manu: NUNCA bloqueia o avanço (toca por cima da próxima tela)
  const speak = useCallback((id: LineId) => {
    setCaptionId(id)
    setSpeaking(true)
    const a = audioRef.current
    if (!a) return
    a.onended = () => setSpeaking(false)
    a.onerror = () => setSpeaking(false)
    a.src = `/bridge2/manu/${id}.mp3`
    a.play().catch(() => setSpeaking(false))
  }, [])

  const answer = (q: string, k: string, audio: LineId, next: Step) => {
    setAnswers(p => ({ ...p, [q]: k }))
    try { frTrack(q, k) } catch {}
    speak(audio)
    // micro-delay: a seleção pinta antes da próxima pergunta entrar
    setTimeout(() => setStep(next), 450)
  }

  // tela "calculando" — labor illusion (3 checks sequenciais)
  useEffect(() => {
    if (step !== 'calc') return
    setCalcN(0)
    const t1 = setTimeout(() => setCalcN(1), 800)
    const t2 = setTimeout(() => setCalcN(2), 1700)
    const t3 = setTimeout(() => setCalcN(3), 2600)
    const t4 = setTimeout(() => setStep('gate'), 3300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [step])

  // updater funcional: dois toques rápidos não podem se sobrescrever
  const toggleMulti = (set: React.Dispatch<React.SetStateAction<string[]>>, k: string) => {
    set(prev => (prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]))
  }

  const submitLead = async (skip = false) => {
    if (skip) {
      try { frTrack('lead_skip') } catch {}
      goResult()
      return
    }
    const e = email.trim().toLowerCase()
    const p = phone.replace(/\D/g, '')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setLeadErr('Confere o email aí 👀'); return }
    if (p.length < 10) { setLeadErr('Coloca o WhatsApp com DDD'); return }
    setSending(true)
    setLeadErr('')
    try {
      const fb = getFbCookies()
      const utms: Record<string, string> = {}
      try {
        const sp = new URLSearchParams(window.location.search)
        UTM_KEYS.forEach(k => { const v = sp.get(k); if (v) utms[k] = v })
      } catch {}
      await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: e, phone: p, bucket: answers.q_native || 'unknown',
          answers: { ...answers, topics: topics.join(','), blocks: blocks.join(',') }, utms,
          fbc: fb.fbc, fbp: fb.fbp, ua: navigator.userAgent, eventId: genEventId(),
        }),
      })
      try { frTrack('lead_submit', answers.q_native) } catch {}
    } catch {
      // lead é importante, mas NUNCA bloqueia o diagnóstico
    }
    setSending(false)
    goResult()
  }

  const goResult = () => {
    try { frTrack('result_view', answers.q_native || 'unknown') } catch {}
    setStep('result')
    speak(archetype.audio)
  }

  const vslUrl = buildVslUrl(answers.q_native || 'x')

  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: '100vh', fontFamily: FONT, letterSpacing: '-0.01em' }}>
      <style>{KEYFRAMES}</style>
      <audio ref={audioRef} playsInline />

      {/* progresso — completude puxa o quiz inteiro */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 5, background: C.bgSoft, zIndex: 90 }}>
        <div style={{ height: '100%', width: `${PROGRESS[step]}%`, background: `linear-gradient(90deg, ${C.violet}, ${C.violetD})`, transition: 'width .6s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      <header style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 520, margin: '0 auto' }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: C.ink }}>Fluency Route</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: C.dim }}>Diagnóstico · 1 min</span>
      </header>

      <main style={{ maxWidth: 520, margin: '0 auto', padding: '18px 20px 70px' }}>
        {/* barra da Manu — reage a cada confissão */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 18,
          padding: '13px 16px', marginBottom: 20, boxShadow: C.shadowSm, minHeight: 72,
        }}>
          <ManuOrb size={46} speaking={speaking} mood={step === 'result' ? 'celebrate' : 'idle'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: C.violet, marginBottom: 4 }}>
              Manu · professora
            </p>
            <p key={captionId || 'hi'} style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: C.ink, animation: 'fadeUp .3s ease' }}>
              {captionId ? LINES[captionId].text : 'Responde rapidinho que eu monto o diagnóstico do teu inglês. 4 perguntas. Zero julgamento… quer dizer, quase. 😏'}
            </p>
          </div>
        </div>

        {/* ─── 1. PROMESSA (molde Poli: experiência personalizada) ── */}
        {step === 'intro' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center', paddingTop: 8 }}>
            <h1 style={{ fontSize: 'clamp(26px, 6.4vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 10 }}>
              Descubra o que REALMENTE trava o seu inglês
            </h1>
            <p style={{ fontSize: 15.5, color: C.dim, fontWeight: 500, lineHeight: 1.5, maxWidth: 380, margin: '0 auto 20px' }}>
              A Manu monta uma avaliação personalizada do seu caso — e te diz o treino exato pra destravar. <strong style={{ color: C.ink }}>1 minuto. Ela não perdoa, mas também não erra.</strong>
            </p>
            <button onClick={() => { try { frTrack('intro_continue') } catch {}; setStep('social') }} style={btnPrimary}>
              Começar minha avaliação →
            </button>
            <p style={{ fontSize: 12, color: C.dim, marginTop: 12, fontWeight: 500 }}>grátis · 1 minuto · 🔊 com som fica melhor</p>
          </section>
        )}

        {/* ─── 2. PROVA SOCIAL antes de perguntar ───────────────────── */}
        {step === 'social' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center' }}>
            <div style={{ background: C.violetSoft, border: `1px solid ${C.violet}22`, borderRadius: 18, padding: '28px 22px', marginBottom: 18 }}>
              <p style={{ fontSize: 46, fontWeight: 900, color: C.violet, letterSpacing: '-0.04em', lineHeight: 1 }}>Milhares</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.5, maxWidth: 360, margin: '12px auto 0' }}>
                de brasileiros já destravaram o inglês com o método da Fluency Route. Agora a Manu — a 1ª IA de conversação em tempo real do Brasil — avalia o seu caso.
              </p>
            </div>
            <button onClick={() => { try { frTrack('social_continue') } catch {}; setStep('q_goal') }} style={btnPrimary}>
              Continuar →
            </button>
          </section>
        )}

        {/* ─── 3. DESEJO primeiro (não a dor) ───────────────────────── */}
        {step === 'q_goal' && <Question n={1} title={Q_GOAL.title} options={Q_GOAL.options} onPick={(k, a) => answer('q_goal', k, a, 'pact')} />}

        {/* ─── 4. PACTO ("me dá 4 semanas") ─────────────────────────── */}
        {step === 'pact' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center' }}>
            <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 18, padding: '28px 22px', marginBottom: 18 }}>
              <p style={{ fontSize: 38, lineHeight: 1, marginBottom: 10 }}>🤝</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.ink, lineHeight: 1.5, maxWidth: 360, margin: '0 auto' }}>
                Ótima escolha. Me dá <span style={{ color: C.violet }}>4 semanas de treino certo</span> que eu te coloco no caminho de {GOAL_LABEL[answers.q_goal] || 'destravar o inglês'}.
              </p>
            </div>
            <button onClick={() => { try { frTrack('pact_continue') } catch {}; speak('r_pact'); setStep('topics') }} style={btnPrimary}>
              Combinado 🤝
            </button>
          </section>
        )}

        {/* ─── 5. INTERESSES multi (alimenta a personalização) ─────── */}
        {step === 'topics' && (
          <section style={{ animation: 'fadeUp .35s ease' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>Pergunta 2 de 4</p>
            <h2 style={{ fontSize: 'clamp(21px, 5.2vw, 27px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
              Quais assuntos você AMA no dia a dia?
            </h2>
            <p style={{ fontSize: 13, color: C.dim, fontWeight: 500, marginBottom: 14 }}>(marca todos — a Manu vai usar isso nas suas conversas)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TOPICS.map(t => (
                <button key={t} onClick={() => toggleMulti(setTopics, t)} style={{
                  ...chipStyle,
                  background: topics.includes(t) ? C.violetSoft : C.bg,
                  borderColor: topics.includes(t) ? C.violet : C.border,
                }}>{t}</button>
              ))}
            </div>
            <button
              disabled={!topics.length}
              onClick={() => { try { frTrack('topics_continue', String(topics.length)) } catch {}; setStep('sci') }}
              style={{ ...btnPrimary, width: '100%', marginTop: 18, opacity: topics.length ? 1 : 0.4 }}>
              Continuar →
            </button>
          </section>
        )}

        {/* ─── 6. CIÊNCIA conectada à feature (truque Poli) ─────────── */}
        {step === 'sci' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center' }}>
            <div style={{ background: C.violetSoft, border: `1px solid ${C.violet}22`, borderRadius: 18, padding: '28px 22px', marginBottom: 18 }}>
              <p style={{ fontSize: 46, fontWeight: 900, color: C.violet, letterSpacing: '-0.04em', lineHeight: 1 }}>+47%</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.55, maxWidth: 370, margin: '12px auto 0' }}>
                é o quanto treinar com assuntos que você AMA acelera o aprendizado, segundo pesquisa do <em>English Language Teaching Journal</em>. Por isso a Manu vai puxar conversa sobre {topics.length ? 'os assuntos que você marcou' : 'os SEUS assuntos'} — não sobre apostila. ❤️
              </p>
            </div>
            <button onClick={() => { try { frTrack('sci_continue') } catch {}; speak('r_sci'); setStep('blocks') }} style={btnPrimary}>
              Continuar →
            </button>
          </section>
        )}

        {/* ─── 7. DORES multi ───────────────────────────────────────── */}
        {step === 'blocks' && (
          <section style={{ animation: 'fadeUp .35s ease' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>Pergunta 3 de 4</p>
            <h2 style={{ fontSize: 'clamp(21px, 5.2vw, 27px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
              {BLOCKS.title}
            </h2>
            <p style={{ fontSize: 13, color: C.dim, fontWeight: 500, marginBottom: 14 }}>{BLOCKS.sub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BLOCKS.options.map(o => (
                <button key={o.k} onClick={() => toggleMulti(setBlocks, o.k)} style={{
                  ...chipStyle, textAlign: 'left' as const, width: '100%',
                  background: blocks.includes(o.k) ? C.violetSoft : C.bg,
                  borderColor: blocks.includes(o.k) ? C.violet : C.border,
                }}>{o.label}</button>
              ))}
            </div>
            <button
              disabled={!blocks.length}
              onClick={() => { try { frTrack('blocks_continue', blocks.join('|').slice(0, 60)) } catch {}; speak('r_block'); setStep('q_native') }}
              style={{ ...btnPrimary, width: '100%', marginTop: 18, opacity: blocks.length ? 1 : 0.4 }}>
              Continuar →
            </button>
          </section>
        )}

        {/* ─── 8. DIAGNÓSTICO core (define o arquétipo) ─────────────── */}
        {step === 'q_native' && <Question n={4} title={Q_NATIVE.title} options={Q_NATIVE.options} onPick={(k, a) => answer('q_native', k, a, 'calc')} />}

        {/* ─── CALCULANDO (labor illusion) ────────────────────────── */}
        {step === 'calc' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center', paddingTop: 22 }}>
            <div style={{ width: 52, height: 52, border: `4px solid ${C.violetSoft}`, borderTopColor: C.violet, borderRadius: '50%', margin: '0 auto 26px', animation: 'spin 0.9s linear infinite' }} />
            {['Analisando suas respostas…', 'Identificando o seu bloqueio…', 'Montando seu diagnóstico…'].map((t, i) => (
              <p key={t} style={{
                fontSize: 15, fontWeight: 600, marginBottom: 12,
                color: calcN > i ? C.green : C.dim, opacity: calcN >= i ? 1 : 0.35,
                transition: 'all .4s ease',
              }}>
                {calcN > i ? '✓' : '·'} {t}
              </p>
            ))}
          </section>
        )}

        {/* ─── GATE — diagnóstico pronto, lead antes (email+zap) ──── */}
        {step === 'gate' && (
          <section style={{ animation: 'fadeUp .4s ease' }}>
            <h2 style={{ fontSize: 'clamp(24px, 5.8vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 8 }}>
              Seu diagnóstico está pronto 🔥
            </h2>
            <p style={{ fontSize: 14.5, color: C.dim, fontWeight: 500, textAlign: 'center', lineHeight: 1.5, maxWidth: 380, margin: '0 auto 20px' }}>
              Coloca seu melhor email e WhatsApp — além do diagnóstico, eu te mando o <strong style={{ color: C.ink }}>plano de 7 dias</strong> pra começar a destravar o ouvido.
            </p>
            <input
              type="email" inputMode="email" autoComplete="email" placeholder="Seu melhor email"
              value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
            />
            <input
              type="tel" inputMode="tel" autoComplete="tel" placeholder="WhatsApp com DDD"
              value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, marginTop: 10 }}
            />
            {leadErr && <p style={{ fontSize: 13, color: '#f04438', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>{leadErr}</p>}
            <button onClick={() => submitLead(false)} disabled={sending} style={{ ...btnPrimary, width: '100%', marginTop: 14, opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Salvando…' : 'Ver meu diagnóstico →'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 14 }}>
              <button onClick={() => submitLead(true)} style={linkGhost}>ver sem receber o plano</button>
            </p>
          </section>
        )}

        {/* ─── RESULTADO — diagnóstico nomeado + crença A FAVOR ───── */}
        {step === 'result' && (
          <section style={{ animation: 'fadeUp .4s ease' }}>
            <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20, padding: '26px 22px', textAlign: 'center', boxShadow: C.shadowSm, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.violet, marginBottom: 10 }}>
                Seu diagnóstico
              </p>
              <p style={{ fontSize: 40, lineHeight: 1, marginBottom: 6 }}>{archetype.emoji}</p>
              <p style={{ fontSize: 'clamp(26px, 6.4vw, 34px)', fontWeight: 900, letterSpacing: '-0.03em', color: C.ink, marginBottom: 12 }}>
                {archetype.name}
              </p>
              <p style={{ fontSize: 15, color: C.ink, fontWeight: 500, lineHeight: 1.6, textAlign: 'left' }}>
                {archetype.desc}
              </p>
              <p style={{ fontSize: 14.5, color: C.dim, fontWeight: 500, lineHeight: 1.6, textAlign: 'left', marginTop: 12 }}>
                {BELIEF_LINE[blocks[0]] || BELIEF_LINE.praticar}
              </p>
              <p style={{
                fontSize: 14, fontWeight: 700, color: C.violet, lineHeight: 1.5, marginTop: 14,
                background: C.violetSoft, borderRadius: 12, padding: '12px 14px', textAlign: 'left',
              }}>
                💜 O treino certo pra {GOAL_LABEL[answers.q_goal] || 'destravar seu inglês'} já existe — e usa {topics.length ? 'os assuntos que você marcou' : 'os seus assuntos favoritos'}. A aula abaixo mostra ele funcionando.
              </p>
            </div>

            {/* CTA — a aula é a prescrição do diagnóstico */}
            <aside style={{ background: C.ink, borderRadius: 20, padding: '30px 24px', textAlign: 'center', color: '#fff', boxShadow: C.shadow }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>
                A prescrição do seu caso
              </p>
              <p style={{ fontSize: 'clamp(20px, 4.8vw, 25px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: 8 }}>
                Uma aula mostra o <span style={{ color: '#b7a4ff' }}>treino exato</span> que resolve o seu bloqueio.
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', fontWeight: 500, lineHeight: 1.5, maxWidth: 340, margin: '0 auto 20px' }}>
                Gratuita, direto no navegador — e feita exatamente pra quem tem <strong style={{ color: '#fff' }}>{archetype.name.toLowerCase()}</strong>.
              </p>
              <a href={vslUrl} onClick={() => { try { frTrack('cta_click', answers.q2) } catch {}; try { (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.('trackCustom', 'BridgeCTAClick', { dest: 'vsl', src: 'quiz' }) } catch {} }} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: `linear-gradient(135deg, ${C.violet}, ${C.violetD})`, color: '#fff',
                fontWeight: 800, fontSize: 16, letterSpacing: '0.03em', textTransform: 'uppercase' as const,
                padding: '19px 28px', borderRadius: 14, textDecoration: 'none', width: '100%', maxWidth: 400,
                boxShadow: '0 14px 38px -10px rgba(124,92,255,.55)', animation: 'softPulse 2.4s ease-in-out infinite',
                fontFamily: FONT,
              }}>
                Assistir minha aula agora →
              </a>
            </aside>
          </section>
        )}
      </main>
    </div>
  )
}

// ─── COMPONENTES ─────────────────────────────────────────────────────

function Question({ n, title, options, onPick }: {
  n: number
  title: string
  options: { k: string; label: string; audio: LineId }[]
  onPick: (k: string, audio: LineId) => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <section style={{ animation: 'fadeUp .35s ease' }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>
        Pergunta {n} de 4
      </p>
      <h2 style={{ fontSize: 'clamp(22px, 5.4vw, 28px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 18 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(o => (
          <button
            key={o.k}
            onClick={() => { if (picked) return; setPicked(o.k); onPick(o.k, o.audio) }}
            style={{
              background: picked === o.k ? C.violetSoft : C.bg,
              border: `1.5px solid ${picked === o.k ? C.violet : C.border}`,
              borderRadius: 14, padding: '17px 18px', fontSize: 15.5, fontWeight: 700,
              color: C.ink, cursor: 'pointer', textAlign: 'left' as const,
              fontFamily: FONT, boxShadow: C.shadowSm, transition: 'all .15s ease',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  )
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  background: `linear-gradient(135deg, ${C.violet}, ${C.violetD})`, color: '#fff',
  fontWeight: 800, fontSize: 16, padding: '17px 28px', borderRadius: 14,
  border: 'none', cursor: 'pointer', boxShadow: '0 14px 38px -10px rgba(124,92,255,.5)', fontFamily: FONT,
}

const chipStyle: React.CSSProperties = {
  border: `1.5px solid ${C.border}`, borderRadius: 999, padding: '11px 16px',
  fontSize: 14.5, fontWeight: 700, color: C.ink, cursor: 'pointer',
  fontFamily: FONT, transition: 'all .12s ease', background: C.bg,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '16px 18px', fontSize: 16, fontWeight: 600,
  border: `1.5px solid ${C.border}`, borderRadius: 14, background: C.bg,
  color: C.ink, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' as const,
}

const linkGhost: React.CSSProperties = {
  background: 'none', border: 'none', color: C.dim, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, fontFamily: FONT,
}

const KEYFRAMES = `
@keyframes manuTalk { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(1); } }
@keyframes manuBlink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.08); } }
@keyframes manuBlob { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes manuRing { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(1.6); opacity: 0; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes softPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.018); } }
@keyframes spin { to { transform: rotate(360deg); } }
`
