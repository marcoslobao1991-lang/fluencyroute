import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=(.+)/)?.[1];
const SERPER_KEY = env.match(/SERPER_API_KEY=(.+)/)?.[1];
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1];

const keyword = 'como melhorar listening em inglês';

async function run() {
  console.log('=== MODELAGEM TEST ===');
  console.log('Keyword:', keyword);
  const start = Date.now();

  // 1. Translate
  console.log('\n1. Translating...');
  const tr = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4.1-nano', max_tokens: 50, messages: [{ role: 'user', content: `Translate to English for a Google search (just the translation): "${keyword}"` }] }),
  }).then(r => r.json());
  const kwEN = tr.choices?.[0]?.message?.content?.trim();
  console.log('   EN:', kwEN);

  // 2. Search #1 gringo
  console.log('\n2. Searching Google EN...');
  const searchRes = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: kwEN, num: 3, gl: 'us', hl: 'en' }),
  }).then(r => r.json());

  const results = (searchRes.organic || []).filter(r =>
    !r.link.includes('.pdf') && !r.link.includes('youtube.com') && !r.link.includes('reddit.com')
  );
  console.log('   Results:', results.length);
  results.forEach((r, i) => console.log(`   ${i + 1}. ${r.title}\n      ${r.link}`));

  // 3. Fetch #1
  const source = results[0];
  console.log(`\n3. Fetching #1: ${source.link}`);
  const pageRes = await fetch(source.link, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(10000),
  });
  const html = await pageRes.text();
  const content = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);
  console.log(`   Extracted: ${content.length} chars`);
  console.log(`   Preview: ${content.slice(0, 200)}...`);

  // 4. Generate modelagem
  console.log('\n4. Generating modelagem...');
  const gen = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4.1',
      max_tokens: 16000,
      messages: [
        { role: 'system', content: `Você é um redator SEO de elite. Vai receber um artigo em inglês que é o #1 do Google. Sua missão: MODELAR em PT-BR.

MODELAR = mesma estrutura de H2s, mesma profundidade, mesmo tamanho ou MAIOR. NÃO é tradução. É reescrita com tom brasileiro.

REGRAS:
1. CONTEÚDO PURO. NUNCA mencione produto, plataforma, app, preço. NADA.
2. ÚNICO CTA: última linha: "Quer aprender inglês com a gente? [Assista nossa aula grátis.](/vsl)"
3. ZERO CTAs no meio.
4. Tom conversacional, parágrafos curtos, H2s como perguntas reais.
5. Primeiros 150 chars: resposta direta.
6. 1-2 citações do autor (Marcos Lobão) em > blockquotes.
7. MÍNIMO 2500 PALAVRAS. OBRIGATÓRIO.
8. FAQ 4-5 perguntas no final.

JSON PURO:
{"title":"<60","slug":"url","meta_description":"155","keyword":"kw","cluster":"c","content":"markdown","faq":[{"q":"?","a":"resp"}],"related_posts":["slug"]}` },
        { role: 'user', content: `KEYWORD PT: "${keyword}"\nCLUSTER: listening\n\nARTIGO #1 DO GOOGLE (modele este):\nSource: ${source.link}\n\n${content}\n\n---\nMODELE em PT-BR. MÍNIMO 2500 PALAVRAS. JSON puro.` },
      ],
    }),
  }).then(r => r.json());

  if (gen.error) { console.log('ERROR:', gen.error.message); return; }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`   Tokens: ${gen.usage?.prompt_tokens} in, ${gen.usage?.completion_tokens} out (${elapsed}s)`);

  const text = gen.choices?.[0]?.message?.content || '';
  const article = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]);

  let fullContent = article.content || '';
  if (article.faq?.length > 0) {
    fullContent += '\n\n## Perguntas Frequentes\n\n';
    for (const f of article.faq) fullContent += `### ${f.q}\n\n${f.a}\n\n`;
  }

  const words = fullContent.split(/\s+/).length;
  console.log(`\n   Title: ${article.title}`);
  console.log(`   Words: ${words}`);
  console.log(`   FAQ: ${article.faq?.length}`);
  console.log(`   Source: ${source.link}`);

  // 5. Save
  const save = await fetch('https://petrtewismhpzidcmmwb.supabase.co/rest/v1/blog_posts', {
    method: 'POST',
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({
      slug: article.slug, title: article.title, meta_description: article.meta_description,
      content: fullContent, keyword: article.keyword || keyword, cluster: article.cluster || 'listening',
      related_posts: article.related_posts || [], status: 'published', published_at: new Date().toISOString(),
    }),
  });
  console.log(`\n   Save: ${save.status === 201 ? 'PUBLISHED!' : 'Error ' + save.status}`);
  console.log(`\n   URL: fluencyroute.com.br/blog/${article.slug}`);
}

run().catch(e => console.log('Error:', e.message));
