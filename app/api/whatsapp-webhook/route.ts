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

// espera de 8 s da rajada + leitura de print + resposta do gpt-4.1: folga pra não cortar no meio
export const maxDuration = 60;

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

// ───────── MANUELA · coach do Fluency Fast-Track (upsell do espanhol, 26/11) ─────────
// O aluno chega pelo botão da /spanish-coach.html com "Código: FT-xxxxxxxx" (8 primeiros caracteres do token).
// O robô liga o número à linha de spanish_coach e, dali pra frente, quem responde esse número é a Manuela.
// 26/11 tarde: a Manuela atende TODO comprador do espanhol (Netflix Trick). fastTrack = comprou o upsell (avalia e dá nota).
type Coach = { email: string; phone: string | null; data: Record<string, any>; fastTrack: boolean; token: string | null };
async function montaAluno(email: string, tel: string): Promise<Coach | null> {
  const em = encodeURIComponent(email);
  const a = await (await fetch(`${SUPA}/rest/v1/spanish_access?select=token&email=eq.${em}&limit=1`, { headers: sb() })).json().catch(() => []);
  const c = await (await fetch(`${SUPA}/rest/v1/spanish_coach?select=data,phone,plano&email=eq.${em}&limit=1`, { headers: sb() })).json().catch(() => []);
  const ft = Array.isArray(c) && !!c[0] && c[0].plano !== "lite"; // Lite (downsell) não tem a Manuela coach
  if (ft && c[0].phone !== tel) await fetch(`${SUPA}/rest/v1/spanish_coach?email=eq.${em}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ phone: tel }) });
  return { email, phone: tel, data: ft ? c[0].data || {} : {}, fastTrack: ft, token: Array.isArray(a) && a[0] ? a[0].token : null };
}
async function coachPorTelefone(tel: string): Promise<Coach | null> {
  const c = await (await fetch(`${SUPA}/rest/v1/spanish_coach?select=email&phone=eq.${tel}&limit=1`, { headers: sb() })).json().catch(() => []);
  if (Array.isArray(c) && c[0]) return montaAluno(String(c[0].email).toLowerCase(), tel);
  const a = await (await fetch(`${SUPA}/rest/v1/spanish_access?select=email&phone=eq.${tel}&limit=1`, { headers: sb() })).json().catch(() => []);
  return Array.isArray(a) && a[0] ? montaAluno(String(a[0].email).toLowerCase(), tel) : null;
}
async function coachPorCodigo(texto: string, tel: string): Promise<Coach | null> {
  const cod = texto.match(/FT-([a-f0-9]{8})/i)?.[1]?.toLowerCase();
  if (!cod) return null;
  const a = await (await fetch(`${SUPA}/rest/v1/spanish_access?select=email&token=like.${cod}*&limit=2`, { headers: sb() })).json().catch(() => []);
  if (!Array.isArray(a) || a.length !== 1) return null;
  const email = String(a[0].email).toLowerCase();
  await fetch(`${SUPA}/rest/v1/spanish_access?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ phone: tel }) });
  return montaAluno(email, tel);
}
function contextoCoach(c: Coach) {
  const d = c.data || {}, o = d.onb || {};
  const ini = d.inicio ? new Date(d.inicio + "T12:00:00") : null;
  const dia = ini ? Math.max(1, Math.min(90, Math.floor((Date.now() - ini.getTime()) / 864e5) + 1)) : null;
  const nivel: Record<string, string> = { zero: "começando do zero", basico: "sabe algumas palavras, não acompanha conversa", medio: "entende um pouco mas trava pra falar" };
  const meta: Record<string, string> = { viagem: "viajar", trabalho: "trabalho", familia: "família e amigos", series: "ver séries sem legenda" };
  const ck = d.checks || {}, sems = Object.keys(ck).filter((s) => ck[s]?.m).sort((a, b) => +a - +b);
  const notas = sems.map((s) => `semana ${s}: ${ck[s].m}/100`).join(", ");
  const fracas: string[] = [];
  for (const s of sems.slice(-2)) for (const k of Object.keys(ck[s].s || {})) for (const w of ck[s].s[k].w || []) if (w[1] < 60 && !fracas.includes(w[0])) fracas.push(w[0]);
  const aval = (d.manuela || []).slice(-3).map((a: any) => `${a.data}: ${a.nota}/10 (${a.obs})`).join(" | ");
  const dias = Object.keys(d.feitos || {}).length;
  return `Nível declarado: ${nivel[o.nivel] || "não informado"}. Objetivo: ${meta[o.meta] || "não informado"}. Tempo por dia: ${o.min || "?"} min.
Plano de 90 dias: ${dia ? "dia " + dia : "ainda não começou (mande ele abrir a página do plano)"}; dias marcados como feitos: ${dias}.
Accent Check (nota de pronúncia da IA): ${notas || "ainda não fez"}${fracas.length ? `; palavras que ele erra: ${fracas.slice(0, 8).join(", ")}` : ""}.
Suas últimas avaliações dele: ${aval || "nenhuma ainda"}.`;
}
function sistemaCoach(c: Coach, nome?: string) {
  const link = c.token ? `https://fluencyroute.com.br/spanish-app.html?k=${c.token}` : "https://fluencyroute.com.br/spanish-app.html";
  const comum = `You are MANUELA, the Spanish guide of Fluency Route, chatting on WhatsApp with someone who just bought Essential Spanish Fluency (the "Netflix trick" to learn Spanish with real series scenes). The student is an English speaker learning Mexican Spanish.

YOUR MISSION: make every student feel like royalty. They made a great decision and you are genuinely happy they are here. Warm, upbeat, personal, never salesy. Use their first name when you know it. A happy, supported student never wants a refund.

HOW YOU TALK:
- Like a warm human on WhatsApp. Short messages (1 to 4 lines). No lists, no lectures, one emoji now and then at most.
- Their WhatsApp name is: ${nome ? nome : "unknown"}. Call them by their first name only if it looks like a real name. The "FT-" code in their first message is just a link code: never repeat it and never use it as a name.
- Reply in the language they write in. Spanish sprinkles only when the mood is light and they are enjoying it; in complaints, doubts, access or refund talk, use only their language.
- Answer what they said first. Never push.
- When the mood is light, sprinkle easy Spanish with the translation, adjusted to their level, and invite them to answer in Spanish when the moment is right ("¿Cómo estás hoy? (How are you today?)").
- If they write or speak Spanish, celebrate it and gently correct one thing at most ("¡Casi! Se dice: ...").
- Voice messages arrive transcribed: praise them for speaking out loud.
- If they ask whether you are a real person or an AI, do NOT lie: you are Fluency Route's A.I. guide, trained on the method, and the team reads the conversations.

ACCESS HELP: their personal app link is ${link} (it logs them in with their progress). Give it whenever they can't find the app or the email. Best on the phone, with headphones. The first step is Phase 1: one real scene, no subtitles, 3 times.

REFUNDS OR "IT'S NOT FOR ME": never argue, never deny, never promise. FIRST reply: only acknowledge kindly, ask what happened and offer to help with the real problem (access, not knowing where to start, too hard, no time). Do NOT explain the refund path yet. Only if they insist after that, tell them the request is made through Hotmart (the purchase email has the link) within the 7-day guarantee, and set "revisar": true. Billing, double charge, chargeback threats, anything you are unsure about: answer kindly and set "revisar": true.`;
  if (!c.fastTrack) {
    return `${comum}

This student has the app (not the Fast-Track mentorship). Do not offer or mention paid upgrades.

Answer ONLY with JSON: {"resposta": "message text", "avaliacao": null, "revisar": false, "motivo": "short, only if revisar"}`;
  }
  return `${comum}

THIS STUDENT ALSO BOUGHT THE FAST-TRACK MENTORSHIP: you are their personal coach. Make them SPEAK, test and measure their Spanish, keep them motivated.
- Every reply: react like a person, correct one or two mistakes gently, and end with a short question in Spanish that makes them answer in Spanish.
- Connect to their 90-day plan when useful (today's mission, their Accent Check words, the app scenes). Their plan page: https://fluencyroute.com.br/spanish-coach.html${c.token ? `?k=${c.token}` : ""}
- MEASURING: about every 6 to 8 of their messages in Spanish, or whenever they ask "how am I doing", give a quick evaluation in the reply (score 0 to 10, one strength, one thing to fix) and fill "avaliacao". Otherwise "avaliacao" is null.

WHAT YOU KNOW ABOUT THEM:
${contextoCoach(c)}

Answer ONLY with JSON: {"resposta": "message text", "avaliacao": null or {"nota": 0-10, "obs": "max 12 words in Portuguese, for the team"}, "revisar": false, "motivo": "short, only if revisar"}`;
}
async function redigirCoach(texto: string, c: Coach, historico: { role: "user" | "assistant"; content: string }[], nome?: string) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4.1", temperature: 0.6, response_format: { type: "json_object" }, messages: [{ role: "system", content: sistemaCoach(c, nome) }, ...historico, { role: "user", content: texto }] }),
  });
  const j = await r.json().catch(() => ({}));
  try {
    const o = JSON.parse(j?.choices?.[0]?.message?.content || "{}");
    return { resposta: String(o.resposta || "").trim(), avaliacao: o.avaliacao && typeof o.avaliacao.nota === "number" ? o.avaliacao : null, revisar: !!o.revisar, motivo: String(o.motivo || "") };
  } catch {
    return { resposta: "", avaliacao: null, revisar: true, motivo: "IA sem resposta (coach)" };
  }
}
async function guardaAvaliacao(c: Coach, av: { nota: number; obs: string }) {
  const d = c.data || {};
  const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  d.manuela = [...(d.manuela || []), { data: hoje, nota: Math.max(0, Math.min(10, Math.round(av.nota))), obs: String(av.obs || "").slice(0, 120) }].slice(-30);
  await fetch(`${SUPA}/rest/v1/spanish_coach?email=eq.${encodeURIComponent(c.email)}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ data: d, updated_at: new Date().toISOString() }) });
}

// áudio do WhatsApp → texto
// 27/11: o bot respondia "vi o print" sem ver nada (inventou um aviso de microfone). Agora ele LÊ o print:
// baixa a imagem da Meta e o gpt-4.1 descreve o que aparece na tela (texto, erro, botões). A descrição vira a mensagem.
async function lerImagem(mediaId: string, legenda = "") {
  try {
    const meta = await (await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json();
    if (!meta?.url) return null;
    const bin = Buffer.from(await (await fetch(meta.url, { headers: { Authorization: `Bearer ${TOKEN}` } })).arrayBuffer());
    const url = `data:${meta.mime_type || "image/jpeg"};base64,${bin.toString("base64")}`;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4.1", max_tokens: 400, messages: [{ role: "user", content: [
        { type: "text", text: "Um aluno mandou este print no suporte. Descreva objetivamente o que aparece: qual app/site/tela, todo texto visível (principalmente mensagens de erro, avisos e botões), e se parece travado, em branco ou carregando. Não invente o que não dá pra ler. Português." },
        { type: "image_url", image_url: { url } },
      ] }] }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.choices?.[0]?.message?.content?.trim();
    return d ? `[print] ${legenda ? "legenda: " + legenda + " · " : ""}O que aparece na imagem: ${d}` : null;
  } catch {
    return null;
  }
}

async function transcrever(mediaId: string, lang = "pt") {
  try {
    const meta = await (await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json();
    if (!meta?.url) return null;
    const bin = await (await fetch(meta.url, { headers: { Authorization: `Bearer ${TOKEN}` } })).arrayBuffer();
    const fd = new FormData();
    fd.append("file", new Blob([bin], { type: meta.mime_type || "audio/ogg" }), "audio.ogg");
    fd.append("model", "gpt-4o-mini-transcribe");
    if (lang) fd.append("language", lang); // aluno do espanhol: idioma detectado sozinho (fala inglês e espanhol)
    const r = await (await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: fd })).json();
    return (r?.text || "").trim() || null;
  } catch {
    return null;
  }
}

function sistema(c: Comprador | null) {
  return `Você é o MARCOS, criador da Fluency Route, respondendo alunos e interessados no WhatsApp oficial. Fale em PRIMEIRA PESSOA como o Marcos, de forma simples e humana. O jeito e as analogias das aulas (violão, letra de música) só aparecem quando a conversa for sobre o método. Português do Brasil; se a pessoa escrever em inglês ou espanhol, responda nesse idioma.

COMO ESCREVER NO WHATSAPP (o mais importante: ser uma PESSOA NORMAL conversando, não um robô de vendas nem um coach):
- Responda ao que a pessoa disse, no mesmo tamanho e tom. "oi" se responde com "Oi, tudo bem? Em que posso te ajudar?" e só. Nunca chegue empurrando treino, app, meta ou próximo passo sem a pessoa ter perguntado.
- Não presuma nada: não presuma que é aluno, que tem problema, que não começou. Pergunte quando precisar saber.
- Curto: 1 a 3 frases quase sempre. Só se alongue quando a pessoa pedir explicação.
- Sem emoji, sem travessão, sem lista, sem assinatura, sem frases de efeito, sem "bora". Natural, educado, simpático, como alguém que atende bem pelo WhatsApp.
- Conselho de treino e próximo passo SÓ quando a pessoa pedir ajuda com o estudo ou contar como está indo.
- Se perguntarem se você é robô/IA ou se é o Marcos mesmo, NÃO minta: diga que é o atendimento do Marcos, um assistente treinado nas aulas dele, e que o que travar ele vê pessoalmente.

O QUE VOCÊ FAZ:
1. Suporte de acesso (o aluno tem DUAS versões):
   - App Friends (celular): fluencyroute.com.br/acesso, digita o e-mail da compra e entra sem senha. Ou app.fluencyroute.com.br/manu com e-mail e senha. No celular: Compartilhar > Adicionar à Tela de Início. Libera o microfone pro Shadowing.
   - Aulas completas (versão anterior, explicam o porquê de cada etapa): área de membros da Kiwify, login com o e-mail da compra.
   - Essential Musics (bônus; dentro do app aparece como "Inglês Cantado"): os blocos essenciais do inglês em música. Fica no MESMO app, no card BÔNUS da tela inicial, ou direto em app.fluencyroute.com.br/?cantado=1 com o mesmo login.
   - Acesso Vitalício: é o mesmo app, só que sem prazo de validade. Não tem outro login.
   - Não consegue entrar: pergunte qual e-mail usou NA COMPRA (pode ser diferente do e-mail do dia a dia), peça pra abrir fluencyroute.com.br/acesso no Chrome ou Safari (não dentro do Instagram nem do app de e-mail) e digitar esse e-mail. Se disser que não tem compra nesse e-mail, peça outro e-mail possível; se ainda assim não achar, marque revisar.
   - "Não abre"/"não consigo acessar" de COMPRADOR: o sistema já anexa no fim da sua resposta um link de 1 toque que entra direto na conta. Diga pra tocar nele (no iPhone, abrir no Safari; no Android, no Chrome se abrir estranho dentro do WhatsApp) e pergunte o que aparece. Nunca encerre sem a pessoa confirmar que entrou.
   - PRINTS: você só sabe o que está na imagem pelo texto "[print] O que aparece na imagem: ...". Responda com base nisso. Se vier "[mandou uma imagem que não deu pra abrir" ou "[mandou image]", NUNCA diga que viu: peça pra pessoa contar o que aparece na tela.
   OUTROS PRODUTOS (compra pela Hotmart; responda no idioma em que a pessoa escrever):
   - Espanhol (Essential Spanish Fluency / Netflix Trick, pra quem fala inglês): app em fluencyroute.com.br/spanish-app.html; o link pessoal chega no e-mail da Hotmart "Your Essential Spanish Fluency app is ready". Sem conta, o progresso fica salvo só naquele aparelho; pra não perder, usar "Save my progress" dentro do app.
   - Ruta de la Fluidez (inglês pra quem fala espanhol): app em ruta-fluency-es.vercel.app/manu?lang=es com os dados do e-mail "Tu acceso llegó", e a aula "EMPIEZA AQUÍ" na área de membros da Hotmart. Esqueceu a senha ou não achou o e-mail: marque revisar.
   - Mentoria/coaching: não informe preço nem detalhes; diga que vai confirmar e marque revisar.
   - Se nada resolver, o e-mail de suporte é contato@acesso.fluencyroute.com.br.
2. Professor: tira dúvida do método e de inglês SÓ com base no conhecimento abaixo e no bom senso de professor. Corrige frase em inglês se pedirem. Nunca invente regra do método que não está aqui.
2b. COMPRADOR FRUSTRADO OU PERDIDO ("difícil", "cansativo", "não entendi como usa", "Anki", "não sei por onde começo"): isso vira reembolso se ficar no ar. NÃO pergunte "quer que eu te mostre?": já mostre. Dê o próximo passo concreto de hoje (abrir o app → "Treinar o minuto 1" → ouvir sem legenda e marcar quanto entendeu → repetir com legenda até colar → testar sem legenda; uns 10 minutos), diga que o Anki NÃO é necessário (o app já faz a repetição espaçada) e termine pedindo pra contar o resultado. Nunca diga que um conteúdo não existe no app se a pessoa diz que está vendo.
3. Quando a pessoa pedir orientação de estudo ("por onde começo", "como treino", "tô travado"): aí sim oriente pelo método (começa pelo minuto 1 de Friends no app; 70% troca de trecho; 100% fecha a meta).
4. Reembolso: não negue, não prometa, não discuta, não peça pra cancelar. Diga que o pedido é respeitado e segue normal, e pergunte o que aconteceu pra ajudar. Se for problema de acesso ou de "não sei por onde começar", resolva na hora. Você NÃO processa reembolso e não sabe se a pessoa já pediu: nunca diga "já está encaminhado". Se ela ainda não pediu, explique que o pedido é feito pela plataforma onde comprou (Kiwify: no e-mail de confirmação da compra; Hotmart: pela própria Hotmart), dentro dos 7 dias de garantia.
${ofertaAtual()}5. Interessado que não comprou: responda a dúvida dele. Só mencione fluencyroute.com.br/friends se ele perguntar como comprar ou conhecer o curso. Nunca invente preço, desconto, bônus ou prazo.

QUEM ESTÁ FALANDO:
${c ? `COMPRADOR (${c.produtos}), comprou em ${c.comprou_em}, último login no app: ${c.ultimo_login || "NUNCA ENTROU"}. Os dados de acesso e os 2 links já vão anexados automaticamente na 1ª resposta da conversa quando necessário: não escreva senha.` : "NÃO identificado como comprador por este número. Se a pessoa disser que comprou, peça o e-mail usado na compra (pode ser outro número no checkout)."}

MARQUE "revisar": true quando: a pessoa pedir pra falar com o Marcos pessoalmente/uma pessoa; ameaçar Procon, Reclame Aqui, processo ou chargeback; falar de cobrança errada, pagamento duplicado ou nota fiscal; ou você não tiver base pra responder com segurança. Mesmo marcando, responda algo útil e honesto (ex.: "vou ver isso pessoalmente e te retorno").

Responda SOMENTE em JSON: {"resposta": "texto da mensagem", "revisar": false, "motivo": "curto, só se revisar"}

===== CONHECIMENTO: O MÉTODO NAS PALAVRAS DO MARCOS (aulas transcritas) =====
${MANU_KB}`;
}

// 27/11: o bot disse a um lead que "não teve Black Friday", com o banner no ar. O preço vigente agora entra no prompt.
// Black Friday da /friends: até 27/11 23:59 (Brasília). Depois disso volta ao preço normal (mesmo checkout DlmRal3).
function ofertaAtual() {
  const bf = Date.now() < Date.parse("2026-11-28T02:59:59Z");
  return bf
    ? "4b. OFERTA VIGENTE (use quando perguntarem preço/promoção/Black Friday ou reclamarem de valor/juros): BLACK FRIDAY no ar HOJE até 23:59 (Brasília) em fluencyroute.com.br/friends (assistir até a oferta abrir). De R$497 por R$289 no Pix (sem juros, o menor valor) ou 12x de R$29 no cartão (o cartão tem juros da plataforma). Garantia de 7 dias. Se a pessoa reclamar dos juros do cartão, mostre que no Pix não tem juros. Não invente outro desconto.\n"
    : "4b. OFERTA VIGENTE: em fluencyroute.com.br/friends, R$29/mês em 12x no cartão (com juros da plataforma) ou R$289 no Pix (sem juros). Garantia de 7 dias. A Black Friday já acabou (foi até 27/11). Não invente desconto.\n";
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

// ── RITMO HUMANO (27/11, Marcos: "tem que ter o tempo de leitura e o tempo de digitação") ──
// 1) LEITURA: espera proporcional ao que a pessoa escreveu (~4 letras por 100 ms, de 1,5 a 7 s), aí marca como LIDA (✓✓ azul)
//    e liga o "digitando…". O gpt já vai escrevendo a resposta em paralelo durante esse tempo.
// 2) DIGITAÇÃO: "digitando…" por um tempo proporcional à resposta (~45 ms por letra, de 2,5 a 16 s), descontando o que já passou.
// Tudo cabe no maxDuration (8 s da rajada + leitura + digitação < 60 s). O "digitando…" da Meta dura até 25 s ou até a mensagem sair.
const dorme = (ms: number) => new Promise((r) => setTimeout(r, ms));
const entre = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
async function lidaEDigitando(msgId: string) {
  await fetch(`https://graph.facebook.com/v21.0/${PH}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: msgId, typing_indicator: { type: "text" } }),
  }).catch(() => {});
}
function comecaLeitura(msgId: string, textoLido: string) {
  // print vem descrito pelo gpt (texto longo): conta como uma olhada de ~4 s, não como leitura de parágrafo
  const n = textoLido.replace(/\[print\][^\n]*/g, "x".repeat(160)).length;
  const tLeitura = entre(n * 25, 1500, 7000);
  return (async () => { await dorme(tLeitura); await lidaEDigitando(msgId); return Date.now(); })();
}
async function pausaHumana(lido: Promise<number>, resposta: string) {
  const inicioDigitando = await lido;
  const tDigitacao = entre(resposta.length * 45, 2500, 16000);
  const falta = inicioDigitando + tDigitacao - Date.now();
  if (falta > 0) await dorme(falta);
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
  if (campos.status === "revisar") await avisaRevisar(id).catch(() => {});
}

