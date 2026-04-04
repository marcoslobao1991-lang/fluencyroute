import Link from "next/link";

const C = { teal: "#4ECDC4", bg: "#0A0A0A", card: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" };

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${C.border}`, padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>
          <span style={{ color: "#fff" }}>FLUENCY</span>
          <span style={{ color: C.teal }}>ROUTE</span>
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/blog" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500 }}>Blog</Link>
          <Link href="https://app.fluencyroute.com.br" style={{
            fontSize: 13, color: C.teal, textDecoration: "none", fontWeight: 600,
            padding: "6px 16px", borderRadius: 8, border: `1px solid ${C.teal}40`,
          }}>Entrar</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 80, textAlign: "center",
        maxWidth: 700, margin: "0 auto", padding: "120px 24px 80px",
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: C.teal, marginBottom: 20, opacity: 0.8 }}>
          MÉTODO CIENTÍFICO
        </p>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
          Aprenda inglês de verdade{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.teal}, #A78BFA)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ouvindo música
          </span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px", fontWeight: 300 }}>
          Seu cérebro foi feito pra repetir música. A gente usa isso pra você adquirir inglês naturalmente — sem decorar regra, sem forçar nada.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/vsl" style={{
            padding: "16px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15,
            background: C.teal, color: "#000", textDecoration: "none",
            boxShadow: `0 0 30px ${C.teal}30`,
          }}>
            ASSISTIR AULA GRÁTIS
          </Link>
          <Link href="/blog" style={{
            padding: "16px 32px", borderRadius: 12, fontWeight: 600, fontSize: 15,
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)",
            textDecoration: "none", border: `1px solid ${C.border}`,
          }}>
            Ler o Blog
          </Link>
        </div>
      </section>

      {/* Social proof strip */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
          Baseado em pesquisas de McGill, MIT e Nature Neuroscience
        </p>
      </section>

      {/* 3 pillars */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        {[
          { icon: "🎵", title: "Repetição Musical", desc: "Música ativa dopamina + memória ao mesmo tempo. Você repete porque quer, não porque precisa." },
          { icon: "🧠", title: "Aquisição Natural", desc: "Listening primeiro, speaking depois. A mesma ordem que seu cérebro aprendeu português quando criança." },
          { icon: "📈", title: "Progresso Visível", desc: "Skill Scan mede sua evolução a cada 15 dias. XP, streaks e badges mantêm você no jogo." },
        ].map((p, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: "32px 24px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.teal, opacity: 0.3 }} />
            <p style={{ fontSize: 28, marginBottom: 16 }}>{p.icon}</p>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300 }}>{p.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "60px 24px 100px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
          Pronto pra começar?
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>
          Assista a aula gratuita e descubra o método
        </p>
        <Link href="/vsl" style={{
          padding: "18px 40px", borderRadius: 12, fontWeight: 700, fontSize: 16,
          background: C.teal, color: "#000", textDecoration: "none",
          boxShadow: `0 0 40px ${C.teal}25`,
        }}>
          ASSISTIR AGORA
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>FLUENCY</span>
          <span style={{ color: C.teal }}>ROUTE</span>
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
          Fluency Route · Todos os direitos reservados
        </p>
        <div style={{ marginTop: 12, display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/blog" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Blog</Link>
          <Link href="/vsl" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Aula Grátis</Link>
          <Link href="https://app.fluencyroute.com.br" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Área do Aluno</Link>
        </div>
      </footer>
    </main>
  );
}
