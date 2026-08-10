'use client'

import { useEffect } from 'react'
import { createTracker } from '../../lib/funnel-track'

const frTrack = createTracker({ funnel: 'ingles-latam', page: 'gracias', variant: 'A' })

// ═══════════════════════════════════════════════════════════════
// /gracias — thank-you LATAM
// IMPORTANTE: Purchase é disparado 100% server-side via webhook
// Hotmart (/api/hotmart-webhook). Aqui só roda PageView (pixel BR do layout; o LATAM não precisa de PV aqui). NÃO disparar fbq Purchase aqui.
// ═══════════════════════════════════════════════════════════════

export default function GraciasPage() {
  useEffect(() => {
    try { frTrack('pageview') } catch {}
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <main style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(15,118,110,.15)', border: '2px solid #0F766E',
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, color: '#0F766E', marginBottom: 16 }}>
          Compra confirmada
        </p>

        <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>
          ¡Bienvenido a la Ruta!
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', marginBottom: 28 }}>
          Tu acceso fue procesado. En los próximos minutos vas a recibir un correo con tus credenciales y el primer paso del programa.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '20px 24px',
          textAlign: 'left',
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.6,
        }}>
          <p style={{ fontWeight: 700, color: '#fff', marginBottom: 8 }}>Siguiente paso:</p>
          <p>Revisa tu bandeja de entrada (incluyendo spam). El correo trae el enlace de acceso y la primera clase para empezar hoy mismo.</p>
        </div>

        <p style={{ marginTop: 48, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Marcos Lobão · Fluency Route
        </p>
      </main>
    </div>
  )
}
