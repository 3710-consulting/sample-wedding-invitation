"use client";

import { useEffect, useRef } from "react";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { CONTENT } from "@/lib/content";

const rows: Array<{ label: string; render: (venue: typeof CONTENT.venue) => React.ReactNode }> = [
  { label: "会場", render: (v) => v.name },
  { label: "会場名", render: (v) => v.hallName },
];

// CEREMONY（挙式の開式時刻・受付時間）とLOCATION（会場情報）は、右にアクセント
// 線＋「LOCATION」見出し／左にアクセント線＋「CEREMONY」見出しという対になる
// デザインで作られていたため、1枚のカードに統合し、間を区切り線で分けている。
export function Venue() {
  const { venue } = CONTENT;
  const yearRef = useRef<HTMLSpanElement>(null);
  const monthRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // ハイドレーション不一致を避けるため、日付表示はクライアント側でのみ書き込む。
    const date = new Date(CONTENT.weddingDateTime);
    if (yearRef.current) yearRef.current.textContent = String(date.getFullYear());
    if (monthRef.current) monthRef.current.textContent = String(date.getMonth() + 1);
    if (dayRef.current) dayRef.current.textContent = String(date.getDate());
  }, []);

  return (
    <section id="venue" className="relative px-4 py-16 md:py-24">
      <div
        className="card-surface-dark mx-auto max-w-md p-7 md:p-8"
        style={{ background: "#4c4c4c" }}
      >
        <div className="flex items-baseline gap-3 border-l-2 border-[var(--gold)] pl-3">
          <span className="font-en text-xl tracking-[0.15em]">CEREMONY</span>
          <span className="h-px flex-1" style={{ background: "var(--text-on-dark-soft)", opacity: 0.4 }} />
        </div>
        <p className="mt-1 pl-3 text-xs tracking-[0.3em] text-[var(--text-on-dark-soft)]">挙式</p>

        <div className="mt-8 flex flex-col items-center">
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

        <div className="mt-8 flex flex-col items-center">
          <p className="font-en text-xs tracking-[0.35em] text-[var(--text-on-dark-soft)]">open</p>
          <p className="font-en text-xl tracking-[0.1em]">{CONTENT.ceremony.openTime}</p>

          <div className="mt-6 w-full bg-[var(--text-on-dark)] py-2.5 text-center">
            <span className="text-sm text-[var(--dark)]">
              受付 / {CONTENT.ceremony.receptionTime} ~
            </span>
          </div>
        </div>

        <div className="mt-10 flex items-baseline justify-end gap-3 border-r-2 border-[var(--gold)] pr-3">
          <span className="h-px flex-1" style={{ background: "var(--text-on-dark-soft)", opacity: 0.4 }} />
          <span className="font-en text-xl tracking-[0.15em]">LOCATION</span>
        </div>
        <p className="mt-1 pr-3 text-right text-xs tracking-[0.3em] text-[var(--text-on-dark-soft)]">
          会場情報
        </p>

        <AnimatedSection className="mt-8 flex flex-col gap-3">
          {rows.map((row) => (
            <AnimatedItem key={row.label} className="flex items-center gap-3">
              <span className="shrink-0 bg-[var(--text-on-dark)] px-2.5 py-1 text-xs text-[var(--dark)]">
                {row.label}
              </span>
              <span className="text-sm">{row.render(venue)}</span>
            </AnimatedItem>
          ))}
        </AnimatedSection>

        <div className="my-6 h-px bg-white/15" aria-hidden />

        <AnimatedSection className="flex flex-col gap-3 text-sm">
          <AnimatedItem className="flex items-center gap-3">
            <span className="shrink-0 bg-[var(--text-on-dark)] px-2.5 py-1 text-xs text-[var(--dark)]">
              URL
            </span>
            <a
              href={venue.officialSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="min-w-0 break-all underline decoration-white underline-offset-4"
            >
              {venue.officialSiteUrl}
            </a>
          </AnimatedItem>
          <AnimatedItem className="flex items-center gap-3">
            <span className="shrink-0 bg-[var(--text-on-dark)] px-2.5 py-1 text-xs text-[var(--dark)]">
              住所
            </span>
            <span>{venue.address}</span>
          </AnimatedItem>
          <AnimatedItem className="flex items-center gap-3">
            <span className="shrink-0 bg-[var(--text-on-dark)] px-2.5 py-1 text-xs text-[var(--dark)]">
              TEL
            </span>
            <span>{venue.tel}</span>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedItem>
          <div className="relative mt-6 overflow-hidden rounded-[4px] border border-white/15">
            <a
              href={venue.mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="font-ui absolute left-3 top-3 z-10 bg-[var(--text-on-dark)] px-3 py-1.5 text-xs text-[var(--dark)]"
            >
              マップ ↗
            </a>
            <iframe
              title="会場地図"
              src={venue.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[260px] w-full border-0"
            />
          </div>
        </AnimatedItem>
      </div>
    </section>
  );
}
