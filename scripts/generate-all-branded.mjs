import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=(.+)/)?.[1];
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1];
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";

const PROMPT = `Você é um redator SEO. Escreva um artigo sobre a marca/produto Fluency Route.

CONTEXTO: Fluency Route é uma escola de inglês online fundada por Marcos Lobão. O método é baseado em repetição musical — usar música pra hackear o cérebro e adquirir inglês naturalmente. Marcos nunca fez intercâmbio, aprendeu inglês do Brasil, trabalhou como vendedor pra empresa americana.

REGRAS:
1. Responda as dúvidas reais que alguém teria ao pesquisar essa keyword.
2. Tom honesto e direto — como o dono falando sobre seu produto sem ser forçado.
3. NUNCA mencione preço, valor, parcela, R$.
4. NUNCA liste features como "134 músicas", "6 módulos", "Lab IA" etc. Fale do MÉTODO, não das features.
5. Última linha: "Quer conhecer o método? [Assista nossa aula grátis.](/vsl)"
6. Parágrafos curtos, H2s como perguntas reais, FAQ no final.
7. MÍNIMO 2000 PALAVRAS.
8. 1-2 citações do Marcos em > blockquotes.
9. NUNCA: "neste artigo", "vamos explorar", "em conclusão".

JSON PURO:
{"title":"<60","slug":"url","meta_description":"155","keyword":"kw","cluster":"branded","content":"markdown","faq":[{"q":"?","a":"resp"}],"related_posts":["slug"]}`;

// Get all pending branded topics
async function run() {
  const topicsRes = await fetch(`${SUPA_URL}/rest/v1/blog_topics?cluster=eq.branded&status=eq.pending&order=created_at.asc`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const topics = await topicsRes.json();
  console.log(`=== GENERATING ${topics.length} BRANDED ARTICLES ===\n`);

  for (const topic of topics) {
    // Check if already exists
    const existCheck = await fetch(`${SUPA_URL}/rest/v1/blog_posts?keyword=eq.${encodeURIComponent(topic.keyword)}&select=id&limit=1`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    const existing = await existCheck.json();
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`SKIP: "${topic.keyword}" (already exists)`);
      continue;
    }

    console.log(`\nGenerating: "${topic.keyword}"...`);
    const start = Date.now();

    try {
      const gen = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          max_tokens: 12000,
          messages: [
            { role: 'system', content: PROMPT },
            { role: 'user', content: `Artigo para: "${topic.keyword}"\nMÍNIMO 2000 PALAVRAS. JSON puro.` },
          ],
        }),
      }).then(r => r.json());

      if (gen.error) { console.log(`  ERROR: ${gen.error.message}`); continue; }

      const text = gen.choices?.[0]?.message?.content || '';
      const article = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]);

      let content = article.content || '';
      if (article.faq?.length > 0) {
        content += '\n\n## Perguntas Frequentes\n\n';
        for (const f of article.faq) content += `### ${f.q}\n\n${f.a}\n\n`;
      }

      const words = content.split(/\s+/).length;
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      // Save
      const save = await fetch(`${SUPA_URL}/rest/v1/blog_posts`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({
          slug: article.slug, title: article.title, meta_description: article.meta_description,
          content, keyword: article.keyword || topic.keyword, cluster: 'branded',
          related_posts: article.related_posts || [], status: 'published', published_at: new Date().toISOString(),
        }),
      });

      if (save.status === 201) {
        console.log(`  ✅ "${article.title}" — ${words} words (${elapsed}s)`);
        console.log(`     /blog/${article.slug}`);
        // Mark topic
        await fetch(`${SUPA_URL}/rest/v1/blog_topics?id=eq.${topic.id}`, {
          method: 'PATCH',
          headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        });
      } else {
        console.log(`  SAVE ERROR: ${save.status} ${await save.text()}`);
      }

      // Small delay between articles
      await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }

  console.log('\n=== DONE ===');
}

run();
