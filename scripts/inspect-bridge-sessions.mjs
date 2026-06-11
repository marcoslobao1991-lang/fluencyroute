// Inspeção rápida: cada sessão da bridge nova (variante B), caminho completo,
// horário, device e utm — pra separar teste interno de tráfego real.
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const KEY = readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^SUPABASE_SERVICE_KEY="?([^"\r\n]+)"?/m)[1];

const r = await fetch(
  "https://petrtewismhpzidcmmwb.supabase.co/rest/v1/funnel_events?funnel=eq.ingles&page=eq.bridge&variant=eq.B&select=event,detail,session_id,ts,user_agent,utm_source&order=ts.asc&limit=2000",
  { headers: { apikey: KEY, Authorization: "Bearer " + KEY } }
);
const rows = await r.json();
console.log("total eventos variante B:", rows.length);

const sess = {};
for (const x of rows.filter((x) => x.event !== "speech_token")) {
  const id = x.session_id || "sem-sessao";
  if (!sess[id]) sess[id] = { events: [], first: x.ts, ua: (x.user_agent || "").slice(0, 70), utm: x.utm_source };
  sess[id].events.push(x.event + (x.detail ? ":" + String(x.detail).slice(0, 14) : ""));
}
const ids = Object.keys(sess);
console.log("sessões únicas:", ids.length, "\n");
for (const id of ids) {
  const s = sess[id];
  console.log("───", s.first.slice(5, 16) + "Z", "· utm:", s.utm || "nenhum", "·", s.ua || "(sem UA)");
  console.log("   ", s.events.join(" → "), "\n");
}
