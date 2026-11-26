// /api/whatsapp-webhook — mensagens recebidas no WhatsApp oficial da Fluency Route (+55 11 95609-1942), 26/11/2026.
// Assinado na WABA 2456850874773318 (subscribed_apps com override_callback_uri). Grava em wa_mensagens,
// identifica comprador pelo telefone e responde (gpt-4.1-mini) dentro da janela de 24 h.
// Comprador: senha nova + link do app + link das aulas completas. O que a IA não resolve fica 'revisar' pro Claude.
import { NextResponse } from "next/server";
import crypto from "node:crypto";

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const PH = process.env.WA_CLOUD_PHONE_ID || "";
const TOKEN = process.env.WA_CLOUD_TOKEN || "";
const KIWIFY = "https://dashboard.kiwify.com.br/course/a9510c15-b1f7-49a5-9004-ecfbe5561311";

function sb() {
  const K = process.env.SUPABASE_SERVICE_KEY!;
  return { apikey: K, Authorization: `Bearer ${K}`, "Content-Type": "application/json" };
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get("hub.mode") === "subscribe" && u.searchParams.get("hub.verify_token") === process.env.WA_VERIFY_TOKEN) {
    return new Response(u.searchParams.get("hub.challenge") || "", { status: 200 });
  }
  return new Response("forbidden", { status: 403 });
}

async function sql<T>(q: string): Promise<T[]> {
  const r = await fetch(`${SUPA}/rest/v1/rpc/admin_select`, { method: "POST", headers: sb(), body: JSON.stringify({ q }) });
  const j = await r.json().catch(() => []);
  return Array.isArray(j) ? j : [];
}

async function acharComprador(tel: string) {
  const fim = tel.replace(/\D/g, "").slice(-8); // últimos 8 dígitos (ignora 55 e o 9 extra)
  if (fim.length < 8) return null;
  const rows = await sql<{ id: string; email: string; nome: string; produtos: string }>(
    `select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name','') nome,
       (select string_agg(distinct o.product, ', ') from orders o where lower(o.customer_email)=lower(u.email) and o.status='paid') produtos
     from auth.users u where right(regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''),'\\D','','g'),8) = '${fim}' limit 1`,
  );
  const r = rows[0];
  return r && r.produtos ? r : null;
}

async function senhaNova(uid: string) {
  const c = "abcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) pass += c[crypto.randomInt(c.length)];
  const up = await fetch(`${SUPA}/auth/v1/admin/users/${uid}`, { method: "PUT", headers: sb(), body: JSON.stringify({ password: pass }) });
  return up.ok ? pass : null;
}

async function redigir(texto: string, comprador: { produtos: string } | null, historico: string) {
  const sys = `Você é o suporte da Fluency Route (curso de inglês) no WhatsApp. Português do Brasil, tom de gente, curto (no máximo 4 frases), sem emoji, sem travessão, sem assinatura.
FATOS:
- O aluno tem DUAS versões: (1) App Friends no celular: app.fluencyroute.com.br/manu (Friends, How I Met Your Mother e Two and a Half Men minuto a minuto, pronúncia com nota, discursos, a Manu no botão Ajuda). Entrar sem senha: fluencyroute.com.br/acesso com o e-mail da compra. (2) Aulas completas: a versão anterior na área de membros da Kiwify, com as aulas que explicam o porquê de cada etapa (login com o e-mail da compra na Kiwify).
- ${comprador ? `Esta pessoa É compradora (${comprador.produtos}). Os dados de acesso e os links vão logo abaixo da sua resposta: não escreva senha nem repita os links.` : "Não achamos compra com este número. Peça o e-mail usado na compra para liberar o acesso."}
REGRAS:
- Reembolso: não negue, não prometa, não discuta. Diga que o pedido é respeitado e peça só que teste o app hoje (minuto 1 de Friends, uns 10 minutos).
- Nunca invente preço, prazo, bônus ou funcionalidade.
- Se a mensagem trouxer um e-mail, diga que vai conferir e que a liberação chega em seguida.`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      messages: [{ role: "system", content: sys }, { role: "user", content: (historico ? `Conversa anterior:\n${historico}\n\n` : "") + `Mensagem nova: ${texto}` }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  return (j?.choices?.[0]?.message?.content || "").trim();
}

async function enviar(to: string, body: string) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${PH}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body, preview_url: true } }),
  });
  return r.ok;
}

