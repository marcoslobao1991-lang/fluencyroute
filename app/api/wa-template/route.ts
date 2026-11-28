// 28/11: cadastra e consulta modelos do WhatsApp oficial (WABA da Fluency) usando o token que já vive na Vercel.
// Protegido pela chave service do Supabase (header x-key). GET = lista modelos + saúde da conta; POST = cria modelo (body = JSON da Meta).
const WABA = "2456850874773318";
const TOKEN = process.env.WA_CLOUD_TOKEN || "";
const KEY = process.env.SUPABASE_SERVICE_KEY || "";

function autorizado(req: Request) {
  return !!KEY && req.headers.get("x-key") === KEY;
}

export async function GET(req: Request) {
  if (!autorizado(req)) return new Response("no", { status: 401 });
  const H = { Authorization: `Bearer ${TOKEN}` };
  const [t, h] = await Promise.all([
    fetch(`https://graph.facebook.com/v21.0/${WABA}/message_templates?fields=name,language,status,category,rejected_reason&limit=100`, { headers: H }).then((r) => r.json()),
    fetch(`https://graph.facebook.com/v21.0/${WABA}?fields=health_status`, { headers: H }).then((r) => r.json()),
  ]);
  return Response.json({ templates: t, health: h });
}

export async function POST(req: Request) {
  if (!autorizado(req)) return new Response("no", { status: 401 });
  const body = await req.json();
  const r = await fetch(`https://graph.facebook.com/v21.0/${WABA}/message_templates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return Response.json(await r.json(), { status: r.status });
}
