import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "女装 AI 穿搭助手",
  description:
    "身材录入 · 虚拟试穿示意 · 尺码规则 · 场景穿搭 · 衣橱筛选（Next.js 纯前端 Demo）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
