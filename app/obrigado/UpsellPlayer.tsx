'use client'

// Player próprio da VSL do upsell (substitui o vturb 68239596d7a895bbe506340f).
// Mídia espelhada em media.srv1198551.hstgr.cloud/vsl-upsell (7:42, 3 renditions).
//
// O reveal da oferta replica o displayHiddenElements(367, ['.esconder'],
// {persist:true}) que o vturb fazia: conta TEMPO DE VÍDEO, persiste em
// localStorage e tem relógio só como rede de segurança — se o vídeo não estiver
// tocando (player quebrado), a oferta aparece assim mesmo. Esta é uma página
// pós-compra: em nenhuma hipótese o comprador pode ficar sem ver a oferta.

import { useEffect, useRef } from 'react'
import VslPlayer from '../vsl/VslPlayer'
import { createTracker } from '../lib/funnel-track'

const frTrack = createTracker({ funnel: 'ingles', page: 'obrigado' })

const REVEAL_AT = 367               // 6:07 — "vai aparecer um botão aqui embaixo"
const REVEAL_KEY = 'upsell_reveal_68239596'
const CLOCK_NET_MIN_TIME = 60       // relógio só revela se o vídeo nem saiu do lugar

export default function UpsellPlayer() {
  const revealedRef = useRef(false)
  const lastTimeRef = useRef(0)
  const revealRef = useRef<(via: string) => void>(() => {})

  useEffect(() => {
    const reveal = (via: string) => {
      if (revealedRef.current) return
      revealedRef.current = true
      document
        .querySelectorAll('.upsell-root .esconder')
        .forEach((el) => el.classList.remove('esconder'))
      try { localStorage.setItem(REVEAL_KEY, '1') } catch {}
      try { frTrack('upsell_reveal', via) } catch {}
    }

    // já revelou numa visita anterior (persist do vturb)
    try { if (localStorage.getItem(REVEAL_KEY) === '1') reveal('persist') } catch {}

    // rede de segurança: no horário do reveal, se o vídeo não andou, mostra assim mesmo
    const net = setTimeout(() => {
      if (lastTimeRef.current < CLOCK_NET_MIN_TIME) reveal('relogio')
    }, REVEAL_AT * 1000)

    revealRef.current = reveal
    return () => clearTimeout(net)
  }, [])

  return (
    <div style={{ position: 'relative', paddingTop: '177.78%', background: '#06060a' }}>
      <VslPlayer
        media="vsl-upsell"
        posterFile="poster.jpg"
        storageKey="vsl_pos_upsell_68239596"
        vturbPlayerId="68239596d7a895bbe506340f"
        fakeBarColor="#e9d8a6"
        scrollToActionAt={0}
        onVideoTime={(t) => {
          lastTimeRef.current = t
          if (t >= REVEAL_AT) revealRef.current('video')
        }}
        onFallback={() => {
          try { frTrack('player_fallback_vturb') } catch {}
          // no embed vturb não recebemos currentTime: arma o relógio com o restante
          const falta = Math.max(0, REVEAL_AT - lastTimeRef.current)
          setTimeout(() => revealRef.current('fallback'), falta * 1000)
        }}
        onPlayerEvent={(ev, detail) => { try { frTrack(ev, detail) } catch {} }}
      />
    </div>
  )
}
