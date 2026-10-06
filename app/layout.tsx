import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "예약하기",
  description: "원하시는 일정을 선택하여 예약해 주세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard: 페이지에 실제로 쓰인 글자만 내려받는 버전 (모바일에서 가벼움) */}
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
