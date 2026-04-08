// ═══════════════════════════════════════════════════════════════
// Meta Conversions API (Server-Side) — sends events directly to Meta
// ═══════════════════════════════════════════════════════════════

const PIXEL_ID = '938768337634102'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN // set in Vercel env

const crypto = require('crypto')
const sha256 = (val) => val ? crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex') : undefined

/**
 * Send server-side event to Meta Conversions API
 * @param {string} eventName - e.g. 'Purchase', 'Lead'
 * @param {object} userData - { email, phone, cpf, name, ip, userAgent, fbc, fbp }
 * @param {object} customData - { value, currency, order_id, content_name }
 * @param {string} eventSourceUrl - the page URL where event happened
 * @param {string} eventId - for deduplication with browser pixel
 */
export async function sendServerEvent(eventName, userData = {}, customData = {}, eventSourceUrl = '', eventId = '') {
  if (!ACCESS_TOKEN) {
    console.warn('[META-CAPI] No ACCESS_TOKEN set, skipping server event')
    return
  }

  const eventTime = Math.floor(Date.now() / 1000)
  const phone = userData.phone?.replace(/\D/g, '')

  const event = {
    event_name: eventName,
    event_id: eventId || `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    event_time: eventTime,
    event_source_url: eventSourceUrl || 'https://go.fluencyroute.com.br/subscribe',
    action_source: 'website',
    user_data: {
      em: [sha256(userData.email)],
      ph: phone ? [sha256(`55${phone}`)] : undefined,
      fn: userData.name ? [sha256(userData.name.split(' ')[0])] : undefined,
      ln: userData.name ? [sha256(userData.name.split(' ').slice(1).join(' '))] : undefined,
      external_id: userData.cpf ? [sha256(userData.cpf.replace(/\D/g, ''))] : undefined,
      client_ip_address: userData.ip || undefined,
      client_user_agent: userData.userAgent || undefined,
      fbc: userData.fbc || undefined,
      fbp: userData.fbp || undefined,
      country: [sha256('br')],
    },
    custom_data: {
      currency: customData.currency || 'BRL',
      value: customData.value || 289.00,
      order_id: customData.order_id || undefined,
      content_name: customData.content_name || 'Rota da Fluência Essencial',
      content_type: 'product',
    },
  }

  // Remove undefined fields
  Object.keys(event.user_data).forEach(k => event.user_data[k] === undefined && delete event.user_data[k])
  Object.keys(event.custom_data).forEach(k => event.custom_data[k] === undefined && delete event.custom_data[k])

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [event],
        }),
      }
    )
    const result = await res.json()
    console.log(`[META-CAPI] ${eventName} sent:`, result)
    return result
  } catch (err) {
    console.error(`[META-CAPI] ${eventName} failed:`, err.message)
  }
}
