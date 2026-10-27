import type { Metadata } from "next";

// 카톡 등으로 공유할 때 보이는 제목·설명·이미지 (page.tsx 는 클라이언트라 여기서 지정)
const title = "오이타 집회 인천공항행 버스 신청";
const description = "11/19(목) 오전 8시 출발 · 11/23(월) 오후 5시 인천공항 출발 (예상). 11/8(주일)까지 신청";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: [{ url: "/japan/og.jpg", width: 1200, height: 630 }] },
};

export default function JapanBusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