// 27/11 (Marcos: "deixa a parada redonda, resolvendo tudo"): o que o bot não resolve sozinho (status 'revisar':
// reembolso, erro da OpenAI, caso que precisa de gente) chega na hora por e-mail, com a conversa, em vez de ficar parado no banco.
async function avisaRevisar(id: number) {
  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return;
  const l = (await sql<{ tel: string; nome: string | null; texto: string }>(`select tel, nome, texto from wa_mensagens where id = ${Number(id)}`))[0];
  if (!l) return;
  const hist = await sql<{ direcao: string; texto: string }>(`select direcao, texto from wa_mensagens where tel='${l.tel.replace(/\D/g, "")}' order by id desc limit 8`);
  const esc = (t: string) => String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  const conversa = hist.reverse().map((h) => `<p style="margin:6px 0"><b>${h.direcao === "in" ? "Cliente" : "Bot"}:</b> ${esc(h.texto).slice(0, 700)}</p>`).join("");
  const reembolso = /reembols|cancel|devolu|estorno|refund|chargeback/i.test(l.texto);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Rota da Fluência <contato@acesso.fluencyroute.com.br>",
      to: "marcoslobao1991@gmail.com",
      subject: `${reembolso ? "🔴 REEMBOLSO" : "🟡 Revisar"} WhatsApp · ${l.nome || l.tel} · ${l.texto.replace(/\s+/g, " ").slice(0, 60)}`,
      html: `<p>O bot do WhatsApp oficial precisa de você nessa conversa.</p><p><b>${esc(l.nome || "")}</b> · <a href="https://wa.me/${l.tel}">wa.me/${l.tel}</a></p>${conversa}<p style="color:#888;font-size:12px">Pedido de Claude: "olha as conversas em revisar" que eu pego daqui.</p>`,
    }),
  });
}

