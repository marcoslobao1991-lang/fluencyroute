// ═══════════════════════════════════════════════════════════════
// POST /api/blog/generate
// Modelagem: busca #1 gringo, extrai conteúdo, modela em PT-BR
// ═══════════════════════════════════════════════════════════════

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

const supa = async (path: string, opts: RequestInit = {}) => {
  const h: Record<string, string> = {
    apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
    "Content-Type": "application/json", Prefer: "return=representation",
  };
  return fetch(`${SUPA_URL}${path}`, { ...opts, headers: { ...h, ...(opts.headers as Record<string, string>) } });
};

// ── Serper.dev search ──
async function searchSerper(query: string, lang: string = "en"): Promise<{ title: string; url: string; snippet: string }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        q: query, num: 3,
        gl: lang === "en" ? "us" : "br",
        hl: lang === "en" ? "en" : "pt-br",
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic || []).map((item: any) => ({
      title: item.title || "",
      url: item.link || "",
      snippet: item.snippet || "",
    }));
  } catch { return []; }
}

// ── Fetch page content as text ──
async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch { return ""; }
}

// ── Prompt ──
const BLOG_PROMPT = `Você é um redator SEO de elite. Vai receber um artigo em inglês que é o #1 do Google pra uma keyword. Sua missão: MODELAR esse artigo em português brasileiro.

MODELAR significa:
- Mesma estrutura de H2s e tópicos
- Mesma profundidade e completude
- Mesmo tamanho ou MAIOR
- Mas com TOM, EXEMPLOS e ÂNGULO diferentes — adaptado pro público brasileiro
- NÃO é tradução literal. É reescrita completa com a mesma espinha dorsal.

AUTOR: Marcos Lobão — aprendeu inglês sozinho no Brasil, sem intercâmbio. Músico de família.

REGRAS ABSOLUTAS:
1. CONTEÚDO PURO sobre a keyword. NÃO é propaganda.
2. NUNCA mencione: nome de produto, plataforma, app, número de músicas, módulos, features, preço. NADA.
3. ÚNICO CTA: na última linha do artigo, escreva exatamente: "Quer aprender inglês com a gente? [Assista nossa aula grátis.](/vsl)"
4. ZERO CTAs no meio do artigo.
5. Tom: conversa entre amigos. Direto, sem enrolação.
6. Parágrafos curtos (3-4 linhas).
7. H2s = perguntas reais que brasileiros pesquisam no Google.
8. Primeiros 150 chars: RESPOSTA DIRETA (GEO/AI Overviews).
9. 1-2 citações do Marcos em > blockquotes (experiência pessoal, não vendedor).
10. Português brasileiro natural. Sem "outrossim", "ademais", "neste sentido".
11. Keyword no título + primeiro parágrafo + 4-6x natural no texto.
12. FAQ 4-5 perguntas no final.
13. NUNCA: "neste artigo", "vamos explorar", "em conclusão", "sem mais delongas".
14. MÍNIMO 2500 PALAVRAS. Se o artigo original tem 3000, faça 3000+. OBRIGATÓRIO.
15. Cada H2: mínimo 300 palavras antes do próximo.

FORMATO — JSON PURO (sem markdown fences):
{
  "title": "Título SEO < 60 chars com keyword em PT",
  "slug": "url-amigavel-sem-acentos",
  "meta_description": "155 chars, gancho emocional + keyword",
  "keyword": "keyword em português",
  "cluster": "cluster",
  "content": "Artigo COMPLETO em markdown. Última linha: CTA pra aula grátis.",
  "faq": [{"q": "pergunta?", "a": "resposta 2-3 frases"}],
  "related_posts": ["slug-1", "slug-2", "slug-3"]
}`;

const BRANDED_PROMPT = `Você é um redator SEO. Escreva um artigo sobre a marca/produto Fluency Route.

CONTEXTO: Fluency Route é uma escola de inglês online fundada por Marcos Lobão. O método é baseado em repetição musical — usar música pra hackear o cérebro e adquirir inglês naturalmente. Marcos nunca fez intercâmbio, aprendeu inglês do Brasil, trabalhou como vendedor pra empresa americana.

REGRAS:
1. Responda as dúvidas reais que alguém teria ao pesquisar essa keyword.
2. Tom honesto e direto — como o dono falando sobre seu produto sem ser forçado.
3. NUNCA mencione preço ou valor.
4. Última linha: "Quer conhecer o método? [Assista nossa aula grátis.](/vsl)"
5. Parágrafos curtos, H2s como perguntas reais, FAQ no final.
6. MÍNIMO 2000 PALAVRAS.
7. 1-2 citações do Marcos em > blockquotes.

FORMATO — JSON PURO:
{
  "title": "< 60 chars", "slug": "url", "meta_description": "155 chars",
  "keyword": "kw", "cluster": "branded",
  "content": "markdown completo",
  "faq": [{"q": "?", "a": "resp"}],
  "related_posts": ["slug-1", "slug-2"]
}`;

