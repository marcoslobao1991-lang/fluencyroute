'use client'

import { useEffect } from 'react'

export default function PurchaseTrigger() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('order_id')
    if (!orderId) return

    const dedupKey = `fr_purchase_${orderId}`
    try {
      if (sessionStorage.getItem(dedupKey)) return
      sessionStorage.setItem(dedupKey, '1')
    } catch {}

    const rawValue = params.get('value') || params.get('product_price')
    const parsed = rawValue ? Number(String(rawValue).replace(',', '.')) : NaN
    const value = Number.isFinite(parsed) && parsed > 0 ? parsed : 49.0

    const fire = () => {
      const fbq = (window as any).fbq
      if (typeof fbq !== 'function') return false
      fbq(
        'track',
        'Purchase',
        {
          content_name: 'Rota da Fluência Essencial',
          currency: 'BRL',
          value,
          order_id: orderId,
        },
        { eventID: `kiwify-${orderId}` }
      )
      return true
    }

    if (!fire()) {
      let tries = 0
      const iv = setInterval(() => {
        tries++
        if (fire() || tries > 20) clearInterval(iv)
      }, 250)
    }
  }, [])

  return null
}
