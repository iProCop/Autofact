import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "АвтоФакт — отчёты автоэкспертов",
  description: "Зрение эксперта в вашем смартфоне",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${unbounded.variable} antialiased`}
        style={
          {
            "--font-body": "var(--font-manrope), system-ui, sans-serif",
            "--font-display": "var(--font-unbounded), system-ui, sans-serif",
          } as React.CSSProperties
        }
      >
        <AppShell>{children}</AppShell>
        <BottomNav />
      </body>
    </html>
  );
}
