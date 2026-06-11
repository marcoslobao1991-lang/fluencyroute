#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// NOTIFY CAROUSEL — Upload slides + notify n8n
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const env = readFileSync('.env.local', 'utf8');
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_SERVICE_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const N8N_WEBHOOK = env.match(/N8N_CAROUSEL_WEBHOOK="?([^"\n]+)/)?.[1]?.trim()
  || "https://n8n.srv1198551.hstgr.cloud/webhook/carousel-ready";

async function upload(filePath, storagePath) {
  const data = readFileSync(filePath);
  const res = await fetch(`${SUPA_URL}/storage/v1/object/media/${storagePath}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: data,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return `${SUPA_URL}/storage/v1/object/public/media/${storagePath}`;
}

async function main() {
  const dir = process.argv[2];
  if (!dir || !existsSync(join(dir, 'slides.json'))) {
    console.log('Usage: node scripts/notify-carousel.mjs <carousel-dir>');
    process.exit(1);
  }

  const slides = JSON.parse(readFileSync(join(dir, 'slides.json'), 'utf8'));
  const props = JSON.parse(readFileSync(join(dir, 'props.json'), 'utf8'));
  const batchId = basename(dir);

  console.log(`  📤 Uploading ${slides.slideCount} slides...\n`);

  const urls = [];
  for (let i = 0; i < slides.slides.length; i++) {
    const path = `carousel/${batchId}/slide-${String(i + 1).padStart(2, '0')}.jpeg`;
    const url = await upload(slides.slides[i], path);
    urls.push(url);
    console.log(`  ${i + 1}. ${url}`);
  }

  // Notify n8n
  console.log(`\n  📡 Notificando n8n...`);
  try {
    const res = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'carousel',
        format: props.format,
        batchId,
        slideCount: urls.length,
        slideUrls: urls,
        content: props.content,
        generatedAt: props.generatedAt,
      }),
    });
    console.log(res.ok ? `  ✅ n8n notificado` : `  ⚠️ n8n: ${res.status}`);
  } catch (e) {
    console.log(`  ⚠️ n8n offline: ${e.message}`);
  }

  console.log(`\n  ✅ ${urls.length} slides prontos`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
