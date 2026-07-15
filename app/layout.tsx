import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://20230429.xyz"),
  title: "Firefly · 记录思考，也记录生活",
  description: "quanyuan1114 的个人博客，记录技术、阅读与日常里的微小发现。",
  openGraph: {
    title: "Firefly · 记录思考，也记录生活",
    description: "记录技术、阅读与日常里的微小发现。",
    url: "https://20230429.xyz",
    siteName: "Firefly",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Firefly · 记录思考，也记录生活",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Firefly · 记录思考，也记录生活",
    description: "记录技术、阅读与日常里的微小发现。",
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
