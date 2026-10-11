"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Form, slotLabel, questionsOf } from "@/lib/form";
import { adminApi, savedPassword, savePassword } from "@/lib/admin";
import {
  Clock, MapPin, Phone, LogOut, ChevronDown, Download, Settings, Plus, Link2, Lock, Unlock,
} from "lucide-react";

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
  const [password, setPassword] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [formId, setFormId] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  const form = forms.find((f) => f.id === formId) ?? null;

  // 설문 목록 + 선택된 설문의 예약을 받아옴. 비밀번호가 틀리면 false
  const load = async (pw: string, id: string | null = formId) => {
    const r = await adminApi(pw, { action: "forms" });
    if (r.status === 401) return false;
    const list: Form[] = r.forms ?? [];
    const pick = list.find((f) => f.id === id)?.id ?? list[0]?.id ?? null;
    setForms(list);
    setFormId(pick);
    setRows(pick ? (await adminApi(pw, { action: "list", formId: pick })).rows ?? [] : []);
    return true;
  };

  useEffect(() => {
    const pw = savedPassword();
    // 설정 페이지에서 돌아올 때 ?form=... 으로 그 설문을 엶
    const id = new URLSearchParams(location.search).get("form");
    // load 는 서버 응답을 기다린 뒤에 state 를 바꾸므로 괜찮음
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pw) load(pw, id).then((ok) => ok && setPassword(pw));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password"));
    if (!(await load(pw))) return alert("비밀번호가 맞지 않습니다.");
    savePassword(pw);
    setPassword(pw);
  };

  const logout = () => {
    savePassword(null);
    setPassword(null);
    setForms([]);
    setRows([]);
  };

  // 수정 작업 후 다시 불러오기
  const run = async (body: object, errorText: string) => {
    if (!password || !form) return;
    const res = await adminApi(password, { formId: form.id, ...body });
    if (res.error) alert(res.error === "TAKEN" ? "이미 예약된 시간입니다." : errorText);
    load(password);
  };

  const cancel = (r: Row) =>
    confirm(`${r.user_name}님의 예약을 취소할까요?\n(응답 내용도 함께 삭제되며, 그 시간은 다시 열립니다)`) &&
    run({ action: "cancel", id: r.id }, "취소 중 오류가 발생했습니다.");

  const move = (r: Row, slot: string) => {
    const { date, time } = slotLabel(slot);
    if (confirm(`${r.user_name}님 일정을 ${date} ${time}(으)로 변경할까요?`))
      run({ action: "move", id: r.id, slot }, "변경 중 오류가 발생했습니다.");
  };

  const toggle = (slot: string) => run({ action: "toggle", slot }, "처리 중 오류가 발생했습니다.");

  const copyLink = async () => {
    const url = `${location.origin}/${form?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert(`신청 링크를 복사했습니다.\n${url}`);
    } catch {
      prompt("아래 링크를 복사해 주세요.", url);
    }
  };

  if (!password)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-[20px] shadow-card-lg w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">관리자</h1>
          <input name="password" type="password" placeholder="비밀번호" required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand" />
          <button className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition">로그인</button>
        </form>
      </div>
    );

  const bySlot = new Map(rows.map((r) => [r.slot, r]));
  const slots = form?.slots ?? [];
  const questions = form ? questionsOf(form).map((q) => q.label) : [];
  const freeSlots = slots.filter((s) => !bySlot.has(s.slot) && !form?.closed.includes(s.slot));

  // 엑셀에서 바로 열리는 CSV (한글 깨짐 방지 BOM 포함)
  const download = () => {
    if (!form) return;
    // 신청자가 =, + 등으로 시작하게 적으면 엑셀이 수식으로 실행하므로 막음
    const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
    const head = ["날짜", "시간", "장소", "성함", "소속셀", "연락처", ...questions, "신청일시"];
    const body = slots.filter((s) => bySlot.has(s.slot)).map(({ slot, place }) => {
      const r = bySlot.get(slot)!;
      const { date, time } = slotLabel(slot);
      return [
        date, time, place, r.user_name, r.cell, r.user_phone,
        ...questions.map((q) => r.answers?.[q] ?? ""),
        new Date(r.created_at).toLocaleString("ko-KR"),
      ];
    });
    const csv = [head, ...body].map((line) => line.map((v) => cell(String(v))).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `${form.title}_${new Date().toLocaleDateString("sv-SE")}.csv`;
    a.click();
  };

  const btn = "flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold">{form?.title ?? "관리자"}</h1>
            {form && (
              <p className="text-sm text-gray-500 font-semibold">
                {rows.length}명 예약 · 빈 시간 {freeSlots.length}개 · 마감 {slotLabel(`${form.deadline} 00:00`).date}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Link href="/admin/settings" className={btn}><Plus size={16} /> 새 설문</Link>
            {form && (
              <>
                <button onClick={copyLink} className={btn}><Link2 size={16} /> 링크</button>
                <Link href={`/admin/settings?form=${form.id}`} className={btn}><Settings size={16} /> 설정</Link>
                <button
                  onClick={download}
                  disabled={rows.length === 0}
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand px-3 py-2 rounded-lg hover:bg-brand-dark disabled:bg-gray-300"
                >
                  <Download size={16} /> 엑셀
                </button>
              </>
            )}
            <button onClick={logout} aria-label="로그아웃" className={btn}><LogOut size={16} /></button>
          </div>
        </div>
        {/* 설문 목록: 누르면 그 설문의 결과를 봄 */}
        {forms.length > 1 && (
          <nav className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pt-3 -mb-1 pb-1">
            {forms.map((f) => (
              <button
                key={f.id}
                onClick={() => password && load(password, f.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition ${f.id === formId ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f.title}
              </button>
            ))}
          </nav>
        )}
      </header>

      {!form ? (
        <p className="text-center py-20 text-gray-400 font-bold">
          설문이 없습니다. <Link href="/admin/settings" className="text-brand underline">새 설문</Link>을 만들어 주세요.
        </p>
      ) : (
        /* 시간순 타임라인: 예약된 칸은 카드, 빈 칸은 한 줄 */
        <ol className="max-w-3xl mx-auto p-4 md:p-8 space-y-3">
          {slots.map(({ slot, place }) => {
            const { date, time } = slotLabel(slot);
            const r = bySlot.get(slot);
            const isClosed = form.closed.includes(slot);
            const when = (
              <span className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-gray-500">
                {date} <Clock size={13} /> {time}
                {place && (<><MapPin size={13} /> {place}</>)}
              </span>
            );

            if (!r)
              return (
                <li
                  key={slot}
                  className={`flex items-center justify-between gap-2 pl-4 pr-2 py-1.5 rounded-xl border-2 border-dashed ${isClosed ? "border-gray-300 bg-gray-100 text-gray-400" : "border-gray-200 text-gray-400"}`}
                >
                  {when}
                  <button
                    onClick={() => toggle(slot)}
                    className={`shrink-0 flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg ${isClosed ? "text-gray-600 bg-white border border-gray-300" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {isClosed ? <><Lock size={14} /> 닫힘 · 열기</> : <><Unlock size={14} /> 빈 시간 · 닫기</>}
                  </button>
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
                      {[...new Set([...questions, ...Object.keys(r.answers ?? {})])].map((q) => (
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
      )}
    </div>
  );
}
