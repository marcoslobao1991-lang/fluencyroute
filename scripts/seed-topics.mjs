// Seed blog_topics — run with: node scripts/seed-topics.mjs

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldHJ0ZXdpc21ocHppZGNtbXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgwODc0NiwiZXhwIjoyMDg5Mzg0NzQ2fQ.A06V46jvOr_tms_h28nOZb7je9SHBx1XMvD1JcPo1H4";

const topics = [
  // ═══ BRANDED (fase 1 — remarketing de quem pesquisa o produto) ═══
  { cluster: "branded", keyword: "fluency route funciona", search_intent: "transactional" },
  { cluster: "branded", keyword: "fluency route vale a pena", search_intent: "transactional" },
  { cluster: "branded", keyword: "fluency route preço", search_intent: "transactional" },
  { cluster: "branded", keyword: "fluency route como funciona", search_intent: "informational" },
  { cluster: "branded", keyword: "inglês cantado plataforma", search_intent: "navigational" },
  { cluster: "branded", keyword: "fluency route login", search_intent: "navigational" },
  { cluster: "branded", keyword: "fluency route é confiável", search_intent: "transactional" },
  { cluster: "branded", keyword: "fluency route cancelar assinatura", search_intent: "transactional" },
  { cluster: "branded", keyword: "aprender inglês com música app", search_intent: "transactional" },
  { cluster: "branded", keyword: "fluency route vs duolingo", search_intent: "commercial" },
  { cluster: "branded", keyword: "melhor app para aprender inglês 2026", search_intent: "commercial" },
  { cluster: "branded", keyword: "fluency route depoimentos", search_intent: "transactional" },

  // ═══ MÉTODO (autoridade sobre o método musical) ═══
  { cluster: "método", keyword: "aprender inglês com música funciona", search_intent: "informational" },
  { cluster: "método", keyword: "repetição espaçada inglês como funciona", search_intent: "informational" },
  { cluster: "método", keyword: "música ajuda a aprender idiomas ciência", search_intent: "informational" },
  { cluster: "método", keyword: "como a música afeta o cérebro no aprendizado", search_intent: "informational" },
  { cluster: "método", keyword: "método natural de aprender inglês", search_intent: "informational" },

  // ═══ LISTENING (pilar central do produto) ═══
  { cluster: "listening", keyword: "como melhorar listening em inglês", search_intent: "informational" },
  { cluster: "listening", keyword: "não consigo entender inglês falado", search_intent: "informational" },
  { cluster: "listening", keyword: "como entender inglês de filme sem legenda", search_intent: "informational" },
  { cluster: "listening", keyword: "exercícios de listening em inglês", search_intent: "informational" },
  { cluster: "listening", keyword: "quanto tempo para entender inglês nativo", search_intent: "informational" },

  // ═══ PRONÚNCIA ═══
  { cluster: "pronúncia", keyword: "como pronunciar TH em inglês", search_intent: "informational" },
  { cluster: "pronúncia", keyword: "como perder sotaque brasileiro no inglês", search_intent: "informational" },
  { cluster: "pronúncia", keyword: "connected speech inglês como praticar", search_intent: "informational" },
  { cluster: "pronúncia", keyword: "erros de pronúncia mais comuns de brasileiros", search_intent: "informational" },

  // ═══ SÉRIES E FILMES ═══
  { cluster: "séries", keyword: "aprender inglês com Friends", search_intent: "informational" },
  { cluster: "séries", keyword: "melhores séries para aprender inglês", search_intent: "informational" },
  { cluster: "séries", keyword: "como estudar inglês assistindo série", search_intent: "informational" },
  { cluster: "séries", keyword: "inglês de Friends é fácil de entender", search_intent: "informational" },

  // ═══ VOCABULÁRIO ═══
  { cluster: "vocabulário", keyword: "phrasal verbs mais usados no dia a dia", search_intent: "informational" },
  { cluster: "vocabulário", keyword: "expressões em inglês do cotidiano", search_intent: "informational" },
  { cluster: "vocabulário", keyword: "como aumentar vocabulário em inglês rápido", search_intent: "informational" },

  // ═══ MOTIVAÇÃO / DOR ═══
  { cluster: "motivação", keyword: "por que desisti de aprender inglês", search_intent: "informational" },
  { cluster: "motivação", keyword: "como manter consistência estudando inglês", search_intent: "informational" },
  { cluster: "motivação", keyword: "estudar inglês sozinho funciona", search_intent: "informational" },
];

async function seed() {
  console.log(`Seeding ${topics.length} topics...`);

  const res = await fetch(`${SUPA_URL}/rest/v1/blog_topics`, {
    method: "POST",
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(topics),
  });

  if (!res.ok) {
    console.error("Error:", await res.text());
    return;
  }

  const data = await res.json();
  console.log(`✅ ${data.length} topics seeded!`);

  // Show summary by cluster
  const clusters = {};
  for (const t of topics) {
    clusters[t.cluster] = (clusters[t.cluster] || 0) + 1;
  }
  console.log("\nPor cluster:");
  for (const [c, n] of Object.entries(clusters)) {
    console.log(`  ${c}: ${n}`);
  }
}

seed();
