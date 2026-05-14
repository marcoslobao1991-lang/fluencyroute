'use client'

import { useEffect, useState } from 'react'
import { trackViewContent } from '../lib/pixel'

// ═══════════════════════════════════════════════════════════════
// /bridge — Advertorial editorial light v4
// Curiosity gap + pull-quotes + visualizações
// Toda copy literal das fontes validadas (ad_03, adv_copia, VSL doc)
// ═══════════════════════════════════════════════════════════════

const L = {
  bg: '#fafaf7',
  bg2: '#ffffff',
  bg3: '#f3f1ec',
  text: '#1c1b1a',
  textDim: 'rgba(28,27,26,.70)',
  textMuted: 'rgba(28,27,26,.48)',
  textFaint: 'rgba(28,27,26,.25)',
  border: 'rgba(0,0,0,.10)',
  borderLight: 'rgba(0,0,0,.05)',
  borderStrong: 'rgba(0,0,0,.18)',
  glass: 'rgba(0,0,0,.025)',
  accent: '#0F766E',
  accentDeep: '#134E4A',
  accentSoft: 'rgba(15,118,110,.08)',
  red: '#9F1239',
}

const FONT = {
  body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  mono: "ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace",
  serif: "'Georgia', 'Times New Roman', serif",
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'fbclid'] as const

function buildVslUrl(): string {
  if (typeof window === 'undefined') return '/vsl'
  const params = new URLSearchParams(window.location.search)
  const url = new URL('/vsl', window.location.origin)
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) url.searchParams.set(k, v)
  })
  if (!url.searchParams.get('utm_content')) url.searchParams.set('utm_content', 'bridge')
  return url.pathname + url.search
}

// ─── COMPONENTES VISUAIS ───────────────────────────────────────

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

// ─── ÍCONES ────────────────────────────────────────────────────

function EarIcon({ color = '#000', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
      <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1-2 2" />
    </svg>
  )
}

// ─── GRÁFICOS (v3 — narrativa progressiva) ─────────────────────

function GraphVariety() {
  // ícones diferentes (cada label representa um tipo de conteúdo)
  const inputs = [
    { x: 70, y: 80, label: 'aula' },
    { x: 175, y: 65, label: 'vídeo' },
    { x: 280, y: 85, label: 'frase' },
    { x: 385, y: 70, label: 'podcast' },
    { x: 490, y: 82, label: 'artigo' },
    { x: 120, y: 130, label: 'curso' },
    { x: 230, y: 135, label: 'reel' },
    { x: 340, y: 125, label: 'short' },
    { x: 445, y: 130, label: 'app' },
  ]
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Conteúdo variado
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Eles consomem muita coisa diferente
      </h3>
      <p style={{ fontSize: 15, color: L.textDim, marginBottom: 28, fontWeight: 500 }}>
        E não treinam nada até o automático.
      </p>

      <svg viewBox="0 0 600 480" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
        {/* ─── INPUT: conteúdos diferentes ─── */}
        <text x="30" y="38" fontFamily={FONT.mono} fontSize="15" fontWeight="700" letterSpacing="2.5" fill={L.textMuted}>
          O QUE ELES CONSOMEM
        </text>

        {inputs.map((d, i) => (
          <g key={i}>
            <rect x={d.x - 55} y={d.y - 25} width="110" height="46" rx="6" fill={L.bg3} stroke={L.textFaint} strokeWidth="1.3" />
            <text x={d.x} y={d.y + 5} fontFamily={FONT.mono} fontSize="16" fontWeight="700" fill={L.textDim} textAnchor="middle">
              {d.label}
            </text>
          </g>
        ))}

        {/* divider arrow embolado */}
        <text x="300" y="210" fontFamily={FONT.mono} fontSize="15" fontWeight="700" letterSpacing="2.5" fill={L.textMuted} textAnchor="middle">
          → CONSEQUÊNCIA NO OUVIDO ↓
        </text>
        <line x1="30" y1="215" x2="570" y2="215" stroke={L.borderLight} strokeWidth="1" strokeDasharray="3 5" />

        {/* ─── OUTPUT: embolado ─── */}
        <defs>
          <filter id="blurVariety">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        <g filter="url(#blurVariety)" opacity="0.85" transform="translate(0, 260)">
          <path d="M 30 30 Q 60 5 90 30 T 150 40 T 210 15 T 270 35 T 330 25 T 390 45 T 450 20 T 510 30 T 570 25" fill="none" stroke={L.textFaint} strokeWidth="2" />
          <path d="M 30 25 Q 75 45 120 25 T 180 10 T 240 40 T 300 20 T 360 30 T 420 15 T 480 40 T 570 30" fill="none" stroke={L.textFaint} strokeWidth="2" opacity="0.7" />
          <path d="M 30 35 Q 85 15 145 40 T 235 25 T 325 35 T 415 18 T 505 30 T 570 22" fill="none" stroke={L.textFaint} strokeWidth="2" opacity="0.5" />
        </g>

        {/* texto embolado */}
        <text
          x="300" y="370"
          fontFamily={FONT.mono}
          fontSize="32"
          fontWeight="700"
          fill={L.textDim}
          textAnchor="middle"
          letterSpacing="-3"
          filter="url(#blurVariety)"
        >
          theresnothingtotell
        </text>

        <text x="300" y="425" fontFamily={FONT.mono} fontSize="14" fontWeight="700" letterSpacing="2.5" fill={L.textMuted} textAnchor="middle">
          TUDO GRUDADO · NADA SEPARÁVEL
        </text>
        <text x="300" y="455" fontFamily={FONT.body} fontSize="13" fill={L.textFaint} textAnchor="middle" fontStyle="italic">
          (a frase real: "There's nothing to tell.")
        </text>
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: '18px 22px', background: L.bg3, borderRadius: 4 }}>
        <EarIcon color={L.text} size={26} />
        <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: L.text, textTransform: 'uppercase' }}>Ouvido:</span>
        <span style={{ fontFamily: FONT.body, fontSize: 16, color: L.textDim, fontWeight: 500 }}>
          <strong style={{ color: L.text, fontWeight: 800 }}>embolado</strong> · não entende nem as palavras essenciais
        </span>
      </div>
    </figure>
  )
}

