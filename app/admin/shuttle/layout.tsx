import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "셔틀 탑승 명단 관리",
  robots: { index: false, follow: false },
};

export default function ShuttleAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
