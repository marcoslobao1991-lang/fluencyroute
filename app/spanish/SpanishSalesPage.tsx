'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import '../vsl2/vsl.css'
import { C, FONT } from '../vsl2/design'
import { Fade, Glass, Label, S, Grad, useInView } from '../vsl2/primitives'

// ═══════════════════════════════════════════════════════════════
// ESSENTIAL SPANISH FLUENCY — SALES PAGE (clone of RotaFluenciaPage, EN copy)
//
// Avatar: English speaker who wants to speak Spanish. Same mechanism as the
// English funnel (Essential Fluency / 500 words / concentrated + spaced
// repetition / series immersion), copy fully in English, series swapped to
// Spanish-language shows.
//
// ⚠️ PLACEHOLDERS a trocar antes de rodar tráfego de verdade:
//   • CHECKOUT — link de checkout do produto espanhol (hoje '#')
//   • PRICE / FROM — preço em USD (hoje espelha o número da VSL de inglês)
//   • O bloco de vídeo (VSL) — hoje é um placeholder; gravar/subir a VSL em espanhol
// Sem tracking de pixel/checkout aqui de propósito (não contaminar o inglês).
// ═══════════════════════════════════════════════════════════════

const BRAND = 'FLUENCY ROUTE'
const COURSE = 'Essential Spanish Fluency'
const PRICE = '$29'          // TODO: definir preço real em USD
const FROM = '$497'          // TODO: âncora de preço
const CHECKOUT = '#'         // TODO: link de checkout do produto espanhol

const PHASES = [
  {
    num: '01',
    title: 'Auditory Perception',
    icon: '👂',
    text: 'In this first phase, you sharpen your ear for Spanish. You’ll understand your first stretches of real speech using the repetition practice materials. The focus here is comprehension — not speaking yet.',
  },
  {
    num: '02',
    title: 'Conversational',
    icon: '💬',
    text: 'Here you develop your ear for real conversation. This is where you start catching linked words and fast, run-together phrases — all in the context of essential conversations, practiced in standard Spanish.',
  },
  {
    num: '03',
    title: 'Shadowing',
    icon: '🎙️',
    text: 'In phase 3 you start training with series and working on your pronunciation. You’ll learn the shadowing technique: imitating the lines already recorded in the material. Just play each line and repeat — the app handles the repetitions.',
  },
  {
    num: '04',
    title: 'Simulated Immersion',
    icon: '🌍',
    text: 'The most fun phase. Your Spanish is no longer basic and you understand almost everything. This is where IMMERSION begins — seeing and reading everything in Spanish. It’s the phase of continuous progress, where you get a little better every day until your Spanish is ESSENTIALLY FLUENT for work, travel, and clear communication.',
  },
]

const SERIES = [
  { name: 'Money Heist', detail: 'All seasons', color: C.red },
  { name: 'Narcos', detail: 'All seasons', color: C.yellow },
  { name: 'Elite', detail: 'All seasons', color: C.purple },
  { name: 'Club de Cuervos', detail: 'All seasons', color: C.blue },
]
const SERIES_LOOP = [...SERIES, ...SERIES, ...SERIES]

