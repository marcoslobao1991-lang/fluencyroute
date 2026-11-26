// ═══════════════════════════════════════════════════════════════════
//  /api/acesso-nudge — reenvio de acesso até o primeiro login.
//  Cron diário (vercel.json). Pega compradores pagos (45d) que NUNCA
//  logaram (RPC get_access_nudge_candidates), redefine a senha e manda
//  e-mail com login+senha. Régua: D+1, D+3, D+7 (máx 3 envios), para
//  sozinho quando last_sign_in_at deixa de ser null.
//  Auth: Authorization: Bearer CRON_SECRET ou ?key=CRON_SECRET.
//  Teste: ?key=...&test=email@x.com (força envio só pra esse email).
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const APP_URL = process.env.APP_URL || "https://app.fluencyroute.com.br";
const FROM = "Rota da Fluência <contato@acesso.fluencyroute.com.br>";

// 25/11/2026: RELIGADO com o app como entrega principal (curso Kiwify = versão antiga).
// Reembolsos diziam "não consegui acessar" / "só acesso pelo computador".
const ASSUNTOS = [
  "Seu app de inglês ainda não foi aberto (login e senha aqui)",
  "Seu acesso ao app continua aqui: senha nova nesse e-mail",
  "Último lembrete: seu app de inglês te espera",
];

function novaSenha() {
  return "rota" + Math.random().toString(36).slice(2, 8);
}

function emailHtml(nome: string, email: string, senha: string, n: number) {
  const oi = nome ? nome.split(" ")[0] + ", " : "";
  const intro =
    n === 0
      ? `${oi}sua compra está confirmada, mas você ainda não abriu o seu app. É nele que está o treino: Friends minuto a minuto, até entender o episódio sem legenda. Funciona no <b>celular</b>.`
      : n === 1
        ? `${oi}você ainda não entrou no app. Leva 1 minuto: toque no botão, entre com os dados abaixo e faça o minuto 1 de Friends hoje.`
        : `${oi}esse é o último lembrete automático. O seu app continua liberado, com os dados abaixo.`;
  return `<!doctype html><html><body style="margin:0;background:#FAFAF6;font-family:-apple-system,'Segoe UI',sans-serif;color:#15201E">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px">FLUENCY <span style="color:#12B5AC">ROUTE</span></p>
    <h1 style="font-size:24px;font-weight:900;letter-spacing:-1px;line-height:1.25;margin:18px 0 10px">Seu app está te esperando.</h1>
    <p style="font-size:16px;color:#3D4A49;line-height:1.65">${intro}</p>
    <div style="background:#0F2B28;border-radius:12px;padding:18px 20px;margin:18px 0">
      <p style="color:#9fd8d3;font-size:12px;letter-spacing:1px;margin:0 0 8px">SEU APP · abra pelo celular</p>
      <p style="color:#fff;font-size:15px;margin:0 0 6px"><b>E-mail:</b> ${email}</p>
      <p style="color:#fff;font-size:15px;margin:0"><b>Senha:</b> ${senha}</p>
    </div>
    <a href="${APP_URL}/manu" style="display:block;text-align:center;margin:6px 0 10px;background:#12B5AC;color:#fff;font-weight:900;font-size:16px;padding:16px 28px;border-radius:12px;text-decoration:none">ENTRAR NO APP ▶</a>
    <p style="font-size:14px;color:#3D4A49;line-height:1.6;margin-top:10px">No celular, toque em <b>Compartilhar → Adicionar à Tela de Início</b> e o app fica com ícone.</p>
        <p style="font-size:14px;color:#3D4A49;line-height:1.6;margin-top:14px">Prefere entrar <b>sem senha</b>? Acesse <a href="https://fluencyroute.com.br/acesso" style="color:#0B6E68;font-weight:700">fluencyroute.com.br/acesso</a>, digite este e-mail e você entra na hora.</p>
    <p style="font-size:13px;color:#7a8a88;line-height:1.6;margin-top:10px">Qualquer dificuldade, responde este e-mail que a gente resolve com você.</p>
    <p style="font-size:11px;color:#9aa;margin-top:28px">Fluency Route · você recebeu porque sua compra foi aprovada e o app ainda não foi aberto.</p>
  </div></body></html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const auth = request.headers.get("authorization") || "";
  const key = url.searchParams.get("key") || "";
  const secret = process.env.CRON_SECRET || "";
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const testEmail = (url.searchParams.get("test") || "").toLowerCase().trim();

  // 24/08/2026 DESLIGADO (decisão do Marcos): acesso principal é a área da Kiwify;
  // "nunca logou no app" deixou de ser sinal de problema. Religa com NUDGE_ENABLED=1.
  if (process.env.NUDGE_ENABLED !== "1" && !testEmail) {
    return NextResponse.json({ ok: true, skipped: "nudge desligado 24/08/2026" });
  }

  const SK = process.env.SUPABASE_SERVICE_KEY!;
  const RESEND = process.env.RESEND_API_KEY!;
  const H = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };

  const candRes = await fetch(`${SUPA}/rest/v1/rpc/get_access_nudge_candidates`, {
    method: "POST",
    headers: H,
    body: "{}",
    cache: "no-store",
  });
  if (!candRes.ok) {
    return NextResponse.json({ error: "rpc_failed", status: candRes.status }, { status: 500 });
  }
  const todos: any[] = (await candRes.json()) || [];

  const agora = Date.now();
  const fila = todos.filter((c) => {
    if (testEmail) return c.email === testEmail;
    // 26/11 Marcos ("para de gastar e-mail que nem um louco"): no máximo 2 lembretes (D+1 e D+3), só pra quem comprou há até 10 dias
    if (c.nudges >= 2) return false;
    const dias = (agora - new Date(c.comprou_em).getTime()) / 864e5;
    const gapOk = !c.last_nudge || agora - new Date(c.last_nudge).getTime() > 20 * 3600e3;
    const devido =
      dias <= 10 && ((c.nudges === 0 && dias >= 1) || (c.nudges === 1 && dias >= 3));
    return devido && gapOk;
  }).slice(0, 40);

  const resultados: any[] = [];
  for (const c of fila) {
    try {
      const senha = novaSenha();
      const up = await fetch(`${SUPA}/auth/v1/admin/users/${c.user_id}`, {
        method: "PUT",
        headers: H,
        body: JSON.stringify({ password: senha }),
      });
      if (!up.ok) throw new Error(`senha HTTP ${up.status}`);

      const mail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: c.email,
          subject: ASSUNTOS[Math.min(c.nudges, 2)],
          html: emailHtml(c.nome, c.email, senha, c.nudges),
        }),
      });
      if (!mail.ok) throw new Error(`resend HTTP ${mail.status}`);

      await fetch(`${SUPA}/rest/v1/access_nudges`, {
        method: "POST",
        headers: { ...H, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ email: c.email, count: c.nudges + 1, last_at: new Date().toISOString() }),
      });
      resultados.push({ email: c.email, nudge: c.nudges + 1, ok: true });
    } catch (e: any) {
      resultados.push({ email: c.email, ok: false, erro: e.message });
    }
  }

  return NextResponse.json({
    candidatos_sem_login: todos.length,
    enviados: resultados.filter((r) => r.ok).length,
    falhas: resultados.filter((r) => !r.ok),
    detalhe: resultados,
  });
}
