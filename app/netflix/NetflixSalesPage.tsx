'use client'
// GERADO por scripts/gerar-netflix.js a partir de app/spanish/SpanishSalesPage.tsx. Editar lá (ou no gerador) e rodar de novo.
'use client'

import React, { useEffect, useRef, useState, Suspense } from 'react'
import '../vsl2/vsl.css'
import { C, FONT } from '../vsl2/design'
import { Fade, Glass, Label, S, Grad, useInView } from '../vsl2/primitives'
import { genEventId, getFbCookies, getClientIp, getUserAgent } from '../lib/pixel'
import { createTracker } from '../lib/funnel-track'
import VslPlayer from '../vsl/VslPlayer'
import PostCard, { Comentarios } from '../spanish/PostCard'
import NetflixOferta from './Oferta'
import NetflixPresell from './Presell'

// ═══════════════════════════════════════════════════════════════
// ESSENTIAL SPANISH FLUENCY — SALES PAGE (clone of RotaFluenciaPage, EN copy)
//
// Avatar: English speaker who wants to speak Spanish. Same mechanism as the
// English funnel (Essential Fluency / 500 words / concentrated + spaced
// repetition / series immersion), copy fully in English, series swapped to
// Spanish-language shows.
//
// Preço: $197 pagamento único, âncora $497. Vídeo Vturb, CAPI e checkout
// Hotmart ligados. Pendente: Purchase server-to-server via webhook Hotmart (hoje o
// Purchase é disparado na /spanish/obrigado — exige o Hotmart redirecionar pra lá).
// ═══════════════════════════════════════════════════════════════

const BRAND = 'FLUENCY ROUTE'
const COURSE = 'Essential Spanish Fluency'
// ── NETFLIX TRICK (23/11/2026): mesma página da /spanish, com a VSL nova e 3 versões de preço.
// A VSL fala o preço em voz, então CADA preço tem o seu vídeo (pasta HLS própria) e o seu checkout.
// ATENÇÃO: só o checkout de 197 dólares existe na Hotmart (é o da /spanish). 97 e 297 estão com checkout VAZIO de
// propósito: o botão não abre nada até a oferta ser criada na Hotmart e o link entrar aqui.
type Oferta = { pay: string; valor: number; checkout: string; media: string; reveal: number; tag: string }
const OFERTAS: Record<string, Oferta> = {
  '197': { pay: '$197', valor: 197, checkout: 'https://pay.hotmart.com/M94188676L?off=qp698at2', media: 'vsl-netflix-trick-197', reveal: 724, tag: 'vsl_nt197' },
  '97': { pay: '$97', valor: 97, checkout: '', media: 'vsl-netflix-trick-97', reveal: 724, tag: 'vsl_nt97' },
  '297': { pay: '$297', valor: 297, checkout: '', media: 'vsl-netflix-trick-297', reveal: 724, tag: 'vsl_nt297' },
}
let PAY = '$197'
const FROM = '$497'          // âncora (preço cheio, riscado)
let PURCHASE_VALUE = 197
let CHECKOUT = OFERTAS['197'].checkout

// UTMs propagados ad → bridge → VSL → checkout Hotmart (o Hotmart captura UTM
// nativo + src). fbclid/sck seguem junto pra atribuição.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck', 'fbclid'] as const
function getUtmsFromUrl(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const o: Record<string, string> = {}
  UTM_KEYS.forEach(k => { const v = p.get(k); if (v) o[k] = v })
  return o
}
function buildCheckoutUrl(base: string, utms: Record<string, string>): string {
  try {
    const u = new URL(base)
    Object.entries(utms).forEach(([k, v]) => u.searchParams.set(k, v))
    return u.toString()
  } catch { return base }
}

