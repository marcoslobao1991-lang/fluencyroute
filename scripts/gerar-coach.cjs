// Gera public/spanish-coach.html (Fluency Fast-Track) a partir de scripts/coach-src.html,
// colando o bloco de PRONÚNCIA do spanish-app.html (gravação WAV + Azure es-MX) sem reescrever.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(R, 'public', 'spanish-app.html'), 'utf8');
const i = app.indexOf('/* ═══ PRONUNCIATION'), j = app.indexOf('function float32ToWav'), k = app.indexOf('\n', app.indexOf('return new Blob([buf]', j));
if (i < 0 || j < 0 || k < 0) throw new Error('bloco de pronúncia não achado no spanish-app.html');
const PRON = app.slice(i, k + 1);
const src = fs.readFileSync(path.join(__dirname, 'coach-src.html'), 'utf8');
const out = src.replace('/*PRON*/', PRON);
fs.writeFileSync(path.join(R, 'public', 'spanish-coach.html'), out);
[...out.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m) => new Function(m[1]));
console.log('ok', Math.round(out.length / 1024) + ' KB, sintaxe ok');
