"use client";

import { today } from "@/lib/form";
import { ApplyForm } from "../christmas/ApplyForm";
import { Hero } from "../christmas/Hero";
import { Shell } from "../christmas/Shell";
import { cast } from "./info";

// 성탄 연극 배우 모집. 배역이 정해지면 뮤지컬 캐스트 보드처럼 배역마다 얼굴 자리(아치) + 배역 이름.
// 확정된 배역은 배우 이름, 빈 배역은 "?" 로 보이고 눌러서 신청. 문구·배역은 ./info.ts
const arch = "grid aspect-[3/4] w-full place-items-center rounded-t-full rounded-b-2xl border-2 transition";

export default function CastPage() {
  const ended = today() > cast.formDeadline;
  const open = cast.roles.filter((r) => !r.actor).length;

  return (
    <Shell
      facts={[]}
      sparkle
      contact={cast}
      hero={
        <Hero
          eyebrow="CHRISTMAS"
          headline={cast.headline}
          lead={cast.lead}
          image="costume.webp"
          dots={false}
          alt="작년 마켓, 성탄 이야기 의상을 입은 배우들"
          cta={ended ? undefined : "신청하기"}
        />
      }
    >
          <section id="apply" className="scroll-mt-4 px-4">
            <ApplyForm deadline={cast.formDeadline} deadlineLabel={cast.deadlineLabel} rolePrefix="배우: " emptyRole="원하는 배역을 하나 골라 주세요." memoPlaceholder="예: 연기는 처음이지만 해 보고 싶어요!">
              {!cast.roles.length ? (
                // 배역을 아직 정하지 않았을 때: 제목만 두고 "배우: 배역 미정"으로 신청
                <div>
                  <h2 className="px-1 text-[22px] font-extrabold tracking-tight">배우모집!</h2>
                  <p className="px-1 mt-1 text-pretty text-[17px] font-semibold text-xmas-ink/70">{cast.intro}</p>
                  <input type="hidden" name="role" value="배역 미정" />
                </div>
              ) : (
              <fieldset>
                <legend className="px-1 text-[22px] font-extrabold tracking-tight">캐스트</legend>
                <p className="px-1 mt-1 text-[17px] font-semibold text-xmas-ink/70">
                  {open ? <>비어 있는 자리를 눌러 신청해 주세요. <b className="text-xmas-red">{open}개 배역</b> 모집 중</> : "모든 배역이 정해졌어요."}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-x-2.5 gap-y-5">
                  {cast.roles.map((r) =>
                    r.actor ? (
                      // 확정된 배역
                      <div key={r.role} className="text-center">
                        <div className={`${arch} border-xmas-pine bg-xmas-pine text-xmas-cream`}>
                          <span className="px-1.5 text-[17px] font-extrabold leading-tight">{r.actor}</span>
                        </div>
                        <p className="mt-2 text-[17px] font-extrabold leading-snug">{r.role}</p>
                        <p className="text-[13px] font-bold text-xmas-pine">확정</p>
                      </div>
                    ) : (
                      // 모집 중인 배역: 눌러서 고름
                      <label key={r.role} className="group cursor-pointer text-center">
                        <input type="radio" name="role" value={r.role} className="peer sr-only" />
                        <span className={`${arch} border-dashed border-xmas-red/35 bg-white group-has-[:checked]:border-solid group-has-[:checked]:border-xmas-red group-has-[:checked]:bg-xmas-red peer-focus-visible:ring-2 peer-focus-visible:ring-xmas-red peer-focus-visible:ring-offset-2 group-active:scale-[0.98]`}>
                          <span aria-hidden className="text-[40px] font-black leading-none text-xmas-red/25 transition group-has-[:checked]:text-xmas-cream">?</span>
                        </span>
                        <span className="mt-2 block text-[17px] font-extrabold leading-snug">{r.role}</span>
                        <span className="block text-[13px] font-bold text-xmas-red">
                          모집 중{r.count ? ` · ${r.count}명` : ""}
                        </span>
                      </label>
                    ),
                  )}
                </div>

                <label className="group mt-5 block cursor-pointer">
                  <input type="radio" name="role" value={cast.anyRole} className="peer sr-only" />
                  <span className="block rounded-2xl border-2 border-dashed border-xmas-red/35 bg-white px-4 py-3.5 text-center font-extrabold transition group-has-[:checked]:border-solid group-has-[:checked]:border-xmas-red group-has-[:checked]:bg-xmas-red group-has-[:checked]:text-xmas-cream peer-focus-visible:ring-2 peer-focus-visible:ring-xmas-red">
                    {cast.anyRole}
                  </span>
                </label>
              </fieldset>
              )}
            </ApplyForm>
          </section>
    </Shell>
  );
}
