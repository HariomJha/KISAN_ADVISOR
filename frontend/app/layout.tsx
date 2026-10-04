import type { Metadata, Viewport } from "next";
import { Hind } from "next/font/google";
import "./globals.css";

const hind = Hind({ subsets: ["latin", "devanagari"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Kisan Advisor",
  description: "Crop recommendations for Indian farmers",
  manifest: "/manifest.json",
};
export const viewport: Viewport = { themeColor: "#1F5E3B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className={hind.className}>{children}</body>
    </html>
  );
}
