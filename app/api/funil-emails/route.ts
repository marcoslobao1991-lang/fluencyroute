// ═══════════════════════════════════════════════════════════════════
//  /api/funil-emails — sequência de recuperação do funil Loop de Repetição.
//  Cron diário (vercel.json, 12:00 UTC = 9h BRT). Pra cada lead de
//  quiz_leads (source leadmagnet_497) calcula os dias desde a captura e
//  manda o email do dia (D1, D2, D3, D5, D7), todos vendendo a /vsl2.
//  Dedup: marca answers.rec_dN = true. Leads de teste (src qa_*) são pulados.
//  Auth: header Authorization: Bearer CRON_SECRET (Vercel manda sozinha)
//  ou ?key=CRON_SECRET. Teste manual: ?key=...&test=email@x.com&day=1
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const FROM = "Manu · Fluency Route <manu@acesso.fluencyroute.com.br>";
const vsl = (d: number) =>
  `https://fluencyroute.com.br/vsl2?utm_source=email&utm_medium=rec&utm_campaign=d${d}`;

function shell(inner: string, cta: string, d: number) {
  return `<!doctype html><html><body style="margin:0;background:#FAFAF6;font-family:-apple-system,'Segoe UI',sans-serif;color:#15201E">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:900;letter-spacing:3px;font-size:12px">FLUENCY <span style="color:#12B5AC">ROUTE</span></p>
    ${inner}
    <a href="${vsl(d)}" style="display:inline-block;margin:22px 0 8px;background:#0B6E68;color:#fff;font-weight:900;font-size:16px;padding:16px 28px;border-radius:12px;text-decoration:none">${cta}</a>
    <p style="font-size:11px;color:#9aa;margin-top:28px">Fluency Route · você recebeu porque fez o treino gratuito do Loop de Repetição.</p>
  </div></body></html>`;
}
const P = `style="font-size:16px;color:#3D4A49;line-height:1.65"`;
const H = `style="font-size:24px;font-weight:900;letter-spacing:-1px;line-height:1.25;margin:18px 0 10px"`;

const DAYS: Record<number, { subj: string; html: (nome: string) => string }> = {
  1: {
    subj: "seu ouvido fez em 5 minutos o que a escola não fez em anos",
    html: (n) => shell(`
      <h1 ${H}>${n ? n + ", o" : "O"} que aconteceu ontem não foi sorte.</h1>
      <p ${P}>Você entrou no treino sem entender <b>wanna, gotta, gonna</b> — e saiu reconhecendo os três em fala nativa crua. Sem decorar nada.</p>
      <p ${P}>Isso foi <b>UM loop</b>, de <b>UM bloco</b>, de <b>UM módulo</b>. A Rota completa é esse mesmo treino, todo dia, com plano e progressão — até a série inteira rodar sem legenda.</p>
      <p ${P}>O vídeo abaixo mostra a rota exata, do seu nível até lá:</p>`,
      "VER A ROTA COMPLETA ▶", 1),
  },
  2: {
    subj: "por que 10 anos de escola não destravaram seu ouvido",
    html: (n) => shell(`
      <h1 ${H}>Idioma não é matéria. É habilidade.</h1>
      <p ${P}>${n ? n + ", m" : "M"}atéria se estuda. Habilidade se <b>treina</b>. Ninguém aprende a nadar lendo sobre natação — e ninguém destrava o ouvido decorando regra.</p>
      <p ${P}>A escola te fez <b>estudar</b> inglês por anos. O que ninguém nunca te fez foi <b>treinar</b> — repetir o mesmo som até o cérebro reconhecer sozinho, no automático.</p>
      <p ${P}>Você já provou que o treino funciona no seu ouvido. Foi anteontem, em 5 minutos. A Rota é a versão completa:</p>`,
      "QUERO TREINAR, NÃO ESTUDAR ▶", 2),
  },
  3: {
    subj: "“não tenho tempo pra inglês” — posso ser honesta?",
    html: (n) => shell(`
      <h1 ${H}>As 3 frases que seguram todo mundo.</h1>
      <p ${P}><b>“Não tenho tempo.”</b> O treino da Rota é mais curto que o tempo que você gasta escolhendo o que assistir. É treino de minutos, não aula de uma hora.</p>
      <p ${P}><b>“Já tentei de tudo.”</b> ${n ? n + ", v" : "V"}ocê tentou <i>estudar</i> de vários jeitos. <i>Treinar</i>, você fez uma vez — no treino gratuito — e sentiu o clique na hora.</p>
      <p ${P}><b>“Sou ruim de inglês desde a escola.”</b> Você não é ruim. Seu ouvido nunca foi ligado — porque só te ensinaram pelos olhos. Canal desligado liga rápido, do jeito certo.</p>`,
      "ME MOSTRA O CAMINHO ▶", 3),
  },
  5: {
    subj: "a conta que ninguém te mostrou: ~500 blocos = 80% de uma série",
    html: (n) => shell(`
      <h1 ${H}>A matemática do seu ouvido.</h1>
      <p ${P}>A gente contou, palavra por palavra, <b>703 episódios</b> de séries americanas. Resultado: cerca de <b>500 blocos de som</b> formam mais de <b>80% de tudo</b> que se fala.</p>
      <p ${P}>${n ? n + ", v" : "V"}ocê dominou 3 desses blocos em 5 minutos — do zero. Não precisa de 10 anos. Precisa dos ~500 certos, na ordem certa, no automático.</p>
      <p ${P}>Cada mês adiando é mais um mês assistindo com legenda. A rota pro essencial no automático tá aqui:</p>`,
      "COMEÇAR MINHA ROTA ▶", 5),
  },
  7: {
    subj: "última vez que toco nesse assunto",
    html: (n) => shell(`
      <h1 ${H}>Vou ser direta com você${n ? ", " + n : ""}.</h1>
      <p ${P}>Esse é o último email dessa sequência. Sem pressão falsa, sem “vagas acabando”.</p>
      <p ${P}>O que eu sei: seu ouvido <b>já provou que destrava</b> — você viu com seus próprios ouvidos no treino. O que falta não é capacidade. É o caminho completo, com plano, treino diário e progressão.</p>
      <p ${P}>Se não for agora, tudo bem — seu treino gratuito continua aberto. Mas se for agora, é aqui:</p>`,
      "QUERO A ROTA COMPLETA ▶", 7),
  },
};

