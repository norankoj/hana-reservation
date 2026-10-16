"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi, savedPassword } from "@/lib/admin";
import { type Line, total, won, lineLabel, lineError, unitPrice, excelRows } from "@/lib/goods";
import { ChevronLeft, Phone, Copy, Link2 } from "lucide-react";

type Order = {
  id: number;
  name: string;
  phone: string;
  depositor: string;
  items: Line[];
  paid: boolean;
  created_at: string;
};

export default function GoodsAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [rows, setRows] = useState<Order[]>([]);

  const load = async (pw: string) => setRows((await adminApi(pw, { action: "goods" })).rows ?? []);

  useEffect(() => {
    // 로그인은 /admin 에서 (같은 탭에 비밀번호가 기억됨)
    const pw = savedPassword();
    if (!pw) return void (location.href = "/admin");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPassword(pw);
    load(pw);
  }, []);

  const run = async (body: object) => {
    if (!password) return;
    const res = await adminApi(password, body);
    if (res.error) alert("처리 중 오류가 발생했습니다.");
    load(password);
  };

  const paid = rows.filter((r) => r.paid);
  const unpaid = rows.filter((r) => !r.paid);
  const sum = (os: Order[]) => os.reduce((s, o) => s + total(o.items), 0);

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(msg);
    } catch {
      prompt("아래 내용을 복사해 주세요.", text);
    }
  };

  const btn = "flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/admin" aria-label="관리자" className="p-1 text-gray-500"><ChevronLeft size={22} /></Link>
            <div>
              <h1 className="text-lg md:text-xl font-bold">굿즈 단체주문</h1>
              <p className="text-sm text-gray-500 font-semibold">
                입금 확인 {paid.length}건 {won(sum(paid))} · 미입금 {unpaid.length}건 {won(sum(unpaid))}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button onClick={() => copy(`${location.origin}/goods`, `주문 링크를 복사했습니다.\n${location.origin}/goods`)} className={btn}>
              <Link2 size={16} /> 링크
            </button>
            <button
              onClick={() => copy(excelRows(paid), `입금 확인된 ${paid.length}건을 복사했습니다.\n\n공식 주문서 「개인별 주문」 시트의 B6 칸(No 1 줄의 이름 칸)을 누르고 붙여넣기 하세요.`)}
              disabled={paid.length === 0}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand px-3 py-2 rounded-lg hover:bg-brand-dark disabled:bg-gray-300"
            >
              <Copy size={16} /> 엑셀용 복사
            </button>
          </div>
        </div>
      </header>

      <ol className="max-w-3xl mx-auto p-4 md:p-8 space-y-3">
        {rows.length === 0 && <p className="text-center py-20 text-gray-400 font-bold">아직 주문이 없습니다.</p>}
        {rows.map((o) => (
          <li key={o.id} className={`bg-white rounded-[20px] shadow-card p-5 ${o.paid ? "" : "ring-2 ring-amber-200"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xl font-bold">
                  {o.name}
                  {o.depositor && <span className="ml-2 text-base font-semibold text-gray-500">입금자 {o.depositor}</span>}
                </p>
                <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 text-sm text-brand font-bold"><Phone size={13} /> {o.phone}</a>
              </div>
              <label className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold cursor-pointer ${o.paid ? "bg-brand-soft text-brand" : "bg-amber-50 text-amber-700"}`}>
                <input type="checkbox" checked={o.paid} onChange={(e) => run({ action: "goodsPaid", id: o.id, paid: e.target.checked })} className="w-5 h-5 accent-brand" />
                {won(total(o.items))} {o.paid ? "입금 확인" : "미입금"}
              </label>
            </div>
            <ul className="mt-3 space-y-1 text-base">
              {o.items.map((l, i) => {
                const err = lineError(l);
                return (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {lineLabel(l)} × {l.qty}
                      {err && <span className="ml-2 text-sm font-bold text-red-500">⚠ {err}</span>}
                    </span>
                    <span className="text-gray-500 shrink-0">{won(unitPrice(l.item) * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              <span>주문 {new Date(o.created_at).toLocaleString("ko-KR")}</span>
              <button
                onClick={() => confirm(`${o.name}님의 주문을 삭제할까요?`) && run({ action: "goodsDelete", id: o.id })}
                className="text-sm font-bold text-red-500 hover:underline"
              >
                주문 삭제
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