// Pixel PRÓPRIO do Spanish — isolado do pixel de inglês (938…) que o layout
// global carrega. No browser usamos trackSingle nesse ID (não vaza pro inglês);
// no servidor o CAPI usa o pixel/token próprios (/api/track-es). Mesmo eventID
// nos dois → Meta deduz (não conta dobrado). Espelha o sistema do inglês.
const PIXEL_ID = '690970750622464'

/** external_id anônimo (cookie _fluency_uid, setado pelo PageViewTracker) */
function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

/** Dispara evento no pixel do Spanish: browser (trackSingle) + CAPI (mesmo eventID). */
async function trackEs(event: string, extra?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const eid = genEventId()
  const custom = { content_name: COURSE, content_type: 'product', currency: 'USD', value: PURCHASE_VALUE, ...(extra || {}) }
  // Browser pixel (isolado no 690 via trackSingle)
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') fbq('trackSingle', PIXEL_ID, event, custom, { eventID: eid })
  // Server CAPI (mesmo eventID pra dedup)
  try {
    const { fbc, fbp } = getFbCookies()
    const ip = await getClientIp()
    fetch('/api/track-es', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event, eventId: eid, fbc, fbp,
        external_id: getExternalId(),
        client_ip_address: ip,
        client_user_agent: getUserAgent(),
        ...custom,
      }),
    }).catch(() => {})
  } catch {}
}

const PHASES = [
  {
    num: '01',
    title: 'Auditory Perception',
    icon: '👂',
    text: 'In this first phase, you sharpen your ear for Spanish. You’ll understand your first stretches of real speech using the repetition practice materials. The focus here is comprehension — not speaking yet.',
  },
  {
    num: '02',
    title: 'Conversational',
    icon: '💬',
    text: 'Here you develop your ear for real conversation. This is where you start catching linked words and fast, run-together phrases — all in the context of essential conversations, practiced in standard Spanish.',
  },
  {
    num: '03',
    title: 'Shadowing',
    icon: '🎙️',
    text: 'In phase 3 you start training with series and working on your pronunciation. You’ll learn the shadowing technique: imitating the lines already recorded in the material. Just play each line and repeat — the app handles the repetitions.',
  },
  {
    num: '04',
    title: 'Simulated Immersion',
    icon: '🌍',
    text: 'The most fun phase. Your Spanish is no longer basic and you understand almost everything. This is where IMMERSION begins — seeing and reading everything in Spanish. It’s the phase of continuous progress, where you get a little better every day until your Spanish is ESSENTIALLY FLUENT for work, travel, and clear communication.',
  },
]

const SERIES = [
  { name: 'Money Heist', detail: 'All seasons', color: C.red, img: '/spanish-series/moneyheist.jpg' },
  { name: 'Narcos', detail: 'All seasons', color: C.yellow, img: '/spanish-series/narcos.jpg' },
  { name: 'Elite', detail: 'All seasons', color: C.purple, img: '/spanish-series/elite.jpg' },
  { name: 'Who Killed Sara?', detail: 'All seasons', color: C.blue, img: '/spanish-series/quienmatoasara.jpg' },
]
const SERIES_LOOP = [...SERIES, ...SERIES, ...SERIES]

