"use client";

import { useEffect, useRef } from "react";
import { CONTENT } from "@/lib/content";

const UNITS = [
  { key: "days", label: "DAY" },
  { key: "hours", label: "HRS" },
  { key: "minutes", label: "MIN" },
  { key: "seconds", label: "SEC" },
] as const;

function setDigit(el: HTMLElement | null, value: string) {
  if (!el || el.textContent === value) return;
  el.textContent = value;
}

// 日付表示とライブカウントダウン（DAY|HRS|MIN|SEC）のみのシンプルな構成。
// 以前はCEREMONYパネル（挙式の開式時刻・受付時間の案内）も同じカードに
// 同居させていたが、Greetingの直前にいきなり挙式の詳細が出てくるのが
// 唐突だったため、Ceremonyコンポーネントとして切り出しSCHEDULEの直後
// （詳細情報として）へ移動した。
export function Countdown() {
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});
  const yearRef = useRef<HTMLSpanElement>(null);
  const monthRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = new Date(CONTENT.weddingDateTime).getTime();
    const date = new Date(CONTENT.weddingDateTime);
    // ハイドレーション不一致を避けるため、日付表示はクライアント側でのみ書き込む。
    if (yearRef.current) yearRef.current.textContent = String(date.getFullYear());
    if (monthRef.current) monthRef.current.textContent = String(date.getMonth() + 1);
    if (dayRef.current) dayRef.current.textContent = String(date.getDate());

    function tick() {
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setDigit(refs.current.days, String(days));
      setDigit(refs.current.hours, String(hours).padStart(2, "0"));
      setDigit(refs.current.minutes, String(minutes).padStart(2, "0"));
      setDigit(refs.current.seconds, String(seconds).padStart(2, "0"));

      if (diff <= 0) clearInterval(timerId);
    }

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <section className="relative px-4 pt-12 pb-16 md:pt-16">
      <div
        className="card-surface-dark mx-auto max-w-md p-7 md:p-8"
        style={{ background: "#4c4c4c" }}
      >
        <div className="flex flex-col items-center">
          <span ref={yearRef} className="font-en text-lg tracking-[0.2em] text-[var(--text-on-dark-soft)]">
            --
          </span>
          <div className="mt-2 flex items-center gap-5">
            <span ref={monthRef} className="font-en text-5xl leading-none">
              --
            </span>
            <span
              aria-hidden
              className="h-14 w-px"
              style={{ background: "var(--text-on-dark-soft)", opacity: 0.5, transform: "rotate(28deg)" }}
            />
            <span ref={dayRef} className="font-en self-end text-5xl leading-none">
              --
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6 text-center">
          <p className="font-en mb-4 text-[10px] tracking-[0.45em] text-[var(--text-on-dark-soft)]">
            COUNTDOWN
          </p>
          <div className="flex items-baseline justify-center gap-4 md:gap-6">
            {UNITS.map((unit, i) => (
              <div key={unit.key} className="flex items-baseline gap-4 md:gap-6">
                <div className="flex flex-col items-center">
                  <span
                    ref={(el) => {
                      refs.current[unit.key] = el;
                    }}
                    className="font-en text-3xl font-semibold md:text-4xl"
                  >
                    --
                  </span>
                  <span className="font-en mt-1 text-[10px] tracking-[0.2em] text-[var(--text-on-dark-soft)]">
                    {unit.label}
                  </span>
                </div>
                {i < UNITS.length - 1 && (
                  <span className="font-en pb-4 text-lg text-[var(--text-on-dark-soft)]">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
