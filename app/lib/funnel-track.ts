// funnel-track.ts — Logger interno (mesma tabela funnel_events do Português).
// Espelha o /track.js do portugues.concursocantado.com.br mas pra contextos Next/React.
// Honra opt-out via ?fr_no_track=1 e localStorage 'fr_no_track'.
// Sanitiza Vturb IDs (v3_xxx) que não devem ser tratados como variantes.

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co/rest/v1/funnel_events'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldHJ0ZXdpc21ocHppZGNtbXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDg3NDYsImV4cCI6MjA4OTM4NDc0Nn0.CTGC11dPKawf3tFWrEu9jXgxn2oPmPMXQS9bFcN4o10'
const BAD_VARIANT = /^v3_[a-f0-9-]{20,}/i

function readQp(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  try { return new URLSearchParams(window.location.search) } catch { return new URLSearchParams() }
}

function uuid(): string {
  try { if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID() } catch {}
  return 'x' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

function isSilenced(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const qp = readQp()
    const flag = qp.get('fr_no_track')
    if (flag === '1') localStorage.setItem('fr_no_track', '1')
    else if (flag === '0') localStorage.removeItem('fr_no_track')
    return localStorage.getItem('fr_no_track') === '1'
  } catch { return false }
}

function cleanVariant(s: string | null | undefined): string | null {
  if (!s) return null
  return BAD_VARIANT.test(s) ? null : s
}

function getSid(): string {
  if (typeof window === 'undefined') return uuid()
  try {
    const k = 'fr_sid'
    const qp = readQp()
    const fromUrl = qp.get('fr_sid')
    if (fromUrl) { localStorage.setItem(k, fromUrl); return fromUrl }
    let v = localStorage.getItem(k)
    if (!v) { v = uuid(); localStorage.setItem(k, v) }
    return v
  } catch { return uuid() }
}

function getVariant(explicit?: string | null): string | null {
  if (typeof window === 'undefined') return null
  const qp = readQp()
  try {
    const fromArg = cleanVariant(explicit ?? null)
    if (fromArg) { localStorage.setItem('fr_v', fromArg); return fromArg }
    const fromUrl = cleanVariant(qp.get('fr_v'))
    if (fromUrl) { localStorage.setItem('fr_v', fromUrl); return fromUrl }
    const fromLs = cleanVariant(localStorage.getItem('fr_v'))
    if (!fromLs && localStorage.getItem('fr_v')) {
      try { localStorage.removeItem('fr_v') } catch {}
    }
    return fromLs
  } catch { return null }
}

type Extra = Record<string, unknown>

export interface FunnelContext {
  funnel: string  // 'ingles' | 'portugues' | etc
  page: string    // 'bridge' | 'vsl' | 'obrigado'
  variant?: string | null
}

/** Dispara um evento pro funnel_events. Silenciado se opt-out ativo. No-op no SSR. */
export function trackFunnelEvent(ctx: FunnelContext, event: string, detail?: string | null, extra?: Extra) {
  if (typeof window === 'undefined') return
  if (isSilenced()) return

  const qp = readQp()
  const variant = getVariant(ctx.variant)
  const sid = getSid()

  const row: Record<string, unknown> = {
    funnel: ctx.funnel,
    page: ctx.page,
    event,
    variant,
    detail: detail == null ? null : String(detail).slice(0, 200),
    session_id: sid,
    utm_source: qp.get('utm_source'),
    utm_medium: qp.get('utm_medium'),
    utm_campaign: qp.get('utm_campaign'),
    utm_content: qp.get('utm_content'),
    utm_term: qp.get('utm_term'),
    fbclid: qp.get('fbclid'),
    referrer: document.referrer || null,
    path: (location.pathname + location.search).slice(0, 500),
    user_agent: (navigator.userAgent || '').slice(0, 500),
    ...(extra || {}),
  }

  try {
    const blob = new Blob([JSON.stringify(row)], { type: 'application/json' })
    // sendBeacon não suporta custom headers — fallback pra fetch sempre.
    fetch(SUPA_URL, {
      method: 'POST',
      keepalive: true,
      headers: {
        'apikey': ANON,
        'Authorization': 'Bearer ' + ANON,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    }).catch(() => {})
  } catch {}
}

/** Helper pra montar uma função vinculada a um ctx fixo (ex: a bridge Inglês). */
export function createTracker(ctx: FunnelContext) {
  return (event: string, detail?: string | null, extra?: Extra) => trackFunnelEvent(ctx, event, detail, extra)
}
