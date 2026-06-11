#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// POST-NEXT — Posta próximo conteúdo com ROTAÇÃO + LEGENDA GPT
//
// Rotação: nunca repete formato consecutivo.
// Legenda: GPT gera baseada no conteúdo real (meta.json).
//
// Usage: node post-next.mjs reel     (IG + YouTube)
//        node post-next.mjs carousel (IG só)
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const POSTIZ_URL = 'https://postiz.fluencyroute.com.br/api/public/v1';
const POSTIZ_KEY = 'a916b0fe4f4614616bb15f11dd07c653a80bb8e5e94488e6dbc85f6b03352b39';
const IG_ID = 'cmnng6g5e0001ls6g9wnp2hws';
const YT_ID = 'cmnni7jv80001n26utkgssith';

const env = readFileSync('/docker/content-factory/.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();

const BASE = '/docker/content-factory/scripts';
const tipo = process.argv[2] || 'reel';
const LAST_FORMAT_FILE = join(BASE, '.last-format-' + tipo);

// ─── Formatos ───
const REEL_FORMATS = [
  { prefix: 'quiz-batch-', name: 'quiz' },
  { prefix: 'cantada-batch-', name: 'cantada' },
  { prefix: 'aula-batch-', name: 'aula' },
];

const CAROUSEL_FORMATS = [
  { prefix: 'carousel-', name: 'carousel' },
];

const HASHTAGS = '\n\n#friends #ingles #aprenderingles #seriesemingles #fluencyroute #inglesonline #inglesfacil';

// ─── Encontra próximo reel com rotação ───
function findNextReel(formats) {
  let lastFormat = '';
  try { lastFormat = readFileSync(LAST_FORMAT_FILE, 'utf8').trim(); } catch {}

  const sorted = [...formats].sort((a, b) => {
    if (a.name === lastFormat) return 1;
    if (b.name === lastFormat) return -1;
    return 0;
  });

  for (const fmt of sorted) {
    const batches = readdirSync(BASE).filter(d => d.startsWith(fmt.prefix)).sort();
    for (const batch of batches) {
      const batchPath = join(BASE, batch);
      let reels;
      try { reels = readdirSync(batchPath).filter(d => d.startsWith('reel-')).sort(); } catch { continue; }

      for (const reel of reels) {
        const reelPath = join(batchPath, reel);
        const finalPath = join(reelPath, 'final.mp4');
        const postedFlag = join(reelPath, '.posted');

        if (existsSync(finalPath) && !existsSync(postedFlag)) {
          return { reelPath, finalPath, batch, reel, format: fmt.name, type: 'reel' };
        }
      }
    }
  }
  return null;
}

// ─── Encontra próximo carrossel (slides.json + sem .posted) ───
function findNextCarousel() {
  const batches = readdirSync(BASE)
    .filter(d => d.startsWith('carousel-') && !d.endsWith('.mjs'))
    .filter(d => {
      const bp = join(BASE, d);
      try { return existsSync(join(bp, 'slides.json')) && !existsSync(join(bp, '.posted')); } catch { return false; }
    })
    .sort();

  if (!batches.length) return null;

  const batch = batches[0];
  const batchPath = join(BASE, batch);
  const slidesData = JSON.parse(readFileSync(join(batchPath, 'slides.json'), 'utf8'));
  const slidePaths = slidesData.slides || [];

  if (!slidePaths.length) return null;

  let meta = {};
  try { meta = JSON.parse(readFileSync(join(batchPath, 'props.json'), 'utf8')); } catch {}

  return {
    batchPath,
    batch,
    slidePaths,
    format: meta.format || slidesData.format || 'carousel',
    meta,
    type: 'carousel',
  };
}

// ─── GPT gera legenda personalizada ───
async function generateCaption(format, meta) {
  const prompts = {
    quiz: `Você é social media da Fluency Route (escola de inglês com séries).
Gere uma legenda curta e envolvente pro Instagram pra um REEL de quiz.
O reel mostra cenas de Friends onde a pessoa completa a frase.

Dados do reel:
- Hook: "${meta.hook || ''}"
- Cenas: ${JSON.stringify(meta.scenes?.map(s => s.en || s) || []).slice(0, 300)}

Regras:
- Em português BR, informal, tom jovem
- Máximo 3 linhas + hashtags
- Primeira linha = gancho forte (curiosidade/desafio)
- Inclua CTA (comenta, salva, manda pro amigo)
- NÃO use emojis demais (máx 3)
- NÃO repita o hook do vídeo

Responda APENAS a legenda, sem aspas nem explicação.`,

    cantada: `Você é social media da Fluency Route (escola de inglês com séries).
Gere uma legenda curta pro Instagram pra um REEL de cena cantada.
O reel mostra uma cena original de Friends e depois a versão cantada (música).

Dados:
- Frase: "${meta.scene?.en || ''}"
- Tradução: "${meta.scene?.pt || ''}"

Regras:
- Em português BR, informal
- Máximo 3 linhas + CTA
- Foque no conceito "música gruda na cabeça = aprende sem esforço"
- CTA: "Comenta 1 ou 2" ou "Qual versão gruda mais?"
- Máx 3 emojis

Responda APENAS a legenda.`,

    aula: `Você é social media da Fluency Route (escola de inglês com séries).
Gere uma legenda curta pro Instagram pra um REEL de aula musical.
O reel ensina expressões em inglês através de uma música original.

Dados:
- Tema: "${meta.topic || ''}"

Regras:
- Em português BR, informal
- Máximo 3 linhas + CTA
- Foque em "aprenda cantando"
- CTA: salva pra praticar
- Máx 3 emojis

Responda APENAS a legenda.`,

    carousel: `Você é social media da Fluency Route (escola de inglês com séries).
Gere uma legenda curta pro Instagram pra um CARROSSEL educativo de inglês.

Dados:
- Formato: ${meta.format || 'quiz'}
- Tema: ${meta.topic || meta.hookText || 'inglês'}

Regras:
- Em português BR, informal
- Máximo 3 linhas + CTA
- CTA: "Salva pra estudar depois" ou "Manda pra quem precisa ver"
- Máx 3 emojis

Responda APENAS a legenda.`,
  };

  const prompt = prompts[format] || prompts.quiz;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    }).then(r => r.json());

    const caption = res.choices?.[0]?.message?.content?.trim();
    if (caption && caption.length > 10) {
      console.log(`  GPT legenda: ${caption.slice(0, 80)}...`);
      return caption + HASHTAGS;
    }
  } catch (e) {
    console.log(`  ⚠️ GPT falhou: ${e.message}`);
  }

  // Fallback genérico
  const fallbacks = {
    quiz: 'Complete a frase de Friends! Assiste até o final 👀\nComenta quantas acertou 👇',
    cantada: 'E se essa cena fosse uma MÚSICA? 🎵\nQual versão gruda mais? Comenta 1 ou 2 👇',
    aula: 'Aprenda inglês cantando 🎵\nSalva pra praticar depois 📌',
    carousel: 'Salva esse post pra estudar depois 📌\nManda pra quem tá aprendendo inglês!',
  };
  return (fallbacks[format] || fallbacks.quiz) + HASHTAGS;
}

