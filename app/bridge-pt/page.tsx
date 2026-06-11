'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════
// /bridge-pt — preview do modelo editorial aplicado ao Português Cantado
// Mesma estrutura da /bridge (Inglês): Headline → Sub → Ato I problema
// → Ato II solução → Ato III reflexo + CTA. Mecanismo: música, não áudio.
// ═══════════════════════════════════════════════════════════════

const L = {
  bg: '#fafaf7',
  bg2: '#ffffff',
  bg3: '#f3f1ec',
  text: '#1c1b1a',
  textDim: 'rgba(28,27,26,.72)',
  textMuted: 'rgba(28,27,26,.58)',
  textFaint: 'rgba(28,27,26,.42)',
  border: 'rgba(0,0,0,.10)',
  borderLight: 'rgba(0,0,0,.05)',
  borderStrong: 'rgba(0,0,0,.18)',
  accent: '#7C3AED',
  accentDeep: '#5B21B6',
  accentSoft: 'rgba(124,58,237,.08)',
  red: '#9F1239',
}

const FONT = {
  body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  mono: "ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace",
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'fbclid'] as const

const VSL_BASE = 'https://portugues.concursocantado.com.br/vsl/'

function buildVslUrl(): string {
  if (typeof window === 'undefined') return VSL_BASE
  const params = new URLSearchParams(window.location.search)
  const url = new URL(VSL_BASE)
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) url.searchParams.set(k, v)
  })
  if (!url.searchParams.get('utm_content')) url.searchParams.set('utm_content', 'bridge-pt')
  return url.toString()
}

function SectionRule({ num, title }: { num: string; title?: string }) {
  return (
    <div style={{ margin: '64px 0 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{
        fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, letterSpacing: 4,
        color: L.accent, padding: '4px 12px', border: `1px solid ${L.accent}`, borderRadius: 2,
      }}>
        {num}
      </span>
      <div style={{ height: 1, flex: 1, background: L.border }} />
      {title && (
        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, letterSpacing: 3, color: L.textDim, textTransform: 'uppercase' }}>
          {title}
        </span>
      )}
    </div>
  )
}

function PullQuote({ children, large }: { children: React.ReactNode; large?: boolean }) {
  return (
    <blockquote style={{
      margin: '40px 0',
      padding: large ? '36px 32px 36px 40px' : '28px 28px 28px 32px',
      borderLeft: `4px solid ${L.accent}`,
      background: L.accentSoft,
      borderRadius: '0 8px 8px 0',
      fontSize: large ? 'clamp(22px, 5vw, 30px)' : 'clamp(19px, 4.2vw, 24px)',
      fontWeight: large ? 700 : 600,
      lineHeight: 1.32,
      letterSpacing: '-0.022em',
      color: L.text,
      fontFamily: FONT.body,
    }}>
      {children}
    </blockquote>
  )
}

function BrainIcon({ color = '#000', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
    </svg>
  )
}

// ─── Ato I: Variedade — concurseiro consome muita coisa, não fixa nada ───
function GraphVarietyPT() {
  const inputs = [
    { x: 70, y: 80, label: 'PDF' },
    { x: 175, y: 65, label: 'aula' },
    { x: 280, y: 85, label: 'resumo' },
    { x: 385, y: 70, label: 'mapa' },
    { x: 490, y: 82, label: 'podcast' },
    { x: 120, y: 130, label: 'simulado' },
    { x: 230, y: 135, label: 'apostila' },
    { x: 340, y: 125, label: 'flashcard' },
    { x: 445, y: 130, label: 'questão' },
  ]
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Estudo variado
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Você consome muita coisa diferente
      </h3>
      <p style={{ fontSize: 15, color: L.textDim, marginBottom: 28, fontWeight: 500 }}>
        E não repete nada até o cérebro travar a regra.
      </p>

      <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.textMuted, textTransform: 'uppercase', marginBottom: 16 }}>
        O que você consome
      </p>

      <svg viewBox="0 0 600 220" style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 24 }} aria-hidden>
        {inputs.map((d, i) => (
          <g key={i}>
            <rect x={d.x - 55} y={d.y - 25} width="110" height="46" rx="6" fill={L.bg3} stroke={L.textFaint} strokeWidth="1.3" />
            <text x={d.x} y={d.y + 6} fontFamily={FONT.mono} fontSize="16" fontWeight="700" fill={L.textDim} textAnchor="middle">
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ textAlign: 'center', margin: '20px 0', fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.textMuted, textTransform: 'uppercase' }}>
        → consequência na prova ↓
      </div>
      <div style={{ height: 1, background: L.border, marginBottom: 28 }} />

      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <p style={{
          fontFamily: FONT.mono,
          fontSize: 'clamp(22px, 5.6vw, 32px)',
          fontWeight: 700,
          color: L.textDim,
          letterSpacing: '-0.02em',
          marginBottom: 12,
          textDecoration: 'line-through',
          textDecorationColor: 'rgba(159,18,57,.55)',
          textDecorationThickness: 3,
        }}>
          ênclise com palavra negativa?
        </p>
        <p style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: L.textMuted, fontStyle: 'italic', marginBottom: 36 }}>
          (regra que você já viu 4 vezes e não lembra na hora)
        </p>

        <p style={{
          fontSize: 'clamp(56px, 14vw, 88px)',
          fontWeight: 900,
          color: L.text,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: 12,
        }}>
          ~12%
        </p>
        <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 3, color: L.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>
          do edital
        </p>
        <p style={{ fontSize: 'clamp(14px, 2.9vw, 16px)', color: L.textDim, fontStyle: 'italic' }}>
          fica retido até o dia da prova
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: '18px 22px', background: L.bg3, borderRadius: 4 }}>
        <BrainIcon color={L.text} size={26} />
        <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: L.text, textTransform: 'uppercase' }}>Cérebro:</span>
        <span style={{ fontFamily: FONT.body, fontSize: 16, color: L.textDim, fontWeight: 500 }}>
          <strong style={{ color: L.text, fontWeight: 800 }}>sobrecarregado</strong> · esquece a regra antes da próxima questão
        </span>
      </div>
    </figure>
  )
}

