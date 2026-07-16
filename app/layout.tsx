import type { Metadata } from "next";
import "./globals.css";

const title = "Firefly · 个人学术工作台";
const description =
  "人工智能方向博士研究生的个人学术工作台，记录研究规划、学习笔记、学习心得与文献阅读。";

export const metadata: Metadata = {
  metadataBase: new URL("https://20230429.xyz"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://20230429.xyz",
    siteName: "Firefly Academic Workspace",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Firefly 个人学术工作台：研究规划、学习笔记与文献阅读",
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
