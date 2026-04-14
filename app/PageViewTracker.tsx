'use client'

import { useEffect } from 'react'

// Dispatches a single PageView to both the browser Pixel AND the server-side
// CAPI endpoint with a shared eventID so Meta dedupes them into one event
// with the union of their user_data. Fires once per mount.
export default function PageViewTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Build a unique event id for this page view
    const eid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

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

      const payload = JSON.stringify({ event: 'PageView', eventId: eid, fbc, fbp })
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
