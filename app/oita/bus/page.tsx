"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { matches } from "@/lib/hangul";
import { Check, Search } from "lucide-react";

// 오이타 버스 호차별 탑승 체크. 명단은 시트(오이타 버스 = 왕복·상행·하행) 기준, 숙소로 나눴습니다.
//  1호차: Beppu Tower 형제 18명 (오이타 순복음교회)
//  4호차: 나머지 Beppu Tower + 스탭숙소 + 개별숙소 (남는 자리)
//  5호차: J-HOPPERS + 개별숙소 UCM 3명 (남는 자리)
// 사람을 옮기려면 이름을 다른 호차 배열로 옮기면 됩니다. "이름:메모" 로 쓰면 이름 옆에 메모가 붙습니다.
// 체크는 Supabase 표 oita_bus_checks 에 저장돼 담당자 모두가 같이 봅니다 (supabase/oita-bus.sql).
// 사람을 다른 호차로 옮기면 그 사람의 기존 체크는 풀립니다 (key 가 "호차/이름").
const BUSES = {
  "1호차": {
    to: "오이타 순복음교회 (Beppu Tower 숙소)",
    names: [
      "권성민", "김남현", "정순영", "김수아", "김하언", "명세진", "박윤서", "박준영", "반열",
      "신주호", "양휘", "염승빈", "이동빈", "이민형:스탭", "이서준", "이예준", "이지우", "정상현",
    ],
  },
  "4호차": {
    to: "아마넥",
    names: [
      // Beppu Tower
      "정다솔:하행만", "정상민:하행만", "이정민:스탭", "김세록:스탭", "정순종", "정영재", "정현우", "주동규",
      "최윤재", "황재현", "신상철:사역자",
      // 스탭숙소
      "박희주:사역자", "이원근:스탭", "이요한:스탭", "안진환:스탭", "김태환:사역자", "최재훈:상행만",
      // 개별숙소
      "장대성:개별", "박명욱:개별", "신건:개별", "최진욱:개별", "서은규:개별", "유성일:개별", "한규형:개별",
      "김하엘:개별", "모수진:개별", "김윤화:개별", "박진서:개별", "이한나:개별", "채사라:개별", "홍수지:개별",
      "황진영:개별", "강희재:개별", "곽지은:개별", "노나연:개별·스탭", "문채영:개별", "김선미:개별", "양윤미:개별",
      "이지혜:개별",
    ],
  },
  "5호차": {
    to: "J-HOPPERS",
    names: [
      "권인혜", "최승은", "김민주", "유혜영", "윤예령", "이하은", "김상화", "김예은", "김예지", "김지윤",
      "김혜원", "나서영", "박혜민", "변채민", "신바다", "신예은", "신채윤", "염가빈", "유은진", "정은결",
      "정은지", "정혜성", "조성혜", "조하은", "조하진", "지정현", "차주은:스탭", "최윤혜", "최은빈:스탭", "최주희",
      "최해람:스탭", "최효빈",
      "홍유진:개별", "김하은:개별", "변채은:개별",
    ],
  },
} as const;
type Bus = keyof typeof BUSES;

const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("ko-KR", { hour12: false, hour: "2-digit", minute: "2-digit" });

