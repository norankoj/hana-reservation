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
        {/* 포스터 글꼴(Black Han Sans), 명조(Noto Serif KR). next/font 로 빌드 때 받으면 한글 글꼴에서 가끔 빌드가 실패해서 스타일시트로 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 앱 라우터의 루트 레이아웃이라 모든 페이지에 적용됨 (pages 라우터용 경고라 끔) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Serif+KR:wght@400;600&display=swap" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
