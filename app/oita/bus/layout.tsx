import type { Metadata } from "next";

// 카톡으로 공유할 때 보이는 제목·설명 (page.tsx 는 클라이언트라 여기서 지정)
export const metadata: Metadata = {
  title: "오이타 버스 탑승인원 체크",
  description: "호차별로 누가 탔는지 버스 담당자가 체크합니다.",
};

export default function OitaBusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