// ─── Ato II: Repetição musical — mesma regra cantada 5x ───
function GraphMusicPT() {
  const reps = [0, 1, 2, 3, 4]
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Mesma regra cantada
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Uma regra. Um refrão. Repetido.
      </h3>
      <p style={{ fontSize: 15, color: L.accent, marginBottom: 28, fontWeight: 600 }}>
        Até virar reflexo na prova.
      </p>

      <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase', marginBottom: 16 }}>
        Repetição cantada
      </p>

      <svg viewBox="0 0 600 130" style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 12 }} aria-hidden>
        {reps.map((_, i) => (
          <g key={i} transform={`translate(${110 + i * 95}, 65)`}>
            <rect x="-52" y="-28" width="104" height="56" rx="6" fill={L.accent} opacity={0.18 + i * 0.10} stroke={L.accent} strokeWidth="1.5" />
            <text x="0" y="6" fontFamily={FONT.body} fontSize="15" fontWeight="700" fill={i >= 3 ? L.bg2 : L.text} textAnchor="middle">
              mesmo refrão
            </text>
          </g>
        ))}
      </svg>

      <p style={{ textAlign: 'center', fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 15px)', fontWeight: 700, letterSpacing: 2, color: L.accent, textTransform: 'uppercase', marginBottom: 20 }}>
        até a regra virar familiar
      </p>

      <div style={{ textAlign: 'center', margin: '12px 0', fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase' }}>
        → consequência na prova ↓
      </div>
      <div style={{ height: 1, background: L.accent, opacity: 0.3, marginBottom: 28 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
        {[
          { label: '1ª ESCUTA', text: 'palavra negativa... atrai pronome?', color: L.textFaint, weight: 600, italic: true },
          { label: '+ ALGUMAS', text: 'palavra negativa atrai o pronome', color: L.textDim, weight: 700, italic: false },
          { label: '+ VÁRIAS', text: 'PALAVRA NEGATIVA ATRAI O PRONOME', color: L.text, weight: 800, italic: false },
          { label: 'NA PROVA', text: '"NÃO ME ENGANE" ✓ (próclise)', color: L.accent, weight: 800, italic: false, highlight: true },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px',
            background: s.highlight ? L.accentSoft : 'transparent',
            border: s.highlight ? `1px solid ${L.accent}` : `1px solid ${L.borderLight}`,
            borderRadius: 6,
          }}>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: 'clamp(12px, 2.6vw, 14px)',
              fontWeight: 800,
              letterSpacing: 2,
              color: s.highlight ? L.accent : L.textMuted,
              minWidth: 100,
            }}>
              {s.label}
            </span>
            <span style={{
              fontFamily: FONT.body,
              fontSize: 'clamp(14px, 3.4vw, 18px)',
              fontWeight: s.weight,
              color: s.color,
              fontStyle: s.italic ? 'italic' : 'normal',
              flex: 1,
            }}>
              {s.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <p style={{
          fontSize: 'clamp(56px, 14vw, 88px)',
          fontWeight: 900,
          color: L.accent,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: 12,
        }}>
          ~94%
        </p>
        <p style={{ fontFamily: FONT.mono, fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, letterSpacing: 3, color: L.accent, textTransform: 'uppercase', marginBottom: 12 }}>
          de acerto
        </p>
        <p style={{ fontSize: 'clamp(14px, 2.9vw, 16px)', color: L.textDim, fontStyle: 'italic' }}>
          na regra que entrou cantada
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: '18px 22px', background: L.accentSoft, borderRadius: 4 }}>
        <BrainIcon color={L.accent} size={26} />
        <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase' }}>Cérebro:</span>
        <span style={{ fontFamily: FONT.body, fontSize: 16, color: L.text, fontWeight: 500 }}>
          <strong style={{ color: L.accent, fontWeight: 800 }}>fixa</strong> · responde no automático, mesmo no estresse de prova
        </span>
      </div>
    </figure>
  )
}

