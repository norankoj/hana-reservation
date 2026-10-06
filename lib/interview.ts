/** 신청 마감: 이 날짜까지(한국 시간) 받습니다. 바꾸면 supabase/interview.sql 의 날짜도 같이 바꾸고 다시 실행하세요. */
export const INTERVIEW_DEADLINE = "2026-10-13";

/** 면담 일정. 일정을 바꾸려면 여기만 고치면 됩니다. ("날짜 시:분", 장소) */
export const INTERVIEW_SLOTS: { slot: string; place?: string }[] = [
  { slot: "2026-10-14 15:00" },
  { slot: "2026-10-15 10:00" },
  { slot: "2026-10-21 15:00" },
  { slot: "2026-10-22 10:00" },
  { slot: "2026-10-25 16:00", place: "창보센" },
  { slot: "2026-10-28 15:00" },
  { slot: "2026-10-29 10:00" },
  { slot: "2026-11-04 15:00" },
  { slot: "2026-11-05 10:00" },
  { slot: "2026-11-07 09:30" },
  { slot: "2026-11-07 11:00" },
  { slot: "2026-11-11 15:00" },
  { slot: "2026-11-12 10:00" },
  { slot: "2026-11-15 16:00", place: "창보센" },
  { slot: "2026-11-18 15:00" },
  { slot: "2026-11-19 10:00" },
  { slot: "2026-11-21 09:30" },
  { slot: "2026-11-21 11:00" },
  { slot: "2026-11-22 16:00", place: "창보센" },
];

/** 사전 질문. 한 줄 추가하면 신청서에 칸이 하나 늘어납니다. (답변은 질문 글을 키로 저장) */
export const INTERVIEW_QUESTIONS = [
  "간단한 자기소개",
  "어떤 형태로, 어느 나라에 가고자 하시나요?",
  "내가 생각하는 '셀'의 의미",
  "희망 출국 시기",
  "면담 시 나누고 싶은 내용이나 질문",
];

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
