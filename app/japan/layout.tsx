import type { Metadata } from "next";
import { info } from "./info";

// 카톡 등으로 공유할 때 보이는 제목·설명·이미지 (page.tsx 는 클라이언트라 여기서 지정)
// 공유 이미지는 1200×630 jpg. public/japan/og.jpg 를 같은 이름으로 바꾸면 됩니다.
export const metadata: Metadata = {
  metadataBase: new URL("https://hana-reservation-63bn.vercel.app"),
  title: info.title,
  description: info.shareDescription,
  openGraph: {
    title: info.title,
    description: info.shareDescription,
    images: [{ url: "/japan/og.jpg", width: 1200, height: 630 }],
  },
};

export default function JapanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
