import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Crypto Agent",
  description: "Real-time AI-powered crypto analysis and trading signals",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-zinc-100">
        {children}
      </body>
    </html>
  );
}
