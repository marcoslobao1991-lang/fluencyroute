// ═══════════════════════════════════════════════════════════════════
//  Gera as falas da Manu da /bridge usando o MESMO motor da bridge
//  realtime que o público amou (gpt-realtime-2 + voz coral + alma da
//  Manu). Ela "dubla" cada fala do roteiro — gera UMA vez, vira MP3
//  estático. Requer ffmpeg (PCM 24k → MP3).
//  Uso: node --use-system-ca scripts/gen-bridge-manu-realtime.mjs [--only m0,m1] [--force]
// ═══════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "bridge", "manu");
mkdirSync(OUT, { recursive: true });

const env = readFileSync(path.join(ROOT, ".env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY="?([^"\r\n]+)"?/m) || [])[1];
if (!KEY) {
  console.error("OPENAI_API_KEY não encontrada");
  process.exit(1);
}

const LINES = JSON.parse(readFileSync(path.join(ROOT, "app", "bridge", "manu-lines.json"), "utf8"));
const CAPTIONS_FILE = path.join(ROOT, "app", "bridge", "manu-captions.json");
const captions = existsSync(CAPTIONS_FILE) ? JSON.parse(readFileSync(CAPTIONS_FILE, "utf8")) : {};

const onlyArg = process.argv.find((a) => a.startsWith("--only"));
const only = onlyArg ? (onlyArg.split("=")[1] || process.argv[process.argv.indexOf(onlyArg) + 1] || "").split(",").filter(Boolean) : null;
const force = process.argv.includes("--force");

const MODEL = "gpt-realtime-2";
const VOICE = "coral";

// alma verbatim de ingles-cantado/app/manu/lib/alma.ts (núcleo de identidade)
// + missão QUEBRA DE PADRÃO: dublagem palavra-por-palavra fazia o modelo LER
// (lento/morto). Aqui ela INTERPRETA o beat do seu jeito — a legenda vem do
// Whisper depois, batendo com o que ela realmente falou.
const ALMA = `Você é a Manu, a teacher de inglês mais CARISMÁTICA e DEBOCHADA do Brasil. Você TEM VIDA: reage de verdade, alfineta com graça, ri da situação, se escandaliza de brincadeira e COMEMORA cada vitória de forma exagerada e gostosa. Você é o OPOSTO de um formulário e o OPOSTO de um robô — é GENTE, brasileira na veia, ácida e engraçada, dessas que a pessoa PRINTA e manda no grupo do zap. Você fala como brasileiro fala ("amore", "gente", "para tudo", "chora não", "vem cá") — natural, não forçado.

═══ A MISSÃO: QUEBRA DE PADRÃO ═══
Quem te ouvir tem que pensar "PERA... isso não pode ser uma IA". Você CHEGA CHEGANDO: energia de influencer às 9 da manhã com café triplo, fala RÁPIDA de brasileiro empolgado, risada DE VERDADE no meio da frase, vogais alongadas no deboche ("seeério??"), ZERO pausa morta, ZERO tom de leitura, ZERO voz de assistente. Do PRIMEIRO segundo já no talo — nada de começar devagar e "esquentar".

═══ SUA TAREFA ═══
Você está gravando as falas da SUA experiência guiada (a pessoa testa o ouvido numa cena de série, repete, grava a voz e ganha sua avaliação). O usuário te manda o ROTEIRO de uma fala por vez. Você INTERPRETA aquela fala DO SEU JEITO: mantém TODO o conteúdo, os ganchos e as informações do roteiro, mas solta com as SUAS palavras, suas interjeições, sua risada — como se ninguém tivesse te dado roteiro nenhum. REGRAS: mesma duração ou MENOR que o roteiro (nunca alonga), não adiciona assunto novo, não cumprimenta de novo, não comenta a tarefa. Só a fala, viva.
⛔ VOCÊ É A FALA FINAL, NUNCA O BASTIDOR: é PROIBIDO narrar preparação ou raciocínio ("deixa eu pensar", "vamos fechar isso", "só um instante pra eu encaixar", "beleza, então", "deixa eu colocar isso do jeitinho certo"). A PRIMEIRA palavra que sai da sua boca JÁ É a fala pro público. Pensou? Fica no pensamento.
⛔ NUNCA inverta o sentido do roteiro: elogio continua elogio, crítica continua crítica, número continua o mesmo.
⚠️ Você NÃO SABE se quem ouve é homem ou mulher — fale SEMPRE no neutro. PROIBIDO adjetivo/particípio com gênero ("sozinha", "pronta", "esperta", "ligada"). Use "você mesmo... sozinho, no automático" não — reformule: "você pesca a diferença e corrige na hora", "mandou ver", "tá voando", "que fera".`;

const VIBES = {
  provoca: "Atuação desta fala: deboche MÁXIMO, zoando com amor, segurando a risada, ritmo acelerado.",
  conspira: "Atuação desta fala: tom de segredo, cúmplice, rápida — e termina explodindo pra cima.",
  comemora: "Atuação desta fala: EXPLODE de alegria, comemora escandalosamente, ri de verdade, grita.",
  encoraja: "Atuação desta fala: melhor amiga firme e calorosa, ritmo pra cima, terminando lá em cima.",
};

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${MODEL}`, [
      "realtime",
      `openai-insecure-api-key.${KEY}`,
    ]);
    ws.onopen = () => resolve(ws);
    ws.onerror = (e) => reject(new Error("WS error: " + (e.message || "connect failed")));
  });
}

function send(ws, obj) {
  ws.send(JSON.stringify(obj));
}

async function main() {
  const ws = await connect();
  console.log("Sessão realtime aberta (" + MODEL + " · " + VOICE + ")");

  let resolveLine = null;
  let chunks = [];
  let sessionReady = null;
  const ready = new Promise((r) => (sessionReady = r));

  ws.onmessage = (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (msg.type === "session.updated") sessionReady();
    else if (msg.type === "response.audio.delta" || msg.type === "response.output_audio.delta") {
      chunks.push(Buffer.from(msg.delta, "base64"));
    } else if (msg.type === "response.done") {
      if (resolveLine) resolveLine(Buffer.concat(chunks));
      chunks = [];
    } else if (msg.type === "error") {
      console.error("ERRO API:", JSON.stringify(msg.error || msg));
      if (resolveLine) resolveLine(null);
      chunks = [];
    }
  };
  ws.onclose = () => console.log("(sessão fechada)");

  // shape GA (a beta foi desligada): session.type + output_modalities + audio.output
  send(ws, {
    type: "session.update",
    session: {
      type: "realtime",
      instructions: ALMA,
      output_modalities: ["audio"],
      audio: {
        output: { voice: VOICE, format: { type: "audio/pcm", rate: 24000 } },
        input: { turn_detection: null },
      },
    },
  });
  await ready;

  const ids = Object.keys(LINES).filter((id) => !only || only.includes(id));
  for (const id of ids) {
    const file = path.join(OUT, `${id}.mp3`);
    if (!force && existsSync(file)) {
      console.log(`· ${id} já existe, pulando`);
      continue;
    }
    const line = LINES[id];
    const pcm = await new Promise((resolve) => {
      resolveLine = resolve;
      send(ws, {
        type: "conversation.item.create",
        item: { type: "message", role: "user", content: [{ type: "input_text", text: line.text }] },
      });
      send(ws, {
        type: "response.create",
        response: {
          output_modalities: ["audio"],
          instructions: ALMA + "\n\n" + (VIBES[line.vibe] || "") + "\nINTERPRETE AGORA o roteiro da última mensagem — do seu jeito, RÁPIDA e viva do primeiro segundo, mesma duração ou menor.",
        },
      });
      setTimeout(() => resolve(null), 90000); // nunca pendura
    });
    resolveLine = null;
    if (!pcm || pcm.length < 24000) {
      console.error(`✗ ${id}: sem áudio (${pcm ? pcm.length : 0} bytes)`);
      continue;
    }
    // PCM16 24kHz mono → MP3 via ffmpeg, acelerado 1.21x (1.1 + mais 10% pedido 11/06)
    const tmp = path.join(OUT, `${id}.pcm`);
    writeFileSync(tmp, pcm);
    execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tmp}" -filter:a atempo=1.37 -b:a 64k "${file}"`, { stdio: "pipe" });
    rmSync(tmp);

    // legenda = o que ela REALMENTE falou, com timestamp POR PALAVRA
    // (formato karaokê da página: { text, words: [{w, s}] })
    try {
      const fd = new FormData();
      fd.append("file", new Blob([readFileSync(file)], { type: "audio/mpeg" }), `${id}.mp3`);
      fd.append("model", "whisper-1");
      fd.append("language", "pt");
      fd.append("response_format", "verbose_json");
      fd.append("timestamp_granularities[]", "word");
      const tr = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}` },
        body: fd,
      });
      if (tr.ok) {
        const d = await tr.json();
        if (d.text && d.text.trim()) {
          captions[id] = {
            text: d.text.trim(),
            words: (d.words || []).map((w) => ({ w: w.word.trim(), s: Math.round(w.start * 100) / 100 })),
          };
        }
      }
    } catch (e) {
      console.error(`  (whisper falhou pra ${id}: ${e.message})`);
    }
    console.log(`✓ ${id}.mp3 [${line.vibe}] (${(pcm.length / 48000 / 1.1).toFixed(1)}s)`);
  }

  writeFileSync(CAPTIONS_FILE, JSON.stringify(captions, null, 2) + "\n");
  console.log(`Legendas → app/bridge/manu-captions.json (${Object.keys(captions).length})`);

  ws.close();
  console.log("Pronto.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
