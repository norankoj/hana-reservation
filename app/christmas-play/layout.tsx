import type { Metadata } from "next";
import { costume } from "./info";

// 카톡 등으로 공유할 때 보이는 제목·설명 (page.tsx 는 클라이언트라 여기서 지정)
export const metadata: Metadata = {
  title: costume.title,
  description: costume.shareDescription,
  openGraph: { title: costume.title, description: costume.shareDescription },
};

export default function CostumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
