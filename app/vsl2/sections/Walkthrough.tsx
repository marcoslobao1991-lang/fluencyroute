'use client'

import { C, FONT } from '../design'
import { Fade, S, Glass, Grad } from '../primitives'

export function Walkthrough() {
  return (
    <S>
      <Fade>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{
            fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 600,
            color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
            marginBottom: 6,
          }}>Se você ainda está aqui</p>
          <p style={{
            fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: '-0.035em',
          }}>
            <Grad size="inherit">Veja por dentro</Grad>
          </p>
          <p style={{ fontSize: 15, color: C.t2, marginTop: 12, lineHeight: 1.6 }}>
            Um passeio completo pela plataforma.
          </p>
        </div>
      </Fade>

      <Fade delay={0.1}>
        {/* Video placeholder — replace with real video when ready */}
        <div style={{
          aspectRatio: '9/16', maxWidth: 320, margin: '0 auto',
          borderRadius: 24, overflow: 'hidden',
          border: `1px solid ${C.borderLight}`,
          background: C.bg3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${C.teal}06`,
          position: 'relative',
        }}>
          {/* When video is ready, replace this with:
            <video src="/videos/app-walkthrough.mp4" autoPlay muted loop playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: `${C.teal}15`, border: `1px solid ${C.teal}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 0, height: 0, borderLeft: `18px solid ${C.teal}`, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }} />
            </div>
            <p style={{ fontFamily: FONT.mono, fontSize: 13, color: C.t3, letterSpacing: 2 }}>VÍDEO EM BREVE</p>
          </div>
        </div>
      </Fade>
    </S>
  )
}
