# 結婚式Web招待状テンプレート — 発信用サンプル

副業として案件化するための、発信・ポートフォリオ用サンプルサイト。架空のカップル・架空の会場で構成しており、実在の個人情報は含まない。

ベースは [結婚式_招待状/実装/frontend-3d](../../../結婚式_招待状/実装/frontend-3d)（自分の結婚式サイト）。デザイントークン（[globals.css](src/app/globals.css)、[../../../結婚式_招待状/DESIGN.md](../../../結婚式_招待状/DESIGN.md)のクラシック／モノトーン／ボルドー配色）はそのまま踏襲しつつ、以下の2点を意図的に簡略化している。

## 元実装との違い

- **写真は全てプレースホルダー**: 実写素材がないため、[src/components/ui/PlaceholderPhoto.tsx](src/components/ui/PlaceholderPhoto.tsx)で「差し替え待ち」の枠を表示している。実案件では該当箇所を`next/image`の`Image`に戻し、実写ファイルパスを[src/lib/content.ts](src/lib/content.ts)に追加する。フォトギャラリーの横スクロール自動送り＋ドラッグ操作＋ライトボックス（[src/components/sections/Gallery.tsx](src/components/sections/Gallery.tsx)）は元実装のロジックをそのまま移植済みで、プレースホルダーの状態でも一通り動作を確認できる。
- **GAS連携なし**: `CONTENT.gasWebAppUrl`を空文字のままにしている。出欠フォーム（RSVP）自体は元実装のUI・バリデーションをそのまま搭載しており、送信するとプレビュー動作（コンソールログ＋成功表示のみ、実際の書き込みは行わない）になる。実案件で本番連携する場合は[結婚式_招待状/実装/gas](../../../結婚式_招待状/実装/gas)を参考にGAS Web Appを発行し、URLを設定する。

### Hero / ローディング演出

スクロール連動の連番フレーム演出（[src/components/sections/Hero.tsx](src/components/sections/Hero.tsx)）とオープニング演出（[src/components/ui/LoadingScreen.tsx](src/components/ui/LoadingScreen.tsx)）は、サンプル素材（`taro&hanako.mp4`、`Hero_sample.mp4`、各4秒・30fps）から書き出したJPG連番で実装済み。

- `public/frames/hero-sample/frame_0001.jpg`〜`frame_0120.jpg`（1080x1920, Hero_sample.mp4由来）: Heroのスクロール連動キャンバス背景
- `public/frames/taro-hanako/frame_0001.jpg`〜`frame_0120.jpg`（1920x1080, taro&hanako.mp4由来）: オープニングのローディング演出

元実装は透過処理済みのWebP連番（背景を透明にしてタイトル文字だけを重ねる）を使っていたが、本サンプルの素材は不透明なJPGのため透過合成は行わず、キャンバスにそのまま描画している。タイトル文言（WEDDING INVITATION／新郎新婦名／日付）は焼き込み画像ではなくHTMLテキストで重ねているため、[src/lib/content.ts](src/lib/content.ts)の編集だけで差し替えられる。

実案件で動画素材が変わる場合は、`ffmpeg -i <動画> -vsync 0 -q:v 2 public/frames/<フォルダ名>/frame_%04d.jpg`で連番を書き出し、`src/lib/content.ts`の`HERO_FRAME_COUNT`/`LOADING_FRAME_COUNT`とフレームパスを実際の枚数・フォルダ名に合わせて更新する。

## 実案件へ転用する際の流れ

1. このフォルダーを`案件/<クライアント名>/実装/frontend-3d/`へコピー
2. [src/lib/content.ts](src/lib/content.ts)をヒアリング内容（挙式日時・挨拶文・プロフィール・会場情報等）に差し替え
3. Host/Greeting/GalleryのPlaceholderPhoto呼び出しを`next/image`のImageに戻し、実写を配置
4. Hero/LoadingScreen用の動画素材を用意し、上記の手順で連番フレームを書き出して差し替え
5. GAS Web App・スプレッドシートを新規発行し、`gasWebAppUrl`を設定

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できる。
