/* ═══════════════════════════════════════════════════════════════════════════
   SERIES TRAINING — o "Netflix trick" dentro do app (23/11/2026).
   Cenas REAIS de Money Heist, Elite e Narcos (clipes curtos, uso educacional), uma fala por cena:
   - LISTENING: assiste sem legenda, repete, liga ES (palavra a palavra) e EN, dá a nota → revisão espaçada (SM-2,
     a mesma do app de inglês: didn't get it = now · hard = 1d · got it = 1d · easy = 3d).
   - SPEAKING (shadowing): ouve a fala original, grava a sua, a IA (Azure) dá nota geral e por palavra.
   - EARBUDS MODE: áudio do episódio com cada cena repetida 3×, toca com a tela desligada (lock screen).
   - SCRIPT: roteiro completo do episódio em espanhol e inglês.
   Estado em ST.ser (vai junto no sync da conta). Dados em /es-series.json (gerado por ~/netflix-trick/produto/processa.mjs).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const DAYMS = 86400000;
  let DATA = null, loading = null;
  const SER_IMG = { moneyheist: "/spanish-series/moneyheist.jpg", elite: "/spanish-series/elite.jpg", narcos: "/spanish-series/narcos.jpg" };
  const $ = (id) => document.getElementById(id);
  const pl = (n, w) => n + " " + w + (n === 1 ? "" : "s");
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ── estado ──
  function S() { if (!ST.ser) ST.ser = { d: {}, ear: 0, pos: {} }; if (!ST.ser.d) ST.ser.d = {}; if (!ST.ser.pos) ST.ser.pos = {}; return ST.ser; }
  const deck = (mode, epId, cria) => { const s = S(); const k = mode + ":" + epId; if (!s.d[k]) { if (!cria) return {}; s.d[k] = {}; } return s.d[k]; }; // só cria o baralho quando há nota (leitura não suja o estado)
  const fresh = () => ({ e: 2.5, i: 0, r: 0, d: Date.now() });
  function schedule(c, g) {
    const n = { ...c };
    if (g === "again") { n.r = 0; n.i = 0; n.e = Math.max(1.3, c.e - 0.2); n.d = Date.now() + 60000; return n; }
    const q = g === "hard" ? 3 : g === "good" ? 4 : 5;
    n.e = Math.max(1.3, c.e + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    n.r = c.r + 1;
    if (n.r === 1) n.i = g === "easy" ? 3 : 1;
    else if (n.r === 2) n.i = g === "easy" ? 6 : g === "hard" ? 3 : 4;
    else n.i = Math.round(c.i * n.e * (g === "hard" ? 0.8 : 1) * (g === "easy" ? 1.3 : 1));
    n.i = Math.max(1, n.i); n.d = Date.now() + n.i * DAYMS; return n;
  }
  const preview = (c, g) => { if (g === "again") return "now"; const n = schedule(c || fresh(), g); return n.i + (n.i === 1 ? " day" : " days"); };
  const gradeFromScore = (s) => (s >= 80 ? "easy" : s >= 60 ? "good" : s >= 40 ? "hard" : "again");
  const maturity = (c) => Math.max(0, Math.min(100, Math.round((c.r === 0 ? 15 : c.r === 1 ? 45 : c.r === 2 ? 68 : c.r === 3 ? 84 : 95) + (c.e - 2.5) * 6)));
  function understood(ep) { const d = deck("ear", ep.id); let s = 0; for (const k in d) s += maturity(d[k]); return Math.round(s / Math.max(1, ep.scenes.length)); }
  function studied(mode, ep) { return Object.keys(deck(mode, ep.id)).length; }
  function dueIn(mode, ep) { const d = deck(mode, ep.id), now = Date.now(); let n = 0; for (const k in d) if (d[k].d <= now) n++; return n; }
  const allEps = () => (DATA ? DATA.series.flatMap((s) => s.episodes.map((e) => ({ s, e }))) : []);
  function totalDue() { return allEps().reduce((n, { e }) => n + dueIn("ear", e) + dueIn("talk", e), 0); }
  function goalDone() { return allEps().filter(({ e }) => understood(e) >= 80).length; }
  function grade(mode, ep, idx, g) {
    const d = deck(mode, ep.id, true); d[idx] = schedule(d[idx] || fresh(), g);
    if (mode === "ear" && g !== "again") S().ear = (S().ear || 0) + 1;
    try { markTrained(); } catch (e) {} save();
  }
  // próxima carta: vencida primeiro, depois a próxima nova em ordem
  function nextIdx(mode, ep, skip) {
    const d = deck(mode, ep.id), now = Date.now();
    let best = -1, bd = Infinity;
    for (const k in d) if (d[k].d <= now && +k !== skip && d[k].d < bd) { bd = d[k].d; best = +k; }
    if (best >= 0) return { idx: best, novo: false };
    for (let i = 0; i < ep.scenes.length; i++) if (!d[i] && i !== skip) return { idx: i, novo: true };
    return null;
  }

  async function load() {
    if (DATA) return DATA;
    if (!loading) loading = fetch("/es-series.json", { cache: "force-cache" }).then((r) => r.json()).then((j) => { try { const qb = new URLSearchParams(location.search).get("serbase"); if (qb) j.base = qb; } catch (e) {} return (DATA = j); });
    return loading;
  }
  window.serPreload = load;

  // ── estilos ──
  const css = `
  #ser{position:fixed;inset:0;z-index:60;background:var(--bg);overflow:auto;-webkit-overflow-scrolling:touch}
  #ser .sw{max-width:600px;margin:0 auto;padding:0 18px 120px}
  .sr-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:14px 2px 12px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(12px)}
  .sr-back{width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--panel);display:grid;place-items:center;font-size:20px;color:var(--ink)}
  .sr-tt b{display:block;font-size:17px;font-weight:700;letter-spacing:-.01em}.sr-tt span{font-size:12.5px;color:var(--accent);font-weight:700}
  .sr-h{font-size:26px;font-weight:800;letter-spacing:-.02em;margin:10px 0 4px}.sr-p{color:var(--ink-soft);font-size:14.5px;margin:0 0 16px}
  .sr-goal{border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:16px 16px 14px;margin:6px 0 16px}
  .sr-goal .k{margin-bottom:8px}.sr-goal b{font-size:19px}
  .sr-ep5{display:flex;gap:7px;margin-top:12px}.sr-ep5 i{flex:1;height:44px;border-radius:12px;border:1px solid var(--line);display:grid;place-items:center;font-style:normal;font-weight:800;font-size:13px;color:var(--muted)}
  .sr-ep5 i.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
  .sr-card{position:relative;display:block;width:100%;height:150px;border-radius:22px;overflow:hidden;margin:0 0 12px;text-align:left;box-shadow:var(--shadow-sm)}
  .sr-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .sr-card::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.05) 85%)}
  .sr-card div{position:absolute;left:18px;bottom:16px;z-index:2;color:#fff}.sr-card b{display:block;font-size:26px;font-weight:800;letter-spacing:-.02em}.sr-card span{font-size:13px;opacity:.85;font-weight:600}
  .sr-rev{display:flex;align-items:center;gap:14px;width:100%;padding:16px;border-radius:20px;border:1px solid var(--line);background:var(--panel);margin:0 0 14px;text-align:left}
  .sr-rev .ic{width:46px;height:46px;border-radius:14px;background:var(--accent-soft);display:grid;place-items:center;font-size:22px}.sr-rev b{display:block;font-size:16px}.sr-rev span{font-size:13px;color:var(--ink-soft)}
  .sr-ep{display:flex;align-items:center;gap:14px;width:100%;padding:14px;border-radius:18px;border:1px solid var(--line);background:var(--panel);margin:0 0 10px;text-align:left}
  .sr-ep .n{flex:0 0 48px;height:48px;border-radius:14px;background:var(--panel-2);display:grid;place-items:center;font-weight:800;font-size:17px;color:var(--accent-2)}
  .sr-ep .m{flex:1;min-width:0}.sr-ep b{display:block;font-size:16px}.sr-ep span{font-size:12.5px;color:var(--ink-soft)}
  .sr-bar{height:6px;border-radius:6px;background:var(--line);margin-top:8px;overflow:hidden}.sr-bar u{display:block;height:100%;background:var(--accent);border-radius:6px}
  .sr-due{min-width:24px;height:24px;padding:0 7px;border-radius:99px;background:#F5A524;color:#1b1200;font-size:12px;font-weight:800;display:grid;place-items:center}
  .sr-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0 12px}
  .sr-tab{padding:16px 12px;border-radius:18px;border:1px solid var(--line);background:var(--panel);text-align:left}.sr-tab b{display:block;font-size:16px;margin-top:4px}.sr-tab span{font-size:12.5px;color:var(--ink-soft)}
  .sr-tab.full{grid-column:1/-1}
  .sr-vid{position:relative;width:100%;aspect-ratio:16/9;border-radius:22px;overflow:hidden;background:#000;box-shadow:var(--shadow)}
  .sr-vid video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .sr-vid .cap{position:absolute;left:4%;right:4%;bottom:7%;text-align:center;font-weight:700;font-size:clamp(15px,4.3vw,21px);line-height:1.25;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.95)}
  .sr-vid .cap .w{color:rgba(255,255,255,.38);transition:color .08s}.sr-vid .cap .w.on{color:#fff}
  .sr-vid .cap .en{display:block;color:#FFD66B;font-size:.92em;margin-top:4px}
  .sr-vid .tap{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.35);color:#fff;font-weight:800;font-size:15px;letter-spacing:.04em}
  .sr-vid .tap i{width:66px;height:66px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;margin:0 auto 8px}
  .sr-vid .pb{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.2)}.sr-vid .pb u{display:block;height:100%;background:var(--accent)}
  .sr-lab{text-align:center;font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;color:var(--accent);margin:18px 0 10px}
  .sr-hint{text-align:center;color:var(--ink-soft);font-size:14px;margin:12px 0 14px}
  .sr-row{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}
  .sr-pill{padding:11px 18px;border-radius:99px;border:1px solid var(--line);background:var(--panel);font-weight:700;font-size:14.5px}
  .sr-pill.on{background:var(--accent-2);border-color:var(--accent-2);color:#fff}
  .sr-grades{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}
  .sr-g{padding:14px 8px;border-radius:18px;border:1.5px solid;font-weight:800;font-size:15px;text-align:center}.sr-g small{display:block;font-size:11.5px;font-weight:700;opacity:.75;margin-top:2px}
  .sr-g.again{border-color:#F04452;color:#F04452;background:rgba(240,68,82,.08)}.sr-g.hard{border-color:#F5A524;color:#F5A524;background:rgba(245,165,36,.08)}
  .sr-g.good{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}.sr-g.easy{border-color:#22B85F;color:#22B85F;background:rgba(34,184,95,.1)}
  .sr-nav{display:flex;justify-content:space-between;align-items:center;margin-top:16px;color:var(--ink-soft);font-weight:700;font-size:13.5px}
  .sr-nav button{padding:9px 14px;border-radius:99px;border:1px solid var(--line);background:var(--panel);font-weight:700;font-size:13.5px}
  .sr-line{font-size:22px;font-weight:800;text-align:center;line-height:1.3;margin:16px 6px 4px;letter-spacing:-.01em}.sr-line+.sr-en{text-align:center;color:var(--ink-soft);font-size:14.5px;margin-bottom:10px}
  .sr-mic{width:96px;height:96px;border-radius:50%;background:var(--accent-2);color:#fff;display:grid;place-items:center;margin:16px auto 8px;box-shadow:0 14px 30px rgba(124,92,255,.35)}
  .sr-mic.rec{animation:srp 1s ease-in-out infinite;background:#F04452}@keyframes srp{50%{transform:scale(1.07)}}
  .sr-res{border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:16px;margin-top:12px}
  .sr-done{text-align:center;padding:30px 10px}.sr-done b{display:block;font-size:24px;font-weight:800;margin:8px 0}
  .sr-script{border:1px solid var(--line);background:var(--panel);border-radius:16px;padding:12px 14px;margin:0 0 8px;display:flex;gap:12px;align-items:flex-start;text-align:left;width:100%}
  .sr-script b{display:block;font-size:15.5px;font-weight:700}.sr-script span{display:block;font-size:13.5px;color:var(--ink-soft);margin-top:2px}.sr-script i{font-style:normal;color:var(--accent);font-weight:800;flex:0 0 auto;padding-top:2px}
  .sr-ear{min-height:100vh;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:30px 6px}
  .sr-ear .big{font-size:clamp(24px,7vw,32px);font-weight:800;line-height:1.25;margin:18px 0 8px;letter-spacing:-.01em}.sr-ear .en{color:var(--ink-soft);font-size:15px}
  .sr-ear .cnt{font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:var(--accent)}
  .sr-play{width:84px;height:84px;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;margin:22px auto 10px;font-size:30px;font-weight:900}
  .sr-homeblk{display:block;width:100%;text-align:left;border-radius:22px;overflow:hidden;position:relative;margin:16px 0 4px;border:1px solid var(--line);background:var(--panel);box-shadow:var(--shadow-sm)}
  .sr-homeblk .ph{display:flex;height:96px}.sr-homeblk .ph img{flex:1;min-width:0;object-fit:cover;height:96px}
  .sr-homeblk .tx{padding:14px 16px 16px}.sr-homeblk .tx b{display:block;font-size:19px;font-weight:800;letter-spacing:-.01em;margin:4px 0 2px}.sr-homeblk .tx span{font-size:13.5px;color:var(--ink-soft)}
  `;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ── tela ──
  let root = null, view = null;
  function open() { if (!root) { root = document.createElement("div"); root.id = "ser"; document.body.appendChild(root); } root.classList.remove("hidden"); try { stopAudio(); } catch (e) {} }
  function close() { stopAll(); if (root) root.classList.add("hidden"); try { renderHome(); } catch (e) {} }
  function top(t, sub, back) {
    return `<div class="sr-top"><button class="sr-back" id="srBack">←</button><div class="sr-tt"><b>${esc(t)}</b>${sub ? `<span>${esc(sub)}</span>` : ""}</div></div>`;
  }
  function bindBack(fn) { const b = $("srBack"); if (b) b.onclick = () => { stopAll(); fn(); }; }

  // ── AULAS (o método em 5 lições curtas) ──
  const AULAS = [
    { t: "The Netflix trick in 2 minutes", b: ["Most people try to learn Spanish by watching whole seasons without understanding much. It works a little, but it's slow.", "Here we do the opposite: we shrink the language down to <b>one scene</b>. You repeat that one scene until you understand every word. Then the next one.", "Everyday conversation repeats the same words and phrases all the time, so every new scene is easier than the last. That's why episode 2 feels much easier than episode 1."] },
    { t: "How to do ear training", b: ["1. Watch the scene with <b>no subtitles</b>. Try to catch what you can.", "2. Tap <b>repeat</b> 2 or 3 times. Your ear starts separating the words.", "3. Turn on <b>ES</b> to see exactly what they said, word by word. Turn on <b>EN</b> only if you need the meaning.", "4. Watch once more with no subtitles, then rate yourself honestly. <b>didn't get it</b> brings the scene back in a minute; <b>easy</b> brings it back in 3 days."] },
    { t: "Why rating matters (spaced repetition)", b: ["Every scene you rate goes into your personal review schedule. Hard scenes come back sooner, easy scenes later.", "That's how a scene moves from short-term memory to the automatic part of your brain. Do your <b>daily review</b> first, then new scenes."] },
    { t: "Earbuds mode: train while you do other things", b: ["Earbuds mode plays the episode with each scene repeated 3 times. You can lock your screen and keep going while you drive, walk or cook.", "Don't translate in your head. Just listen. When you're busy with something else, your brain stops translating and starts acquiring the language."] },
    { t: "Speaking: shadowing with A.I.", b: ["Listen to the original line, then tap the mic and say it like the character: same rhythm, same melody.", "The A.I. scores your pronunciation and colors each word: green is good, yellow is close, red needs work. Repeat until the line flows.", "Use the same scenes you already trained by ear. Your ear and your mouth help each other."] },
  ];
  function aula(i) {
    view = "aula"; const a = AULAS[i];
    root.innerHTML = `<div class="sw">${top("Lesson " + (i + 1) + " of " + AULAS.length, "How to train")}<div class="sr-h">${a.t}</div>${a.b.map((p) => `<p style="font-size:16.5px;line-height:1.6;margin:0 0 14px">${p}</p>`).join("")}
      <div class="sr-row" style="margin-top:20px"><button class="sr-pill on" id="srNx">${i + 1 < AULAS.length ? "Next lesson ›" : "Start training ›"}</button></div></div>`;
    root.scrollTop = 0; bindBack(home);
    $("srNx").onclick = () => (i + 1 < AULAS.length ? aula(i + 1) : home());
    S().aulas = Math.max(S().aulas || 0, i + 1); save();
  }

  // ── LISTA DE SÉRIES ──
  async function home() {
    open(); view = "home";
    root.innerHTML = `<div class="sw">${top("Series training", "Netflix scenes · in Spanish")}<div class="sr-p">Loading your scenes…</div></div>`;
    bindBack(close);
    await load();
    const due = totalDue(), g = goalDone();
    let h = `<div class="sw">${top("Series training", "Netflix scenes · in Spanish")}
      <div class="sr-goal"><div class="k">Your first goal</div><b>Understand your first 5 episodes</b>
        <div class="sr-p" style="margin:4px 0 0">100% in Spanish, no subtitles. An episode counts when you understand 80%+ of its scenes.</div>
        <div class="sr-ep5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= g ? "on" : ""}">EP ${i}</i>`).join("")}</div></div>`;
    if (due) h += `<button class="sr-rev" id="srDue"><div class="ic">🔁</div><div><b>Daily review</b><span>${due} scene${due > 1 ? "s" : ""} due today · across all your episodes</span></div></button>`;
    DATA.series.forEach((s) => {
      const ear = s.episodes.reduce((n, e) => n + studied("ear", e), 0), tot = s.episodes.reduce((n, e) => n + e.scenes.length, 0);
      h += `<button class="sr-card" data-s="${s.id}"><img src="${SER_IMG[s.id] || ""}" alt=""><div><b>${esc(s.name)}</b><span>${s.episodes.length} episodes · ${tot} scenes${ear ? ` · ${ear} in your ear` : ""}</span></div></button>`;
    });
    h += `<div class="k" style="margin:22px 0 10px">Lessons · how to train</div>` + AULAS.map((a, i) => `<button class="sr-ep" data-a="${i}"><div class="n">${(S().aulas || 0) > i ? "✓" : i + 1}</div><div class="m"><b>${esc(a.t)}</b><span>${a.b.length} min read</span></div></button>`).join("");
    h += `<div class="sr-p" style="font-size:12.5px;margin-top:14px">Short scenes from the original shows, used for language training.</div></div>`;
    root.innerHTML = h; bindBack(close);
    root.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => aula(+b.dataset.a)));
    root.querySelectorAll(".sr-card").forEach((b) => (b.onclick = () => serie(b.dataset.s)));
    if ($("srDue")) $("srDue").onclick = () => revisao();
  }

  // ── EPISÓDIOS DE UMA SÉRIE ──
  function serie(sid) {
    const s = DATA.series.find((x) => x.id === sid); view = "serie";
    let h = `<div class="sw">${top(s.name, "Choose your episode")}`;
    s.episodes.forEach((e) => {
      const u = understood(e), ear = studied("ear", e), due = dueIn("ear", e) + dueIn("talk", e);
      h += `<button class="sr-ep" data-e="${e.id}"><div class="n">${String(e.n).padStart(2, "0")}</div><div class="m"><b>Episode ${e.n}</b>
        <span>${e.scenes.length} scenes · ${e.minutes} min${ear ? ` · ${ear} in your ear` : ""} · ${u}% understood</span><div class="sr-bar"><u style="width:${u}%"></u></div></div>${due ? `<div class="sr-due">${due}</div>` : ""}</button>`;
    });
    root.innerHTML = h + `</div>`; root.scrollTop = 0;
    bindBack(home);
    root.querySelectorAll(".sr-ep").forEach((b) => (b.onclick = () => episodio(sid, b.dataset.e)));
  }
  const findEp = (sid, eid) => { const s = DATA.series.find((x) => x.id === sid); return { s, e: s.episodes.find((x) => x.id === eid) }; };

  // ── UM EPISÓDIO: modos ──
  function episodio(sid, eid) {
    const { s, e } = findEp(sid, eid); view = "ep";
    const u = understood(e);
    root.innerHTML = `<div class="sw">${top(`${s.name} · Episode ${e.n}`, `${pl(studied("ear", e), "scene")} in your ear · ${u}% understood`)}
      <div class="sr-vid" style="margin:6px 0 14px"><video id="srPrev" muted playsinline preload="metadata" src="${DATA.base}${e.scenes[0].src}.mp4#t=${e.scenes[0].a}"></video></div>
      <div class="sr-tabs">
        <button class="sr-tab" id="srEar"><div class="k">Phase 1</div><b>👂 Ear training</b><span>Scene by scene, no subtitles${dueIn("ear", e) ? ` · ${dueIn("ear", e)} to review` : ""}</span></button>
        <button class="sr-tab" id="srTalk"><div class="k">Phase 2</div><b>🎙️ Speaking</b><span>Shadowing + A.I. feedback${dueIn("talk", e) ? ` · ${dueIn("talk", e)} to review` : ""}</span></button>
        <button class="sr-tab" id="srBuds"><div class="k">Anytime</div><b>🎧 Earbuds mode</b><span>Each scene 3×, screen off</span></button>
        <button class="sr-tab" id="srScript"><div class="k">Script</div><b>📄 Full script</b><span>Spanish + English</span></button>
      </div>
      <div class="sr-p">Tip: in ear training, watch first with no subtitles. Turn on ES only to check, then rate how much you got.</div></div>`;
    root.scrollTop = 0;
    bindBack(() => serie(sid));
    $("srEar").onclick = () => treino("ear", s, e);
    $("srTalk").onclick = () => treino("talk", s, e);
    $("srBuds").onclick = () => fone(s, e);
    $("srScript").onclick = () => script(s, e);
  }

  // ── player de cena (um <video> só, pula pra fala) ──
  let VID = null, RAF = 0, segEnd = 0, onSegEnd = null, curSrc = "";
  function stopAll() { cancelAnimationFrame(RAF); RAF = 0; if (VID) { try { VID.pause(); } catch (e) {} } if (BUDS) { try { BUDS.pause(); } catch (e) {} } onSegEnd = null; }
  async function playSeg(sc, rate, cb) {
    if (!VID) return;
    cancelAnimationFrame(RAF);
    const url = DATA.base + sc.src + ".mp4";
    if (curSrc !== url) { curSrc = url; VID.src = url; await new Promise((r) => { const ok = () => { VID.removeEventListener("loadedmetadata", ok); r(); }; VID.addEventListener("loadedmetadata", ok); setTimeout(r, 8000); }); }
    VID.playbackRate = rate || 1;
    try { VID.currentTime = sc.a; } catch (e) {}
    segEnd = sc.b; onSegEnd = cb || null;
    try { await VID.play(); } catch (e) { return false; }
    const tick = () => {
      if (!VID) return;
      if (VID.currentTime >= segEnd - 0.03) { VID.pause(); const f = onSegEnd; onSegEnd = null; if (f) f(); return; }
      if (window.__srCap) window.__srCap(VID.currentTime - sc.a);
      RAF = requestAnimationFrame(tick);
    };
    RAF = requestAnimationFrame(tick);
    return true;
  }

  // ── TREINO (ouvido ou fala), por episódio ou revisão mista ──
  function treino(mode, s, e, fila) {
    view = "treino";
    let cur = null, showES = false, showEN = false, rate = 1, hist = [];
    const fonte = fila || null; // revisão do dia: [{s,e,idx,mode}]
    root.innerHTML = `<div class="sw" id="srT"></div>`;
    const T = $("srT");
    function pega(skip) {
      if (fonte) { const x = fonte.shift(); return x ? { ...x, novo: false } : null; }
      const n = nextIdx(mode, e, skip); return n ? { s, e, idx: n.idx, novo: n.novo, mode } : null;
    }
    function render(c) {
      cur = c; stopAll(); showES = false; showEN = false; rate = 1;
      if (!c) {
        const u = e ? understood(e) : 0;
        T.innerHTML = `${top(fonte ? "Daily review" : `${s.name} · Episode ${e.n}`, "")}<div class="sr-done"><div style="font-size:44px">✓</div><b>${fonte ? "Review done for today" : "No more scenes for now"}</b>
          <div class="sr-p">${fonte ? "Come back tomorrow: the scenes you rated come back right when your memory needs them." : `${u}% of this episode understood. The scenes you rated come back on schedule. Use Earbuds mode to keep them in your ear.`}</div>
          <button class="sr-pill on" id="srOk">Back</button></div>`;
        bindBack(() => (fonte ? home() : episodio(s.id, e.id))); $("srOk").onclick = () => (fonte ? home() : episodio(s.id, e.id)); return;
      }
      const sc = c.e.scenes[c.idx], m = c.mode, dk = deck(m, c.e.id), stt = dk[c.idx];
      const sub = fonte ? `${c.s.name} · EP ${c.e.n}` : m === "ear" ? `${c.s.name} · ${pl(studied(m, c.e), "scene")} in your ear` : `${c.s.name} · ${pl(studied(m, c.e), "line")} spoken`;
      T.innerHTML = `${top(fonte ? "Daily review" : `Episode ${c.e.n} · ${m === "ear" ? "Ear training" : "Speaking"}`, sub)}
        <div class="sr-lab">${c.novo ? "New" : "Review"} · scene ${c.idx + 1}/${c.e.scenes.length}</div>
        <div class="sr-vid"><video id="srV" playsinline preload="auto"></video><div class="cap" id="srCap"></div><div class="pb"><u id="srPb" style="width:0"></u></div>
          <div class="tap" id="srTap"><div><i>▶</i>Tap to play the scene</div></div></div>
        ${m === "ear" ? `<div class="sr-hint" id="srHint">Watch with no subtitles and try to understand.</div>
          <div class="sr-row"><button class="sr-pill" id="srRep">🔁 repeat</button><button class="sr-pill" id="srES">ES</button><button class="sr-pill" id="srEN">EN</button><button class="sr-pill" id="srSlow">🐢 slower</button></div>
          <div class="sr-grades">${["again", "hard", "good", "easy"].map((g) => `<button class="sr-g ${g}" data-g="${g}">${{ again: "didn't get it", hard: "hard", good: "got it", easy: "easy" }[g]}<small>${preview(stt, g)}</small></button>`).join("")}</div>`
          : `<div class="sr-line">${esc(sc.es)}</div><div class="sr-en">${esc(sc.en)}</div>
          <div class="sr-row"><button class="sr-pill" id="srRep">🔊 hear original</button><button class="sr-pill" id="srSlow">🐢 slower</button></div>
          <button class="sr-mic" id="srMic"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg></button>
          <div class="sr-hint" id="srHint">Listen, then tap the mic and say the line like the character.</div><div id="srRes"></div>`}
        <div class="sr-nav"><button id="srPrevB">‹ previous</button><span>${c.idx + 1} / ${c.e.scenes.length}</span><button id="srNextB">next ›</button></div>`;
      T.parentElement && (root.scrollTop = 0);
      bindBack(() => (fonte ? home() : episodio(s.id, e.id)));
      VID = $("srV"); curSrc = "";
      const cap = $("srCap"), pb = $("srPb");
      const pinta = (t) => {
        pb.style.width = Math.min(100, (t / (sc.b - sc.a)) * 100) + "%";
        if (m !== "ear") { cap.innerHTML = ""; return; }
        let h = "";
        if (showES) h += sc.w.map((w) => `<span class="w ${t >= w[0] - 0.05 ? "on" : ""}">${esc(w[2])}</span>`).join(" ");
        if (showEN) h += `<span class="en">${esc(sc.en)}</span>`;
        cap.innerHTML = h;
      };
      window.__srCap = pinta;
      const toca = async () => { $("srTap").style.display = "none"; const ok = await playSeg(sc, rate, () => { pinta(sc.b - sc.a); }); if (ok === false) $("srTap").style.display = "grid"; };
      $("srTap").onclick = toca;
      $("srRep").onclick = toca;
      $("srSlow").onclick = () => { rate = rate === 1 ? 0.75 : 1; $("srSlow").classList.toggle("on", rate !== 1); toca(); };
      if (m === "ear") {
        $("srES").onclick = () => { showES = !showES; $("srES").classList.toggle("on", showES); $("srHint").textContent = showES ? "Now read what they actually said." : "Watch with no subtitles and try to understand."; pinta(sc.b - sc.a); toca(); };
        $("srEN").onclick = () => { showEN = !showEN; $("srEN").classList.toggle("on", showEN); pinta(sc.b - sc.a); };
        T.querySelectorAll(".sr-g").forEach((b) => (b.onclick = () => { grade(m, c.e, c.idx, b.dataset.g); hist.push(c); render(pega(c.idx)); }));
      } else {
        let busy = false, url = null;
        $("srMic").onclick = async () => {
          if (busy) return; busy = true; stopAll();
          const mic = $("srMic"); mic.classList.add("rec"); $("srHint").textContent = "Recording… say the line.";
          const wav = await pronRecord(Math.max(4000, (sc.b - sc.a) * 1000 + 3500));
          mic.classList.remove("rec");
          if (wav === "denied") { $("srHint").textContent = "Allow the microphone to train your speaking."; busy = false; return; }
          if (!wav) { $("srHint").textContent = "I didn't hear you. Tap the mic and try again."; busy = false; return; }
          $("srHint").textContent = "A.I. is checking your pronunciation…";
          const r = await pronAssess(wav, sc.es.replace(/[«»"]/g, ""), c.s.lang);
          busy = false;
          if (!r || r.silence) { $("srHint").textContent = "I couldn't catch it clearly. Try again, a little louder."; return; }
          try { ST.shadowed = (ST.shadowed || 0) + 1; ST.clarSum = (ST.clarSum || 0) + r.score; ST.clarN = (ST.clarN || 0) + 1; } catch (e) {}
          if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(wav);
          $("srHint").textContent = "";
          const g = gradeFromScore(r.score);
          $("srRes").innerHTML = `<div class="sr-res">${pronResultHtml(r, sc.es)}</div>
            <div class="sr-row" style="margin-top:12px"><button class="sr-pill" id="srAgain">🎙️ try again</button><button class="sr-pill on" id="srGo">next scene ›</button></div>`;
          const box = $("srRes");
          box.querySelectorAll(".abtn").forEach((b) => (b.onclick = () => { if (b.dataset.ab === "me") { stopAll(); const a = new Audio(url); a.play(); } else toca(); }));
          $("srAgain").onclick = () => { $("srRes").innerHTML = ""; $("srMic").click(); };
          $("srGo").onclick = () => { grade(m, c.e, c.idx, g); hist.push(c); render(pega(c.idx)); };
          save();
        };
      }
      $("srPrevB").onclick = () => { const p = hist.pop(); if (p) render(p); };
      $("srNextB").onclick = () => { hist.push(c); render(pega(c.idx)); };
      pinta(0);
      if (S().pos && !fonte) { S().pos[c.e.id] = c.idx; }
      toca(); // a cena já toca (o toque que abriu a tela vale como gesto)
    }
    render(pega(-1));
  }

  // ── REVISÃO DO DIA (mistura de todos os episódios) ──
  function revisao() {
    const now = Date.now(), fila = [];
    allEps().forEach(({ s, e }) => ["ear", "talk"].forEach((m) => { const d = deck(m, e.id); for (const k in d) if (d[k].d <= now) fila.push({ s, e, idx: +k, mode: m, due: d[k].d }); }));
    fila.sort((a, b) => a.due - b.due);
    if (!fila.length) return home();
    treino("ear", null, null, fila);
  }

  // ── SCRIPT ──
  function script(s, e) {
    view = "script";
    root.innerHTML = `<div class="sw">${top(`${s.name} · Episode ${e.n}`, "Full script · Spanish + English")}
      <div class="sr-vid" style="margin:6px 0 14px"><video id="srV" playsinline preload="metadata"></video><div class="cap" id="srCap"></div><div class="pb"><u id="srPb"></u></div></div>
      ${e.scenes.map((sc, i) => `<button class="sr-script" data-i="${i}"><i>${i + 1}</i><div><b>${esc(sc.es)}</b><span>${esc(sc.en)}</span></div></button>`).join("")}</div>`;
    root.scrollTop = 0; bindBack(() => episodio(s.id, e.id));
    VID = $("srV"); curSrc = "";
    root.querySelectorAll(".sr-script").forEach((b) => (b.onclick = () => {
      const sc = e.scenes[+b.dataset.i];
      window.__srCap = (t) => { $("srPb").style.width = Math.min(100, (t / (sc.b - sc.a)) * 100) + "%"; $("srCap").innerHTML = sc.w.map((w) => `<span class="w ${t >= w[0] - 0.05 ? "on" : ""}">${esc(w[2])}</span>`).join(" "); };
      root.scrollTo({ top: 0, behavior: "smooth" }); playSeg(sc, 1);
    }));
  }

  // ── EARBUDS MODE: áudio pré-montado do episódio (cada cena 3×), com a tela desligada ──
  let BUDS = null;
  function fone(s, e) {
    view = "fone";
    const L = e.loop; if (!L) return;
    root.innerHTML = `<div class="sw">${top(`${s.name} · Episode ${e.n}`, "Earbuds mode")}<div class="sr-ear">
      <div class="cnt" id="srEc">scene 1 of ${e.scenes.length}</div><div class="big" id="srEl">Put your earbuds in.</div><div class="en" id="srEe">Each scene plays 3 times. You can lock your screen.</div>
      <button class="sr-play" id="srEp">▶</button><div class="sr-p" id="srEn">${pl(S().ear || 0, "scene")} in your ear</div>
      <div class="sr-row" style="margin-top:10px"><button class="sr-pill" id="srEb">‹ scene</button><button class="sr-pill" id="srEf">scene ›</button></div>
      <label class="sr-p" style="display:flex;gap:8px;justify-content:center;align-items:center;margin-top:16px"><input type="checkbox" id="srEs"> show the text in Spanish</label></div></div>`;
    root.scrollTop = 0; bindBack(() => { stopAll(); episodio(s.id, e.id); });
    BUDS = BUDS || new Audio(); BUDS.preload = "auto";
    const src = DATA.base + L.file; if (BUDS.src !== src) BUDS.src = src;
    const start = (S().pos["buds:" + e.id] || 0);
    let lastScene = -1;
    const cena = (t) => { let k = 0; for (let i = 0; i < L.idx.length; i++) if (L.idx[i][0] <= t) k = i; else break; return k; };
    const showTxt = () => $("srEs").checked;
    BUDS.ontimeupdate = () => {
      const k = cena(BUDS.currentTime), it = L.idx[k], sc = e.scenes[it[2]];
      if (it[2] !== lastScene) {
        if (lastScene >= 0) { S().ear = (S().ear || 0) + 1; S().pos["buds:" + e.id] = it[0]; save(); }
        lastScene = it[2];
        $("srEc").textContent = `scene ${it[2] + 1} of ${e.scenes.length}`;
        $("srEl").textContent = showTxt() ? sc.es : "🎧";
        $("srEe").textContent = showTxt() ? sc.en : "Just listen. No translating.";
        $("srEn").textContent = `${pl(S().ear || 0, "scene")} in your ear`;
        if ("mediaSession" in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: `Scene ${it[2] + 1} · ${s.name}`, artist: `Episode ${e.n} · Fluency Route`, album: "Earbuds mode", artwork: [{ src: SER_IMG[s.id], sizes: "1280x720", type: "image/jpeg" }] });
      }
    };
    BUDS.onended = () => { S().pos["buds:" + e.id] = 0; save(); $("srEp").textContent = "▶"; };
    const playP = () => { if (BUDS.paused) { if (!BUDS.currentTime && start) BUDS.currentTime = start; BUDS.play(); $("srEp").textContent = "❚❚"; } else { BUDS.pause(); $("srEp").textContent = "▶"; } };
    $("srEp").onclick = playP;
    const pula = (d) => { const k = cena(BUDS.currentTime); let j = k; const alvo = L.idx[k][2] + d; while (j >= 0 && j < L.idx.length && L.idx[j][2] !== alvo) j += d > 0 ? 1 : -1; if (j >= 0 && j < L.idx.length) BUDS.currentTime = L.idx[j][0]; };
    $("srEb").onclick = () => pula(-1); $("srEf").onclick = () => pula(1);
    $("srEs").onchange = () => { lastScene = -1; BUDS.ontimeupdate(); };
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => { BUDS.play(); $("srEp").textContent = "❚❚"; });
      navigator.mediaSession.setActionHandler("pause", () => { BUDS.pause(); $("srEp").textContent = "▶"; });
      try { navigator.mediaSession.setActionHandler("nexttrack", () => pula(1)); navigator.mediaSession.setActionHandler("previoustrack", () => pula(-1)); } catch (e) {}
    }
  }

  // ── bloco da HOME do app ──
  window.serHomeHtml = function () {
    const g = DATA ? goalDone() : 0, due = DATA ? totalDue() : 0;
    return `<button class="sr-homeblk" id="serGo"><div class="ph"><img src="/spanish-series/moneyheist.jpg" alt=""><img src="/spanish-series/elite.jpg" alt=""><img src="/spanish-series/narcos.jpg" alt=""></div>
      <div class="tx"><div class="k">The Netflix trick · series training</div><b>Train your ear with real scenes</b><span>Money Heist, Elite and Narcos · first goal: ${g}/5 episodes${due ? ` · ${due} to review` : ""}</span></div></button>`;
  };
  window.serBindHome = function () { const b = $("serGo"); if (b) b.onclick = () => home(); if (!DATA) load().then(() => { try { renderHome(); } catch (e) {} }); };
  window.serOpen = home;
  window.serStats = function () { if (!DATA) return null; let ear = 0, talk = 0; allEps().forEach(({ e }) => { ear += studied("ear", e); talk += studied("talk", e); }); return { ear, talk }; };
})();
