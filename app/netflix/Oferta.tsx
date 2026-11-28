'use client'
// Página de OFERTA da VSL "The Netflix Trick" (23/11/2026). Escrita à mão (não é gerada): o gerador
// scripts/gerar-netflix.js só encaixa este componente no lugar do miolo antigo da /spanish.
// Visual = o da VSL: roxo + branco, mono de sistema, miras, grade fina. Copy curta: a VSL já vendeu,
// aqui é fechar. Tudo que aparece é REAL: gravação do app, contagem do acervo (public/es-series.json),
// fases e garantias com as palavras da VSL.
import React, { useEffect, useRef, useState } from 'react'
import Iphone from './Iphone'

const RX = '#6D3FF2'
const RX2 = '#9D7BFF'
const INK = '#14111F'
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Inter', -apple-system, sans-serif"

// acervo real do app (conferido contra public/es-series.json em 23/11/2026)
const ACERVO = [
  { img: '/netflix/moneyheist.jpg', nome: 'Money Heist', eps: 6, cenas: 765 },
  { img: '/netflix/elite.jpg', nome: 'Elite', eps: 3, cenas: 443 },
  { img: '/netflix/narcos.jpg', nome: 'Narcos', eps: 4, cenas: 469 },
]

// as etapas do treino, na ordem em que a pessoa faz no app. Cada vídeo é um trecho da MESMA gravação do app real.
const PASSOS: [string, string, string, string][] = [
  ['Pick a real episode', 'Money Heist, Elite or Narcos. Everyday conversations, the Spanish people actually use.', 'Essential Spanish', 'The part of the language spoken 90% of the time.'],
  ['Watch one scene, no subtitles', 'It sounds like one big blur, all glued together. That is exactly where everybody starts.', 'Your starting point', 'You hear how much your ear catches today.'],
  ['Tap repeat', 'Same scene. Again. And again. Your ear starts separating the words.', 'Focused training', 'One scene on repeat, instead of a bunch of random stuff.'],
  ['Turn on the script', 'ES shows exactly what they said. EN only if you need the meaning.', 'No guessing', 'You connect the sound to the words, with no mental translation.'],
  ['Rate the scene', "Didn't get it brings the scene back in a minute. Easy brings it back in 3 days.", 'Spaced repetition', 'The app decides when you review, so it sticks.'],
  ['Say the line', 'You mimic the character. A.I. scores your pronunciation on the spot.', 'Shadowing', 'You copy how native speakers actually talk.'],
  ['Train with just your earbuds', 'Audio mode plays each scene 3 times, screen off, while you do other things.', 'The Netflix trick', 'Your ear keeps training while you drive or work out.'],
]

function Passo({ i, p }: { i: number; p: [string, string, string, string] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); setVisivel(true); return }
    // o vídeo só toca enquanto a etapa está na tela (7 vídeos tocando juntos pesam no celular)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setOn(true)
      setVisivel(e.isIntersecting)
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`nt-passo${on ? ' on' : ''}`}>
      <div className="nt-passo-n"><span>STEP</span><b>{String(i + 1).padStart(2, '0')}</b><i /></div>
      <h3>{p[0]}</h3>
      {/* mesmo iPhone ultrarrealista da presell (moldura renderizada + app real na tela) */}
      <div className="nt-iphone"><Iphone src={`/netflix/step${i + 1}.mp4`} poster={`/netflix/step${i + 1}.jpg`} w={240} tocar={visivel} /></div>
      <p className="nt-passo-t">{p[1]}</p>
      <div className="nt-porque"><span>{p[2]}</span>{p[3]}</div>
    </div>
  )
}

const FASES = [
  ['Ear training', 'Real scenes on repeat, until native speakers stop sounding too fast.'],
  ['Speech training', 'You mimic the line. A.I. scores your pronunciation on the spot.'],
  ['The route to immersion', 'Movies, series and podcasts you actually like, with no subtitles.'],
]

