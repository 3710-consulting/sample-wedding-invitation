// 本番の実写素材が届くまでの間、写真枠を示すためのプレースホルダー。
// DESIGN.mdのモノトーン＋ボルドー一点差しのトーンに合わせたグラデーションと、
// 何の写真が入る想定かを示すラベルのみで構成する。
// 実写に差し替える際は、この呼び出し元をnext/imageのImageに置き換える。
export function PlaceholderPhoto({
  label,
  dark = false,
  className = "",
}: {
  label: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center text-center ${className}`}
      style={{
        background: dark
          ? "linear-gradient(135deg, #2e2e2e, #171717)"
          : "linear-gradient(135deg, #f5e7e9, #fafafa)",
        border: `1px dashed ${dark ? "rgba(245,245,245,0.25)" : "var(--line)"}`,
      }}
      role="img"
      aria-label={label}
    >
      <span
        className="font-en px-2 text-[10px] tracking-[0.2em]"
        style={{ color: dark ? "var(--text-on-dark-soft)" : "var(--muted)" }}
      >
        {label}
      </span>
    </div>
  );
}
