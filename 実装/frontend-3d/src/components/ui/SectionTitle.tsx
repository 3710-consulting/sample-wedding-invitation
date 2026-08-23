type SectionTitleImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export function SectionTitle({
  en,
  jp,
  align = "center",
  dark = false,
  image,
  className = "mb-11",
}: {
  en: string;
  jp: string;
  align?: "center" | "left";
  dark?: boolean;
  /** 用意済みの透過PNG素材（ブラケット下線込み）でEN見出しを描画する場合に指定する。
   *  指定時はCSSのブラケット下線（.section-title-en::before）は付けない
   *  （画像側にすでに焼き込まれているため）。 */
  image?: SectionTitleImage;
  /** 見出しブロック下の余白。デフォルトはmb-11だが、直後の要素との間隔を
   *  詰めたい場合など呼び出し側で上書きできる。 */
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${className} ${
        align === "left" ? "items-start text-left" : "items-center text-center"
      }`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          className="h-9 w-auto md:h-11"
        />
      ) : (
        <span
          className={`section-title-en text-2xl md:text-3xl ${
            align === "left" ? "section-title-en--left" : ""
          }`}
          style={{ color: dark ? "var(--text-on-dark)" : "var(--foreground)" }}
        >
          {en}
        </span>
      )}
      <span
        className="section-title-jp"
        style={{ color: dark ? "var(--text-on-dark-soft)" : "var(--muted)" }}
      >
        {jp}
      </span>
    </div>
  );
}
