"use client";

import { useState } from "react";
import { Noto_Serif_KR } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { today } from "@/lib/form";

// 결혼식 버스 신청. 굿즈·면담과 다르게 청첩장 느낌(아이보리 + 명조)으로.
const serif = Noto_Serif_KR({ weight: ["400", "600"], preload: false });

const DEADLINE = "2026-11-01"; // DB 정책 supabase/bus.sql 과 같게
const LETTER = "https://salondeletter.com/w/x9dy9cwsmy";
const ROUTES = ["왕복", "가는 편만", "오는 편만"] as const;
const field =
  "w-full border border-[#e4dccf] rounded-xl px-4 py-3.5 text-[17px] outline-none bg-white focus:border-[#b08d6e] transition";

export default function BusPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ name: string; route: string } | null>(null);
  const ended = today() > DEADLINE;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const row = {
      name: String(f.get("name") ?? "").trim(),
      phone,
      route: String(f.get("route")),
      memo: String(f.get("memo") ?? "").trim(),
    };
    setIsLoading(true);
    const { error } = await supabase.from("bus_signups").insert(row);
    setIsLoading(false);
    if (error)
      return alert(error.code === "42501" ? "신청이 마감되었습니다." : error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "신청 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    setDone(row);
    setPhone("");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f4efe8] flex justify-center md:py-8 text-[#3b342e]">
      <main className="w-full max-w-md bg-[#fbf8f3] md:rounded-[28px] md:shadow-card-lg overflow-hidden">
        {/* 사진 + 이름 */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bus/forever.webp" alt="석의찬, 이수현 웨딩 사진" className="w-full aspect-[619/966] object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fbf8f3] to-transparent" />
        </div>
        <header className={`${serif.className} -mt-10 relative text-center px-6`}>
          <p className="text-[13px] tracking-[0.3em] text-[#b08d6e]">WEDDING BUS</p>
          <h1 className="mt-3 text-[26px] font-semibold tracking-tight">
            석의찬 <span className="text-[#c9a48a] font-normal">&</span> 이수현
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6b625a]">
            2026년 11월 7일 토요일 오후 2시
            <br />
            서울대 이라운지
          </p>
        </header>

        <div className="px-5 pt-8 pb-12 space-y-5">
          {/* 버스 시간표 */}
          <section className="bg-white rounded-2xl border border-[#ece4d8] px-5 py-1 divide-y divide-[#f0eae0]">
            {[
              ["가는 편", "오전 11:30", "교육관 주차장", "서울대 이라운지"],
              ["오는 편", "오후 4:00", "서울대 이라운지", "교육관 주차장"],
            ].map(([label, time, from, to]) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <span className="w-14 shrink-0 text-[13px] font-bold text-[#b08d6e]">{label}</span>
                <div>
                  <p className={`${serif.className} text-[22px] font-semibold tabular-nums`}>{time}</p>
                  <p className="text-[14px] text-[#6b625a]">{from} 출발 → {to}</p>
                </div>
              </div>
            ))}
          </section>

          {done ? (
            <section className="bg-white rounded-2xl border border-[#ece4d8] p-6 text-center animate-fade-in">
              <p className={`${serif.className} text-[22px] font-semibold`}>신청되었어요</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6b625a]">
                {done.name}님 · {done.route}
                <br />
                {done.route !== "오는 편만" && "11월 7일 오전 11시 30분, 교육관 주차장에서 만나요."}
              </p>
              <button type="button" onClick={() => setDone(null)} className="mt-5 w-full border border-[#e4dccf] font-bold py-3.5 rounded-xl active:scale-[0.98] transition">
                한 명 더 신청하기
              </button>
            </section>
          ) : ended ? (
            <p className="bg-white rounded-2xl border border-[#ece4d8] p-8 text-center font-bold text-[#8f857b]">신청이 마감되었습니다.</p>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-2xl border border-[#ece4d8] p-5 space-y-5">
              <h2 className={`${serif.className} text-xl font-semibold`}>버스 탑승 신청</h2>
              <label className="block space-y-1.5">
                <span className="block text-[15px] font-bold">성함</span>
                <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 홍길동" className={field} />
              </label>
              <label className="block space-y-1.5">
                <span className="block text-[15px] font-bold">연락처</span>
                <input
                  type="tel" inputMode="numeric" autoComplete="tel-national" pattern="01\d-\d{3,4}-\d{4}"
                  title="010-1234-5678 형식으로 입력해 주세요." value={phone} maxLength={13}
                  onChange={(e) => setPhone(formatPhone(e.target.value))} required placeholder="010-1234-5678" className={field}
                />
              </label>
              <fieldset className="space-y-1.5">
                <legend className="text-[15px] font-bold mb-1.5">탑승</legend>
                <div className="grid grid-cols-3 gap-2">
                  {ROUTES.map((r) => (
                    <label key={r} className="cursor-pointer">
                      <input type="radio" name="route" value={r} defaultChecked={r === "왕복"} className="peer sr-only" />
                      <span className="block text-center py-3 rounded-xl border border-[#e4dccf] font-semibold peer-checked:bg-[#3b342e] peer-checked:text-white peer-checked:border-[#3b342e] peer-focus-visible:ring-2 peer-focus-visible:ring-[#b08d6e] transition">
                        {r}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block space-y-1.5">
                <span className="block text-[15px] font-bold">남기실 말 <span className="font-normal text-[#8f857b]">(선택)</span></span>
                <input name="memo" maxLength={200} className={field} />
              </label>
              <button
                type="submit" disabled={isLoading}
                className="w-full bg-[#3b342e] text-white font-bold py-4 rounded-xl text-lg active:scale-[0.98] transition disabled:bg-[#c9c0b6]"
              >
                {isLoading ? "신청 중입니다..." : "신청하기"}
              </button>
              <p className="text-center text-[13px] text-[#8f857b]">11월 1일 (주일)까지 신청받아요</p>
            </form>
          )}

          {/* 손잡은 신랑신부(누끼)가 둥실 떠 있음. 누르면 청첩장 */}
          <a href={LETTER} target="_blank" rel="noopener" className="flex flex-col items-center pt-6 text-[15px] font-semibold text-[#8a6a50]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bus/couple.webp" alt="" className="animate-bob h-36 w-auto drop-shadow-md" />
            <span className="mt-3 underline underline-offset-4">모바일 청첩장 보기</span>
          </a>
        </div>
      </main>
    </div>
  );
}
