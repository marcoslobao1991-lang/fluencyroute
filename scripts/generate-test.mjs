// Generate 3 test articles locally
// Usage: node scripts/generate-test.mjs

import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=(.+)/)?.[1];
const SUPA_KEY = env.match(/SUPABASE_SERVICE_KEY="?([^"\n]+)/)?.[1];
const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";

const BLOG_PROMPT = `Você é um redator SEO especialista em ensino de inglês. Você escreve para o blog da Fluency Route, uma plataforma que ensina inglês através de músicas usando repetição musical científica.

AUTOR: Marcos Lobão — fundador da Fluency Route, músico, professor de inglês, pai. Estudou aquisição de linguagem por anos e criou um método baseado em pesquisas de McGill, MIT e Nature Neuroscience. Já ajudou centenas de alunos.

PRODUTO: Plataforma com 134 músicas originais em inglês, séries cantadas (Friends, HIMYM), TED Talks cantados, Lab de pronúncia com IA, Scene Challenge (game), Library de livros, Skill Scan (avaliação). R$99/mês plano anual.

REGRAS DE ESCRITA:
1. Tom: conversa entre amigos que manjam de inglês. Direto, sem enrolação, sem "neste artigo vamos abordar..."
2. Parágrafos curtos (3-4 linhas máximo). Quebre em blocos visuais
3. H2s devem ser PERGUNTAS REAIS que as pessoas fazem no Google
4. Primeiros 150 caracteres: RESPOSTA DIRETA à pergunta principal (GEO — AI Overviews pegam isso)
5. Inclua pelo menos uma citação/experiência pessoal do Marcos entre aspas
6. Use dados quando possível ("estudos mostram que...", "segundo pesquisa de McGill...")
7. Linguagem natural em português brasileiro. Sem "outrossim", "ademais", "neste sentido"
8. Keyword principal deve aparecer no título, H1, primeiro parágrafo, e 3-5 vezes naturalmente no texto
9. Internal linking: sugira 2-3 slugs de artigos relacionados que poderiam existir
10. CTA sutil a cada ~500 palavras: variações de "Quer testar isso na prática? Conheça o método Fluency Route"
11. Termine com seção FAQ (3-5 perguntas frequentes com respostas curtas)
12. NUNCA use: "neste artigo", "vamos explorar", "é importante ressaltar", "em conclusão"
13. Mínimo 2000 palavras, máximo 3000

FORMATO DE RESPOSTA — JSON PURO (sem markdown fences):
{
  "title": "Título SEO < 60 chars com keyword",
  "slug": "url-amigavel-sem-acentos",
  "meta_description": "155 chars max, com gancho emocional e keyword",
  "keyword": "keyword principal",
  "cluster": "cluster do tópico",
  "content": "Artigo COMPLETO em markdown (## H2, ### H3, **bold**, - listas, > citações)",
  "faq": [
    {"q": "pergunta?", "a": "resposta curta"},
    {"q": "pergunta?", "a": "resposta curta"},
    {"q": "pergunta?", "a": "resposta curta"}
  ],
  "related_posts": ["slug-relacionado-1", "slug-relacionado-2", "slug-relacionado-3"]
}`;

const keywords = [
  { keyword: "fluency route funciona", cluster: "branded" },
  { keyword: "aprender inglês com música funciona", cluster: "método" },
  { keyword: "como melhorar listening em inglês", cluster: "listening" },
];

async function generate(kw, cluster) {
  console.log(`\n🔄 Generating: "${kw}"...`);
  const start = Date.now();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4.1",
      max_tokens: 8000,
      messages: [
        { role: "system", content: BLOG_PROMPT },
        { role: "user", content: `Escreva um artigo completo para a keyword: "${kw}"\nCluster: ${cluster}\n\nLembre-se: resposta direta nos primeiros 150 chars, H2s como perguntas reais, experiência do Marcos, dados científicos, FAQ no final. JSON puro na resposta.` },
      ],
    }),
  });

  const data = await res.json();
  if (data.error) { console.log("❌ Error:", data.error.message); return; }

  const text = data.choices?.[0]?.message?.content || "";
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`   Tokens: ${data.usage?.prompt_tokens} in, ${data.usage?.completion_tokens} out (${elapsed}s)`);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) { console.log("❌ Failed to parse JSON"); return; }

  const article = JSON.parse(jsonMatch[0]);

  // Append FAQ to content
  let fullContent = article.content || "";
  if (article.faq?.length > 0) {
    fullContent += "\n\n## Perguntas Frequentes\n\n";
    for (const f of article.faq) {
      fullContent += `### ${f.q}\n\n${f.a}\n\n`;
    }
  }

  // Save to Supabase
  const postData = {
    slug: article.slug,
    title: article.title,
    meta_description: article.meta_description,
    content: fullContent,
    keyword: article.keyword || kw,
    cluster: article.cluster || cluster,
    related_posts: article.related_posts || [],
    status: "published",
    published_at: new Date().toISOString(),
  };

  const saveRes = await fetch(`${SUPA_URL}/rest/v1/blog_posts`, {
    method: "POST",
    headers: {
      apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json", Prefer: "return=representation",
    },
    body: JSON.stringify(postData),
  });

  if (!saveRes.ok) { console.log("❌ Save failed:", await saveRes.text()); return; }

  const words = fullContent.split(/\s+/).length;
  console.log(`   ✅ "${article.title}"`);
  console.log(`   📝 ${words} palavras · /blog/${article.slug}`);
  console.log(`   🔗 Related: ${article.related_posts?.join(", ")}`);
}

async function main() {
  console.log("=== Generating 3 test articles ===\n");
  for (const { keyword, cluster } of keywords) {
    await generate(keyword, cluster);
  }
  console.log("\n=== Done! Check fluencyroute.com.br/blog ===");
}

main();
