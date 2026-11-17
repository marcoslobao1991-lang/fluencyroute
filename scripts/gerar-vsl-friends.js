// Gera public/vsl-friends.html: site NOVO da VSL nova do inglês (17/11/2026, corte do Marcos no CapCut).
// Base = public/vsl-aula.html (player, cupom DlmRal3, timer, tracking, checkout iguais). Troca:
//  - headline/legenda: "O truque simples pra aprender inglês com Friends"
//  - player aponta pra vsl-ingles-friends (HLS na VPS/R2), rate 1, botão em 12:25 ("clicar no botão abaixo")
//  - hls.js começa no nível mais leve (startLevel 0 + capLevelToPlayerSize)
//  - tudo entre a caixa de oferta e o CTA final vira: RESULTADO (gráficos com dados reais) → PROVA (áudio real do aluno,
//    avaliações Kiwify, comentários reais) → MÉTODO (telas reais do app) → fases → garantia → perguntas.
// Marcos 17/11: "tá faltando mostrar não só o método, mas o método E o resultado... ULTRA PREMIUM com gráficos".
// Dados (todos reais): banco de cenas do app (Friends E01: "I" 132x, "you" 107x; o EP1 cobre 79,5% do EP2;
// as 500 palavras mais usadas = 81,6% das falas), Kiwify 4.099 avaliações média 4,8, áudio do aluno dos EUA (o mesmo da VSL),
// comentários verbatim do vídeo do YouTube (public/yt-comentarios.json). Sem travessão, sem emoji.
const fs = require("fs");
const path = require("path");
const PUB = path.join(__dirname, "..", "public");
let s = fs.readFileSync(path.join(PUB, "vsl-aula.html"), "utf8");
const troca = (a, b) => { if (!s.includes(a)) { console.error("NÃO ACHEI:", a.slice(0, 90)); process.exit(1); } s = s.replace(a, b); };

// 0) quando a oferta abre, os comentários do YouTube DESCEM pro fim da página, igual /vsl, /vsl39, /vsl49 (Marcos 17/11 tarde:
//    "faz igual as outras desce pro fim da pagina"). Lá embaixo eles ganham a classe cm-fim = visual escuro da página.
troca("var desce=function(){if(cmWrap.parentNode!==rod.parentNode){rod.parentNode.insertBefore(cmWrap,rod);cm.style.margin='8px auto 48px'}};", "var desce=function(){if(cmWrap.parentNode!==rod.parentNode){rod.parentNode.insertBefore(cmWrap,rod);cm.style.margin='8px auto 48px';cmWrap.classList.add('cm-fim')}};");
// 0b) SEM CUPOM (Marcos 17/11: "eu não quero a parada de CUPOM APLICADO"): sai o cartão do cupom, o timer e o script que
//     expirava o cupom e trocava o checkout pro jTO3lIy. Fica igual à /vsl de hoje: De R$497, hoje R$29/mês, checkout DlmRal3 fixo.
{ const c0 = s.indexOf('<div class="fr-cup">'), c1 = s.indexOf('<p style="font-size: 16px; color: rgba(255, 255, 255, 0.45);"><span class="fr-de">', c0);
  if (c0 < 0 || c1 < 0) { console.error("cartão do cupom não achado"); process.exit(1); }
  s = s.slice(0, c0) + s.slice(c1);
  const j0 = s.indexOf('<script id="fr-cupom-js">'), j1 = s.indexOf("</script>", j0) + 9;
  if (j0 < 0) { console.error("script do cupom não achado"); process.exit(1); }
  s = s.slice(0, j0) + s.slice(j1);
  s = s.split("Com o cupom, por apenas:").join("Hoje por apenas:").split("Depois que o cupom expirar: 12x de R$49").join("");
  if (/cupom/i.test(s.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " "))) { console.error("sobrou cupom visível"); process.exit(1); } }
// 1) player e textos do topo
troca("var VSLS={rmk:", "var VSLS={friends:{dir:'vsl-ingles-friends',delay:745,scroll:955,rate:1},rmk:");
troca("return 'rmk'})();", "return 'friends'})(); /* 17/11: site novo da VSL de Friends */");
troca("h=new H({maxBufferLength:30,", "var CELM=matchMedia('(max-width:820px)').matches;h=new H({startLevel:0,capLevelToPlayerSize:!CELM,maxBufferLength:30,");
// 17/11 (Marcos: "demora tanto pra dar play"): no celular o capLevelToPlayerSize (tela densidade 3) liberava o 1080p (1,6 MB a cada 4 s).
// Celular fica travado em <=720p; no PC segue pelo tamanho do player.
troca("h.on(H.Events.MANIFEST_PARSED,function(){sawMeta=true;", "h.on(H.Events.MANIFEST_PARSED,function(){try{if(CELM){var cap=-1;h.levels.forEach(function(l,i){if((l.height||0)<=1280&&(cap<0||l.height>h.levels[cap].height))cap=i});if(cap>=0)h.autoLevelCapping=cap}}catch(e){}sawMeta=true;");
// 17/11: a capa do player vinha da VSL antiga (remake) até o JS trocar; agora já nasce com a capa de Friends
troca('poster="https://video.fluencyroute.com.br/vsl-ingles-remake/thumbnail.jpg"', 'poster="https://video.fluencyroute.com.br/vsl-ingles-friends/thumbnail.jpg"');
troca("var key='aula_revealed';", "var key='friends_revealed';");
troca("</b> Método da repetição pra entender séries e filmes em inglês sem legenda</p>", "</b> O truque simples pra aprender inglês com Friends</p>");
troca("<title>Fluency Route</title>", "<title>Fluency Route: inglês com Friends</title>");
const hl0 = s.indexOf('<p id="fr-hl"'), hl1 = s.indexOf("</p>", hl0) + 4;
if (hl0 < 0) { console.error("sem fr-hl"); process.exit(1); }
s = s.slice(0, hl0) + '<p id="fr-hl" style="max-width:420px;margin:0 auto 12px;text-align:center;font-family:Inter,-apple-system,sans-serif;font-size:15px;line-height:1.4;font-weight:500;color:#555"><strong style="font-weight:800;color:#111;letter-spacing:.03em">O TRUQUE SIMPLES</strong><br><span style="white-space:nowrap;font-size:clamp(12px,3.6vw,16px)">pra aprender inglês com <span style="color:#111;font-weight:800;background:linear-gradient(transparent 62%,#bff9ff 62%)">FRIENDS</span></span></p>' + s.slice(hl1);

