"use client";

import { useEffect, useRef, useState } from "react";
import {
  HERO_FRAME_COUNT,
  HERO_FRAME_PATH,
  LOADING_FPS,
  LOADING_FRAME_COUNT,
  LOADING_FRAME_PATH,
} from "@/lib/content";

// フルスクリーンのオープニング演出。public/frames/taro-hanako/ の120枚
// （taro&hanako.mp4由来）を時間ベースで一度だけ再生し、そのままHeroセクション
// （public/frames/hero-sample/）へフェードで引き継ぐ。
// 元実装（結婚式_招待状/実装/frontend-3d）の透過フレーム版と異なり、本サンプルの
// 素材は不透明なJPGのため、透過合成は行わずキャンバスに素材をそのまま描画する。
// Hero側のフレームもここで並行プリロードしておくことで、演出が終わった直後に
// Hero.tsx側の「LOADING」表示が一瞬で解決し、途切れなく本編へつながる。
export function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [framesReady, setFramesReady] = useState(false);
  const [heroFramesReady, setHeroFramesReady] = useState(false);
  const [playbackDone, setPlaybackDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [progress, setProgress] = useState(0);

  // 演出中はスクロールを止める。
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // 自分の120枚 ＋ Heroの120枚を並行プリロードする。
  useEffect(() => {
    let cancelled = false;
    const total = LOADING_FRAME_COUNT + HERO_FRAME_COUNT;
    let loadedCount = 0;
    let loadingDone = 0;
    let heroDone = 0;

    function bump() {
      loadedCount++;
      if (!cancelled) setProgress(loadedCount / total);
    }

    const loadingImages: HTMLImageElement[] = [];
    for (let i = 1; i <= LOADING_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = LOADING_FRAME_PATH(i);
      img.onload = img.onerror = () => {
        loadingDone++;
        bump();
        if (loadingDone >= LOADING_FRAME_COUNT && !cancelled) setFramesReady(true);
      };
      loadingImages[i - 1] = img;
    }
    framesRef.current = loadingImages;

    for (let i = 1; i <= HERO_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = HERO_FRAME_PATH(i);
      img.onload = img.onerror = () => {
        heroDone++;
        bump();
        if (heroDone >= HERO_FRAME_COUNT && !cancelled) setHeroFramesReady(true);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // フレームが揃い次第、時間ベースで一度だけ再生する。
  useEffect(() => {
    if (!framesReady) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      setPlaybackDone(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    function drawFrame(img: HTMLImageElement) {
      const cw = canvas!.width;
      const ch = canvas!.height;
      // 画面いっぱいには広げず、タイトルカードとして中央に収まる
      // サイズ（幅・高さとも最大70%）に縮小して表示する。
      const maxW = cw * 0.7;
      const maxH = ch * 0.7;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx!.clearRect(0, 0, cw, ch);
      ctx!.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    if (prefersReducedMotion) {
      const last = framesRef.current[LOADING_FRAME_COUNT - 1];
      if (last) drawFrame(last);
      setPlaybackDone(true);
      return () => window.removeEventListener("resize", resize);
    }

    let frameIndex = 0;
    let lastTime = performance.now();
    const frameDurationMs = 1000 / LOADING_FPS;
    let rafId = 0;

    function tick(now: number) {
      if (now - lastTime >= frameDurationMs) {
        lastTime = now;
        const img = framesRef.current[frameIndex];
        if (img) drawFrame(img);
        frameIndex++;
        if (frameIndex >= LOADING_FRAME_COUNT) {
          setPlaybackDone(true);
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [framesReady]);

  // 再生完了 かつ Heroフレームのプリロード完了の両方が揃ったらフェードアウト。
  useEffect(() => {
    if (!playbackDone || !heroFramesReady) return;
    const t = setTimeout(() => setFadingOut(true), 250);
    return () => clearTimeout(t);
  }, [playbackDone, heroFramesReady]);

  useEffect(() => {
    if (!fadingOut) return;
    const t = setTimeout(() => setRemoved(true), 700);
    return () => clearTimeout(t);
  }, [fadingOut]);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 ease-out ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--dark)" }}
      aria-hidden={fadingOut}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          framesReady ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-16 flex flex-col items-center transition-opacity duration-500 ${
          framesReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-[var(--gold)] transition-[width] duration-150 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
