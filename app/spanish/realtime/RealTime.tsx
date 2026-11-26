'use client'
// /spanish/realtime — UPSELL 2 do Netflix Trick (26/11/2026): REAL TIME TALK, plano anual US$297.
// Quem aceitou o Fast-Track vê aqui o tutor particular por VOZ em tempo real (Manuela, IA), 3 aulas faladas por semana por 12 meses.
// Botões = widget Hotmart (funil SPANISH MENTORSHIP). ⚠️ O preço tem que BATER com a oferta do upsell 2 no painel Hotmart.
import { useEffect, useState } from 'react'
import { Bloco, Rot, Regua, Stack, Faq, Mira, usePosCompra, useVisto, UP_CSS, RX, RX2, CORAL, SANS, MONO, INK } from '../upsell-ui'

const PRICE = '$297'
const PRICE_NUM = 297

// a ligação que roda na tela (show, don't tell): fala dela, resposta dele, correção na hora
const FALAS: { q: 'm' | 'u'; es: string; en?: string; fix?: string }[] = [
  { q: 'm', es: '¡Hola! Estamos en una taquería en la Ciudad de México. ¿Qué vas a pedir?', en: 'We are at a taco place in Mexico City. What will you order?' },
  { q: 'u', es: 'Quiero… dos taco de pastor, por favor.' },
  { q: 'm', es: '¡Muy bien! Solo un detalle: dos tacos, con "s". ¿Los quieres con todo?', fix: 'dos taco → dos tacos' },
  { q: 'u', es: 'Sí, con todo. ¡Y una agua de horchata!' },
  { q: 'm', es: '¡Perfecto! Tu pronunciación de "horchata" fue excelente. 👏', en: 'Your pronunciation of "horchata" was excellent.' },
]

function Ligacao() {
  const { ref, v } = useVisto<HTMLDivElement>()
  const [n, setN] = useState(0)
  const [seg, setSeg] = useState(132)
  useEffect(() => {
    if (!v) return
    const reduz = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduz) { setN(FALAS.length); return }
    let i = 0
    const t = setInterval(() => { i++; setN(i); if (i >= FALAS.length) clearInterval(t) }, 1700)
    const c = setInterval(() => setSeg((s) => s + 1), 1000)
    return () => { clearInterval(t); clearInterval(c) }
  }, [v])
  const mm = String(Math.floor(seg / 60)).padStart(2, '0'), ss = String(seg % 60).padStart(2, '0')
  return (
    <div ref={ref} className="rt-fone">
      <Mira />
      <div className="rt-top">
        <span className="rt-av">M</span>
        <div><b>Manuela</b><small>Real Time Talk · {mm}:{ss}</small></div>
        <span className="rt-live"><i />LIVE</span>
      </div>
      <div className="rt-onda" aria-hidden>{Array.from({ length: 28 }, (_, k) => <i key={k} style={{ animationDelay: `${(k % 7) * 0.09}s` }} />)}</div>
      <div className="rt-falas">
        {FALAS.slice(0, Math.max(1, n)).map((f, k) => (
          <div key={k} className={`rt-f ${f.q}`}>
            <p>{f.es}</p>
            {f.en && <small>{f.en}</small>}
            {f.fix && <em>✎ {f.fix}</em>}
          </div>
        ))}
      </div>
      <div className="rt-bts"><span className="rt-mic">🎙 Hold to talk</span><span className="rt-fim">End</span></div>
    </div>
  )
}

const CENAS = ['Ordering tacos', 'Hotel check-in', 'Asking for directions', 'At the doctor', 'A first date', 'Job interview', 'Meeting the in-laws', 'Small talk at work', 'Calling to complain', 'Your favorite series']

