// Gera public/vsl-friends-bio.html: cópia da /friends pro LINK DA BIO do Instagram (23/11/2026, pedido do Marcos:
// "duplicar a página com a página aberta pra bio" + "coloca com rastreio pra gente saber as vendas que vêm de lá").
// Lê a /friends que está no ar (public/vsl-friends.html) e muda só 3 coisas:
//  1) OFERTA ABERTA desde o início (quem vem da bio já conhece; mesmo efeito do ?reveal=1, sem gravar no aparelho)
//  2) SEM PRESELL: abre direto no vídeo com "toque para continuar" (modo cadeado). A presell foi feita pra tráfego frio.
//  3) RASTREIO: se o link chegar sem UTM, a própria página põe utm_source=instagram&utm_medium=bio
//     antes de qualquer script ler a URL. Assim o funnel_events, o checkout (Kiwify TrackingParameters) e o painel separam a bio.
// Rodar depois de mexer na /friends: node scripts/gerar-vsl-friends-bio.js
const fs = require("fs");
const path = require("path");
const PUB = path.join(__dirname, "..", "public");
let s = fs.readFileSync(path.join(PUB, "vsl-friends.html"), "utf8");
const troca = (a, b, n = 1) => { const k = s.split(a).length - 1; if (k !== n) { console.error("esperava " + n + "x, achei " + k + "x:", a.slice(0, 90)); process.exit(1); } s = s.split(a).join(b); };

troca("<head>", "<head><script>/* BIO 23/11: rastreio da bio antes de tudo */try{var u=new URL(location.href);if(!u.searchParams.get('utm_source')){u.searchParams.set('utm_source','instagram');u.searchParams.set('utm_medium','bio');history.replaceState(null,'',u.pathname+u.search+u.hash)}}catch(e){}</script>");
troca("(new URLSearchParams(location.search).get('modo')||'quiz')", "(new URLSearchParams(location.search).get('modo')||'cadeado')", 2);
troca("var preview=qp().get('reveal')==='1';", "var preview=true; /* BIO: oferta aberta desde o início */");
troca("<title>Fluency Route: inglês com Friends</title>", "<title>Fluency Route: inglês com Friends</title><meta name=\"robots\" content=\"noindex\">");

// 4) VERSÃO PRÓPRIA no painel (Marcos: "não pode misturar com a /friends do tráfego frio"): variant/sck viram vsl_friends_bio
//    (o painel mostra como VSL "friends_bio"), e sem utm_campaign a origem fica "Orgânico e direto", fora de "Meus anúncios".
troca("var VTAG=(qp().get('af')?'af_':'')+'vsl_'+VSLV+", "var VTAG=(qp().get('af')?'af_':'')+'vsl_'+VSLV+'_bio'+");
fs.writeFileSync(path.join(PUB, "vsl-friends-bio.html"), s);
console.log("ok · vsl-friends-bio.html", (s.length / 1024).toFixed(0), "KB");
