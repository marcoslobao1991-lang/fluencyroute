'use client'

import { useEffect } from 'react'

// Purchase NÃO é disparado aqui. 100% server-side via /api/kiwify-webhook.
//
// Motivo: Kiwify passa `{order_id}` LITERAL na URL de redirect (não interpola),
// e isso gerava event_id quebrado `kiwify-{order_id}` — resultou em cobertura
// CAPI 0% no Maestro por 7 dias (validado via Events Manager 21/04/2026).
//
// O webhook Kiwify gera event_id determinístico `kiwify-<uuid>` com user_data
// hasheado completo (em, ph, fn, ln, ct, st, zp, external_id) e EMQ 8-9.
//
// PageView nessa página é disparado pelo PageViewTracker global no layout.
export default function PurchaseTrigger() {
  useEffect(() => {
    // No-op. Intencional.
  }, [])
  return null
}
