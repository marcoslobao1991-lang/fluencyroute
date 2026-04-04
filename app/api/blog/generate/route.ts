// ═══════════════════════════════════════════════════════════════
// POST /api/blog/generate
// Skyscraper SEO: busca top results PT+EN, analisa, gera artigo melhor
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

// ── Serper.dev Google Search (2500 free/month) ──
async function searchSerper(query: string, lang: string = "pt"): Promise<{ title: string; snippet: string }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.log(`[BLOG] Serper not configured, skipping skyscraper`);
    return [];
  }
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        q: query, num: 5,
        gl: lang === "en" ? "us" : "br",
        hl: lang === "en" ? "en" : "pt-br",
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic || []).map((item: any) => ({
      title: item.title || "",
      snippet: item.snippet || "",
    }));
  } catch { return []; }
}

// ── VSL knowledge base (core arguments, data, voice) ──
const VSL_KNOWLEDGE = `
CONHECIMENTO BASE DO MARCOS E DA FLUENCY ROUTE (use isso naturalmente nos artigos):

HISTÓRIA: Marcos Lobão nunca fez intercâmbio, aprendeu inglês do Brasil. Trabalhou como vendedor para empresa americana, convencendo americano a comprar. Filho de músico profissional, cresceu dentro da música.

CONFISSÃO: Apesar de milhares de alunos que aprenderam, havia um grupo grande que desistia. Marcos mediu: esses alunos não passavam de 15h de treino em meses. Os que deram certo tinham 100-150h nos primeiros meses. Não eram mais inteligentes — só persistiram mais.

DESCOBERTA CHAVE: Taxa de abandono é 90%+ em TODO curso de idiomas. Estudo de Chris Nelson (2014): 150 funcionários do governo americano com tudo a favor — só 1 chegou ao final. O problema não é conteúdo, é FORMATO.

A CIÊNCIA: O cérebro tem 2 camadas de aprendizado. Consciente (superficial, lento como tartaruga) e Subconsciente (30.000x mais rápido). Fluência precisa do subconsciente. Só repetição coloca informação lá.

FADIGA COGNITIVA: Estudos de McGill mostram que após 20-23 minutos de estudo consciente, o cérebro cansa e para de absorver. Por isso cursos tradicionais falham — formato de aula excede o limite cognitivo.

A SOLUÇÃO — MÚSICA: Pesquisa de Robert Zatorre (McGill/Nature Neuroscience) provou que música ativa dopamina + memória ao mesmo tempo. Universidade de Edinburgh: grupo com música aprendeu DOBRO das palavras. O cérebro quer repetir música — e repetição é o único caminho pro subconsciente.

SÉRIE CANTADA: Cenas de séries (Friends, HIMYM) transformadas em música. Ouve 30-40x no trânsito/academia/trabalho porque gruda. Quando a cena real toca, entende tudo sem legenda e sem esforço.

DADOS: Plataforma com 134 músicas originais, alunos em 30+ países, mais de 1 milhão de horas reproduzidas. Aluno que morava fora e fazia aula presencial nos EUA largou tudo pra usar a plataforma.

PRODUTO: 6 módulos progressivos, Séries Cantadas (Friends, HIMYM, TAHM), TED Talks Cantados, Lab de Pronúncia com IA, Scene Challenge (game com cenas reais), Library de livros, Skill Scan (avaliação a cada 15 dias). R$49/mês no plano anual.

GARANTIAS: 7 dias incondicional + 90 dias de aplicação real.

VOZ DO MARCOS — use frases como:
- "Eu poderia ter parado ali. Mas quis entender por que essas pessoas desistiam."
- "Não adianta tentar usar o consciente que tem velocidade de tartaruga e ser fluente em inglês."
- "A música hackeia o cérebro pra querer repetir. E repetição é tudo."
- "Listening é o big domino. Quando o ouvido destrava, todo o resto vem junto."
- "A gente não ensina inglês. A gente treina o seu cérebro pra adquirir inglês."
`;

