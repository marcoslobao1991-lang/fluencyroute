#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CENA ORIGINAL vs CANTADA — Render via Lambda
//
// Input:  cantada-batch-xxx/ (gerado pelo generate-cantada-reels.mjs)
// Output: cantada-batch-xxx/reel-N/final.mp4 (pronto pra postar)
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve } from 'path';

const REMOTION_PROJECT = resolve('C:/Users/Asus/my-video');
const LAMBDA_FUNCTION = 'remotion-render-4-0-438-mem2048mb-disk2048mb-900sec';
const LAMBDA_SITE = 'reel-original-vs-cantada';
const LAMBDA_REGION = 'us-east-1';

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', timeout: opts.timeout || 600000, ...opts }).toString().trim();
  } catch (e) {
    const err = e.stderr?.toString()?.slice(-500) || e.message?.slice(0, 500);
    console.log(`  ❌ CMD ERROR: ${err}`);
    throw e;
  }
}

function renderOnLambda(propsPath, outputPath) {
  console.log('  Remotion Lambda render...');
  const propsAbs = resolve(propsPath);
  const cmd = `npx remotion lambda render ${LAMBDA_SITE} reel-original-vs-cantada --props="${propsAbs}" --function-name=${LAMBDA_FUNCTION} --region=${LAMBDA_REGION} --out-name=final.mp4 --frames-per-lambda=300 --max-retries=2`;
  const result = run(cmd, { cwd: REMOTION_PROJECT, timeout: 600000 });

  const cleanResult = result.replace(/\x1b\[[0-9;]*m/g, '');
  const httpsMatch = cleanResult.match(/(https:\/\/s3[.\w-]*\.amazonaws\.com\/[^\s]+\.mp4)/);
  const s3Match = cleanResult.match(/(s3:\/\/[^\s]+\.mp4)/);

  if (httpsMatch || s3Match) {
    let s3Path;
    if (s3Match) {
      s3Path = s3Match[1];
    } else {
      const url = new URL(httpsMatch[1]);
      const parts = url.pathname.split('/').filter(Boolean);
      const bucket = parts[0];
      const key = parts.slice(1).join('/');
      s3Path = `s3://${bucket}/${key}`;
    }
    console.log(`        S3: ${s3Path}`);
    run(`aws s3 cp "${s3Path}" "${outputPath}"`);
  } else {
    throw new Error('Could not find S3 URL in Lambda output: ' + cleanResult.slice(-300));
  }

  const sizeMB = (parseInt(run(`stat -c%s "${outputPath}"`)) / 1048576).toFixed(1);
  console.log(`        → ${outputPath} (${sizeMB}MB)`);
}

async function main() {
  const batchDir = process.argv[2];
  if (!batchDir || !existsSync(batchDir)) {
    console.log('Usage: node render-cantada-batch.mjs <batch-dir>');
    console.log('Example: node render-cantada-batch.mjs scripts/cantada-batch-1234567890');
    process.exit(1);
  }

  const index = JSON.parse(readFileSync(join(batchDir, 'index.json'), 'utf8'));
  console.log(`\n═══ RENDER CANTADA — LAMBDA ═══`);
  console.log(`Batch: ${index.batchSize} reels\n`);

  const finals = [];

  for (const reel of index.reels) {
    console.log(`\n── Reel ${reel.reel} ("${reel.scene?.slice(0, 40)}...") ──`);
    const reelDir = resolve(reel.dir);
    const propsPath = join(reelDir, 'props.json');
    const finalPath = join(reelDir, 'final.mp4');

    try {
      renderOnLambda(propsPath, finalPath);
      console.log(`  ✅ Reel ${reel.reel} DONE`);
      finals.push(finalPath);
    } catch (e) {
      console.log(`  ❌ Reel ${reel.reel} FAILED: ${e.message}`);
    }
  }

  console.log(`\n═══ RENDER COMPLETO ═══`);
  console.log(`${finals.length}/${index.batchSize} reels renderizados\n`);
  finals.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  writeFileSync(join(batchDir, 'finals.json'), JSON.stringify({
    ready: finals,
    renderedAt: new Date().toISOString(),
  }, null, 2));

  console.log(`\n→ finals.json salvo pra n8n consumir`);
}

main().catch(e => { console.error('Render error:', e.message); process.exit(1); });
