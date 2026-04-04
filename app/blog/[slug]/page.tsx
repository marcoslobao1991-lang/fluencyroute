import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;
const C = { teal: "#4ECDC4", border: "rgba(255,255,255,0.06)" };

async function getPost(slug: string) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/blog_posts?slug=eq.${slug}&status=eq.published&select=*&limit=1`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post não encontrado" };
  return {
    title: post.title,
    description: post.meta_description,
    keywords: post.keyword,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      type: "article",
      publishedTime: post.published_at,
      authors: ["Marcos Lobão"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${C.border}`, padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", textDecoration: "none" }}>
          <span style={{ color: "#fff" }}>FLUENCY</span>
          <span style={{ color: C.teal }}>ROUTE</span>
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/blog" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Blog</Link>
          <Link href="/vsl" style={{
            fontSize: 12, color: "#000", background: C.teal, fontWeight: 700,
            padding: "8px 16px", borderRadius: 8, textDecoration: "none",
          }}>AULA GRÁTIS</Link>
        </div>
      </header>

      {/* Article */}
      <article style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/blog" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Blog</Link>
          {" / "}
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{post.title}</span>
        </nav>

        {post.cluster && (
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase",
            color: C.teal, opacity: 0.7,
          }}>{post.cluster}</span>
        )}
        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginTop: 8, marginBottom: 16 }}>
          {post.title}
        </h1>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 40 }}>
          <span>Por Marcos Lobão</span>
          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
        </div>

        {/* Content */}
        <div
          style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", fontWeight: 300 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content || "") }}
        />

        {/* CTA */}
        <div style={{
          marginTop: 60, padding: "32px", borderRadius: 16,
          background: "rgba(78,205,196,0.04)", border: `1px solid rgba(78,205,196,0.1)`,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            Quer aprender inglês com música?
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            Assista a aula gratuita e descubra o método
          </p>
          <Link href="/vsl" style={{
            display: "inline-block", padding: "14px 32px", borderRadius: 10,
            fontWeight: 700, fontSize: 15, background: C.teal, color: "#000",
            textDecoration: "none",
          }}>ASSISTIR AULA GRÁTIS</Link>
        </div>

        {/* Related */}
        {post.related_posts && post.related_posts.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Leia também:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {post.related_posts.map((slug: string) => (
                <Link key={slug} href={`/blog/${slug}`} style={{ fontSize: 14, color: C.teal, textDecoration: "none" }}>
                  → {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Schema.org Article */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.meta_description,
        author: { "@type": "Person", name: "Marcos Lobão" },
        publisher: { "@type": "Organization", name: "Fluency Route" },
        datePublished: post.published_at,
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://fluencyroute.com.br/blog/${post.slug}` },
      }) }} />
    </main>
  );
}

// Simple markdown → HTML
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#fff;margin:32px 0 12px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:22px;font-weight:800;color:#fff;margin:40px 0 16px">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:8px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul style="margin:16px 0;padding-left:20px">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:16px 0">')
    .replace(/^(?!<[hul])/gm, (line) => line ? `<p style="margin:16px 0">${line}` : '')
    .replace(/\n/g, '<br/>');
}