// 1b) CARD DE OFERTA DO TOPO (Marcos 17/11: "tá tão básico"): o produto aparece (celular com a cena real do app + 2 etiquetas
//     reais do app), o parcelamento sai do cinza 22% ilegível. Preço e checkout NÃO mudam.
troca('Rota da Fluência Essencial</p><div style="height:20px"></div>', 'Rota da Fluência Essencial</p><p class="ofx-sub">O app que treina o seu ouvido com Friends</p>' +
  '<div class="ofx-vis" aria-hidden="true"><div class="ofx-tel"><img src="/app/app-cena-pt.jpg" alt="" width="540" height="1170"></div>' +
  '<span class="ofx-et ofx-et2"><b>Sua tutora</b> sabe o seu nível</span></div>' /* 17/11 Marcos: tira a etiqueta "Friends 24 episódios" */);
troca('<p style="font-size: 13px; color: rgba(255, 255, 255, 0.22); margin-top: 4px;"><span class="fr-parc">', '<p style="font-size: 14px; color: rgba(255, 255, 255, 0.62); margin-top: 6px;"><span class="fr-parc">');

// 2) seções novas entre a oferta e o CTA final
const ini = s.lastIndexOf('<div class="sep"', s.indexOf("METODOLOGIA"));
const fim = s.lastIndexOf('<div class="sep"', s.indexOf("Comece sua jornada"));
if (ini < 0 || fim < 0 || fim <= ini) { console.error("fronteiras", ini, fim); process.exit(1); }

const ONDA = [72,62,32,55,64,85,87,93,48,51,46,24,19,67,64,90,55,69,69,65,56,37,42,74,39,74,79,79,54,77,55,36,67,72,56,29,27,51,28,48,52,70,33,69,50,30,100,55,37,45,76,76,63,62,55,77];
const CTA = (txt) => `<div class="fx-cta"><a href="https://pay.kiwify.com.br/DlmRal3" target="_blank" rel="noopener noreferrer" class="cta-btn"><span>${txt}</span></a></div>`;
const tel = (src, alt, cls = "") => `<div class="fx-tel ${cls}"><img src="/app/${src}" alt="${alt}" loading="lazy" width="540"></div>`;
const cab = (tag, titulo, texto) => `<p class="fx-tag fx-in">${tag}</p><h2 class="fx-h fx-in">${titulo}</h2>${texto ? `<p class="fx-p fx-in">${texto}</p>` : ""}`;
const sec = (conteudo, extra = "") => `<section class="vsl-section fx-sec ${extra}">${conteudo}</section>`;
const ESTRELAS = Array.from({ length: 5 }, () => '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="#FFC94D"/></svg>').join("");

