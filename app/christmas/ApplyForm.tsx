"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { today } from "@/lib/form";
import { info } from "./info";

// 현장스탭(/christmas)·코스튬 스탭(/christmas-play) 신청서 공통. 고르는 칸(name="role")은 children 으로 받습니다.
// 둘 다 christmas_signups 에 저장, role 로 구분 (rolePrefix 를 주면 앞에 붙임)
export const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-xmas-red";
const field = "w-full border-2 border-xmas-ink/15 rounded-xl px-4 py-3.5 text-[17px] bg-white outline-none focus:border-xmas-red transition placeholder:text-xmas-ink/45";

export function ApplyForm({
  children,
  emptyRole,
  rolePrefix = "",
  memoPlaceholder = "예: 최선을 다하겠습니다!",
  deadline = info.formDeadline,
  deadlineLabel = info.deadlineLabel,
}: {
  children: React.ReactNode;
  emptyRole: string; // 아무것도 안 골랐을 때 오류 문구
  rolePrefix?: string;
  memoPlaceholder?: string;
  deadline?: string; // "2026-11-21" 이 날짜까지 받음. 기본은 스탭 마감일
  deadlineLabel?: string;
}) {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; role: string } | null>(null);
  const ended = today() > deadline;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const role = String(f.get("role") ?? "");
    if (!role) return setError(emptyRole);
    const row = {
      name: String(f.get("name") ?? "").trim(),
      phone,
      cell: String(f.get("cell") ?? "").trim(),
      role: rolePrefix + role,
      memo: String(f.get("memo") ?? "").trim(),
    };
    setError("");
    setIsLoading(true);
    const { error } = await supabase.from("christmas_signups").insert(row);
    setIsLoading(false);
    if (error)
      return setError(error.code === "42501" ? "신청이 마감되었습니다." : error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    setDone({ name: row.name, role });
    setPhone("");
    document.getElementById("apply")?.scrollIntoView();
  };

  if (done)
    return (
      <div className="rounded-2xl border-2 border-xmas-red bg-white p-6 text-center animate-fade-in" role="status">
        <p className="text-[22px] font-extrabold">신청되었어요</p>
        <p className="mt-3 text-[17px] text-xmas-ink/75">
          {done.name}님, 함께해 주셔서 감사해요.
          <br />
          {done.role} 담당자가 연락드릴게요.
        </p>
        <button type="button" onClick={() => setDone(null)} className={`mt-5 w-full rounded-xl border-2 border-xmas-ink/15 py-3.5 font-bold transition active:scale-[0.98] ${focus}`}>
          한 명 더 신청하기
        </button>
      </div>
    );

  if (ended)
    return <p className="rounded-2xl border-2 border-xmas-ink/10 bg-white p-8 text-center font-bold text-xmas-ink/60">신청이 마감되었습니다.</p>;

  return (
    <form onSubmit={submit} className="space-y-6">
      {children}

      <div className="space-y-5 rounded-2xl border-2 border-xmas-ink/10 bg-white p-5">
        <label className="block space-y-1.5">
          <span className="block text-[17px] font-bold">이름</span>
          <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 김하은" className={field} />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-[17px] font-bold">연락처</span>
          <input
            type="tel" inputMode="numeric" autoComplete="tel-national" pattern="01\d-\d{3,4}-\d{4}"
            title="010-1234-5678 형식으로 입력해 주세요." value={phone} maxLength={13}
            onChange={(e) => setPhone(formatPhone(e.target.value))} required placeholder="010-1234-5678" className={field}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-[17px] font-bold">셀</span>
          <input name="cell" maxLength={30} required placeholder="예: 1A16, 00셀" className={field} />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-[17px] font-bold">
            남기실 말 <span className="text-[15px] font-semibold text-xmas-ink/60">(선택)</span>
          </span>
          <textarea name="memo" maxLength={300} rows={3} placeholder={memoPlaceholder} className={`${field} resize-none`} />
        </label>

        {error && <p className="text-[17px] font-bold text-xmas-red" role="alert">{error}</p>}
        <button type="submit" disabled={isLoading} className={`w-full rounded-xl bg-xmas-red py-4 text-lg font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:bg-xmas-ink/25 ${focus}`}>
          {isLoading ? "신청 중입니다..." : "신청하기"}
        </button>
        <p className="text-center text-[17px] font-bold">
          <b className="font-extrabold text-xmas-red">{deadlineLabel}</b>까지 신청받아요
        </p>
      </div>
    </form>
  );
}
