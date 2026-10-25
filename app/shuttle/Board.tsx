"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Search, Phone } from "lucide-react";

// 셔틀 탑승 명단. 주소 두 개가 이 화면 하나를 씁니다.
//  /shuttle        도착지에서 보는 현황. 전화는 걸 수 있고 탑승 체크는 못 함
//  /shuttle/check  버스 담당자용. 위에 더해 「탑승」 버튼. 비밀번호 없이 링크만으로
// 둘 다 연락처가 보이는 뷰(shuttle_roster) 를 읽습니다. 두 링크 모두 단체방에 올리지 말고
// 필요한 분에게만 보내세요. (연락처를 빼려면 shuttle_board 뷰로 바꾸면 됩니다)
type Passenger = {
  id: number;
  seq: number;
  name: string;
  affil: string;
  route: string;
  go_at: string | null;
  back_at: string | null;
  phone?: string; // 명단에 번호가 없는 분도 있음
};

const LEGS = {
  go: { label: "출발", only: "출발만", at: "go_at" },
  back: { label: "귀가", only: "귀가만", at: "back_at" },
} as const;
type Leg = keyof typeof LEGS;

/** 그 편을 타는 사람인지 (왕복 + 그 편만) */
const rides = (p: Passenger, leg: Leg) => p.route === "왕복" || p.route === LEGS[leg].only;
const boardedAt = (p: Passenger, leg: Leg) => p[LEGS[leg].at];
const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("ko-KR", { hour12: false, hour: "2-digit", minute: "2-digit" });

// 색은 사이트 남보라 하나만. 모서리는 면 20px / 버튼 12px / 칩 둥글게.
const surface = "rounded-[20px]";

