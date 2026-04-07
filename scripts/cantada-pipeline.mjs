#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CENA ORIGINAL vs CANTADA — Pipeline Completo (1 comando)
//
// Usage: node scripts/cantada-pipeline.mjs [quantidade]
//
// 1. Gera props (Supabase → Suno → Whisper → props.json)
// 2. Renderiza via Lambda
// 3. Output: cantada-batch-xxx/reel-N/final.mp4
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const BATCH_SIZE = process.argv[2] || '5';

console.log(`\n═══ CANTADA PIPELINE — ${BATCH_SIZE} reels ═══\n`);

// 1. Gerar
console.log('STEP 1: Gerando props...\n');
execSync(`node scripts/generate-cantada-reels.mjs ${BATCH_SIZE}`, { stdio: 'inherit' });

// Encontra o batch mais recente
const batches = readdirSync('scripts')
  .filter(d => d.startsWith('cantada-batch-'))
  .sort()
  .reverse();
const batchDir = join('scripts', batches[0]);
console.log(`\nBatch: ${batchDir}\n`);

// 2. Renderizar
console.log('STEP 2: Renderizando via Lambda...\n');
execSync(`node scripts/render-cantada-batch.mjs ${batchDir}`, { stdio: 'inherit' });

console.log('\n═══ PIPELINE COMPLETO ═══');
console.log(`Reels prontos em: ${batchDir}/reel-N/final.mp4`);
