// DEMO DO APP rodando dentro de um celular (17/11/2026, Marcos: "ao invés de prints do APP, uma DEMO-APP rodando...").
// App recriado em código com o visual real (telas de referência em public/app/*.jpg), cenas REAIS do Friends S01E01
// (storage do app, falas e tradução do banco: ~/ingles-cantado/Friends (01.ª temporada)__E01. Piloto.json).
// Roda sozinho quando aparece na tela (dedo fantasma tocando), pausa quando sai, e aceita toque nos capítulos.
// Capítulos: série → episódio → cena sem legenda → EN/PT → marca como foi → treino de fala com nota → tutora.

const css = `<style>
.dm{max-width:460px;margin:0 auto}
.dm-cel{position:relative;width:292px;height:612px;margin:0 auto;border-radius:46px;padding:11px;background:linear-gradient(160deg,#2c2c33,#0f0f12);box-shadow:0 0 0 1px rgba(255,255,255,.12),0 0 0 7px #08080a,0 0 0 8px rgba(255,255,255,.08),0 50px 110px rgba(78,205,196,.18),0 30px 60px rgba(0,0,0,.6)}
.dm-ilha{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:86px;height:24px;border-radius:14px;background:#000;z-index:9}
.dm-tela{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:#fff;color:#14141a;font-family:Inter,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.dm-st{display:flex;justify-content:space-between;align-items:center;padding:14px 24px 0;font-size:12px;font-weight:700;height:30px}
.dm-st i{display:inline-block;width:22px;height:10px;border:1.5px solid #14141a;border-radius:3px;position:relative}
.dm-st i:after{content:"";position:absolute;inset:1.5px;right:5px;background:#14141a;border-radius:1px}
.dm-s{position:absolute;inset:44px 0 0 0;opacity:0;transform:translateX(24px);transition:opacity .45s ease,transform .45s cubic-bezier(.16,1,.3,1);pointer-events:none;display:flex;flex-direction:column}
.dm-s.on{opacity:1;transform:none;pointer-events:auto}
.dm-s.sai{opacity:0;transform:translateX(-24px)}
.dm-top{display:flex;align-items:center;gap:10px;padding:8px 16px 10px;border-bottom:1px solid #f0f0f4}
.dm-top .vol{font-size:18px;color:#9a9aa8;line-height:1}
.dm-top b{display:block;font-size:14px}
.dm-top small{display:block;font-size:10.5px;color:#12B5AC;font-weight:600}
.dm-pad{padding:14px 14px}
.dm-h1{font-size:19px;font-weight:800;letter-spacing:-.02em;margin:2px 0 4px}
.dm-sub{font-size:11px;color:#6d6d7a;line-height:1.4;margin:0 0 12px}
.dm-ser{display:flex;align-items:center;gap:10px;height:62px;border-radius:14px;padding:0 14px;color:#fff;margin-bottom:9px;font-weight:800;font-size:14.5px;position:relative;transition:transform .15s}
.dm-ser small{display:block;font-weight:500;font-size:10.5px;opacity:.85}
.dm-ser:after{content:"\\203A";position:absolute;right:14px;font-size:20px;opacity:.8}
.dm-ser .ico{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900}
.dm-rev{background:linear-gradient(135deg,#a3a3b8,#8b8ba3)}
.dm-fr{background:linear-gradient(135deg,#5b2a86,#3d1c63)}
.dm-ta{background:linear-gradient(135deg,#f27b1e,#d4561a)}
.dm-hi{background:linear-gradient(135deg,#2f6fe0,#1f4fb3)}
.dm-ep{display:flex;align-items:center;gap:11px;border:1px solid #ececf2;border-radius:12px;padding:10px 12px;margin-bottom:8px;transition:transform .15s,background .15s}
.dm-ep b{flex:0 0 28px;height:28px;border-radius:8px;background:#f1edff;color:#6b4dff;font-size:11px;display:flex;align-items:center;justify-content:center}
.dm-ep span{font-size:12.5px;font-weight:700;line-height:1.2}
.dm-ep small{display:block;font-size:10px;color:#9a9aa8;font-weight:500}
.dm-tag{text-align:center;font-size:10px;font-weight:800;letter-spacing:1.5px;color:#f2a516;margin:4px 0 8px}
.dm-vid{position:relative;margin:0 14px;border-radius:14px;overflow:hidden;background:#000;aspect-ratio:16/9;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.dm-vid video,.dm-vid img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.dm-vid .bar{position:absolute;left:10px;right:10px;bottom:8px;height:3px;border-radius:2px;background:rgba(255,255,255,.3)}
.dm-vid .bar i{display:block;height:100%;width:0;background:#fff;border-radius:2px}
.dm-dica{text-align:center;font-size:11px;color:#6d6d7a;margin:9px 0 8px}
.dm-chips{display:flex;justify-content:center;gap:6px}
.dm-chip{border:1px solid #e6e6ee;border-radius:20px;padding:6px 11px;font-size:11px;font-weight:700;color:#3a3a46;background:#fff;transition:all .2s}
.dm-chip.ativo{background:#6b4dff;color:#fff;border-color:#6b4dff}
.dm-chip.ativo2{background:#12B5AC;color:#fff;border-color:#12B5AC}
.dm-txt{min-height:92px;padding:12px 18px 0;text-align:center}
.dm-en{font-size:15.5px;font-weight:800;line-height:1.3;letter-spacing:-.01em;color:#14141a}
.dm-en span{opacity:0;transition:opacity .2s,color .2s}
.dm-en span.v{opacity:1}
.dm-en span.k{color:#6b4dff}
.dm-pt{font-size:11.5px;color:#6d6d7a;line-height:1.4;margin-top:6px;opacity:0;transform:translateY(6px);transition:all .4s}
.dm-pt.v{opacity:1;transform:none}
.dm-nav{display:flex;justify-content:space-between;align-items:center;padding:0 16px;margin-top:auto;font-size:10.5px;color:#9a9aa8;font-weight:600}
.dm-nav b{color:#14141a;border:1px solid #ececf2;border-radius:16px;padding:5px 10px}
.dm-notas{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:10px 14px 18px}
.dm-nota{border:1.5px solid;border-radius:11px;text-align:center;padding:8px 0 6px;font-size:12px;font-weight:800;transition:transform .15s,box-shadow .2s}
.dm-nota small{display:block;font-size:9.5px;font-weight:600;opacity:.6}
.dm-n1{color:#e5484d;border-color:#f6c6c8}.dm-n2{color:#f08c00;border-color:#fbdcae}.dm-n3{color:#12a150;border-color:#bfe8cf}.dm-n4{color:#12a150;border-color:#bfe8cf;background:#e9f8ef}
.dm-nota.ok{box-shadow:0 0 0 3px rgba(18,161,80,.25)}
.dm-toast{position:absolute;left:50%;bottom:150px;transform:translate(-50%,10px);background:#14141a;color:#fff;font-size:11.5px;font-weight:600;padding:8px 13px;border-radius:20px;opacity:0;transition:all .35s;white-space:nowrap;z-index:5}
.dm-toast.v{opacity:1;transform:translate(-50%,0)}
.dm-mic{width:74px;height:74px;border-radius:50%;margin:16px auto 6px;background:linear-gradient(135deg,#7b5cff,#5a3df0);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(107,77,255,.45);transition:transform .2s}
.dm-mic.grava{transform:scale(1.12);box-shadow:0 0 0 12px rgba(107,77,255,.15),0 0 0 24px rgba(107,77,255,.08)}
.dm-micl{text-align:center;font-size:10.5px;color:#9a9aa8;font-weight:600}
.dm-ondas{display:flex;justify-content:center;align-items:center;gap:3px;height:34px;margin-top:6px;opacity:0;transition:opacity .2s}
.dm-ondas.v{opacity:1}
.dm-ondas i{width:4px;border-radius:2px;background:#6b4dff;height:6px;transition:height .12s}
.dm-res{margin:6px 14px 0;border-radius:14px;background:#f7f6ff;padding:12px;display:flex;gap:12px;align-items:center;opacity:0;transform:translateY(10px);transition:all .45s}
.dm-res.v{opacity:1;transform:none}
.dm-anel{flex:0 0 58px;width:58px;height:58px;position:relative}
.dm-anel svg{width:58px;height:58px;transform:rotate(-90deg)}
.dm-anel b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900}
.dm-res p{margin:0;font-size:12px;line-height:1.35;font-weight:700}
.dm-res .w{font-size:11.5px;font-weight:600;color:#6d6d7a;margin-top:4px}
.dm-res .g{color:#12a150}.dm-res .y{color:#f08c00}
.dm-chat{flex:1;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden}
.dm-card{border-radius:12px;background:#f1edff;padding:9px 11px;font-size:11px;font-weight:700;color:#3d2a99}
.dm-card small{display:block;font-weight:500;color:#7a6fb8;font-size:10px}
.dm-b{max-width:82%;padding:9px 11px;border-radius:14px;font-size:11.5px;line-height:1.4;opacity:0;transform:translateY(8px);transition:all .35s}
.dm-b.v{opacity:1;transform:none}
.dm-eu{align-self:flex-end;background:#6b4dff;color:#fff;border-bottom-right-radius:4px}
.dm-ela{align-self:flex-start;background:#f3f3f7;color:#14141a;border-bottom-left-radius:4px}
.dm-ela q{display:block;margin:5px 0;padding:5px 8px;border-radius:8px;background:#ebe6ff;color:#4b2fe0;font-weight:700;quotes:none}
.dm-dots{align-self:flex-start;background:#f3f3f7;border-radius:14px;padding:10px 12px;display:none;gap:4px}
.dm-dots.v{display:flex}
.dm-dots i{width:6px;height:6px;border-radius:50%;background:#a3a3b0;animation:dmP 1s infinite}
.dm-dots i:nth-child(2){animation-delay:.15s}.dm-dots i:nth-child(3){animation-delay:.3s}
@keyframes dmP{0%,100%{opacity:.3;transform:none}50%{opacity:1;transform:translateY(-3px)}}
.dm-ent{display:flex;gap:8px;align-items:center;padding:10px 12px 18px;border-top:1px solid #f0f0f4}
.dm-ent span{flex:1;border:1px solid #ececf2;border-radius:18px;padding:8px 12px;font-size:11px;color:#a3a3b0}
.dm-ent b{width:30px;height:30px;border-radius:50%;background:#6b4dff}
.dm-dedo{position:absolute;left:0;top:0;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(255,255,255,.95);box-shadow:0 6px 20px rgba(0,0,0,.35);z-index:20;pointer-events:none;opacity:0;transition:left .55s cubic-bezier(.4,0,.2,1),top .55s cubic-bezier(.4,0,.2,1),opacity .3s,transform .15s}
.dm-dedo.v{opacity:1}
.dm-dedo.t{transform:scale(.72);background:rgba(107,77,255,.45)}
.dm-press{transform:scale(.96)}
.dm-caps{display:flex;flex-wrap:nowrap;justify-content:center;gap:4px;margin:26px auto 0;max-width:420px}
.dm-cap{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);color:rgba(255,255,255,.7);border-radius:22px;padding:6px 9px;font-size:12px;white-space:nowrap;font-weight:600;cursor:pointer;font-family:inherit;transition:all .25s}
.dm-cap.on{background:#4ECDC4;border-color:#4ECDC4;color:#03201d}
.dm-leg{min-height:52px;margin:16px auto 0;max-width:400px;text-align:center;font-size:18px;font-weight:700;color:#fff;line-height:1.35;transition:opacity .3s}
.dm-som{display:block;margin:14px auto 0;border:0;background:none;color:rgba(255,255,255,.55);font-size:13px;font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.dm-lock{inset:0!important;color:#fff;align-items:center;overflow:hidden}
.dm-wall{position:absolute;inset:-20px;background:url(/app/c6.jpg) center/cover;filter:blur(18px) brightness(.55) saturate(1.2);transform:scale(1.15)}
.dm-lock>*:not(.dm-wall){position:relative}
.dm-fone-pill{display:flex;align-items:center;gap:6px;margin-top:52px;padding:5px 11px;border-radius:14px;background:rgba(255,255,255,.16);backdrop-filter:blur(8px);font-size:10.5px;font-weight:700}
.dm-hora{font-size:64px;font-weight:700;letter-spacing:-2px;line-height:1;margin-top:10px}
.dm-data{font-size:13px;font-weight:600;opacity:.85;margin-top:4px}
.dm-np{width:244px;margin-top:26px;border-radius:22px;padding:14px;background:rgba(30,30,40,.45);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 0 0 1px rgba(255,255,255,.12)}
.dm-np-top{display:flex;gap:10px;align-items:center}
.dm-np-top img{width:42px;height:42px;border-radius:9px;object-fit:cover}
.dm-np-top b{display:block;font-size:13px}
.dm-np-top small{display:block;font-size:10.5px;opacity:.7}
.dm-np-fala{margin:12px 0 10px;min-height:36px;font-size:13.5px;font-weight:700;line-height:1.3;transition:opacity .25s}
.dm-np-bar{height:4px;border-radius:2px;background:rgba(255,255,255,.25)}
.dm-np-bar i{display:block;height:100%;width:0;border-radius:2px;background:#fff}
.dm-np-ctl{display:flex;justify-content:space-around;align-items:center;margin-top:10px;font-size:18px}
.dm-np-ctl b{font-size:20px;letter-spacing:-3px}
.dm-ouvido{margin-top:18px;padding:7px 13px;border-radius:14px;background:rgba(78,205,196,.22);font-size:11.5px;font-weight:600}
.dm-ouvido b{font-size:14px;color:#7ff5e9}
@media (max-width:340px){.dm-cel{transform:scale(.9);transform-origin:top center;margin-bottom:-60px}}
</style>`;

