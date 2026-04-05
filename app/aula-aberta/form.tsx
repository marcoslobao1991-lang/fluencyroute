"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function CaptureForm() {
  const [step, setStep] = useState(0); // 0=button, 1=name, 2=phone
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (step === 1) setTimeout(() => nameRef.current?.focus(), 300);
    if (step === 2) setTimeout(() => phoneRef.current?.focus(), 300);
  }, [step]);

  const handleName = () => {
    if (name.trim().length < 2) { setError("Digite seu nome"); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("WhatsApp inválido"); return; }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: digits, source: "aula-aberta" }),
      });
      router.push("/vsl");
    } catch {
      setError("Erro. Tente novamente.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === 1) handleName();
      else if (step === 2) handleSubmit();
    }
  };

  return (
    <div style={{ width: "100%", minHeight: 120, position: "relative" }}>

      {/* Step 0: Initial CTA button */}
      <div style={{
        transition: "all 0.4s ease",
        opacity: step === 0 ? 1 : 0,
        transform: step === 0 ? "translateY(0)" : "translateY(-20px)",
        pointerEvents: step === 0 ? "auto" : "none",
        position: step === 0 ? "relative" : "absolute",
        top: 0, left: 0, right: 0,
      }}>
        <button
          onClick={() => setStep(1)}
          style={{
            width: "100%",
            padding: "18px 24px",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "inherit",
            background: "#4ECDC4",
            color: "#000",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(78,205,196,0.2)",
            transition: "all 0.3s ease",
          }}
        >
          VER SÉRIES CANTADAS
        </button>
      </div>

      {/* Step 1: Name */}
      <div style={{
        transition: "all 0.4s ease",
        opacity: step === 1 ? 1 : 0,
        transform: step === 1 ? "translateY(0)" : step < 1 ? "translateY(20px)" : "translateY(-20px)",
        pointerEvents: step === 1 ? "auto" : "none",
        position: step === 1 ? "relative" : "absolute",
        top: 0, left: 0, right: 0,
      }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12, fontWeight: 500 }}>
          Qual seu primeiro nome?
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={nameRef}
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "16px 20px",
              fontSize: 16,
              fontFamily: "inherit",
              fontWeight: 500,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(78,205,196,0.2)",
              borderRadius: 12,
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleName}
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              border: "none",
              background: "#4ECDC4",
              color: "#000",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Step 2: Phone */}
      <div style={{
        transition: "all 0.4s ease",
        opacity: step === 2 ? 1 : 0,
        transform: step === 2 ? "translateY(0)" : "translateY(20px)",
        pointerEvents: step === 2 ? "auto" : "none",
        position: step === 2 ? "relative" : "absolute",
        top: 0, left: 0, right: 0,
      }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontWeight: 500 }}>
          Oi, {name.trim().split(" ")[0]}! 👋
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
          Qual seu WhatsApp pra liberar o acesso?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            ref={phoneRef}
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={e => { setPhone(formatPhone(e.target.value)); setError(""); }}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "16px 20px",
              fontSize: 16,
              fontFamily: "inherit",
              fontWeight: 500,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(78,205,196,0.2)",
              borderRadius: 12,
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "18px 24px",
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "inherit",
              background: loading ? "rgba(78,205,196,0.5)" : "#4ECDC4",
              color: "#000",
              border: "none",
              borderRadius: 12,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 0 30px rgba(78,205,196,0.2)",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Liberando acesso..." : "VER SÉRIES CANTADAS"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{
          fontSize: 12, color: "#FF6B6B", textAlign: "center",
          marginTop: 8, position: "absolute", bottom: -24, left: 0, right: 0,
        }}>{error}</p>
      )}

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(78,205,196,0.4) !important; background: rgba(255,255,255,0.08) !important; }
        button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 40px rgba(78,205,196,0.3) !important; }
        button:active:not(:disabled) { transform: translateY(0); }
      `}</style>
    </div>
  );
}
