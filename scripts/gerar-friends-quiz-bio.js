// Gera public/vsl-friends-quiz-bio.html: o TYPEBOT do inglês (/friends-quiz) pro LINK DA BIO (/aberta). 24/11/2026, Marcos:
// "altera a slug da aberta pra página de typebot… pra colocar um pouco mais de atrito pras pessoas que vêm da bio".
// Muda só: rastreio de bio (utm_source=instagram&utm_medium=bio se chegar sem UTM), VTAG vsl_quiz_<v>_bio no painel, noindex.
// Rodar depois de gerar a /friends-quiz: node scripts/gerar-friends-quiz-bio.js
const fs = require("fs");
const path = require("path");
const PUB = path.join(__dirname, "..", "public");
let s = fs.readFileSync(path.join(PUB, "vsl-friends-quiz.html"), "utf8");
const troca = (a, b) => { const k = s.split(a).length - 1; if (k !== 1) { console.error("esperava 1x, achei " + k + "x:", a.slice(0, 90)); process.exit(1); } s = s.replace(a, b); };
troca("<head>", "<head><script>/* BIO 24/11: rastreio da bio antes de tudo */try{var u=new URL(location.href);if(!u.searchParams.get('utm_source')){u.searchParams.set('utm_source','instagram');u.searchParams.set('utm_medium','bio');history.replaceState(null,'',u.toString())}}catch(e){}</script><meta name=\"robots\" content=\"noindex\">");
troca("var VTAG=(qp().get('af')?'af_':'')+'vsl_quiz_'+VSLV", "var VTAG=(qp().get('af')?'af_':'')+'vsl_quiz_'+VSLV+'_bio'");
fs.writeFileSync(path.join(PUB, "vsl-friends-quiz-bio.html"), s);
console.log("ok · vsl-friends-quiz-bio.html", (s.length / 1024).toFixed(0), "KB");
