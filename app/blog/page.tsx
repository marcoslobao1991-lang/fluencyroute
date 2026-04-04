import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Aprenda Inglês com Música",
  description: "Dicas, estratégias e ciência por trás de aprender inglês com música. Artigos semanais sobre listening, pronúncia, vocabulário e mais.",
};

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;
const T = "#0d9488";

async function getPosts() {
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/blog_posts?select=slug,title,meta_description,keyword,cluster,published_at&status=eq.published&order=published_at.desc&limit=50`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#1a1a1a", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      {/* Header — dark */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#0A0A0A", padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", textDecoration: "none" }}>
          <span style={{ color: "#fff" }}>FLUENCY</span>
          <span style={{ color: "#4ECDC4" }}>ROUTE</span>
        </Link>
        <Link href="/vsl" style={{
          fontSize: 12, color: "#000", background: "#4ECDC4", fontWeight: 700,
          padding: "8px 16px", borderRadius: 8, textDecoration: "none",
        }}>AULA GRÁTIS</Link>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#111", marginBottom: 8 }}>Blog</h1>
        <p style={{ fontSize: 15, color: "#777", marginBottom: 40, fontWeight: 400 }}>
          Ciência, dicas e estratégias pra aprender inglês com música
        </p>

        {posts.length === 0 ? (
          <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "60px 0" }}>
            Primeiros artigos chegando em breve.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map((post: any) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{
                background: "#fafafa", border: "1px solid #eee", borderRadius: 14,
                padding: "24px", textDecoration: "none", color: "#1a1a1a",
                transition: "border-color .2s, box-shadow .2s",
              }}>
                {post.cluster && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
                    color: T, marginBottom: 8, display: "block",
                  }}>{post.cluster}</span>
                )}
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, color: "#111" }}>{post.title}</h2>
                <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6, fontWeight: 400 }}>
                  {post.meta_description}
                </p>
                <p style={{ fontSize: 11, color: "#bbb", marginTop: 12 }}>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
