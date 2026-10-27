import Link from "next/link";

// /japan/bus, /japan/team 신청 페이지 공통 틀: 포스터 타이틀 그림 + 크림 바탕 + 아래 안내 페이지로 돌아가기
export const field =
  "w-full border-2 border-[#1f2a44]/15 rounded-xl px-4 py-3.5 text-[17px] outline-none bg-white focus:border-[#a8201a] transition";
export const chip =
  "block text-center px-2 py-3 rounded-xl border-2 border-[#1f2a44]/15 font-bold peer-checked:bg-[#1f2a44] peer-checked:text-white peer-checked:border-[#1f2a44] peer-focus-visible:ring-2 peer-focus-visible:ring-[#a8201a] transition";
export const submitBtn =
  "w-full bg-[#a8201a] text-white font-bold py-4 rounded-xl text-lg active:scale-[0.98] transition disabled:bg-gray-300";

export function FormShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#e9dcc4] flex justify-center md:py-8 text-[#1f2a44] text-[17px] leading-relaxed break-keep">
      <main className="w-full max-w-md bg-[#f6eedd] md:rounded-[28px] md:shadow-card-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/japan/og.jpg" alt="Promised Land Japan in Oita" width={1200} height={630} className="w-full h-auto" />
        <div className="px-5 pt-6 pb-12 space-y-5">
          <h1 className="text-center text-[26px] font-extrabold tracking-tight">{title}</h1>
          {children}
          <Link href="/japan" className="block text-center font-bold underline underline-offset-4 text-[#1f2a44]/80">
            집회 안내 다시 보기
          </Link>
        </div>
      </main>
    </div>
  );
}
