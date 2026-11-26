'use client'
// Peças visuais compartilhadas das páginas pós-compra do espanhol (downsell e upsell 2), no DNA da /spanish/obrigado
// (upsell 1, que converte: roxo + branco, mono, grade fina, miras, régua). A /spanish/obrigado NÃO usa este arquivo: não mexer nela.
// UP_CSS é copiado da /spanish/obrigado por scripts/copiar-css-upsell.cjs (rodar de novo se o visual de lá mudar).
import { useEffect, useRef, useState } from 'react'
import { getFbCookies, getClientIp, getUserAgent, genEventId } from '../lib/pixel'

export const PIXEL_ID = '690970750622464'
export const RX = '#6D3FF2'
export const RX2 = '#9D7BFF'
export const INK = '#14111F'
export const CORAL = '#FF5C7A'
export const MONO = "'JetBrains Mono', ui-monospace, monospace"
export const SANS = "'Inter', -apple-system, sans-serif"

function getExternalId(): string {
  try {
    if (typeof document === 'undefined') return ''
    const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}

export async function trackEs(event: string, extra?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const eid = genEventId()
  const custom = { content_name: 'Essential Spanish Fluency', content_type: 'product', currency: 'USD', ...(extra || {}) }
  const fbq = (window as any).fbq
  if (typeof fbq === 'function') { fbq('init', PIXEL_ID); fbq('trackSingle', PIXEL_ID, event, custom, { eventID: eid }) }
  try {
    const { fbc, fbp } = getFbCookies()
    const ip = await getClientIp()
    fetch('/api/track-es', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, eventId: eid, fbc, fbp, external_id: getExternalId(), client_ip_address: ip, client_user_agent: getUserAgent(), ...custom }),
    }).catch(() => {})
  } catch {}
}

/** ViewContent no pixel + monta o widget da Hotmart (botões aceitar/recusar do funil) em #hotmart-sales-funnel */
export function usePosCompra(nome: string, valor: number) {
  useEffect(() => {
    let tries = 0
    let iv: ReturnType<typeof setInterval> | undefined
    const fire = () => {
      if (typeof (window as any).fbq !== 'function') return false
      trackEs('ViewContent', { content_name: nome, value: valor, source: 'upsell' })
      return true
    }
    if (!fire()) iv = setInterval(() => { if (fire() || ++tries > 40) { if (iv) clearInterval(iv) } }, 250)
    const mount = () => { try { (window as any).checkoutElements?.init('salesFunnel').mount('#hotmart-sales-funnel') } catch {} }
    if ((window as any).checkoutElements) mount()
    else { const sc = document.createElement('script'); sc.src = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js'; sc.async = true; sc.onload = mount; document.body.appendChild(sc) }
    return () => { if (iv) clearInterval(iv) }
  }, [nome, valor])
}

export function useVisto<T extends HTMLElement>() {
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

export function Bloco({ tom, children, id }: { tom: 'claro' | 'noite' | 'roxo'; children: React.ReactNode; id?: string }) {
  const { ref, v } = useVisto<HTMLElement>()
  return (
    <section id={id} ref={ref} className={`up-b up-${tom}${v ? ' up-on' : ''}`}>
      <div className="up-in">{children}</div>
    </section>
  )
}
export const Rot = ({ children }: { children: React.ReactNode }) => <p className="up-rot">{children}</p>
export const Mira = () => <><b className="up-m tl" /><b className="up-m tr" /><b className="up-m bl" /><b className="up-m br" /></>
export function Regua() {
  return (
    <div className="up-regua" aria-hidden>
      {Array.from({ length: 29 }, (_, i) => <i key={i} className={i % 7 === 0 ? 'g' : ''} style={{ left: `${(i / 28) * 100}%` }} />)}
    </div>
  )
}
export function Stack({ itens, total }: { itens: { n: string; t: string; v: string; d: string }[]; total: string }) {
  return (
    <>
      <div className="up-stack">
        {itens.map((it) => (
          <div key={it.n} className="up-item">
            <Mira />
            <div className="up-item-top"><span className="up-n">{it.n}</span><h3>{it.t}</h3><b>{it.v}</b></div>
            <p>{it.d}</p>
          </div>
        ))}
      </div>
      <div className="up-total"><span>TOTAL VALUE</span><b>{total}</b></div>
    </>
  )
}
export function Faq({ itens }: { itens: { q: string; a: string }[] }) {
  return (
    <div className="up-faq">
      {itens.map((f) => <details key={f.q}><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}
    </div>
  )
}

export const UP_CSS = `
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
      `
