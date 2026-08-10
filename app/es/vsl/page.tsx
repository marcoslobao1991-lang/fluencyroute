'use client'

import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import Image from 'next/image'
import { genEventId, getFbCookies, getClientIp, getUserAgent, cachedIp } from '../../lib/pixel'
import { createTracker } from '../../lib/funnel-track'
import '../../vsl2/vsl.css'
import { C, FONT } from '../../vsl2/design'
import { Fade, Glass, Label, S, Grad, useInView } from '../../vsl2/primitives'
import VslPlayer from '../../vsl/VslPlayer'

const frTrack = createTracker({ funnel: 'ingles-latam', page: 'vsl' })

// Pixel PRÓPRIO do LATAM — isolado do pixel BR (938…) que o layout global
// carrega. Browser usa trackSingle neste ID; CAPI via /api/track-latam com o
// mesmo eventID (dedup). Mesmo padrão do /spanish.
const LATAM_PIXEL = '604755389004843'

// ═══════════════════════════════════════════════════════════════
// /vsl LATAM — clone editorial do /vsl BR, copy ES neutro,
// player Vturb da /clase (68478931968781adbb0758df),
// checkout Hotmart, currency USD.
// ═══════════════════════════════════════════════════════════════

// Checkout Hotmart LATAM (produto P94218659Y, oferta eun6d9uv, US$49) —
// hardcoded: a env NEXT_PUBLIC_HOTMART_CHECKOUT_URL pertence ao projeto
// fluencyroute-latam da Vercel, não existe neste app.
const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/P94218659Y?off=eun6d9uv&checkoutMode=10'

// Vturb player IDs (account UUID = mesmo BR)
const VTURB_ACCOUNT = 'a2b1bd19-973f-4fda-ada9-47d42bffa2ad'
const VTURB_PLAYER_ID = '68478931968781adbb0758df' // /clase LATAM

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

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_latam_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

async function trackDual(event: string, eventId?: string) {
  const eid = eventId || genEventId()
  const { fbc, fbp } = getFbCookies()
  const ip = await getClientIp()
  const ua = getUserAgent()
  const extId = getExternalId()
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackSingle', LATAM_PIXEL, event, {
      content_name: 'Ruta de la Fluidez Esencial',
      currency: 'USD',
      value: 49.00,
      content_ids: ['fluency-latam-annual'],
      content_type: 'product',
    }, { eventID: eid })
  }
  fetch('/api/track-latam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event, eventId: eid, fbc, fbp,
      external_id: extId,
      client_ip_address: ip, client_user_agent: ua,
      value: 49.00, currency: 'USD',
      content_name: 'Ruta de la Fluidez Esencial',
      content_ids: ['fluency-latam-annual'], content_type: 'product',
    }),
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
    const milestones = [30, 60, 120, 300, 600]
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

const VocabCoverage = lazy(() => import('../../vsl2/graphs/VocabCoverage').then(m => ({ default: m.VocabCoverage })))

const PHASES = [
  {
    num: '01',
    title: 'Percepción Auditiva',
    icon: '👂',
    text: 'En esta primera fase, vas a desarrollar tu percepción auditiva al escuchar inglés. Comprenderás tus primeros diálogos usando los materiales de práctica de repetición. El foco aquí es la comprensión auditiva, no el habla.',
  },
  {
    num: '02',
    title: 'Conversacional',
    icon: '💬',
    text: 'En esta fase, vas a desarrollar tu percepción auditiva en conversaciones. Aquí empiezas a comprender palabras unidas y frases pronunciadas rápidamente — todo en el contexto de conversaciones esenciales, practicado en inglés estándar.',
  },
  {
    num: '03',
    title: 'Shadowing',
    icon: '🎙️',
    text: 'En la fase 3, empiezas a entrenar con series y a practicar tu pronunciación. Vas a aprender la técnica de shadowing: imitar las líneas ya grabadas en el material. Simplemente reproduces cada frase y la repites — la app cuida de las repeticiones.',
  },
  {
    num: '04',
    title: 'Inmersión Simulada',
    icon: '🌍',
    text: 'La fase más divertida. Tu inglés ya no es básico y entiendes casi todo. Aquí empieza la INMERSIÓN en el idioma — ver y leer todo en inglés. Es la fase de progresión continua, donde mejoras poco a poco hasta tener un inglés ESENCIALMENTE FLUIDO para trabajar, viajar y comunicarte con claridad.',
  },
]

