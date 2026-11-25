// Gera public/es-friends.html = /es/friends: a /friends BR (public/vsl-friends.html) versão LATAM (25/11/2026, pedido do Marcos:
// "sobe no ar no site da fluency latam modelando o site da fluency br").
// Mesmo layout, player, presell e seções da /friends; troca:
//  - VSL = Friends LATAM da profesora Manuela (HLS em video.fluencyroute.com.br/vsl-friends-latam), botão aos 759 s ("haz clic en el botón")
//  - oferta LATAM no ar: USD 49 pago único, Hotmart P94218659Y off eun6d9uv (mesma da /es/vsl), âncora "De USD 197"
//  - pixel LATAM 604755389004843 + CAPI /api/track-latam, funnel_events 'ingles-latam', cookie _fluency_latam_uid (host-only)
//  - textos em espanhol neutro; sem Brasil, sem o áudio do aluno (ele fala português), sem gtag do BR
//  - app mostrado = o app RECRIADO em espanhol da VSL (recorte do próprio vídeo), não a gravação real (interface em português)
//  - comentários do YouTube: só os reais NEUTROS traduzidos fiéis (public/es-yt-comentarios.json)
const fs = require("fs");
const path = require("path");
const PUB = path.join(__dirname, "..", "public");
let s = fs.readFileSync(path.join(PUB, "vsl-friends.html"), "utf8");
const falha = (m) => { console.error("NÃO ACHEI:", m.slice(0, 110)); process.exit(1); };
const troca = (a, b) => { if (!s.includes(a)) falha(a); s = s.replace(a, b); };
const todas = (a, b) => { if (!s.includes(a)) falha(a); s = s.split(a).join(b); };
const corta = (ini, fim, novo = "") => { const i = s.indexOf(ini); if (i < 0) falha(ini); const j = s.indexOf(fim, i); if (j < 0) falha(fim); s = s.slice(0, i) + novo + s.slice(j + fim.length); };

const HOTMART = "https://pay.hotmart.com/P94218659Y?off=eun6d9uv&amp;checkoutMode=10";
const HOTMART_JS = "https://pay.hotmart.com/P94218659Y?off=eun6d9uv&checkoutMode=10";

// ── 1) tracking, oferta, player ──
todas('lang="pt-BR"', 'lang="es"');
troca("var PIXEL='938768337634102';", "var PIXEL='604755389004843'; /* pixel LATAM */");
troca("var CHECKOUT='https://pay.kiwify.com.br/DlmRal3';", "var CHECKOUT='" + HOTMART_JS + "';");
troca("var VALUE=289.00;", "var VALUE=49.00;");
troca("content_name:'Rota da Fluência Essencial',currency:'BRL',value:VALUE,content_ids:['fluency-annual']", "content_name:'Ruta de la Fluidez Esencial',currency:'USD',value:VALUE,content_ids:['fluency-latam-annual']");
todas("currency:'BRL'", "currency:'USD'");
todas("beacon('/api/track',", "beacon('/api/track-latam',");
troca("funnel:'ingles',page:'vsl'", "funnel:'ingles-latam',page:'friends'");
troca("var v=getCookie('_fluency_uid');if(!v){v=uuid();document.cookie='_fluency_uid='+encodeURIComponent(v)+'; path=/; domain=.fluencyroute.com.br; max-age='",
  "var v=getCookie('_fluency_latam_uid');if(!v){v=uuid();document.cookie='_fluency_latam_uid='+encodeURIComponent(v)+'; path=/; max-age='");
todas("https://pay.kiwify.com.br/DlmRal3", HOTMART);
troca("var VSLS={friends:{dir:'vsl-ingles-friends',delay:745,scroll:955,rate:1},", "var VSLS={latam:{dir:'vsl-friends-latam',delay:759,scroll:969,rate:1},friends:{dir:'vsl-ingles-friends',delay:745,scroll:955,rate:1},");
troca("return 'friends'})();", "return 'latam'})(); /* 25/11: VSL Friends LATAM (Manuela) */");
todas("vsl-ingles-friends/thumbnail.jpg", "vsl-friends-latam/thumbnail.jpg");
troca("var key='friends_revealed';", "var key='friends_latam_revealed';");
troca("track('video_reveal','friends')", "track('video_reveal','friends_latam')");
// gtag do BR (GA4 + Google Ads do Brasil) fora
{ const i = s.indexOf("setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js");
  if (i < 0) falha("gtag"); const j = s.indexOf("},3000);", i) + 8; s = s.slice(0, i) + "/* sem gtag do BR na LATAM */" + s.slice(j); }
