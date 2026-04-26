// ═══════════════════════════════════════════════════════════════
// Meta Pixel + Advanced Matching + Deduplication
// ═══════════════════════════════════════════════════════════════

const PIXEL_ID = '938768337634102'

declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

/** Generate unique event ID for deduplication between browser + server */
export function genEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** Get fbclid-based cookies for CAPI matching — builds fbc from fbclid if cookie not set */
export function getFbCookies(): { fbc?: string; fbp?: string } {
  if (typeof document === 'undefined') return {}
  const cookies = document.cookie.split('; ')
  let fbc = cookies.find(c => c.startsWith('_fbc='))?.split('=')[1]
  const fbp = cookies.find(c => c.startsWith('_fbp='))?.split('=')[1]
  if (!fbc) {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid')
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`
  }
  return { fbc, fbp }
}

/** Get client IP via external API */
export let cachedIp: string | null = null
export async function getClientIp(): Promise<string | null> {
  if (cachedIp) return cachedIp
  try {
    const r = await fetch('https://api.ipify.org?format=json')
    const d = await r.json()
    cachedIp = d.ip
    return cachedIp
  } catch { return null }
}

/** Get user agent */
export function getUserAgent(): string {
  return typeof navigator !== 'undefined' ? navigator.userAgent : ''
}

/** Track standard event with event_id for dedup */
function trackEvent(event: string, params?: Record<string, any>, eventId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params, { eventID: eventId })
  }
}

/** Track with advanced matching (user data) + event_id */
function trackEventWithUser(
  event: string,
  userData: { email?: string; phone?: string; cpf?: string; name?: string },
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === 'undefined' || !window.fbq) return

  const em = userData.email?.toLowerCase().trim()
  const ph = userData.phone?.replace(/\D/g, '')
  const fn = userData.name?.split(' ')[0]?.toLowerCase()
  const ln = userData.name?.split(' ').slice(1).join(' ')?.toLowerCase()

  window.fbq('init', PIXEL_ID, {
    em,
    ph: ph ? `55${ph}` : undefined,
    fn,
    ln,
    country: 'br',
    external_id: userData.cpf?.replace(/\D/g, ''),
  })

  window.fbq('track', event, params, { eventID: eventId })
}

// ── Convenience functions ──

export function trackViewContent(contentName?: string) {
  trackEvent('ViewContent', {
    content_name: contentName || 'VSL',
    content_category: 'sales',
  })
}

export function trackInitiateCheckout(eventId?: string) {
  trackEvent('InitiateCheckout', {
    content_name: 'Rota da Fluência Essencial',
    currency: 'BRL',
    value: 289.00,
  }, eventId)
}

export function trackAddPaymentInfo(method: 'card' | 'pix', eventId?: string) {
  trackEvent('AddPaymentInfo', {
    content_name: 'Rota da Fluência Essencial',
    currency: 'BRL',
    value: 289.00,
    payment_method: method,
  }, eventId)
}

export function trackPurchase(
  userData: { email?: string; phone?: string; cpf?: string; name?: string },
  orderId?: string,
  eventId?: string
) {
  trackEventWithUser('Purchase', userData, {
    content_name: 'Rota da Fluência Essencial',
    currency: 'BRL',
    value: 289.00,
    order_id: orderId,
  }, eventId)
}

export function trackLead(userData?: { email?: string }) {
  if (userData?.email) {
    trackEventWithUser('Lead', userData)
  } else {
    trackEvent('Lead')
  }
}
