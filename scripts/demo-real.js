// DEMO DO APP REAL (17/11/2026, Marcos: "o app funcionando ali tá faltando ficar mais realista o APP").
// No lugar do app redesenhado em código (scripts/demo-app.js), roda a GRAVAÇÃO DE TELA do app de verdade
// (app.fluencyroute.com.br, conta do Marcos, sem a tela inicial com nome/usuário): Listening → Friends → episódios →
// cena tocando → legenda EN → tradução PT → próxima cena → Shadowing → cena com "segure e IMITA".
// Arquivo: public/app/demo-real.mp4 (35 s, 540x1168, sem áudio) + poster demo-real.jpg. Gravado por ~/spy-meta/_app-grava.mjs.
// Não usa a Tutora: na gravação ela respondeu "minha conexão falhou" (avisado ao Marcos).

const CAPS = [
  [0, "Séries", "Você escolhe a série."],
  [2.2, "Episódios", "Cada episódio tem a sua revisão salva."],
  [4.6, "Cena", "A cena roda sem legenda. Você tenta entender."],
  [10.4, "Legenda", "Travou? Abre a fala em inglês."],
  [13.3, "Tradução", "E a tradução, só se precisar."],
  [16.3, "Próxima", "Próxima cena, e o ouvido vai pegando o ritmo."],
  [23.8, "Fala", "No Shadowing, você imita a cena e se grava."],
  [35, "Fone", "Depois, as cenas ficam tocando no fone enquanto você faz outras coisas."],
];
// FONE (Marcos 17/11: "o fone pode só voltar como estava ali antes"): tela de bloqueio com as cenas tocando no fone,
// igual à demo antiga (scripts/demo-app.js). Entra quando a gravação termina (35 s) e dura FONE_S; depois volta pro começo.
const FONE_S = 14;
const FALAS = ["There's nothing to tell.", "Okay, everybody relax.", "This is not even a date.", "Sounds like a date to me."];

const css = `<style>
.dr{max-width:460px;margin:0 auto}
.dr-cel{position:relative;width:292px;height:612px;margin:0 auto;border-radius:46px;padding:11px;background:linear-gradient(160deg,#2c2c33,#0f0f12);box-shadow:0 0 0 1px rgba(255,255,255,.12),0 0 0 7px #08080a,0 0 0 8px rgba(255,255,255,.08),0 50px 110px rgba(78,205,196,.18),0 30px 60px rgba(0,0,0,.6)}
.dr-tela{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:#fff}
.dr-tela video{position:absolute;left:0;right:0;top:40px;bottom:0;width:100%;height:calc(100% - 40px);object-fit:contain;object-position:top center;display:block;background:#fff}
.dr-st{position:absolute;left:0;right:0;top:0;height:40px;display:flex;justify-content:space-between;align-items:center;padding:6px 22px 0 26px;font:700 12.5px -apple-system,"SF Pro Text",Inter,sans-serif;color:#111;background:#fff;z-index:2}
.dr-st span{display:flex;align-items:center;gap:5px}
.dr-st svg{display:block}
.dr-ilha{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:86px;height:24px;border-radius:14px;background:#000;z-index:3}
.dr-caps{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:22px auto 0;max-width:420px}
.dr-caps button{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:rgba(255,255,255,.62);font:600 12.5px Inter,-apple-system,sans-serif;padding:7px 12px;border-radius:999px;cursor:pointer;transition:all .2s}
.dr-caps button.on{background:#4ECDC4;border-color:#4ECDC4;color:#03201d}
.dr-leg{min-height:24px;margin:14px auto 0;font-size:16px;font-weight:600;color:#fff;max-width:340px;transition:opacity .25s}
.dr-bar{height:3px;max-width:260px;margin:12px auto 0;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden}
.dr-bar i{display:block;height:100%;width:0;background:#4ECDC4}
.dr-real{display:inline-block;margin:12px 0 0;font:600 11px "JetBrains Mono",monospace;letter-spacing:2px;color:rgba(255,255,255,.45);text-transform:uppercase}
.dr-lock{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;color:#fff;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .5s;font-family:-apple-system,"SF Pro Text",Inter,sans-serif}
.dr-lock.on{opacity:1}
.dr-wall{position:absolute;inset:-20px;background:url(/app/c6.jpg) center/cover;filter:blur(18px) brightness(.55) saturate(1.2);transform:scale(1.15)}
.dr-lock>*:not(.dr-wall){position:relative}
.dr-pill{display:flex;align-items:center;gap:6px;margin-top:52px;padding:5px 11px;border-radius:14px;background:rgba(255,255,255,.16);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-size:10.5px;font-weight:700}
.dr-hora{font-size:64px;font-weight:700;letter-spacing:-2px;line-height:1;margin-top:10px}
.dr-data{font-size:13px;font-weight:600;opacity:.85;margin-top:4px}
.dr-np{width:244px;margin-top:26px;border-radius:22px;padding:14px;background:rgba(30,30,40,.45);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 0 0 1px rgba(255,255,255,.12);text-align:left}
.dr-np-top{display:flex;gap:10px;align-items:center}
.dr-np-top img{width:42px;height:42px;border-radius:9px;object-fit:cover}
.dr-np-top b{display:block;font-size:13px}
.dr-np-top small{display:block;font-size:10.5px;opacity:.7}
.dr-np-fala{margin:12px 0 10px;min-height:36px;font-size:13.5px;font-weight:700;line-height:1.3;transition:opacity .25s}
.dr-np-bar{height:4px;border-radius:2px;background:rgba(255,255,255,.25)}
.dr-np-bar i{display:block;height:100%;width:0;border-radius:2px;background:#fff}
.dr-np-ctl{display:flex;justify-content:space-around;align-items:center;margin-top:10px}
.dr-ouvido{margin-top:18px;padding:7px 13px;border-radius:14px;background:rgba(78,205,196,.22);font-size:11.5px;font-weight:600}
.dr-ouvido b{font-size:14px;color:#7ff5e9}
@media (max-width:360px){.dr-cel{transform:scale(.9);transform-origin:top center;margin-bottom:-60px}}
</style>`;