function CalloutMinutePT({ vslUrl }: { vslUrl: string }) {
  return (
    <aside style={{
      margin: '52px 0 0',
      padding: '52px 32px 44px',
      background: L.text,
      borderRadius: 6,
      textAlign: 'center',
      color: L.bg2,
    }}>
      <p style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: 3.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 28 }}>
        Experimento da Repetição Musical
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <p style={{
          fontSize: 'clamp(16px, 3.6vw, 20px)',
          fontWeight: 600,
          color: 'rgba(255,255,255,.35)',
          textDecoration: 'line-through',
          textDecorationColor: 'rgba(255,255,255,.5)',
          textDecorationThickness: 2,
        }}>
          100% do edital
        </p>

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>

        <div style={{
          padding: '18px 32px',
          background: L.accent,
          borderRadius: 6,
          boxShadow: '0 8px 28px rgba(124,58,237,.25)',
        }}>
          <p style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, color: L.bg2, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
            1<span style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: 2 }}>ª</span> Música do tópico mais cobrado
          </p>
          <p style={{
            fontSize: 'clamp(11px, 2.4vw, 13px)',
            fontWeight: 500,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,.78)',
            marginTop: 6,
            letterSpacing: '-0.005em',
          }}>
            (3 minutos por dia, fone no ouvido)
          </p>
        </div>

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>

        <p style={{
          fontSize: 'clamp(17px, 3.8vw, 22px)',
          fontWeight: 700,
          color: L.bg2,
          letterSpacing: '-0.015em',
        }}>
          1 regra por vez
        </p>
      </div>

      <p style={{
        fontFamily: FONT.mono,
        fontSize: 14, fontWeight: 800, letterSpacing: 3,
        textTransform: 'uppercase', color: L.accent,
        marginBottom: 8,
      }}>
        ↑ Você começa aqui
      </p>

      <p style={{
        fontSize: 'clamp(15px, 3.4vw, 17px)',
        fontWeight: 500,
        color: 'rgba(255,255,255,.78)',
        marginTop: 32,
        marginBottom: 4,
        lineHeight: 1.5,
        maxWidth: 400,
        marginLeft: 'auto', marginRight: 'auto',
      }}>
        A aula que te mostra isso na prática está aqui:
      </p>

      <a href={vslUrl} style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '22px 36px',
        background: L.accent,
        color: L.bg2,
        fontWeight: 800,
        fontSize: 'clamp(15px, 3.6vw, 17px)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        borderRadius: 6,
        transition: 'transform .15s ease, filter .15s ease',
        width: '100%',
        maxWidth: 440,
        marginTop: 16,
        boxShadow: '0 10px 30px rgba(124,58,237,.32)',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)' }}>
        Assistir a aula
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 32, marginTop: 22 }}>
        {[-22, 0, 22].map((rot, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `rotate(${rot}deg)`,
              transformOrigin: 'center',
            }}
          >
            <svg
              width="28" height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,.75)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: 'bridgeArrowUp 1.6s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        ))}
      </div>
    </aside>
  )
}

