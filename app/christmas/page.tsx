"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { today } from "@/lib/form";
import { Check } from "lucide-react";
import { info } from "./info";
import { Photos } from "./Photos";

// 크리스마스 마켓 스탭 모집. 작년 전단지 톤(성탄 빨강 + 크림 + 초록 이름표)을 그대로 씁니다.
// 스탭 카드가 곧 신청서 체크박스입니다. 문구·사진은 ./info.ts, 명단은 /admin/christmas
const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#a3162a]";
const field = "w-full border-2 border-[#3a1a14]/15 rounded-xl px-4 py-3.5 text-[17px] bg-white outline-none focus:border-[#a3162a] transition placeholder:text-[#3a1a14]/45";
const pill = "inline-block rounded-full bg-[#2f5a34] px-3 py-0.5 text-[15px] font-bold text-[#fbefe0]";

export default function ChristmasPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; role: string } | null>(null);
  const ended = today() > info.formDeadline;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const row = {
      name: String(f.get("name") ?? "").trim(),
      phone,
      cell: String(f.get("cell") ?? "").trim(),
      role: String(f.get("role") ?? ""),
      memo: String(f.get("memo") ?? "").trim(),
    };
    if (!row.role) return setError("현장스탭·코스튬 스탭 중 하나를 골라 주세요.");
    setError("");
    setIsLoading(true);
    const { error } = await supabase.from("christmas_signups").insert(row);
    setIsLoading(false);
    if (error)
      return setError(error.code === "42501" ? "신청이 마감되었습니다." : error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    setDone(row);
    setPhone("");
    document.getElementById("apply")?.scrollIntoView();
  };

  return (
    <div className="min-h-[100dvh] bg-[#efdcc6] flex justify-center md:py-8 text-[#3a1a14] text-[17px] leading-relaxed break-keep">
      <main className="w-full max-w-md bg-[#fbefe0] md:rounded-[28px] md:shadow-[0_12px_40px_rgba(110,20,30,0.18)] overflow-hidden">
        {/* 히어로: 문구 + 작년 무대 사진 */}
        <header className="bg-[#a3162a] text-[#fbefe0]">
          <div className="px-6 pt-10 pb-8">
            <p className="text-[14px] font-bold tracking-[0.25em] text-[#f5c873] animate-fade-in">MERRY CHRISTMAS</p>
            <h1 className="mt-3 whitespace-pre-line text-[36px] font-extrabold leading-[1.15] tracking-tight animate-fade-in">{info.headline}</h1>
            <p className="mt-4 max-w-[30ch] text-[17px] text-[#fbefe0]/85 animate-fade-in">{info.lead}</p>
            {!ended && (
              <a href="#apply" className={`mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#fbefe0] px-8 text-[17px] font-extrabold text-[#a3162a] transition hover:bg-white active:scale-[0.98] ${focus}`}>
                신청하기
              </a>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/christmas/band.webp" alt="작년 마켓, 트리 앞 무대 공연" width={960} height={724} fetchPriority="high" className="block aspect-[4/3] w-full object-cover" />
        </header>

        <div className="pt-7 pb-12 space-y-10">
          {/* 일시·장소 */}
          <section className="reveal px-5">
            <dl className="space-y-4">
              {info.facts.map((f) => (
                <div key={f.label}>
                  <dt className={pill}>{f.label}</dt>
                  <dd className="mt-1.5 whitespace-pre-line font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 작년 마켓 사진: 누르면 크게, 옆으로 넘겨 보기 */}
          <section className="reveal">
            <Photos />
          </section>

          {/* 신청 */}
          <section id="apply" className="scroll-mt-4 px-4">
            {done ? (
              <div className="rounded-2xl border-2 border-[#a3162a] bg-white p-6 text-center animate-fade-in" role="status">
                <p className="text-[24px] font-extrabold">신청되었어요</p>
                <p className="mt-3 text-[17px] text-[#3a1a14]/75">
                  {done.name}님, 함께해 주셔서 감사해요.
                  <br />
                  {done.role} 담당자가 연락드릴게요.
                </p>
                <button type="button" onClick={() => setDone(null)} className={`mt-5 w-full rounded-xl border-2 border-[#3a1a14]/15 py-3.5 font-bold transition active:scale-[0.98] ${focus}`}>
                  한 명 더 신청하기
                </button>
              </div>
            ) : ended ? (
              <p className="rounded-2xl border-2 border-[#3a1a14]/10 bg-white p-8 text-center font-bold text-[#3a1a14]/60">신청이 마감되었습니다.</p>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <fieldset>
                  <legend className="px-1 text-[22px] font-extrabold tracking-tight">스탭모집!</legend>
                  <p className="px-1 mt-1 text-[16px] font-semibold text-[#3a1a14]/70">하나만 골라 주세요.</p>
                  <div className="mt-3 space-y-3">
                    {info.roles.map((r) => (
                      <label key={r.name} className="group relative block cursor-pointer">
                        <input type="radio" name="role" value={r.name} className="peer sr-only" />
                        <span className="block overflow-hidden rounded-2xl border-2 border-[#3a1a14]/10 bg-white transition peer-checked:border-[#a3162a] peer-checked:shadow-[0_8px_24px_rgba(163,22,42,0.18)] peer-focus-visible:ring-2 peer-focus-visible:ring-[#a3162a] peer-focus-visible:ring-offset-2 active:scale-[0.99]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/christmas/${r.image}`} alt="" loading="lazy" className="block aspect-[16/9] w-full object-cover" />
                          <span className="block p-4">
                            <span className="block pr-9 text-[20px] font-extrabold">{r.name}</span>
                            <span className="mt-0.5 block text-[16px] text-[#3a1a14]/75">{r.desc}</span>
                          </span>
                        </span>
                        <span aria-hidden className="pointer-events-none absolute right-3 top-3 grid size-8 place-items-center rounded-full border-2 border-white bg-black/25 text-transparent backdrop-blur-sm transition peer-checked:border-[#a3162a] peer-checked:bg-[#a3162a] peer-checked:text-white">
                          <Check size={18} strokeWidth={3} />
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-5 rounded-2xl border-2 border-[#3a1a14]/10 bg-white p-5">
                  <label className="block space-y-1.5">
                    <span className="block text-[16px] font-bold">이름</span>
                    <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 김하은" className={field} />
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
                  <label className="block space-y-1.5">
                    <span className="block text-[16px] font-bold">
                      남기실 말 <span className="text-[15px] font-semibold text-[#3a1a14]/60">(선택)</span>
                    </span>
                    <textarea name="memo" maxLength={300} rows={3} placeholder="예: 오후 2시부터 가능해요" className={`${field} resize-none`} />
                  </label>

                  {error && <p className="text-[16px] font-bold text-[#a3162a]" role="alert">{error}</p>}
                  <button type="submit" disabled={isLoading} className={`w-full rounded-xl bg-[#a3162a] py-4 text-lg font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:bg-gray-300 ${focus}`}>
                    {isLoading ? "신청 중입니다..." : "신청하기"}
                  </button>
                  <p className="text-center text-[16px] font-bold">
                    <b className="font-extrabold text-[#a3162a]">{info.deadlineLabel}</b>까지 신청받아요
                  </p>
                </div>
              </form>
            )}
          </section>

          <p className="px-5 text-center text-[16px] font-semibold text-[#3a1a14]/70">
            {info.contactLink ? (
              <a href={info.contactLink} className="underline underline-offset-4">{info.contactLabel}</a>
            ) : (
              info.contactLabel
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
