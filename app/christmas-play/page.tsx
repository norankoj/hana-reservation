"use client";

import { today } from "@/lib/form";
import { ApplyForm } from "../christmas/ApplyForm";
import { Hero } from "../christmas/Hero";
import { Shell } from "../christmas/Shell";
import { costume } from "./info";

// 크리스마스 마켓 코스튬 스탭 모집. 문구는 ./info.ts, 명단은 /admin/christmas
export default function CostumePage() {
  const ended = today() > costume.formDeadline;

  return (
    <Shell
      facts={[]}
      contact={costume}
      hero={
        <Hero
          eyebrow="MERRY CHRISTMAS"
          headline={costume.headline}
          lead={costume.lead}
          image="costume.webp"
          alt="작년 마켓, 성탄 이야기 의상을 입은 스탭들"
          cta={ended ? undefined : "신청하기"}
        />
      }
    >
      <section id="apply" className="scroll-mt-4 px-4">
        <ApplyForm deadline={costume.formDeadline} deadlineLabel={costume.deadlineLabel} emptyRole="">
          <div>
            <h2 className="px-1 text-[22px] font-extrabold tracking-tight">코스튬 스탭 모집!</h2>
            <p className="px-1 mt-1 text-pretty text-[17px] font-semibold text-xmas-ink/70">{costume.intro}</p>
            <input type="hidden" name="role" value={costume.role} />
          </div>
        </ApplyForm>
      </section>
    </Shell>
  );
}
