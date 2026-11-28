'use client'

import { useEffect, useRef, useState } from 'react'
import { getFbCookies, getClientIp, getUserAgent, genEventId } from '../../lib/pixel'

// ═══════════════════════════════════════════════════════════════
// /spanish/obrigado — UPSELL (OTO) pós-compra do espanhol (/trick, /netflix, /spanish).
// 23/11/2026: visual refeito na identidade da VSL nova (roxo + branco, mono, grade fina, miras, régua), MESMA copy e
// mesma oferta. Botões aceitar/recusar = widget Hotmart (funil "SPANISH MENTORSHIP", produto Premium Coaching).
// Purchase é server-side (webhook). Aqui só ViewContent (retarget).
// ⚠️ O PREÇO exibido tem que BATER com a oferta de upsell no painel Hotmart (ewtgb4zl, US$ 127).
// ═══════════════════════════════════════════════════════════════
const PIXEL_ID = '690970750622464'
const OFFER = 'Fluency Fast-Track'
const PRICE = '$127'           // = preço da oferta de upsell no Hotmart
const FROM = '$497'            // âncora
const VALUE = '$1,994'         // soma do stack
const FRONT = '$147'           // o que a pessoa acabou de pagar (26/11: VSL Sophia US$147); não aparece mais na conta da oferta
const PRICE_NUM = 127

const RX = '#6D3FF2'
const RX2 = '#9D7BFF'
const INK = '#14111F'
const CORAL = '#FF5C7A'
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Inter', -apple-system, sans-serif"

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

async function trackEs(event: string, extra?: Record<string, unknown>, deterministicId?: string) {
  if (typeof window === 'undefined') return
  const eid = deterministicId || genEventId()
  const custom = { content_name: 'Essential Spanish Fluency', content_type: 'product', currency: 'USD', ...(extra || {}) }
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') { fbq('init', PIXEL_ID); fbq('trackSingle', PIXEL_ID, event, custom, { eventID: eid }) }
  try {
    const { fbc, fbp } = getFbCookies()
    const ip = await getClientIp()
    fetch('/api/track-es', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event, eventId: eid, fbc, fbp,
        external_id: getExternalId(), client_ip_address: ip, client_user_agent: getUserAgent(), ...custom,
      }),
    }).catch(() => {})
  } catch {}
}

const STACK = [
  { n: '01', t: 'Everything unlocked', v: '$997', d: 'Every series, every real-content episode, now and every one we add. The full native-content library, not the starter set.' },
  { n: '02', t: 'Your 90-Day Speaking Plan', v: '$297', d: 'The exact day-by-day path from drilling to actually talking. No guessing what to do next: just open it and train.' },
  { n: '03', t: 'Pronunciation feedback', v: '$400', d: 'Every week you record a few lines and our A.I. pronunciation coach scores every single word and shows you exactly what to fix. The small corrections you literally cannot hear on your own.' },
  { n: '04', t: 'Private accountability group', v: '$300', d: 'A small, closed room of serious learners plus weekly challenges. When someone is watching, you show up, and showing up is 90% of it.' },
  { n: '05', t: 'Free updates', v: 'priceless', d: 'Everything we build lands in your account automatically. You pay once, today, and never again.' },
]

const FAQ = [
  { q: 'Why add this if I have the app?', a: 'The app is the method. The Fast-Track is the reason you finish it: the full content, a clear plan, and someone checking your progress. That is the gap between "bought a course" and "speaks Spanish".' },
  { q: 'Total beginner, is it for me?', a: 'Especially. Beginners get the most from a clear plan and early feedback, because bad habits are cheap to fix now and expensive later.' },
  { q: 'What if it is not for me?', a: '7-day guarantee. Try it. If it is not moving you, email us within 7 days for a full refund, every cent, no questions.' },
]

function useVisto<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setV(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect() } }, { threshold: 0, rootMargin: '0px 0px -12% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, v }
}

