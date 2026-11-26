// /api/recuperacao — cron a cada 5 min (vercel.json). Manda as mensagens de recuperação que venceram.
// Fila em `recuperacao` (preenchida pelo kiwify-webhook via app/lib/recuperacao.ts). Antes de cada envio
// confere se a pessoa já pagou (orders pago com o mesmo e-mail depois do evento) e para na hora.
import { NextResponse } from "next/server";
import { AGENDA } from "../../lib/recuperacao";

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const PH = process.env.WA_CLOUD_PHONE_ID || "";
const TOKEN = process.env.WA_CLOUD_TOKEN || "";

function sb() {
  const K = process.env.SUPABASE_SERVICE_KEY!;
  return { apikey: K, Authorization: `Bearer ${K}`, "Content-Type": "application/json" };
}

type Linha = { id: number; criado_em: string; tipo: string; email: string; tel: string; nome: string; produto: string; pix_code: string | null; checkout_url: string | null; etapa: number };

function codigoCheckout(u: string | null) {
  const m = (u || "").match(/pay\.kiwify\.com\.br\/([A-Za-z0-9]{5,12})/);
  return m ? m[1] : "DlmRal3";
}

function nomeBonito(n: string) {
  const p = (n || "").trim();
  return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : "tudo bem";
}

function produtoBonito(p: string) {
  return /ingl|fluency/i.test(p || "") ? "curso de inglês da Fluency Route" : p || "curso";
}

// qual template em cada etapa
function montar(l: Linha) {
  const nome = nomeBonito(l.nome), prod = produtoBonito(l.produto), cod = codigoCheckout(l.checkout_url);
  const botao = [{ type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: cod }] }];
  if (l.tipo === "pix" && l.etapa === 0 && l.pix_code)
    return { name: "rec_pix_codigo", components: [{ type: "body", parameters: [nome, prod, l.pix_code].map((t) => ({ type: "text", text: t })) }] };
  const body = { type: "body", parameters: [nome, prod].map((t) => ({ type: "text", text: t })) };
  if (l.tipo === "pix" && l.etapa === 0) return { name: "rec_carrinho", components: [body, ...botao] }; // sem código no payload
  if (l.tipo === "pix" || l.tipo === "boleto") return { name: "rec_pix_expirou", components: [body, ...botao] };
  if (l.tipo === "cartao") return { name: "rec_cartao", components: [body, ...botao] };
  return { name: "rec_carrinho", components: [body, ...botao] };
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const key = new URL(req.url).searchParams.get("key") || "";
  const secret = process.env.CRON_SECRET || "";
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!PH || !TOKEN) return NextResponse.json({ ok: true, skipped: "whatsapp off" });

  const r = await fetch(`${SUPA}/rest/v1/recuperacao?status=eq.ativo&proximo_em=lte.${new Date().toISOString()}&order=proximo_em.asc&limit=40`, { headers: sb(), cache: "no-store" });
  const fila: Linha[] = r.ok ? await r.json() : [];
  const res: string[] = [];

  for (const l of fila) {
    // já pagou? (compra aprovada com o mesmo e-mail depois do evento)
    if (l.email) {
      const p = await fetch(
        `${SUPA}/rest/v1/orders?select=id&customer_email=ilike.${encodeURIComponent(l.email)}&status=eq.paid&created_at=gte.${encodeURIComponent(l.criado_em)}&limit=1`,
        { headers: sb(), cache: "no-store" },
      );
      if (p.ok && (await p.json()).length) {
        await fetch(`${SUPA}/rest/v1/recuperacao?id=eq.${l.id}`, { method: "PATCH", headers: sb(), body: JSON.stringify({ status: "pago" }) });
        res.push(`${l.id} pago`);
        continue;
      }
    }
    const tpl = montar(l);
    const tel = l.tel.length <= 11 ? "55" + l.tel : l.tel;
    const env = await fetch(`https://graph.facebook.com/v21.0/${PH}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: tel, type: "template", template: { name: tpl.name, language: { code: "pt_BR" }, components: tpl.components } }),
    });
    const j = await env.json().catch(() => ({}));
    const ok = !!j?.messages?.[0]?.id;
    const prox = AGENDA[l.tipo]?.[l.etapa + 1];
    await fetch(`${SUPA}/rest/v1/recuperacao?id=eq.${l.id}`, {
      method: "PATCH",
      headers: sb(),
      body: JSON.stringify({
        etapa: l.etapa + 1,
        status: prox === undefined ? "fim" : "ativo",
        proximo_em: prox === undefined ? null : new Date(new Date(l.criado_em).getTime() + prox * 60000).toISOString(),
        log: `${new Date().toISOString()} ${tpl.name} ${ok ? "ok" : "ERRO " + (j?.error?.message || "").slice(0, 120)}`,
      }),
    });
    res.push(`${l.id} ${tpl.name} ${ok ? "ok" : "erro"}`);
  }
  return NextResponse.json({ ok: true, processados: res.length, res });
}
