// ═══════════════════════════════════════════════════════════════════
//  /api/acesso-magico — ponte de acesso pra plataforma nova.
//  POST {email}: se o e-mail tem compra paga (orders), gera magic link
//  do Supabase e envia por e-mail (Resend). Usado pela página /acesso
//  (linkada no curso antigo/área de membros Kiwify e nos e-mails).
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const APP_URL = process.env.APP_URL || "https://app.fluencyroute.com.br";
const FROM = "Rota da Fluência <contato@acesso.fluencyroute.com.br>";

export async function POST(request: Request) {
  const SK = process.env.SUPABASE_SERVICE_KEY!;
  const RESEND = process.env.RESEND_API_KEY!;
  const H = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };

  let email = "";
  try {
    const body = await request.json();
    email = String(body.email || "").toLowerCase().trim();
  } catch {}
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, motivo: "email_invalido" }, { status: 400 });
  }

  // 1. é comprador? (qualquer pedido pago, sem reembolso)
  const ped = await fetch(
    `${SUPA}/rest/v1/orders?select=id&customer_email=ilike.${encodeURIComponent(email)}&status=eq.paid&limit=1`,
    { headers: H, cache: "no-store" }
  );
  const pedidos = await ped.json().catch(() => []);
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return NextResponse.json({ ok: false, motivo: "compra_nao_encontrada" });
  }

  // 2. gera magic link
  const gl = await fetch(`${SUPA}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ type: "magiclink", email, options: { redirect_to: APP_URL } }),
  });
  const glJson: any = await gl.json().catch(() => null);
  const tokenHash = glJson?.hashed_token || glJson?.properties?.hashed_token;
  if (!gl.ok || !tokenHash) {
    console.error("[acesso-magico] generate_link falhou:", gl.status, JSON.stringify(glJson).slice(0, 200));
    return NextResponse.json({ ok: false, motivo: "erro_link" }, { status: 500 });
  }

  // 2b. 24/08/2026: NÃO usar o action_link do Supabase. O redirect_to só vale se
  //     a URL estiver na allow-list do projeto (não está) e o Supabase manda pra
  //     Site URL, que é o MAESTRO (mesmo projeto). Verificamos o token aqui no
  //     servidor e entregamos a sessão direto pro app, no fragmento (#), que o
  //     app lê e guarda como ic_token/ic_refresh.
  const vr = await fetch(`${SUPA}/auth/v1/verify`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const sess: any = await vr.json().catch(() => null);
  if (!vr.ok || !sess?.access_token) {
    console.error("[acesso-magico] verify falhou:", vr.status, JSON.stringify(sess).slice(0, 200));
    return NextResponse.json({ ok: false, motivo: "erro_link" }, { status: 500 });
  }
  const link = `${APP_URL}/#access_token=${encodeURIComponent(sess.access_token)}&refresh_token=${encodeURIComponent(sess.refresh_token || "")}&via=acesso`;
  // link do e-mail de backup: volta pra /acesso já com o e-mail preenchido e entra sozinho
  const emailLink = `https://fluencyroute.com.br/acesso?email=${encodeURIComponent(email)}&auto=1`;

  // 3. entrada instantânea: devolve o link pro browser redirecionar na hora.
  //    (Backup por e-mail em paralelo, sem bloquear a resposta.)
  const html = `<!doctype html><html><body style="margin:0;background:#FAFAF6;font-family:-apple-system,'Segoe UI',sans-serif;color:#15201E">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px">FLUENCY <span style="color:#12B5AC">ROUTE</span></p>
    <h1 style="font-size:24px;font-weight:900;letter-spacing:-1px;line-height:1.25;margin:18px 0 10px">Seu atalho pro app de treino.</h1>
    <p style="font-size:16px;color:#3D4A49;line-height:1.65">Você acabou de entrar no app de treino (bônus do curso: Manu, Listening e Shadowing). Pra entrar de novo qualquer dia, use o botão abaixo: ele te leva pra entrada sem senha. As aulas do curso continuam na área de membros da Kiwify.</p>
    <a href="${emailLink}" style="display:inline-block;margin:16px 0 8px;background:#0B6E68;color:#fff;font-weight:900;font-size:16px;padding:16px 28px;border-radius:12px;text-decoration:none">ENTRAR NO APP DE TREINO</a>
  </div></body></html>`;
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: email, subject: "Seu atalho pro app de treino (bônus)", html }),
  }).catch(() => {});

  return NextResponse.json({ ok: true, link });
}
