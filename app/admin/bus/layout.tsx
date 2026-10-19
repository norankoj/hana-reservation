import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "버스 신청 관리",
  robots: { index: false, follow: false },
};

export default function BusAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