export default function OitaBusPage() {
  const [bus, setBus] = useState<Bus>("1호차");
  const [checked, setChecked] = useState<Record<string, string>>({}); // "호차/이름" → 체크 시각
  const [q, setQ] = useState("");
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("oita_bus_checks").select("key, at");
    if (error) return setState("failed");
    setChecked(Object.fromEntries((data ?? []).map((r) => [r.key, r.at])));
    setState("ok");
  }, []);

  // 첫 로드 + 5초마다. 다른 담당자가 체크한 것도 따라옵니다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  // 누르면 바로 반영하고(기다리지 않게) 저장. 저장은 DB 함수 oita_bus_check 로만.
  const toggle = async (id: string, name: string) => {
    const on = !checked[id];
    setChecked((c) => {
      const n = { ...c };
      if (on) n[id] = new Date().toISOString();
      else delete n[id];
      return n;
    });
    const { data, error } = await supabase.rpc("oita_bus_check", { p_key: id, p_on: on });
    if (error || (on && !data)) alert(`${name}님 저장에 실패했습니다.\n인터넷 연결을 확인하고 다시 눌러 주세요.`);
    load();
  };

  const people = BUSES[bus].names.map((s) => {
    const [name, note = ""] = s.split(":");
    return { name, note, id: `${bus}/${name}` };
  });
  const list = people.filter((p) => matches(q, p.name, p.note));
  const reset = async () => {
    if (!confirm(`${bus} 체크를 모두 지울까요?\n다른 담당자 화면에서도 같이 지워집니다.`)) return;
    const { error } = await supabase.rpc("oita_bus_reset", { p_bus: bus });
    if (error) alert("초기화에 실패했습니다. 다시 눌러 주세요.");
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-3 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="text-xl font-bold">오이타 버스 탑승 체크</h1>
            <button onClick={reset} className="text-[13px] font-bold text-gray-400 hover:text-gray-700">
              {bus} 초기화
            </button>
          </div>
          <div role="tablist" aria-label="호차" className="flex gap-1.5 bg-gray-200 rounded-full p-1.5">
            {(Object.keys(BUSES) as Bus[]).map((k) => {
              const total = BUSES[k].names.length;
              const n = BUSES[k].names.filter((s) => checked[`${k}/${s.split(":")[0]}`]).length;
              const active = k === bus;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setBus(k)}
                  className={`flex-1 rounded-full px-2 py-2 transition ${active ? "bg-brand shadow-brand" : "text-gray-500"}`}
                >
                  <span className={`block text-[13px] font-bold ${active ? "text-white/70" : "text-gray-500"}`}>{k}</span>
                  <span className={`block text-[20px] font-extrabold tabular-nums leading-tight ${active ? "text-white" : "text-gray-400"}`}>
                    {n}
                    <span className={`text-[14px] font-bold ${active ? "text-white/60" : "text-gray-400"}`}> / {total}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[14px] font-bold text-gray-500 px-1">→ {BUSES[bus].to}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-1 pb-10 space-y-2.5">
        <label className="relative block rounded-[20px] bg-white shadow-card focus-within:ring-2 focus-within:ring-brand">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름 검색 (초성 검색 가능)"
            className="w-full bg-transparent rounded-[20px] pl-11 pr-3 py-3 font-semibold outline-none placeholder:text-gray-400"
          />
        </label>

        <ul className="space-y-2">
          {list.map((p) => {
            const on = !!checked[p.id];
            return (
              <li key={p.id}>
                <button
                  onClick={() => toggle(p.id, p.name)}
                  aria-pressed={on}
                  className={`w-full rounded-[20px] flex items-center gap-3 px-3.5 py-3 text-left transition-colors active:scale-[0.99] ${on ? "bg-brand-soft" : "bg-white shadow-card"}`}
                >
                  <span className={`shrink-0 size-8 rounded-full grid place-items-center ${on ? "bg-brand text-white" : "bg-gray-100 text-transparent"}`}>
                    <Check size={18} strokeWidth={3} />
                  </span>
                  <span className={`text-[17px] font-bold ${on ? "text-brand-dark" : ""}`}>{p.name}</span>
                  {p.note && (
                    <span className="text-[12px] font-bold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{p.note}</span>
                  )}
                  <span className={`ml-auto text-[14px] font-bold ${on ? "text-brand" : "text-gray-300"}`}>{on ? `탑승 ${hhmm(checked[p.id])}` : "미탑승"}</span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="rounded-[20px] bg-white shadow-card text-center py-16 font-bold text-gray-400">해당하는 분이 없습니다.</li>
          )}
        </ul>
        <p className="text-center text-[13px] text-gray-400 pt-1">
          {state === "failed" ? "체크 현황을 불러오지 못했습니다" : "5초마다 자동으로 새로 고쳐집니다 · 담당자 모두 같은 화면"}
        </p>
      </main>
    </div>
  );
}
