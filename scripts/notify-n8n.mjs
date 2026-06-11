#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// NOTIFY N8N — Upload finals + dispara workflow de aprovação
//
// Usage: node scripts/notify-n8n.mjs <batch-dir>
//
// Fluxo:
//   1. Lê finals.json do batch
//   2. Upload cada final.mp4 pro Supabase Storage (bucket: media)
//   3. Chama webhook n8n com as URLs públicas
//   4. n8n manda pro WhatsApp do Marcos pra aprovação
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

// ── Config ──
const env = readFileSync('.env.local', 'utf8');
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_SERVICE_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const N8N_WEBHOOK_URL = env.match(/N8N_QUIZ_WEBHOOK="?([^"\n]+)/)?.[1]?.trim()
  || "https://n8n.srv1198551.hstgr.cloud/webhook/quiz-ready";

async function uploadToSupabase(filePath, storagePath) {
  const fileData = readFileSync(filePath);
  const res = await fetch(
    `${SUPA_URL}/storage/v1/object/media/${storagePath}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPA_SERVICE_KEY}`,
        'Content-Type': 'video/mp4',
        'x-upsert': 'true',
      },
      body: fileData,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${res.status} ${err}`);
  }
  return `${SUPA_URL}/storage/v1/object/public/media/${storagePath}`;
}

async function main() {
  const batchDir = process.argv[2];
  if (!batchDir || !existsSync(join(batchDir, 'finals.json'))) {
    console.log('Usage: node scripts/notify-n8n.mjs <batch-dir>');
    process.exit(1);
  }

  const finals = JSON.parse(readFileSync(join(batchDir, 'finals.json'), 'utf8'));
  const index = JSON.parse(readFileSync(join(batchDir, 'index.json'), 'utf8'));

  if (!finals.ready?.length) {
    console.log('❌ Nenhum reel pronto no batch');
    process.exit(1);
  }

  console.log(`\n📤 UPLOAD + NOTIFY — ${finals.ready.length} reels\n`);

  const reels = [];
  const batchId = basename(batchDir);

  for (let i = 0; i < finals.ready.length; i++) {
    const localPath = finals.ready[i];
    const reelInfo = index.reels[i];
    const meta = JSON.parse(readFileSync(join(localPath, '..', 'meta.json'), 'utf8'));
    const storagePath = `quiz-reels/${batchId}/reel-${i + 1}.mp4`;

    console.log(`  Reel ${i + 1}: uploading to Supabase...`);
    const publicUrl = await uploadToSupabase(localPath, storagePath);
    console.log(`        → ${publicUrl}`);

    reels.push({
      reel: i + 1,
      hook: reelInfo.hook,
      url: publicUrl,
      scenes: meta.scenes.map(s => ({
        episode: s.episode,
        en: s.en,
        blankWord: s.blankWord,
      })),
    });
  }

  // Notify n8n
  console.log(`\n📡 Notificando n8n: ${N8N_WEBHOOK_URL}`);
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId,
        reelCount: reels.length,
        reels,
        generatedAt: finals.renderedAt,
      }),
    });
    if (res.ok) {
      console.log(`  ✅ n8n notificado — workflow de aprovação disparado`);
    } else {
      console.log(`  ⚠️ n8n respondeu ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.log(`  ⚠️ n8n offline ou webhook não configurado: ${e.message}`);
    console.log(`  Reels prontos pra aprovação manual:`);
    reels.forEach(r => console.log(`    ${r.reel}. ${r.hook} → ${r.url}`));
  }

  console.log(`\n✅ ${reels.length} reels prontos. URLs:`);
  reels.forEach(r => console.log(`  ${r.reel}. ${r.url}`));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
