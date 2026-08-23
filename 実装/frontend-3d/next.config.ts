import path from "path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// RSVPフォームで氏名・住所・電話番号などの個人情報を扱うため、
// 基本的なセキュリティヘッダーを付与する。
// nonceベースのCSPは全ページを動的レンダリング化してしまい
// （静的最適化・CDNキャッシュが効かなくなる）、このサイトの規模には
// 見合わないため、Next.js公式ドキュメントが案内する「nonceを使わない」
// 構成を採用している。style-src/script-srcの'unsafe-inline'は
// Next.jsのハイドレーション用インラインスクリプトと、Hero/LoadingScreen等が
// 使うインラインstyle属性のために必要（nonce化するとstatic prerenderが崩れる）。
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://scdn.line-apps.com;
  font-src 'self' data:;
  connect-src 'self' https://zipcloud.ibsnet.co.jp https://script.google.com https://script.googleusercontent.com;
  frame-src https://www.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // このプロジェクトのパスに日本語（マルチバイト文字）が含まれているため、
  // Turbopackのビルド時に文字境界がずれてクラッシュする既知の問題がある
  // （`start byte index N is not a char boundary` パニック）。
  // そのため dev/build ともにwebpackバンドラーを使用する（package.jsonのscripts参照）。
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // Next.js 16はimages.qualitiesの許容値が既定で[75]のみになり、
    // それ以外のqualityは最も近い許容値へ丸められる。ギャラリー写真の
    // 圧縮劣化が目立ったため95を許容値に追加している。
    qualities: [75, 95],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          // クリックジャッキング対策（CSPのframe-ancestorsに対応しない
          // 古いブラウザ向けの保険）
          { key: "X-Frame-Options", value: "DENY" },
          // MIME型スニッフィングによる誤解釈を防ぐ
          { key: "X-Content-Type-Options", value: "nosniff" },
          // フルURL（?guest=family等）を外部サイトへのリンク先に
          // 送らないようにする
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // カメラ・マイク・位置情報など、このサイトが使わない機能を明示的に無効化
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
