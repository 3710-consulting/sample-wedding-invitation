import { CONTENT } from "@/lib/content";

export type AllergyAnswer = "なし" | "あり" | "";

export type Companion = {
  id: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  hasAllergy: AllergyAnswer;
  allergyDetail: string;
  isChild: boolean;
  age: string;
};

export type RelationCategory = "家族" | "親族" | "友人" | "会社" | "その他" | "";

// 「間柄」は選択した「ご関係」に応じて選択肢を出し分ける。
export const RELATION_DETAIL_OPTIONS: Record<Exclude<RelationCategory, "">, string[]> = {
  家族: ["父", "母", "兄", "姉", "弟", "妹", "その他"],
  親族: [
    "甥",
    "姪",
    "祖父",
    "祖母",
    "大伯父（祖父母の兄）",
    "大伯母（祖父母の姉）",
    "大叔父（祖父母の弟）",
    "大叔母（祖父母の妹）",
    "伯父（父母の兄）",
    "伯母（父母の姉）",
    "叔父（父母の弟）",
    "叔母（父母の妹）",
    "従兄（年上のいとこ）",
    "従姉（年上のいとこ）",
    "従弟（年下のいとこ）",
    "従妹（年下のいとこ）",
    "従甥",
    "従姪",
    "親戚",
    "その他",
  ],
  友人: ["大学友人", "高校友人", "中学友人", "幼なじみ", "会社友人", "友人", "知人", "その他"],
  会社: ["上司", "同僚", "部下", "取引先", "その他"],
  その他: ["その他"],
};

// 郵便番号: ハイフンなし半角数字7桁。
export function isValidPostalCode(postalCode: string): boolean {
  return /^[0-9]{7}$/.test(postalCode);
}

// 電話番号: 半角数字10桁または11桁（市外局番の固定電話は10桁、携帯電話は11桁）。
export function isValidPhone(phone: string): boolean {
  return /^[0-9]{10,11}$/.test(phone);
}

export type RsvpPayload = {
  side: "新郎" | "新婦" | "";
  attendance: "出席" | "欠席" | "保留" | "";
  relationCategory: RelationCategory;
  relationDetail: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  gender: "男性" | "女性" | "その他" | "";
  postalCode: string;
  address: string;
  phone: string;
  hasAllergy: AllergyAnswer;
  allergyDetail: string;
  companions: Companion[];
  message: string;
  photoName: string;
  // 写真本体（Base64、data:スキーム無し）とMIMEタイプ。写真は任意項目のため未添付ならundefined。
  photoData?: string;
  photoMimeType?: string;
};

// 添付写真のサイズ上限。GAS Web Appのリクエストサイズ上限（約50MB）に対して
// 十分余裕を持たせつつ、モバイル回線での送信に時間がかかりすぎないように8MBとした。
export const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;

export function isPhotoSizeValid(file: File): boolean {
  return file.size <= MAX_PHOTO_SIZE_BYTES;
}

// 写真ファイルをBase64文字列に変換する（GAS Web AppへJSONで送るため）。
export function readFileAsBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve({
        data: commaIndex === -1 ? result : result.slice(commaIndex + 1),
        mimeType: file.type || "application/octet-stream",
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * 唯一の送信エントリポイント。呼び出し側のRSVP.tsxはこの関数の中身を
 * 意識しない。
 *
 * CONTENT.gasWebAppUrl が未設定の間はプレビュー動作（コンソールログ＋
 * 成功扱い）。../../gas/README.md の手順でGAS Web Appをデプロイし、
 * 発行されたURLを CONTENT.gasWebAppUrl に設定すると実際にスプレッド
 * シートへ送信されるようになる。
 * 添付写真の実ファイルは送信しない（ファイル名のみ記録）。
 *
 * セキュリティ上の注意（個人情報を扱うため）:
 * - この関数のpayloadはブラウザから直接送信されるため、ここでの
 *   バリデーション（isValidPostalCode等）はUXのためのものであり、
 *   セキュリティの境界にはならない。GAS側のdoPostで氏名・電話番号・
 *   郵便番号などを必ず再検証してからスプレッドシートに書き込む
 *   （実装済み: gas/src/Code.js の validatePayload_）。
 * - GAS Web Appの公開範囲は「全員（匿名を含む）」にせざるを得ないため、
 *   URLさえ知っていれば誰でもPOSTできてしまう。NEXT_PUBLIC_RSVP_TOKEN
 *   による共有シークレット認証で無差別な書き込みを防いでいるが、
 *   クライアントのJSバンドルに含まれる値である以上、厳密な秘匿情報
 *   ではない点に注意（本人以外による偽の回答送信までは防げない）。
 */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  if (!CONTENT.gasWebAppUrl) {
    // 氏名・住所・電話番号などの個人情報を含むため、本番ビルドでは
    // コンソールに出力しない（開発中の動作確認用のみ）。
    if (process.env.NODE_ENV === "development") {
      console.log("[preview] RSVP submission:", payload);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  // GASの doPost はCORSプリフライトに対応していないため、
  // mode: "no-cors" で呼び出す（レスポンス内容は読み取れず、
  // 例外が出なければ成功とみなす楽観的な扱いになる）。
  await fetch(CONTENT.gasWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      ...payload,
      token: process.env.NEXT_PUBLIC_RSVP_TOKEN || "",
    }),
  });
}

// 郵便番号(ハイフンなし7桁)から住所を引く。zipcloud はAPIキー不要・CORS対応の
// 公開JSON API。取得失敗時は null を返し、呼び出し側で無視する。
export async function lookupAddressByPostalCode(postalCode: string): Promise<string | null> {
  try {
    // APIがハングした場合に「検索しています…」が永久に残らないよう、
    // 一定時間で諦めてnullを返す。
    const res = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(postalCode)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return null;
    return `${result.address1}${result.address2}${result.address3}`;
  } catch {
    return null;
  }
}
