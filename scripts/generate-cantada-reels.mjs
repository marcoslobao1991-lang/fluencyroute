#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CENA ORIGINAL vs CENA CANTADA — Pipeline de Produção v1
//
// Fluxo: Supabase (cena) → Suno (música) → Whisper (karaoke) → Props Remotion
// Output: cantada-batch-{timestamp}/ com props.json por reel
//
// Usage: node scripts/generate-cantada-reels.mjs [quantidade]
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { generateMusic, downloadAudio } from './lib/suno.mjs';
import { transcribeAudio, findVocalRange } from './lib/whisper.mjs';

// ── Config ──
const env = readFileSync('.env.local', 'utf8');
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const FPS = 30;

// ── Hooks (rotaciona) ──
const HOOKS = [
  "E se essa cena fosse uma MÚSICA?",
  "Versão cantada GRUDA na cabeça",
  "Você nunca mais vai esquecer essa frase",
  "Qual versão gruda mais?",
  "Escuta e tenta NÃO cantar junto",
  "Inglês que entra pela MÚSICA",
  "Sua memória vai DECORAR isso",
  "Aposto que você vai repetir",
];

const BATCH_SIZE = parseInt(process.argv[2] || '5');

// ═══════════════════════════════════════════════════════════════
//  1. SELECIONAR CENAS (5-12 palavras, com media, com PT)
// ═══════════════════════════════════════════════════════════════
async function getApprovedScenes() {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/scenes?select=id,episode_id,scene_order,en,pt,media_url&media_url=neq.&order=id.asc&limit=5000`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const all = await res.json();

  return all.filter(s => {
    const words = s.en.split(/\s+/).length;
    return words >= 5 && words <= 12
      && s.media_url
      && s.pt && s.pt.length > 5 && s.pt.length < 80
      && !s.en.includes('...')
      && !s.en.startsWith('Uh')
      && !s.en.startsWith('Oh,')
      && !/\b(sex|kill|drug|die|dead|damn|hell|ass|shit|fuck|bitch|crap)\b/i.test(s.en)
      && !/^(Yes|No|Okay|Oh|Uh|Hey)[\.\!\?]?$/i.test(s.en.trim());
  });
}

function pickScene(pool, usedIds) {
  const available = pool.filter(s => !usedIds.has(s.id));
  if (available.length === 0) throw new Error('Pool esgotado');
  return available[Math.floor(Math.random() * available.length)];
}

// ═══════════════════════════════════════════════════════════════
//  2. DOWNLOAD CLIP + FFPROBE
// ═══════════════════════════════════════════════════════════════
async function downloadClip(url, dest) {
  if (existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function getDurationFrames(filePath) {
  try {
    const dur = parseFloat(
      execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`)
        .toString().trim()
    );
    return Math.round(dur * FPS);
  } catch {
    return 4 * FPS;
  }
}