export async function POST(req: Request) {
  const ev = await req.json().catch(() => ({}));
  const msgs: { from: string; id: string; text?: { body: string }; type: string; nome?: string }[] = [];
  for (const e of ev.entry || [])
    for (const c of e.changes || []) {
      const v = c.value || {};
      if (v.metadata?.phone_number_id && v.metadata.phone_number_id !== PH) continue;
      const nome = v.contacts?.[0]?.profile?.name;
      for (const m of v.messages || []) msgs.push({ ...m, nome });
    }

  for (const m of msgs) {
    const texto = m.text?.body || (m.type === "audio" ? "[mandou um áudio]" : `[${m.type}]`);
    const ins = await fetch(`${SUPA}/rest/v1/wa_mensagens?on_conflict=wa_id`, {
      method: "POST",
      headers: { ...sb(), Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ wa_id: m.id, tel: m.from, nome: m.nome || null, direcao: "in", texto }),
    });
    const linha = ins.ok ? (await ins.json())[0] : null;
    if (!linha) continue; // duplicado (a Meta reenvia)

    // trava: no máximo 1 resposta automática por número a cada 2 min (evita loop e abuso)
    const recente = await sql<{ n: number }>(
      `select count(*)::int n from wa_mensagens where tel='${m.from.replace(/\D/g, "")}' and direcao='out' and criado_em > now() - interval '2 minutes'`,
    );
    if ((recente[0]?.n || 0) > 0) {
      await fetch(`${SUPA}/rest/v1/wa_mensagens?id=eq.${linha.id}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ status: "revisar" }) });
      continue;
    }

    let comprador = await acharComprador(m.from);
    // a pessoa mandou o e-mail da compra (telefone do checkout era outro): acha por e-mail
    const em = texto.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0]?.toLowerCase().replace(/'/g, "");
    if (!comprador && em) {
      const rows = await sql<{ id: string; email: string; nome: string; produtos: string }>(
        `select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name','') nome,
           (select string_agg(distinct o.product, ', ') from orders o where lower(o.customer_email)=lower(u.email) and o.status='paid') produtos
         from auth.users u where lower(u.email) = '${em}' limit 1`,
      );
      if (rows[0]?.produtos) comprador = rows[0];
    }
    const hist = await sql<{ direcao: string; texto: string }>(
      `select direcao, texto from wa_mensagens where tel='${m.from.replace(/\D/g, "")}' and id < ${Number(linha.id)} order by id desc limit 6`,
    );
    const historico = hist.reverse().map((h) => (h.direcao === "in" ? "Aluno: " : "Suporte: ") + h.texto).join("\n");
    const resp = await redigir(texto, comprador, historico);
    if (!resp) {
      await fetch(`${SUPA}/rest/v1/wa_mensagens?id=eq.${linha.id}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ status: "revisar" }) });
      continue;
    }

    // dados de acesso só na 1ª resposta automática da conversa (não troca senha a cada mensagem)
    let extra = "";
    const jaMandou = hist.some((h) => h.direcao === "out" && /Senha nova:/.test(h.texto));
    if (comprador && !jaMandou) {
      const pass = await senhaNova(comprador.id);
      extra =
        `\n\n*App Friends (celular):* https://fluencyroute.com.br/acesso\nDigite: ${comprador.email}` +
        (pass ? `\nOu entre com e-mail e senha em app.fluencyroute.com.br/manu\nSenha nova: ${pass}` : "") +
        `\n\n*Aulas completas (versão anterior):* ${KIWIFY}`;
    }
    const final = resp + extra;
    const ok = await enviar(m.from, final);
    await fetch(`${SUPA}/rest/v1/wa_mensagens`, {
      method: "POST",
      headers: sb(),
      body: JSON.stringify({ tel: m.from, direcao: "out", texto: final, status: ok ? "enviado" : "falhou" }),
    });
    await fetch(`${SUPA}/rest/v1/wa_mensagens?id=eq.${linha.id}`, {
      method: "PATCH",
      headers: sb(),
      body: JSON.stringify({ status: ok ? (comprador ? "respondido" : "aguardando_email") : "revisar", comprador: !!comprador }),
    });
  }
  return NextResponse.json({ ok: true });
}
