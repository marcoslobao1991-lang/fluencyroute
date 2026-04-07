#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// FLUENCY QUIZ — Pipeline Completo (1 comando)
//
// Usage: node scripts/quiz-pipeline.mjs [quantidade]
// Default: 5 reels
//
// Faz tudo:
//   1. Gera props (Supabase + GPT + ffprobe)
//   2. Renderiza no Lambda DIRETO (preview, sem chroma, sem FFmpeg)
//   3. Baixa final.mp4 do S3
//   4. Salva finals.json (pra n8n consumir)
//
// NUNCA usar chroma + FFmpeg — deu green tint, layout errado.
// Lambda faz TUDO: vídeo + overlay + áudio → final.mp4
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const count = process.argv[2] || '5';

console.log(`\n🎬 FLUENCY QUIZ PIPELINE — ${count} reels\n`);
console.log('━'.repeat(50));

// Step 1: Generate
console.log('\n📋 STEP 1: Gerando quiz data...\n');
execSync(`node scripts/generate-quiz-reels.mjs ${count}`, {
  stdio: 'inherit',
  timeout: 300000,
});

// Find the batch dir (most recent)
const batchDirs = readdirSync('scripts')
  .filter(d => d.startsWith('quiz-batch-'))
  .sort()
  .reverse();

if (batchDirs.length === 0) {
  console.log('❌ Nenhum batch encontrado');
  process.exit(1);
}

const batchDir = join('scripts', batchDirs[0]);
console.log(`\n📦 Batch: ${batchDir}`);
console.log('━'.repeat(50));

// Step 2: Render on Lambda (DIRETO — preview mode)
console.log('\n🎨 STEP 2: Renderizando no Lambda (preview)...\n');
execSync(`node scripts/render-quiz-batch.mjs ${batchDir}`, {
  stdio: 'inherit',
  timeout: 2400000, // 40 min (5 reels × ~7 min cada)
});

// Step 3: Upload + notify n8n
console.log('\n📤 STEP 3: Upload + notificar n8n...\n');
try {
  execSync(`node scripts/notify-n8n.mjs ${batchDir}`, {
    stdio: 'inherit',
    timeout: 300000,
  });
} catch (e) {
  console.log('⚠️ Upload/notify falhou, reels locais continuam disponíveis');
}

// Summary
const finals = JSON.parse(readFileSync(join(batchDir, 'finals.json'), 'utf8'));

console.log('\n' + '━'.repeat(50));
console.log(`🎉 PIPELINE COMPLETO — ${finals.ready.length}/${count} reels`);
console.log(`\nArquivos locais em: ${batchDir}/`);
finals.ready.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
console.log();