const FAQ = [
  {
    q: 'What is Essential Spanish Fluency?',
    a: 'It’s a program focused on learning Spanish in a practical way, using continuous and spaced repetition. The goal is to help you master the fundamentals of Spanish so you can communicate and understand the language without translating it in your head.',
  },
  {
    q: 'Who is it for?',
    a: 'It’s recommended for: beginners who want to learn Spanish from scratch; people who have studied Spanish but still can’t hold a conversation; and people who struggle to understand native speakers and want to improve their listening and speaking.',
  },
  {
    q: 'How does the method work?',
    a: 'It combines three things. Continuous repetition — training with ready-made materials like series clips, talks and audio, repeated until Spanish becomes internalized. Spaced repetition — reviewing the content at strategic intervals. Simulated immersion — exposure to Spanish through series, music and audio to build a continuous learning environment.',
  },
  {
    q: 'Is there support?',
    a: 'Yes. You get a direct WhatsApp channel where you can ask questions and receive personalized guidance to set up and fine-tune your training.',
  },
  {
    q: 'How much time do I need to dedicate?',
    a: 'We recommend at least 30 minutes a day to practice and review the material. Inside the program we teach you how to use spare moments to increase your exposure and accelerate your results.',
  },
  {
    q: 'How long do I have access?',
    a: 'Access is lifetime. You’ll have unlimited access to the content and can study at your own pace.',
  },
  {
    q: 'Do I need prior knowledge of Spanish?',
    a: 'No. The program is designed both for complete beginners and for people who already have a base but need to improve their fluency and confidence.',
  },
  {
    q: 'What materials are included?',
    a: 'Selected scenes from Spanish-language series like Money Heist, Narcos and Elite. Spaced-repetition decks. Audio and text to train listening and speaking. Strategies and guides to build your learning routine.',
  },
  {
    q: 'Can I access it on my phone?',
    a: 'Yes. You can access all the content on your computer, tablet or phone, so you can study wherever and whenever you want.',
  },
  {
    q: 'What is essential fluency?',
    a: 'Essential fluency is the ability to communicate and understand everyday Spanish, even without an advanced vocabulary. The focus is on how functional the language is for you — not on perfection.',
  },
  {
    q: 'Is there a satisfaction guarantee?',
    a: 'Yes. The program includes a 7-day money-back guarantee. If you’re not satisfied with the content, just request a full refund within that window.',
  },
]

