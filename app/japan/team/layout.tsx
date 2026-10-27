import type { Metadata } from "next";

// 카톡 등으로 공유할 때 보이는 제목·설명·이미지 (page.tsx 는 클라이언트라 여기서 지정)
const title = "오이타 집회 팀 담당자 제출";
const description = "개별 항공으로 가시는 분: 팀 담당자와 함께 가는 분, 혼자 가시는 분도 11/8(주일)까지 제출해 주세요";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: [{ url: "/japan/og.jpg", width: 1200, height: 630 }] },
};

export default function JapanTeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
