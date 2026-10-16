// ═══════════════════════════════════════════════════════════════════
//  /api/video-watch — vigia do vídeo das VSLs (cron a cada 5 min, vercel.json).
//  Faz GET no manifesto HLS e num segmento do R2 (video.fluencyroute.com.br)
//  e no espelho da VPS. Guarda o estado em public.video_watch e avisa o
//  Marcos no WhatsApp (Z-API) quando uma origem cai e quando volta.
//  Enquanto estiver fora, repete o aviso a cada 60 min.
//  Auth: Authorization: Bearer CRON_SECRET ou ?key=CRON_SECRET.
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { sendAlert } from "../../lib/whatsapp.js";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const SUPA = "https://petrtewismhpzidcmmwb.supabase.co";
const REALERT_MIN = 60;

const TARGETS = [
  { key: "r2", label: "R2 (video.fluencyroute.com.br)", base: "https://video.fluencyroute.com.br/vsl-ingles" },
  { key: "vps", label: "VPS (media.srv1198551)", base: "https://media.srv1198551.hstgr.cloud/vsl-ingles" },
];

async function fetchT(url: string, ms: number) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { cache: "no-store", signal: ctl.signal, headers: { "User-Agent": "fluency-video-watch/1" } });
  } finally {
    clearTimeout(t);
  }
}

async function probe(base: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const t0 = Date.now();
    const m = await fetchT(base + "/main.m3u8?w=" + Date.now(), 8000);
    const txt = await m.text();
    if (!m.ok || !txt.startsWith("#EXTM3U")) return { ok: false, detail: `manifesto ${m.status}` };
    const lvl = txt.split("\n").find((l) => l && !l.startsWith("#"));
    if (!lvl) return { ok: false, detail: "manifesto sem níveis" };
    const l = await fetchT(base + "/" + lvl.trim(), 8000);
    const ltxt = await l.text();
    const seg = ltxt.split("\n").find((x) => x && !x.startsWith("#"));
    if (!l.ok || !seg) return { ok: false, detail: `nível ${l.status}` };
    const dir = lvl.includes("/") ? lvl.slice(0, lvl.lastIndexOf("/") + 1) : "";
    const s = await fetchT(base + "/" + dir + seg.trim(), 10000);
    if (!s.ok) return { ok: false, detail: `segmento ${s.status}` };
    await s.arrayBuffer();
    return { ok: true, detail: `${Date.now() - t0} ms` };
  } catch (e: any) {
    return { ok: false, detail: e?.name === "AbortError" ? "timeout" : String(e?.message || e).slice(0, 80) };
  }
}

function sb(path: string, init: RequestInit = {}) {
  const key = process.env.SUPABASE_SERVICE_KEY || "";
  return fetch(SUPA + "/rest/v1/" + path, {
    ...init,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = req.headers.get("authorization") || "";
  const key = url.searchParams.get("key");
  const secret = process.env.CRON_SECRET;
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const stRes = await sb("video_watch?select=*");
  const states: any[] = stRes.ok ? await stRes.json() : [];
  const out: any[] = [];

  for (const t of TARGETS) {
    const r = await probe(t.base);
    const prev = states.find((s) => s.key === t.key) || { key: t.key, down: false, since: null, last_alert: null };
    const wasDown = !!prev.down;
    let alert: string | null = null;

    if (!r.ok && !wasDown) {
      alert = `🔴 *VSL: vídeo fora do ar*\n${t.label}\nMotivo: ${r.detail}\n${now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}\n\nA página cai pra outra origem sozinha, mas confere.`;
    } else if (!r.ok && wasDown) {
      const last = prev.last_alert ? new Date(prev.last_alert).getTime() : 0;
      if (now.getTime() - last > REALERT_MIN * 60 * 1000) {
        const mins = prev.since ? Math.round((now.getTime() - new Date(prev.since).getTime()) / 60000) : 0;
        alert = `🔴 *VSL: ${t.label} continua fora* há ${mins} min\nMotivo: ${r.detail}`;
      }
    } else if (r.ok && wasDown) {
      const mins = prev.since ? Math.round((now.getTime() - new Date(prev.since).getTime()) / 60000) : 0;
      alert = `🟢 *VSL: ${t.label} voltou* (ficou ${mins} min fora)\nResposta: ${r.detail}`;
    }

    if (alert) await sendAlert(alert);

    const row = {
      key: t.key,
      down: !r.ok,
      since: !r.ok ? (wasDown ? prev.since : now.toISOString()) : null,
      last_alert: alert ? now.toISOString() : prev.last_alert || null,
      last_check: now.toISOString(),
      detail: r.detail,
    };
    await sb("video_watch", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(row) });
    out.push({ ...row, alerted: !!alert });
  }

  return NextResponse.json({ ok: true, checked_at: now.toISOString(), targets: out });
}