const STACK = [
  { n: '01', t: '3 live voice lessons a week, all year', v: '$3,900', d: '156 private spoken lessons, 15 minutes each, whenever you want. A human tutor at $25 a lesson would cost $3,900 for the same year.' },
  { n: '02', t: '50+ real-life scenes', v: '$297', d: 'Tacos, hotels, doctors, dates, job interviews. You practice the exact conversations you will actually have.' },
  { n: '03', t: 'Corrections on the spot', v: '$400', d: 'She hears every word. When something comes out wrong, she shows you the right way and has you say it again, right there.' },
  { n: '04', t: 'Weekly report + fluency score', v: '$200', d: 'Every week: what you nailed, what to fix, and your speaking score going up. Proof you are getting better.' },
  { n: '05', t: 'Talks at your level, never judges', v: 'priceless', d: 'Slow when you need it, faster as you grow. 3 a.m. on a Sunday? She picks up. No awkwardness, no pressure.' },
]

const FAQ = [
  { q: 'Is Manuela a real person?', a: 'Manuela is our A.I. tutor, trained on the Fluency Route method. That is why she is there at any hour, never gets tired and never judges. She talks with you by voice, in real time, like a phone call.' },
  { q: 'Do I need to install anything?', a: 'No. It opens in your phone browser from your personal link. Put your headphones on, tap the microphone, talk.' },
  { q: 'How is this different from the Fast-Track?', a: 'The Fast-Track is your plan and your weekly Accent Check. Real Time Talk is a live, two-way conversation. You speak, she answers, you speak again. It is the closest thing to living in a Spanish-speaking country.' },
  { q: 'Is it a subscription?', a: 'No. One payment covers 12 months. Nothing renews automatically.' },
  { q: 'What if it is not for me?', a: '7-day guarantee. Try a few lessons. If it is not for you, email us within 7 days for a full refund, no questions.' },
]

