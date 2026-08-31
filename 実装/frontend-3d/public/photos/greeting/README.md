# 挨拶写真

ここに以下のファイル名で写真を配置する。

- `greeting.jpg` — 挨拶セクションの横長写真

配置後、[src/components/sections/Greeting.tsx](../../src/components/sections/Greeting.tsx)の`PlaceholderPhoto`呼び出しを`next/image`の`Image`に戻し、[src/lib/content.ts](../../src/lib/content.ts)に`greetingPhoto: "/photos/greeting/greeting.jpg"`のようなパスを追加する。
