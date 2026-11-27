// 27/11 (Marcos): Black Friday na /friends, só depois que a oferta abre (as caixas de preço já vivem dentro de .esconder).
// Aplica por cima do public/vsl-friends.html que está no ar (ele tem ajustes manuais que o gerar-vsl-friends.js não tem).
// Preço e checkout NÃO mudam: De R$497 → R$29/mês (12x) ou R$289 no Pix, checkout DlmRal3.
// Depois rodar: gerar-friends-quiz.js, gerar-friends-quiz-bio.js, gerar-vsl-friends-bio.js (derivam deste arquivo).
// Pra tirar: node scripts/black-friday-friends.js --tirar
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'public', 'vsl-friends.html');
let s = fs.readFileSync(F, 'utf8');

const POR = '<span class="fr-por">Hoje por apenas:</span>';
const POR_BF = '<span class="fr-por"><span class="bf-tag">🖤 BLACK FRIDAY</span><br>Preço de Black Friday:</span>';
const CSS = '<style id="bf-css">.bf-tag{display:inline-block;background:#000;color:#fff;border:1px solid rgba(255,255,255,.35);font:900 12px/1 Inter,-apple-system,sans-serif;letter-spacing:.14em;padding:8px 14px;border-radius:999px;margin:6px 0 10px}</style>';

if (process.argv.includes('--tirar')) {
  s = s.split(POR_BF).join(POR).replace(CSS, '');
} else if (!s.includes('bf-tag')) {
  const n = s.split(POR).length - 1;
  if (n !== 2) { console.error('esperava 2 caixas de preço, achei ' + n); process.exit(1); }
  s = s.split(POR).join(POR_BF).replace('</head>', CSS + '</head>');
}
fs.writeFileSync(F, s);
console.log('ok · Black Friday ' + (s.includes('bf-tag') ? 'LIGADA' : 'desligada') + ' na vsl-friends.html');
