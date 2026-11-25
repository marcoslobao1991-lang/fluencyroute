// 25/11 DOWNSELL do vitalício (Marcos: "preparar o downsell do vitalício"). Gerado por scratchpad/monta-funil-ingles.cjs a partir do /obrigado.
import type { Metadata } from 'next'
import Script from 'next/script'

// 23/11/2026 (Marcos): upsell vira ACESSO VITALÍCIO em carta (sem vídeo).
// Produto Kiwify SEPARADO "Fluency Route: Acesso Vitalício" (d7acaf90), só cobrança,
// R$96 = 12x R$9,93, checkout kSlC9xJ. O produto principal (Inglês Funcional) segue igual.
// Backup da versão anterior (Mentoria R$186, R5VpKmL): page.tsx.bak-mentoria186-20261123
const OFERTA = 'VSD9Az1' // 25/11: oferta 'Vitalício · condição especial (downsell)' R$47 no produto Acesso Vitalício (d7acaf90); o webhook kiwify-vitalicio libera igual

export const metadata: Metadata = {
  title: 'Uma última coisa · Rota da Fluência',
  robots: 'noindex, nofollow',
}

const styles = `
  html,body{background:#fcfbf8;color-scheme:light}
  .up,.up *,.up *::before,.up *::after{box-sizing:border-box}
  .up{font-family:'Inter',-apple-system,sans-serif;background:#fcfbf8;color:#1d1b18;min-height:100vh;-webkit-font-smoothing:antialiased;padding:0 0 70px}
  .up img{max-width:100%}
  .up .faixa{background:#0b6e68;color:#fff;text-align:center;font-weight:700;font-size:14px;line-height:1.35;padding:12px 18px}
  .up .faixa b{color:#ffe066}
  .up .carta{max-width:600px;margin:0 auto;padding:30px 20px 0}

  .up h1{font-size:clamp(32px,8vw,46px);line-height:1.04;letter-spacing:-.035em;font-weight:900;text-align:center;margin:0 0 14px;text-wrap:balance}
  .up .lead{font-size:19px;line-height:1.45;text-align:center;color:#4a463f;margin:0 auto 26px;max-width:28em;text-wrap:balance}
  .up p{font-size:18px;line-height:1.6;margin:0 0 18px;color:#2b2823}
  .up p b{color:#1d1b18}
  .up .mk{background:linear-gradient(transparent 58%,#ffe066 58%);padding:0 .08em;font-weight:800;color:#1d1b18}
  .up .mkr{background:linear-gradient(transparent 58%,#fecaca 58%);padding:0 .08em;font-weight:800;color:#1d1b18}
  .up .kick{display:block;text-align:center;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#0b6e68;margin:56px 0 10px}
  .up .kick.r{color:#dc2626}
  .up h2{font-size:clamp(28px,7vw,38px);line-height:1.06;letter-spacing:-.03em;font-weight:900;margin:0 0 18px;text-align:center;text-wrap:balance}
  .up h2 .pl{color:#fff;background:#dc2626;padding:0 .18em;border-radius:.16em;-webkit-box-decoration-break:clone;box-decoration-break:clone;line-height:1.22}
  .up h2 .pv{color:#fff;background:#0b6e68;padding:0 .18em;border-radius:.16em;-webkit-box-decoration-break:clone;box-decoration-break:clone;line-height:1.22}
  .up .grande{font-size:24px;line-height:1.3;font-weight:800;letter-spacing:-.02em;text-align:center;margin:26px 0;text-wrap:balance}

  /* recibo do pedido */
  .up .recibo{background:#fff;border:1px solid #e7e2d6;border-radius:18px;margin:6px 0 26px;overflow:hidden;box-shadow:0 18px 40px -26px rgba(29,27,24,.35)}
  .up .recibo .topo{display:flex;align-items:center;gap:10px;padding:14px 18px;background:#f0fdf4;border-bottom:1px dashed #d6e9dc;font-weight:800;font-size:15px;color:#166534}
  .up .recibo .topo i{width:24px;height:24px;flex:0 0 24px;border-radius:50%;background:#16a34a;display:grid;place-items:center}
  .up .recibo .topo i svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
  .up .recibo .lin{display:flex;justify-content:space-between;gap:14px;padding:12px 18px;border-bottom:1px solid #f1ede4;font-size:15px}
  .up .recibo .lin span:first-child{color:#7a746a}
  .up .recibo .lin span:last-child{font-weight:700;text-align:right}
  .up .recibo .lin.fim{border-bottom:0;background:#fef2f2;font-size:16px}
  .up .recibo .lin.fim span:last-child{color:#dc2626;font-weight:900}
  .up .recibo.vit .topo{background:#ecfdf5}
  .up .recibo.vit .lin.fim{background:#f0fdf4}
  .up .recibo.vit .lin.fim span:last-child{color:#16a34a;font-size:18px;letter-spacing:.02em}
  /* tranquilidade: pergunta em cima, resposta verde embaixo */
  .up .sempre{background:#fff;border:1px solid #e7e2d6;border-radius:18px;padding:8px 18px;margin:8px 0 26px}
  .up .sempre .q{font-size:16px;font-weight:600;color:#4a463f;padding-top:14px}
  .up .sempre .r{display:flex;align-items:center;gap:9px;font-size:18px;font-weight:900;color:#166534;padding:6px 0 14px;border-bottom:1px solid #f1ede4}
  .up .sempre .r:last-child{border-bottom:0}
  .up .sempre .r i{width:24px;height:24px;flex:0 0 24px;border-radius:50%;background:#16a34a;display:grid;place-items:center}
  .up .sempre .r i svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}

  /* conta de 3 anos */
  .up .conta{background:#fff;border:1px solid #e7e2d6;border-radius:18px;padding:20px 18px;margin:8px 0 26px}
  .up .conta .bloco{margin:0 0 20px}
  .up .conta .bloco:last-child{margin:0}
  .up .conta .tit{font-size:16px;font-weight:900;margin:0 0 10px}
  .up .conta .ano{display:flex;align-items:center;gap:10px;margin:0 0 7px;font-size:14px;font-weight:700}
  .up .conta .ano .a{flex:0 0 46px;color:#7a746a}
  .up .conta .ano .b{height:26px;border-radius:7px;display:flex;align-items:center;padding:0 10px;color:#fff;font-size:13px;font-weight:800;white-space:nowrap}
  .up .conta .ano .b.r{background:#ef4444;flex:1}
  .up .conta .ano .b.v{background:#16a34a;width:36%}
  .up .conta .ano .b.z{background:#e7f6ec;color:#16a34a;width:auto}

  .up .fatos{border-left:4px solid #1d1b18;padding:2px 0 2px 16px;margin:6px 0 0}
  .up .fatos p{font-size:20px;line-height:1.35;font-weight:800;margin:0 0 12px}
  .up .fatos p:last-child{margin:0}

  /* urgência e escassez */
  .up .urg{margin:34px 0 0;border:2px solid #fecaca;background:#fff7f7;border-radius:18px;padding:22px 18px;text-align:center}
  .up .urg-t{font-size:24px!important;line-height:1.15!important;font-weight:900;letter-spacing:-.02em;color:#991b1b!important;margin:0 0 12px!important;text-wrap:balance}
  .up .urg p{font-size:17px}
  .up .urg-btn{display:block;margin:6px 0 0;padding:16px;border-radius:16px;background:linear-gradient(180deg,#34d058,#16a34a);color:#fff;font-weight:900;font-size:18px;text-decoration:none;box-shadow:0 5px 0 #0f7a35}

  /* oferta: molde kb-card (Sílaba) */
  .up .kb-buy{max-width:440px;margin:30px auto 4px}
  .up .kb-card{position:relative;border-radius:26px;padding:30px 20px 22px;text-align:center;border:3px solid transparent;
    background:linear-gradient(#fffefb,#fff) padding-box,linear-gradient(135deg,#4ecdc4,#12b5ac 40%,#a78bfa 75%,#22c55e) border-box;box-shadow:0 22px 50px -24px rgba(18,181,172,.5)}
  .up .kb-tag{position:absolute;top:-15px;left:50%;transform:translateX(-50%) rotate(-2deg);background:#1d1b18;color:#ffe066;font:800 12px/1 'Inter',sans-serif;
    letter-spacing:.08em;text-transform:uppercase;padding:9px 14px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 0 #12b5ac}
  .up .kb-h{font-weight:900;font-size:28px;line-height:1.1;color:#1d1b18;margin:6px 0 0;letter-spacing:-.02em}
  .up .kb-pill{color:#fff;background:linear-gradient(135deg,#12b5ac,#0b6e68);padding:0 .28em .06em;border-radius:.32em;display:inline-block;transform:rotate(-2deg);box-shadow:0 4px 0 #084f4b}
  .up .kb-sub{font-weight:800;font-size:18px;color:#16a34a;margin:10px 0 0}
  .up .kb-sub span{background:linear-gradient(transparent 62%,#ffe066 62%);padding:0 .1em}
  .up .kb-de{font:700 16px/1.3 'Inter',sans-serif;color:#64748b;margin:16px 0 0}
  .up .kb-de s{color:#ef4444;text-decoration-thickness:3px}
  .up .kb-preco{line-height:.9;margin:8px 0 2px 46px;position:relative;display:inline-block}
  .up .kb-preco .x{position:absolute;right:100%;top:10px;bottom:8px;margin-right:4px;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;font-weight:800;font-size:14px;line-height:1;color:#1d1b18;white-space:nowrap}
  .up .kb-preco .x .rs{font-size:26px;letter-spacing:-.02em}
  .up .kb-preco .v{display:inline-block;line-height:.85;font-weight:900;font-size:96px;letter-spacing:-.04em;color:#1d1b18;background:linear-gradient(transparent 64%,#ffe066 64%);padding:0 .06em}
  .up .kb-preco .c{font-size:34px;vertical-align:top;position:relative;top:6px;margin-left:2px}
  .up .kb-vista{font:600 14px/1.3 'Inter',sans-serif;color:#64748b;margin:8px 0 18px}
  .up .kb-btn{display:flex;align-items:center;justify-content:center;width:100%;padding:19px 16px;border-radius:18px;background:linear-gradient(180deg,#34d058,#16a34a);border:0;cursor:pointer;
    color:#fff;font:900 19px/1.15 'Inter',sans-serif;letter-spacing:.005em;box-shadow:0 6px 0 #0f7a35,0 18px 30px -12px rgba(22,163,74,.6);animation:kbPulse 2.2s ease-in-out infinite}
  .up .kb-btn:active{transform:translateY(4px);box-shadow:0 2px 0 #0f7a35;animation:none}
  @keyframes kbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
  .up .kb-nao{margin:18px auto 0;cursor:pointer;font-size:14px;line-height:1.4;color:#8a8478;text-decoration:underline;max-width:300px}
  .up .kb-selos{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 14px;margin:16px 0 0;font:700 13px/1.2 'Inter',sans-serif;color:#475569}
  .up .kb-selos span{display:inline-flex;align-items:center;gap:5px}
  .up .kb-selos svg{width:16px;height:16px;flex:0 0 16px;fill:none;stroke:#16a34a;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
  .up .kb-lista{list-style:none;margin:20px 0 0;padding:16px 14px;background:#f3faf9;border-radius:18px;text-align:left;display:grid;grid-template-columns:1fr;gap:12px}
  .up .kb-lista li{display:flex;gap:11px;align-items:flex-start;font:700 16px/1.35 'Inter',sans-serif;color:#1d1b18}
  .up .kb-lista i{flex:0 0 26px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#34d058,#16a34a);box-shadow:0 3px 0 #0f7a35;font-style:normal}
  .up .kb-lista i svg{width:15px;height:15px;fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}

  .up .assin{margin:40px 0 0}
  .up .assin .nome{font-weight:900;font-size:20px;margin:0}
  .up .assin .cargo{font-size:15px;color:#7a746a;margin:2px 0 0}
  .up .ps{margin-top:30px;padding-top:24px;border-top:1px solid #ece7dc}
  .up .rodape{text-align:center;font-size:12px;color:#a49e92;margin:50px 0 0}
  @media(max-width:420px){.up p{font-size:17px}.up .kb-preco .v{font-size:84px}}
  @media(prefers-reduced-motion:reduce){.up .kb-btn{animation:none}}
`