async function send(resendKey: string, to: string, day: number, nome: string) {
  const t = DAYS[day];
  if (!t) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject: t.subj, html: t.html(nome || "") }),
  });
  if (!r.ok) console.error("[FUNIL-EMAILS] resend", day, to, r.status, await r.text());
  return r.ok;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  if (!secret || (auth !== `Bearer ${secret}` && url.searchParams.get("key") !== secret))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const resendKey = process.env.RESEND_API_KEY;
  const supaKey = process.env.SUPABASE_SERVICE_KEY;
  if (!resendKey || !supaKey) return NextResponse.json({ error: "env missing" }, { status: 500 });

  // modo teste: ?test=email&day=N manda um único email
  const test = url.searchParams.get("test");
  if (test) {
    const ok = await send(resendKey, test, +(url.searchParams.get("day") || 1), "Marcos");
    return NextResponse.json({ ok, test: true });
  }

  const since = new Date(Date.now() - 9 * 864e5).toISOString();
  const q = `${SUPA}/rest/v1/quiz_leads?source=eq.leadmagnet_497&created_at=gte.${since}&select=id,name,email,answers,created_at&limit=1000`;
  const rows: Array<{ id: string; name: string | null; email: string | null; answers: Record<string, unknown> | null; created_at: string }> =
    await (await fetch(q, { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } })).json();
  if (!Array.isArray(rows)) return NextResponse.json({ error: "supabase" }, { status: 502 });

  let sent = 0, skipped = 0;
  for (const r of rows) {
    const a = r.answers || {};
    if (!r.email || String(a.src || "").startsWith("qa_")) { skipped++; continue; }
    const day = Math.floor((Date.now() - Date.parse(r.created_at)) / 864e5);
    if (!DAYS[day] || a["rec_d" + day]) { skipped++; continue; }
    const ok = await send(resendKey, r.email, day, r.name || "");
    if (ok) {
      sent++;
      await fetch(`${SUPA}/rest/v1/quiz_leads?id=eq.${r.id}`, {
        method: "PATCH",
        headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { ...a, ["rec_d" + day]: true } }),
      });
    }
  }
  return NextResponse.json({ ok: true, sent, skipped, total: rows.length });
}
