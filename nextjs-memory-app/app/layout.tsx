import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "소리장면 일본어",
  description: "경선식 스타일 일본어 단어 암기 서비스"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
