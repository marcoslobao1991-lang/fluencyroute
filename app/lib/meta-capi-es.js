// ═══════════════════════════════════════════════════════════════
// Meta Conversions API (Server-Side) — Fluency Route SPANISH (mercado USD)
//
// Clone isolado de meta-capi.js pro pixel do espanhol. Pixel + token PRÓPRIOS
// (não toca o inglês). event_id DEVE casar com o browser pixel, senão o
// Facebook conta DOBRADO.
// ═══════════════════════════════════════════════════════════════

const PIXEL_ID = '690970750622464'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN_ES

const crypto = require('crypto')
const sha256 = (val) =>
  val
    ? crypto
        .createHash('sha256')
        .update(String(val).trim().toLowerCase())
        .digest('hex')
    : undefined

/**
 * Send server-side event to Meta Conversions API (Spanish pixel)
 * @param {string} eventName - 'Purchase' | 'InitiateCheckout' | 'ViewContent' | 'PageView'
 * @param {object} userData - { email, phone, name, city, state, zip, externalId, sessionId, ip, userAgent, fbc, fbp, country }
 * @param {object} customData - { value, currency, order_id, content_name, content_ids, content_type, num_items }
 * @param {string} eventSourceUrl
 * @param {string} eventId - OBRIGATÓRIO pra dedup com browser pixel
 * @param {string} testEventCode
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
    console.warn('[META-CAPI-ES] META_CAPI_TOKEN_ES não setado — skip')
    return { error: 'missing_token' }
  }

  if (!eventId) {
    console.warn(`[META-CAPI-ES] ⚠️ ${eventName} SEM eventId — SKIP pra evitar duplicação.`)
    return { error: 'missing_event_id' }
  }

  const eventTime = Math.floor(Date.now() / 1000)
  const phoneDigits = userData.phone?.replace(/\D/g, '')
  // Mercado internacional: mantém dígitos com prefixo '+' se vier E.164; senão só dígitos.
  const phoneNorm = phoneDigits || null

  const nameParts = userData.name?.split(' ').filter(Boolean) || []
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')
  const zipDigits = userData.zip?.toString().replace(/[^a-z0-9]/gi, '')

  const extIdRaw = userData.externalId || userData.external_id || userData.sessionId || null

  const normCity = userData.city
    ? String(userData.city)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s/g, '')
    : null
  const normState = userData.state ? String(userData.state).toLowerCase().trim() : null
  // País NÃO é fixo aqui (público internacional): usa o que vier, hasheado; senão omite
  // e deixa a Meta inferir pelo IP.
  const normCountry = userData.country ? String(userData.country).toLowerCase().trim().slice(0, 2) : null

  const event = {
    event_name: eventName,
    event_id: eventId,
    event_time: eventTime,
    event_source_url: eventSourceUrl || 'https://fluencyroute.com.br/spanish',
    action_source: 'website',
    user_data: {
      em: userData.email ? [sha256(userData.email)] : undefined,
      ph: phoneNorm ? [sha256(phoneNorm)] : undefined,
      fn: firstName ? [sha256(firstName)] : undefined,
      ln: lastName ? [sha256(lastName)] : undefined,
      external_id: extIdRaw ? [sha256(String(extIdRaw))] : undefined,
      ct: normCity ? [sha256(normCity)] : undefined,
      st: normState ? [sha256(normState)] : undefined,
      zp: zipDigits ? [sha256(zipDigits)] : undefined,
      country: normCountry ? [sha256(normCountry)] : undefined,
      client_ip_address: userData.ip || undefined,
      client_user_agent: userData.userAgent || undefined,
      fbc: userData.fbc || undefined,
      fbp: userData.fbp || undefined,
    },
    custom_data: {
      currency: customData.currency || 'USD',
      value: typeof customData.value === 'number' ? customData.value : undefined,
      order_id: customData.order_id || undefined,
      content_name: customData.content_name || 'Essential Spanish Fluency',
      content_type: customData.content_type || 'product',
      content_ids: customData.content_ids || ['essential-spanish-fluency'],
      num_items: customData.num_items || 1,
    },
  }

  Object.keys(event.user_data).forEach(
    (k) => event.user_data[k] === undefined && delete event.user_data[k]
  )
  Object.keys(event.custom_data).forEach(
    (k) => event.custom_data[k] === undefined && delete event.custom_data[k]
  )

  const payload = { data: [event] }
  const effectiveTestCode = testEventCode || process.env.META_TEST_EVENT_CODE_ES || ''
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
      console.error(`[META-CAPI-ES] ${eventName} ERROR:`, result.error)
    } else {
      console.log(`[META-CAPI-ES] ${eventName} sent (eventId=${eventId}) → received: ${result.events_received}`)
    }
    return result
  } catch (err) {
    console.error(`[META-CAPI-ES] ${eventName} failed:`, err.message)
    return { error: err.message }
  }
}

/** Reconstrói fbc a partir de fbclid (fb.1.<ts>.<fbclid>) */
export function fbcFromFbclid(fbclid, createdAtMs) {
  if (!fbclid) return null
  const ts = Number.isFinite(createdAtMs) ? createdAtMs : Date.now()
  return `fb.1.${ts}.${fbclid}`
}
