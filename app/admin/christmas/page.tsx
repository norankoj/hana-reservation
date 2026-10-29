"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi, savedPassword, savePassword } from "@/lib/admin";
import { ChevronLeft, Link2, Trash2 } from "lucide-react";
import { info } from "@/app/christmas/info";

type Row = { id: number; name: string; phone: string; cell: string; role: string; memo: string; created_at: string };

const day = (s: string) => new Date(s).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

export default function ChristmasAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [role, setRole] = useState(""); // 스텝 종류로 거르기. "" 는 전체

  const load = async (pw: string) => {
    const r = await adminApi(pw, { action: "christmas" });
    if (r.status === 401) return false;
    setRows(r.rows ?? []);
    return true;
  };

  useEffect(() => {
    const pw = savedPassword();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pw) load(pw).then((ok) => ok && setPassword(pw));
  }, []);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password"));
    if (!(await load(pw))) return alert("비밀번호가 맞지 않습니다.");
    savePassword(pw);
    setPassword(pw);
  };

  const remove = async (id: number, name: string) => {
    if (!password || !confirm(`${name}님의 신청을 삭제할까요?`)) return;
    const res = await adminApi(password, { action: "christmasDelete", id });
    if (res.error) alert("삭제하지 못했습니다.");
    load(password);
  };

  const copyLink = async () => {
    const url = `${location.origin}/christmas`;
    try {
      await navigator.clipboard.writeText(url);
      alert(`링크를 복사했습니다.\n${url}`);
    } catch {
      prompt("아래 링크를 복사해 주세요.", url);
    }
  };

  const shown = role ? rows.filter((r) => r.role === role) : rows;
  const btn = "flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100";

  if (!password)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-[20px] shadow-card-lg w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">크리스마스 마켓 스텝</h1>
          <input name="password" type="password" placeholder="비밀번호" required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand" />
          <button className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition">로그인</button>
        </form>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-1">
          <Link href="/admin" aria-label="관리자" className="p-1 text-gray-500"><ChevronLeft size={22} /></Link>
          <h1 className="text-lg md:text-xl font-bold">크리스마스 마켓 스텝 <span className="text-gray-500">{rows.length}명</span></h1>
          <button onClick={copyLink} className={`${btn} ml-auto`}><Link2 size={16} /> 신청 링크</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-4">
        {/* 스텝별 인원. 누르면 그 스텝만 */}
        <div className="flex flex-wrap gap-2">
          {[{ name: "" }, ...info.roles].map((r) => {
            const n = r.name ? rows.filter((x) => x.role === r.name).length : rows.length;
            return (
              <button
                key={r.name}
                onClick={() => setRole(r.name)}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${role === r.name ? "bg-brand text-white" : "bg-white shadow-card text-gray-700 hover:bg-gray-100"}`}
              >
                {r.name || "전체"} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-[13px] text-gray-500">
              <tr>{["이름", "연락처", "셀", "스텝", "남기실 말", "신청일", ""].map((h) => <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-3 py-2.5 font-bold whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><a href={`tel:${r.phone}`} className="tabular-nums hover:text-brand">{r.phone}</a></td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{r.cell}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{r.role}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-pre-line">{r.memo}</td>
                  <td className="px-3 py-2.5 text-gray-500 tabular-nums whitespace-nowrap">{day(r.created_at)}</td>
                  <td className="px-2 py-2.5"><button aria-label="신청 삭제" onClick={() => remove(r.id, r.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="text-center py-12 text-gray-400 font-bold">아직 신청이 없습니다.</p>}
        </div>
      </main>
    </div>
  );
}
