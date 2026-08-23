import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CONTENT } from "@/lib/content";

// 公式LINEアカウントへの誘導。DESIGN.mdのNG色指定（LINEブランドグリーンを
// そのまま大面積で使わない）に沿って、彩度の高い緑のピルボタンではなく
// モノトーンの枠線ボタン＋小さな文字ロゴのみにしている。
export function Contact() {
  const { line } = CONTENT;
  const hasUrl = Boolean(line.url);

  return (
    <section id="contact" className="relative px-6 py-24 text-center md:py-32">
      <div className="mx-auto max-w-md">
        <SectionTitle en="CONTACT" jp="お問い合わせ" />
        <AnimatedSection className="flex flex-col items-center gap-6">
          <AnimatedItem className="text-sm text-[var(--muted)]">
            ご不明点や当日のご連絡は、公式LINEアカウントから
            <br />
            お気軽にどうぞ。
          </AnimatedItem>
          <AnimatedItem>
            {hasUrl ? (
              <a
                href={line.url}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="font-ui inline-flex items-center gap-2 rounded-[2px] border border-[var(--foreground)] px-7 py-3 text-sm tracking-[0.1em] text-[var(--foreground)]"
              >
                {line.buttonLabel}
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="font-ui inline-flex cursor-not-allowed items-center gap-2 rounded-[2px] border border-[var(--line)] px-7 py-3 text-sm tracking-[0.1em] text-[var(--muted)]"
              >
                {line.buttonLabel}（準備中）
              </span>
            )}
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