troca("fetch('/yt-comentarios.json')", "fetch('/es-yt-comentarios.json')");

// ── 2) preço (2 blocos: topo e final) ──
todas('<span class="fr-de">De <span style="text-decoration: line-through; color: rgb(255, 107, 107);">R$497</span></span>', '<span class="fr-de">De <span style="text-decoration: line-through; color: rgb(255, 107, 107);">USD 197</span></span>');
todas('<span class="fr-v">R$29</span><span style="font-size: 0.45em; font-weight: 700;">/mês</span>', '<span class="fr-v">USD 49</span>');
todas('<span class="fr-parc">12x no cartão ou R$289 no Pix</span>', '<span class="fr-parc">pago único · acceso de por vida</span>');
todas("Hoje por apenas:", "Hoy por solo:");

// ── 3) seção da prova: sai o áudio do aluno (português); a nota e os comentários ficam ──
corta('<section class="vsl-section fx-sec fx-banda"><p class="fx-tag fx-in">A PROVA</p>', '</section>');
troca('<section class="vsl-section fx-sec "><div class="fx-nota fx-in">', '<section class="vsl-section fx-sec "><p class="fx-tag fx-in">LA PRUEBA</p><h2 class="fx-h fx-in">Lo que dicen <em>los alumnos</em></h2><div class="fx-nota fx-in">');
troca('<p><b style="color:#fff">4.099 avaliações</b> de alunos na Kiwify</p>', '<p><b style="color:#fff">4.099 valoraciones</b> de alumnos</p>');
troca('<div class="fx-in"><b>@davii_pp</b><p>Deem um Oscar a esse senhor! Eu aprendo assim e funciona!</p></div>', '<div class="fx-in"><b>@arthurrxmos6958</b><p>No entrenes hasta acertar, entrena hasta que sea imposible equivocarte...</p></div>');
troca("<p>Eu dou aula de inglês particular, morei e me formei nos USA. Falei pra uma aluna ainda hoje que a única diferença entre o meu inglês e o dela está em quantas vezes, de forma repetitiva, eu ouvi e apliquei. Não tem segredo.</p>", "<p>Doy clases particulares de inglés, viví y me gradué en USA. Hoy mismo le dije a una alumna que la única diferencia entre mi inglés y el de ella está en cuántas veces, de forma repetitiva, escuché y apliqué. No hay secreto.</p>");
troca("<p>Estudo há uns 10 anos por conta própria, parado no nível B2. Consigo assistir tranquilamente em inglês, mas o falar nunca evoluiu. Agora eu descobri o porquê.</p>", "<p>Estudio hace unos 10 años por mi cuenta, estancado en el nivel B2. Logro ver tranquilamente en inglés, pero el hablar nunca evolucionó. Ahora descubrí por qué.</p>");

// ── 4) "Veja o app funcionando": a gravação real tem interface em português → app em espanhol recortado da VSL ──
{ const i = s.indexOf('<div class="dr fx-in">'); if (i < 0) falha("dr");
  const j = s.indexOf('<span class="dr-real">', i); const k = s.indexOf("</div>", j) + 6;
  s = s.slice(0, i) + '<div class="fx-in"><div class="dr-cel"><div class="dr-tela"><video src="/app/es/app-demo.mp4" poster="/app/es/app-demo.jpg" muted autoplay loop playsinline preload="metadata" aria-label="La app de Fluency Route" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#0b0b12"></video></div></div><span class="dr-real">la app de Fluency Route</span></div>' + s.slice(k); }
