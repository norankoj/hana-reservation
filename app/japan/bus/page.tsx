"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { today } from "@/lib/form";
import { info } from "../info";
import { FormShell, field, chip, submitBtn } from "../FormShell";

// 인천공항행 버스 신청. 단체·개별 항공 누구나. 값은 DB 체크 supabase/japan.sql 과 같게
const ROUTES = ["왕복", "가는 편만", "오는 편만"] as const;
const FLIGHTS = ["단체 항공", "개별 항공"] as const;

export default function JapanBusPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ name: string; route: string } | null>(null);
  const ended = today() > info.formDeadline;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const row = {
      name: String(f.get("name") ?? "").trim(),
      phone,
      cell: String(f.get("cell") ?? "").trim(),
      route: String(f.get("route")),
      flight: String(f.get("flight")),
    };
    setIsLoading(true);
    const { error } = await supabase.from("japan_bus_signups").insert(row);
    setIsLoading(false);
    if (error)
      return alert(error.code === "42501" ? "신청이 마감되었습니다." : error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "신청 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    setDone(row);
    setPhone("");
    window.scrollTo(0, 0);
  };

  return (
    <FormShell title="인천공항행 버스 신청">
      {/* 버스 시간 */}
      <section className="bg-white rounded-2xl border-2 border-[#1f2a44]/10 px-5 py-1 divide-y divide-[#1f2a44]/10">
        {info.busLegs.map((l) => (
          <div key={l.label} className="flex items-center gap-4 py-4">
            <span className="w-20 shrink-0 leading-snug">
              <span className="block text-[15px] font-bold text-[#a8201a]">{l.label}</span>
              <span className="block font-bold">{l.date}</span>
            </span>
            <span className="leading-snug">
              <span className="block text-[24px] font-extrabold tracking-tight">{l.time}</span>
              <span className="block text-[15px] text-[#1f2a44]/70">{l.note}</span>
            </span>
          </div>
        ))}
        <div className="flex items-center gap-4 py-4">
          <span className="w-20 shrink-0 text-[15px] font-bold text-[#a8201a]">차비</span>
          <p className="font-bold">{info.busFare || "편도/왕복 추후 공지"}</p>
        </div>
      </section>

      {done ? (
        <section className="bg-white rounded-2xl border-2 border-[#a8201a] p-6 text-center animate-fade-in">
          <p className="text-[24px] font-extrabold">신청되었어요!</p>
          <p className="mt-3 text-[17px] leading-relaxed text-[#1f2a44]/75">
            {done.name}님 · {done.route}
            <br />
            차비와 탑승 장소는 추후 공지해 드릴게요.
          </p>
          <button type="button" onClick={() => setDone(null)} className="mt-5 w-full border-2 border-[#1f2a44]/15 font-bold py-3.5 rounded-xl active:scale-[0.98] transition">
            한 명 더 신청하기
          </button>
        </section>
      ) : ended ? (
        <p className="bg-white rounded-2xl border-2 border-[#1f2a44]/10 p-8 text-center font-bold text-[#1f2a44]/60">신청이 마감되었습니다.</p>
      ) : (
        <form onSubmit={submit} className="bg-white rounded-2xl border-2 border-[#a8201a] p-5 space-y-5">
          <label className="block space-y-1.5">
            <span className="block text-[16px] font-bold">이름</span>
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
          <fieldset>
            <legend className="text-[16px] font-bold mb-2">탑승</legend>
            <div className="grid grid-cols-3 gap-2">
              {ROUTES.map((r) => (
                <label key={r} className="cursor-pointer">
                  <input type="radio" name="route" value={r} defaultChecked={r === "왕복"} className="peer sr-only" />
                  <span className={chip}>{r}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[16px] font-bold mb-2">항공</legend>
            <div className="grid grid-cols-2 gap-2">
              {FLIGHTS.map((r) => (
                <label key={r} className="cursor-pointer">
                  <input type="radio" name="flight" value={r} required className="peer sr-only" />
                  <span className={chip}>{r}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" disabled={isLoading} className={submitBtn}>
            {isLoading ? "신청 중입니다..." : "신청하기"}
          </button>
          <p className="text-center text-[16px] font-bold"><b className="font-extrabold text-[#a8201a]">{info.busDeadline}</b>까지 신청받아요</p>
        </form>
      )}
    </FormShell>
  );
}
