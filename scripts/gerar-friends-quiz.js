// Gera public/vsl-friends-quiz.html = a /friends com o QUIZ DEMO-APP por cima (rota /friends-quiz, teste paralelo, 24/11).
// A página do vídeo carrega por trás (modo auto, pausada); no "Assistir demonstração" o quiz some e a VSL começa do zero COM SOM
// (o toque no quiz vale nesta página: mesmo domínio). Enquanto o quiz está aberto, a página do vídeo NÃO registra nada (fila).
// A /friends original NÃO é tocada. Rodar de novo sempre que a vsl-friends.html mudar: node scripts/gerar-friends-quiz.js
const fs = require('fs');
const path = require('path');
const P = path.join(__dirname, '..', 'public');
let s = fs.readFileSync(path.join(P, 'vsl-friends.html'), 'utf8');
const troca = (a, b, nome) => { if (!s.includes(a)) throw new Error('não achei: ' + nome); s = s.replace(a, b); };

// 1) modo do player: AUTO sempre (vídeo nítido, sem presell nem cadeado)
troca("var MODO=(new URLSearchParams(location.search).get('modo')||'quiz')", "var MODO='auto'", 'MODO');
// 2) versão própria no painel
troca("var VTAG=(qp().get('af')?'af_':'')+'vsl_'+VSLV", "var VTAG=(qp().get('af')?'af_':'')+'vsl_quiz_'+VSLV", 'VTAG');
// 3) enquanto o quiz está aberto, segura os eventos da página do vídeo (só a entrada passa)
troca('function frTrack(event,detail){if(noTrack())return;', "function frTrack(event,detail){if(noTrack())return;if(window.__qzAberto&&event!=='entrada'){(window.__qzFila=window.__qzFila||[]).length<80&&window.__qzFila.push([event,detail]);return}", 'frTrack');
// 4) o quiz por cima + o gancho que dá o play com som
const ponte = `<script>
(function(){var q=location.search;window.__qzAberto=!/[?&](oferta|reveal)=1/.test(q);
if(!window.__qzAberto)return;
document.documentElement.style.overflow='hidden';
// fora do body: a página é um export do Next e a hidratação do React apaga nós extras dentro do body
var f=document.createElement('iframe');f.id='qz';f.title='Demonstração';f.src='/quiz-en.html'+(q||'');f.setAttribute('style','position:fixed;left:0;top:0;width:100%;height:100vh;height:100dvh;border:0;z-index:2147483647;background:#F5F6F8');
var poe=function(){if(window.__qzAberto&&!f.isConnected)document.documentElement.appendChild(f)};poe();var vigia=setInterval(function(){poe();if(!window.__qzAberto)clearInterval(vigia)},400);
// o vídeo fica parado atrás do quiz (não gasta o começo da VSL)
var pausa=setInterval(function(){var v=document.getElementById('fr-video');if(v&&!v.paused&&window.__qzAberto)v.pause();if(!window.__qzAberto)clearInterval(pausa)},300);
window.frComecar=function(){var f=document.getElementById('qz');if(f)f.remove();document.documentElement.style.overflow='';window.__qzAberto=false;window.scrollTo(0,0);
  var fila=window.__qzFila||[];window.__qzFila=[];try{fila.forEach(function(x){window.frTrack(x[0],x[1])})}catch(e){}
  try{window.frTrack('quiz_para_video','1')}catch(e){}
  var u=document.getElementById('fr-unmute');if(u)u.click();else{var v=document.getElementById('fr-video');if(v){v.muted=false;v.currentTime=0;v.play()}}};
})();
</script>`;
troca('<body style="margin:0;padding:0;background:#0A0A0A;color:#fff;font-family:var(--font-dm-sans), sans-serif">', '<body style="margin:0;padding:0;background:#0A0A0A;color:#fff;font-family:var(--font-dm-sans), sans-serif">' + ponte, 'body');
fs.writeFileSync(path.join(P, 'vsl-friends-quiz.html'), s);

// 5) o quiz: no fim chama a página de trás; aberto sozinho, cai na /friends-quiz sem o quiz (?oferta não, só ?de=quiz)
let q = fs.readFileSync(path.join(P, 'quiz-en.html'), 'utf8');
const fimVelho = "var qs=location.search?location.search+'&':'?';location.href='/friends'+qs+'de=quiz';";
if (q.includes(fimVelho)) q = q.replace(fimVelho, "try{if(window.parent!==window&&window.parent.frComecar){window.parent.frComecar();return}}catch(e){}\n    var qs=location.search?location.search+'&':'?';location.href='/friends'+qs+'modo=auto&de=quiz';");
fs.writeFileSync(path.join(P, 'quiz-en.html'), q);
console.log('ok · vsl-friends-quiz.html', s.length, '· quiz-en ligado ao frComecar:', q.includes('parent.frComecar'));
