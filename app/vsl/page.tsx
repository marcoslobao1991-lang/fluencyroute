'use client'

import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { trackViewContent, trackInitiateCheckout, genEventId, getFbCookies } from '../lib/pixel'
import '../vsl2/vsl.css'
import { C, FONT } from '../vsl2/design'
import { Fade, Glass, Label, S, Grad, useInView } from '../vsl2/primitives'

// ═══════════════════════════════════════════════════════════════
// ADVANCED TRACKING — UTMs, scroll depth, time on page
// ═══════════════════════════════════════════════════════════════

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck'] as const

function getUtmsFromUrl(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utms: Record<string, string> = {}
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) utms[k] = v
  })
  return utms
}

function buildCheckoutUrl(base: string, utms: Record<string, string>): string {
  const url = new URL(base)
  Object.entries(utms).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

/** Sends event to browser pixel + server CAPI in parallel */
function trackDual(event: string, eventId?: string) {
  const eid = eventId || genEventId()
  const { fbc, fbp } = getFbCookies()
  // Browser pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, {
      content_name: 'Rota da Fluência Essencial',
      currency: 'BRL',
      value: 29.00,
    }, { eventID: eid })
  }
  // Server CAPI
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, eventId: eid, fbc, fbp }),
  }).catch(() => {})
}

