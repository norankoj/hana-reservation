"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { INTERVIEW_SLOTS, INTERVIEW_QUESTIONS, INTERVIEW_DEADLINE, slotLabel } from "@/lib/interview";
import { ChevronLeft, Clock, MapPin, CheckCircle2 } from "lucide-react";

export default function InterviewPage() {
  const [taken, setTaken] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; slot: string } | null>(null);
  const [userPhone, setUserPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaken = async () => {
    const { data } = await supabase.rpc("interview_taken");
    setTaken(data ?? []);
  };

  useEffect(() => {
    supabase.rpc("interview_taken").then(({ data }) => setTaken(data ?? []));
  }, []);

  // 지난 날짜는 숨김
  const today = new Date().toLocaleDateString("sv-SE"); // "2026-10-14" 형식
  const slots = INTERVIEW_SLOTS.filter((s) => s.slot.slice(0, 10) >= today);
  const closed = today > INTERVIEW_DEADLINE; // 최종 판정은 DB 가 함

  const handleBack = () => {
    setSelected(null);
    setUserPhone("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected || isLoading) return;
    const f = new FormData(e.currentTarget);
    const userName = String(f.get("userName") ?? "").trim();
    const answers = Object.fromEntries(
      INTERVIEW_QUESTIONS.map((q, i) => [q, String(f.get(`q${i}`) ?? "").trim()]),
    );

    setIsLoading(true);
    // 한 시간대 한 명 / 한 번호 한 번은 DB 가 막아 줍니다 (동시 신청에도 안전).
    const { error } = await supabase
      .from("interview_reservations")
      .insert({ slot: selected, user_name: userName, user_phone: userPhone, cell: String(f.get("userCell") ?? "").trim(), answers });
    setIsLoading(false);

    if (error) {
      await fetchTaken();
      if (error.code === "23505" && error.message.includes("slot")) {
        alert("죄송합니다. 방금 다른 분이 예약하셨습니다.\n다른 시간을 선택해 주세요.");
        handleBack();
      } else if (error.code === "23505") {
        alert("이 번호로 이미 예약되어 있습니다.");
      } else if (error.code === "42501") {
        alert("신청이 마감되었습니다.");
        handleBack();
      } else if (error.code === "23514") {
        alert("입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)");
      } else {
        alert("예약 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
      }
      return;
    }

    await fetchTaken();
    setDone({ name: userName, slot: selected });
    handleBack();
    window.scrollTo(0, 0);
  };

  const sel = INTERVIEW_SLOTS.find((s) => s.slot === selected);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex justify-center md:p-6 font-sans">
      <div className="max-w-xl w-full bg-white md:rounded-[24px] md:shadow-card-lg overflow-hidden min-h-[100dvh] md:min-h-0">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#6b7bff_0%,#8a7bff_55%,#9d8bff_100%)] text-white px-6 py-6 md:px-8 md:py-7">
          <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)]" />
          <h1 className="text-[28px] md:text-3xl font-extrabold tracking-[-0.03em]">
            면담 예약
          </h1>
          <p className="text-[15px] font-semibold opacity-95 mt-1">
            원하시는 시간을 눌러 신청하세요.
          </p>
          <span className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold bg-white/20 px-3 py-1.5 rounded-full">
            <Clock size={13} /> 신청 마감 {slotLabel(`${INTERVIEW_DEADLINE} 00:00`).date}까지
          </span>
        </div>

        <div className="p-4 md:p-6 bg-gray-50 min-h-full">
          {closed && !done ? (
            <div className="bg-white p-8 rounded-2xl text-center text-lg font-bold text-gray-500 shadow-card">
              면담 신청이 마감되었습니다.
            </div>
          ) : done ? (
            <div className="bg-white rounded-[20px] shadow-card p-6 md:p-8 text-center animate-fade-in">
              <CheckCircle2 size={64} className="text-brand mx-auto mb-4" />
              <h2 className="text-2xl font-bold">예약이 완료되었습니다</h2>
              <p className="text-lg text-gray-600 font-medium mt-2">
                {done.name}님, 감사합니다.
              </p>
              <p className="text-lg font-bold mt-6 bg-brand-soft rounded-2xl p-5">
                {slotLabel(done.slot).date} {slotLabel(done.slot).time}
                {INTERVIEW_SLOTS.find((s) => s.slot === done.slot)?.place &&
                  ` · ${INTERVIEW_SLOTS.find((s) => s.slot === done.slot)?.place}`}
              </p>
              <button
                type="button"
                onClick={() => setDone(null)}
                className="w-full mt-6 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl text-lg"
              >
                처음으로
              </button>
            </div>
          ) : selected && sel ? (
            <div className="animate-fade-in">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 font-bold text-lg hover:text-gray-800 transition mb-4"
              >
                <ChevronLeft size={24} /> 다른 시간 선택하기
              </button>
              <div className="p-5 rounded-[20px] bg-brand-soft mb-6">
                <p className="text-sm font-semibold text-brand">신청하는 일정</p>
                <p className="text-xl md:text-2xl font-bold mt-0.5">
                  {slotLabel(sel.slot).date} {slotLabel(sel.slot).time}
                </p>
                {sel.place && (
                  <p className="flex items-center gap-1 text-base font-bold text-gray-600 mt-1">
                    <MapPin size={15} /> {sel.place}
                  </p>
                )}
              </div>
              <form
                onSubmit={handleSubmit}
                className="bg-white p-6 md:p-8 rounded-[20px] shadow-card space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="userName" className="block text-lg font-bold text-gray-700 ml-1">
                    성함
                  </label>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    autoComplete="name"
                    maxLength={30}
                    required
                    placeholder="예: 홍길동"
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg outline-none focus:border-brand bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="userCell" className="block text-lg font-bold text-gray-700 ml-1">
                    소속셀
                  </label>
                  <input
                    id="userCell"
                    name="userCell"
                    type="text"
                    maxLength={30}
                    required
                    placeholder="예: 1A16"
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg outline-none focus:border-brand bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="userPhone" className="block text-lg font-bold text-gray-700 ml-1">
                    연락처
                  </label>
                  <input
                    id="userPhone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="01\d-\d{3,4}-\d{4}"
                    title="010-1234-5678 형식으로 입력해 주세요."
                    value={userPhone}
                    maxLength={13}
                    onChange={(e) => setUserPhone(formatPhone(e.target.value))}
                    required
                    placeholder="010-1234-5678"
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg outline-none focus:border-brand bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <p className="pt-6 border-t border-gray-100 text-base md:text-lg font-bold text-brand leading-relaxed">
                  풍성한 면담을 위해 아래 사전 질문은 가능한 한 구체적으로 작성 부탁드립니다.
                </p>
                {INTERVIEW_QUESTIONS.map((q, i) => (
                  <div key={q} className="space-y-2">
                    <label htmlFor={`q${i}`} className="block text-lg font-bold text-gray-700 ml-1">
                      {q}
                    </label>
                    <textarea
                      id={`q${i}`}
                      name={`q${i}`}
                      maxLength={2000}
                      required
                      placeholder="자유롭게 적어주세요."
                      className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg h-32 outline-none focus:border-brand bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand text-white font-bold py-5 rounded-2xl shadow-brand hover:bg-brand-dark transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none text-xl"
                >
                  {isLoading ? "예약 처리 중입니다..." : "예약 완료하기"}
                </button>
              </form>
            </div>
          ) : taken === null ? (
            <div className="text-center py-20 text-gray-400 text-lg font-bold">
              잠시만 기다려주세요...
            </div>
          ) : (
            <ul className="bg-white rounded-[20px] shadow-card divide-y divide-gray-100 overflow-hidden">
              {slots.map((s) => {
                const { date, time } = slotLabel(s.slot);
                const open = !taken.includes(s.slot);
                return (
                  <li
                    key={s.slot}
                    className={`flex items-center justify-between gap-3 px-4 py-3 ${open ? "" : "bg-gray-50"}`}
                  >
                    <div className="min-w-0">
                      <p className={`text-lg font-bold leading-tight ${open ? "" : "text-gray-400"}`}>
                        {date}
                      </p>
                      <p className="flex items-center gap-1 text-sm font-bold text-gray-500 mt-0.5">
                        <Clock size={13} /> {time}
                        {s.place && (
                          <>
                            <MapPin size={13} className="ml-1.5" /> {s.place}
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelected(s.slot);
                        window.scrollTo(0, 0);
                      }}
                      disabled={!open}
                      className={`w-[76px] py-2.5 rounded-xl border-2 text-base font-bold transition active:scale-95 shrink-0 ${
                        open
                          ? "border-gray-100 bg-white text-brand hover:border-brand/40"
                          : "border-transparent bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {open ? "신청" : "마감"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
