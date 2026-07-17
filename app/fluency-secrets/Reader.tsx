"use client";

import { useEffect, useMemo, useState } from "react";
import { chapters } from "./content";
import styles from "./reader.module.css";

const STORAGE_KEY = "fs_reader_state_v1";

type ReaderState = {
  chapter: string;
  completed: string[];
  fontSize: number;
  dark: boolean;
};

const initialState: ReaderState = {
  chapter: chapters[0].id,
  completed: [],
  fontSize: 19,
  dark: false,
};

function Icon({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.iconButton} ${active ? styles.iconButtonActive : ""}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function Reader() {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...initialState, ...JSON.parse(saved) });
    } catch {
      // The reader still works when storage is unavailable.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const chapterIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === state.chapter),
  );
  const chapter = chapters[chapterIndex];
  const progress = Math.round((state.completed.length / chapters.length) * 100);

  const partGroups = useMemo(() => {
    return chapters.reduce<Record<string, typeof chapters>>((groups, item) => {
      (groups[item.part] ||= []).push(item);
      return groups;
    }, {});
  }, []);

  function goToChapter(id: string) {
    setState((current) => ({ ...current, chapter: id }));
    setMenuOpen(false);
    setVideoOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeAndAdvance() {
    const completed = state.completed.includes(chapter.id)
      ? state.completed
      : [...state.completed, chapter.id];
    const next = chapters[chapterIndex + 1];
    setState((current) => ({
      ...current,
      completed,
      chapter: next?.id ?? current.chapter,
    }));
    if (next) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main
      className={`${styles.reader} ${state.dark ? styles.dark : ""}`}
      style={{ "--reader-font-size": `${state.fontSize}px` } as React.CSSProperties}
    >
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>FS</span>
          <div>
            <strong>FLUENCY SECRETS</strong>
            <small>EDIÇÃO DIGITAL</small>
          </div>
        </div>

        <div className={styles.progressWrap} aria-label={`${progress}% do livro concluído`}>
          <div className={styles.progressMeta}>
            <span>{String(chapterIndex + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span>
            <span>{progress}% CONCLUÍDO</span>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={styles.tools}>
          <Icon label="Diminuir fonte" onClick={() => setState((s) => ({ ...s, fontSize: Math.max(16, s.fontSize - 1) }))}>
            <span className={styles.smallA}>A</span>
          </Icon>
          <Icon label="Aumentar fonte" onClick={() => setState((s) => ({ ...s, fontSize: Math.min(24, s.fontSize + 1) }))}>
            <span className={styles.largeA}>A</span>
          </Icon>
          <Icon label={state.dark ? "Ativar modo claro" : "Ativar modo escuro"} active={state.dark} onClick={() => setState((s) => ({ ...s, dark: !s.dark }))}>
            {state.dark ? "☀" : "◐"}
          </Icon>
          <Icon label="Abrir índice" active={menuOpen} onClick={() => setMenuOpen(true)}>
            ☰
          </Icon>
        </div>
      </header>

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <div>
            <small>SUMÁRIO</small>
            <strong>Sua rota de leitura</strong>
          </div>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar índice">×</button>
        </div>
        <nav>
          {Object.entries(partGroups).map(([part, items]) => (
            <section key={part} className={styles.partGroup}>
              <h2>{part}</h2>
              {items.map((item) => {
                const active = item.id === chapter.id;
                const done = state.completed.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => goToChapter(item.id)}
                    className={active ? styles.chapterActive : ""}
                  >
                    <span className={done ? styles.done : ""}>{done ? "✓" : item.number ?? "P"}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.readingTime} min de leitura</small>
                    </div>
                  </button>
                );
              })}
            </section>
          ))}
        </nav>
      </aside>

      {menuOpen && <button className={styles.backdrop} aria-label="Fechar índice" onClick={() => setMenuOpen(false)} />}

      <article className={styles.book}>
        <div className={styles.chapterHeader}>
          <p>{chapter.part}</p>
          <span>{chapter.eyebrow}</span>
          <h1>{chapter.title}</h1>
          <div className={styles.chapterMeta}>
            <span>{chapter.readingTime} MIN DE LEITURA</span>
            <button type="button" onClick={() => setVideoOpen((value) => !value)}>
              <i>▶</i> {videoOpen ? "VOLTAR AO TEXTO" : "ASSISTIR À AULA"}
            </button>
          </div>
        </div>

        {videoOpen ? (
          <section className={styles.videoPlaceholder}>
            <div>▶</div>
            <span>AULA DO CAPÍTULO</span>
            <h2>{chapter.title}</h2>
            <p>Este espaço está preparado para receber a aula gravada deste capítulo.</p>
          </section>
        ) : (
          <div className={styles.prose}>{chapter.content}</div>
        )}

        <footer className={styles.chapterFooter}>
          <div>
            {chapterIndex > 0 && (
              <button type="button" className={styles.previous} onClick={() => goToChapter(chapters[chapterIndex - 1].id)}>
                <span>←</span>
                <small>ANTERIOR</small>
                <strong>{chapters[chapterIndex - 1].title}</strong>
              </button>
            )}
          </div>
          <button type="button" className={styles.next} onClick={completeAndAdvance}>
            <small>{chapterIndex === chapters.length - 1 ? "MARCAR COMO CONCLUÍDO" : "CONCLUIR E CONTINUAR"}</small>
            <strong>{chapterIndex === chapters.length - 1 ? "Finalizar parte disponível" : chapters[chapterIndex + 1].title}</strong>
            <span>→</span>
          </button>
        </footer>
      </article>

      <button type="button" className={styles.mobileContents} onClick={() => setMenuOpen(true)}>
        <span>☰</span> SUMÁRIO
      </button>
    </main>
  );
}

