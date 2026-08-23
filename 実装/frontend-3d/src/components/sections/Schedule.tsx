import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CONTENT } from "@/lib/content";

// 時刻を左端に置き、ドット+縦線でつないだ左揃えのタイムライン。
export function Schedule() {
  const schedule = CONTENT.schedule;

  return (
    <section id="schedule" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-md">
        <SectionTitle
          en="SCHEDULE"
          jp="スケジュール"
          image={{ src: "/section-titles/schedule.png", width: 844, height: 131, alt: "SCHEDULE" }}
        />
        <AnimatedSection className="flex flex-col">
          {schedule.map((item, i) => {
            const isLast = i === schedule.length - 1;
            return (
              <AnimatedItem key={item.time} className="flex gap-4">
                <div className="font-en w-12 shrink-0 pt-0.5 text-sm tracking-[0.03em]">
                  {item.time}
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className="mt-2 h-[9px] w-[9px] shrink-0 rounded-full"
                    style={{ background: "var(--dark)" }}
                    aria-hidden
                  />
                  {!isLast && (
                    <span className="my-1 w-px flex-1" style={{ background: "var(--line)" }} aria-hidden />
                  )}
                </div>
                <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-8"}`}>
                  <p className="font-medium">{item.label}</p>
                  {item.en && (
                    <p className="font-en text-xs tracking-[0.2em] text-[var(--muted)]">
                      {item.en}
                    </p>
                  )}
                  {"note" in item && item.note && (
                    <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-[var(--muted)]">
                      {item.note}
                    </p>
                  )}
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedSection>
      </div>
    </section>
  );
}
