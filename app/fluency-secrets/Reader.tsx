"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { chapters } from "./content";
import styles from "./reader.module.css";

const STORAGE_KEY = "fs_reader_state_v2";

type ReaderState = {
  chapter: string;
  page: number;
  completed: string[];
  fontSize: number;
  theme: "paper" | "white" | "dark";
};

const initialState: ReaderState = {
  chapter: chapters[0].id,
  page: 0,
  completed: [],
  fontSize: 18,
  theme: "paper",
};

function nodeWeight(node: ReactNode, compact: boolean) {
  if (!isValidElement(node)) return 0.5;
  const type = typeof node.type === "string" ? node.type : "";
  const props = node.props as { className?: string };
  if (type === "figure" || type === "aside" || type === "section") return compact ? 2.8 : 3.5;
  if (type === "div") return compact ? 2.6 : 3.2;
  if (props.className?.includes("lead")) return compact ? 1.7 : 1.5;
  return compact ? 1.15 : 1;
}

function paginate(content: ReactNode, compact: boolean) {
  const nodes = Children.toArray(content);
  const limit = compact ? 2.5 : 4.25;
  const pages: ReactNode[][] = [];
  let current: ReactNode[] = [];
  let weight = 0;

  for (const node of nodes) {
    const nextWeight = nodeWeight(node, compact);
    if (current.length && weight + nextWeight > limit) {
      pages.push(current);
      current = [];
      weight = 0;
    }
    current.push(node);
    weight += nextWeight;
    if (nextWeight >= limit) {
      pages.push(current);
      current = [];
      weight = 0;
    }
  }

  if (current.length) pages.push(current);
  return pages;
}