const PLAY = '<svg width="10" height="10" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z" fill="#fff"/></svg>';
const MIC = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const top = (titulo, sub) => `<div class="dm-top"><span class="vol">&#8249;</span><div><b>${titulo}</b>${sub ? `<small>${sub}</small>` : ""}</div></div>`;

const html = `<div class="dm" id="dm">
<div class="dm-cel"><div class="dm-ilha"></div><div class="dm-tela">
<div class="dm-st"><span>9:41</span><i></i></div>

<div class="dm-s" data-s="series">${top("Listening", "")}<div class="dm-pad">
<div class="dm-h1">Escolhe a série</div><p class="dm-sub">Entra numa série pra treinar do seu jeito, ou faz a revisão do dia.</p>
<div class="dm-ser dm-rev"><span class="ico">R</span><div>Revisão do dia<small>tudo em dia</small></div></div>
<div class="dm-ser dm-fr" data-alvo="friends"><span class="ico">F</span><div>Friends<small>24 episódios</small></div></div>
<div class="dm-ser dm-ta"><span class="ico">T</span><div>Two and a Half Men<small>24 episódios</small></div></div>
<div class="dm-ser dm-hi"><span class="ico">H</span><div>How I Met Your Mother<small>22 episódios</small></div></div>
</div></div>

<div class="dm-s dm-lock" data-s="fone"><div class="dm-wall"></div>
<div class="dm-fone-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.6" fill="#fff"/><rect x="17" y="14" width="4" height="7" rx="1.6" fill="#fff"/></svg>Fone conectado</div>
<div class="dm-hora">9:41</div><div class="dm-data">terça-feira, 17 de novembro</div>
<div class="dm-np"><div class="dm-np-top"><img src="/app/c1.jpg" alt=""><div><b>Friends · Piloto</b><small data-volta>cenas 1 a 8 em repetição · volta 1</small></div></div>
<div class="dm-np-fala" data-fala>There's nothing to tell.</div>
<div class="dm-np-bar"><i data-npbar></i></div>
<div class="dm-np-ctl"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z" fill="#fff"/></svg><svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="#fff"/></svg><svg width="18" height="18" viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="#fff"/></svg></div></div>
<div class="dm-ouvido"><b data-ouvido>0</b> <span data-ouvt>cenas</span> no ouvido hoje</div>
</div>

<div class="dm-s" data-s="eps">${top("Friends", "")}<div class="dm-pad">
<p class="dm-sub" style="margin-top:2px">Cada episódio tem seu treino com repetição espaçada, salvo por episódio.</p>
<div class="dm-ep" data-alvo="piloto"><b>01</b><span>Piloto<small>277 cenas</small></span></div>
<div class="dm-ep"><b>02</b><span>Aquele da Ultrassonografia no Final<small>307 cenas</small></span></div>
<div class="dm-ep"><b>03</b><span>Aquele do Dedão<small>305 cenas</small></span></div>
<div class="dm-ep"><b>04</b><span>Aquele com George Stephanopoulos<small>329 cenas</small></span></div>
<div class="dm-ep"><b>05</b><span>Aquele com o Sabão em Pó<small>332 cenas</small></span></div>
<div class="dm-ep"><b>06</b><span>Aquele do Traseiro<small>324 cenas</small></span></div>
</div></div>

<div class="dm-s" data-s="cena">${top("Piloto", "Friends · 0 no ouvido")}
<p class="dm-tag" data-tag>NOVA · CENA 1/277</p>
<div class="dm-vid"><img data-poster alt=""><video data-v muted playsinline preload="none"></video><div class="bar"><i data-bar></i></div></div>
<p class="dm-dica">Assiste sem legenda e tenta entender.</p>
<div class="dm-chips"><span class="dm-chip" data-alvo="repetir">repetir</span><span class="dm-chip" data-alvo="en">EN</span><span class="dm-chip" data-alvo="pt">PT</span></div>
<div class="dm-txt"><div class="dm-en" data-en></div><div class="dm-pt" data-pt></div></div>
<div class="dm-nav"><span>&#8249; anterior</span><span data-n>1 / 277</span><b>próxima &#8250;</b></div>
<div class="dm-notas"><div class="dm-nota dm-n1" data-alvo="naoent">não entendi<small>agora</small></div><div class="dm-nota dm-n2" data-alvo="dificil">difícil<small>1d</small></div><div class="dm-nota dm-n3" data-alvo="entendi">entendi<small>1d</small></div><div class="dm-nota dm-n4" data-alvo="facil">fácil<small>3d</small></div></div>
<div class="dm-toast" data-toast></div>
</div>

<div class="dm-s" data-s="fala">${top("Piloto", "treino de fala")}
<p class="dm-tag" style="color:#6b4dff">IMITA A CENA</p>
<div class="dm-vid"><img data-poster alt=""><video data-v muted playsinline preload="none"></video><div class="bar"><i data-bar></i></div></div>
<p class="dm-dica">Assiste sem ler e imita o jeitão.</p>
<div class="dm-mic" data-alvo="mic">${MIC}</div><p class="dm-micl">segure e IMITA</p>
<div class="dm-ondas" data-ondas>${Array.from({ length: 22 }, () => "<i></i>").join("")}</div>
<div class="dm-res" data-res><div class="dm-anel"><svg viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" fill="none" stroke="#e6e2ff" stroke-width="6"/><circle data-arco cx="29" cy="29" r="24" fill="none" stroke="#12a150" stroke-width="6" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="150.8" style="transition:stroke-dashoffset 1.2s ease"/></svg><b data-nota>0</b></div>
<div><p>Pronúncia</p><div class="w"><span class="g">Okay,</span> <span class="y">everybody</span> <span class="g">relax. This is not even a date.</span></div><div class="w" style="margin-top:3px">Só o <span class="y">everybody</span> saiu travado.</div></div></div>
</div>

<div class="dm-s" data-s="tutora"><div class="dm-top"><span class="vol">&#8249;</span><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#8b6dff,#5a3df0)"></div><div><b>Sua tutora</b><small>online agora · sabe o seu nível</small></div></div>
<div class="dm-chat"><div class="dm-card">Treino de hoje · Friends<small>cena 8/277 · piloto</small></div>
<div class="dm-b dm-eu" data-b1>Travei na cena 8. Não entendi o que ele falou.</div>
<div class="dm-dots" data-dots><i></i><i></i><i></i></div>
<div class="dm-b dm-ela" data-b2>Normal, é fala emendada. Ele disse:<q>Sounds like a date to me.</q>O "sounds like a" sai tudo colado. Volta 2 vezes e depois deixa tocando no fone.</div>
<div class="dm-b dm-eu" data-b3>E se eu esquecer amanhã?</div>
<div class="dm-b dm-ela" data-b4>Não vai. Coloquei essa cena na sua revisão de amanhã, antes de sumir da cabeça.</div>
</div><div class="dm-ent"><span>Pergunte qualquer coisa...</span><b></b></div></div>

<div class="dm-dedo" data-dedo></div>
</div></div>
<div class="dm-caps"><button class="dm-cap" data-cap="0">Séries</button><button class="dm-cap" data-cap="1">Cenas</button><button class="dm-cap" data-cap="2">Revisão</button><button class="dm-cap" data-cap="3">Fone</button><button class="dm-cap" data-cap="4">Fala</button><button class="dm-cap" data-cap="5">Tutora</button></div>
<p class="dm-leg" data-leg></p>
<button class="dm-som" type="button" data-som>ativar o som da cena</button>
</div>`;

