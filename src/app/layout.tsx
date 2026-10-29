import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const sans = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Buya – loyalty for local businesses",
  description: "Turn occasional customers into regulars with simple stamp cards.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0F8B6D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans`}>{children}</body>
    </html>
  );
}
