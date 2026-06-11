// ═══════════════════════════════════════════════════════════════════
//  MANU — o avatar (porte 1:1 de ingles-cantado/app/manu/components/
//  ManuOrb.tsx). Orb gradiente com rosto: fala = boca animada · ouvindo
//  = anéis + olhos atentos · mood muda a expressão. Keyframes (manuTalk,
//  manuBlink, manuBlob, manuRing) injetados pela página.
// ═══════════════════════════════════════════════════════════════════
"use client";
import type { CSSProperties, ReactElement } from "react";

export type ManuMood = "idle" | "happy" | "celebrate" | "oops";

const VIOLET = "#7c5cff";
const VIOLET_D = "#6438f5";

export default function ManuOrb({
  size = 80,
  speaking = false,
  listening = false,
  mood = "idle",
  color = VIOLET,
}: {
  size?: number;
  speaking?: boolean;
  listening?: boolean;
  mood?: ManuMood;
  color?: string;
}) {
  const ink = "#241733";
  const happy = mood === "happy" || mood === "celebrate";
  const squint = happy || listening;
  const eyeRy = squint ? 3.2 : 6;

  let mouth: ReactElement;
  if (speaking) {
    mouth = (
      <ellipse
        cx="50"
        cy="62"
        rx="9"
        ry="8"
        fill={ink}
        style={{ transformBox: "fill-box", transformOrigin: "center", animation: "manuTalk .26s ease-in-out infinite" }}
      />
    );
  } else if (mood === "oops") {
    mouth = <circle cx="50" cy="63" r="4.2" fill={ink} />;
  } else if (mood === "celebrate") {
    mouth = <path d="M33 56 Q50 76 67 56 Z" fill={ink} />;
  } else if (mood === "happy") {
    mouth = <path d="M34 57 Q50 71 66 57" fill="none" stroke={ink} strokeWidth="5.5" strokeLinecap="round" />;
  } else {
    mouth = <path d="M37 58 Q50 66 63 58" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />;
  }

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      {listening && (
        <>
          <span style={ring(color, 0)} />
          <span style={ring(color, 0.6)} />
        </>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 36% 28%, #d6c6ff, ${color} 54%, ${VIOLET_D} 100%)`,
          animation: speaking ? "manuBlob 2.2s ease-in-out infinite" : "none",
          boxShadow: `0 ${size * 0.14}px ${size * 0.5}px -${size * 0.16}px ${color}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "16%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.28)",
          filter: "blur(6px)",
          pointerEvents: "none",
        }}
      />
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: speaking ? "none" : "manuBlink 4.2s ease-in-out infinite",
          }}
        >
          <ellipse cx="37" cy="44" rx="5" ry={eyeRy} fill={ink} />
          <ellipse cx="63" cy="44" rx="5" ry={eyeRy} fill={ink} />
        </g>
        {mood === "celebrate" && (
          <>
            <circle cx="26" cy="58" r="5" fill="#ff8fb0" opacity="0.55" />
            <circle cx="74" cy="58" r="5" fill="#ff8fb0" opacity="0.55" />
          </>
        )}
        {mouth}
      </svg>
    </div>
  );
}

function ring(color: string, delay: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: `2px solid ${color}`,
    animation: `manuRing 1.6s ease-out ${delay}s infinite`,
  };
}