function useScrollDepth() {
  const firedRef = useRef(new Set<number>())
  useEffect(() => {
    const thresholds = [25, 50, 75, 100]
    const handler = () => {
      const scrollPct = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      thresholds.forEach(t => {
        if (scrollPct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t)
          trackDual(`ScrollDepth_${t}`)
        }
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

function useTimeOnPage() {
  useEffect(() => {
    const milestones = [30, 60, 120, 300, 600] // seconds
    const fired = new Set<number>()
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      milestones.forEach(m => {
        if (elapsed >= m && !fired.has(m)) {
          fired.add(m)
          trackDual(`TimeOnPage_${m}s`)
        }
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])
}

// Lazy load heavy graph components — only downloaded after reveal
const VocabCoverage = lazy(() => import('../vsl2/graphs/VocabCoverage').then(m => ({ default: m.VocabCoverage })))

// ═══════════════════════════════════════════════════════════════
// ROTA DA FLUÊNCIA ESSENCIAL — SALES PAGE
// ═══════════════════════════════════════════════════════════════

const PHASES = [
  {
    num: '01',
    title: 'Percepção Auditiva',
    icon: '👂',
    text: 'Nesta primeira fase, vamos aprimorar sua percepção auditiva ao ouvir inglês. Você vai compreender seus primeiros discursos utilizando os materiais de prática de repetição. O foco aqui é a compreensão auditiva, não a fala.',
  },
  {
    num: '02',
    title: 'Conversacional',
    icon: '💬',
    text: 'Nesta fase, vamos desenvolver sua percepção auditiva de conversações. Aqui é onde você começa a compreender palavras unidas e frases pronunciadas rapidamente — tudo no contexto de conversações essenciais, praticado em inglês padrão.',
  },
  {
    num: '03',
    title: 'Shadowing',
    icon: '🎙️',
    text: 'Na fase 3, você começa a treinar com séries e praticar sua pronúncia. Vai aprender a técnica de shadowing: imitar as falas já gravadas no material. Basta reproduzir cada frase e repetir — o app cuida das repetições.',
  },
  {
    num: '04',
    title: 'Imersão Simulada',
    icon: '🌍',
    text: 'A fase mais divertida. Seu inglês já não é básico e você entende quase tudo. Aqui começa a IMERSÃO no idioma — ver e ler tudo em inglês. É a fase de progressão contínua, onde você melhora pouco a pouco até ter um inglês ESSENCIALMENTE FLUIDO para trabalhar, viajar e se comunicar com clareza.',
  },
]

const SERIES = [
  { img: '/thumb-friends.jpg', name: 'Friends', detail: 'Todas as temporadas', color: C.purple },
  { img: '/thumb-himym.jpg', name: 'How I Met Your Mother', detail: 'Todas as temporadas', color: C.blue },
  { img: '/thumb-tahm.jpg', name: 'Two and a Half Men', detail: 'Todas as temporadas', color: C.yellow },
  { img: '/thumb-ted.svg', name: 'TED Talks', detail: 'Discursos selecionados', color: C.red },
]
const SERIES_LOOP = [...SERIES, ...SERIES, ...SERIES]

const FAQ = [
  {
    q: 'O que é a formação Rota da Fluência Essencial?',
    a: 'É uma formação focada no ensino do inglês de forma prática, utilizando técnicas de repetição contínua e espaçada. O objetivo é ajudar os alunos a dominar os fundamentos do inglês, permitindo que se comuniquem e compreendam o idioma sem traduzi-lo mentalmente.',
  },
  {
    q: 'Para quem é indicada a formação?',
    a: 'O curso é recomendado para: iniciantes que desejam aprender inglês do zero; pessoas que já estudaram inglês mas não conseguem se comunicar; pessoas que têm dificuldade para compreender falantes nativos e desejam melhorar suas habilidades de compreensão auditiva e oral.',
  },
  {
    q: 'Como funciona a metodologia?',
    a: 'A metodologia combina: Repetição contínua — treinamento com materiais já preparados, como trechos de séries, discursos e áudios, para repetir até que o inglês se internalize. Repetição espaçada — uso de ferramentas como Anki para revisar o conteúdo em intervalos estratégicos. Imersão simulada — exposição ao inglês através de séries, música e áudios para criar um ambiente de aprendizado contínuo.',
  },
  {
    q: 'A formação tem suporte?',
    a: 'Sim! Você terá acesso a um canal direto por WhatsApp, onde poderá fazer perguntas e receber orientação personalizada para configurar e ajustar seu treinamento.',
  },
  {
    q: 'Quanto tempo preciso dedicar ao treinamento?',
    a: 'Recomendamos dedicar pelo menos 30 minutos diários para praticar e revisar o material. Na capacitação, ensinamos maneiras de aproveitar momentos oportunos para aumentar seu tempo de exposição e acelerar seus resultados.',
  },
  {
    q: 'Quanto dura a formação?',
    a: 'O acesso é vitalício. Você terá acesso ao conteúdo por tempo ilimitado e poderá estudar no seu próprio ritmo.',
  },
  {
    q: 'Preciso ter conhecimento prévio de inglês?',
    a: 'Não. A capacitação foi projetada tanto para iniciantes quanto para quem já tem uma base mas precisa melhorar a fluência e a confiança na comunicação.',
  },
  {
    q: 'Quais materiais estão incluídos?',
    a: 'Episódios selecionados de séries como Friends, How I Met Your Mother e Two and a Half Men. Arquivos em Anki para prática de repetição espaçada. Áudios e textos para treinar escuta e fala. Estratégias e guias para montar sua rotina de aprendizado.',
  },
  {
    q: 'Posso acessar pelo celular?',
    a: 'Sim! Você pode acessar todo o conteúdo pelo computador, tablet ou celular, o que permite estudar onde e quando quiser.',
  },
  {
    q: 'O que é a fluência essencial?',
    a: 'A fluência essencial é a capacidade de se comunicar e compreender o inglês no dia a dia, mesmo sem um vocabulário avançado. O foco é na funcionalidade do idioma, não na perfeição.',
  },
  {
    q: 'Existe garantia de satisfação?',
    a: 'Sim! A capacitação inclui garantia de devolução do dinheiro de 7 dias. Se não ficar satisfeito com o conteúdo, basta solicitar o reembolso completo dentro desse prazo.',
  },
]

export default function RotaFluenciaPage() {
  const [sticky, setSticky] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [seriesPaused, setSeriesPaused] = useState(false)
  const [utms, setUtms] = useState<Record<string, string>>({})

  // Advanced tracking hooks
  useScrollDepth()
  useTimeOnPage()

  useEffect(() => {
    // Capture UTMs from URL
    setUtms(getUtmsFromUrl())

    // Track view (dual: browser + server)
    trackDual('ViewContent')

    // Vturb SDK
    if (!document.querySelector('script[src*="smartplayer-wc"]')) {
      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js'
      s.async = true
      document.head.appendChild(s)
    }

    // Load iframe src
    const ifr = document.getElementById('ifr_67d1c8ba61d59aeb47caf87d') as HTMLIFrameElement
    if (ifr && ifr.src === 'about:blank') {
      ifr.src = 'https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/67d1c8ba61d59aeb47caf87d/v4/embed.html' + (location.search || '?') + '&vl=' + encodeURIComponent(location.href)
    }

    // Reveal .esconder after delay (21 min = 1260s)
    const delaySeconds = 1260
    const storageKey = 'rota_fluencia_revealed'
    const alreadyRevealed = localStorage.getItem(storageKey) === '1'

    const doReveal = () => {
      document.querySelectorAll('.esconder').forEach(el => el.classList.remove('esconder'))
      localStorage.setItem(storageKey, '1')
      setRevealed(true)
    }

    if (alreadyRevealed) {
      doReveal()
    } else {
      const revealTimer = setTimeout(doReveal, delaySeconds * 1000)
      return () => clearTimeout(revealTimer)
    }

    // Sticky CTA on scroll
    const fn = () => setSticky(window.scrollY > 600)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const cardW = 240
  const gap = 14
  const totalW = SERIES.length * (cardW + gap)

  return (
    <div style={{
      background: C.bg, color: C.white,
      fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em',
    }}>

      {/* ═══ HEADER ═══ */}

      {/* ═══ HERO — HEADLINE + VIDEO ═══ */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 0' }}>
        <Fade>
          <h1 style={{
            fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700, lineHeight: 1.35,
            textAlign: 'center', color: C.t1, letterSpacing: '-0.02em',
            marginBottom: 20, padding: '0 12px',
          }}>
            O <span style={{ color: C.teal, fontWeight: 800 }}>Método de Repetição</span> que obriga o seu cérebro a entender inglês em tempo recorde
          </h1>
        </Fade>

        <Fade delay={0.15}>
          <div id="ifr_67d1c8ba61d59aeb47caf87d_wrapper" style={{ maxWidth: 400, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ position: 'relative', paddingTop: '177.78%', background: C.bg2 }} id="ifr_67d1c8ba61d59aeb47caf87d_aspect">
              <iframe
                frameBorder={0}
                allowFullScreen
                src="about:blank"
                id="ifr_67d1c8ba61d59aeb47caf87d"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                referrerPolicy="origin"
              />
            </div>
          </div>
          <p style={{
            textAlign: 'center', marginTop: 16, fontSize: 11,
            letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, color: C.t4,
          }}>
            Assista com som ativado
          </p>
        </Fade>
      </section>

      {/* ═══ CONTENT — HIDDEN UNTIL DELAY ═══ */}
      {/* Components only mount after reveal — no JS/images downloaded before */}
      <div className="esconder">
      {revealed && (<>

      {/* ═══ CTA 1 — PRICING ═══ */}
      <S narrow>
        <Fade>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Label center>JUNTE-SE À NOVA TURMA</Label>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.t1, marginBottom: 4 }}>
              Rota da Fluência Essencial
            </p>
            <p style={{ fontSize: 12, color: C.teal, marginBottom: 24 }}>
              *Últimas vagas com desconto especial
            </p>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="QUERO FAZER PARTE" utms={utms} />
            </div>
          </div>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ MÉTODO + GRÁFICO REPETIÇÃO ═══ */}
      <S narrow>
        <Fade>
          <div className="glow-teal" style={{ textAlign: 'center' }}>
            <Label center>METODOLOGIA</Label>
            <h2 style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Sistema de Repetição focado na <span style={{ color: C.teal }}>Internalização do Inglês no Subconsciente</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.t2, maxWidth: 500, margin: '0 auto' }}>
              A fluência está no subconsciente e a Rota da Fluência Essencial tem como objetivo internalizar o essencial do idioma no subconsciente através de uma metodologia única de repetição contínua e espaçada.
            </p>
          </div>
        </Fade>
        {/* Gráfico: Repetição 1x vs 30-40x */}
        <Fade delay={0.15}>
          <Glass accent={C.teal} hud style={{ marginTop: 32 }}>
            <RepetitionGraph />
          </Glass>
        </Fade>
        {/* Donut: 500 palavras = 90% das conversas */}
        <Fade delay={0.2}>
          <Glass accent={C.purple} hud style={{ marginTop: 16 }}>
            <p style={{
              textAlign: 'center', fontSize: 14, fontWeight: 700,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
              fontFamily: FONT.mono,
            }}>VOCABULÁRIO ESSENCIAL</p>
            <Suspense fallback={null}><VocabCoverage /></Suspense>
            <p style={{ textAlign: 'center', fontSize: 14, color: C.t2, lineHeight: 1.6, marginTop: 8 }}>
              Com apenas <span style={{ color: C.teal, fontWeight: 700 }}>500 palavras</span> você cobre
              mais de <span style={{ color: C.teal, fontWeight: 700 }}>90%</span> de todas as conversas do dia a dia.
            </p>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ RESULTADO ═══ */}
      <S narrow>
        <Fade>
          <Glass accent={C.teal} glow hud>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.t1, textAlign: 'center', marginBottom: 16 }}>
              O resultado de um treinamento concentrado...
            </h3>
            <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 20 }} />
            <div style={{ fontSize: 15, lineHeight: 1.9, color: C.t2 }}>
              <p>&#10003; Você começa a entender falantes nativos na velocidade real.</p>
              <p>&#10003; As palavras saem da sua boca automaticamente, sem precisar traduzir.</p>
              <p>&#10003; Você assiste filmes e séries sem legendas.</p>
              <p>&#10003; Finalmente sente que o inglês flui com naturalidade na sua vida.</p>
              <p style={{ marginTop: 16, color: C.teal, fontWeight: 600 }}>
                E o melhor? Você pode aplicar este método HOJE e começar a sentir a diferença em poucos dias.
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Btn text="COMEÇAR AGORA" utms={utms} />
            </div>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ FASES (com ícones) ═══ */}
      <S>
        <Fade>
          <Label center>FASES DA FLUÊNCIA ESSENCIAL</Label>
        </Fade>
        <div className="rg2" style={{ marginTop: 24 }}>
          {PHASES.map((p, i) => (
            <Fade key={i} delay={i * 0.1}>
              <Glass accent={C.teal} style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.teal}18, ${C.purple}18)`,
                    border: `1px solid ${C.teal}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0,
                  }}>{p.icon}</div>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: 3,
                      fontFamily: FONT.mono, color: C.teal,
                    }}>FASE {p.num}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: C.t1 }}>{p.title}</h3>
                  </div>
                </div>
                <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 12 }} />
                <p style={{ fontSize: 14, lineHeight: 1.7, color: C.t2 }}>{p.text}</p>
              </Glass>
            </Fade>
          ))}
        </div>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ CTA 2 ═══ */}
      <S narrow>
        <Fade>
          <div style={{ textAlign: 'center' }}>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="QUERO FAZER PARTE" utms={utms} />
            </div>
          </div>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ CONTEÚDO PRÁTICO — CAROUSEL DE SÉRIES + DISCURSOS ═══ */}
      <div className="glow-purple" style={{ overflow: 'hidden' }}>
        <S>
          <Fade>
            <Label center color={C.purple}>CONTEÚDO PRÁTICO</Label>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 600,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              As séries que você ama.
            </p>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.035em',
              marginBottom: 8,
            }}>
              <Grad size="inherit">Para treinar seu inglês.</Grad>
            </p>
            <p style={{
              textAlign: 'center', fontSize: 15, color: C.t2,
              lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px',
            }}>
              Friends, HIMYM, Two and a Half Men — cada cena com material de repetição pronto para você treinar ouvido e fala.
            </p>
          </Fade>

          {/* Series carousel — infinite auto-scroll */}
          <Fade delay={0.1}>
            <div style={{ overflow: 'hidden', position: 'relative' }}
              onPointerDown={() => setSeriesPaused(true)}
              onPointerUp={() => setSeriesPaused(false)}
              onPointerLeave={() => setSeriesPaused(false)}
              onTouchStart={() => setSeriesPaused(true)}
              onTouchEnd={() => setSeriesPaused(false)}
            >
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: 20, zIndex: 2,
                background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0, width: 20, zIndex: 2,
                background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none',
              }} />

              <div style={{
                display: 'flex', gap, width: 'max-content',
                animation: `seriesScroll ${SERIES.length * 5}s linear infinite`,
                animationPlayState: seriesPaused ? 'paused' : 'running',
              }}>
                {SERIES_LOOP.map((s, i) => (
                  <div key={i} style={{
                    width: cardW, flexShrink: 0,
                    borderRadius: 4, overflow: 'hidden',
                    border: `1px solid ${s.color}20`, background: C.bg3,
                    position: 'relative',
                  }} className="hud">
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      {s.img.endsWith('.svg') ? (
                        <div style={{
                          width: '100%', aspectRatio: '16/10', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: `linear-gradient(135deg, ${s.color}30, ${C.bg2})`,
                        }}>
                          <img src={s.img} alt={s.name} style={{ width: 80, height: 'auto' }} loading="lazy" />
                        </div>
                      ) : (
                        <img src={s.img} alt={s.name} style={{
                          width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block',
                          filter: 'saturate(0.85) brightness(0.9)',
                        }} loading="lazy" />
                      )}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(160deg, ${s.color}40, transparent 70%)`,
                        mixBlendMode: 'screen',
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(to top, ${C.bg3} 0%, transparent 50%)`,
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
                        backgroundImage: `repeating-linear-gradient(0deg, ${s.color} 0, ${s.color} 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, ${s.color} 0, ${s.color} 1px, transparent 1px, transparent 30px)`,
                      }} />
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: C.t3, fontFamily: FONT.mono }}>{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <style>{`
                @keyframes seriesScroll {
                  0% { transform: translateX(0) }
                  100% { transform: translateX(-${totalW}px) }
                }
              `}</style>
            </div>
          </Fade>

          <Fade delay={0.2}>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Btn text="COMEÇAR AGORA" utms={utms} />
            </div>
          </Fade>
        </S>
      </div>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ VALOR + GRÁFICO COMPARAÇÃO ═══ */}
      <S>
        <Fade>
          <div className="rg2">
            {/* Tradicional */}
            <Glass accent={C.red}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.t1, textAlign: 'center', marginBottom: 14 }}>
                Quanto vale realmente falar inglês?
              </h3>
              <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 14 }} />
              <div style={{ fontSize: 14, lineHeight: 1.9, color: C.t2 }}>
                <p style={{ marginBottom: 12 }}>Se você tentasse aprender inglês da forma tradicional, quanto tempo e dinheiro custaria?</p>
                <p style={{ color: C.t1 }}>Curso de inglês tradicional</p>
                <p>&#10060; Duração: 5 anos</p>
                <p>&#10060; Custo médio: R$20.000</p>
                <p style={{ marginBottom: 12 }}>&#10060; Método ultrapassado que ensina regras, mas não te faz falar</p>
                <p style={{ color: C.t1 }}>Intercâmbio nos EUA ou Canadá</p>
                <p>&#10060; Duração: 3 meses</p>
                <p>&#10060; Custo médio: R$60.000</p>
                <p>&#10060; Sem garantia de que vai realmente dominar o inglês</p>
              </div>
            </Glass>

            {/* Com Rota */}
            <Glass accent={C.teal} glow>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.teal, textAlign: 'center', marginBottom: 14 }}>
                Com Rota da Fluência:
              </h3>
              <div style={{ fontSize: 14, lineHeight: 2, color: C.t2 }}>
                <p>&#10003; Treinamento Acelerado de Fluência</p>
                <p>&#10003; Acesso ao Treinamento Concentrado</p>
                <p>&#10003; Plano Intensivo de 90 dias para destravar sua fala</p>
                <p>&#10003; Feedback Personalizado (R$997) — <span style={{ color: C.teal, fontWeight: 700 }}>GRÁTIS</span></p>
                <p>&#10003; Suporte Individual por WhatsApp (R$797) — <span style={{ color: C.teal, fontWeight: 700 }}>GRÁTIS</span></p>
                <p style={{ marginTop: 12, color: C.t1, fontWeight: 700 }}>Total: Mais de R$5.000</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.teal, marginTop: 4 }}>Hoje por apenas R$29/mês</p>
              </div>
            </Glass>
          </div>
        </Fade>

        {/* Gráfico: Curso tradicional (desistiu) vs Rota (hábito diário) */}
        <Fade delay={0.15}>
          <Glass accent={C.teal} hud style={{ marginTop: 24 }}>
            <UsageComparisonRota />
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ GARANTIA DUPLA (com shield) ═══ */}
      <S narrow>
        <Fade>
          <Glass accent={C.yellow} glow hud>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image src="/shield-guarantee.png" alt="Garantia" width={80} height={80} style={{ margin: '0 auto' }} />
            </div>
            <Label center color={C.yellow}>GARANTIA DE 7 DIAS</Label>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.t1, textAlign: 'center', marginBottom: 20, lineHeight: 1.4 }}>
              Sem risco nenhum pra você.
            </h3>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.t2 }}>
              <p style={{ marginBottom: 16 }}>
                Teste a formação durante 7 dias sem compromisso. Se nesse período sentir que não é pra você, basta nos enviar um e-mail e devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
              </p>
              <p style={{ color: C.yellow, fontWeight: 700, textAlign: 'center', fontSize: 15 }}>
                A única forma de perder é se você não se inscrever agora.
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Btn text="GARANTIR MINHA VAGA" utms={utms} />
            </div>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ FAQ ═══ */}
      <S narrow>
        <Fade>
          <Label center>PERGUNTAS FREQUENTES</Label>
        </Fade>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((item, i) => (
            <Fade key={i} delay={i * 0.04}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  background: C.bg3,
                  border: `1px solid ${openFaq === i ? C.teal + '44' : C.border}`,
                  borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color .3s',
                }}
              >
                <div style={{
                  padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, lineHeight: 1.4 }}>
                    {i + 1}. {item.q}
                  </p>
                  <span style={{
                    fontSize: 18, color: C.teal, fontWeight: 300, flexShrink: 0,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform .3s',
                  }}>+</span>
                </div>
                <div style={{
                  maxHeight: openFaq === i ? 400 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .4s cubic-bezier(.16,1,.3,1)',
                }}>
                  <p style={{
                    padding: '0 20px 16px',
                    fontSize: 14, lineHeight: 1.7, color: C.t2,
                  }}>{item.a}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ CTA FINAL ═══ */}
      <S narrow>
        <Fade>
          <div className="glow-teal" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Comece sua jornada rumo à <span style={{ color: C.teal }}>fluência essencial</span> hoje
            </h2>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="QUERO FAZER PARTE" utms={utms} />
            </div>
          </div>
        </Fade>
      </S>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ textAlign: 'center', padding: '48px 24px 36px', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: C.t3 }}>fluency</span><span style={{ color: C.teal }}>route</span>
        </p>
        <p style={{ fontSize: 10, color: C.t4, marginTop: 8 }}>Fluency Route · Todos os direitos reservados</p>
      </footer>

      </>)}
      </div>{/* end .esconder */}

      {/* ═══ STICKY CTA ═══ */}
      <div className={`esconder sticky-cta ${sticky ? 'show' : ''}`}>
        <Btn compact text="COMEÇAR POR R$29/MÊS" utms={utms} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CART STITCHING — captures fbc/fbp/ua/ip before hop to Kiwify
