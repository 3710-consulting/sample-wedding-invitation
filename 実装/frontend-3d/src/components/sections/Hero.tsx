"use client";

import { motion } from "framer-motion";
import { CONTENT } from "@/lib/content";
import { PlaceholderPhoto } from "@/components/ui/PlaceholderPhoto";

// フル演出版（Three.js/連番フレームによるスクロール連動の3D演出）は
// 実写素材（挙式当日の動画から書き出す専用フレーム）が必要で、案件ごとに
// 個別制作するオプションとする。サンプルサイトでは静的な1枚構成のヒーローを
// 標準搭載とする。
export function Hero() {
  return (
    <section className="relative flex h-dvh w-full items-center justify-center overflow-hidden">
      <PlaceholderPhoto dark label="ヒーロー写真" className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/55" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-5 px-6 text-center text-[var(--text-on-dark)]"
      >
        <span className="font-en text-[10px] tracking-[0.35em] sm:text-xs sm:tracking-[0.5em]">
          WEDDING INVITATION
        </span>
        <h1 className="font-en text-4xl tracking-[0.05em] sm:text-5xl md:text-6xl">
          {CONTENT.groom.heroName} &amp; {CONTENT.bride.heroName}
        </h1>
        <span className="font-en text-sm tracking-[0.3em] md:text-base">
          {CONTENT.weddingDateLabel}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="pointer-events-none absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-en text-sm font-medium tracking-[0.45em] text-[var(--text-on-dark)]">
          SCROLL
        </span>
        <div className="h-10 w-[2px] animate-pulse bg-[var(--gold)]" />
      </motion.div>
    </section>
  );
}
