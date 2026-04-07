// ═══════════════════════════════════════════════════════════════
// Fluency Quiz — Reels Video Builder v3 (clean rewrite)
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const FONT = "C\\:/Windows/Fonts/arialbd.ttf";
const FONT_REG = "C\\:/Windows/Fonts/arial.ttf";

// ── Layout (1080×1920 vertical) ──
const VW = 1080, VH = 1920;
const vidW = 1000, vidH = 562;           // 16:9 box
const vidX = Math.round((VW - vidW) / 2); // 40
const vidY = 260;                         // top of video
const optY = vidY + vidH + 80;            // first option Y
const optGap = 70;                        // gap between options

async function getScenes(count = 3) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/scenes?select=id,episode_id,scene_order,en,pt,media_url&media_url=neq.&order=id.asc&limit=1000`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const all = await res.json();
  const good = all.filter(s => {
    const words = s.en.split(/\s+/).length;
    return words >= 4 && words <= 12 && s.media_url && s.pt && s.pt.length > 5 && s.pt.length < 70;
  });
  const picked = [];
  const used = new Set();
  while (picked.length < count) {
    const idx = Math.floor(Math.random() * good.length);
    if (!used.has(good[idx].id)) { picked.push(good[idx]); used.add(good[idx].id); }
  }
  return picked;
}

async function generateWrong(scene) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4.1-mini', max_tokens: 150,
      messages: [{ role: 'user', content: `Quiz de ingles. Frase: "${scene.en}" Correta: "${scene.pt}"
Crie 2 traducoes ERRADAS plausíveis. Curtas (<60 chars). Sem aspas no JSON.
{"wrong1":"...","wrong2":"..."}` }],
    }),
  }).then(r => r.json());
  const text = (res.choices?.[0]?.message?.content || '').replace(/```json\s*/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]); }
  catch { return { wrong1: "Ele falou outra coisa", wrong2: "Nao foi bem isso" }; }
}