export default function RealTime() {
  usePosCompra('Real Time Talk · annual (upsell 2)', PRICE_NUM)
  const toOffer = () => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div className="up" style={{ fontFamily: SANS, minHeight: '100vh', background: '#FBFAFF' }}>
      <div className="up-aviso"><span className="up-ponto" />Your Fast-Track is in. One last upgrade, shown once.</div>

      <Bloco tom="claro">
        <Rot>Last step · the one that makes you talk</Rot>
        <h1 className="up-h1">Now <em>talk</em> Spanish.<br />Out loud. Every week.</h1>
        <p className="up-p">The Fast-Track trains your ear and gives you a plan. But fluency is a conversation, and <strong>you cannot practice a conversation alone</strong>. Real Time Talk gives you a private tutor you can call anytime: Manuela talks with you in Spanish, <strong>by voice, in real time</strong>, at your level, and fixes your mistakes on the spot.</p>
        <Ligacao />
        <p className="up-nota">A real lesson, live. You talk, she answers, she corrects, you go again.</p>
        <button className="up-cta" onClick={toOffer}>Add Real Time Talk · {PRICE}/year</button>
      </Bloco>

      <Bloco tom="noite">
        <Rot>How it works</Rot>
        <h2 className="up-h2">3 steps, <em>15 minutes</em></h2>
        <div className="rt-passos">
          <div><b>1</b><p><strong>Pick a scene</strong>Tacos, a hotel, a first date, a job interview.</p></div>
          <div><b>2</b><p><strong>Talk for 15 minutes</strong>Manuela plays the other person and keeps the conversation going.</p></div>
          <div><b>3</b><p><strong>Get your report</strong>What you nailed, what to fix, your score going up.</p></div>
        </div>
        <div className="rt-cenas">{CENAS.map((c) => <span key={c}>{c}</span>)}</div>
      </Bloco>

      <Bloco tom="claro">
        <Rot>Everything you get for 12 months</Rot>
        <h2 className="up-h2">A private tutor, <em>all year</em></h2>
        <div className="rt-claro"><Stack itens={STACK} total="$4,797" /></div>
      </Bloco>

      <Bloco tom="roxo" id="offer">
        <Rot>Real Time Talk · 12 months · one-time only</Rot>
        <div className="up-conta">
          <div><span>Human tutor, 3x a week, 1 year</span><b><s>$3,900</s></b></div>
          <div><span>Real Time Talk, normally</span><b><s>$597</s></b></div>
          <div className="sub"><span>That is less than $1 a day</span><b>$0.81/day</b></div>
        </div>
        <p className="up-front">Only on this page, today:</p>
        <div className="up-num">{PRICE}</div>
        <Regua />
        <p className="up-unico">12 months · one payment · never shown again</p>
        <div id="hotmart-sales-funnel" className="up-widget" />
        <div className="up-gar"><span>7-DAY GUARANTEE</span>Try a few lessons. If it is not for you, email us within 7 days: full refund, no questions.</div>
        <p className="up-recusa">Decline and you keep practicing on your own. This price never comes back.</p>
      </Bloco>

      <Bloco tom="claro">
        <Rot>Quick questions</Rot>
        <Faq itens={FAQ} />
        <button className="up-cta" onClick={toOffer}>Add Real Time Talk for {PRICE}/year</button>
        <p className="up-rodape"><b>fluency</b><span>route</span> · All rights reserved</p>
      </Bloco>

      <style>{UP_CSS + `
.rt-fone{position:relative;max-width:360px;margin:4px auto 0;background:linear-gradient(180deg,#1B1430,#0E0A1C);border-radius:30px;padding:18px 16px 16px;box-shadow:0 30px 60px -30px rgba(43,22,112,.75),0 0 0 6px #0B0816;text-align:left;color:#fff}
.rt-fone .up-m{border-color:${RX2}}
.rt-top{display:flex;align-items:center;gap:10px}
.rt-av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,${RX},${CORAL});font:900 18px ${SANS}}
.rt-top b{display:block;font:800 16px ${SANS}}.rt-top small{display:block;font:600 12px ${MONO};color:rgba(255,255,255,.6)}
.rt-live{margin-left:auto;display:flex;align-items:center;gap:6px;font:700 11px ${MONO};letter-spacing:1.5px;color:#FF8FA3}
.rt-live i{width:8px;height:8px;border-radius:50%;background:${CORAL};animation:upPulso 1.6s infinite}
.rt-onda{display:flex;align-items:center;justify-content:center;gap:3px;height:38px;margin:12px 0 10px}
.rt-onda i{width:4px;height:30%;border-radius:2px;background:${RX2};animation:rtOnda 1s ease-in-out infinite alternate}
@keyframes rtOnda{to{height:100%}}
.rt-falas{display:flex;flex-direction:column;gap:8px;min-height:250px}
.rt-f{max-width:86%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.4;animation:rtEntra .35s ease-out both}
.rt-f.m{align-self:flex-start;background:rgba(255,255,255,.09);border-top-left-radius:4px}
.rt-f.u{align-self:flex-end;background:${RX};border-top-right-radius:4px}
.rt-f p{margin:0;color:#fff}.rt-f small{display:block;margin-top:3px;color:rgba(255,255,255,.55);font-size:12px}
.rt-f em{display:inline-block;margin-top:6px;font:700 11px ${MONO};font-style:normal;color:#0E0A1C;background:#C9F2D6;padding:3px 7px;border-radius:6px}
@keyframes rtEntra{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.rt-bts{display:flex;gap:8px;margin-top:12px}
.rt-mic{flex:1;text-align:center;background:#fff;color:${INK};font:800 14px ${SANS};padding:12px;border-radius:999px}
.rt-fim{background:${CORAL};color:#fff;font:800 14px ${SANS};padding:12px 18px;border-radius:999px}
.rt-passos{display:grid;gap:10px;text-align:left}
.rt-passos div{display:grid;grid-template-columns:38px 1fr;gap:12px;align-items:start;padding:16px;border:1.5px solid var(--fio);border-radius:12px;background:var(--pn)}
.rt-passos b{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:${RX};color:#fff;font:900 17px ${SANS}}
.rt-passos p{margin:0;font-size:15px;line-height:1.45;color:var(--tx2)}.rt-passos strong{display:block;color:var(--tx);font-size:17px;margin-bottom:2px}
.rt-cenas{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:22px}
.rt-cenas span{font:600 13px ${SANS};padding:8px 12px;border-radius:999px;border:1.5px solid var(--fio);color:var(--tx)}
.rt-claro .up-total b{color:${INK}}
@media (prefers-reduced-motion:reduce){.rt-onda i,.rt-f,.rt-live i{animation:none}}
      `}</style>
    </div>
  )
}
