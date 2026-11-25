// 25/11/2026 (Marcos: "o botão de toca para continuar não está aparecendo no celular... tem que rolar a tela"):
// na tela de entrada (presell, #fr-presell) o botão ficava no fim da coluna, depois de um celular de ~400 px, e passava da altura
// da tela no navegador do Instagram (no espanhol pior: a subheadline quebra em 2 linhas).
// Correção: o botão fica GRUDADO no rodapé da tela (position:sticky, degradê do fundo por trás) e o celular encolhe em tela baixa.
// Uso: node scripts/patch-presell-botao.cjs public/vsl-friends.html [mais arquivos]  (idempotente)
// Rodar de novo depois de regenerar a /friends com o presell. A /es/friends herda (scripts/gerar-vsl-friends-latam.js lê a vsl-friends.html).
const fs = require("fs");
for (const f of process.argv.slice(2)) {
  let s = fs.readFileSync(f, "utf8");
  if (s.includes("ps-rodape")) { console.log(f, "já tinha"); continue; }
  const troca = (a, b) => { if (!s.includes(a)) throw new Error(f + " não achei: " + a.slice(0, 70)); s = s.replace(a, b); };
  troca('<div style="margin-top:auto;padding-top:28px"><button type="button" class="ps-bt">',
    '<div class="ps-rodape" style="margin-top:auto;padding-top:28px;position:sticky;bottom:0;z-index:5;margin-left:-22px;margin-right:-22px;padding-left:22px;padding-right:22px;padding-bottom:max(14px,env(safe-area-inset-bottom));background:linear-gradient(rgba(250,250,246,0),#FAFAF6 38%)"><button type="button" class="ps-bt">');
  troca('<div style="position:relative;margin:26px auto 0;width:186px;flex:none">', '<div class="ps-cel" style="position:relative;margin:26px auto 0;width:186px;flex:none">');
  troca("+'#fr-presell .ps-chip i{", "+'@media (max-height:760px){#fr-presell .ps-cel{transform:scale(.82);transform-origin:top center;margin-bottom:-74px!important}}@media (max-height:660px){#fr-presell .ps-cel{transform:scale(.66);margin-bottom:-138px!important}}'\n+'#fr-presell .ps-chip i{");
  fs.writeFileSync(f, s);
  console.log(f, "ok");
}
