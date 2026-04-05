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
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => phoneRef.current?.focus(), 200);
    }
  }, [step]);

  const handleNameSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError("Digite seu nome"); return; }
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
      if (step === 1) handleNameSubmit();
      else handleSubmit();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {/* Step 1: Name */}
      <div style={{
        position: "relative",
        transition: "all 0.4s ease",
        opacity: step >= 1 ? 1 : 0,
        transform: step >= 1 ? "translateY(0)" : "translateY(10px)",
      }}>
        <input
          type="text"
          placeholder="Seu primeiro nome"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={step > 1 && !loading ? false : step > 1 ? true : false}
          autoFocus
          style={{
            width: "100%",
            padding: "16px 20px",
            fontSize: 16,
            fontFamily: "inherit",
            fontWeight: 500,
            background: step === 1 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: step === 1 ? "1px solid rgba(78,205,196,0.2)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            color: "#fff",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Step 2: Phone */}
      <div style={{
        transition: "all 0.4s ease",
        opacity: step >= 2 ? 1 : 0,
        maxHeight: step >= 2 ? 60 : 0,
        overflow: "hidden",
        transform: step >= 2 ? "translateY(0)" : "translateY(-10px)",
      }}>
        <input
          ref={phoneRef}
          type="tel"
          placeholder="Seu WhatsApp (11) 99999-9999"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
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
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: "#FF6B6B", textAlign: "center", margin: 0 }}>{error}</p>
      )}

      {/* CTA Button */}
      <button
        onClick={step === 1 ? handleNameSubmit : handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "18px 24px",
          fontSize: 16,
          fontWeight: 800,
          fontFamily: "inherit",
          letterSpacing: "-0.01em",
          background: loading ? "rgba(78,205,196,0.5)" : "#4ECDC4",
          color: "#000",
          border: "none",
          borderRadius: 12,
          cursor: loading ? "default" : "pointer",
          boxShadow: loading ? "none" : "0 0 30px rgba(78,205,196,0.2)",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading ? "Preparando sua aula..." : step === 1 ? "CONTINUAR" : "ASSISTIR AULA GRÁTIS"}
      </button>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(78,205,196,0.4) !important; background: rgba(255,255,255,0.08) !important; }
        button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 40px rgba(78,205,196,0.3) !important; }
        button:active:not(:disabled) { transform: translateY(0); }
      `}</style>
    </div>
  );
}
