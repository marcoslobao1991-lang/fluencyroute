// 18/11 Marcos: "deixa mais estiloso a headline e subheadline e coloca um DEMO-APP, como se fosse um print da tela do app".
// Troca o bloco do ?modo=quiz no GERADOR: headline em adesivo, FRIENDS em pílula, e um celular com a GRAVAÇÃO REAL do app
// (public/app/demo-real.mp4, muda, em loop) no lugar da foto. O toque no botão continua sendo o play da VSL com som.
const fs = require("fs");
const p = __dirname + "/gerar-vsl-friends.js";
let s = fs.readFileSync(p, "utf8");
const ini = s.indexOf("if(MODO==='quiz'){");
const fim = s.indexOf("un.innerHTML='<style>@keyframes gtIn");
if (ini < 0 || fim < 0 || fim < ini) { console.log("bloco do quiz não encontrado"); process.exit(1); }

const PRESELL = `if(MODO==='quiz'){
var ps=document.createElement('div');ps.id='fr-presell';
ps.setAttribute('style','position:fixed;inset:0;z-index:2147483000;background:#FAFAF6;color:#111;overflow:auto;-webkit-overflow-scrolling:touch;font-family:Inter,-apple-system,sans-serif');
ps.innerHTML='<style>'
+'@keyframes psIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
+'@keyframes psPulso{0%{box-shadow:0 0 0 0 rgba(18,181,172,.55)}70%{box-shadow:0 0 0 18px rgba(18,181,172,0)}100%{box-shadow:0 0 0 0 rgba(18,181,172,0)}}'
+'@keyframes psSeta{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}'
+'@keyframes psBoia{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(-4deg)}}'
+'@keyframes psChip{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}'
+'@keyframes psCarimbo{from{opacity:0;transform:rotate(-3deg) scale(1.25)}to{opacity:1;transform:rotate(-3deg) scale(1)}}'
+'#fr-presell .ps-bt{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;border:0;border-radius:18px;background:#12B5AC;color:#fff;font:900 17px/1 Inter,-apple-system,sans-serif;letter-spacing:.01em;white-space:nowrap;padding:22px 16px;cursor:pointer;animation:psPulso 1.8s infinite;transition:transform .1s}'
+'#fr-presell .ps-bt:active{transform:scale(.97)}#fr-presell .ps-bt svg{animation:psSeta 1s ease-in-out infinite}'
+'#fr-presell .ps-chip{position:absolute;display:flex;align-items:center;gap:7px;background:#fff;border-radius:999px;padding:9px 13px 9px 10px;font:800 13px/1 Inter,-apple-system,sans-serif;color:#111;box-shadow:0 10px 26px rgba(0,0,0,.12),0 0 0 1px rgba(0,0,0,.04);white-space:nowrap;animation:psChip 3s ease-in-out infinite}'
+'#fr-presell .ps-chip i{width:22px;height:22px;border-radius:50%;background:#e3f7f5;display:flex;align-items:center;justify-content:center}'
+'</style>'
+'<div style="min-height:100%;max-width:440px;margin:0 auto;padding:24px 22px 26px;box-sizing:border-box;display:flex;flex-direction:column;animation:psIn .45s ease-out both">'
// topo de quiz: marca + barra de progresso
+'<div style="display:flex;align-items:center;justify-content:space-between;font:800 11px/1 JetBrains Mono,monospace;letter-spacing:2.5px;color:#0B6E68"><span>FLUENCY ROUTE</span><span style="color:#9a9a92">PASSO 1 DE 2</span></div>'
+'<div style="height:6px;border-radius:9px;background:#e6e5df;margin-top:12px;overflow:hidden"><div style="width:50%;height:100%;border-radius:9px;background:#12B5AC"></div></div>'
// HEADLINE: TRUQUE em preto, SIMPLES num carimbo verde-água inclinado
+'<div style="margin-top:26px;text-align:center;line-height:1">'
+'<div style="font-size:clamp(46px,14vw,60px);font-weight:900;letter-spacing:-.045em;line-height:.9">TRUQUE</div>'
+'<div style="display:inline-block;margin-top:6px;padding:4px 16px 6px;background:#12B5AC;color:#fff;border-radius:12px;font-size:clamp(46px,14vw,60px);font-weight:900;letter-spacing:-.045em;line-height:.95;box-shadow:0 10px 24px rgba(18,181,172,.35);animation:psCarimbo .5s .25s cubic-bezier(.2,1.6,.4,1) both">SIMPLES</div>'
// SUBHEADLINE: FRIENDS numa pílula escura + linha com fone
+'<div style="margin-top:18px;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;font-size:clamp(18px,5.4vw,22px);font-weight:800;letter-spacing:-.01em">pra aprender inglês com <span style="display:inline-block;background:#111;color:#fff;border-radius:9px;padding:6px 11px 5px;font-weight:900;letter-spacing:.14em;font-size:.86em">FRIENDS</span></div>'
+'<div style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:clamp(15px,4.4vw,17px);font-weight:500;font-style:italic;color:#666"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12B5AC" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.8" y="14" width="4.4" height="7" rx="1.8" fill="#12B5AC"/><rect x="16.8" y="14" width="4.4" height="7" rx="1.8" fill="#12B5AC"/></svg>enquanto faz outras coisas do seu dia</div>'
+'</div>'
// DEMO-APP: celular com a gravação real do app rodando muda + 2 etiquetas
+'<div style="position:relative;margin:26px auto 0;width:186px;flex:none">'
+'<div style="position:absolute;inset:-30px -60px;background:radial-gradient(closest-side,rgba(18,181,172,.20),rgba(18,181,172,0));pointer-events:none"></div>'
+'<div style="position:relative;width:186px;aspect-ratio:540/1168;padding:7px;border-radius:30px;background:linear-gradient(160deg,#2e2e35,#0d0d10);box-shadow:0 26px 50px rgba(0,0,0,.28),0 0 0 2px rgba(255,255,255,.5);animation:psBoia 4s ease-in-out infinite;box-sizing:content-box">'
+'<div style="position:relative;width:100%;height:100%;border-radius:24px;overflow:hidden;background:#fff"><video src="/app/demo-real.mp4?v=2" poster="/app/demo-real.jpg" muted autoplay loop playsinline preload="auto" style="width:100%;height:100%;object-fit:cover;display:block"></video></div>'
+'<div style="position:absolute;top:13px;left:50%;transform:translateX(-50%);width:56px;height:15px;border-radius:99px;background:#000"></div></div>'
+'<div class="ps-chip" style="left:-70px;top:22%"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0B6E68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg></i>repete a cena</div>'
+'<div class="ps-chip" style="right:-72px;top:58%;animation-delay:1.2s"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0B6E68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/></svg></i>treino de fala</div>'
+'</div>'
// botão
+'<div style="margin-top:auto;padding-top:28px"><button type="button" class="ps-bt">TOQUE PARA CONTINUAR<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>'
+'</div>';
document.body.appendChild(ps);var ov=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
ps.querySelector('.ps-bt').addEventListener('click',function(){try{track('presell_play','botao')}catch(x){}
un.click();
try{var dv=ps.querySelector('video');if(dv){dv.pause();dv.removeAttribute('src');dv.load()}}catch(x){}
document.documentElement.style.overflow=ov;ps.remove();
try{window.scrollTo(0,0)}catch(x){}});
return}
`;
s = s.slice(0, ini) + PRESELL + s.slice(fim);
fs.writeFileSync(p, s);
console.log("ok");
