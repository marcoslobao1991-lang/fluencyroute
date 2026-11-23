'use client'
// PLAY em forma de PRESELL da /netflix (23/11/2026), modelado no da /friends (scripts/gerar-vsl-friends.js, MODO 'quiz'):
// tela clara de quiz cobrindo a página, "Netflix Trick" no topo, iPhone com a gravação real do app, um botão.
// Qualquer toque na tela = VSL do início COM SOM (evento window 'vsl:start', ouvido pelo VslPlayer).
// Não pode parecer que tem VSL por baixo: sem pergunta, sem player à vista, só o botão.
// Quem já começou a assistir (posição salva) ou já abriu a oferta não vê a presell. `?modo=cadeado` desliga.
//
// iPhone: moldura RENDERIZADA no Blender/Cycles (~/netflix-trick/mock/iphone.py → public/netflix/iphone.webp, tela
// transparente). O vídeo do app fica POR BAIXO, deformado pela mesma perspectiva da tela (matrix3d calculado por
// ~/netflix-trick/mock/matriz.cjs a partir dos 4 cantos que o Blender devolve). Mudou o render = recalcular a matriz.
import React, { useEffect, useState } from 'react'

const RX = '#6D3FF2'
// contêiner de projeto 250×400 (o PNG de 1000×1600 a 25%); tela = retângulo 195×422 levado aos cantos da tela renderizada
const FONE_W = 250, FONE_H = 400, TELA_W = 195, TELA_H = 422
const TELA_M = 'matrix3d(0.78378878,-0.05288037,0,-0.00026442,0.02184602,0.86306363,0,0.0000528,0,0,1,0,32.14,20.1375,0,1)'
const BARRA = 27 // faixa de status (hora, sinal, bateria) acima do app, como num iPhone de verdade

