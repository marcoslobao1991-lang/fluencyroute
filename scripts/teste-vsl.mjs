// Placar do teste A/B de VSL na /vsl (fk1 × fk2, 1,1x desde 06/11).
// uso: node scripts/teste-vsl.mjs [desde=2026-11-06] [campanha=120250071992840290]
// Conta só sessões que chegaram com utm_campaign da campanha do teste (tira visita do Marcos e de outras campanhas).
// Retenção = sessões que passaram de cada minuto DO VÍDEO (video_minute é posição do conteúdo, não relógio).
// IC = sessões com checkout_click. Venda = orders pagos cujo vturb_sck começa com a tag da versão (vsl_fk1_x110_<s1>).
import fs from 'fs';
const env = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const K = env.match(/^SUPABASE_SERVICE_KEY=(.*)$/m)[1].replace(/["\r]/g, '').trim();
const U = 'https://petrtewismhpzidcmmwb.supabase.co/rest/v1/';
const DESDE = process.argv[2] || '2026-11-06';
const CAMP = process.argv[3] || '120250071992840290';
const OFERTA_MIN = { fk1: Math.floor(1184 / 60), fk2: Math.floor(1239 / 60) };

async function all(path) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const r = await fetch(U + path + `&limit=1000&offset=${off}`, { headers: { apikey: K, Authorization: 'Bearer ' + K } });
    const d = await r.json();
    if (!Array.isArray(d)) throw new Error(JSON.stringify(d));
    out.push(...d);
    if (d.length < 1000) return out;
  }
}

const ev = await all(`funnel_events?select=session_id,event,detail,variant,utm_campaign,utm_content,ts&page=eq.vsl&variant=like.vsl_fk*&ts=gte.${DESDE}`);
const doTeste = new Set(ev.filter(e => (e.utm_campaign || '').includes(CAMP)).map(e => e.session_id));
const S = {};
for (const e of ev) {
  if (!doTeste.has(e.session_id)) continue;
  const v = e.variant;
  const s = (S[v] ||= {}), x = (s[e.session_id] ||= { min: -1, play: false, ic: false, pv: false, ad: null });
  if (e.event === 'pageview') x.pv = true;
  if (e.event === 'video_play') x.play = true;
  if (e.event === 'checkout_click') x.ic = true;
  if (e.event === 'video_minute') x.min = Math.max(x.min, parseInt(e.detail) || 0);
  if (e.utm_content && !x.ad) x.ad = e.utm_content.split('|')[0];
}
const orders = await all(`orders?select=vturb_sck,amount_cents,status,created_at,utm_content&status=eq.paid&vturb_sck=like.vsl_fk*&created_at=gte.${DESDE}`);

const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + '%' : '-');
console.log(`Teste VSL desde ${DESDE} · campanha ${CAMP}\n`);
for (const v of Object.keys(S).sort()) {
  const ss = Object.values(S[v]), n = ss.length, fk = v.match(/fk\d/)[0];
  const play = ss.filter(x => x.play).length, ic = ss.filter(x => x.ic).length;
  const reach = m => ss.filter(x => x.min >= m).length;
  const vend = orders.filter(o => o.vturb_sck.slice(0, o.vturb_sck.lastIndexOf('_')) === v);
  const rec = vend.reduce((a, o) => a + (o.amount_cents || 0), 0) / 100;
  console.log(`== ${v}  (${n} sessões)`);
  console.log(`  clicou no play      ${play}  (${pct(play, n)})`);
  for (const m of [1, 3, 5, 10, 15, OFERTA_MIN[fk]]) console.log(`  passou do min ${String(m).padStart(2)}${m === OFERTA_MIN[fk] ? ' (oferta)' : '         '} ${reach(m)}  (${pct(reach(m), play)} de quem deu play)`);
  console.log(`  IC (checkout_click) ${ic}  (${pct(ic, n)})`);
  console.log(`  vendas              ${vend.length}  (${pct(vend.length, n)})  R$${rec.toFixed(2)}\n`);
}
// resumo do sorteio do player: post (_ig) × player atual, somando fk1 e fk2
const grupo = { post: [], atual: [] };
for (const v of Object.keys(S)) for (const x of Object.values(S[v])) grupo[/_ig$/.test(v) ? 'post' : 'atual'].push(x);
const vendG = g => orders.filter(o => { const vv = o.vturb_sck.slice(0, o.vturb_sck.lastIndexOf('_')); return g === 'post' ? /_ig$/.test(vv) : !/_ig$/.test(vv) }).filter(o => Object.keys(S).includes(o.vturb_sck.slice(0, o.vturb_sck.lastIndexOf('_'))));
console.log('== PLAYER: post × atual (fk1 + fk2)');
for (const g of ['atual', 'post']) { const ss = grupo[g], n = ss.length, play = ss.filter(x => x.play).length, ic = ss.filter(x => x.ic).length, v5 = ss.filter(x => x.min >= 5).length, vd = vendG(g); console.log(`  ${g.padEnd(6)} ${String(n).padStart(4)} sessões · play ${pct(play, n)} · min 5 ${pct(v5, play)} de quem deu play · IC ${pct(ic, n)} · vendas ${vd.length}`) }
console.log('');
console.log('Gasto por ad: painel / Meta (campanha ' + CAMP + '). Venda por ad: utm_content dos orders.');
