// ═══════════════════════════════════════════════════════════════
// Quiz Reels Generator — Friends scenes
// Selects 3 scenes, generates wrong answers, outputs JSON ready for video
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";

if (!OPENAI_KEY) { console.log('ERROR: OPENAI_API_KEY not found in .env.local'); process.exit(1); }

async function getGoodScenes(count = 3) {
  // Get scenes with short-medium EN text (good for quiz)
  // Avoid very short (< 4 words) or very long (> 15 words)
  const res = await fetch(
    `${SUPA_URL}/rest/v1/scenes?select=id,episode_id,scene_order,en,pt,media_url&media_url=neq.&order=id.asc&limit=1000`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const all = await res.json();

  // Filter good quiz candidates
  const good = all.filter(s => {
    const words = s.en.split(/\s+/).length;
    return words >= 4 && words <= 15 && s.media_url && s.pt && s.pt.length > 5;
  });

  console.log(`Total scenes: ${all.length}, good for quiz: ${good.length}`);

  // Pick 3 random
  const picked = [];
  const used = new Set();
  while (picked.length < count && good.length > 0) {
    const idx = Math.floor(Math.random() * good.length);
    if (!used.has(good[idx].id)) {
      picked.push(good[idx]);
      used.add(good[idx].id);
    }
  }
  return picked;
}

async function generateWrongAnswers(scene) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Contexto: quiz de inglês com cena de Friends.
Frase dita na cena: "${scene.en}"
Tradução correta: "${scene.pt}"

Crie 2 traduções ERRADAS mas que pareçam plausíveis pra quem não entendeu bem o áudio. Use técnicas como:
- Trocar uma palavra por um falso cognato
- Mudar o sentido levemente (afirmação vira negação, pergunta vira afirmação)
- Confundir uma palavra com outra parecida em inglês

As alternativas erradas devem ter o MESMO TAMANHO e ESTILO da tradução correta. NÃO use frases genéricas como "não faz sentido" ou "não sei".

JSON puro: {"wrong1": "tradução errada plausível 1", "wrong2": "tradução errada plausível 2"}`
      }],
    }),
  }).then(r => r.json());

  const text = res.choices?.[0]?.message?.content || '';
  try {
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0]);
    if (parsed.wrong1 && parsed.wrong2) return parsed;
    throw new Error('missing fields');
  } catch (e) {
    console.log('  ⚠️ Parse error, retrying...', e.message);
    // Retry once
    const retry = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', max_tokens: 150,
        messages: [{ role: 'user', content: `Frase EN: "${scene.en}"\nTradução certa: "${scene.pt}"\n\nCrie 2 traduções erradas plausíveis. Responda SÓ: {"wrong1":"...","wrong2":"..."}` }],
      }),
    }).then(r => r.json());
    const t2 = (retry.choices?.[0]?.message?.content || '').replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    try { return JSON.parse(t2.match(/\{[\s\S]*\}/)?.[0]); } catch { return { wrong1: "Não entendi essa parte", wrong2: "Acho que ele disse outra coisa" }; }
  }
}

async function run() {
  console.log('=== QUIZ REELS GENERATOR ===\n');

  // 1. Pick scenes
  console.log('1. Selecting scenes...');
  const scenes = await getGoodScenes(3);

  if (scenes.length < 3) {
    console.log('Not enough good scenes!');
    return;
  }

  // 2. Generate wrong answers for each
  console.log('2. Generating quiz alternatives...\n');
  const quizzes = [];

  for (const scene of scenes) {
    const wrong = await generateWrongAnswers(scene);

    // Randomize order (A, B, C)
    const options = [
      { text: scene.pt, correct: true },
      { text: wrong.wrong1, correct: false },
      { text: wrong.wrong2, correct: false },
    ].sort(() => Math.random() - 0.5);

    const correctLetter = options.findIndex(o => o.correct);
    const letters = ['A', 'B', 'C'];

    const quiz = {
      scene_id: scene.id,
      episode: scene.episode_id,
      scene_order: scene.scene_order,
      en: scene.en,
      pt: scene.pt,
      media_url: scene.media_url,
      options: options.map((o, i) => ({
        letter: letters[i],
        text: o.text,
        correct: o.correct,
      })),
      correct_letter: letters[correctLetter],
    };

    quizzes.push(quiz);
    console.log(`Scene ${scene.scene_order} (${scene.episode_id}):`);
    console.log(`  EN: "${scene.en}"`);
    console.log(`  Options:`);
    quiz.options.forEach(o => {
      console.log(`    ${o.letter}) ${o.text} ${o.correct ? '✅' : ''}`);
    });
    console.log();
  }

  // 3. Output
  const output = {
    generated_at: new Date().toISOString(),
    hook: "Você entende essa cena de Friends?",
    cta: "Segue pra mais quizzes! 🍿",
    scenes: quizzes,
  };

  const filename = `quiz-reels-${Date.now()}.json`;
  writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`\n✅ Quiz saved to: ${filename}`);
  console.log('\nReady for video assembly!');

  // Print video assembly plan
  console.log('\n=== VIDEO PLAN ===');
  console.log('[0-1s]  Hook audio: "Você entende essa cena de Friends?"');
  quizzes.forEach((q, i) => {
    const base = 1 + (i * 12);
    console.log(`[${base}-${base+5}s]  SCENE ${i+1}: Play ${q.media_url.split('/').pop()}`);
    console.log(`[${base+5}-${base+9}s]  QUIZ: A) ${q.options[0].text.slice(0,40)}...`);
    console.log(`              B) ${q.options[1].text.slice(0,40)}...`);
    console.log(`              C) ${q.options[2].text.slice(0,40)}...`);
    console.log(`[${base+9}-${base+12}s] REVEAL: ${q.correct_letter} ✅ "${q.en}" = "${q.pt}"`);
  });
  console.log(`[37-39s] CTA: "Segue pra mais!"`)
}

run().catch(e => console.log('Error:', e.message));