// ─── Upload ───
async function uploadFile(filePath) {
  const fileData = readFileSync(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([fileData]), filePath.split('/').pop());
  const res = await fetch(POSTIZ_URL + '/upload', {
    method: 'POST',
    headers: { 'Authorization': POSTIZ_KEY },
    body: formData,
  });
  return res.json();
}

// ─── Post ───
async function createPost(integrationId, content, mediaInfo) {
  const isYT = integrationId === YT_ID;
  const settings = isYT
    ? { post_type: 'post', title: content.split('\n')[0].slice(0, 99), type: 'public' }
    : { post_type: 'post' };

  const body = {
    type: 'now',
    shortLink: false,
    date: new Date().toISOString(),
    tags: [],
    posts: [{
      integration: { id: integrationId },
      content,
      value: [{ content: '', image: mediaInfo ? [mediaInfo] : [] }],
      settings,
    }],
  };

  const res = await fetch(POSTIZ_URL + '/posts', {
    method: 'POST',
    headers: { 'Authorization': POSTIZ_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ─── Upload múltiplas imagens (carousel) ───
async function uploadCarouselSlides(slidePaths) {
  const mediaItems = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const p = slidePaths[i];
    if (!existsSync(p)) { console.log(`  ⚠️ Slide não encontrado: ${p}`); continue; }
    process.stdout.write(`  Upload slide ${i + 1}/${slidePaths.length}...`);
    const media = await uploadFile(p);
    mediaItems.push({ id: media.id, path: media.path });
    console.log(` ✅`);
  }
  return mediaItems;
}

// ─── Create carousel post (multiple images) ───
async function createCarouselPost(integrationId, content, mediaItems) {
  const body = {
    type: 'now',
    shortLink: false,
    date: new Date().toISOString(),
    tags: [],
    posts: [{
      integration: { id: integrationId },
      content,
      value: [{ content: '', image: mediaItems }],
      settings: { post_type: 'post' },
    }],
  };

  const res = await fetch(POSTIZ_URL + '/posts', {
    method: 'POST',
    headers: { 'Authorization': POSTIZ_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ─── Main ───
async function main() {
  if (tipo === 'carousel') {
    // ═══ CAROUSEL FLOW ═══
    const found = findNextCarousel();
    if (!found) {
      console.log('❌ Nenhum carrossel pendente na fila');
      process.exit(1);
    }

    console.log(`📤 Postando carrossel: ${found.batch} (formato: ${found.format})`);
    console.log(`  ${found.slidePaths.length} slides\n`);

    // Upload all slides
    const mediaItems = await uploadCarouselSlides(found.slidePaths);
    if (mediaItems.length < 2) {
      console.log('❌ Precisa de pelo menos 2 slides pra carousel');
      process.exit(1);
    }

    // Legenda GPT
    console.log('  Gerando legenda...');
    const caption = await generateCaption('carousel', found.meta?.content || found.meta || {});

    // Post no IG como carousel
    console.log('  Postando carrossel no Instagram...');
    const igResult = await createCarouselPost(IG_ID, caption, mediaItems);
    console.log('  IG: ' + JSON.stringify(igResult));

    // Marcar como postado
    writeFileSync(join(found.batchPath, '.posted'), new Date().toISOString());
    writeFileSync(LAST_FORMAT_FILE, found.format);
    console.log(`\n✅ Carrossel postado: ${found.batch} (${found.format}, ${mediaItems.length} slides)`);

  } else {
    // ═══ REEL FLOW ═══
    const found = findNextReel(REEL_FORMATS);
    if (!found) {
      console.log('❌ Nenhum reel pendente na fila');
      process.exit(1);
    }

    console.log(`📤 Postando reel: ${found.batch}/${found.reel} (formato: ${found.format})`);

    // Ler meta.json
    let meta = {};
    try {
      meta = JSON.parse(readFileSync(join(found.reelPath, 'meta.json'), 'utf8'));
    } catch {
      console.log('  ⚠️ Sem meta.json, usando legenda genérica');
    }

    // Upload
    console.log('  Uploading...');
    const media = await uploadFile(found.finalPath);
    console.log('  Upload OK: ' + media.path);

    // Legenda GPT
    console.log('  Gerando legenda...');
    const caption = await generateCaption(found.format, meta);

    // Post no IG
    console.log('  Postando no Instagram...');
    const igResult = await createPost(IG_ID, caption, { id: media.id, path: media.path });
    console.log('  IG: ' + JSON.stringify(igResult));

    // Post no YouTube
    console.log('  Postando no YouTube...');
    const ytResult = await createPost(YT_ID, caption, { id: media.id, path: media.path });
    console.log('  YT: ' + JSON.stringify(ytResult));

    // Marcar como postado
    writeFileSync(join(found.reelPath, '.posted'), new Date().toISOString());
    writeFileSync(LAST_FORMAT_FILE, found.format);
    console.log(`✅ Postado: ${found.reel} (${found.format})`);
  }
}

main().catch(e => { console.error('Post error:', e.message); process.exit(1); });
