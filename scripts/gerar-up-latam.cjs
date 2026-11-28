// 28/11/2026 · gera /es/fast-track (upsell 2 LATAM, US$37) e /es/lite (downsell, US$17) com o MESMO visual do /es/vitalicio.
// Rodar: node scripts/gerar-up-latam.cjs  (depois trocar suqpejw4 / 9haa0z5h pelos códigos da Hotmart)
const fs = require('fs'), path = require('path'); const R = path.join(__dirname, '..');
const v = fs.readFileSync(path.join(R, 'app/es/vitalicio/page.tsx'), 'utf8');
const estilo = v.slice(v.indexOf('const styles = `'), v.indexOf('const ok ='));
const ok = `const ok = '<i><svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></i>'\n`;
const OK = '${ok}';
const selos = `<div class="kb-selos"><span><svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Pago seguro</span><span><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>Garantía de 7 días</span></div>`;
const pagina = (o) => `import type { Metadata } from 'next'
import Script from 'next/script'
import MontaWidget from './MontaWidget'

// ${o.coment}
// Hotmart: funil TRANSFER LANGUAGE (144304), produto Fluency Route - Premium Coaching (2066736), oferta ${o.oferta}.
// Entrega: webhook do repo fluencyroute-latam (app/lib/coach.ts) -> /es-coach.html (plano '${o.plano}'). Vai pro pixel como UpsellPurchase.
// ⚠️ O PREÇO exibido tem que BATER com a oferta no painel Hotmart. Gerado por scripts/gerar-up-latam.cjs.

export const metadata: Metadata = { title: '${o.titulo}', robots: 'noindex, nofollow' }

${estilo}${ok}
const oferta = \`
<div class="kb-buy" id="oferta"><div class="kb-card">
  <span class="kb-tag">Solo en esta página</span>
  <p class="kb-h">${o.nomeOferta}</p>
  <p class="kb-sub"><span>${o.sub}</span></p>
  <div class="kb-preco"><span class="x"><span>pagas</span><span class="rs">US$</span></span><span class="v">${o.preco}</span></div>
  <p class="kb-vista">pago único · sin mensualidades</p>
  <div id="hotmart-sales-funnel" class="hm-widget"></div>
  <ul class="kb-lista">
${o.lista.map((l) => '    <li>' + OK + l + '</li>').join('\n')}
  </ul>
  ${selos}
</div></div>
\`

const carta = \`
${o.carta}
\`

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <meta name="color-scheme" content="light" />
      <link rel="preconnect" href="https://checkout.hotmart.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div className="up" dangerouslySetInnerHTML={{ __html: carta }} />
      <Script src="https://checkout.hotmart.com/lib/hotmart-checkout-elements.js" strategy="afterInteractive" />
      <MontaWidget />
    </>
  )
}
`;

