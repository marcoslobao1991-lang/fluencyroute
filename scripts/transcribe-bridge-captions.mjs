// Retranscreve os MP3s da Manu com timestamps POR PALAVRA (Whisper
// verbose_json) → manu-captions.json vira { text, words: [{w, s}] }.
// A página usa isso pra legenda karaokê (palavra acende quando ela fala).
// Uso: node --use-system-ca scripts/transcribe-bridge-captions.mjs [--only m0,m1]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "bridge", "manu");
const OUT = path.join(ROOT, "app", "bridge", "manu-captions.json");

const env = readFileSync(path.join(ROOT, ".env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY="?([^"\r\n]+)"?/m) || [])[1];

// erros recorrentes do Whisper na voz 1.37x (corrige texto E palavras)
const WORD_FIXES = { budar: "grudar", becoreba: "decoreba", coeria: "correria", Aterta: "Aperta", aterta: "aperta" };
const WORD_FIXES_BY_ID = { m_tip_proso: { Shadow: "Shadowing", and: "de" } };

const onlyArg = process.argv.find((a) => a.startsWith("--only"));
const only = onlyArg ? (onlyArg.split("=")[1] || process.argv[process.argv.indexOf(onlyArg) + 1] || "").split(",").filter(Boolean) : null;

const captions = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

function fixWord(id, w) {
  const byId = WORD_FIXES_BY_ID[id] || {};
  const clean = w.trim();
  return byId[clean] || WORD_FIXES[clean] || clean;
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".mp3"));
for (const f of files) {
  const id = f.replace(/\.mp3$/, "");
  if (only && !only.includes(id)) continue;
  const fd = new FormData();
  fd.append("file", new Blob([readFileSync(path.join(DIR, f))], { type: "audio/mpeg" }), f);
  fd.append("model", "whisper-1");
  fd.append("language", "pt");
  fd.append("response_format", "verbose_json");
  fd.append("timestamp_granularities[]", "word");
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: fd,
  });
  if (!r.ok) {
    console.error(`✗ ${id}: ${r.status} ${await r.text()}`);
    continue;
  }
  const d = await r.json();
  let text = (d.text || "").trim();
  for (const [bad, good] of Object.entries({ ...WORD_FIXES, ...(WORD_FIXES_BY_ID[id] || {}) })) {
    text = text.split(bad).join(good);
  }
  captions[id] = {
    text,
    words: (d.words || []).map((w) => ({ w: fixWord(id, w.word), s: Math.round(w.start * 100) / 100 })),
  };
  console.log(`✓ ${id} (${captions[id].words.length} palavras)`);
}

writeFileSync(OUT, JSON.stringify(captions, null, 2) + "\n");
console.log("Legendas word-level → app/bridge/manu-captions.json");