function Icon({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheelLocked = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...initialState, ...JSON.parse(saved) });
    } catch {
      // Reader remains usable when localStorage is unavailable.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    const update = () => setCompact(window.innerWidth < 760 || window.innerHeight < 700);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const chapterIndex = Math.max(0, chapters.findIndex((item) => item.id === state.chapter));
  const chapter = chapters[chapterIndex];
  const contentPages = useMemo(() => paginate(chapter.content, compact), [chapter.content, compact]);
  const totalPages = contentPages.length + 1;
  const safePage = Math.min(state.page, totalPages - 1);

  const absolutePagesBefore = useMemo(
    () => chapters.slice(0, chapterIndex).reduce((sum, item) => sum + paginate(item.content, compact).length + 1, 0),
    [chapterIndex, compact],
  );
  const totalBookPages = useMemo(
    () => chapters.reduce((sum, item) => sum + paginate(item.content, compact).length + 1, 0),
    [compact],
  );
  const absolutePage = absolutePagesBefore + safePage + 1;
  const progress = Math.round((absolutePage / totalBookPages) * 100);

  const partGroups = useMemo(
    () =>
      chapters.reduce<Record<string, typeof chapters>>((groups, item) => {
        (groups[item.part] ||= []).push(item);
        return groups;
      }, {}),
    [],
  );

  function goToChapter(id: string) {
    setState((current) => ({ ...current, chapter: id, page: 0 }));
    setMenuOpen(false);
    setSettingsOpen(false);
  }

  function nextPage() {
    if (safePage < totalPages - 1) {
      setState((current) => ({ ...current, page: safePage + 1 }));
      return;
    }
    const completed = state.completed.includes(chapter.id)
      ? state.completed
      : [...state.completed, chapter.id];
    const next = chapters[chapterIndex + 1];
    setState((current) => ({
      ...current,
      completed,
      chapter: next?.id ?? current.chapter,
      page: next ? 0 : safePage,
    }));
  }

  function previousPage() {
    if (safePage > 0) {
      setState((current) => ({ ...current, page: safePage - 1 }));
      return;
    }
    const previous = chapters[chapterIndex - 1];
    if (!previous) return;
    const previousPages = paginate(previous.content, compact).length + 1;
    setState((current) => ({
      ...current,
      chapter: previous.id,
      page: previousPages - 1,
    }));
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        nextPage();
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        previousPage();
      }
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function handleWheel(event: React.WheelEvent) {
    if (menuOpen || settingsOpen || wheelLocked.current) return;
    if (Math.abs(event.deltaY) < 22 && Math.abs(event.deltaX) < 22) return;
    wheelLocked.current = true;
    if (event.deltaY > 0 || event.deltaX > 0) nextPage();
    else previousPage();
    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 450);
  }

  function handleTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) nextPage();
    else previousPage();
  }

  return (
    <main
      className={`${styles.reader} ${styles[`theme_${state.theme}`]}`}
      style={{ "--reader-font-size": `${state.fontSize}px` } as React.CSSProperties}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className={styles.kindleBar}>
        <button type="button" className={styles.bookIdentity} onClick={() => setMenuOpen(true)}>
          <span className={styles.amazonArrow}>⌄</span>
          <div><strong>Fluency Secrets</strong><small>Marcos Lobão</small></div>
        </button>

        <div className={styles.kindleTools}>
          <Icon label="Índice" active={menuOpen} onClick={() => setMenuOpen(true)}>☰</Icon>
          <Icon label="Configurações de leitura" active={settingsOpen} onClick={() => setSettingsOpen((value) => !value)}>
            <span className={styles.aa}>Aa</span>
          </Icon>
          <Icon label="Alternar tema" onClick={() => setState((current) => ({
            ...current,
            theme: current.theme === "paper" ? "white" : current.theme === "white" ? "dark" : "paper",
          }))}>◐</Icon>
        </div>
      </header>

      {settingsOpen && (
        <aside className={styles.settingsPanel}>
          <strong>Configurações da página</strong>
          <span>Tamanho da fonte</span>
          <div className={styles.fontControl}>
            <button type="button" onClick={() => setState((s) => ({ ...s, fontSize: Math.max(15, s.fontSize - 1) }))}>A</button>
            <div><i style={{ width: `${((state.fontSize - 15) / 9) * 100}%` }} /></div>
            <button type="button" onClick={() => setState((s) => ({ ...s, fontSize: Math.min(24, s.fontSize + 1) }))}>A</button>
          </div>
          <span>Cor da página</span>
          <div className={styles.themeChoices}>
            {(["white", "paper", "dark"] as const).map((theme) => (
              <button
                type="button"
                key={theme}
                className={`${styles[`choice_${theme}`]} ${state.theme === theme ? styles.themeSelected : ""}`}
                onClick={() => setState((s) => ({ ...s, theme }))}
                aria-label={`Tema ${theme}`}
              >Aa</button>
            ))}
          </div>
        </aside>
      )}

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <div><small>CONTEÚDO</small><strong>Fluency Secrets</strong></div>
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
                  <button type="button" key={item.id} onClick={() => goToChapter(item.id)} className={active ? styles.chapterActive : ""}>
                    <span className={done ? styles.done : ""}>{done ? "✓" : item.number ?? "•"}</span>
                    <div><strong>{item.title}</strong><small>{item.readingTime} min</small></div>
                  </button>
                );
              })}
            </section>
          ))}
        </nav>
      </aside>

      {(menuOpen || settingsOpen) && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar painel"
          onClick={() => { setMenuOpen(false); setSettingsOpen(false); }}
        />
      )}

      <section className={styles.pageStage}>
        <button type="button" className={`${styles.pageZone} ${styles.pageZoneLeft}`} onClick={previousPage} aria-label="Página anterior">
          <span>‹</span>
        </button>

        <article className={`${styles.paperPage} ${safePage === 0 ? styles.titlePage : ""}`} key={`${chapter.id}-${safePage}`}>
          {safePage === 0 ? (
            <div className={styles.pageTitle}>
              <span>{chapter.part}</span>
              {chapter.number && <small>CAPÍTULO {String(chapter.number).padStart(2, "0")}</small>}
              <h1>{chapter.title}</h1>
              <p>{chapter.eyebrow}</p>
              <i />
              <em>Deslize para continuar</em>
            </div>
          ) : (
            <>
              <div className={styles.runningHeader}>
                <span>FLUENCY SECRETS</span>
                <span>{chapter.title}</span>
              </div>
              <div className={styles.prosePage}>{contentPages[safePage - 1]}</div>
            </>
          )}
        </article>

        <button type="button" className={`${styles.pageZone} ${styles.pageZoneRight}`} onClick={nextPage} aria-label="Próxima página">
          <span>›</span>
        </button>
      </section>

      <footer className={styles.kindleFooter}>
        <span>{progress}%</span>
        <button type="button" onClick={() => setMenuOpen(true)}>
          PÁGINA {absolutePage} DE {totalBookPages}
        </button>
        <span>{chapter.readingTime} MIN</span>
        <div className={styles.footerProgress}><i style={{ width: `${progress}%` }} /></div>
      </footer>
    </main>
  );
}
