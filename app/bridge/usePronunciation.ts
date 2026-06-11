// ═══════════════════════════════════════════════════════════════════
//  /bridge — gravador WAV + Azure Pronunciation Assessment.
//  Porte fiel de ingles-cantado/app/manu/lib/usePronunciation.ts
//  (mesmo motor de produção do shadowing da Manu), enxugado pro que a
//  bridge usa: record() + assessWav(). Grava na taxa NATIVA do device
//  e reamostra pra 16k no fim — robusto em qualquer celular.
// ═══════════════════════════════════════════════════════════════════
"use client";
import { useCallback, useRef, useState } from "react";

export interface WordScore {
  word: string;
  accuracy: number;
  error: string; // None | Omission | Insertion | Mispronunciation
}
export interface PronResult {
  score: number; // recalibrado (curva rígida ajustável)
  azureScore?: number;
  accuracy: number;
  fluency: number;
  prosody: number;
  completeness: number;
  words: WordScore[];
  heard: string;
}

const STT_HOST = (region: string, locale = "en-US") =>
  `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${locale}`;

function b64utf8(s: string): string {
  try {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  } catch {
    return btoa(unescape(encodeURIComponent(s)));
  }
}

// recalibração do score (mesma curva do app; expoente menor = mais gentil —
// bridge é tráfego frio, o diagnóstico precisa gerar esperança, não vergonha)
function harshScore(pa: Record<string, unknown>, exp: number): number {
  const num = (k: string) => {
    const v = Number(pa[k]);
    return Number.isFinite(v) ? v : -1;
  };
  const acc = num("AccuracyScore");
  if (acc < 0) return Math.round(Number(pa.PronScore ?? 0));
  const flu = num("FluencyScore");
  let pro = num("ProsodyScore");
  let comp = num("CompletenessScore");
  if (pro < 0) pro = flu >= 0 ? flu : acc;
  if (comp < 0) comp = 100;
  const f = flu >= 0 ? flu : acc;
  const base = acc * 0.55 + f * 0.2 + pro * 0.15 + comp * 0.1;
  const clamped = Math.max(0, Math.min(100, base));
  return Math.round(Math.pow(clamped / 100, exp) * 100);
}

function parseWords(best: Record<string, unknown>): WordScore[] {
  const rawWords = (best.Words as Record<string, unknown>[]) || [];
  return rawWords.map((w) => {
    const wpa = (w.PronunciationAssessment || w) as Record<string, unknown>;
    return {
      word: String(w.Word || ""),
      accuracy: Math.round(Number(wpa.AccuracyScore ?? 0)),
      error: String(wpa.ErrorType || "None"),
    };
  });
}