const css = `<style>
.fx-sec{max-width:540px;text-align:center}
.esconder .sep{display:none}
.esconder .vsl-section{padding:40px 20px!important}
@media (min-width:768px){.esconder .vsl-section{padding:64px 24px!important}}
.fx-faixa{margin:0 -20px 34px;overflow:hidden;display:grid;gap:8px;-webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.fx-trilho{display:flex;gap:8px;width:max-content;animation:fxCorre 38s linear infinite}
.fx-trilho.r{animation-direction:reverse;animation-duration:44s}
.fx-trilho img{width:150px;height:84px;object-fit:cover;border-radius:10px;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
@keyframes fxCorre{to{transform:translateX(-50%)}}
.fx-gar{position:relative;max-width:440px;margin:0 auto;border-radius:26px;padding:34px 24px 30px;background:radial-gradient(circle at 50% 0%,rgba(78,205,196,.18),transparent 65%),linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(78,205,196,.3);box-shadow:0 40px 100px rgba(78,205,196,.12)}
.fx-gar .fx-selo{width:110px;margin:0 auto 14px}
.fx-gar-n{display:flex;justify-content:center;gap:10px;margin:18px 0 0}
.fx-gar-n div{flex:1;max-width:170px;border-radius:16px;padding:14px 8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
.fx-gar-n b{display:block;font-size:34px;font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1}
.fx-gar-n span{display:block;margin-top:6px;font-size:12.5px;line-height:1.35;color:rgba(255,255,255,.65)}
@media (prefers-reduced-motion:reduce){.fx-trilho{animation:none}}
.fx-tag{font-family:"JetBrains Mono",monospace;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#4ECDC4;margin:0 0 14px}
.fx-h{font-family:Inter,-apple-system,sans-serif;font-size:clamp(27px,7.4vw,38px);line-height:1.12;font-weight:800;letter-spacing:-.025em;color:#fff;margin:0 0 14px}
.fx-h em{font-style:normal;background:linear-gradient(90deg,#4ECDC4,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
.fx-p{font-size:16.5px;line-height:1.55;color:rgba(255,255,255,.7);margin:0 auto 30px;max-width:410px}
.fx-in{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.fx-in.on{opacity:1;transform:none}
.fx-card{position:relative;border-radius:22px;padding:26px 22px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.09);box-shadow:0 30px 80px rgba(0,0,0,.35);text-align:left;margin:0 auto 18px;max-width:440px}
.fx-leg{display:flex;gap:18px;justify-content:center;font-size:13px;color:rgba(255,255,255,.65);margin:14px 0 0}
.fx-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
/* gráfico 1: esforço cai, entendimento sobe */
.fx-g1 svg{width:100%;height:auto;display:block;overflow:visible}
.fx-g1 .bar{transform-box:fill-box;transform-origin:bottom;transform:scaleY(0);transition:transform 1s cubic-bezier(.16,1,.3,1)}
.fx-g1.on .bar{transform:scaleY(1)}
.fx-g1 .lin{stroke-dasharray:520;stroke-dashoffset:520;transition:stroke-dashoffset 1.8s .5s cubic-bezier(.65,0,.35,1)}
.fx-g1.on .lin{stroke-dashoffset:0}
.fx-g1 .pt{opacity:0;transition:opacity .4s}
.fx-g1.on .pt{opacity:1}
/* números grandes */
.fx-num{font-family:Inter,-apple-system,sans-serif;font-weight:800;letter-spacing:-.04em;line-height:1;color:#fff}
.fx-anel{display:flex;align-items:center;gap:20px}
.fx-anel svg{flex:0 0 120px;width:120px;height:120px;transform:rotate(-90deg)}
.fx-anel .arco{transition:stroke-dashoffset 1.8s cubic-bezier(.65,0,.35,1)}
.fx-anel p{margin:6px 0 0;font-size:15px;line-height:1.45;color:rgba(255,255,255,.72)}
.fx-pal{display:grid;gap:14px;margin-top:6px}
.fx-pal .lin{display:grid;grid-template-columns:52px 1fr 54px;align-items:center;gap:12px}
.fx-pal b{font-family:"JetBrains Mono",monospace;font-size:18px;color:#fff}
.fx-pal .tr{height:14px;border-radius:7px;background:rgba(255,255,255,.07);overflow:hidden}
.fx-pal .tr i{display:block;height:100%;width:0;border-radius:7px;background:linear-gradient(90deg,#4ECDC4,#a78bfa);transition:width 1.6s cubic-bezier(.16,1,.3,1)}
.fx-pal span{font-family:"JetBrains Mono",monospace;font-size:15px;color:#4ECDC4;text-align:right}
.fx-rot{font-size:13px;color:rgba(255,255,255,.5);margin:0 0 14px;font-family:"JetBrains Mono",monospace;letter-spacing:1px;text-transform:uppercase}
/* linha do tempo */
.fx-tl{position:relative;max-width:420px;margin:0 auto;text-align:left;padding-left:34px}
.fx-tl:before{content:"";position:absolute;left:10px;top:6px;bottom:6px;width:2px;background:rgba(255,255,255,.1)}
.fx-tl .enche{position:absolute;left:10px;top:6px;width:2px;height:0;background:linear-gradient(#4ECDC4,#a78bfa);transition:height .2s linear}
.fx-et{position:relative;padding:0 0 30px}
.fx-et:last-child{padding-bottom:0}
.fx-et:before{content:"";position:absolute;left:-30px;top:4px;width:14px;height:14px;border-radius:50%;background:#030305;border:2px solid rgba(255,255,255,.25);transition:all .4s}
.fx-et.on:before{border-color:#4ECDC4;background:#4ECDC4;box-shadow:0 0 0 6px rgba(78,205,196,.15)}
.fx-et small{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:2px;color:#4ECDC4;text-transform:uppercase}
.fx-et h3{margin:6px 0 4px;font-size:19px;font-weight:700;color:#fff;letter-spacing:-.01em}
.fx-et p{margin:0;font-size:15px;line-height:1.5;color:rgba(255,255,255,.65)}
/* áudio do aluno */
.fx-zap{max-width:440px;margin:0 auto;border-radius:22px;overflow:hidden;background:#0b141a;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 40px 90px rgba(0,0,0,.5);text-align:left}
.fx-zap-top{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#1f2c34}
.fx-zap-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#4ECDC4,#2b6f6a);display:flex;align-items:center;justify-content:center;font-weight:800;color:#03201d}
.fx-zap-top b{display:block;color:#e9edef;font-size:15px}
.fx-zap-top span{font-size:12.5px;color:#8696a0}
.fx-zap-msg{padding:22px 14px 18px;background:radial-gradient(circle at 20% 0%,rgba(78,205,196,.06),transparent 60%),#0b141a}
.fx-bolha{display:flex;align-items:center;gap:12px;max-width:340px;padding:10px 12px;border-radius:0 12px 12px 12px;background:#202c33}
.fx-play{flex:0 0 44px;width:44px;height:44px;border-radius:50%;border:0;background:#4ECDC4;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 0 rgba(78,205,196,.5);animation:fxPulso 2.2s infinite}
.fx-play.toca{animation:none}
@keyframes fxPulso{0%{box-shadow:0 0 0 0 rgba(78,205,196,.45)}70%{box-shadow:0 0 0 14px rgba(78,205,196,0)}100%{box-shadow:0 0 0 0 rgba(78,205,196,0)}}
.fx-onda{flex:1;display:flex;align-items:center;gap:2px;height:38px}
.fx-onda i{flex:1;border-radius:2px;background:#8696a0;opacity:.55;transition:background .15s,opacity .15s}
.fx-onda i.ok{background:#4ECDC4;opacity:1}
.fx-tempo{font-size:12px;color:#8696a0;margin:6px 0 0 56px}
.fx-cit{max-width:440px;margin:26px auto 0;display:grid;gap:14px;text-align:left}
.fx-cit blockquote{margin:0;padding:16px 18px;border-left:3px solid #4ECDC4;background:rgba(255,255,255,.03);border-radius:0 14px 14px 0;font-size:17px;line-height:1.45;color:#fff;font-weight:600}
/* avaliações + comentários */
.fx-nota{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0 auto 26px}
.fx-nota .fx-num{font-size:64px}
.fx-nota p{margin:0;font-size:14.5px;color:rgba(255,255,255,.65)}
.fx-yt{display:grid;gap:12px;max-width:440px;margin:0 auto;text-align:left}
.fx-yt div{padding:16px 18px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.fx-yt b{font-size:13px;color:rgba(255,255,255,.55);font-weight:600}
.fx-yt p{margin:6px 0 0;font-size:15.5px;line-height:1.5;color:#fff}
/* app */
.fx-tel{width:min(250px,66vw);margin:0 auto;border-radius:36px;padding:9px;background:linear-gradient(160deg,#2a2a31,#121216);box-shadow:0 0 0 1px rgba(255,255,255,.1),0 40px 90px rgba(78,205,196,.14)}
.fx-tel img{display:block;width:100%;height:auto;border-radius:28px}
.fx-passos{display:grid;gap:42px}
.fx-n{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#4ECDC4;color:#000;font-weight:800;font-size:15px;margin-bottom:12px}
.fx-passo p{font-size:17px;line-height:1.45;color:#fff;font-weight:600;margin:0 auto 18px;max-width:320px}
.fx-mini{width:min(330px,84vw);margin:0 auto;border-radius:18px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.1)}
.fx-mini img{display:block;width:100%}
.fx-fases{display:grid;gap:12px;text-align:left;max-width:420px;margin:0 auto}
.fx-fase{display:flex;gap:16px;align-items:center;padding:18px 20px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.fx-fase b{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:2px;color:#4ECDC4;white-space:nowrap}
.fx-fase span{font-size:16.5px;font-weight:600;color:#fff}
.fx-selo{width:140px;height:auto;margin:0 auto 20px;display:block;filter:drop-shadow(0 20px 40px rgba(78,205,196,.25))}
.fx-faq{text-align:left;max-width:440px;margin:0 auto}
.fx-faq details{border-bottom:1px solid rgba(255,255,255,.1);padding:18px 0}
.fx-faq summary{cursor:pointer;font-weight:600;font-size:16.5px;color:#fff;list-style:none;display:flex;justify-content:space-between;gap:12px}
.fx-faq summary:after{content:"+";color:#4ECDC4;font-weight:400;font-size:22px;line-height:1}
.fx-faq details[open] summary:after{content:"\\2212"}
.fx-faq summary::-webkit-details-marker{display:none}
.fx-faq details p{margin:10px 0 0;font-size:15px;line-height:1.55;color:rgba(255,255,255,.68)}
.fx-cta{max-width:440px;margin:34px auto 0}
/* card de oferta do topo */
.ofx-sub{font-size:15px;color:rgba(255,255,255,.6);margin:2px 0 0}
.ofx-vis{position:relative;width:min(300px,80vw);margin:22px auto 22px;height:350px}
.ofx-vis:before{content:"";position:absolute;inset:10% 6%;background:radial-gradient(circle,rgba(78,205,196,.32),transparent 70%);filter:blur(30px)}
.ofx-tel{position:absolute;left:50%;top:0;transform:translateX(-50%);width:150px;border-radius:26px;padding:6px;background:linear-gradient(160deg,#2c2c33,#111115);box-shadow:0 0 0 1px rgba(255,255,255,.12),0 30px 70px rgba(0,0,0,.6)}
.ofx-tel img{display:block;width:100%;height:auto;border-radius:21px}
.ofx-et{position:absolute;z-index:2;display:flex;flex-direction:column;align-items:flex-start;padding:9px 12px;border-radius:12px;font-size:11.5px;line-height:1.25;color:rgba(255,255,255,.7);background:rgba(18,20,24,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 0 0 1px rgba(255,255,255,.1),0 14px 30px rgba(0,0,0,.45);text-align:left}
.ofx-et b{font-size:13px;color:#fff}
.ofx-et1{left:0;top:58px}
.ofx-et2{right:0;bottom:52px}
/* RESULTADO: cena real do app rodando */
.fx-cena{max-width:440px;margin:0 auto 18px;border-radius:22px;overflow:hidden;background:#0c0d10;box-shadow:0 0 0 1px rgba(255,255,255,.09),0 40px 90px rgba(0,0,0,.5);text-align:left}
.fx-cena-v{position:relative;aspect-ratio:16/9;background:#000;cursor:pointer}
.fx-cena-v video{width:100%;height:100%;object-fit:cover;display:block}
.fx-cena-som{position:absolute;right:10px;bottom:10px;display:flex;align-items:center;gap:6px;padding:7px 11px;border:0;border-radius:999px;background:rgba(0,0,0,.62);color:#fff;font:600 12.5px Inter,-apple-system,sans-serif;cursor:pointer}
.fx-cena-n{position:absolute;left:10px;top:10px;padding:5px 9px;border-radius:8px;background:rgba(0,0,0,.6);color:#fff;font:600 11px "JetBrains Mono",monospace;letter-spacing:1px}
.fx-cena-l{padding:18px 20px 14px}
.fx-cena-en{margin:0;font-size:20px;line-height:1.35;font-weight:800;color:#fff;letter-spacing:-.01em;min-height:54px}
.fx-cena-en span{opacity:.16;transition:opacity .25s}
.fx-cena-en span.ok{opacity:1}
.fx-cena-pt{margin:8px 0 0;font-size:14.5px;line-height:1.45;color:rgba(255,255,255,.55)}
.fx-cena-bar{display:flex;gap:6px;padding:0 20px 18px}
.fx-cena-bar i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden}
.fx-cena-bar i b{display:block;height:100%;width:0;background:#4ECDC4}
/* fases com descrição */
.fx-fase{align-items:flex-start}
.fx-fase div{display:flex;flex-direction:column;gap:4px}
.fx-fase small{font-size:14.5px;line-height:1.45;color:rgba(255,255,255,.62);font-weight:400}
.fx-fase b{padding-top:3px}
/* faixa de fundo pra quebrar a fôrma repetida das seções */
.fx-banda{background:radial-gradient(ellipse at 50% 0%,rgba(78,205,196,.10),transparent 60%),linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0));border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);max-width:none!important}
.fx-banda>*{margin-left:auto;margin-right:auto}
/* comentários quando descem pro fim da página: visual escuro, igual ao resto */
.cm-fim>div{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02))!important;box-shadow:0 0 0 1px rgba(255,255,255,.09)!important;color:#fff!important}
.cm-fim *{color:rgba(255,255,255,.78)!important;border-color:rgba(255,255,255,.1)!important}
.cm-fim b,.cm-fim strong,.cm-fim a{color:#fff!important}
.cm-fim textarea,.cm-fim input{background:rgba(255,255,255,.05)!important;color:#fff!important}
.cm-fim textarea::placeholder,.cm-fim input::placeholder{color:rgba(255,255,255,.45)!important}
.cm-fim button{background:transparent!important;padding-left:0!important}
.cm-fim form button{background:#4ECDC4!important;color:#03201d!important;padding:6px 14px!important}
@media (prefers-reduced-motion:reduce){.fx-in,.fx-g1 .bar,.fx-g1 .lin,.fx-anel .arco,.fx-pal .tr i{transition:none!important}}
</style>`;

