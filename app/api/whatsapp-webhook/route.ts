// /api/whatsapp-webhook — WhatsApp oficial da Fluency Route (+55 11 95609-1942).
// v2 26/11/2026 (Marcos: "tem que conhecer o método, saber o que eu falo nas aulas, dar todo suporte, tipo você";
// "fala como se fosse eu"). Base: app/lib/manu-kb.ts (15 aulas transcritas + PDFs + decisões dele).
// - Responde em 1ª pessoa como o Marcos, com o método das aulas (gpt-4.1, saída JSON).
// - Entende ÁUDIO (baixa a mídia da Meta e transcreve). Responde em texto.
// - Comprador: senha nova + links (app Friends e aulas completas) só na 1ª vez da conversa.
// - Trava anti-abuso: até 30 respostas automáticas por número por hora (a de 2 min cortava conversa).
// - O que precisar de gente fica status 'revisar' pro Claude cuidar (select * from wa_mensagens where status='revisar').
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { MANU_KB } from "../../lib/manu-kb";

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

type Comprador = { id: string; email: string; nome: string; produtos: string; ultimo_login: string | null; comprou_em: string };

const SEL = `select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name','') nome,
  to_char(u.last_sign_in_at at time zone 'America/Sao_Paulo','DD/MM') ultimo_login,
  (select string_agg(distinct o.product, ', ') from orders o where lower(o.customer_email)=lower(u.email) and o.status='paid' and o.refunded_at is null) produtos,
  (select to_char(min(o.created_at) at time zone 'America/Sao_Paulo','DD/MM') from orders o where lower(o.customer_email)=lower(u.email) and o.status='paid') comprou_em
  from auth.users u`;

async function porTelefone(tel: string) {
  const fim = tel.replace(/\D/g, "").slice(-8);
  if (fim.length < 8) return null;
  const r = await sql<Comprador>(`${SEL} where right(regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''),'\\D','','g'),8) = '${fim}' limit 1`);
  return r[0]?.produtos ? r[0] : null;
}
async function porEmail(em: string) {
  const r = await sql<Comprador>(`${SEL} where lower(u.email) = '${em.replace(/'/g, "")}' limit 1`);
  return r[0]?.produtos ? r[0] : null;
}

async function senhaNova(uid: string) {
  const c = "abcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) pass += c[crypto.randomInt(c.length)];
  const up = await fetch(`${SUPA}/auth/v1/admin/users/${uid}`, { method: "PUT", headers: sb(), body: JSON.stringify({ password: pass }) });
  return up.ok ? pass : null;
}

// áudio do WhatsApp → texto
async function transcrever(mediaId: string) {
  try {
    const meta = await (await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json();
    if (!meta?.url) return null;
    const bin = await (await fetch(meta.url, { headers: { Authorization: `Bearer ${TOKEN}` } })).arrayBuffer();
    const fd = new FormData();
    fd.append("file", new Blob([bin], { type: meta.mime_type || "audio/ogg" }), "audio.ogg");
    fd.append("model", "gpt-4o-mini-transcribe");
    fd.append("language", "pt");
    const r = await (await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: fd })).json();
    return (r?.text || "").trim() || null;
  } catch {
    return null;
  }
}

