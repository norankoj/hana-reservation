"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  type Form, type Question, type QuestionType, QUESTION_TYPES, hasOptions, questionsOf, slotLabel,
} from "@/lib/form";
import { adminApi, savedPassword } from "@/lib/admin";
import { ChevronLeft, Plus, X, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type SlotRow = { date: string; time: string; place: string };
// 보기는 편집하기 쉽게 "한 줄에 하나" 글로 들고 있다가 저장할 때 나눔
type QRow = Omit<Question, "options"> & { options: string };

const NEW_Q: QRow = { label: "", type: "long", options: "", required: true };
const input = "w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-brand bg-white";
const card = "bg-white p-5 md:p-6 rounded-[20px] shadow-card space-y-4";
const addBtn =
  "w-full flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-dashed border-gray-200 text-brand font-bold hover:border-brand/40";

export default function Settings() {
  const [pw, setPw] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null); // null = 새 설문
  const [info, setInfo] = useState({ title: "", intro: "", deadline: "" });
  const [slots, setSlots] = useState<SlotRow[]>([{ date: "", time: "", place: "" }]);
  const [questions, setQuestions] = useState<QRow[]>([NEW_Q]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = savedPassword();
    if (!p) return void location.replace("/admin"); // 로그인부터
    const formId = new URLSearchParams(location.search).get("form");
    // 비밀번호 확인 겸 설문 목록을 받아옴. ?form= 이 있으면 그 설문 수정
    adminApi(p, { action: "forms" }).then((r) => {
      if (r.status === 401) return void location.replace("/admin");
      if (!formId) return void setPw(p);
      const f: Form | undefined = (r.forms ?? []).find((x: Form) => x.id === formId);
      if (!f) return void location.replace("/admin");
      setId(f.id);
      setInfo({ title: f.title, intro: f.intro, deadline: f.deadline });
      setSlots(f.slots.map((s) => ({ date: s.slot.slice(0, 10), time: s.slot.slice(11), place: s.place })));
      setQuestions(questionsOf(f).map((q) => ({ ...q, options: q.options.join("\n") })));
      setPw(p);
    });
  }, []);

  const setSlot = (i: number, patch: Partial<SlotRow>) =>
    setSlots(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const setQ = (i: number, patch: Partial<QRow>) =>
    setQuestions(questions.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const moveQ = (i: number, d: -1 | 1) => {
    const next = [...questions];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setQuestions(next);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    const form = {
      id,
      ...info,
      slots: slots.map((s) => ({ slot: `${s.date} ${s.time}`, place: s.place.trim() })),
      questions: questions.map((q) => ({ ...q, options: q.options.split("\n") })),
    };
    setSaving(true);
    const r = await adminApi(pw, { action: "save", isNew: !id, form });
    setSaving(false);
    if (r.error === "BOOKED")
      return alert(
        `예약이 있는 시간은 지울 수 없습니다.\n먼저 예약을 취소하거나 다른 시간으로 옮겨 주세요.\n\n${r.slots
          .map((s: string) => `· ${slotLabel(s).date} ${slotLabel(s).time}`)
          .join("\n")}`,
      );
    if (r.error)
      return alert(
        "저장하지 못했습니다. 아래를 확인해 주세요.\n· 같은 시간이 두 번 들어가 있지 않은지\n· 같은 질문이 두 번 있지 않은지\n· 객관식/체크박스/드롭다운에 보기를 적었는지",
      );
    location.href = `/admin?form=${r.id}`;
  };

  const remove = async () => {
    if (!pw || !id) return;
    if (!confirm(`'${info.title}' 설문을 삭제할까요?\n\n⚠️ 이 설문의 모든 예약과 응답이 함께 삭제되며 복구할 수 없습니다.`)) return;
    const r = await adminApi(pw, { action: "delete", formId: id });
    if (r.error) return alert("삭제하지 못했습니다.");
    location.href = "/admin";
  };

  if (!pw) return <div className="h-screen flex items-center justify-center text-brand font-bold">불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <form onSubmit={save} className="max-w-2xl mx-auto p-4 md:p-8 space-y-5 pb-28">
        <Link href={id ? `/admin?form=${id}` : "/admin"} className="inline-flex items-center gap-1 text-gray-500 font-bold hover:text-gray-800">
          <ChevronLeft size={20} /> 예약 현황으로
        </Link>
        <h1 className="text-2xl font-bold">{id ? "설문 설정" : "새 설문 만들기"}</h1>

        <section className={card}>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">제목</span>
            <input className={input} required maxLength={60} value={info.title} placeholder="예: 면담 예약"
              onChange={(e) => setInfo({ ...info, title: e.target.value })} />
          </label>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">신청 마감일 (이 날까지 받음)</span>
            <input type="date" className={input} required value={info.deadline}
              onChange={(e) => setInfo({ ...info, deadline: e.target.value })} />
          </label>
          <p className="text-sm text-gray-500">
            {id ? <>신청 주소: <b>사이트주소/{id}</b></> : "신청 주소는 저장하면 자동으로 만들어집니다."}
          </p>
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
          <button type="button" className={addBtn}
            onClick={() => setSlots([...slots, { date: slots.at(-1)?.date ?? "", time: "", place: slots.at(-1)?.place ?? "" }])}>
            <Plus size={18} /> 시간 추가
          </button>
        </section>

        <section className={card}>
          <div>
            <h2 className="font-bold text-lg">질문</h2>
            <p className="text-sm text-gray-500">성함 · 소속셀 · 연락처는 기본으로 받습니다.</p>
          </div>
          <label className="block space-y-1.5">
            <span className="font-bold text-gray-700">질문 위 안내 문구 (선택)</span>
            <textarea className={`${input} h-20 resize-none`} maxLength={300} value={info.intro}
              placeholder="예: 풍성한 면담을 위해 아래 사전 질문은 가능한 한 구체적으로 작성 부탁드립니다."
              onChange={(e) => setInfo({ ...info, intro: e.target.value })} />
          </label>

          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 text-center font-bold text-gray-400">{i + 1}</span>
                <input className={input} maxLength={200} value={q.label} placeholder="질문 내용" aria-label="질문 내용"
                  onChange={(e) => setQ(i, { label: e.target.value })} />
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-8">
                <select value={q.type} onChange={(e) => setQ(i, { type: e.target.value as QuestionType })} aria-label="질문 형식"
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 font-semibold bg-white">
                  {Object.entries(QUESTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <label className="flex items-center gap-1.5 font-semibold text-gray-600 px-2">
                  <input type="checkbox" checked={q.required} onChange={(e) => setQ(i, { required: e.target.checked })} className="w-4 h-4 accent-brand" />
                  필수
                </label>
                <div className="ml-auto flex">
                  <button type="button" disabled={i === 0} onClick={() => moveQ(i, -1)} aria-label="위로" className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowUp size={18} /></button>
                  <button type="button" disabled={i === questions.length - 1} onClick={() => moveQ(i, 1)} aria-label="아래로" className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowDown size={18} /></button>
                  <button type="button" onClick={() => setQuestions(questions.filter((_, j) => j !== i))} aria-label="질문 삭제" className="p-2 text-gray-400 hover:text-red-500"><X size={18} /></button>
                </div>
              </div>
              {hasOptions(q.type) && (
                <textarea className={`${input} h-28 ml-8 w-[calc(100%-2rem)]`} required value={q.options}
                  placeholder={"보기를 한 줄에 하나씩 적어 주세요\n예:\n단기선교\n장기선교"}
                  onChange={(e) => setQ(i, { options: e.target.value })} aria-label="보기" />
              )}
            </div>
          ))}
          <button type="button" className={addBtn} onClick={() => setQuestions([...questions, NEW_Q])}>
            <Plus size={18} /> 질문 추가
          </button>
          {id && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
              질문 글을 고치면, 이미 받은 답변은 관리자 화면에서 예전 질문 이름으로 따로 보입니다.
            </p>
          )}
        </section>

        {id && (
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
