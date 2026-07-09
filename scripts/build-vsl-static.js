// build-vsl-static.js — congela a /vsl React em HTML estático self-contained
// Mesma cirurgia da bridge (02/07): DOM capturado + CSS inline + JS vanilla
// que replica 1:1 o comportamento de RotaFluenciaPage.tsx (tracking, reveal,
// Vturb, stitching de checkout, FAQ, sticky, carousel).
const fs = require('fs')
const https = require('https')

const CAPTURE = process.argv[2] // DOM da /vsl capturado com browser real (scroll completo + ?reveal=1)
const OUT = 'C:/Users/Asus/fluencyroute/public/vsl.html'
const ORIGIN = 'https://fluencyroute.com.br'

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject)
  })
}

async function main() {
  let h = fs.readFileSync(CAPTURE, 'utf8')

  // 1. CSS dos <link stylesheet> → inline
  const cssLinks = [...h.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(m => m[1])
  let css = ''
  for (const href of cssLinks) css += await get(ORIGIN + href) + '\n'
  // urls relativas do CSS (../media/x.woff2) apontam pra /_next/static/ — absolutiza
  css = css.replace(/url\(\.\.\//g, 'url(/_next/static/')
  console.log('css inlined:', cssLinks.length, 'files,', (css.length / 1024).toFixed(0) + 'KB')

  // 2. remove TODOS os <script> (Next chunks, fbevents injetado, gtag, next data)
  const nScripts = (h.match(/<script/g) || []).length
  h = h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  h = h.replace(/<script\b[^>]*\/>/g, '')

  // 3. remove links _next (stylesheet/preload/prefetch) — CSS já foi inlined
  h = h.replace(/<link[^>]*href="\/_next\/[^"]*"[^>]*>/g, '')

  // 4. injeta CSS inline no fim do <head>
  h = h.replace('</head>', `<style>${css}</style></head>`)

  // 5. conteúdo de venda volta a nascer escondido (timer de 21min revela)
  h = h.replace('</section><div class="">', '</section><div class="esconder">')

  // 6. iframe Vturb: src limpo — o runtime injeta a URL com o query real do visitante
  h = h.replace(/src="https:\/\/scripts\.converteai\.net\/[^"]*"/g, 'src="about:blank"')

  // 7. CTAs: strip query da captura (s1 da minha sessão) — runtime reconstrói com UTM+s1
  h = h.replace(/href="https:\/\/pay\.kiwify\.com\.br\/DlmRal3[^"]*"/g, 'href="https://pay.kiwify.com.br/DlmRal3"')

  // 8. limpa artefatos da URL de captura
  h = h.replace(/\?reveal=1&(amp;)?fr_no_track=1/g, '')

  // 9. runtime vanilla — porta fiel de RotaFluenciaPage.tsx + PageViewTracker.tsx
  const runtime = `
<script>
(function(){
'use strict';
var PIXEL='938768337634102';
var CHECKOUT='https://pay.kiwify.com.br/DlmRal3';
var VALUE=289.00;
var CONTENT={content_name:'Rota da Fluência Essencial',currency:'BRL',value:VALUE,content_ids:['fluency-annual'],content_type:'product'};
var SUPA_URL='https://petrtewismhpzidcmmwb.supabase.co/rest/v1/funnel_events';
var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldHJ0ZXdpc21ocHppZGNtbXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDg3NDYsImV4cCI6MjA4OTM4NDc0Nn0.CTGC11dPKawf3tFWrEu9jXgxn2oPmPMXQS9bFcN4o10';

// ── helpers ──
function qp(){try{return new URLSearchParams(location.search)}catch(e){return new URLSearchParams()}}
function uuid(){try{if(crypto.randomUUID)return crypto.randomUUID()}catch(e){}return 'x'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
function genEventId(){return Date.now()+'-'+Math.random().toString(36).slice(2,10)}
function getCookie(n){var m=document.cookie.match(new RegExp('(?:^|;\\\\s*)'+n+'=([^;]+)'));return m?decodeURIComponent(m[1]):''}
function getFb(){var fbc=getCookie('_fbc'),fbp=getCookie('_fbp');if(!fbc){var id=qp().get('fbclid');if(id)fbc='fb.1.'+Date.now()+'.'+id}return{fbc:fbc||undefined,fbp:fbp||undefined}}
var cachedIp=null;
function getIp(cb){if(cachedIp)return cb(cachedIp);fetch('https://api.ipify.org?format=json').then(function(r){return r.json()}).then(function(d){cachedIp=d.ip;cb(cachedIp)}).catch(function(){cb(null)})}
function beacon(url,payload){var body=JSON.stringify(payload);try{var b=new Blob([body],{type:'application/json'});if(navigator.sendBeacon&&navigator.sendBeacon(url,b))return}catch(e){}fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true}).catch(function(){})}

// external_id anônimo (cookie 2 anos, cross-subdomain) — porta do PageViewTracker
function getExtId(){var v=getCookie('_fluency_uid');if(!v){v=uuid();document.cookie='_fluency_uid='+encodeURIComponent(v)+'; path=/; domain=.fluencyroute.com.br; max-age='+(60*60*24*365*2)+'; SameSite=Lax'}return v}

// sid do funnel_events (localStorage fr_sid) — porta de funnel-track.ts
function funnelSid(){try{var k='fr_sid',u=qp().get('fr_sid');if(u){localStorage.setItem(k,u);return u}var v=localStorage.getItem(k);if(!v){v=uuid();localStorage.setItem(k,v)}return v}catch(e){return uuid()}}
function noTrack(){try{var f=qp().get('fr_no_track');if(f==='1')localStorage.setItem('fr_no_track','1');else if(f==='0')localStorage.removeItem('fr_no_track');return localStorage.getItem('fr_no_track')==='1'}catch(e){return false}}
function frTrack(event,detail){if(noTrack())return;var p=qp();var row={funnel:'ingles',page:'vsl',event:event,variant:(function(){try{var v=p.get('fr_v')||localStorage.getItem('fr_v');return(v&&!/^v3_[a-f0-9-]{20,}/i.test(v))?v:null}catch(e){return null}})(),detail:detail==null?null:String(detail).slice(0,200),session_id:funnelSid(),utm_source:p.get('utm_source'),utm_medium:p.get('utm_medium'),utm_campaign:p.get('utm_campaign'),utm_content:p.get('utm_content'),utm_term:p.get('utm_term'),fbclid:p.get('fbclid'),referrer:document.referrer||null,path:(location.pathname+location.search).slice(0,500),user_agent:(navigator.userAgent||'').slice(0,500)};fetch(SUPA_URL,{method:'POST',keepalive:true,headers:{'apikey':ANON,'Authorization':'Bearer '+ANON,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(row)}).catch(function(){})}

// dual: pixel browser + CAPI server com mesmo eventID
function trackDual(event){var eid=genEventId();var fb=getFb();if(window.fbq)fbq('track',event,CONTENT,{eventID:eid});getIp(function(ip){beacon('/api/track',{event:event,eventId:eid,fbc:fb.fbc,fbp:fb.fbp,external_id:getExtId(),client_ip_address:ip||undefined,client_user_agent:navigator.userAgent,value:VALUE,currency:'BRL',content_name:CONTENT.content_name,content_ids:CONTENT.content_ids,content_type:'product'})})}

// ── Meta Pixel bootstrap + PageView dual ──
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init',PIXEL);
(function(){var eid=genEventId();var ext=getExtId();fbq('track','PageView',{},{eventID:eid});var fb=getFb();beacon('/api/track',{event:'PageView',eventId:eid,fbc:fb.fbc,fbp:fb.fbp,external_id:ext})})();

// ── gtag (GA4 + Google Ads) — adiado pra fora do critical path ──
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-Z35QLQE3PQ';document.head.appendChild(s);gtag('js',new Date());gtag('config','G-Z35QLQE3PQ');gtag('config','AW-16694165189')},3000);

// ── ViewContent + pageview interno ──
trackDual('ViewContent');
try{frTrack('pageview')}catch(e){}

// ── Vturb: SDK + iframe src com query do visitante ──
(function(){if(!document.querySelector('script[src*="smartplayer-wc"]')){var s=document.createElement('script');s.type='text/javascript';s.src='https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js';s.async=true;document.head.appendChild(s)}
var ifr=document.getElementById('ifr_67d1c8ba61d59aeb47caf87d');
if(ifr)ifr.src='https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/67d1c8ba61d59aeb47caf87d/v4/embed.html'+(location.search||'?')+'&vl='+encodeURIComponent(location.href)})();

// ── sck do Vturb via postMessage → stitch row ──
window.addEventListener('message',function(event){try{if(!event.data||event.data.mime!=='smartplayer/message-text-v4')return;if(event.data.type!=='UpdateUrlParams')return;var sck=event.data.sck||(event.data.data&&event.data.data.sck);if(!sck)return;var fb=getFb();var p=qp();beacon('/api/checkout-session',{session_id:stitchSid()+'-sck-'+Date.now().toString(36),fbc:fb.fbc,fbp:fb.fbp,fbclid:p.get('fbclid')||undefined,client_ip_address:cachedIp||undefined,client_user_agent:navigator.userAgent,sck:sck,utm_source:p.get('utm_source')||undefined,utm_medium:p.get('utm_medium')||undefined,utm_campaign:p.get('utm_campaign')||undefined,utm_content:p.get('utm_content')||undefined,utm_term:p.get('utm_term')||undefined}) }catch(e){}});

// ── stitch sid (sessionStorage — igual getOrCreateSessionId do React) ──
function stitchSid(){try{var e=sessionStorage.getItem('fr_sid');if(e)return e;var n=Date.now().toString(36)+Math.random().toString(36).slice(2,12);sessionStorage.setItem('fr_sid',n);return n}catch(e){return Date.now().toString(36)+Math.random().toString(36).slice(2,12)}}
function saveCheckoutSession(sid){if(!sid)return;var fb=getFb();var p=qp();beacon('/api/checkout-session',{session_id:sid,fbc:fb.fbc,fbp:fb.fbp,fbclid:p.get('fbclid')||undefined,client_ip_address:cachedIp||undefined,client_user_agent:navigator.userAgent,utm_source:p.get('utm_source')||undefined,utm_medium:p.get('utm_medium')||undefined,utm_campaign:p.get('utm_campaign')||undefined,utm_content:p.get('utm_content')||undefined,utm_term:p.get('utm_term')||undefined,sck:p.get('sck')||undefined})}

// ── CTAs: href = checkout + UTMs + s1; click = stitch fresco + IC dual ──
var UTM_KEYS=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','sck'];
(function(){var p=qp();var sid=stitchSid();document.querySelectorAll('a.cta-btn').forEach(function(a){try{var u=new URL(CHECKOUT);UTM_KEYS.forEach(function(k){var v=p.get(k);if(v)u.searchParams.set(k,v)});u.searchParams.set('s1',sid);a.href=u.toString()}catch(e){}
a.addEventListener('click',function(){try{var cur=new URL(a.href);var sck=cur.searchParams.get('sck');if(sck){var fb=getFb();var pp=qp();beacon('/api/checkout-session',{session_id:stitchSid()+'-click-'+Date.now().toString(36),fbc:fb.fbc,fbp:fb.fbp,fbclid:pp.get('fbclid')||undefined,client_ip_address:cachedIp||undefined,client_user_agent:navigator.userAgent,sck:sck,utm_source:pp.get('utm_source')||undefined,utm_medium:pp.get('utm_medium')||undefined,utm_campaign:pp.get('utm_campaign')||undefined,utm_content:pp.get('utm_content')||undefined,utm_term:pp.get('utm_term')||undefined})}}catch(e){}
saveCheckoutSession(stitchSid());try{frTrack('checkout_click')}catch(e){}trackDual('InitiateCheckout')})})})();

// ── reveal da oferta (21min / localStorage / ?reveal=1) ──
(function(){var delaySeconds=1260;var key='rota_fluencia_revealed';
function show(){document.querySelectorAll('.esconder').forEach(function(el){el.classList.remove('esconder')})}
function doReveal(){show();try{localStorage.setItem(key,'1')}catch(e){}}
var preview=qp().get('reveal')==='1';var already=false;try{already=localStorage.getItem(key)==='1'}catch(e){}
// preview (?reveal=1) abre sem persistir — igual ao React
if(preview)show();else if(already)doReveal();else setTimeout(doReveal,delaySeconds*1000)})();

// ── sticky CTA no scroll ──
(function(){var el=document.querySelector('.sticky-cta');if(!el)return;window.addEventListener('scroll',function(){if(window.scrollY>600)el.classList.add('show');else el.classList.remove('show')},{passive:true})})();

// ── FAQ accordion ──
(function(){var answers=Array.prototype.filter.call(document.querySelectorAll('div'),function(d){return d.style.maxHeight==='0px'&&d.style.overflow==='hidden'});
answers.forEach(function(ans){var item=ans.parentElement;var head=item.firstElementChild;var plus=head?head.querySelector('span'):null;item.style.cursor='pointer';item.addEventListener('click',function(){var open=ans.style.maxHeight!=='0px';answers.forEach(function(o){o.style.maxHeight='0px';var it=o.parentElement;it.style.borderColor='';var pl=it.firstElementChild&&it.firstElementChild.querySelector('span');if(pl)pl.style.transform='none'});if(!open){ans.style.maxHeight='400px';item.style.borderColor='rgba(18,181,172,0.27)';if(plus)plus.style.transform='rotate(45deg)'}})})})();

// ── carousel: pausa no toque ──
(function(){var track=Array.prototype.find.call(document.querySelectorAll('div'),function(d){return(d.style.animation||'').indexOf('seriesScroll')>-1});if(!track)return;var wrap=track.parentElement;function pause(){track.style.animationPlayState='paused'}function play(){track.style.animationPlayState='running'}
;['pointerdown','touchstart'].forEach(function(ev){wrap.addEventListener(ev,pause,{passive:true})});['pointerup','pointerleave','touchend'].forEach(function(ev){wrap.addEventListener(ev,play,{passive:true})})})();

// ── scroll depth + time on page (dual) ──
(function(){var fired={};window.addEventListener('scroll',function(){var pct=Math.round(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100);[25,50,75,100].forEach(function(t){if(pct>=t&&!fired[t]){fired[t]=1;trackDual('ScrollDepth_'+t)}})},{passive:true});
var fired2={},start=Date.now();setInterval(function(){var el=Math.floor((Date.now()-start)/1000);[30,60,120,300,600].forEach(function(m){if(el>=m&&!fired2[m]){fired2[m]=1;trackDual('TimeOnPage_'+m+'s')}})},5000)})();
})();
</script>`

  h = h.replace('</body>', runtime + '\n</body>')

  fs.writeFileSync(OUT, h)
  console.log('scripts removidos:', nScripts)
  console.log('OUT:', OUT, (h.length / 1024).toFixed(0) + 'KB')

  // sanity: script inline parseia?
  const m = h.match(/<script>\n\(function\(\)\{[\s\S]*?<\/script>/)
  if (!m) throw new Error('runtime não encontrado no output')
  new Function(m[0].replace(/^<script>/, '').replace(/<\/script>$/, ''))
  console.log('runtime JS: sintaxe OK')
}

main().catch(e => { console.error(e); process.exit(1) })
