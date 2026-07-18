"use client";

import {
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
  const [contentPageCount, setContentPageCount] = useState(1);
  const [columnStride, setColumnStride] = useState(1);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheelLocked = useRef(false);
  const previousZoneRef = useRef<HTMLButtonElement | null>(null);
  const nextZoneRef = useRef<HTMLButtonElement | null>(null);
  const columnViewportRef = useRef<HTMLDivElement | null>(null);
  const columnContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const restored = saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
      const params = new URLSearchParams(window.location.search);
      const requestedChapter = params.get("chapter");
      const requestedPage = Number.parseInt(params.get("page") ?? "", 10);
      const requestedFontSize = Number.parseInt(params.get("fontSize") ?? "", 10);
      const requestedTheme = params.get("theme");
      setState({
        ...restored,
        chapter: chapters.some((item) => item.id === requestedChapter)
          ? requestedChapter!
          : restored.chapter,
        page: Number.isFinite(requestedPage) && requestedPage >= 0
          ? requestedPage
          : restored.page,
        fontSize: Number.isFinite(requestedFontSize)
          ? Math.min(24, Math.max(15, requestedFontSize))
          : restored.fontSize,
        theme: requestedTheme === "white" || requestedTheme === "paper" || requestedTheme === "dark"
          ? requestedTheme
          : restored.theme,
      });
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
    const update = () => {
      setCompact(window.innerWidth < 760 || window.innerHeight < 700);
      setLayoutVersion((version) => version + 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const chapterIndex = Math.max(0, chapters.findIndex((item) => item.id === state.chapter));
  const chapter = chapters[chapterIndex];
  const totalPages = contentPageCount + 1;
  const safePage = Math.min(state.page, totalPages - 1);
  const navigationRef = useRef({ safePage, totalPages, chapterIndex, chapter });
  navigationRef.current = { safePage, totalPages, chapterIndex, chapter };

  const chapterFraction = totalPages > 1 ? safePage / (totalPages - 1) : 0;
  const progress = Math.round(((chapterIndex + chapterFraction) / chapters.length) * 100);

  const partGroups = useMemo(
    () =>
      chapters.reduce<Record<string, typeof chapters>>((groups, item) => {
        (groups[item.part] ||= []).push(item);
        return groups;
      }, {}),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      const viewport = columnViewportRef.current;
      const content = columnContentRef.current;
      if (!viewport || !content) return;
      const width = Math.max(1, Math.floor(viewport.clientWidth));
      content.style.setProperty("--column-width", `${width}px`);
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        const pageBoundaries = Array.from(
          content.querySelectorAll<HTMLElement>(":scope > figure, :scope > aside, :scope > section, :scope > div"),
        );
        pageBoundaries.forEach((element) => element.style.removeProperty("zoom"));
        pageBoundaries.forEach((element) => {
          if (element.offsetHeight > viewport.clientHeight) {
            const scale = (viewport.clientHeight * 0.97) / element.offsetHeight;
            element.style.setProperty("zoom", scale.toFixed(4));
          }
        });

        window.requestAnimationFrame(() => {
          if (cancelled) return;
          const pages = Math.max(1, Math.round(content.scrollWidth / width));
          const stride = content.scrollWidth / pages;
          setContentPageCount(pages);
          setColumnStride(stride);
          setState((current) => ({
            ...current,
            page: Math.min(current.page, pages),
          }));
        });
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [chapter.id, compact, layoutVersion, state.fontSize, state.theme]);

  useEffect(() => {
    const viewport = columnViewportRef.current;
    if (!viewport || safePage === 0) return;
    viewport.scrollLeft = (safePage - 1) * columnStride;
  }, [columnStride, safePage]);

  function goToChapter(id: string) {
    setState((current) => ({ ...current, chapter: id, page: 0 }));
    setMenuOpen(false);
    setSettingsOpen(false);
  }

  function nextPage() {
    const currentNavigation = navigationRef.current;
    if (currentNavigation.safePage < currentNavigation.totalPages - 1) {
      setState((current) => ({ ...current, page: currentNavigation.safePage + 1 }));
      return;
    }
    setState((current) => ({
      ...current,
      completed: current.completed.includes(currentNavigation.chapter.id)
        ? current.completed
        : [...current.completed, currentNavigation.chapter.id],
      chapter: chapters[currentNavigation.chapterIndex + 1]?.id ?? current.chapter,
      page: chapters[currentNavigation.chapterIndex + 1] ? 0 : currentNavigation.safePage,
    }));
  }

  function previousPage() {
    const currentNavigation = navigationRef.current;
    if (currentNavigation.safePage > 0) {
      setState((current) => ({ ...current, page: currentNavigation.safePage - 1 }));
      return;
    }
    const previous = chapters[currentNavigation.chapterIndex - 1];
    if (!previous) return;
    setState((current) => ({
      ...current,
      chapter: previous.id,
      page: Number.MAX_SAFE_INTEGER,
    }));
  }

  useEffect(() => {
    const previousZone = previousZoneRef.current;
    const nextZone = nextZoneRef.current;
    if (!previousZone || !nextZone) return;
    previousZone.addEventListener("click", previousPage);
    nextZone.addEventListener("click", nextPage);
    return () => {
      previousZone.removeEventListener("click", previousPage);
      nextZone.removeEventListener("click", nextPage);
    };
  });

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
      data-reader
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
                  <button data-chapter-link type="button" key={item.id} onClick={() => goToChapter(item.id)} className={active ? styles.chapterActive : ""}>
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
        <button ref={previousZoneRef} data-page-previous type="button" className={`${styles.pageZone} ${styles.pageZoneLeft}`} aria-label="Página anterior">
          <span>‹</span>
        </button>

        <article className={`${styles.paperPage} ${safePage === 0 ? styles.titlePage : ""}`} key={chapter.id}>
          {safePage === 0 && (
            <div className={styles.pageTitle}>
              <span>{chapter.part}</span>
              {chapter.number && <small>CAPÍTULO {String(chapter.number).padStart(2, "0")}</small>}
              <h1>{chapter.title}</h1>
              <p>{chapter.eyebrow}</p>
              <i />
              <em>Deslize para continuar</em>
            </div>
          )}
          <div className={styles.runningHeader}>
            <span>FLUENCY SECRETS</span>
            <span>{chapter.title}</span>
          </div>
          <div data-column-viewport ref={columnViewportRef} className={styles.columnViewport}>
            <div
              data-column-content
              ref={columnContentRef}
              className={`${styles.prosePage} ${styles.columnContent}`}
            >
              {chapter.content}
            </div>
          </div>
        </article>

        <button ref={nextZoneRef} data-page-next type="button" className={`${styles.pageZone} ${styles.pageZoneRight}`} aria-label="Próxima página">
          <span>›</span>
        </button>
      </section>

      <footer className={styles.kindleFooter}>
        <span>{progress}%</span>
        <button data-page-indicator type="button" onClick={() => setMenuOpen(true)}>
          PÁGINA {safePage + 1} DE {totalPages}
        </button>
        <span>{chapter.readingTime} MIN</span>
        <div className={styles.footerProgress}><i style={{ width: `${progress}%` }} /></div>
      </footer>
    </main>
  );
}