const SERIES = [
  { img: '/thumb-friends.jpg', name: 'Friends', detail: 'Todas las temporadas', color: C.purple },
  { img: '/thumb-himym.jpg', name: 'How I Met Your Mother', detail: 'Todas las temporadas', color: C.blue },
  { img: '/thumb-tahm.jpg', name: 'Two and a Half Men', detail: 'Todas las temporadas', color: C.yellow },
  { img: '/thumb-ted.svg', name: 'TED Talks', detail: 'Discursos seleccionados', color: C.red },
]
const SERIES_LOOP = [...SERIES, ...SERIES, ...SERIES]

const FAQ = [
  {
    q: '¿Qué es la formación Ruta de la Fluidez Esencial?',
    a: 'Es una formación enfocada en la enseñanza del inglés de forma práctica, utilizando técnicas de repetición continua y espaciada. El objetivo es ayudar a los alumnos a dominar los fundamentos del inglés, permitiendo que se comuniquen y comprendan el idioma sin traducirlo mentalmente.',
  },
  {
    q: '¿Para quién está indicada la formación?',
    a: 'El curso está recomendado para: principiantes que desean aprender inglés desde cero; personas que ya estudiaron inglés pero no logran comunicarse; personas que tienen dificultad para comprender a los nativos y desean mejorar su comprensión auditiva y oral.',
  },
  {
    q: '¿Cómo funciona la metodología?',
    a: 'La metodología combina: Repetición continua — entrenamiento con materiales ya preparados, como fragmentos de series, discursos y audios, para repetir hasta que el inglés se internalice. Repetición espaciada — uso de herramientas como Anki para revisar el contenido en intervalos estratégicos. Inmersión simulada — exposición al inglés a través de series, música y audios para crear un ambiente de aprendizaje continuo.',
  },
  {
    q: '¿La formación tiene soporte?',
    a: '¡Sí! Vas a tener acceso a un canal directo por WhatsApp, donde podrás hacer preguntas y recibir orientación personalizada para configurar y ajustar tu entrenamiento.',
  },
  {
    q: '¿Cuánto tiempo necesito dedicar al entrenamiento?',
    a: 'Recomendamos dedicar al menos 30 minutos diarios para practicar y revisar el material. En la capacitación, enseñamos formas de aprovechar momentos oportunos para aumentar tu tiempo de exposición y acelerar tus resultados.',
  },
  {
    q: '¿Cuánto dura la formación?',
    a: 'El acceso es de por vida. Tendrás acceso al contenido por tiempo ilimitado y podrás estudiar a tu propio ritmo.',
  },
  {
    q: '¿Necesito tener conocimiento previo de inglés?',
    a: 'No. La capacitación fue diseñada tanto para principiantes como para quienes ya tienen una base pero necesitan mejorar la fluidez y la confianza en la comunicación.',
  },
  {
    q: '¿Qué materiales están incluidos?',
    a: 'Episodios seleccionados de series como Friends, How I Met Your Mother y Two and a Half Men. Archivos en Anki para práctica de repetición espaciada. Audios y textos para entrenar escucha y habla. Estrategias y guías para armar tu rutina de aprendizaje.',
  },
  {
    q: '¿Puedo acceder desde el celular?',
    a: '¡Sí! Puedes acceder a todo el contenido desde la computadora, tablet o celular, lo que te permite estudiar donde y cuando quieras.',
  },
  {
    q: '¿Qué es la fluidez esencial?',
    a: 'La fluidez esencial es la capacidad de comunicarse y comprender el inglés en el día a día, incluso sin un vocabulario avanzado. El foco está en la funcionalidad del idioma, no en la perfección.',
  },
  {
    q: '¿Existe garantía de satisfacción?',
    a: '¡Sí! La capacitación incluye garantía de devolución del dinero de 7 días. Si no quedas satisfecho con el contenido, basta solicitar el reembolso completo dentro de ese plazo.',
  },
]

