"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";

// ページ下部に常時追従し、主要セクションへワンタップで移動できるクイック
// ナビゲーション。ヒーロー演出は`.hero-scroll-stage`（300〜400vh、画面3〜4枚分）
// をスクロールし切るまで再生され続けるため、固定のスクロール量（画面高さの
// 60%など）を閾値にすると、ヒーローがまだ再生中のうちにこのナビが被って
// 表示されてしまう。GREETINGセクション（ヒーロー演出の後の最初のセクション）
// が画面下から見え始めるタイミングを閾値にすることで、常にヒーロー演出が
// 完全に終わってからフェードインするようにする。
export function BottomNav() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    let showThreshold = window.innerHeight * 0.6;

    const measure = () => {
      const greeting = document.getElementById("greeting");
      if (greeting) {
        showThreshold = greeting.getBoundingClientRect().top + window.scrollY - window.innerHeight;
      }
    };
    const update = () => {
      tickingRef.current = false;
      setVisible(window.scrollY > showThreshold);
    };
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -16 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          aria-label="クイックナビゲーション"
          className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 px-3 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="ページの先頭へ戻る"
            className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[4px] border border-[var(--line)] bg-[var(--background)]/95 shadow-[0_2px_12px_rgba(0,0,0,0.15)] backdrop-blur-sm"
          >
            <span aria-hidden className="text-base leading-none">
              ▲
            </span>
            <span className="font-en text-[9px] tracking-[0.15em] text-[var(--muted)]">TOP</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToId("rsvp")}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[4px] border border-[var(--line)] bg-[var(--background)]/95 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)] backdrop-blur-sm"
          >
            <span className="font-en text-sm tracking-[0.15em]">RSVP</span>
            <span className="text-[11px] text-[var(--muted)]">御出欠</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToId("venue")}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[4px] bg-[var(--dark)] py-1.5 text-[var(--text-on-dark)] shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
          >
            <span className="font-en text-sm tracking-[0.15em]">INFORMATION</span>
            <span className="text-[11px] text-[var(--text-on-dark-soft)]">会場情報</span>
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
