// Recuperação de vendas da Fluency Route pelo WhatsApp oficial (26/11/2026).
// O kiwify-webhook chama capturar() em pix gerado / boleto / cartão recusado / carrinho abandonado,
// e pagou() na compra aprovada. O cron /api/recuperacao (a cada 5 min) manda as mensagens no tempo certo.
// Regra do Marcos: pix tem que ESPERAR uns minutos antes (muita gente paga sozinha).
const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";

function sb() {
  const K = process.env.SUPABASE_SERVICE_KEY!;
  return { apikey: K, Authorization: `Bearer ${K}`, "Content-Type": "application/json" };
}

// tempos (minutos depois do evento) de cada etapa, por tipo
export const AGENDA: Record<string, number[]> = {
  pix: [15, 120, 60 * 24],
  boleto: [60, 60 * 24],
  cartao: [5, 60 * 3],
  carrinho: [30, 60 * 24],
};

// deno-lint-ignore no-explicit-any
type K = any;

export function tipoDo(body: K): string | null {
  const st = String(body.order_status || body.status || "").toLowerCase();
  const ev = String(body.webhook_event_type || "").toLowerCase();
  const metodo = String(body.payment_method || "").toLowerCase();
  if (/abandon/.test(st) || /abandon/.test(ev) || (body.checkout_link && !body.order_id)) return "carrinho";
  if (st === "refused" || /refused|recusad/.test(ev)) return "cartao";
  if (st === "waiting_payment" || /pix_created|billet_created|boleto/.test(ev)) return metodo.includes("boleto") || /billet|boleto/.test(ev) ? "boleto" : "pix";
  return null;
}

export async function capturar(body: K, tipo: string) {
  const c = body.Customer || body.customer || {};
  const email = String(c.email || body.email || "").toLowerCase().trim();
  const tel = String(c.mobile || c.phone || body.phone || body.mobile || "").replace(/\D/g, "");
  if (!tel) return;
  const nome = String(c.first_name || c.full_name || body.name || "").trim().split(/\s+/)[0] || "";
  const produto = body.Product?.product_name || body.product_name || "Fluency Route";
  const pix = body.pix_code || body.Pix?.code || body.pix?.code || null;
  const checkout = body.checkout_link || body.Product?.checkout_link || body.boleto_URL || null;
  const chave = `${tipo}:${body.order_id || body.id || email || tel}`;
  const agora = Date.now();
  await fetch(`${SUPA}/rest/v1/recuperacao?on_conflict=chave`, {
    method: "POST",
    headers: { ...sb(), Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({
      chave, tipo, email, tel, nome, produto, pix_code: pix, checkout_url: checkout,
      proximo_em: new Date(agora + AGENDA[tipo][0] * 60000).toISOString(), bruto: body,
    }),
  });
}

// compra aprovada: para qualquer recuperação ativa do mesmo e-mail ou telefone
export async function pagou(email: string, tel: string) {
  const filtros: string[] = [];
  if (email) filtros.push(`email.eq.${encodeURIComponent(email.toLowerCase())}`);
  if (tel) filtros.push(`tel.eq.${tel.replace(/\D/g, "")}`);
  if (!filtros.length) return;
  await fetch(`${SUPA}/rest/v1/recuperacao?status=eq.ativo&or=(${filtros.join(",")})`, {
    method: "PATCH",
    headers: sb(),
    body: JSON.stringify({ status: "pago" }),
  });
}
