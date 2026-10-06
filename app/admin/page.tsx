"use client";

import { useState, useEffect } from "react";
import { INTERVIEW_SLOTS, INTERVIEW_QUESTIONS, slotLabel } from "@/lib/interview";
import { Clock, MapPin, Phone, LogOut, ChevronDown, Download } from "lucide-react";

type Row = {
  id: number;
  slot: string;
  user_name: string;
  user_phone: string;
  cell: string;
  answers: Record<string, string>;
  created_at: string;
};

export default function Admin() {
  // 비밀번호는 이 탭에서만 기억 (탭을 닫으면 다시 로그인)
  const [password, setPassword] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  const api = async (pw: string, body: object = {}) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, ...body }),
    });
    return { status: res.status, ...(await res.json().catch(() => ({}))) };
  };

  const load = async (pw: string) => {
    const r = await api(pw);
    if (r.status === 401) {
      logout();
      return false;
    }
    setRows(r.rows ?? []);
    return true;
  };

  const logout = () => {
    try { sessionStorage.removeItem("adminPw"); } catch {}
    setPassword(null);
    setRows([]);
  };

  useEffect(() => {
    let saved: string | null = null;
    try { saved = sessionStorage.getItem("adminPw"); } catch {}
    if (!saved) return;
    api(saved).then((r) => {
      if (r.status !== 200) return;
      setRows(r.rows ?? []);
      setPassword(saved);
    });
  }, []);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password"));
    if (!(await load(pw))) return alert("비밀번호가 맞지 않습니다.");
    try { sessionStorage.setItem("adminPw", pw); } catch {}
    setPassword(pw);
  };

  const cancel = async (r: Row) => {
    if (!password) return;
    if (!confirm(`${r.user_name}님의 예약을 취소할까요?\n(응답 내용도 함께 삭제되며, 그 시간은 다시 열립니다)`)) return;
    const res = await api(password, { action: "cancel", id: r.id });
    if (res.error) alert("취소 중 오류가 발생했습니다.");
    load(password);
  };

  const move = async (r: Row, slot: string) => {
    if (!password) return;
    const { date, time } = slotLabel(slot);
    if (!confirm(`${r.user_name}님 일정을 ${date} ${time}(으)로 변경할까요?`)) return;
    const res = await api(password, { action: "move", id: r.id, slot });
    if (res.error) alert(res.error === "TAKEN" ? "이미 예약된 시간입니다." : "변경 중 오류가 발생했습니다.");
    load(password);
  };

  // 엑셀에서 바로 열리는 CSV (한글 깨짐 방지 BOM 포함)
  const download = () => {
    // 신청자가 =, + 등으로 시작하게 적으면 엑셀이 수식으로 실행하므로 막음
    const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
    const head = ["날짜", "시간", "장소", "성함", "소속셀", "연락처", ...INTERVIEW_QUESTIONS, "신청일시"];
    const body = INTERVIEW_SLOTS.filter((s) => bySlot.has(s.slot)).map(({ slot, place }) => {
      const r = bySlot.get(slot)!;
      const { date, time } = slotLabel(slot);
      return [
        date, time, place, r.user_name, r.cell, r.user_phone,
        ...INTERVIEW_QUESTIONS.map((q) => r.answers?.[q] ?? ""),
        new Date(r.created_at).toLocaleString("ko-KR"),
      ];
    });
    const csv = [head, ...body].map((line) => line.map((v) => cell(String(v))).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `면담예약_${new Date().toLocaleDateString("sv-SE")}.csv`;
    a.click();
  };

  if (!password)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-[20px] shadow-card-lg w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">면담 관리자</h1>
          <input name="password" type="password" placeholder="비밀번호" required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand" />
          <button className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition">로그인</button>
        </form>
      </div>
    );

  const bySlot = new Map(rows.map((r) => [r.slot, r]));
  const freeSlots = INTERVIEW_SLOTS.filter((s) => !bySlot.has(s.slot));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg md:text-xl font-bold">
            <span className="text-brand">면담</span> 예약 현황
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            {rows.length}명 예약 · 빈 시간 {freeSlots.length}개
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={download}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand px-3 py-2 rounded-lg hover:bg-brand-dark disabled:bg-gray-300"
          >
            <Download size={16} /> 엑셀
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </header>

      {/* 시간순 타임라인: 예약된 칸은 카드, 빈 칸은 한 줄 */}
      <ol className="max-w-3xl mx-auto p-4 md:p-8 space-y-3">
        {INTERVIEW_SLOTS.map(({ slot, place }) => {
          const { date, time } = slotLabel(slot);
          const r = bySlot.get(slot);
          const when = (
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
              {date} <Clock size={13} /> {time}
              {place && (<><MapPin size={13} /> {place}</>)}
            </span>
          );

          if (!r)
            return (
              <li key={slot} className="flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                {when}
                <span className="text-sm font-semibold">빈 시간</span>
              </li>
            );

          const expanded = open === r.id;
          return (
            <li key={slot} className="bg-white rounded-[20px] shadow-card overflow-hidden">
              <button
                onClick={() => setOpen(expanded ? null : r.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  {when}
                  <p className="text-xl font-bold mt-1">
                    {r.user_name}
                    {r.cell && <span className="ml-2 text-base font-semibold text-gray-500">{r.cell}</span>}
                  </p>
                </div>
                <ChevronDown size={22} className={`shrink-0 text-gray-400 transition ${expanded ? "rotate-180" : ""}`} />
              </button>

              {expanded && (
                <div className="px-5 pb-5 animate-fade-in">
                  <a href={`tel:${r.user_phone}`} className="inline-flex items-center gap-1.5 text-brand font-bold mb-4">
                    <Phone size={15} /> {r.user_phone}
                  </a>

                  {/* 질문 목록 순서대로. 예전 질문으로 받은 답이 있으면 뒤에 붙임 */}
                  <dl className="space-y-4">
                    {[...new Set([...INTERVIEW_QUESTIONS, ...Object.keys(r.answers ?? {})])].map((q) => (
                      <div key={q}>
                        <dt className="text-sm font-bold text-brand">{q}</dt>
                        <dd className="mt-1 text-base leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                          {r.answers?.[q] || <span className="text-gray-400">(응답 없음)</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                    <select
                      value=""
                      onChange={(e) => e.target.value && move(r, e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold bg-white"
                    >
                      <option value="">시간 변경…</option>
                      {freeSlots.map((s) => {
                        const l = slotLabel(s.slot);
                        return (
                          <option key={s.slot} value={s.slot}>
                            {l.date} {l.time}{s.place ? ` (${s.place})` : ""}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => cancel(r)}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 border-2 border-red-100 hover:border-red-300"
                    >
                      예약 취소
                    </button>
                    <span className="ml-auto text-xs text-gray-400">
                      신청 {new Date(r.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
