// Coorte honesta do gate: SÓ sessões de campanha que têm gate_seen
// (humano real, pós-deploy do evento). Dentro delas: quantas clicaram,
// completaram, foram pra VSL — sem misturar janelas temporais.
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const KEY = readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^SUPABASE_SERVICE_KEY="?([^"\r\n]+)"?/m)[1];

const r = await fetch(
  "https://petrtewismhpzidcmmwb.supabase.co/rest/v1/funnel_events?funnel=eq.ingles&page=eq.bridge&variant=eq.B&ts=gte.2026-06-11T20:10:00Z&select=event,detail,session_id,id,ts,utm_source,utm_content,fbclid&order=ts.asc&limit=5000",
  { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: "0-4999" } }
);
const rows = (await r.json()).filter((x) => x.event !== "speech_token");

const sess = {};
for (const x of rows) {
  const id = x.session_id || x.id;
  if (!sess[id]) sess[id] = { ev: new Set(), camp: false, ad: null, first: x.ts, gateDetail: null };
  sess[id].ev.add(x.event);
  if (x.event === "gate_click" && x.detail) sess[id].gateDetail = x.detail;
  if (x.utm_source || x.fbclid) sess[id].camp = true;
  if (!sess[id].ad && x.utm_content) sess[id].ad = x.utm_content.slice(0, 30);
}

const camp = Object.values(sess).filter((s) => s.camp);
const seen = camp.filter((s) => s.ev.has("gate_seen"));
const c = (list, e) => list.filter((s) => s.ev.has(e)).length;

console.log(`campanha total (desde o início, inclui pré-gate_seen): ${camp.length} sessões`);
console.log(`\nCOORTE HUMANO REAL (gate_seen, janela recente): ${seen.length} sessões`);
console.log(`  apostaram (gate_click): ${c(seen, "gate_click")} (${seen.length ? Math.round((c(seen, "gate_click") / seen.length) * 100) : 0}%)`);
console.log(`  ouviram 1ª vez: ${c(seen, "listen_done")}`);
console.log(`  loop completo: ${c(seen, "loop_done")}`);
console.log(`  gravaram voz: ${c(seen, "rec_done")}`);
console.log(`  →VSL: ${seen.filter((s) => s.ev.has("cta_click") || s.ev.has("skip_click")).length}`);
console.log("\npor anúncio (só coorte humana):");
const byAd = {};
for (const s of seen) {
  const k = s.ad || "(sem)";
  byAd[k] = byAd[k] || [];
  byAd[k].push(s);
}
for (const [ad, list] of Object.entries(byAd).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${ad}: ${list.length} humanos · ${c(list, "gate_click")} apostaram · ${c(list, "loop_done")} loop · ${list.filter((s) => s.ev.has("cta_click") || s.ev.has("skip_click")).length} →VSL`);
}