async function downloadVideo(url, dest) {
  if (existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function esc(text) {
  return text
    .replace(/\\/g, '')
    .replace(/'/g, '')
    .replace(/"/g, '')
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%')
    .replace(/\[/g, '')
    .replace(/\]/g, '');
}

async function buildFullVideo(scenes, quizzes, dir) {
  for (let i = 0; i < scenes.length; i++) {
    await downloadVideo(scenes[i].media_url, join(dir, `scene_${i}.mp4`));
  }

  const segmentPaths = [];

  for (let i = 0; i < 3; i++) {
    const scene = scenes[i];
    const quiz = quizzes[i];
    const inputPath = join(dir, `scene_${i}.mp4`);
    const segPath = join(dir, `seg_${i}.mp4`);

    // Duração REAL do clipe — sem trim, sem cortar NADA
    const dur = parseFloat(execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
    ).toString().trim());

    // Timeline: vídeo toca inteiro → congela → countdown 3s → reveal 2s
    const quizStart = dur;
    const revealStart = dur + 3;
    const totalDur = dur + 5;

    const opts = quiz.options;
    const optA = esc(`A) ${opts[0].text}`);
    const optB = esc(`B) ${opts[1].text}`);
    const optC = esc(`C) ${opts[2].text}`);
    const correctIdx = opts.findIndex(o => o.correct);
    const wrongIdxs = [0, 1, 2].filter(x => x !== correctIdx);
    const enLine = esc(scene.en);
    const ptLine = esc(scene.pt);

    const f = [
      // ── Vídeo: escala + congela no final. SEM trim. ──
      `[0:v]scale=${vidW}:${vidH}:force_original_aspect_ratio=decrease,pad=${vidW}:${vidH}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,tpad=stop_mode=clone:stop_duration=5[vid]`,
      `color=c=#0a0a0a:s=${VW}x${VH}:d=${totalDur}[bg]`,
      `[bg][vid]overlay=${vidX}:${vidY}[base]`,

      // ── Badge "1/3" dentro do vídeo (top-left, sempre visível) ──
      `[base]drawbox=x=${vidX}:y=${vidY}:w=64:h=40:color=#000000@0.55:t=fill[b1]`,
      `[b1]drawtext=text='${i + 1}/3':fontcolor=white:fontsize=24:fontfile='${FONT}':x=${vidX + 14}:y=${vidY + 8}[b2]`,

      // ── FLUENCY QUIZ header (acima do vídeo) ──
      `[b2]drawtext=text='FLUENCY':fontcolor=white:fontsize=26:fontfile='${FONT}':x=(w/2)-100:y=${vidY - 48}[h1]`,
      `[h1]drawtext=text='QUIZ':fontcolor=#4ECDC4:fontsize=26:fontfile='${FONT}':x=(w/2)+30:y=${vidY - 48}[h2]`,

      // ── Legenda EN no rodapé do vídeo (durante a cena) ──
      `[h2]drawtext=text='${enLine}':fontcolor=white:fontsize=24:fontfile='${FONT}':x=(${vidX}+(${vidW}-text_w)/2):y=${vidY + vidH - 44}:enable='lt(t\\,${quizStart})':shadowcolor=#000000@0.8:shadowx=2:shadowy=2[s1]`,

      // ── Countdown 3, 2, 1 dentro do vídeo (centro) ──
      `[s1]drawtext=text='3':fontcolor=white:fontsize=100:fontfile='${FONT}':x=${vidX + Math.round(vidW / 2)}-text_w/2:y=${vidY + Math.round(vidH / 2)}-text_h/2:enable='between(t\\,${quizStart}\\,${quizStart + 1})':shadowcolor=#000000@0.6:shadowx=3:shadowy=3[c1]`,
      `[c1]drawtext=text='2':fontcolor=white:fontsize=100:fontfile='${FONT}':x=${vidX + Math.round(vidW / 2)}-text_w/2:y=${vidY + Math.round(vidH / 2)}-text_h/2:enable='between(t\\,${quizStart + 1}\\,${quizStart + 2})':shadowcolor=#000000@0.6:shadowx=3:shadowy=3[c2]`,
      `[c2]drawtext=text='1':fontcolor=white:fontsize=100:fontfile='${FONT}':x=${vidX + Math.round(vidW / 2)}-text_w/2:y=${vidY + Math.round(vidH / 2)}-text_h/2:enable='between(t\\,${quizStart + 2}\\,${quizStart + 3})':shadowcolor=#000000@0.6:shadowx=3:shadowy=3[c3]`,

      // ── Opções (aparecem quando vídeo congela, stagger 0.2s) ──
      `[c3]drawtext=text='${optA}':fontcolor=white:fontsize=28:fontfile='${FONT_REG}':x=80:y=${optY}:enable='gte(t\\,${quizStart})'[o1]`,
      `[o1]drawtext=text='${optB}':fontcolor=white:fontsize=28:fontfile='${FONT_REG}':x=80:y=${optY + optGap}:enable='gte(t\\,${quizStart + 0.2})'[o2]`,
      `[o2]drawtext=text='${optC}':fontcolor=white:fontsize=28:fontfile='${FONT_REG}':x=80:y=${optY + optGap * 2}:enable='gte(t\\,${quizStart + 0.4})'[o3]`,

      // ── Reveal: barra verde na certa ──
      `[o3]drawbox=x=60:y=${optY + optGap * correctIdx - 8}:w=960:h=50:color=#00C853@0.3:t=fill:enable='gte(t\\,${revealStart})'[r1]`,

      // ── Reveal: barras vermelhas nas erradas ──
      `[r1]drawbox=x=60:y=${optY + optGap * wrongIdxs[0] - 8}:w=960:h=50:color=#F44336@0.2:t=fill:enable='gte(t\\,${revealStart})'[r2]`,
      `[r2]drawbox=x=60:y=${optY + optGap * wrongIdxs[1] - 8}:w=960:h=50:color=#F44336@0.2:t=fill:enable='gte(t\\,${revealStart})'[r3]`,

      // ── Tradução correta (abaixo das opções, no reveal) ──
      `[r3]drawtext=text='${ptLine}':fontcolor=#4ECDC4:fontsize=22:fontfile='${FONT}':x=(w-text_w)/2:y=${optY + optGap * 3 + 20}:enable='gte(t\\,${revealStart})'[out]`,
    ].join(';');

    const cmd = `ffmpeg -y -i "${inputPath}" -filter_complex "${f}" -map "[out]" -map 0:a? -c:v libx264 -preset fast -crf 23 -c:a aac -t ${totalDur} -r 30 "${segPath}"`;

    console.log(`  Seg ${i + 1}: ${dur.toFixed(1)}s clip → ${totalDur.toFixed(1)}s total`);
    try {
      execSync(cmd, { stdio: 'pipe', timeout: 60000 });
      segmentPaths.push(segPath);
    } catch (e) {
      console.log(`  ERROR seg ${i + 1}: ${e.stderr?.toString()?.slice(-500) || e.message?.slice(0, 500)}`);
    }
  }

  if (segmentPaths.length < 3) {
    console.log('Not all segments built');
    return null;
  }

  // Concat
  const listPath = join(dir, 'concat.txt');
  writeFileSync(listPath, segmentPaths.map(p => `file '${p.split(/[/\\]/).pop()}'`).join('\n'));
  const outputPath = join('reels', 'output', `fluency_quiz_${Date.now()}.mp4`);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, { stdio: 'pipe', timeout: 120000 });

  return outputPath;
}

async function main() {
  const dir = join('reels', `quiz_${Date.now()}`);
  mkdirSync(dir, { recursive: true });

  console.log('=== FLUENCY QUIZ v3 ===\n');

  console.log('1. Selecting scenes...');
  const scenes = await getScenes(3);
  scenes.forEach((s, i) => console.log(`  ${i + 1}. "${s.en}"`));

  console.log('\n2. Generating alternatives...');
  const quizzes = [];
  for (const scene of scenes) {
    const wrong = await generateWrong(scene);
    const options = [
      { text: scene.pt, correct: true },
      { text: wrong.wrong1, correct: false },
      { text: wrong.wrong2, correct: false },
    ].sort(() => Math.random() - 0.5);
    quizzes.push({ options });
    console.log(`  ${['A','B','C'][options.findIndex(o => o.correct)]}) ${scene.pt.slice(0, 50)}`);
  }

  console.log('\n3. Building video...');
  const output = await buildFullVideo(scenes, quizzes, dir);

  if (output) {
    const size = (readFileSync(output).length / 1024 / 1024).toFixed(1);
    console.log(`\n✅ ${output} (${size}MB)`);
  }
}

main().catch(e => console.log('Error:', e.message));
