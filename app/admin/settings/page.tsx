"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Form, slotLabel } from "@/lib/form";
import { adminApi, savedPassword } from "@/lib/admin";
import { ChevronLeft, Plus, X, Trash2 } from "lucide-react";

type SlotRow = { date: string; time: string; place: string };

const EMPTY = { id: "", title: "", intro: "", deadline: "" };
const input = "w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand bg-white";
const card = "bg-white p-5 md:p-6 rounded-[20px] shadow-card space-y-4";

export default function Settings() {
  const [pw, setPw] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [info, setInfo] = useState(EMPTY);
  const [slots, setSlots] = useState<SlotRow[]>([{ date: "", time: "", place: "" }]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = savedPassword();
    if (!p) return void location.replace("/admin"); // 로그인부터
    const id = new URLSearchParams(location.search).get("form");
    // 비밀번호 확인 겸 설문 목록을 받아옴. ?form= 이 있으면 그 설문 수정
    adminApi(p, { action: "forms" }).then((r) => {
      if (r.status === 401) return void location.replace("/admin");
      if (!id) return void setPw(p);
      const f: Form | undefined = (r.forms ?? []).find((x: Form) => x.id === id);
      if (!f) return void location.replace("/admin");
      setIsNew(false);
      setInfo({ id: f.id, title: f.title, intro: f.intro, deadline: f.deadline });
      setSlots(f.slots.map((s) => ({ date: s.slot.slice(0, 10), time: s.slot.slice(11), place: s.place })));
      setQuestions(f.questions.length ? f.questions : [""]);
      setPw(p);
    });
  }, []);

  const setSlot = (i: number, patch: Partial<SlotRow>) =>
    setSlots(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    setSaving(true);
    const form = {
      ...info,
      slots: slots.map((s) => ({ slot: `${s.date} ${s.time}`, place: s.place.trim() })),
      questions,
    };
    const r = await adminApi(pw, { action: "save", isNew, form });
    setSaving(false);
    if (r.error === "ID_TAKEN") return alert("이미 쓰고 있는 주소입니다. 다른 주소를 적어 주세요.");
    if (r.error === "BOOKED")
      return alert(
        `예약이 있는 시간은 지울 수 없습니다.\n먼저 예약을 취소하거나 다른 시간으로 옮겨 주세요.\n\n${r.slots
          .map((s: string) => `· ${slotLabel(s).date} ${slotLabel(s).time}`)
          .join("\n")}`,
      );
    if (r.error) return alert("저장하지 못했습니다. 같은 시간이 두 번 들어가 있지 않은지, 빈 칸이 없는지 확인해 주세요.");
    location.href = `/admin?form=${info.id}`;
  };

  const remove = async () => {
    if (!pw) return;
    if (!confirm(`'${info.title}' 설문을 삭제할까요?\n\n⚠️ 이 설문의 모든 예약과 응답이 함께 삭제되며 복구할 수 없습니다.`)) return;
    const r = await adminApi(pw, { action: "delete", formId: info.id });
    if (r.error) return alert("삭제하지 못했습니다.");
    location.href = "/admin";
  };

  if (!pw) return <div className="h-screen flex items-center justify-center text-brand font-bold">불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <form onSubmit={save} className="max-w-2xl mx-auto p-4 md:p-8 space-y-5 pb-28">
        <Link href={isNew ? "/admin" : `/admin?form=${info.id}`} className="inline-flex items-center gap-1 text-gray-500 font-bold hover:text-gray-800">
          <ChevronLeft size={20} /> 예약 현황으로
        </Link>
        <h1 className="text-2xl font-bold">{isNew ? "새 설문 만들기" : "설문 설정"}</h1>

        <section className={card}>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">제목</span>
            <input className={input} required maxLength={60} value={info.title} placeholder="예: 면담 예약"
              onChange={(e) => setInfo({ ...info, title: e.target.value })} />
          </label>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">주소 (영문 소문자, 숫자, -)</span>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="shrink-0 text-sm">사이트주소/</span>
              <input className={`${input} disabled:bg-gray-100 disabled:text-gray-500`} required disabled={!isNew}
                pattern="[a-z0-9\-]{2,40}" title="영문 소문자, 숫자, - 로 2~40자" placeholder="예: mission-2027"
                value={info.id} onChange={(e) => setInfo({ ...info, id: e.target.value.toLowerCase() })} />
            </div>
            {!isNew && <span className="text-sm text-gray-400">이미 링크를 나눴을 수 있어 주소는 바꿀 수 없습니다.</span>}
          </label>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">신청 마감일 (이 날까지 받음)</span>
            <input type="date" className={input} required value={info.deadline}
              onChange={(e) => setInfo({ ...info, deadline: e.target.value })} />
          </label>
        </section>

        <section className={card}>
          <div>
            <h2 className="font-bold text-lg">시간대</h2>
            <p className="text-sm text-gray-500">한 시간대에 한 명씩 예약됩니다. 저장하면 시간순으로 정렬돼요.</p>
          </div>
          {slots.map((s, i) => (
            <div key={i} className="flex flex-wrap md:flex-nowrap items-center gap-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <input type="date" required className={`${input} flex-1 min-w-[140px]`} value={s.date} onChange={(e) => setSlot(i, { date: e.target.value })} aria-label="날짜" />
              <input type="time" required step={600} className={`${input} flex-1 min-w-[110px]`} value={s.time} onChange={(e) => setSlot(i, { time: e.target.value })} aria-label="시간" />
              <input className={`${input} flex-[2] min-w-[160px]`} maxLength={40} placeholder="장소" value={s.place} onChange={(e) => setSlot(i, { place: e.target.value })} aria-label="장소" />
              <button type="button" onClick={() => setSlots(slots.filter((_, j) => j !== i))} aria-label="시간대 삭제"
                className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
          ))}
          {/* 마지막 줄의 날짜·장소를 복사해서 추가 (비슷한 시간 여러 개 넣기 편하게) */}
          <button type="button" onClick={() => setSlots([...slots, { ...(slots.at(-1) ?? { date: "", place: "" }), time: "" } as SlotRow])}
            className="w-full flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-dashed border-gray-200 text-brand font-bold hover:border-brand/40">
            <Plus size={18} /> 시간 추가
          </button>
        </section>

        <section className={card}>
          <h2 className="font-bold text-lg">사전 질문</h2>
          <p className="text-sm text-gray-500">성함 · 소속셀 · 연락처는 기본으로 받습니다. 아래 질문은 모두 필수 응답입니다.</p>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">질문 위 안내 문구 (선택)</span>
            <textarea className={`${input} h-20 resize-none`} maxLength={300} value={info.intro}
              placeholder="예: 풍성한 면담을 위해 아래 사전 질문은 가능한 한 구체적으로 작성 부탁드립니다."
              onChange={(e) => setInfo({ ...info, intro: e.target.value })} />
          </label>
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-gray-400">{i + 1}</span>
              <input className={input} maxLength={200} value={q} placeholder="질문 내용"
                onChange={(e) => setQuestions(questions.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" onClick={() => setQuestions(questions.filter((_, j) => j !== i))} aria-label="질문 삭제"
                className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setQuestions([...questions, ""])}
            className="w-full flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-dashed border-gray-200 text-brand font-bold hover:border-brand/40">
            <Plus size={18} /> 질문 추가
          </button>
          {!isNew && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
              질문 글을 고치면, 이미 받은 답변은 관리자 화면에서 예전 질문 이름으로 따로 보입니다.
            </p>
          )}
        </section>

        {!isNew && (
          <button type="button" onClick={remove} className="flex items-center gap-1.5 text-sm font-bold text-red-500 px-1">
            <Trash2 size={16} /> 이 설문 삭제
          </button>
        )}

        <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-200 p-4 pb-safe">
          <button disabled={saving} className="max-w-2xl mx-auto block w-full bg-brand text-white font-bold py-4 rounded-2xl shadow-brand hover:bg-brand-dark disabled:bg-gray-300 text-lg">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
