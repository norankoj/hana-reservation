"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, Plane, BusFront, MapPin, Heart, Sparkles, SquareCheck, NotebookText } from "lucide-react";
import { Black_Han_Sans } from "next/font/google";
import { info } from "./info";
import { today } from "@/lib/form";
import { BusNotes } from "./FormShell";

// 일본 집회 참가 안내. /staff 포스터 톤(크림 바탕 + 빨강·남색)으로.
// 문구·날짜·링크는 전부 ./info.ts 에서 고칩니다.
// 모서리: 카드 rounded-2xl, 버튼 rounded-xl
// D-day·다음 일정 카드 숫자와 제목만 포스터처럼 굵은 글꼴
const display = Black_Han_Sans({ weight: "400", preload: false });

const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#1f2a44]";
const btnRed = `flex items-center justify-center min-h-14 px-5 rounded-xl bg-[#a8201a] hover:bg-[#8c1a15] text-white text-[17px] font-bold active:scale-[0.98] transition ${focus}`;
const btnLine = `flex items-center justify-center min-h-14 px-5 rounded-xl border-2 border-[#1f2a44]/20 bg-white hover:border-[#1f2a44]/50 hover:bg-[#f6eedd] text-[#1f2a44] text-[17px] font-bold active:scale-[0.98] transition ${focus}`;
const card = "reveal scroll-mt-4 bg-white rounded-2xl border-2 border-[#1f2a44]/10 p-5 space-y-4";

const contactHref = info.contactPhone ? `tel:${info.contactPhone}` : info.contactLink;
const hasContact = [info.contactName, info.contactPhone, info.contactLink, info.emergencyName, info.emergencyPhone].some(Boolean);
const joinName = (...v: string[]) => v.filter(Boolean).join(" ");

// info 의 **굵게** 를 형광펜 강조로
function Rich({ text }: { text: string }) {
  return text.split("**").map((t, i) =>
    i % 2 ? (
      <strong key={i} className="font-extrabold box-decoration-clone bg-[linear-gradient(transparent_58%,#f6c9bb_58%)]">{t}</strong>
    ) : (
      t
    ),
  );
}

const Muted = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded-md px-2 py-0.5 text-[15px] font-bold bg-[#1f2a44]/10 text-[#1f2a44]/75">{children}</span>
);

// 비어 있으면 "추후 공지"
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3">
      <dt className="w-24 shrink-0 font-bold text-[#a8201a]">{label}</dt>
      <dd className="min-w-0">{children || <Muted>추후 공지</Muted>}</dd>
    </div>
  );
}

// 포스터의 "✦ OITA PROMISE LAND ✦" 처럼 영문 머리글 + 제목
function Title({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[14px] tracking-[0.25em] font-bold text-[#a8201a]">✦ {eyebrow} ✦</p>
      <h2 className="mt-0.5 text-[24px] font-extrabold tracking-tight">{children}</h2>
    </div>
  );
}

// 버튼 위에 떠 있는 말풍선 ("오늘까지 신청!"). 감싼 요소에 relative 필요
function Bubble({ children, light }: { children: React.ReactNode; light?: boolean }) {
  const color = light ? "bg-[#f6eedd] text-[#a8201a]" : "bg-[#1f2a44] text-white";
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-full mb-2.5 flex justify-center">
      <span className={`relative whitespace-nowrap rounded-full px-3.5 py-1 text-[15px] font-extrabold shadow-sm motion-safe:animate-bob ${color}`}>
        {children}
        <span aria-hidden className={`absolute left-1/2 top-full -ml-1.5 -mt-1.5 size-3 rotate-45 ${color}`} />
      </span>
    </span>
  );
}

