// 28/11/2026 · Gera public/es-coach.html (Fast-Track da LATAM: ensina INGLÊS, interface em espanhol).
// Visual (<style>) vem do coach-src.html do espanhol; corpo/roteiro do coach-es-body.html; bloco de PRONÚNCIA
// (gravação WAV + Azure) colado do spanish-app.html, chamado com 'en-US'. Rodar: node scripts/gerar-coach-es.cjs
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(R, 'public', 'spanish-app.html'), 'utf8');
const i = app.indexOf('/* ═══ PRONUNCIATION'), j = app.indexOf('function float32ToWav'), k = app.indexOf('\n', app.indexOf('return new Blob([buf]', j));
if (i < 0 || j < 0 || k < 0) throw new Error('bloco de pronúncia não achado no spanish-app.html');
const PRON = app.slice(i, k + 1);
const src = fs.readFileSync(path.join(__dirname, 'coach-src.html'), 'utf8');
const head = src.slice(0, src.indexOf('</style>')).replace('<html lang="en">', '<html lang="es">').replace('<title>Fluency Fast-Track</title>', '<title>Fluency Fast-Track · Inglés</title>');
const body = fs.readFileSync(path.join(__dirname, 'coach-es-body.html'), 'utf8');
const out = head + body.replace('/*PRON*/', PRON);
fs.writeFileSync(path.join(R, 'public', 'es-coach.html'), out);
[...out.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m) => new Function(m[1]));
console.log('ok', Math.round(out.length / 1024) + ' KB, sintaxe ok');
