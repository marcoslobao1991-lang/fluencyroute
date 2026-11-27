// 27/11 (Marcos): Black Friday na /friends, só depois que a oferta abre (as caixas de preço já vivem dentro de .esconder).
// Aplica por cima do public/vsl-friends.html que está no ar (ele tem ajustes manuais que o gerar-vsl-friends.js não tem).
// Preço e checkout NÃO mudam: De R$497 → R$29/mês (12x) ou R$289 no Pix, checkout DlmRal3.
// Selo branco (o preto sumia no fundo escuro) acima do "De R$497"; o "Hoje por apenas:" fica.
// Depois rodar: gerar-friends-quiz.js, gerar-friends-quiz-bio.js, gerar-vsl-friends-bio.js (derivam deste arquivo).
// Pra tirar: node scripts/black-friday-friends.js --tirar
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'public', 'vsl-friends.html');
let s = fs.readFileSync(F, 'utf8');

// limpa qualquer versão anterior (v1 tinha o selo dentro do fr-por)
s = s.split('<span class="fr-por"><span class="bf-tag">🖤 BLACK FRIDAY</span><br>Preço de Black Friday:</span>').join('<span class="fr-por">Hoje por apenas:</span>');
s = s.replace(/<style id="bf-css">[\s\S]*?<\/style>/, '');
const DE = '<span class="fr-de">';
const DE_BF = '<span class="bf-tag">BLACK FRIDAY</span><br>' + DE;
s = s.split(DE_BF).join(DE);

if (!process.argv.includes('--tirar')) {
  const n = s.split(DE).length - 1;
  if (n !== 2) { console.error('esperava 2 caixas de preço, achei ' + n); process.exit(1); }
  const CSS = '<style id="bf-css">.bf-tag{display:inline-block;background:#fff;color:#000;font:900 14px/1 Inter,-apple-system,sans-serif;letter-spacing:.16em;padding:10px 18px;border-radius:999px;margin:0 0 14px;box-shadow:0 0 0 4px rgba(255,255,255,.08),0 8px 24px rgba(0,0,0,.4)}</style>';
  s = s.split(DE).join(DE_BF).replace('</head>', CSS + '</head>');
}
fs.writeFileSync(F, s);
console.log('ok · Black Friday ' + (s.includes('class="bf-tag"') ? 'LIGADA' : 'desligada') + ' na vsl-friends.html');
