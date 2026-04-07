'use client'

import { useState } from 'react'
import { C, FONT } from '../design'
import { useInView, Fade, S, Glass, Grad } from '../primitives'

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════
const PRONUNCIATION_WORDS = [
  { word: 'She', score: 95, color: '#4ECDC4' },
  { word: "wouldn't", score: 62, color: '#FBBF24' },
  { word: 'have', score: 88, color: '#4ECDC4' },
  { word: 'known', score: 45, color: '#FF6B6B' },
  { word: 'if', score: 92, color: '#4ECDC4' },
  { word: 'you', score: 90, color: '#4ECDC4' },
  { word: "hadn't", score: 58, color: '#FBBF24' },
  { word: 'told', score: 72, color: '#FBBF24' },
  { word: 'her', score: 40, color: '#FF6B6B' },
]

// ═══════════════════════════════════════════════════════════
// PRONUNCIATION DEMO
// ═══════════════════════════════════════════════════════════
function PronunciationDemo() {
  const { ref, v } = useInView(0.2)
  return (
    <div ref={ref}>
      <Glass accent="#FF6B6B" hud style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, #FF6B6B 0, #FF6B6B 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, #FF6B6B 0, #FF6B6B 1px, transparent 1px, transparent 24px)`,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🗣️</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: '#FF6B6B', letterSpacing: 2 }}>PRONÚNCIA</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px', marginBottom: 16 }}>
            {PRONUNCIATION_WORDS.map((w, i) => (
              <div key={i} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(8px)', transition: `all 0.5s ease ${0.3 + i * 0.08}s` }}>
                <span style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, color: w.color, textShadow: `0 0 12px ${w.color}30` }}>{w.word}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, color: w.color, marginLeft: 2, verticalAlign: 'super', opacity: 0.7 }}>{w.score}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32, marginBottom: 12 }}>
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} style={{ width: 3, borderRadius: 2, flexShrink: 0, height: v ? Math.sin(i * 0.5) * 12 + Math.random() * 8 + 6 : 2, background: '#FF6B6B', opacity: i < 28 ? 0.6 : 0.3, transition: `height 1s ease ${0.5 + i * 0.02}s` }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[{ c: '#4ECDC4', l: 'Correto' }, { c: '#FBBF24', l: 'Melhorar' }, { c: '#FF6B6B', l: 'Treinar' }].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, boxShadow: `0 0 6px ${x.c}60` }} />
                <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.t2 }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </Glass>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LISTENING DEMO
// ═══════════════════════════════════════════════════════════
function ListeningDemo() {
  const { ref, v } = useInView(0.2)
  const words = ['usually', 'I', 'at', 'wake', 'up', 'seven']
  const correct = ['I', 'usually', 'wake', 'up', 'at', 'seven']
  return (
    <div ref={ref}>
      <Glass accent={C.teal} hud style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, ${C.teal} 0, ${C.teal} 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, ${C.teal} 0, ${C.teal} 1px, transparent 1px, transparent 24px)`,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🎧</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: 2 }}>LISTENING</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.teal}15`, border: `1px solid ${C.teal}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>▶</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} style={{ width: 3, borderRadius: 2, flexShrink: 0, height: v ? Math.sin(i * 0.6) * 8 + Math.random() * 6 + 4 : 2, background: C.teal, opacity: 0.4, transition: `height 0.8s ease ${i * 0.02}s` }} />
              ))}
            </div>
          </div>
          <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.t3, marginBottom: 8, letterSpacing: 1 }}>ORGANIZE:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {words.map((w, i) => (
              <span key={i} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.borderLight}`, color: C.t1, opacity: v ? 1 : 0, transition: `opacity 0.4s ease ${0.3 + i * 0.08}s` }}>{w}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {correct.map((w, i) => (
              <span key={i} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: `${C.teal}10`, border: `1px solid ${C.teal}20`, color: C.teal, opacity: v ? 1 : 0, transition: `opacity 0.4s ease ${1 + i * 0.15}s` }}>{v ? w : '—'}</span>
            ))}
          </div>
        </div>
      </Glass>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// WRITING DEMO
