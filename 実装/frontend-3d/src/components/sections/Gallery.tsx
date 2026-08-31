"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CONTENT } from "@/lib/content";

// トラックを2セット連結し、ちょうど半分スクロールした時点で0へ巻き戻す
// ことでシームレスにループする、右から左へ流れるカルーセル。
const TRACK_PHOTOS = [...CONTENT.photos, ...CONTENT.photos];
const PHOTO_COUNT = CONTENT.photos.length;

// 自動で流れる演出は requestAnimationFrame で scrollLeft を進めることで
// 実現する（元セット分の幅を約34秒で流れる速度）。
// ユーザーが触れている間（タッチ / マウスドラッグ）は自動で進めるのを止め、
// 離してから少し経ったら再開する。
// マウスでのドラッグスクロールは、ネイティブでは効かないため
// pointer系イベントで自前実装する（タッチはブラウザ標準に任せる）。
const AUTO_SCROLL_LOOP_SECONDS = 34;
const RESUME_DELAY_MS = 2500;
// この距離以上マウスが動いていたら「ドラッグしてスクロールした」とみなし、
// 離したときに拡大表示を開かないようにする（クリックとドラッグの誤判定防止）。
const DRAG_CLICK_THRESHOLD_PX = 6;

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  // ブラウザのscrollLeftは内部的に整数へ丸められるため、そこから毎フレーム
  // 読み戻して端数を積み上げていくと（特に高リフレッシュレート環境で）丸め
  // 誤差でほとんど進まなくなる。そのため実際の位置はこのfloatのrefで管理し、
  // scrollLeftへは書き込むだけ（読み戻さない）にする。
  const autoScrollPosRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    autoScrollPosRef.current = track.scrollLeft;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dtSec = (now - lastTime) / 1000;
      lastTime = now;
      if (!pausedRef.current) {
        const halfWidth = track.scrollWidth / 2;
        const speedPxPerSec = halfWidth / AUTO_SCROLL_LOOP_SECONDS;
        autoScrollPosRef.current += speedPxPerSec * dtSec;
        if (autoScrollPosRef.current >= halfWidth) {
          autoScrollPosRef.current -= halfWidth;
        }
        track.scrollLeft = autoScrollPosRef.current;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };
  const scheduleResume = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      // 手動操作（ドラッグ／ネイティブのタッチスクロール）で動いた分を
      // 自動スクロール側の基準位置に反映してから再開する。
      if (trackRef.current) autoScrollPosRef.current = trackRef.current.scrollLeft;
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  };

  // タッチはネイティブスクロールに任せるため、ここではマウス操作のみ
  // ドラッグでのスクロールを自前実装する。
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    draggingRef.current = true;
    dragDistanceRef.current = 0;
    pause();
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = trackRef.current.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !trackRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.abs(dx);
    trackRef.current.scrollLeft = dragStartScrollRef.current - dx;
  };
  // マウスドラッグ操作中はトラックがポインタをキャプチャしているため、
  // クリックイベントが写真要素のonClickまで届かない（イベントのtargetが
  // キャプチャ元のトラック自身にリダイレクトされる）。そのため、ドラッグと
  // 判定されない離し方（=実質的なクリック）のときは、離した座標から
  // elementFromPointで実際に見えている写真要素を直接判定して開く。
  // （タッチのタップは影響を受けないため、写真側のonClickがそのまま効く）
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      e.pointerType === "mouse" &&
      draggingRef.current &&
      dragDistanceRef.current <= DRAG_CLICK_THRESHOLD_PX
    ) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const photoEl = el?.closest<HTMLElement>("[data-photo-index]");
      if (photoEl) {
        openLightbox(Number(photoEl.dataset.photoIndex));
      }
    }
    endDrag();
  };

  const endDrag = () => {
    draggingRef.current = false;
    scheduleResume();
  };

  const openLightbox = (i: number) => {
    // ドラッグでスクロールした直後のクリックでは開かない。
    if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD_PX) return;
    setLightboxIndex(i % PHOTO_COUNT);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + PHOTO_COUNT) % PHOTO_COUNT));
  }, []);
  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % PHOTO_COUNT));
  }, []);

  // ライトボックス表示中はページのスクロールを止め、矢印キー/Escで操作できるようにする。
  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.classList.add("no-scroll");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, showPrev, showNext]);

  // ライトボックス内でのスワイプ操作（モバイル向け）。
  const swipeStartXRef = useRef(0);
  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeStartXRef.current = e.touches[0].clientX;
  };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeStartXRef.current;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) showPrev();
    else showNext();
  };

  const activePhoto = lightboxIndex !== null ? CONTENT.photos[lightboxIndex] : null;

  return (
    <section
      id="gallery"
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#4c4c4c" }}
    >
      <div className="mx-auto max-w-[1100px] px-6">
        <SectionTitle
          en="GALLERY"
          jp="写真"
          dark
          image={{ src: "/section-titles/gallery.png", width: 798, height: 146, alt: "GALLERY" }}
        />
      </div>
      <AnimatedItem>
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => draggingRef.current && endDrag()}
          onTouchStart={pause}
          onTouchEnd={scheduleResume}
          className="no-scrollbar cursor-grab overflow-x-auto active:cursor-grabbing"
        >
          <div className="flex w-max gap-4 md:gap-6">
            {TRACK_PHOTOS.map((photo, i) => (
              <motion.div
                key={`${photo.src}-${i}`}
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={() => openLightbox(i)}
                data-photo-index={i % PHOTO_COUNT}
                className="relative aspect-[3/4] w-[63vw] max-w-[330px] shrink-0 cursor-zoom-in overflow-hidden rounded-[4px] border border-white/10"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 63vw, 330px"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedItem>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 md:p-10"
            role="dialog"
            aria-modal="true"
            aria-label="写真の拡大表示"
            onClick={closeLightbox}
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="閉じる"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white"
            >
              ×
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="前の写真"
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white md:left-6"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="次の写真"
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white md:right-6"
            >
              ›
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative h-full w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
