import type { Metadata } from "next";
import { CaptureForm } from "./form";
import { VideoBanner } from "./banner";

export const metadata: Metadata = {
  title: "Séries Cantadas | inglêscantado",
  description: "Transformamos episódios de série em música e isso destravou o inglês dos nossos piores alunos.",
  robots: { index: false, follow: false },
};

const VIDEO_URL = "https://petrtewismhpzidcmmwb.supabase.co/storage/v1/object/public/media/friends/friends-s01e01/Friends_S01_E01_0.01.11.369-0.01.14.528.mp4";

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
      {/* Glow */}
      <div style={{
        position: "absolute", top: "25%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 440, width: "100%" }}>
        {/* Logo — inglêscantado */}
        <div style={{ textAlign: "center", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <img src="/logo.png" alt="" style={{ width: 18, height: 18, borderRadius: 4 }} />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em", opacity: 0.4 }}>
            <span style={{ color: "#fff" }}>inglês</span>
            <span style={{ color: "#4ECDC4" }}>cantado</span>
          </span>
        </div>

        {/* Video banner */}
        <VideoBanner videoUrl={VIDEO_URL} />

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
            opacity: 0.8,
          }}>
            Liberamos por tempo limitado.
          </p>
        </div>

        {/* Form */}
        <div id="capture-section">
          <CaptureForm />
        </div>

        {/* Trust */}
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Seus dados estão seguros</span>
          </div>
        </div>
      </div>

    </main>
  );
}
