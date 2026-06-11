'use client'

// ═══════════════════════════════════════════════════════════════════
//  /bridge — DEMO-APP guiado pela Manu (gravada, custo zero por visita)
//  A pessoa VIVE o mecanismo (listening → repetição → shadowing →
//  diagnóstico) enquanto a Manu narra o significado. A copy do antigo
//  advertorial virou fala dela. Uma cena só ("There's nothing to tell",
//  1ª fala de Friends S01E01): a forma da demo encarna a tese —
//  repetição concentrada > variedade. App nunca é explicado, só vivido.
//  Curiosity gap preservado: o NÚMERO de repetições só na VSL.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react'
import { trackViewContent } from '../lib/pixel'
import { createTracker } from '../lib/funnel-track'
import ManuOrb, { type ManuMood } from './ManuOrb'
import { usePronunciation, type PronResult } from './usePronunciation'
import LINES from './manu-lines.json'
import CAPTIONS from './manu-captions.json'

const frTrack = createTracker({ funnel: 'ingles', page: 'bridge', variant: 'B' })

type LineId = keyof typeof LINES

// ─── tema (identidade da Manu — a mesma que a pessoa encontra no app) ──
const C = {
  bg: '#ffffff',
  bgSoft: '#f6f5fb',
  ink: '#191427',
  dim: '#8b8499',
  violet: '#7c5cff',
  violetD: '#6438f5',
  violetSoft: '#efeaff',
  green: '#16b364',
  amber: '#f59e0b',
  red: '#f04438',
  border: 'rgba(25,20,39,.08)',
  shadow: '0 18px 50px -16px rgba(40,22,98,.20)',
  shadowSm: '0 6px 22px -8px rgba(40,22,98,.14)',
}
const FONT = "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif"

const SCENE_EN_1 = "There's nothing to tell."
const SCENE_EN_2 = "It's just some guy I work with."
const SCENE_PT = 'Não tem nada pra contar. É só um cara do trabalho.'
const SHADOW_TARGET = "There's nothing to tell."

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'fbclid'] as const

function buildVslUrl(content = 'bridge'): string {
  if (typeof window === 'undefined') return '/vsl'
  const params = new URLSearchParams(window.location.search)
  const url = new URL('/vsl', window.location.origin)
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) url.searchParams.set(k, v)
  })
  if (!url.searchParams.get('utm_content')) url.searchParams.set('utm_content', content)
  return url.pathname + url.search
}

type Step = 'gate' | 'play1' | 'honest' | 'play2' | 'play3' | 'play4' | 'shadow' | 'ab' | 'score' | 'denied'

const isPlayStep = (s: Step) => s === 'play1' || s === 'play2' || s === 'play3' || s === 'play4'

// raio-x de atleta: as 3 dimensões que a m_ab2 promete destrinchar
function diagDims(r: PronResult) {
  return [
    { label: 'Pronúncia', v: r.accuracy, tip: 'm_tip_pron' as LineId },
    { label: 'Ritmo', v: r.fluency, tip: 'm_tip_rhythm' as LineId },
    { label: 'Entonação', v: r.prosody, tip: 'm_tip_proso' as LineId },
  ].filter(d => d.v > 0)
}
// receita da tia: pior dimensão → fala pré-gravada; palavras fracas → texto dinâmico
function diagRecipe(r: PronResult) {
  const dims = diagDims(r)
  const worstDim = dims.length ? dims.reduce((a, b) => (b.v < a.v ? b : a)) : null
  const worstWords = r.words
    .filter(w => w.error !== 'Insertion' && w.accuracy < 80)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2)
  return { worstDim, worstWords }
}

const PROGRESS: Record<Step, number> = {
  gate: 0, play1: 12, honest: 25, play2: 40, play3: 52, play4: 64, shadow: 78, ab: 88, score: 100, denied: 100,
}

