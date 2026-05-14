'use client'

import { useEffect } from 'react'

// Meta Purchase NÃO é disparado aqui — 100% server-side via /api/kiwify-webhook.
// (Kiwify não interpola {order_id} na URL → event_id quebrado, fix EMQ via webhook).
//
// Google Ads conversion É disparado AQUI (browser-side) — Google Ads não tem
// dedup baseado em event_id como Meta. Mais simples: dispara no /obrigado.
// Pequeno risco: alguém abre /obrigado sem ter comprado conta como conversão.
// Mitigação: Kiwify só redireciona pra /obrigado APÓS pagamento confirmado.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function PurchaseTrigger() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const transactionId =
      params.get('order_id') ||
      params.get('transaction_id') ||
      params.get('id') ||
      ''

    let fired = false
    const fire = () => {
      if (fired) return
      if (typeof window.gtag !== 'function') return
      fired = true
      window.gtag('event', 'conversion', {
        send_to: 'AW-16694165189/0RG8CLaZpvkaEMX9spg-',
        transaction_id: transactionId,
      })
    }

    // Tenta imediatamente. Se gtag ainda não carregou (lazyOnload),
    // faz polling de 200ms até 10s. Resolve race condition no /obrigado.
    fire()
    if (fired) return
    const start = Date.now()
    const interval = setInterval(() => {
      fire()
      if (fired || Date.now() - start > 10000) clearInterval(interval)
    }, 200)
    return () => clearInterval(interval)
  }, [])
  return null
}
