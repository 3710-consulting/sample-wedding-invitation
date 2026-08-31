# ギャラリー写真

ここに以下のファイル名で写真を配置する（[src/lib/content.ts](../../src/lib/content.ts)の`photos`配列に合わせて6枚）。

- `gallery-1.jpg` 〜 `gallery-6.jpg`

配置後、[src/components/sections/Gallery.tsx](../../src/components/sections/Gallery.tsx)の`PlaceholderPhoto`呼び出しを`next/image`の`Image`に戻し、`content.ts`の`photos`配列の各要素に`src: "/photos/gallery/gallery-1.jpg"`のようなパスを追加する。枚数を増減する場合は配列の要素数を合わせて調整する。