const FAQ = [
  {
    q: 'What is Essential Spanish Fluency?',
    a: 'It’s a program focused on learning Spanish in a practical way, using continuous and spaced repetition. The goal is to help you master the fundamentals of Spanish so you can communicate and understand the language without translating it in your head.',
  },
  {
    q: 'Who is it for?',
    a: 'It’s recommended for: beginners who want to learn Spanish from scratch; people who have studied Spanish but still can’t hold a conversation; and people who struggle to understand native speakers and want to improve their listening and speaking.',
  },
  {
    q: 'How does the method work?',
    a: 'It combines three things. Continuous repetition — training with ready-made materials like series clips, talks and audio, repeated until Spanish becomes internalized. Spaced repetition — reviewing the content at strategic intervals. Simulated immersion — exposure to Spanish through series, music and audio to build a continuous learning environment.',
  },
  {
    q: 'Is there support?',
    a: 'Yes. You get a direct WhatsApp channel where you can ask questions and receive personalized guidance to set up and fine-tune your training.',
  },
  {
    q: 'How much time do I need to dedicate?',
    a: 'We recommend at least 30 minutes a day to practice and review the material. Inside the program we teach you how to use spare moments to increase your exposure and accelerate your results.',
  },
  {
    q: 'How long do I have access?',
    a: 'Access is lifetime. You’ll have unlimited access to the content and can study at your own pace.',
  },
  {
    q: 'Do I need prior knowledge of Spanish?',
    a: 'No. The program is designed both for complete beginners and for people who already have a base but need to improve their fluency and confidence.',
  },
  {
    q: 'What materials are included?',
    a: 'Selected scenes from Spanish-language series like Money Heist, Narcos and Elite. Spaced-repetition decks. Audio and text to train listening and speaking. Strategies and guides to build your learning routine.',
  },
  {
    q: 'Can I access it on my phone?',
    a: 'Yes. You can access all the content on your computer, tablet or phone, so you can study wherever and whenever you want.',
  },
  {
    q: 'What is essential fluency?',
    a: 'Essential fluency is the ability to communicate and understand everyday Spanish, even without an advanced vocabulary. The focus is on how functional the language is for you — not on perfection.',
  },
  {
    q: 'Is there a satisfaction guarantee?',
    a: 'Yes. The program includes a 7-day money-back guarantee. If you’re not satisfied with the content, just request a full refund within that window.',
  },
]

// Player PRÓPRIO (mirror HLS na VPS) com failover pro embed vturb original.
// Config replicada do smartplayer real 6a6013fbc99e7e122a46664a: fakeBar
// #01eeffad alpha 2, sem scrollToAction (scrollToActionIn: 0), textos do
// resume em INGLÊS com botão #4e87a6, unmute "Click to listen".
const VTURB_PLAYER_ID = '6a6013fbc99e7e122a46664a'
// 12/11/2026: VSL SEM LEAD (molde fk1 do inglês) — HLS vsl-spanish-fk1, 20:30.
// Rollback = media 'vsl-spanish' + REVEAL_AT 1050 + chaves antigas (es_reveal_6a6013cb / vsl_pos_6a6013cb).
// Oferta original aos 1050 s caiu pra 1005 s (corte em ~/my-video/work/spanish-sem-lead/MAPA.md).
let MEDIA = OFERTAS['197'].media
let REVEAL_AT = OFERTAS['197'].reveal
let REVEAL_KEY = 'es_reveal_nt197'
let POS_KEY = 'vsl_pos_es_nt197'

// Skin "post de Instagram" igual à /vsl BR (07/11). ?skin=0 mostra o player antigo (prévia, não salva).
const SKIN_POST = (() => {
  if (typeof window === 'undefined') return true
  try { const q = new URLSearchParams(location.search).get('skin'); return !(q === '0' || q === 'off') } catch { return true }
})()
// velocidade (12/11, igual à BR: 1,1x; ?vel= sobrepõe pra prévia). Vai na tag (variant).
const RATE = (() => {
  if (typeof window === 'undefined') return 1
  try { const q = parseFloat(new URLSearchParams(location.search).get('vel') || ''); return Math.min(2, Math.max(0.5, q || 1)) } catch { return 1 }
})()
let VTAG = 'vsl_nt197' + (RATE !== 1 ? '_x' + Math.round(RATE * 100) : '') + (SKIN_POST ? '_ig' : '')

