// 28/11 (Marcos: "faz idêntico na trick"): o principal do espanhol vira 1 ANO de acesso; o vitalício vira upsell
// de US$47 (oferta Hotmart 4em11ywm). Troca as promessas de "lifetime" e ensina o webhook a marcar o vitalício.
// Rodar uma vez: node scripts/trick-anual-2811.cjs
const fs = require('fs'), path = require('path');
const R = (f) => path.join(__dirname, '..', f);
const ed = (f, pares) => { let s = fs.readFileSync(R(f), 'utf8'); for (const [a, c] of pares) { if (!s.includes(a)) throw new Error(f + ' não achei: ' + a.slice(0, 70)); s = s.split(a).join(c); } fs.writeFileSync(R(f), s); };

const FAQ_ANTES = 'Access is lifetime. You’ll have unlimited access to the content and can study at your own pace.';
const FAQ_DEPOIS = 'You get 1 full year of access, with unlimited use of the content at your own pace. One payment, no automatic renewal.';
ed('app/netflix/NetflixSalesPage.tsx', [[FAQ_ANTES, FAQ_DEPOIS], ['One-time payment · lifetime access', 'One-time payment · 1 year of access']]);
ed('app/spanish/SpanishSalesPage.tsx', [[FAQ_ANTES, FAQ_DEPOIS], ['One-time payment · lifetime access', 'One-time payment · 1 year of access']]);
ed('app/netflix/Oferta.tsx', [["['Is it a subscription?', 'No. One single payment. Access is lifetime.']", "['Is it a subscription?', 'No. One single payment for 1 full year of access. Nothing renews automatically.']"]]);
ed('app/spanish/obrigado/ThankYou.tsx', [["t: 'Lifetime updates', v: 'priceless', d: 'Everything we ever build lands in your account automatically. You pay once, today, and never agai", "t: 'Free updates', v: 'priceless', d: 'Everything we build lands in your account automatically. You pay once, today, and never agai"]]);

ed('app/api/hotmart-webhook/route.js', [
  // e-mail de entrega: plano de 1 ano
  ['You received this because you purchased Essential Spanish Fluency. Lifetime access — bookmar', 'You received this because you purchased Essential Spanish Fluency. Your plan includes 1 year of access — bookmar'],
  // oferta nova = vitalício
  [`const PLANO_POR_OFERTA = { ewtgb4zl: 'fast', x6ymozzb: 'lite', '1sq74hea': 'talk' }`,
   `// 28/11: 4em11ywm = upsell 1 "LIFETIME 47" (o principal virou 1 ano; o vitalício é vendido aqui, modelo LATAM)
    const PLANO_POR_OFERTA = { ewtgb4zl: 'fast', x6ymozzb: 'lite', '1sq74hea': 'talk', '4em11ywm': 'vitalicio' }`],
  [`(planoUpsell === 'lite' ? ':lite' : planoUpsell === 'talk' ? ':talk' : ':coaching')`,
   `(planoUpsell === 'lite' ? ':lite' : planoUpsell === 'talk' ? ':talk' : planoUpsell === 'vitalicio' ? ':vitalicio' : ':coaching')`],
  [`      await sendCoachDelivery(email, name, transaction, planoUpsell || 'fast')`,
   `      if (planoUpsell === 'vitalicio') await marcaVitalicio(email, name, transaction)
      else await sendCoachDelivery(email, name, transaction, planoUpsell || 'fast')`],
  // função nova
  ['async function sendCoachDelivery(', `// 28/11 · upgrade vitalício (oferta 4em11ywm): marca o aluno como vitalício no auth (app_metadata.spanish_lifetime),
// que é o que /api/spanish-status lê pra liberar o app sem data de vencimento. Tenta de novo se a compra principal
// ainda não criou o acesso (o webhook do upsell pode chegar segundos depois do principal).
async function marcaVitalicio(email, name, transaction) {
  const mail = String(email || '').trim().toLowerCase()
  if (!mail || !SUPA_SERVICE_KEY) return
  const admin = { apikey: SUPA_SERVICE_KEY, Authorization: \`Bearer \${SUPA_SERVICE_KEY}\`, 'Content-Type': 'application/json' }
  let uid = null
  for (let i = 0; i < 4 && !uid; i++) {
    const r = await fetch(\`\${SUPA_URL}/rest/v1/spanish_access?select=user_id&email=eq.\${encodeURIComponent(mail)}&limit=1\`, { headers: admin }).then((x) => x.json()).catch(() => [])
    uid = Array.isArray(r) && r[0]?.user_id
    if (!uid && i === 1) await prepararAcesso(mail)
    if (!uid) await new Promise((ok) => setTimeout(ok, 2500))
  }
  if (!uid) { console.error('[HOTMART-WEBHOOK] vitalício sem acesso pra', mail, transaction); return }
  const u = await fetch(\`\${SUPA_URL}/auth/v1/admin/users/\${uid}\`, { headers: admin }).then((x) => x.json()).catch(() => ({}))
  const meta = { ...(u.app_metadata || {}), spanish_lifetime: true, spanish_lifetime_tx: transaction || null }
  const up = await fetch(\`\${SUPA_URL}/auth/v1/admin/users/\${uid}\`, { method: 'PUT', headers: admin, body: JSON.stringify({ app_metadata: meta }) })
  console.log('[HOTMART-WEBHOOK] vitalício', mail, up.status)
  if (!RESEND_KEY) return
  const hi = name ? \`Hey \${String(name).split(' ')[0]},\` : 'Hey there,'
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: \`Bearer \${RESEND_KEY}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Fluency Route <access@acesso.fluencyroute.com.br>', to: [mail], subject: '♾️ Lifetime access added to your Spanish app',
      html: \`<div style="font-family:-apple-system,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:28px 22px;color:#1d1b18"><h1 style="font-size:24px">\${hi} your access is now for life.</h1><p style="font-size:16px;line-height:1.6">Essential Spanish Fluency is yours with no expiration date, including every new series and scene we add. Keep using the same link from your welcome email.</p><p style="font-size:14px;color:#7a746a">— Fluency Route</p></div>\` }),
  }).catch(() => {})
}

async function sendCoachDelivery(`],
]);
console.log('ok');