const html = `<div class="dr fx-in">
<div class="dr-cel"><div class="dr-ilha"></div><div class="dr-tela"><div class="dr-st" aria-hidden="true"><b>9:41</b><span><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#111"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="#111"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#111"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="#111"/></svg><svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2.2 0 4.2.9 5.7 2.3l1.2-1.2A9.7 9.7 0 0 0 7.5.5 9.7 9.7 0 0 0 .6 3.3l1.2 1.2a8 8 0 0 1 5.7-2.3zm0 3.4c1.3 0 2.5.5 3.4 1.3l1.2-1.2a6.6 6.6 0 0 0-9.2 0l1.2 1.2c.9-.8 2.1-1.3 3.4-1.3zm0 3.4c.4 0 .8.2 1.1.4L7.5 10.6 6.4 9.4c.3-.2.7-.4 1.1-.4z" fill="#111"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke="#111" opacity=".45"/><rect x="2" y="2" width="17" height="8" rx="2" fill="#111"/><rect x="22.5" y="4" width="1.8" height="4" rx=".9" fill="#111" opacity=".45"/></svg></span></div><div class="dr-lock" aria-hidden="true"><div class="dr-wall"></div>
<div class="dr-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.6" fill="#fff"/><rect x="17" y="14" width="4" height="7" rx="1.6" fill="#fff"/></svg>Fone conectado</div>
<div class="dr-hora">9:41</div><div class="dr-data">terça-feira, 17 de novembro</div>
<div class="dr-np"><div class="dr-np-top"><img src="/app/c1.jpg" alt=""><div><b>Friends · Piloto</b><small class="dr-volta">cenas 1 a 8 em repetição · volta 1</small></div></div>
<div class="dr-np-fala">There's nothing to tell.</div><div class="dr-np-bar"><i></i></div>
<div class="dr-np-ctl"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z" fill="#fff"/></svg><svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="#fff"/></svg><svg width="18" height="18" viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="#fff"/></svg></div></div>
<div class="dr-ouvido"><b class="dr-n">0</b> cenas no ouvido hoje</div></div><video muted playsinline preload="none" poster="/app/demo-real.jpg?v=2" aria-label="Gravação de tela do app da Fluency Route"><source src="/app/demo-real.mp4?v=2" type="video/mp4"></video></div></div>
<div class="dr-caps">${CAPS.map((c, i) => `<button type="button" data-t="${c[0]}"${i ? "" : ' class="on"'}>${c[1]}</button>`).join("")}</div>
<p class="dr-leg">${CAPS[0][2]}</p>
<div class="dr-bar"><i></i></div>
<span class="dr-real">gravação de tela do app real</span>
</div>`;

const js = `<script>
(function(){var w=document.querySelector('.dr');if(!w)return;var v=w.querySelector('video'),bs=w.querySelectorAll('.dr-caps button'),leg=w.querySelector('.dr-leg'),bar=w.querySelector('.dr-bar i');
var C=${JSON.stringify(CAPS)},atual=-1,FS=${FONE_S},F=${JSON.stringify(FALAS)},lock=w.querySelector('.dr-lock'),fl=w.querySelector('.dr-np-fala'),nb=w.querySelector('.dr-np-bar i'),nn=w.querySelector('.dr-n'),vt=w.querySelector('.dr-volta'),fone=false,ft=null,f0=0;
function total(){return (v.duration||35)+FS}
function pinta(k,t){if(k!==atual){atual=k;for(var j=0;j<bs.length;j++)bs[j].classList.toggle('on',j===k);leg.textContent=C[k][2]}bar.style.width=(t/total()*100)+'%'}
function sai(){fone=false;clearInterval(ft);lock.classList.remove('on')}
function entra(){fone=true;v.pause();lock.classList.add('on');f0=Date.now();var i=-1,dur=FS*1000/7;clearInterval(ft);
function passo(){i++;if(i>=7){sai();v.currentTime=0;toca();return}fl.style.opacity=0;setTimeout(function(){fl.textContent=F[i%F.length];fl.style.opacity=1},250);nn.textContent=i+1;vt.textContent='cenas 1 a 8 em repetição · volta '+(1+Math.floor(i/F.length));nb.style.transition='none';nb.style.width='0';setTimeout(function(){nb.style.transition='width '+(dur/1000-.2)+'s linear';nb.style.width='100%'},30)}
passo();ft=setInterval(function(){passo();pinta(C.length-1,(v.duration||35)+(Date.now()-f0)/1000)},dur);pinta(C.length-1,v.duration||35)}
v.addEventListener('ended',entra);
function marca(){if(fone)return;var t=v.currentTime||0,k=0;for(var i=0;i<C.length-1;i++)if(t>=C[i][0])k=i;pinta(k,t)}
v.addEventListener('timeupdate',marca);
function toca(){var p=v.play();if(p&&p.catch)p.catch(function(){})}
for(var i=0;i<bs.length;i++)bs[i].addEventListener('click',function(){var t=+this.getAttribute('data-t');if(t>=35){entra()}else{sai();v.currentTime=t+.05;toca();marca()}try{track('demo_cap',this.textContent)}catch(e){}});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(v.preload!=='auto'){v.preload='auto';v.load()}if(!fone)toca()}else v.pause()})},{threshold:.35}).observe(w)}else toca();
})();
</script>`;

module.exports = { css, html, js };
