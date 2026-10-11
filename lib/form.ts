/** 예약 설문 (DB forms 테이블 한 줄). 관리자 > 설정에서 만들고 고칩니다. */
export type Form = {
  id: string; // 주소: 사이트주소/{id}
  title: string;
  intro: string; // 질문 위 안내 문구
  deadline: string; // "2026-10-13" 이 날짜까지 신청 받음
  slots: { slot: string; place: string }[]; // slot: "2026-10-14 15:00"
  closed: string[]; // 관리자가 닫은 시간
  questions: string[];
};

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
