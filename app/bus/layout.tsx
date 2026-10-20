import type { Metadata } from "next";

// 카톡 등으로 공유할 때 보이는 제목·설명·이미지 (page.tsx 는 클라이언트라 여기서 지정)
// 공유 이미지는 jpg (카톡이 webp 미리보기를 못 띄울 수 있음)
const title = "석의찬 ♥ 이수현 결혼식 버스 신청";
const description = "11월 7일 (토) 오후 2시 · 서울대 이라운지. 11월 1일 (주일)까지 신청";

export const metadata: Metadata = {
  metadataBase: new URL("https://hana-reservation-63bn.vercel.app"),
  title,
  description,
  openGraph: { title, description, images: [{ url: "/bus/og.jpg", width: 619, height: 966 }] },
};

export default function BusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
