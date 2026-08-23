import { CONTENT } from "@/lib/content";

export function Footer() {
  return (
    // pb-28: 常時追従するBottomNavに文言が隠れないよう余白を確保している。
    <footer className="border-t border-[var(--line)] px-6 pt-12 pb-28 text-center">
      <p className="font-en text-sm tracking-[0.15em] text-[var(--muted)]">
        {CONTENT.groom.romaji} &amp; {CONTENT.bride.romaji}
      </p>
    </footer>
  );
}