// gráfico 1: 5 episódios, barras = esforço pra entender (cai), linha = quanto você entende (sobe). Desenho ilustrativo da tese da VSL.
const EP = [0, 1, 2, 3, 4].map((i) => 40 + i * 64);
const ESF = [150, 98, 66, 46, 34], ENT = [168, 104, 66, 46, 36];
const g1 = `<div class="fx-card fx-g1 fx-anima" style="padding:24px 18px 18px">
<p class="fx-rot" style="margin-left:4px">Do episódio 1 ao 5</p>
<svg viewBox="0 0 340 230" aria-label="Esforço pra entender cai e o quanto você entende sobe a cada episódio">
<defs><linearGradient id="fxb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a78bfa" stop-opacity=".55"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".08"/></linearGradient>
<linearGradient id="fxl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4ECDC4"/><stop offset="1" stop-color="#7ff5e9"/></linearGradient></defs>
${[50, 100, 150].map((y) => `<line x1="12" x2="330" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.06)"/>`).join("")}
${EP.map((x, i) => `<rect class="bar" style="transition-delay:${i * 0.12}s" x="${x - 17}" y="${195 - ESF[i]}" width="34" height="${ESF[i]}" rx="7" fill="url(#fxb)"/>`).join("")}
<path class="lin" d="M${EP[0]} ${ENT[0]} C ${EP[0] + 30} ${ENT[0] - 40}, ${EP[1] - 20} ${ENT[1] + 6}, ${EP[1]} ${ENT[1]} S ${EP[2] - 20} ${ENT[2] + 4}, ${EP[2]} ${ENT[2]} S ${EP[3] - 20} ${ENT[3] + 2}, ${EP[3]} ${ENT[3]} S ${EP[4] - 20} ${ENT[4] + 2}, ${EP[4]} ${ENT[4]}" fill="none" stroke="url(#fxl)" stroke-width="4" stroke-linecap="round"/>
${EP.map((x, i) => `<circle class="pt" style="transition-delay:${0.6 + i * 0.3}s" cx="${x}" cy="${ENT[i]}" r="6" fill="#030305" stroke="#4ECDC4" stroke-width="3"/>`).join("")}
${EP.map((x, i) => `<text x="${x}" y="218" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="12" font-family="JetBrains Mono,monospace">EP ${i + 1}</text>`).join("")}
</svg>
<div class="fx-leg"><span><i style="background:#a78bfa"></i>esforço pra entender</span><span><i style="background:#4ECDC4"></i>o quanto você entende</span></div>
</div>`;

const FAIXA = "<div class=\"fx-faixa\" aria-hidden=\"true\"><div class=\"fx-trilho \"><img src=\"/app/fr/e01-1.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-2.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-3.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-6.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-15.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-1.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-2.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-3.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-6.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-15.jpg\" alt=\"\" loading=\"lazy\"></div><div class=\"fx-trilho r\"><img src=\"/app/c1.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-8.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/c8.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-24.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/c6.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/c1.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-8.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/c8.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/fr/e01-24.jpg\" alt=\"\" loading=\"lazy\"><img src=\"/app/c6.jpg\" alt=\"\" loading=\"lazy\"></div></div>";
// cena real (os 3 clipes do app com a fala de verdade) no lugar do gráfico ilustrativo (Marcos 17/11: "tá tão básico")
const CENAS = [["/app/c1.mp4","/app/c1.jpg","There's nothing to tell. It's just some guy I work with.","Não há nada para contar. É apenas um cara com quem trabalho.",1],
  ["/app/c6.mp4","/app/c6.jpg","Okay, everybody relax. This is not even a date.","Ok, todos relaxem. Isso não é nem mesmo um encontro.",6],
  ["/app/c8.mp4","/app/c8.jpg","Sounds like a date to me.","Parece um encontro para mim.",8]];
const cena = `<div class="fx-cena fx-in" data-cenas='${JSON.stringify(CENAS).replace(/'/g, "&#39;")}'>
<div class="fx-cena-v"><video muted playsinline preload="none" poster="/app/c1.jpg"></video><span class="fx-cena-n">FRIENDS · CENA 1</span>
<button class="fx-cena-som" type="button" aria-label="Ligar o som da cena"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg><span>ouvir</span></button></div>
<div class="fx-cena-l"><p class="fx-cena-en"></p><p class="fx-cena-pt"></p></div>
<div class="fx-cena-bar"><i><b></b></i><i><b></b></i><i><b></b></i></div></div>`;
const resultado = sec(FAIXA + cab("O RESULTADO", "Em dias, você entende seu primeiro episódio de Friends <em>100% em inglês, sem legenda</em>", "É esta cena aqui. Hoje ela é embolada. Depois do treino, você entende cada palavra.") + cena + `
<div class="fx-card fx-anima fx-anel-card"><div class="fx-anel">
<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"/><circle class="arco" cx="60" cy="60" r="50" fill="none" stroke="url(#fxl)" stroke-width="12" stroke-linecap="round" stroke-dasharray="314.16" stroke-dashoffset="314.16" data-alvo="${(314.16 * (1 - 0.795)).toFixed(2)}"/></svg>
<div><div class="fx-num" style="font-size:46px"><span class="fx-conta" data-ate="79.5" data-dec="1">0</span>%</div><p>do que se fala no episódio 2 já apareceu no episódio 1. Você chega no segundo episódio já sabendo a maior parte.</p></div></div></div>
<div class="fx-card fx-anima fx-pal-card"><p class="fx-rot">Só no primeiro episódio</p><div class="fx-pal">
<div class="lin"><b>I</b><div class="tr"><i data-w="100"></i></div><span><span class="fx-conta" data-ate="132">0</span>x</span></div>
<div class="lin"><b>you</b><div class="tr"><i data-w="81"></i></div><span><span class="fx-conta" data-ate="107">0</span>x</span></div>
</div><p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,.7)">E as <b style="color:#fff">500 palavras</b> mais usadas cobrem <b style="color:#4ECDC4"><span class="fx-conta" data-ate="81.6" data-dec="1">0</span>%</b> de todas as falas de Friends.</p></div>`);

