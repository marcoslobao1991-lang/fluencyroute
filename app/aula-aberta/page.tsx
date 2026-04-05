import type { Metadata } from "next";
import { CaptureForm } from "./form";

export const metadata: Metadata = {
  title: "Aula Grátis — Séries Cantadas | Fluency Route",
  description: "Transformamos episódios de série em música e isso destravou o inglês dos nossos piores alunos. Assista a aula gratuita.",
  robots: { index: false, follow: false },
};

export default function AulaAbertaPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#030305",
      color: "#fff",
      fontFamily: "var(--font-dm-sans), sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow background */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        height: 500,
        background: "radial-gradient(circle, rgba(78,205,196,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 440, width: "100%", textAlign: "center" }}>
        {/* Logo */}
        <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40, opacity: 0.4 }}>
          <span style={{ color: "#fff" }}>FLUENCY</span>
          <span style={{ color: "#4ECDC4" }}>ROUTE</span>
        </p>

        {/* Thumbnail */}
        <div style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 32,
          background: "linear-gradient(135deg, #0a1a18 0%, #0d0d12 100%)",
          border: "1px solid rgba(78,205,196,0.1)",
          boxShadow: "0 0 60px rgba(78,205,196,0.08)",
        }}>
          {/* Play button */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(78,205,196,0.15)",
            border: "2px solid rgba(78,205,196,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              width: 0, height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderLeft: "20px solid #4ECDC4",
              marginLeft: 4,
            }} />
          </div>
          {/* Overlay text */}
          <div style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#4ECDC4", opacity: 0.8, marginBottom: 4 }}>
              SÉRIES CANTADAS
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>
              Descubra o que é isso
            </p>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(22px, 5.5vw, 30px)",
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: "-0.03em",
          marginBottom: 12,
        }}>
          Transformamos Episódios de Série em Música.
        </h1>
        <p style={{
          fontSize: "clamp(15px, 4vw, 18px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.5,
          marginBottom: 8,
        }}>
          E isso destravou o inglês dos nossos piores alunos.
        </p>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#4ECDC4",
          marginBottom: 32,
          opacity: 0.8,
        }}>
          Liberamos essa aula por tempo limitado.
        </p>

        {/* Form */}
        <CaptureForm />

        {/* Trust */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Seus dados estão seguros</span>
          </div>
        </div>
      </div>
    </main>
  );
}
