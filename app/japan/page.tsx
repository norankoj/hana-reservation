"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Copy, Check, Download, Lock, Flashlight, Camera } from "lucide-react";
import { info } from "./info";
import { today } from "@/lib/form";
import { BusNotes } from "./FormShell";

// 일본 집회 참가 안내. /staff 포스터 톤(크림 바탕 + 빨강·남색)으로.
// 문구·날짜·링크는 전부 ./info.ts 에서 고칩니다.
// 메뉴마다 접혀 있고 제목을 누르면 펼쳐짐 (<details>). 모서리: 카드 rounded-2xl, 버튼 rounded-xl

const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#1f2a44]";
const btnRed = `flex items-center justify-center min-h-14 px-5 rounded-xl bg-[#a8201a] hover:bg-[#8c1a15] text-white text-[17px] font-bold active:scale-[0.98] transition ${focus}`;
const btnLine = `flex items-center justify-center min-h-14 px-5 rounded-xl border-2 border-[#1f2a44]/20 bg-white hover:border-[#1f2a44]/50 hover:bg-[#f6eedd] text-[#1f2a44] text-[17px] font-bold active:scale-[0.98] transition ${focus}`;

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

// 비어 있으면 "추후 공지"
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-[11px] text-[16px] leading-[1.45]">
      <dt className="w-[78px] shrink-0 text-[15px] font-bold text-[#1f2a44]/60">{label}</dt>
      <dd className="min-w-0">{children || <span className="text-[14px] text-[#1f2a44]/60">추후 공지</span>}</dd>
    </div>
  );
}

// 접히는 메뉴 한 줄 (묶음 목록 안). 제목을 누르면 아래로 펼쳐짐.
// badge 는 제목 옆 연한 빨강 표시 (필독·새 공지), sub 는 제목 아래 작은 글씨 (안에 무엇이 있는지)
function Fold({ id, title, badge, sub, children }: { id: string; title: string; badge?: string; sub?: string; children: React.ReactNode }) {
  return (
    <details id={id} className="group scroll-mt-4 border-t border-[#1f2a44]/[0.09] first:border-t-0">
      <summary className={`flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3.5 hover:bg-[#fbf9f5] [&::-webkit-details-marker]:hidden ${focus}`}>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5 text-[18px] font-extrabold tracking-tight">
            {title}
            {badge && <span className="rounded-md bg-[#fbe9e6] px-1.5 py-px text-[12px] font-extrabold tracking-normal text-[#a8201a]">{badge}</span>}
          </span>
          {sub && <span className="mt-0.5 block text-[14px] font-medium text-[#1f2a44]/60">{sub}</span>}
        </span>
        <ChevronRight size={22} strokeWidth={2.4} aria-hidden className="shrink-0 text-[#1f2a44]/35 transition group-open:rotate-90" />
      </summary>
      <div className="space-y-3 border-t border-[#1f2a44]/[0.09] px-4 pt-0.5 pb-4 text-[16px] leading-[1.6]">{children}</div>
    </details>
  );
}

// 메뉴 묶음 (출국 준비 · 일정 · 더 보기): 작은 제목 + 흰 상자 안에 한 줄씩
const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section>
    <h2 className="mx-1 mb-2 mt-6 text-[14px] font-bold text-[#1f2a44]/60">{label}</h2>
    <div className="reveal overflow-hidden rounded-[18px] border border-[#1f2a44]/[0.09] bg-white">{children}</div>
  </section>
);

// 표 칸: 굵은 첫 줄 + 작은 둘째 줄
const Cell = ({ main, sub }: { main: React.ReactNode; sub?: string }) => (
  <span className="block">
    <span className="block text-[16.5px] font-extrabold">{main}</span>
    {sub && <span className="mt-0.5 block text-[14px] text-[#1f2a44]/60">{sub}</span>}
  </span>
);

// 작은 소제목 (펼친 카드 안)
const Sub = ({ children }: { children: React.ReactNode }) => <p className="!mt-4 text-[15px] font-extrabold">{children}</p>;

