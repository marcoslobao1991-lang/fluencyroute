"use client";

export function VideoBanner({ videoUrl, onPlay }: { videoUrl: string; onPlay?: () => void }) {
  return (
    <div
      onClick={() => {
        if (onPlay) onPlay();
        else document.getElementById("capture-section")?.scrollIntoView({ behavior: "smooth" });
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
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(180deg, rgba(3,3,5,0.3) 0%, rgba(3,3,5,0.7) 100%)",
      }} />

      {/* Waveform + Repetição Musical */}
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

      {/* Play button */}
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
      <div style={{ position: "absolute", bottom: 12, left: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#4ECDC4", opacity: 0.8 }}>
          SÉRIES CANTADAS
        </p>
      </div>

      <style>{`
        @keyframes wave {
          0% { height: 4px; }
          100% { height: 14px; }
        }
      `}</style>
    </div>
  );
}
