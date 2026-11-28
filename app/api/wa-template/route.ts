// 28/11: cadastra e consulta modelos do WhatsApp oficial (WABA da Fluency) usando o token que já vive na Vercel.
// Protegido por chave service do Supabase (header x-key): vale a da Vercel ou qualquer chave service válida do projeto
// (conferida no próprio Supabase, endpoint admin). GET = lista modelos + saúde da conta; POST = cria modelo (body = JSON da Meta).
const WABA = "2456850874773318";
const TOKEN = process.env.WA_CLOUD_TOKEN || "";
const KEY = process.env.SUPABASE_SERVICE_KEY || "";

async function autorizado(req: Request) {
  const k = req.headers.get("x-key") || "";
  if (!k) return false;
  if (KEY && k === KEY) return true;
  const r = await fetch("https://petrtewismhpzidcmmwb.supabase.co/auth/v1/admin/users?per_page=1", {
    headers: { apikey: k, Authorization: `Bearer ${k}` },
  }).catch(() => null);
  return !!r && r.ok;
}

export async function GET(req: Request) {
  if (!(await autorizado(req))) return new Response("no", { status: 401 });
  const H = { Authorization: `Bearer ${TOKEN}` };
  const [t, h] = await Promise.all([
    fetch(`https://graph.facebook.com/v21.0/${WABA}/message_templates?fields=name,language,status,category,rejected_reason&limit=100`, { headers: H }).then((r) => r.json()),
    fetch(`https://graph.facebook.com/v21.0/${WABA}?fields=health_status`, { headers: H }).then((r) => r.json()),
  ]);
  return Response.json({ templates: t, health: h });
}

export async function POST(req: Request) {
  if (!(await autorizado(req))) return new Response("no", { status: 401 });
  const body = await req.json();
  const r = await fetch(`https://graph.facebook.com/v21.0/${WABA}/message_templates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return Response.json(await r.json(), { status: r.status });
}