const fast = pagina({
  coment: 'UPSELL 2 LATAM (28/11): Fast-Track = plan de 90 días + Accent Check semanal con I.A. + reto semanal. US$37.',
  oferta: 'suqpejw4', plano: 'fast', titulo: 'Un paso más · Ruta de la Fluidez',
  nomeOferta: 'Fast-Track <span class="kb-pill">90 días</span>', sub: 'tu plan diario + tu pronunciación calificada', preco: '37',
  lista: ['Plan de 90 días: una misión por día, según tu nivel y tu tiempo', 'Accent Check semanal: la I.A. califica cada palabra que dices', 'Un reto nuevo cada semana para que no dejes de hablar', 'Funciona en el celular, junto con tu app'],
  carta: `<div class="faixa">Tu pedido está casi listo. <b>Falta 1 paso.</b></div>
<main class="carta">
  <h1>Tu app ya es tuya. Ahora, la parte que casi nadie hace.</h1>
  <p class="lead">Tener la app es el primer paso. Lo que separa a quien habla inglés de quien lo deja a la mitad es otra cosa: <span class="mk">saber exactamente qué hacer cada día.</span></p>

  <div class="fatos">
    <p>Sin un plan, la primera semana vas con todo.</p>
    <p>La segunda, abres la app y no sabes por dónde seguir.</p>
    <p>La tercera, ya no la abres.</p>
  </div>

  <span class="kick">Para eso existe el Fast-Track</span>
  <h2>Abres tu celular y ya sabes<br><span class="pv">qué hacer hoy.</span></h2>
  <p>Le dices tu nivel y cuántos minutos tienes. El Fast-Track arma tu <span class="mk">plan de 90 días</span>: una misión por día, en 5 fases, del oído a la conversación.</p>
  <p>Y cada semana haces el <b>Accent Check</b>: dices 5 frases en voz alta y nuestra I.A. califica cada palabra, en verde, amarillo o rojo. Ves en números cómo mejora tu pronunciación, semana a semana.</p>

  <div class="sempre">
    <div class="q">¿Hoy tienes solo 10 minutos?</div><div class="r">${OK}Tu misión cabe en 10 minutos.</div>
    <div class="q">¿No sabes si lo estás pronunciando bien?</div><div class="r">${OK}La I.A. te dice palabra por palabra.</div>
    <div class="q">¿Te da pena hablar con alguien?</div><div class="r">${OK}Practicas solo, con tu celular, sin que nadie te escuche.</div>
    <div class="q">¿Cómo sabes que estás avanzando?</div><div class="r">${OK}Tu nota de pronunciación sube cada semana, y la ves.</div>
  </div>

  <div class="recibo vit">
    <div class="topo">${OK}Lo que se suma a tu pedido</div>
    <div class="lin"><span>Plan diario</span><span>90 días</span></div>
    <div class="lin"><span>Accent Check con I.A.</span><span>Cada semana</span></div>
    <div class="lin"><span>Retos semanales</span><span>13</span></div>
    <div class="lin fim"><span>Pago</span><span>Una sola vez</span></div>
  </div>

  \${oferta}

  <div class="urg">
    <p class="urg-t">Esta condición existe solo ahora.</p>
    <p>El Fast-Track <b>no se vende en ningún otro lugar</b>: ni en la web, ni en la app, ni por correo. Aparece solo aquí, una vez, justo después de tu compra.</p>
    <p><span class="mkr">Si cierras esta página, la oferta desaparece</span> y no vuelve.</p>
    <a class="urg-btn" href="#oferta">Quiero sumar el Fast-Track</a>
  </div>

  <div class="assin"><p>Nos vemos adentro.</p><p class="nome">Manuela</p><p class="cargo">Ruta de la Fluidez</p></div>
  <div class="ps"><p><b>P.D.</b> Basta tocar el botón verde y el Fast-Track se suma al mismo correo de tu compra, sin volver a escribir los datos de tu tarjeta. Si prefieres seguir solo con la app, está bien: tu acceso ya está liberado.</p></div>
  <p class="rodape">Ruta de la Fluidez · Fluency Route</p>
</main>`,
});

const lite = pagina({
  coment: 'DOWNSELL LATAM (28/11): quem recusou o Fast-Track. Lite = só o plan de 90 días + retos (sem Accent Check). US$17.',
  oferta: '9haa0z5h', plano: 'lite', titulo: 'Una última cosa · Ruta de la Fluidez',
  nomeOferta: 'Fast-Track <span class="kb-pill">Lite</span>', sub: 'solo el plan diario de 90 días', preco: '17',
  lista: ['Plan de 90 días: una misión por día, según tu nivel y tu tiempo', 'Un reto nuevo cada semana para que no dejes de hablar', 'Funciona en el celular, junto con tu app'],
  carta: `<div class="faixa">Entendido. <b>Antes de irte, mira esto.</b></div>
<main class="carta">
  <h1>Tal vez no necesitas todo. Pero sí necesitas un plan.</h1>
  <p class="lead">Si el Fast-Track completo no era para ti, está bien. Pero no te quedes sin la parte más importante: <span class="mk">saber qué hacer cada día.</span></p>

  <span class="kick">Por eso existe la versión Lite</span>
  <h2>Solo el plan diario,<br><span class="pv">por menos de la mitad.</span></h2>
  <p>El mismo <b>plan de 90 días</b> del Fast-Track: le dices tu nivel y tu tiempo, y cada día abres el celular y ya sabes tu misión. Más un reto nuevo cada semana.</p>
  <p>Lo único que no trae es el Accent Check con I.A. Todo lo demás, igual.</p>

  <div class="recibo vit">
    <div class="topo">${OK}Lo que se suma a tu pedido</div>
    <div class="lin"><span>Plan diario</span><span>90 días</span></div>
    <div class="lin"><span>Retos semanales</span><span>13</span></div>
    <div class="lin fim"><span>Pago</span><span>Una sola vez</span></div>
  </div>

  \${oferta}

  <div class="urg">
    <p class="urg-t">Es la última vez que aparece.</p>
    <p><span class="mkr">Si cierras esta página, esta condición desaparece.</span> Tu acceso a la app ya está liberado de cualquier forma.</p>
    <a class="urg-btn" href="#oferta">Quiero el plan Lite</a>
  </div>

  <div class="assin"><p>Nos vemos adentro.</p><p class="nome">Manuela</p><p class="cargo">Ruta de la Fluidez</p></div>
  <p class="rodape">Ruta de la Fluidez · Fluency Route</p>
</main>`,
});

fs.writeFileSync(path.join(R, 'app/es/fast-track/page.tsx'), fast);
fs.writeFileSync(path.join(R, 'app/es/lite/page.tsx'), lite);
console.log('ok');
