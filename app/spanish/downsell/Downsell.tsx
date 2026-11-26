'use client'
// /spanish/downsell — DOWNSELL do Netflix Trick (26/11/2026): quem RECUSA o Fast-Track (US$127) vê o Fast-Track LITE (US$47):
// plano de 90 dias + Accent Check semanal + desafios, SEM a Manuela coach no WhatsApp. Botões = widget Hotmart (funil SPANISH MENTORSHIP).
// ⚠️ O preço tem que BATER com a oferta do downsell no painel Hotmart.
import { Bloco, Rot, Regua, Stack, Faq, usePosCompra, useVisto, UP_CSS, RX, CORAL, SANS, MONO, INK } from '../upsell-ui'

const PRICE = '$47'
const PRICE_NUM = 47

const STACK = [
  { n: '01', t: 'Your 90-Day Speaking Plan', v: '$297', d: 'One mission a day, built around your level and your time. Ear first, then mouth, then real conversations. You never wonder what to do next.' },
  { n: '02', t: 'Weekly A.I. Accent Check', v: '$400', d: 'Say 5 lines out loud every week. Our A.I. scores every single word, shows you what to fix, and charts your accent week by week.' },
  { n: '03', t: 'Daily missions + streak', v: '$100', d: 'Tap "done", keep the streak alive. The small daily win that keeps you coming back on day 30, not just day 3.' },
]

const FAQ = [
  { q: 'What is the difference from the Fast-Track?', a: 'Lite has the plan, the Accent Check and the daily missions. It does not include Manuela, the personal coach on WhatsApp. Everything else that keeps you on track is here.' },
  { q: 'Total beginner, is it for me?', a: 'Yes. The plan starts at zero and grows with you. Beginners get the most from knowing exactly what to do each day.' },
  { q: 'What if it is not for me?', a: '7-day guarantee. If it is not moving you, email us within 7 days for a full refund, no questions.' },
]

const LINHAS: [string, boolean, boolean][] = [
  ['90-Day Speaking Plan', true, true],
  ['Weekly A.I. Accent Check', true, true],
  ['Daily missions + streak', true, true],
  ['Weekly challenge', true, true],
  ['Manuela, personal coach on WhatsApp', true, false],
]

function Comparativo() {
  const { ref, v } = useVisto<HTMLDivElement>()
  return (
    <div ref={ref} className="dw-cmp">
      <div className="dw-head"><span /><b>Fast-Track<s>$127</s></b><b className="lite">Lite<em>{PRICE}</em></b></div>
      {LINHAS.map(([t, a, b], i) => (
        <div key={t} className="dw-row" style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(8px)', transition: `all .45s cubic-bezier(.2,.7,.2,1) ${0.15 + i * 0.12}s` }}>
          <span>{t}</span>
          <i className={a ? 'ok' : 'no'}>{a ? '✓' : '—'}</i>
          <i className={b ? 'ok lite' : 'no'}>{b ? '✓' : '—'}</i>
        </div>
      ))}
      <p className="dw-pe">Everything that keeps you on track, for a third of the price.</p>
    </div>
  )
}

export default function Downsell() {
  usePosCompra('Fluency Fast-Track Lite (downsell)', PRICE_NUM)
  const toOffer = () => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div className="up" style={{ fontFamily: SANS, minHeight: '100vh', background: '#FBFAFF' }}>
      <div className="up-aviso"><span className="up-ponto" />WAIT: one smaller option before you go. Shown once.</div>

      <Bloco tom="claro">
        <Rot>Totally fair · here is the lighter version</Rot>
        <h1 className="up-h1">Keep the <em>plan</em>.<br />Skip the price.</h1>
        <p className="up-p">No problem saying no to the full Fast-Track. But please don&apos;t leave without the part that keeps most people going: <strong>knowing exactly what to do every single day</strong>, and seeing your accent get better week after week. That is <strong>Fast-Track Lite</strong>, and it is a third of the price.</p>
        <Comparativo />
        <button className="up-cta" onClick={toOffer}>Add Fast-Track Lite · {PRICE}</button>
      </Bloco>

      <Bloco tom="noite">
        <Rot>What you get today</Rot>
        <h2 className="up-h2">The 3 things that make you <em>finish</em></h2>
        <Stack itens={STACK} total="$797" />
      </Bloco>

      <Bloco tom="roxo" id="offer">
        <Rot>Fast-Track Lite · one-time only</Rot>
        <div className="up-conta">
          <div><span>Full Fast-Track</span><b><s>$127</s></b></div>
          <div><span>Without the WhatsApp coach</span><b className="menos">−$80</b></div>
        </div>
        <p className="up-front">Only on this page, today:</p>
        <div className="up-num">{PRICE}</div>
        <Regua />
        <p className="up-unico">one-time · one tap · never shown again</p>
        <div id="hotmart-sales-funnel" className="up-widget" />
        <div className="up-gar"><span>7-DAY GUARANTEE</span>Try it. If it is not moving you, email us within 7 days: full refund, no questions.</div>
        <p className="up-recusa">Decline and you keep the app on your own. This option is not shown again.</p>
      </Bloco>

      <Bloco tom="claro">
        <Rot>Quick questions</Rot>
        <Faq itens={FAQ} />
        <button className="up-cta" onClick={toOffer}>Add Fast-Track Lite for {PRICE}</button>
        <p className="up-rodape"><b>fluency</b><span>route</span> · All rights reserved</p>
      </Bloco>

      <style>{UP_CSS + `
.dw-cmp{position:relative;background:#fff;border:1.5px solid rgba(20,17,31,.12);border-radius:14px;padding:16px 14px 14px;margin:6px 0 22px;box-shadow:0 22px 50px -36px rgba(20,17,31,.55);text-align:left}
.dw-head,.dw-row{display:grid;grid-template-columns:1fr 78px 78px;align-items:center;gap:6px}
.dw-head{padding:0 4px 10px;border-bottom:1.5px solid rgba(20,17,31,.12)}
.dw-head b{display:flex;flex-direction:column;align-items:center;font:800 13px/1.2 ${SANS};color:${INK};letter-spacing:-.01em}
.dw-head b s{font:600 12px ${MONO};color:rgba(20,17,31,.45);margin-top:2px}
.dw-head b.lite{color:${RX}}.dw-head b.lite em{font:800 15px ${MONO};font-style:normal;color:${RX};margin-top:2px}
.dw-row{padding:11px 4px;border-bottom:1px dashed rgba(20,17,31,.1);font-size:15px;color:${INK}}
.dw-row:last-of-type{border-bottom:0}
.dw-row i{font-style:normal;text-align:center;font:800 16px ${SANS}}
.dw-row i.ok{color:rgba(20,17,31,.55)}.dw-row i.ok.lite{color:${RX}}.dw-row i.no{color:${CORAL}}
.dw-pe{margin:12px 2px 0;font-size:14px;color:rgba(20,17,31,.6);text-align:center}
      `}</style>
    </div>
  )
}
