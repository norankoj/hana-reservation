"use client";

import { useState, useEffect } from "react";
import { info } from "./info";
import { today } from "@/lib/form";
import { Check } from "lucide-react";

// 일본 집회 참가 안내. /staff 포스터 톤(크림 바탕 + 빨강·남색)으로.
// 문구·날짜·링크는 전부 ./info.ts 에서 고칩니다.
const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#1f2a44]";
const btnRed = `flex items-center justify-center gap-2 min-h-14 px-5 rounded-xl bg-[#a8201a] text-white text-[17px] font-bold active:scale-[0.98] transition ${focus}`;
const btnLine = `flex items-center justify-center gap-2 min-h-14 px-5 rounded-xl border-2 border-[#1f2a44]/20 bg-white text-[17px] font-bold active:scale-[0.98] transition ${focus}`;

const contactHref = info.contactPhone ? `tel:${info.contactPhone}` : info.contactLink || "#contact";
const CHECK_KEY = "japan-checklist";

// 비어 있으면 "추후 공지" 배지
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2.5">
      <dt className="w-24 shrink-0 font-bold text-[#1f2a44]/70">{label}</dt>
      <dd className="min-w-0">{value || <Badge muted>추후 공지</Badge>}</dd>
    </div>
  );
}

function Badge({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[15px] font-bold ${muted ? "bg-[#1f2a44]/10 text-[#1f2a44]/75" : "bg-[#a8201a] text-white"}`}>
      {children}
    </span>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 bg-white rounded-2xl border-2 border-[#1f2a44]/10 p-5 space-y-4">
      <div>
        <p className="text-[14px] tracking-[0.25em] font-bold text-[#a8201a]">✦ {eyebrow} ✦</p>
        <h2 className="mt-0.5 text-[22px] font-extrabold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const List = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 list-disc pl-5 marker:text-[#a8201a]">
    {items.filter(Boolean).map((t) => <li key={t}>{t}</li>)}
  </ul>
);

export default function JapanPage() {
  const [dday, setDday] = useState<number | null>(null);
  const [who, setWho] = useState<"group" | "solo" | null>(null);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    // D-day 는 접속한 날 기준 (빌드한 날이 아니라)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDday(Math.round((Date.parse(info.startDate) - Date.parse(today())) / 86400000));
    try {
      setChecked(JSON.parse(localStorage.getItem(CHECK_KEY) ?? "[]"));
    } catch {}
    // #bus, #leader 로 들어오면 해당 카드를 펼쳐서 보여줌
    const openHash = () => {
      const h = location.hash;
      if (h !== "#bus" && h !== "#leader") return;
      setWho(h === "#bus" ? "group" : "solo");
      requestAnimationFrame(() => document.querySelector(h)?.scrollIntoView());
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  const toggle = (item: string) => {
    const next = checked.includes(item) ? checked.filter((c) => c !== item) : [...checked, item];
    setChecked(next);
    try {
      localStorage.setItem(CHECK_KEY, JSON.stringify(next));
    } catch {}
  };

  const ended = dday !== null && dday < (Date.parse(info.startDate) - Date.parse(info.endDate)) / 86400000;
  const apply = [
    ["신청 방법", info.applyMethod],
    ["신청 마감", info.applyDeadline],
    ["참가비", info.fee],
    ["포함 내역", info.feeIncludes],
    ["납부 방법", info.feePayment],
  ].filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-[#e9dcc4] flex justify-center md:py-8 text-[#1f2a44] text-[17px] leading-relaxed">
      <main className="w-full max-w-md bg-[#f6eedd] md:rounded-[28px] md:shadow-card-lg overflow-hidden pb-28 md:pb-10">
        {/* 1. 히어로 */}
        <header className="relative bg-[#1f2a44] text-[#f6eedd] px-6 pt-10 pb-8 overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-[#a8201a]" />
          <p className="relative text-[14px] tracking-[0.3em] font-bold text-[#f0c9a8]">✦ OITA PROMISE LAND ✦</p>
          <h1 className="relative mt-3 text-[34px] leading-[1.15] font-extrabold tracking-tight">
            Promised Land
            <br />
            Japan in Oita
          </h1>
          <p className="relative mt-4 text-[18px] font-bold">{info.dates}</p>
          {dday !== null && !ended && (
            <p className="relative mt-3">
              <span className="inline-block rounded-lg bg-[#a8201a] px-3 py-1 text-[20px] font-extrabold tabular-nums">
                {dday > 0 ? `D-${dday}` : "집회 기간입니다"}
              </span>
            </p>
          )}
          <div className="relative mt-6 grid grid-cols-2 gap-2">
            <a href={info.staffLink} className={btnRed}>스태프 신청</a>
            <a href={contactHref} className={`${btnLine} text-[#1f2a44]`}>문의</a>
          </div>
        </header>

        <div className="px-4 pt-5 space-y-4">
          {/* 소개 */}
          <section className="px-1 space-y-3">
            {info.intro.map((p) => <p key={p}>{p}</p>)}
          </section>

          {/* 2. 핵심 일정 */}
          <Section id="schedule" eyebrow="SCHEDULE" title="핵심 일정">
            <ol className="relative border-l-2 border-[#a8201a]/30 ml-2 space-y-5">
              {info.timeline.map((t) => (
                <li key={t.date + t.title} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-[#a8201a] ${t.main ? "bg-[#a8201a]" : "bg-white"}`} />
                  <p className="text-[15px] font-bold text-[#a8201a]">{t.date}</p>
                  <p className={`font-extrabold ${t.main ? "text-[20px]" : "text-[18px]"}`}>{t.title}</p>
                  {t.desc && <p className="text-[#1f2a44]/75">{t.desc}</p>}
                </li>
              ))}
            </ol>
          </Section>

          {/* 3. 나는 어디에 해당? */}
          <Section eyebrow="HOW TO JOIN" title="참가 방법">
            {apply.length > 0 && (
              <dl className="rounded-xl bg-[#f6eedd] px-4 py-1 divide-y divide-[#1f2a44]/10">
                {apply.map(([k, v]) => <Row key={k} label={k} value={v} />)}
              </dl>
            )}
            <p className="font-bold">나는 어디에 해당하나요?</p>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="참가 방식 선택">
              {([["group", "단체 항공 예약 참가자"], ["solo", "개별 항공 예약 참가자"]] as const).map(([k, label]) => (
                <button
                  key={k} type="button" aria-pressed={who === k} onClick={() => setWho(who === k ? null : k)}
                  className={`min-h-16 px-3 rounded-xl border-2 font-bold leading-snug transition ${focus} ${who === k ? "bg-[#1f2a44] border-[#1f2a44] text-white" : "bg-white border-[#1f2a44]/20"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {who === "group" && (
              <div className="rounded-xl bg-[#f6eedd] p-4 space-y-4 animate-fade-in">
                <p className="text-[19px] font-extrabold">단체 항공 예약 참가자</p>
                <List items={info.group} />
                <div id="bus" className="scroll-mt-4 rounded-xl bg-white p-4 space-y-2">
                  <p className="font-extrabold">인천공항행 버스</p>
                  <p>{info.busText}</p>
                  {info.busDeadline && <p><Badge>신청 마감 {info.busDeadline}</Badge></p>}
                  <dl className="divide-y divide-[#1f2a44]/10">
                    <Row label="탑승 장소" value={info.busPlace} />
                    <Row label="집합 시간" value={info.busTime} />
                  </dl>
                  {info.busLink ? (
                    <a href={info.busLink} className={`${btnRed} w-full`}>버스 탑승 신청하기</a>
                  ) : (
                    <p className="flex items-center justify-center min-h-14 rounded-xl bg-[#1f2a44]/10 font-bold text-[#1f2a44]/75">신청 링크 추후 공지</p>
                  )}
                </div>
              </div>
            )}

            {who === "solo" && (
              <div className="rounded-xl bg-[#f6eedd] p-4 space-y-4 animate-fade-in">
                <div>
                  <p className="text-[19px] font-extrabold">개별 항공 예약 참가자</p>
                  <p className="text-[15px] font-bold text-[#1f2a44]/70">개인·셀별</p>
                </div>
                <List items={info.solo} />
                <dl className="rounded-xl bg-white px-4 py-1 divide-y divide-[#1f2a44]/10">
                  <Row label="숙소" value={info.soloStay} />
                  <Row label="입국 공항" value={info.soloAirport} />
                  <Row label="집회장 이동" value={info.soloTransfer} />
                </dl>
                <div id="leader" className="scroll-mt-4 rounded-xl bg-white p-4 space-y-2">
                  <p className="font-extrabold">팀 담당자 지정</p>
                  <p>{info.leaderText}</p>
                  <dl className="divide-y divide-[#1f2a44]/10">
                    <div className="flex gap-3 py-2.5">
                      <dt className="w-24 shrink-0 font-bold text-[#1f2a44]/70">제출 기한</dt>
                      <dd>{info.leaderDeadline ? <Badge>{info.leaderDeadline}까지</Badge> : <Badge muted>추후 공지</Badge>}</dd>
                    </div>
                    <Row label="제출처" value={info.leaderContact} />
                  </dl>
                  <p className="text-[#1f2a44]/80">{info.leaderDuty}</p>
                </div>
              </div>
            )}
          </Section>

          {/* 4. 확인해두면 좋을 것 */}
          <Section eyebrow="CHECKLIST" title="확인해두면 좋을 것">
            <dl className="divide-y divide-[#1f2a44]/10">
              <Row label="여권" value={info.passport} />
              {info.passportCopy && <Row label="여권 사본" value={info.passportCopy} />}
              <Row label="여행자 보험" value={info.insurance} />
            </dl>
            <div>
              <p className="font-bold">
                준비물 체크리스트 <span className="text-[15px] font-semibold text-[#1f2a44]/70">({checked.filter((c) => info.checklist.includes(c)).length}/{info.checklist.length})</span>
              </p>
              <ul className="mt-2 space-y-2">
                {info.checklist.map((item) => {
                  const on = checked.includes(item);
                  return (
                    <li key={item}>
                      <label className="flex items-center gap-3 min-h-12 px-3 rounded-xl border-2 border-[#1f2a44]/10 bg-white cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[#1f2a44]">
                        <input type="checkbox" checked={on} onChange={() => toggle(item)} className="sr-only" />
                        <span className={`grid place-items-center size-6 shrink-0 rounded-md border-2 ${on ? "bg-[#a8201a] border-[#a8201a] text-white" : "border-[#1f2a44]/30"}`}>
                          {on && <Check size={16} strokeWidth={3} />}
                        </span>
                        <span className={on ? "line-through text-[#1f2a44]/50" : ""}>{item}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[15px] text-[#1f2a44]/70">체크한 내용은 이 휴대폰에만 저장돼요.</p>
            </div>
          </Section>

          {/* 5. 스태프 모집 */}
          <Section id="staff" eyebrow="STAFF" title="스태프 모집">
            {info.staff.map((p) => <p key={p}>{p}</p>)}
            <dl className="rounded-xl bg-[#f6eedd] px-4 py-1">
              <Row label="모집 대상" value={info.staffTarget} />
            </dl>
            <p className="border-l-4 border-[#a8201a] pl-3 font-semibold">{info.staffQuote}</p>
            <a href={info.staffLink} className={`${btnRed} w-full`}>스태프 신청하기</a>
          </Section>

          {/* 6. 준비 기도모임 */}
          <Section id="prayer" eyebrow="PRAYER" title="준비 기도모임">
            <div className="grid grid-cols-2 gap-2">
              {info.prayerDates.map((d) => (
                <div key={d} className="rounded-xl bg-[#1f2a44] text-white p-4 text-center">
                  <p className="text-[22px] font-extrabold">{d}</p>
                  <p className="mt-1">{info.prayerTime || "시간 추후 공지"}</p>
                  <p className="text-[#f0c9a8] font-bold">{info.prayerPlace || "장소 추후 공지"}</p>
                </div>
              ))}
            </div>
            <p>{info.prayerText}</p>
          </Section>

          {/* 7. 문의·긴급 연락처 */}
          <Section id="contact" eyebrow="CONTACT" title="문의·긴급 연락처">
            <dl className="divide-y divide-[#1f2a44]/10">
              <Row label="문의" value={[info.contactName, info.contactPhone].filter(Boolean).join(" ")} />
              <Row label="현지 긴급" value={[info.emergencyName, info.emergencyPhone].filter(Boolean).join(" ")} />
            </dl>
            {(info.contactPhone || info.contactLink) && (
              <a href={contactHref} className={`${btnLine} w-full`}>문의하기</a>
            )}
            {info.emergencyPhone && (
              <a href={`tel:${info.emergencyPhone}`} className={`${btnRed} w-full`}>현지 긴급 전화</a>
            )}
          </Section>

          <p className="py-6 text-center text-[19px] font-extrabold leading-snug text-[#a8201a]">{info.closing}</p>
        </div>
      </main>

      {/* 8. 모바일 하단 고정 버튼 */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-20 bg-[#f6eedd]/95 backdrop-blur border-t border-[#1f2a44]/10 px-4 pt-3 pb-safe">
        <div className="grid grid-cols-2 gap-2 pb-3">
          <a href={info.staffLink} className={btnRed}>스태프 신청</a>
          <a href={contactHref} className={btnLine}>문의</a>
        </div>
      </nav>
    </div>
  );
}