function GraphRepetition() {
  const words = ["There's", 'nothing', 'to', 'tell.']
  // mesmo trecho repetido (5 instâncias) — sem citar quantidade exata (curiosity gap fica preservado)
  const reps = [0, 1, 2, 3, 4]
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Conteúdo concentrado
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Repetição concentrada no mesmo trecho
      </h3>
      <p style={{ fontSize: 15, color: L.accent, marginBottom: 28, fontWeight: 600 }}>
        E treinam até virar automático.
      </p>

      <svg viewBox="0 0 600 480" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
        {/* ─── INPUT: mesmo trecho repetido ─── */}
        <text x="30" y="38" fontFamily={FONT.mono} fontSize="15" fontWeight="700" letterSpacing="2.5" fill={L.accent}>
          TREINO CONCENTRADO
        </text>

        {reps.map((_, i) => (
          <g key={i} transform={`translate(${110 + i * 95}, 95)`}>
            <rect x="-52" y="-25" width="104" height="50" rx="6" fill={L.accent} opacity={0.18 + i * 0.10} stroke={L.accent} strokeWidth="1.5" />
            <text x="0" y="6" fontFamily={FONT.body} fontSize="15" fontWeight="700" fill={i >= 3 ? L.bg2 : L.text} textAnchor="middle">
              mesmo trecho
            </text>
          </g>
        ))}

        {/* indicador de repetição contínua */}
        <text x="300" y="170" fontFamily={FONT.mono} fontSize="15" fontWeight="700" letterSpacing="2.5" fill={L.accent} textAnchor="middle">
          repetido até virar familiar
        </text>

        {/* divider */}
        <text x="300" y="210" fontFamily={FONT.mono} fontSize="15" fontWeight="700" letterSpacing="2.5" fill={L.accent} textAnchor="middle">
          → CONSEQUÊNCIA NO OUVIDO ↓
        </text>
        <line x1="30" y1="225" x2="570" y2="225" stroke={L.accentSoft} strokeWidth="1" />
        <line x1="30" y1="225" x2="570" y2="225" stroke={L.accent} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

        {/* ─── OUTPUT: nítido ─── */}
        <g transform="translate(0, 270)">
          <line x1="30" y1="50" x2="570" y2="50" stroke={L.borderLight} strokeWidth="1" />

          {/* 4 picos limpos */}
          {[120, 250, 380, 490].map((cx, i) => (
            <g key={i}>
              <path
                d={`M ${cx - 30} 50 Q ${cx - 18} ${30 + i} ${cx - 6} ${15 - i} L ${cx} ${10} L ${cx + 6} ${17 - i} Q ${cx + 18} ${33 + i} ${cx + 30} 50`}
                fill="none"
                stroke={L.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={`M ${cx - 30} 50 Q ${cx - 18} ${70 - i} ${cx - 6} ${85 + i} L ${cx} ${90} L ${cx + 6} ${83 + i} Q ${cx + 18} ${67 - i} ${cx + 30} 50`}
                fill="none"
                stroke={L.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.55"
              />
            </g>
          ))}
        </g>

        {/* divisores entre palavras */}
        {[185, 315, 445].map((x, i) => (
          <line key={i} x1={x} y1="315" x2={x} y2="405" stroke={L.accent} strokeWidth="1" strokeDasharray="3 4" opacity="0.32" />
        ))}

        {/* palavras nítidas */}
        {words.map((w, i) => {
          const cx = [120, 250, 380, 490][i]
          return (
            <g key={i}>
              <rect x={cx - 52} y="378" width="104" height="38" rx="4" fill={L.accent} opacity="0.10" />
              <text
                x={cx} y="403"
                fontFamily={FONT.body}
                fontSize="19"
                fontWeight="800"
                fill={L.text}
                textAnchor="middle"
              >
                {w}
              </text>
            </g>
          )
        })}

        <text x="300" y="445" fontFamily={FONT.mono} fontSize="14" fontWeight="700" letterSpacing="2.5" fill={L.accent} textAnchor="middle">
          CADA PALAVRA SEPARADA · DESTACÁVEL
        </text>
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: '18px 22px', background: L.accentSoft, borderRadius: 4 }}>
        <EarIcon color={L.accent} size={26} />
        <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: L.accent, textTransform: 'uppercase' }}>Ouvido:</span>
        <span style={{ fontFamily: FONT.body, fontSize: 16, color: L.text, fontWeight: 500 }}>
          <strong style={{ color: L.accent, fontWeight: 800 }}>nítido</strong> · até mesmo ouvindo nativos com palavras emendadas
        </span>
      </div>
    </figure>
  )
}

