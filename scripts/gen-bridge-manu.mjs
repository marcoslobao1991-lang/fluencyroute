// Pré-gera as falas da Manu da /bridge como MP3 estático (custo único,
// zero latência/custo por visita). Voz "nova" = a MESMA do app da Manu.
// Uso: node scripts/gen-bridge-manu.mjs [--only m0,m1]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "bridge", "manu");
mkdirSync(OUT, { recursive: true });

// .env.local na mão (script roda fora do runtime do Next)
const env = readFileSync(path.join(ROOT, ".env.local"), "utf8");
const OPENAI_KEY = (env.match(/^OPENAI_API_KEY="?([^"\r\n]+)"?/m) || [])[1];
if (!OPENAI_KEY) {
  console.error("OPENAI_API_KEY não encontrada no .env.local");
  process.exit(1);
}

const LINES = JSON.parse(readFileSync(path.join(ROOT, "app", "bridge", "manu-lines.json"), "utf8"));

const onlyArg = process.argv.find((a) => a.startsWith("--only"));
const only = onlyArg ? (onlyArg.split("=")[1] || process.argv[process.argv.indexOf(onlyArg) + 1] || "").split(",").filter(Boolean) : null;
const force = process.argv.includes("--force");

// gpt-4o-mini-tts aceita "instructions" de atuação — é o que tira a voz
// do modo leitura-de-texto e bota a personalidade da Manu (tts-1 não tem).
// Voz "coral" = a mais viva do catálogo em PT-BR ("nova" sai chapada).
const PERSONA =
  "Mulher brasileira jovem, uns 25 anos, professora de inglês FAMOSA no Instagram. " +
  "Energia LÁ EM CIMA o tempo todo: fala rápido, alto astral contagiante, debochada, ri no meio das frases, " +
  "alonga vogais quando provoca (seeério?), muda de entonação o tempo inteiro — NUNCA monótona, nunca lê. " +
  "Soa como stories de influencer zoando um amigo íntimo, jamais como assistente virtual ou locutora de comercial. " +
  "Sotaque brasileiro natural, gírias à vontade, sorriso audível na voz.";

const VIBES = {
  provoca: PERSONA + " Nesta fala: deboche MÁXIMO. Tom de quem tá zoando, segurando a risada, ironia escancarada, ritmo acelerado.",
  conspira: PERSONA + " Nesta fala: abaixa pra tom de segredo, cúmplice, quase sussurrando... e EXPLODE pra cima no final.",
  comemora: PERSONA + " Nesta fala: EXPLODE de alegria, comemora gritando, ri de verdade, energia de gol em final de campeonato.",
  encoraja: PERSONA + " Nesta fala: melhor amiga que não te deixa desistir — calorosa, firme, terminando lá em cima, contagiante.",
};

async function gen(id, line) {
  const file = path.join(OUT, `${id}.mp3`);
  if (!force && existsSync(file)) {
    console.log(`· ${id} já existe, pulando`);
    return;
  }
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: line.text,
      instructions: VIBES[line.vibe] || PERSONA,
      response_format: "mp3",
    }),
  });
  if (!res.ok) throw new Error(`${id}: ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(file, buf);
  console.log(`✓ ${id}.mp3 [${line.vibe}] (${(buf.length / 1024).toFixed(0)} KB)`);
}

const ids = Object.keys(LINES).filter((id) => !only || only.includes(id));
console.log(`Gerando ${ids.length} falas da Manu → public/bridge/manu/`);
for (const id of ids) {
  await gen(id, LINES[id]);
}
console.log("Pronto.");