const rota = sec(cab("SUA ROTA", "O que muda no seu inglês", "") + `<div class="fx-tl"><span class="enche"></span>
<div class="fx-et"><small>Primeira cena</small><h3>O embolado começa a ficar nítido</h3><p>Você percebe que eles falam numa velocidade normal.</p></div>
<div class="fx-et"><small>Em questão de dias</small><h3>Seu primeiro episódio inteiro</h3><p>20 minutos de conversa, do começo ao fim, 100% em inglês e sem legenda.</p></div>
<div class="fx-et"><small>5 episódios</small><h3>Seu inglês muda de nível</h3><p>Você entende seus primeiros discursos completos e a fala começa a sair no automático.</p></div>
<div class="fx-et"><small>Daí em diante</small><h3>Inglês operacional</h3><p>Filmes sem legenda, conversa em inglês, livro no original. A própria imersão te deixa mais fluente a cada dia.</p></div>
</div>`);

const prova = sec(cab("A PROVA", "Ele morava nos Estados Unidos e fazia aula presencial lá", "Até começar os treinos concentrados. Escuta o áudio que ele me mandou.") + `
<div class="fx-zap fx-in"><div class="fx-zap-top"><div class="fx-zap-av">A</div><div><b>Aluno da Fluency Route</b><span>mora nos EUA · áudio real</span></div></div>
<div class="fx-zap-msg"><div class="fx-bolha"><button class="fx-play" type="button" aria-label="Tocar o áudio do aluno"><svg class="ic-play" width="18" height="18" viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="#03201d"/></svg><svg class="ic-pause" width="18" height="18" viewBox="0 0 24 24" style="display:none"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="#03201d"/></svg></button>
<div class="fx-onda">${ONDA.map((h) => `<i style="height:${h}%"></i>`).join("")}</div></div>
<div class="fx-tempo"><span class="fx-t">0:00</span> / 1:02</div>
<audio class="fx-audio" src="/app/aluno.m4a" preload="none"></audio></div></div>
<div class="fx-cit">
<blockquote class="fx-in">"Eu saí fora do curso pra fazer o seu curso."</blockquote>
<blockquote class="fx-in">"A minha esposa também saiu do curso, porque ela viu que dá resultado."</blockquote>
<blockquote class="fx-in">"Quando você ouve o discurso e entende aquilo que você não entendia, é muito prazeroso."</blockquote>
</div>`, "fx-banda");