// ═══════════════════════════════════════════════════════════
function WritingDemo() {
  const { ref, v } = useInView(0.2)
  return (
    <div ref={ref}>
      <Glass accent="#3b82f6" hud style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, #3b82f6 0, #3b82f6 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 1px, transparent 1px, transparent 24px)`,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>✍️</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: 2 }}>WRITING</span>
          </div>
          <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, marginBottom: 14 }}>
            <span style={{ textDecoration: 'line-through', color: '#FF6B6B', opacity: 0.6 }}>If I would have</span>{' '}
            more time, I{' '}
            <span style={{ textDecoration: 'line-through', color: '#FF6B6B', opacity: 0.6 }}>will travel</span>{' '}
            around the world.
          </p>
          <p style={{ fontSize: 15, color: C.t1, lineHeight: 1.7, opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 0.8s' }}>
            <span style={{ color: C.teal, fontWeight: 700, background: `${C.teal}10`, padding: '1px 4px', borderRadius: 4 }}>If I had</span>{' '}
            more time, I{' '}
            <span style={{ color: C.teal, fontWeight: 700, background: `${C.teal}10`, padding: '1px 4px', borderRadius: 4 }}>would travel</span>{' '}
            around the world.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 1.2s' }}>
            {[{ l: 'Gramática', v: 55, c: '#FBBF24' }, { l: 'Vocabulário', v: 85, c: '#4ECDC4' }, { l: 'Precisão', v: 60, c: '#FBBF24' }].map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.t3 }}>{s.l}</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 800, color: s.c }}>{s.v}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: s.c, width: v ? `${s.v}%` : '0%', transition: `width 1.5s cubic-bezier(.16,1,.3,1) ${1.2 + i * 0.15}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Glass>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LAB CAROUSEL
// ═══════════════════════════════════════════════════════════
const DEMOS = [PronunciationDemo, ListeningDemo, WritingDemo]
const DEMOS_LOOP = [...DEMOS, ...DEMOS]

function LabCarousel() {
  const [paused, setPaused] = useState(false)
  const cardW = 300
  const gap = 14
  const totalW = DEMOS.length * (cardW + gap)

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 20, zIndex: 2, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 20, zIndex: 2, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none' }} />
      <div style={{
        display: 'flex', gap, width: 'max-content',
        animation: `labScroll ${DEMOS.length * 6}s linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {DEMOS_LOOP.map((Demo, i) => (
          <div key={i} style={{ width: cardW, flexShrink: 0, height: 380, overflow: 'hidden' }}>
            <Demo />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes labScroll {
          0% { transform: translateX(0) }
          100% { transform: translateX(-${totalW}px) }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION — MANOELLA É O CENTRO
// ═══════════════════════════════════════════════════════════
export function LabSection() {
  return (
    <div className="glow-purple" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <p style={{
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 600,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 6,
            }}>Treinamento inteligente</p>
            <p style={{
              fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: '-0.04em',
            }}>
              <Grad size="inherit">Fluency Lab</Grad>
            </p>
          </div>
        </Fade>

        {/* ── MANOELLA — hero avatar ── */}
        <Fade delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            {/* Avatar with glow ring */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%', padding: 3,
              background: `conic-gradient(from 0deg, ${C.teal}, ${C.purple}, ${C.teal})`,
              boxShadow: `0 0 40px ${C.teal}20, 0 0 80px ${C.purple}10`,
              marginBottom: 16,
            }}>
              <img src="/avatars/manoella.jpg" alt="Manoella IA" style={{
                width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                border: `3px solid ${C.bg}`,
              }} />
            </div>

            {/* Name + role */}
            <p style={{ fontSize: 18, fontWeight: 800, color: C.t1, marginBottom: 4 }}>Manoella</p>
            <p style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: 2, marginBottom: 16 }}>SUA IA DE FLUÊNCIA</p>

            {/* What she does */}
            <p style={{
              fontSize: 15, color: C.t2, lineHeight: 1.7, textAlign: 'center',
              maxWidth: 420,
            }}>
              Converse em inglês, faça treinos específicos e receba{' '}
              <strong style={{ color: C.t1 }}>relatório e feedback personalizado</strong> em tempo real.
            </p>
          </div>
        </Fade>

        {/* ── DEMOS CAROUSEL ── */}
        <Fade delay={0.15}>
          <LabCarousel />
        </Fade>

        {/* Copy */}
        <Fade delay={0.2}>
          <p style={{
            textAlign: 'center', fontSize: 15, color: C.t2, marginTop: 20, lineHeight: 1.6,
          }}>
            Sem ordem fixa. <strong style={{ color: C.t1 }}>Treine o que quiser, quando quiser.</strong>
          </p>
        </Fade>

        {/* Tech badges */}
        <Fade delay={0.25}>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 16,
          }}>
            {['Reconhecimento de Voz', 'Análise de Fluência', 'Correção por IA', 'Feedback Instantâneo'].map((t, i) => (
              <span key={i} style={{
                fontFamily: FONT.mono, fontSize: 11, fontWeight: 700,
                color: C.t2, padding: '6px 12px', borderRadius: 6,
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                letterSpacing: 1,
              }}>{t}</span>
            ))}
          </div>
        </Fade>
      </S>
    </div>
  )
}