const js = `<script>
(function(){
var R=document.getElementById('dm');if(!R)return;
var tela=R.querySelector('.dm-tela'),dedo=R.querySelector('[data-dedo]'),leg=R.querySelector('[data-leg]');
var S={};R.querySelectorAll('.dm-s').forEach(function(e){S[e.getAttribute('data-s')]=e});
var caps=R.querySelectorAll('.dm-cap'),somBt=R.querySelector('[data-som]'),som=false,run=0,vivo=false,cap=0;
var CENAS={c1:{v:'/app/c1.mp4',p:'/app/c1.jpg',d:3000,en:"There's nothing to tell. It's just some guy I work with.",pt:'Não há nada para contar. É apenas um cara com quem trabalho.',n:1},
c6:{v:'/app/c6.mp4',p:'/app/c6.jpg',d:3000,en:'Okay, everybody relax. This is not even a date.',pt:'Ok, todos relaxem. Isso não é nem mesmo um encontro.',n:6},
c8:{v:'/app/c8.mp4',p:'/app/c8.jpg',d:1550,en:'Sounds like a date to me.',pt:'Parece um encontro para mim.',n:8}};
function q(s,sel){return s.querySelector(sel)}
function W(id,ms){return new Promise(function(ok,no){setTimeout(function(){id===run?ok():no(0)},ms)})}
var atual=null;
function mostra(nome){var n=S[nome];if(atual===n)return;if(atual){var a=atual;a.classList.remove('on');a.classList.add('sai');setTimeout(function(){a.classList.remove('sai')},460);var v=q(a,'[data-v]');if(v)try{v.pause()}catch(e){}}n.classList.add('on');atual=n}
function texto(t){leg.style.opacity=0;setTimeout(function(){leg.textContent=t;leg.style.opacity=1},200)}
function marca(i){cap=i;caps.forEach(function(c,k){c.classList.toggle('on',k===i)})}
function pos(el){var r=el.getBoundingClientRect(),t=tela.getBoundingClientRect();return{x:r.left-t.left+r.width/2,y:r.top-t.top+r.height/2}}
function vai(id,el,segura){var p=pos(el);dedo.classList.add('v');dedo.style.left=p.x+'px';dedo.style.top=p.y+'px';return W(id,600).then(function(){dedo.classList.add('t');el.classList.add('dm-press');return W(id,segura||220)}).then(function(){dedo.classList.remove('t');el.classList.remove('dm-press');return W(id,150)})}
function some(){dedo.classList.remove('v')}
function toca(id,s,c){var v=q(s,'[data-v]'),im=q(s,'[data-poster]'),b=q(s,'[data-bar]');im.src=c.p;if(v.getAttribute('src')!==c.v){v.src=c.v}v.muted=!som;try{v.currentTime=0}catch(e){}var p=v.play();if(p&&p.catch)p.catch(function(){});
var t0=Date.now();b.style.transition='none';b.style.width='0';var tk=setInterval(function(){var f=Math.min(1,(Date.now()-t0)/c.d);b.style.width=(f*100)+'%';if(f>=1||id!==run)clearInterval(tk)},60);return W(id,c.d+250)}
function limpaCena(s,c){q(s,'[data-en]').innerHTML=c.en.split(' ').map(function(w){return '<span>'+w+'</span>'}).join(' ');var pt=q(s,'[data-pt]');pt.textContent=c.pt;pt.classList.remove('v');q(s,'[data-tag]').textContent='NOVA · CENA '+c.n+'/277';q(s,'[data-n]').textContent=c.n+' / 277';
s.querySelectorAll('.dm-chip').forEach(function(x){x.classList.remove('ativo','ativo2')});s.querySelectorAll('.dm-nota').forEach(function(x){x.classList.remove('ok')});q(s,'[data-toast]').classList.remove('v');q(s,'[data-poster]').src=c.p}
function karaoke(id,s){var ws=s.querySelectorAll('[data-en] span'),i=0;return new Promise(function(ok,no){(function f(){if(id!==run)return no(0);if(i>0)ws[i-1].classList.remove('k');if(i>=ws.length)return ok();ws[i].classList.add('v','k');i++;setTimeout(f,170)})()})}
function avalia(id,s,qual,msg){var el=q(s,'[data-alvo="'+qual+'"]'),t=q(s,'[data-toast]');return vai(id,el).then(function(){el.classList.add('ok');t.textContent=msg;t.classList.add('v');return W(id,1500)}).then(function(){t.classList.remove('v')})}

function cenaFluxo(id,c,qual,msg,comPT){var s=S.cena;limpaCena(s,c);mostra('cena');marca(c.n===1?1:2);
texto('Assiste a cena real sem legenda e tenta entender.');
return W(id,700).then(function(){return toca(id,s,c)}).then(function(){texto('Travou? Abre a frase em inglês.');return vai(id,q(s,'[data-alvo="en"]'))}).then(function(){q(s,'[data-alvo="en"]').classList.add('ativo');return karaoke(id,s)})
.then(function(){if(!comPT)return;texto('E em português, se precisar.');return vai(id,q(s,'[data-alvo="pt"]')).then(function(){q(s,'[data-alvo="pt"]').classList.add('ativo2');q(s,'[data-pt]').classList.add('v');return W(id,1400)})})
.then(function(){texto('Marca como foi. A cena volta na hora certa pra você revisar.');marca(2);return avalia(id,s,qual,msg)})}

function falaFluxo(id){var s=S.fala,c=CENAS.c6,res=q(s,'[data-res]'),ond=q(s,'[data-ondas]'),mic=q(s,'[data-alvo="mic"]'),ar=q(s,'[data-arco]'),nt=q(s,'[data-nota]');
res.classList.remove('v');ar.style.strokeDashoffset=150.8;nt.textContent='0';q(s,'[data-poster]').src=c.p;mostra('fala');marca(4);some();
texto('Agora a fala: assiste a cena e imita o jeito deles.');
return W(id,600).then(function(){return toca(id,s,c)}).then(function(){texto('Segura o microfone e fala junto.');var p=pos(mic);dedo.classList.add('v');dedo.style.left=p.x+'px';dedo.style.top=p.y+'px';return W(id,650)})
.then(function(){dedo.classList.add('t');mic.classList.add('grava');ond.classList.add('v');var bs=ond.querySelectorAll('i'),t0=Date.now();var tk=setInterval(function(){if(id!==run||Date.now()-t0>2600){clearInterval(tk);return}bs.forEach(function(b){b.style.height=(6+Math.random()*26)+'px'})},110);return W(id,2700)})
.then(function(){dedo.classList.remove('t');mic.classList.remove('grava');ond.classList.remove('v');some();texto('A inteligência artificial mostra onde você está bem e onde precisa melhorar.');res.classList.add('v');return W(id,350)})
.then(function(){ar.style.strokeDashoffset=150.8*(1-.86);var k=0;var tk=setInterval(function(){k+=3;if(k>=86){k=86;clearInterval(tk)}nt.textContent=k},35);return W(id,3200)})}

function tutoraFluxo(id){var s=S.tutora;['b1','b2','b3','b4'].forEach(function(k){q(s,'[data-'+k+']').classList.remove('v')});q(s,'[data-dots]').classList.remove('v');mostra('tutora');marca(5);some();
texto('Travou? Pergunta pra sua tutora. Ela sabe em que cena você está.');
function bolha(k,ms){q(s,'[data-'+k+']').classList.add('v');return W(id,ms)}
function digita(ms){var d=q(s,'[data-dots]');d.classList.add('v');return W(id,ms).then(function(){d.classList.remove('v')})}
return W(id,800).then(function(){return bolha('b1',900)}).then(function(){return digita(1300)}).then(function(){return bolha('b2',2600)}).then(function(){return bolha('b3',900)}).then(function(){return digita(1100)}).then(function(){return bolha('b4',3200)})}

function foneFluxo(id){var s=S.fone,fl=q(s,"[data-fala]"),vt=q(s,"[data-volta]"),ou=q(s,"[data-ouvido]"),br=q(s,"[data-npbar]");mostra("fone");marca(3);some();
var LUG=["Dirigindo pro trabalho.","Na academia.","Lavando a louça."],ORD=[CENAS.c1,CENAS.c6,CENAS.c8],n=0;
texto("Depois, as cenas que você treinou ficam tocando no fone enquanto você faz outras coisas.");
var v=document.createElement("audio");
function fala(i){var c=ORD[i%3];fl.style.opacity=0;setTimeout(function(){fl.textContent=c.en},250);setTimeout(function(){fl.style.opacity=1},260);vt.textContent="cenas 1 a 8 em repetição · volta "+(1+Math.floor(i/3));n=Math.min(8,n+1);ou.textContent=n;q(s,"[data-ouvt]").textContent=n===1?"cena":"cenas";if(som){v.src=c.v;var p=v.play();if(p&&p.catch)p.catch(function(){})}
br.style.transition="none";br.style.width="0";setTimeout(function(){br.style.transition="width "+(c.d/1000+.6)+"s linear";br.style.width="100%"},30);return W(id,c.d+700)}
ou.textContent="0";var i=0;function lugar(k){texto(LUG[k]+" As cenas tocando no fone.")}
return W(id,2600).then(function(){lugar(0);return fala(i++)}).then(function(){return fala(i++)}).then(function(){return fala(i++)}).then(function(){lugar(1);return fala(i++)}).then(function(){return fala(i++)}).then(function(){lugar(2);return fala(i++)}).then(function(){return fala(i++)}).then(function(){texto("Sem parar o seu dia, o seu ouvido vai se acostumando com o inglês de verdade.");return W(id,2600)}).then(function(){try{v.pause()}catch(e){}},function(e){try{v.pause()}catch(x){}throw e})}
function seriesFluxo(id){mostra('series');marca(0);some();texto('Você escolhe a série.');
return W(id,1300).then(function(){return vai(id,q(S.series,'[data-alvo="friends"]'))}).then(function(){mostra('eps');texto('Cada episódio vem dividido em cenas curtas.');return W(id,1300)})
.then(function(){return vai(id,q(S.eps,'[data-alvo="piloto"]'))})}

var FLUXO=[seriesFluxo,function(id){return cenaFluxo(id,CENAS.c1,'entendi','Volta amanhã pra revisar',true)},function(id){return cenaFluxo(id,CENAS.c8,'dificil','Volta amanhã, antes de você esquecer',false)},foneFluxo,falaFluxo,tutoraFluxo];
function roda(de){var id=++run;var i=de;(function prox(){if(id!==run)return;FLUXO[i](id).then(function(){i=(i+1)%FLUXO.length;return W(id,900)}).then(prox,function(){})})()}
function para(){run++;some();R.querySelectorAll('[data-v]').forEach(function(v){try{v.pause()}catch(e){}})}
caps.forEach(function(c){c.addEventListener('click',function(){var k=+c.getAttribute('data-cap');roda(k)})});
somBt.addEventListener('click',function(){som=!som;somBt.textContent=som?'desativar o som da cena':'ativar o som da cena';R.querySelectorAll('[data-v]').forEach(function(v){v.muted=!som});if(som){try{var fv=document.getElementById('fr-video');if(fv&&!fv.paused)fv.pause()}catch(e){}}try{track('demo_som',som?'on':'off')}catch(e){}});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!vivo){vivo=true;roda(cap);try{track('demo_app','viu')}catch(x){}}else if(!e.isIntersecting&&vivo){vivo=false;para()}})},{threshold:.35}).observe(R.querySelector('.dm-cel'))}else{roda(0)}
mostra('series');
})();
</script>`;

module.exports = { css, html, js };
