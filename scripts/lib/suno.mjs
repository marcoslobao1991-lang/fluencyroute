// ═══════════════════════════════════════════════════════════════
// SUNO API — Gera música via ApiPass
// Style: "Acoustic, Singing" (definitivo)
// ═══════════════════════════════════════════════════════════════

const API_KEY = "apk_b4a35520d40457273342dacb5558743db9a5cafefb8c740f9ee959e08d6454a0";
const BASE_URL = "https://api.apipass.dev";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function createSunoTask(lyrics, title, style = "Acoustic Rock, Singing") {
  const res = await fetch(`${BASE_URL}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "suno/generate",
      input: {
        model_version: "V4",
        prompt: lyrics,
        customMode: true,
        instrumental: false,
        style,
        title,
      },
    }),
  }).then(r => r.json());

  if (res.data?.taskId) return res.data.taskId;
  throw new Error(`Suno task failed: ${JSON.stringify(res)}`);
}

export async function waitForSunoTask(taskId, maxWaitSec = 360) {
  let elapsed = 0;
  while (elapsed < maxWaitSec) {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${API_KEY}` },
    }).then(r => r.json());

    const state = res.data?.state;
    if (state === "success") {
      const tracks = res.data.resultJson?.data || [];
      return tracks;
    }
    if (state === "fail") throw new Error(`Suno failed: ${res.data.failMsg}`);

    process.stdout.write(`  ⏳ ${state}... (${elapsed}s)\r`);
    await sleep(10000);
    elapsed += 10;
  }
  throw new Error("Suno timeout");
}

// Formata letra com tags Suno pra cantar 1x só e parar
export function formatLyrics(phrases) {
  return [
    "[Verse]",
    ...phrases,
    "[End]",
  ].join("\n");
}

export async function generateMusic(lyrics, title, style = "Sertanejo Universitário, Acoustic, Male Vocals, 120 BPM") {
  console.log(`  🎵 Gerando música: "${title}"`);
  console.log(`     Style: ${style}`);
  console.log(`     Lyrics:\n${lyrics.split('\n').map(l => `       ${l}`).join('\n')}`);
  const taskId = await createSunoTask(lyrics, title, style);
  console.log(`     Task: ${taskId}`);
  const tracks = await waitForSunoTask(taskId);
  // Pega variação [1] (padrão), fallback [0]
  const track = tracks[1] || tracks[0];
  console.log(`  ✅ Música pronta: ${track.duration?.toFixed(1)}s`);
  return {
    audioUrl: track.audio_url,
    duration: track.duration,
    allTracks: tracks,
  };
}

export async function downloadAudio(url, outputPath) {
  const { writeFileSync } = await import('fs');
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  return outputPath;
}
