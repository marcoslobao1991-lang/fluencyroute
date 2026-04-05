const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: Request) {
  try {
    const { name, phone, source } = await request.json();
    if (!name || !phone) {
      return Response.json({ error: "Nome e WhatsApp obrigatórios" }, { status: 400 });
    }

    // Clean phone: keep only digits
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if lead already exists
    const check = await fetch(
      `${SUPA_URL}/rest/v1/leads?phone=eq.${cleanPhone}&select=id&limit=1`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    const existing = await check.json();

    if (Array.isArray(existing) && existing.length > 0) {
      // Update name/source if already exists
      await fetch(`${SUPA_URL}/rest/v1/leads?id=eq.${existing[0].id}`, {
        method: "PATCH",
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, source: source || "aula-aberta" }),
      });
      return Response.json({ ok: true, existing: true });
    }

    // Create new lead
    const res = await fetch(`${SUPA_URL}/rest/v1/leads`, {
      method: "POST",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ name, phone: cleanPhone, source: source || "aula-aberta" }),
    });

    if (!res.ok) {
      return Response.json({ error: "Erro ao salvar" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
