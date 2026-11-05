"use client";

import Link from "next/link";
import { today } from "@/lib/form";
import { ChevronRight } from "lucide-react";
import { info } from "./info";
import { Photos } from "./Photos";
import { ApplyForm, focus } from "./ApplyForm";
import { Hero } from "./Hero";
import { Shell } from "./Shell";

// 크리스마스 마켓 스탭 모집. 작년 전단지 톤(성탄 빨강 + 크림 + 초록 이름표)을 그대로 씁니다.
// 색은 globals.css 의 xmas-* 토큰. 문구·사진은 ./info.ts, 명단은 /admin/christmas. 연극 배우는 /christmas-play

export default function ChristmasPage() {
  const ended = today() > info.formDeadline;
  const staff = info.roles[0];

  return (
    <Shell
      facts={info.facts}
      hero={
        <Hero
          eyebrow="MERRY CHRISTMAS"
          headline={info.headline}
          lead={info.lead}
          image="band.webp"
          alt="작년 마켓, 트리 앞 무대 공연"
          cta={ended ? undefined : "신청하기"}
        />
      }
    >
          {/* 작년 마켓 사진: 누르면 크게, 옆으로 넘겨 보기 */}
          <section className="reveal">
            <Photos />
          </section>

          {/* 신청 */}
          <section id="apply" className="scroll-mt-4 px-4">
            <ApplyForm emptyRole="">
              <div>
                <h2 className="px-1 text-[22px] font-extrabold tracking-tight">스탭모집!</h2>
                <input type="hidden" name="role" value={staff.name} />
                <div className="mt-3 overflow-hidden rounded-2xl border-2 border-xmas-ink/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/christmas/${staff.image}`} alt="" loading="lazy" className="block aspect-[16/9] w-full object-cover" />
                  <div className="p-4">
                    <p className="text-[22px] font-extrabold">{staff.name}</p>
                    <p className="mt-0.5 text-[17px] text-xmas-ink/75">{staff.desc}</p>
                  </div>
                </div>
                <Link href="/christmas-play" className={`mt-3 flex items-center gap-3 rounded-2xl bg-xmas-pine px-4 py-3.5 text-xmas-cream transition active:scale-[0.99] ${focus}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold">연극 배우도 모집해요</span>
                    <span className="block text-[15px] text-xmas-cream/80">마켓에서 올릴 성탄 연극, 배우 신청은 여기에서</span>
                  </span>
                  <ChevronRight size={22} className="shrink-0" />
                </Link>
              </div>
            </ApplyForm>
          </section>
    </Shell>
  );
}
