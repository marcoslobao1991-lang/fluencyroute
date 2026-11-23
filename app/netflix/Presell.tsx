'use client'
// PLAY em forma de PRESELL da /netflix (23/11/2026), modelado no da /friends (scripts/gerar-vsl-friends.js, MODO 'quiz'):
// tela clara de quiz cobrindo a página, "Netflix Trick" no topo, celular com a gravação real do app, um botão.
// Qualquer toque na tela = VSL do início COM SOM (evento window 'vsl:start', ouvido pelo VslPlayer).
// Não pode parecer que tem VSL por baixo: sem pergunta, sem player à vista, só o botão.
// Quem já começou a assistir (posição salva) ou já abriu a oferta não vê a presell. `?modo=cadeado` desliga.
import React, { useEffect, useState } from 'react'

const RX = '#6D3FF2'

export default function NetflixPresell({ track, posKey, revealKey }: { track: (ev: string, detail?: string) => void; posKey: string; revealKey: string }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    let ver = true
    try {
      const q = new URLSearchParams(location.search)
      const modo = q.get('modo')
      if (modo && modo !== 'quiz' && modo !== 'presell') ver = false
      if (q.get('reveal') === '1') ver = false
      if ((parseFloat(localStorage.getItem(posKey) || '0') || 0) > 0) ver = false
      if (localStorage.getItem(revealKey) === '1') ver = false
    } catch {}
    if (!ver) { setShow(false); try { track('play_modo', 'cadeado') } catch {} ; return }
    try { track('play_modo', 'presell') } catch {}
    const ov = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = ov }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!show) return null

  const tocar = (e: React.MouseEvent<HTMLDivElement>) => {
    const noBotao = !!(e.target as HTMLElement).closest?.('.ps-bt')
    try { track('presell_play', noBotao ? 'botao' : 'tela') } catch {}
    // dentro do gesto do usuário: o player liga o som e começa do zero
    try { window.dispatchEvent(new Event('vsl:start')) } catch {}
    document.documentElement.style.overflow = ''
    setShow(false)
    try { window.scrollTo(0, 0) } catch {}
  }

  return (
    <div id="nt-presell" onClick={tocar} style={{ position: 'fixed', inset: 0, zIndex: 2147483000, background: '#FBFAFF', color: '#14111F', overflow: 'auto', cursor: 'pointer', fontFamily: "Inter,-apple-system,sans-serif" }}>
      <style>{`
@keyframes psIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes psPulso{0%{box-shadow:0 0 0 0 rgba(109,63,242,.55)}70%{box-shadow:0 0 0 18px rgba(109,63,242,0)}100%{box-shadow:0 0 0 0 rgba(109,63,242,0)}}
@keyframes psSeta{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}
@keyframes psBoia{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(-4deg)}}
@keyframes psChip{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes psCarimbo{from{opacity:0;transform:rotate(-3deg) scale(1.25)}to{opacity:1;transform:rotate(-3deg) scale(1)}}
#nt-presell .ps-bt{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;border:0;border-radius:18px;background:${RX};color:#fff;font:900 17px/1 Inter,-apple-system,sans-serif;letter-spacing:.01em;white-space:nowrap;padding:22px 16px;cursor:pointer;animation:psPulso 1.8s infinite;transition:transform .1s}
#nt-presell .ps-bt:active{transform:scale(.97)}
#nt-presell .ps-bt svg{animation:psSeta 1s ease-in-out infinite}
#nt-presell .ps-chip{position:absolute;display:flex;align-items:center;gap:7px;background:#fff;border-radius:999px;padding:9px 13px 9px 10px;font:800 13px/1 Inter,-apple-system,sans-serif;color:#14111F;box-shadow:0 10px 26px rgba(20,17,31,.14),0 0 0 1px rgba(20,17,31,.05);white-space:nowrap;animation:psChip 3s ease-in-out infinite}
#nt-presell .ps-chip i{width:22px;height:22px;border-radius:50%;background:#EDE7FF;display:flex;align-items:center;justify-content:center}
      `}</style>
      <div style={{ minHeight: '100%', maxWidth: 440, margin: '0 auto', padding: '24px 22px 26px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', animation: 'psIn .45s ease-out both' }}>
        {/* topo de quiz: marca + barra de progresso */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', font: "800 11px/1 'JetBrains Mono',monospace", letterSpacing: '2.5px', color: RX }}>
          <span>FLUENCY ROUTE</span><span style={{ color: '#9a98a6' }}>STEP 1 OF 2</span>
        </div>
        <div style={{ height: 6, borderRadius: 9, background: '#E6E3F2', marginTop: 12, overflow: 'hidden' }}><div style={{ width: '50%', height: '100%', borderRadius: 9, background: RX }} /></div>

        {/* HEADLINE: logo da Netflix + TRICK num carimbo roxo inclinado (nome do mecanismo, numa linha só) */}
        <div style={{ marginTop: 28, textAlign: 'center', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/netflix/netflix.svg" alt="Netflix" style={{ height: 'clamp(34px,10vw,42px)', width: 'auto', display: 'block' }} />
            <span style={{ display: 'inline-block', padding: '4px 13px 7px', background: RX, color: '#fff', borderRadius: 11, boxShadow: '0 8px 20px rgba(109,63,242,.35)', transform: 'rotate(-3deg)', animation: 'psCarimbo .5s .25s cubic-bezier(.2,1.6,.4,1) both', fontSize: 'clamp(32px,9.6vw,40px)', fontWeight: 900, letterSpacing: '-.04em' }}>Trick</span>
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, fontSize: 'clamp(18px,5.4vw,22px)', fontWeight: 800, letterSpacing: '-.01em' }}>
            to learn <span style={{ display: 'inline-block', background: '#14111F', color: '#fff', borderRadius: 9, padding: '6px 11px 5px', fontWeight: 900, letterSpacing: '.14em', fontSize: '.86em' }}>SPANISH</span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 'clamp(15px,4.4vw,17px)', fontWeight: 500, fontStyle: 'italic', color: '#666' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RX} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="2.8" y="14" width="4.4" height="7" rx="1.8" fill={RX} /><rect x="16.8" y="14" width="4.4" height="7" rx="1.8" fill={RX} /></svg>
            while you do other things in your day
          </div>
        </div>

        {/* DEMO-APP: celular com a gravação real do app rodando muda + 2 etiquetas */}
        <div style={{ position: 'relative', margin: '28px auto 0', width: 186, flex: 'none' }}>
          <div style={{ position: 'absolute', inset: '-30px -60px', background: 'radial-gradient(closest-side,rgba(109,63,242,.20),rgba(109,63,242,0))', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', width: 186, aspectRatio: '780/1300', padding: 7, borderRadius: 30, background: 'linear-gradient(160deg,#2e2e35,#0d0d10)', boxShadow: '0 26px 50px rgba(20,17,31,.28),0 0 0 2px rgba(255,255,255,.5)', animation: 'psBoia 4s ease-in-out infinite', boxSizing: 'content-box' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', background: '#0B0A12' }}>
              <video src="/netflix/step4.mp4" poster="/netflix/step4.jpg" muted autoPlay loop playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <div className="ps-chip" style={{ left: -74, top: '22%' }}><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={RX} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg></i>repeat the scene</div>
          <div className="ps-chip" style={{ right: -78, top: '58%', animationDelay: '1.2s' }}><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={RX} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></svg></i>speech training</div>
        </div>

        {/* botão: logo abaixo do celular, NÃO colado no fundo (no fundo a barra do navegador/Instagram esconde em alguns aparelhos) */}
        <div style={{ marginTop: 30, paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}>
          <button type="button" className="ps-bt">TAP TO CONTINUE
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