// so the webhook can enrich the Purchase CAPI with full user_data
// ═══════════════════════════════════════════════════════════════
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = sessionStorage.getItem('fr_sid')
    if (existing) return existing
    const nid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
    sessionStorage.setItem('fr_sid', nid)
    return nid
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
  }
}

function saveCheckoutSession(sessionId: string) {
  if (typeof window === 'undefined' || !sessionId) return
  const { fbc, fbp } = getFbCookies()
  const p = new URLSearchParams(window.location.search)
  const payload = {
    session_id: sessionId,
    fbc,
    fbp,
    fbclid: p.get('fbclid') || undefined,
    utm_source: p.get('utm_source') || undefined,
    utm_medium: p.get('utm_medium') || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
    utm_content: p.get('utm_content') || undefined,
    utm_term: p.get('utm_term') || undefined,
    sck: p.get('sck') || undefined,
  }
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    const ok = navigator.sendBeacon?.('/api/checkout-session', blob)
    if (!ok) throw new Error('no beacon')
  } catch {
    fetch('/api/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }
}

// ═══════════════════════════════════════════════════════════════
// CTA BUTTON — points to Kiwify checkout
// ═══════════════════════════════════════════════════════════════
function Btn({ text = 'QUERO FAZER PARTE', compact, utms = {} }: { text?: string; compact?: boolean; utms?: Record<string, string> }) {
  const [sid, setSid] = useState('')
  useEffect(() => { setSid(getOrCreateSessionId()) }, [])
  const checkoutUrl = buildCheckoutUrl(
    'https://pay.kiwify.com.br/DlmRal3',
    sid ? { ...utms, s_id: sid } : utms
  )
  const handleClick = () => {
    const effectiveSid = sid || getOrCreateSessionId()
    saveCheckoutSession(effectiveSid)
    trackDual('InitiateCheckout')
  }
  return (
    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="cta-btn"
      onClick={handleClick}
      style={compact ? { padding: '14px 20px', fontSize: 15 } : undefined}
    >
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {text}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRICE BLOCK
// ═══════════════════════════════════════════════════════════════
function PriceBlock() {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 16, color: C.t2 }}>
        De <span style={{ textDecoration: 'line-through', color: C.red }}>R$497</span>
      </p>
      <p style={{ fontSize: 14, color: C.t2, marginTop: 4 }}>Hoje por apenas:</p>
      <p style={{
        fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: 900,
        fontFamily: FONT.mono, letterSpacing: '-0.04em',
        background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        lineHeight: 1.1, marginTop: 4,
      }}>
        R$29<span style={{ fontSize: '0.45em', fontWeight: 700 }}>/mês</span>
      </p>
      <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>12x no cartão</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// REPETITION GRAPH — adapted: AULA 1x vs TREINO CONCENTRADO 30-40x
// ═══════════════════════════════════════════════════════════════
function RepetitionGraph() {
  const { ref, v } = useInView(0.15)

  return (
    <div ref={ref} style={{ position: 'relative', padding: '24px 0' }}>
      <svg viewBox="0 0 500 360" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="rg-teal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-purple" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.purple} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-red" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.6" />
          </linearGradient>
          <filter id="rg-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="50" y1={50 + i * 55} x2="450" y2={50 + i * 55}
            stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        ))}

        {/* AULA BAR (tiny, red) */}
        <rect
          x="90" y={v ? 205 : 215} width="110" height={v ? 10 : 0}
          rx="5" fill="url(#rg-red)"
          style={{ transition: 'all 1.2s cubic-bezier(.16,1,.3,1) 0.3s' }}
        />
        <text x="145" y="250" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 32, fontWeight: 800, opacity: v ? 0.7 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
          1x
        </text>
        <text x="145" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1s' }}>
          AULA
        </text>

        {/* TREINO CONCENTRADO BAR (massive, teal gradient, glowing) */}
        <rect
          x="270" y={v ? 50 : 215} width="140" height={v ? 165 : 0}
          rx="5" fill="url(#rg-purple)" filter="url(#rg-glow)"
          style={{ transition: 'all 1.8s cubic-bezier(.16,1,.3,1) 0.6s' }}
        />
        <text x="340" y="250" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 38, fontWeight: 800, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s' }}>
          30-40x
        </text>
        <text x="340" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.7s' }}>
          TREINO CONCENTRADO
        </text>

        {/* Dopamine particles */}
        {v && [
          { cx: 295, delay: '0.8s', dur: '3.5s' },
          { cx: 315, delay: '1.2s', dur: '4s' },
          { cx: 340, delay: '1.5s', dur: '3.8s' },
          { cx: 360, delay: '1.8s', dur: '4.2s' },
          { cx: 325, delay: '2.2s', dur: '3.6s' },
          { cx: 380, delay: '2.5s', dur: '4.5s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy="50" r="3"
            fill={i % 2 === 0 ? C.teal : C.purple}
            opacity="0"
            style={{ animation: `dopFloat ${p.dur} ease-in-out ${p.delay} infinite` }}
          />
        ))}

        <text x="340" y="35" textAnchor="middle" style={{ fontSize: 30 }}>🧠</text>

        <text x="145" y="320" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.6 : 0, transition: 'opacity 0.8s ease 2s' }}>
          INSUFICIENTE
        </text>
        <text x="340" y="320" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.9 : 0, transition: 'opacity 0.8s ease 2s' }}>
          AUTOMÁTICA
        </text>
      </svg>

      <style>{`
        @keyframes dopFloat {
          0% { opacity: 0; transform: translateY(0) }
          15% { opacity: .7 }
          50% { opacity: .4; transform: translateY(-40px) }
          85% { opacity: .6; transform: translateY(-60px) }
          100% { opacity: 0; transform: translateY(-80px) }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// USAGE COMPARISON — adapted for Rota da Fluência
// ═══════════════════════════════════════════════════════════════
function UsageComparisonRota() {
  const { ref, v } = useInView(0.15)

  const W = 480, H = 320
  const padL = 16, padR = 16, padT = 50, padB = 80

  const tradPeak = padT + 80
  const tradPath = `M ${padL + 30} ${H - padB}
    C ${padL + 60} ${H - padB} ${padL + 80} ${tradPeak} ${padL + 140} ${tradPeak}
    C ${padL + 180} ${tradPeak} ${padL + 195} ${tradPeak + 10} ${padL + 210} ${H - padB}`
  const tradArea = tradPath + ` L ${padL + 30} ${H - padB} Z`

  const icY = H - padB - 80
  const icPath = `M ${padL + 30} ${H - padB}
    C ${padL + 50} ${H - padB} ${padL + 70} ${icY} ${padL + 100} ${icY}
    L ${W - padR - 30} ${icY}`
  const icArea = icPath + ` L ${W - padR - 30} ${H - padB} L ${padL + 30} ${H - padB} Z`

  return (
    <div ref={ref} className="graph-container" style={{ padding: '8px 0' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="ucr-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ucr-teal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        <path d={tradArea} fill="url(#ucr-red)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.3s' }} />
        <path d={tradPath} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.7 : 0} strokeDasharray="500" strokeDashoffset={v ? 0 : 500}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.16,1,.3,1) 0.3s, opacity 0.8s ease 0.3s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 1.5s' }}>
          <line x1={padL + 210} y1={padT} x2={padL + 210} y2={H - padB} stroke={C.red} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <text x={padL + 210} y={padT - 8} textAnchor="middle" fill={C.red}
            style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 800, letterSpacing: '2px' }}>DESISTIU</text>
        </g>

        <path d={icArea} fill="url(#ucr-teal)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.8s' }} />
        <path d={icPath} fill="none" stroke={C.teal} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.9 : 0} strokeDasharray="600" strokeDashoffset={v ? 0 : 600}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.8s, opacity 0.8s ease 0.8s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 2s' }}>
          <text x={W - padR - 30} y={icY - 14} textAnchor="end" fill={C.teal}
            style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, letterSpacing: '2px' }}>HÁBITO DIÁRIO</text>
        </g>

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.8s ease 2.5s' }}>
          <circle cx={W * 0.2} cy={H - 30} r="5" fill={C.red} opacity="0.6" />
          <text x={W * 0.2 + 14} y={H - 25} fill={C.t2}
            style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '1px' }}>CURSO TRADICIONAL</text>

          <circle cx={W * 0.65} cy={H - 30} r="5" fill={C.teal} opacity="0.9" />
          <text x={W * 0.65 + 14} y={H - 25} fill={C.t1}
            style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '1px' }}>ROTA DA FLUÊNCIA</text>
        </g>

        <text x={W / 2} y={H - 50} textAnchor="middle" fill={C.t3}
          style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '3px' }}>TEMPO →</text>
      </svg>
    </div>
  )
}
