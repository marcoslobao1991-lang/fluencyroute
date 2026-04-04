'use client'

import { useState } from 'react'
import { C, FONT } from '../design'
import { useInView, Fade, S, Label, Glass, Grad } from '../primitives'

// ═══════════════════════════════════════════════════════════
// DATA — 6 dimensions (same as real app)
// ═══════════════════════════════════════════════════════════
const DIMENSIONS = [
  { key: 'listening', label: 'Listening', icon: '🎧', color: '#4ECDC4', score: 72 },
  { key: 'reading', label: 'Reading', icon: '📖', color: '#A78BFA', score: 65 },
  { key: 'pronunciation', label: 'Pronúncia', icon: '🗣️', color: '#FF6B6B', score: 78 },
  { key: 'accent', label: 'Naturalidade', icon: '🎭', color: '#FBBF24', score: 61 },
  { key: 'conversation', label: 'Conversação', icon: '💬', color: '#f97316', score: 55 },
  { key: 'writing', label: 'Writing', icon: '✍️', color: '#3b82f6', score: 48 },
]

const DIMS_LOOP = [...DIMENSIONS, ...DIMENSIONS]

function SkillCarousel() {
  const [paused, setPaused] = useState(false)
  const cardW = 180
  const gap = 12
  const totalW = DIMENSIONS.length * (cardW + gap)

  return (
    <div style={{ overflow: 'hidden', position: 'relative', marginTop: 16 }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 20, zIndex: 2,
        background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: 20, zIndex: 2,
        background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex', gap, width: 'max-content',
        animation: `skillScroll ${DIMENSIONS.length * 4}s linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {DIMS_LOOP.map((d, i) => (
          <div key={i} className="hud" style={{
            width: cardW, flexShrink: 0,
            padding: '16px', borderRadius: 4,
            background: `linear-gradient(160deg, ${d.color}08, ${C.glass})`,
            border: `1px solid ${d.color}15`,
            position: 'relative', overflow: 'hidden',
            '--hud-c': `${d.color}40`,
          } as React.CSSProperties}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
              backgroundImage: `repeating-linear-gradient(0deg, ${d.color} 0, ${d.color} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, ${d.color} 0, ${d.color} 1px, transparent 1px, transparent 20px)`,
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${d.color}10`, border: `1px solid ${d.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  boxShadow: `0 0 16px ${d.color}15`,
                }}>{d.icon}</div>
                <span style={{
                  fontFamily: FONT.mono, fontSize: 28, fontWeight: 900, color: d.color,
                  textShadow: `0 0 20px ${d.color}30`,
                }}>{d.score}</span>
              </div>
              <p style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: d.color, letterSpacing: 1, marginBottom: 8 }}>{d.label.toUpperCase()}</p>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: `linear-gradient(90deg, ${d.color}, ${d.color}AA)`,
                  width: `${d.score}%`,
                  boxShadow: `0 0 12px ${d.color}50`,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.t3 }}>0</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: `${C.teal}60` }}>70</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.t3 }}>100</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skillScroll {
          0% { transform: translateX(0) }
          100% { transform: translateX(-${totalW}px) }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ANIMATED RADAR CHART (identical to real app)
// ═══════════════════════════════════════════════════════════
function RadarChart() {
  const { ref, v } = useInView(0.2)
  const cx = 170, cy = 170, r = 110
  const n = DIMENSIONS.length

  const getPoint = (i: number, pct: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return {
      x: cx + Math.cos(angle) * r * (pct / 100),
      y: cy + Math.sin(angle) * r * (pct / 100),
    }
  }

  // Background rings
  const rings = [25, 50, 70, 100]
  const threshold = 70

  // Data polygon
  const dataPoints = DIMENSIONS.map((d, i) => getPoint(i, v ? d.score : 0))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 340 340" style={{ width: '100%', maxWidth: 340, height: 'auto' }}>
        {/* Background rings */}
        {rings.map(pct => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, pct))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
          return (
            <path key={pct} d={path} fill="none"
              stroke={pct === threshold ? `${C.teal}30` : 'rgba(255,255,255,0.04)'}
              strokeWidth={pct === threshold ? 1.5 : 0.5}
              strokeDasharray={pct === threshold ? '4 4' : 'none'}
            />
          )
        })}

        {/* Radial axes */}
        {DIMENSIONS.map((_, i) => {
          const p = getPoint(i, 100)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        })}

        {/* Data polygon — animated */}
        <path d={dataPath} fill={`${C.teal}12`} stroke={C.teal} strokeWidth="2" strokeLinejoin="round"
          style={{ transition: 'all 2s cubic-bezier(.16,1,.3,1) 0.3s' }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5"
            fill={DIMENSIONS[i].color} stroke={C.bg} strokeWidth="2"
            style={{ transition: `all 2s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.1}s` }}
          />
        ))}

        {/* Labels outside */}
        {DIMENSIONS.map((d, i) => {
          const labelPt = getPoint(i, 125)
          return (
            <g key={i} style={{ opacity: v ? 1 : 0, transition: `opacity 0.5s ease ${1.5 + i * 0.1}s` }}>
              <text x={labelPt.x} y={labelPt.y - 6} textAnchor="middle" fill={d.color}
                style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 800 }}
              >{v ? d.score : 0}</text>
              <text x={labelPt.x} y={labelPt.y + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)"
                style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600 }}
              >{d.label}</text>
            </g>
          )
        })}

        {/* Center overall score */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={C.white}
          style={{ fontFamily: FONT.mono, fontSize: 32, fontWeight: 900, opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 2s' }}
        >{v ? '63' : '0'}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 2.2s' }}
        >OVERALL</text>
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTION
// ═══════════════════════════════════════════════════════════
export function SkillScanSection() {
  return (
    <div className="glow-teal" style={{ overflow: 'hidden' }}>
      <S>
        <Fade>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 400,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 6,
            }}>Seu inglês em 6 dimensões</p>
            <p style={{
              fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: '-0.04em',
            }}>
              <Grad size="inherit">Skill Scan</Grad>
            </p>
            <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: C.t1, marginTop: 16, lineHeight: 1.5, fontWeight: 700 }}>
              Você descobre onde tá fraco.<br />
              <span style={{ color: C.teal }}>A plataforma monta seu treino.</span>
            </p>
          </div>
        </Fade>

        {/* Radar chart — real from app */}
        <Fade delay={0.1} from="scale">
          <Glass accent={C.teal} hud style={{ padding: 'clamp(16px, 4vw, 28px)', position: 'relative', overflow: 'hidden' }}>
            {/* Scan line effect */}
            <div style={{
              position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${C.teal}20, transparent)`,
                animation: 'scanMove 5s linear infinite',
              }} />
            </div>

            <RadarChart />
          </Glass>
        </Fade>

        {/* 6 skill cards — infinite auto-scroll carousel */}
        <Fade delay={0.2}>
          <SkillCarousel />
        </Fade>

        {/* Overall score card — like the real app */}
        <Fade delay={0.25}>
          <Glass accent={C.teal} hud style={{ marginTop: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
              backgroundImage: `repeating-linear-gradient(0deg, ${C.teal} 0, ${C.teal} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, ${C.teal} 0, ${C.teal} 1px, transparent 1px, transparent 20px)`,
            }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Big score */}
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{
                  fontFamily: FONT.mono, fontSize: 48, fontWeight: 900,
                  background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}>63</p>
                <p style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: 2, marginTop: 4 }}>OVERALL</p>
              </div>

              <div style={{ width: 1, height: 60, background: C.border }} />

              {/* Level + bar */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: FONT.mono, fontSize: 12, fontWeight: 800,
                    color: '#000', padding: '3px 10px', borderRadius: 6,
                    background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
                    letterSpacing: 1,
                  }}>INTERMEDIATE</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, width: '63%',
                    background: `linear-gradient(90deg, ${C.teal}, ${C.purple})`,
                    boxShadow: `0 0 12px ${C.teal}40`,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.t3 }}>BEGINNER</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.t3 }}>ADVANCED</span>
                </div>
              </div>
            </div>
          </Glass>
        </Fade>

        <Fade delay={0.3}>
          <p style={{
            textAlign: 'center', fontSize: 15, color: C.t2, marginTop: 20, lineHeight: 1.6,
          }}>
            Novo diagnóstico a cada 15 dias.{' '}
            <strong style={{ color: C.t1 }}>Você vê sua evolução acontecendo.</strong>
          </p>
        </Fade>
      </S>
    </div>
  )
}
