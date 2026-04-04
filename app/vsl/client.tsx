"use client";

import { useEffect } from "react";

const C = { teal: "#4ECDC4", bg: "#0A0A0A", border: "rgba(255,255,255,0.06)" };

export function VSLClient() {
  useEffect(() => {
    // Vturb SDK
    if (!document.querySelector('script[src*="smartplayer-wc"]')) {
      const s = document.createElement("script");
      s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
      s.async = true;
      document.head.appendChild(s);
    }
    // Load iframe
    const ifr = document.getElementById("ifr_69d11e69d48f2697296489fb") as HTMLIFrameElement;
    if (ifr && ifr.src === "about:blank") {
      ifr.src = "https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/69d11e69d48f2697296489fb/v4/embed.html" + (location.search || "?") + "&vl=" + encodeURIComponent(location.href);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: "#fff", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(3,3,5,0.8)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${C.border}`, padding: "14px 24px",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>
          <span style={{ color: "#fff" }}>FLUENCY</span>
          <span style={{ color: C.teal }}>ROUTE</span>
        </span>
      </header>

      {/* Player */}
      <div style={{ paddingTop: 80, maxWidth: 400, margin: "0 auto", padding: "80px 20px 48px" }}>
        <div id="ifr_69d11e69d48f2697296489fb_wrapper" style={{ margin: "0 auto", width: "100%" }}>
          <div style={{ position: "relative", paddingTop: "177.78%" }} id="ifr_69d11e69d48f2697296489fb_aspect">
            <iframe
              frameBorder="0"
              allowFullScreen
              src="about:blank"
              id="ifr_69d11e69d48f2697296489fb"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              referrerPolicy="origin"
            />
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>
          Assista com som ativado 🔊
        </p>
      </div>
    </div>
  );
}