const ok = '<i><svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></i>'

const oferta = `
<div class="kb-buy" id="oferta"><div class="kb-card">
  <span class="kb-tag">Metade do preço · última chance</span>
  <p class="kb-h">Rota da Fluência <span class="kb-pill">vitalícia</span></p>
  <p class="kb-sub"><span>o app ali, sempre que você quiser</span></p>
  <p class="kb-de">de <s>12x R$9,93</s> por apenas</p>
  <div class="kb-preco"><span class="x"><span>12x</span><span class="rs">R$</span></span><span class="v">4<span class="c">,86</span></span></div>
  <p class="kb-vista">ou R$47 à vista · uma vez só</p>
  <div id="kiwify-upsell-${OFERTA}" data-upsell-url="https://fluencyroute.com.br/premium" data-downsell-url="https://fluencyroute.com.br/premium">
    <button type="button" class="kb-btn" id="kiwify-upsell-trigger-${OFERTA}">Quero o vitalício pela metade</button>
    <div class="kb-nao" id="kiwify-upsell-cancel-trigger-${OFERTA}">Não, obrigado. Vou deixar meu acesso vencer.</div>
  </div>
  <ul class="kb-lista">
    <li>${ok}O app inteiro, sem data pra acabar</li>
    <li>${ok}Pare e volte quando quiser, sem perder nada</li>
    <li>${ok}Toda série e episódio novo que entrar, sem pagar nada</li>
    <li>${ok}Nunca mais renovação</li>
  </ul>
  <div class="kb-selos"><span><svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Compra segura</span><span><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>Garantia de 7 dias</span></div>
</div></div>
`