// 위쪽 바로가기 (내용이 길어서). [이름, 주소]
const JUMPS = [
  ["일정", "#schedule", CalendarDays],
  ["참가 방법", "#join", Plane],
  ["버스", "#bus", BusFront],
  ["도착 후", "#arrival", MapPin],
  ["스태프", "#staff", Heart],
  ["기도모임", "#prayer", Sparkles],
  ["확인할 것", "#check", SquareCheck],
] as const;
const tile = `flex flex-col items-center gap-1.5 rounded-2xl px-1 pt-3 pb-2.5 text-[15px] font-bold leading-tight active:scale-[0.97] transition ${focus}`;
const tileIcon = "grid size-11 place-items-center rounded-xl";

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 list-disc pl-5 marker:text-[#a8201a]">
    {items.map((t) => <li key={t}><Rich text={t} /></li>)}
  </ul>
);


export default function JapanPage() {
  const [now, setNow] = useState<string | null>(null);
  const [who, setWho] = useState<"group" | "solo" | null>(null);

  useEffect(() => {
    // D-day·다음 일정은 접속한 날 기준 (빌드한 날이 아니라)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(today());
    // #leader 로 들어오면 개별 항공 카드를 펼쳐서 보여줌
    const openHash = () => {
      const h = location.hash;
      if (h !== "#leader") return;
      setWho("solo");
      requestAnimationFrame(() => document.querySelector(h)?.scrollIntoView());
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  const dday = now === null ? null : Math.round((Date.parse(info.startDate) - Date.parse(now)) / 86400000);
  const next = now === null ? undefined : info.timeline.find((t) => t.until >= now);
  const closed = now !== null && now > info.formDeadline; // 버스·팀 담당자 신청 마감
  const lastDay = now === info.formDeadline; // 마감 당일엔 "오늘까지" 강조

  return (
    <div className="min-h-[100dvh] bg-[#e9dcc4] flex justify-center md:py-8 text-[#1f2a44] text-[17px] leading-relaxed break-keep">
      <main className="w-full max-w-md bg-[#f6eedd] md:rounded-[28px] md:shadow-card-lg overflow-hidden">
        {/* 히어로 */}
        <header className="relative bg-[#1f2a44] text-[#f6eedd] px-6 pt-10 pb-8 overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-[#a8201a] motion-safe:animate-bob" />
          <p className="relative text-[14px] tracking-[0.3em] font-bold text-[#f0c9a8]">✦ OITA PROMISE LAND ✦</p>
          <h1 className="relative mt-3 text-[34px] leading-[1.15] font-extrabold tracking-tight">
            Promised Land
            <br />
            Japan in Oita
          </h1>
          <p className="relative mt-4 text-[18px] font-bold">{info.dates}</p>
          <div className={`relative grid grid-cols-2 gap-2 ${lastDay ? "mt-12" : "mt-6"}`}>
            <a href={info.staffLink} className={btnRed}>스태프 신청</a>
            <span className="relative">
              {lastDay && <Bubble light>오늘까지 신청!</Bubble>}
              <a href="#bus" className={`${btnLine} w-full`}>버스 신청</a>
            </span>
            {contactHref && <a href={contactHref} className={`${btnLine} col-span-2`}>문의</a>}
          </div>
        </header>

        {/* 흐르는 띠: D-day 안내 (집회 기간·이후엔 문구만 바뀜) */}
        <div className="bg-[#e9dcc4] text-[#1f2a44] border-b border-[#1f2a44]/10 py-3 overflow-hidden whitespace-nowrap">
          {/* 움직이는 글씨가 번져 보이지 않게 따로 그리기 (backface-hidden) */}
          <p className="inline-block animate-marquee text-[16px] font-extrabold backface-hidden will-change-transform">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} aria-hidden={i > 0} className="inline-flex items-center gap-3 pr-3">
                {dday !== null && dday > 0 && (
                  <>
                    <span className={`${display.className} text-[22px] leading-none text-[#a8201a]`}>D-{dday}</span>
                    <span>11월 20일 집회까지 · 기도로 준비하는 {dday}일</span>
                    <span className="text-[#a8201a]">✦</span>
                  </>
                )}
                {dday !== null && dday <= 0 && now! <= info.endDate && (
                  <>
                    <span className={`${display.className} text-[22px] leading-none text-[#a8201a]`}>집회 기간입니다</span>
                    <span className="text-[#a8201a]">✦</span>
                  </>
                )}
                <span className="tracking-[0.15em]">PROMISED LAND JAPAN IN OITA</span>
                <span className="text-[#a8201a]">✦</span>
              </span>
            ))}
          </p>
        </div>

        <div className="px-4 pt-5 space-y-5">
          {/* 바로가기: 아이콘 타일 4×2. 마지막 칸(남색)은 11/7 모임 내용 */}
          <nav aria-label="바로가기" className="grid grid-cols-4 gap-2">
            {JUMPS.map(([label, href, Icon]) => (
              <a key={href} href={href} className={`${tile} border-2 border-[#1f2a44]/[0.08] bg-white hover:border-[#1f2a44]/30`}>
                <span className={`${tileIcon} bg-[#f6eedd]`}><Icon size={24} strokeWidth={2} className="text-[#a8201a]" /></span>
                {label}
              </a>
            ))}
            <Link href="/japan/notes/1107" className={`${tile} border-2 border-[#1f2a44] bg-[#1f2a44] text-white hover:bg-[#2c3a5c]`}>
              <span className={`${tileIcon} bg-[#2c3a5c]`}><NotebookText size={24} strokeWidth={2} className="text-[#f0c9a8]" /></span>
              모임 내용
            </Link>
          </nav>

          {/* 소개 */}
          <section className="reveal px-1 pt-4 space-y-4">
            <h2 className="text-[30px] leading-[1.2] font-extrabold tracking-tight">
              Promised Land
              <br />
              <span className="text-[#a8201a]">Japan in Oita</span>
            </h2>
            {info.intro.map((p) => <p key={p} className="text-[18px] leading-[1.8] font-bold">{p}</p>)}
          </section>

          {/* 일정 */}
          <section id="schedule" className={card}>
            <Title eyebrow="SCHEDULE">일정</Title>
            <ol className="relative border-l-2 border-[#a8201a]/30 ml-2 space-y-5">
              {info.timeline.map((t) => (
                <li key={t.date + t.title} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-[#a8201a] ${t.main || t === next ? "bg-[#a8201a]" : "bg-white"}`} />
                  {t === next && <span className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-[#a8201a] motion-safe:animate-ping" />}
                  <p className="text-[15px] font-bold text-[#a8201a]">
                    {t.date}
                    {t === next && <span className="ml-2 rounded-md bg-[#a8201a] px-1.5 py-0.5 text-[14px] text-white">다가오는 일정</span>}
                  </p>
                  <p className={`font-extrabold ${t.main ? "text-[20px]" : "text-[18px]"}`}>{t.title}</p>
                  {t.desc && <p className="text-[#1f2a44]/75">{t.desc}</p>}
                  {"notes" in t && (
                    // 원래 버튼 모양. 누르는 동안 남색으로 바뀜
                    <a href={`/japan/notes/${t.notes}`} className={`mt-2 inline-flex min-h-11 items-center rounded-xl border-2 border-[#1f2a44]/20 bg-white px-4 text-[16px] font-bold hover:border-[#1f2a44]/50 hover:bg-[#f6eedd] active:border-[#1f2a44] active:bg-[#1f2a44] active:text-white transition ${focus}`}>
                      모임 내용 보기 →
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* 참가 방법: 나는 어디에 해당? */}
          <section id="join" className={card}>
            <Title eyebrow="HOW TO JOIN">참가 방법</Title>
            <p className="font-bold">나는 어디에 해당하나요?</p>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="참가 방식 선택">
              {([["group", "단체 항공"], ["solo", "개별 항공"]] as const).map(([k, label]) => (
                <button
                  key={k} type="button" aria-pressed={who === k} onClick={() => setWho(who === k ? null : k)}
                  className={`min-h-16 px-3 py-2 rounded-xl border-2 leading-snug transition active:scale-[0.98] ${focus} ${who === k ? "bg-[#1f2a44] border-[#1f2a44] text-white" : "bg-white border-[#1f2a44]/20 hover:border-[#1f2a44]/60 hover:bg-[#f6eedd]"}`}
                >
                  <span className="block text-[18px] font-extrabold">{label}</span>
                  <span className="block text-[15px] font-semibold opacity-75">예약 참가자</span>
                </button>
              ))}
            </div>

            {who === "group" && (
              <div className="rounded-xl bg-[#f6eedd] p-4 space-y-4 animate-fade-in">
                <p className="text-[19px] font-extrabold">단체 항공 예약 참가자</p>
                <Bullets items={info.group} />
                {/* 항공편: 탑승권처럼 */}
                <div className="space-y-2">
                  {info.flights.map((f) => (
                    <div key={f.flight} className="flex overflow-hidden rounded-xl bg-white">
                      <span className="flex w-16 shrink-0 items-center justify-center bg-[#1f2a44] text-[16px] font-extrabold text-white">{f.label}</span>
                      <div className="border-l-2 border-dashed border-[#f6eedd] px-4 py-3 leading-snug">
                        <p className="text-[18px] font-extrabold">{f.route}</p>
                        <p className="mt-1 font-semibold">{f.date}</p>
                        <p className="font-bold text-[#a8201a]">{f.flight} · {f.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#bus" className="block text-center font-bold underline underline-offset-4">인천공항행 버스는 아래에서 신청해 주세요</a>
              </div>
            )}

            {who === "solo" && (
              <div className="rounded-xl bg-[#f6eedd] p-4 space-y-4 animate-fade-in">
                <div>
                  <p className="text-[19px] font-extrabold">개별 항공 예약 참가자</p>
                  <p className="text-[15px] font-bold text-[#1f2a44]/70">개인·셀별</p>
                </div>
                <p><Rich text={info.solo} /></p>
                <div id="leader" className="scroll-mt-4 rounded-xl bg-white p-4 space-y-2">
                  <p className="font-extrabold">팀 담당자 지정</p>
                  {/* 제출 기한만 가장 굵게, 나머지 안내는 같은 굵기 */}
                  <p className="font-medium">{info.leaderText}</p>
                  <p className="font-medium">{info.leaderSolo}</p>
                  <p className="font-extrabold">제출 기한 · <span className="text-[#a8201a]">{lastDay ? "오늘까지 제출!" : `${info.leaderDeadline}까지`}</span></p>
                  {closed ? (
                    <p className="flex items-center justify-center min-h-14 rounded-xl bg-[#1f2a44]/10 font-bold text-[#1f2a44]/75">제출이 마감되었습니다</p>
                  ) : (
                    <a href={info.leaderLink} className={`${btnRed} w-full`}>팀 담당자 제출</a>
                  )}
                  <p className="pt-2 font-medium">{info.leaderDuty}</p>
                </div>
              </div>
            )}
          </section>

          {/* 인천공항행 버스: 단체·개별 항공 누구나 */}
          <section id="bus" className={card}>
            <Title eyebrow="BUS">인천공항행 버스</Title>
            <p className="text-[18px] leading-[1.8] font-bold">{info.busText}</p>
            <BusNotes items={info.busNotes} className="-mt-2" />
<dl className="rounded-xl bg-[#f6eedd] px-4 divide-y-2 divide-dashed divide-[#1f2a44]/15">
              {info.busLegs.map((l) => (
                <div key={l.label} className="flex items-center gap-4 py-4">
                  <dt className="w-20 shrink-0 leading-snug">
                    <span className="block text-[15px] font-bold text-[#a8201a]">{l.label}</span>
                    <span className="block font-bold">{l.date}</span>
                  </dt>
                  <dd className="leading-snug">
                    <span className="block text-[24px] font-extrabold tracking-tight">{l.time}</span>
                    <span className="block text-[15px] text-[#1f2a44]/70">{l.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <dl className="divide-y divide-[#1f2a44]/10">
              <Row label="차비">{info.busFare ? info.busFare : <Muted>편도/왕복 추후 공지</Muted>}</Row>
              <Row label="신청 마감">
                {lastDay ? (
                  <span className="font-extrabold text-[#a8201a]">오늘 {info.busDeadline}까지 신청!</span>
                ) : (
                  <span className="font-bold"><b className="font-extrabold text-[#a8201a]">{info.busDeadline}</b>까지</span>
                )}
              </Row>
            </dl>
            {closed ? (
              <p className="flex items-center justify-center min-h-14 rounded-xl bg-[#1f2a44]/10 font-bold text-[#1f2a44]/75">신청이 마감되었습니다</p>
            ) : (
              <div className="flex flex-col items-center">
                {/* 마감 당일: 버튼 위 말풍선 */}
                {lastDay && (
                  <span className="relative mb-3 rounded-full bg-[#1f2a44] px-4 py-1.5 text-[16px] font-extrabold text-white motion-safe:animate-bob">
                    오늘까지 신청!
                    <span aria-hidden className="absolute left-1/2 top-full -ml-1.5 -mt-1.5 size-3 rotate-45 bg-[#1f2a44]" />
                  </span>
                )}
                <a href={info.busLink} className={`${btnRed} w-full`}>버스 신청</a>
              </div>
            )}
          </section>

          {/* 도착 후 일정 (목·금) */}
          <section id="arrival" className={card}>
            <Title eyebrow="IN OITA">도착 후 일정</Title>
            {info.arrival.map((d) => (
              <div key={d.day} className="rounded-xl bg-[#f6eedd] p-4 space-y-3">
                <p className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#1f2a44] px-2.5 py-1 text-[16px] font-extrabold text-white">{d.day}</span>
                  <span className="text-[19px] font-extrabold">{d.title}</span>
                </p>
                <ol className="space-y-1.5 list-decimal pl-6 marker:font-bold marker:text-[#a8201a]">
                  {d.items.map((t) => <li key={t}>{t}</li>)}
                </ol>
                <BusNotes items={d.notes} className="border-t border-[#1f2a44]/10 pt-3" />
              </div>
            ))}
          </section>

          {/* 스태프 모집 */}
          <section id="staff" className={card}>
            <Title eyebrow="STAFF">스태프 모집</Title>
            {info.staff.map((p) => <p key={p} className="text-[18px] leading-[1.8] text-pretty"><Rich text={p} /></p>)}
            <div className="rounded-xl bg-[#f6eedd] px-4 py-3">
              <p className="text-[15px] font-bold text-[#a8201a]">모집 대상</p>
              <p className="mt-0.5 text-[18px] font-bold text-balance">{info.staffTarget}</p>
            </div>
            <div className="py-1">
              <p className="text-[22px] font-extrabold text-[#a8201a]">{info.staffQuoteTitle}</p>
              <p className="mt-1 text-[17px] leading-[1.8] text-[#1f2a44]/85 text-pretty">{info.staffQuote}</p>
            </div>
            <a href={info.staffLink} className={`${btnRed} w-full`}>스태프 신청</a>
          </section>

          {/* 준비 기도모임: 다음 일정 · 날짜 카드 */}
          <section id="prayer" className="reveal scroll-mt-4 pt-3 space-y-4">
            <div className="px-1">
              <Title eyebrow="PRAYER">준비 기도모임</Title>
              <p className="mt-1 text-[18px] font-extrabold text-[#a8201a]">{info.prayerMust}</p>
            </div>
            {/* 다음 일정 카드: 다음 일정이 기도모임(poster 있음)일 때만 */}
            {next?.poster && (
              <a href="#schedule" className={`flex overflow-hidden rounded-2xl bg-white border-2 border-[#1f2a44]/10 active:scale-[0.99] transition ${focus}`}>
                {next.poster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={next.poster} alt="" width={120} height={180} className="w-[120px] h-auto self-stretch object-cover shrink-0" />
                )}
                <span className="flex flex-col justify-center gap-1 p-4">
                  <span className="self-start rounded-full bg-[#a8201a] px-3 py-0.5 text-[14px] font-bold text-white">다음 일정</span>
                  <span className={`${display.className} text-[26px] leading-tight`}>{next.title}</span>
                  <span className="text-[18px] font-extrabold">{next.when}</span>
                  {next.sub && <span className="text-[16px] text-[#1f2a44]/70">{next.sub}</span>}
                </span>
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              {info.prayerDates.map((d) => (
                <div key={d} className="rounded-2xl bg-[#1f2a44] text-white px-3 py-4 text-center">
                  <p className="text-[22px] font-extrabold">{d}</p>
                  <p className="mt-1">{info.prayerTime}</p>
                  <p className="font-bold text-[#f0c9a8]">{info.prayerPlace}</p>
                </div>
              ))}
            </div>
            <p className="rounded-2xl bg-white border-2 border-[#1f2a44]/10 px-5 py-5 text-center text-[18px] leading-[1.8] font-bold text-balance">
              <Rich text={info.prayerText} />
            </p>
          </section>

          {/* 확인해두면 좋을 것 */}
          <section id="check" className={card}>
            <Title eyebrow="CHECK">확인해두면 좋을 것</Title>
            <dl className="divide-y divide-[#1f2a44]/10">
              <Row label="여권"><Rich text={info.passport} /></Row>
              <Row label="여행자 보험"><Rich text={info.insurance} /></Row>
              <Row label="입국 준비"><Rich text={info.visitJapan} /></Row>
              <Row label="eSIM"><Rich text={info.esim} /></Row>
              <Row label="준비물">{info.supplies}</Row>
            </dl>
          </section>

          {/* 문의·긴급 연락처: 하나라도 채우면 나타남 */}
          {hasContact && (
            <section id="contact" className={card}>
              <Title eyebrow="CONTACT">문의·긴급 연락처</Title>
              <dl className="divide-y divide-[#1f2a44]/10">
                <Row label="문의">{joinName(info.contactName, info.contactPhone)}</Row>
                <Row label="현지 긴급">{joinName(info.emergencyName, info.emergencyPhone)}</Row>
              </dl>
              {contactHref && <a href={contactHref} className={`${btnLine} w-full`}>문의</a>}
              {info.emergencyPhone && <a href={`tel:${info.emergencyPhone}`} className={`${btnRed} w-full`}>현지 긴급 전화</a>}
            </section>
          )}

        </div>

        {/* 마무리: 히어로와 짝을 이루는 남색 띠 (붉은 해는 왼쪽 아래) */}
        <footer className="reveal relative mt-10 overflow-hidden bg-[#1f2a44] text-[#f6eedd] px-6 pt-12 pb-32 md:pb-14 text-center">
          <div className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-[#a8201a] motion-safe:animate-bob" />
          <p className="relative text-[14px] tracking-[0.3em] font-bold text-[#f0c9a8]">✦ OITA PROMISE LAND ✦</p>
          <p className={`${display.className} relative mt-5 text-[30px] leading-[1.4]`}>
            {info.closing.split(", ").map((l, i, a) => (
              <span key={l} className="block text-balance">{l}{i < a.length - 1 ? "," : ""}</span>
            ))}
          </p>
          <p className="relative mt-6 text-[16px] font-bold text-[#f6eedd]/75">
            {info.title}
            <br />
            {info.dates}
          </p>
        </footer>
      </main>

      {/* 모바일 하단 고정 버튼 */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-20 bg-[#f6eedd]/95 backdrop-blur border-t border-[#1f2a44]/10 px-4 pt-3 pb-safe">
        <div className="grid grid-cols-2 gap-2 pb-3">
          <a href={info.staffLink} className={btnRed}>스태프 신청</a>
          <span className="relative">
            {lastDay && <Bubble>오늘까지 신청!</Bubble>}
            <a href="#bus" className={`${btnLine} w-full`}>버스 신청</a>
          </span>
        </div>
      </nav>
    </div>
  );
}