export default function NetflixPresell({ track, posKey, revealKey }: { track: (ev: string, detail?: string) => void; posKey: string; revealKey: string }) {
  const [show, setShow] = useState(true)
  const [k, setK] = useState(1) // escala do iPhone: encolhe em tela baixa pro botão nunca sair da tela

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
    // tudo que não é o iPhone (topo, headline, botão, respiros) ocupa ~310 px (335 com folga); o resto da altura VISÍVEL é dele
    const mede = () => { const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight; setK(Math.max(0.4, Math.min(1.15, (h - 335) / FONE_H))) }
    mede()
    window.addEventListener('resize', mede)
    window.visualViewport?.addEventListener('resize', mede)
    const ov = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = ov; window.removeEventListener('resize', mede); window.visualViewport?.removeEventListener('resize', mede) }
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
@keyframes psBoia{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes psChip{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes psCarimbo{from{opacity:0;transform:rotate(-3deg) scale(1.25)}to{opacity:1;transform:rotate(-3deg) scale(1)}}
#nt-presell .ps-bt{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;border:0;border-radius:18px;background:${RX};color:#fff;font:900 17px/1 Inter,-apple-system,sans-serif;letter-spacing:.01em;white-space:nowrap;padding:22px 16px;cursor:pointer;animation:psPulso 1.8s infinite;transition:transform .1s}
#nt-presell .ps-bt:active{transform:scale(.97)}
#nt-presell .ps-bt svg{animation:psSeta 1s ease-in-out infinite}
#nt-presell .ps-chip{position:absolute;display:flex;align-items:center;gap:7px;background:#fff;border-radius:999px;padding:9px 13px 9px 10px;font:800 13px/1 Inter,-apple-system,sans-serif;color:#14111F;box-shadow:0 10px 26px rgba(20,17,31,.14),0 0 0 1px rgba(20,17,31,.05);white-space:nowrap;animation:psChip 3s ease-in-out infinite;z-index:3}
#nt-presell .ps-chip i{width:22px;height:22px;border-radius:50%;background:#EDE7FF;display:flex;align-items:center;justify-content:center}
      `}</style>
      <div style={{ minHeight: '100%', maxWidth: 440, margin: '0 auto', padding: '22px 22px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', animation: 'psIn .45s ease-out both' }}>
        {/* topo de quiz: marca + barra de progresso */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', font: "800 11px/1 'JetBrains Mono',monospace", letterSpacing: '2.5px', color: RX }}>
          <span>FLUENCY ROUTE</span><span style={{ color: '#9a98a6' }}>STEP 1 OF 2</span>
        </div>
        <div style={{ height: 6, borderRadius: 9, background: '#E6E3F2', marginTop: 12, overflow: 'hidden' }}><div style={{ width: '50%', height: '100%', borderRadius: 9, background: RX }} /></div>

        {/* HEADLINE: logo da Netflix + TRICK num carimbo roxo inclinado (nome do mecanismo, numa linha só) */}
        <div style={{ marginTop: 24, textAlign: 'center', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/netflix/netflix.svg" alt="Netflix" style={{ height: 'clamp(34px,10vw,42px)', width: 'auto', display: 'block' }} />
            <span style={{ display: 'inline-block', padding: '4px 13px 7px', background: RX, color: '#fff', borderRadius: 11, boxShadow: '0 8px 20px rgba(109,63,242,.35)', transform: 'rotate(-3deg)', animation: 'psCarimbo .5s .25s cubic-bezier(.2,1.6,.4,1) both', fontSize: 'clamp(32px,9.6vw,40px)', fontWeight: 900, letterSpacing: '-.04em' }}>Trick</span>
          </div>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, fontSize: 'clamp(18px,5.4vw,22px)', fontWeight: 800, letterSpacing: '-.01em' }}>
            to learn <span style={{ display: 'inline-block', background: '#14111F', color: '#fff', borderRadius: 9, padding: '6px 11px 5px', fontWeight: 900, letterSpacing: '.14em', fontSize: '.86em' }}>SPANISH</span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 'clamp(15px,4.4vw,17px)', fontWeight: 500, fontStyle: 'italic', color: '#666' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RX} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="2.8" y="14" width="4.4" height="7" rx="1.8" fill={RX} /><rect x="16.8" y="14" width="4.4" height="7" rx="1.8" fill={RX} /></svg>
            while you do other things in your day
          </div>
        </div>

        {/* DEMO-APP: iPhone renderizado (Blender) com a gravação real do app rodando na tela + 2 etiquetas */}
        <div style={{ position: 'relative', margin: '20px auto 0', width: FONE_W * k, height: FONE_H * k, flex: 'none' }}>
          <div style={{ position: 'absolute', inset: '-20px -70px', background: 'radial-gradient(closest-side,rgba(109,63,242,.20),rgba(109,63,242,0))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: FONE_W, height: FONE_H, transform: `scale(${k})`, transformOrigin: '0 0' }}>
            <div style={{ position: 'absolute', inset: 0, animation: 'psBoia 4s ease-in-out infinite' }}>
              {/* a TELA: retângulo levado pra perspectiva da tela do render */}
              <div style={{ position: 'absolute', left: 0, top: 0, width: TELA_W, height: TELA_H, transformOrigin: '0 0', transform: TELA_M, background: '#060307', overflow: 'hidden', borderRadius: 25 }}>
                <div style={{ height: BARRA, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 4px 24px', boxSizing: 'border-box', color: '#fff', font: "600 10.5px/1 -apple-system,'SF Pro Text',Inter,sans-serif", letterSpacing: '-.01em' }}>
                  <span>9:41</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
                    <svg width="12" height="8" viewBox="0 0 17 11" fill="#fff" aria-hidden="true"><rect x="0" y="7" width="3" height="4" rx=".7" /><rect x="4.6" y="5" width="3" height="6" rx=".7" /><rect x="9.2" y="2.6" width="3" height="8.4" rx=".7" /><rect x="13.8" y="0" width="3" height="11" rx=".7" /></svg>
                    <svg width="11" height="8" viewBox="0 0 16 11.5" fill="#fff" aria-hidden="true"><path d="M8 2.3c2.3 0 4.4.9 6 2.4l1-1.1A10 10 0 0 0 8 .8 10 10 0 0 0 1 3.6l1 1.1a8.500 8.500 0 0 1 6-2.400zM8 5.800c1.400 0 2.700.5 3.700 1.400l1-1.100A7 7 0 0 0 8 4.300a7 7 0 0 0-4.700 1.800l1 1.100c1-.9 2.300-1.400 3.700-1.400zm0 3.400 2.200-2.300a3.200 3.200 0 0 0-4.400 0L8 9.200z" /></svg>
                    <svg width="18" height="8.500" viewBox="0 0 26 12" aria-hidden="true"><rect x=".6" y=".6" width="21.500" height="10.800" rx="3.300" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.100" /><rect x="2.100" y="2.100" width="18.500" height="7.800" rx="2" fill="#fff" /><path d="M23.500 4v4c.800-.3 1.400-1.100 1.400-2s-.6-1.700-1.400-2z" fill="rgba(255,255,255,.5)" /></svg>
                  </span>
                </div>
                <video src="/netflix/presell-app.mp4" poster="/netflix/presell-app.jpg" muted autoPlay loop playsInline preload="auto" style={{ width: TELA_W, height: TELA_H - BARRA, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                {/* reflexo do vidro */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(118deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.03) 24%,rgba(255,255,255,0) 42%)', pointerEvents: 'none' }} />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/netflix/iphone.webp" alt="" style={{ position: 'absolute', inset: 0, width: FONE_W, height: FONE_H, display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 22px 24px rgba(20,17,31,.30)) drop-shadow(0 4px 6px rgba(20,17,31,.18))' }} />
            </div>
          </div>
          {k >= 0.62 && <div className="ps-chip" style={{ left: -44, top: '24%' }}><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={RX} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg></i>repeat the scene</div>}
          {k >= 0.62 && <div className="ps-chip" style={{ right: -50, top: '60%', animationDelay: '1.2s' }}><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={RX} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></svg></i>speech training</div>}
        </div>

        {/* botão: logo abaixo do celular, NÃO colado no fundo (no fundo a barra do navegador/Instagram esconde em alguns aparelhos) */}
        <div style={{ marginTop: 22, paddingBottom: 'calc(22px + env(safe-area-inset-bottom, 0px))' }}>
          <button type="button" className="ps-bt">TAP TO CONTINUE
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
