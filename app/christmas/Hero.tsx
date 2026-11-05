import { Sparkles } from "lucide-react";
import { focus } from "./ApplyForm";

// 스탭·배우 페이지 공통 첫 화면. 작년 사진을 화면 가득 깔고, 아래로 갈수록 성탄 빨강으로 덮어
// 글씨가 읽히게 합니다.
export function Hero({
  eyebrow,
  headline,
  lead,
  image,
  alt,
  cta,
}: {
  eyebrow: string;
  headline: string;
  lead: string;
  image: string; // public/christmas/ 의 파일 이름
  alt: string;
  cta?: string; // 비우면 버튼 숨김 (마감 후)
}) {
  return (
    <header className="relative isolate overflow-hidden bg-xmas-red text-xmas-cream">
      {/* 사진: 아래쪽이 빨강으로 녹아들고, 글씨는 그 아래 빨강 위에만 올라감 */}
      <div className="relative aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/christmas/${image}`} alt={alt} fetchPriority="high" className="h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,color-mix(in_srgb,var(--color-xmas-red)_60%,transparent)_75%,var(--color-xmas-red)_100%)]" />
      </div>

      <div className="relative -mt-6 px-6 pb-9">
        <p className="flex items-center gap-1.5 text-[15px] font-bold tracking-[0.25em] text-xmas-gold animate-fade-in">
          <Sparkles size={16} strokeWidth={2} aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-3 whitespace-pre-line text-[40px] font-extrabold leading-[1.12] tracking-tight animate-fade-in">{headline}</h1>
        <p className="mt-4 max-w-[28ch] text-[17px] leading-relaxed text-xmas-cream/90 animate-fade-in">{lead}</p>
        {cta && (
          <a href="#apply" className={`mt-7 flex min-h-14 w-full items-center justify-center rounded-xl bg-xmas-cream text-[17px] font-extrabold text-xmas-red shadow-[0_10px_30px_rgba(60,5,12,0.35)] transition hover:bg-white active:scale-[0.98] ${focus}`}>
            {cta}
          </a>
        )}
      </div>
    </header>
  );
}
