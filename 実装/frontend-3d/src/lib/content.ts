// サイトに表示する全てのテキスト・データをここに集約する。
// 差し込みコンテンツを変更したいときは、このファイルだけを編集すればよい。
//
// これは発信用のサンプルサイト（架空のカップル・架空の会場）。
// 実案件に流用する際は、この内容全体を案件ごとの実データに置き換える。
// 写真は本番の実写素材が届くまでの間、PlaceholderPhoto（プレースホルダー枠）
// で表示している。実写に差し替える際はコンポーネント側（Host/Greeting/Gallery）
// をnext/imageのImageに戻し、ここに実ファイルパスを追加すればよい。

export const CONTENT = {
  weddingDateTime: "2027-04-18T11:00:00+09:00",
  weddingDateLabel: "2027年4月18日（日）11:00",

  rsvpDeadline: "2027-03-01",
  rsvpDeadlineLabel: "2027年3月1日（月）",

  groom: {
    label: "GROOM",
    name: "山田 陽翔",
    romaji: "Yamada Haruto",
    heroName: "Haruto",
    birthday: "1996年5月3日",
    birthplace: "東京都出身",
    message: "皆様への感謝を忘れず\n二人で温かい家庭を築いていきます",
    photoLabel: "新郎写真",
  },

  bride: {
    label: "BRIDE",
    name: "佐藤 美咲",
    romaji: "Sato Misaki",
    heroName: "Misaki",
    birthday: "1997年9月21日",
    birthplace: "神奈川県出身",
    message: "これまで支えてくださった皆様に\n心からの感謝をお伝えできる一日にしたいです",
    photoLabel: "新婦写真",
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
  greetingPhotoLabel: "挨拶写真",

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

  // ギャラリー写真（プレースホルダー）
  photos: [
    { label: "ギャラリー写真 1" },
    { label: "ギャラリー写真 2" },
    { label: "ギャラリー写真 3" },
    { label: "ギャラリー写真 4" },
    { label: "ギャラリー写真 5" },
    { label: "ギャラリー写真 6" },
  ],
} as const;
