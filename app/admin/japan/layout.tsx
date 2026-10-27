import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오이타 버스·팀 담당자 관리",
  robots: { index: false, follow: false },
};

export default function JapanAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
