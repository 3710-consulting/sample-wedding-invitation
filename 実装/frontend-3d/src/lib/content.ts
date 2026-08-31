// サイトに表示する全てのテキスト・データをここに集約する。
// 差し込みコンテンツを変更したいときは、このファイルだけを編集すればよい。
//
// これは発信用のサンプルサイト（架空のカップル・架空の会場）。
// 実案件に流用する際は、この内容全体を案件ごとの実データに置き換える。
// 写真はロイヤリティフリー素材を public/photos/ 配下に配置し、next/imageで表示している。

export const CONTENT = {
  weddingDateTime: "2027-04-18T11:00:00+09:00",
  weddingDateLabel: "2027年4月18日（日）11:00",

  rsvpDeadline: "2027-03-01",
  rsvpDeadlineLabel: "2027年3月1日（月）",

  groom: {
    label: "GROOM",
    name: "山田 太郎",
    romaji: "Yamada Taro",
    heroName: "Taro",
    birthday: "1996年5月3日",
    birthplace: "東京都出身",
    message: "皆様への感謝を忘れず\n二人で温かい家庭を築いていきます",
    photo: "/photos/host/groom.jpg",
  },

  bride: {
    label: "BRIDE",
    name: "山田 花子",
    romaji: "Yamada Hanako",
    heroName: "Hanako",
    birthday: "1997年9月21日",
    birthplace: "神奈川県出身",
    message: "これまで支えてくださった皆様に\n心からの感謝をお伝えできる一日にしたいです",
    photo: "/photos/host/bride.jpg",
  },

  // 段落ごとに配列を分け、段落間だけ広めの余白を空ける。
  greeting: [
    ["皆様 いかがお過ごしでしょうか"],
    ["このたび 私たちは素晴らしいご縁をいただき", "結婚式を執り行うことになりました"],
    [
      "つきましては",
      "日頃お世話になっております皆様に",
      "私どもの門出をお見守りいただきたく存じます",
    ],
    ["挙式後はささやかではございますが", "感謝の気持ちを込めて 小宴を催したく存じます"],
    ["ご多用中誠に恐縮ではございますが", "ぜひご出席をお願いしたく ご案内申し上げます"],
  ],
  greetingPhoto: "/photos/greeting/greeting.jpg",

  // 挙式当日のスケジュール（受付〜お見送りまで）。
  schedule: [
    {
      time: "10:30",
      label: "受付開始",
      en: "START",
      note: "11:15迄にお越しくださいますようお願い申し上げます",
    },
    { time: "11:00", label: "挙式", en: "CEREMONY" },
    {
      time: "11:30",
      label: "集合写真",
      en: "PHOTO",
      note: "退場後、集合写真の撮影になります",
    },
    { time: "12:00", label: "披露宴", en: "RECEPTION" },
    { time: "14:30", label: "お見送り", en: "THANK YOU" },
  ],

  // 挙式（CEREMONY）セクション用の受付・開式情報
  ceremony: {
    receptionTime: "10:30",
    openTime: "11:00",
  },

  venue: {
    name: "ザ・ガーデンテラス迎賓館（サンプル）",
    hallName: "アトリウムホール",
    postalCode: "〒100-0005",
    address: "東京都千代田区丸の内1-9-1（サンプル住所）",
    tel: "03-0000-0000",
    officialSiteUrl: "https://example.com",
    mapEmbedUrl:
      "https://www.google.com/maps?q=" + encodeURIComponent("東京駅") + "&output=embed",
    mapLinkUrl:
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("東京駅"),
  },

  // 公式LINEアカウントへの誘導ボタン。サンプルサイトのため未設定（準備中表示になる）。
  line: {
    url: "",
    buttonLabel: "公式LINEを友だち追加",
  },

  // GAS Web AppのURL。空文字のままの場合はプレビュー動作（コンソールログ＋
  // 成功表示のみ）になる。本サンプルではバックエンド連携なしのため常に空。
  gasWebAppUrl: "",

  // ギャラリー写真
  photos: [
    { src: "/photos/gallery/gallery-1.jpg", alt: "ギャラリー写真 1" },
    { src: "/photos/gallery/gallery-2.jpg", alt: "ギャラリー写真 2" },
    { src: "/photos/gallery/gallery-3.jpg", alt: "ギャラリー写真 3" },
    { src: "/photos/gallery/gallery-4.jpg", alt: "ギャラリー写真 4" },
    { src: "/photos/gallery/gallery-5.jpg", alt: "ギャラリー写真 5" },
    { src: "/photos/gallery/gallery-6.jpg", alt: "ギャラリー写真 6" },
  ],
} as const;

// Hero（スクロール連動の連番フレーム演出）用。
// public/frames/hero-sample/ は Hero_sample.mp4（1080x1920, 4秒, 30fps）から
// 書き出したJPG連番（frame_0001.jpg〜frame_0120.jpg）。
export const HERO_FRAME_COUNT = 120;
export const HERO_FRAME_PATH = (i: number) =>
  `/frames/hero-sample/frame_${String(i).padStart(4, "0")}.jpg`;

// LoadingScreen（オープニング演出）用。
// public/frames/taro-hanako/ は taro&hanako.mp4（1920x1080, 4秒, 30fps）から
// 書き出したJPG連番（frame_0001.jpg〜frame_0120.jpg）。
export const LOADING_FRAME_COUNT = 120;
export const LOADING_FPS = 30;
export const LOADING_FRAME_PATH = (i: number) =>
  `/frames/taro-hanako/frame_${String(i).padStart(4, "0")}.jpg`;

// taro&hanako.mp4の最終フレーム（手書き風タイトルカード「Taro & Hanako」）を
// テキスト部分だけ切り抜き、背景を透過させたもの（828x788）。
// Heroの新郎新婦名テキストの代わりにこの画像を使う。
export const LOADING_TITLE_CUTOUT_SRC = "/frames/taro-hanako/title-cutout.png";
