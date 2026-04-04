// ═══════════════════════════════════════════════════════════════
// POST /api/blog/generate
// Gera artigo completo via Sonnet 4.6, salva no Supabase
// Chamado pelo n8n cron ou manualmente
// ═══════════════════════════════════════════════════════════════

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

const supa = async (path: string, opts: RequestInit = {}) => {
  const h: Record<string, string> = {
    apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
    "Content-Type": "application/json", Prefer: "return=representation",
  };
  return fetch(`${SUPA_URL}${path}`, { ...opts, headers: { ...h, ...(opts.headers as Record<string, string>) } });
};

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

export async function POST(request: Request) {
  // Auth: n8n sends API key or admin secret
  const authHeader = request.headers.get("authorization");
  const validKey = process.env.BLOG_API_KEY || process.env.ADMIN_SECRET;
  if (!validKey || authHeader !== `Bearer ${validKey}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { keyword, cluster, topic_id } = body;

    // If no keyword, fetch next pending topic
    if (!keyword) {
      const res = await supa(
        `/rest/v1/blog_topics?status=eq.pending&order=created_at.asc&limit=1`
      );
      const topics = await res.json();
      if (!Array.isArray(topics) || topics.length === 0) {
        return Response.json({ error: "No pending topics" }, { status: 404 });
      }
      keyword = topics[0].keyword;
      cluster = topics[0].cluster;
      topic_id = topics[0].id;
    }

    // Check if slug already exists (avoid duplicates)
    const slugCheck = await supa(
      `/rest/v1/blog_posts?keyword=eq.${encodeURIComponent(keyword)}&select=id&limit=1`
    );
    const existing = await slugCheck.json();
    if (Array.isArray(existing) && existing.length > 0) {
      // Mark topic as published if it exists
      if (topic_id) {
        await supa(`/rest/v1/blog_topics?id=eq.${topic_id}`, {
          method: "PATCH", body: JSON.stringify({ status: "published" }),
        });
      }
      return Response.json({ error: "Article already exists for this keyword", existing: existing[0].id }, { status: 409 });
    }

    // Generate article with Sonnet
    console.log(`[BLOG] Generating article for: "${keyword}" (${cluster})`);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 8000,
        system: BLOG_PROMPT,
        messages: [{
          role: "user",
          content: `Escreva um artigo completo para a keyword: "${keyword}"\nCluster: ${cluster}\n\nLembre-se: resposta direta nos primeiros 150 chars, H2s como perguntas reais, experiência do Marcos, dados científicos, FAQ no final. JSON puro na resposta.`,
        }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("[BLOG] Sonnet error:", err);
      return Response.json({ error: "Sonnet API error", details: err }, { status: 500 });
    }

    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData.content?.[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[BLOG] Failed to parse JSON from Sonnet response");
      return Response.json({ error: "Failed to parse article JSON", raw: rawText.slice(0, 500) }, { status: 500 });
    }

    const article = JSON.parse(jsonMatch[0]);

    // Append FAQ to content as markdown
    let fullContent = article.content || "";
    if (article.faq && article.faq.length > 0) {
      fullContent += "\n\n## Perguntas Frequentes\n\n";
      for (const faq of article.faq) {
        fullContent += `### ${faq.q}\n\n${faq.a}\n\n`;
      }
    }

    // Save to Supabase
    const postData = {
      slug: article.slug,
      title: article.title,
      meta_description: article.meta_description,
      content: fullContent,
      keyword: article.keyword || keyword,
      cluster: article.cluster || cluster,
      related_posts: article.related_posts || [],
      status: "published",
      published_at: new Date().toISOString(),
    };

    const saveRes = await supa("/rest/v1/blog_posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });

    if (!saveRes.ok) {
      const err = await saveRes.text();
      console.error("[BLOG] Failed to save:", err);
      return Response.json({ error: "Failed to save article", details: err }, { status: 500 });
    }

    const saved = await saveRes.json();
    console.log(`[BLOG] Published: "${article.title}" → /blog/${article.slug}`);

    // Mark topic as published
    if (topic_id) {
      await supa(`/rest/v1/blog_topics?id=eq.${topic_id}`, {
        method: "PATCH", body: JSON.stringify({ status: "published" }),
      });
    }

    // Build FAQ schema for the response
    const faqSchema = article.faq?.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((f: { q: string; a: string }) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    } : null;

    return Response.json({
      ok: true,
      slug: article.slug,
      title: article.title,
      url: `/blog/${article.slug}`,
      faqSchema,
      tokens: {
        input: anthropicData.usage?.input_tokens,
        output: anthropicData.usage?.output_tokens,
      },
    });

  } catch (err: any) {
    console.error("[BLOG] Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
