"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi, savedPassword, savePassword } from "@/lib/admin";
import { formatPhone } from "@/lib/phone";
import { parseRoster, ROUTES } from "@/lib/shuttle";
import { ChevronLeft, Link2, Trash2, Plus, ClipboardPaste } from "lucide-react";

// 셔틀 탑승 명단 관리. 한 명씩 넣고 빼거나, 엑셀 명단을 통째로 갈아끼웁니다.
// 탑승 체크 화면은 /shuttle (보기) · /shuttle/check (담당자) 입니다.
type Passenger = { id: number; name: string; affil: string; phone: string; route: string; go_at: string | null; back_at: string | null };

const field = "w-full bg-gray-100 rounded-xl px-3 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-brand";

export default function ShuttleAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [rows, setRows] = useState<Passenger[]>([]);
  const [phone, setPhone] = useState("");
  const [pasting, setPasting] = useState(false);
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (pw: string) => {
    const r = await adminApi(pw, { action: "shuttle" });
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

  const run = async (body: object, errorText: string) => {
    if (!password || busy) return false;
    setBusy(true);
    const res = await adminApi(password, body);
    await load(password);
    setBusy(false);
    if (res.error) {
      alert(res.error === "DUPLICATE" ? "같은 이름이 이미 명단에 있습니다." : errorText);
      return false;
    }
    return true;
  };

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const ok = await run(
      {
        action: "shuttleAdd",
        name: String(f.get("name") ?? "").trim(),
        affil: String(f.get("affil") ?? "").trim(),
        phone,
        route: String(f.get("route")),
      },
      "추가하지 못했습니다. 입력을 확인해 주세요. (연락처는 010-1234-5678 꼴)",
    );
    if (ok) {
      form.reset();
      setPhone("");
    }
  };

  const remove = (p: Passenger) =>
    confirm(`${p.name}님을 명단에서 뺄까요?`) && run({ action: "shuttleDelete", id: p.id }, "빼지 못했습니다.");

  const changeRoute = (p: Passenger, route: string) =>
    run({ action: "shuttleRoute", id: p.id, route }, "바꾸지 못했습니다.");

  // 엑셀에서 복사한 명단으로 통째 교체
  const parsed = parseRoster(paste);
  const replace = async () => {
    if (!parsed.rows.length) return;
    if (!confirm(`명단을 ${parsed.rows.length}명으로 바꿉니다.\n지금 명단 ${rows.length}명과 탑승 체크가 모두 지워집니다. 계속할까요?`)) return;
    if (await run({ action: "shuttleReplace", rows: parsed.rows }, "교체하지 못했습니다.")) {
      setPaste("");
      setPasting(false);
    }
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

  if (!password)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-[20px] shadow-card-lg w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">셔틀 명단 관리</h1>
          <input name="password" type="password" placeholder="비밀번호" required className={field} />
          <button className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition">로그인</button>
        </form>
      </div>
    );

  const count = (route: string) => rows.filter((r) => r.route === "왕복" || r.route === route).length;
  const boarded = rows.filter((r) => r.go_at || r.back_at).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white px-4 md:px-8 py-3 sticky top-0 z-10 shadow-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Link href="/admin" aria-label="관리자" className="p-1 text-gray-500"><ChevronLeft size={22} /></Link>
            <h1 className="text-lg md:text-xl font-bold">셔틀 탑승 명단</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => copyLink("/shuttle")} className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Link2 size={16} /> 보기
            </button>
            <button onClick={() => copyLink("/shuttle/check")} className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg text-brand hover:bg-brand-soft">
              <Link2 size={16} /> 체크
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
        <section className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            ["전체", `${rows.length}명`],
            ["출발편", `${count("출발만")}명`],
            ["귀가편", `${count("귀가만")}명`],
          ].map(([label, v]) => (
            <div key={label} className="bg-white rounded-2xl shadow-card px-4 py-3">
              <p className="text-[13px] font-semibold text-gray-500">{label}</p>
              <p className="text-xl md:text-2xl font-extrabold tabular-nums">{v}</p>
            </div>
          ))}
        </section>

        {boarded > 0 && (
          <p className="text-[13px] font-bold text-brand bg-brand-soft rounded-xl px-4 py-2.5">
            지금 {boarded}명이 탑승 체크된 상태입니다. 명단을 통째로 바꾸면 이 기록도 지워집니다.
          </p>
        )}

        {/* 한 명 추가 */}
        <form onSubmit={add} className="bg-white rounded-2xl shadow-card p-4 grid gap-2 md:grid-cols-[1fr_1fr_1.2fr_auto_auto]">
          <input name="name" required maxLength={30} placeholder="이름" className={field} />
          <input name="affil" maxLength={30} placeholder="소속 (예: 3A01)" className={field} />
          <input
            name="phone" type="tel" inputMode="numeric" value={phone} maxLength={13}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-1234-5678 (선택)" className={field}
          />
          <select name="route" defaultValue="왕복" className={`${field} md:w-28`}>
            {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button disabled={busy} className="flex items-center justify-center gap-1.5 bg-brand text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-dark disabled:bg-gray-300 transition">
            <Plus size={17} /> 추가
          </button>
        </form>

        {/* 엑셀 명단으로 통째 교체 */}
        <section className="bg-white rounded-2xl shadow-card p-4">
          <button onClick={() => setPasting((v) => !v)} className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
            <ClipboardPaste size={16} /> 엑셀 명단으로 통째 바꾸기 {pasting ? "접기" : ""}
          </button>
          {pasting && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <p className="text-[13px] text-gray-500 leading-relaxed">
                엑셀에서 <b>이름 · 소속 · 연락처 · 탑승</b> 네 칸을 복사해 붙여넣으세요. 머리글 줄과 번호 칸은 알아서 건너뜁니다.
                탑승이 비어 있으면 왕복으로 봅니다.
              </p>
              <textarea
                value={paste} onChange={(e) => setPaste(e.target.value)} rows={6}
                placeholder={"강순철\t3A01\t010-2256-2400\t왕복\n강지연\t3A10\t010-5554-7490\t귀가만"}
                className={`${field} font-mono text-[13px]`}
              />
              {paste.trim() && (
                <div className="text-[13px] font-bold space-y-1">
                  <p className="text-gray-600">{parsed.rows.length}명을 읽었습니다.</p>
                  {parsed.errors.map((e) => <p key={e} className="text-red-500">{e}</p>)}
                </div>
              )}
              <button
                onClick={replace} disabled={busy || !parsed.rows.length || parsed.errors.length > 0}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-700 disabled:bg-gray-300 transition"
              >
                {parsed.rows.length ? `${parsed.rows.length}명으로 바꾸기` : "붙여넣으면 바꿀 수 있습니다"}
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-card overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-gray-50 text-[13px] text-gray-500">
              <tr>
                {["이름", "소속", "연락처", "탑승", "체크", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-bold whitespace-nowrap">{p.name}</td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{p.affil}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {p.phone ? <a href={`tel:${p.phone}`} className="tabular-nums hover:text-brand">{p.phone}</a> : <span className="text-gray-300">없음</span>}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={p.route} onChange={(e) => changeRoute(p, e.target.value)} disabled={busy}
                      className="bg-gray-100 rounded-lg px-2 py-1.5 font-semibold outline-none focus:ring-2 focus:ring-brand"
                    >
                      {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-[13px] font-bold text-brand whitespace-nowrap">
                    {[p.go_at && "출발", p.back_at && "귀가"].filter(Boolean).join(" · ")}
                  </td>
                  <td className="px-2 py-2">
                    <button aria-label={`${p.name} 명단에서 빼기`} onClick={() => remove(p)} disabled={busy} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="text-center py-16 text-gray-400 font-bold">명단이 비어 있습니다.</p>}
        </section>
      </main>
    </div>
  );
}
