import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "크리스마스 마켓 스텝 관리",
  robots: { index: false, follow: false },
};

export default function ChristmasAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