function GraphVarietyVsRepetition() {
  return (
    <figure style={{ margin: '52px 0', padding: '40px 32px 36px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 4 }}>
      <figcaption style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: L.accent, marginBottom: 12 }}>
        Lado a lado
      </figcaption>
      <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: L.text, marginBottom: 28, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Os dois caminhos, lado a lado
      </h3>

      <svg viewBox="0 0 600 380" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
        {/* divisor central */}
        <line x1="300" y1="20" x2="300" y2="340" stroke={L.borderStrong} strokeWidth="1.5" strokeDasharray="5 7" />

        {/* lado esquerdo — VARIEDADE (cinza) */}
        <text x="150" y="50" fontFamily={FONT.mono} fontSize="15" fontWeight="800" fill={L.text} letterSpacing="3" textAnchor="middle">VARIEDADE</text>
        <text x="150" y="70" fontFamily={FONT.mono} fontSize="10" fontWeight="600" fill={L.textMuted} letterSpacing="2" textAnchor="middle">10 FONTES DIFERENTES</text>

        {/* ícones aleatórios diferentes (a-h) */}
        {[
          { x: 80, y: 120, label: 'a' },
          { x: 220, y: 105, label: 'b' },
          { x: 140, y: 150, label: 'c' },
          { x: 205, y: 175, label: 'd' },
          { x: 65, y: 175, label: 'e' },
          { x: 175, y: 215, label: 'f' },
          { x: 100, y: 220, label: 'g' },
          { x: 230, y: 245, label: 'h' },
        ].map((d, i) => (
          <g key={i}>
            <rect x={d.x - 16} y={d.y - 16} width="32" height="32" rx="4" fill={L.bg3} stroke={L.textFaint} strokeWidth="1.5" />
            <text x={d.x} y={d.y + 5} fontFamily={FONT.mono} fontSize="13" fontWeight="700" fill={L.textMuted} textAnchor="middle">{d.label}</text>
          </g>
        ))}

        {/* seta longa pra fora (não chega à fluência) */}
        <line x1="150" y1="285" x2="150" y2="318" stroke={L.textFaint} strokeWidth="2" />
        <polygon points="142,314 150,326 158,314" fill={L.textFaint} />

        {/* badge resultado esquerda */}
        <rect x="65" y="338" width="170" height="34" rx="4" fill={L.bg3} stroke={L.borderLight} strokeWidth="1" />
        <text x="150" y="361" fontFamily={FONT.mono} fontSize="12" fontWeight="800" fill={L.textDim} letterSpacing="2.5" textAnchor="middle">VOCÊ SOMOU NADA</text>

        {/* lado direito — REPETIÇÃO (teal) */}
        <text x="450" y="50" fontFamily={FONT.mono} fontSize="15" fontWeight="800" fill={L.accent} letterSpacing="3" textAnchor="middle">REPETIÇÃO</text>
        <text x="450" y="70" fontFamily={FONT.mono} fontSize="10" fontWeight="600" fill={L.accent} letterSpacing="2" textAnchor="middle">1 FONTE × 30</text>

        {/* ícones iguais em grid */}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(${360 + (i % 4) * 50}, ${115 + Math.floor(i / 4) * 60})`}>
            <rect x="-16" y="-16" width="32" height="32" rx="4" fill={L.accent} opacity={0.18 + i * 0.09} stroke={L.accent} strokeWidth="1.5" />
            <polygon points="-3,-7 8,0 -3,7" fill={L.bg2} />
          </g>
        ))}

        {/* seta longa pra dentro (chega à fluência) */}
        <line x1="450" y1="285" x2="450" y2="318" stroke={L.accent} strokeWidth="2.5" />
        <polygon points="442,314 450,326 458,314" fill={L.accent} />

        {/* badge resultado direita */}
        <rect x="365" y="338" width="170" height="34" rx="4" fill={L.accent} />
        <text x="450" y="361" fontFamily={FONT.mono} fontSize="12" fontWeight="800" fill={L.bg2} letterSpacing="2.5" textAnchor="middle">VIRA REFLEXO</text>
      </svg>
    </figure>
  )
}

function CalloutMinute({ vslUrl }: { vslUrl: string }) {
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
        Experimento da Repetição
      </p>

      {/* Funil — 2 riscados + 1 destaque */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        {/* 100% do idioma — riscado */}
        <p style={{
          fontSize: 'clamp(16px, 3.6vw, 20px)',
          fontWeight: 600,
          color: 'rgba(255,255,255,.35)',
          textDecoration: 'line-through',
          textDecorationColor: 'rgba(255,255,255,.5)',
          textDecorationThickness: 2,
        }}>
          100% do idioma
        </p>

        {/* seta */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>

        {/* 1º Episódio de Série — DESTAQUE */}
        <div style={{
          padding: '18px 32px',
          background: L.accent,
          borderRadius: 6,
          boxShadow: '0 8px 28px rgba(15,118,110,.25)',
        }}>
          <p style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, color: L.bg2, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
            1<span style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: 2 }}>º</span> Episódio de Série
          </p>
          <p style={{
            fontSize: 'clamp(11px, 2.4vw, 13px)',
            fontWeight: 500,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,.78)',
            marginTop: 6,
            letterSpacing: '-0.005em',
          }}>
            (em inglês sem legenda)
          </p>
        </div>

        {/* seta */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>

        {/* 1 minuto por vez — sub */}
        <p style={{
          fontSize: 'clamp(17px, 3.8vw, 22px)',
          fontWeight: 700,
          color: L.bg2,
          letterSpacing: '-0.015em',
        }}>
          1 minuto por vez
        </p>
      </div>

      {/* Você começa aqui */}
      <p style={{
        fontFamily: FONT.mono,
        fontSize: 14, fontWeight: 800, letterSpacing: 3,
        textTransform: 'uppercase', color: L.accent,
        marginBottom: 8,
      }}>
        ↑ Você começa aqui
      </p>

      {/* Mensagem ponte */}
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

      {/* Seta animada */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, marginBottom: 20 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'bridgeArrowBounce 1.8s ease-in-out infinite' }}>
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      {/* Botão CTA integrado */}
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
        boxShadow: '0 10px 30px rgba(15,118,110,.32)',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)' }}>
        Assistir a aula
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </aside>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────

export default function BridgePage() {
  const [vslUrl, setVslUrl] = useState('/vsl')

  useEffect(() => {
    setVslUrl(buildVslUrl())
    try { trackViewContent('bridge-rota') } catch {}
  }, [])

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
      {/* Header editorial */}
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
            Fluency Route
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
        {/* Eyebrow */}
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

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(34px, 7.5vw, 60px)',
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: '-0.04em',
          marginBottom: 28,
          color: L.text,
        }}>
          Isso é sem graça,<br />mas me deixou fluente em inglês.
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 'clamp(17px, 3.8vw, 22px)',
          color: L.textDim,
          fontWeight: 400,
          marginBottom: 28,
          lineHeight: 1.5,
          letterSpacing: '-0.01em',
        }}>
          Se você cansou de promessa fácil e quer ouvir o que de fato funciona, mesmo sendo chato.
        </p>

        {/* Scroll indicator */}
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
        `}</style>

        {/* Byline editorial */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          paddingTop: 24, borderTop: `1px solid ${L.border}`,
        }}>
          {/* avatar placeholder */}
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
              Vendedor home office pra empresa americana, sem nunca ter saído do Brasil
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────── */}
        <SectionRule num="I" />

        {/* Open loop — primeiro ¶ promovido a pull quote gigante */}
        <PullQuote large>
          Existe um <span style={{ color: L.accent }}>número específico</span> de repetições que transforma inglês em habilidade automática.
        </PullQuote>

        <div style={{
          fontSize: 'clamp(17px, 3.6vw, 19px)',
          color: L.text,
          lineHeight: 1.72,
          fontWeight: 400,
        }}>
          <p style={{ marginBottom: 24, color: L.textDim, fontSize: 'clamp(18px, 3.8vw, 21px)', fontWeight: 600 }}>
            A maioria das pessoas nunca chega nesse ponto.
          </p>

          <p style={{ marginBottom: 24, color: L.textDim }}>
            Elas assistem aulas, veem vídeos curtos, aprendem frases novas… mas não repetem nenhuma delas o suficiente para o cérebro assumir o controle.
          </p>

          <GraphVariety />

          {/* ─────────────────────────────────────── */}
          <SectionRule num="II" title="A Repetição" />

          <PullQuote>
            Só que o cérebro <strong style={{ fontWeight: 800 }}>não funciona com variedade</strong>.<br />
            Ele funciona com <span style={{ color: L.accent, fontWeight: 800 }}>repetição</span>.
          </PullQuote>

          <p style={{ marginBottom: 24 }}>
            E quando você repete o mesmo trecho, o mesmo padrão, o mesmo minuto… algo inevitável acontece.
          </p>

          <p style={{ marginBottom: 24, color: L.textDim }}>
            Os sons começam a ficar familiares.<br />
            As ligações entre as palavras param de assustar.<br />
            E o inglês passa de <em>pensado</em> para <strong style={{ fontWeight: 700, color: L.text }}>automático</strong>.
          </p>

          <GraphRepetition />

          {/* ─────────────────────────────────────── */}
          <SectionRule num="III" />

          <PullQuote large>
            É o momento exato em que a fluência deixa de ser um objetivo… e vira um <span style={{ color: L.accent }}>reflexo</span>.
          </PullQuote>

          <p style={{ marginBottom: 0, color: L.text, fontSize: 'clamp(18px, 3.8vw, 21px)', fontWeight: 500, lineHeight: 1.55 }}>
            E o Marcos gravou a aula que mostra o <strong style={{ color: L.accent, fontWeight: 800 }}>loop de repetição perfeito</strong> para atingir a fluência essencial em tempo recorde.
          </p>

          <CalloutMinute vslUrl={vslUrl} />
        </div>

        {/* Footer minimal */}
        <div style={{ marginTop: 80, paddingTop: 28, borderTop: `1px solid ${L.border}`, textAlign: 'center' }}>
          <p style={{ fontFamily: FONT.mono, fontSize: 10, color: L.textMuted, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600 }}>
            Marcos Lobão · Fluency Route
          </p>
        </div>
      </main>
    </div>
  )
}
