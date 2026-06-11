import { NextResponse } from "next/server";

// Token curto (10 min) do Azure Speech — usado pelo shadowing da /bridge.
// TRAVA DE CUSTO por IP: cada token emitido vira uma linha no funnel_events
// (event=speech_token, detail=ip). Mais de LIMIT/dia → 429 e a Manu manda
// a pessoa pro método completo. Fail-open: se o Supabase falhar, emite o
// token mesmo assim (proteção de custo nunca pode derrubar a experiência).
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const DAILY_LIMIT = 20;

async function overLimit(ip: string): Promise<boolean> {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key || !ip) return false;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const q = `${SUPA_URL}/rest/v1/funnel_events?event=eq.speech_token&detail=eq.${encodeURIComponent(ip)}&ts=gte.${today}&select=id&limit=1`;
    const r = await fetch(q, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
    });
    const range = r.headers.get("content-range") || "";
    const total = parseInt(range.split("/")[1] || "0", 10);
    if (Number.isFinite(total) && total >= DAILY_LIMIT) return true;
    // registra a emissão (fire-and-forget)
    fetch(`${SUPA_URL}/rest/v1/funnel_events`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ funnel: "ingles", page: "bridge", event: "speech_token", variant: "B", detail: ip }),
    }).catch(() => {});
    return false;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus";

  if (!key) {
    return NextResponse.json({ error: "Azure Speech key not configured" }, { status: 500 });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (await overLimit(ip)) {
    return NextResponse.json({ error: "limit" }, { status: 429 });
  }

  try {
    const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      console.error("Azure token error:", await res.text());
      return NextResponse.json({ error: "Failed to get Azure token" }, { status: 500 });
    }

    const token = await res.text();
    return NextResponse.json({ token, region });
  } catch (err) {
    console.error("Azure token fetch error:", err);
    return NextResponse.json({ error: "Azure service unavailable" }, { status: 500 });
  }
}
