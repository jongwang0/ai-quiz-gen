import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Quiz Generator",
  description: "텍스트 또는 이미지를 입력하면 AI가 객관식, 주관식, 서술형 문제를 자동 생성합니다.",
  openGraph: {
    title: "AI Quiz Generator",
    description: "텍스트 또는 이미지를 입력하면 AI가 CBT 문제를 자동 생성합니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans`}>
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
          {/* Background gradient orbs */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-zinc-700/20 rounded-full blur-[120px]" />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
