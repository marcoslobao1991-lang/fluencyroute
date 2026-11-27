// 27/11 (Marcos): Black Friday na /friends, só depois que a oferta abre (tudo vive dentro de .esconder).
// "tem que fazer um BANNER, tem que aparecer totalmente que é black friday":
// 27/11 v2 (Marcos): "deixa sem movimento, só as tiras do banner, tira a do topo, coloca a % de desconto e contagem regressiva"
//  1) BANNER logo acima da oferta, PARADO: tiras amarelas em cima/embaixo, BLACK FRIDAY gigante, selo "42% OFF"
//     (R$497 → R$289 no Pix = 41,9%), De R$497 por 12x R$29, e CONTAGEM REGRESSIVA até HOJE 27/11 23:59 (Brasília, Marcos: "até hoje só").
//     Quando zera, a contagem some (o resto fica até rodar --tirar).
//  3) selo branco acima do "De R$497" nas 2 caixas de preço
// Aplica por cima do public/vsl-friends.html que está no ar (ele tem ajustes manuais que o gerar-vsl-friends.js não tem).
// Preço e checkout NÃO mudam: De R$497 → R$29/mês (12x) ou R$289 no Pix, checkout DlmRal3.
// Depois rodar: gerar-friends-quiz.js, gerar-friends-quiz-bio.js, gerar-vsl-friends-bio.js (derivam deste arquivo).
// Pra tirar: node scripts/black-friday-friends.js --tirar
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'public', 'vsl-friends.html');
let s = fs.readFileSync(F, 'utf8');

// ── limpa qualquer versão anterior ──
s = s.split('<span class="fr-por"><span class="bf-tag">🖤 BLACK FRIDAY</span><br>Preço de Black Friday:</span>').join('<span class="fr-por">Hoje por apenas:</span>');
s = s.replace(/<style id="bf-css">[\s\S]*?<\/style>/, '');
s = s.replace(/<!--bf-banner-->[\s\S]*?<!--\/bf-banner-->/g, '');
const DE = '<span class="fr-de">';
const DE_BF = '<span class="bf-tag">BLACK FRIDAY</span><br>' + DE;
s = s.split(DE_BF).join(DE);

if (!process.argv.includes('--tirar')) {
  const n = s.split(DE).length - 1;
  if (n !== 2) { console.error('esperava 2 caixas de preço, achei ' + n); process.exit(1); }
  const ESC = '<div class="esconder"><section class="vsl-section"';
  if (s.split(ESC).length !== 2) { console.error('não achei o início da oferta'); process.exit(1); }

  const corre = Array(6).fill('<b>BLACK FRIDAY</b><i>●</i>').join('');
  const CSS = `<style id="bf-css">
.bf-tag{display:inline-block;background:#fff;color:#000;font:900 14px/1 Inter,-apple-system,sans-serif;letter-spacing:.16em;padding:10px 18px;border-radius:999px;margin:0 0 14px;box-shadow:0 0 0 4px rgba(255,255,255,.08),0 8px 24px rgba(0,0,0,.4)}
.bf-fita{overflow:hidden;white-space:nowrap;background:#FFD400;color:#000;font:900 13px/1 Inter,-apple-system,sans-serif;letter-spacing:.14em;padding:9px 0;display:flex;justify-content:center}
.bf-fita>div{display:inline-flex}
.bf-fita b{padding:0 14px}.bf-fita i{font-style:normal;font-size:8px;opacity:.7;align-self:center}
.bf-banner{margin:0 0 4px;background:#000}
.bf-main{text-align:center;padding:28px 18px 26px;background:radial-gradient(120% 90% at 50% 0%,#2a2400 0%,#000 60%)}
.bf-k{display:inline-block;background:#FFD400;color:#000;font:900 12px/1 Inter,-apple-system,sans-serif;letter-spacing:.2em;padding:7px 12px;border-radius:4px}
.bf-t{margin-top:12px;font:900 clamp(46px,14vw,72px)/.92 Inter,-apple-system,sans-serif;letter-spacing:-.03em;color:#fff;text-transform:uppercase}
.bf-t span{color:#FFD400}
.bf-off{display:inline-block;margin-top:14px;background:#ff2d2d;color:#fff;font:900 clamp(22px,6.4vw,30px)/1 Inter,-apple-system,sans-serif;letter-spacing:.02em;padding:9px 16px;border-radius:8px;transform:rotate(-2deg);box-shadow:0 6px 20px rgba(255,45,45,.35)}
.bf-s{margin-top:14px;font:700 clamp(16px,4.6vw,20px)/1.3 Inter,-apple-system,sans-serif;color:rgba(255,255,255,.85)}
.bf-s s{color:#ff6b6b}.bf-s b{color:#FFD400;font-weight:900}
.bf-cd{margin-top:20px}.bf-cd p{font:700 11px/1 Inter,-apple-system,sans-serif;letter-spacing:.22em;color:rgba(255,255,255,.55);text-transform:uppercase;margin-bottom:10px}
.bf-cd-g{display:flex;justify-content:center;gap:8px}
.bf-cd-g div{min-width:62px;background:#141414;border:1px solid #2c2c2c;border-radius:10px;padding:10px 4px 8px}
.bf-cd-g b{display:block;font:900 28px/1 "JetBrains Mono",monospace;color:#fff}
.bf-cd-g small{display:block;margin-top:5px;font:700 9px/1 Inter,-apple-system,sans-serif;letter-spacing:.14em;color:#FFD400;text-transform:uppercase}
</style>`;
  const CD = '<div class="bf-cd" id="bf-cd"><p>A Black Friday acaba em</p><div class="bf-cd-g">'
    + [['d','dias'],['h','horas'],['m','min'],['s','seg']].map(([k, n]) => '<div><b data-bf="' + k + '">00</b><small>' + n + '</small></div>').join('')
    + '</div></div>'
    + '<script>(function(){var fim=Date.parse("2026-11-27T23:59:59-03:00"),el=document.getElementById("bf-cd");if(!el)return;var q=function(k){return el.querySelector("[data-bf="+k+"]")},p=function(n){return n<10?"0"+n:""+n};function t(){var r=Math.max(0,fim-Date.now());if(!r){el.style.display="none";return}var x=Math.floor(r/1e3);q("d").textContent=p(Math.floor(x/86400));q("h").textContent=p(Math.floor(x%86400/3600));q("m").textContent=p(Math.floor(x%3600/60));q("s").textContent=p(x%60);setTimeout(t,1e3)}t()})()</script>';
  const BANNER = `<!--bf-banner--><div class="bf-banner"><div class="bf-fita"><div>${corre}</div></div>
<div class="bf-main"><div class="bf-k">OFERTA LIBERADA</div><div class="bf-t">Black<br><span>Friday</span></div>
<div class="bf-off">42% OFF</div>
<div class="bf-s">De <s>R$497</s> por <b>12x de R$29</b><br>ou R$289 no Pix</div>${CD}</div>
<div class="bf-fita"><div>${corre}</div></div></div><!--/bf-banner-->`;

  s = s.split(DE).join(DE_BF).replace('</head>', CSS + '</head>').replace(ESC, '<div class="esconder">' + BANNER + '<section class="vsl-section"');
}
fs.writeFileSync(F, s);
console.log('ok · Black Friday ' + (s.includes('bf-banner') ? 'LIGADA (banner + faixa + selo)' : 'desligada') + ' na vsl-friends.html');
