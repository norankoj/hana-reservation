import type { Metadata } from "next";
import { info } from "./info";

// 카톡 등으로 공유할 때 보이는 제목·설명 (page.tsx 는 클라이언트라 여기서 지정)
// 공유 이미지는 public/christmas/og.jpg (1200×630) 를 넣고 아래 images 를 열면 됩니다.
export const metadata: Metadata = {
  metadataBase: new URL("https://hana-reservation-63bn.vercel.app"),
  title: info.title,
  description: info.shareDescription,
  openGraph: {
    title: info.title,
    description: info.shareDescription,
    // images: [{ url: "/christmas/og.jpg", width: 1200, height: 630 }],
  },
};

export default function ChristmasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
