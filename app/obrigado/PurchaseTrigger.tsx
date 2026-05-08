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
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    // Tenta capturar transaction_id da URL (Kiwify pode ou não passar)
    const params = new URLSearchParams(window.location.search)
    const transactionId =
      params.get('order_id') ||
      params.get('transaction_id') ||
      params.get('id') ||
      ''
    window.gtag('event', 'conversion', {
      send_to: 'AW-16694165189/0RG8CLaZpvkaEMX9spg-',
      transaction_id: transactionId,
    })
  }, [])
  return null
}
