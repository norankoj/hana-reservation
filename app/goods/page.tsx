"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/phone";
import { slotLabel, today } from "@/lib/form";
import {
  type Line, PRODUCTS, SET, SET_OPTIONS, ACCOUNT, GOODS_DEADLINE,
  unitPrice, total, won, lineLabel, addLine,
} from "@/lib/goods";
import Select from "./Select";
import { Clock, CheckCircle2, Plus, X, ShoppingBag, Percent } from "lucide-react";

const field =
  "w-full border-2 border-gray-200 rounded-2xl p-4 text-lg outline-none focus:border-brand bg-gray-50 focus:bg-white transition-all";

const deadline = slotLabel(`${GOODS_DEADLINE} 00:00`).date;

export default function GoodsPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ name: string; lines: Line[] } | null>(null);
  const ended = today() > GOODS_DEADLINE;

  // 상품 카드에서 "담기"
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setLines((ls) => addLine(ls, {
      item: f.item,
      ...(f.size && { size: f.size }),
      ...(f.item === SET && { bandana: f.bandana, bag: f.bag, keyring: f.keyring }),
      qty: Number(f.qty),
    }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lines.length) return alert("상품을 먼저 담아 주세요.");
    if (isLoading) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    setIsLoading(true);
    const { error } = await supabase.from("goods_orders").insert({
      name, phone, depositor: String(f.get("depositor") ?? "").trim(), items: lines,
    });
    setIsLoading(false);
    if (error)
      return alert(error.code === "42501" ? "주문이 마감되었습니다." : error.code === "23514" ? "입력하신 내용을 다시 확인해 주세요. (연락처 11자리 등)" : "주문 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    setDone({ name, lines });
    setLines([]);
    setPhone("");
    window.scrollTo(0, 0);
  };

  const sum = total(lines);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex justify-center md:p-6 font-sans">
      <div className="max-w-xl w-full bg-white md:rounded-[24px] md:shadow-card-lg overflow-hidden min-h-[100dvh] md:min-h-0">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#6b7bff_0%,#8a7bff_55%,#9d8bff_100%)] text-white px-6 py-6 md:px-8 md:py-7">
          <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)]" />
          <p className="text-[13px] font-bold opacity-90">2026 PROMISED LAND JAPAN IN OITA</p>
          <h1 className="text-[28px] md:text-3xl font-extrabold tracking-[-0.03em] mt-1">굿즈 단체주문</h1>
          <span className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold bg-white/20 px-3 py-1.5 rounded-full">
            <Clock size={13} /> 주문·입금 마감 {deadline}까지
          </span>
        </div>

        <div className="p-4 md:p-6 bg-gray-50 space-y-4 pb-28">
          {done ? (
            <div className="bg-white rounded-[20px] shadow-card p-6 md:p-8 text-center animate-fade-in">
              <CheckCircle2 size={64} className="text-brand mx-auto mb-4" />
              <h2 className="text-2xl font-bold">주문이 접수되었습니다</h2>
              <p className="text-lg text-gray-600 font-medium mt-2">{done.name}님, 감사합니다.</p>
              <ul className="text-left mt-6 space-y-1 text-base">
                {done.lines.map((l) => (
                  <li key={lineLabel(l)} className="flex justify-between gap-3">
                    <span>{lineLabel(l)} × {l.qty}</span>
                    <span className="font-semibold shrink-0">{won(unitPrice(l.item) * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 bg-brand-soft rounded-2xl p-5 text-left">
                <p className="text-sm font-semibold text-brand">{deadline}까지 입금해 주세요</p>
                <p className="text-2xl font-extrabold mt-1">{won(total(done.lines))}</p>
                <p className="text-lg font-bold mt-2 select-all">{ACCOUNT}</p>
                <p className="text-sm text-gray-600 mt-2">입금이 확인되어야 주문이 확정돼요. 예약 제작 상품이라 마감 후 취소·변경이 어려워요.</p>
              </div>
              <button type="button" onClick={() => setDone(null)} className="w-full mt-6 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl text-lg">
                처음으로
              </button>
            </div>
          ) : ended ? (
            <div className="bg-white p-8 rounded-2xl text-center text-lg font-bold text-gray-500 shadow-card">주문이 마감되었습니다.</div>
          ) : (
            <>
              <section className="bg-white rounded-[20px] shadow-card p-5 md:p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Percent size={20} className="text-brand" /> 사전예약 할인
                </h2>
                <p className="mt-2 text-[15px] text-gray-600">2026 프로미스랜드 오이타 굿즈 사전구매 · 전 제품 (세트·네임택 포함)</p>
                <p className="mt-0.5 text-[15px] font-bold text-brand">10% 할인</p>
              </section>

              {/* 상품 모아보기: 누르면 그 상품으로 이동 */}
              <section className="bg-white rounded-[20px] shadow-card p-5 md:p-6">
                <h2 className="text-xl font-bold">상품 모아보기</h2>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {PRODUCTS.map((p, i) => (
                    <li key={p.title}>
                      <a href={`#p${i}`} className="block text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imgs[0]} alt={p.title} className="w-full aspect-square object-contain rounded-xl bg-gray-50" />
                        <span className="block mt-1 text-sm font-bold leading-tight">{p.title}</span>
                        <span className="block text-xs text-gray-400 line-through">{won(p.price)}</span>
                        <span className="block text-xs font-bold text-brand">{won(unitPrice(p.items[0]))}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              {PRODUCTS.map((p, i) => (
                <form key={p.title} id={`p${i}`} onSubmit={add} className="bg-white rounded-[20px] shadow-card scroll-mt-4">
                  {/* 사진이 여러 장이면 옆으로 넘겨 봄 */}
                  <div className="flex overflow-x-auto snap-x snap-mandatory rounded-t-[20px] bg-white [scrollbar-width:none]">
                    {p.imgs.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt={p.title} loading="lazy" className="w-full shrink-0 snap-center aspect-square object-contain" />
                    ))}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="text-xl font-bold">
                        {p.title}
                        {p.imgs.length > 1 && <span className="ml-2 text-xs font-semibold text-gray-400">사진 {p.imgs.length}장 · 옆으로 넘겨 보세요</span>}
                      </h2>
                      <p className="mt-0.5">
                        <span className="text-gray-400 line-through mr-2">{won(p.price)}</span>
                        <span className="text-lg font-extrabold text-brand">{won(unitPrice(p.items[0]))}</span>
                      </p>
                      {p.note && <p className="text-sm text-gray-500 mt-1">{p.note}</p>}
                      {p.notice && <p className="mt-2 text-base font-extrabold text-red-500">🎁 {p.notice}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {p.items.length > 1 ? (
                        <Select name="item" placeholder="디자인" required options={p.items.map((i) => ({ value: i, label: i.split(" - ")[1] }))} />
                      ) : (
                        <input type="hidden" name="item" value={p.items[0]} />
                      )}
                      {p.sizes && <Select name="size" placeholder="사이즈" required options={p.sizes} />}
                      {p.title === SET &&
                        Object.entries(SET_OPTIONS).map(([k, o]) => (
                          <Select key={k} name={k} placeholder={`${o.label} 디자인`} required options={[...o.options]} />
                        ))}
                      <Select name="qty" defaultValue="1" options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}개` }))} />
                    </div>
                    {p.sizeGuide && (
                      <details className="text-sm text-gray-500">
                        <summary className="cursor-pointer font-semibold">사이즈 가이드 보기</summary>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.sizeGuide} alt={`${p.title} 사이즈 가이드`} loading="lazy" className="mt-2 w-full rounded-xl" />
                      </details>
                    )}
                    <button className="w-full flex items-center justify-center gap-1.5 border-2 border-brand/30 text-brand font-bold py-3 rounded-xl hover:bg-brand-soft transition active:scale-95">
                      <Plus size={18} /> 담기
                    </button>
                  </div>
                </form>
              ))}

              <section className="bg-white rounded-[20px] shadow-card p-5 md:p-6 space-y-6 text-[15px] leading-relaxed">
                <div>
                  <h2 className="text-xl font-bold">⚠️ 유의사항</h2>
                  <ul className="mt-3 space-y-1.5 list-disc pl-5 text-gray-700">
                    <li>예약 제작 상품이라 주문 마감 후 취소·변경·환불이 어려워요.</li>
                    <li>상품 이미지는 목업이라 실제 색감, 프린트 위치·크기가 조금 다를 수 있어요.</li>
                    <li>입금 마감일인 {deadline}까지 입금이 확인되지 않으면 주문이 취소될 수 있어요.</li>
                    <li>디자인별 제작 수량이 한정되어 있어, 주문하신 디자인이 품절되면 다른 디자인(제품)으로 대체될 수 있어요.</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-bold">❓ 자주 묻는 질문</h2>
                  <dl className="mt-3 space-y-4">
                    <div>
                      <dt className="font-bold">Q. 개인으로도 주문할 수 있나요?</dt>
                      <dd className="text-gray-700 mt-0.5">A. 이번 주문은 공동체 단위로만 받아요. 이 페이지에서 주문하시면 공동체 담당자가 모아서 한 번에 신청해요.</dd>
                    </div>
                    <div>
                      <dt className="font-bold">Q. 사이즈가 고민돼요.</dt>
                      <dd className="text-gray-700 mt-0.5">A. 후드집업은 오버핏이라 일반적인 사이즈보다 큰 편이에요. 위 「사이즈 가이드 보기」의 단면 치수를 갖고 계신 옷과 비교해 보세요.</dd>
                    </div>
                    <div>
                      <dt className="font-bold">Q. 주문한 뒤에 수량을 바꿀 수 있나요?</dt>
                      <dd className="text-gray-700 mt-0.5">A. 주문 마감인 {deadline}까지는 공동체 담당자에게 말씀해 주세요. 마감 이후에는 변경이 어려워요.</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <form id="order" onSubmit={submit} className="bg-white p-6 md:p-8 rounded-[20px] shadow-card space-y-6 scroll-mt-4">
                <div>
                  <h2 className="text-xl font-bold mb-3">내 주문</h2>
                  {lines.length === 0 ? (
                    <p className="text-gray-400 font-semibold">위에서 상품을 담아 주세요.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {lines.map((l) => (
                        <li key={lineLabel(l)} className="flex items-center gap-2 py-2.5">
                          <span className="flex-1 min-w-0">{lineLabel(l)} × {l.qty}</span>
                          <span className="font-semibold shrink-0">{won(unitPrice(l.item) * l.qty)}</span>
                          <button type="button" aria-label="빼기" onClick={() => setLines(lines.filter((x) => x !== l))} className="p-1 text-gray-400 hover:text-red-500">
                            <X size={18} />
                          </button>
                        </li>
                      ))}
                      <li className="flex justify-between pt-3 text-lg font-extrabold">
                        <span>합계 (10% 할인)</span>
                        <span className="text-brand">{won(sum)}</span>
                      </li>
                    </ul>
                  )}
                </div>
                <label className="block space-y-2">
                  <span className="block text-lg font-bold text-gray-700 ml-1">성함</span>
                  <input name="name" autoComplete="name" maxLength={30} required placeholder="예: 홍길동" className={field} />
                </label>
                <label className="block space-y-2">
                  <span className="block text-lg font-bold text-gray-700 ml-1">연락처</span>
                  <input
                    type="tel" inputMode="numeric" autoComplete="tel-national" pattern="01\d-\d{3,4}-\d{4}"
                    title="010-1234-5678 형식으로 입력해 주세요." value={phone} maxLength={13}
                    onChange={(e) => setPhone(formatPhone(e.target.value))} required placeholder="010-1234-5678" className={field}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="block text-lg font-bold text-gray-700 ml-1">
                    입금자명 <span className="text-sm text-gray-400 font-semibold">(성함과 다를 때만)</span>
                  </span>
                  <input name="depositor" maxLength={30} className={field} />
                </label>
                <p className="text-sm text-gray-500 leading-relaxed">
                  주문 후 {deadline}까지 안내되는 계좌로 입금해 주세요. 위 유의사항을 확인하고 주문해 주세요.
                </p>
                <button
                  type="submit" disabled={isLoading}
                  className="w-full bg-brand text-white font-bold py-5 rounded-2xl shadow-brand hover:bg-brand-dark transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none text-xl"
                >
                  {isLoading ? "주문 처리 중입니다..." : `${won(sum)} 주문하기`}
                </button>
              </form>
            </>
          )}
        </div>

        {/* 담은 상품이 있으면 아래에 합계 바 */}
        {!done && lines.length > 0 && (
          <a href="#order" className="fixed bottom-4 inset-x-4 mx-auto max-w-[calc(36rem-2rem)] flex items-center justify-between bg-gray-900 text-white rounded-2xl px-5 py-4 shadow-card-lg font-bold">
            <span className="flex items-center gap-2"><ShoppingBag size={18} /> {lines.reduce((s, l) => s + l.qty, 0)}개 · {won(sum)}</span>
            <span>주문서 작성 ↓</span>
          </a>
        )}
      </div>
    </div>
  );
}
