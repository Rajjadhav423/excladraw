import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BoardFlow — Collaborative Whiteboard",
  description: "A collaborative whiteboard built with Atlassian design language",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }} className={inter.variable}>
      <body style={{ height: "100%", overflow: "hidden" }}>{children}</body>
    </html>
  );
}
