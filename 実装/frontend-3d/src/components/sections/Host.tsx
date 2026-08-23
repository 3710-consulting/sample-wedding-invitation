import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PlaceholderPhoto } from "@/components/ui/PlaceholderPhoto";
import { CONTENT } from "@/lib/content";

export function Host() {
  const people = [CONTENT.groom, CONTENT.bride];

  return (
    <section id="host" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-md">
        <SectionTitle
          en="HOST"
          jp="新郎新婦"
          image={{ src: "/section-titles/host.png", width: 673, height: 195, alt: "HOST" }}
        />
        <AnimatedSection className="flex flex-col gap-6">
          {people.map((person) => (
            <AnimatedItem
              key={person.label}
              className="card-surface-dark p-6"
              style={{ background: "#4c4c4c" }}
            >
              <div className="flex gap-4">
                <PlaceholderPhoto
                  dark
                  label={person.photoLabel}
                  className="h-28 w-24 shrink-0 rounded-[4px]"
                />
                <div className="flex min-w-0 flex-col justify-center text-white">
                  <p className="font-en text-xs tracking-[0.25em]">{person.label}</p>
                  <h3 className="mt-1 text-lg">{person.name}</h3>
                  <p className="font-en mt-1 text-xs tracking-[0.15em]">
                    {person.romaji.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="my-5 h-px bg-white/15" aria-hidden />

              <div className="text-center text-sm text-white">
                <p>{person.birthday}</p>
                <p>{person.birthplace}</p>
              </div>

              <div className="my-5 h-px bg-white/15" aria-hidden />

              <div className="text-center text-white">
                <p className="font-en text-xs tracking-[0.2em]">＜ 一言 ＞</p>
                <p className="mt-2 text-sm whitespace-pre-line">{person.message}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