// ═══════════════════════════════════════════════════════════════
//  3. SUNO — Gera versão cantada da frase
// ═══════════════════════════════════════════════════════════════
async function generateCantada(scene) {
  // Formata a frase como letra de música
  const lyrics = `[Verse]\n${scene.en}\n[End]`;
  const title = `Friends - ${scene.episode_id}`;

  const result = await generateMusic(lyrics, title, "Acoustic, Singing");
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  4. WHISPER — Timestamps word-level do áudio Suno
// ═══════════════════════════════════════════════════════════════
async function getKaraokeTimings(audioPath) {
  const transcript = await transcribeAudio(audioPath);
  const { words } = findVocalRange(transcript);

  // Converte timestamps (segundos) pra frames
  return words.map(w => ({
    word: w.word,
    startFrame: Math.round(w.start * FPS),
    endFrame: Math.round(w.end * FPS),
  }));
}

// ═══════════════════════════════════════════════════════════════
//  5. MONTAR PROPS REMOTION
// ═══════════════════════════════════════════════════════════════
function buildProps(scene, clipDurationFrames, sunoResult, sunoDurationFrames, words, hook) {
  return {
    clipUrl: scene.media_url,
    clipDurationFrames,
    sunoAudioUrl: sunoResult.audioUrl,
    sunoDurationFrames,
    en: scene.en,
    pt: scene.pt,
    hookText: hook,
    words,
  };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n═══ CENA ORIGINAL vs CANTADA — Pipeline v1 ═══`);
  console.log(`Batch: ${BATCH_SIZE} reels\n`);

  // 1. Pool de cenas
  console.log('1. Carregando cenas do Supabase...');
  const pool = await getApprovedScenes();
  console.log(`   ${pool.length} cenas aprovadas\n`);

  // Batch dir
  const batchDir = join('scripts', 'cantada-batch-' + Date.now());
  mkdirSync(batchDir, { recursive: true });

  const usedIds = new Set();
  const results = [];

  for (let r = 0; r < BATCH_SIZE; r++) {
    console.log(`\n── Reel ${r + 1}/${BATCH_SIZE} ──`);

    // 2. Selecionar cena
    const scene = pickScene(pool, usedIds);
    usedIds.add(scene.id);
    console.log(`   Cena: "${scene.en}"`);
    console.log(`   PT: "${scene.pt}"`);
    console.log(`   Episódio: ${scene.episode_id}`);

    const reelDir = join(batchDir, `reel-${r + 1}`);
    mkdirSync(reelDir, { recursive: true });

    // 3. Download clip original + duração
    const clipPath = join(reelDir, 'original.mp4');
    console.log('   Downloading clip...');
    await downloadClip(scene.media_url, clipPath);
    const clipDurationFrames = getDurationFrames(clipPath);
    console.log(`   Clip: ${(clipDurationFrames / FPS).toFixed(1)}s (${clipDurationFrames} frames)`);

    // 4. Suno — gera versão cantada
    let sunoResult;
    try {
      sunoResult = await generateCantada(scene);
    } catch (e) {
      console.log(`   ⚠️ Suno falhou: ${e.message}, pulando reel`);
      continue;
    }

    // 5. Download áudio Suno
    const sunoPath = join(reelDir, 'suno.mp3');
    console.log('   Downloading Suno audio...');
    await downloadAudio(sunoResult.audioUrl, sunoPath);
    const sunoDurationFrames = getDurationFrames(sunoPath);
    console.log(`   Suno: ${(sunoDurationFrames / FPS).toFixed(1)}s (${sunoDurationFrames} frames)`);

    // 6. Whisper — timestamps word-level
    let words;
    try {
      words = await getKaraokeTimings(sunoPath);
      console.log(`   Karaoke: ${words.length} palavras com timing`);
    } catch (e) {
      console.log(`   ⚠️ Whisper falhou: ${e.message}, usando timing estimado`);
      words = undefined; // Remotion vai gerar timing linear
    }

    // 7. Hook
    const hook = HOOKS[r % HOOKS.length];

    // 8. Props Remotion
    const props = buildProps(scene, clipDurationFrames, sunoResult, sunoDurationFrames, words, hook);
    const propsPath = join(reelDir, 'props.json');
    writeFileSync(propsPath, JSON.stringify(props, null, 2));

    // 9. Metadata
    const meta = {
      reel: r + 1,
      hook,
      scene: {
        id: scene.id,
        episode: scene.episode_id,
        en: scene.en,
        pt: scene.pt,
      },
      suno: {
        audioUrl: sunoResult.audioUrl,
        duration: sunoResult.duration,
      },
      clipDurationFrames,
      sunoDurationFrames,
      karaokeWords: words?.length || 0,
      generatedAt: new Date().toISOString(),
    };
    writeFileSync(join(reelDir, 'meta.json'), JSON.stringify(meta, null, 2));

    results.push({ reel: r + 1, dir: reelDir, hook, scene: scene.en });
    console.log(`   ✅ Reel ${r + 1} pronto → ${reelDir}`);
  }

  // Summary
  console.log('\n═══ BATCH COMPLETO ═══');
  console.log(`${results.length} reels gerados em ${batchDir}/\n`);
  results.forEach(r => {
    console.log(`  Reel ${r.reel}: "${r.scene}"`);
    console.log(`    Hook: "${r.hook}"`);
  });

  console.log(`\n── Próximo passo ──`);
  console.log(`Render Lambda: node scripts/render-cantada-batch.mjs ${batchDir}`);

  // Batch index
  writeFileSync(join(batchDir, 'index.json'), JSON.stringify({
    batchSize: results.length,
    generatedAt: new Date().toISOString(),
    reels: results.map(r => ({ reel: r.reel, dir: r.dir, hook: r.hook, scene: r.scene })),
  }, null, 2));
}

main().catch(e => { console.error('Pipeline error:', e.message); process.exit(1); });
