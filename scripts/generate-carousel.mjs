#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CAROUSEL GENERATION — All 16 formats
//
// GPT-1 gera conteúdo → GPT-2 revisa → props.json aprovado
//
// Usage: node scripts/generate-carousel.mjs [formato]
// Formatos: quiz, vocab, wrong-right, vs, myth-fact, who-said-it,
//           tier, iceberg, red-green-flag, opinion, pov, spot
// Default: sorteia aleatório
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1]?.trim();
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";

const FORMATS = [
  "quiz", "vocab", "wrong-right", "vs", "myth-fact",
  "tier", "iceberg", "opinion", "spot", "red-green-flag", "mechanism",
];

// ═══════════════════════════════════════════════════════════════
//  GPT HELPER
// ═══════════════════════════════════════════════════════════════
async function gpt(system, user, model = "gpt-4.1-mini") {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model, max_tokens: 2000,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  }).then(r => r.json());
  const text = (res.choices?.[0]?.message?.content || "").trim();
  const clean = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0] || clean.match(/\[[\s\S]*\]/)?.[0]);
}

// ═══════════════════════════════════════════════════════════════
//  SUPABASE — random scenes
// ═══════════════════════════════════════════════════════════════
async function getRandomScenes(count = 5) {
  // Supabase PostgREST doesn't support order=random() — fetch pool and shuffle
  const res = await fetch(
    `${SUPA_URL}/rest/v1/scenes?select=id,episode_id,en,pt&media_url=neq.&limit=500`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const all = await res.json();
  if (!Array.isArray(all)) { console.log("Supabase error:", JSON.stringify(all)); return []; }
  const good = all.filter(s => {
    const words = s.en.split(/\s+/).length;
    return words >= 5 && words <= 15 && s.pt && !s.en.includes("...");
  });
  // Shuffle and take
  for (let i = good.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [good[i], good[j]] = [good[j], good[i]];
  }
  return good.slice(0, count);
}

// ═══════════════════════════════════════════════════════════════
//  FORMAT GENERATORS (GPT-1)
// ═══════════════════════════════════════════════════════════════
const GENERATORS = {
  async quiz() {
    return gpt(
      `You generate Instagram carousel quizzes about English for Brazilians.
Rules:
- Generate 5 questions about common English expressions, phrasal verbs, idioms, or tricky grammar
- Each question asks what a phrase/expression MEANS or HOW to use it correctly
- Questions should be about expressions that have NON-OBVIOUS meanings (not literal translations)
- 4 options per question (full sentences in Portuguese): 1 correct + 3 plausible but wrong
- Explanation in Portuguese (2-3 sentences, casual tone)
- ALL options must be in Portuguese
- Correct answer must be UNAMBIGUOUS
- NO references to TV series or movies
- Return JSON only`,
      `{"hookText":"HOOK TEXT IN CAPS (max 8 words)","questions":[{"number":1,"question":"Quando alguém diz 'X', quer dizer:","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}`
    );
  },

  async vocab() {
    return gpt(
      `You create vocabulary carousels with useful English expressions for Brazilian learners.
Rules:
- Pick 7 expressions/phrasal verbs/idioms that Brazilians would find useful in real conversations
- Each expression: meaning in Portuguese + example sentence in English
- The exampleHighlight must be an exact substring of the example sentence
- Vary the types: phrasal verbs, idioms, collocations, slang
- NO references to TV series or movies
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","items":[{"expression":"...","meaning":"...","example":"...","exampleHighlight":"..."}]}`
    );
  },

  async "wrong-right"() {
    return gpt(
      `You create "Wrong vs Right" English content for Brazilians.
Rules:
- 8 common mistakes Brazilians make in English
- Each: wrong phrase + correct phrase + explanation in Portuguese + quick tip
- Focus on mistakes caused by literal Portuguese translation
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","items":[{"wrong":"...","right":"...","explanation":"...","tip":"..."}]}`
    );
  },

  async vs() {
    return gpt(
      `You create "This or That" English quizzes for Brazilians.
Rules:
- 5 pairs of English expressions — one natural, one awkward/textbook
- Context for each (when would you use it)
- Answer explaining which is more natural and why
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","items":[{"optionA":"...","optionB":"...","context":"...","answer":"..."}]}`
    );
  },

  async "myth-fact"() {
    return gpt(
      `You create "Myth vs Fact" content about English for Brazilians.
Rules:
- 4 statements about English language/learning
- Mix of myths and facts (not all the same)
- Explanation in Portuguese for each
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","items":[{"statement":"...","verdict":"MITO or VERDADE","explanation":"..."}]}`
    );
  },

  async tier() {
    return gpt(
      `You create "What's your English level?" tier content for Brazilians.
Rules:
- 5 tiers: BÁSICO, INTERMEDIÁRIO, AVANÇADO, FLUENTE, NATIVO
- 3 expressions per tier that match that level
- Translations in Portuguese
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","tiers":[{"label":"BÁSICO","expressions":["..."],"translations":["..."]}]}`
    );
  },

  async iceberg() {
    return gpt(
      `You create an "English Iceberg" — expressions from surface level to deep obscure.
Rules:
- 6-7 tiers from obvious to very obscure
- Labels: SUPERFÍCIE, INTERMEDIÁRIO, PROFUNDO, ABISMO, FUNDO DO OCEANO
- One expression per tier with Portuguese meaning
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","tiers":[{"label":"...","expression":"...","meaning":"..."}]}`
    );
  },

  async opinion() {
    return gpt(
      `You create "Unpopular Opinion" content about English learning for Brazilians.
Rules:
- 1 provocative but DEFENSIBLE opinion about learning English
- 5-6 arguments supporting it (each 1-2 sentences, Portuguese)
- Must be controversial enough to generate debate but not offensive
- Return JSON only`,
      `{"opinion":"THE OPINION IN CAPS (max 12 words)","arguments":["...","...","..."]}`
    );
  },

  async "red-green-flag"() {
    return gpt(
      `You create "Red Flag / Green Flag" content about English learning habits for Brazilians.
Rules:
- 4 red flags (bad habits) and 4 green flags (good habits) for learning English
- Each item: 1 short sentence in Portuguese (max 12 words)
- Must be relatable and specific (not generic advice)
- NO references to TV series or movies
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","redFlags":["..."],"greenFlags":["..."]}`
    );
  },

  async mechanism() {
    return gpt(
      `You create educational carousels about the SCIENCE of learning English through music for Brazilians.
The core concept: musical repetition bypasses cognitive fatigue. When you listen to a song 50x, your brain doesn't get tired (dopamine reward loop), but reading a textbook 50x is exhausting (cognitive fatigue). This is why people know English lyrics without studying them.

Rules:
- 1 provocative hook question about why music works for learning
- 7 progressive insight steps that build the argument (each 1-2 sentences, Portuguese)
- Each step has a highlight word/phrase to emphasize
- Step 7 should hint that a method using this exists
- Casual, mind-blowing tone — like discovering a secret
- Vary the angle each time (dopamine, repetition, memory, pronunciation, brain processing, etc)
- Return JSON only`,
      `{"hookText":"HOOK QUESTION IN CAPS (max 10 words)","steps":[{"text":"...","highlight":"..."}],"reveal":"A frase final que conecta ao método","brandLine":"Tagline curta"}`
    );
  },

  async spot() {
    return gpt(
      `You create "Spot the Mistake" content for Brazilians learning English.
Rules:
- Write a short paragraph (3-4 sentences) in English with EXACTLY 5 hidden grammar/vocabulary mistakes
- Mistakes should be common Brazilian errors (literal translations, false cognates, wrong tense)
- For each mistake: wrong text, correct text, explanation in Portuguese
- Return JSON only`,
      `{"hookText":"HOOK (max 8 words, caps)","paragraph":"...","errors":[{"wrong":"...","right":"...","explanation":"..."}]}`
    );
  },
};

// ═══════════════════════════════════════════════════════════════
//  GPT-2: REVIEWER
// ═══════════════════════════════════════════════════════════════
async function review(format, content) {
  console.log("  🔍 GPT-2 revisando...");
  const result = await gpt(
    `Você é um revisor de conteúdo educacional de inglês para brasileiros.
Recebeu um carrossel "${format}" gerado por IA. Verifique com RIGOR:

1. RESPOSTAS CORRETAS — a resposta marcada como correta está REALMENTE correta?
2. ALTERNATIVAS — as erradas são plausíveis mas claramente erradas? Não são ambíguas?
3. PORTUGUÊS — explicações estão claras, sem erros gramaticais, sem typos?
4. INGLÊS — todas as frases em inglês estão corretas gramaticalmente?
5. CONTEÚDO — é apropriado, não ofensivo, útil pra brasileiros adultos?
6. HOOK — é chamativo o suficiente pra parar o scroll? Max 8 palavras?
7. DUPLICATAS — nenhuma opção/item se repete?

Se TUDO está OK: retorne {"approved": true, "content": <o conteúdo original inalterado>}
Se encontrou QUALQUER erro: retorne {"approved": false, "issues": ["..."], "content": <conteúdo CORRIGIDO>}

Retorne SOMENTE JSON, sem markdown.`,
    JSON.stringify(content, null, 2)
  );
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  let format = process.argv[2];
  if (!format || !FORMATS.includes(format)) {
    format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
    console.log(`  Formato sorteado: ${format}`);
  }

  console.log(`\n═══ CAROUSEL PIPELINE: ${format.toUpperCase()} ═══\n`);

  // Step 1: Generate
  console.log("  📝 GPT-1 gerando conteúdo...");
  const generator = GENERATORS[format];
  if (!generator) {
    console.log(`❌ Formato "${format}" não tem generator`);
    process.exit(1);
  }
  let content = await generator();
  console.log(`  ✅ Conteúdo gerado`);

  // Step 2: Review
  const reviewResult = await review(format, content);
  if (reviewResult.approved) {
    console.log("  ✅ Revisor aprovou sem alterações");
  } else {
    console.log(`  ⚠️ Revisor encontrou issues: ${reviewResult.issues?.join(", ")}`);
    console.log("  📝 Usando versão corrigida");
    content = reviewResult.content;
  }

  // Step 3: Save
  const batchDir = join("scripts", `carousel-${format}-${Date.now()}`);
  mkdirSync(batchDir, { recursive: true });

  const propsPath = join(batchDir, "props.json");
  writeFileSync(propsPath, JSON.stringify({
    format,
    content,
    reviewed: true,
    reviewApproved: reviewResult.approved,
    reviewIssues: reviewResult.issues || [],
    generatedAt: new Date().toISOString(),
  }, null, 2));

  console.log(`\n  📦 Salvo em: ${propsPath}`);
  console.log(`\n═══ PRÓXIMO: node scripts/render-carousel.mjs ${batchDir} ═══\n`);
}

main().catch(e => { console.error("Pipeline error:", e.message); process.exit(1); });
