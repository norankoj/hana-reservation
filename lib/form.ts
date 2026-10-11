/** 질문 형식 (구글 설문지와 같은 이름) */
export const QUESTION_TYPES = {
  short: "단답형",
  long: "장문형",
  radio: "객관식 (하나 선택)",
  checkbox: "체크박스 (여러 개 선택)",
  select: "드롭다운",
} as const;
export type QuestionType = keyof typeof QUESTION_TYPES;

export type Question = {
  label: string; // 답변은 이 글을 키로 저장됨
  type: QuestionType;
  options: string[]; // 객관식/체크박스/드롭다운의 보기
  required: boolean;
};

export const hasOptions = (t: QuestionType) => t === "radio" || t === "checkbox" || t === "select";

/** 예약 설문 (DB forms 테이블 한 줄). 관리자 > 설정에서 만들고 고칩니다. */
export type Form = {
  id: string; // 주소: 사이트주소/{id}
  title: string;
  intro: string; // 질문 위 안내 문구
  deadline: string; // "2026-10-13" 이 날짜까지 신청 받음
  slots: { slot: string; place: string }[]; // slot: "2026-10-14 15:00"
  closed: string[]; // 관리자가 닫은 시간
  questions: (Question | string)[]; // 예전 설문은 글만 저장돼 있음 → questionsOf 로 읽기
};

/** 질문 목록. 예전 형식(글만)은 필수 장문형으로 읽음 */
export const questionsOf = (f: Pick<Form, "questions">): Question[] =>
  f.questions.map((q) =>
    typeof q === "string" ? { label: q, type: "long", options: [], required: true } : q,
  );

const WEEKDAYS = ["주일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-14 15:00" → { date: "10월 14일 (수)", time: "오후 3시" } */
export const slotLabel = (slot: string) => {
  const [d, t] = slot.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const wd = WEEKDAYS[new Date(y, m - 1, day).getDay()];
  const hour = h > 12 ? h - 12 : h;
  return {
    date: `${m}월 ${day}일 (${wd})`,
    time: `${h < 12 ? "오전" : "오후"} ${hour}시${min ? ` ${min}분` : ""}`,
  };
};

/** 오늘 날짜 "2026-10-14" (보는 기기 시간 기준. 마감 최종 판정은 DB 가 한국 시간으로 함) */
export const today = () => new Date().toLocaleDateString("sv-SE");