export default function BridgePTPage() {
  const router = useRouter()
  const [vslUrl, setVslUrl] = useState(VSL_BASE)

  useEffect(() => {
    setVslUrl(buildVslUrl())
  }, [router])

  return (
    <div style={{
      background: L.bg,
      color: L.text,
      minHeight: '100vh',
      fontFamily: FONT.body,
      fontWeight: 400,
      letterSpacing: '-0.005em',
      lineHeight: 1.55,
    }}>
      <header style={{
        borderBottom: `1px solid ${L.border}`,
        padding: '18px 24px',
        background: L.bg,
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 800, letterSpacing: 3, color: L.text, textTransform: 'uppercase' }}>
            Maestro · Português
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: 2, color: L.textMuted, textTransform: 'uppercase' }}>
            Leitura · 2 min
          </span>
        </div>
      </header>

      <main style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '64px 24px 96px',
      }}>
        <p style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 3.5,
          textTransform: 'uppercase',
          color: L.accent,
          marginBottom: 24,
        }}>
          Sem graça, mas funciona
        </p>

        <h1 style={{
          fontSize: 'clamp(34px, 7.5vw, 60px)',
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: '-0.04em',
          marginBottom: 28,
          color: L.text,
        }}>
          Estudei Português cinco anos.<br />Cantei cinco dias e parou de cair em pegadinha.
        </h1>

        <p style={{
          fontSize: 'clamp(17px, 3.8vw, 22px)',
          color: L.textDim,
          fontWeight: 400,
          marginBottom: 28,
          lineHeight: 1.5,
          letterSpacing: '-0.01em',
        }}>
          Se você cansou de PDF, videoaula e simulado, e continua errando os mesmos itens nas bancas, é porque o problema não é entender — é fixar.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 32, color: L.textMuted,
        }}>
          <span style={{
            fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: 2.5,
            textTransform: 'uppercase',
          }}>
            Continue lendo
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'bridgeArrowBounce 1.8s ease-in-out infinite' }}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>

        <style>{`
          @keyframes bridgeArrowBounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(6px); opacity: 1; }
          }
          @keyframes bridgeArrowUp {
            0%, 100% { transform: translateY(0); opacity: 0.55; }
            50% { transform: translateY(-7px); opacity: 1; }
          }
        `}</style>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          paddingTop: 24, borderTop: `1px solid ${L.border}`,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: L.text, color: L.bg2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', flexShrink: 0,
          }}>
            ML
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 2 }}>
              Por Marcos Lobão
            </p>
            <p style={{ fontSize: 12, color: L.textMuted, lineHeight: 1.4 }}>
              Cansou de decorar regra que esquecia até o dia da prova
            </p>
          </div>
        </div>

        <SectionRule num="I" />

        <PullQuote large>
          Existe uma <span style={{ color: L.accent }}>quantidade específica de repetições</span> que transforma uma regra em RESPOSTA AUTOMÁTICA na prova.
        </PullQuote>

        <div style={{
          fontSize: 'clamp(17px, 3.6vw, 19px)',
          color: L.text,
          lineHeight: 1.72,
          fontWeight: 400,
        }}>
          <p style={{ marginBottom: 24, color: L.textDim, fontSize: 'clamp(18px, 3.8vw, 21px)', fontWeight: 600 }}>
            A maioria dos concurseiros nunca chega nesse ponto.
          </p>

          <p style={{ marginBottom: 24, color: L.textDim }}>
            Eles veem aula, leem PDF, fazem resumo, mapa mental, flashcard, simulado… mas não repetem nenhuma regra o suficiente pro cérebro travar a resposta.
          </p>

          <GraphVarietyPT />

          <SectionRule num="II" title="A Repetição Cantada" />

          <PullQuote>
            Só que o cérebro <strong style={{ fontWeight: 800 }}>não funciona com variedade</strong>.<br />
            Ele funciona com <span style={{ color: L.accent, fontWeight: 800 }}>repetição</span>. E o jeito mais rápido de repetir sem cansar é <span style={{ color: L.accent, fontWeight: 800 }}>cantando</span>.
          </PullQuote>

          <p style={{ marginBottom: 24 }}>
            Quando a regra entra dentro de uma música — refrão certo, melodia que gruda — o cérebro larga o esforço consciente.
          </p>

          <p style={{ marginBottom: 24, color: L.textDim }}>
            Você não decora. Você não revisa.<br />
            Você escuta no ônibus, no banho, na fila.<br />
            E na hora da prova a resposta sai <strong style={{ fontWeight: 700, color: L.text }}>antes do raciocínio</strong>.
          </p>

          <GraphMusicPT />

          <SectionRule num="III" />

          <PullQuote large>
            É o momento em que decorar deixa de ser sofrimento… e vira <span style={{ color: L.accent }}>reflexo de prova</span>.
          </PullQuote>

          <p style={{ marginBottom: 0, color: L.text, fontSize: 'clamp(18px, 3.8vw, 21px)', fontWeight: 500, lineHeight: 1.55 }}>
            E o Marcos gravou a aula que mostra o <strong style={{ color: L.accent, fontWeight: 800 }}>loop musical exato</strong> que travou o Português dele em tempo recorde — mesmo método que já levou milhares de concurseiros pra dentro do automático.
          </p>

          <CalloutMinutePT vslUrl={vslUrl} />
        </div>

        <div style={{ marginTop: 80, paddingTop: 28, borderTop: `1px solid ${L.border}`, textAlign: 'center' }}>
          <p style={{ fontFamily: FONT.mono, fontSize: 10, color: L.textMuted, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600 }}>
            Marcos Lobão · Maestro Concursos
          </p>
        </div>
      </main>
    </div>
  )
}
