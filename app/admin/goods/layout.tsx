import type { Metadata } from "next";

// 카톡 등으로 공유할 때 보이는 제목. 관리자 화면이라 검색에는 안 나오게.
export const metadata: Metadata = {
  title: "굿즈 주문 관리",
  description: "오이타 굿즈 단체주문 관리자 화면",
  robots: { index: false, follow: false },
};

export default function GoodsAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
