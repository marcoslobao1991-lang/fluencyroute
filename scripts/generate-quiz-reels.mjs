#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// FLUENCY QUIZ — Pipeline de Produção v1
// Gera props Remotion-ready pra FITB quiz reels
//
// Fluxo: Supabase → GPT (blankWord + distratores) → ffprobe → JSON
// Output: quiz-batch-{timestamp}/ com props.json + cenas baixadas
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

// ── Config ──
const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const FPS = 30;

// ── Arsenal de hooks (rotaciona automaticamente) ──
const HOOKS = [
  "SÓ 1% ACERTA AS 3",
  "FLUENTE ACERTA AS 3",
  "90% ERRA ESSA FRASE",
  "APOSTO QUE VOCÊ ERRA A 3ª",
  "VOCÊ ENTENDE ESSA CENA?",
  "QUAL A PALAVRA CERTA?",
  "TESTE SEU INGLÊS",
  "ESSA CENA ENGANA TODO MUNDO",
  "NINGUÉM ACERTA ESSA",
];

// ── Quantos reels gerar por batch ──
const BATCH_SIZE = parseInt(process.argv[2] || '5');

// ═══════════════════════════════════════════════════════════════
//  1. SELECIONAR CENAS
// ═══════════════════════════════════════════════════════════════
async function getAllScenes() {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/scenes?select=id,episode_id,scene_order,en,pt,media_url&media_url=neq.&order=id.asc&limit=5000`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const all = await res.json();

  // Filtro: 5-12 palavras EN, tem media, tem PT, PT não muito longo
  return all.filter(s => {
    const words = s.en.split(/\s+/).length;
    return words >= 5 && words <= 12
      && s.media_url
      && s.pt && s.pt.length > 5 && s.pt.length < 80
      && !s.en.includes('...')  // evita frases cortadas
      && !s.en.startsWith('Uh')
      && !s.en.startsWith('Oh')
  });
}

function pickScenes(pool, count = 3, usedIds = new Set()) {
  const picked = [];
  const available = pool.filter(s => !usedIds.has(s.id));
  while (picked.length < count && available.length > picked.length) {
    const idx = Math.floor(Math.random() * available.length);
    const scene = available[idx];
    if (!picked.find(p => p.id === scene.id)) {
      picked.push(scene);
    }
  }
  return picked;
}

// ═══════════════════════════════════════════════════════════════
//  2. GPT — ESCOLHE blankWord + GERA 3 distratores EN
// ═══════════════════════════════════════════════════════════════
async function generateFITB(scene) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      max_tokens: 200,
      messages: [{
        role: 'system',
        content: `You create fill-in-the-blank English quizzes from TV series dialogue. Rules:
- Pick the most INTERESTING word to blank out (verb, noun, or adjective — never articles, pronouns, or prepositions)
- The blank word MUST be a common English word (no foreign words, brand names, or proper nouns)
- If the sentence contains non-English words, pick a DIFFERENT word to blank out
- Pick a word that someone who partially understood the audio might get wrong
- Generate exactly 3 wrong options that are plausible (similar category, could fit grammatically)
- ALL 4 options (correct + 3 wrong) must be common English words only — NO foreign words, NO names, NO abbreviations
- All 4 options must be DIFFERENT from each other (no duplicates, even with different capitalization)
- The 4 options should all be single English words, similar length
- Respond ONLY with JSON, no markdown`
      }, {
        role: 'user',
        content: `Sentence: "${scene.en}"
Context: ${scene.episode_id}

Return: {"blankWord": "the word to remove", "wrong1": "plausible wrong word", "wrong2": "plausible wrong word", "wrong3": "plausible wrong word"}`
      }],
    }),
  }).then(r => r.json());

  const text = (res.choices?.[0]?.message?.content || '').trim();
  try {
    const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0]);
    if (!parsed.blankWord || !parsed.wrong1 || !parsed.wrong2 || !parsed.wrong3) throw new Error('missing fields');

    // Verificar que blankWord realmente existe na frase
    if (!scene.en.toLowerCase().includes(parsed.blankWord.toLowerCase())) {
      throw new Error(`blankWord "${parsed.blankWord}" not found in sentence`);
    }

    return parsed;
  } catch (e) {
    console.log(`    ⚠️ GPT parse error: ${e.message}, retrying...`);
    // Retry simplificado
    const retry = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', max_tokens: 150,
        messages: [{ role: 'user', content: `English sentence: "${scene.en}"\n\nPick one interesting word to blank out and give 3 wrong alternatives.\nJSON only: {"blankWord":"...","wrong1":"...","wrong2":"...","wrong3":"..."}` }],
      }),
    }).then(r => r.json());
    const t2 = (retry.choices?.[0]?.message?.content || '').replace(/```json\s*/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(t2.match(/\{[\s\S]*\}/)?.[0]);
    } catch {
      // Fallback: pega a última palavra substantiva
      const words = scene.en.replace(/[.,!?]/g, '').split(/\s+/).filter(w => w.length > 3);
      const blank = words[words.length - 1] || words[0];
      return { blankWord: blank, wrong1: "something", wrong2: "nothing", wrong3: "everything" };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  3. DOWNLOAD + FFPROBE — duração do clipe em frames
// ═══════════════════════════════════════════════════════════════
async function downloadClip(url, dest) {
  if (existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function getClipDurationFrames(filePath) {
  try {
    const dur = parseFloat(
      execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`)
        .toString().trim()
    );
    return Math.round(dur * FPS);
  } catch {
    return 3 * FPS; // fallback 3s
  }
}

// ═══════════════════════════════════════════════════════════════
//  4. MONTAR PROPS REMOTION
// ═══════════════════════════════════════════════════════════════
function buildRemotionProps(scenes, fitbResults, clipDurations, hook) {
  return {
    hook,
    scenes: scenes.map((scene, i) => {
      const fitb = fitbResults[i];
      const correct = fitb.blankWord.toLowerCase();
      // Reject non-English words (only allow basic Latin a-z)
      const isEnglish = (w) => /^[a-zA-Z']+$/.test(w);

      // Filtra duplicatas e não-inglês
      const wrongs = [fitb.wrong1, fitb.wrong2, fitb.wrong3]
        .filter(w => w.toLowerCase() !== correct)
        .filter(w => isEnglish(w))
        .filter((w, i, arr) => arr.findIndex(x => x.toLowerCase() === w.toLowerCase()) === i);

      // Se sobrou menos de 3 distratores, completa com fallbacks
      const fallbacks = ["something", "nothing", "always", "never", "really", "maybe", "already", "almost", "together", "between"];
      while (wrongs.length < 3) {
        const fb = fallbacks.find(f => f.toLowerCase() !== correct && !wrongs.find(w => w.toLowerCase() === f));
        if (fb) wrongs.push(fb); else break;
      }

      // Garante que a blankWord também é inglês — se não for, skip
      if (!isEnglish(fitb.blankWord)) {
        console.log(`    ⚠️ blankWord "${fitb.blankWord}" não é inglês, usando fallback`);
        const words = scene.en.replace(/[.,!?]/g, '').split(/\s+/).filter(w => w.length > 3 && isEnglish(w));
        fitb.blankWord = words[Math.floor(Math.random() * words.length)] || words[0] || 'something';
      }

      const allOptions = [fitb.blankWord, wrongs[0], wrongs[1], wrongs[2]];

      // Shuffle
      const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(fitb.blankWord);

      return {
        videoUrl: scene.media_url,
        en: scene.en,
        blankWord: fitb.blankWord,
        options: shuffled,
        correctIndex,
        clipDurationFrames: clipDurations[i],
      };
    }),
  };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN — Gera batch de quiz reels
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n═══ FLUENCY QUIZ PIPELINE v1 ═══`);
  console.log(`Batch: ${BATCH_SIZE} reels × 3 cenas = ${BATCH_SIZE * 3} cenas\n`);

  // 1. Pool de cenas
  console.log('1. Carregando cenas do Supabase...');
  const pool = await getAllScenes();
  console.log(`   ${pool.length} cenas boas pra quiz\n`);

  if (pool.length < BATCH_SIZE * 3) {
    console.log('   ⚠️ Pool pequeno, pode repetir cenas entre reels');
  }

  // Batch dir
  const batchDir = join('scripts', 'quiz-batch-' + Date.now());
  mkdirSync(batchDir, { recursive: true });

  const usedIds = new Set();
  const results = [];

  for (let r = 0; r < BATCH_SIZE; r++) {
    console.log(`── Reel ${r + 1}/${BATCH_SIZE} ──`);

    // 2. Selecionar 3 cenas
    const scenes = pickScenes(pool, 3, usedIds);
    if (scenes.length < 3) {
      console.log('   Não tem cenas suficientes, parando');
      break;
    }
    scenes.forEach(s => usedIds.add(s.id));

    // 3. Download clipes + ffprobe
    const clipDir = join(batchDir, `reel-${r + 1}`);
    mkdirSync(clipDir, { recursive: true });

    const clipDurations = [];
    for (let i = 0; i < 3; i++) {
      const clipPath = join(clipDir, `scene_${i}.mp4`);
      process.stdout.write(`   Clip ${i + 1}: downloading...`);
      await downloadClip(scenes[i].media_url, clipPath);
      const frames = getClipDurationFrames(clipPath);
      clipDurations.push(frames);
      console.log(` ${(frames / FPS).toFixed(1)}s (${frames} frames)`);
    }

    // 4. GPT gera FITB pra cada cena
    console.log('   Gerando FITB...');
    const fitbResults = [];
    for (let i = 0; i < 3; i++) {
      const fitb = await generateFITB(scenes[i]);
      fitbResults.push(fitb);
      console.log(`   ${i + 1}. "${scenes[i].en}"`);
      console.log(`      blank: "${fitb.blankWord}" → [${fitb.wrong1}, ${fitb.wrong2}, ${fitb.wrong3}]`);
    }

    // 5. Hook do arsenal
    const hook = HOOKS[r % HOOKS.length];

    // 6. Montar props
    const props = buildRemotionProps(scenes, fitbResults, clipDurations, hook);

    // 7. Salvar
    const propsPath = join(clipDir, 'props.json');
    writeFileSync(propsPath, JSON.stringify(props, null, 2));

    // Metadata pra tracking
    const meta = {
      reel: r + 1,
      hook,
      scenes: scenes.map((s, i) => ({
        id: s.id,
        episode: s.episode_id,
        en: s.en,
        blankWord: fitbResults[i].blankWord,
        correctIndex: props.scenes[i].correctIndex,
        clipDurationFrames: clipDurations[i],
      })),
      generatedAt: new Date().toISOString(),
    };
    writeFileSync(join(clipDir, 'meta.json'), JSON.stringify(meta, null, 2));

    results.push({ reel: r + 1, dir: clipDir, hook, propsPath });
    console.log(`   ✅ Reel ${r + 1} pronto → ${clipDir}\n`);
  }

  // Summary
  console.log('═══ BATCH COMPLETO ═══');
  console.log(`${results.length} reels gerados em ${batchDir}/\n`);
  results.forEach(r => {
    console.log(`  Reel ${r.reel}: ${r.dir}`);
    console.log(`    Hook: "${r.hook}"`);
    console.log(`    Props: ${r.propsPath}`);
  });

  console.log(`\n── Próximo passo ──`);
  console.log(`Render: npx remotion render fluency-quiz out/quiz_1.mp4 --props=scripts/quiz-batch-xxx/reel-1/props.json`);
  console.log(`Ou Lambda: node scripts/render-quiz-batch.mjs ${batchDir}`);

  // Salvar batch index
  writeFileSync(join(batchDir, 'index.json'), JSON.stringify({
    batchSize: results.length,
    generatedAt: new Date().toISOString(),
    reels: results.map(r => ({ reel: r.reel, dir: r.dir, hook: r.hook })),
  }, null, 2));
}

main().catch(e => { console.error('Pipeline error:', e.message); process.exit(1); });
