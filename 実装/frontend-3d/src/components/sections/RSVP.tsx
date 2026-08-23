"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CONTENT } from "@/lib/content";
import {
  submitRsvp,
  lookupAddressByPostalCode,
  isValidPostalCode,
  isValidPhone,
  isPhotoSizeValid,
  readFileAsBase64,
  MAX_PHOTO_SIZE_BYTES,
  RELATION_DETAIL_OPTIONS,
  type AllergyAnswer,
  type Companion,
  type RelationCategory,
  type RsvpPayload,
} from "@/lib/rsvp";

// DESIGN.md 4章: 入力欄は角丸最小限（2px）・枠で囲むスタイル。
// フォーカス時のみアクセント（ボルドー）を使う。
const inputClass =
  "w-full rounded-[2px] border border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] px-3 py-2.5 text-[15px] focus:outline-2 focus:outline-[var(--gold)] focus:outline-offset-1 focus:border-[var(--gold)]";

function emptyCompanion(id: string): Companion {
  return {
    id,
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    hasAllergy: "",
    allergyDetail: "",
    isChild: false,
    age: "",
  };
}

function deadlineParts(iso: string) {
  const date = new Date(`${iso}T00:00:00+09:00`);
  return {
    month: String(date.getMonth() + 1).padStart(2, "0"),
    day: String(date.getDate()).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

function Legend({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <legend className="mb-2 font-semibold">
      {children}
      {required && (
        <span className="ml-1 text-xs font-normal text-[var(--required)]">必須</span>
      )}
    </legend>
  );
}

function RadioField<T extends string>({
  legend,
  required,
  name,
  options,
  value,
  onChange,
  labelFor,
}: {
  legend: string;
  required?: boolean;
  name: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFor?: (v: T) => string;
}) {
  return (
    <fieldset>
      <Legend required={required}>{legend}</Legend>
      <div className="flex flex-wrap gap-6">
        {options.map((v) => (
          <label key={v} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              required={required}
            />
            {labelFor ? labelFor(v) : v}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField({
  legend,
  required,
  name,
  options,
  value,
  onChange,
  disabled,
  disabledHint,
}: {
  legend: string;
  required?: boolean;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <fieldset>
      <Legend required={required}>{legend}</Legend>
      <select
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <option value="" disabled hidden>
          選択してください
        </option>
        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      {disabled && disabledHint && (
        <p className="mt-1.5 text-xs text-[var(--muted)]">{disabledHint}</p>
      )}
    </fieldset>
  );
}

function AllergyField({
  legend,
  required,
  hasAllergy,
  onHasAllergyChange,
  detail,
  onDetailChange,
  name,
}: {
  legend: string;
  required?: boolean;
  hasAllergy: AllergyAnswer;
  onHasAllergyChange: (v: AllergyAnswer) => void;
  detail: string;
  onDetailChange: (v: string) => void;
  name: string;
}) {
  return (
    <fieldset>
      <Legend required={required}>{legend}</Legend>
      <div className="flex gap-6">
        {(["なし", "あり"] as const).map((v) => (
          <label key={v} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={name}
              value={v}
              checked={hasAllergy === v}
              onChange={() => onHasAllergyChange(v)}
            />
            {v}
          </label>
        ))}
      </div>
      {hasAllergy === "あり" && (
        <input
          className={`${inputClass} mt-3`}
          placeholder="内容をご記入ください（例：卵、小麦 など）"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
        />
      )}
    </fieldset>
  );
}

// お連れ様がお子様の場合、お食事の手配等の都合上、年齢を把握したい
// というリクエストへの対応。チェックすると年齢入力欄が現れる
// （AllergyFieldの「あり」で詳細欄が現れるのと同じパターン）。
function ChildField({
  isChild,
  onIsChildChange,
  age,
  onAgeChange,
  name,
}: {
  isChild: boolean;
  onIsChildChange: (v: boolean) => void;
  age: string;
  onAgeChange: (v: string) => void;
  name: string;
}) {
  return (
    <fieldset>
      <Legend>お子様ですか？</Legend>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          name={name}
          checked={isChild}
          onChange={(e) => onIsChildChange(e.target.checked)}
        />
        お子様
      </label>
      {isChild && (
        <input
          className={`${inputClass} mt-3`}
          placeholder="年齢"
          inputMode="numeric"
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
        />
      )}
    </fieldset>
  );
}

export function RSVP() {
  const router = useRouter();
  const lenis = useLenis();
  const [side, setSide] = useState<RsvpPayload["side"]>("");
  const [attendance, setAttendance] = useState<RsvpPayload["attendance"]>("");
  const [relationCategory, setRelationCategory] = useState<RelationCategory>("");
  const [relationDetail, setRelationDetail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastNameKana, setLastNameKana] = useState("");
  const [firstNameKana, setFirstNameKana] = useState("");
  const [gender, setGender] = useState<RsvpPayload["gender"]>("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [postalLookup, setPostalLookup] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [phone, setPhone] = useState("");
  const [hasAllergy, setHasAllergy] = useState<AllergyAnswer>("");
  const [allergyDetail, setAllergyDetail] = useState("");
  const [addCompanions, setAddCompanions] = useState(false);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [message, setMessage] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  // ハニーポット: 人間には見えないがボットは埋めがちなフィールド。
  // 値が入っていたら送信されたスパムとみなして無視する。
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const formId = useId();
  const companionIdRef = useRef(0);
  const nextCompanionId = () => `companion-${++companionIdRef.current}`;
  // ファイル入力はDOM側が選択済みファイルを内部で保持する非制御要素のため、
  // stateをリセットしただけでは表示が消えない。keyを変えて強制的に
  // 作り直すことで、送信成功後の「選択中: ...」表示を確実にクリアする。
  const [photoInputKey, setPhotoInputKey] = useState(0);
  // 郵便番号検索のレースコンディション対策: 入力が素早く変更された場合、
  // 古いリクエストの結果が後から返ってきても無視できるようにする。
  const postalRequestRef = useRef(0);

  const updateCompanion = (id: string, patch: Partial<Companion>) => {
    setCompanions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const removeCompanion = (id: string) => {
    setCompanions((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePostalCodeChange = async (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 7);
    setPostalCode(digits);
    if (digits.length !== 7) {
      setPostalLookup("idle");
      return;
    }
    const requestId = ++postalRequestRef.current;
    setPostalLookup("loading");
    const found = await lookupAddressByPostalCode(digits);
    if (requestId !== postalRequestRef.current) return; // 新しい入力で上書き済み
    if (found) {
      setAddress((prev) => (prev.trim() === "" ? found : prev));
      setPostalLookup("done");
    } else {
      setPostalLookup("error");
    }
  };

  const handlePhoneChange = (raw: string) => {
    setPhone(raw.replace(/[^0-9]/g, "").slice(0, 11));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // ボットの送信とみなし、何も起きなかったように振る舞う

    if (
      !side ||
      !attendance ||
      !relationCategory ||
      !relationDetail ||
      !lastName ||
      !firstName ||
      !lastNameKana ||
      !firstNameKana ||
      !gender ||
      !isValidPostalCode(postalCode) ||
      !address ||
      !isValidPhone(phone) ||
      !hasAllergy
    )
      return;

    setStatus("sending");
    try {
      let photoData: string | undefined;
      let photoMimeType: string | undefined;
      if (photoFile) {
        const encoded = await readFileAsBase64(photoFile);
        photoData = encoded.data;
        photoMimeType = encoded.mimeType;
      }

      await submitRsvp({
        side,
        attendance,
        relationCategory,
        relationDetail,
        lastName,
        firstName,
        lastNameKana,
        firstNameKana,
        gender,
        postalCode,
        address,
        phone,
        hasAllergy,
        allergyDetail,
        companions: addCompanions ? companions : [],
        message,
        photoName,
        photoData,
        photoMimeType,
      });
      if (attendance === "出席") {
        router.push("/thanks");
        return;
      }
      setStatus("sent");
      setSide("");
      setAttendance("");
      setRelationCategory("");
      setRelationDetail("");
      setLastName("");
      setFirstName("");
      setLastNameKana("");
      setFirstNameKana("");
      setGender("");
      setPostalCode("");
      setAddress("");
      setPostalLookup("idle");
      setPhone("");
      setHasAllergy("");
      setAllergyDetail("");
      setAddCompanions(false);
      setCompanions([]);
      setMessage("");
      setPhotoName("");
      setPhotoFile(null);
      setPhotoError("");
      setPhotoInputKey((k) => k + 1);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <AnimatePresence>
        {status === "sending" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-7"
            style={{ background: "rgba(20, 18, 15, 0.92)" }}
            role="status"
            aria-live="polite"
          >
            <div className="h-[2px] w-32 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full w-1/3 rounded-full bg-[var(--gold)]"
                animate={{ x: ["-120%", "220%"] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="font-ui text-xs tracking-[0.2em] text-white/70">送信中…</p>
          </motion.div>
        )}
      </AnimatePresence>
      <section id="rsvp" className="relative px-4 py-16 md:py-24" style={{ background: "#4c4c4c" }}>
        <div className="mx-auto max-w-lg rounded-[4px] bg-[var(--background)] px-6 py-14 md:px-10 md:py-16">
        <SectionTitle
          en="RSVP"
          jp="御出欠"
          image={{ src: "/section-titles/rsvp.png", width: 735, height: 226, alt: "RSVP" }}
        />
        <p className="mb-2 text-center text-sm font-semibold">ご出欠について</p>
        <p className="mb-6 text-center text-sm text-[var(--muted)]">
          お手数ではございますが
          <br />
          下記お日にち迄に
          <br />
          出欠のご回答賜りますよう
          <br />
          お願い申し上げます
        </p>
        <p className="mb-8 text-center text-sm text-[var(--muted)]">
          また期日までのご回答が難しい場合は
          <br />
          一度保留でのご回答をお願いいたします
        </p>
        <div className="card-surface mb-9 flex items-start justify-center gap-6 py-7 md:gap-10">
          {(
            [
              ["month", deadlineParts(CONTENT.rsvpDeadline).month],
              ["day", deadlineParts(CONTENT.rsvpDeadline).day],
              ["year", deadlineParts(CONTENT.rsvpDeadline).year],
            ] as const
          ).map(([label, value], i) => (
            <div key={label} className="flex items-start gap-6 md:gap-10">
              {i > 0 && <span className="h-10 w-px bg-[var(--line)]" aria-hidden />}
              <div className="flex flex-col items-center">
                <span className="font-en text-3xl tracking-[0.03em] md:text-4xl">
                  {value}
                </span>
                <span className="font-en mt-1 text-xs tracking-[0.1em] text-[var(--muted)]">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <AnimatedSection>
          <AnimatedItem>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* ハニーポット: 人間の目には映らず、フォーカスもタブ移動も
                  発生しない位置に置く。スクリーンリーダーからも隠す。 */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0,0,0,0)",
                  whiteSpace: "nowrap",
                }}
              >
                <label htmlFor={`${formId}-website`}>ウェブサイト</label>
                <input
                  id={`${formId}-website`}
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <RadioField
                legend="ゲスト様"
                required
                name={`${formId}-side`}
                options={["新郎", "新婦"] as const}
                value={side}
                onChange={setSide}
                labelFor={(v) => `${v}ゲスト`}
              />

              <RadioField
                legend="ご出欠"
                required
                name={`${formId}-attendance`}
                options={["出席", "欠席", "保留"] as const}
                value={attendance}
                onChange={setAttendance}
              />

              <SelectField
                legend="ご関係（ふたりからみた）"
                required
                name={`${formId}-relation-category`}
                options={["家族", "親族", "友人", "会社", "その他"]}
                value={relationCategory}
                onChange={(v) => {
                  setRelationCategory(v as RelationCategory);
                  setRelationDetail("");
                }}
              />

              <SelectField
                legend="間柄（ふたりからみた）"
                required
                name={`${formId}-relation-detail`}
                options={relationCategory ? RELATION_DETAIL_OPTIONS[relationCategory] : []}
                value={relationDetail}
                onChange={setRelationDetail}
                disabled={!relationCategory}
                disabledHint="先に「ご関係」を選択してください"
              />

              <div>
                <label className="mb-1.5 block font-semibold" htmlFor={`${formId}-last-name`}>
                  お名前<span className="ml-1 text-xs font-normal text-[var(--required)]">必須</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    id={`${formId}-last-name`}
                    className={inputClass}
                    placeholder="姓"
                    aria-label="姓"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                  <input
                    id={`${formId}-first-name`}
                    className={inputClass}
                    placeholder="名"
                    aria-label="名"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-semibold" htmlFor={`${formId}-last-name-kana`}>
                  フリガナ<span className="ml-1 text-xs font-normal text-[var(--required)]">必須</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    id={`${formId}-last-name-kana`}
                    className={inputClass}
                    placeholder="セイ"
                    aria-label="セイ"
                    value={lastNameKana}
                    onChange={(e) => setLastNameKana(e.target.value)}
                    required
                  />
                  <input
                    id={`${formId}-first-name-kana`}
                    className={inputClass}
                    placeholder="メイ"
                    aria-label="メイ"
                    value={firstNameKana}
                    onChange={(e) => setFirstNameKana(e.target.value)}
                    required
                  />
                </div>
              </div>

              <RadioField
                legend="性別"
                required
                name={`${formId}-gender`}
                options={["男性", "女性", "その他"] as const}
                value={gender}
                onChange={setGender}
              />

              <div>
                <label
                  className="mb-1.5 block font-semibold"
                  htmlFor={`${formId}-postal`}
                >
                  郵便番号（ハイフンなし）
                  <span className="ml-1 text-xs font-normal text-[var(--required)]">必須</span>
                </label>
                <input
                  id={`${formId}-postal`}
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="例：1000001"
                  pattern="[0-9]{7}"
                  minLength={7}
                  maxLength={7}
                  title="半角数字7桁で入力してください"
                  value={postalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  required
                />
                <p className="mt-1.5 min-h-[1.2em] text-xs text-[var(--muted)]">
                  {postalCode.length > 0 && postalCode.length < 7 && postalLookup === "idle"
                    ? "半角数字7桁で入力してください"
                    : null}
                  {postalLookup === "loading" && "住所を検索しています…"}
                  {postalLookup === "done" && "住所を自動入力しました。番地・建物名などを続けてご入力ください。"}
                  {postalLookup === "error" && "住所が見つかりませんでした。お手数ですがご住所をご入力ください。"}
                </p>
              </div>

              <div>
                <label
                  className="mb-1.5 block font-semibold"
                  htmlFor={`${formId}-address`}
                >
                  ご住所<span className="ml-1 text-xs font-normal text-[var(--required)]">必須</span>
                </label>
                <input
                  id={`${formId}-address`}
                  className={inputClass}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block font-semibold" htmlFor={`${formId}-phone`}>
                  電話番号<span className="ml-1 text-xs font-normal text-[var(--required)]">必須</span>
                </label>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="例：09012345678（ハイフンなし）"
                  pattern="[0-9]{10,11}"
                  minLength={10}
                  maxLength={11}
                  title="半角数字10桁（固定電話）または11桁（携帯電話）で入力してください"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
                <p className="mt-1.5 min-h-[1.2em] text-xs text-[var(--muted)]">
                  {phone.length > 0 && !isValidPhone(phone)
                    ? "半角数字10桁（固定電話）または11桁（携帯電話）で入力してください"
                    : null}
                </p>
              </div>

              <AllergyField
                legend="アレルギーはありますか？"
                required
                name={`${formId}-allergy`}
                hasAllergy={hasAllergy}
                onHasAllergyChange={setHasAllergy}
                detail={allergyDetail}
                onDetailChange={setAllergyDetail}
              />

              <div>
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={addCompanions}
                    onChange={(e) => {
                      setAddCompanions(e.target.checked);
                      if (!e.target.checked) setCompanions([]);
                    }}
                  />
                  お連れ様を追加する
                </label>

                {addCompanions && (
                  <div className="mt-3 flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {companions.map((companion, index) => (
                        <motion.div
                          key={companion.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                          onAnimationComplete={() => lenis?.resize()}
                          className="overflow-hidden"
                        >
                          <div className="border border-[var(--line)] bg-[var(--card-bg)] p-4">
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span>お連れ様 {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeCompanion(companion.id)}
                                className="text-[var(--required)] underline"
                              >
                                削除
                              </button>
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  placeholder="姓"
                                  aria-label="姓"
                                  className={inputClass}
                                  value={companion.lastName}
                                  onChange={(e) =>
                                    updateCompanion(companion.id, { lastName: e.target.value })
                                  }
                                />
                                <input
                                  placeholder="名"
                                  aria-label="名"
                                  className={inputClass}
                                  value={companion.firstName}
                                  onChange={(e) =>
                                    updateCompanion(companion.id, { firstName: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  placeholder="セイ"
                                  aria-label="セイ"
                                  className={inputClass}
                                  value={companion.lastNameKana}
                                  onChange={(e) =>
                                    updateCompanion(companion.id, { lastNameKana: e.target.value })
                                  }
                                />
                                <input
                                  placeholder="メイ"
                                  aria-label="メイ"
                                  className={inputClass}
                                  value={companion.firstNameKana}
                                  onChange={(e) =>
                                    updateCompanion(companion.id, { firstNameKana: e.target.value })
                                  }
                                />
                              </div>
                              <AllergyField
                                legend="アレルギーはありますか？"
                                name={`${formId}-companion-${companion.id}-allergy`}
                                hasAllergy={companion.hasAllergy}
                                onHasAllergyChange={(v) =>
                                  updateCompanion(companion.id, { hasAllergy: v })
                                }
                                detail={companion.allergyDetail}
                                onDetailChange={(v) =>
                                  updateCompanion(companion.id, { allergyDetail: v })
                                }
                              />
                              <ChildField
                                name={`${formId}-companion-${companion.id}-child`}
                                isChild={companion.isChild}
                                onIsChildChange={(v) =>
                                  updateCompanion(companion.id, {
                                    isChild: v,
                                    age: v ? companion.age : "",
                                  })
                                }
                                age={companion.age}
                                onAgeChange={(v) => updateCompanion(companion.id, { age: v })}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button
                      type="button"
                      data-magnetic
                      onClick={() =>
                        setCompanions((prev) => [...prev, emptyCompanion(nextCompanionId())])
                      }
                      className="self-start rounded-[2px] border border-[var(--line)] bg-[var(--background)] px-3 py-1.5 text-sm"
                    >
                      ＋ お連れ様を追加
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--line)] pt-6">
                <p className="mb-4 font-semibold">お祝いメッセージ</p>

                <div className="mb-4">
                  <label
                    className="mb-1.5 block text-sm"
                    htmlFor={`${formId}-photo`}
                  >
                    写真を追加（任意）
                  </label>
                  <input
                    key={photoInputKey}
                    id={`${formId}-photo`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file && !isPhotoSizeValid(file)) {
                        setPhotoError(
                          `写真のサイズが大きすぎます（${Math.round(MAX_PHOTO_SIZE_BYTES / 1024 / 1024)}MB以下にしてください）`
                        );
                        setPhotoFile(null);
                        setPhotoName("");
                        e.target.value = "";
                        return;
                      }
                      setPhotoError("");
                      setPhotoFile(file);
                      setPhotoName(file?.name ?? "");
                    }}
                    className="w-full rounded-[2px] border border-[var(--line)] bg-[var(--background)] px-3 py-2.5 text-sm file:mr-3 file:rounded-[2px] file:border-0 file:bg-[var(--dark)] file:px-3 file:py-1.5 file:text-[var(--text-on-dark)]"
                  />
                  {photoName && !photoError && (
                    <p className="mt-1.5 text-xs text-[var(--muted)]">選択中: {photoName}</p>
                  )}
                  {photoError && (
                    <p className="mt-1.5 text-xs text-[var(--required)]">{photoError}</p>
                  )}
                </div>

                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder="お祝いメッセージ等をご自由にご記入ください"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                data-magnetic
                className="font-en rounded-[2px] bg-[var(--dark)] py-3.5 tracking-[0.15em] text-[var(--text-on-dark)] disabled:opacity-60"
                disabled={status === "sending"}
              >
                {status === "sending" ? "送信中…" : "送信する"}
              </button>
              <p
                role="status"
                aria-live="polite"
                className={`min-h-[1.4em] text-center text-sm ${
                  status === "error" ? "text-[var(--required)]" : "text-[var(--muted)]"
                }`}
              >
                {status === "sent" && "ご回答ありがとうございました。送信が完了しました。"}
                {status === "error" && "送信に失敗しました。時間をおいて再度お試しください。"}
              </p>
            </form>
          </AnimatedItem>
        </AnimatedSection>
        </div>
      </section>
    </>
  );
}