const FAQ = [
  ['Do I need to know any Spanish?', 'No. It works from zero, and it works if you studied before and still freeze in a conversation.'],
  ['How much time do I need?', 'About 30 minutes a day. The audio mode lets you train with just your earbuds while you do other things.'],
  ['Is it a subscription?', 'No. One single payment for 1 full year of access. Nothing renews automatically.'],
  ['Does it work on my phone?', 'Yes. Phone, tablet or computer.'],
  ['How do I get a refund?', 'Inside Hotmart, with a single click, within 7 days. No questions and no forms.'],
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

function Bloco({ tom, children }: { tom: 'claro' | 'noite' | 'roxo'; children: React.ReactNode }) {
  const { ref, v } = useVisto<HTMLElement>()
  return (
    <section ref={ref} className={`nt-b nt-${tom}${v ? ' nt-on' : ''}`}>
      <div className="nt-in">{children}</div>
    </section>
  )
}

const Rot = ({ children }: { children: React.ReactNode }) => <p className="nt-rot">{children}</p>

function Regua() {
  return (
    <div className="nt-regua" aria-hidden>
      {Array.from({ length: 29 }, (_, i) => <i key={i} className={i % 7 === 0 ? 'g' : ''} style={{ left: `${(i / 28) * 100}%` }} />)}
    </div>
  )
}

function Mira() {
  return <><b className="nt-m tl" /><b className="nt-m tr" /><b className="nt-m bl" /><b className="nt-m br" /></>
}

// parcela em 3x lida na Hotmart (Estados Unidos selecionado) em 23/11/2026: US$ 197 = 3x 70,70 · US$ 97 = 3x 34,81
const PARCELA_HOTMART: Record<string, string> = { '$197': '$70.70', '$97': '$34.81', '$147': '$52.75' }  // 147 = 3x 52,75 (Hotmart, 26/11)
const parcela = (pay: string) => PARCELA_HOTMART[pay] || pay
// 26/11: VSL da Sophia fala US$ 147 (âncoras 3.000/1.500 na própria VSL); site = de 497 por 147. Parcela de 147: ler no checkout e pôr no PARCELA_HOTMART (sem valor a linha some).
// âncora = o preço que a VSL fala (US$ 197); o site dá o desconto pra 97 (estratégia do Marcos, 23/11). Antes: 497.
const DE = (pay: string) => (pay === '$97' ? '$197' : '$497')

function Preco({ pay }: { pay: string }) {
  return (
    <div className="nt-preco">
      <p className="nt-vagas">*Last spots at a special discount</p>
      <div className="nt-de">from <s>{DE(pay)}</s> for</div>
      <div className="nt-num">{pay}</div>
      <Regua />
      <p className="nt-unico">single payment</p>
      {PARCELA_HOTMART[pay] && <p className="nt-parc">or <b>3 payments of {parcela(pay)}</b></p>}
    </div>
  )
}

export default function NetflixOferta({ pay, cta }: { pay: string; cta: (texto: string) => React.ReactNode }) {
  const total = ACERVO.reduce((a, s) => a + s.cenas, 0)
  return (
    <div className="nt">
      {/* 1. PREÇO */}
      <Bloco tom="roxo">
        <Rot>The complete training</Rot>
        <h2 className="nt-h">Essential Spanish Fluency</h2>
        <Preco pay={pay} />
        <div className="nt-cta">{cta('Get access now')}</div>
        <p className="nt-selo">Secure checkout · 7-day money back</p>
      </Bloco>

      {/* 2. O APP REAL */}
      <Bloco tom="claro">
        <Rot>Inside the app</Rot>
        <h2 className="nt-h">How you train, <em>in the real app</em></h2>
        <p className="nt-lead">7 steps. One scene at a time. Every screen below is a recording of the app.</p>
        <div className="nt-passos7">
          {PASSOS.map((p, i) => <Passo key={p[0]} i={i} p={p} />)}
        </div>
        <div className="nt-cta">{cta('Get access now')}</div>
      </Bloco>

      {/* 3. O ACERVO */}
      <Bloco tom="noite">
        <Rot>What you train with</Rot>
        <h2 className="nt-h">Real scenes <em>from series</em></h2>
        <div className="nt-series">
          {ACERVO.map((s) => (
            <div key={s.nome} className="nt-serie">
              <img src={s.img} alt={s.nome} loading="lazy" />
              <div className="nt-serie-v" />
              <strong>{s.nome}</strong>
              <span>Complete episodes · {s.cenas} scenes</span>
            </div>
          ))}
        </div>
        <div className="nt-total">
          <div><b className="nt-txt">Complete</b><span>episodes</span></div>
          <div><b>{total.toLocaleString('en-US')}</b><span>scenes ready to train</span></div>
        </div>
      </Bloco>

      {/* 4. AS 3 FASES */}
      <Bloco tom="claro">
        <Rot>What you get by joining</Rot>
        <h2 className="nt-h">3 phases to <em>essential fluency</em></h2>
        <div className="nt-fases">
          {FASES.map(([t, d], i) => (
            <div key={t} className="nt-fase" style={{ transitionDelay: `${i * 90}ms` }}>
              <Mira />
              <span className="nt-chip">PHASE {i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </Bloco>

      {/* 5. COMPARAÇÃO */}
      <Bloco tom="noite">
        <Rot>Just look around</Rot>
        <h2 className="nt-h">Less than <em>one month</em> of a traditional school</h2>
        <div className="nt-comp">
          <div className="nt-linha"><span>Traditional course, every month</span><b>$500+</b></div>
          <div className="nt-barra"><i className="cheia" /></div>
          <div className="nt-linha nt-nossa"><span>Your complete training, once</span><b>{pay}</b></div>
          <div className="nt-barra"><i className="nossa" style={{ width: `${Math.min(100, (parseInt(pay.replace(/\D/g, ''), 10) / 500) * 100)}%` }} /></div>
        </div>
        <div className="nt-cta">{cta('Get access now')}</div>
      </Bloco>

      {/* 6. GARANTIAS */}
      <Bloco tom="roxo">
        <Rot>Your risk: zero</Rot>
        <h2 className="nt-h">2 guarantees</h2>
        <div className="nt-gar">
          <div className="nt-g">
            <div className="nt-anel"><b>7</b><span>DAYS</span></div>
            <h3>Try everything</h3>
            <p>Not for you? 100% of your money back. No questions, no forms, a single click inside Hotmart.</p>
          </div>
          <div className="nt-g">
            <div className="nt-anel"><b>90</b><span>DAYS</span></div>
            <h3>Apply it for real</h3>
            <p>Apply the method. If your listening has not improved dramatically, we give back your entire investment.</p>
          </div>
        </div>
      </Bloco>

      {/* 7. PERGUNTAS */}
      <Bloco tom="claro">
        <Rot>Before you join</Rot>
        <h2 className="nt-h">Quick answers</h2>
        <div className="nt-faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<i /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </Bloco>

      {/* 8. FECHO */}
      <Bloco tom="roxo">
        <Rot>The decision is yours</Rot>
        <h2 className="nt-h">Train Spanish the right way, today</h2>
        <Preco pay={pay} />
        <div className="nt-cta">{cta('Get access now')}</div>
        <p className="nt-selo">Secure checkout · 7-day money back</p>
      </Bloco>

      <style>{`
.nt{font-family:${SANS};letter-spacing:-.01em}
.nt-b{position:relative;padding:64px 22px;overflow:hidden}
.nt-in{position:relative;max-width:520px;margin:0 auto;text-align:center;opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
.nt-on .nt-in{opacity:1;transform:none}
.nt-claro{background:#FBFAFF;color:${INK};--tx:${INK};--tx2:rgba(20,17,31,.62);--ac:${RX};--fio:rgba(20,17,31,.12);--pn:#fff;--gr:rgba(109,63,242,.07)}
.nt-noite{background:linear-gradient(180deg,#0D0B14,#08070D);color:#fff;--tx:#fff;--tx2:rgba(255,255,255,.62);--ac:${RX2};--fio:rgba(255,255,255,.14);--pn:rgba(255,255,255,.04);--gr:rgba(255,255,255,.035)}
.nt-roxo{background:linear-gradient(180deg,#2B1670,#150A3A);color:#fff;--tx:#fff;--tx2:rgba(255,255,255,.7);--ac:#C9B6FF;--fio:rgba(255,255,255,.2);--pn:rgba(255,255,255,.06);--gr:rgba(255,255,255,.045)}
.nt-b::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--gr) 1px,transparent 1px),linear-gradient(90deg,var(--gr) 1px,transparent 1px);background-size:44px 44px;pointer-events:none}
.nt-b::after{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--ac),transparent);transform:translateX(-100%);pointer-events:none}
.nt-on::after{animation:ntVarre 1s ease-out forwards}
@keyframes ntVarre{to{transform:translateX(100%)}}
.nt-rot{font-family:${MONO};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--tx2);margin:0 0 14px}
.nt-h{font-size:clamp(30px,8.4vw,42px);line-height:1.04;font-weight:800;letter-spacing:-.04em;color:var(--tx);margin:0 0 28px}
.nt-h em{font-style:normal;color:var(--ac)}
.nt-preco{margin:6px 0 26px}
.nt-anc-r{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:var(--tx2);margin:0 0 10px}
.nt-anc{display:flex;justify-content:center;align-items:baseline;gap:18px;margin-bottom:22px}
.nt-anc s{font-size:40px;font-weight:800;letter-spacing:-.04em;color:rgba(255,255,255,.5);text-decoration-thickness:3px;text-decoration-color:#FF5C7A}
.nt-anc s+s{font-size:32px}
.nt-parc{font-size:16px;color:#fff;margin:12px 0 0;opacity:.92}.nt-parc b{font-weight:800;color:#C9B6FF}
.nt-de{font-size:22px;font-weight:600;color:rgba(255,255,255,.8);margin:0 0 4px}.nt-de s{font-size:30px;font-weight:800;letter-spacing:-.03em;color:rgba(255,255,255,.62);text-decoration-thickness:3px;text-decoration-color:#FF5C7A;margin:0 4px}
.nt-hoje{font-size:17px;font-weight:600;color:#fff;margin:0 0 6px}
.nt-mini{font-size:14px;line-height:1.4;color:var(--tx2);margin:8px auto 0;max-width:300px}
.nt-num{font-size:clamp(60px,18vw,84px);line-height:.95;font-weight:900;letter-spacing:-.05em;color:#fff;font-variant-numeric:tabular-nums}
.nt-regua{position:relative;width:min(200px,56%);height:16px;margin:14px auto 0;border-top:2px solid rgba(255,255,255,.55)}
.nt-regua i{position:absolute;top:0;width:2px;height:7px;background:rgba(255,255,255,.5)}
.nt-regua i.g{height:13px;background:#C9B6FF}
.nt-unico{font-size:19px;font-weight:700;color:#fff;margin:12px 0 0;letter-spacing:-.02em}
.nt-cta{margin-top:26px}
.nt-selo{font-family:${MONO};font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:var(--tx2);margin:16px 0 0}
.nt .cta-btn,.sticky-cta .cta-btn{background:${RX};color:#fff;border-radius:10px;border:1px solid rgba(255,255,255,.28);font-size:16px;letter-spacing:.2px;text-transform:none;font-weight:800;box-shadow:0 18px 44px -14px rgba(109,63,242,.85),0 0 0 1px rgba(109,63,242,.4)}
.nt-roxo .cta-btn{background:#fff;color:${RX};box-shadow:0 18px 44px -14px rgba(0,0,0,.6)}
.nt-m{position:absolute;width:14px;height:14px;border:2px solid var(--ac);pointer-events:none}
.nt-m.tl{left:8px;top:8px;border-right:0;border-bottom:0}.nt-m.tr{right:8px;top:8px;border-left:0;border-bottom:0}
.nt-m.bl{left:8px;bottom:8px;border-right:0;border-top:0}.nt-m.br{right:8px;bottom:8px;border-left:0;border-top:0}
.nt-fone{position:relative;width:min(300px,82%);margin:0 auto 30px;padding:10px;border-radius:30px;background:#0B0A12;box-shadow:0 30px 70px -28px rgba(109,63,242,.75),0 0 0 1.5px rgba(109,63,242,.35)}
.nt-fone video{display:block;width:100%;border-radius:22px;aspect-ratio:780/1300;object-fit:cover;background:#0B0A12}
.nt-fone .nt-m{border-color:#9D7BFF;width:18px;height:18px}
.nt-fone .nt-m.tl,.nt-fone .nt-m.bl{left:-14px}.nt-fone .nt-m.tr,.nt-fone .nt-m.br{right:-14px}
.nt-fone .nt-m.tl,.nt-fone .nt-m.tr{top:-14px}.nt-fone .nt-m.bl,.nt-fone .nt-m.br{bottom:-14px}
.nt-iphone{margin:0 auto 22px}
.nt-vagas{font-size:13px;font-weight:600;color:#C9B6FF;margin:0 0 18px;letter-spacing:.01em}
.nt-lead{font-size:17px;line-height:1.45;color:var(--tx2);margin:-12px auto 34px;max-width:420px}
.nt-passos7{display:grid;gap:18px}
.nt-passo{position:relative;padding:26px 20px 22px;background:var(--pn);border:1.5px solid var(--fio);border-radius:14px;box-shadow:0 22px 50px -36px rgba(20,17,31,.55);opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.7,.2,1)}
.nt-passo.on{opacity:1;transform:none}
.nt-passo-n{display:flex;align-items:center;gap:10px;font-family:${MONO};color:var(--ac)}
.nt-passo-n span{font-size:11px;font-weight:700;letter-spacing:3px}
.nt-passo-n b{font-size:26px;font-weight:700;letter-spacing:-1px;color:var(--tx)}
.nt-passo-n i{flex:1;height:1.5px;background:linear-gradient(90deg,var(--ac),transparent)}
.nt-passo h3{font-size:28px;line-height:1.06;font-weight:800;letter-spacing:-.04em;color:var(--tx);margin:12px 0 22px;text-align:left}
.nt-passo .nt-fone{width:min(250px,74%);margin:0 auto 24px;padding:8px;border-radius:26px}
.nt-passo .nt-fone video{border-radius:19px}
.nt-passo-t{font-size:17px;line-height:1.45;color:var(--tx);margin:0 0 14px;text-align:left;font-weight:500}
.nt-porque{text-align:left;font-size:15px;line-height:1.4;color:var(--tx2);padding:12px 14px;border-left:3px solid var(--ac);background:rgba(109,63,242,.06);border-radius:0 8px 8px 0}
.nt-porque span{display:block;font-family:${MONO};font-size:10.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ac);margin-bottom:4px}
.nt-tag{position:absolute;left:50%;transform:translateX(-50%);bottom:-13px;font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:2px;background:${RX};color:#fff;padding:5px 10px;border-radius:4px;white-space:nowrap}
.nt-passos{list-style:none;margin:0;padding:0;text-align:left;display:grid;gap:10px}
.nt-passos li{display:flex;gap:14px;align-items:flex-start;padding:16px 16px;background:var(--pn);border:1.5px solid var(--fio);border-radius:10px;font-size:16.5px;line-height:1.4;color:var(--tx2)}
.nt-passos li span{font-family:${MONO};font-weight:700;font-size:13px;color:var(--ac);padding-top:3px}
.nt-passos strong{color:var(--tx);font-weight:800}
.nt-series{display:grid;gap:12px}
.nt-serie{position:relative;height:132px;border-radius:12px;overflow:hidden;border:1.5px solid var(--fio);text-align:left}
.nt-serie img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.nt-serie-v{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.86),rgba(0,0,0,.1) 85%)}
.nt-serie strong{position:absolute;left:18px;bottom:36px;font-size:30px;font-weight:800;letter-spacing:-.04em;color:#fff}
.nt-serie span{position:absolute;left:18px;bottom:16px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#C9B6FF}
.nt-total{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.nt-total div{padding:18px 10px;border:1.5px solid var(--fio);border-radius:12px;background:var(--pn)}
.nt-total b{display:block;font-size:46px;line-height:1;font-weight:900;letter-spacing:-.05em;color:#fff;font-variant-numeric:tabular-nums}
.nt-total b.nt-txt{font-size:30px;letter-spacing:-.04em;line-height:1.5}
.nt-total span{display:block;margin-top:8px;font-family:${MONO};font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2)}
.nt-fases{display:grid;gap:12px;text-align:left}
.nt-fase{position:relative;padding:24px 22px 22px;background:var(--pn);border:1.5px solid var(--fio);border-radius:12px;box-shadow:0 18px 40px -30px rgba(20,17,31,.5)}
.nt-chip{display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:#fff;background:${RX};padding:5px 10px;border-radius:5px}
.nt-fase h3{font-size:25px;font-weight:800;letter-spacing:-.035em;margin:12px 0 6px;color:var(--tx)}
.nt-fase p{font-size:16px;line-height:1.45;margin:0;color:var(--tx2)}
.nt-comp{padding:22px 20px;border:1.5px solid var(--fio);border-radius:12px;background:var(--pn);text-align:left}
.nt-linha{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:15px;color:var(--tx2)}
.nt-linha b{font-size:22px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
.nt-nossa{margin-top:20px}.nt-nossa span{color:#fff;font-weight:700}.nt-nossa b{color:${RX2}}
.nt-barra{height:14px;border-radius:4px;background:rgba(255,255,255,.1);margin-top:8px;overflow:hidden}
.nt-barra i{display:block;height:100%;width:0;transition:width 1.1s cubic-bezier(.2,.7,.2,1) .25s}
.nt-barra i.cheia{background:rgba(255,255,255,.5)}.nt-on .nt-barra i.cheia{width:100%}
.nt-barra i.nossa{background:${RX2}}.nt-b:not(.nt-on) .nt-barra i.nossa{width:0!important}
.nt-gar{display:grid;gap:14px}
.nt-g{padding:26px 22px;border:1.5px solid var(--fio);border-radius:12px;background:var(--pn)}
.nt-anel{width:124px;height:124px;border-radius:50%;border:5px solid #fff;margin:0 auto 16px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.nt-anel b{font-size:56px;line-height:.9;font-weight:900;letter-spacing:-.05em}
.nt-anel span{font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:3px;margin-top:4px}
.nt-g h3{font-size:25px;font-weight:800;letter-spacing:-.035em;margin:0 0 8px}
.nt-g p{font-size:16px;line-height:1.45;margin:0;color:var(--tx2)}
.nt-faq{text-align:left;display:grid;gap:10px}
.nt-faq details{background:var(--pn);border:1.5px solid var(--fio);border-radius:10px;padding:0 18px}
.nt-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:18px 0;font-size:17px;font-weight:700;color:var(--tx)}
.nt-faq summary::-webkit-details-marker{display:none}
.nt-faq summary i{flex:none;width:10px;height:10px;border-right:2.5px solid ${RX};border-bottom:2.5px solid ${RX};transform:rotate(45deg);transition:transform .2s;margin-top:-4px}
.nt-faq details[open] summary i{transform:rotate(-135deg);margin-top:4px}
.nt-faq details p{margin:0;padding:0 0 18px;font-size:16px;line-height:1.5;color:var(--tx2)}
@media (prefers-reduced-motion:reduce){.nt-in{opacity:1;transform:none;transition:none}.nt-on::after{animation:none}.nt-barra i{transition:none}}
      `}</style>
    </div>
  )
}