const social = sec(`<div class="fx-nota fx-in"><div class="fx-num">4,8</div><div style="display:flex;gap:4px">${ESTRELAS}</div><p><b style="color:#fff">4.099 avaliações</b> de alunos na Kiwify</p></div>
<p class="fx-rot fx-in">Comentários reais no YouTube</p>
<div class="fx-yt">
<div class="fx-in"><b>@davii_pp</b><p>Deem um Oscar a esse senhor! Eu aprendo assim e funciona!</p></div>
<div class="fx-in"><b>@fabiana_fab</b><p>Eu dou aula de inglês particular, morei e me formei nos USA. Falei pra uma aluna ainda hoje que a única diferença entre o meu inglês e o dela está em quantas vezes, de forma repetitiva, eu ouvi e apliquei. Não tem segredo.</p></div>
<div class="fx-in"><b>@elviscdn6583</b><p>Estudo há uns 10 anos por conta própria, parado no nível B2. Consigo assistir tranquilamente em inglês, mas o falar nunca evoluiu. Agora eu descobri o porquê.</p></div>
</div>` + CTA("QUERO COMEÇAR AGORA"));

// O MÉTODO = GRAVAÇÃO DE TELA DO APP REAL (scripts/demo-real.js). Antes era o app redesenhado em código (scripts/demo-app.js);
// Marcos 17/11: "tá faltando ficar mais realista o APP".
const DEMO = require("./demo-real");
const metodo = sec(cab("O MÉTODO", "Veja o app funcionando", "É assim que você treina com Friends todos os dias.") + DEMO.html);
const fases = sec(cab("AS FASES", "Do ouvido à imersão", "") + `<div class="fx-fases">
<div class="fx-fase fx-in"><b>FASE 1</b><div><span>Treino de ouvido</span><small>Cena por cena, sem legenda, até o embolado virar palavra.</small></div></div>
<div class="fx-fase fx-in"><b>FASE 2</b><div><span>Treino de fala</span><small>Você assiste, imita o jeito do personagem e a fala começa a sair.</small></div></div>
<div class="fx-fase fx-in"><b>FASE 3</b><div><span>Rota para a imersão</span><small>Episódio inteiro, depois outras séries. O inglês vira hábito.</small></div></div>
</div>`);

