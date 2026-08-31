# 新郎新婦写真

ここに以下のファイル名で写真を配置する。

- `groom.jpg` — 新郎写真
- `bride.jpg` — 新婦写真

配置後、[src/components/sections/Host.tsx](../../src/components/sections/Host.tsx)の`PlaceholderPhoto`呼び出しを`next/image`の`Image`に戻し、[src/lib/content.ts](../../src/lib/content.ts)の`groom`/`bride`に`photo: "/photos/host/groom.jpg"`のようなパスを追加する。
