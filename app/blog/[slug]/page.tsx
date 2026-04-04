import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;
const C = { teal: "#4ECDC4", border: "rgba(255,255,255,0.06)", card: "rgba(255,255,255,0.03)" };

async function getPost(slug: string) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/blog_posts?slug=eq.${slug}&status=eq.published&select=*&limit=1`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] || null;
}

function extractHeadings(md: string): { id: string; text: string }[] {
  const matches = [...md.matchAll(/^## (.+)$/gm)];
  return matches.map(m => ({
    text: m[1],
    id: m[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, ""),
  }));
}

function readingTime(text: string): number {
  const words = text.replace(/[#*\-\[\]()>]/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post não encontrado" };
  return {
    title: post.title,
    description: post.meta_description,
    keywords: post.keyword,
    alternates: { canonical: `https://fluencyroute.com.br/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.meta_description,
      type: "article",
      publishedTime: post.published_at,
      authors: ["Marcos Lobão"],
      url: `https://fluencyroute.com.br/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content || "");
  const minutes = readingTime(post.content || "");
  const shareUrl = `https://fluencyroute.com.br/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);

  // Parse FAQ from content (## Perguntas Frequentes section with ### questions)
  const faqItems: { q: string; a: string }[] = [];
  const faqSection = (post.content || "").match(/## Perguntas Frequentes\n\n([\s\S]*?)(?=\n## |\n*$)/);
  if (faqSection) {
    const faqParts = faqSection[1].matchAll(/### (.+?)\n\n([\s\S]*?)(?=\n### |\n*$)/g);
    for (const m of faqParts) {
      faqItems.push({ q: m[1].trim(), a: m[2].trim() });
    }
  }

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

      <article style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/blog" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Blog</Link>
          {" / "}
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{post.title}</span>
        </nav>

        {/* Meta line */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {post.cluster && (
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
              color: C.teal, padding: "4px 10px", borderRadius: 6,
              background: `${C.teal}10`, border: `1px solid ${C.teal}20`,
            }}>{post.cluster}</span>
          )}
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{minutes} min de leitura</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
          {post.title}
        </h1>

        {/* Author + date */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href="/about" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.teal}30, rgba(167,139,250,0.2))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: C.teal,
            }}>M</div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Marcos Lobão</span>
          </Link>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            {post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : ""}
          </span>
        </div>

        {/* Table of Contents */}
        {headings.length > 2 && (
          <nav style={{
            marginBottom: 40, padding: 20, borderRadius: 12,
            background: C.card, border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Neste artigo
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {headings.map((h, i) => (
                <li key={i}>
                  <a href={`#${h.id}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", lineHeight: 1.6 }}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Content */}
        <div
          className="blog-content"
          style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.7)", fontWeight: 300 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content || "") }}
        />

        {/* Share */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Compartilhar:</span>
          <a href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)", color: "#25d366", textDecoration: "none", fontWeight: 600 }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 600 }}>
            Twitter
          </a>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 48, padding: 32, borderRadius: 16,
          background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.1)",
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

        {/* Author box */}
        <div style={{
          marginTop: 48, padding: 24, borderRadius: 14,
          background: C.card, border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${C.teal}30, rgba(167,139,250,0.2))`,
            border: `1px solid ${C.teal}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, color: C.teal,
          }}>M</div>
          <div>
            <Link href="/about" style={{ fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none" }}>Marcos Lobão</Link>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.5 }}>
              Fundador da Fluency Route. Músico, professor de inglês e pesquisador de aquisição de linguagem via música.
            </p>
          </div>
        </div>

        {/* Related */}
        {post.related_posts && post.related_posts.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Leia também:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {post.related_posts.map((s: string) => (
                <Link key={s} href={`/blog/${s}`} style={{ fontSize: 14, color: C.teal, textDecoration: "none" }}>
                  → {s.replace(/-/g, " ")}
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
        author: { "@type": "Person", name: "Marcos Lobão", url: "https://fluencyroute.com.br/about" },
        publisher: { "@type": "Organization", name: "Fluency Route", url: "https://fluencyroute.com.br" },
        datePublished: post.published_at,
        dateModified: post.published_at,
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://fluencyroute.com.br/blog/${post.slug}` },
        keywords: post.keyword,
      }) }} />

      {/* Schema.org BreadcrumbList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://fluencyroute.com.br" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://fluencyroute.com.br/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://fluencyroute.com.br/blog/${post.slug}` },
        ],
      }) }} />

      {/* Schema.org FAQPage */}
      {faqItems.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(f => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }) }} />
      )}
    </main>
  );
}

// Markdown → HTML with anchor IDs on H2s
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#fff;margin:32px 0 12px">$1</h3>')
    .replace(/^## (.+)$/gm, (_, title) => {
      const id = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
      return `<h2 id="${id}" style="font-size:22px;font-weight:800;color:#fff;margin:48px 0 16px;scroll-margin-top:80px">${title}</h2>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, `<blockquote style="border-left:3px solid ${C.teal};padding:12px 16px;margin:20px 0;background:rgba(78,205,196,0.04);border-radius:0 8px 8px 0;font-style:italic;color:rgba(255,255,255,0.6)">$1</blockquote>`)
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:8px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul style="margin:16px 0;padding-left:20px">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:16px 0">')
    .replace(/\n/g, '<br/>');
}
