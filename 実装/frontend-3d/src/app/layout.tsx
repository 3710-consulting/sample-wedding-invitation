import type { Metadata } from "next";
import { Noto_Serif, Shippori_Mincho_B1, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PointerInteractions } from "@/components/providers/PointerInteractions";

// DESIGN.md 2章のフォント方針:
// 和文エディトリアル本文 = Shippori Mincho B1 / 欧文トラッキング見出し・数字表示 = Noto Serif /
// UIチャンパー（ボタン・ラベル・ナビ） = Noto Sans JP
const notoSerifEn = Noto_Serif({
  variable: "--font-noto-serif-en",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const shipporiMincho = Shippori_Mincho_B1({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "結婚式のご案内（サンプル）",
  description: "結婚式Web招待状テンプレートの発信用サンプルページです。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifEn.variable} ${shipporiMincho.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* ブラウザのスクロール位置復元（リロード時に前回のスクロール位置へ
            自動で戻る挙動）を無効化し、リロード時は常にページ最上部から
            始まるようにする。 */}
        <Script id="disable-scroll-restoration" strategy="beforeInteractive">
          {`if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; } window.scrollTo(0, 0);`}
        </Script>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <PointerInteractions />
      </body>
    </html>
  );
}
