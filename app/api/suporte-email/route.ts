// /api/suporte-email — caixa de SUPORTE da Fluency Route (25/11/2026).
// O Resend recebe tudo que chega em *@acesso.fluencyroute.com.br (MX acesso → receive-sae1.forge.rmta.net)
// e manda o webhook email.received pra cá. Aqui: grava em suporte_emails, vê se o remetente é comprador
// e responde na hora. Comprador ganha senha nova + link do app + resposta ao que escreveu (gpt-4.1-mini).
// Pedido de reembolso NÃO é negado nem prometido: a resposta resolve o acesso e diz que o pedido segue aberto.
// O que a IA não resolve fica com status 'revisar' pro Claude cuidar na sessão.
import { NextResponse } from "next/server";
import crypto from "node:crypto";

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const FROM = "Suporte Fluency Route <contato@acesso.fluencyroute.com.br>";
const APP = "https://app.fluencyroute.com.br/manu";

function sb() {
  const K = process.env.SUPABASE_SERVICE_KEY!;
  return { apikey: K, Authorization: `Bearer ${K}`, "Content-Type": "application/json" };
}

// assinatura svix (Resend webhooks)
function assinaturaOk(body: string, h: Headers) {
  const secret = process.env.RESEND_INBOUND_SECRET;
  if (!secret) return true; // sem segredo configurado: aceita (só grava e responde; não expõe nada)
  const id = h.get("svix-id") || "", ts = h.get("svix-timestamp") || "", sig = h.get("svix-signature") || "";
  if (!id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 600) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const esperado = crypto.createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  return sig.split(" ").some((s) => s.split(",")[1] === esperado);
}

function emailDe(s: string) {
  const m = (s || "").match(/<([^>]+)>/);
  return (m ? m[1] : s || "").trim().toLowerCase();
}

function semCitacao(t: string) {
  // corta o histórico citado ("Em ... escreveu:", "> ...")
  const linhas = (t || "").split(/\r?\n/);
  const out: string[] = [];
  for (const l of linhas) {
    if (/^(Em |On ).{5,120}(escreveu|wrote):?\s*$/i.test(l.trim()) || /^-{2,}\s*(Mensagem|Original)/i.test(l.trim())) break;
    if (l.trim().startsWith(">")) continue;
    out.push(l);
  }
  return out.join("\n").trim().slice(0, 4000);
}

async function comprador(email: string) {
  const r = await fetch(
    `${SUPA}/rest/v1/orders?select=product,created_at&customer_email=ilike.${encodeURIComponent(email)}&status=eq.paid&order=created_at.desc&limit=5`,
    { headers: sb(), cache: "no-store" },
  );
  const j = r.ok ? await r.json() : [];
  return Array.isArray(j) && j.length ? (j as { product: string }[]).map((o) => o.product).join(", ") : null;
}

async function senhaNova(email: string) {
  const r = await fetch(`${SUPA}/rest/v1/rpc/get_user_id_by_email`, { method: "POST", headers: sb(), body: JSON.stringify({ p_email: email }) });
  let uid = r.ok ? await r.json() : null;
  if (Array.isArray(uid)) uid = uid[0]?.id || uid[0];
  if (uid && typeof uid === "object") uid = (uid as { id?: string }).id;
  const c = "abcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) pass += c[crypto.randomInt(c.length)];
  if (uid) {
    const up = await fetch(`${SUPA}/auth/v1/admin/users/${uid}`, { method: "PUT", headers: sb(), body: JSON.stringify({ password: pass }) });
    if (up.ok) return pass;
  } else {
    const cr = await fetch(`${SUPA}/auth/v1/admin/users`, { method: "POST", headers: sb(), body: JSON.stringify({ email, password: pass, email_confirm: true }) });
    if (cr.ok) return pass;
  }
  return null;
}

