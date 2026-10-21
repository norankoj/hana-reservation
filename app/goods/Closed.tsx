"use client";
// 주문 마감 후 /goods: 입금 확인된 주문 목록(본인 확인용) + 문의 남기기
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { type Line, lineLabel } from "@/lib/goods";
import { Search, CheckCircle2, MessageCircle, ChevronDown } from "lucide-react";

type Paid = { name: string; phone4: string; items: Line[] };

const field =
  "w-full border-2 border-gray-200 rounded-2xl p-4 text-lg outline-none focus:border-brand bg-gray-50 focus:bg-white transition-all";

export default function Closed() {
  const [paid, setPaid] = useState<Paid[] | null>(null); // null = 불러오는 중
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.rpc("goods_paid_list").then(({ data, error }) => {
      setFailed(!!error);
      setPaid(data ?? []);
    });
  }, []);

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    const { error } = await supabase.from("goods_inquiries").insert({
      name: String(f.get("name") ?? "").trim(),
      phone,
      message: String(f.get("message") ?? "").trim(),
    });
    setSending(false);
    if (error) return alert(error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "보내는 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    setSent(true);
  };

  // 전체 이름(노나연 → 노*연), 이름 앞부분, 연락처 끝번호로 찾기
  const word = q.trim();
  const fullName = (p: Paid) => word.length === p.name.length && [...p.name].every((c, i) => c === "*" || c === word[i]);
  const shown = (paid ?? []).filter((p) => !word || fullName(p) || p.name.startsWith(word) || p.phone4.includes(word));

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-[20px] shadow-card p-5 md:p-6">
        <h2 className="text-xl font-bold">주문이 마감되었어요</h2>
        <p className="mt-2 text-[15px] text-gray-600 leading-relaxed">
          아래는 <b className="text-gray-900">입금이 확인된 주문</b>이에요. 내 이름과 주문 상품이 맞는지 확인해 주세요.
          목록에 없거나 내용이 다르면 맨 아래 「문의 남기기」를 열어 남겨 주세요.
        </p>
      </section>

      <section className="bg-white rounded-[20px] shadow-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold shrink-0">
            입금 확인 <span className="text-brand tabular-nums">{paid?.length ?? 0}</span>명
          </h3>
          <label className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-brand w-full max-w-[220px]">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 또는 끝번호" className="w-full outline-none text-[15px] bg-transparent" />
          </label>
        </div>
        {paid === null ? (
          <p className="py-12 text-center text-gray-400 font-bold">불러오는 중...</p>
        ) : failed ? (
          <p className="py-12 text-center text-gray-400 font-bold">목록을 불러오지 못했어요. 잠시 후 다시 열어 주세요.</p>
        ) : shown.length === 0 ? (
          <p className="py-12 text-center text-gray-400 font-bold">{paid.length ? "찾는 이름이 없어요. 아래에 문의를 남겨 주세요." : "아직 입금 확인된 주문이 없어요."}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {shown.map((p, i) => (
              <li key={i} className="flex gap-4 px-4 py-3">
                <div className="w-20 shrink-0">
                  <p className="font-bold flex items-center gap-1"><CheckCircle2 size={15} className="text-brand" /> {p.name}</p>
                  <p className="text-[13px] text-gray-500 tabular-nums">끝번호 {p.phone4}</p>
                </div>
                <ul className="min-w-0 text-[15px] space-y-0.5">
                  {p.items.map((l, j) => (
                    <li key={j}>{lineLabel(l)} <span className="text-gray-500">× {l.qty}</span></li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 문의는 접어 두고, 남길 사람만 열어서 */}
      <details className="group bg-white rounded-[20px] shadow-card p-5 md:p-6">
        <summary className="flex items-center gap-2 text-lg font-bold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <MessageCircle size={20} className="text-brand" /> 문의 남기기
          <span className="ml-auto hidden sm:inline text-sm font-semibold text-gray-500">목록에 없거나 내용이 다르면</span>
          <ChevronDown size={20} className="ml-auto sm:ml-0 text-gray-400 transition group-open:rotate-180" />
        </summary>
        {sent ? (
          <div className="mt-4 rounded-2xl bg-brand-soft p-5">
            <p className="font-bold text-brand">문의가 접수되었어요.</p>
            <p className="text-[15px] text-gray-600 mt-1">담당자(노나연)가 확인 후 연락드릴게요.</p>
          </div>
        ) : (
          <form onSubmit={send} className="mt-4 space-y-4">
            <label className="block space-y-2">
              <span className="block font-bold text-gray-700 ml-1">성함</span>
              <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 홍길동" className={field} />
            </label>
            <label className="block space-y-2">
              <span className="block font-bold text-gray-700 ml-1">연락처</span>
              <input
                type="tel" inputMode="numeric" autoComplete="tel-national" pattern="01\d-\d{3,4}-\d{4}"
                title="010-1234-5678 형식으로 입력해 주세요." value={phone} maxLength={13}
                onChange={(e) => setPhone(formatPhone(e.target.value))} required placeholder="010-1234-5678" className={field}
              />
            </label>
            <label className="block space-y-2">
              <span className="block font-bold text-gray-700 ml-1">문의 내용</span>
              <textarea name="message" required maxLength={1000} placeholder="예: 입금했는데 목록에 없어요 / 사이즈를 잘못 골랐어요" className={`${field} h-32 resize-none`} />
            </label>
            <button
              type="submit" disabled={sending}
              className="w-full bg-brand text-white font-bold py-4 rounded-2xl text-lg shadow-brand hover:bg-brand-dark active:scale-[0.98] transition disabled:bg-gray-300 disabled:shadow-none"
            >
              {sending ? "보내는 중..." : "문의 보내기"}
            </button>
          </form>
        )}
      </details>
    </div>
  );
}
