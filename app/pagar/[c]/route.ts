// /pagar/<código do checkout Kiwify> → pay.kiwify.com.br/<código> (botão das mensagens de recuperação no WhatsApp).
// Um domínio só no botão do template; marca a origem com sck=wa_rec pra medir quanto a recuperação traz.
import { NextResponse } from "next/server";

export async function GET(_req: Request, ctx: { params: Promise<{ c: string }> }) {
  const { c } = await ctx.params;
  const codigo = /^[A-Za-z0-9]{5,12}$/.test(c) ? c : "DlmRal3";
  return NextResponse.redirect(`https://pay.kiwify.com.br/${codigo}?sck=wa_rec&utm_source=whatsapp&utm_medium=recuperacao`, 302);
}
