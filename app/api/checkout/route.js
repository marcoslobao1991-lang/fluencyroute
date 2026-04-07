// ═══════════════════════════════════════════════════════════════
// app/api/checkout/route.js
// Processa pagamento via Pagar.me API v5
// ═══════════════════════════════════════════════════════════════

import { sendServerEvent } from '../../lib/meta-capi.js'
import { notifySale, sendWelcome } from '../../lib/whatsapp.js'

const PAGARME_SECRET = process.env.PAGARME_SECRET_KEY; // sk_xxx
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.fluencyroute.com.br";

// Pagar.me API helper
const pagarme = async (path, body) => {
  const auth = Buffer.from(`${PAGARME_SECRET}:`).toString("base64");
  const res = await fetch(`https://api.pagar.me/core/v5${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
};

// Supabase Admin helper
const supaAdmin = async (path, opts = {}) => {
  const h = {
    "apikey": SUPA_SERVICE_KEY,
    "Authorization": `Bearer ${SUPA_SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
  return fetch(`${SUPA_URL}${path}`, { ...opts, headers: { ...h, ...opts.headers } });
};

// Generate password
const generatePassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

// Create user in Supabase
const createUser = async (email, name, phone) => {
  const password = generatePassword();
  const res = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "apikey": SUPA_SERVICE_KEY,
      "Authorization": `Bearer ${SUPA_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone },
    }),
  });
  const data = await res.json();
  return { user: data, password };
};

// Find user by email
const findUserByEmail = async (email) => {
  const res = await fetch(`${SUPA_URL}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: {
      "apikey": SUPA_SERVICE_KEY,
      "Authorization": `Bearer ${SUPA_SERVICE_KEY}`,
    },
  });
  const data = await res.json();
  return (data.users || []).find((u) => u.email === email);
};

