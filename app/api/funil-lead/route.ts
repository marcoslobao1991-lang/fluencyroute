// ═══════════════════════════════════════════════════════════════════
//  /api/funil-lead — captura do funil "Loop de Repetição" (comecar.html)
//  + eventos do treino (treino.html).
//  Grava em quiz_leads (source: "leadmagnet_497"), upsert por id (2 tiros:
//  email no passo 1, whatsapp no passo 2 — omite chaves vazias pra não zerar).
//  Dispara email D0 via Resend (best-effort: se o domínio não estiver
//  verificado, o lead JÁ ESTÁ SALVO e o email pode ser reenviado depois).
//  Eventos do treino (body.ev) só são logados/gravados, não mandam email.
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Body {
  id?: string;
  email?: string;
  zap?: string;      // whatsapp, só dígitos
  nome?: string;
  nivel?: string;
  src?: string;      // origem do clique (hero/meio/dark/faq)
  ev?: string;       // evento do treino (home/rules/loop1_done/...); se presente, não manda email
  baseline?: number;
  fin?: number;
  utm?: Record<string, string>;
}

const APP_URL = "https://fluencyroute.com.br";

function d0Html(nome: string) {
  const oi = nome ? `Oi, ${nome}!` : "Oi!";
  return `<!doctype html><html><body style="margin:0;background:#FAFAF6;font-family:-apple-system,'Segoe UI',sans-serif;color:#15201E">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px">FLUENCY <span style="color:#12B5AC">ROUTE</span></p>
    <h1 style="font-size:26px;font-weight:900;letter-spacing:-1px;line-height:1.2;margin:20px 0 8px">🔓 ${oi} Seu treino tá liberado.</h1>
    <p style="font-size:16px;color:#3D4A49;line-height:1.6">O <b>Loop de Repetição</b> — o treino de 5 minutos que coloca seu inglês no automático — tá pronto pra você. É só apertar o play:</p>
    <a href="${APP_URL}/funil/treino.html?utm_source=email&utm_medium=d0" style="display:inline-block;margin:22px 0;background:#0B6E68;color:#fff;font-weight:900;font-size:16px;padding:16px 28px;border-radius:12px;text-decoration:none">COMEÇAR MEU TREINO ▶</a>
    <p style="font-size:14px;color:#5C6E6C;line-height:1.6">Faz agora, com fone, num lugar tranquilo. São 5 minutinhos e teu ouvido não volta a ser o mesmo. — Manu 👋</p>
    <p style="font-size:11px;color:#9aa;margin-top:32px">Fluency Route · você recebeu porque pediu o treino gratuito.</p>
  </div></body></html>`;
}

export async function POST(req: Request) {
  const url = "https://petrtewismhpzidcmmwb.supabase.co";
  const key = process.env.SUPABASE_SERVICE_KEY;
  let body: Body;
  try { body = (await req.json()) as Body; } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const id = (body.id || "").trim();
  const email = (body.email || "").trim().toLowerCase().slice(0, 200);
  const zap = (body.zap || "").replace(/\D/g, "").slice(0, 20);
  const nome = (body.nome || "").trim().slice(0, 120);

  // grava lead (só quando tem id + email; eventos do treino sem email só passam)
  if (url && key && id && /^[0-9a-f-]{36}$/i.test(id) && email) {
    const row: Record<string, unknown> = {
      id, source: "leadmagnet_497",
      email,
      answers: { nivel: body.nivel || null, src: body.src || null, ev: body.ev || null, baseline: body.baseline ?? null, fin: body.fin ?? null },
      utms: body.utm || {},
    };
    if (nome) row.name = nome;
    if (zap) row.phone = zap;
    try {
      await fetch(`${url}/rest/v1/quiz_leads?on_conflict=id`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(row),
      });
    } catch (e) { console.error("[FUNIL-LEAD] supabase:", e); }
  }

  // email D0 — só no 1º tiro (passo email, sem ev de treino), best-effort
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && email && !body.ev && !zap) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Manu · Fluency Route <manu@acesso.fluencyroute.com.br>",
          to: [email],
          subject: "🔓 Seu treino de inglês tá liberado (5 min)",
          html: d0Html(nome),
        }),
      });
      if (!r.ok) console.error("[FUNIL-LEAD] resend:", r.status, await r.text());
    } catch (e) { console.error("[FUNIL-LEAD] resend err:", e); }
  }

  return NextResponse.json({ ok: true });
}