function sistema(c: Comprador | null) {
  return `Você é o MARCOS, criador da Fluency Route, respondendo alunos e interessados no seu WhatsApp oficial. Fale em PRIMEIRA PESSOA como o Marcos ("eu fiquei fluente assim", "na aula eu explico"), com o jeito dele das aulas: direto, caloroso, animado, brasileiro, usando as expressões e analogias dele quando couber (violão, letra de música, foguete x tartaruga). Português do Brasil.

COMO ESCREVER NO WHATSAPP:
- Curto: 1 a 4 frases na maioria das vezes. Só se alongue quando a pessoa pedir explicação do método.
- Sem emoji, sem travessão, sem lista longa, sem assinatura, sem "Olá! Como posso ajudar?". Converse.
- Termine, quando fizer sentido, com o PRÓXIMO PASSO concreto (ex.: "faz o minuto 1 de Friends hoje, uns 10 minutos, e me conta quanto entendeu").
- Se perguntarem se você é robô/IA ou se é o Marcos mesmo, NÃO minta: diga que é o atendimento do Marcos, um assistente treinado nas aulas dele, e que o que travar ele vê pessoalmente.

O QUE VOCÊ FAZ:
1. Suporte de acesso (o aluno tem DUAS versões):
   - App Friends (celular): fluencyroute.com.br/acesso, digita o e-mail da compra e entra sem senha. Ou app.fluencyroute.com.br/manu com e-mail e senha. No celular: Compartilhar > Adicionar à Tela de Início. Libera o microfone pro Shadowing.
   - Aulas completas (versão anterior, explicam o porquê de cada etapa): área de membros da Kiwify, login com o e-mail da compra.
2. Professor: tira dúvida do método e de inglês SÓ com base no conhecimento abaixo e no bom senso de professor. Corrige frase em inglês se pedirem. Nunca invente regra do método que não está aqui.
3. Ativação: o objetivo de toda conversa é a pessoa TREINAR hoje. Quem não começou: mande começar pelo minuto 1 de Friends no app. Quem está treinando: elogie e diga o próximo passo (70% troca de trecho; 100% fecha a meta).
4. Reembolso: não negue, não prometa, não discuta, não peça pra cancelar. Diga que o pedido é respeitado e segue normal, e pergunte o que aconteceu pra ajudar. Se for problema de acesso ou de "não sei por onde começar", resolva na hora. Você NÃO processa reembolso e não sabe se a pessoa já pediu: nunca diga "já está encaminhado". Se ela ainda não pediu, explique que o pedido é feito pela Kiwify (no e-mail de confirmação da compra, dentro dos 7 dias de garantia).
5. Interessado que não comprou: responda a dúvida com o método e convide pra conhecer em fluencyroute.com.br/friends. Nunca invente preço, desconto, bônus ou prazo.

QUEM ESTÁ FALANDO:
${c ? `COMPRADOR (${c.produtos}), comprou em ${c.comprou_em}, último login no app: ${c.ultimo_login || "NUNCA ENTROU"}. Os dados de acesso e os 2 links já vão anexados automaticamente na 1ª resposta da conversa quando necessário: não escreva senha.` : "NÃO identificado como comprador por este número. Se a pessoa disser que comprou, peça o e-mail usado na compra (pode ser outro número no checkout)."}

MARQUE "revisar": true quando: a pessoa pedir pra falar com o Marcos pessoalmente/uma pessoa; ameaçar Procon, Reclame Aqui, processo ou chargeback; falar de cobrança errada, pagamento duplicado ou nota fiscal; ou você não tiver base pra responder com segurança. Mesmo marcando, responda algo útil e honesto (ex.: "vou ver isso pessoalmente e te retorno").

Responda SOMENTE em JSON: {"resposta": "texto da mensagem", "revisar": false, "motivo": "curto, só se revisar"}

===== CONHECIMENTO: O MÉTODO NAS PALAVRAS DO MARCOS (aulas transcritas) =====
${MANU_KB}`;
}

async function redigir(texto: string, c: Comprador | null, historico: { role: "user" | "assistant"; content: string }[]) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: sistema(c) }, ...historico, { role: "user", content: texto }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  try {
    const o = JSON.parse(j?.choices?.[0]?.message?.content || "{}");
    return { resposta: String(o.resposta || "").trim(), revisar: !!o.revisar, motivo: String(o.motivo || "") };
  } catch {
    return { resposta: "", revisar: true, motivo: "IA sem resposta" };
  }
}

async function enviar(to: string, body: string) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${PH}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body, preview_url: true } }),
  });
  return r.ok;
}

async function marcar(id: number, campos: Record<string, unknown>) {
  await fetch(`${SUPA}/rest/v1/wa_mensagens?id=eq.${id}`, { method: "PATCH", headers: sb(), body: JSON.stringify(campos) });
}

type Msg = { from: string; id: string; type: string; text?: { body: string }; audio?: { id: string }; voice?: { id: string }; button?: { text: string }; interactive?: { button_reply?: { title: string } }; nome?: string };