// Send welcome email via Resend
const sendWelcomeEmail = async ({ email, name, password, isNew }) => {
  if (!RESEND_API_KEY) { console.error("[CHECKOUT] RESEND_API_KEY not set"); return; }
  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;background:#0A0A0A;border-radius:16px;overflow:hidden">
      <div style="padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
        <h1 style="color:#fff;font-size:24px;margin:0">Bem-vindo ao <span style="color:#4ECDC4">Rota da Fluência</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:8px">Seu acesso está pronto!</p>
      </div>
      <div style="padding:32px">
        <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 20px">Olá <strong style="color:#fff">${name}</strong>,</p>
        <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 24px">
          ${isNew ? 'Sua conta foi criada com sucesso. Use os dados abaixo para acessar a plataforma:' : 'Seu pagamento foi confirmado e sua assinatura está ativa. Acesse com seu login atual:'}
        </p>
        ${isNew ? `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px">Seus dados de acesso</p>
          <p style="color:#fff;font-size:14px;margin:0 0 8px"><strong>E-mail:</strong> ${email}</p>
          <p style="color:#fff;font-size:14px;margin:0"><strong>Senha:</strong> <code style="background:rgba(78,205,196,0.1);color:#4ECDC4;padding:2px 8px;border-radius:4px;font-size:16px;letter-spacing:1px">${password}</code></p>
        </div>
        ` : ''}
        <a href="${APP_URL}" style="display:block;text-align:center;padding:16px;background:#4ECDC4;color:#000;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;margin-bottom:24px">ACESSAR PLATAFORMA</a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin:0">Qualquer dúvida, responda este e-mail.</p>
      </div>
    </div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Rota da Fluência <contato@acesso.fluencyroute.com.br>",
        to: email,
        subject: isNew ? "Seu acesso ao Rota da Fluência está pronto!" : "Pagamento confirmado — Rota da Fluência",
        html,
      }),
    });
    console.log(`[CHECKOUT] Welcome email sent to ${email}`);
  } catch (err) {
    console.error("[CHECKOUT] Email failed:", err.message);
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { method, name, email, cpf, phone, card, address, utms, installments = 12, meta = {} } = body;

    // Extract headers for CAPI
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const userAgent = request.headers.get('user-agent') || '';
    const { addPaymentEid, purchaseEid, fbc, fbp } = meta;

    if (!email || !name || !cpf) {
      return new Response(JSON.stringify({ error: "Preencha todos os campos" }), { status: 400 });
    }

    // ── Pricing Rota da Fluência (valores em centavos) ──
    const TEST_MODE = false;
    const INSTALLMENT_TOTALS = {
      1: 29600, 2: 30094, 3: 29961, 4: 30784, 5: 31535, 6: 32268,
      7: 32949, 8: 33600, 9: 34263, 10: 34850, 11: 35398, 12: 35880,
    };
    const amount = TEST_MODE ? 100 : (method === "pix" ? 29600 : (INSTALLMENT_TOTALS[installments] || 35880));

    // ── Build Pagar.me order ──
    const order = {
      items: [
        {
          amount,
          description: "Rota da Fluência Essencial",
          quantity: 1,
          code: "rota-fluencia-annual",
        },
      ],
      customer: {
        name,
        email,
        document: cpf,
        phones: phone
          ? {
              mobile_phone: {
                country_code: "55",
                area_code: phone.slice(0, 2),
                number: phone.slice(2),
              },
            }
          : undefined,
        type: "individual",
      },
      payments: [],
      metadata: {
        ...(utms || {}),
        source: "vsl_checkout",
      },
    };

    if (method === "card") {
      if (!card?.number || !card?.exp_month || !card?.exp_year || !card?.cvv) {
        return new Response(JSON.stringify({ error: "Dados do cartão incompletos" }), { status: 400 });
      }
      order.payments.push({
        payment_method: "credit_card",
        credit_card: {
          recurrence: false,
          installments: parseInt(installments) || 12,
          statement_descriptor: "ROTAFLUENCIA",
          card: {
            number: card.number,
            holder_name: card.holder_name || name,
            exp_month: parseInt(card.exp_month),
            exp_year: parseInt(card.exp_year),
            cvv: card.cvv,
            billing_address: address ? {
              line_1: address.line_1 || "Checkout online",
              line_2: address.line_2 || "",
              city: address.city || "São Paulo",
              state: address.state || "SP",
              country: "BR",
              zip_code: address.zip_code || "01000000",
            } : {
              line_1: "Checkout online",
              city: "São Paulo",
              state: "SP",
              country: "BR",
              zip_code: "01000000",
            },
          },
        },
      });
    } else if (method === "pix") {
      order.payments.push({
        payment_method: "pix",
        pix: {
          expires_in: 86400, // 24h
        },
      });
    } else {
      return new Response(JSON.stringify({ error: "Método de pagamento inválido" }), { status: 400 });
    }

    // ── Server-side AddPaymentInfo (dedup with browser event) ──
    sendServerEvent('AddPaymentInfo',
      { email, phone, cpf, name, ip, userAgent, fbc, fbp },
      { value: amount / 100, payment_method: method },
      '', addPaymentEid
    ).catch(() => {});

    // ── Send to Pagar.me ──
    console.log(`[CHECKOUT] Creating order: ${email}, method: ${method}`);
    const result = await pagarme("/orders", order);

    if (result.errors || result.message) {
      console.error("[CHECKOUT] Pagar.me error:", JSON.stringify(result));
      const msg = result.errors?.[0]?.message || result.message || "Erro no processamento";
      return new Response(JSON.stringify({ error: msg }), { status: 400 });
    }

    const charge = result.charges?.[0];
    const status = charge?.status;

    console.log(`[CHECKOUT] Order ${result.id}, status: ${status}`);

    // ── Save order to orders table ──
    try {
      await supaAdmin("/rest/v1/orders", {
        method: "POST",
        body: JSON.stringify({
          pagarme_order_id: result.id,
          customer_name: name,
          customer_email: email,
          product: "Rota da Fluência",
          amount_cents: amount,
          payment_method: method,
          installments: method === "card" ? installments : 1,
          status: status === "paid" ? "paid" : "pending",
          utm_source: utms?.utm_source || null,
          utm_medium: utms?.utm_medium || null,
          utm_campaign: utms?.utm_campaign || null,
          utm_content: utms?.utm_content || null,
          utm_term: utms?.utm_term || null,
          vturb_sck: utms?.sck || null,
          meta_fbc: fbc || null,
          meta_fbp: fbp || null,
          meta_event_id: purchaseEid || null,
        }),
      });
      console.log(`[CHECKOUT] Order saved to DB: ${result.id}`);
    } catch (e) {
      console.error("[CHECKOUT] Failed to save order:", e);
    }

    // Mark abandoned cart as converted
    supaAdmin(`/rest/v1/abandoned_carts?email=eq.${encodeURIComponent(email)}&converted=eq.false`, {
      method: 'PATCH',
      body: JSON.stringify({ converted: true }),
    }).catch(() => {});

    // ── PIX: return QR code ──
    if (method === "pix") {
      const pixTransaction = charge?.last_transaction;
      return new Response(
        JSON.stringify({
          ok: true,
          status: "pending",
          orderId: result.id,
          pix: {
            qr_code_url: pixTransaction?.qr_code_url,
            qr_code: pixTransaction?.qr_code,
          },
        }),
        { status: 200 }
      );
      // PIX confirmation comes via webhook (/api/webhook-pagarme)
    }

    // ── CARD: check if paid ──
    if (status === "paid") {
      // Create account + subscription
      let userId, password, isNew = false;

      const { user, password: newPass } = await createUser(email, name, phone);
      if (user?.id) {
        userId = user.id;
        password = newPass;
        isNew = true;
      } else {
        const existing = await findUserByEmail(email);
        if (existing) userId = existing.id;
      }

      if (userId) {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await supaAdmin("/rest/v1/subscriptions", {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
            status: "active",
            plan: "annual",
            pagarme_order_id: result.id,
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          }),
        });

        // Send welcome email
        await sendWelcomeEmail({ email, name, password: isNew ? password : null, isNew });

        // WhatsApp: welcome + notify Marcos
        if (isNew) sendWelcome({ name, email, password, phone }).catch(() => {});
        notifySale({ name, email, phone, method, installments, amount, utms }).catch(() => {});
      }

      // Server-side Purchase event (Meta CAPI, deduped with browser)
      sendServerEvent('Purchase',
        { email, phone, cpf, name, ip, userAgent, fbc, fbp },
        { value: amount / 100, order_id: result.id },
        '', purchaseEid
      ).catch(() => {});

      return new Response(JSON.stringify({
        ok: true, status: "paid", orderId: result.id,
        credentials: isNew ? { email, password } : null,
      }), { status: 200 });
    }

    // Card declined or other status
    const lastTx = charge?.last_transaction || {};
    console.error(`[CHECKOUT] Card declined: status=${status}, gateway_response=${JSON.stringify(lastTx.gateway_response)}, acquirer_message=${lastTx.acquirer_message}`);
    return new Response(
      JSON.stringify({
        error: "Pagamento não aprovado. Verifique os dados do cartão.",
        debug: { status, gateway_response: lastTx.gateway_response, acquirer_message: lastTx.acquirer_message, acquirer_return_code: lastTx.acquirer_return_code }
      }),
      { status: 400 }
    );
  } catch (err) {
    console.error("[CHECKOUT] Error:", err);
    return new Response(JSON.stringify({ error: "Erro interno. Tente novamente." }), { status: 500 });
  }
}