export default function RutaFluidezPage() {
  const [sticky, setSticky] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [seriesPaused, setSeriesPaused] = useState(false)
  const [utms, setUtms] = useState<Record<string, string>>({})
  // recebe o currentTime do VslPlayer pra revelar por tempo de vídeo assistido
  const videoRevealRef = useRef<((t: number) => void) | null>(null)
  // se o player cair pro fallback vturb, rearma o reveal por relógio
  const playerFallbackRef = useRef<(() => void) | null>(null)

  useScrollDepth()
  useTimeOnPage()

  useEffect(() => {
    getClientIp()
    setUtms(getUtmsFromUrl())

    // ── Capture Vturb sck via postMessage ──
    const handleVturbMessage = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.mime !== 'smartplayer/message-text-v4') return
        if (event.data.type !== 'UpdateUrlParams') return
        const sck = event.data.sck || event.data.data?.sck
        if (sck) {
          const { fbc, fbp } = getFbCookies()
          const payload = {
            session_id: getOrCreateSessionId() + '-sck-' + Date.now().toString(36),
            fbc, fbp,
            fbclid: new URLSearchParams(window.location.search).get('fbclid') || undefined,
            client_ip_address: cachedIp || undefined,
            client_user_agent: getUserAgent() || undefined,
            sck,
            ...getUtmsFromUrl(),
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
      } catch {}
    }
    window.addEventListener('message', handleVturbMessage)

    // external_id: cookie host-only (o domain .fluencyroute.com morreu)
    try {
      if (!document.cookie.includes('_fluency_latam_uid=')) {
        const id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12))
        document.cookie = '_fluency_latam_uid=' + id + '; path=/; max-age=' + 60 * 60 * 24 * 730 + '; SameSite=Lax'
      }
    } catch {}
    // fbq vem do layout global (lazyOnload) — poll até existir, aí init do 604…
    let pxTries = 0
    let pxIv: ReturnType<typeof setInterval> | undefined
    const initPx = () => {
      const fbq = (window as any).fbq
      if (typeof fbq !== 'function') return false
      fbq('init', LATAM_PIXEL)
      trackDual('PageView')
      trackDual('ViewContent')
      return true
    }
    if (!initPx()) {
      pxIv = setInterval(() => { if (initPx() || ++pxTries > 40) { if (pxIv) clearInterval(pxIv) } }, 250)
    }
    try { frTrack('pageview') } catch {}

    // Player próprio (VslPlayer) — o SDK/iframe vturb agora só entra no failover,
    // carregado pelo próprio VslPlayer. O listener de postMessage acima fica:
    // é a fonte do sck quando o fallback vturb assume.

    // Reveal .esconder aos 21min (1260s) DE VÍDEO ASSISTIDO — o relógio vira
    // rede de segurança: cancelado no primeiro timeupdate; se o vídeo nunca
    // tocar, a oferta abre como sempre abriu. No failover vturb (iframe, sem
    // acesso ao tempo) o relógio é rearmado.
    const delaySeconds = 1260
    const storageKey = 'fluency_latam_revealed'
    const alreadyRevealed = (() => { try { return localStorage.getItem(storageKey) === '1' } catch { return false } })()
    const previewReveal = new URLSearchParams(location.search).get('reveal') === '1'

    const doReveal = () => {
      document.querySelectorAll('.esconder').forEach(el => el.classList.remove('esconder'))
      try { localStorage.setItem(storageKey, '1') } catch {}
      setRevealed(true)
    }

    let revealTimer: ReturnType<typeof setTimeout> | null = null
    if (previewReveal) {
      document.querySelectorAll('.esconder').forEach(el => el.classList.remove('esconder'))
      setRevealed(true)
    } else if (alreadyRevealed) {
      doReveal()
    } else {
      revealTimer = setTimeout(doReveal, delaySeconds * 1000)
      videoRevealRef.current = (t: number) => {
        if (t > 0 && revealTimer) { clearTimeout(revealTimer); revealTimer = null }
        if (t >= delaySeconds) doReveal()
      }
      playerFallbackRef.current = () => {
        try {
          if (!revealTimer && localStorage.getItem(storageKey) !== '1') {
            revealTimer = setTimeout(doReveal, delaySeconds * 1000)
          }
        } catch {}
      }
    }

    const fn = () => setSticky(window.scrollY > 600)
    window.addEventListener('scroll', fn)
    return () => {
      window.removeEventListener('scroll', fn)
      window.removeEventListener('message', handleVturbMessage)
      if (pxIv) clearInterval(pxIv)
      if (revealTimer) clearTimeout(revealTimer)
      videoRevealRef.current = null
      playerFallbackRef.current = null
    }
  }, [])

  const cardW = 240
  const gap = 14
  const totalW = SERIES.length * (cardW + gap)

  return (
    <div style={{
      background: C.bg, color: C.white,
      fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em',
    }}>
      {/* ═══ HERO — VIDEO ═══ */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 0' }}>
        <Fade delay={0.15}>
          <div id={`ifr_${VTURB_PLAYER_ID}_wrapper`} style={{ maxWidth: 400, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ position: 'relative', paddingTop: '177.78%', background: C.bg2 }} id={`ifr_${VTURB_PLAYER_ID}_aspect`}>
              {/* Config replicada do smartplayer real: fakeBar #33ccb2 alpha 2,
                  resume #99cc33, sem scrollToAction. Textos em ES (a config
                  vturb tinha resume em PT — corrigido aqui de propósito). */}
              <VslPlayer
                media="vsl-latam"
                posterFile="poster.jpg"
                storageKey="vsl_pos_684788ed"
                scrollToActionAt={0}
                vturbPlayerId={VTURB_PLAYER_ID}
                fakeBarColor="#33ccb2"
                unmuteLabel="Haga clic para escuchar"
                resumeTitle="Ya empezaste a ver este video"
                resumeContinueLabel="¿Seguir viendo?"
                resumeRestartLabel="¿Ver desde el inicio?"
                resumeButtonColor="#99cc33"
                onVideoTime={t => videoRevealRef.current?.(t)}
                onFallback={() => {
                  try { frTrack('player_fallback_vturb') } catch {}
                  playerFallbackRef.current?.()
                }}
                onPlayerEvent={(ev, detail) => { try { frTrack(ev, detail) } catch {} }}
              />
            </div>
          </div>
          <p style={{
            textAlign: 'center', marginTop: 16, fontSize: 11,
            letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, color: C.t4,
          }}>
            Mira con sonido activado
          </p>
        </Fade>
      </section>

      <div className="esconder">
      {revealed && (<>

      {/* ═══ CTA 1 — PRICING ═══ */}
      <S narrow>
        <Fade>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Label center>ÚNETE A LA NUEVA CLASE</Label>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.t1, marginBottom: 4 }}>
              Ruta de la Fluidez Esencial
            </p>
            <p style={{ fontSize: 12, color: C.teal, marginBottom: 24 }}>
              *Últimos cupos con descuento especial
            </p>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="QUIERO ENTRAR" utms={utms} />
            </div>
          </div>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ MÉTODO ═══ */}
      <S narrow>
        <Fade>
          <div className="glow-teal" style={{ textAlign: 'center' }}>
            <Label center>METODOLOGÍA</Label>
            <h2 style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Sistema de Repetición enfocado en la <span style={{ color: C.teal }}>Internalización del Inglés en el Subconsciente</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.t2, maxWidth: 500, margin: '0 auto' }}>
              La fluidez está en el subconsciente, y la Ruta de la Fluidez Esencial tiene como objetivo internalizar lo esencial del idioma en el subconsciente a través de una metodología única de repetición continua y espaciada.
            </p>
          </div>
        </Fade>
        <Fade delay={0.15}>
          <Glass accent={C.teal} hud style={{ marginTop: 32 }}>
            <RepetitionGraph />
          </Glass>
        </Fade>
        <Fade delay={0.2}>
          <Glass accent={C.purple} hud style={{ marginTop: 16 }}>
            <p style={{
              textAlign: 'center', fontSize: 14, fontWeight: 700,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
              fontFamily: FONT.mono,
            }}>VOCABULARIO ESENCIAL</p>
            <Suspense fallback={null}><VocabCoverage /></Suspense>
            <p style={{ textAlign: 'center', fontSize: 14, color: C.t2, lineHeight: 1.6, marginTop: 8 }}>
              Con apenas <span style={{ color: C.teal, fontWeight: 700 }}>500 palabras</span> cubres
              más del <span style={{ color: C.teal, fontWeight: 700 }}>90%</span> de todas las conversaciones del día a día.
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
              El resultado de un entrenamiento concentrado...
            </h3>
            <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 20 }} />
            <div style={{ fontSize: 15, lineHeight: 1.9, color: C.t2 }}>
              <p>&#10003; Empiezas a entender a los nativos a la velocidad real.</p>
              <p>&#10003; Las palabras salen de tu boca automáticamente, sin necesidad de traducir.</p>
              <p>&#10003; Ves películas y series sin subtítulos.</p>
              <p>&#10003; Finalmente sientes que el inglés fluye con naturalidad en tu vida.</p>
              <p style={{ marginTop: 16, color: C.teal, fontWeight: 600 }}>
                ¿Y lo mejor? Puedes aplicar este método HOY y empezar a sentir la diferencia en pocos días.
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Btn text="EMPEZAR AHORA" utms={utms} />
            </div>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ FASES ═══ */}
      <S>
        <Fade>
          <Label center>FASES DE LA FLUIDEZ ESENCIAL</Label>
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
              <Btn text="QUIERO ENTRAR" utms={utms} />
            </div>
          </div>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ SERIES CAROUSEL ═══ */}
      <div className="glow-purple" style={{ overflow: 'hidden' }}>
        <S>
          <Fade>
            <Label center color={C.purple}>CONTENIDO PRÁCTICO</Label>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 600,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Las series que amas.
            </p>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.035em',
              marginBottom: 8,
            }}>
              <Grad size="inherit">Para entrenar tu inglés.</Grad>
            </p>
            <p style={{
              textAlign: 'center', fontSize: 15, color: C.t2,
              lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px',
            }}>
              Friends, HIMYM, Two and a Half Men — cada escena con material de repetición listo para que entrenes oído y habla.
            </p>
          </Fade>

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
              <Btn text="EMPEZAR AHORA" utms={utms} />
            </div>
          </Fade>
        </S>
      </div>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ COMPARAÇÃO TRADICIONAL VS RUTA ═══ */}
      <S>
        <Fade>
          <div className="rg2">
            <Glass accent={C.red}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.t1, textAlign: 'center', marginBottom: 14 }}>
                ¿Cuánto vale realmente hablar inglés?
              </h3>
              <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 14 }} />
              <div style={{ fontSize: 14, lineHeight: 1.9, color: C.t2 }}>
                <p style={{ marginBottom: 12 }}>Si intentaras aprender inglés de la forma tradicional, ¿cuánto tiempo y dinero te costaría?</p>
                <p style={{ color: C.t1 }}>Curso de inglés tradicional</p>
                <p>&#10060; Duración: 5 años</p>
                <p>&#10060; Costo promedio: USD 4.000+</p>
                <p style={{ marginBottom: 12 }}>&#10060; Método obsoleto que enseña reglas, pero no te hace hablar</p>
                <p style={{ color: C.t1 }}>Intercambio en EE.UU. o Canadá</p>
                <p>&#10060; Duración: 3 meses</p>
                <p>&#10060; Costo promedio: USD 12.000+</p>
                <p>&#10060; Sin garantía de que realmente vas a dominar el inglés</p>
              </div>
            </Glass>

            <Glass accent={C.teal} glow>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.teal, textAlign: 'center', marginBottom: 14 }}>
                Con Ruta de la Fluidez:
              </h3>
              <div style={{ fontSize: 14, lineHeight: 2, color: C.t2 }}>
                <p>&#10003; Entrenamiento Acelerado de Fluidez</p>
                <p>&#10003; Acceso al Entrenamiento Concentrado</p>
                <p>&#10003; Plan Intensivo de 90 días para destrabar tu habla</p>
                <p>&#10003; Feedback Personalizado (USD 199) — <span style={{ color: C.teal, fontWeight: 700 }}>GRATIS</span></p>
                <p>&#10003; Soporte Individual por WhatsApp (USD 159) — <span style={{ color: C.teal, fontWeight: 700 }}>GRATIS</span></p>
                <p style={{ marginTop: 12, color: C.t1, fontWeight: 700 }}>Total: Más de USD 1.000</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.teal, marginTop: 4 }}>Hoy por sólo USD 49 (pago único)</p>
              </div>
            </Glass>
          </div>
        </Fade>

        <Fade delay={0.15}>
          <Glass accent={C.teal} hud style={{ marginTop: 24 }}>
            <UsageComparisonRuta />
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ GARANTÍA ═══ */}
      <S narrow>
        <Fade>
          <Glass accent={C.yellow} glow hud>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image src="/shield-guarantee.png" alt="Garantía" width={80} height={80} style={{ margin: '0 auto' }} />
            </div>
            <Label center color={C.yellow}>GARANTÍA DE 7 DÍAS</Label>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.t1, textAlign: 'center', marginBottom: 20, lineHeight: 1.4 }}>
              Sin ningún riesgo para ti.
            </h3>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.t2 }}>
              <p style={{ marginBottom: 16 }}>
                Prueba la formación durante 7 días sin compromiso. Si en ese periodo sientes que no es para ti, basta con enviarnos un correo y te devolvemos el 100% de tu dinero. Sin preguntas, sin burocracia.
              </p>
              <p style={{ color: C.yellow, fontWeight: 700, textAlign: 'center', fontSize: 15 }}>
                La única forma de perder es si no te inscribes ahora.
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Btn text="ASEGURAR MI CUPO" utms={utms} />
            </div>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ FAQ ═══ */}
      <S narrow>
        <Fade>
          <Label center>PREGUNTAS FRECUENTES</Label>
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
              Empieza tu camino hacia la <span style={{ color: C.teal }}>fluidez esencial</span> hoy
            </h2>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="QUIERO ENTRAR" utms={utms} />
            </div>
          </div>
        </Fade>
      </S>

      <footer style={{ textAlign: 'center', padding: '48px 24px 36px', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: C.t3 }}>fluency</span><span style={{ color: C.teal }}>route</span>
        </p>
        <p style={{ fontSize: 10, color: C.t4, marginTop: 8 }}>Fluency Route · Todos los derechos reservados</p>
      </footer>

      </>)}
      </div>{/* end .esconder */}

      {/* ═══ STICKY CTA ═══ */}
      <div className={`esconder sticky-cta ${sticky ? 'show' : ''}`}>
        <Btn compact text="EMPEZAR POR USD 49" utms={utms} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CART STITCHING
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
    fbc, fbp,
    fbclid: p.get('fbclid') || undefined,
    client_ip_address: cachedIp || undefined,
    client_user_agent: getUserAgent() || undefined,
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
// CTA BUTTON — Hotmart LATAM
// ═══════════════════════════════════════════════════════════════
function Btn({ text = 'QUIERO ENTRAR', compact, utms = {} }: { text?: string; compact?: boolean; utms?: Record<string, string> }) {
  const [sid, setSid] = useState('')
  const anchorRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => { setSid(getOrCreateSessionId()) }, [])
  const checkoutUrl = (() => {
    try {
      const u = new URL(HOTMART_CHECKOUT_URL)
      Object.entries(utms).forEach(([k, v]) => u.searchParams.set(k, v))
      if (sid) u.searchParams.set('s1', sid)
      return u.toString()
    } catch {
      return HOTMART_CHECKOUT_URL
    }
  })()

  const handleMouseDown = () => {
    try {
      const a = anchorRef.current
      if (!a) return
      const u = new URL(a.href)
      const currentSck = u.searchParams.get('sck')
      if (!currentSck) return
      const { fbc, fbp } = getFbCookies()
      const p = new URLSearchParams(window.location.search)
      const payload = JSON.stringify({
        session_id: (sid || getOrCreateSessionId()) + '-click-' + Date.now().toString(36),
        fbc, fbp,
        fbclid: p.get('fbclid') || undefined,
        client_ip_address: cachedIp || undefined,
        client_user_agent: getUserAgent() || undefined,
        sck: currentSck,
        utm_source: p.get('utm_source') || undefined,
        utm_medium: p.get('utm_medium') || undefined,
        utm_campaign: p.get('utm_campaign') || undefined,
        utm_content: p.get('utm_content') || undefined,
        utm_term: p.get('utm_term') || undefined,
      })
      try {
        const blob = new Blob([payload], { type: 'application/json' })
        const ok = navigator.sendBeacon?.('/api/checkout-session', blob)
        if (!ok) throw new Error('beacon refused')
      } catch {
        fetch('/api/checkout-session', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: payload, keepalive: true,
        }).catch(() => {})
      }
    } catch {}
  }
  const handleClick = () => {
    const effectiveSid = sid || getOrCreateSessionId()
    saveCheckoutSession(effectiveSid)
    trackDual('InitiateCheckout')
  }
  return (
    <a ref={anchorRef} href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="cta-btn"
      onClick={() => { handleMouseDown(); handleClick(); }}
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
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 999,
        background: 'linear-gradient(135deg,#ff3d6e,#ff8a3d)',
        color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.3px',
        textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(255,61,110,.35)',
        marginBottom: 10,
      }}>🔥 Últimos cupos con descuento</span>
      <p style={{ fontSize: 16, color: C.t2 }}>
        De <span style={{ textDecoration: 'line-through', color: C.red }}>USD 197</span>
      </p>
      <p style={{ fontSize: 14, color: C.t2, marginTop: 6 }}>Hoy por sólo:</p>
      <p style={{
        fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: 900,
        fontFamily: FONT.mono, letterSpacing: '-0.04em',
        background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        lineHeight: 1.1, marginTop: 4,
      }}>
        USD 49
      </p>
      <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>pago único · acceso de por vida</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// REPETITION GRAPH
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
          CLASE
        </text>

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
          ENTRENAMIENTO CONCENTRADO
        </text>

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
          AUTOMÁTICO
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
// USAGE COMPARISON
// ═══════════════════════════════════════════════════════════════
function UsageComparisonRuta() {
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
            style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 800, letterSpacing: '2px' }}>ABANDONÓ</text>
        </g>

        <path d={icArea} fill="url(#ucr-teal)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.8s' }} />
        <path d={icPath} fill="none" stroke={C.teal} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.9 : 0} strokeDasharray="600" strokeDashoffset={v ? 0 : 600}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.8s, opacity 0.8s ease 0.8s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 2s' }}>
          <text x={W - padR - 30} y={icY - 14} textAnchor="end" fill={C.teal}
            style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, letterSpacing: '2px' }}>HÁBITO DIARIO</text>
        </g>

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.8s ease 2.5s' }}>
          <circle cx={W * 0.2} cy={H - 30} r="5" fill={C.red} opacity="0.6" />
          <text x={W * 0.2 + 14} y={H - 25} fill={C.t2}
            style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '1px' }}>CURSO TRADICIONAL</text>

          <circle cx={W * 0.65} cy={H - 30} r="5" fill={C.teal} opacity="0.9" />
          <text x={W * 0.65 + 14} y={H - 25} fill={C.t1}
            style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '1px' }}>RUTA DE LA FLUIDEZ</text>
        </g>

        <text x={W / 2} y={H - 50} textAnchor="middle" fill={C.t3}
          style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '3px' }}>TIEMPO →</text>
      </svg>
    </div>
  )
}