// cartão de oferta do topo e presell: print/gravação do app em português → app em espanhol
troca('<img src="/app/app-cena-pt.jpg" alt="" width="540" height="1170">', '<img src="/app/es/app-demo.jpg" alt="" width="540" height="1170" style="object-fit:cover">');
troca('<video src="/app/demo-real.mp4?v=2" poster="/app/demo-real-cena.jpg" muted autoplay playsinline preload="auto" style="width:100%;height:100%;object-fit:cover;display:block;background:#fff url(/app/demo-real-cena.jpg) center/cover"></video>',
  '<video src="/app/es/app-demo.mp4" poster="/app/es/app-demo.jpg" muted autoplay loop playsinline preload="auto" style="width:100%;height:100%;object-fit:cover;display:block;background:#0b0b12 url(/app/es/app-demo.jpg) center/cover"></video>');

// ── 5) cenas de Friends: tradução em espanhol ──
troca("Não há nada para contar. É apenas um cara com quem trabalho.", "No hay nada que contar. Es solo un chico con el que trabajo.");
troca("Ok, todos relaxem. Isso não é nem mesmo um encontro.", "Ok, todos relájense. Esto ni siquiera es una cita.");
troca("Parece um encontro para mim.", "A mí me suena a una cita.");

// ── 6) textos (HTML e JS) ──
const T = [
  ["<title>Fluency Route: inglês com Friends</title>", "<title>Fluency Route: inglés con Friends</title>"],
  ['<strong style="font-weight:800;color:#111;letter-spacing:.03em">TRUQUE SIMPLES</strong>', '<strong style="font-weight:800;color:#111;letter-spacing:.03em">TRUCO SIMPLE</strong>'],
  ["pra aprender inglês com <span", "para aprender inglés con <span"],
  ["Truque simples pra aprender inglês com Friends", "Truco simple para aprender inglés con Friends"],
  ["Seu vídeo já começou", "Tu video ya empezó"],
  ["Clique para ouvir", "Haz clic para escuchar"],
  ["toque em qualquer lugar do vídeo", "toca en cualquier parte del video"],
  ["Você já começou a assistir esse vídeo", "Ya empezaste a ver este video"],
  ["Continuar assistindo?", "¿Seguir viendo?"],
  ["Assistir do início?", "¿Ver desde el inicio?"],
  ["Assista com som ativado", "Mira con el sonido activado"],
  ["JUNTE-SE À NOVA TURMA", "ÚNETE AL NUEVO GRUPO"],
  ["Rota da Fluência Essencial", "Ruta de la Fluidez Esencial"],
  ["O app que treina o seu ouvido com Friends", "La app que entrena tu oído con Friends"],
  ["<b>Sua tutora</b> sabe o seu nível", "<b>Tu tutora</b> conoce tu nivel"],
  ["QUERO FAZER PARTE", "QUIERO SER PARTE"],
  ["QUERO COMEÇAR AGORA", "QUIERO EMPEZAR AHORA"],
  [">O RESULTADO<", ">EL RESULTADO<"],
  ["Em dias, você entende seu primeiro episódio de Friends", "En días, entiendes tu primer episodio de Friends"],
  ["100% em inglês, sem legenda", "100% en inglés, sin subtítulos"],
  ["É esta cena aqui. Hoje ela é embolada. Depois do treino, você entende cada palavra.", "Es esta escena. Hoy suena enredada. Después del entrenamiento, entiendes cada palabra."],
  ["FRIENDS · CENA ", "FRIENDS · ESCENA "],
  ["Ligar o som da cena", "Activar el sonido de la escena"],
  ["<span>ouvir</span>", "<span>escuchar</span>"],
  ["do que se fala no episódio 2 já apareceu no episódio 1. Você chega no segundo episódio já sabendo a maior parte.", "de lo que se dice en el episodio 2 ya apareció en el episodio 1. Llegas al segundo episodio sabiendo la mayor parte."],
  ["Só no primeiro episódio", "Solo en el primer episodio"],
  ["E as <b", "Y las <b"],
  ["500 palavras</b> mais usadas cobrem", "500 palabras</b> más usadas cubren"],
  ["de todas as falas de Friends.", "de todos los diálogos de Friends."],
  [">SUA ROTA<", ">TU RUTA<"],
  ["O que muda no seu inglês", "Lo que cambia en tu inglés"],
  ["<small>Primeira cena</small><h3>O embolado começa a ficar nítido</h3><p>Você percebe que eles falam numa velocidade normal.</p>", "<small>Primera escena</small><h3>Lo enredado empieza a sonar nítido</h3><p>Te das cuenta de que hablan a una velocidad normal.</p>"],
  ["<small>Em questão de dias</small><h3>Seu primeiro episódio inteiro</h3><p>20 minutos de conversa, do começo ao fim, 100% em inglês e sem legenda.</p>", "<small>En cuestión de días</small><h3>Tu primer episodio completo</h3><p>20 minutos de conversación, de principio a fin, 100% en inglés y sin subtítulos.</p>"],
  ["<small>5 episódios</small><h3>Seu inglês muda de nível</h3><p>Você entende seus primeiros discursos completos e a fala começa a sair no automático.</p>", "<small>5 episodios</small><h3>Tu inglés sube de nivel</h3><p>Entiendes tus primeros discursos completos y el habla empieza a salir en automático.</p>"],
  ["<small>Daí em diante</small><h3>Inglês operacional</h3><p>Filmes sem legenda, conversa em inglês, livro no original. A própria imersão te deixa mais fluente a cada dia.</p>", "<small>De ahí en adelante</small><h3>Inglés operativo</h3><p>Películas sin subtítulos, conversación en inglés, libros en el original. La propia inmersión te vuelve más fluido cada día.</p>"],
  ["Comentários reais no YouTube", "Comentarios reales en YouTube"],
  [">O MÉTODO<", ">EL MÉTODO<"],
  ["Veja o app funcionando", "Mira la app funcionando"],
  ["É assim que você treina com Friends todos os dias.", "Así entrenas con Friends todos los días."],
  [">AS FASES<", ">LAS FASES<"],
  ["Do ouvido à imersão", "Del oído a la inmersión"],
  ["<span>Treino de ouvido</span><small>Cena por cena, sem legenda, até o embolado virar palavra.</small>", "<span>Entrenamiento de oído</span><small>Escena por escena, sin subtítulos, hasta que lo enredado se vuelve palabra.</small>"],
  ["<span>Treino de fala</span><small>Você assiste, imita o jeito do personagem e a fala começa a sair.</small>", "<span>Entrenamiento de habla</span><small>Miras, imitas la manera del personaje y el habla empieza a salir.</small>"],
  ["<span>Rota para a imersão</span><small>Episódio inteiro, depois outras séries. O inglês vira hábito.</small>", "<span>Ruta hacia la inmersión</span><small>Episodio completo, después otras series. El inglés se vuelve hábito.</small>"],
  ['alt="Garantia"', 'alt="Garantía"'],
  ["Risco zero pra você", "Riesgo cero para ti"],
  ["Se não for pra você, devolvemos 100% do seu dinheiro.", "Si no es para ti, te devolvemos el 100% de tu dinero."],
  ["<b>7 dias</b><span>garantia incondicional, sem pergunta</span>", "<b>7 días</b><span>garantía incondicional, sin preguntas</span>"],
  ["<b>90 dias</b><span>garantia estendida pra aplicar o método</span>", "<b>90 días</b><span>garantía extendida para aplicar el método</span>"],
  [">PERGUNTAS<", ">PREGUNTAS<"],
  ["<summary>Preciso saber inglês antes?</summary><p>Não. Funciona pra quem está começando e pra quem já estudou mas trava na hora de entender e falar.</p>", "<summary>¿Necesito saber inglés antes?</summary><p>No. Funciona para quien está empezando y para quien ya estudió pero se traba a la hora de entender y hablar.</p>"],
  ["<summary>Quanto tempo por dia?</summary><p>30 minutos já fazem diferença, e boa parte do treino de ouvido dá pra fazer enquanto você faz outras coisas.</p>", "<summary>¿Cuánto tiempo al día?</summary><p>30 minutos ya hacen la diferencia, y buena parte del entrenamiento de oído se puede hacer mientras haces otras cosas.</p>"],
  ["<summary>Funciona no celular?</summary><p>Sim. O aplicativo roda no celular, no tablet e no computador.</p>", "<summary>¿Funciona en el celular?</summary><p>Sí. La aplicación funciona en el celular, en la tablet y en la computadora.</p>"],
  ["<summary>Tem suporte?</summary><p>Sim, pelo WhatsApp, pra tirar dúvida e ajustar o seu treino.</p>", "<summary>¿Tiene soporte?</summary><p>Sí, por WhatsApp, para resolver dudas y ajustar tu entrenamiento.</p>"],
  ["Comece sua jornada rumo à <span", "Empieza hoy tu camino hacia la <span"],
  ["fluência essencial</span> hoje", "fluidez esencial</span>"],
  ["Todos os direitos reservados", "Todos los derechos reservados"],
  ["Aprenda inglês de verdade ouvindo música. Método científico baseado em repetição musical que hackeia seu cérebro pra adquirir inglês naturalmente.", "Un truco simple para aprender inglés con Friends. Entrena tu oído escena por escena, hasta entender tu primer episodio sin subtítulos."],
  ["'ouvir'", "'escuchar'"],
  ["facebook.com/tr?id=938768337634102", "facebook.com/tr?id=604755389004843"],
  // JS: player, IG, comentários
  ["Toque para desbloquear", "Toca para desbloquear"],
  ["Toque para continuar", "Toca para continuar"],
  ["TOQUE PARA CONTINUAR", "TOCA PARA CONTINUAR"],
  ["Toque para ouvir", "Toca para escuchar"],
  ["Continuar o vídeo", "Continuar el video"],
  ["Ativar o som do vídeo", "Activar el sonido del video"],
  ["'mais'", "'más'"],
  ["agora · só você vê até ser aprovado", "ahora · solo tú lo ves hasta que sea aprobado"],
  ["' curtida':' curtidas'", "' me gusta':' me gusta'"],
  ["'Curtido':'Curtir'", "'Te gusta':'Me gusta'"],
  ["'Descurtir':'Curtir'", "'Ya no me gusta':'Me gusta'"],
  ["'Comentar'", "'Comentar'"],
  ["'Adicione um comentário...'", "'Agrega un comentario...'"],
  ["'@ do Instagram'", "'@ de Instagram'"],
  ["'Publicar'", "'Publicar'"],
  ["'Comentários do YouTube'", "'Comentarios de YouTube'"],
  ["'Comentários do YouTube · '", "'Comentarios de YouTube · '"],
  ["'Ver mais comentários ('", "'Ver más comentarios ('"],
  ["'420.612 visualizações'", "'420.612 reproducciones'"],
  ["'7,1 mil'", "'7,1 mil'"],
  // presell e modos do player
  ["Você entende o que<br>ela falou?", "¿Entiendes lo que<br>ella dijo?"],
  [">Não entendi<", ">No entendí<"],
  [">Entendi<", ">Entendí<"],
  ["Responde pra continuar", "Responde para continuar"],
  ["TESTE DE 3 SEGUNDOS", "PRUEBA DE 3 SEGUNDOS"],
  ["FRIENDS · SEM LEGENDA", "FRIENDS · SIN SUBTÍTULOS"],
  ["enquanto faz outras coisas, só com 1&nbsp;fone de ouvido", "mientras haces otras cosas, solo con 1&nbsp;audífono"],
  ["enquanto faz outras coisas do seu dia", "mientras haces otras cosas en tu día"],
  [">TRUQUE SIMPLES<", ">TRUCO SIMPLE<"],
  ["<span>Truque</span>", "<span>Truco</span>"],
  [">Simples</span>", ">Simple</span>"],
  ["PASSO 1 DE 2", "PASO 1 DE 2"],
  ["repete a cena</div>", "repite la escena</div>"],
  ["treino de fala</div>", "entrenamiento de habla</div>"],
  ["som ligado", "sonido activado"],
];
for (const [a, b] of T) { if (a === b) continue; todas(a, b); }

fs.writeFileSync(path.join(PUB, "es-friends.html"), s);
console.log("ok public/es-friends.html", s.length);
