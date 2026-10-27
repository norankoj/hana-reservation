"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi, savedPassword, savePassword } from "@/lib/admin";
import { ChevronLeft, Link2, Trash2 } from "lucide-react";

type Bus = { id: number; name: string; phone: string; cell: string; route: string; flight: string; created_at: string };
type Team = { id: number; kind: string; name: string; phone: string; cell: string; members: string; memo: string; created_at: string };

const day = (s: string) => new Date(s).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

export default function JapanAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [bus, setBus] = useState<Bus[]>([]);
  const [team, setTeam] = useState<Team[]>([]);

  const load = async (pw: string) => {
    const r = await adminApi(pw, { action: "japan" });
    if (r.status === 401) return false;
    setBus(r.bus ?? []);
    setTeam(r.team ?? []);
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

  const remove = async (kind: "bus" | "team", id: number, name: string) => {
    if (!password || !confirm(`${name}님의 신청을 삭제할까요?`)) return;
    const res = await adminApi(password, { action: "japanDelete", kind, id });
    if (res.error) alert("삭제하지 못했습니다.");
    load(password);
  };

  const copyLink = async (path: string) => {
    const url = `${location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      alert(`링크를 복사했습니다.\n${url}`);
    } catch {
      prompt("아래 링크를 복사해 주세요.", url);
    }
  };

  const ride = (leg: string) => bus.filter((r) => r.route === "왕복" || r.route === leg).length;
  const btn = "flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100";
  const trash = "p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50";

  if (!password)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-[20px] shadow-card-lg w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">오이타 버스·팀 담당자</h1>
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
          <h1 className="text-lg md:text-xl font-bold">오이타 버스·팀 담당자</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {/* 인천공항행 버스 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">인천공항행 버스</h2>
            <button onClick={() => copyLink("/japan/bus")} className={btn}><Link2 size={16} /> 신청 링크</button>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              ["신청", `${bus.length}명`],
              ["가는 편 (11/19)", `${ride("가는 편만")}명`],
              ["오는 편 (11/23)", `${ride("오는 편만")}명`],
            ].map(([label, v]) => (
              <div key={label} className="bg-white rounded-2xl shadow-card px-4 py-3">
                <p className="text-[13px] font-semibold text-gray-500">{label}</p>
                <p className="text-xl md:text-2xl font-extrabold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-[13px] text-gray-500">
                <tr>{["이름", "연락처", "셀", "탑승", "항공", "신청일", ""].map((h) => <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bus.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap">{r.name}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><a href={`tel:${r.phone}`} className="tabular-nums hover:text-brand">{r.phone}</a></td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.cell}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.route}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.flight}</td>
                    <td className="px-3 py-2.5 text-gray-500 tabular-nums whitespace-nowrap">{day(r.created_at)}</td>
                    <td className="px-2 py-2.5"><button aria-label="신청 삭제" onClick={() => remove("bus", r.id, r.name)} className={trash}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bus.length === 0 && <p className="text-center py-12 text-gray-400 font-bold">아직 신청이 없습니다.</p>}
          </div>
        </section>

        {/* 팀 담당자 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              팀 담당자 <span className="text-sm font-semibold text-gray-500">팀 {team.filter((t) => t.kind === "팀").length} · 혼자 {team.filter((t) => t.kind === "혼자").length}</span>
            </h2>
            <button onClick={() => copyLink("/japan/team")} className={btn}><Link2 size={16} /> 제출 링크</button>
          </div>
          <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-[13px] text-gray-500">
                <tr>{["구분", "이름", "연락처", "셀", "함께 가는 분", "항공편·이동 일정", "제출일", ""].map((h) => <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {team.map((t) => (
                  <tr key={t.id} className="align-top">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${t.kind === "팀" ? "bg-brand-soft text-brand" : "bg-gray-100 text-gray-600"}`}>{t.kind === "팀" ? "팀 담당자" : "혼자"}</span>
                    </td>
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap">{t.name}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><a href={`tel:${t.phone}`} className="tabular-nums hover:text-brand">{t.phone}</a></td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{t.cell}</td>
                    <td className="px-3 py-2.5 whitespace-pre-line">{t.members}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-pre-line">{t.memo}</td>
                    <td className="px-3 py-2.5 text-gray-500 tabular-nums whitespace-nowrap">{day(t.created_at)}</td>
                    <td className="px-2 py-2.5"><button aria-label="제출 삭제" onClick={() => remove("team", t.id, t.name)} className={trash}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {team.length === 0 && <p className="text-center py-12 text-gray-400 font-bold">아직 제출이 없습니다.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
