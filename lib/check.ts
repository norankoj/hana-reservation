// 실행: npm run check
import assert from "node:assert/strict";
import { slotLabel, questionsOf } from "./form.ts";
import { formatPhone } from "./phone.ts";

assert.deepEqual(slotLabel("2026-10-14 15:00"), { date: "10월 14일 (수)", time: "오후 3시" });
assert.equal(slotLabel("2026-11-07 09:30").time, "오전 9시 30분");
assert.equal(slotLabel("2026-10-25 16:00").date, "10월 25일 (주일)");

// 예전 질문(글만)과 새 질문이 섞여 있어도 같은 모양으로 읽힘
const qs = questionsOf({
  questions: ["자기소개", { label: "성별", type: "radio", options: ["남", "여"], required: false }],
});
assert.deepEqual(qs[0], { label: "자기소개", type: "long", options: [], required: true });
assert.equal(qs[1].type, "radio");

assert.equal(formatPhone("01012345678"), "010-1234-5678");
assert.equal(formatPhone("010-1234-"), "010-123-4");

console.log("✅ lib 검증 통과");