const BLOG_PROMPT = `Você é um redator SEO de elite que escreve para o blog da Fluency Route. Seu objetivo é criar o MELHOR artigo da internet sobre cada keyword.

${VSL_KNOWLEDGE}

REGRAS DE ESCRITA:
1. Tom: conversa entre amigos que manjam de inglês. Direto, sem enrolação. O Marcos fala como vendedor que entende de gente, não como professor formal.
2. Parágrafos curtos (3-4 linhas máximo). Quebre em blocos visuais.
3. H2s devem ser PERGUNTAS REAIS que as pessoas fazem no Google.
4. Primeiros 150 caracteres: RESPOSTA DIRETA à pergunta principal (GEO — AI Overviews pegam isso).
5. Inclua 2-3 citações/experiências do Marcos entre aspas usando o conhecimento base acima.
6. Use dados científicos reais (McGill, Zatorre, Edinburgh, Chris Nelson) quando relevante.
7. Linguagem natural em português brasileiro. Sem "outrossim", "ademais", "neste sentido", "é importante ressaltar".
8. Keyword principal: título, primeiro parágrafo, e 4-6 vezes naturalmente no texto.
9. Internal linking: sugira 2-3 slugs de artigos relacionados.
10. CTA sutil a cada ~600 palavras conectando com o produto Fluency Route naturalmente.
11. Termine com seção FAQ (4-5 perguntas frequentes com respostas de 2-3 frases).
12. NUNCA use: "neste artigo", "vamos explorar", "em conclusão", "sem mais delongas".
13. MÍNIMO 2500 PALAVRAS. Isso é obrigatório. Conte mentalmente. Se tiver menos que 2500, continue escrevendo.
14. Use > blockquotes para citações do Marcos.
15. Cada H2 deve ter pelo menos 300 palavras de conteúdo antes do próximo H2.

FORMATO — JSON PURO (sem markdown fences, sem \`\`\`):
{
  "title": "Título SEO < 60 chars com keyword",
  "slug": "url-amigavel-sem-acentos",
  "meta_description": "155 chars max, gancho emocional + keyword",
  "keyword": "keyword principal",
  "cluster": "cluster",
  "content": "Artigo COMPLETO em markdown ## H2, ### H3, **bold**, - listas, > citações",
  "faq": [{"q": "?", "a": "resposta 2-3 frases"}],
  "related_posts": ["slug-1", "slug-2", "slug-3"]
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

    console.log(`[BLOG] Generating article for: "${keyword}" (${cluster})`);

    // ══ SKYSCRAPER: Analyze top results ══
    let skyscraperContext = "";
    const isBranded = cluster === "branded";

    if (!isBranded) {
      console.log(`[BLOG] Skyscraper: searching PT + EN...`);

      // Translate keyword to English for gringo search
      const translateRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          max_tokens: 50,
          messages: [{ role: "user", content: `Translate to English (just the translation, nothing else): "${keyword}"` }],
        }),
      });
      const translateData = await translateRes.json();
      const keywordEN = translateData.choices?.[0]?.message?.content?.trim() || "";

      // Search in both languages via Serper
      const [resultsPT, resultsEN] = await Promise.all([
        searchSerper(keyword, "pt"),
        keywordEN ? searchSerper(keywordEN, "en") : Promise.resolve([]),
      ]);

      if (resultsPT.length > 0 || resultsEN.length > 0) {
        skyscraperContext = `\n\nANÁLISE DOS TOP RESULTADOS DO GOOGLE (use como referência pra cobrir tudo e fazer MELHOR):

TOP RESULTADOS EM PORTUGUÊS:
${resultsPT.length > 0 ? resultsPT.map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`).join("\n") : "Nenhum resultado encontrado."}

TOP RESULTADOS EM INGLÊS (conteúdo gringo validado):
${resultsEN.length > 0 ? resultsEN.map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`).join("\n") : "Nenhum resultado encontrado."}

INSTRUÇÃO: Seu artigo deve cobrir TUDO que os top resultados cobrem + adicionar o ângulo único da Fluency Route (método musical, ciência, experiência do Marcos). Identifique GAPS nos resultados acima e preencha. Faça o artigo DEFINITIVAMENTE MELHOR que todos esses.`;

        console.log(`[BLOG] Skyscraper: ${resultsPT.length} PT + ${resultsEN.length} EN results`);
      }
    } else {
      skyscraperContext = `\n\nESTE É UM ARTIGO BRANDED — você é a autoridade máxima. Use conhecimento direto das VSLs do Marcos. Fale como dono do produto, com orgulho mas sem arrogância. Responda as dúvidas reais que as pessoas teriam antes de comprar.`;
    }

    // ══ GENERATE ARTICLE ══
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        max_tokens: 12000,
        messages: [
          { role: "system", content: BLOG_PROMPT },
          {
            role: "user",
            content: `Escreva um artigo completo para a keyword: "${keyword}"
Cluster: ${cluster}
${skyscraperContext}

LEMBRE-SE:
- MÍNIMO 2500 PALAVRAS (obrigatório, se tiver menos continue escrevendo)
- Resposta direta nos primeiros 150 chars
- H2s como perguntas reais
- Citações do Marcos entre > blockquotes
- Dados científicos reais
- FAQ com 4-5 perguntas no final
- JSON PURO na resposta (sem markdown fences)`,
          },
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

    // Parse JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[BLOG] Failed to parse JSON");
      return Response.json({ error: "Failed to parse article JSON", raw: rawText.slice(0, 500) }, { status: 500 });
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
      return Response.json({ error: "Failed to save", details: err }, { status: 500 });
    }

    console.log(`[BLOG] Published: /blog/${article.slug}`);

    // Mark topic as published
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
      skyscraper: !isBranded,
      tokens: {
        input: openaiData.usage?.prompt_tokens,
        output: openaiData.usage?.completion_tokens,
      },
    });

  } catch (err: any) {
    console.error("[BLOG] Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
