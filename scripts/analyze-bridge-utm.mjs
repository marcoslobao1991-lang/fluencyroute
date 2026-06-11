// Análise por anúncio (utm_content) + gate antes/depois do redesign (20:50Z).
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const KEY = readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^SUPABASE_SERVICE_KEY="?([^"\r\n]+)"?/m)[1];
const GATE_V2 = "2026-06-11T20:50:00Z"; // deploy do gate vivo

const r = await fetch(
  "https://petrtewismhpzidcmmwb.supabase.co/rest/v1/funnel_events?funnel=eq.ingles&page=eq.bridge&variant=eq.B&select=event,detail,session_id,id,ts,utm_source,utm_campaign,utm_content,fbclid&order=ts.asc&limit=5000",
  { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: "0-4999" } }
);
const rows = (await r.json()).filter((x) => x.event !== "speech_token");

// sessões de campanha
const sess = {};
for (const x of rows) {
  const id = x.session_id || x.id;
  if (!sess[id]) sess[id] = { events: new Set(), ad: null, first: x.ts, campaign: false };
  sess[id].events.add(x.event);
  if (x.utm_source || x.fbclid) sess[id].campaign = true;
  if (!sess[id].ad && (x.utm_content || x.utm_campaign)) sess[id].ad = (x.utm_content || x.utm_campaign).slice(0, 40);
}
const camp = Object.values(sess).filter((s) => s.campaign);
console.log(`sessões de campanha: ${camp.length} (de ${Object.keys(sess).length} totais)\n`);

function funnel(list, label) {
  const c = (ev) => list.filter((s) => s.events.has(ev)).length;
  const seen = c("gate_seen");
  const gate = c("gate_click");
  console.log(
    `${label}: ${list.length} visitas · ${seen} viram 3s · ${gate} apostaram` +
      (seen ? ` (${Math.round((gate / seen) * 100)}% dos que viram)` : "") +
      ` · ${c("loop_done")} loop · ${c("rec_done")} gravaram · ${list.filter((s) => s.events.has("cta_click") || s.events.has("skip_click")).length} →VSL`
  );
}

console.log("═══ GATE ANTES vs DEPOIS do redesign (20:50Z) ═══");
funnel(camp.filter((s) => s.first < GATE_V2), "ANTES (estático)");
funnel(camp.filter((s) => s.first >= GATE_V2), "DEPOIS (cena viva)");

console.log("\n═══ POR ANÚNCIO ═══");
const ads = {};
for (const s of camp) {
  const k = s.ad || "(sem utm_content)";
  ads[k] = ads[k] || [];
  ads[k].push(s);
}
for (const [ad, list] of Object.entries(ads).sort((a, b) => b[1].length - a[1].length)) {
  funnel(list, ad);
}
