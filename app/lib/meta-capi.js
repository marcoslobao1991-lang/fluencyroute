// ═══════════════════════════════════════════════════════════════
// Meta Conversions API (Server-Side) — Fluency Route / Inglês Cantado
//
// IMPORTANTE: event_id DEVE ser passado explicitamente e casar com
// o event_id do browser pixel, senão o Facebook conta DOBRADO.
//
// Arquitetura segue o playbook `reference_tracking_playbook.md`
// validado em Maestro 21/04/2026 com EMQ 9.3.
// ═══════════════════════════════════════════════════════════════

const PIXEL_ID = '938768337634102'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN

const crypto = require('crypto')
const sha256 = (val) =>
  val
    ? crypto
        .createHash('sha256')
        .update(String(val).trim().toLowerCase())
        .digest('hex')
    : undefined

/**
 * Send server-side event to Meta Conversions API
 * @param {string} eventName - 'Purchase' | 'Lead' | 'InitiateCheckout' | 'ViewContent' | 'PageView' | 'AddPaymentInfo'
 * @param {object} userData - { email, phone, cpf, name, city, state, zip, externalId, sessionId, ip, userAgent, fbc, fbp }
 * @param {object} customData - { value, currency, order_id, content_name, content_ids, content_type, num_items }
 * @param {string} eventSourceUrl - URL da página onde o evento aconteceu
 * @param {string} eventId - OBRIGATÓRIO pra dedup com browser pixel
 * @param {string} testEventCode - opcional, se setado rotea pro Events Manager Test Events
 */
export async function sendServerEvent(
  eventName,
  userData = {},
  customData = {},
  eventSourceUrl = '',
  eventId = '',
  testEventCode = ''
) {
  if (!ACCESS_TOKEN) {
    console.warn('[META-CAPI] META_CAPI_TOKEN não setado — skip')
    return { error: 'missing_token' }
  }

  // CRÍTICO: sem eventId NÃO manda pro CAPI.
  if (!eventId) {
    console.warn(`[META-CAPI] ⚠️ ${eventName} SEM eventId — SKIP pra evitar duplicação.`)
    return { error: 'missing_event_id' }
  }

  const eventTime = Math.floor(Date.now() / 1000)
  const phoneDigits = userData.phone?.replace(/\D/g, '')
  // Phone normalizado E.164 (Brasil): prefixo 55 se não tiver, remove leading zeros
  const phoneE164 = phoneDigits
    ? (phoneDigits.startsWith('55') ? phoneDigits : '55' + phoneDigits.replace(/^0+/, ''))
    : null

  const nameParts = userData.name?.split(' ').filter(Boolean) || []
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')
  const cpfDigits = userData.cpf?.replace(/\D/g, '')
  const zipDigits = userData.zip?.toString().replace(/\D/g, '')

  // external_id: prefer explicit externalId, fallback to cpf, fallback to sessionId
  const extIdRaw = userData.externalId || userData.external_id || cpfDigits || userData.sessionId || null

  // City: lowercase + strip accents + no spaces (formato Meta)
  const normCity = userData.city
    ? String(userData.city)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s/g, '')
    : null
  // State: sigla lowercase ("sp", "rj")
  const normState = userData.state ? String(userData.state).toLowerCase().trim() : null

  const event = {
    event_name: eventName,
    event_id: eventId,
    event_time: eventTime,
    event_source_url: eventSourceUrl || 'https://go.fluencyroute.com.br/subscribe',
    action_source: 'website',
    user_data: {
      em: userData.email ? [sha256(userData.email)] : undefined,
      ph: phoneE164 ? [sha256(phoneE164)] : undefined,
      fn: firstName ? [sha256(firstName)] : undefined,
      ln: lastName ? [sha256(lastName)] : undefined,
      external_id: extIdRaw ? [sha256(String(extIdRaw))] : undefined,
      ct: normCity ? [sha256(normCity)] : undefined,
      st: normState ? [sha256(normState)] : undefined,
      zp: zipDigits ? [sha256(zipDigits)] : undefined,
      client_ip_address: userData.ip || undefined,
      client_user_agent: userData.userAgent || undefined,
      fbc: userData.fbc || undefined,
      fbp: userData.fbp || undefined,
      country: [sha256('br')],
    },
    custom_data: {
      currency: customData.currency || 'BRL',
      value: typeof customData.value === 'number' ? customData.value : undefined,
      order_id: customData.order_id || undefined,
      content_name: customData.content_name || 'Inglês Cantado — Plano Anual',
      content_type: customData.content_type || 'product',
      content_ids: customData.content_ids || ['fluency-annual'],
      num_items: customData.num_items || 1,
    },
  }

  // Remove undefined fields
  Object.keys(event.user_data).forEach(
    (k) => event.user_data[k] === undefined && delete event.user_data[k]
  )
  Object.keys(event.custom_data).forEach(
    (k) => event.custom_data[k] === undefined && delete event.custom_data[k]
  )

  const payload = { data: [event] }
  // test_event_code: param explícito OU env var global (switch sem redeploy)
  const effectiveTestCode = testEventCode || process.env.META_TEST_EVENT_CODE || ''
  if (effectiveTestCode) payload.test_event_code = effectiveTestCode

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    const result = await res.json()
    if (result.error) {
      console.error(`[META-CAPI] ${eventName} ERROR:`, result.error)
    } else {
      console.log(
        `[META-CAPI] ${eventName} sent (eventId=${eventId}) → received: ${result.events_received}`
      )
    }
    return result
  } catch (err) {
    console.error(`[META-CAPI] ${eventName} failed:`, err.message)
    return { error: err.message }
  }
}

/**
 * Reconstrói fbc no formato que o Meta aceita quando só temos fbclid (sem cookie _fbc).
 * Format: fb.<subdomainIndex>.<timestamp-ms>.<fbclid>
 *   subdomainIndex = 1 para .com.br / .com (per Meta docs)
 */
export function fbcFromFbclid(fbclid, createdAtMs) {
  if (!fbclid) return null
  const ts = Number.isFinite(createdAtMs) ? createdAtMs : Date.now()
  return `fb.1.${ts}.${fbclid}`
}
