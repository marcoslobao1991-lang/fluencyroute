'use client'

import { useEffect } from 'react'

// Dispatches a single PageView to both the browser Pixel AND the server-side
// CAPI endpoint with a shared eventID so Meta dedupes them into one event
// with the union of their user_data. Fires once per mount.
//
// Também gera/lê external_id anônimo (cookie _fluency_uid, 2 anos,
// domain=.fluencyroute.com.br) pra alimentar user_data.external_id desde o
// primeiro pageview. Meta usa isso pra correlacionar anônimo → lead → comprador.
export default function PageViewTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Build a unique event id for this page view
    const eid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

    // External ID anônimo persistente (2 anos, cross-subdomain)
    let extId = ''
    try {
      const m = document.cookie.match(/(?:^|;\s*)_fluency_uid=([^;]+)/)
      extId = m ? decodeURIComponent(m[1]) : ''
      if (!extId) {
        extId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`
        document.cookie = `_fluency_uid=${encodeURIComponent(extId)}; path=/; domain=.fluencyroute.com.br; max-age=${60 * 60 * 24 * 365 * 2}; SameSite=Lax`
      }
    } catch {}

    // Browser Pixel
    const fbq = (window as any).fbq
    if (typeof fbq === 'function') {
      fbq('track', 'PageView', {}, { eventID: eid })
    }

    // Server-side CAPI — pulls the fbc/fbp cookies already written by the Pixel
    // script (init runs first in layout.tsx) so the server event carries them.
    try {
      const cookies = document.cookie.split('; ')
      const fbc = cookies.find(c => c.startsWith('_fbc='))?.split('=')[1]
      const fbp = cookies.find(c => c.startsWith('_fbp='))?.split('=')[1]

      const payload = JSON.stringify({
        event: 'PageView',
        eventId: eid,
        fbc,
        fbp,
        external_id: extId,
      })
      try {
        const blob = new Blob([payload], { type: 'application/json' })
        const ok = navigator.sendBeacon?.('/api/track', blob)
        if (!ok) throw new Error('no beacon')
      } catch {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {}
  }, [])

  return null
}
