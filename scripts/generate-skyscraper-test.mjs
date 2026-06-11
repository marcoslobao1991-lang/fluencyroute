import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=(.+)/)?.[1];
const SERPER_KEY = env.match(/SERPER_API_KEY=(.+)/)?.[1];
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1];

const keyword = 'como melhorar listening em inglês';
const cluster = 'listening';

const VSL_KNOWLEDGE = `CONHECIMENTO BASE DO MARCOS E DA FLUENCY ROUTE:
HISTÓRIA: Marcos Lobão nunca fez intercâmbio, aprendeu inglês do Brasil. Trabalhou como vendedor para empresa americana. Filho de músico profissional.
CONFISSÃO: Taxa de abandono 90%+ em TODO curso. Estudo Chris Nelson (2014): 150 funcionários governo americano, só 1 terminou. Alunos que desistiam: menos de 15h de treino em meses. Os que deram certo: 100-150h nos primeiros meses.
FADIGA COGNITIVA: Após 20-23 min de estudo consciente, cérebro cansa. Cursos tradicionais falham por isso.
A CIÊNCIA: Robert Zatorre (McGill/Nature Neuroscience): música ativa dopamina + memória. Uni Edinburgh: grupo com música aprendeu DOBRO. Cérebro: consciente (tartaruga) vs subconsciente (30.000x mais rápido). Fluência precisa do subconsciente. Só repetição coloca info lá.
SÉRIE CANTADA: Cenas de Friends/HIMYM viram música. Ouve 30-40x porque gruda. Quando cena real toca, entende tudo sem legenda.
DADOS: 134 músicas originais, alunos em 30+ países, 1M+ horas reproduzidas.
PRODUTO: 6 módulos, Séries Cantadas, TED Talks Cantados, Lab Pronúncia IA, Scene Challenge, Library, Skill Scan. R$49/mês anual.
VOZ DO MARCOS:
- "Eu poderia ter parado ali. Mas quis entender por que essas pessoas desistiam."
- "A música hackeia o cérebro pra querer repetir. E repetição é tudo."
- "Listening é o big domino. Quando o ouvido destrava, todo o resto vem junto."
- "A gente não ensina inglês. A gente treina o seu cérebro pra adquirir inglês."`;

const PROMPT = `Você é um redator SEO de elite para o blog da Fluency Route.

${VSL_KNOWLEDGE}

REGRAS:
1. Tom conversacional, direto, sem enrolação
2. Parágrafos curtos (3-4 linhas)
3. H2s = perguntas reais do Google
4. Primeiros 150 chars: RESPOSTA DIRETA
5. 2-3 citações do Marcos em > blockquotes
6. Dados científicos reais (McGill, Zatorre, Edinburgh, Chris Nelson)
7. Português brasileiro natural
8. Keyword no título + primeiro parágrafo + 4-6x natural
9. 2-3 slugs de internal linking
10. CTA sutil a cada ~600 palavras
11. FAQ 4-5 perguntas no final
12. NUNCA: "neste artigo", "vamos explorar", "em conclusão"
13. MÍNIMO 2500 PALAVRAS — obrigatório
14. > blockquotes para citações
15. Cada H2: mínimo 300 palavras antes do próximo

JSON PURO (sem fences):
{"title":"<60","slug":"url","meta_description":"155","keyword":"kw","cluster":"c","content":"markdown","faq":[{"q":"?","a":"resp"}],"related_posts":["slug"]}`;

async function run() {
  console.log('=== SKYSCRAPER GENERATION ===');
  console.log('Keyword:', keyword);
  const start = Date.now();

  // 1. Translate
  const tr = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4.1-nano', max_tokens: 50, messages: [{ role: 'user', content: `Translate to English (just the translation): "${keyword}"` }] }),
  }).then(r => r.json());
  const kwEN = tr.choices?.[0]?.message?.content?.trim();
  console.log('EN:', kwEN);

  // 2. Search
  const [resPT, resEN] = await Promise.all([
    fetch('https://google.serper.dev/search', { method: 'POST', headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: keyword, num: 5, gl: 'br', hl: 'pt-br' }) }).then(r => r.json()),
    fetch('https://google.serper.dev/search', { method: 'POST', headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: kwEN, num: 5, gl: 'us', hl: 'en' }) }).then(r => r.json()),
  ]);
  console.log('Search:', resPT.organic?.length, 'PT +', resEN.organic?.length, 'EN');

  const ptCtx = (resPT.organic || []).map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`).join('\n');
  const enCtx = (resEN.organic || []).map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`).join('\n');

  const skyscraper = `\n\nANÁLISE DOS TOP RESULTADOS DO GOOGLE:\n\nPORTUGUÊS:\n${ptCtx}\n\nINGLÊS (gringo validado):\n${enCtx}\n\nINSTRUÇÃO: Cubra TUDO que os top cobrem + ângulo Fluency Route. Identifique GAPS. Faça MELHOR.`;

  // 3. Generate
  console.log('Generating...');
  const gen = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4.1',
      max_tokens: 12000,
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: `Artigo para: "${keyword}"\nCluster: ${cluster}${skyscraper}\n\nMÍNIMO 2500 PALAVRAS. JSON puro.` },
      ],
    }),
  }).then(r => r.json());

  if (gen.error) { console.log('ERROR:', gen.error.message); return; }

  const text = gen.choices?.[0]?.message?.content || '';
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Tokens: ${gen.usage?.prompt_tokens} in, ${gen.usage?.completion_tokens} out (${elapsed}s)`);

  const article = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]);
  let content = article.content || '';
  if (article.faq?.length > 0) {
    content += '\n\n## Perguntas Frequentes\n\n';
    for (const f of article.faq) content += `### ${f.q}\n\n${f.a}\n\n`;
  }

  const words = content.split(/\s+/).length;
  console.log(`\nTitle: ${article.title}`);
  console.log(`Words: ${words}`);
  console.log(`FAQ: ${article.faq?.length}`);
  console.log(`Related: ${article.related_posts?.join(', ')}`);

  // 4. Save
  const save = await fetch('https://petrtewismhpzidcmmwb.supabase.co/rest/v1/blog_posts', {
    method: 'POST',
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({
      slug: article.slug, title: article.title, meta_description: article.meta_description,
      content, keyword: article.keyword || keyword, cluster: article.cluster || cluster,
      related_posts: article.related_posts || [], status: 'published', published_at: new Date().toISOString(),
    }),
  });
  console.log(`\nSave: ${save.status === 201 ? 'PUBLISHED!' : 'Error ' + save.status}`);
  if (save.status !== 201) console.log(await save.text());
  console.log(`\nURL: fluencyroute.com.br/blog/${article.slug}`);
}

run().catch(e => console.log('Error:', e.message));
