// ═══════════════════════════════════════════════════════════════
// /api/abandoned-cart
// POST — save lead when checkout form has email
// GET  — cron: check abandoned carts and send WhatsApp reminders
// ═══════════════════════════════════════════════════════════════

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supaAdmin = async (path, opts = {}) => {
  const h = {
    "apikey": SUPA_SERVICE_KEY,
    "Authorization": `Bearer ${SUPA_SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
  return fetch(`${SUPA_URL}${path}`, { ...opts, headers: { ...h, ...opts.headers } });
};

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

async function sendWhatsApp(phone, message) {
  if (!INSTANCE_ID || !phone) return;
  try {
    await fetch(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Client-Token': CLIENT_TOKEN },
      body: JSON.stringify({ phone, message }),
    });
  } catch (e) { console.error('[ABANDONED] WhatsApp error:', e.message); }
}

// ── POST: Save lead ──
export async function POST(request) {
  try {
    const { email, name, phone, method } = await request.json();
    if (!email) return Response.json({ ok: false }, { status: 400 });

    // Check if already exists and not converted (update it)
    const existing = await supaAdmin(
      `/rest/v1/abandoned_carts?email=eq.${encodeURIComponent(email)}&converted=eq.false&select=id&limit=1`
    );
    const rows = await existing.json();

    if (Array.isArray(rows) && rows.length > 0) {
      // Update existing
      await supaAdmin(`/rest/v1/abandoned_carts?id=eq.${rows[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, method, created_at: new Date().toISOString() }),
      });
    } else {
      // Insert new
      await supaAdmin('/rest/v1/abandoned_carts', {
        method: 'POST',
        body: JSON.stringify({ email, name, phone, method }),
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[ABANDONED] Save error:', e.message);
    return Response.json({ ok: false }, { status: 500 });
  }
}

// ── GET: Cron job — check and send reminders ──
export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyMinAgo = new Date(now - 30 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now - 72 * 60 * 60 * 1000).toISOString();

    // ── Reminder 1: 30min — lembrete + link ──
    const r1 = await supaAdmin(
      `/rest/v1/abandoned_carts?converted=eq.false&reminder_1_sent=eq.false&created_at=lt.${thirtyMinAgo}&select=*`
    );
    const leads1 = await r1.json();

    for (const lead of (leads1 || [])) {
      if (!lead.phone) continue;
      const nome = lead.name?.split(' ')[0] || '';
      await sendWhatsApp(`55${lead.phone}`,
        `Oi${nome ? ' ' + nome : ''}! Vi que você tentou finalizar mas não conseguiu. Vou deixar o link aqui pra você ta bom?\n\nQualquer coisa é só chamar a gente aqui 😊\n\n👉 https://go.fluencyroute.com.br/subscribe`
      );
      await supaAdmin(`/rest/v1/abandoned_carts?id=eq.${lead.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ reminder_1_sent: true }),
      });
      console.log(`[ABANDONED] Reminder 1 sent to ${lead.email}`);
    }

    return Response.json({ ok: true, reminder1: leads1?.length || 0 });
  } catch (e) {
    console.error('[ABANDONED] Cron error:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