export function usePronunciation() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const samplesRef = useRef<Float32Array[]>([]);
  const resolveRef = useRef<((wav: Blob | null) => void) | null>(null);
  const earlyStopRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const rateRef = useRef(16000);

  const liveStream = (): MediaStream | null => {
    const s = streamRef.current;
    return s && s.getAudioTracks().some((t) => t.readyState === "live" && t.enabled && !t.muted) ? s : null;
  };
  const ensure = useCallback(async (): Promise<MediaStream | null> => {
    const s = liveStream();
    if (s) return s;
    try {
      const ns = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      streamRef.current = ns;
      return ns;
    } catch {
      return null;
    }
  }, []);

  const release = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!resolveRef.current) {
      earlyStopRef.current = true;
      return;
    }
    if (procRef.current) {
      procRef.current.disconnect();
      procRef.current = null;
    }
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    // mantém o mic vivo pro retry ser instantâneo; release() ao sair
    if (resolveRef.current) {
      const all = samplesRef.current;
      const total = all.reduce((s, c) => s + c.length, 0);
      if (total < rateRef.current * 0.15) {
        resolveRef.current(null); // toque sem fala, descarta
      } else {
        const merged = new Float32Array(total);
        let off = 0;
        for (const c of all) {
          merged.set(c, off);
          off += c.length;
        }
        resolveRef.current(float32ToWav(resampleTo16k(merged, rateRef.current), 16000));
      }
    }
    resolveRef.current = null;
    samplesRef.current = [];
    setRecording(false);
  }, []);

  // grava até stopRecording() ou maxMs; para sozinho no silêncio (~1.8s
  // contínuo, depois de ~1.3s de fala) — mesma calibração do app.
  // Retorna "denied" direto (estado React é stale logo após o await).
  const record = useCallback(
    async (maxMs: number, onLevel?: (rms: number) => void): Promise<Blob | "denied" | null> => {
      try {
        earlyStopRef.current = false;
        setError(null);
        const stream = await ensure();
        if (!stream) {
          setError("denied");
          setRecording(false);
          return "denied";
        }
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        rateRef.current = ctx.sampleRate || 48000;
        if (ctx.state === "suspended") {
          try {
            await ctx.resume();
          } catch {
            /* segue */
          }
        }
        const src = ctx.createMediaStreamSource(stream);
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        procRef.current = proc;
        samplesRef.current = [];

        let silentChunks = 0;
        let spokeChunks = 0;
        const SIL_THRESH = 0.006;
        const SIL_LIMIT = 7;
        const SPOKE_MIN = 5;

        proc.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          samplesRef.current.push(new Float32Array(input));
          let sum = 0;
          for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
          const rms = Math.sqrt(sum / input.length);
          if (onLevel) onLevel(rms);
          if (rms > SIL_THRESH) {
            spokeChunks++;
            silentChunks = 0;
          } else if (spokeChunks >= SPOKE_MIN) {
            silentChunks++;
            if (silentChunks >= SIL_LIMIT) stopRecording();
          }
        };
        src.connect(proc);
        proc.connect(ctx.destination);
        setRecording(true);

        return await new Promise<Blob | null>((resolve) => {
          resolveRef.current = resolve;
          if (earlyStopRef.current) {
            earlyStopRef.current = false;
            stopRecording();
            return;
          }
          timeoutRef.current = window.setTimeout(() => {
            if (resolveRef.current) stopRecording();
          }, maxMs);
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "erro";
        const denied = msg.includes("Permission") || msg.includes("NotAllowed");
        setError(denied ? "denied" : "mic");
        setRecording(false);
        return denied ? "denied" : null;
      }
    },
    [stopRecording, ensure]
  );

  async function getToken(): Promise<{ token: string; region: string } | "limit" | null> {
    try {
      const r = await fetch("/api/speech-token");
      const d = await r.json();
      if (r.status === 429 || d.error === "limit") {
        setError("limit");
        return "limit";
      }
      if (d.error) {
        setError("azure");
        return null;
      }
      return { token: d.token, region: d.region };
    } catch {
      setError("azure");
      return null;
    }
  }

  // avalia uma gravação JÁ FEITA (o mesmo WAV que o visitante ouve no A/B).
  // "limit" = trava de custo por IP — a página manda a pessoa pro método.
  const assessWav = useCallback(async (wav: Blob, referenceText: string, harshExp = 1.45): Promise<PronResult | "limit" | null> => {
    setError(null);
    const tok = await getToken();
    if (tok === "limit") return "limit";
    if (!tok) return null;
    setProcessing(true);
    try {
      const cfg = {
        ReferenceText: referenceText,
        GradingSystem: "HundredMark",
        Granularity: "Phoneme",
        Dimension: "Comprehensive",
        EnableMiscue: false,
        EnableProsodyAssessment: true,
      };
      const res = await fetch(STT_HOST(tok.region), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tok.token}`,
          "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
          "Pronunciation-Assessment": b64utf8(JSON.stringify(cfg)),
          Accept: "application/json",
        },
        body: wav,
      });
      if (!res.ok) {
        setError("azure");
        return null;
      }
      const data = await res.json();
      if (data.RecognitionStatus !== "Success") {
        setError("silence");
        return null;
      }
      const best = data.NBest?.[0] || {};
      const pa = (best.PronunciationAssessment || best || {}) as Record<string, unknown>;
      return {
        score: harshScore(pa, harshExp),
        azureScore: Math.round(Number(pa.PronScore ?? 0)),
        accuracy: Math.round(Number(pa.AccuracyScore ?? 0)),
        fluency: Math.round(Number(pa.FluencyScore ?? 0)),
        prosody: Math.round(Number(pa.ProsodyScore ?? 0)),
        completeness: Math.round(Number(pa.CompletenessScore ?? 0)),
        words: parseWords(best),
        heard: data.DisplayText || best?.Display || "",
      };
    } catch {
      setError("azure");
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  return { record, assessWav, stopRecording, release, recording, processing, error, setError };
}

function resampleTo16k(input: Float32Array, srcRate: number): Float32Array {
  if (!srcRate || srcRate === 16000 || input.length === 0) return input;
  const ratio = srcRate / 16000;
  const outLen = Math.max(1, Math.floor(input.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = pos - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
  const int16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const buffer = new ArrayBuffer(44 + int16.length * 2);
  const view = new DataView(buffer);
  const ws = (o: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i));
  };
  ws(0, "RIFF");
  view.setUint32(4, 36 + int16.length * 2, true);
  ws(8, "WAVE");
  ws(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ws(36, "data");
  view.setUint32(40, int16.length * 2, true);
  for (let i = 0; i < int16.length; i++) view.setInt16(44 + i * 2, int16[i], true);
  return new Blob([buffer], { type: "audio/wav" });
}
