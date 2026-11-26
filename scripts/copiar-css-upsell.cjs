// Copia o CSS da /spanish/obrigado (upsell 1) pro app/spanish/upsell-ui.tsx (UP_CSS), pra downsell e upsell 2 terem o mesmo visual.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(R, 'app/spanish/obrigado/ThankYou.tsx'), 'utf8');
const i = src.indexOf('<style>{`') + '<style>{`'.length, j = src.indexOf('`}</style>');
if (i < 9 || j < i) throw new Error('CSS não achado');
const css = src.slice(i, j);
const f = path.join(R, 'app/spanish/upsell-ui.tsx');
let ui = fs.readFileSync(f, 'utf8');
ui = ui.replace(/export const UP_CSS = `[\s\S]*`\s*$/, 'export const UP_CSS = `' + css + '`\n');
fs.writeFileSync(f, ui);
console.log('ok', css.length, 'caracteres de CSS');
