'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import './vsl.css'
import { C, FONT } from './design'
import { Btn } from './primitives'

// ═══════════════════════════════════════════════════════════════
// LAZY-LOAD SECTIONS (user watches 20min video first)
// ═══════════════════════════════════════════════════════════════
const HeroAnchor = dynamic(() => import('./sections/HeroAnchor').then(m => ({ default: m.HeroAnchor })), { ssr: false })
const SciencePunch = dynamic(() => import('./sections/SciencePunch').then(m => ({ default: m.SciencePunch })), { ssr: false })
const ModulesSection = dynamic(() => import('./sections/ModulesSection').then(m => ({ default: m.ModulesSection })), { ssr: false })
const SeriesCantadas = dynamic(() => import('./sections/SeriesCantadas').then(m => ({ default: m.SeriesCantadas })), { ssr: false })
const AppShowcase = dynamic(() => import('./sections/AppShowcase').then(m => ({ default: m.AppShowcase })), { ssr: false })
const TechCenter = dynamic(() => import('./sections/TechCenter').then(m => ({ default: m.TechCenter })), { ssr: false })
const SkillScanSection = dynamic(() => import('./sections/SkillScanSection').then(m => ({ default: m.SkillScanSection })), { ssr: false })
const FeaturesSection = dynamic(() => import('./sections/FeaturesSection').then(m => ({ default: m.FeaturesSection })), { ssr: false })
const SocialProof = dynamic(() => import('./sections/SocialProof').then(m => ({ default: m.SocialProof })), { ssr: false })
const OfferDirect = dynamic(() => import('./sections/OfferClose').then(m => ({ default: m.OfferDirect })), { ssr: false })
const OfferPrice = dynamic(() => import('./sections/OfferClose').then(m => ({ default: m.OfferPrice })), { ssr: false })
const GuaranteeClose = dynamic(() => import('./sections/OfferClose').then(m => ({ default: m.GuaranteeClose })), { ssr: false })

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
export default function VSLPage() {
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    // Vturb SDK script
    if (!document.querySelector('script[src*="smartplayer-wc"]')) {
      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js'
      s.async = true
      document.head.appendChild(s)
    }

    // Load iframe src
    const ifr = document.getElementById('ifr_69d11e69d48f2697296489fb') as HTMLIFrameElement
    if (ifr && ifr.src === 'about:blank') {
      ifr.src = 'https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/69d11e69d48f2697296489fb/v4/embed.html' + (location.search || '?') + '&vl=' + encodeURIComponent(location.href)
    }

    // Reveal .esconder after delay
    const delaySeconds = 1160 // 19:20 — reveal after pitch
    const alreadyRevealed = localStorage.getItem('vsl_revealed') === '1'
    if (alreadyRevealed) {
      document.querySelectorAll('.esconder').forEach(el => el.classList.remove('esconder'))
    } else {
      const revealTimer = setTimeout(() => {
        document.querySelectorAll('.esconder').forEach(el => el.classList.remove('esconder'))
        localStorage.setItem('vsl_revealed', '1')
      }, delaySeconds * 1000)
    }

    // Sticky CTA on scroll
    const fn = () => setSticky(window.scrollY > 900)
    window.addEventListener('scroll', fn)
    return () => { window.removeEventListener('scroll', fn) }
  }, [])

  return (
    <div suppressHydrationWarning style={{
      background: C.bg, color: C.white,
      fontFamily: FONT.body, fontWeight: 300, minHeight: '100vh', letterSpacing: '-0.01em',
    }}>
      {/* overlays disabled for testing */}

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(3,3,5,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${C.border}`, padding: '14px 24px',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="IC" width={20} height={20} style={{ borderRadius: 4 }} priority />
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: C.white }}>inglês</span><span style={{ color: C.teal }}>cantado</span>
          </span>
        </div>
      </header>

      {/* ═══ VTURB PLAYER (iframe — stable, no React re-render issues) ═══ */}
      <div style={{ paddingTop: 80, paddingBottom: 48, maxWidth: 400, margin: '0 auto', padding: '80px 20px 48px' }}>
        <div id="ifr_69d11e69d48f2697296489fb_wrapper" style={{ margin: '0 auto', width: '100%' }}>
          <div style={{ position: 'relative', paddingTop: '177.78%' }} id="ifr_69d11e69d48f2697296489fb_aspect">
            <iframe
              frameBorder="0"
              allowFullScreen
              src="about:blank"
              id="ifr_69d11e69d48f2697296489fb"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              referrerPolicy="origin"
            />
          </div>
        </div>
        <p style={{
          textAlign: 'center', marginTop: 20, fontSize: 12,
          letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
          color: C.t4, opacity: 0.6,
        }}>
          Assista com som ativado 🔊
        </p>
      </div>

      {/* ═══ CONTENT — HIDDEN UNTIL VTURB REVEALS ═══ */}
      <div className="esconder">
        {/* ── PRICING DIRETO (lead acabou de ouvir o pitch) ── */}
        <OfferDirect />
        <div className="sep" style={{ margin: '0 auto' }} />
        <HeroAnchor />
        <div className="sep" style={{ margin: '0 auto' }} />
        <SciencePunch />
        <div className="sep" style={{ margin: '0 auto' }} />
        <ModulesSection />
        <div className="sep" style={{ margin: '0 auto' }} />
        <SeriesCantadas />
        <div className="sep" style={{ margin: '0 auto' }} />
        <FeaturesSection />
        <div className="sep" style={{ margin: '0 auto' }} />
        <SocialProof />
        <div className="sep" style={{ margin: '0 auto' }} />
        <OfferPrice />
        <div className="sep" style={{ margin: '0 auto' }} />
        <TechCenter />
        <SkillScanSection />
        <div className="sep" style={{ margin: '0 auto' }} />
        <GuaranteeClose />

        {/* ─── FOOTER ─── */}
        <footer style={{ textAlign: 'center', padding: '48px 24px 36px', borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: C.t3 }}>inglês</span><span style={{ color: C.teal }}>cantado</span>
          </p>
          <p style={{ fontSize: 10, color: C.t4, marginTop: 8 }}>Fluency Route · Todos os direitos reservados</p>
        </footer>
      </div>

      {/* ─── STICKY CTA ─── */}
      <div className={`esconder sticky-cta ${sticky ? 'show' : ''}`}>
        <Btn compact text="COMEÇAR POR R$99/MÊS" />
      </div>
    </div>
  )
}
