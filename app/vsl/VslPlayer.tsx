'use client'

// ═══════════════════════════════════════════════════════════════
// PLAYER PRÓPRIO DA VSL — substitui o VTurb (converteai)
//
// Replica o comportamento do smartplayer configurado no embed
// 67d1c8ba61d59aeb47caf87d (config extraído do embed.html real):
//   • smartAutoPlay: começa mudo + overlay "Clique para ouvir";
//     clique → volta pro 0 com som
//   • fakeBar: barra #00dfff 10px, progresso = (t/T)^(1/alpha), alpha=2
//   • resume: overlay laranja #E77E11 "Você já começou a assistir…"
//     com posição salva em localStorage a cada 5s (step:5)
//   • scrollToActionIn 1470s: rola suave até o primeiro CTA (#cta-pricing)
//   • vídeo vertical 9:16 (aspectRatio 177.78), sem controles nativos,
//     clique pausa/retoma (disablePause: false)
//
// Mídia: mirror HLS 1:1 do CDN do VTurb (3 renditions 720/480/360)
// hospedado em media.srv1198551.hstgr.cloud (nginx na VPS, Traefik SSL).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'

const MEDIA_BASE = 'https://media.srv1198551.hstgr.cloud/vsl-ingles'
const HLS_URL = `${MEDIA_BASE}/main.m3u8`
const POSTER_URL = `${MEDIA_BASE}/thumbnail.jpg`

const FAKEBAR_ALPHA = 2
const FAKEBAR_COLOR = '#00dfff'
const FAKEBAR_HEIGHT = 10
const RESUME_MIN_SECONDS = 30       // só oferece "continuar" se passou disso
const SAVE_STEP_MS = 5000           // step: 5 do config vturb
const SCROLL_TO_ACTION_AT = 1470    // 24:30 — rola até o CTA
const STORAGE_KEY = 'vsl_pos_67d1c87c'

type Overlay = 'none' | 'unmute' | 'resume' | 'paused'

export default function VslPlayer({ onVideoTime }: { onVideoTime?: (t: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onVideoTimeRef = useRef(onVideoTime)
  onVideoTimeRef.current = onVideoTime
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [fakeProgress, setFakeProgress] = useState(0)
  // interagiu = já deu unmute ou escolheu no resume → passa a salvar posição
  const interactedRef = useRef(false)
  const scrolledRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let hls: { destroy: () => void } | null = null
    let cancelled = false

    const savedPos = (() => {
      try {
        const v = parseFloat(localStorage.getItem(STORAGE_KEY) || '0')
        return isFinite(v) && v >= RESUME_MIN_SECONDS ? v : 0
      } catch { return 0 }
    })()

    const startPlayback = async () => {
      if (cancelled) return
      if (savedPos > 0) {
        // já assistiu antes: vídeo parado no poster + overlay de resume
        setOverlay('resume')
        return
      }
      // smartAutoPlay: tenta tocar mudo; overlay convida pro som
      video.muted = true
      try {
        await video.play()
        setOverlay('unmute')
      } catch {
        // autoplay bloqueado pelo browser → overlay vira o botão de play
        setOverlay('unmute')
      }
    }

    const canNative = video.canPlayType('application/vnd.apple.mpegurl')
    if (canNative) {
      video.src = HLS_URL
      video.addEventListener('loadedmetadata', startPlayback, { once: true })
      video.load()
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return
        const h = new Hls({ maxBufferLength: 30 })
        hls = h
        h.loadSource(HLS_URL)
        h.attachMedia(video)
        h.on(Hls.Events.MANIFEST_PARSED, startPlayback)
      })
    }

    // fakeBar + scrollToAction + persistência da posição
    let lastSave = 0
    const onTime = () => {
      const d = video.duration
      if (d > 0) setFakeProgress(Math.pow(video.currentTime / d, 1 / FAKEBAR_ALPHA))
      onVideoTimeRef.current?.(video.currentTime)
      if (interactedRef.current) {
        const now = Date.now()
        if (now - lastSave >= SAVE_STEP_MS) {
          lastSave = now
          try { localStorage.setItem(STORAGE_KEY, String(video.currentTime)) } catch {}
        }
        if (!scrolledRef.current && video.currentTime >= SCROLL_TO_ACTION_AT) {
          scrolledRef.current = true
          document.getElementById('cta-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
    video.addEventListener('timeupdate', onTime)

    return () => {
      cancelled = true
      video.removeEventListener('timeupdate', onTime)
      if (hls) hls.destroy()
    }
  }, [])

  const unmuteFromStart = () => {
    const video = videoRef.current
    if (!video) return
    interactedRef.current = true
    video.currentTime = 0
    video.muted = false
    video.play().catch(() => {})
    setOverlay('none')
  }

  const resumeAt = (pos: number) => {
    const video = videoRef.current
    if (!video) return
    interactedRef.current = true
    video.currentTime = pos
    video.muted = false
    video.play().catch(() => {})
    setOverlay('none')
  }

  const togglePause = () => {
    const video = videoRef.current
    if (!video || overlay === 'unmute' || overlay === 'resume') return
    if (video.paused) {
      video.play().catch(() => {})
      setOverlay('none')
    } else {
      video.pause()
      setOverlay('paused')
    }
  }

  const savedPosNow = () => {
    try { return parseFloat(localStorage.getItem(STORAGE_KEY) || '0') || 0 } catch { return 0 }
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}>
      <video
        ref={videoRef}
        poster={POSTER_URL}
        playsInline
        preload="auto"
        onClick={togglePause}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
      />

      {/* fakeBar — progresso acelerado, idêntico ao vturb */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FAKEBAR_HEIGHT, background: 'rgba(255,255,255,0.15)' }}>
        <div style={{ width: `${Math.min(fakeProgress * 100, 100)}%`, height: '100%', background: FAKEBAR_COLOR, transition: 'width 0.3s linear' }} />
      </div>

      {/* overlay "Clique para ouvir" — smartAutoPlay */}
      {overlay === 'unmute' && (
        <button
          onClick={unmuteFromStart}
          aria-label="Ativar o som do vídeo"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 18, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, background: 'rgba(0,0,0,0.75)', borderRadius: 18, padding: '38px 46px', width: '78%',
          }}>
            <svg width="88" height="88" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5z" fill="#fff" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#fff', fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 700, lineHeight: 1.2 }}>
              Clique para ouvir
            </span>
          </span>
        </button>
      )}

      {/* overlay resume — mesmas cores e textos do vturb */}
      {overlay === 'resume' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
          background: 'rgba(0,0,0,0.7)', padding: 24,
        }}>
          <p style={{ color: '#fff', fontSize: 'clamp(15px, 4vw, 19px)', fontWeight: 600, textAlign: 'center', margin: 0 }}>
            Você já começou a assistir esse vídeo
          </p>
          <button
            onClick={() => resumeAt(savedPosNow())}
            style={{
              background: '#E77E11', color: '#FFFFFF', border: 'none', borderRadius: 10,
              padding: '14px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '78%', maxWidth: 300,
            }}
          >
            Continuar assistindo?
          </button>
          <button
            onClick={unmuteFromStart}
            style={{
              background: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
              width: '78%', maxWidth: 300,
            }}
          >
            Assistir do início?
          </button>
        </div>
      )}

      {/* overlay pausado — botão play grande */}
      {overlay === 'paused' && (
        <button
          onClick={togglePause}
          aria-label="Continuar o vídeo"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{
            width: 96, height: 96, borderRadius: '50%', background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" style={{ marginLeft: 6 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
