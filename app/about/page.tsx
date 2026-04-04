import type { Metadata } from "next";
import Link from "next/link";

const C = { teal: "#4ECDC4", border: "rgba(255,255,255,0.06)", card: "rgba(255,255,255,0.03)" };

export const metadata: Metadata = {
  title: "Sobre Marcos Lobão — Fundador da Fluency Route",
  description: "Marcos Lobão é músico, professor de inglês e fundador da Fluency Route. Conheça a história por trás do método que ensina inglês com música.",
};

export default function AboutPage() {
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
        {/* Author hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: `linear-gradient(135deg, ${C.teal}30, rgba(167,139,250,0.2))`,
            border: `2px solid ${C.teal}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
          }}>M</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Marcos Lobão</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Fundador da Fluency Route · Músico · Professor de inglês</p>
          </div>
        </div>

        <div style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>
          <p style={{ marginBottom: 20 }}>
            Eu cresci numa família de músicos. Meu pai tocava, meus tios tocavam, e eu aprendi a tocar antes de aprender a ler. Música sempre foi a linguagem mais natural pra mim.
          </p>
          <p style={{ marginBottom: 20 }}>
            Quando comecei a estudar inglês, passei pelo mesmo ciclo que todo mundo: curso presencial, app de celular, professor particular, desistência. Repetia isso a cada 6 meses. Até que percebi uma coisa: as músicas que eu ouvia em inglês ficavam grudadas na minha cabeça — e com elas, as palavras, as frases, a pronúncia.
          </p>
          <p style={{ marginBottom: 20 }}>
            Fui pesquisar por quê. Encontrei estudos de McGill, MIT e Nature Neuroscience mostrando que música ativa circuitos de dopamina e memória ao mesmo tempo. O cérebro <strong style={{ color: "#fff" }}>quer</strong> repetir música — e repetição é tudo em aquisição de linguagem.
          </p>
          <p style={{ marginBottom: 20 }}>
            Aí nasceu a Fluency Route: um método que usa repetição musical pra hackear o processo de aprendizado. Em vez de forçar o aluno a estudar, a música faz ele querer repetir. E cada repetição fortalece as conexões neurais do inglês.
          </p>
          <p style={{ marginBottom: 20 }}>
            Hoje a plataforma tem <strong style={{ color: "#fff" }}>134 músicas originais</strong> em 6 módulos, séries cantadas (Friends, HIMYM), TED Talks cantados, Lab de pronúncia com inteligência artificial, games com cenas de séries reais, e uma biblioteca de livros em inglês com tradução frase a frase.
          </p>
          <p style={{ marginBottom: 20 }}>
            Minha missão é ajudar as pessoas a passarem a fase mais difícil do inglês — aquela onde você não entende quase nada e não sabe o que fazer. Depois disso, a evolução segue um rumo natural: você começa a assistir séries, ouvir podcasts e consumir conteúdo em inglês porque <em>quer</em>, não porque precisa.
          </p>

          {/* Credentials */}
          <div style={{
            marginTop: 40, padding: 24, borderRadius: 14,
            background: C.card, border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.teal, opacity: 0.7, marginBottom: 16 }}>
              CREDENCIAIS
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Fundador e CEO da Fluency Route",
                "Músico com mais de 20 anos de experiência",
                "Pesquisador autodidata em aquisição de linguagem e neuociência musical",
                "Criador de 134+ músicas originais para ensino de inglês",
                "Desenvolvedor da plataforma Inglês Cantado",
              ].map((c, i) => (
                <li key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: C.teal }}>·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="https://instagram.com/fluencyroute" target="_blank" rel="noopener noreferrer" style={{
              padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              color: "rgba(255,255,255,0.6)", textDecoration: "none",
            }}>Instagram</a>
            <Link href="/blog" style={{
              padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              color: "rgba(255,255,255,0.6)", textDecoration: "none",
            }}>Blog</Link>
            <Link href="/vsl" style={{
              padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: `${C.teal}15`, border: `1px solid ${C.teal}30`,
              color: C.teal, textDecoration: "none",
            }}>Assistir aula grátis</Link>
          </div>
        </div>
      </article>

      {/* Schema.org Person */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Marcos Lobão",
        jobTitle: "Fundador da Fluency Route",
        description: "Músico, professor de inglês e fundador da Fluency Route — plataforma que ensina inglês com música usando repetição musical científica.",
        url: "https://fluencyroute.com.br/about",
        sameAs: ["https://instagram.com/fluencyroute"],
        worksFor: {
          "@type": "Organization",
          name: "Fluency Route",
          url: "https://fluencyroute.com.br",
        },
      }) }} />
    </main>
  );
}