export async function POST(request: Request) {
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

    // Check duplicates
    const slugCheck = await supa(
      `/rest/v1/blog_posts?keyword=eq.${encodeURIComponent(keyword)}&select=id&limit=1`
    );
    const existing = await slugCheck.json();
    if (Array.isArray(existing) && existing.length > 0) {
      if (topic_id) {
        await supa(`/rest/v1/blog_topics?id=eq.${topic_id}`, {
          method: "PATCH", body: JSON.stringify({ status: "published" }),
        });
      }
      return Response.json({ error: "Article already exists", existing: existing[0].id }, { status: 409 });
    }

    const isBranded = cluster === "branded";
    console.log(`[BLOG] ${isBranded ? "BRANDED" : "MODELAGEM"}: "${keyword}"`);

    let userMessage = "";
    let systemPrompt = "";
    let sourceUrl = "";

    if (isBranded) {
      // ── BRANDED: generate directly ──
      systemPrompt = BRANDED_PROMPT;
      userMessage = `Escreva artigo para: "${keyword}"\nCluster: branded\nMÍNIMO 2000 PALAVRAS. JSON puro.`;

    } else {
      // ── MODELAGEM: find #1 gringo, fetch content, model it ──

      // Translate keyword to EN
      const translateRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          max_tokens: 50,
          messages: [{ role: "user", content: `Translate to English for a Google search (just the translation): "${keyword}"` }],
        }),
      });
      const kwEN = (await translateRes.json()).choices?.[0]?.message?.content?.trim() || keyword;
      console.log(`[BLOG] EN keyword: "${kwEN}"`);

      // Search Google EN for #1
      const results = await searchSerper(kwEN, "en");

      if (results.length > 0) {
        // Try to fetch full content of #1
        let sourceContent = "";
        for (const r of results) {
          // Skip PDFs, YouTube, Reddit
          if (r.url.includes('.pdf') || r.url.includes('youtube.com') || r.url.includes('reddit.com')) continue;
          console.log(`[BLOG] Fetching #1: ${r.url}`);
          sourceUrl = r.url;
          sourceContent = await fetchPage(r.url);
          if (sourceContent.length > 500) break;
        }

        if (sourceContent.length > 500) {
          console.log(`[BLOG] Source content: ${sourceContent.length} chars from ${sourceUrl}`);
          systemPrompt = BLOG_PROMPT;
          userMessage = `KEYWORD EM PORTUGUÊS: "${keyword}"
CLUSTER: ${cluster}

ARTIGO #1 DO GOOGLE (em inglês) — MODELE ESTE:
Source: ${sourceUrl}

${sourceContent}

---
MODELE o artigo acima em português brasileiro. Mesma estrutura, mesma profundidade, tamanho igual ou maior. Tom do Marcos, adaptado pro BR. MÍNIMO 2500 PALAVRAS. JSON puro.`;
        } else {
          // Fallback: use snippets if can't fetch full page
          console.log(`[BLOG] Couldn't fetch full page, using snippets`);
          systemPrompt = BLOG_PROMPT;
          const snippets = results.map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`).join("\n");
          userMessage = `KEYWORD EM PORTUGUÊS: "${keyword}"
CLUSTER: ${cluster}

TOP RESULTADOS DO GOOGLE EM INGLÊS (modele o melhor):
${snippets}

Escreva o artigo em PT-BR modelando a estrutura dos top results. MÍNIMO 2500 PALAVRAS. JSON puro.`;
        }
      } else {
        // No results, generate from scratch
        systemPrompt = BLOG_PROMPT;
        userMessage = `KEYWORD EM PORTUGUÊS: "${keyword}"\nCLUSTER: ${cluster}\n\nSem referência disponível. Escreva o melhor artigo possível sobre esta keyword. MÍNIMO 2500 PALAVRAS. JSON puro.`;
      }
    }

    // ══ GENERATE ══
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4.1",
        max_tokens: 16000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error("[BLOG] GPT-4.1 error:", err);
      return Response.json({ error: "GPT-4.1 API error", details: err }, { status: 500 });
    }

    const openaiData = await openaiRes.json();
    const rawText = openaiData.choices?.[0]?.message?.content || "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[BLOG] Failed to parse JSON");
      return Response.json({ error: "Failed to parse", raw: rawText.slice(0, 500) }, { status: 500 });
    }

    const article = JSON.parse(jsonMatch[0]);

    // Append FAQ
    let fullContent = article.content || "";
    if (article.faq && article.faq.length > 0) {
      fullContent += "\n\n## Perguntas Frequentes\n\n";
      for (const faq of article.faq) {
        fullContent += `### ${faq.q}\n\n${faq.a}\n\n`;
      }
    }

    const wordCount = fullContent.split(/\s+/).length;
    console.log(`[BLOG] Generated: "${article.title}" — ${wordCount} words`);

    // Save
    const saveRes = await supa("/rest/v1/blog_posts", {
      method: "POST",
      body: JSON.stringify({
        slug: article.slug,
        title: article.title,
        meta_description: article.meta_description,
        content: fullContent,
        keyword: article.keyword || keyword,
        cluster: article.cluster || cluster,
        related_posts: article.related_posts || [],
        status: "published",
        published_at: new Date().toISOString(),
      }),
    });

    if (!saveRes.ok) {
      const err = await saveRes.text();
      console.error("[BLOG] Save failed:", err);
      return Response.json({ error: "Save failed", details: err }, { status: 500 });
    }

    console.log(`[BLOG] Published: /blog/${article.slug}`);

    // Mark topic
    if (topic_id) {
      await supa(`/rest/v1/blog_topics?id=eq.${topic_id}`, {
        method: "PATCH", body: JSON.stringify({ status: "published" }),
      });
    }

    return Response.json({
      ok: true,
      slug: article.slug,
      title: article.title,
      url: `/blog/${article.slug}`,
      wordCount,
      source: sourceUrl || "branded/direct",
      tokens: { input: openaiData.usage?.prompt_tokens, output: openaiData.usage?.completion_tokens },
    });

  } catch (err: any) {
    console.error("[BLOG] Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