export default function SpanishSalesPage() {
  const [sticky, setSticky] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [seriesPaused, setSeriesPaused] = useState(false)

  useEffect(() => {
    const fn = () => setSticky(window.scrollY > 600)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const cardW = 240
  const gap = 14
  const totalW = SERIES.length * (cardW + gap)

  return (
    <div style={{
      background: C.bg, color: C.white,
      fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em',
    }}>

      {/* ═══ HERO — VIDEO (placeholder) ═══ */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 0' }}>
        <Fade delay={0.15}>
          <div style={{ maxWidth: 400, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{
              position: 'relative', paddingTop: '177.78%', background: C.bg2,
            }}>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 24,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 30px ${C.teal}44`,
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#030305"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <p style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: C.t3 }}>
                  Your Spanish VSL goes here
                </p>
              </div>
            </div>
          </div>
          <p style={{
            textAlign: 'center', marginTop: 16, fontSize: 11,
            letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, color: C.t4,
          }}>
            Watch with sound on
          </p>
        </Fade>
      </section>

      {/* ═══ CTA 1 — PRICING ═══ */}
      <S narrow>
        <Fade>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Label center>JOIN THE NEW COHORT</Label>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.t1, marginBottom: 4 }}>
              {COURSE}
            </p>
            <p style={{ fontSize: 12, color: C.teal, marginBottom: 24 }}>
              *Last spots at a special discount
            </p>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="I WANT IN" />
            </div>
          </div>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ METHOD + REPETITION GRAPH ═══ */}
      <S narrow>
        <Fade>
          <div className="glow-teal" style={{ textAlign: 'center' }}>
            <Label center>METHODOLOGY</Label>
            <h2 style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.03em', marginBottom: 16 }}>
              A repetition system built to wire <span style={{ color: C.teal }}>Essential Spanish into your subconscious</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.t2, maxWidth: 500, margin: '0 auto' }}>
              Fluency lives in the subconscious. {COURSE} is built to embed the core of the language into your subconscious through a unique method of continuous and spaced repetition.
            </p>
          </div>
        </Fade>
        <Fade delay={0.15}>
          <Glass accent={C.teal} hud style={{ marginTop: 32 }}>
            <RepetitionGraph />
          </Glass>
        </Fade>
        <Fade delay={0.2}>
          <Glass accent={C.purple} hud style={{ marginTop: 16 }}>
            <p style={{
              textAlign: 'center', fontSize: 14, fontWeight: 700,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
              fontFamily: FONT.mono,
            }}>ESSENTIAL VOCABULARY</p>
            <Suspense fallback={null}><VocabCoverage /></Suspense>
            <p style={{ textAlign: 'center', fontSize: 14, color: C.t2, lineHeight: 1.6, marginTop: 8 }}>
              With just <span style={{ color: C.teal, fontWeight: 700 }}>500 words</span> you cover
              more than <span style={{ color: C.teal, fontWeight: 700 }}>90%</span> of every everyday conversation.
            </p>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ RESULT ═══ */}
      <S narrow>
        <Fade>
          <Glass accent={C.teal} glow hud>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.t1, textAlign: 'center', marginBottom: 16 }}>
              What concentrated training actually gives you...
            </h3>
            <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 20 }} />
            <div style={{ fontSize: 15, lineHeight: 1.9, color: C.t2 }}>
              <p>&#10003; You start understanding native speakers at real, full speed.</p>
              <p>&#10003; Words come out of your mouth automatically, with no translating in your head.</p>
              <p>&#10003; You watch movies and series without subtitles.</p>
              <p>&#10003; Spanish finally flows naturally in your life.</p>
              <p style={{ marginTop: 16, color: C.teal, fontWeight: 600 }}>
                And the best part? You can apply this method TODAY and feel the difference in just a few days.
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Btn text="START NOW" />
            </div>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ PHASES ═══ */}
      <S>
        <Fade>
          <Label center>PHASES OF ESSENTIAL FLUENCY</Label>
        </Fade>
        <div className="rg2" style={{ marginTop: 24 }}>
          {PHASES.map((p, i) => (
            <Fade key={i} delay={i * 0.1}>
              <Glass accent={C.teal} style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.teal}18, ${C.purple}18)`,
                    border: `1px solid ${C.teal}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0,
                  }}>{p.icon}</div>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: 3,
                      fontFamily: FONT.mono, color: C.teal,
                    }}>PHASE {p.num}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: C.t1 }}>{p.title}</h3>
                  </div>
                </div>
                <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 12 }} />
                <p style={{ fontSize: 14, lineHeight: 1.7, color: C.t2 }}>{p.text}</p>
              </Glass>
            </Fade>
          ))}
        </div>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ CTA 2 ═══ */}
      <S narrow>
        <Fade>
          <div style={{ textAlign: 'center' }}>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="I WANT IN" />
            </div>
          </div>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ PRACTICAL CONTENT — SERIES CAROUSEL ═══ */}
      <div className="glow-purple" style={{ overflow: 'hidden' }}>
        <S>
          <Fade>
            <Label center color={C.purple}>PRACTICAL CONTENT</Label>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 600,
              color: C.t2, letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              The shows you love.
            </p>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.035em',
              marginBottom: 8,
            }}>
              <Grad size="inherit">To train your Spanish.</Grad>
            </p>
            <p style={{
              textAlign: 'center', fontSize: 15, color: C.t2,
              lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px',
            }}>
              Money Heist, Narcos, Elite — every scene comes with ready-made repetition material to train your ear and your speech.
            </p>
          </Fade>

          <Fade delay={0.1}>
            <div style={{ overflow: 'hidden', position: 'relative' }}
              onPointerDown={() => setSeriesPaused(true)}
              onPointerUp={() => setSeriesPaused(false)}
              onPointerLeave={() => setSeriesPaused(false)}
              onTouchStart={() => setSeriesPaused(true)}
              onTouchEnd={() => setSeriesPaused(false)}
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
                animation: `seriesScroll ${SERIES.length * 5}s linear infinite`,
                animationPlayState: seriesPaused ? 'paused' : 'running',
              }}>
                {SERIES_LOOP.map((s, i) => (
                  <div key={i} style={{
                    width: cardW, flexShrink: 0,
                    borderRadius: 4, overflow: 'hidden',
                    border: `1px solid ${s.color}20`, background: C.bg3,
                    position: 'relative',
                  }} className="hud">
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        width: '100%', aspectRatio: '16/10', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: `linear-gradient(135deg, ${s.color}30, ${C.bg2})`,
                      }}>
                        <span style={{
                          fontFamily: FONT.mono, fontSize: 18, fontWeight: 800,
                          color: s.color, letterSpacing: 1, textAlign: 'center', padding: '0 12px',
                        }}>{s.name}</span>
                      </div>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(160deg, ${s.color}40, transparent 70%)`,
                        mixBlendMode: 'screen',
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(to top, ${C.bg3} 0%, transparent 50%)`,
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
                        backgroundImage: `repeating-linear-gradient(0deg, ${s.color} 0, ${s.color} 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, ${s.color} 0, ${s.color} 1px, transparent 1px, transparent 30px)`,
                      }} />
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: C.t3, fontFamily: FONT.mono }}>{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <style>{`
                @keyframes seriesScroll {
                  0% { transform: translateX(0) }
                  100% { transform: translateX(-${totalW}px) }
                }
              `}</style>
            </div>
          </Fade>

          <Fade delay={0.2}>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Btn text="START NOW" />
            </div>
          </Fade>
        </S>
      </div>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ VALUE + COMPARISON GRAPH ═══ */}
      <S>
        <Fade>
          <div className="rg2">
            {/* Traditional */}
            <Glass accent={C.red}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.t1, textAlign: 'center', marginBottom: 14 }}>
                What is it really worth to speak Spanish?
              </h3>
              <div style={{ height: 1, background: C.teal, opacity: 0.3, marginBottom: 14 }} />
              <div style={{ fontSize: 14, lineHeight: 1.9, color: C.t2 }}>
                <p style={{ marginBottom: 12 }}>If you tried to learn Spanish the traditional way, how much time and money would it cost?</p>
                <p style={{ color: C.t1 }}>Traditional Spanish course</p>
                <p>&#10060; Duration: 5 years</p>
                <p>&#10060; Average cost: $8,000</p>
                <p style={{ marginBottom: 12 }}>&#10060; Outdated method that teaches rules but never gets you speaking</p>
                <p style={{ color: C.t1 }}>Immersion trip to Spain or Mexico</p>
                <p>&#10060; Duration: 3 months</p>
                <p>&#10060; Average cost: $12,000</p>
                <p>&#10060; No guarantee you’ll actually master Spanish</p>
              </div>
            </Glass>

            {/* With Fluency Route */}
            <Glass accent={C.teal} glow>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.teal, textAlign: 'center', marginBottom: 14 }}>
                With Fluency Route:
              </h3>
              <div style={{ fontSize: 14, lineHeight: 2, color: C.t2 }}>
                <p>&#10003; Accelerated Fluency Training</p>
                <p>&#10003; Access to Concentrated Training</p>
                <p>&#10003; 90-day Intensive Plan to unlock your speaking</p>
                <p>&#10003; Personalized Feedback ($497) — <span style={{ color: C.teal, fontWeight: 700 }}>FREE</span></p>
                <p>&#10003; One-on-one WhatsApp Support ($397) — <span style={{ color: C.teal, fontWeight: 700 }}>FREE</span></p>
                <p style={{ marginTop: 12, color: C.t1, fontWeight: 700 }}>Total: Over $2,000</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.teal, marginTop: 4 }}>Today for just {PRICE}/mo</p>
              </div>
            </Glass>
          </div>
        </Fade>

        <Fade delay={0.15}>
          <Glass accent={C.teal} hud style={{ marginTop: 24 }}>
            <UsageComparison />
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ GUARANTEE ═══ */}
      <S narrow>
        <Fade>
          <Glass accent={C.yellow} glow hud>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img src="/shield-guarantee.png" alt="Guarantee" width={80} height={80} style={{ margin: '0 auto', display: 'block' }} />
            </div>
            <Label center color={C.yellow}>7-DAY GUARANTEE</Label>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.t1, textAlign: 'center', marginBottom: 20, lineHeight: 1.4 }}>
              Zero risk for you.
            </h3>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.t2 }}>
              <p style={{ marginBottom: 16 }}>
                Try the program for 7 days with no commitment. If at any point you feel it’s not for you, just send us an email and we’ll refund 100% of your money. No questions, no hassle.
              </p>
              <p style={{ color: C.yellow, fontWeight: 700, textAlign: 'center', fontSize: 15 }}>
                The only way to lose is by not enrolling now.
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Btn text="SECURE MY SPOT" />
            </div>
          </Glass>
        </Fade>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ FAQ ═══ */}
      <S narrow>
        <Fade>
          <Label center>FREQUENTLY ASKED QUESTIONS</Label>
        </Fade>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((item, i) => (
            <Fade key={i} delay={i * 0.04}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  background: C.bg3,
                  border: `1px solid ${openFaq === i ? C.teal + '44' : C.border}`,
                  borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color .3s',
                }}
              >
                <div style={{
                  padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, lineHeight: 1.4 }}>
                    {i + 1}. {item.q}
                  </p>
                  <span style={{
                    fontSize: 18, color: C.teal, fontWeight: 300, flexShrink: 0,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform .3s',
                  }}>+</span>
                </div>
                <div style={{
                  maxHeight: openFaq === i ? 400 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .4s cubic-bezier(.16,1,.3,1)',
                }}>
                  <p style={{
                    padding: '0 20px 16px',
                    fontSize: 14, lineHeight: 1.7, color: C.t2,
                  }}>{item.a}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </S>

      <div className="sep" style={{ margin: '0 auto' }} />

      {/* ═══ FINAL CTA ═══ */}
      <S narrow>
        <Fade>
          <div className="glow-teal" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: C.t1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Start your journey to <span style={{ color: C.teal }}>essential fluency</span> today
            </h2>
            <PriceBlock />
            <div style={{ marginTop: 24 }}>
              <Btn text="I WANT IN" />
            </div>
          </div>
        </Fade>
      </S>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ textAlign: 'center', padding: '48px 24px 36px', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: C.t3 }}>fluency</span><span style={{ color: C.teal }}>route</span>
        </p>
        <p style={{ fontSize: 10, color: C.t4, marginTop: 8 }}>{BRAND} · All rights reserved</p>
      </footer>

      {/* ═══ STICKY CTA ═══ */}
      <div className={`sticky-cta ${sticky ? 'show' : ''}`}>
        <Btn compact text={`START FOR ${PRICE}/MO`} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CTA BUTTON — points to checkout (placeholder). No pixel tracking.
// ═══════════════════════════════════════════════════════════════
function Btn({ text = 'I WANT IN', compact }: { text?: string; compact?: boolean }) {
  return (
    <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" className="cta-btn"
      style={compact ? { padding: '14px 20px', fontSize: 15 } : undefined}
    >
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {text}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRICE BLOCK
// ═══════════════════════════════════════════════════════════════
function PriceBlock() {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 999,
        background: 'linear-gradient(135deg,#ff3d6e,#ff8a3d)',
        color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.3px',
        textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(255,61,110,.35)',
        marginBottom: 10,
      }}>🔥 Last spots at a discount</span>
      <p style={{ fontSize: 16, color: C.t2 }}>
        From <span style={{ textDecoration: 'line-through', color: C.red }}>{FROM}</span>
      </p>
      <p style={{ fontSize: 14, color: C.t2, marginTop: 6 }}>Today for just:</p>
      <p style={{
        fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: 900,
        fontFamily: FONT.mono, letterSpacing: '-0.04em',
        background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        lineHeight: 1.1, marginTop: 4,
      }}>
        {PRICE}<span style={{ fontSize: '0.45em', fontWeight: 700 }}>/mo</span>
      </p>
      <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>or pay over time</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// REPETITION GRAPH — ONE LESSON 1x vs CONCENTRATED TRAINING 30-40x
// ═══════════════════════════════════════════════════════════════
function RepetitionGraph() {
  const { ref, v } = useInView(0.15)

  return (
    <div ref={ref} style={{ position: 'relative', padding: '24px 0' }}>
      <svg viewBox="0 0 500 360" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="rg-teal-es" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-purple-es" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.purple} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="rg-red-es" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.6" />
          </linearGradient>
          <filter id="rg-glow-es">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="50" y1={50 + i * 55} x2="450" y2={50 + i * 55}
            stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        ))}

        <rect
          x="90" y={v ? 205 : 215} width="110" height={v ? 10 : 0}
          rx="5" fill="url(#rg-red-es)"
          style={{ transition: 'all 1.2s cubic-bezier(.16,1,.3,1) 0.3s' }}
        />
        <text x="145" y="250" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 32, fontWeight: 800, opacity: v ? 0.7 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
          1x
        </text>
        <text x="145" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1s' }}>
          ONE LESSON
        </text>

        <rect
          x="270" y={v ? 50 : 215} width="140" height={v ? 165 : 0}
          rx="5" fill="url(#rg-purple-es)" filter="url(#rg-glow-es)"
          style={{ transition: 'all 1.8s cubic-bezier(.16,1,.3,1) 0.6s' }}
        />
        <text x="340" y="250" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 38, fontWeight: 800, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s' }}>
          30-40x
        </text>
        <text x="340" y="278" textAnchor="middle" fill={C.t2}
          style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, letterSpacing: '2px', opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.7s' }}>
          CONCENTRATED TRAINING
        </text>

        {v && [
          { cx: 295, delay: '0.8s', dur: '3.5s' },
          { cx: 315, delay: '1.2s', dur: '4s' },
          { cx: 340, delay: '1.5s', dur: '3.8s' },
          { cx: 360, delay: '1.8s', dur: '4.2s' },
          { cx: 325, delay: '2.2s', dur: '3.6s' },
          { cx: 380, delay: '2.5s', dur: '4.5s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy="50" r="3"
            fill={i % 2 === 0 ? C.teal : C.purple}
            opacity="0"
            style={{ animation: `dopFloatEs ${p.dur} ease-in-out ${p.delay} infinite` }}
          />
        ))}

        <text x="340" y="35" textAnchor="middle" style={{ fontSize: 30 }}>🧠</text>

        <text x="145" y="320" textAnchor="middle" fill={C.red}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.6 : 0, transition: 'opacity 0.8s ease 2s' }}>
          NOT ENOUGH
        </text>
        <text x="340" y="320" textAnchor="middle" fill={C.teal}
          style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, letterSpacing: '2px', opacity: v ? 0.9 : 0, transition: 'opacity 0.8s ease 2s' }}>
          AUTOMATIC
        </text>
      </svg>

      <style>{`
        @keyframes dopFloatEs {
          0% { opacity: 0; transform: translateY(0) }
          15% { opacity: .7 }
          50% { opacity: .4; transform: translateY(-40px) }
          85% { opacity: .6; transform: translateY(-60px) }
          100% { opacity: 0; transform: translateY(-80px) }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VOCAB COVERAGE — 500 words = 90% of conversations (EN)
// ═══════════════════════════════════════════════════════════════
function VocabCoverage() {
  const { ref, v } = useInView(0.2)

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const target = 0.91
  const offset = circumference * (1 - (v ? target : 0))

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg viewBox="0 0 200 200" style={{ width: 220, height: 220, transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="vc-grad-es" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.teal} />
              <stop offset="100%" stopColor={C.purple} />
            </linearGradient>
            <filter id="vc-glow-es">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r={radius}
            fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
          <circle cx="100" cy="100" r={radius}
            fill="none" stroke="url(#vc-grad-es)" strokeWidth="16"
            strokeLinecap="round" filter="url(#vc-glow-es)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.3s' }} />
        </svg>

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: FONT.mono, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 900,
            background: C.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.5s',
          }}>90%</span>
          <span style={{
            fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase',
            color: C.t3, opacity: v ? 1 : 0, transition: 'opacity 0.6s ease 1.8s',
          }}>of conversations</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginTop: 20,
        opacity: v ? 1 : 0, transition: 'opacity 0.8s ease 2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, boxShadow: `0 0 8px ${C.teal}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.t2, letterSpacing: 1 }}>500 WORDS</span>
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.t4, letterSpacing: 1 }}>REMAINING</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// USAGE COMPARISON — Traditional course (quit) vs Fluency Route (daily habit)
// ═══════════════════════════════════════════════════════════════
function UsageComparison() {
  const { ref, v } = useInView(0.15)

  const W = 480, H = 320
  const padL = 16, padR = 16, padT = 50, padB = 80

  const tradPeak = padT + 80
  const tradPath = `M ${padL + 30} ${H - padB}
    C ${padL + 60} ${H - padB} ${padL + 80} ${tradPeak} ${padL + 140} ${tradPeak}
    C ${padL + 180} ${tradPeak} ${padL + 195} ${tradPeak + 10} ${padL + 210} ${H - padB}`
  const tradArea = tradPath + ` L ${padL + 30} ${H - padB} Z`

  const icY = H - padB - 80
  const icPath = `M ${padL + 30} ${H - padB}
    C ${padL + 50} ${H - padB} ${padL + 70} ${icY} ${padL + 100} ${icY}
    L ${W - padR - 30} ${icY}`
  const icArea = icPath + ` L ${W - padR - 30} ${H - padB} L ${padL + 30} ${H - padB} Z`

  return (
    <div ref={ref} className="graph-container" style={{ padding: '8px 0' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="ucr-red-es" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ucr-teal-es" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        <path d={tradArea} fill="url(#ucr-red-es)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.3s' }} />
        <path d={tradPath} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.7 : 0} strokeDasharray="500" strokeDashoffset={v ? 0 : 500}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.16,1,.3,1) 0.3s, opacity 0.8s ease 0.3s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 1.5s' }}>
          <line x1={padL + 210} y1={padT} x2={padL + 210} y2={H - padB} stroke={C.red} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <text x={padL + 210} y={padT - 8} textAnchor="middle" fill={C.red}
            style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 800, letterSpacing: '2px' }}>QUIT</text>
        </g>

        <path d={icArea} fill="url(#ucr-teal-es)" opacity={v ? 1 : 0} style={{ transition: 'opacity 1.2s ease 0.8s' }} />
        <path d={icPath} fill="none" stroke={C.teal} strokeWidth="3" strokeLinecap="round"
          opacity={v ? 0.9 : 0} strokeDasharray="600" strokeDashoffset={v ? 0 : 600}
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(.16,1,.3,1) 0.8s, opacity 0.8s ease 0.8s' }} />

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.6s ease 2s' }}>
          <text x={W - padR - 30} y={icY - 14} textAnchor="end" fill={C.teal}
            style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, letterSpacing: '2px' }}>DAILY HABIT</text>
        </g>

        <g opacity={v ? 1 : 0} style={{ transition: 'opacity 0.8s ease 2.5s' }}>
          <circle cx={W * 0.2} cy={H - 30} r="5" fill={C.red} opacity="0.6" />
          <text x={W * 0.2 + 14} y={H - 25} fill={C.t2}
            style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '1px' }}>TRADITIONAL COURSE</text>

          <circle cx={W * 0.66} cy={H - 30} r="5" fill={C.teal} opacity="0.9" />
          <text x={W * 0.66 + 14} y={H - 25} fill={C.t1}
            style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '1px' }}>FLUENCY ROUTE</text>
        </g>

        <text x={W / 2} y={H - 50} textAnchor="middle" fill={C.t3}
          style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '3px' }}>TIME →</text>
      </svg>
    </div>
  )
}
