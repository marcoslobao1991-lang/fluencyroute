// ═══════════════════════════════════════════════════════════════
// Z-API WhatsApp helper
// ═══════════════════════════════════════════════════════════════

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const TOKEN = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;
const MARCOS_PHONE = '5511971167821';

const BASE_URL = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}`;

async function sendText(phone, message) {
  if (!INSTANCE_ID || !TOKEN || !CLIENT_TOKEN) {
    console.warn('[WHATSAPP] Z-API not configured, skipping');
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Client-Token': CLIENT_TOKEN },
      body: JSON.stringify({ phone, message }),
    });
    const data = await res.json();
    console.log(`[WHATSAPP] Sent to ${phone}:`, data.messageId || data.error);
    return data;
  } catch (err) {
    console.error(`[WHATSAPP] Error sending to ${phone}:`, err.message);
  }
}

/** Notify Marcos of a new sale */
export async function notifySale({ name, email, phone, method, installments, amount, utms }) {
  const valor = method === 'pix' ? 'R$996 PIX à vista' : `${installments}x R$${(amount / 100 / installments).toFixed(2)} cartão`;
  const produto = 'Rota da Fluência';
  let msg = `💰 *Venda Realizada!*\n📦 ${produto}\n\n👤 ${name}\n📧 ${email}\n📱 ${phone || 'não informado'}\n💳 ${valor}`;
  // UTMs
  const u = utms || {};
  const utmParts = [];
  if (u.utm_source) utmParts.push(`Source: ${u.utm_source}`);
  if (u.utm_medium) utmParts.push(`Medium: ${u.utm_medium}`);
  if (u.utm_campaign) utmParts.push(`Campaign: ${u.utm_campaign}`);
  if (u.utm_content) utmParts.push(`Content: ${u.utm_content}`);
  if (u.utm_term) utmParts.push(`Term: ${u.utm_term}`);
  if (u.sck) utmParts.push(`Vturb: ${u.sck}`);
  if (utmParts.length > 0) {
    msg += `\n\n📊 *Origem:*\n${utmParts.join('\n')}`;
  } else {
    msg += `\n\n📊 Origem: acesso direto`;
  }
  return sendText(MARCOS_PHONE, msg);
}

/** Send welcome message to new student */
export async function sendWelcome({ name, email, password, phone }) {
  if (!phone) return;
  const msg = `🎉 *Bem-vindo à Rota da Fluência, ${name.split(' ')[0]}!*\n\nSua conta foi criada com sucesso.\n\n🔑 *Seus dados de acesso:*\n📧 E-mail: ${email}\n🔒 Senha: ${password}\n\n👉 Acesse agora: https://app.fluencyroute.com.br\n\n⚠️ Troque sua senha no primeiro acesso.\n\nQualquer dúvida, responda essa mensagem. 💬`;
  return sendText(phone, msg);
}
