import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PlaceholderPhoto } from "@/components/ui/PlaceholderPhoto";
import { CONTENT } from "@/lib/content";

export function Greeting() {
  return (
    <section id="greeting" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[640px]">
        <SectionTitle
          en="GREETING"
          jp="ご挨拶"
          image={{ src: "/section-titles/greeting.png", width: 869, height: 140, alt: "GREETING" }}
        />
        <PlaceholderPhoto
          label={CONTENT.greetingPhotoLabel}
          className="mb-11 aspect-[3/2] w-full rounded-[4px]"
        />
        <AnimatedSection className="flex flex-col items-center gap-6 text-center">
          {CONTENT.greeting.map((paragraph, pi) => (
            <div key={pi} className="flex flex-col items-center gap-1">
              {paragraph.map((line, li) => (
                <AnimatedItem key={li} className="text-[15px] leading-loose md:text-base">
                  {line}
                </AnimatedItem>
              ))}
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