// Log interno (funnel_events) — retenção do vídeo no stats, funil spanish
let frTrack = createTracker({ funnel: 'spanish', page: 'vsl', variant: VTAG })
let ofertaAtual = '197'
function usarOferta(p: string) {
  if (p === ofertaAtual || !OFERTAS[p]) return
  const o = OFERTAS[p]; ofertaAtual = p
  PAY = o.pay; PURCHASE_VALUE = o.valor; CHECKOUT = o.checkout; MEDIA = o.media; REVEAL_AT = o.reveal
  REVEAL_KEY = 'es_reveal_nt' + p; POS_KEY = 'vsl_pos_es_nt' + p
  VTAG = o.tag + (RATE !== 1 ? '_x' + Math.round(RATE * 100) : '') + (SKIN_POST ? '_ig' : '')
  frTrack = createTracker({ funnel: 'spanish', page: 'vsl', variant: VTAG })
}

export default function NetflixSalesPage({ preco = '197' }: { preco?: string }) {
  usarOferta(preco)
  const [sticky, setSticky] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [seriesPaused, setSeriesPaused] = useState(false)
  const [showRest, setShowRest] = useState(false)
  const [revealed, setRevealed] = useState(false)
  // recebe o currentTime do VslPlayer pra revelar por tempo de vídeo assistido
  const videoRevealRef = useRef<((t: number) => void) | null>(null)
  // se o player cair pro fallback vturb, rearma o reveal por relógio
  const playerFallbackRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Sticky CTA
    const fn = () => setSticky(window.scrollY > 600)
    window.addEventListener('scroll', fn)

    // log interno (funnel_events) — abre o funil spanish no stats
    try { frTrack('pageview') } catch {}

    // Cart stitching: salva fbc/fbp/ip/ua desta sessão pro webhook do Hotmart
    // recuperar no Purchase (EMQ alto). A chave (stitchSid) vai no sck do checkout.
    try {
      if (!stitchSid) {
        stitchSid = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      }
      const { fbc, fbp } = getFbCookies()
      const u = getUtmsFromUrl()
      getClientIp().then((ip) => {
        fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: stitchSid, sck: stitchSid,
            fbc, fbp, fbclid: u.fbclid || null,
            client_ip_address: ip, client_user_agent: getUserAgent(),
            utm_source: u.utm_source, utm_medium: u.utm_medium, utm_campaign: u.utm_campaign,
            utm_content: u.utm_content, utm_term: u.utm_term,
          }),
        }).catch(() => {})
      })
    } catch {}

    // Pixel próprio do Spanish (690…). O fbq é carregado pelo layout global
    // (lazyOnload), então pode não existir ainda no mount → poll até aparecer.
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const initPixel = () => {
      const fbq = (window as any).fbq
      if (typeof fbq !== 'function') return false
      fbq('init', PIXEL_ID)
      trackEs('PageView')      // dual: browser + CAPI
      trackEs('ViewContent')   // dual: browser + CAPI
      return true
    }
    if (!initPixel()) {
      iv = setInterval(() => { if (initPixel() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)
    }

    // Monta o conteúdo (escondido via .esconder) logo após o first paint — leveza.
    const restTimer = setTimeout(() => setShowRest(true), 1400)

    // VSL FECHADA: a oferta (.esconder) só aparece aos 17:30 (1050s) do VÍDEO,
    // como no vturb (displayHiddenElements por tempo assistido). O reveal conta
    // pelo currentTime do VslPlayer (pausa pausa junto, resume continua de onde
    // parou); relógio só como rede de segurança se o vídeo nunca tocar, e no
    // failover vturb (iframe, sem acesso ao tempo) rearma por relógio.
    const isPreview = new URLSearchParams(location.search).get('reveal') === '1'
    const doReveal = () => {
      setRevealed(true)
      try { localStorage.setItem(REVEAL_KEY, '1') } catch {}
    }
    let revealTimer: ReturnType<typeof setTimeout> | null = null
    const alreadyRevealed = (() => { try { return localStorage.getItem(REVEAL_KEY) === '1' } catch { return false } })()
    if (isPreview) {
      // ?reveal=1 → mostra tudo de cara (revisão), sem esperar o vídeo
      setShowRest(true)
      setRevealed(true)
    } else if (alreadyRevealed) {
      doReveal()
    } else {
      revealTimer = setTimeout(doReveal, REVEAL_AT * 1000)
      let lastVideoTime = 0
      videoRevealRef.current = (t: number) => {
        if (t > 0 && revealTimer) { clearTimeout(revealTimer); revealTimer = null }
        if (t > lastVideoTime) lastVideoTime = t
        if (t >= REVEAL_AT) doReveal()
      }
      // fallback no meio do vídeo: relógio só pelo tempo que falta
      playerFallbackRef.current = () => {
        try {
          if (!revealTimer && localStorage.getItem(REVEAL_KEY) !== '1') {
            const falta = Math.max(0, REVEAL_AT - lastVideoTime)
            revealTimer = setTimeout(doReveal, falta * 1000)
          }
        } catch {}
      }
    }

    return () => {
      window.removeEventListener('scroll', fn)
      clearTimeout(restTimer)
      if (iv) clearInterval(iv)
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

      <NetflixPresell track={(ev, d) => { try { frTrack(ev, d) } catch {} }} posKey={POS_KEY} revealKey={REVEAL_KEY} />
      {/* ═══ HERO — VIDEO ═══ */}
      {SKIN_POST ? (
        <section style={{ background: '#fff', margin: 0, padding: '0 0 18px' }}>
          <PostCard
            caption="The Netflix trick to learn Spanish while you do other things in your day"
            variant={'es_' + VTAG}
            track={(ev, d) => frTrack(ev, d)}
            player={
              <VslPlayer
                skin="post"
                lockLabel="Content locked"
                unlockLabel="Tap to unlock"
                media={MEDIA}
                rate={RATE}
                posterFile="poster.jpg"
                storageKey={POS_KEY}
                scrollToActionAt={0}
                mp4Fallback="fallback.mp4"
                resumeTitle="You already started watching"
                resumeContinueLabel="Keep watching"
                resumeRestartLabel="Start from beginning"
                resumeButtonColor="#4e87a6"
                onVideoTime={t => videoRevealRef.current?.(t)}
                onFallback={() => {
                  try { frTrack('player_fallback_mp4') } catch {}
                  playerFallbackRef.current?.()
                }}
                onPlayerEvent={(ev, detail) => { try { frTrack(ev, detail) } catch {} }}
              />
            }
          />
          {/* comentários ficam sob o vídeo até a oferta abrir; aí descem pro fim da página */}
          {!revealed && <Comentarios variant={'es_' + VTAG} track={(ev, d) => frTrack(ev, d)} />}
        </section>
      ) : (
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 0' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.bg2 }}>
          <div style={{ position: 'relative', paddingTop: '178.148%', background: '#000' }}>
            <VslPlayer
              media={MEDIA}
                rate={RATE}
              posterFile="poster.jpg"
              storageKey={POS_KEY}
              scrollToActionAt={0}
              mp4Fallback="fallback.mp4"
              fakeBarColor="#01eeffad"
              unmuteLabel="Click to listen"
              resumeTitle="You already started watching"
              resumeContinueLabel="Keep watching"
              resumeRestartLabel="Start from beginning"
              resumeButtonColor="#4e87a6"
              onVideoTime={t => videoRevealRef.current?.(t)}
              onFallback={() => {
                try { frTrack('player_fallback_mp4') } catch {}
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
          Watch with sound on
        </p>
      </section>
      )}

      <div className={revealed ? undefined : 'esconder'}>
      {showRest && (<>

      <NetflixOferta pay={PAY} cta={(t) => <Btn text={t} />} />

      {/* ═══ FOOTER ═══ */}
      {SKIN_POST && revealed && <Comentarios fim variant={'es_' + VTAG} track={(ev, d) => frTrack(ev, d)} />}

      <footer style={{ textAlign: 'center', padding: '48px 24px 36px', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: C.t3 }}>fluency</span><span style={{ color: '#9D7BFF' }}>route</span>
        </p>
        <p style={{ fontSize: 10, color: C.t4, marginTop: 8 }}>{BRAND} · All rights reserved</p>
      </footer>

      </>)}
      </div>{/* end .esconder */}

      {/* ═══ STICKY CTA (escondido até o reveal do vídeo) ═══ */}
      <div className={`${revealed ? '' : 'esconder '}sticky-cta ${sticky ? 'show' : ''}`}>
        <Btn compact text={`Get access now · ${PAY}`} />
      </div>

      <style>{`.esconder{display:none}`}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CTA BUTTON — points to checkout (placeholder). No pixel tracking.
// ═══════════════════════════════════════════════════════════════
// InitiateCheckout dispara UMA vez por carregamento de página — NÃO a cada
// clique de CTA. A página tem 7 botões (incl. o sticky sempre visível); sem
// esta trava, um único visitante clicando em vários CTAs gera vários IC e
// infla o funil (e sabota a otimização da campanha no Meta). A navegação
// (href) segue funcionando em todo clique; só o evento é que não se repete.
let icFired = false
let stitchSid = ''

function Btn({ text = 'I WANT IN', compact }: { text?: string; compact?: boolean }) {
  const [href, setHref] = useState(CHECKOUT)
  useEffect(() => { setHref(buildCheckoutUrl(CHECKOUT, getUtmsFromUrl())) }, [])
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // injeta nosso session_id no sck do checkout (Hotmart repassa como source_sck no webhook)
    try {
      if (!CHECKOUT) { e.preventDefault(); return }
      if (stitchSid) e.currentTarget.href = buildCheckoutUrl(CHECKOUT, { ...getUtmsFromUrl(), sck: stitchSid })
    } catch {}
    if (icFired) return
    icFired = true
    trackEs('InitiateCheckout')
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="cta-btn"
      onClick={onClick}
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
      }}>🔥 Last spots at a discount</span>
      <p style={{ fontSize: 16, color: C.t2 }}>
        Normally <span style={{ textDecoration: 'line-through', color: C.red }}>{FROM}</span>
      </p>
      <p style={{ fontSize: 14, color: C.t2, marginTop: 6 }}>Today, just:</p>
      <p style={{
        fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: 900,
        fontFamily: FONT.mono, letterSpacing: '-0.04em',
        background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        lineHeight: 1.1, marginTop: 4,
      }}>
        {PAY}
      </p>
      <p style={{ fontSize: 14, color: C.t1, marginTop: 2, fontWeight: 600 }}>
        One-time payment · lifetime access
      </p>
      <p style={{ fontSize: 12, color: C.t3, marginTop: 6 }}>No subscription · secure checkout</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// REPETITION GRAPH — ONE LESSON 1x vs CONCENTRATED TRAINING 30-40x
// ═══════════════════════════════════════════════════════════════
function RepetitionGraph() {
  const { ref, v } = useInView(0.15)

  return (
    <div ref={ref} style={{ position: 'relative', padding: '24px 0' }}>
      <svg viewBox="0 0 500 360" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="rg-teal-es" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-purple-es" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.purple} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-red-es" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.6" />
          </linearGradient>
          <filter id="rg-glow-es">
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
          rx="5" fill="url(#rg-red-es)"
          style={{ transition: 'all 1.2s cubic-bezier(.16,1,.3,1) 0.3s' }}
        />
        <text x="145" y="250" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 32, fontWeight: 800, opacity: v ? 0.7 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
          1x
        </text>
        <text x="145" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1s' }}>
          ONE LESSON
        </text>

        <rect
          x="270" y={v ? 50 : 215} width="140" height={v ? 165 : 0}
          rx="5" fill="url(#rg-purple-es)" filter="url(#rg-glow-es)"
          style={{ transition: 'all 1.8s cubic-bezier(.16,1,.3,1) 0.6s' }}
        />
        <text x="340" y="250" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 38, fontWeight: 800, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s' }}>
          30-40x
        </text>
        <text x="340" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.7s' }}>
          CONCENTRATED TRAINING
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
            style={{ animation: `dopFloatEs ${p.dur} ease-in-out ${p.delay} infinite` }}
          />
        ))}

        <text x="340" y="35" textAnchor="middle" style={{ fontSize: 30 }}>🧠</text>

        <text x="145" y="320" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.6 : 0, transition: 'opacity 0.8s ease 2s' }}>
          NOT ENOUGH
        </text>
        <text x="340" y="320" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.9 : 0, transition: 'opacity 0.8s ease 2s' }}>
          AUTOMATIC
        </text>
      </svg>

      <style>{`
        @keyframes dopFloatEs {
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
// VOCAB COVERAGE — 500 words = 90% of conversations (EN)
// ═══════════════════════════════════════════════════════════════
function VocabCoverage() {
  const { ref, v } = useInView(0.2)

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const target = 0.91
  const offset = circumference * (1 - (v ? target : 0))

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg viewBox="0 0 200 200" style={{ width: 220, height: 220, transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="vc-grad-es" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.teal} />
              <stop offset="100%" stopColor={C.purple} />
            </linearGradient>
            <filter id="vc-glow-es">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r={radius}
            fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
          <circle cx="100" cy="100" r={radius}
            fill="none" stroke="url(#vc-grad-es)" strokeWidth="16"
            strokeLinecap="round" filter="url(#vc-glow-es)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.3s' }} />
        </svg>

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: FONT.mono, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 900,
            background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s',
          }}>90%</span>
          <span style={{
            fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase',
            color: C.t3, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.8s',
          }}>of conversations</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginTop: 20,
        opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, boxShadow: `0 0 8px ${C.teal}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.t2, letterSpacing: 1 }}>500 WORDS</span>
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.t4, letterSpacing: 1 }}>REMAINING</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// USAGE COMPARISON — Traditional course (quit) vs Fluency Route (daily habit)
// ═══════════════════════════════════════════════════════════════
function UsageComparison() {
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
          <linearGradient id="ucr-red-es" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ucr-teal-es" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        <path d={tradArea} fill="url(#ucr-red-es)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.3s' }} />
        <path d={tradPath} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.7 : 0} strokeDasharray="500" strokeDashoffset={v ? 0 : 500}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.16,1,.3,1) 0.3s, opacity 0.8s ease 0.3s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 1.5s' }}>
          <line x1={padL + 210} y1={padT} x2={padL + 210} y2={H - padB} stroke={C.red} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <text x={padL + 210} y={padT - 8} textAnchor="middle" fill={C.red}
            style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 800, letterSpacing: '2px' }}>QUIT</text>
        </g>

        <path d={icArea} fill="url(#ucr-teal-es)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.8s' }} />
        <path d={icPath} fill="none" stroke={C.teal} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.9 : 0} strokeDasharray="600" strokeDashoffset={v ? 0 : 600}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.8s, opacity 0.8s ease 0.8s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 2s' }}>
          <text x={W - padR - 30} y={icY - 14} textAnchor="end" fill={C.teal}
            style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, letterSpacing: '2px' }}>DAILY HABIT</text>
        </g>

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.8s ease 2.5s' }}>
          <circle cx={W * 0.2} cy={H - 30} r="5" fill={C.red} opacity="0.6" />
          <text x={W * 0.2 + 14} y={H - 25} fill={C.t2}
            style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '1px' }}>TRADITIONAL COURSE</text>

          <circle cx={W * 0.66} cy={H - 30} r="5" fill={C.teal} opacity="0.9" />
          <text x={W * 0.66 + 14} y={H - 25} fill={C.t1}
            style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '1px' }}>FLUENCY ROUTE</text>
        </g>

        <text x={W / 2} y={H - 50} textAnchor="middle" fill={C.t3}
          style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '3px' }}>TIME →</text>
      </svg>
    </div>
  )
}
