"use client";

import { useEffect, useRef, useState } from "react";
import { CONTENT, HERO_FRAME_COUNT, HERO_FRAME_PATH, LOADING_TITLE_CUTOUT_SRC } from "@/lib/content";

// スクロールに連動して連番フレーム（public/frames/hero-sample/）を再生する
// 演出。実装は結婚式_招待状/実装/frontend-3d の Hero.tsx を踏襲している。
// タイトル文言（WEDDING INVITATION／新郎新婦名／日付）は焼き込み画像ではなく
// HTMLテキストで重ねているため、案件ごとの差し替え（content.ts編集のみ）が容易。
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const tickingRef = useRef(false);

  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // 全フレームのプリロードが完了するまで再生を許可しない。未読込のまま
  // スクロールするとキャンバスが空白になり破綻して見えるため、100%到達を
  // 条件にし、それまでは進捗を表示する。
  useEffect(() => {
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 1; i <= HERO_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = HERO_FRAME_PATH(i);
      img.onload = () => {
        loadedCount++;
        setLoadProgress(loadedCount / HERO_FRAME_COUNT);
        if (loadedCount === HERO_FRAME_COUNT) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === HERO_FRAME_COUNT) setLoaded(true);
      };
      imgs.push(img);
    }
    framesRef.current = imgs;
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      // devicePixelRatioをそのまま使うとProMotion端末等でcanvasの実解像度が
      // 過大になり、drawImageのコストが跳ね上がってスクロール中にカクつく
      // 原因になるため上限を設ける。
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(currentFrameRef.current);
    };

    const drawFrame = (index: number) => {
      const img = framesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      // 素材が縦長（1080x1920）でスマートフォンの画面比率に近いため、
      // object-fit: coverと同じ中央クロップで大半の端末で自然に収まる。
      let drawW: number;
      let drawH: number;
      if (canvasRatio > imgRatio) {
        drawW = cw;
        drawH = cw / imgRatio;
      } else {
        drawH = ch;
        drawW = ch * imgRatio;
      }

      const drawX = (cw - drawW) / 2;
      const drawY = (ch - drawH) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    const update = () => {
      tickingRef.current = false;
      const rect = section.getBoundingClientRect();
      const scrollableHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(1, scrollableHeight))
      );

      const frameIndex = Math.min(
        HERO_FRAME_COUNT - 1,
        Math.floor(progress * HERO_FRAME_COUNT)
      );
      // フレームが変わっていない微小スクロールでは再描画しない
      // （同じ画像への無駄なdrawImageを減らしてスクロール中の負荷を下げる）。
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }

      if (heroTextRef.current) {
        // フェードでは消さず、スクロールに合わせてそのまま上へ抜けていく。
        const moveProgress = Math.min(1, progress / 0.3);
        heroTextRef.current.style.transform = `translateY(${
          -moveProgress * window.innerHeight
        }px)`;
      }
      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = String(
          Math.max(0, 1 - progress / 0.05)
        );
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    resizeCanvas();
    update();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", onScroll);
    };
  }, [loaded]);

  return (
    <section ref={sectionRef} className="hero-scroll-stage relative">
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-[var(--dark)]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/50" />

        {!loaded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[var(--dark)]">
            <span className="font-en text-sm tracking-[0.35em] text-[var(--text-on-dark-soft)]">
              LOADING
            </span>
            <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full bg-[var(--gold)] transition-[width] duration-150 ease-out"
                style={{ width: `${Math.round(loadProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div ref={heroTextRef} className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 text-center text-[var(--text-on-dark)]">
          <span className="font-en text-[10px] tracking-[0.35em] sm:text-xs sm:tracking-[0.5em]">
            WEDDING INVITATION
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOADING_TITLE_CUTOUT_SRC}
            alt={`${CONTENT.groom.heroName} & ${CONTENT.bride.heroName}`}
            className="w-48 sm:w-56 md:w-64"
          />
          <span className="font-en text-sm tracking-[0.3em] md:text-base">
            {CONTENT.weddingDateLabel}
          </span>
        </div>

        <div
          ref={scrollCueRef}
          className="pointer-events-none absolute bottom-9 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="font-en text-sm font-medium tracking-[0.45em] text-[var(--text-on-dark)]">
            SCROLL
          </span>
          <div className="h-10 w-[2px] animate-pulse bg-[var(--gold)]" />
        </div>
      </div>
    </section>
  );
}
