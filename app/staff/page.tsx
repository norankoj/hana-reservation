"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ROLES } from "@/lib/staff";

// 오이타 현장 STAFF 신청. 포스터처럼 크림 바탕 + 빨강·남색 우표 느낌으로.

const field =
  "w-full border-2 border-[#1f2a44]/15 rounded-xl px-4 py-3.5 text-[17px] outline-none bg-white focus:border-[#a8201a] transition";

export default function StaffPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ name: string; role: string } | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const row = {
      name: String(f.get("name") ?? "").trim(),
      cell: String(f.get("cell") ?? "").trim(),
      role: String(f.get("role")),
    };
    setIsLoading(true);
    const { error } = await supabase.from("staff_signups").insert(row);
    setIsLoading(false);
    if (error) return alert("신청 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    setDone(row);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#e9dcc4] flex justify-center md:py-8 text-[#1f2a44]">
      <main className="w-full max-w-md bg-[#f6eedd] md:rounded-[28px] md:shadow-card-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/staff/poster.webp" alt="오이타 현장 STAFF 모집합니다! 내부, 로비, 외부, 하스피 4가지 역할" className="w-full aspect-[2/3] object-cover" />

        <div className="px-5 pt-6 pb-12">
          {done ? (
            <section className="bg-white rounded-2xl border-2 border-[#a8201a] p-6 text-center animate-fade-in">
              <p className="text-[13px] tracking-[0.25em] font-bold text-[#a8201a]">THANK YOU</p>
              <p className="mt-2 text-[24px] font-extrabold">신청되었어요!</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#1f2a44]/70">
                {done.name}님 · {done.role}
                <br />
                함께 섬겨주셔서 감사합니다.
              </p>
              <button type="button" onClick={() => setDone(null)} className="mt-5 w-full border-2 border-[#1f2a44]/15 font-bold py-3.5 rounded-xl active:scale-[0.98] transition">
                한 명 더 신청하기
              </button>
            </section>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-2xl border-2 border-[#a8201a] p-5 space-y-5">
              <div className="text-center">
                <p className="text-[12px] tracking-[0.3em] font-bold text-[#a8201a]">✦ OITA PROMISE LAND ✦</p>
                <h1 className="mt-1 text-[24px] font-extrabold tracking-tight">현장 STAFF 신청</h1>
              </div>
              <label className="block space-y-1.5">
                <span className="block text-[15px] font-bold">이름</span>
                <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 홍길동" className={field} />
              </label>
              <label className="block space-y-1.5">
                <span className="block text-[15px] font-bold">셀</span>
                <input name="cell" maxLength={30} required placeholder="예: 1A16, 00셀" className={field} />
              </label>
              <fieldset>
                <legend className="text-[15px] font-bold mb-2">섬기고 싶은 역할</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(([r, desc], i) => (
                    <label key={r} className={`cursor-pointer ${i === ROLES.length - 1 ? "col-span-2" : ""}`}>
                      <input type="radio" name="role" value={r} required className="peer sr-only" />
                      <span className="block text-center px-2 py-3 rounded-xl border-2 border-[#1f2a44]/15 peer-checked:bg-[#a8201a] peer-checked:text-white peer-checked:border-[#a8201a] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1f2a44] transition">
                        <span className="block text-[17px] font-extrabold">{r}</span>
                        <span className="block text-[13px] opacity-75">{desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#1f2a44] text-white font-bold py-4 rounded-xl text-lg active:scale-[0.98] transition disabled:bg-gray-300"
              >
                {isLoading ? "신청 중입니다..." : "신청하기"}
              </button>
              <p className="text-center text-[13px] text-[#1f2a44]/60">현장 상황에 따라 필요 인원 및 역할이 바뀔 수 있어요.</p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
