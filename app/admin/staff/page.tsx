"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi, downloadCsv, savedPassword, savePassword } from "@/lib/admin";
import { ROLES } from "@/lib/staff";
import { ChevronLeft, Download, Link2, Trash2 } from "lucide-react";

type Signup = { id: number; name: string; cell: string; role: string; created_at: string };

export default function StaffAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [rows, setRows] = useState<Signup[]>([]);

  const load = async (pw: string) => {
    const r = await adminApi(pw, { action: "staff" });
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

  const remove = async (s: Signup) => {
    if (!password || !confirm(`${s.name}님의 신청을 삭제할까요?`)) return;
    const res = await adminApi(password, { action: "staffDelete", id: s.id });
    if (res.error) alert("삭제하지 못했습니다.");
    load(password);
  };

  const copyLink = async () => {
    const url = `${location.origin}/staff`;
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
          <h1 className="text-2xl font-bold text-center mb-2">STAFF 신청 관리</h1>
          <input name="password" type="password" placeholder="비밀번호" required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand" />
          <button className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition">로그인</button>
        </form>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Link href="/admin" aria-label="관리자" className="p-1 text-gray-500"><ChevronLeft size={22} /></Link>
            <h1 className="text-lg md:text-xl font-bold">오이타 현장 STAFF 신청</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={copyLink} className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Link2 size={16} /> 링크
            </button>
            <button
              onClick={() => downloadCsv("오이타_스태프_신청", [["이름", "셀", "역할", "신청일시"], ...rows.map((s) => [s.name, s.cell, s.role, new Date(s.created_at).toLocaleString("ko-KR")])])}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand px-3 py-2 rounded-lg hover:bg-brand-dark disabled:bg-gray-300"
            >
              <Download size={16} /> 엑셀
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
        <section className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {[["전체", rows.length] as const, ...ROLES.map(([r]) => [r, rows.filter((s) => s.role === r).length] as const)].map(([label, n]) => (
            <div key={label} className="bg-white rounded-2xl shadow-card px-4 py-3">
              <p className="text-[13px] font-semibold text-gray-500 truncate">{label}</p>
              <p className="text-xl md:text-2xl font-extrabold tabular-nums">{n}명</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl shadow-card overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-gray-50 text-[13px] text-gray-500">
              <tr>
                {["이름", "셀", "역할", "신청일", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2.5 font-bold whitespace-nowrap">{s.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{s.cell}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{s.role}</td>
                  <td className="px-3 py-2.5 text-gray-500 tabular-nums whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                  </td>
                  <td className="px-2 py-2.5">
                    <button aria-label="신청 삭제" onClick={() => remove(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="text-center py-16 text-gray-400 font-bold">아직 신청이 없습니다.</p>}
        </section>
      </main>
    </div>
  );
}
