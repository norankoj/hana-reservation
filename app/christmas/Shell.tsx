import { info } from "./info";

// 떨어지는 빛 하나하나: [가로 위치 %, 크기 px, 시작 지연 s, 떨어지는 시간 s]
// 서버·브라우저 화면이 같아야 해서 무작위 대신 고정값
const LIGHTS = [
  [6, 4, 0, 11], [14, 6, 2.4, 14], [23, 3, 1.1, 10], [31, 5, 3.6, 13], [39, 4, 0.6, 12],
  [47, 7, 2.9, 15], [55, 3, 1.7, 9.5], [62, 5, 4.2, 13.5], [70, 4, 0.3, 11], [77, 6, 3.1, 14.5],
  [84, 3, 1.4, 10], [91, 5, 2.2, 12.5], [96, 4, 4.8, 11.5], [10, 3, 5.3, 9], [50, 4, 5.9, 12],
] as const;

// 스탭(/christmas)·배우(/christmas-play) 페이지 공통 틀:
// 바깥 모래색 배경 + 가운데 크림 카드, 첫 화면(hero) 아래 안내 칸, 본문, 맨 아래 문의
export function Shell({
  hero,
  facts,
  contact = info,
  children,
}: {
  hero: React.ReactNode;
  facts: { label: string; value: string }[];
  contact?: { contactLabel: string; contactLink: string }; // 맨 아래 문의. 기본은 스탭 페이지 문의
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-xmas-sand flex justify-center md:py-8 text-xmas-ink text-[17px] leading-relaxed break-keep">
      {/* 떨어지는 빛. 화면에 고정된 층이라 스크롤해도 계속 위에서 아래로 떨어짐. 누르는 데는 방해 안 됨
          (움직임 줄이기 설정이면 globals.css 에서 숨김) */}
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 overflow-hidden">
        {LIGHTS.map(([left, size, delay, dur], i) => (
          <span
            key={i}
            className="sparkle absolute -top-4 rounded-full bg-xmas-gold"
            style={{ left: `${left}%`, width: size, height: size, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
          />
        ))}
      </div>

      <main className="w-full max-w-md bg-xmas-cream md:rounded-[28px] md:shadow-[0_12px_40px_rgba(110,20,30,0.18)] overflow-hidden">
        {hero}

        <div className="pt-7 pb-12 space-y-10">
          {/* 안내: 초록 이름표 + 한 칸 들여쓴 내용 (비우면 안 보임) */}
          {facts.length > 0 && (
            <section className="reveal px-5">
              <dl className="space-y-4">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="inline-block rounded-full bg-xmas-pine px-3 py-0.5 text-[15px] font-bold text-xmas-cream">{f.label}</dt>
                    <dd className="mt-1.5 pl-3 whitespace-pre-line font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {children}

          <p className="px-5 text-center text-[17px] font-semibold text-xmas-ink/70">
            {contact.contactLink ? <a href={contact.contactLink} className="underline underline-offset-4">{contact.contactLabel}</a> : contact.contactLabel}
          </p>
        </div>
      </main>
    </div>
  );
}