export default function BridgePage() {
  const [step, setStep] = useState<Step>('gate')
  const [captionId, setCaptionId] = useState<LineId | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [mood, setMood] = useState<ManuMood>('idle')
  const [sceneBusy, setSceneBusy] = useState(false)
  const [attempt, setAttempt] = useState(1)
  const [level, setLevel] = useState(0)
  const [res1, setRes1] = useState<PronResult | null>(null)
  const [res2, setRes2] = useState<PronResult | null>(null)
  const [myUrl, setMyUrl] = useState<string | null>(null)
  const [vslUrl, setVslUrl] = useState('/vsl')
  const [returning, setReturning] = useState(false)

  const manuRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const wavRef = useRef<Blob | null>(null)
  const preloadRef = useRef<HTMLAudioElement[]>([])
  const stepRef = useRef<Step>('gate')
  stepRef.current = step

  const pron = usePronunciation()

  useEffect(() => {
    setVslUrl(buildVslUrl())
    try { setReturning(localStorage.getItem('fr_bridge_done') === '1') } catch {}
    try { trackViewContent('bridge-rota') } catch {}
    try { frTrack('pageview') } catch {}
  }, [])

  // ─── motor de fala da Manu (MP3 estático + legenda sempre visível) ──
  const stopManu = useCallback(() => {
    const a = manuRef.current
    if (a) {
      a.onended = null
      a.onerror = null
      a.pause()
    }
    setSpeaking(false)
  }, [])

  const speak = useCallback((ids: LineId[], onDone?: () => void) => {
    stopManu()
    const queue = [...ids]
    const playNext = () => {
      const id = queue.shift()
      if (!id) {
        setSpeaking(false)
        onDone?.()
        return
      }
      setCaptionId(id)
      setSpeaking(true)
      const a = manuRef.current
      if (!a) { playNext(); return }
      let advanced = false
      const adv = () => {
        if (advanced) return
        advanced = true
        playNext()
      }
      a.onended = adv
      a.onerror = adv // áudio faltando NUNCA trava a jornada
      a.src = `/bridge/manu/${id}.mp3`
      a.play().catch(adv)
    }
    playNext()
  }, [stopManu])

  // ─── cena (um único <video>: áudio escondido nos plays, visível no reveal) ──
  const playScene = useCallback(() => {
    stopManu()
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.muted = false
    setSceneBusy(true)
    v.play().catch(() => setSceneBusy(false))
  }, [stopManu])

  const onSceneEnd = useCallback(() => {
    setSceneBusy(false)
    const s = stepRef.current
    if (s === 'play1') {
      try { frTrack('listen_done', '1') } catch {}
      setStep('honest')
      speak(['m_honest'])
    } else if (s === 'play2') {
      setStep('play3')
      speak(['m4'])
    } else if (s === 'play3') {
      setStep('play4')
      speak(['m6'])
    } else if (s === 'play4') {
      try { frTrack('loop_done') } catch {}
      setMood('happy')
      setStep('shadow')
      speak(['m7', 'm8', 'm9'])
    }
  }, [speak])

  // ─── beats ──────────────────────────────────────────────────────────
  const start = () => {
    try { frTrack('gate_click') } catch {}
    setStep('play1')
    speak(['m0', 'm1'])
    // aquece os assets com o gesto do usuário (autoplay liberado a partir daqui).
    // Só a sequência do listening (~1MB) — o resto carrega sob demanda; a
    // legenda aparece instantânea de qualquer jeito, 3.4MB de uma vez mata 4G.
    try { videoRef.current?.load() } catch {}
    try {
      const warm: LineId[] = ['m2_all', 'm2_some', 'm2_none', 'm3', 'm4', 'm6', 'm7']
      preloadRef.current = warm.map(id => {
        const a = new Audio()
        a.preload = 'auto'
        a.src = `/bridge/manu/${id}.mp3`
        return a
      })
    } catch {}
  }

  const answerHonest = (k: 'all' | 'some' | 'none') => {
    try { frTrack('honest_answer', k) } catch {}
    setMood(k === 'none' ? 'oops' : 'idle')
    setStep('play2')
    speak([`m2_${k}` as LineId, 'm3'])
  }

  const startRecording = async () => {
    stopManu()
    try { frTrack('shadow_start', String(attempt)) } catch {}
    const wav = await pron.record(8000, r => setLevel(r))
    setLevel(0)
    if (wav === 'denied') {
      try { frTrack('mic_denied') } catch {}
      setStep('denied')
      speak(['m_denied'])
      return
    }
    if (!wav) {
      speak(['m_err'])
      return
    }
    wavRef.current = wav
    if (myUrl) URL.revokeObjectURL(myUrl)
    setMyUrl(URL.createObjectURL(wav))
    try { frTrack('rec_done', String(attempt)) } catch {}
    if (attempt === 1) {
      setStep('ab')
      setMood('celebrate')
      speak(['m_ab', 'm_ab2'])
    } else {
      runAssess() // 2ª tentativa vai direto pro veredito
    }
  }

  const runAssess = async () => {
    if (!wavRef.current) return
    // trava de custo client-side: 6 avaliações por navegador já é muito teste
    const used = Number(localStorage.getItem('fr_bridge_assess') || '0')
    if (used >= 6) {
      try { frTrack('assess_blocked', 'local') } catch {}
      setStep('denied')
      speak(['m_back'])
      return
    }
    try { frTrack('assess_request', String(attempt)) } catch {}
    const r = await pron.assessWav(wavRef.current, SHADOW_TARGET)
    if (r === 'limit') {
      // trava de custo por IP no servidor — manda pro método com carinho ácido
      try { frTrack('assess_blocked', 'ip') } catch {}
      setStep('denied')
      speak(['m_back'])
      return
    }
    if (!r) {
      // avaliação falhou → volta pro MICROFONE (regravar), nunca beco sem saída
      try { frTrack('assess_fail', pron.error || 'unknown') } catch {}
      setStep('shadow')
      speak(['m_err'])
      return
    }
    try {
      localStorage.setItem('fr_bridge_assess', String(used + 1))
      localStorage.setItem('fr_bridge_done', '1') // jornada completa → próxima visita ganha o "olha quem voltou"
    } catch {}
    const band = r.score >= 80 ? 'high' : r.score >= 55 ? 'mid' : 'low'
    try { frTrack('score', `${band}:${r.score}:t${attempt}`) } catch {}
    setStep('score')
    const tip = diagRecipe(r).worstDim?.tip
    if (attempt === 1) {
      setRes1(r)
      setMood(band === 'high' ? 'celebrate' : band === 'mid' ? 'happy' : 'oops')
      speak([`m10_${band}` as LineId, ...(tip ? [tip] : []), 'm_pattern', 'm12'])
    } else {
      setRes2(r)
      const improved = res1 ? r.score > res1.score : false
      setMood(improved || band === 'high' ? 'celebrate' : 'happy')
      speak(improved ? ['m11', ...(tip ? [tip] : []), 'm_pattern', 'm12'] : [`m10_${band}` as LineId, ...(tip ? [tip] : []), 'm_pattern', 'm12'])
    }
  }

  const retry = () => {
    setAttempt(2)
    setStep('shadow')
    setCaptionId(null)
    stopManu()
  }

  const playMine = () => {
    stopManu()
    if (myUrl) {
      try { new Audio(myUrl).play() } catch {}
    }
  }

  const goVsl = (src: string) => {
    try { frTrack('cta_click', src) } catch {}
    try { (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.('trackCustom', 'BridgeCTAClick', { dest: 'vsl', src }) } catch {}
  }

  const res = res2 || res1
  const showSkip = step !== 'gate' && step !== 'play1' && step !== 'score' && step !== 'denied'

  // ════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: '100vh', fontFamily: FONT, letterSpacing: '-0.01em' }}>
      <style>{KEYFRAMES}</style>
      <audio ref={manuRef} playsInline />

      {/* progresso da jornada */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: C.bgSoft, zIndex: 90 }}>
        <div style={{ height: '100%', width: `${PROGRESS[step]}%`, background: `linear-gradient(90deg, ${C.violet}, ${C.violetD})`, transition: 'width .8s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      {/* header mínimo */}
      <header style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 560, margin: '0 auto' }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: C.ink }}>Fluency Route</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: C.dim }}>Demonstração · 3 min</span>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '20px 20px 80px' }}>
        {/* ─── GATE ─────────────────────────────────────────────────── */}
        {step === 'gate' && !returning && (
          <section style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <ManuOrb size={120} mood="happy" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.violet, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Oi. Eu sou a Manu.
            </p>
            <h1 style={{ fontSize: 'clamp(30px, 7.4vw, 44px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.035em', marginBottom: 18 }}>
              Vou fazer você entender uma cena de série <span style={{ color: C.violet }}>sem legenda</span>.<br />Em 3 minutos.
            </h1>
            <p style={{ fontSize: 17, color: C.dim, fontWeight: 500, lineHeight: 1.5, maxWidth: 380, margin: '0 auto 36px' }}>
              Não é truque, é uma demonstração. E uma aposta — que você vai querer perder.
            </p>
            <button onClick={start} style={{ ...btnPrimary, fontSize: 17, padding: '20px 34px' }}>
              Aceitar a aposta 😏
            </button>
            <p style={{ fontSize: 12, color: C.dim, marginTop: 16, fontWeight: 500 }}>
              3 minutos · sem cadastro · 🔊 com som fica melhor
            </p>
          </section>
        )}

        {/* ─── GATE de quem JÁ completou — o teste não é brinquedo infinito ── */}
        {step === 'gate' && returning && (
          <section style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <ManuOrb size={120} mood="celebrate" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.violet, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Olha quem voltou 😏
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 7vw, 40px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: 18 }}>
              Bebê, você <span style={{ color: C.violet }}>já testou</span> — e o seu ouvido funcionou.
            </h1>
            <p style={{ fontSize: 17, color: C.dim, fontWeight: 500, lineHeight: 1.5, maxWidth: 380, margin: '0 auto 36px' }}>
              Repetir o teste não te deixa fluente. O método completo deixa. O vídeo tá te esperando.
            </p>
            <a href={vslUrl} onClick={() => goVsl('returning')} style={{ ...btnPrimary, fontSize: 17, padding: '20px 34px', textDecoration: 'none' }}>
              Conhecer o método completo →
            </a>
            <p style={{ marginTop: 20 }}>
              <button onClick={() => { try { frTrack('redo_click') } catch {}; start() }} style={{
                background: 'none', border: 'none', color: C.dim, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, fontFamily: FONT,
              }}>
                refazer a experiência mesmo assim
              </button>
            </p>
          </section>
        )}

        {/* ─── BARRA DA MANU (legenda sempre visível = funciona sem som) ── */}
        {step !== 'gate' && (
          <div style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20,
            padding: '16px 18px', marginBottom: 22, boxShadow: C.shadowSm,
            minHeight: 92,
          }}>
            <ManuOrb size={56} speaking={speaking} listening={pron.recording} mood={mood} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: C.violet, marginBottom: 5 }}>
                Manu · professora
              </p>
              {/* legenda karaokê: palavra acende quando ela fala (timestamps Whisper) */}
              {captionId ? (
                <ManuCaption key={captionId} id={captionId} audioRef={manuRef} speaking={speaking} />
              ) : (
                <p style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.45, color: C.ink }}>
                  {pron.recording ? 'Te ouvindo…' : '…'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── A CENA — protagonista, visível a jornada inteira ──────── */}
        <div style={step === 'gate'
          ? { position: 'absolute' as const, width: 1, height: 1, opacity: 0, pointerEvents: 'none' as const, overflow: 'hidden' }
          : { borderRadius: 20, overflow: 'hidden', boxShadow: C.shadow, marginBottom: 8, position: 'relative' as const, animation: 'fadeUp .4s ease', background: '#000' }}>
          {/* o MUNDO entra em foco junto com o ouvido: 12px → 7px → 3px → nítido */}
          <video
            ref={videoRef}
            src="/bridge/scene.mp4"
            playsInline
            preload="auto"
            onEnded={onSceneEnd}
            style={{
              width: '100%', display: 'block',
              filter: step === 'play1' ? 'blur(12px)' : step === 'honest' ? 'blur(12px)' : step === 'play2' ? 'blur(7px)' : step === 'play3' ? 'blur(3px)' : 'none',
              transform: 'scale(1.06)', // esconde a borda clara do blur
              transition: 'filter 1s ease',
            }}
          />
          {step !== 'gate' && !sceneBusy && (
            <button onClick={() => {
              const n = step === 'play1' ? '1' : step === 'play2' ? '2' : step === 'play3' ? '3' : step === 'play4' ? '4' : 're'
              try { frTrack('listen_click', n) } catch {}
              playScene()
            }} style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(25,20,39,.42)', border: 'none', cursor: 'pointer', width: '100%',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: isPlayStep(step) ? `linear-gradient(135deg, ${C.violet}, ${C.violetD})` : C.bg,
                color: isPlayStep(step) ? '#fff' : C.ink,
                fontWeight: 800, fontSize: 15, padding: '15px 24px', borderRadius: 999, fontFamily: FONT,
                boxShadow: C.shadow, letterSpacing: '0.02em',
                animation: isPlayStep(step) ? 'softPulse 2.2s ease-in-out infinite' : 'none',
              }}>
                <PlayIcon size={15} color={isPlayStep(step) ? '#fff' : C.violet} />
                {step === 'play1' ? 'Ouvir a cena · 1ª vez'
                  : step === 'play2' ? 'De novo · 2ª vez'
                  : step === 'play3' ? 'Mais uma · 3ª vez'
                  : step === 'play4' ? 'Agora lendo · 4ª vez'
                  : step === 'honest' ? 'rever antes de responder'
                  : 'rever a cena'}
              </span>
            </button>
          )}
        </div>

        {/* ─── PLAY 1 — o desafio ───────────────────────────────────── */}
        {step === 'play1' && (
          <p style={{ fontSize: 13, color: C.dim, fontWeight: 600, textAlign: 'center', marginTop: 10, animation: 'fadeUp .4s ease' }}>
            🔊 som ligado? · cena real · velocidade de nativo · sem legenda
          </p>
        )}

        {/* repetição livre no fim — cada play ensaia a crença do método */}
        {(step === 'score' || step === 'denied') && (
          <p style={{ fontSize: 13, color: C.dim, fontWeight: 600, textAlign: 'center', marginTop: 10, marginBottom: 6, animation: 'fadeUp .4s ease' }}>
            ↻ repete a cena à vontade — cada play grava mais fundo no ouvido
          </p>
        )}

        {/* ─── PERGUNTA HONESTA (silêncio proposital — só você e a verdade) ── */}
        {step === 'honest' && (
          <section style={{ animation: 'fadeUp .4s ease', marginTop: 18 }}>
            <h2 style={{ fontSize: 'clamp(24px, 5.6vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6, textAlign: 'center' }}>
              Entendeu o que ela disse?
            </h2>
            <p style={{ fontSize: 14, color: C.dim, textAlign: 'center', marginBottom: 22, fontWeight: 500 }}>
              Ninguém tá olhando. Vale ser honesto.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button style={btnChoice} onClick={() => answerHonest('all')}>Entendi tudo</button>
              <button style={btnChoice} onClick={() => answerHonest('some')}>Peguei umas palavras soltas</button>
              <button style={btnChoice} onClick={() => answerHonest('none')}>Embolou tudo</button>
            </div>
          </section>
        )}

        {/* ─── LOOP DE REPETIÇÃO (o gráfico do advertorial, vivido) ──── */}
        {(step === 'play2' || step === 'play3' || step === 'play4') && (
          <SceneCard
            label={step === 'play4' ? 'Agora lendo a frase' : 'O que o seu ouvido pega até agora'}
            sub={step === 'play4' ? 'Repara: agora é impossível NÃO entender.' : 'Presta atenção no que acontece com o som.'}
          >
            <BlurPhrase step={step} />
          </SceneCard>
        )}

        {/* ─── SHADOWING ────────────────────────────────────────────── */}
        {step === 'shadow' && (
          <section style={{ animation: 'fadeUp .4s ease', textAlign: 'center' }}>
            <div style={{
              background: C.violetSoft, border: `1px solid ${C.violet}22`, borderRadius: 20,
              padding: '26px 22px', marginBottom: 18,
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.violet, marginBottom: 12 }}>
                Sua vez · repete em voz alta
              </p>
              <p style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
                {SHADOW_TARGET}
              </p>
              <p style={{ fontSize: 14, color: C.dim, fontWeight: 500, fontStyle: 'italic', marginBottom: 14 }}>“Não tem nada pra contar.”</p>
              {/* a 2ª frase da cena existe — dimmed vira gancho, não buraco */}
              <p style={{ fontSize: 15, color: C.dim, fontWeight: 600, opacity: 0.55 }}>{SCENE_EN_2}</p>
              <p style={{ fontSize: 12, color: C.dim, fontWeight: 500, opacity: 0.75, marginTop: 4 }}>
                a tia falou a frase inteira de exibida — você manda só a primeira parte 😉
              </p>
            </div>

            {pron.recording ? (
              <button onClick={pron.stopRecording} style={{ ...recBtn, background: C.red, transform: `scale(${1 + Math.min(level * 6, 0.18)})` }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#fff' }} />
              </button>
            ) : (
              <button onClick={startRecording} style={recBtn} disabled={pron.processing}>
                <MicIcon size={26} />
              </button>
            )}
            <p style={{ fontSize: 13, color: C.dim, marginTop: 12, fontWeight: 600 }}>
              {pron.recording ? 'Fala agora — paro sozinha quando você terminar' : attempt === 2 ? '2ª tentativa — mostra que evoluiu' : 'Toca pra gravar · pode errar à vontade'}
            </p>
          </section>
        )}

        {/* ─── A/B — sua voz vs original ────────────────────────────── */}
        {step === 'ab' && (
          <section style={{ animation: 'fadeUp .4s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <button style={{ ...btnChoice, textAlign: 'center', fontWeight: 800 }} onClick={() => { try { frTrack('ab_play', 'mine') } catch {}; playMine() }}>
                ▶ Sua voz
              </button>
              <button style={{ ...btnChoice, textAlign: 'center', fontWeight: 800 }} onClick={() => { try { frTrack('ab_play', 'orig') } catch {}; playScene() }}>
                ▶ Original
              </button>
            </div>
            <button onClick={runAssess} disabled={pron.processing} style={{ ...btnPrimary, width: '100%', opacity: pron.processing ? 0.7 : 1 }}>
              {pron.processing ? 'A Manu tá te avaliando…' : 'Ver a avaliação da Manu →'}
            </button>
          </section>
        )}

        {/* ─── DIAGNÓSTICO ──────────────────────────────────────────── */}
        {step === 'score' && res && (
          <section style={{ animation: 'fadeUp .4s ease' }}>
            <div style={{
              background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20,
              padding: '28px 22px', textAlign: 'center', marginBottom: 16, boxShadow: C.shadowSm,
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.violet, marginBottom: 10 }}>
                Sua pronúncia · avaliação da Manu
              </p>
              <p style={{ fontSize: 76, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: C.violet }}>
                {res.score}
              </p>
              {res2 && res1 && (
                <p style={{ fontSize: 14, fontWeight: 800, color: res2.score > res1.score ? C.green : C.dim, marginTop: 6 }}>
                  {res2.score > res1.score ? `▲ +${res2.score - res1.score} vs primeira tentativa` : `1ª tentativa: ${res1.score}`}
                </p>
              )}
              <p style={{ fontSize: 13, color: C.dim, fontWeight: 600, marginTop: 6 }}>
                {attempt === 1 ? 'na sua PRIMEIRA frase falada em inglês hoje' : 'segunda tentativa'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 18 }}>
                {res.words.filter(w => w.error !== 'Insertion').map((w, i) => (
                  <span key={i} style={{
                    padding: '7px 13px', borderRadius: 999, fontSize: 14, fontWeight: 700,
                    background: w.accuracy >= 80 ? `${C.green}18` : w.accuracy >= 60 ? `${C.amber}1c` : `${C.red}15`,
                    color: w.accuracy >= 80 ? C.green : w.accuracy >= 60 ? '#b45309' : C.red,
                    border: `1px solid ${w.accuracy >= 80 ? C.green : w.accuracy >= 60 ? C.amber : C.red}33`,
                  }}>
                    {w.word} · {w.accuracy}
                  </span>
                ))}
              </div>

              {/* raio-x de atleta — as 3 dimensões que a m_ab2 promete destrinchar */}
              <div style={{ marginTop: 22, textAlign: 'left' }}>
                {diagDims(res).map((d, i) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: C.dim, width: 92, flexShrink: 0 }}>
                      {d.label}
                    </span>
                    <div style={{ flex: 1, height: 10, background: C.bg, borderRadius: 999, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${d.v}%`, borderRadius: 999,
                        background: d.v >= 80 ? C.green : d.v >= 60 ? C.amber : C.red,
                        transition: `width 1s ease ${0.2 + i * 0.25}s`,
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, width: 30, textAlign: 'right' }}>{d.v}</span>
                  </div>
                ))}
              </div>

              {/* receita da tia — fraqueza vira prescrição de treino, nunca dica de boca */}
              {(() => {
                const { worstDim, worstWords } = diagRecipe(res)
                if (!worstDim) return null
                return (
                  <div style={{
                    marginTop: 18, padding: '16px 18px', background: C.violetSoft,
                    border: `1px solid ${C.violet}33`, borderRadius: 14, textAlign: 'left',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: C.violet, marginBottom: 8 }}>
                      🎯 Receita da tia
                    </p>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, lineHeight: 1.5 }}>
                      Seu ponto de treino é <strong style={{ color: C.violet }}>{worstDim.label.toLowerCase()}</strong>
                      {worstWords.length > 0 && (
                        <> — começando por palavras como {worstWords.map((w, i) => (
                          <span key={w.word}>
                            {i > 0 && ' e '}<strong style={{ color: C.violet }}>{w.word}</strong>
                          </span>
                        ))}</>
                      )}.{' '}
                      {worstDim.tip === 'm_tip_pron' && 'Repete elas junto do áudio até o som grudar — shadowing puro.'}
                      {worstDim.tip === 'm_tip_rhythm' && 'Quanto mais você ouve nativo emendando, mais sua boca emenda junto — treino de ouvido.'}
                      {worstDim.tip === 'm_tip_proso' && 'Copia a música da frase inteira, não só as palavras — shadowing de frase.'}
                    </p>
                  </div>
                )
              })()}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
                <button style={btnMini} onClick={playMine}>▶ sua voz</button>
                <button style={btnMini} onClick={() => playScene()}>▶ original</button>
                {attempt === 1 && (
                  <button style={{ ...btnMini, color: C.violet, borderColor: `${C.violet}55`, fontWeight: 800 }} onClick={retry}>
                    ↻ tentar de novo
                  </button>
                )}
              </div>
            </div>

            <FinalCta vslUrl={vslUrl} onClick={() => goVsl('score')} />
          </section>
        )}

        {/* ─── MIC NEGADO — ninguém fica preso ──────────────────────── */}
        {step === 'denied' && (
          <section style={{ animation: 'fadeUp .4s ease' }}>
            <FinalCta vslUrl={vslUrl} onClick={() => goVsl('denied')} />
          </section>
        )}

        {/* ─── saída sempre aberta (quem já se convenceu não fica preso) ── */}
        {showSkip && (
          <p style={{ textAlign: 'center', marginTop: 34 }}>
            <a href={vslUrl} onClick={() => { try { frTrack('skip_click', step) } catch {} }} style={{ fontSize: 13, color: C.dim, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              pular a demonstração e ir direto pra aula →
            </a>
          </p>
        )}
      </main>
    </div>
  )
}

// ─── COMPONENTES ─────────────────────────────────────────────────────

type CapWord = { w: string; s: number }
type CapEntry = { text: string; words?: CapWord[] }
const CAPS = CAPTIONS as unknown as Record<string, CapEntry | string>

// Legenda karaokê: palavras acendem em sincronia com o áudio (retenção:
// o olho fica esperando a próxima palavra em vez de ler na frente da fala).
// Sem áudio/words → frase inteira (fallback sound-off continua funcionando).
function ManuCaption({ id, audioRef, speaking }: { id: LineId; audioRef: React.RefObject<HTMLAudioElement | null>; speaking: boolean }) {
  const raw = CAPS[id]
  const entry: CapEntry = typeof raw === 'string' ? { text: raw } : raw || { text: LINES[id].text }
  const words = entry.words
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!words || !words.length) return
    let raf = 0
    const tick = () => {
      const a = audioRef.current
      if (a && !a.paused && !a.ended) {
        const t = a.currentTime + 0.08 // compensa o frame de render
        let count = 0
        for (const w of words) {
          if (w.s <= t) count++
          else break
        }
        setN(count)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [words, audioRef])

  const base: React.CSSProperties = { fontSize: 15.5, fontWeight: 600, lineHeight: 1.45, color: C.ink }

  // sem som / sem timestamps / fala terminou → frase inteira pra leitura
  if (!words || !words.length || !speaking) {
    return <p style={{ ...base, animation: 'fadeUp .35s ease' }}>{entry.text}</p>
  }

  // invisíveis ocupam espaço → o balão não pula a cada palavra
  return (
    <p style={base} aria-label={entry.text}>
      {words.map((w, i) => (
        <span key={i} style={{ visibility: i < n ? 'visible' : 'hidden', opacity: i < n ? 1 : 0, transition: 'opacity .12s ease' }}>
          {w.w}{' '}
        </span>
      ))}
    </p>
  )
}

function SceneCard({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <section style={{
      background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, marginTop: 16,
      padding: '26px 22px', textAlign: 'center', boxShadow: C.shadowSm, animation: 'fadeUp .4s ease',
    }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: C.violet, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 14, color: C.dim, fontWeight: 500, marginBottom: 20 }}>{sub}</p>
      {children}
    </section>
  )
}

// o desembaçar progressivo — o gráfico estático do advertorial, AO VIVO
function BlurPhrase({ step }: { step: 'play2' | 'play3' | 'play4' }) {
  const cfg = {
    play2: { l1: 'theresnothingtotell', l2: 'itsjustsomeguyiworkwith', blur: 4.5, color: C.dim },
    play3: { l1: 'theres nothing totell', l2: 'its just someguy iworkwith', blur: 1.8, color: C.ink },
    play4: { l1: SCENE_EN_1, l2: SCENE_EN_2, blur: 0, color: C.violet },
  }[step]
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 'clamp(22px, 5.6vw, 30px)', fontWeight: 800, letterSpacing: step === 'play4' ? '-0.03em' : '-0.04em',
        color: cfg.color, filter: cfg.blur ? `blur(${cfg.blur}px)` : 'none', lineHeight: 1.25,
        transition: 'filter .6s ease, color .6s ease',
      }}>
        {cfg.l1}<br />
        <span style={{ fontSize: '0.72em', fontWeight: 700, color: step === 'play4' ? C.ink : cfg.color }}>{cfg.l2}</span>
      </p>
      {step === 'play4' && (
        <p style={{ fontSize: 14, color: C.dim, fontStyle: 'italic', marginTop: 10, animation: 'fadeUp .5s ease', fontWeight: 500 }}>
          “{SCENE_PT}”
        </p>
      )}
    </div>
  )
}

function FinalCta({ vslUrl, onClick }: { vslUrl: string; onClick: () => void }) {
  return (
    <aside style={{
      background: C.ink, borderRadius: 20, padding: '34px 26px', textAlign: 'center', color: '#fff',
      boxShadow: C.shadow,
    }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
        Isso foi 1 cena. Uma.
      </p>
      <p style={{ fontSize: 'clamp(21px, 5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: 8 }}>
        Agora imagina um <span style={{ color: '#b7a4ff' }}>episódio inteiro</span>.<br />E depois outro. E outro.
      </p>
      <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.65)', fontWeight: 500, lineHeight: 1.5, maxWidth: 360, margin: '0 auto 24px' }}>
        Quem treina assim fica fluente — é óbvio. O Marcos gravou um vídeo mostrando como fazer isso na prática.
      </p>
      <a href={vslUrl} onClick={onClick} style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: `linear-gradient(135deg, ${C.violet}, ${C.violetD})`, color: '#fff',
        fontWeight: 800, fontSize: 16, letterSpacing: '0.03em', textTransform: 'uppercase' as const,
        padding: '20px 30px', borderRadius: 14, textDecoration: 'none', width: '100%', maxWidth: 400,
        boxShadow: '0 14px 38px -10px rgba(124,92,255,.55)', animation: 'softPulse 2.4s ease-in-out infinite',
        fontFamily: FONT,
      }}>
        Assistir agora →
      </a>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 14, fontWeight: 500 }}>
        gratuita · direto no navegador
      </p>
    </aside>
  )
}

// ─── ÍCONES ──────────────────────────────────────────────────────────

function PlayIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
    </svg>
  )
}

function MicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" />
    </svg>
  )
}

// ─── ESTILOS ─────────────────────────────────────────────────────────

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  background: `linear-gradient(135deg, ${C.violet}, ${C.violetD})`, color: '#fff',
  fontWeight: 800, fontSize: 16, letterSpacing: '0.02em',
  padding: '18px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
  boxShadow: '0 14px 38px -10px rgba(124,92,255,.5)', fontFamily: FONT,
}

const btnChoice: React.CSSProperties = {
  background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14,
  padding: '17px 20px', fontSize: 16, fontWeight: 700, color: C.ink, cursor: 'pointer',
  textAlign: 'left' as const, fontFamily: FONT, boxShadow: C.shadowSm,
}

const btnMini: React.CSSProperties = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 999,
  padding: '9px 16px', fontSize: 13, fontWeight: 700, color: C.ink, cursor: 'pointer', fontFamily: FONT,
}

const recBtn: React.CSSProperties = {
  width: 84, height: 84, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: `linear-gradient(135deg, ${C.violet}, ${C.violetD})`,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 16px 40px -10px rgba(124,92,255,.6)', transition: 'transform .12s ease',
  animation: 'softPulse 2s ease-in-out infinite',
}

const KEYFRAMES = `
@keyframes manuTalk { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(1); } }
@keyframes manuBlink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.08); } }
@keyframes manuBlob { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes manuRing { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(1.6); opacity: 0; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes softPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.018); } }
`