function Bloco({ tom, children, id }: { tom: 'claro' | 'noite' | 'roxo'; children: React.ReactNode; id?: string }) {
  const { ref, v } = useVisto<HTMLElement>()
  return (
    <section id={id} ref={ref} className={`up-b up-${tom}${v ? ' up-on' : ''}`}>
      <div className="up-in">{children}</div>
    </section>
  )
}
const Rot = ({ children }: { children: React.ReactNode }) => <p className="up-rot">{children}</p>
const Mira = () => <><b className="up-m tl" /><b className="up-m tr" /><b className="up-m bl" /><b className="up-m br" /></>
function Regua() {
  return (
    <div className="up-regua" aria-hidden>
      {Array.from({ length: 29 }, (_, i) => <i key={i} className={i % 7 === 0 ? 'g' : ''} style={{ left: `${(i / 28) * 100}%` }} />)}
    </div>
  )
}

// ── Gráfico: sozinho (desiste) vs. com o Fast-Track (fala) ──
function GapChart() {
  const { ref, v } = useVisto<HTMLDivElement>()
  const alone = 'M40 250 C120 250 150 150 195 150 C245 150 265 238 320 246'
  const coach = 'M40 250 C170 250 250 120 460 66'
  return (
    <div ref={ref} className="up-chart">
      <Mira />
      <svg viewBox="0 0 500 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1="40" x2="470" y1={70 + i * 36} y2={70 + i * 36} stroke="rgba(20,17,31,.06)" />)}
        <line x1="40" y1="250" x2="470" y2="250" stroke="rgba(20,17,31,.25)" strokeWidth="1.5" />
        <path d={alone} fill="none" stroke={CORAL} strokeWidth="4" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={v ? 0 : 600} style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) .2s' }} />
        <circle cx="320" cy="246" r="6" fill={CORAL} opacity={v ? 1 : 0} style={{ transition: 'opacity .4s 1.6s' }} />
        <text x="332" y="240" fill={CORAL} style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, opacity: v ? 1 : 0, transition: 'opacity .5s 1.7s' }}>YOU QUIT</text>
        <path d={coach} fill="none" stroke={RX} strokeWidth="5" strokeLinecap="round" strokeDasharray="620" strokeDashoffset={v ? 0 : 620} style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.16,1,.3,1) .5s' }} />
        <circle cx="460" cy="66" r="7" fill={RX} opacity={v ? 1 : 0} style={{ transition: 'opacity .4s 2.2s' }} />
        <text x="450" y="48" textAnchor="end" fill={RX} style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, opacity: v ? 1 : 0, transition: 'opacity .5s 2.3s' }}>YOU SPEAK</text>
        <text x="46" y="280" fill="rgba(20,17,31,.55)" style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '1.5px' }}>ALONE</text>
        <text x="196" y="280" fill={RX} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '1.5px', opacity: v ? 1 : 0, transition: 'opacity .6s 2s' }}>WITH THE FAST-TRACK</text>
        <text x="470" y="280" textAnchor="end" fill="rgba(20,17,31,.4)" style={{ fontFamily: MONO, fontSize: 12 }}>90 DAYS</text>
      </svg>
    </div>
  )
}

