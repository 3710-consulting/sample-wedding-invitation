import { SectionTitle } from "@/components/ui/SectionTitle";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { Footer } from "@/components/sections/Footer";
import { CONTENT } from "@/lib/content";

// RSVPで「出席」を送信したゲスト向けのサンキューページ。
// トーン＆マナー（配色・フォント・余白のリズム）はメインページと共通のトークンを使う。
export default function ThanksPage() {
  const hasLineUrl = Boolean(CONTENT.line.url);

  return (
    <main className="min-h-screen pt-12 pb-24 md:pt-16 md:pb-32">
      <div className="mx-auto max-w-lg px-6">
        <AnimatedSection className="flex flex-col items-center text-center">
          <AnimatedItem>
            <SectionTitle
              en="THANK YOU"
              jp="ご出席のご回答ありがとうございます"
              image={{ src: "/section-titles/thankyou.png", width: 625, height: 111, alt: "THANK YOU" }}
              className="mb-0"
            />
            <p className="mb-11 text-[15px] leading-loose md:text-base">
              当日皆様にお会いできますことを
              <br />
              心より楽しみにしております。
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p className="mb-5 text-sm text-[var(--muted)]">
              今後の追加のご案内などは、公式LINEアカウントにてお届けいたします。
              <br />
              よろしければお友だち追加をお願いいたします。
            </p>
            {/* DESIGN.mdのNG色指定（LINEブランドグリーンをそのまま大面積で
                使わない）に沿って、モノトーンの枠線ボタンにしている。 */}
            {hasLineUrl ? (
              <a
                href={CONTENT.line.url}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="font-ui inline-flex items-center gap-2 rounded-[2px] border border-[var(--foreground)] px-7 py-3 text-sm tracking-[0.1em] text-[var(--foreground)]"
              >
                {CONTENT.line.buttonLabel}
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="font-ui inline-flex cursor-not-allowed items-center gap-2 rounded-[2px] border border-[var(--line)] px-7 py-3 text-sm tracking-[0.1em] text-[var(--muted)]"
              >
                {CONTENT.line.buttonLabel}（準備中）
              </span>
            )}
          </AnimatedItem>

          <AnimatedItem>
            <a
              href="/"
              data-magnetic
              className="font-ui mt-11 inline-block text-sm underline decoration-[var(--gold)] underline-offset-4"
            >
              トップページに戻る
            </a>
          </AnimatedItem>
        </AnimatedSection>
      </div>
      <Footer />
    </main>
  );
}
