import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = process.env.SITE_NAME ?? "Đỗ Phúc Tộc";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Gia Phả & Từ Đường`,
  description: "Hệ thống số hoá gia phả, lễ nghi, di sản và mồ mả của dòng tộc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