export default function ThankYou() {
  useEffect(() => {
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      if (typeof (window as any).fbq !== 'function') return false
      trackEs('ViewContent', { content_name: 'Fluency Fast-Track (upsell)', value: PRICE_NUM, source: 'upsell' })
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)

    let script: HTMLScriptElement | null = null
    const mountWidget = () => { try { (window as any).checkoutElements?.init('salesFunnel').mount('#hotmart-sales-funnel') } catch {} }
    if ((window as any).checkoutElements) mountWidget()
    else { script = document.createElement('script'); script.src = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js'; script.async = true; script.onload = mountWidget; document.body.appendChild(script) }
    return () => { if (iv) clearInterval(iv) }
  }, [])

  const toOffer = () => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="up" style={{ fontFamily: SANS, minHeight: '100vh', background: '#FBFAFF' }}>
      {/* aviso fixo */}
      <div className="up-aviso"><span className="up-ponto" />WAIT: your order isn&apos;t finished. This upgrade is shown once.</div>

      {/* 1. GANCHO + GRÁFICO */}
      <Bloco tom="claro">
        <Rot>Order confirmed · add this before you go</Rot>
        <h1 className="up-h1">Alone, most people <span style={{ color: CORAL }}>quit</span>.<br />With this, you <em>speak</em>.</h1>
        <p className="up-p">You have the method. The one thing that decides whether it works is what happens over the next 90 days, and doing it alone is where almost everyone falls off. So here is your one-time chance to add the <strong>Fast-Track</strong>: everything unlocked, a day-by-day plan, and real feedback. It is already on your order. One tap adds it.</p>
        <GapChart />
        <p className="up-nota">Same method. The difference is the plan, the feedback, and someone keeping you on track.</p>
        <button className="up-cta" onClick={toOffer}>Add the Fast-Track · {PRICE}</button>
      </Bloco>

      {/* 2. O QUE DESTRAVA */}
      <Bloco tom="noite">
        <Rot>Everything you unlock today</Rot>
        <h2 className="up-h2">5 things that make you <em>finish</em></h2>
        <div className="up-stack">
          {STACK.map((it) => (
            <div key={it.n} className="up-item">
              <Mira />
              <div className="up-item-top"><span className="up-n">{it.n}</span><h3>{it.t}</h3><b>{it.v}</b></div>
              <p>{it.d}</p>
            </div>
          ))}
        </div>
        <div className="up-total"><span>TOTAL VALUE</span><b>{VALUE}</b></div>
      </Bloco>

      {/* 3. OFERTA + BOTÕES REAIS DA HOTMART */}
      <Bloco tom="roxo" id="offer">
        <Rot>{OFFER} · one-time only</Rot>
        {/* a conta (Marcos 23/11): a mentoria custa 497; comprador ganha 50% e desconta o que já investiu; e só nesta página fecha em 127 */}
        <div className="up-conta">
          <div><span>Premium Coaching, normally</span><b>{FROM}</b></div>
          <div><span>Your 50% buyer discount</span><b className="menos">−$248.50</b></div>
          {/* 26/11: o front agora é US$147 (VSL Sophia) e 497−248,50−147 dava menos que o preço final; a linha "minus what you invested" saiu */}
          <div className="sub"><span>Your price</span><b><s>$248.50</s></b></div>
        </div>
        <p className="up-front">Only on this page, today:</p>
        <div className="up-num">{PRICE}</div>
        <Regua />
        <p className="up-unico">one-time · one tap · never shown again</p>
        <div id="hotmart-sales-funnel" className="up-widget" />
        <div className="up-gar"><span>7-DAY GUARANTEE</span>Try it. If it is not moving you, email us within 7 days: full refund, no questions.</div>
        <p className="up-recusa">Decline and you go it alone, the coral line above. This price never comes back.</p>
      </Bloco>

      {/* 4. PERGUNTAS */}
      <Bloco tom="claro">
        <Rot>Quick questions</Rot>
        <div className="up-faq">
          {FAQ.map((f) => (
            <details key={f.q}><summary>{f.q}<i /></summary><p>{f.a}</p></details>
          ))}
        </div>
        <button className="up-cta" onClick={toOffer}>Add the Fast-Track for {PRICE}</button>
        <p className="up-rodape"><b>fluency</b><span>route</span> · All rights reserved</p>
      </Bloco>

      <style>{`
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&display=swap");
.up{color:${INK};letter-spacing:-.01em}
.up-aviso{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:center;gap:10px;background:${INK};color:#fff;font:700 13px/1.3 ${SANS};padding:11px 16px;text-align:center}
.up-ponto{width:8px;height:8px;border-radius:50%;background:${CORAL};box-shadow:0 0 0 0 rgba(255,92,122,.7);animation:upPulso 1.6s infinite;flex:none}
@keyframes upPulso{70%{box-shadow:0 0 0 8px rgba(255,92,122,0)}100%{box-shadow:0 0 0 0 rgba(255,92,122,0)}}
.up-b{position:relative;padding:54px 22px;overflow:hidden}
.up-in{position:relative;max-width:540px;margin:0 auto;text-align:center;opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.7,.2,1)}
.up-on .up-in{opacity:1;transform:none}
.up-claro{background:#FBFAFF;color:${INK};--tx:${INK};--tx2:rgba(20,17,31,.64);--ac:${RX};--fio:rgba(20,17,31,.12);--pn:#fff;--gr:rgba(109,63,242,.07)}
.up-noite{background:linear-gradient(180deg,#0D0B14,#08070D);color:#fff;--tx:#fff;--tx2:rgba(255,255,255,.64);--ac:${RX2};--fio:rgba(255,255,255,.14);--pn:rgba(255,255,255,.04);--gr:rgba(255,255,255,.035)}
.up-roxo{background:linear-gradient(180deg,#2B1670,#150A3A);color:#fff;--tx:#fff;--tx2:rgba(255,255,255,.72);--ac:#C9B6FF;--fio:rgba(255,255,255,.2);--pn:rgba(255,255,255,.06);--gr:rgba(255,255,255,.045)}
.up-b::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--gr) 1px,transparent 1px),linear-gradient(90deg,var(--gr) 1px,transparent 1px);background-size:44px 44px;pointer-events:none}
.up-b::after{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--ac),transparent);transform:translateX(-100%);pointer-events:none}
.up-on::after{animation:upVarre 1s ease-out forwards}
@keyframes upVarre{to{transform:translateX(100%)}}
.up-rot{font-family:${MONO};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--tx2);margin:0 0 14px}
.up-h1{font-size:clamp(32px,8.6vw,46px);line-height:1.04;font-weight:800;letter-spacing:-.04em;color:var(--tx);margin:0 0 18px}
.up-h2{font-size:clamp(28px,7.6vw,38px);line-height:1.05;font-weight:800;letter-spacing:-.04em;color:var(--tx);margin:0 0 26px}
.up-h1 em,.up-h2 em{font-style:normal;color:var(--ac)}
.up-p{font-size:17px;line-height:1.6;color:var(--tx2);margin:0 0 22px;text-align:left}
.up-p strong{color:var(--tx);font-weight:800}
.up-m{position:absolute;width:14px;height:14px;border:2px solid var(--ac);pointer-events:none}
.up-m.tl{left:8px;top:8px;border-right:0;border-bottom:0}.up-m.tr{right:8px;top:8px;border-left:0;border-bottom:0}
.up-m.bl{left:8px;bottom:8px;border-right:0;border-top:0}.up-m.br{right:8px;bottom:8px;border-left:0;border-top:0}
.up-chart{position:relative;background:#fff;border:1.5px solid var(--fio);border-radius:14px;padding:22px 14px 12px;box-shadow:0 22px 50px -36px rgba(20,17,31,.55)}
.up-nota{font-size:14px;color:var(--tx2);margin:12px 0 22px;line-height:1.5}
.up-cta{appearance:none;border:1px solid rgba(255,255,255,.28);cursor:pointer;width:100%;background:${RX};color:#fff;font:800 17px/1 ${SANS};padding:20px;border-radius:12px;box-shadow:0 18px 44px -14px rgba(109,63,242,.85);letter-spacing:-.01em}
.up-cta:active{transform:scale(.98)}
.up-stack{display:grid;gap:12px;text-align:left}
.up-item{position:relative;padding:20px 20px 18px;background:var(--pn);border:1.5px solid var(--fio);border-radius:12px}
.up-item-top{display:flex;align-items:baseline;gap:12px}
.up-n{font-family:${MONO};font-size:13px;font-weight:700;color:var(--ac)}
.up-item h3{flex:1;font-size:19px;font-weight:800;letter-spacing:-.03em;margin:0;color:var(--tx)}
.up-item b{font-family:${MONO};font-size:13px;font-weight:700;color:var(--ac);white-space:nowrap}
.up-item p{font-size:15px;line-height:1.5;color:var(--tx2);margin:8px 0 0}
.up-total{display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;padding:16px 4px 0;border-top:1.5px solid var(--fio)}
.up-total span{font-family:${MONO};font-size:12px;letter-spacing:2px;color:var(--tx2)}
.up-total b{font-size:30px;font-weight:900;letter-spacing:-.04em;color:#fff}
.up-de{font-size:16px;color:var(--tx2);margin:0 0 6px}
.up-de s{color:#fff;opacity:.7;text-decoration-thickness:2.5px;text-decoration-color:${CORAL}}
.up-conta{margin:4px auto 18px;max-width:420px;text-align:left;border:1.5px solid var(--fio);border-radius:12px;background:var(--pn);padding:6px 16px}
.up-conta div{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:11px 0;border-bottom:1px dashed var(--fio);font-size:15px;color:var(--tx2)}
.up-conta div:last-child{border-bottom:0}
.up-conta b{font-family:${MONO};font-size:16px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}
.up-conta b.menos{color:#C9B6FF}
.up-conta .sub span{color:#fff;font-weight:700}
.up-conta s{text-decoration-thickness:2.5px;text-decoration-color:#FF5C7A;opacity:.8}
.up-front{font-size:15px;color:#fff;margin:0 0 6px;font-weight:600}
.up-num{font-size:clamp(66px,20vw,92px);line-height:.95;font-weight:900;letter-spacing:-.05em;color:#fff;font-variant-numeric:tabular-nums}
.up-regua{position:relative;width:min(220px,60%);height:16px;margin:12px auto 0;border-top:2px solid rgba(255,255,255,.55)}
.up-regua i{position:absolute;top:0;width:2px;height:7px;background:rgba(255,255,255,.5)}
.up-regua i.g{height:13px;background:#C9B6FF}
.up-unico{font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--tx2);margin:12px 0 0}
.up-widget{margin:24px auto 0;min-height:60px;max-width:440px;background:#fff;border-radius:12px;padding:6px}
.up-gar{margin-top:20px;text-align:left;font-size:14.5px;line-height:1.5;color:var(--tx2);padding:13px 15px;border-left:3px solid #C9B6FF;background:rgba(255,255,255,.06);border-radius:0 8px 8px 0}
.up-gar span{display:block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:#C9B6FF;margin-bottom:4px}
.up-recusa{font-size:13px;color:var(--tx2);margin:16px 0 0;font-style:italic;line-height:1.5}
.up-faq{text-align:left;display:grid;gap:10px;margin-bottom:26px}
.up-faq details{background:var(--pn);border:1.5px solid var(--fio);border-radius:10px;padding:0 18px}
.up-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:18px 0;font-size:17px;font-weight:700;color:var(--tx)}
.up-faq summary::-webkit-details-marker{display:none}
.up-faq summary i{flex:none;width:10px;height:10px;border-right:2.5px solid ${RX};border-bottom:2.5px solid ${RX};transform:rotate(45deg);margin-top:-4px;transition:transform .2s}
.up-faq details[open] summary i{transform:rotate(-135deg);margin-top:4px}
.up-faq details p{margin:0;padding:0 0 18px;font-size:16px;line-height:1.5;color:var(--tx2)}
.up-rodape{font-size:11px;color:var(--tx2);margin:30px 0 0}
.up-rodape b{font-weight:800}.up-rodape span{color:${RX};font-weight:800}
@media (prefers-reduced-motion:reduce){.up-in{opacity:1;transform:none;transition:none}.up-on::after{animation:none}}
      `}</style>
    </div>
  )
}
