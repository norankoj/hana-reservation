import type { Metadata } from "next";

// 카톡 등으로 공유할 때 보이는 제목·설명·이미지 (page.tsx 는 클라이언트라 여기서 지정)
const title = "오이타 굿즈 단체주문";
const description = "2026 프로미스랜드 오이타 공식 굿즈 주문. 10월 21일 (수)까지";

export const metadata: Metadata = {
  metadataBase: new URL("https://hana-reservation-63bn.vercel.app"), // 이미지 주소를 전체 주소로 (카톡이 읽을 수 있게)
  title,
  description,
  openGraph: { title, description, images: [{ url: "/goods/og.jpg", width: 1200, height: 630 }] },
};

export default function GoodsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
