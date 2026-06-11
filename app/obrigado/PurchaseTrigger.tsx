'use client'

import { useEffect } from 'react'

// Google Ads Enhanced Conversions for Web.
// - Meta Purchase: 100% server-side via /api/kiwify-webhook (NÃO disparado aqui).
// - Google Ads: gtag browser-side com user_data (email SHA-256) + value/currency.
//   Recupera 10-15% das conversions perdidas por adblocker / Safari ITP / cross-device.
//
// Fluxo:
//   1. Lê order_id do query string (Kiwify redirect).
//   2. POLLA /api/order-info até receber email do comprador (webhook pode atrasar 2-30s).
//   3. Hasheia email com Web Crypto SHA-256.
//   4. gtag('set','user_data',{email_hash}) ANTES de gtag('event','conversion').
//   5. Conversion event inclui value (R$) + currency.
//
// Pré-requisito painel: Google Ads → Conversões → Compra → "Conversões Aprimoradas" LIGADO.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const CONVERSION_SEND_TO = 'AW-16694165189/0RG8CLaZpvkaEMX9spg-'
const DEFAULT_VALUE = 289 // Fluency Route preço padrão (BRL)

async function sha256Hex(value: string): Promise<string> {
  const norm = value.trim().toLowerCase()
  const buf = new TextEncoder().encode(norm)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function pollOrderInfo(orderId: string, maxMs = 10000, intervalMs = 400): Promise<{ email: string | null; value: number | null }> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const r = await fetch(`/api/order-info?order_id=${encodeURIComponent(orderId)}`, { cache: 'no-store' })
      if (r.ok) {
        const j = (await r.json()) as { found?: boolean; email?: string | null; value?: number | null }
        if (j.found && j.email) {
          return { email: j.email, value: j.value ?? null }
        }
      }
    } catch {}
    await new Promise((res) => setTimeout(res, intervalMs))
  }
  return { email: null, value: null }
}

export default function PurchaseTrigger() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('order_id') || params.get('transaction_id') || params.get('id') || ''
    const emailFromUrl = (params.get('email') || params.get('customer_email') || '').trim().toLowerCase()

    let fired = false
    let cancelled = false

    const fireWithUserData = async (email: string | null, value: number) => {
      if (fired) return
      if (typeof window.gtag !== 'function') return
      fired = true
      try {
        if (email) {
          const emailHash = await sha256Hex(email)
          window.gtag('set', 'user_data', {
            sha256_email_address: emailHash,
          })
        }
      } catch {}
      window.gtag('event', 'conversion', {
        send_to: CONVERSION_SEND_TO,
        transaction_id: orderId,
        value,
        currency: 'BRL',
      })
    }

    const fireBasic = () => {
      if (fired) return
      if (typeof window.gtag !== 'function') return
      fired = true
      window.gtag('event', 'conversion', {
        send_to: CONVERSION_SEND_TO,
        transaction_id: orderId,
        value: DEFAULT_VALUE,
        currency: 'BRL',
      })
    }

    const waitForGtag = (cb: () => void) => {
      if (typeof window.gtag === 'function') return cb()
      const start = Date.now()
      const itv = setInterval(() => {
        if (cancelled) return clearInterval(itv)
        if (typeof window.gtag === 'function') { clearInterval(itv); cb() }
        else if (Date.now() - start > 10000) clearInterval(itv)
      }, 200)
    }

    // Fast path: email no querystring (Kiwify interpolou)
    if (emailFromUrl) {
      waitForGtag(() => fireWithUserData(emailFromUrl, DEFAULT_VALUE))
      return () => { cancelled = true }
    }

    // Slow path: polla server até webhook materializar a row em orders
    if (orderId) {
      pollOrderInfo(orderId).then(({ email, value }) => {
        if (cancelled) return
        const v = value && value > 0 ? value : DEFAULT_VALUE
        waitForGtag(() => fireWithUserData(email, v))
      })
      return () => { cancelled = true }
    }

    // Sem order_id na URL — dispara conversion básico (sem user_data) só pra não perder evento.
    waitForGtag(fireBasic)
    return () => { cancelled = true }
  }, [])
  return null
}
