"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { today } from "@/lib/form";
import { info } from "../info";
import { FormShell, field, chip, submitBtn } from "../FormShell";

// 개별 항공 참가자 팀 담당자 제출. 혼자 가는 분도 받아서 묶어 줌. 값은 DB 체크 supabase/japan.sql 과 같게
const KINDS = [
  ["팀", "팀 담당자예요"],
  ["혼자", "혼자 이동해요"],
] as const;

export default function JapanTeamPage() {
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState<"팀" | "혼자">("팀");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ name: string; kind: string } | null>(null);
  const ended = today() > info.formDeadline;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const row = {
      kind,
      name: String(f.get("name") ?? "").trim(),
      phone,
      cell: String(f.get("cell") ?? "").trim(),
      members: kind === "팀" ? String(f.get("members") ?? "").trim() : "",
      memo: String(f.get("memo") ?? "").trim(),
    };
    setIsLoading(true);
    const { error } = await supabase.from("japan_team_signups").insert(row);
    setIsLoading(false);
    if (error)
      return alert(error.code === "42501" ? "제출이 마감되었습니다." : error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "제출 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    setDone(row);
    setPhone("");
    window.scrollTo(0, 0);
  };

  return (
    <FormShell title="팀 담당자 제출">
      <section className="bg-white rounded-2xl border-2 border-[#1f2a44]/10 p-5 space-y-2 text-center">
        <p className="text-[17px] font-bold text-balance">개별 항공으로 가시는 분은 팀마다 담당자를 정해 함께 가는 분들을 알려 주세요.</p>
        <p className="text-[16px] text-[#1f2a44]/75 text-balance">{info.leaderSolo}</p>
        <p className="font-extrabold">제출 기한 · <span className="text-[#a8201a]">{info.leaderDeadline}</span>까지</p>
      </section>

      {done ? (
        <section className="bg-white rounded-2xl border-2 border-[#a8201a] p-6 text-center animate-fade-in">
          <p className="text-[24px] font-extrabold">제출되었어요!</p>
          <p className="mt-3 text-[17px] leading-relaxed text-[#1f2a44]/75">
            {done.name}님 · {done.kind === "팀" ? "팀 담당자" : "혼자 이동"}
            <br />
            {done.kind === "팀" ? "팀원들의 위치와 이동 상황을 잘 살펴 주세요." : "함께 다닐 수 있도록 연결해 드릴게요."}
          </p>
          <button type="button" onClick={() => setDone(null)} className="mt-5 w-full border-2 border-[#1f2a44]/15 font-bold py-3.5 rounded-xl active:scale-[0.98] transition">
            한 명 더 제출하기
          </button>
        </section>
      ) : ended ? (
        <p className="bg-white rounded-2xl border-2 border-[#1f2a44]/10 p-8 text-center font-bold text-[#1f2a44]/60">제출이 마감되었습니다.</p>
      ) : (
        <form onSubmit={submit} className="bg-white rounded-2xl border-2 border-[#a8201a] p-5 space-y-5">
          <fieldset>
            <legend className="text-[16px] font-bold mb-2">어떻게 가시나요?</legend>
            <div className="grid grid-cols-2 gap-2">
              {KINDS.map(([k, label]) => (
                <label key={k} className="cursor-pointer">
                  <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="peer sr-only" />
                  <span className={chip}>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1.5">
            <span className="block text-[16px] font-bold">{kind === "팀" ? "담당자 이름" : "이름"}</span>
            <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 홍길동" className={field} />
          </label>
          <label className="block space-y-1.5">
            <span className="block text-[16px] font-bold">연락처</span>
            <input
              type="tel" inputMode="numeric" autoComplete="tel-national" pattern="01\d-\d{3,4}-\d{4}"
              title="010-1234-5678 형식으로 입력해 주세요." value={phone} maxLength={13}
              onChange={(e) => setPhone(formatPhone(e.target.value))} required placeholder="010-1234-5678" className={field}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="block text-[16px] font-bold">셀</span>
            <input name="cell" maxLength={30} required placeholder="예: 1A16, 00셀" className={field} />
          </label>
          {kind === "팀" && (
            <label className="block space-y-1.5">
              <span className="block text-[16px] font-bold">함께 가는 분</span>
              <span className="block text-[15px] text-[#1f2a44]/70">담당자를 뺀 팀원 이름을 적어 주세요. 셀이 다르면 셀도 같이요.</span>
              <textarea name="members" rows={4} maxLength={500} required placeholder={"예: 김하나, 이두리(1A16), 박세찬"} className={field} />
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="block text-[16px] font-bold">항공편·이동 일정</span>
            <span className="block text-[15px] text-[#1f2a44]/70">항공편명, 도착 예정 시간 등 이동 일정을 적어 주세요.</span>
            <textarea name="memo" rows={2} maxLength={300} required placeholder="예: 항공편명, 11/19 15:30 도착" className={field} />
          </label>
          <button type="submit" disabled={isLoading} className={submitBtn}>
            {isLoading ? "제출 중입니다..." : "제출하기"}
          </button>
        </form>
      )}
    </FormShell>
  );
}
