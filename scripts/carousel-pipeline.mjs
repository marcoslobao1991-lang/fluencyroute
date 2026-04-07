#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CAROUSEL PIPELINE — 1 comando faz tudo
//
// Usage: node scripts/carousel-pipeline.mjs [formato]
// Default: sorteia formato aleatório
//
// Fluxo:
//   1. GPT-1 gera conteúdo
//   2. GPT-2 revisa e corrige
//   3. Remotion renderiza slides (JPEG local, sem Lambda)
//   4. Upload Supabase Storage
//   5. Notifica n8n → posta via Instagram Graph API
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const format = process.argv[2] || '';
const formatArg = format ? ` ${format}` : '';

console.log(`\n🎨 CAROUSEL PIPELINE${format ? ` — ${format.toUpperCase()}` : ' — RANDOM'}\n`);
console.log('━'.repeat(50));

// Step 1+2: Generate + Review
console.log('\n📝 STEP 1: Gerando + revisando conteúdo...\n');
execSync(`node scripts/generate-carousel.mjs${formatArg}`, {
  stdio: 'inherit',
  timeout: 120000,
});

// Find latest carousel dir
const carouselDirs = readdirSync('scripts')
  .filter(d => d.startsWith('carousel-'))
  .sort()
  .reverse();

if (carouselDirs.length === 0) {
  console.log('❌ Nenhum carousel dir encontrado');
  process.exit(1);
}

const carouselDir = join('scripts', carouselDirs[0]);
console.log(`\n📦 Dir: ${carouselDir}`);
console.log('━'.repeat(50));

// Step 3: Render
console.log('\n🖼️ STEP 2: Renderizando slides...\n');
execSync(`node scripts/render-carousel.mjs ${carouselDir}`, {
  stdio: 'inherit',
  timeout: 300000,
});

// Step 4: Upload + notify (reuse notify-n8n with carousel support)
console.log('\n📤 STEP 3: Upload + notificar...\n');
try {
  execSync(`node scripts/notify-carousel.mjs ${carouselDir}`, {
    stdio: 'inherit',
    timeout: 120000,
  });
} catch {
  console.log('⚠️ Upload/notify falhou — slides locais disponíveis');
}

// Summary
const slidesJson = JSON.parse(readFileSync(join(carouselDir, 'slides.json'), 'utf8'));
const propsJson = JSON.parse(readFileSync(join(carouselDir, 'props.json'), 'utf8'));

console.log('\n' + '━'.repeat(50));
console.log(`🎉 PIPELINE COMPLETO — ${slidesJson.slideCount} slides`);
console.log(`   Formato: ${propsJson.format}`);
console.log(`   Revisão: ${propsJson.reviewApproved ? '✅ aprovado' : '⚠️ corrigido'}`);
if (propsJson.reviewIssues?.length) {
  console.log(`   Issues corrigidas: ${propsJson.reviewIssues.join(', ')}`);
}
console.log(`   Slides em: ${carouselDir}/`);
console.log();
