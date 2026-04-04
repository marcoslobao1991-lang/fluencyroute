'use client'

import { useState } from 'react'
import { C, FONT } from '../design'
import { useInView, Fade, S, Glass, Grad } from '../primitives'

// Pre-computed waveform heights to avoid hydration mismatch from Math.sin/cos
const WAVE_PRONUN = Array.from({ length: 40 }, (_, i) => Math.sin(i * 0.4) * 10 + Math.cos(i * 0.7) * 5 + 8);
const WAVE_LISTEN = Array.from({ length: 40 }, (_, i) => Math.sin(i * 0.6) * 7 + 5);

// ═══════════════════════════════════════════════════════════
// APP SCREEN — raw content, no Glass (phone IS the frame)
// Fixed height, dark bg, looks like real app
// ═══════════════════════════════════════════════════════════
const SCREEN_H = 360

const WORDS = [
  { word: 'She', s: 95, c: '#4ECDC4' },
  { word: "wouldn't", s: 62, c: '#FBBF24' },
  { word: 'have', s: 88, c: '#4ECDC4' },
  { word: 'known', s: 45, c: '#FF6B6B' },
  { word: 'if', s: 92, c: '#4ECDC4' },
  { word: 'you', s: 90, c: '#4ECDC4' },
  { word: "hadn't", s: 58, c: '#FBBF24' },
  { word: 'told', s: 72, c: '#FBBF24' },
  { word: 'her', s: 40, c: '#FF6B6B' },
]

function ScreenPronunciation() {
  return (
    <div style={{ height: SCREEN_H, padding: '20px 16px', background: C.bg, overflow: 'hidden' }}>
      {/* Status bar mock */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, opacity: 0.3 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.white }}>9:41</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 14, height: 8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.4)' }}>
            <div style={{ width: '70%', height: '100%', borderRadius: 1, background: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: C.t3 }}>←</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: '#FF6B6B', letterSpacing: 1 }}>Análise de Pronúncia</span>
      </div>

      {/* Phrase with word scores */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px', marginBottom: 18 }}>
        {WORDS.map((w, i) => (
          <div key={i}>
            <span style={{ fontSize: 20, fontWeight: 700, color: w.c }}>{w.word}</span>
            <sup style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, color: w.c, opacity: 0.7, marginLeft: 1 }}>{w.s}</sup>
          </div>
        ))}
      </div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF6B6B15', border: '1px solid #FF6B6B25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: '10px solid #FF6B6B', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 3 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 28 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{
              width: 2.5, borderRadius: 2, flexShrink: 0,
              height: WAVE_PRONUN[i],
              background: i < 30 ? '#FF6B6B' : 'rgba(255,255,255,0.06)',
              opacity: i < 30 ? 0.5 : 0.3,
            }} />
          ))}
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.t3 }}>0:04</span>
      </div>

      {/* Score bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.t3 }}>Score</span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ height: '100%', borderRadius: 3, width: '72%', background: 'linear-gradient(90deg, #FF6B6B, #FBBF24)', boxShadow: '0 0 8px rgba(255,107,107,0.3)' }} />
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 800, color: '#FBBF24' }}>72</span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14 }}>
        {[{ c: '#4ECDC4', l: 'Correto' }, { c: '#FBBF24', l: 'Melhorar' }, { c: '#FF6B6B', l: 'Treinar' }].map((x, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: x.c }} />
            <span style={{ fontSize: 13, color: C.t2 }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenListening() {
  return (
    <div style={{ height: SCREEN_H, padding: '20px 16px', background: C.bg, overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, opacity: 0.3 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.white }}>9:41</span>
        <div style={{ width: 14, height: 8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.4)' }}>
          <div style={{ width: '70%', height: '100%', borderRadius: 1, background: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: C.t3 }}>←</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: C.teal, letterSpacing: 1 }}>Listen & Arrange</span>
      </div>

      {/* Audio player */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, marginBottom: 18 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.teal}15`, border: `1px solid ${C.teal}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: `10px solid ${C.teal}`, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 3 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 22 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} style={{ width: 2.5, borderRadius: 2, flexShrink: 0, height: WAVE_LISTEN[i], background: C.teal, opacity: 0.35 }} />
          ))}
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.t3 }}>0:03</span>
      </div>

      {/* Scrambled */}
      <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.t3, marginBottom: 8, letterSpacing: 1 }}>ORGANIZE AS PALAVRAS</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        {['usually', 'I', 'at', 'wake', 'up', 'seven'].map((w, i) => (
          <span key={i} style={{ padding: '7px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.borderLight}`, color: C.t1 }}>{w}</span>
        ))}
      </div>

      {/* Answer */}
      <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.teal, marginBottom: 8, letterSpacing: 1, opacity: 0.6 }}>SUA RESPOSTA</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['I', 'usually', 'wake', 'up', 'at', 'seven'].map((w, i) => (
          <span key={i} style={{ padding: '7px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: `${C.teal}08`, border: `1px solid ${C.teal}18`, color: C.teal }}>{w}</span>
        ))}
      </div>
    </div>
  )
}