async function redigir(texto: string, assunto: string, produto: string | null) {
  const sys = `Você responde o e-mail de suporte da Fluency Route (curso de inglês). Português do Brasil, tom humano, caloroso e direto, no máximo 5 frases curtas, sem emoji, sem travessão, sem saudação de abertura (ela já vem) e sem assinatura.
FATOS:
- O produto agora é um APP que funciona no celular: app.fluencyroute.com.br/manu. Friends, How I Met Your Mother e Two and a Half Men minuto a minuto (ouve sem legenda, repete até o som grudar, teste), pronúncia com nota, discursos famosos, e a Manu (professora de IA) no botão Ajuda.
- As aulas antigas na área da Kiwify são a versão anterior; o app é o principal.
- Sem senha: fluencyroute.com.br/acesso, digita o e-mail da compra e entra na hora.
- ${produto ? `Esta pessoa É compradora (${produto}). Uma senha nova vai logo abaixo da sua resposta, não escreva senha.` : "Não achamos compra com o e-mail de onde a pessoa escreveu. Peça o e-mail usado na compra (pode ser outro) para liberarmos."}
REGRAS:
- Reembolso: não negue, não prometa, não discuta. Diga que o pedido dela continua aberto e é respeitado, e peça só que teste o app hoje (minuto 1 de Friends, uns 10 minutos). Se mesmo assim quiser, é só manter o pedido.
- Nunca invente preço, prazo, bônus ou funcionalidade fora dos fatos.
- Se não der pra entender o pedido, pergunte em uma frase o que ela precisa.`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4.1-mini", temperature: 0.4, messages: [{ role: "system", content: sys }, { role: "user", content: `Assunto: ${assunto}\n\n${texto || "(e-mail vazio)"}` }] }),
  });
  const j = await r.json().catch(() => ({}));
  return (j?.choices?.[0]?.message?.content || "").trim();
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!assinaturaOk(body, req.headers)) return NextResponse.json({ error: "assinatura" }, { status: 401 });
  const ev = JSON.parse(body || "{}");
  if (ev.type !== "email.received") return NextResponse.json({ ok: true, ignorado: ev.type });
  const d = ev.data || {};
  const rid: string = d.email_id || d.id || "";
  const de = emailDe(d.from || "");
  const para = Array.isArray(d.to) ? d.to.join(", ") : d.to || "";
  const assunto: string = d.subject || "";

  // conteúdo completo
  let texto = d.text || "";
  let messageId = d.message_id || "";
  if (rid) {
    const r = await fetch(`https://api.resend.com/emails/receiving/${rid}`, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "User-Agent": "fluencyroute-suporte" },
      cache: "no-store",
    });
    if (r.ok) {
      const e = await r.json();
      texto = e.text || (e.html || "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ") || texto;
      messageId = e.message_id || e.headers?.["message-id"] || messageId;
    }
  }
  texto = semCitacao(texto);

  // grava (idempotente por resend_id)
  const ins = await fetch(`${SUPA}/rest/v1/suporte_emails?on_conflict=resend_id`, {
    method: "POST",
    headers: { ...sb(), Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({ resend_id: rid || null, de, para, assunto, texto }),
  });
  const linha = ins.ok ? (await ins.json())[0] : null;
  if (!linha) return NextResponse.json({ ok: true, duplicado: true });

  // não responder robô / nós mesmos / respostas automáticas
  if (!de || /acesso\.fluencyroute\.com\.br$|no-?reply|mailer-daemon|postmaster/i.test(de) || /^(auto|resposta autom|out of office|fora do escrit)/i.test(assunto)) {
    await fetch(`${SUPA}/rest/v1/suporte_emails?id=eq.${linha.id}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ status: "ignorado" }) });
    return NextResponse.json({ ok: true, ignorado: "automatico" });
  }

  const produto = await comprador(de);
  const resposta = await redigir(texto, assunto, produto);
  if (!resposta) {
    await fetch(`${SUPA}/rest/v1/suporte_emails?id=eq.${linha.id}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ comprador: !!produto, produto, status: "revisar", nota: "IA sem resposta" }) });
    return NextResponse.json({ ok: true, revisar: true });
  }
  const pass = produto ? await senhaNova(de) : null;

  const bloco = produto
    ? `<div style="background:#EFFBFA;border:1px solid #BFEDE9;border-radius:12px;padding:16px 18px;margin:16px 0">
<p style="margin:0 0 6px"><b>E-mail:</b> ${esc(de)}</p>
${pass ? `<p style="margin:0"><b>Senha nova:</b> <span style="font-family:monospace;font-size:17px;background:#fff;padding:2px 8px;border-radius:4px">${pass}</span></p>` : ""}
</div>
<p style="text-align:center;margin:20px 0"><a href="${APP}" style="display:inline-block;background:#12B5AC;color:#fff;font-weight:700;padding:15px 28px;border-radius:10px;text-decoration:none">ENTRAR NO APP PELO CELULAR</a></p>
<p>Sem senha: <a href="https://fluencyroute.com.br/acesso">fluencyroute.com.br/acesso</a>, digite este e-mail e você entra na hora.</p>`
    : "";
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;font-size:15px;line-height:1.65">
<p>Oi,</p>
${resposta.split(/\n{2,}|\n/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("\n")}
${bloco}
<p>Qualquer coisa, é só responder este e-mail.</p>
<p>Um abraço,<br>Suporte Fluency Route</p>
</div>`;

  const env = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "User-Agent": "fluencyroute-suporte" },
    body: JSON.stringify({
      from: FROM,
      to: de,
      reply_to: "contato@acesso.fluencyroute.com.br",
      subject: /^re:/i.test(assunto) ? assunto : `Re: ${assunto || "seu acesso"}`,
      html,
      headers: messageId ? { "In-Reply-To": messageId, References: messageId } : undefined,
    }),
  });

  await fetch(`${SUPA}/rest/v1/suporte_emails?id=eq.${linha.id}`, {
    method: "PATCH",
    headers: sb(),
    body: JSON.stringify({
      comprador: !!produto,
      produto,
      resposta,
      respondido_em: env.ok ? new Date().toISOString() : null,
      status: env.ok ? (produto ? "respondido" : "aguardando_email_compra") : "revisar",
      nota: env.ok ? null : `envio ${env.status}`,
    }),
  });
  return NextResponse.json({ ok: true });
}