const garantia = sec(`<div class="fx-gar fx-in"><img class="fx-selo" src="/shield-guarantee.png" alt="Garantia" loading="lazy"><h2 class="fx-h" style="margin-bottom:8px">Risco zero pra você</h2><p class="fx-p" style="margin-bottom:0">Se não for pra você, devolvemos 100% do seu dinheiro.</p><div class="fx-gar-n"><div><b>7 dias</b><span>garantia incondicional, sem pergunta</span></div><div><b>90 dias</b><span>garantia estendida pra aplicar o método</span></div></div></div>`);

const faq = sec(`<p class="fx-tag">PERGUNTAS</p><div class="fx-faq">
<details><summary>Preciso saber inglês antes?</summary><p>Não. Funciona pra quem está começando e pra quem já estudou mas trava na hora de entender e falar.</p></details>
<details><summary>Quanto tempo por dia?</summary><p>30 minutos já fazem diferença, e boa parte do treino de ouvido dá pra fazer enquanto você faz outras coisas.</p></details>
<details><summary>Funciona no celular?</summary><p>Sim. O aplicativo roda no celular, no tablet e no computador.</p></details>
<details><summary>Tem suporte?</summary><p>Sim, pelo WhatsApp, pra tirar dúvida e ajustar o seu treino.</p></details>
</div>`);