function ScreenWriting() {
  return (
    <div style={{ height: SCREEN_H, padding: '20px 16px', background: C.bg, overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, opacity: 0.3 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.white }}>9:41</span>
        <div style={{ width: 14, height: 8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.4)' }}>
          <div style={{ width: '70%', height: '100%', borderRadius: 1, background: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: C.t3 }}>←</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: '#3b82f6', letterSpacing: 1 }}>Correção de Writing</span>
      </div>

      {/* Prompt */}
      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, marginBottom: 14 }}>
        <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.t3, marginBottom: 6, letterSpacing: 1 }}>TRADUZA:</p>
        <p style={{ fontSize: 14, color: C.t2 }}>Se eu tivesse mais tempo, viajaria pelo mundo inteiro.</p>
      </div>

      {/* User answer with errors */}
      <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.t3, marginBottom: 6, letterSpacing: 1 }}>SUA RESPOSTA</p>
      <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, marginBottom: 12 }}>
        <span style={{ textDecoration: 'line-through', color: '#FF6B6B', opacity: 0.7 }}>If I would have</span>{' '}
        more time, I{' '}
        <span style={{ textDecoration: 'line-through', color: '#FF6B6B', opacity: 0.7 }}>will travel</span>{' '}
        around the whole world.
      </p>

      {/* Correction */}
      <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.teal, marginBottom: 6, letterSpacing: 1, opacity: 0.6 }}>CORREÇÃO</p>
      <p style={{ fontSize: 15, color: C.t1, lineHeight: 1.7, marginBottom: 14 }}>
        <span style={{ color: C.teal, fontWeight: 700, background: `${C.teal}10`, padding: '2px 5px', borderRadius: 4 }}>If I had</span>{' '}
        more time, I{' '}
        <span style={{ color: C.teal, fontWeight: 700, background: `${C.teal}10`, padding: '2px 5px', borderRadius: 4 }}>would travel</span>{' '}
        around the whole world.
      </p>

      {/* Scores */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ l: 'Gramática', v: 55, c: '#FBBF24' }, { l: 'Vocab', v: 85, c: '#4ECDC4' }, { l: 'Precisão', v: 60, c: '#FBBF24' }].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.t3 }}>{s.l}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 800, color: s.c }}>{s.v}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ height: '100%', borderRadius: 2, background: s.c, width: `${s.v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PHONE MOCKUP
// ═══════════════════════════════════════════════════════════
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 28, padding: '10px 6px 12px',
      background: 'linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
      border: '1.5px solid rgba(255,255,255,0.12)',
      boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 80px ${C.teal}04, inset 0 1px 0 rgba(255,255,255,0.15)`,
    }}>
      {/* Dynamic Island */}
      <div style={{
        width: 70, height: 20, borderRadius: 12, margin: '0 auto 6px',
        background: '#000', border: '1px solid rgba(255,255,255,0.06)',
      }} />
      {/* Screen */}
      <div style={{
        borderRadius: 18, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.03)',
      }}>
        {children}
      </div>
      {/* Home bar */}
      <div style={{
        width: 90, height: 4, borderRadius: 3, margin: '8px auto 0',
        background: 'rgba(255,255,255,0.12)',
      }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CAROUSEL
// ═══════════════════════════════════════════════════════════
const SCREENS = [ScreenPronunciation, ScreenListening, ScreenWriting]
const SCREENS_LOOP = [...SCREENS, ...SCREENS]

function DemosCarousel() {
  const [paused, setPaused] = useState(false)
  const cardW = 260
  const gap = 24
  const totalW = SCREENS.length * (cardW + gap)

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 30, zIndex: 2, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 30, zIndex: 2, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none' }} />
      <div style={{
        display: 'flex', gap, width: 'max-content',
        animation: `techScroll ${SCREENS.length * 7}s linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
        padding: '16px 0',
      }}>
        {SCREENS_LOOP.map((Screen, i) => (
          <div key={i} style={{ width: cardW, flexShrink: 0 }}>
            <PhoneMockup><Screen /></PhoneMockup>
          </div>
        ))}
      </div>
      <style>{`@keyframes techScroll{0%{transform:translateX(0)}100%{transform:translateX(-${totalW}px)}}`}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN SECTION
// ═══════════════════════════════════════════════════════════
export function TechCenter() {
  return (
    <div className="glow-purple" style={{ overflow: 'hidden' }}>
      <S>
        {/* Header */}
        <Fade>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60, height: 2, margin: '0 auto 24px',
              background: `linear-gradient(90deg, ${C.teal}, ${C.purple})`,
              borderRadius: 2, boxShadow: `0 0 12px ${C.teal}30`,
            }} />
            <p style={{
              fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
              letterSpacing: 3, textTransform: 'uppercase',
              color: C.teal, marginBottom: 8,
            }}>Incluído no seu acesso</p>
            <p style={{
              fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-0.035em',
              marginBottom: 16,
            }}>
              <Grad size="inherit">Fluency Lab</Grad>
            </p>
          </div>
        </Fade>

        {/* Manoella */}
        <Fade delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              width: 'clamp(160px, 40vw, 220px)', position: 'relative', marginBottom: 16,
            }}>
              <img src="/avatars/manoella.png" alt="Manoella IA" style={{
                width: '100%', display: 'block',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: '130%', height: '130%', borderRadius: '50%',
                background: `radial-gradient(ellipse, ${C.teal}08, transparent 60%)`,
                pointerEvents: 'none', zIndex: -1,
              }} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.t1, marginBottom: 4 }}>Manu</p>
            <p style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: C.teal, letterSpacing: 3, marginBottom: 20 }}>SUA IA DE FLUÊNCIA</p>
            <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, textAlign: 'center', maxWidth: 420 }}>
              Converse em inglês, faça treinos específicos e receba{' '}
              <strong style={{ color: C.t1 }}>relatório e feedback personalizado</strong> em tempo real.
            </p>
          </div>
        </Fade>

        {/* Phone mockup demos */}
        <Fade delay={0.15}>
          <p style={{
            textAlign: 'center', fontFamily: FONT.mono,
            fontSize: 13, fontWeight: 700, letterSpacing: 3,
            color: C.t3, marginBottom: 8,
          }}>POR DENTRO DO APP</p>
          <DemosCarousel />
        </Fade>

        {/* Tech badges */}
        <Fade delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {['Reconhecimento de Voz', 'Análise de Fluência', 'Correção por IA', 'Feedback Instantâneo'].map((t, i) => (
              <span key={i} style={{
                fontFamily: FONT.mono, fontSize: 13, fontWeight: 700,
                color: C.t2, padding: '6px 12px', borderRadius: 6,
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                letterSpacing: 1,
              }}>{t}</span>
            ))}
          </div>
        </Fade>

        <Fade delay={0.25}>
          <p style={{ textAlign: 'center', fontSize: 15, color: C.t2, marginTop: 20, lineHeight: 1.6 }}>
            Ative o <strong style={{ color: C.teal }}>Modo Guiado</strong> ou treine no <strong style={{ color: C.purple }}>Modo Livre</strong>.
          </p>
        </Fade>
      </S>
    </div>
  )
}
