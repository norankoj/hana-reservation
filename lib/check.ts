// 실행: npm run check
import assert from "node:assert/strict";
import { slotLabel, questionsOf } from "./form.ts";
import { formatPhone } from "./phone.ts";
import { chosung, matches } from "./hangul.ts";
import { parseRoster } from "./shuttle.ts";
import { unitPrice, lineError, addLine, total } from "./goods.ts";
import { excelRows, fillOrderForm, readZip, unzipText } from "./xlsx.ts";
import { readFileSync } from "node:fs";

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

// 셔틀 명단 검색: 초성만 쳐도 찾아짐
assert.equal(chosung("김선애"), "ㄱㅅㅇ");
assert.equal(chosung("이현우B"), "ㅇㅎㅇB"); // 동명이인 뒤에 붙는 알파벳은 그대로
assert.ok(matches("ㄱㅅㅇ", "김선애"));
assert.ok(matches("ㄱㅅ", "김선애")); // 앞부분만 쳐도
assert.ok(matches("ㅅㅇ", "김선애")); // 가운데부터 쳐도
assert.ok(!matches("ㄱㅈ", "김선애"));
assert.ok(matches("선애", "김선애")); // 글자로 치면 그대로
assert.ok(matches("", "아무개")); // 빈 검색어는 전부
assert.ok(matches("UCM", "김세은", "UCM")); // 소속도 검색 대상
assert.ok(!matches("ㄱㅅㅇ", "UCM")); // 초성 검색이 영문 소속에 잘못 걸리지 않음

// 셔틀 명단 붙여넣기: 머리글·번호 칸은 건너뛰고, 번호는 010-1234-5678 꼴로 고쳐 줍니다
const pasted = parseRoster(
  [
    "번호\t이름\t소속\t연락처\t탑승여부", // 머리글
    "1\t강순철\t3A01\t010-2256-2400\t왕복",
    "2\t강지연\t3A10\t1055547490\t귀가만", // 하이픈 없이, 앞 0 빠짐
    "3\t김선애\t3B14\t010-7646-3801\t가는 편만", // 다른 표기
    "조은희,3C18,010-8848-2464,", // 쉼표 구분 + 탑승 비어 있음(왕복)
    "여승훈\tUCM\t/\t왕복", // 번호 없음
  ].join("\n"),
);
assert.equal(pasted.errors.length, 0);
assert.equal(pasted.rows.length, 5);
assert.deepEqual(pasted.rows[1], { name: "강지연", affil: "3A10", phone: "010-5554-7490", route: "귀가만" });
assert.equal(pasted.rows[2].route, "출발만"); // 「가는 편만」 → 출발만
assert.deepEqual(pasted.rows[3], { name: "조은희", affil: "3C18", phone: "010-8848-2464", route: "왕복" });
assert.equal(pasted.rows[4].phone, ""); // 「/」 는 번호 없음으로
// 알 수 없는 탑승과 이름 중복은 줄 번호와 함께 알려 줍니다
const bad = parseRoster("김하나\t1A01\t010-1111-2222\t편도\n김하나\t1A01\t010-1111-2222\t왕복");
assert.equal(bad.rows.length, 1);
assert.equal(bad.errors.length, 1);
assert.match(bad.errors[0], /김하나/);

// 굿즈: 엑셀(상품표)과 같은 할인가, 세트/사이즈 검사, 엑셀 붙여넣기 줄
assert.equal(unitPrice("후드집업 - 그레이"), 46800);
assert.equal(unitPrice("네임택 - 웨이브"), 4050);
assert.equal(unitPrice("올인원 세트"), 28800);
const set = { item: "올인원 세트", bandana: "레드 웨이브", bag: "화이트", keyring: "1 스탬프", qty: 1 };
assert.equal(lineError(set), null);
assert.equal(lineError({ ...set, bag: undefined }), "세트 구성 확인");
assert.equal(lineError({ item: "후드집업 - 블랙", size: "XS", qty: 1 }), "사이즈 확인");
assert.equal(lineError({ item: "스티커팩", qty: 2 }), null);
const lines = addLine(addLine([], { item: "스티커팩", qty: 1 }), { item: "스티커팩", qty: 2 });
assert.deepEqual(lines, [{ item: "스티커팩", qty: 3 }]);
assert.equal(total([...lines, set]), 2700 * 3 + 28800);
assert.equal(excelRows([{ name: "홍길동", items: [set] }]), "홍길동\t올인원 세트\t\t레드 웨이브\t화이트\t1 스탬프\t1");

// 공식 주문서 채우기: 다시 열어서 칸에 값이 들어갔는지, 나머지 파일은 그대로인지
const tpl = new Uint8Array(readFileSync(new URL("../public/goods/order-template.xlsx", import.meta.url)));
const out = new Uint8Array(await (await fillOrderForm(tpl, [
  { name: "김<하나>", items: [set, { item: "후드집업 - 블랙", size: "L", qty: 2 }] },
])).arrayBuffer());
const entries = readZip(out);
assert.equal(entries.length, readZip(tpl).length);
const sheet = await unzipText(entries.find((e) => e.name === "xl/worksheets/sheet2.xml")!);
assert.match(sheet, /<c r="B6" s="\d+" t="inlineStr"><is><t xml:space="preserve">김&lt;하나&gt;<\/t><\/is><\/c>/);
assert.match(sheet, /<c r="E6" s="\d+" t="inlineStr"><is><t xml:space="preserve">레드 웨이브</);
assert.match(sheet, /<c r="D7" s="\d+" t="inlineStr"><is><t xml:space="preserve">L</);
assert.match(sheet, /<c r="H7" s="\d+"><v>2<\/v><\/c>/);
assert.match(sheet, /<c r="I6"[^>]*><f[ >]/); // 수식 그대로
assert.match(await unzipText(entries.find((e) => e.name === "xl/workbook.xml")!), /fullCalcOnLoad="1"/);
if (process.env.XLSX_OUT) (await import("node:fs")).writeFileSync(process.env.XLSX_OUT, out);

console.log("✅ lib 검증 통과");
