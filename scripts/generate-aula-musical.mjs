#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// AULA MUSICAL — Pipeline completa v3
//
// 1. GPT-1 gera tema + 8 frases EN/PT
// 2. GPT-2 revisa (expressão correta, PT correto, ritmo)
// 3. Suno gera música (Sertanejo Universitário)
// 4. Whisper transcreve → word-level timestamps
// 5. Auto-check: valida timestamps + corte do MP3
// 6. Salva props.json pronto pro Remotion
//
// Usage: node scripts/generate-aula-musical.mjs [tema]
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { generateMusic, downloadAudio, formatLyrics } from './lib/suno.mjs';
import { transcribeAudio, groupIntoLines } from './lib/whisper.mjs';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();
const FPS = 30;

async function gpt(system, user) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4.1-mini", max_tokens: 2000,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  }).then(r => r.json());
  const text = (res.choices?.[0]?.message?.content || "").trim();
  return JSON.parse(text.replace(/```json\s*/g, "").replace(/```/g, "").trim());
}

async function main() {
  const tema = process.argv[2] || null;
  console.log(`\n═══ AULA MUSICAL PIPELINE v3 ═══\n`);

  // ── STEP 1: GPT-1 gera conteúdo ──
  console.log("📝 Step 1: GPT-1 gerando tema + 8 frases...");
  const content = await gpt(
    `You create "Aula Musical" content for Brazilians learning English.
Concept: teach ONE English expression through a SHORT song (8 phrases).
Rules:
- Generate exactly 8 example sentences using the expression
- Each: EN (will be sung) + PT translation
- Each shows a DIFFERENT common real-life situation
- Cover variety: home, work, restaurant, phone, friends, strangers, etc
- Rhyme when possible to make it catchy, but USEFULNESS first
- Keep sentences SHORT (5-10 words each)
- Title = the expression itself
- Hook = catchy question in Portuguese (max 8 words)
- Brief explanation (1-2 sentences, Portuguese)
${tema ? `The topic MUST be: "${tema}"` : "Pick a common expression Brazilians struggle with"}
- Return JSON only`,
    `{"topic":"THE EXPRESSION","topicPt":"tradução curta","hook":"HOOK CAPS","explanation":"when/how to use","phrases":[{"en":"...","pt":"..."}]}`
  );
  console.log(`  ✅ Tema: ${content.topic}`);
  content.phrases.forEach((p, i) => console.log(`  ${i + 1}. ${p.en}`));

  // ── STEP 2: GPT-2 revisa ──
  console.log("\n🔍 Step 2: GPT-2 revisando...");
  const review = await gpt(
    `Você é revisor de conteúdo educacional de inglês para brasileiros.
Recebeu uma "Aula Musical" — 8 frases que serão cantadas pra ensinar uma expressão.
Verifique com RIGOR:
1. Todas as 8 frases usam a expressão CORRETAMENTE?
2. Traduções PT estão corretas e naturais?
3. As frases funcionam como letra de música (ritmo, tamanho similar)?
4. Nenhuma frase se repete ou é muito parecida?
5. A expressão é realmente útil pro brasileiro no dia a dia?
6. Hook é chamativo o suficiente?
7. Todas as frases são em inglês correto?

Se TUDO OK: {"approved": true, "content": <original>}
Se encontrou erro: {"approved": false, "issues": ["..."], "content": <corrigido>}
JSON only.`,
    JSON.stringify(content, null, 2)
  );

  let finalContent = content;
  if (review.approved) {
    console.log("  ✅ Aprovado sem alterações");
  } else {
    console.log(`  ⚠️ Issues: ${review.issues?.join(", ")}`);
    console.log("  📝 Usando versão corrigida");
    finalContent = review.content;
  }

  // ── STEP 3: Suno gera música ──
  console.log("\n🎵 Step 3: Suno gerando (Sertanejo Universitário)...");
  const lyrics = formatLyrics(finalContent.phrases.map(p => p.en));
  const music = await generateMusic(lyrics, finalContent.topic);

  // ── STEP 4: Download MP3 ──
  const batchDir = join("scripts", `aula-musical-${Date.now()}`);
  mkdirSync(batchDir, { recursive: true });
  const mp3Original = join(batchDir, "music-original.mp3");
  console.log("\n⬇️ Step 4: Baixando MP3...");
  await downloadAudio(music.audioUrl, mp3Original);

  // ── STEP 5: Whisper transcreve ──
  console.log("\n🎤 Step 5: Whisper transcrevendo...");
  const transcript = await transcribeAudio(mp3Original);
  const words = transcript.words || [];

  // ── STEP 6: Auto-check + corte ──
  console.log("\n🔎 Step 6: Auto-check + corte...");

  // Achar primeiro "keyword" (primeira palavra da expressão)
  const keyword = finalContent.topic.split(/\s+/)[0].toLowerCase();
  const firstKeyword = words.find(w => w.word.toLowerCase() === keyword);

  if (!firstKeyword) {
    console.log(`  ❌ Whisper não encontrou "${keyword}" na transcrição!`);
    console.log("  Palavras detectadas:", words.slice(0, 10).map(w => w.word).join(", "));
    process.exit(1);
  }

  console.log(`  Primeiro "${keyword}": ${firstKeyword.start.toFixed(2)}s`);

  // Corte: 3s antes do primeiro keyword (pra hook)
  // Porém Whisper pode estar ~1s adiantado, mas usamos RAW aqui
  // O hook do Remotion cobre os primeiros frames antes do vocal
  const cutFrom = Math.max(0, firstKeyword.start - 2); // 2s antes (hook = 2s)
  const mp3Cut = join(batchDir, "music.mp3");
  execSync(`ffmpeg -y -i "${mp3Original}" -ss ${cutFrom.toFixed(3)} -c copy "${mp3Cut}"`, { stdio: 'pipe' });
  console.log(`  Cortado a partir de: ${cutFrom.toFixed(2)}s`);

  // Whisper no cortado
  console.log("  Re-transcrevendo cortado...");
  const cutTranscript = await transcribeAudio(mp3Cut);
  const cutWords = cutTranscript.words || [];

  // Separar em 8 frases por keyword
  const phrases = [];
  let current = [];
  for (const w of cutWords) {
    if (w.word.toLowerCase() === keyword && current.length > 0) {
      phrases.push(current);
      current = [];
    }
    current.push(w);
  }
  if (current.length > 0) phrases.push(current);

  // Primeiro verso = primeiras 8 frases
  const firstVerse = phrases.slice(0, 8);

  // ── Auto-checks ──
  const checks = [];
  if (firstVerse.length < 8) checks.push(`Só ${firstVerse.length}/8 frases detectadas`);
  if (firstVerse[0] && firstVerse[0][0].start > 4) checks.push(`Primeiro vocal muito tarde: ${firstVerse[0][0].start.toFixed(1)}s`);

  // Check gaps > 5s entre frases
  for (let i = 0; i < firstVerse.length - 1; i++) {
    const endCurrent = firstVerse[i][firstVerse[i].length - 1].end;
    const startNext = firstVerse[i + 1][0].start;
    if (startNext - endCurrent > 5) {
      checks.push(`Gap de ${(startNext - endCurrent).toFixed(1)}s entre frase ${i + 1} e ${i + 2}`);
    }
  }

  if (checks.length > 0) {
    console.log(`  ⚠️ Checks: ${checks.join("; ")}`);
  } else {
    console.log("  ✅ Todos os checks OK");
  }

  // ── STEP 7: Montar props ──
  console.log("\n📦 Step 7: Montando props...");

  const hookDuration = Math.round(firstVerse[0]?.[0]?.start * FPS) || 60;

  const propsData = {
    topic: finalContent.topic.toUpperCase(),
    topicPt: finalContent.topicPt || finalContent.hook,
    explanation: finalContent.explanation,
    audioFile: "music.mp3",
    hookDuration,
    reviewed: true,
    reviewApproved: review.approved,
    reviewIssues: review.issues || [],
    autoChecks: checks,
    phrases: firstVerse.map((ws, i) => ({
      en: finalContent.phrases[i]?.en || ws.map(w => w.word).join(" "),
      pt: finalContent.phrases[i]?.pt || "",
      startFrame: Math.round(ws[0].start * FPS),
      endFrame: Math.round(ws[ws.length - 1].end * FPS),
      words: ws.map(w => ({
        word: w.word,
        startFrame: Math.round(w.start * FPS),
        endFrame: Math.round(w.end * FPS),
      })),
    })),
    generatedAt: new Date().toISOString(),
  };

  // Cortar MP3 no final do primeiro verso (não repetir)
  const lastPhraseEnd = firstVerse[firstVerse.length - 1]?.[firstVerse[firstVerse.length - 1].length - 1]?.end || 60;
  const finalEnd = lastPhraseEnd + 3; // 3s depois do último vocal
  const mp3Final = join(batchDir, "music-final.mp3");
  execSync(`ffmpeg -y -i "${mp3Cut}" -to ${finalEnd.toFixed(3)} -c copy "${mp3Final}"`, { stdio: 'pipe' });
  console.log(`  Cortado final: ${finalEnd.toFixed(1)}s (sem repetição)`);

  const propsPath = join(batchDir, "props.json");
  writeFileSync(propsPath, JSON.stringify(propsData, null, 2));

  console.log(`\n═══ AULA MUSICAL PRONTA ═══`);
  console.log(`  Tema: ${propsData.topic}`);
  console.log(`  Frases: ${propsData.phrases.length}/8`);
  console.log(`  Hook: ${(hookDuration / FPS).toFixed(1)}s`);
  console.log(`  Revisão: ${review.approved ? "✅ aprovada" : "⚠️ corrigida"}`);
  console.log(`  Checks: ${checks.length === 0 ? "✅ todos OK" : checks.join(", ")}`);
  console.log(`  Props: ${propsPath}`);
  console.log(`  Audio: ${mp3Final}`);
  console.log(`\n  Próximo: render no Remotion\n`);
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