const carta = `
<div class="faixa">Tudo certo com o seu pedido. <b>Só mais uma coisa antes de você ir.</b></div>
<main class="carta">
  <h1>Entendo. 12x de R$9,93 pode não ser pra agora.</h1>
  <p class="lead">Mas eu não quero que você saia daqui sem o vitalício por causa de preço. Então vou fazer uma coisa que <span class="mk">eu não faço em nenhum outro lugar.</span></p>

  <h2>O mesmo acesso vitalício,<br><span class="pv">pela metade do preço.</span></h2>
  <p>É exatamente o mesmo: você paga <span class="mk">1 vez só</span> e o app fica seu pra sempre. Toda série nova que entrar, você recebe sem pagar nada a mais.</p>

  <div class="conta">
    <div class="bloco">
      <p class="tit">Deixando o acesso vencer</p>
      <div class="ano"><span class="a">Ano 2</span><span class="b r">12x R$29</span></div>
      <div class="ano"><span class="a">Ano 3</span><span class="b r">12x R$29</span></div>
      <div class="ano"><span class="a">Ano 4</span><span class="b r">12x R$29</span></div>
    </div>
    <div class="bloco">
      <p class="tit">Com o vitalício de hoje</p>
      <div class="ano"><span class="a">Hoje</span><span class="b v">12x R$4,86</span></div>
      <div class="ano"><span class="a">Ano 2</span><span class="b z">R$0</span></div>
      <div class="ano"><span class="a">Ano 3</span><span class="b z">R$0</span></div>
    </div>
  </div>

  <p class="grande">Menos de 2 meses de assinatura. <span class="mk">E nunca mais.</span></p>

  ${oferta}

  <div class="urg">
    <p class="urg-t">Essa é a última vez que essa condição aparece.</p>
    <p>Depois desta página, o acesso vitalício <b>não volta a ser oferecido</b>, nem pela metade, nem pelo preço cheio.</p>
    <a class="urg-btn" href="#oferta">Quero o vitalício pela metade</a>
  </div>

  <div class="ps">
    <p><b>P.S.</b> É só tocar no botão verde e o vitalício entra no mesmo e-mail da compra. Se preferir não incluir, tudo bem: o seu acesso já está liberado do mesmo jeito.</p>
  </div>

  <p class="rodape">Fluency Route · Rota da Fluência</p>
</main>
`


export default function VitalicioEspecialPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <meta name="color-scheme" content="light" />
      <link rel="preconnect" href="https://snippets.kiwify.com" crossOrigin="" />
      <link rel="preconnect" href="https://app.kiwify.com.br" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />


      <div className="up" dangerouslySetInnerHTML={{ __html: carta }} />
      {/* Kiwify 1-click upsell snippet */}
      <Script src="https://snippets.kiwify.com/upsell/upsell.min.js" strategy="afterInteractive" />
    </>
  )
}