// 이름 · 값 · 복사 한 줄 (비짓재팬 항공편·숙소 주소)
const CopyRow = ({ label, value, copy }: { label: string; value: React.ReactNode; copy: string }) => (
  <div className="flex items-start gap-2.5 py-[11px]">
    <span className="w-[52px] shrink-0 pt-px text-[15px] font-bold text-[#1f2a44]/60">{label}</span>
    <span className="min-w-0 flex-1 text-[15.5px] font-bold leading-[1.45] [overflow-wrap:anywhere]">{value}</span>
    <CopyButton text={copy} />
  </div>
);

// 펼친 안 버튼 (시안: 50px, 얇은 테두리)
const btnSmRed = `flex items-center justify-center min-h-[50px] px-3 rounded-xl bg-[#a8201a] hover:bg-[#8c1a15] text-white text-[16px] font-extrabold active:scale-[0.98] transition ${focus}`;
const btnSmLine = `flex items-center justify-center min-h-[50px] px-3 rounded-xl border-[1.5px] border-[#1f2a44]/20 bg-white hover:border-[#1f2a44]/50 text-[16px] font-extrabold active:scale-[0.98] transition ${focus}`;

// 주소 등 복사 버튼
function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      prompt("아래 내용을 복사해 주세요.", text);
    }
  };
  return (
    <button type="button" onClick={copy} className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-[9px] border-[1.5px] border-[#1f2a44]/[0.18] bg-white px-2.5 text-[14px] font-bold hover:border-[#1f2a44]/40 active:bg-[#1f2a44] active:text-white transition ${focus}`}>
      {done ? <Check size={16} strokeWidth={2.6} aria-hidden /> : <Copy size={16} strokeWidth={2.4} aria-hidden />}
      {done ? "복사됨" : "복사"}
    </button>
  );
}

// "인천국제공항(ICN)" → 공항 이름·코드
const airport = (a: string) => {
  const m = a.match(/^(.*)\((\w+)\)$/);
  return m ? { name: m[1], code: m[2] } : { name: a, code: "" };
};