export default function Board({ canCheck = false }: { canCheck?: boolean }) {
  const [rows, setRows] = useState<Passenger[]>([]);
  const [leg, setLeg] = useState<Leg>("go");
  const [leftOnly, setLeftOnly] = useState(false); // 미탑승만 보기
  const [q, setQ] = useState("");
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("shuttle_roster").select("*").order("seq");
    if (error) return setState("failed");
    setRows(data ?? []);
    setState("ok");
  }, []);

  // 첫 로드 + 5초마다. 다른 사람이 체크한 것도 따라옵니다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  // 누르면 바로 반영하고(기다리지 않게) 저장합니다.
  // 저장은 DB 함수 shuttle_check 로만. (표에 직접 쓰면 권한 때문에 조용히 0건만 바뀝니다)
  const toggle = async (p: Passenger) => {
    const col = LEGS[leg].at;
    const on = !boardedAt(p, leg);
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, [col]: on ? new Date().toISOString() : null } : r)));
    const { data, error } = await supabase.rpc("shuttle_check", { p_id: p.id, p_leg: leg, p_on: on });
    // 켰는데 시각이 안 돌아오면 저장되지 않은 것
    if (error || (on && !data)) alert(`${p.name}님 저장에 실패했습니다.\n인터넷 연결을 확인하고 다시 눌러 주세요.`);
    load();
  };

  const onLeg = rows.filter((p) => rides(p, leg));
  const done = onLeg.filter((p) => boardedAt(p, leg));
  const list = onLeg.filter(
    (p) =>
      (!leftOnly || !boardedAt(p, leg)) &&
      (!q.trim() || p.name.includes(q.trim()) || p.affil.includes(q.trim())),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 선 대신 바탕색으로 머리글을 띄웁니다 (테두리·구분선 없음) */}
      <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-3 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="text-xl font-bold">셔틀 탑승 {canCheck ? "체크" : "현황"}</h1>
            <p className="text-[13px] font-bold text-gray-500">26가을 하만수</p>
          </div>

          {/* 출발 / 귀가 탭 하나로 머리글을 끝냅니다. 갈 때는 출발에서, 올 때는 귀가에서 체크 */}
          <div role="tablist" aria-label="탑승 편" className="flex gap-1.5 bg-gray-200 rounded-full p-1.5">
            {(Object.keys(LEGS) as Leg[]).map((k) => {
              const target = rows.filter((p) => rides(p, k));
              const n = target.filter((p) => boardedAt(p, k)).length;
              const active = k === leg;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setLeg(k)}
                  className={`flex-1 rounded-full px-3 py-2 transition ${active ? "bg-brand shadow-brand" : "text-gray-500"}`}
                >
                  <span className={`block text-[13px] font-bold ${active ? "text-white/70" : "text-gray-500"}`}>
                    {LEGS[k].label}
                  </span>
                  <span className={`block text-[22px] font-extrabold tabular-nums leading-tight ${active ? "text-white" : "text-gray-400"}`}>
                    {n}
                    <span className={`text-[15px] font-bold ${active ? "text-white/60" : "text-gray-400"}`}> / {target.length}명</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-10 space-y-2.5">
        {/* 검색과 「미탑승만」 한 줄로. (전체·탑승 칩은 탭 숫자와 초록 줄로 이미 보여서 뺐습니다) */}
        <div className="flex gap-2">
          <label className={`${surface} relative flex-1 bg-white shadow-card focus-within:ring-2 focus-within:ring-brand`}>
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름 검색"
              className="w-full bg-transparent rounded-[20px] pl-11 pr-3 py-3 font-semibold outline-none placeholder:text-gray-400"
            />
          </label>
          <button
            onClick={() => setLeftOnly((v) => !v)}
            aria-pressed={leftOnly}
            className={`shrink-0 px-4 rounded-full text-sm font-bold transition ${leftOnly ? "bg-gray-900 text-white" : "bg-white text-gray-500 shadow-card"}`}
          >
            미탑승 {onLeg.length - done.length}
          </button>
        </div>

        {/* 한 사람이 한 칸. 구분선 없이 간격과 바탕색으로 나눕니다 */}
        <ul className="space-y-2">
          {list.map((p) => {
            const at = boardedAt(p, leg);
            return (
              <li
                key={p.id}
                className={`${surface} flex items-center gap-3 pl-3.5 pr-3 py-2.5 transition-colors ${at ? "bg-brand-soft" : "bg-white shadow-card"}`}
              >
                {/* 탄 사람은 남보라 동그라미. 안 탄 사람은 빈 자리 (한눈에 다름) */}
                <span
                  className={`shrink-0 size-8 rounded-full grid place-items-center ${at ? "bg-brand text-white" : "bg-gray-100 text-transparent"}`}
                >
                  <Check size={18} strokeWidth={3} />
                </span>

                {/* 이름은 한 줄. 가운데 정렬이 흐트러지지 않게 둘째 줄을 두지 않습니다 */}
                <span className="min-w-0 flex-1 flex items-baseline gap-1.5">
                  <span className={`text-[17px] font-bold truncate ${at ? "text-brand-dark" : "text-gray-900"}`}>{p.name}</span>
                  {p.affil && (
                    <span className={`text-[13px] font-semibold truncate ${at ? "text-brand/60" : "text-gray-400"}`}>{p.affil}</span>
                  )}
                  {/* 벳지는 글자 기준선이 아니라 이름 가운데에 (기준선을 맞추면 내려앉음) */}
                  {p.route !== "왕복" && (
                    <span className="shrink-0 self-center text-[11px] font-bold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 leading-[1.45]">
                      {p.route}
                    </span>
                  )}
                </span>

                {at && (
                  <span className="shrink-0 text-[13px] font-bold tabular-nums text-brand">{hhmm(at)}</span>
                )}

                {/* 안 오신 분께 바로 전화. 보기 화면에서도 걸 수 있게 (번호가 있는 분만) */}
                {p.phone ? (
                  <a
                    href={`tel:${p.phone}`}
                    aria-label={`${p.name} 전화`}
                    className={`shrink-0 size-12 grid place-items-center rounded-xl ${at ? "text-brand/50" : "text-gray-400 hover:text-brand hover:bg-gray-100"}`}
                  >
                    <Phone size={19} />
                  </a>
                ) : (
                  <span className="shrink-0 size-12" /> // 번호 없는 분도 줄이 맞도록
                )}

                {canCheck &&
                  (at ? (
                    <button
                      onClick={() => toggle(p)}
                      aria-label={`${p.name} 탑승 취소`}
                      className="shrink-0 h-12 px-3 rounded-xl text-[13px] font-bold text-brand/60 active:scale-95 transition"
                    >
                      취소
                    </button>
                  ) : (
                    <button
                      onClick={() => toggle(p)}
                      aria-label={`${p.name} 탑승`}
                      className="shrink-0 h-12 px-5 rounded-xl text-[16px] font-bold text-white bg-brand hover:bg-brand-dark active:scale-95 transition"
                    >
                      탑승
                    </button>
                  ))}
              </li>
            );
          })}
          {list.length === 0 && (
            <li className={`${surface} bg-white shadow-card text-center py-16 font-bold text-gray-400`}>
              {state === "failed"
                ? "명단을 불러오지 못했습니다."
                : state === "loading"
                  ? "명단을 불러오는 중입니다..."
                  : "해당하는 분이 없습니다."}
            </li>
          )}
        </ul>

        <p className="text-center text-[13px] text-gray-400 pt-1">5초마다 자동으로 새로 고쳐집니다</p>
      </main>
    </div>
  );
}
