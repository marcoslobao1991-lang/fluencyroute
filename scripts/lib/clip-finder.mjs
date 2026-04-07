// ═══════════════════════════════════════════════════════════════
// CLIP FINDER — Busca YouTube → Download → Whisper → Corta clip
//
// Input:  expressão em inglês (ex: "break a leg")
// Output: clip de 2-5s em MP4 com nativo usando a expressão
//
// Fluxo:
//   1. Busca no YouTube: "break a leg english example"
//   2. yt-dlp baixa o vídeo (720p max, pra ser leve)
//   3. OpenAI Whisper transcreve com timestamps word-level
//   4. Acha o trecho exato onde a expressão aparece
//   5. FFmpeg corta clip de 1s antes a 2s depois
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve } from 'path';

const env = readFileSync(resolve('C:/Users/Asus/fluencyroute/.env.local'), 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();

const CLIPS_DIR = resolve('C:/Users/Asus/fluencyroute/clips');
if (!existsSync(CLIPS_DIR)) mkdirSync(CLIPS_DIR, { recursive: true });

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', timeout: opts.timeout || 120000, ...opts }).toString().trim();
  } catch (e) {
    const err = e.stderr?.toString()?.slice(-300) || e.message?.slice(0, 300);
    throw new Error(err);
  }
}

// ─── 1. Search YouTube for a video with the expression ───
export async function searchYouTube(query, maxResults = 3) {
  // Use yt-dlp search (no API key needed)
  const cmd = `yt-dlp "ytsearch${maxResults}:${query}" --print id --print title --no-download --flat-playlist`;
  const output = run(cmd, { timeout: 30000 });
  const lines = output.split('\n').filter(Boolean);

  const results = [];
  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i] && lines[i + 1]) {
      results.push({ id: lines[i], title: lines[i + 1] });
    }
  }
  return results;
}

// ─── 2. Download video (720p max, first 5 min only) ───
export function downloadVideo(videoId, outputPath) {
  const cmd = `yt-dlp "https://youtube.com/watch?v=${videoId}" -f "bestvideo[height<=720]+bestaudio/best[height<=720]" --merge-output-format mp4 -o "${outputPath}" --download-sections "*0:00-5:00" --force-keyframes-at-cuts --no-playlist`;
  run(cmd, { timeout: 180000 });
  return outputPath;
}

// ─── 3. Transcribe with OpenAI Whisper API (word-level timestamps) ───
export async function transcribe(audioPath) {
  // Extract audio first (Whisper API accepts audio files)
  const wavPath = audioPath.replace('.mp4', '_audio.wav');
  run(`ffmpeg -y -i "${audioPath}" -ar 16000 -ac 1 -t 300 "${wavPath}"`);

  const formData = new FormData();
  const audioBuffer = readFileSync(wavPath);
  formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: formData,
  });

  // Cleanup wav
  try { unlinkSync(wavPath); } catch {}

  const data = await res.json();
  return data;
}

// ─── 4. Find expression in transcript ───
export function findExpression(transcript, expression) {
  const words = transcript.words || [];
  const exprWords = expression.toLowerCase().split(/\s+/);

  for (let i = 0; i <= words.length - exprWords.length; i++) {
    let match = true;
    for (let j = 0; j < exprWords.length; j++) {
      const transcriptWord = (words[i + j]?.word || '').toLowerCase().replace(/[.,!?'"]/g, '');
      if (transcriptWord !== exprWords[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return {
        found: true,
        start: words[i].start,
        end: words[i + exprWords.length - 1].end,
        context: words.slice(Math.max(0, i - 3), i + exprWords.length + 3)
          .map(w => w.word).join(' '),
      };
    }
  }
  return { found: false };
}

// ─── 5. Cut clip (1s before, 2s after the expression) ───
export function cutClip(videoPath, start, end, outputPath) {
  const clipStart = Math.max(0, start - 1);
  const clipEnd = end + 2;
  const duration = clipEnd - clipStart;

  const cmd = `ffmpeg -y -ss ${clipStart.toFixed(2)} -i "${videoPath}" -t ${duration.toFixed(2)} -c:v libx264 -preset fast -crf 23 -c:a aac -ar 44100 "${outputPath}"`;
  run(cmd, { timeout: 60000 });
  return outputPath;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN: Find a clip for an expression
// ═══════════════════════════════════════════════════════════════
export async function findClip(expression, searchQuery = null) {
  const query = searchQuery || `"${expression}" english conversation example`;
  const clipId = expression.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const clipDir = join(CLIPS_DIR, clipId);
  mkdirSync(clipDir, { recursive: true });

  const finalClip = join(clipDir, 'clip.mp4');
  if (existsSync(finalClip)) {
    console.log(`    ♻️ Clip já existe: ${finalClip}`);
    return { path: finalClip, cached: true };
  }

  // Step 1: Search
  console.log(`    🔍 Buscando "${expression}" no YouTube...`);
  const results = await searchYouTube(query);
  if (results.length === 0) {
    throw new Error(`Nenhum resultado no YouTube para: ${query}`);
  }
  console.log(`    📺 ${results.length} resultados: ${results[0].title}`);

  // Step 2: Download (try each result until one works)
  const fullVideo = join(clipDir, 'full.mp4');
  let downloaded = false;
  for (const result of results) {
    try {
      console.log(`    ⬇️ Baixando ${result.id}...`);
      downloadVideo(result.id, fullVideo);
      downloaded = true;
      break;
    } catch (e) {
      console.log(`    ⚠️ Falhou: ${e.message.slice(0, 80)}`);
    }
  }
  if (!downloaded) throw new Error('Não conseguiu baixar nenhum vídeo');

  // Step 3: Transcribe
  console.log(`    🎤 Transcrevendo com Whisper...`);
  const transcript = await transcribe(fullVideo);

  // Step 4: Find expression
  console.log(`    🔎 Procurando "${expression}" no transcript...`);
  const match = findExpression(transcript, expression);

  if (!match.found) {
    // Try partial match (first 2 words)
    const partial = expression.split(/\s+/).slice(0, 2).join(' ');
    const partialMatch = findExpression(transcript, partial);
    if (!partialMatch.found) {
      // Fallback: use first 3 seconds of video
      console.log(`    ⚠️ Expressão não encontrada, usando primeiros 3s`);
      cutClip(fullVideo, 0, 3, finalClip);
      try { unlinkSync(fullVideo); } catch {}
      return { path: finalClip, cached: false, fallback: true };
    }
    Object.assign(match, partialMatch);
  }

  console.log(`    ✅ Encontrado em ${match.start.toFixed(1)}s-${match.end.toFixed(1)}s: "${match.context}"`);

  // Step 5: Cut clip
  cutClip(fullVideo, match.start, match.end, finalClip);

  // Cleanup full video
  try { unlinkSync(fullVideo); } catch {}

  console.log(`    🎬 Clip: ${finalClip}`);
  return { path: finalClip, cached: false, match };
}

// CLI usage
if (process.argv[2]) {
  findClip(process.argv[2]).then(r => {
    console.log(`\n✅ ${r.path}`);
  }).catch(e => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
