"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi, savedPassword, savePassword } from "@/lib/admin";
import { type Line, total, won, lineLabel, lineError } from "@/lib/goods";
import { excelRows, fillOrderForm } from "@/lib/xlsx";
import { ChevronLeft, Copy, Link2, Download, Search, Trash2, LogOut, MessageCircle } from "lucide-react";

type Order = {
  id: number;
  name: string;
  phone: string;
  depositor: string;
  items: Line[];
  paid: boolean;
  created_at: string;
};

// 마감 후 /goods 에서 남긴 문의
type Inquiry = { id: number; name: string; phone: string; message: string; created_at: string };

const TABS = { all: "전체", unpaid: "미입금", paid: "입금 확인" } as const;

export default function GoodsAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [rows, setRows] = useState<Order[]>([]);
  const [tab, setTab] = useState<keyof typeof TABS>("all");
  const [q, setQ] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // 주문 목록을 받아옴. 비밀번호가 틀리면 false
  const load = async (pw: string) => {
    const r = await adminApi(pw, { action: "goods" });
    if (r.status === 401) return false;
    setRows(r.rows ?? []);
    setInquiries((await adminApi(pw, { action: "goodsInquiries" })).rows ?? []);
    return true;
  };

  useEffect(() => {
    // 관리자 비밀번호 또는 굿즈 전용 비밀번호. 같은 탭에서는 기억됨
    const pw = savedPassword();
    // load 는 서버 응답을 기다린 뒤에 state 를 바꾸므로 괜찮음
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

  const logout = () => {
    savePassword(null);
    setPassword(null);
    setRows([]);
  };

  // 화면을 먼저 바꾸고 서버에 저장. 실패했을 때만 목록을 다시 받아와 되돌림
  // (예전엔 저장 + 목록 다시 받기를 기다린 뒤에야 체크가 바뀌어서 버벅였음)
  const run = async (body: object, apply: (rs: Order[]) => Order[]) => {
    if (!password) return;
    setRows(apply);
    const res = await adminApi(password, body);
    if (res.error || res.status !== 200) {
      alert("저장하지 못했습니다. 다시 시도해 주세요.");
      load(password);
    }
  };

  const setPaid = (o: Order, paid: boolean) =>
    run({ action: "goodsPaid", id: o.id, paid }, (rs) => rs.map((r) => (r.id === o.id ? { ...r, paid } : r)));

  const remove = (o: Order) =>
    confirm(`${o.name}님의 주문을 삭제할까요?`) &&
    run({ action: "goodsDelete", id: o.id }, (rs) => rs.filter((r) => r.id !== o.id));

  const paid = rows.filter((r) => r.paid);
  const unpaid = rows.filter((r) => !r.paid);
  const sum = (os: Order[]) => os.reduce((s, o) => s + total(o.items), 0);
  const word = q.trim();
  const shown = (tab === "all" ? rows : tab === "paid" ? paid : unpaid).filter(
    (r) => !word || [r.name, r.phone, r.depositor].some((v) => v.includes(word)),
  );

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(msg);
    } catch {
      prompt("아래 내용을 복사해 주세요.", text);
    }
  };

  // 공식 주문서에 입금 확인된 주문을 채워서 내려받기 (서식·수식 그대로)
  const download = async () => {
    try {
      const tpl = new Uint8Array(await (await fetch("/goods/order-template.xlsx")).arrayBuffer());
      const a = document.createElement("a");
      a.href = URL.createObjectURL(await fillOrderForm(tpl, paid));
      a.download = `오이타_굿즈_공동체_단체주문서_${new Date().toLocaleDateString("sv-SE")}.xlsx`;
      a.click();
    } catch (e) {
      alert(e instanceof Error ? e.message : "다운로드 중 오류가 발생했습니다.");
    }
  };

  const btn = "flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg transition active:scale-[0.98]";

  if (!password)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-[20px] shadow-card-lg w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">굿즈 주문 관리</h1>
          <input name="password" type="password" placeholder="비밀번호" required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand" />
          <button className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition">로그인</button>
        </form>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Link href="/admin" aria-label="관리자" className="p-1 text-gray-500"><ChevronLeft size={22} /></Link>
            <h1 className="text-lg md:text-xl font-bold">굿즈 단체주문</h1>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button onClick={() => copy(`${location.origin}/goods`, `주문 링크를 복사했습니다.\n${location.origin}/goods`)} className={`${btn} text-gray-600 hover:bg-gray-100`}>
              <Link2 size={16} /> 링크
            </button>
            <button
              onClick={() => copy(excelRows(paid), `입금 확인된 ${paid.length}건을 복사했습니다.\n\n공식 주문서 「개인별 주문」 시트의 B6 칸을 누르고 붙여넣기 하세요.`)}
              disabled={paid.length === 0}
              className={`${btn} text-brand border-2 border-brand/30 hover:bg-brand-soft disabled:text-gray-400 disabled:border-gray-200`}
            >
              <Copy size={16} /> 엑셀용 복사
            </button>
            <button onClick={download} disabled={paid.length === 0} className={`${btn} text-white bg-brand hover:bg-brand-dark disabled:bg-gray-300`}>
              <Download size={16} /> 주문서 다운로드
            </button>
            <button onClick={logout} aria-label="로그아웃" className={`${btn} text-gray-600 hover:bg-gray-100`}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-4">
        {/* 한눈에: 입금 확인 금액 = 공식 계좌로 보낼 돈 */}
        <section className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            ["전체 주문", rows.length, sum(rows), "text-gray-900"],
            ["입금 확인", paid.length, sum(paid), "text-brand"],
            ["미입금", unpaid.length, sum(unpaid), "text-amber-600"],
          ].map(([label, n, money, color]) => (
            <div key={label as string} className="bg-white rounded-2xl shadow-card px-4 py-3">
              <p className="text-[13px] font-semibold text-gray-500">{label}</p>
              <p className={`text-xl md:text-2xl font-extrabold tabular-nums ${color}`}>{n}건</p>
              <p className="text-[13px] font-semibold text-gray-600 tabular-nums">{won(money as number)}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-gray-100">
            <div className="flex gap-1">
              {(Object.keys(TABS) as (keyof typeof TABS)[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition ${tab === k ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {TABS[k]}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-brand w-full sm:w-64">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·연락처·입금자명" className="w-full outline-none text-sm bg-transparent" />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-[13px] text-gray-500">
                <tr>
                  <th className="w-24 px-3 py-2.5 text-left font-semibold">입금</th>
                  <th className="px-3 py-2.5 text-left font-semibold">이름 / 입금자명</th>
                  <th className="px-3 py-2.5 text-left font-semibold">연락처</th>
                  <th className="px-3 py-2.5 text-left font-semibold">주문 상품</th>
                  <th className="px-3 py-2.5 text-right font-semibold">금액</th>
                  <th className="px-3 py-2.5 text-left font-semibold">주문일</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.map((o) => (
                  <tr key={o.id} className={`align-top ${o.paid ? "" : "bg-amber-50/40"}`}>
                    <td className="px-3 py-2.5">
                      <label className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg font-bold cursor-pointer whitespace-nowrap ${o.paid ? "bg-brand-soft text-brand" : "bg-amber-100 text-amber-700"}`}>
                        <input type="checkbox" checked={o.paid} onChange={(e) => setPaid(o, e.target.checked)} className="w-4 h-4 accent-brand" />
                        {o.paid ? "확인" : "미입금"}
                      </label>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="font-bold">{o.name}</p>
                      {o.depositor && o.depositor !== o.name && <p className="text-[13px] text-gray-500">입금 {o.depositor}</p>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <a href={`tel:${o.phone}`} className="text-gray-700 hover:text-brand tabular-nums">{o.phone}</a>
                    </td>
                    <td className="px-3 py-2.5">
                      {o.items.map((l, i) => {
                        const err = lineError(l);
                        return (
                          <p key={i} className="leading-relaxed">
                            {lineLabel(l)} <span className="text-gray-500">× {l.qty}</span>
                            {err && <span className="ml-1.5 text-[13px] font-bold text-red-500">⚠ {err}</span>}
                          </p>
                        );
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums whitespace-nowrap">{won(total(o.items))}</td>
                    <td className="px-3 py-2.5 text-gray-500 tabular-nums whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}{" "}
                      {new Date(o.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        aria-label="주문 삭제"
                        onClick={() => remove(o)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && (
              <p className="text-center py-16 text-gray-400 font-bold">{rows.length ? "조건에 맞는 주문이 없습니다." : "아직 주문이 없습니다."}</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <h2 className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 font-bold">
            <MessageCircle size={18} className="text-brand" /> 문의 <span className="text-brand tabular-nums">{inquiries.length}</span>건
          </h2>
          {inquiries.length === 0 ? (
            <p className="text-center py-10 text-gray-400 font-bold">아직 문의가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {inquiries.map((m) => (
                <li key={m.id} className="px-4 py-3">
                  <p className="flex flex-wrap items-center gap-x-3 text-sm">
                    <b className="text-base">{m.name}</b>
                    <a href={`tel:${m.phone}`} className="text-gray-600 hover:text-brand tabular-nums">{m.phone}</a>
                    <span className="text-gray-400 tabular-nums">{new Date(m.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
