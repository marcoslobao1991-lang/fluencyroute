'use client'
// iPhone ULTRARREALISTA (moldura renderizada no Blender: ~/netflix-trick/mock/iphone.py → public/netflix/iphone.webp, tela
// transparente) com um vídeo do app por baixo, deformado pela perspectiva da tela (matrix3d de ~/netflix-trick/mock/matriz.cjs).
// Mesmo mockup da presell. Usado nas etapas do app da /netflix. `w` = largura exibida em px.
import React, { useEffect, useRef } from 'react'

const FONE_W = 250, FONE_H = 400, TELA_W = 195, TELA_H = 422, BARRA = 27
const TELA_M = 'matrix3d(0.78378878,-0.05288037,0,-0.00026442,0.02184602,0.86306363,0,0.0000528,0,0,1,0,32.14,20.1375,0,1)'

export default function Iphone({ src, poster, w = 250, tocar = true }: { src: string; poster: string; w?: number; tocar?: boolean }) {
  const k = w / FONE_W
  const vid = useRef<HTMLVideoElement>(null)
  useEffect(() => { const v = vid.current; if (!v) return; if (tocar) v.play().catch(() => {}); else v.pause() }, [tocar])
  return (
    <div style={{ position: 'relative', width: FONE_W * k, height: FONE_H * k, margin: '0 auto' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: FONE_W, height: FONE_H, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: TELA_W, height: TELA_H, transformOrigin: '0 0', transform: TELA_M, background: '#060307', overflow: 'hidden', borderRadius: 25 }}>
          <div style={{ height: BARRA, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 4px 24px', boxSizing: 'border-box', color: '#fff', font: "600 10.5px/1 -apple-system,'SF Pro Text',Inter,sans-serif" }}>
            <span>9:41</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
              <svg width="12" height="8" viewBox="0 0 17 11" fill="#fff" aria-hidden="true"><rect x="0" y="7" width="3" height="4" rx=".7" /><rect x="4.6" y="5" width="3" height="6" rx=".7" /><rect x="9.2" y="2.6" width="3" height="8.4" rx=".7" /><rect x="13.8" y="0" width="3" height="11" rx=".7" /></svg>
              <svg width="18" height="8.5" viewBox="0 0 26 12" aria-hidden="true"><rect x=".6" y=".6" width="21.5" height="10.8" rx="3.3" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.1" /><rect x="2.1" y="2.1" width="18.5" height="7.8" rx="2" fill="#fff" /></svg>
            </span>
          </div>
          <video ref={vid} src={src} poster={poster} muted loop playsInline preload="none" style={{ width: TELA_W, height: TELA_H - BARRA, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(118deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.03) 24%,rgba(255,255,255,0) 42%)', pointerEvents: 'none' }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/netflix/iphone.webp" alt="" style={{ position: 'absolute', inset: 0, width: FONE_W, height: FONE_H, display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 22px 24px rgba(20,17,31,.30)) drop-shadow(0 4px 6px rgba(20,17,31,.18))' }} />
      </div>
    </div>
  )
}
