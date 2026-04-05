import type { Metadata } from "next";
import { CaptureForm } from "./form";

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
        <div
          onClick={() => {
            const el = document.getElementById("capture-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 32,
            cursor: "pointer",
            border: "1px solid rgba(78,205,196,0.1)",
            boxShadow: "0 0 60px rgba(78,205,196,0.08)",
          }}
        >
          {/* Video loop muted */}
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              objectFit: "cover",
            }}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>

          {/* Dark overlay */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(180deg, rgba(3,3,5,0.3) 0%, rgba(3,3,5,0.7) 100%)",
          }} />

          {/* Waveform animation */}
          <div style={{
            position: "absolute", top: 12, right: 12,
            display: "flex", alignItems: "flex-end", gap: 2, height: 16,
          }}>
            {[3, 5, 2, 4, 3, 5, 2, 4, 3].map((h, i) => (
              <div key={i} style={{
                width: 2, borderRadius: 1,
                background: "#4ECDC4",
                opacity: 0.6,
                animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
                height: h * 2,
              }} />
            ))}
            <span style={{ fontSize: 9, color: "#4ECDC4", opacity: 0.6, marginLeft: 4, fontWeight: 600 }}>
              ♪ Repetição Musical
            </span>
          </div>

          {/* Play button center */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(78,205,196,0.15)",
            border: "2px solid rgba(78,205,196,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              width: 0, height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "16px solid #4ECDC4",
              marginLeft: 3,
            }} />
          </div>

          {/* Bottom label */}
          <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#4ECDC4", opacity: 0.8 }}>
              SÉRIES CANTADAS
            </p>
          </div>
        </div>

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

      {/* Waveform animation CSS */}
      <style>{`
        @keyframes wave {
          0% { height: 4px; }
          100% { height: 14px; }
        }
      `}</style>
    </main>
  );
}
