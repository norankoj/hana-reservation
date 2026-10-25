import type { Metadata } from "next";

// 카톡으로 공유할 때 보이는 제목·설명 (page.tsx 는 클라이언트라 여기서 지정)
export const metadata: Metadata = {
  title: "셔틀 탑승 현황 · 26가을 하만수",
  description: "셔틀버스에 몇 명이 탔는지, 누가 아직 안 탔는지 실시간으로 봅니다.",
};

export default function ShuttleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