const js = `<script>
(function(){
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('on');io.unobserve(el);anima(el)})},{threshold:.25}):null;
function conta(el){var ate=parseFloat(el.getAttribute('data-ate')),dec=+(el.getAttribute('data-dec')||0),t0=null,D=1600;
function f(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/D),v=ate*(1-Math.pow(1-p,3));el.textContent=v.toFixed(dec).replace('.',',');if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
function anima(el){el.querySelectorAll('.fx-conta').forEach(conta);
el.querySelectorAll('.arco').forEach(function(c){c.style.strokeDashoffset=c.getAttribute('data-alvo')});
el.querySelectorAll('.tr i').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%'})}
function liga(){document.querySelectorAll('.fx-in,.fx-anima,.fx-et').forEach(function(el){if(io)io.observe(el);else{el.classList.add('on');anima(el)}})}
// a oferta aparece depois (classe esconder sai): observa quando ficar visível
liga();
// linha do tempo que enche com a rolagem
var tl=document.querySelector('.fx-tl'),en=tl&&tl.querySelector('.enche');
function rola(){if(!tl)return;var r=tl.getBoundingClientRect(),h=window.innerHeight,p=Math.min(1,Math.max(0,(h*.6-r.top)/r.height));en.style.height=(p*(r.height-12))+'px'}
window.addEventListener('scroll',rola,{passive:true});rola();
// cena real do RESULTADO: roda os 3 clipes mudos, a fala acende palavra por palavra, toque liga o som
(function(){var c=document.querySelector('.fx-cena');if(!c)return;var L=JSON.parse(c.getAttribute('data-cenas')),v=c.querySelector('video'),en=c.querySelector('.fx-cena-en'),pt=c.querySelector('.fx-cena-pt'),n=c.querySelector('.fx-cena-n'),bs=c.querySelectorAll('.fx-cena-bar b'),som=c.querySelector('.fx-cena-som'),k=0,ativo=false;
function toca(){var p=v.play();if(p&&p.catch)p.catch(function(){})}
function monta(i){k=i;var x=L[i];v.src=x[0];v.poster=x[1];n.textContent='FRIENDS · CENA '+x[4];en.innerHTML=x[2].split(' ').map(function(w){return '<span>'+w+'</span>'}).join(' ');pt.textContent=x[3];for(var j=0;j<bs.length;j++)bs[j].style.width=j<i?'100%':'0';toca()}
v.addEventListener('timeupdate',function(){var d=v.duration||3,p=v.currentTime/d,sp=en.querySelectorAll('span'),m=Math.ceil(p*1.15*sp.length);for(var j=0;j<sp.length;j++)sp[j].classList.toggle('ok',j<m);if(bs[k])bs[k].style.width=(p*100)+'%'});
v.addEventListener('ended',function(){var sp=en.querySelectorAll('span');for(var j=0;j<sp.length;j++)sp[j].classList.add('ok');setTimeout(function(){monta((k+1)%L.length)},1400)});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!ativo){ativo=true;monta(0)}else if(v.paused)toca()}else if(ativo)v.pause()})},{threshold:.4}).observe(c)}else{ativo=true;monta(0)}
function alterna(){v.muted=!v.muted;som.querySelector('span').textContent=v.muted?'ouvir':'som ligado';if(!v.muted){try{var mv=document.getElementById('fr-video');if(mv&&!mv.paused)mv.pause()}catch(e){}try{track('cena_som','on')}catch(e){}if(v.paused)toca()}}
som.addEventListener('click',function(e){e.stopPropagation();alterna()});c.querySelector('.fx-cena-v').addEventListener('click',alterna);
})();
// player do áudio do aluno
var a=document.querySelector('.fx-audio'),bt=document.querySelector('.fx-play');if(!a||!bt)return;
var barras=document.querySelectorAll('.fx-onda i'),tt=document.querySelector('.fx-t');
function ic(t){bt.querySelector('.ic-play').style.display=t?'none':'';bt.querySelector('.ic-pause').style.display=t?'':'none';bt.classList.toggle('toca',t)}
bt.addEventListener('click',function(){if(a.paused){try{var v=document.getElementById('fr-video');if(v&&!v.paused)v.pause()}catch(e){}a.play();try{track('audio_aluno','play')}catch(e){}}else a.pause()});
a.addEventListener('play',function(){ic(true)});a.addEventListener('pause',function(){ic(false)});a.addEventListener('ended',function(){ic(false)});
a.addEventListener('timeupdate',function(){var d=a.duration||62.6,p=a.currentTime/d,n=Math.round(p*barras.length);for(var i=0;i<barras.length;i++)barras[i].classList.toggle('ok',i<n);var s=Math.floor(a.currentTime);tt.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')});
document.querySelector('.fx-onda').addEventListener('click',function(e){var r=this.getBoundingClientRect();var d=a.duration||62.6;a.currentTime=(e.clientX-r.left)/r.width*d;if(a.paused)bt.click()});
})();
</script>`;

// PREÇO (Marcos 17/11: "altera para 19 mensais e pega o link de menos de 200 na kiwify"): só NESTA página.
// Checkout ESzq5JN = Inglês Funcional R$193 (12x R$19,96). A /vsl continua R$29 + DlmRal3 (regra 1 do AGENTS.md).
const PRECO = (x) => { const n = x.split('DlmRal3').length - 1; if (n < 1) { console.error('sem DlmRal3'); process.exit(1); }
  return x.split('DlmRal3').join('ESzq5JN').split('class="fr-v">R$29<').join('class="fr-v">R$19<').split('12x no cartão ou R$289 no Pix').join('12x no cartão ou R$193 no Pix').split('var VALUE=289.00;').join('var VALUE=193.00;'); };
s = s.slice(0, ini) + css + DEMO.css + resultado + rota + prova + social + metodo + fases + garantia + faq + s.slice(fim);
// o script das animações vai no fim do body (depois de tudo existir)
s = s.replace("</body>", js + DEMO.js + "</body>");
s = PRECO(s);
if (/DlmRal3|R$289|VALUE=289/.test(s)) { console.error("sobrou preço antigo"); process.exit(1); }
fs.writeFileSync(path.join(PUB, "vsl-friends.html"), s);
console.log("ok · vsl-friends.html", (s.length / 1024).toFixed(0), "KB");
