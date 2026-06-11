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

// ─── PERGUNTAS (autodiagnóstico — cada resposta é uma confissão) ─────
const Q1 = {
  title: 'Há quanto tempo você tenta aprender inglês?',
  options: [
    { k: 'novo', label: 'Menos de 1 ano', audio: 'q1_short' as LineId },
    { k: '1a5', label: 'De 1 a 5 anos', audio: 'q1_long' as LineId },
    { k: '5mais', label: 'Mais de 5 anos', audio: 'q1_long' as LineId },
    { k: 'vida', label: 'A vida inteira 🫠', audio: 'q1_long' as LineId },
  ],
}
const Q2 = {
  title: 'Quando um nativo fala com você, o que acontece?',
  options: [
    { k: 'embolou', label: 'Embola tudo — não pego quase nada', audio: 'q2_embolou' as LineId },
    { k: 'soltas', label: 'Pego palavras soltas e perco o fio', audio: 'q2_soltas' as LineId },
    { k: 'travo', label: 'Entendo… mas TRAVO na hora de responder', audio: 'q2_travo' as LineId },
  ],
}
const Q3 = {
  title: 'Quantas vezes você já começou e desistiu?',
  options: [
    { k: 'zero', label: 'Essa é minha primeira tentativa', audio: 'q3' as LineId },
    { k: '2a3', label: '2 ou 3 vezes', audio: 'q3' as LineId },
    { k: 'muitas', label: 'Já perdi a conta 😅', audio: 'q3' as LineId },
  ],
}
const Q4 = {
  title: 'No fundo, o que você acha que te falta?',
  options: [
    { k: 'vocab', label: 'Vocabulário', audio: 'q4' as LineId },
    { k: 'gram', label: 'Gramática', audio: 'q4' as LineId },
    { k: 'coragem', label: 'Coragem de falar', audio: 'q4' as LineId },
    { k: 'constancia', label: 'Constância', audio: 'q4' as LineId },
  ],
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

const BELIEF_LINE: Record<string, string> = {
  vocab: 'E você marcou que falta vocabulário — faz sentido. Só que a forma mais rápida de ganhar vocabulário que GRUDA é pelo ouvido: palavra ouvida em cena real nunca mais escapa.',
  gram: 'E você marcou que falta gramática — faz sentido. Só que gramática gruda quando a frase vira SOM familiar: você passa a falar certo sem pensar na regra.',
  coragem: 'E você marcou que falta coragem — faz sentido. Só que coragem vem sozinha quando você ENTENDE o que ouve: ninguém trava quando o ouvido não embola.',
  constancia: 'E você marcou que falta constância — faz sentido. Só que constância fica fácil quando o treino tem 3 minutos e é com a SUA série favorita, não com apostila.',
}

const YEARS_LINE: Record<string, string> = {
  novo: 'Você chegou cedo — vai pular anos de tentativa errada.',
  '1a5': 'Anos tentando não é falta de capacidade. É método errado apontado pra pessoa certa.',
  '5mais': 'Mais de 5 anos tentando não é falta de capacidade. É método errado apontado pra pessoa certa.',
  vida: 'A vida inteira tentando não é falta de capacidade. É método errado apontado pra pessoa certa.',
}

type Step = 'q1' | 'q2' | 'mid' | 'q3' | 'q4' | 'calc' | 'gate' | 'result'
const PROGRESS: Record<Step, number> = { q1: 12, q2: 30, mid: 45, q3: 58, q4: 72, calc: 84, gate: 92, result: 100 }

export default function QuizBridge() {
  const [step, setStep] = useState<Step>('q1')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [captionId, setCaptionId] = useState<LineId | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [calcN, setCalcN] = useState(0)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [leadErr, setLeadErr] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stepRef = useRef<Step>('q1')
  stepRef.current = step

  const archetype = ARCHETYPES[answers.q2] || ARCHETYPES.embolou

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
          email: e, phone: p, bucket: answers.q2 || 'unknown', answers, utms,
          fbc: fb.fbc, fbp: fb.fbp, ua: navigator.userAgent, eventId: genEventId(),
        }),
      })
      try { frTrack('lead_submit', answers.q2) } catch {}
    } catch {
      // lead é importante, mas NUNCA bloqueia o diagnóstico
    }
    setSending(false)
    goResult()
  }

  const goResult = () => {
    try { frTrack('result_view', answers.q2 || 'unknown') } catch {}
    setStep('result')
    speak(archetype.audio)
  }

  const vslUrl = buildVslUrl(answers.q2 || 'x')

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

        {/* ─── PERGUNTAS ─────────────────────────────────────────── */}
        {step === 'q1' && <Question n={1} title={Q1.title} options={Q1.options} onPick={(k, a) => answer('q1', k, a, 'q2')} />}
        {step === 'q2' && <Question n={2} title={Q2.title} options={Q2.options} onPick={(k, a) => answer('q2', k, a, 'mid')} />}

        {/* ─── INTERSTITIAL de prova (padrão Noom) ───────────────── */}
        {step === 'mid' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center' }}>
            <div style={{ background: C.violetSoft, border: `1px solid ${C.violet}22`, borderRadius: 18, padding: '28px 22px', marginBottom: 18 }}>
              <p style={{ fontSize: 52, fontWeight: 900, color: C.violet, letterSpacing: '-0.04em', lineHeight: 1 }}>9 em 10</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.5, maxWidth: 360, margin: '12px auto 0' }}>
                adultos com esse mesmo sintoma têm um único bloqueio em comum — e ele se resolve com <strong style={{ color: C.violet }}>treino de ouvido</strong>, não com mais estudo.
              </p>
            </div>
            <button onClick={() => { try { frTrack('mid_continue') } catch {}; setStep('q3') }} style={btnPrimary}>
              Continuar →
            </button>
          </section>
        )}

        {step === 'q3' && <Question n={3} title={Q3.title} options={Q3.options} onPick={(k, a) => answer('q3', k, a, 'q4')} />}
        {step === 'q4' && <Question n={4} title={Q4.title} options={Q4.options} onPick={(k, a) => answer('q4', k, a, 'calc')} />}

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
                {BELIEF_LINE[answers.q4] || BELIEF_LINE.vocab}
              </p>
              <p style={{
                fontSize: 14, fontWeight: 700, color: C.violet, lineHeight: 1.5, marginTop: 14,
                background: C.violetSoft, borderRadius: 12, padding: '12px 14px', textAlign: 'left',
              }}>
                💜 {YEARS_LINE[answers.q1] || YEARS_LINE['1a5']}
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
