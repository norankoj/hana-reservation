"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { info } from "./info";

// 작년 마켓 사진. 누르면 화면 가득 크게 보이고, 옆으로 밀거나 화살표로 넘겨 봅니다.
// 브라우저 기본 <dialog> 라 뒤로가기 키(Esc)·초점 가두기는 그대로 동작
export function Photos() {
  const dialog = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  const open = (i: number) => {
    dialog.current?.showModal();
    const s = strip.current;
    if (s) s.scrollTo({ left: i * s.clientWidth, behavior: "instant" });
  };
  const step = (d: number) => strip.current?.scrollBy({ left: d * strip.current.clientWidth, behavior: "smooth" });
  const close = () => dialog.current?.close();
  const nav = "absolute top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25";

  return (
    <>
      {/* 첫 장은 넓게, 나머지는 2칸씩. 사진 수는 홀수(1 + 짝수)로 맞추면 빈칸이 없어요 */}
      <ul aria-label="작년 마켓 사진" className="grid grid-cols-2 gap-2 px-4">
        {info.photos.map((p, i) => (
          <li key={p.src} className={i === 0 ? "col-span-2" : ""}>
            <button type="button" onClick={() => open(i)} aria-label={`${p.alt} 크게 보기`} className="block w-full cursor-zoom-in focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#a3162a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/christmas/${p.src}`} alt={p.alt} loading="lazy" className={`w-full object-cover ${i === 0 ? "aspect-[16/9]" : "aspect-square"}`} />
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} aria-label="작년 마켓 사진" className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-[#140a08]/95 p-0 backdrop:bg-black/60">
        <div ref={strip} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
          {info.photos.map((p) => (
            // 사진 바깥(검은 부분)을 누르면 닫힘
            <div key={p.src} onClick={(e) => e.target === e.currentTarget && close()} className="grid w-full shrink-0 snap-center place-items-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/christmas/${p.src}`} alt={p.alt} loading="lazy" className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
        <button type="button" onClick={close} aria-label="닫기" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25">
          <X size={24} />
        </button>
        <button type="button" onClick={() => step(-1)} aria-label="이전 사진" className={`${nav} left-3`}><ChevronLeft size={26} /></button>
        <button type="button" onClick={() => step(1)} aria-label="다음 사진" className={`${nav} right-3`}><ChevronRight size={26} /></button>
      </dialog>
    </>
  );
}
