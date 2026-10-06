// 실행: npm run check
import assert from "node:assert/strict";
import { slotLabel } from "./interview.ts";
import { formatPhone } from "./phone.ts";

assert.deepEqual(slotLabel("2026-10-14 15:00"), { date: "10월 14일 (수)", time: "오후 3시" });
assert.equal(slotLabel("2026-11-07 09:30").time, "오전 9시 30분");
assert.equal(slotLabel("2026-10-25 16:00").date, "10월 25일 (주일)");

assert.equal(formatPhone("01012345678"), "010-1234-5678");
assert.equal(formatPhone("010-1234-"), "010-123-4");

console.log("✅ lib 검증 통과");
