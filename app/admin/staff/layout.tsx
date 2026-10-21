import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STAFF 신청 관리",
  robots: { index: false, follow: false },
};

export default function StaffAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