export async function POST(req: Request) {
  const ev = await req.json().catch(() => ({}));
  const msgs: Msg[] = [];
  for (const e of ev.entry || [])
    for (const c of e.changes || []) {
      const v = c.value || {};
      if (v.metadata?.phone_number_id && v.metadata.phone_number_id !== PH) continue;
      const nome = v.contacts?.[0]?.profile?.name;
      for (const m of v.messages || []) msgs.push({ ...m, nome });
    }

  for (const m of msgs) {
    const tel = m.from.replace(/\D/g, "");
    let texto = m.text?.body || m.button?.text || m.interactive?.button_reply?.title || "";
    if (!texto && (m.audio?.id || m.voice?.id)) texto = (await transcrever((m.audio?.id || m.voice?.id)!)) || "";
    const ehAudio = !!(m.audio?.id || m.voice?.id);
    if (!texto) texto = ehAudio ? "[mandou um áudio que não deu pra transcrever]" : `[mandou ${m.type}]`;

    const ins = await fetch(`${SUPA}/rest/v1/wa_mensagens?on_conflict=wa_id`, {
      method: "POST",
      headers: { ...sb(), Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ wa_id: m.id, tel, nome: m.nome || null, direcao: "in", texto: (ehAudio ? "[áudio] " : "") + texto }),
    });
    const linha = ins.ok ? (await ins.json())[0] : null;
    if (!linha) continue; // a Meta reenvia: duplicado

    // trava anti-abuso: até 30 respostas automáticas por número por hora
    const n = await sql<{ n: number }>(`select count(*)::int n from wa_mensagens where tel='${tel}' and direcao='out' and criado_em > now() - interval '1 hour'`);
    if ((n[0]?.n || 0) >= 30) {
      await marcar(linha.id, { status: "revisar" });
      continue;
    }

    let comprador = await porTelefone(tel);
    const em = texto.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0]?.toLowerCase();
    if (!comprador && em) comprador = await porEmail(em);

    const hist = await sql<{ direcao: string; texto: string }>(
      `select direcao, texto from wa_mensagens where tel='${tel}' and id < ${Number(linha.id)} order by id desc limit 12`,
    );
    const historico = hist.reverse().map((h) => ({ role: (h.direcao === "in" ? "user" : "assistant") as "user" | "assistant", content: h.texto }));
    const { resposta, revisar, motivo } = await redigir(texto, comprador, historico);
    if (!resposta) {
      await marcar(linha.id, { status: "revisar", comprador: !!comprador });
      continue;
    }

    // dados de acesso: só na 1ª vez da conversa, e só pra comprador que não entrou ou que fala de acesso
    let extra = "";
    const jaMandou = hist.some((h) => h.direcao === "out" && /Senha nova:/.test(h.texto));
    const falaDeAcesso = /acess|entrar|login|senha|app|aplicativo|aula|kiwify|link|n[aã]o consigo/i.test(texto);
    if (comprador && !jaMandou && (falaDeAcesso || !comprador.ultimo_login)) {
      const pass = await senhaNova(comprador.id);
      extra =
        `\n\n*App Friends (celular):* https://fluencyroute.com.br/acesso\nDigite: ${comprador.email}` +
        (pass ? `\nOu entre com e-mail e senha em app.fluencyroute.com.br/manu\nSenha nova: ${pass}` : "") +
        `\n\n*Aulas completas (versão anterior):* ${KIWIFY}`;
    }
    const final = resposta + extra;
    const ok = await enviar(m.from, final);
    await fetch(`${SUPA}/rest/v1/wa_mensagens`, {
      method: "POST",
      headers: sb(),
      body: JSON.stringify({ tel, direcao: "out", texto: final, status: ok ? "enviado" : "falhou" }),
    });
    await marcar(linha.id, {
      status: revisar ? "revisar" : ok ? (comprador ? "respondido" : "respondido_lead") : "revisar",
      comprador: !!comprador,
      ...(revisar ? { texto: (ehAudio ? "[áudio] " : "") + texto + `\n[REVISAR: ${motivo}]` } : {}),
    });
  }
  return NextResponse.json({ ok: true });
}
