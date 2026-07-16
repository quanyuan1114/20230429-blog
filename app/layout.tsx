import type { Metadata } from "next";
import "./globals.css";

const title = "博士研究规划 · AI × 电池健康 × 能源系统";
const description =
  "控制科学与工程博士研究规划：以电池健康管理为应用锚点，以时序基础模型、物理约束学习和安全优化为方法主线。";

export const metadata: Metadata = {
  metadataBase: new URL("https://20230429.xyz"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://20230429.xyz",
    siteName: "Firefly Research",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "博士研究规划：AI × 电池健康 × 能源系统",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