type Msg = { from: string; id: string; type: string; text?: { body: string }; audio?: { id: string }; voice?: { id: string }; image?: { id: string; caption?: string }; document?: { id: string; caption?: string; mime_type?: string }; button?: { text: string }; interactive?: { button_reply?: { title: string } }; nome?: string };

// 27/11/2026: a Meta bloqueou os envios (cartão do WhatsApp com erro, 141006) e ninguém viu por um dia: o envio
// devolvia id "ok" e a falha só chegava depois, aqui no webhook (statuses[].status = "failed"), e era ignorada.
// Agora cada falha vira linha em wa_mensagens (status 'falhou_meta') e manda 1 e-mail pro Marcos por hora no máximo.
// 27/11: a Meta recusou o acesso de 2 compradores (131026: número não recebe WhatsApp). Se a mensagem que caiu era pra
// um COMPRADOR, o acesso vai por e-mail na hora (link de 1 toque + senha nova), 1 vez por número a cada 24 h.
async function acessoPorEmail(tel: string) {
  const KEY = process.env.RESEND_API_KEY;
  if (!KEY || tel.length < 8) return;
  const c = await porTelefone(tel);
  if (!c) return;
  const ja = await sql<{ n: number }>(`select count(*)::int n from wa_mensagens where tel='${tel}' and status='email_acesso' and criado_em > now() - interval '24 hours'`);
  if (ja[0]?.n) return;
  const pass = await senhaNova(c.id);
  const nm = (c.nome || "").trim().split(/\s+/)[0];
  const n = nm ? nm.charAt(0).toUpperCase() + nm.slice(1).toLowerCase() : "";
  const link = `https://fluencyroute.com.br/acesso?email=${encodeURIComponent(c.email)}&auto=1`;
  const p = (t: string) => `<p style="font-size:15px;color:#3D4A49;line-height:1.65">${t}</p>`;
  const html = `<!doctype html><html><body style="margin:0;background:#FAFAF6;font-family:-apple-system,'Segoe UI',sans-serif;color:#15201E"><div style="max-width:480px;margin:0 auto;padding:32px 24px">
<p style="font-weight:900;letter-spacing:3px;font-size:12px">FLUENCY <span style="color:#12B5AC">ROUTE</span></p>
<h1 style="font-size:24px;font-weight:900;letter-spacing:-1px;line-height:1.25;margin:18px 0 10px">${n ? n + ", seu" : "Seu"} acesso está liberado</h1>
${p("Tentamos te mandar o acesso pelo WhatsApp, mas a mensagem não chegou no seu número. Então aqui vai tudo por e-mail.")}
<p style="margin:26px 0"><a href="${link}" style="display:block;text-align:center;background:#0B6E68;color:#fff;font-weight:900;font-size:16px;padding:17px 20px;border-radius:12px;text-decoration:none">ENTRAR NO APP AGORA</a></p>
${p("O botão já entra direto na sua conta, sem digitar nada. Funciona no navegador do celular, não precisa baixar na loja.")}
${pass ? `<div style="background:#fff;border:1px solid #DCE5E3;border-radius:12px;padding:16px 18px;margin:22px 0"><p style="margin:0 0 8px;font-size:14px;font-weight:800">Se alguma tela pedir e-mail e senha:</p><p style="margin:0;font-size:15px;line-height:1.8">E-mail: <b>${c.email}</b><br>Senha: <b style="font-family:monospace;font-size:17px">${pass}</b></p></div>` : ""}
${p('<b>Pra começar hoje (10 minutos):</b> toque em "Treinar o minuto 1", ouça a cena sem legenda, repita com legenda até o som colar e teste sem legenda de novo.')}
${p("As aulas completas ficam na área de membros da Kiwify, com o mesmo e-mail da compra.")}
${p("Travou em qualquer coisa? É só responder este e-mail.")}
${p("Um abraço,<br>Marcos · Fluency Route")}</div></body></html>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Marcos · Fluency Route <contato@acesso.fluencyroute.com.br>", reply_to: "contato@acesso.fluencyroute.com.br", to: c.email, subject: `${n ? n + ", seu" : "Seu"} acesso à Fluency Route está liberado`, html }),
  });
  await fetch(`${SUPA}/rest/v1/wa_mensagens`, { method: "POST", headers: sb(), body: JSON.stringify({ tel, direcao: "out", status: "email_acesso", texto: `[acesso por e-mail: WhatsApp recusado] ${r.ok ? "enviado" : "FALHOU"}` }) });
}

type Falha = { id: string; recipient_id?: string; errors?: { code?: number; title?: string; message?: string; error_data?: { details?: string } }[] };
async function avisaFalhas(fs: Falha[]) {
  for (const s of fs) {
    const er = s.errors?.[0] || {};
    await fetch(`${SUPA}/rest/v1/wa_mensagens?on_conflict=wa_id`, {
      method: "POST",
      headers: { ...sb(), Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({ wa_id: `falha-${s.id}`, tel: (s.recipient_id || "").replace(/\D/g, ""), direcao: "out", status: "falhou_meta",
        texto: `[FALHA META ${er.code ?? "?"}] ${er.title || ""} ${er.error_data?.details || er.message || ""}`.trim().slice(0, 500) }),
    });
    await acessoPorEmail((s.recipient_id || "").replace(/\D/g, "")).catch((e) => console.error("[WA] acesso por e-mail:", e?.message));
  }
  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return;
  const rec = await sql<{ n: number }>(`select count(*)::int n from wa_mensagens where status='falhou_meta' and criado_em > now() - interval '1 hour'`);
  if ((rec[0]?.n || 0) > fs.length) return; // já avisou nesta hora
  const er = fs[0].errors?.[0] || {};
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Rota da Fluência <contato@acesso.fluencyroute.com.br>",
      to: "marcoslobao1991@gmail.com",
      subject: `⚠️ WhatsApp oficial: a Meta recusou ${fs.length} mensagem(ns) (erro ${er.code ?? "?"})`,
      html: `<p>A Meta recusou mensagens do WhatsApp oficial da Fluency Route (+55 11 95609-1942).</p><p><b>Erro ${er.code ?? "?"}:</b> ${er.title || ""}<br>${er.error_data?.details || er.message || ""}</p><p>Se for <b>131042</b> ou <b>141006</b>: é a forma de pagamento do WhatsApp (WhatsApp Manager → Configurações de pagamento), separada da conta de anúncios.</p><p>Lista: <code>select * from wa_mensagens where status='falhou_meta' order by id desc</code>. Este aviso sai no máximo 1 vez por hora.</p>`,
    }),
  });
}

export async function POST(req: Request) {
  const ev = await req.json().catch(() => ({}));
  const msgs: Msg[] = [];
  const falhas: Falha[] = [];
  for (const e of ev.entry || [])
    for (const c of e.changes || []) {
      const v = c.value || {};
      if (v.metadata?.phone_number_id && v.metadata.phone_number_id !== PH) continue;
      const nome = v.contacts?.[0]?.profile?.name;
      for (const m of v.messages || []) msgs.push({ ...m, nome });
      for (const s of v.statuses || []) if (s.status === "failed") falhas.push(s);
    }
  if (falhas.length) await avisaFalhas(falhas).catch((e) => console.error("[WA] aviso de falha:", e?.message));

  for (const m of msgs) {
    const tel = m.from.replace(/\D/g, "");
    let texto = m.text?.body || m.button?.text || m.interactive?.button_reply?.title || "";
    // aluno do Fast-Track: número já ligado, ou chegando agora com o código FT- (a Manuela ouve áudio em espanhol)
    let coach = await coachPorTelefone(tel);
    if (!coach && texto) coach = await coachPorCodigo(texto, tel);
    if (!texto && m.image?.id) texto = (await lerImagem(m.image.id, m.image.caption || "")) || "[mandou uma imagem que não deu pra abrir: peça pra descrever o que aparece na tela]";
    if (!texto && m.document?.id && /image/.test(m.document.mime_type || "")) texto = (await lerImagem(m.document.id, m.document.caption || "")) || "";
    if (!texto && (m.audio?.id || m.voice?.id)) texto = (await transcrever((m.audio?.id || m.voice?.id)!, coach ? "" : "pt")) || "";
    const ehAudio = !!(m.audio?.id || m.voice?.id);
    if (!texto) texto = ehAudio ? "[mandou um áudio que não deu pra transcrever]" : `[mandou ${m.type}]`;

    const ins = await fetch(`${SUPA}/rest/v1/wa_mensagens?on_conflict=wa_id`, {
      method: "POST",
      headers: { ...sb(), Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ wa_id: m.id, tel, nome: m.nome || null, direcao: "in", texto: (ehAudio ? "[áudio] " : "") + texto }),
    });
    const linha = ins.ok ? (await ins.json())[0] : null;
    if (!linha) continue; // a Meta reenvia: duplicado

    // 27/11: a cliente mandou 3 prints + 1 texto em sequência e o bot respondeu 4 vezes, se contradizendo.
    // Agora espera uns segundos: se chegou outra mensagem do mesmo número depois desta, só a ÚLTIMA responde
    // (e ela enxerga as anteriores no histórico). Uma resposta por rajada.
    await new Promise((r) => setTimeout(r, 8000));
    const ult = await sql<{ m: number }>(`select max(id)::int m from wa_mensagens where tel='${tel}' and direcao='in'`);
    if ((ult[0]?.m || 0) > Number(linha.id)) {
      await marcar(linha.id, { status: "agrupado" });
      continue;
    }

    // trava anti-abuso: até 30 respostas automáticas por número por hora
    const n = await sql<{ n: number }>(`select count(*)::int n from wa_mensagens where tel='${tel}' and direcao='out' and criado_em > now() - interval '1 hour'`);
    if ((n[0]?.n || 0) >= 30) {
      await marcar(linha.id, { status: "revisar" });
      continue;
    }

    // 27/11: negociação feita por gente (ex.: "2 acessos pelo preço de 1") — o bot NÃO responde por 24 h nesse número
    // (não conhece o combinado e contradiria). Vai pra 'revisar' = e-mail na hora pro Marcos/Claude assumirem.
    const humano = await sql<{ n: number }>(`select count(*)::int n from wa_mensagens where tel='${tel}' and direcao='out' and texto like '%[2x1 combinado pelo Claude]%' and criado_em > now() - interval '24 hours'`);
    if (humano[0]?.n) {
      await marcar(linha.id, { status: "revisar", texto: (ehAudio ? "[áudio] " : "") + texto + "\n[REVISAR: negociação manual em andamento (2x1)]" });
      continue;
    }

    // ritmo humano: lê tudo o que a pessoa mandou desde a última resposta (a rajada inteira), depois "digitando…"
    const naoLidas = await sql<{ texto: string }>(
      `select texto from wa_mensagens where tel='${tel}' and direcao='in' and id > coalesce((select max(id) from wa_mensagens where tel='${tel}' and direcao='out'), 0) order by id`,
    );
    const lido = comecaLeitura(m.id, naoLidas.map((x) => x.texto).join("\n") || texto);

    if (coach) {
      const histC = await sql<{ direcao: string; texto: string }>(
        `select direcao, texto from wa_mensagens where tel='${tel}' and id < ${Number(linha.id)} order by id desc limit 16`,
      );
      const historicoC = histC.reverse().map((h) => ({ role: (h.direcao === "in" ? "user" : "assistant") as "user" | "assistant", content: h.texto }));
      const rc = await redigirCoach(texto, coach, historicoC, m.nome);
      if (!rc.resposta) { await marcar(linha.id, { status: "revisar", comprador: true }); continue; }
      if (rc.avaliacao && coach.fastTrack) await guardaAvaliacao(coach, rc.avaliacao);
      await pausaHumana(lido, rc.resposta);
      const okC = await enviar(m.from, rc.resposta);
      await fetch(`${SUPA}/rest/v1/wa_mensagens`, { method: "POST", headers: sb(), body: JSON.stringify({ tel, direcao: "out", texto: rc.resposta, status: okC ? "enviado" : "falhou" }) });
      // pedido de reembolso/cancelamento SEMPRE vai pra revisão (a Manuela acolhe, o Marcos fica sabendo)
      if (/refund|money back|reembols|cancel|chargeback|devolu/i.test(texto)) rc.revisar = true, rc.motivo = rc.motivo || "pedido de reembolso";
      await marcar(linha.id, { status: rc.revisar ? "revisar" : okC ? "coach" : "revisar", comprador: true, ...(rc.revisar ? { texto: (ehAudio ? "[áudio] " : "") + texto + `\n[REVISAR coach: ${rc.motivo}]` } : {}) });
      continue;
    }

    let comprador = await porTelefone(tel);
    const em = texto.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0]?.toLowerCase();
    if (!comprador && em) comprador = await porEmail(em);

    const hist = await sql<{ direcao: string; texto: string }>(
      `select direcao, texto from wa_mensagens where tel='${tel}' and id < ${Number(linha.id)} order by id desc limit 12`,
    );
    const historico = hist.reverse().map((h) => ({ role: (h.direcao === "in" ? "user" : "assistant") as "user" | "assistant", content: h.texto }));
    let { resposta, revisar, motivo } = await redigir(texto, comprador, historico);
    // 27/11: reembolso/cancelamento SEMPRE vai pra revisão também aqui (o bot acolhe e resolve o motivo, o Marcos fica sabendo na hora)
    if (/reembols|cancel|devolu|estorno|chargeback/i.test(texto)) { revisar = true; motivo = motivo || "pedido de reembolso"; }
    if (!resposta) {
      await marcar(linha.id, { status: "revisar", comprador: !!comprador });
      continue;
    }

    // dados de acesso: só na 1ª vez da conversa, e só pra comprador que não entrou ou que fala de acesso
    let extra = "";
    const jaMandou = hist.some((h) => h.direcao === "out" && /Senha nova:/.test(h.texto));
    // 26/11 Marcos: atendimento normal. Dados de acesso só quando a pessoa FALA de acesso, nunca no "oi".
    const falaDeAcesso = /acess|entrar|login|senha|app\b|aplicativo|aula|kiwify|link|n[aã]o consigo|n[aã]o recebi|n[aã]o abre|abrir|carreg|trav|\[print\]/i.test(texto);
    // 27/11: 2 compradores travaram numa tela de login pedindo SENHA (o link abre a conta só no navegador do WhatsApp;
    // no Safari/Chrome o app pede e-mail+senha). O bot mandava a senha escondida no fim e ainda dizia "não precisa de senha".
    // Agora: falou de senha/login → senha nova, e a resposta inteira vira e-mail + senha em destaque (sem texto do modelo contradizendo).
    const pedeSenha = /senha|login|pede.*(e-?mail|cadastr)/i.test(texto);
    let final = resposta;
    // senha mandada há menos de 30 min: NÃO troca (a pessoa pode estar digitando a anterior); só aponta pra ela
    const senhaRecente = comprador && pedeSenha
      ? (await sql<{ n: number }>(`select count(*)::int n from wa_mensagens where tel='${tel}' and direcao='out' and texto like '%Senha nova:%' and criado_em > now() - interval '30 minutes'`))[0]?.n
      : 0;
    if (comprador && pedeSenha && senhaRecente) {
      final = `Use a senha que eu te mandei logo acima, junto com o e-mail ${comprador.email} 👆 (copia e cola, ela tem 8 letras e números). Se aparecer alguma mensagem de erro depois de tocar em Entrar, me manda o print que eu resolvo.`;
    } else if (comprador && pedeSenha) {
      const pass = await senhaNova(comprador.id);
      if (pass) {
        const nm = (comprador.nome || "").trim().split(/\s+/)[0];
        final =
          `${nm ? nm + ", " : ""}na tela que pede e-mail e senha, digita exatamente isto:\n\n📧 E-mail: ${comprador.email}\n🔒 Senha: ${pass}\n\nE toca em *Entrar*. Vale pro app Friends, pro Essential Musics e pra tela da Manu.` +
          `\n\nDepois de entrar, adiciona na tela de início (Android: 3 pontinhos > "Adicionar à tela inicial"; iPhone: compartilhar > "Adicionar à Tela de Início"). Aí você entra direto sempre.\n\nMe fala se entrou? 😊\n\nSenha nova: (enviada)`;
      }
    } else if (comprador && !jaMandou && falaDeAcesso) {
      const pass = await senhaNova(comprador.id);
      extra =
        // 27/11: compradores diziam "não abre" depois de digitar o e-mail. Link de 1 toque (o mesmo do e-mail de backup) entra direto.
        `\n\n*App Friends (celular), é só tocar:* https://fluencyroute.com.br/acesso?email=${encodeURIComponent(comprador.email)}&auto=1\nSe abrir estranho dentro do WhatsApp: 3 pontinhos > Abrir no Chrome/Safari.` +
        (pass ? `\n\n*Se alguma tela pedir e-mail e senha:*\n📧 ${comprador.email}\n🔒 ${pass}\nSenha nova: (enviada)` : "") +
        `\n\n*Essential Musics (bônus, mesmo login):* https://app.fluencyroute.com.br/?cantado=1` +
        `\n\n*Aulas completas (versão anterior):* ${KIWIFY}`;
      final = resposta + extra;
    }
    await pausaHumana(lido, final);
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
