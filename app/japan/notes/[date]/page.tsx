import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Black_Han_Sans } from "next/font/google";
import { notes } from "../../notes";
import { Bold } from "../../FormShell";

// 준비 기도모임 내용 (/japan/notes/1107). 내용은 ../../notes.ts 에서 고칩니다.
// 어르신도 읽기 쉽게: 큰 글씨·넓은 줄 간격, 점 목록 대신 짧은 문단, 상자는 최소로.
const display = Black_Han_Sans({ weight: "400", preload: false });

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(notes).map((date) => ({ date }));

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = notes[(await params).date];
  const title = n ? `${n.date} ${n.title}` : "모임 내용";
  return { title, description: n?.intro, openGraph: { title, description: n?.intro, images: [{ url: "/japan/og.jpg", width: 1200, height: 630 }] } };
}

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];
const num = (i: number) => String(i + 1).padStart(2, "0");

// 문단 묶음: 점 대신 줄 간격으로 나눔
const Paras = ({ items }: { items: string[] }) => (
  <div className="space-y-3">
    {items.map((t) => <p key={t}><Bold text={t} /></p>)}
  </div>
);

export default async function NotesPage({ params }: Props) {
  const n = notes[(await params).date];
  if (!n) notFound();

  return (
    <div className="min-h-[100dvh] bg-[#e9dcc4] flex justify-center md:py-8 text-[#1f2a44] text-[18px] leading-[1.9] break-keep">
      {/* 긴 글이라 본문은 흰 바탕 (머리는 남색 그대로) */}
      <main className="w-full max-w-md bg-white md:rounded-[28px] md:shadow-card-lg overflow-hidden">
        {/* 머리: 안내 페이지 히어로와 같은 남색 + 붉은 해 */}
        <header className="relative overflow-hidden bg-[#1f2a44] px-6 pt-9 pb-8 text-[#f6eedd]">
          <div className="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full bg-[#a8201a]" />
          <Link href="/japan" className="relative inline-flex min-h-11 items-center text-[16px] font-bold text-[#f0c9a8] underline-offset-4 hover:underline">
            ← 집회 안내
          </Link>
          <p className="relative mt-4 text-[15px] tracking-[0.25em] font-bold text-[#f0c9a8]">✦ {n.date} ✦</p>
          <h1 className={`${display.className} relative mt-1 text-[34px] leading-[1.2]`}>{n.title}</h1>
          <p className="relative mt-3 text-[17px] font-semibold leading-relaxed text-[#f6eedd]/90">{n.intro}</p>
        </header>

        {/* 목차: 눌러서 바로 이동 */}
        <nav aria-label="목차" className="px-5 pt-6">
          <ol className="divide-y divide-[#1f2a44]/10 rounded-2xl bg-[#f6eedd]">
            {n.sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#s${i + 1}`} className="flex min-h-14 items-center gap-3 px-4 py-2 font-bold leading-snug hover:bg-[#efe3cb] first:rounded-t-2xl">
                  <span className={`${display.className} text-[22px] text-[#a8201a]`}>{num(i)}</span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="px-5 pt-10 space-y-14">
          {n.sections.map((s, i) => (
            <section key={s.heading} id={`s${i + 1}`} className="scroll-mt-4 space-y-6">
              <div className="flex items-end justify-between gap-3">
                <h2 className="leading-tight">
                  <span className={`${display.className} block text-[44px] leading-none text-[#a8201a]`}>{num(i)}</span>
                  <span className="mt-2 block text-[26px] font-extrabold tracking-tight text-balance">{s.heading}</span>
                </h2>
                {/* 제목 옆 스티커 (살짝 기울여서, 움직이지 않음) */}
                {s.sticker && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.sticker} alt="" width={480} height={624} className="w-20 h-auto shrink-0 rotate-6 drop-shadow-md" />
                )}
              </div>

              {s.lead && <Paras items={s.lead} />}

              {/* 소제목(①②③): 큰 한 줄 + 아래 짧은 문단. 상자 없이 선으로만 구분 */}
              {s.parts?.map((part, j) => (
                <div key={part.title} className="border-t-2 border-[#1f2a44]/10 pt-5 space-y-3">
                  <h3 className="text-[22px] font-extrabold leading-snug">
                    <span className="text-[#a8201a]">{CIRCLED[j]}</span> {part.title}
                  </h3>
                  <Paras items={part.items} />
                  {/* 소제목 아래 강조 한 줄 */}
                  {part.note && <p className="pt-1 text-[19px] font-extrabold leading-snug text-balance">“{part.note}”</p>}
                </div>
              ))}

              {s.items && <Paras items={s.items} />}

              {/* 마무리 선포: 상자 대신 그 영역만 크림색 바탕으로 (좌우 끝까지), 굵은 글씨는 빨강 */}
              {s.after && (
                <div className="-mx-5 bg-[#f6eedd] px-5 py-6 [&_b]:text-[#a8201a]">
                  <Paras items={s.after} />
                </div>
              )}
            </section>
          ))}

          {/* 맨 아래: 마지막 크림색 강조 영역이 버튼 아래 끝까지 이어지게 (-mt-14 로 위 간격을 없앰) */}
          <div className="-mx-5 -mt-14 bg-[#f6eedd] px-5 pt-4 pb-14">
          <Link
            href="/japan"
            className="flex min-h-14 items-center justify-center rounded-xl bg-[#a8201a] text-[17px] font-bold text-white hover:bg-[#8c1a15] active:scale-[0.98] transition"
          >
            집회 안내로 돌아가기
          </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