export default function JapanPage() {
  const [now, setNow] = useState<string | null>(null);
  const [wp, setWp] = useState(0); // 잠금화면: 고른 그림
  const wall = info.wallpapers[wp];

  useEffect(() => {
    // D-day·다음 일정은 접속한 날 기준 (빌드한 날이 아니라)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(today());
    // #주소로 들어오면 그 메뉴를 펼쳐서 보여줌
    const openHash = () => {
      const el = location.hash && document.querySelector(location.hash);
      if (!el) return;
      const fold = el.closest("details");
      if (fold) fold.open = true;
      requestAnimationFrame(() => el.scrollIntoView());
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  const dday = now === null ? null : Math.round((Date.parse(info.startDate) - Date.parse(now)) / 86400000);
  const next = now === null ? undefined : info.timeline.find((t) => t.until >= now);

  return (
    <div className="min-h-[100dvh] bg-[#e9dcc4] flex justify-center md:py-8 text-[#1f2a44] text-[17px] leading-relaxed break-keep">
      <main className="w-full max-w-md bg-[#fbf9f5] md:rounded-[28px] md:shadow-card-lg overflow-hidden">
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
          {contactHref && <a href={contactHref} className={`${btnLine} relative mt-6`}>문의</a>}
        </header>

        {/* 흐르는 띠: D-day 안내 (집회 기간·이후엔 문구만 바뀜) */}
        <div className="bg-[#e9dcc4] text-[#1f2a44] border-b border-[#1f2a44]/10 py-3 overflow-hidden whitespace-nowrap">
          {/* 움직이는 글씨가 번져 보이지 않게 따로 그리기 (backface-hidden) */}
          <p className="inline-block animate-marquee text-[16px] font-extrabold backface-hidden will-change-transform">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} aria-hidden={i > 0} className="inline-flex items-center gap-3 pr-3">
                {dday !== null && dday > 0 && (
                  <>
                    <span className="font-poster text-[22px] leading-none text-[#a8201a]">D-{dday}</span>
                    <span>11월 20일 집회까지 · 기도로 준비하는 {dday}일</span>
                    <span className="text-[#a8201a]">✦</span>
                  </>
                )}
                {dday !== null && dday <= 0 && now! <= info.endDate && (
                  <>
                    <span className="font-poster text-[22px] leading-none text-[#a8201a]">집회 기간입니다</span>
                    <span className="text-[#a8201a]">✦</span>
                  </>
                )}
                <span className="tracking-[0.15em]">PROMISED LAND JAPAN IN OITA</span>
                <span className="text-[#a8201a]">✦</span>
              </span>
            ))}
          </p>
        </div>

        <div className="px-[18px] pt-5">
          {/* 새 공지 한 줄 */}
          {info.news.text && (
            <a href={info.news.href} className={`flex items-center gap-2 rounded-[14px] border border-[#1f2a44]/[0.09] bg-white px-3.5 py-3 text-[15px] font-semibold ${focus}`}>
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-[#a8201a]" />
              {info.news.text}
            </a>
          )}

          <Group label="출국 준비">
            {/* 출국 안내: 항공편 · 단체 버스 · 수하물 · 조 편성 */}
            <Fold id="depart" title="출국 안내" badge="필독" sub="항공편 · 단체 버스 · 수하물">
              {/* 표 한 장: 출국 · 귀국 · 단체 버스 · 수하물 · 일정 · 조 편성. 각 칸은 굵은 첫 줄 + 작은 둘째 줄 */}
              <dl className="divide-y divide-[#1f2a44]/10">
                {info.flights.map((f) => {
                  const short = (a: string) => { const x = airport(a); return `${x.name.replace("국제공항", "")}(${x.code})`; };
                  return (
                    <Row key={f.flight} label={f.label}>
                      <Cell main={`${f.date.slice(5)} ${f.flight} · ${f.time}`} sub={`${short(f.from)} → ${short(f.to)}`} />
                    </Row>
                  );
                })}
                <Row label="단체 버스"><Cell main={info.departBus[0]} sub={info.departBus[1]} /></Row>
                <Row label="현지 이동"><Cell main={info.localMove[0]} sub={info.localMove[1]} /></Row>
                <Row label="개별 항공"><Cell main={info.soloMove[0]} sub={info.soloMove[1]} /></Row>
                <Row label="수하물">
                  <Cell main={info.luggage[0]} sub={info.luggage[1]} />
                  <a href={info.luggageLink} target="_blank" rel="noopener" className="mt-1.5 inline-flex min-h-9 items-center text-[15px] font-bold underline underline-offset-4">이스타항공 수하물 규정 ↗</a>
                </Row>
                <Row label="일정">
                  <a href="#schedule" className="inline-flex min-h-9 items-center text-[15px] font-bold underline underline-offset-4">일정 메뉴 보기</a>
                </Row>
                <Row label="조 편성">{info.teams}</Row>
              </dl>
            </Fold>
              {/* 비짓재팬 등록: 단체 항공편 · 숙소 주소 (복사) */}
            <Fold id="visit-japan" title="비짓재팬 등록" badge="새 공지" sub="항공편명 · 숙소 주소 복사">
              <p className="pt-2.5"><Rich text={info.visitJapanText} /></p>
              <div className="grid grid-cols-2 gap-2">
                <a href={info.visitJapanLink} target="_blank" rel="noopener" className={btnSmRed}>비짓재팬 열기 ↗</a>
                <a href={info.visitJapanGuide} target="_blank" rel="noopener" className={btnSmLine}>작성 방법 ↗</a>
              </div>
              <Sub>단체 항공</Sub>
              <div className="!mt-0.5 divide-y divide-[#1f2a44]/[0.09]">
                {info.flights.map((f) => (
                  <CopyRow key={f.flight} label={f.label} value={`${f.date.slice(0, 10)} · ${f.flight}`} copy={f.flight} />
                ))}
              </div>
              <Sub>단체 숙소 주소</Sub>
              <div className="!mt-0.5 divide-y divide-[#1f2a44]/[0.09]">
                {info.lodging.map((l) => <CopyRow key={l.who} label={l.who} value={l.address} copy={l.address} />)}
              </div>
            </Fold>
              {/* 확인해두면 좋을 것 */}
            <Fold id="check" title="확인해두면 좋을 것" sub="여권 · 보험 · eSIM · 준비물">
              <dl className="divide-y divide-[#1f2a44]/10">
                <Row label="여권"><Rich text={info.passport} /></Row>
                <Row label="여행자 보험"><Rich text={info.insurance} /></Row>
                <Row label="입국 준비"><Rich text={info.visitJapan} /></Row>
                <Row label="eSIM"><Rich text={info.esim} /></Row>
                <Row label="준비물">{info.supplies}</Row>
              </dl>
            </Fold>
            </Group>

          <Group label="일정">
            {/* 일정 */}
            <Fold id="schedule" title="일정" badge="모임 내용 보기 추가" sub="기도모임 · 출국 · 집회 · 귀국">
              <ol className="relative border-l-2 border-[#a8201a]/30 ml-2 mt-4 space-y-5">
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
              <p className="text-[15px] font-semibold text-[#1f2a44]/70">{info.boardNote}</p>
            </Fold>
              {/* 도착 후 일정 (목·금) */}
            <Fold id="arrival" title="도착 후 일정" sub="11/19(목) 숙소 · 11/20(금) 조별">
              <div className="divide-y divide-[#1f2a44]/[0.09]">
                {info.arrival.map((d) => (
                  <div key={d.day} className="space-y-2 py-3.5">
                    <p className="text-[16.5px] font-extrabold"><span className="text-[#1f2a44]/60">{d.day}</span> {d.title}</p>
                    <ol className="space-y-1 list-decimal pl-5 marker:font-bold marker:text-[#1f2a44]/50">
                      {d.items.map((t) => <li key={t}>{t}</li>)}
                    </ol>
                    <BusNotes items={d.notes} className="!text-[15px] !font-medium !text-[#1f2a44]/70" />
                  </div>
                ))}
              </div>
            </Fold>
              {/* 준비 기도모임: 다음 일정 · 날짜 카드 */}
            <Fold id="prayer" title="준비 기도모임" sub="11/7 · 11/14 · 모임 내용 보기">
              <p className="pt-2.5 font-extrabold">{info.prayerMust}</p>
              {/* 다음 일정: 다음 일정이 기도모임(poster 있음)일 때만 */}
              {next?.poster && (
                <a href="#schedule" className={`flex items-center gap-3 rounded-xl border border-[#1f2a44]/[0.09] p-2 active:scale-[0.99] transition ${focus}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={next.poster} alt="" width={120} height={180} className="w-16 h-auto rounded-lg shrink-0" />
                  <span className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#a8201a]">다음 일정</span>
                    <span className="text-[16.5px] font-extrabold">{next.title}</span>
                    <span className="text-[14px] text-[#1f2a44]/60">{next.when}{next.sub && ` · ${next.sub}`}</span>
                  </span>
                </a>
              )}
              <dl className="divide-y divide-[#1f2a44]/[0.09]">
                {info.prayerDates.map((d) => (
                  <Row key={d} label={d}><Cell main={info.prayerTime} sub={info.prayerPlace} /></Row>
                ))}
              </dl>
              <p><Rich text={info.prayerText} /></p>
            </Fold>
            </Group>

          <Group label="더 보기">
            {/* 집회 소개 */}
            <Fold id="about" title="집회 소개" sub="Promised Land Japan in Oita">
              <h2 className="pt-3 text-[24px] leading-[1.2] font-extrabold tracking-tight">
                Promised Land
                <br />
                <span className="text-[#a8201a]">Japan in Oita</span>
              </h2>
              {info.intro.map((p) => <p key={p}>{p}</p>)}
            </Fold>
              {/* 문의사항 (자주 묻는 질문) */}
            <Fold id="faq" title="문의사항" badge="새 공지" sub="이티켓 · 비짓재팬">
              <dl className="divide-y divide-[#1f2a44]/[0.09]">
                {info.faq.map((f) => (
                  <div key={f.q} className="py-3">
                    <dt className="text-[16.5px] font-extrabold">Q. {f.q}</dt>
                    <dd className="mt-1 text-[#1f2a44]/80"><Rich text={f.a} /></dd>
                  </div>
                ))}
              </dl>
            </Fold>
              {/* 잠금화면 배경 내려받기 */}
            <Fold id="wallpaper" title="잠금화면" sub="배경화면 저장">
              <p className="pt-2.5"><Rich text={info.wallpaperText} /></p>
              {/* 큰 미리보기: 아래 작은 그림을 누르면 바뀜. 위에 시계·날짜를 얹어 진짜 잠금화면처럼 (집회 날 11/20 11:20) */}
              <div className="relative mx-auto w-3/4 overflow-hidden rounded-[28px] border-[6px] border-[#1f2a44] shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={wall.file} src={wall.file} alt={`${wall.name} 잠금화면 미리보기`} width={1125} height={2000} loading="lazy"
                  className="block aspect-[9/16] w-full object-cover animate-fade-in"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
                  <Lock size={13} strokeWidth={2.5} className="mt-2" />
                  <p className="mt-0.5 text-[13px] font-semibold leading-tight">{info.lockDate}</p>
                  <p className="text-[56px] font-semibold leading-none tracking-tight">{info.lockTime}</p>
                  <div className="mt-auto mb-3 flex w-full items-center justify-between px-5">
                    <span className="grid size-9 place-items-center rounded-full bg-black/35 backdrop-blur-sm"><Flashlight size={16} /></span>
                    <span className="grid size-9 place-items-center rounded-full bg-black/35 backdrop-blur-sm"><Camera size={16} /></span>
                  </div>
                  <span className="mb-1.5 h-1 w-1/3 rounded-full bg-white/80" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="잠금화면 고르기">
                {info.wallpapers.map((w, i) => (
                  <button
                    key={w.file} type="button" aria-pressed={wp === i} aria-label={`${w.name} 잠금화면 보기`} onClick={() => setWp(i)}
                    className={`rounded-xl border-[3px] p-0.5 transition ${focus} ${wp === i ? "border-[#a8201a]" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.thumb} alt="" width={360} height={640} loading="lazy" className="aspect-[9/16] w-full rounded-lg object-cover" />
                  </button>
                ))}
              </div>
              {/* 고른 그림 저장. 버튼 색은 그림 바탕색 */}
              <a
                href={wall.file} download={`잠금화면_JOSHUA_GENERATION_${wall.name}.jpg`} style={{ backgroundColor: wall.color }}
                className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-[17px] font-bold text-white hover:opacity-90 active:scale-[0.98] transition ${focus}`}
              >
                <Download size={22} strokeWidth={2.4} aria-hidden />
                저장하기
              </a>
              <p className="text-[15px] leading-relaxed text-[#1f2a44]/70">{info.wallpaperHelp}</p>
            </Fold>
              {hasContact && (
              <Fold id="contact" title="문의·긴급 연락처">
                <dl className="divide-y divide-[#1f2a44]/10">
                  <Row label="문의">{joinName(info.contactName, info.contactPhone)}</Row>
                  <Row label="현지 긴급">{joinName(info.emergencyName, info.emergencyPhone)}</Row>
                </dl>
                {contactHref && <a href={contactHref} className={`${btnLine} w-full`}>문의</a>}
                {info.emergencyPhone && <a href={`tel:${info.emergencyPhone}`} className={`${btnRed} w-full`}>현지 긴급 전화</a>}
              </Fold>
            )}
            </Group>
        </div>

        {/* 마무리: 히어로와 짝을 이루는 남색 띠 (붉은 해는 왼쪽 아래) */}
        <footer className="reveal relative mt-10 overflow-hidden bg-[#1f2a44] text-[#f6eedd] px-6 pt-12 pb-32 md:pb-14 text-center">
          <div className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-[#a8201a] motion-safe:animate-bob" />
          <p className="relative text-[14px] tracking-[0.3em] font-bold text-[#f0c9a8]">✦ OITA PROMISE LAND ✦</p>
          <p className="font-poster relative mt-5 text-[30px] leading-[1.4]">
            {info.closing.map((l) => <span key={l} className="block text-balance">{l}</span>)}
          </p>
          <p className="relative mt-6 text-[16px] font-bold text-[#f6eedd]/75">
            {info.title}
            <br />
            {info.dates}
          </p>
        </footer>
      </main>

      {/* 모바일 하단 고정 버튼 */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-20 bg-[#fbf9f5]/95 backdrop-blur border-t border-[#1f2a44]/10 px-4 pt-3 pb-safe">
        <div className={`grid gap-2 pb-3 ${contactHref ? "grid-cols-2" : ""}`}>
          <a href={info.staffLink} className={btnRed}>스태프 신청</a>
          {contactHref && <a href={contactHref} className={btnLine}>문의</a>}
        </div>
      </nav>
    </div>
  );
}
