import type { Metadata } from "next";

// 카톡 등으로 공유할 때 보이는 제목·설명·이미지 (page.tsx 는 클라이언트라 여기서 지정)
const title = "오이타 현장 STAFF 신청";
const description = "내부 · 로비 · 외부 · 하스피, 4가지 역할로 함께 섬겨주세요!";

export const metadata: Metadata = {
  metadataBase: new URL("https://hana-reservation-63bn.vercel.app"),
  title,
  description,
  openGraph: { title, description, images: [{ url: "/staff/og.jpg", width: 600, height: 900 }] },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return children;
}
