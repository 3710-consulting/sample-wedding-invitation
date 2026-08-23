# 結婚式Web招待状テンプレート — 発信用サンプル

副業として案件化するための、発信・ポートフォリオ用サンプルサイト。架空のカップル・架空の会場で構成しており、実在の個人情報は含まない。

ベースは [結婚式_招待状/実装/frontend-3d](../../../結婚式_招待状/実装/frontend-3d)（自分の結婚式サイト）。デザイントークン（[globals.css](src/app/globals.css)、[../../../結婚式_招待状/DESIGN.md](../../../結婚式_招待状/DESIGN.md)のクラシック／モノトーン／ボルドー配色）はそのまま踏襲しつつ、以下の2点を意図的に簡略化している。

## 元実装との違い

- **Hero / ローディング演出なし**: 元実装のHeroは、結婚式当日の動画から書き出した120枚（＋ローディング用75枚）の連番フレームをスクロールに合わせて再生する演出で、案件固有の動画素材が前提になる。本サンプルでは静的な1枚構成のシンプルなHeroに置き換えている（[src/components/sections/Hero.tsx](src/components/sections/Hero.tsx)）。実案件でフル演出版を作る場合は元実装のHero.tsx/LoadingScreen.tsxを移植する。
- **写真は全てプレースホルダー**: 実写素材がないため、[src/components/ui/PlaceholderPhoto.tsx](src/components/ui/PlaceholderPhoto.tsx)で「差し替え待ち」の枠を表示している。実案件では該当箇所を`next/image`の`Image`に戻し、実写ファイルパスを[src/lib/content.ts](src/lib/content.ts)に追加する。フォトギャラリーの横スクロール自動送り＋ドラッグ操作＋ライトボックス（[src/components/sections/Gallery.tsx](src/components/sections/Gallery.tsx)）は元実装のロジックをそのまま移植済みで、プレースホルダーの状態でも一通り動作を確認できる。
- **GAS連携なし**: `CONTENT.gasWebAppUrl`を空文字のままにしている。出欠フォーム（RSVP）自体は元実装のUI・バリデーションをそのまま搭載しており、送信するとプレビュー動作（コンソールログ＋成功表示のみ、実際の書き込みは行わない）になる。実案件で本番連携する場合は[結婚式_招待状/実装/gas](../../../結婚式_招待状/実装/gas)を参考にGAS Web Appを発行し、URLを設定する。

## 実案件へ転用する際の流れ

1. このフォルダーを`案件/<クライアント名>/実装/frontend-3d/`へコピー
2. [src/lib/content.ts](src/lib/content.ts)をヒアリング内容（挙式日時・挨拶文・プロフィール・会場情報等）に差し替え
3. Host/Greeting/GalleryのPlaceholderPhoto呼び出しを`next/image`のImageに戻し、実写を配置
4. 必要に応じてフル演出版Heroを移植（動画からのフレーム書き出しが必要）
5. GAS Web App・スプレッドシートを新規発行し、`gasWebAppUrl`を設定

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できる。
